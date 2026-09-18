/**
 * Laravel Pack UI - useFormat (Aggregator Composable)
 *
 * Menggabungkan seluruh modul pemformatan terstandarisasi untuk ekosistem Indonesia:
 * 1. Tanggal & Durasi: useDateFormat.js
 * 2. Mata Uang & Angka: useNumberFormat.js
 * 3. String & Teks: useStringFormat.js
 * 4. Sensor & Masking: useMask.js
 * 5. Inisial & Avatar Hash: useInitials.js
 */

export * from './useDateFormat';
export * from './useNumberFormat';
export * from './useStringFormat';
export * from './useMask';
export * from './useInitials';

import { formatDate, formatRelativeTime, formatDuration, parseDate } from './useDateFormat';
import { formatRupiah, formatNumber, formatPercent, formatCompactNumber, formatOrdinal, formatBytes } from './useNumberFormat';
import { slugify, truncate, titleCase, camelCase, snakeCase, kebabCase, stripHtml } from './useStringFormat';
import { maskSensitive, formatPhone } from './useMask';
import { formatInitials, formatAvatarColor } from './useInitials';

/**
 * useFormat Composable Hook
 * Menyediakan akses mudah ke seluruh fungsi formatting di dalam template komponen Vue.
 * Menyediakan seluruh helper pemformatan data dalam satu hook praktis.
 *
 * @returns {Object}
 */
export function useFormat() {
    return {
        // Tanggal & Waktu
        formatDate,
        formatRelativeTime,
        formatDuration,
        parseDate,

        // Angka & Finansial
        formatRupiah,
        formatNumber,
        formatPhone,
        formatPercent,
        formatCompactNumber,
        formatOrdinal,
        formatBytes,

        // String & Teks
        slugify,
        truncate,
        titleCase,
        camelCase,
        snakeCase,
        kebabCase,
        stripHtml,

        // Sensor & Privasi
        maskSensitive,

        // Inisial & Avatar
        formatInitials,
        formatAvatarColor,
    };
}
