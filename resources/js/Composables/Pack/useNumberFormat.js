import { computed, unref } from 'vue';

/**
 * Format angka menjadi mata uang Rupiah (IDR)
 * @param {number|string} amount - Nominal angka
 * @param {boolean} [withPrefix=true] - Sertakan awalan "Rp "
 * @param {number} [decimalPlaces=0] - Jumlah digit desimal di belakang koma
 * @returns {string} Contoh: "Rp 1.500.000" atau "1.500.000"
 */
export const formatRupiah = (amount, withPrefix = true, decimalPlaces = 0) => {
    if (amount === null || amount === undefined || amount === '') return withPrefix ? 'Rp 0' : '0';

    const num = Number(amount);
    if (isNaN(num)) return withPrefix ? 'Rp 0' : '0';

    const fixed = num.toFixed(decimalPlaces);
    const [integerPart, decimalPart] = fixed.split('.');

    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    let result = formattedInteger;
    if (decimalPlaces > 0 && decimalPart) {
        result += `,${decimalPart}`;
    }

    return withPrefix ? `Rp ${result}` : result;
};

/**
 * Format angka umum dengan pemisah ribuan titik khas Indonesia
 * @param {number|string} value - Angka target
 * @param {number} [decimalPlaces=0] - Jumlah desimal
 * @returns {string} Contoh: "1.250.000"
 */
export const formatNumber = (value, decimalPlaces = 0) => {
    if (value === null || value === undefined || value === '') return '0';

    const num = Number(value);
    if (isNaN(num)) return '0';

    const fixed = num.toFixed(decimalPlaces);
    const [integerPart, decimalPart] = fixed.split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return decimalPlaces > 0 && decimalPart ? `${formattedInteger},${decimalPart}` : formattedInteger;
};

/**
 * Format persentase
 * @param {number|string} value - Nilai persentase
 * @param {number} [decimals=2]
 * @param {boolean} [isFraction=false] - True jika nilai berupa fraksi desimal (0.125 -> 12.5%)
 * @returns {string} Contoh: "12.50%"
 */
export const formatPercent = (value, decimals = 2, isFraction = false) => {
    const num = Number(value);
    if (isNaN(num)) return '0%';

    const val = isFraction ? num * 100 : num;
    return `${val.toFixed(decimals)}%`;
};

/**
 * Format angka ringkas gaya analytics / media sosial (K, M, B atau rb, jt, M)
 * @param {number|string} number - Nilai angka
 * @param {Object} [options={}]
 * @param {number} [options.decimals=1] - Digit desimal
 * @param {'id'|'en'} [options.locale='id'] - Pilihan bahasa singkatan
 * @returns {string} Contoh: "2,5 jt", "1,2 Miliar", "2.5M", "15K"
 */
export const formatCompactNumber = (number, options = {}) => {
    const num = Number(number);
    if (isNaN(num) || num === 0) return '0';

    const decimals = options.decimals !== undefined ? options.decimals : 1;
    const locale = options.locale || 'id';

    const abs = Math.abs(num);
    const sign = num < 0 ? '-' : '';

    if (locale === 'id') {
        if (abs >= 1e12) {
            const val = (abs / 1e12).toFixed(decimals).replace('.', ',');
            return `${sign}${val} T`;
        }
        if (abs >= 1e9) {
            const val = (abs / 1e9).toFixed(decimals).replace('.', ',');
            return `${sign}${val} Miliar`;
        }
        if (abs >= 1e6) {
            const val = (abs / 1e6).toFixed(decimals).replace('.', ',');
            return `${sign}${val} jt`;
        }
        if (abs >= 1e3) {
            const val = (abs / 1e3).toFixed(decimals).replace('.', ',');
            return `${sign}${val} rb`;
        }
        return `${sign}${abs}`;
    }

    if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(decimals)}T`;
    if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(decimals)}B`;
    if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(decimals)}M`;
    if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(decimals)}K`;
    return `${sign}${abs}`;
};

/**
 * Format angka ordinal (ke-1, ke-2, 1st, 2nd)
 * @param {number} number - Nilai angka
 * @param {'id'|'en'} [locale='id'] - Bahasa
 * @returns {string} Contoh: "ke-1", "3rd"
 */
export const formatOrdinal = (number, locale = 'id') => {
    const n = Math.floor(Number(number) || 0);
    if (locale === 'id') return `ke-${n}`;

    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

/**
 * Format ukuran file byte menjadi string yang mudah dibaca
 * @param {number} bytes - Jumlah byte
 * @param {number} [decimals=2] - Digit desimal
 * @returns {string} Contoh: "14.25 MB"
 */
export const formatBytes = (bytes, decimals = 2) => {
    const b = Number(bytes);
    if (isNaN(b) || b <= 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

    const i = Math.floor(Math.log(b) / Math.log(k));
    const formatted = parseFloat((b / Math.pow(k, i)).toFixed(dm));

    return `${formatted} ${sizes[i]}`;
};

/**
 * Composable useNumberFormat
 * @param {import('vue').Ref<any>|any} numberInput
 * @param {Object} [options={}]
 * @returns {{
 *   rupiah: import('vue').ComputedRef<string>,
 *   number: import('vue').ComputedRef<string>,
 *   compact: import('vue').ComputedRef<string>,
 *   percent: import('vue').ComputedRef<string>,
 *   bytes: import('vue').ComputedRef<string>,
 * }}
 */
export function useNumberFormat(numberInput, options = {}) {
    const val = computed(() => unref(numberInput));

    const rupiah = computed(() => formatRupiah(val.value, options.withPrefix !== false, options.decimals || 0));
    const number = computed(() => formatNumber(val.value, options.decimals || 0));
    const compact = computed(() => formatCompactNumber(val.value, options));
    const percent = computed(() => formatPercent(val.value, options.decimals || 2, options.isFraction));
    const bytes = computed(() => formatBytes(val.value, options.decimals || 2));

    return {
        rupiah,
        number,
        compact,
        percent,
        bytes,
        formatRupiah,
        formatNumber,
        formatPercent,
        formatCompactNumber,
        formatOrdinal,
        formatBytes,
    };
}

