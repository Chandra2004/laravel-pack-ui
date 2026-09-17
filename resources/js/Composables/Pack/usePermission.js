import { ref, computed } from 'vue';
import { usePage } from '@inertiajs/vue3';

// State mock reaktif singleton untuk pengujian & preview UI
const mockData = ref({
    active: false,
    user: null,
    roles: [],
    permissions: [],
});

/**
 * usePermission
 * Composable otorisasi hak akses (Authorization & RBAC) berkinerja tinggi
 * untuk ekosistem Vue 3 & Inertia.js (kompatibel penuh dengan Spatie Laravel Permission dan Laravel Gates).
 *
 * Menggunakan pencarian berbasis Set untuk kompleksitas waktu O(1),
 * mendukung pencocokan wildcard (contoh: 'transactions.*' atau '*'),
 * serta bypass otomatis untuk Super Admin.
 *
 * @param {Object} options
 * @param {Array<string>} [options.superAdminRoles] - Daftar nama role yang otomatis meloloskan semua izin
 */
export function usePermission(options = {}) {
    const {
        superAdminRoles = ['super-admin', 'superadmin', 'Super Admin'],
    } = options;

    const superAdminSet = new Set(superAdminRoles);

    /**
     * Membaca props Inertia secara aman
     */
    const getPageProps = () => {
        try {
            return usePage().props || {};
        } catch {
            return {};
        }
    };

    /**
     * Data user autentikasi saat ini
     */
    const user = computed(() => {
        if (mockData.value.active) {
            return mockData.value.user;
        }
        const props = getPageProps();
        return props.auth?.user || null;
    });

    /**
     * Normalisasi array of roles dari berbagai struktur backend Laravel / Spatie
     */
    const roles = computed(() => {
        if (mockData.value.active) {
            return mockData.value.roles;
        }

        const props = getPageProps();
        const rawRoles = props.auth?.roles || props.auth?.user?.roles || [];

        if (Array.isArray(rawRoles)) {
            return rawRoles.map((r) => (typeof r === 'string' ? r : r?.name)).filter(Boolean);
        }

        if (typeof rawRoles === 'string') {
            return [rawRoles];
        }

        return [];
    });

    /**
     * Set O(1) untuk pengecekan role instan
     */
    const roleSet = computed(() => new Set(roles.value));

    /**
     * Normalisasi array of permissions dari berbagai format umum
     */
    const permissions = computed(() => {
        if (mockData.value.active) {
            return mockData.value.permissions;
        }

        const props = getPageProps();
        const rawPerms = props.auth?.permissions || props.auth?.user?.permissions || props.auth?.can || [];

        // 1. Format Array: ['users.create', 'users.edit'] atau [{ name: 'users.create' }]
        if (Array.isArray(rawPerms)) {
            return rawPerms.map((p) => (typeof p === 'string' ? p : p?.name)).filter(Boolean);
        }

        // 2. Format Object Gates Laravel: { 'users.create': true, 'users.delete': false }
        if (typeof rawPerms === 'object' && rawPerms !== null) {
            return Object.keys(rawPerms).filter((key) => Boolean(rawPerms[key]));
        }

        return [];
    });

    /**
     * Set O(1) untuk pencocokan izin eksak secara instan
     */
    const permissionSet = computed(() => new Set(permissions.value));

    /**
     * Memeriksa keberadaan wildcard universal '*'
     */
    const hasUniversalWildcard = computed(() => permissionSet.value.has('*'));

    /**
     * Daftar prefix wildcard yang diekstrak (contoh 'transactions.*' -> 'transactions.')
     */
    const wildcardPrefixes = computed(() => {
        const prefixes = [];
        for (const p of permissions.value) {
            if (p.endsWith('.*')) {
                prefixes.push(p.slice(0, -1)); // contoh 'transactions.'
            }
        }
        return prefixes;
    });

    /**
     * Mengecek apakah user aktif berstatus Super Admin (Bypass otorisasi)
     */
    const isSuperAdmin = computed(() => {
        for (const r of roles.value) {
            if (superAdminSet.has(r)) return true;
        }
        return false;
    });

    /**
     * Helper normalisasi input izin (mendukung array atau string pemisah pipa 'a|b')
     * @param {string|string[]} input
     * @returns {string[]}
     */
    const parseList = (input) => {
        if (!input) return [];
        if (Array.isArray(input)) {
            return input.flatMap((item) => (typeof item === 'string' ? item.split('|') : []))
                .map((s) => s.trim())
                .filter(Boolean);
        }
        if (typeof input === 'string') {
            return input.split('|').map((s) => s.trim()).filter(Boolean);
        }
        return [];
    };

    /**
     * Memeriksa apakah user memiliki 1 izin tertentu (O(1) Set Lookup + Wildcard Check)
     * @param {string} permission - Nama permission (misal: 'transactions.view')
     * @returns {boolean}
     */
    const can = (permission) => {
        if (!permission) return false;

        // Bypass untuk Super Admin atau permission universal '*'
        if (isSuperAdmin.value || hasUniversalWildcard.value) {
            return true;
        }

        // 1. O(1) Pencarian langsung pada Set
        if (permissionSet.value.has(permission)) {
            return true;
        }

        // 2. Pencocokan prefix wildcard (misal 'transactions.*' cocok dengan 'transactions.view')
        const prefixes = wildcardPrefixes.value;
        if (prefixes.length > 0) {
            for (let i = 0; i < prefixes.length; i++) {
                if (permission.startsWith(prefixes[i])) {
                    return true;
                }
            }
        }

        return false;
    };

    /**
     * Memeriksa apakah user TIDAK memiliki izin tertentu (Kebalikan dari can)
     * @param {string} permission
     * @returns {boolean}
     */
    const cannot = (permission) => !can(permission);

    /**
     * Memeriksa apakah user memiliki SALAH SATU izin dari daftar
     * Mendukung format array ['a', 'b'] maupun pipa string 'a|b'
     * @param {string|string[]} perms
     * @returns {boolean}
     */
    const canAny = (perms = []) => {
        const list = parseList(perms);
        if (list.length === 0) return false;
        if (isSuperAdmin.value || hasUniversalWildcard.value) return true;

        for (let i = 0; i < list.length; i++) {
            if (can(list[i])) return true;
        }
        return false;
    };

    /**
     * Memeriksa apakah user memiliki SEMUA izin dari daftar
     * @param {string|string[]} perms
     * @returns {boolean}
     */
    const canAll = (perms = []) => {
        const list = parseList(perms);
        if (list.length === 0) return false;
        if (isSuperAdmin.value || hasUniversalWildcard.value) return true;

        for (let i = 0; i < list.length; i++) {
            if (!can(list[i])) return false;
        }
        return true;
    };

    /**
     * Memeriksa apakah user TIDAK memiliki SEMUA izin dari daftar
     * @param {string|string[]} perms
     * @returns {boolean}
     */
    const cannotAny = (perms = []) => !canAll(perms);

    /**
     * Memeriksa apakah user memiliki 1 nama role tertentu (O(1) Set Lookup)
     * @param {string} role
     * @returns {boolean}
     */
    const hasRole = (role) => {
        if (!role) return false;
        return roleSet.value.has(role);
    };

    /**
     * Memeriksa apakah user memiliki SALAH SATU role dari daftar
     * @param {string|string[]} roleList
     * @returns {boolean}
     */
    const hasAnyRole = (roleList = []) => {
        const list = parseList(roleList);
        if (list.length === 0) return false;

        for (let i = 0; i < list.length; i++) {
            if (roleSet.value.has(list[i])) return true;
        }
        return false;
    };

    /**
     * Memeriksa apakah user memiliki SEMUA role dari daftar
     * @param {string|string[]} roleList
     * @returns {boolean}
     */
    const hasAllRoles = (roleList = []) => {
        const list = parseList(roleList);
        if (list.length === 0) return false;

        for (let i = 0; i < list.length; i++) {
            if (!roleSet.value.has(list[i])) return false;
        }
        return true;
    };

    /**
     * Simulasi peran & izin untuk pengujian atau pratinjau playground
     * @param {Object} data
     * @param {Object} [data.user]
     * @param {Array<string>} [data.roles]
     * @param {Array<string>} [data.permissions]
     * @param {boolean} [data.append]
     */
    const mock = ({ user = null, roles = [], permissions = [], append = false } = {}) => {
        if (append && mockData.value.active) {
            mockData.value = {
                active: true,
                user: user || mockData.value.user,
                roles: Array.from(new Set([...mockData.value.roles, ...roles])),
                permissions: Array.from(new Set([...mockData.value.permissions, ...permissions])),
            };
        } else {
            mockData.value = {
                active: true,
                user,
                roles: [...roles],
                permissions: [...permissions],
            };
        }
    };

    /**
     * Reset simulasi mock ke kondisi data autentikasi asli Inertia
     */
    const resetMock = () => {
        mockData.value = {
            active: false,
            user: null,
            roles: [],
            permissions: [],
        };
    };

    return {
        // State Computed
        user,
        roles,
        permissions,
        isSuperAdmin,

        // Permission Helpers
        can,
        cannot,
        canAny,
        canAll,
        cannotAny,
        hasPermission: can,

        // Role Helpers
        hasRole,
        hasAnyRole,
        hasAllRoles,

        // Mock Testing API
        mock,
        resetMock,
    };
}
