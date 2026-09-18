import { computed, unref } from 'vue';

/**
 * Pembuat URL Slug ramah SEO
 * @param {string} text - Teks judul
 * @param {string} [separator='-'] - Karakter pemisah
 * @returns {string} Contoh: "Integrasi Payment Gateway v1.7!" -> "integrasi-payment-gateway-v1-7"
 */
export const slugify = (text, separator = '-') => {
    if (!text) return '';
    return String(text)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s-]+/g, separator)
        .replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '');
};

/**
 * Pemotong teks cerdas berbasis batas kata (word boundary)
 * @param {string} text - Teks panjang
 * @param {number} [length=100] - Panjang karakter maksimum
 * @param {Object} [options={}]
 * @param {string} [options.suffix='...'] - Tanda akhiran
 * @param {boolean} [options.wordBoundary=true] - Hindari pemotongan di tengah kata
 * @returns {string}
 */
export const truncate = (text, length = 100, options = {}) => {
    if (!text) return '';
    const str = String(text);
    if (str.length <= length) return str;

    const suffix = options.suffix !== undefined ? options.suffix : '...';
    const wordBoundary = options.wordBoundary !== false;

    const targetLen = Math.max(0, length - suffix.length);
    if (targetLen === 0) return suffix;

    let truncated = str.slice(0, targetLen);

    if (wordBoundary) {
        const lastSpace = truncated.lastIndexOf(' ');
        if (lastSpace > 0) {
            truncated = truncated.slice(0, lastSpace);
        }
    }

    return truncated + suffix;
};

/**
 * Ubah teks menjadi Title Case
 * @param {string} text
 * @returns {string} Contoh: "laporan transaksi" -> "Laporan Transaksi"
 */
export const titleCase = (text) => {
    if (!text) return '';
    return String(text)
        .toLowerCase()
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
};

/**
 * Ubah string menjadi camelCase
 * @param {string} text
 * @returns {string} Contoh: "user_profile_id" -> "userProfileId"
 */
export const camelCase = (text) => {
    if (!text) return '';
    return String(text)
        .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
        .replace(/^(.)/, (c) => c.toLowerCase());
};

/**
 * Ubah string menjadi snake_case
 * @param {string} text
 * @returns {string} Contoh: "userProfileId" -> "user_profile_id"
 */
export const snakeCase = (text) => {
    if (!text) return '';
    return String(text)
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[-\s]+/g, '_')
        .toLowerCase();
};

/**
 * Ubah string menjadi kebab-case
 * @param {string} text
 * @returns {string} Contoh: "userProfileId" -> "user-profile-id"
 */
export const kebabCase = (text) => {
    if (!text) return '';
    return String(text)
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[_\s]+/g, '-')
        .toLowerCase();
};

/**
 * Bersihkan string dari tag HTML
 * @param {string} html
 * @returns {string}
 */
export const stripHtml = (html) => {
    if (!html) return '';
    return String(html).replace(/<[^>]*>?/gm, '').trim();
};

/**
 * Composable useStringFormat
 * @param {import('vue').Ref<string>|string} textInput
 * @param {Object} [options={}]
 * @returns {{
 *   slug: import('vue').ComputedRef<string>,
 *   title: import('vue').ComputedRef<string>,
 *   camel: import('vue').ComputedRef<string>,
 *   snake: import('vue').ComputedRef<string>,
 *   kebab: import('vue').ComputedRef<string>,
 *   clean: import('vue').ComputedRef<string>,
 * }}
 */
export function useStringFormat(textInput, options = {}) {
    const textVal = computed(() => {
        const v = unref(textInput);
        return v !== null && v !== undefined ? String(v) : '';
    });

    const slug = computed(() => slugify(textVal.value, options.separator || '-'));
    const title = computed(() => titleCase(textVal.value));
    const camel = computed(() => camelCase(textVal.value));
    const snake = computed(() => snakeCase(textVal.value));
    const kebab = computed(() => kebabCase(textVal.value));
    const clean = computed(() => stripHtml(textVal.value));

    return {
        slug,
        title,
        camel,
        snake,
        kebab,
        clean,
        slugify,
        truncate,
        titleCase,
        camelCase,
        snakeCase,
        kebabCase,
        stripHtml,
    };
}

