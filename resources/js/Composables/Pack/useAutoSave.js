import { ref, computed, watch, onMounted, onUnmounted, unref } from 'vue';
import { formatRelativeTime, formatDate } from './useDateFormat';

/**
 * Enterprise Auto-Save & Form Draft Recovery Composable
 *
 * @param {import('vue').Ref|Object} formTarget - Reactive form object or ref
 * @param {Object} options - Configuration options
 * @param {string} options.key - Unique storage key (e.g. 'post_create', 'blog_edit_42')
 * @param {number} [options.debounceMs=1500] - Debounce delay after user stops typing
 * @param {number} [options.intervalMs=0] - Optional periodic auto-save interval (0 = disabled)
 * @param {'local'|'remote'|'both'} [options.storage='local'] - Target storage destination
 * @param {string} [options.endpoint] - API URL for remote draft saving
 * @param {Function} [options.saveHandler] - Custom async save callback `async (data) => ...`
 * @param {number} [options.expiryDays=7] - Days before an untouched draft expires
 * @param {boolean} [options.autoRestore=false] - Auto-restore draft on mount without prompt
 * @param {Function} [options.onSaved] - Callback invoked when save succeeds `(data, timestamp)`
 * @param {Function} [options.onError] - Callback invoked when save fails `(error)`
 */
export function useAutoSave(formTarget, options = {}) {
    const {
        key,
        debounceMs = 1500,
        intervalMs = 0,
        storage = 'local',
        endpoint = '',
        saveHandler = null,
        expiryDays = 7,
        autoRestore = false,
        onSaved = null,
        onError = null,
    } = options;

    if (!key) {
        console.warn('[useAutoSave] Warning: "key" is required for draft persistence.');
    }

    const storageKey = key ? `pack_draft_${key}` : null;

    // Status state: 'idle' | 'saving' | 'saved' | 'error' | 'paused'
    const status = ref('idle');
    const lastSaved = ref(null);
    const lastError = ref(null);
    const hasDraft = ref(false);
    const draftData = ref(null);
    const draftSavedAt = ref(null);
    const isPaused = ref(false);

    let debounceTimer = null;
    let intervalTimer = null;
    let lastSavedSnapshot = '';

    /**
     * Safely serialize form data to JSON string for dirty checking.
     */
    const serializeForm = (target) => {
        try {
            const raw = unref(target);
            // Handle Inertia useForm data() method if present
            const dataToSerialize = typeof raw?.data === 'function' ? raw.data() : raw;
            return JSON.stringify(dataToSerialize || {});
        } catch (e) {
            return '';
        }
    };

    /**
     * Compute if current form is dirty compared to last saved state.
     */
    const isDirty = computed(() => {
        return serializeForm(formTarget) !== lastSavedSnapshot;
    });

    /** Formatted relative time of last save (e.g. "baru saja", "2 menit yang lalu") */
    const lastSavedFormatted = computed(() => {
        if (!lastSaved.value) return '';
        return formatRelativeTime(lastSaved.value);
    });

    /** Formatted time of stored draft */
    const draftTimeFormatted = computed(() => {
        if (!draftSavedAt.value) return '';
        return `${formatRelativeTime(draftSavedAt.value)} (${formatDate(draftSavedAt.value, 'DD/MM HH:mm')})`;
    });

    /**
     * Check and restore draft from localStorage on initial load.
     */
    const checkExistingDraft = () => {
        if (!storageKey || typeof window === 'undefined') return;

        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return;

            const parsed = JSON.parse(raw);
            if (!parsed || !parsed.data) return;

            // Check expiration
            if (parsed.savedAt && expiryDays > 0) {
                const ageMs = Date.now() - parsed.savedAt;
                const maxAgeMs = expiryDays * 24 * 60 * 60 * 1000;
                if (ageMs > maxAgeMs) {
                    localStorage.removeItem(storageKey);
                    return;
                }
            }

            // Compare with current initial form data
            const currentSerialized = serializeForm(formTarget);
            const draftSerialized = JSON.stringify(parsed.data);

            if (draftSerialized !== currentSerialized) {
                hasDraft.value = true;
                draftData.value = parsed.data;
                draftSavedAt.value = parsed.savedAt ? new Date(parsed.savedAt) : new Date();

                if (autoRestore) {
                    restoreDraft();
                }
            }
        } catch (e) {
            console.warn('[useAutoSave] Failed to check draft:', e);
        }
    };

    /**
     * Core save execution function.
     */
    const executeSave = async () => {
        if (isPaused.value) return;

        const currentSnapshot = serializeForm(formTarget);
        // Do not save if data hasn't changed since last save
        if (currentSnapshot === lastSavedSnapshot) {
            return;
        }

        status.value = 'saving';
        lastError.value = null;

        const raw = unref(formTarget);
        const payload = typeof raw?.data === 'function' ? raw.data() : JSON.parse(currentSnapshot);
        const timestamp = new Date();

        try {
            // 1. Local Storage save
            if (storage === 'local' || storage === 'both') {
                if (storageKey && typeof window !== 'undefined') {
                    localStorage.setItem(
                        storageKey,
                        JSON.stringify({
                            data: payload,
                            savedAt: timestamp.getTime(),
                        })
                    );
                }
            }

            // 2. Remote Save (Custom Handler or Endpoint)
            if (storage === 'remote' || storage === 'both') {
                if (typeof saveHandler === 'function') {
                    await saveHandler(payload);
                } else if (endpoint) {
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        body: JSON.stringify(payload),
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
                    }
                }
            }

            lastSavedSnapshot = currentSnapshot;
            lastSaved.value = timestamp;
            status.value = 'saved';

            if (typeof onSaved === 'function') {
                onSaved(payload, timestamp);
            }
        } catch (err) {
            console.error('[useAutoSave] Error saving draft:', err);
            status.value = 'error';
            lastError.value = err?.message || 'Gagal menyimpan draft.';

            if (typeof onError === 'function') {
                onError(err);
            }
        }
    };

    /**
     * Trigger immediate save without waiting for debounce timer.
     */
    const saveNow = async () => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
        await executeSave();
    };

    /**
     * Restore saved draft into the reactive form.
     */
    const restoreDraft = () => {
        if (!draftData.value) return false;

        const raw = unref(formTarget);
        if (!raw) return false;

        try {
            const draft = draftData.value;

            // If it's an Inertia form or object, merge fields
            Object.keys(draft).forEach((prop) => {
                if (raw[prop] !== undefined) {
                    raw[prop] = draft[prop];
                }
            });

            lastSavedSnapshot = serializeForm(formTarget);
            hasDraft.value = false;
            status.value = 'saved';
            lastSaved.value = draftSavedAt.value || new Date();
            return true;
        } catch (e) {
            console.error('[useAutoSave] Failed to restore draft:', e);
            return false;
        }
    };

    /**
     * Discard and purge the saved draft from storage.
     */
    const discardDraft = () => {
        hasDraft.value = false;
        draftData.value = null;
        draftSavedAt.value = null;

        if (storageKey && typeof window !== 'undefined') {
            localStorage.removeItem(storageKey);
        }
    };

    /**
     * Completely clear draft from storage (call after form submission success).
     */
    const purge = () => {
        discardDraft();
        lastSavedSnapshot = serializeForm(formTarget);
        status.value = 'idle';
        lastSaved.value = null;
    };

    /**
     * Pause auto-saving (e.g. during form reset).
     */
    const pause = () => {
        isPaused.value = true;
        status.value = 'paused';
        if (debounceTimer) clearTimeout(debounceTimer);
    };

    /**
     * Resume auto-saving.
     */
    const resume = () => {
        isPaused.value = false;
        status.value = 'idle';
    };

    // -------------------------------------------------------------
    // WATCHERS & LIFECYCLE
    // -------------------------------------------------------------
    const startWatching = () => {
        // Record initial snapshot
        lastSavedSnapshot = serializeForm(formTarget);

        // Check draft
        checkExistingDraft();

        // Watch form changes with debounce
        watch(
            () => serializeForm(formTarget),
            (newVal, oldVal) => {
                if (isPaused.value) return;
                if (newVal === oldVal || newVal === lastSavedSnapshot) return;

                status.value = 'saving';

                if (debounceTimer) {
                    clearTimeout(debounceTimer);
                }

                debounceTimer = setTimeout(() => {
                    executeSave();
                }, debounceMs);
            },
            { deep: true }
        );

        // Optional periodic interval auto-save
        if (intervalMs > 0) {
            intervalTimer = setInterval(() => {
                if (isDirty.value && !isPaused.value) {
                    executeSave();
                }
            }, intervalMs);
        }
    };

    onMounted(() => {
        startWatching();
    });

    onUnmounted(() => {
        if (debounceTimer) clearTimeout(debounceTimer);
        if (intervalTimer) clearInterval(intervalTimer);
    });

    return {
        // State
        status,
        lastSaved,
        lastError,
        hasDraft,
        draftData,
        draftSavedAt,
        isPaused,

        // Computed
        isDirty,
        lastSavedFormatted,
        draftTimeFormatted,

        // Actions
        saveNow,
        restoreDraft,
        discardDraft,
        purge,
        pause,
        resume,
    };
}
