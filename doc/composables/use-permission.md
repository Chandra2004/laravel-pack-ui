---
title: "usePermission"
description: "Composable otorisasi hak akses (Role-Based Access Control / RBAC) berkinerja tinggi O(1) berbasis Set untuk Vue 3, Inertia.js, dan Spatie Laravel Permission."
---

# usePermission (`usePermission.js`)

## 01. Overview

`usePermission` adalah composable otorisasi hak akses (*Role-Based Access Control / RBAC*) berkinerja tinggi untuk aplikasi Vue 3 dan Laravel Inertia. Composable ini kompatibel penuh dengan ekosistem **Spatie Laravel Permission** dan gerbang otorisasi bawaan (*Laravel Gates*). Dengan memanfaatkan struktur data `Set`, pencarian hak akses dieksekusi dalam kompleksitas waktu $O(1)$, mendukung pencocokan pola *wildcard* (contoh: `'orders.*'`), serta memberikan *bypass* otomatis untuk peran *Super Admin*.

### 1.1 Apa Entitas Ini

- **Tipe Artefak**: Composable Function (Vue 3 Composition API).
- **Lokasi Berkas Sumber**: [usePermission.js](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/resources/js/Composables/Pack/usePermission.js).
- **Ekspor Kunci**: `usePermission`.
- **Target Ekosistem**: Menu navigasi sidebar, tombol aksi tabel data, router guard Inertia, dan elemen antarmuka yang memerlukan pembatasan akses hak pengguna.

### 1.2 Fungsi Utama

- Melakukan pengecekan hak akses instan melalui fungsi `can(permission)` dan `cannot(permission)`.
- Memeriksa kepemilikan peran pengguna melalui `hasRole(role)`, `hasAnyRole(roles)`, dan `hasAllRoles(roles)`.
- Mendukung logika multi-izin: `canAny(permissions)` dan `canAll(permissions)`.
- Menyediakan evaluasi pola *wildcard* bertingkat (contoh: `'users.*'` otomatis mencakup `'users.view'`, `'users.create'`, dan `'users.delete'`).
- Mem-bypass seluruh batasan izin secara otomatis jika pengguna memiliki salah satu role yang terdaftar sebagai Super Admin.
- Menyediakan API simulasi data (*mock API*) `mock()` dan `resetMock()` untuk pengujian unit (*unit testing*) dan preview tanpa harus login ke backend.

### 1.3 Kapan Digunakan

- Penyembunyian bersyarat (*conditional rendering*) tombol aksi kritis seperti "Hapus Data", "Ekspor Laporan", atau "Ubah Status".
- Filter item menu navigasi sidebar agar pengguna hanya melihat modul yang diizinkan untuk rolenya.
- Proteksi komponen halaman admin dari akses staf biasa.
- Sinkronisasi instan izin dari *Spatie Laravel Permission* yang dibagikan via middleware Inertia `HandleInertiaRequests`.

### 1.4 Karakteristik Penting

- **Kompleksitas Waktu O(1)**: Mengonversi array permissions dari backend ke dalam JavaScript `Set` reaktif, menghindari iterasi linear `Array.includes()` yang lambat saat daftar izin berjumlah ratusan.
- **Normalisasi Format Fleksibel**: Menerima berbagai struktur data backend Laravel secara otomatis: format array string, array objek `{ name, id }`, maupun format objek Laravel Gates boolean `{ 'users.create': true }`.
- **Integrasi usePage Mulus**: Secara otomatis membaca objek `auth.user`, `auth.roles`, dan `auth.permissions` dari shared props Inertia tanpa perlu parameter manual.

---

## 02. Preview

> [!TIP]
> Pengujian fungsional dan showcase composable ini dapat diuji secara native pada portal pratinjau aplikasi:
>
> <a href="http://localhost:8000/preview" target="_self" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 8px; background-color: var(--vp-c-brand-1, #4f46e5); color: #ffffff;">Buka Live Preview Portal Komponen &rarr;</a>

---

## 03. Usage

### Pohon Konsep Penggunaan

```text
usePermission
├── Pengecekan Izin (Permissions)
│   ├── Izin Tunggal (can / cannot)
│   ├── Multi-Izin OR (canAny)
│   ├── Multi-Izin AND (canAll)
│   └── Pola Wildcard ('domain.*' atau '*')
│
├── Pengecekan Peran (Roles)
│   ├── Peran Tunggal (hasRole)
│   ├── Multi-Peran OR (hasAnyRole)
│   └── Multi-Peran AND (hasAllRoles)
│
├── Hak Istimewa Khusus
│   └── isSuperAdmin (Bypass otomatis semua can/hasRole)
│
└── Utilitas Pengujian & Pratinjau
    ├── mock({ roles, permissions })
    └── resetMock()
```

### Matriks Keputusan: `can()` vs `hasRole()`

| Kebutuhan Otorisasi | Metode yang Disarankan | Alasan Arsitektural |
| :--- | :--- | :--- |
| Visibilitas tombol aksi spesifik (misal "Hapus Pengguna") | `can('users.delete')` | Izin bersifat granular; peran staf dapat diubah tanpa merombak kode template. |
| Akses modul dashboard menyeluruh (misal "Portal Kasir") | `hasRole('cashier')` | Peran merepresentasikan konteks kerja level tinggi pengguna. |
| Pengguna dengan hak istimewa tak terbatas | Otomatis via `super-admin` | Super Admin tidak perlu diberikan ratusan izin database satu per satu. |

---

## 04. Anatomy

### Hierarki Modul Tekstual

```text
usePermission.js
│
├── Singleton State (mockData)
│   ├── active: boolean
│   ├── user: Object | null
│   ├── roles: Array<string>
│   └── permissions: Array<string>
│
├── Data Resolvers
│   ├── getPageProps()           → Ambil $page.props dari usePage() Inertia
│   ├── user (Computed)          → Normalisasi data user aktif
│   ├── roles (Computed)         → Normalisasi Spatie RoleNames / array
│   ├── roleSet (Computed)       → JavaScript Set untuk lookup O(1)
│   ├── permissions (Computed)   → Normalisasi Spatie Permissions / Gates
│   ├── permSet (Computed)       → JavaScript Set untuk lookup O(1)
│   └── isSuperAdmin (Computed)  → Evaluasi keberadaan role super-admin
│
├── Authorization Methods
│   ├── can(permission)          → Cek izin dengan fallback wildcard
│   ├── cannot(permission)       → Negasi dari can()
│   ├── canAny(permissions)      → Lolos jika salah satu ada
│   ├── canAll(permissions)      → Lolos jika seluruhnya ada
│   ├── hasRole(role)            → Cek peran dengan bypass Super Admin
│   ├── hasAnyRole(roles)        → Cek keberadaan salah satu peran
│   └── hasAllRoles(roles)       → Cek keberadaan seluruh peran
│
└── Mock Helpers
    ├── mock(payload)            → Simulasikan data auth untuk testing
    └── resetMock()              → Kembalikan ke state asli Inertia
```

### Diagram Alur Evaluasi Hak Akses (Mermaid)

```mermaid
graph TD
    A[Panggil can('orders.delete')] --> B{isSuperAdmin?}
    B -->|Ya| C[Return TRUE: Bypass Otomatis]
    B -->|Tidak| D{permSet memiliki '*'}
    D -->|Ya| C
    D -->|Tidak| E{permSet memiliki 'orders.delete'}
    E -->|Ya| C
    E -->|Tidak| F{Cek Wildcard Domain: 'orders.*'}
    F -->|Ya| C
    F -->|Tidak| G[Return FALSE: Akses Ditolak]
```

---

## 05. Variants

Composable mendukung empat variasi strategi otorisasi:

| Strategi | Sintaks Contoh | Perilaku Evaluasi |
| :--- | :--- | :--- |
| **Direct Permission** | `can('finance.withdraw')` | Pengecekan persis terhadap nama izin yang dimiliki pengguna. |
| **Wildcard Match** | `can('orders.create')` saat user punya `'orders.*'` | Otomatis mengekstrak segmen domain sebelum tanda titik (`orders`) dan mencocokkan dengan pola wildcard. |
| **Super Admin Bypass** | Pengguna memiliki role `'super-admin'` | Seluruh evaluasi `can()` dan `hasRole()` otomatis bernilai `true`. |
| **Multi-Permission Any/All** | `canAny(['edit', 'publish'])`<br>`canAll(['view', 'export'])` | Evaluasi kombinatorial OR (salah satu terpenuhi) atau AND (seluruhnya wajib ada). |

---

## 06. Sizes

Tidak relevan untuk composable logika otorisasi.

---

## 07. States

Composable mengelola status otorisasi reaktif pengguna:

| Status Pengguna | Representasi Nilai | Dampak pada UI |
| :--- | :--- | :--- |
| **Guest (Belum Login)** | `user.value === null` | Seluruh `can()` bernilai `false`, `roles` kosong. |
| **Standard User** | `user.value !== null && !isSuperAdmin.value` | Evaluasi izin ketat sesuai daftar `permissions` milik pengguna. |
| **Super Admin** | `isSuperAdmin.value === true` | Semua proteksi dilewati; seluruh menu dan tombol aksi ditampilkan. |

---

## 08. Props / Parameters / Attributes

### Parameter `usePermission(options)`

| Parameter | Tipe Data | Wajib | Default | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `options.superAdminRoles` | `Array<string>` | Tidak | `['super-admin', 'superadmin', 'Super Admin']` | Daftar nama peran yang dianggap sebagai Super Admin dan mendapatkan bypass otomatis. |

---

## 09. Slots / Content

Tidak relevan untuk composable murni tanpa komponen visual langsung.

---

## 10. Events / Interactions / Returns

### Return Object `usePermission()`

| Properti / Method | Tipe Data | Reaktif | Deskripsi |
| :--- | :--- | :--- | :--- |
| `user` | `ComputedRef<Object\|null>` | Ya | Objek data pengguna aktif dari Inertia props `auth.user`. |
| `roles` | `ComputedRef<Array<string>>` | Ya | Array daftar nama peran yang dimiliki pengguna. |
| `permissions` | `ComputedRef<Array<string>>` | Ya | Array daftar nama hak akses yang dimiliki pengguna. |
| `isSuperAdmin` | `ComputedRef<boolean>` | Ya | Bernilai `true` jika pengguna memiliki peran Super Admin. |
| `can(permission)` | `Function(string) => boolean` | Tidak | Memeriksa apakah pengguna memiliki hak akses tertentu. |
| `cannot(permission)` | `Function(string) => boolean` | Tidak | Kebalikan dari `can()`. |
| `canAny(permissions)` | `Function(string[]) => boolean` | Tidak | Memeriksa apakah pengguna memiliki salah satu dari izin yang diberikan. |
| `canAll(permissions)` | `Function(string[]) => boolean` | Tidak | Memeriksa apakah pengguna memiliki seluruh izin yang diberikan. |
| `hasRole(role)` | `Function(string) => boolean` | Tidak | Memeriksa apakah pengguna memiliki peran tertentu. |
| `hasAnyRole(roles)` | `Function(string[]) => boolean` | Tidak | Memeriksa apakah pengguna memiliki salah satu dari peran yang diberikan. |
| `hasAllRoles(roles)` | `Function(string[]) => boolean` | Tidak | Memeriksa apakah pengguna memiliki seluruh peran yang diberikan. |
| `mock(payload)` | `Function(Object)` | Tidak | Mensimulasikan data roles dan permissions untuk testing / preview UI. |
| `resetMock()` | `Function()` | Tidak | Mengembalikan state ke data autentikasi asli Inertia. |

---

## 11. Code Example

### 1. Penggunaan Dasar (Basic Example)

Menyembunyikan tombol hapus jika pengguna tidak memiliki izin:

```vue
<script setup>
import { usePermission } from '@/Composables/Pack/usePermission';

const props = defineProps({ item: Object });
const { can } = usePermission();
</script>

<template>
    <div class="flex items-center gap-2">
        <button type="button" class="btn-primary">Lihat Detail</button>

        <!-- Tombol hapus hanya dirender jika memiliki izin -->
        <button
            v-if="can('items.delete')"
            type="button"
            class="btn-danger"
        >
            Hapus Item
        </button>
    </div>
</template>
```

### 2. Penggunaan Menengah (Variant / Intermediate Example)

Pengecekan kombinasi izin dan peran pada toolbar tabel data:

```vue
<script setup>
import { usePermission } from '@/Composables/Pack/usePermission';

const { can, canAny, hasRole, isSuperAdmin } = usePermission();
</script>

<template>
    <div class="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b">
        <div class="flex items-center gap-2">
            <span v-if="isSuperAdmin" class="badge-purple">Mode Super Admin</span>
            <span v-else class="text-xs text-gray-500">Mode Akses Terbatas</span>
        </div>

        <div class="flex items-center gap-2">
            <!-- Bisa diakses jika punya izin ekspor ATAU role manager -->
            <button
                v-if="can('reports.export') || hasRole('finance_manager')"
                type="button"
                class="btn-secondary"
            >
                Ekspor Laporan
            </button>

            <!-- Bisa diakses jika memiliki salah satu izin aksi transaksi -->
            <button
                v-if="canAny(['orders.approve', 'orders.reject'])"
                type="button"
                class="btn-primary"
            >
                Tindakan Otorisasi
            </button>
        </div>
    </div>
</template>
```

### 3. Penggunaan Lanjutan (Advanced / Enterprise Example)

Konfigurasi Menu Sidebar Dinamis Berdasarkan Otorisasi dan Konfigurasi Spatie di Laravel Backend:

```php
// app/Http/Middleware/HandleInertiaRequests.php (Laravel Backend)
public function share(Request $request): array
{
    return array_merge(parent::share($request), [
        'auth' => [
            'user' => $request->user() ? [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                // Ekstraksi Spatie Roles & Permissions
                'roles' => $request->user()->getRoleNames(),
                'permissions' => $request->user()->getAllPermissions()->pluck('name'),
            ] : null,
        ],
    ]);
}
```

```vue
<!-- resources/js/Components/AppSidebar.vue (Vue Frontend) -->
<script setup>
import { computed } from 'vue';
import { Link } from '@inertiajs/vue3';
import { usePermission } from '@/Composables/Pack/usePermission';

const { can, hasRole } = usePermission();

// Daftar menu lengkap dengan aturan permission
const allNavigationItems = [
    { name: 'Dashboard', href: '/dashboard', permission: null },
    { name: 'Daftar Pesanan', href: '/orders', permission: 'orders.view' },
    { name: 'Katalog Produk', href: '/products', permission: 'products.view' },
    { name: 'Manajemen Staf', href: '/users', permission: 'users.*' }, // Wildcard
    { name: 'Pengaturan Sistem', href: '/settings', role: 'super-admin' },
];

// Saring menu yang hanya boleh dilihat oleh pengguna saat ini
const filteredNavigation = computed(() => {
    return allNavigationItems.filter((item) => {
        if (item.role && !hasRole(item.role)) return false;
        if (item.permission && !can(item.permission)) return false;
        return true;
    });
});
</script>

<template>
    <nav class="space-y-1 p-3">
        <Link
            v-for="nav in filteredNavigation"
            :key="nav.name"
            :href="nav.href"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
            {{ nav.name }}
        </Link>
    </nav>
</template>
```

---

## 12. Result / Behavior

### Alur Kerja Evaluasi

1. Komponen menginisialisasi `usePermission()`.
2. Composable mengambil data dari `usePage().props.auth`.
3. Array roles dan permissions dikonversi ke dalam JavaScript `Set` terkomputasi (`roleSet` dan `permSet`).
4. Saat `can('orders.create')` dipanggil:
   - Jika `isSuperAdmin` aktif, langsung mengembalikan `true`.
   - Melakukan pengecekan O(1) pada `permSet.has('*')` atau `permSet.has('orders.create')`.
   - Jika tidak ditemukan, fungsi memisahkan segmen domain (`orders`) dan memeriksa apakah `orders.*` ada di dalam Set.
   - Mengembalikan `false` jika tidak ada kondisi yang terpenuhi.

---

## 13. Customization

### Menyesuaikan Nama Role Super Admin

Jika aplikasi Anda menggunakan nama role khusus untuk Super Admin (misalnya `'root'` atau `'developer'`), teruskan opsi saat inisialisasi:

```javascript
const { can } = usePermission({
    superAdminRoles: ['root', 'developer', 'super-admin'],
});
```

---

## 14. Accessibility (a11y)

- **Menyembunyikan (`v-if`) vs Menonaktifkan (`disabled`)**:
  - Gunakan `v-if="can('action')"` untuk aksi yang sama sekali tidak boleh diketahui keberadaannya oleh peran pengguna yang tidak berhak (misal menu audit log internal).
  - Gunakan `:disabled="!can('action')"` disertai `aria-disabled="true"` dan `title="Anda tidak memiliki hak akses"` jika tombol perlu tetap terlihat agar pengguna tahu fitur tersebut ada namun memerlukan peningkatan paket/role.

---

## 15. Responsive Behavior

Tidak relevan untuk composable logika otorisasi tanpa markup tampilan.

---

## 16. Do / Don't

### Rekomendasi (Do)

- Gunakan pengecekan berbasis izin granular (`can('orders.delete')`) daripada nama peran kaku (`hasRole('admin')`), agar kewenangan peran dapat diubah dari panel admin backend tanpa perlu mengubah kode frontend.
- Pastikan controller backend Laravel selalu menerapkan otorisasi mandiri (`$this->authorize('delete', $order)` atau middleware `can:orders.delete`).
- Manfaatkan fitur `mock()` saat membuat demonstrasi interaktif atau unit test komponen.

### Larangan (Don't)

- Jangan mengandalkan `usePermission` sebagai satu-satunya sistem keamanan; pengguna cerdas dapat memanipulasi kode JavaScript di console browser. Backend Laravel wajib memvalidasi setiap request.
- Jangan melakukan perulangan array izin secara manual di template; selalu gunakan helper `can()`, `canAny()`, atau `canAll()`.

---

## 17. Examples / Recipes

### Resep: Pengujian Komponen dengan API Mock

```javascript
import { usePermission } from '@/Composables/Pack/usePermission';

const { mock, resetMock, can } = usePermission();

// Simulasikan pengguna kasir untuk pengujian UI
mock({
    user: { id: 1, name: 'Kasir Cabang' },
    roles: ['cashier'],
    permissions: ['pos.checkout', 'pos.refund'],
});

console.log(can('pos.checkout')); // true
console.log(can('settings.edit')); // false

// Kembalikan ke state asli setelah pengujian selesai
resetMock();
```

---

## 18. Related Items

```text
usePermission
├── Dependensi Backend
│   ├── Spatie Laravel Permission   → https://spatie.be/docs/laravel-permission
│   └── Laravel Gates & Policies    → Gerbang otorisasi standar framework
│
└── Komponen Terkait
    ├── Sidebar.vue                 → Menampilkan navigasi terproteksi
    ├── UIDashboardLayout.vue       → Shell halaman aplikasi
    └── TableComponent.vue          → Menyembunyikan tombol aksi kolom tabel
```

---

## 19. Notes / Limitations

- **Reaktivitas Session Flash**: Izin dan peran dibaca dari shared props Inertia saat halaman pertama kali dimuat atau di-refresh via router. Jika izin pengguna diubah oleh admin di database saat pengguna sedang aktif membuka tab, perubahan tersebut baru akan terrefleksi setelah navigasi Inertia berikutnya.
- **Pencocokan Wildcard Satu Tingkat**: Evaluasi wildcard bawaan dirancang untuk satu tingkat kedalaman domain (contoh: `'orders.*'` cocok dengan `'orders.create'`). Untuk hierarki yang lebih dalam (contoh: `'inventory.warehouse.stock.*'`), disarankan mendaftarkan izin secara eksplisit.
