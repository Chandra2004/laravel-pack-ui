import { ref, unref, onUnmounted, getCurrentInstance } from 'vue';

/**
 * Enterprise Composable to copy and read text from the system clipboard.
 *
 * Dilengkapi status reaktif 'copied', timer reset otomatis, pembacaan clipboard (read),
 * serta fallback kompatibilitas penuh untuk browser lawas dan lingkungan non-HTTPS.
 *
 * @param {Object} [options={}] - Opsi konfigurasi
 * @param {number} [options.timeout=2000] - Durasi status copied aktif sebelum kembali ke false (ms)
 * @param {import('vue').Ref<string> | string} [options.source=''] - Teks default yang akan disalin jika argumen copy() kosong
 * @param {boolean} [options.legacy=true] - Aktifkan fallback execCommand untuk peramban lawas/non-HTTPS
 */
export function useClipboard(options = {}) {
    const {
        timeout = 2000,
        source = '',
        legacy = true,
    } = options;

    const copied = ref(false);
    const text = ref(typeof source === 'string' ? source : unref(source) || '');
    const error = ref(null);
    let timer = null;

    const isSupported = typeof navigator !== 'undefined' && 'clipboard' in navigator;

    /**
     * Fallback penyalinan teks untuk lingkungan non-HTTPS atau browser lawas
     * @param {string} textToCopy
     * @returns {boolean}
     */
    const legacyCopy = (textToCopy) => {
        if (!legacy || typeof document === 'undefined') return false;

        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.left = '-9999px';
        textarea.style.opacity = '0';
        textarea.setAttribute('readonly', '');
        document.body.appendChild(textarea);

        // Pertahankan seleksi sebelumnya jika ada
        const selected =
            document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false;

        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);

        let success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) {
            error.value = err;
            success = false;
        } finally {
            document.body.removeChild(textarea);
            if (selected) {
                document.getSelection().removeAllRanges();
                document.getSelection().addRange(selected);
            }
        }

        return success;
    };

    /**
     * Reset status copied secara manual ke false dan bersihkan timer.
     */
    const reset = () => {
        copied.value = false;
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    };

    /**
     * Menyalin teks ke clipboard perangkat.
     * @param {string} [textToCopy] - Teks yang akan disalin (jika kosong, menggunakan opsi source)
     * @returns {Promise<boolean>}
     */
    const copy = async (textToCopy) => {
        error.value = null;

        const rawValue =
            textToCopy !== undefined && textToCopy !== null
                ? textToCopy
                : unref(source);

        const str = String(rawValue !== undefined && rawValue !== null ? rawValue : '');
        let success = false;

        if (isSupported && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(str);
                success = true;
            } catch (err) {
                // Fallback jika API clipboard melempar error izin
                success = legacyCopy(str);
                if (!success) {
                    error.value = err;
                }
            }
        } else {
            success = legacyCopy(str);
        }

        if (success) {
            text.value = str;
            copied.value = true;

            reset();
            timer = setTimeout(() => {
                copied.value = false;
                timer = null;
            }, timeout);
        }

        return success;
    };

    /**
     * Membaca teks terkini dari clipboard sistem operasi (membutuhkan izin browser).
     * @returns {Promise<string>}
     */
    const read = async () => {
        error.value = null;
        if (!isSupported || !window.isSecureContext) {
            const err = new Error('Clipboard Read API tidak didukung pada konteks peramban ini.');
            error.value = err;
            return '';
        }

        try {
            const content = await navigator.clipboard.readText();
            text.value = content;
            return content;
        } catch (err) {
            error.value = err;
            return '';
        }
    };

    // Bersihkan timer saat komponen di-unmount agar tidak terjadi kebocoran memori
    if (getCurrentInstance()) {
        onUnmounted(() => {
            reset();
        });
    }

    return {
        // State
        copied,
        text,
        error,
        isSupported,

        // Actions
        copy,
        read,
        reset,
    };
}
