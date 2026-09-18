import { computed, unref } from 'vue';

/**
 * Sensor / Masking data sensitif
 * @param {string} text - Teks asli
 * @param {'card'|'email'|'phone'|'nik'} [type='card'] - Jenis data sensitif
 * @returns {string} Contoh card: "**** **** **** 4821", email: "c****a@domain.com"
 */
export const maskSensitive = (text, type = 'card') => {
    if (!text) return '-';
    const str = String(text).trim();

    if (type === 'card') {
        const clean = str.replace(/\s+/g, '');
        if (clean.length < 4) return '****';
        const last4 = clean.slice(-4);
        return `**** **** **** ${last4}`;
    }

    if (type === 'email') {
        const parts = str.split('@');
        if (parts.length !== 2) return '****';
        const [user, domain] = parts;
        if (user.length <= 2) {
            return `${user[0] || ''}****@${domain}`;
        }
        const first = user[0];
        const last = user[user.length - 1];
        return `${first}****${last}@${domain}`;
    }

    if (type === 'phone') {
        const clean = str.replace(/\D/g, '');
        if (clean.length < 8) return '****';
        const start = clean.slice(0, 4);
        const end = clean.slice(-4);
        return `${start} **** ${end}`;
    }

    if (type === 'nik') {
        const clean = str.replace(/\D/g, '');
        if (clean.length < 8) return '****************';
        const start = clean.slice(0, 4);
        const end = clean.slice(-4);
        return `${start} ******** ${end}`;
    }

    return str;
};

/**
 * Format nomor telepon seluler Indonesia
 * @param {string|number} number - Nomor telepon
 * @param {'international'|'national'|'e164'} [formatType='international']
 * @returns {string} Contoh: "+62 812-3456-7890" atau "0812-3456-7890"
 */
export const formatPhone = (number, formatType = 'international') => {
    if (!number) return '-';

    let digits = String(number).replace(/\D/g, '');

    if (digits.startsWith('0')) {
        digits = '62' + digits.slice(1);
    } else if (!digits.startsWith('62') && digits.length >= 9) {
        digits = '62' + digits;
    }

    if (digits.length < 10) return number;

    const country = '+62';
    const nationalZero = '0';
    const prefix = digits.slice(2, 5);
    const mid = digits.slice(5, 9);
    const end = digits.slice(9);

    if (formatType === 'national') {
        return `${nationalZero}${prefix}-${mid}${end ? '-' + end : ''}`;
    }

    if (formatType === 'e164') {
        return `+${digits}`;
    }

    return `${country} ${prefix}-${mid}${end ? '-' + end : ''}`;
};

/**
 * Composable useMask
 * @param {import('vue').Ref<string>|string} textInput
 * @param {'card'|'email'|'phone'|'nik'} [defaultType='card']
 * @returns {{
 *   masked: import('vue').ComputedRef<string>,
 *   mask: (type: 'card'|'email'|'phone'|'nik') => string,
 * }}
 */
export function useMask(textInput, defaultType = 'card') {
    const textVal = computed(() => {
        const v = unref(textInput);
        return v !== null && v !== undefined ? String(v) : '';
    });

    const masked = computed(() => maskSensitive(textVal.value, defaultType));
    const mask = (type) => maskSensitive(textVal.value, type);

    return {
        masked,
        mask,
        maskSensitive,
        formatPhone,
    };
}

