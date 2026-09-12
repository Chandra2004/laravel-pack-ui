/**
 * useFormat
 * Composable dan utilitas formatting terstandarisasi untuk ekosistem aplikasi Indonesia
 * mencakup mata uang Rupiah, tanggal/waktu lokal, relative time, nomor telepon,
 * ukuran file (bytes), dan masking data sensitif.
 */

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const MONTH_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

const DAY_NAMES = [
    'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

const DAY_SHORT = [
    'Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'
];

/**
 * Parsing input tanggal menjadi objek Date valid
 * @param {Date|string|number} dateInput
 * @returns {Date|null}
 */
const parseDate = (dateInput) => {
    if (!dateInput) return null;
    if (dateInput instanceof Date) {
        return isNaN(dateInput.getTime()) ? null : dateInput;
    }
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
};

/**
 * Format mata uang Rupiah (IDR)
 * @param {number|string} amount - Nilai angka
 * @param {boolean} [withPrefix=true] - Sertakan awalan 'Rp '
 * @param {number} [decimalPlaces=0] - Jumlah digit desimal di belakang koma
 * @returns {string} Contoh: "Rp 2.450.000" atau "2.450.000"
 */
export const formatRupiah = (amount, withPrefix = true, decimalPlaces = 0) => {
    if (amount === null || amount === undefined || amount === '') return withPrefix ? 'Rp 0' : '0';

    const num = Number(amount);
    if (isNaN(num)) return withPrefix ? 'Rp 0' : '0';

    const formatted = new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
    }).format(num);

    return withPrefix ? `Rp ${formatted}` : formatted;
};

/**
 * Format angka umum dengan separator ribuan titik khas Indonesia
 * @param {number|string} value
 * @param {number} [decimalPlaces=0]
 * @returns {string} Contoh: "1.250.000"
 */
export const formatNumber = (value, decimalPlaces = 0) => {
    if (value === null || value === undefined || value === '') return '0';
    const num = Number(value);
    if (isNaN(num)) return '0';

    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
    }).format(num);
};

/**
 * Format tanggal ke bahasa Indonesia
 * Mendukung token: YYYY, YY, MMMM, MMM, MM, M, DDDD, DDD, DD, D, HH, mm, ss
 * @param {Date|string|number} dateInput - Objek Date atau ISO string
 * @param {string} [pattern='DD MMMM YYYY HH:mm'] - Pola format
 * @returns {string} Contoh: "13 September 2026 14:30"
 */
export const formatDate = (dateInput, pattern = 'DD MMMM YYYY HH:mm') => {
    const d = parseDate(dateInput);
    if (!d) return '-';

    const year = d.getFullYear();
    const month = d.getMonth();
    const date = d.getDate();
    const day = d.getDay();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();

    const pad = (n) => String(n).padStart(2, '0');

    const tokens = {
        YYYY: String(year),
        YY: String(year).slice(-2),
        MMMM: MONTH_NAMES[month],
        MMM: MONTH_SHORT[month],
        MM: pad(month + 1),
        M: String(month + 1),
        DDDD: DAY_NAMES[day],
        DDD: DAY_SHORT[day],
        DD: pad(date),
        D: String(date),
        HH: pad(hours),
        H: String(hours),
        mm: pad(minutes),
        m: String(minutes),
        ss: pad(seconds),
        s: String(seconds),
    };

    // Regex penggantian token
    return pattern.replace(/\b(YYYY|YY|MMMM|MMM|MM|M|DDDD|DDD|DD|D|HH|H|mm|m|ss|s)\b/g, (match) => {
        return tokens[match] !== undefined ? tokens[match] : match;
    });
};

/**
 * Format waktu relatif manusiawi (e.g., '5 menit yang lalu', 'baru saja')
 * @param {Date|string|number} dateInput
 * @returns {string}
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
 * Format nomor telepon seluler Indonesia
 * @param {string|number} number - Nomor telepon
 * @param {'international'|'national'|'e164'} [formatType='international']
 * @returns {string} Contoh: "+62 812-3456-7890" atau "0812-3456-7890"
 */
export const formatPhone = (number, formatType = 'international') => {
    if (!number) return '-';

    // Ambil hanya digit
    let digits = String(number).replace(/\D/g, '');

    // Normalisasi awalan '0' atau '62'
    if (digits.startsWith('0')) {
        digits = '62' + digits.slice(1);
    } else if (!digits.startsWith('62') && digits.length >= 9) {
        digits = '62' + digits;
    }

    if (digits.length < 10) return number;

    const country = '+62';
    const nationalZero = '0';
    const prefix = digits.slice(2, 5); // misal 812
    const mid = digits.slice(5, 9); // misal 3456
    const end = digits.slice(9); // misal 7890

    if (formatType === 'national') {
        return `${nationalZero}${prefix}-${mid}${end ? '-' + end : ''}`;
    }

    if (formatType === 'e164') {
        return `+${digits}`;
    }

    // Default: 'international'
    return `${country} ${prefix}-${mid}${end ? '-' + end : ''}`;
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
 * Format persentase
 * @param {number|string} value - Nilai persentase (misal 12.5 atau 0.125)
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
 * useFormat Composable Hook
 * Menyediakan akses mudah ke seluruh fungsi formatting di dalam template komponen Vue.
 */
export function useFormat() {
    return {
        formatRupiah,
        formatNumber,
        formatDate,
        formatRelativeTime,
        formatPhone,
        formatBytes,
        maskSensitive,
        formatPercent,
    };
}
