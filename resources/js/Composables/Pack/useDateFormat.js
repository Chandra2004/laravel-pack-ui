import { computed, unref } from 'vue';

const MONTH_NAMES_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const MONTH_SHORT_ID = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

const DAY_NAMES_ID = [
    'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

const DAY_SHORT_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const padZero = (num, length = 2) => String(num).padStart(length, '0');

/**
 * Normalisasi input tanggal ke objek Date JavaScript
 * @param {string|number|Date} dateInput
 * @returns {Date|null}
 */
export const parseDate = (dateInput) => {
    if (!dateInput) return null;
    if (dateInput instanceof Date) {
        return isNaN(dateInput.getTime()) ? null : dateInput;
    }
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
};

/**
 * Format tanggal dan waktu berstandar lokal Indonesia
 * @param {string|number|Date} dateInput - Tanggal target
 * @param {string} [pattern='DD MMMM YYYY HH:mm'] - Format token
 * @returns {string} Contoh: "13 September 2026 14:30"
 */
export const formatDate = (dateInput, pattern = 'DD MMMM YYYY HH:mm') => {
    const d = parseDate(dateInput);
    if (!d) return '-';

    const YYYY = d.getFullYear();
    const YY = String(YYYY).slice(-2);
    const M = d.getMonth() + 1;
    const MM = padZero(M);
    const MMMM = MONTH_NAMES_ID[d.getMonth()];
    const MMM = MONTH_SHORT_ID[d.getMonth()];
    const D = d.getDate();
    const DD = padZero(D);
    const DDDD = DAY_NAMES_ID[d.getDay()];
    const DDD = DAY_SHORT_ID[d.getDay()];
    const H = d.getHours();
    const HH = padZero(H);
    const m = d.getMinutes();
    const mm = padZero(m);
    const s = d.getSeconds();
    const ss = padZero(s);

    return pattern
        .replace(/YYYY/g, YYYY)
        .replace(/YY/g, YY)
        .replace(/MMMM/g, MMMM)
        .replace(/MMM/g, MMM)
        .replace(/MM/g, MM)
        .replace(/\bM\b/g, M)
        .replace(/DDDD/g, DDDD)
        .replace(/DDD/g, DDD)
        .replace(/DD/g, DD)
        .replace(/\bD\b/g, D)
        .replace(/HH/g, HH)
        .replace(/\bH\b/g, H)
        .replace(/mm/g, mm)
        .replace(/\bm\b/g, m)
        .replace(/ss/g, ss)
        .replace(/\bs\b/g, s);
};

/**
 * Format waktu relatif dinamis
 * @param {string|number|Date} dateInput
 * @returns {string} Contoh: "5 menit yang lalu", "3 hari yang lalu", "baru saja"
 */
export const formatRelativeTime = (dateInput) => {
    const d = parseDate(dateInput);
    if (!d) return '-';

    const now = Date.now();
    const diff = now - d.getTime();
    const isFuture = diff < 0;
    const absDiff = Math.abs(diff);

    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 15) {
        return 'baru saja';
    }

    let unitText = '';
    if (seconds < 60) {
        unitText = `${seconds} detik`;
    } else if (minutes < 60) {
        unitText = `${minutes} menit`;
    } else if (hours < 24) {
        unitText = `${hours} jam`;
    } else if (days < 7) {
        unitText = `${days} hari`;
    } else if (weeks < 4) {
        unitText = `${weeks} minggu`;
    } else if (months < 12) {
        unitText = `${months} bulan`;
    } else {
        unitText = `${years} tahun`;
    }

    return isFuture ? `${unitText} lagi` : `${unitText} yang lalu`;
};

/**
 * Format durasi waktu (dalam detik)
 * @param {number} seconds - Durasi dalam detik
 * @param {Object} [options={}]
 * @param {'digital'|'human'|'short'} [options.format='digital']
 * @param {'id'|'en'} [options.locale='id']
 * @returns {string} Contoh: "01:02:05", "1 jam 2 menit", "1j 2m"
 */
export const formatDuration = (seconds, options = {}) => {
    const sec = Math.max(0, Math.floor(Number(seconds) || 0));
    const format = options.format || 'digital';
    const locale = options.locale || 'id';

    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const remainingSeconds = sec % 60;

    if (format === 'digital') {
        const hh = hours > 0 ? `${padZero(hours)}:` : '';
        return `${hh}${padZero(minutes)}:${padZero(remainingSeconds)}`;
    }

    if (format === 'short') {
        const parts = [];
        if (hours > 0) parts.push(`${hours}${locale === 'id' ? 'j' : 'h'}`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);
        return parts.join(' ');
    }

    // human
    const parts = [];
    if (locale === 'id') {
        if (hours > 0) parts.push(`${hours} jam`);
        if (minutes > 0) parts.push(`${minutes} menit`);
        if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds} detik`);
    } else {
        if (hours > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
        if (minutes > 0) parts.push(`${minutes} min${minutes > 1 ? 's' : ''}`);
        if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds} sec${remainingSeconds > 1 ? 's' : ''}`);
    }
    return parts.join(' ');
};

/**
 * Composable useDateFormat
 * @param {import('vue').Ref<any>|any} dateInput
 * @param {Object} [options={}]
 * @returns {{
 *   formatted: import('vue').ComputedRef<string>,
 *   relative: import('vue').ComputedRef<string>,
 *   format: (pattern: string) => string,
 * }}
 */
export function useDateFormat(dateInput, options = {}) {
    const dateVal = computed(() => unref(dateInput));
    const defaultPattern = options.pattern || 'DD MMMM YYYY HH:mm';

    const formatted = computed(() => formatDate(dateVal.value, defaultPattern));
    const relative = computed(() => formatRelativeTime(dateVal.value));

    const format = (pattern) => formatDate(dateVal.value, pattern);

    return {
        formatted,
        relative,
        format,
        formatDate,
        formatRelativeTime,
        formatDuration,
        parseDate,
    };
}

