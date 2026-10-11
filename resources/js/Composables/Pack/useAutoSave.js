import { ref, computed, watch, onMounted, onUnmounted, unref, getCurrentInstance } from 'vue';
import { formatRelativeTime, formatDate } from './useDateFormat.js';

/**
 * Enterprise Auto-Save & Form Draft Recovery Composable
 *
 * Mengelola penyimpanan otomatis formulir (auto-save) ke localStorage maupun endpoint remote API
 * dengan dukungan debounce, dirty tracking, interval berkala, race condition guard, dan auto-cleanup.
 *
 * @param {import('vue').Ref|Object} formTarget - Objek formulir reaktif atau ref
 * @param {Object} options - Opsi konfigurasi
 * @param {string} options.key - Kunci unik identifikasi draf (wajib untuk persistensi)
 * @param {number} [options.debounceMs=1500] - Jeda debounce setelah pengetikan berhenti (ms)
 * @param {number} [options.intervalMs=0] - Interval periodik penyimpanan berkala (0 = nonaktif)
 * @param {'local'|'remote'|'both'} [options.storage='local'] - Target tujuan penyimpanan
 * @param {string} [options.endpoint=''] - URL endpoint API untuk penyimpanan remote
 * @param {Function} [options.saveHandler=null] - Callback async kustom `async (data) => ...`
 * @param {number} [options.expiryDays=7] - Masa kedaluwarsa draf dalam hari (0 = permanen)
 * @param {boolean} [options.autoRestore=false] - Pulihkan draf otomatis saat mount tanpa konfirmasi
 * @param {Function} [options.onSaved=null] - Callback sukses simpan `(payload, timestamp)`
 * @param {Function} [options.onError=null] - Callback kegagalan simpan `(error)`
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
        console.warn('[useAutoSave] Warning: Parameter "key" diperlukan untuk persistensi draf.');
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
    let abortController = null;
    let stopWatcher = null;

    /**
     * Serialisasi data formulir ke JSON string untuk dirty checking dan perbandingan.
     * Mendukung Inertia useForm (data() method) maupun objek Vue reaktif biasa.
     */
    const serializeForm = (target) => {
        try {
            const raw = unref(target);
            if (!raw) return '';
            const dataToSerialize = typeof raw?.data === 'function' ? raw.data() : raw;
            return JSON.stringify(dataToSerialize || {});
        } catch {
            return '';
        }
    };

    /**
     * Status kotor: true jika nilai formulir saat ini berbeda dari snapshot penyimpanan terakhir.
     */
    const isDirty = computed(() => {
        return serializeForm(formTarget) !== lastSavedSnapshot;
    });

    /**
     * Teks waktu relatif dari penyimpanan terakhir (contoh: "baru saja", "2 menit yang lalu").
     */
    const lastSavedFormatted = computed(() => {
        if (!lastSaved.value) return '';
        return formatRelativeTime(lastSaved.value);
    });

    /**
     * Teks waktu tersimpannya draf yang ditemukan di penyimpanan lokal.
     */
    const draftTimeFormatted = computed(() => {
        if (!draftSavedAt.value) return '';
        return `${formatRelativeTime(draftSavedAt.value)} (${formatDate(draftSavedAt.value, 'DD/MM HH:mm')})`;
    });

    /**
     * Memeriksa keberadaan draf di localStorage dan memvalidasi masa kedaluwarsa.
     */
    const checkExistingDraft = () => {
        if (!storageKey || typeof window === 'undefined') return;

        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return;

            const parsed = JSON.parse(raw);
            if (!parsed || !parsed.data) return;

            // Validasi masa kedaluwarsa draf
            if (parsed.savedAt && expiryDays > 0) {
                const ageMs = Date.now() - parsed.savedAt;
                const maxAgeMs = expiryDays * 24 * 60 * 60 * 1000;
                if (ageMs > maxAgeMs) {
                    localStorage.removeItem(storageKey);
                    return;
                }
            }

            // Bandingkan dengan data inisial formulir saat ini
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
            console.warn('[useAutoSave] Gagal membaca draf dari penyimpanan lokal:', e);
        }
    };

    /**
     * Eksekusi penyimpanan inti (Local, Remote, atau keduanya).
     */
    const executeSave = async () => {
        if (isPaused.value) return;

        const currentSnapshot = serializeForm(formTarget);
        // Cegah penyimpanan redundan jika data belum berubah sejak save terakhir
        if (currentSnapshot === lastSavedSnapshot) {
            if (status.value === 'saving') {
                status.value = 'saved';
            }
            return;
        }

        status.value = 'saving';
        lastError.value = null;

        const raw = unref(formTarget);
        const payload = typeof raw?.data === 'function' ? raw.data() : JSON.parse(currentSnapshot);
        const timestamp = new Date();

        try {
            // 1. Simpan ke LocalStorage
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

            // 2. Simpan ke Remote API (Custom Handler atau HTTP Endpoint)
            if (storage === 'remote' || storage === 'both') {
                if (typeof saveHandler === 'function') {
                    await saveHandler(payload);
                } else if (endpoint) {
                    // Batalkan request remote sebelumnya jika masih berjalan (mencegah race condition)
                    if (abortController) {
                        abortController.abort();
                    }
                    abortController = new AbortController();

                    const response = await fetch(endpoint, {
                        method: 'POST',
                        signal: abortController.signal,
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        body: JSON.stringify(payload),
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
            // Abaikan error pembatalan fetch jika request lama dibatalkan oleh save baru
            if (err.name === 'AbortError') {
                return;
            }

            console.error('[useAutoSave] Gagal menyimpan draf:', err);
            status.value = 'error';
            lastError.value = err?.message || 'Gagal menyimpan draf.';

            if (typeof onError === 'function') {
                onError(err);
            }
        }
    };

    /**
     * Memicu penyimpanan seketika tanpa menunggu jeda debounce timer.
     */
    const saveNow = async () => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
        await executeSave();
    };

    /**
     * Memulihkan data draf yang tersimpan ke dalam objek formulir reaktif.
     * @returns {boolean} True jika pemulihan berhasil
     */
    const restoreDraft = () => {
        if (!draftData.value) return false;

        const raw = unref(formTarget);
        if (!raw) return false;

        try {
            const draft = draftData.value;

            // Injeksi nilai draf ke form target (mendukung objek reaktif dan Inertia useForm)
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
            console.error('[useAutoSave] Gagal memulihkan draf formulir:', e);
            return false;
        }
    };

    /**
     * Membuang draf yang tersimpan dari memory dan storage lokal.
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
     * Membersihkan draf sepenuhnya (dipanggil setelah submit form berhasil ke server).
     */
    const purge = () => {
        discardDraft();
        lastSavedSnapshot = serializeForm(formTarget);
        status.value = 'idle';
        lastSaved.value = null;
        lastError.value = null;
    };

    /**
     * Menjeda auto-save sementara (misalnya saat proses submit resmi atau form reset).
     */
    const pause = () => {
        isPaused.value = true;
        status.value = 'paused';
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
    };

    /**
     * Melanjutkan kembali auto-save setelah dijeda.
     */
    const resume = () => {
        isPaused.value = false;
        status.value = 'idle';
    };

    /**
     * Menghentikan semua timer dan watcher (digunakan untuk cleanup manual).
     */
    const cleanup = () => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
        if (intervalTimer) {
            clearInterval(intervalTimer);
            intervalTimer = null;
        }
        if (abortController) {
            abortController.abort();
            abortController = null;
        }
        if (typeof stopWatcher === 'function') {
            stopWatcher();
            stopWatcher = null;
        }
    };

    // -------------------------------------------------------------
    // WATCHERS & LIFECYCLE INITIALIZATION
    // -------------------------------------------------------------
    const startWatching = () => {
        // Ambil snapshot awal
        lastSavedSnapshot = serializeForm(formTarget);

        // Periksa draf yang telah tersimpan sebelumnya
        checkExistingDraft();

        // Pantau mutasi formulir dengan debounce
        stopWatcher = watch(
            () => {
                const raw = unref(formTarget);
                return typeof raw?.data === 'function' ? raw.data() : raw;
            },
            () => {
                if (isPaused.value) return;

                status.value = 'saving';

                if (debounceTimer) {
                    clearTimeout(debounceTimer);
                }

                debounceTimer = setTimeout(() => {
                    executeSave();
                }, unref(debounceMs));
            },
            { deep: true }
        );

        // Penjadwalan interval auto-save periodik opsional
        if (intervalMs > 0) {
            intervalTimer = setInterval(() => {
                if (isDirty.value && !isPaused.value) {
                    executeSave();
                }
            }, intervalMs);
        }
    };

    // Bind lifecycle secara aman: jika dipanggil dalam setup komponen, bind onMounted/onUnmounted.
    // Jika dipanggil di luar konteks komponen (store/worker/test), jalankan watcher langsung.
    if (getCurrentInstance()) {
        onMounted(() => {
            startWatching();
        });

        onUnmounted(() => {
            cleanup();
        });
    } else {
        startWatching();
    }

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
        save: saveNow,
        restoreDraft,
        discardDraft,
        purge,
        pause,
        resume,
        cleanup,
        destroy: cleanup,
    };
}
