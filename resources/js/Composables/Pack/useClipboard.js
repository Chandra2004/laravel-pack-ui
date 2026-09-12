import { ref } from 'vue';

/**
 * useClipboard
 * Composable untuk menyalin teks ke clipboard sistem operasi dengan status
 * reaktif 'copied' dan fallback kompatibilitas penuh untuk berbagai browser.
 *
 * @param {Object} options
 * @param {number} [options.timeout=2000] - Durasi status copied aktif sebelum kembali ke false (ms)
 */
export function useClipboard(options = {}) {
    const { timeout = 2000 } = options;

    const copied = ref(false);
    const text = ref('');
    const error = ref(null);
    let timer = null;

    const isSupported = typeof navigator !== 'undefined' && 'clipboard' in navigator;

    /**
     * Fallback penyalinan teks untuk lingkungan non-HTTPS atau browser lawas
     * @param {string} textToCopy
     * @returns {boolean}
     */
    const legacyCopy = (textToCopy) => {
        if (typeof document === 'undefined') return false;

        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.left = '-9999px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        let success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) {
            error.value = err;
            success = false;
        } finally {
            document.body.removeChild(textarea);
        }

        return success;
    };

    /**
     * Menyalin teks ke clipboard perangkat
     * @param {string} textToCopy
     * @returns {Promise<boolean>}
     */
    const copy = async (textToCopy) => {
        error.value = null;
        const str = String(textToCopy !== undefined && textToCopy !== null ? textToCopy : '');

        let success = false;

        if (isSupported && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(str);
                success = true;
            } catch (err) {
                // Jika izin ditolak, gunakan fallback legacy
                success = legacyCopy(str);
            }
        } else {
            success = legacyCopy(str);
        }

        if (success) {
            text.value = str;
            copied.value = true;

            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                copied.value = false;
            }, timeout);
        }

        return success;
    };

    return {
        copy,
        copied,
        text,
        error,
        isSupported,
    };
}
