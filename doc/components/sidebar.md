# 📑 Sidebar & Dashboard Layout (`SidebarComponent.vue` & `DashboardLayout.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen navigasi samping (*Sidebar*) dan kerangka tata letak dasbor (*Dashboard Shell Layout*) yang dirancang modular sesuai **5 Pilar Kustomisasi**. Anda dapat menggunakannya dalam 3 skenario:
1. **Hanya `SidebarComponent.vue`** (atau alias `Sidebar.vue`) jika aplikasi Anda sudah memiliki topbar sendiri.
2. **Hanya `DashboardLayout.vue`** dengan sidebar kustom Anda sendiri via slot `#sidebar`.
3. **Keduanya bersamaan**: `DashboardLayout.vue` secara *out-of-the-box* telah mengintegrasikan `SidebarComponent.vue`, lengkap dengan topbar, pencarian, notifikasi, switch tema, breadcrumbs, dan profil pengguna.

---

## 🎨 5 Pilar Kustomisasi Terapan

1. **Warna (`colorTheme`)**:
   - `primary` (Blue), `indigo`, `emerald`, `purple`, `amber`, `rose`, `cyan`, `dark`.
   - Warna aksen diterapkan konsisten pada item aktif, badge menu, focus ring, hover state, hingga tombol toggle.
2. **Bentuk & Gaya (`radius`, `itemStyle`, `variant`)**:
   - **Radius**: `none`, `sm`, `md`, `lg` (default), `xl`, `full`.
   - **Item Style**:
     - `soft`: Background transparan lembut dengan teks aksen berwarna.
     - `solid`: Background solid kontras tinggi dengan teks putih (efek fokus tajam).
     - `outline`: Border tipis berwarna dengan aksen aksen lembut.
   - **Sidebar Variant**:
     - `default`: Tampilan klasik menempel tepi dengan border standar.
     - `bordered`: Border kanan dipertegas dengan shadow halus.
     - `floating`: Melayang bergaya kartu (*island layout*) dengan margin di sekelilingnya.
3. **Teks Konten**:
   - Judul kategori (`heading`), label menu, badge status/angka, teks copyright footer.
   - Teks terpotong rapi (*truncate*) saat mode ciut (*collapsed*) dengan tooltip bawaan.
4. **Ikon**:
   - Google Material Symbols didukung penuh pada menu utama dan submenu.
   - Indikator ekspansi submenu chevron berputar mulus (`transition-transform duration-200`).
   - Ukuran ikon otomatis berskala sesuai prop `size` (`sm`, `md`, `lg`).
5. **Responsif**:
   - Beralih mulus ke mode *Mobile Drawer* saat lebar layar di bawah `mobileBreakpoint` (default `768px`).
   - Dilengkapi *backdrop blur*, penguncian scroll layar (`body scroll-lock`), dan penutupan otomatis saat klik luar (*click outside*).

---

## 🚀 1. Penggunaan Standalone Sidebar (`SidebarComponent.vue`)

Gunakan jika Anda hanya memerlukan bilah navigasi samping:

```vue
<script setup>
import { ref } from 'vue';
import SidebarComponent from '@/Components/Pack/SidebarComponent.vue';
// Catatan: import Sidebar from '@/Components/Pack/Sidebar.vue' tetap didukung penuh (alias)

const isCollapsed = ref(false);
const isMobileOpen = ref(false);

const menuItems = [
    { heading: 'NAVIGASI UTAMA' },
    { label: 'Dashboard', icon: 'dashboard', href: '/dashboard', active: true },
    {
        label: 'Transaksi',
        icon: 'receipt_long',
        badge: 'Baru',
        badgeVariant: 'success',
        children: [
            { label: 'Semua Transaksi', href: '/transactions' },
            { label: 'Menunggu Pembayaran', href: '/transactions/pending' },
        ]
    },
    { separator: true },
    { heading: 'SISTEM' },
    { label: 'Konfigurasi', icon: 'settings', href: '/settings' },
];
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Standalone Sidebar -->
    <SidebarComponent
      :items="menuItems"
      v-model:collapsed="isCollapsed"
      v-model:mobile-open="isMobileOpen"
      color-theme="indigo"
      item-style="soft"
      radius="lg"
      variant="bordered"
      active-route="/dashboard"
    >
      <template #logo>
        <div class="flex items-center gap-2 px-2 py-1">
          <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">P</div>
          <span class="font-bold text-slate-800 dark:text-white">MerchantHub</span>
        </div>
      </template>
    </SidebarComponent>

    <!-- Konten Utama Anda -->
    <main class="flex-1 p-6">
      <button @click="isMobileOpen = true" class="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
        <span class="material-symbols-outlined">menu</span>
      </button>
      <slot />
    </main>
  </div>
</template>
```

---

## 🚀 2. Penggunaan Kerangka Lengkap (`DashboardLayout.vue`)

Gunakan jika Anda menginginkan tata letak dasbor instan siap pakai dengan bilah atas (*topbar*), pencarian global, lonceng notifikasi, pengalih mode gelap/terang, dan menu akun profil:

```vue
<script setup>
import DashboardLayout from '@/Layouts/DashboardLayout.vue';
// Bisa juga diimpor dari '@/Components/Pack/DashboardLayout.vue'

const menuItems = [
    { heading: 'NAVIGASI' },
    { label: 'Dashboard', icon: 'dashboard', href: '/dashboard', active: true },
    { label: 'Pesanan', icon: 'shopping_bag', href: '/orders', badge: '5' },
    { label: 'Pelanggan', icon: 'group', href: '/customers' },
];

const breadcrumbs = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Pesanan' }
];

const currentUser = {
    name: 'Budi Santoso',
    email: 'budi@tokomerchant.id',
    role: 'Store Owner',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
};
</script>

<template>
  <DashboardLayout
    :items="menuItems"
    brand-name="MerchantPro"
    brand-sub="Panel Pengelola Toko"
    color-theme="primary"
    sidebar-variant="bordered"
    sidebar-item-style="soft"
    sidebar-radius="lg"
    :breadcrumbs="breadcrumbs"
    :user="currentUser"
    :notification-count="3"
    @search="(q) => console.log('Mencari:', q)"
    @logout="() => console.log('Logout ditekan')"
  >
    <!-- Slot Aksi Tambahan di Header Halaman -->
    <template #page-actions>
      <button class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">
        + Buat Pesanan
      </button>
    </template>

    <!-- Konten Halaman Dasbor -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h3 class="text-sm font-semibold text-slate-500">Total Penjualan</h3>
        <p class="text-2xl font-bold mt-1 text-slate-900 dark:text-white">Rp 28.500.000</p>
      </div>
    </div>
  </DashboardLayout>
</template>
```

---

## 📋 Props API `<SidebarComponent />` (atau `<Sidebar />`)

| Prop | Tipe Data | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `items` | `Array` | `[]` | Struktur array menu navigasi bertingkat |
| `colorTheme` | `String` | `'primary'` | Skema warna: `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'` |
| `itemStyle` | `String` | `'soft'` | Gaya item menu: `'soft'`, `'solid'`, `'outline'` |
| `radius` | `String` | `'lg'` | Bentuk sudut item: `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'full'` |
| `variant` | `String` | `'default'` | Gaya wadah sidebar: `'default'`, `'bordered'`, `'floating'` |
| `size` | `String` | `'md'` | Ukuran skala tinggi dan padding item: `'sm'`, `'md'`, `'lg'` |
| `collapsed` | `Boolean` | `false` | Status ciut sidebar (*mendukung `v-model:collapsed`*) |
| `collapsible` | `Boolean` | `true` | Mengaktifkan tombol toggle untuk menciutkan sidebar |
| `floatingToggle`| `Boolean` | `true` | Tombol lingkaran melayang di tepi kanan sidebar untuk collapse cepat |
| `width` | `String` | `'64'` | Lebar sidebar saat terbuka: `'56'`, `'64'` (256px), `'72'`, `'80'` |
| `collapsedWidth`| `String` | `'16'` | Lebar sidebar saat ciut: `'14'`, `'16'` (64px), `'18'`, `'20'` |
| `showLogo` | `Boolean` | `true` | Menampilkan area header logo di bagian atas |
| `showFooter` | `Boolean` | `false` | Menampilkan area footer bawah sidebar |
| `mobileBreakpoint`| `Number` | `768` | Batas piksel layar (default `768px` / `md:`) untuk beralih ke mobile drawer |
| `mobileOpen` | `Boolean` | `false` | Status buka drawer mobile (*mendukung `v-model:mobileOpen`*) |
| `activeRoute` | `String` | `''` | URL path aktif untuk penandaan otomatis status menu aktif |

---

## 📋 Props API `<DashboardLayout />`

| Prop | Tipe Data | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `items` | `Array` | `[]` | Data navigasi yang diteruskan ke sidebar |
| `colorTheme` | `String` | `'primary'` | Tema warna global untuk topbar dan sidebar |
| `sidebarVariant`| `String` | `'bordered'` | Varian sidebar (`'default'`, `'bordered'`, `'floating'`) |
| `sidebarItemStyle`| `String` | `'soft'` | Gaya item navigasi (`'soft'`, `'solid'`, `'outline'`) |
| `sidebarRadius` | `String` | `'lg'` | Radius item navigasi (`'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'full'`) |
| `sidebarSize` | `String` | `'md'` | Ukuran item navigasi (`'sm'`, `'md'`, `'lg'`) |
| `brandName` | `String` | `'Pack UI'` | Nama aplikasi di header dan topbar |
| `brandSub` | `String` | `'Dashboard'` | Deskripsi singkat sub-nama aplikasi |
| `breadcrumbs` | `Array` | `[]` | Array breadcrumb `[{ label: 'Home', href: '/' }, { label: 'Detail' }]` |
| `user` | `Object` | `null` | Objek user `{ name, email, avatar, role }` |
| `showSearch` | `Boolean` | `true` | Menampilkan tombol pencarian global `⌘K` |
| `showNotifications`| `Boolean`| `true` | Menampilkan lonceng notifikasi di topbar |
| `notificationCount`| `Number`| `0` | Angka badge notifikasi belum terbaca |
| `showThemeToggle` | `Boolean`| `true` | Menampilkan tombol saklar tema Gelap/Terang |
| `showFooter` | `Boolean` | `true` | Menampilkan footer dasbor di bagian bawah |
| `footerText` | `String` | `'© 2026 ...'` | Teks hak cipta footer |
| `footerVersion`| `String` | `'v1.0.0'` | Teks versi aplikasi di footer |

---

## 🧩 Struktur Objek Item Navigasi (`items`)

```javascript
[
    { heading: 'SEKSI MENU' },
    { 
        label: 'Dashboard', 
        icon: 'dashboard', 
        href: '/dashboard', 
        active: true 
    },
    {
        label: 'Transaksi',
        icon: 'receipt_long',
        badge: '12',
        badgeVariant: 'warning', // 'primary' | 'success' | 'warning' | 'danger' | 'info'
        children: [
            { label: 'Semua', href: '/transactions' },
            { 
                label: 'Virtual Account', 
                children: [
                    { label: 'BCA Direct', href: '/va/bca' },
                    { label: 'Mandiri Direct', href: '/va/mandiri' }
                ]
            }
        ]
    },
    { separator: true },
    { label: 'Pengaturan', icon: 'settings', href: '/settings' }
]
```

---

## 🪟 Slots API

### Slot `<SidebarComponent />`:
- `#logo`: Menyesuaikan logo saat sidebar terbuka.
- `#logo-collapsed`: Menyesuaikan logo saat sidebar ciut.
- `#header-extra`: Komponen tambahan di header samping logo.
- `#footer`: Konten footer sidebar desktop.
- `#mobile-footer`: Konten footer drawer mobile.

### Slot `<DashboardLayout />`:
- `#sidebar`: Menimpa sidebar default dengan sidebar kustom Anda.
- `#topbar-actions`: Menyisipkan aksi tambahan di bilah atas sebelum profil pengguna.
- `#page-header`: Menimpa seluruh area judul dan breadcrumb halaman.
- `#page-actions`: Menyisipkan tombol aksi di pojok kanan header halaman (misal: tombol Buat Baru, Export).
- `default`: Slot konten utama halaman dasbor.
- `#footer`: Menimpa footer bawaan layout.
