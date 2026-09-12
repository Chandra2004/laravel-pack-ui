import { ref, computed } from 'vue';
import { usePage } from '@inertiajs/vue3';

// Mock state untuk testing/simulasi tanpa backend
const mockData = ref({
    active: false,
    user: null,
    roles: [],
    permissions: [],
});

/**
 * usePermission
 * Composable untuk otorisasi hak akses (Authorization & RBAC) berbasis Spatie Laravel Permission
 * atau Laravel Gates di frontend Vue 3 / Inertia.js.
 *
 * @param {Object} options
 * @param {Array<string>} [options.superAdminRoles] - Role yang otomatis lolos semua izin (default: ['super-admin', 'superadmin', 'Super Admin'])
 */
export function usePermission(options = {}) {
    const {
        superAdminRoles = ['super-admin', 'superadmin', 'Super Admin'],
    } = options;

    /**
     * Membaca Page Props dari Inertia secara aman
     */
    const getPageProps = () => {
        try {
            return usePage().props || {};
        } catch {
            return {};
        }
    };

    /**
     * Data user aktif
     */
    const user = computed(() => {
        if (mockData.value.active) {
            return mockData.value.user;
        }
        const props = getPageProps();
        return props.auth?.user || null;
    });

    /**
     * Normalisasi array of roles dari berbagai struktur backend
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
     * Normalisasi array of permissions dari berbagai format umum
     */
    const permissions = computed(() => {
        if (mockData.value.active) {
            return mockData.value.permissions;
        }

        const props = getPageProps();
        const rawPerms = props.auth?.permissions || props.auth?.user?.permissions || [];

        // 1. Format Array (['users.create', 'users.edit'] atau [{ name: 'users.create' }])
        if (Array.isArray(rawPerms)) {
            return rawPerms.map((p) => (typeof p === 'string' ? p : p?.name)).filter(Boolean);
        }

        // 2. Format Object Gates bawaan Laravel ({ 'users.create': true, 'users.delete': false })
        if (typeof rawPerms === 'object' && rawPerms !== null) {
            return Object.keys(rawPerms).filter((key) => Boolean(rawPerms[key]));
        }

        return [];
    });

    /**
     * Memeriksa apakah user berstatus Super Admin (Bypass otorisasi)
     */
    const isSuperAdmin = computed(() => {
        return roles.value.some((role) => superAdminRoles.includes(role));
    });

    /**
     * Helper pencocokan wildcard (contoh: 'posts.*' cocok dengan 'posts.create')
     */
    const matchesPermission = (targetPermission, userPermission) => {
        if (targetPermission === userPermission) return true;

        if (userPermission.endsWith('.*')) {
            const prefix = userPermission.slice(0, -2);
            return targetPermission.startsWith(prefix);
        }

        if (userPermission === '*') return true;

        return false;
    };

    /**
     * Memeriksa apakah user memiliki 1 izin tertentu
     * @param {string} permission
     * @returns {boolean}
     */
    const can = (permission) => {
        if (!permission) return false;
        if (isSuperAdmin.value) return true;

        return permissions.value.some((userPerm) => matchesPermission(permission, userPerm));
    };

    /**
     * Memeriksa apakah user memiliki salah satu izin dari daftar
     * @param {Array<string>} perms
     * @returns {boolean}
     */
    const canAny = (perms = []) => {
        if (!Array.isArray(perms) || perms.length === 0) return false;
        if (isSuperAdmin.value) return true;

        return perms.some((p) => can(p));
    };

    /**
     * Memeriksa apakah user memiliki semua izin dari daftar
     * @param {Array<string>} perms
     * @returns {boolean}
     */
    const canAll = (perms = []) => {
        if (!Array.isArray(perms) || perms.length === 0) return false;
        if (isSuperAdmin.value) return true;

        return perms.every((p) => can(p));
    };

    /**
     * Memeriksa apakah user memiliki 1 role tertentu
     * @param {string} role
     * @returns {boolean}
     */
    const hasRole = (role) => {
        if (!role) return false;
        return roles.value.includes(role);
    };

    /**
     * Memeriksa apakah user memiliki salah satu role dari daftar
     * @param {Array<string>} roleList
     * @returns {boolean}
     */
    const hasAnyRole = (roleList = []) => {
        if (!Array.isArray(roleList) || roleList.length === 0) return false;
        return roleList.some((r) => hasRole(r));
    };

    /**
     * Memeriksa apakah user memiliki semua role dari daftar
     * @param {Array<string>} roleList
     * @returns {boolean}
     */
    const hasAllRoles = (roleList = []) => {
        if (!Array.isArray(roleList) || roleList.length === 0) return false;
        return roleList.every((r) => hasRole(r));
    };

    /**
     * Simulasi peran & izin untuk lingkungan pengujian atau preview playground
     * @param {Object} data
     * @param {Object} [data.user]
     * @param {Array<string>} [data.roles]
     * @param {Array<string>} [data.permissions]
     */
    const mock = ({ user = null, roles = [], permissions = [] } = {}) => {
        mockData.value = {
            active: true,
            user,
            roles,
            permissions,
        };
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
        canAny,
        canAll,

        // Role Helpers
        hasRole,
        hasAnyRole,
        hasAllRoles,

        // Mock Testing API
        mock,
        resetMock,
    };
}
