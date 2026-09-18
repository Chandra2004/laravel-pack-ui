import { computed, unref } from 'vue';

/**
 * Palet warna solid & gradien Tailwind berdesain kontemporer untuk Avatar
 */
export const AVATAR_COLOR_PALETTES = [
    { name: 'blue', hex: '#2563eb', bgClass: 'bg-blue-600 text-white', gradientClass: 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white' },
    { name: 'emerald', hex: '#059669', bgClass: 'bg-emerald-600 text-white', gradientClass: 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white' },
    { name: 'purple', hex: '#9333ea', bgClass: 'bg-purple-600 text-white', gradientClass: 'bg-gradient-to-br from-purple-600 to-pink-600 text-white' },
    { name: 'amber', hex: '#d97706', bgClass: 'bg-amber-600 text-white', gradientClass: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white' },
    { name: 'rose', hex: '#e11d48', bgClass: 'bg-rose-600 text-white', gradientClass: 'bg-gradient-to-br from-rose-600 to-red-700 text-white' },
    { name: 'indigo', hex: '#4f46e5', bgClass: 'bg-indigo-600 text-white', gradientClass: 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white' },
    { name: 'cyan', hex: '#0891b2', bgClass: 'bg-cyan-600 text-white', gradientClass: 'bg-gradient-to-br from-cyan-600 to-sky-700 text-white' },
    { name: 'teal', hex: '#0d9488', bgClass: 'bg-teal-600 text-white', gradientClass: 'bg-gradient-to-br from-teal-600 to-emerald-700 text-white' },
    { name: 'violet', hex: '#7c3aed', bgClass: 'bg-violet-600 text-white', gradientClass: 'bg-gradient-to-br from-violet-600 to-purple-800 text-white' },
    { name: 'fuchsia', hex: '#c026d3', bgClass: 'bg-fuchsia-600 text-white', gradientClass: 'bg-gradient-to-br from-fuchsia-600 to-pink-700 text-white' },
];

/**
 * Ekstrak inisial nama secara cerdas
 * @param {string} name - Nama lengkap atau email
 * @param {Object|number} [options=2] - Opsi konfigurasi atau panjang maksimal inisial
 * @param {number} [options.length=2] - Jumlah huruf inisial (1-4)
 * @param {boolean} [options.uppercase=true] - Huruf kapital
 * @param {'first_last'|'first_consecutive'|'first_only'|'all'} [options.strategy='first_last'] - Strategi pemilihan kata
 * @returns {string} Contoh: "Chandra Tri Antomo" -> "CT" (atau "CTA"), "chandra.antomo@mail.com" -> "CA"
 */
export const formatInitials = (name, options = 2) => {
    if (!name) return '';
    const opts = typeof options === 'number' ? { length: options } : (options || {});

    const unrefVal = (v) => (typeof v === 'object' && v !== null && 'value' in v ? v.value : v);
    const rawLen = unrefVal(typeof options === 'number' ? options : (opts.length !== undefined ? opts.length : 2));
    const maxLen = Math.max(1, Math.min(Number(rawLen) || 2, 4));

    const rawUpper = unrefVal(opts.uppercase);
    const uppercase = rawUpper !== false;

    const rawStrat = unrefVal(opts.strategy);
    const strategy = String(rawStrat || 'first_last').toLowerCase();

    let clean = String(name).trim();

    // Jika input berupa email (e.g. "chandra.antomo@speedpay.id")
    if (clean.includes('@')) {
        const [username] = clean.split('@');
        clean = username.replace(/[._\-+]/g, ' ');
    }

    // Pembersihan gelar profesional / prefix badan usaha umum
    clean = clean.replace(/\b(Dr|Prof|Ir|Drs|H|Hj|PT|CV|Tb|Sp\.[A-Z]+|M\.[A-Z]+|S\.[A-Z]+)\b\.?/gi, ' ');

    // Bersihkan karakter di luar huruf, angka, dan spasi
    clean = clean.replace(/[^\p{L}\p{N}\s]/gu, ' ').trim();
    if (!clean) return '';

    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';

    let result = '';

    if (words.length === 1) {
        const word = words[0];
        result = word.slice(0, maxLen);
    } else if (strategy === 'first_only' || strategy === 'first') {
        result = words[0].slice(0, maxLen);
    } else if (strategy === 'first_consecutive' || strategy === 'consecutive' || strategy === 'first_two') {
        result = words.slice(0, maxLen).map((w) => w[0]).join('');
    } else if (strategy === 'all') {
        result = words.map((w) => w[0]).slice(0, maxLen).join('');
    } else {
        // default: 'first_last'
        if (maxLen === 1) {
            result = words[0][0];
        } else if (maxLen === 2) {
            result = words[0][0] + words[words.length - 1][0];
        } else {
            if (words.length >= 3) {
                const midIdx = Math.floor(words.length / 2);
                result = words[0][0] + words[midIdx][0] + words[words.length - 1][0];
            } else {
                result = words.map((w) => w[0]).join('');
                if (result.length < maxLen && words[0].length > 1) {
                    result = words[0].slice(0, maxLen - 1) + words[1][0];
                }
            }
        }
    }

    return uppercase ? result.toUpperCase() : result;
};

/**
 * Menghasilkan warna background Avatar yang stabil & deterministik dari nama (DJB2 Hash)
 * @param {string} name - String nama/ID/email
 * @param {Object} [options={}]
 * @param {boolean} [options.gradient=false] - Gunakan gradasi
 * @returns {{ name: string, hex: string, bgClass: string, gradientClass: string, textColor: string, style: Object }}
 */
export const formatAvatarColor = (name, options = {}) => {
    if (!name) return AVATAR_COLOR_PALETTES[0];
    const str = String(name).trim();

    // DJB2 Hash Algorithm
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }

    const index = Math.abs(hash) % AVATAR_COLOR_PALETTES.length;
    const palette = AVATAR_COLOR_PALETTES[index];

    const unrefVal = (v) => (typeof v === 'object' && v !== null && 'value' in v ? v.value : v);
    const isGradient = Boolean(unrefVal(options?.gradient));

    return {
        ...palette,
        textColor: '#ffffff',
        style: isGradient
            ? { color: '#ffffff' }
            : { backgroundColor: palette.hex, color: '#ffffff' },
    };
};

/**
 * useInitials
 * Reaktif composable untuk menghasilkan inisial nama, warna background avatar deterministik,
 * gradien estetik, serta properti avatar siap pakai.
 *
 * @param {import('vue').Ref<string>|string} nameInput - Nama lengkap, email, atau string teks
 * @param {Object} [options={}] - Opsi kustomisasi
 * @param {number} [options.length=2] - Panjang karakter inisial (1-4)
 * @param {boolean} [options.uppercase=true] - Huruf kapital
 * @param {'first_last'|'first_two'|'all'} [options.strategy='first_last'] - Strategi pemilihan kata
 * @param {boolean} [options.gradient=false] - Gunakan warna gradasi
 * @param {import('vue').Ref<number>|number} [options.length=2] - Panjang karakter inisial (1-4)
 * @param {import('vue').Ref<boolean>|boolean} [options.uppercase=true] - Huruf kapital
 * @param {import('vue').Ref<string>|string} [options.strategy='first_last'] - Strategi pemilihan kata ('first_last'|'first_consecutive'|'first_only'|'all')
 * @param {import('vue').Ref<string>|string} [options.strategy='first_last'] - Strategi: 'first_last'|'first_consecutive'|'first_only'|'all'
 * @param {import('vue').Ref<boolean>|boolean} [options.gradient=false] - Gunakan warna gradasi
 * @returns {{
 *   initials: import('vue').ComputedRef<string>,
 *   name: import('vue').ComputedRef<string>,
 *   hex: import('vue').ComputedRef<string>,
 *   bgClass: import('vue').ComputedRef<string>,
 *   gradientClass: import('vue').ComputedRef<string>,
 *   textColor: import('vue').ComputedRef<string>,
 *   style: import('vue').ComputedRef<Object>,
 *   avatarProps: import('vue').ComputedRef<Object>,
 *   formatInitials: Function,
 *   formatAvatarColor: Function,
 * }}
 */
export function useInitials(nameInput, options = {}) {
    const nameStr = computed(() => {
        const val = unref(nameInput);
        return typeof val === 'string' ? val : (val ? String(val) : '');
    });

    const resolvedOptions = computed(() => {
        const raw = unref(options) || {};
        return {
            length: unref(raw.length) !== undefined ? Number(unref(raw.length)) : 2,
            strategy: unref(raw.strategy) || 'first_last',
            uppercase: unref(raw.uppercase) !== false,
            gradient: Boolean(unref(raw.gradient)),
            palette: unref(raw.palette),
        };
    });

    const initials = computed(() => {
        return formatInitials(nameStr.value, resolvedOptions.value);
    });

    const palette = computed(() => {
        return formatAvatarColor(nameStr.value, resolvedOptions.value);
    });

    const hex = computed(() => palette.value.hex);
    const bgClass = computed(() => palette.value.bgClass);
    const gradientClass = computed(() => palette.value.gradientClass);
    const textColor = computed(() => palette.value.textColor);

    const style = computed(() => {
        if (resolvedOptions.value.gradient) {
            return {
                color: textColor.value,
            };
        }
        return {
            backgroundColor: hex.value,
            color: textColor.value,
        };
    });

    const avatarProps = computed(() => ({
        initials: initials.value,
        name: nameStr.value,
        class: resolvedOptions.value.gradient ? palette.value.gradientClass : palette.value.bgClass,
        style: style.value,
    }));

    return {
        initials,
        name: nameStr,
        hex,
        bgClass,
        gradientClass,
        textColor,
        style,
        avatarProps,
        formatInitials,
        formatAvatarColor,
    };
}

