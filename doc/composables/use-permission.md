# 🔑 Composable `usePermission`

[← Kembali ke Dokumentasi Utama](../../README.md)

`usePermission` adalah composable untuk otorisasi hak akses (*Role-Based Access Control* / RBAC) yang terintegrasi langsung dengan paket **`spatie/laravel-permission`** atau Laravel Gates bawaan melalui shared props Inertia.js.

---

## 🚀 Persiapan Backend Laravel (Opsional / Rekomendasi)

Pada middleware `app/Http/Middleware/HandleInertiaRequests.php`, bagikan data peran dan izin pengguna pada method `share()`:

```php
public function share(Request $request): array
{
    return array_merge(parent::share($request), [
        'auth' => [
            'user' => $request->user() ? [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
            ] : null,
            // Jika menggunakan spatie/laravel-permission:
            'roles' => $request->user() ? $request->user()->getRoleNames() : [],
            'permissions' => $request->user() ? $request->user()->getAllPermissions()->pluck('name') : [],
        ],
    ]);
}
```

---

## 💻 Penggunaan di Komponen Vue

```vue
<script setup>
import { usePermission } from '@/Composables/Pack/usePermission';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const { can, hasRole, canAny, isSuperAdmin } = usePermission();
</script>

<template>
  <div class="space-y-4">
    <!-- Hanya tampil jika user memiliki izin edit transaksi -->
    <ButtonSubmit
      v-if="can('transactions.edit')"
      variant="warning"
      icon="edit"
    >
      Edit Transaksi
    </ButtonSubmit>

    <!-- Hanya tampil jika user memiliki role admin atau manager -->
    <div v-if="hasRole('admin') || hasRole('manager')" class="p-4 bg-slate-50 rounded-xl">
      Panel Manajemen Merchant
    </div>

    <!-- Cek salah satu izin -->
    <div v-if="canAny(['reports.export_csv', 'reports.export_pdf'])">
      Opsi Ekspor Laporan
    </div>

    <!-- Label penanda Super Admin -->
    <span v-if="isSuperAdmin" class="text-xs text-purple-600 font-bold">
      Mode Super Admin (Akses Penuh)
    </span>
  </div>
</template>
```

---

## 📋 Daftar API & Method

| Method / Property | Parameter | Return | Deskripsi |
| :--- | :--- | :--- | :--- |
| `can(permission)` | `(permission: string)` | `boolean` | Memeriksa apakah user memiliki 1 izin spesifik. Mendukung wildcard (misal `'users.*'`). |
| `canAny(permissions)` | `(permissions: string[])` | `boolean` | Mengembalikan `true` jika user memiliki **salah satu** izin dalam array. |
| `canAll(permissions)` | `(permissions: string[])` | `boolean` | Mengembalikan `true` jika user memiliki **seluruh** izin dalam array. |
| `hasRole(role)` | `(role: string)` | `boolean` | Memeriksa apakah user memiliki 1 nama role tertentu. |
| `hasAnyRole(roles)` | `(roles: string[])` | `boolean` | Mengembalikan `true` jika user memiliki **salah satu** role dalam array. |
| `hasAllRoles(roles)` | `(roles: string[])` | `boolean` | Mengembalikan `true` jika user memiliki **seluruh** role dalam array. |
| `isSuperAdmin` | — | `Computed<boolean>` | Otomatis `true` jika user memiliki role `'super-admin'`, `'superadmin'`, atau `'Super Admin'`. |
| `user` | — | `Computed<Object>` | Data user aktif dari `page.props.auth.user`. |
| `roles` | — | `Computed<string[]>` | Daftar nama role yang dimiliki user. |
| `permissions` | — | `Computed<string[]>` | Daftar nama permission yang dimiliki user. |
| `mock(data)` | `({ user, roles, permissions })` | `void` | Menyuntikkan simulasi role/permission untuk kebutuhan unit testing atau preview UI tanpa login backend. |
| `resetMock()` | — | `void` | Mereset state mock kembali ke data autentikasi asli Inertia. |

---

## ⚡ Dukungan Wildcard Permission

Dukungan wildcard otomatis memudahkan manajemen izin modular:
* Jika user memiliki permission `'transactions.*'`, maka:
  * `can('transactions.view')` $\to$ **`true`**
  * `can('transactions.refund')` $\to$ **`true`**
  * `can('users.delete')` $\to$ **`false`**
* Jika user memiliki permission `'*'` atau berstatus Super Admin, seluruh pemanggilan `can(...)` otomatis bernilai **`true`**.
