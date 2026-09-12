# 📑 Sidebar Component (`Sidebar.vue` & `SidebarItem.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen bilah navigasi samping (*navigation sidebar*) yang responsif dengan dukungan menu bertingkat (*multi-level nested dropdown*), drawer mobile dengan latar belakang blur & scroll lock, tombol ciutkan melayang (*floating toggle button*), serta flyout popover menu saat mode ciut (*collapsed*).

---

## 🚀 Import & Penggunaan Dasar

```vue
<script setup>
import { ref } from 'vue';
import Sidebar from '@/Components/Pack/Sidebar.vue';

const isCollapsed = ref(false);
const isMobileOpen = ref(false);

const navigationMenu = [
    { heading: 'MENU UTAMA' },
    { label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
    {
        label: 'Transaksi',
        icon: 'receipt_long',
        badge: 'Baru',
        badgeVariant: 'success',
        children: [
            { label: 'Semua Transaksi', href: '/transactions' },
            { label: 'Menunggu Pembayaran', href: '/transactions/pending' },
            {
                label: 'Laporan Finansial',
                icon: 'analytics',
                children: [
                    { label: 'Harian', href: '/reports/daily' },
                    { label: 'Bulanan', href: '/reports/monthly' },
                ]
            }
        ]
    },
    { separator: true },
    { heading: 'PENGATURAN' },
    { label: 'Pengguna', icon: 'group', href: '/users' },
    { label: 'Konfigurasi Sistem', icon: 'tune', href: '/settings' },
];
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Tombol Hamburger Mobile -->
    <button @click="isMobileOpen = true" class="md:hidden p-2">
      <span class="material-symbols-outlined">menu</span>
    </button>

    <!-- Sidebar Reusable -->
    <Sidebar 
      :items="navigationMenu"
      v-model:collapsed="isCollapsed"
      v-model:mobile-open="isMobileOpen"
      variant="default"
    >
      <template #logo>
        <div class="flex items-center gap-2 px-2 py-1">
          <div class="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">P</div>
          <span class="font-bold text-slate-800 dark:text-white">Pack UI</span>
        </div>
      </template>
    </Sidebar>

    <!-- Konten Halaman -->
    <main class="flex-1 p-6">
      <slot />
    </main>
  </div>
</template>
```

---

## 📋 Props API (`<Sidebar />`)

| Prop | Tipe Data | Default | Pilihan Nilai / Deskripsi |
| :--- | :--- | :--- | :--- |
| `items` | `Array` | `[]` | Struktur array menu navigasi bertingkat |
| `collapsed` | `Boolean` | `false` | Status ciut sidebar (*mendukung `v-model:collapsed`*) |
| `collapsible` | `Boolean` | `true` | Mengaktifkan tombol toggle untuk menciutkan/melebarkan sidebar |
| `floatingToggle` | `Boolean` | `true` | Menampilkan tombol lingkaran melayang yang rapi tepat di garis tepi kanan sidebar |
| `width` | `String` | `'64'` | Lebar sidebar saat terbuka: `'56'`, `'64'` (256px), `'72'`, `'80'` |
| `collapsedWidth` | `String` | `'16'` | Lebar sidebar saat diciutkan: `'14'`, `'16'` (64px), `'18'`, `'20'` |
| `variant` | `String` | `'default'` | Gaya visual: `'default'`, `'bordered'`, `'floating'` (melayang dengan padding) |
| `showLogo` | `Boolean` | `true` | Menampilkan area header logo di bagian atas |
| `showFooter` | `Boolean` | `false` | Menampilkan area footer di bagian bawah |
| `mobileBreakpoint` | `Number` | `768` | Batas piksel layar (default `768px` / `md:`) untuk beralih ke mode mobile drawer |
| `mobileOpen` | `Boolean` | `false` | Mengontrol pembukaan drawer di layar mobile (*mendukung `v-model:mobileOpen`*) |
| `activeRoute` | `String` | `''` | URL path aktif untuk penandaan otomatis status menu aktif |

---

## 🧩 Struktur Objek Item Navigasi (`items`)

| Field | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `label` | `String` | Teks nama menu |
| `icon` | `String` | Nama Google Material Symbols |
| `href` | `String` | URL tautan navigasi Inertia Link |
| `badge` | `String \| Number` | Teks label/angka kecil di sebelah kanan menu (misal `'12'`, `'Baru'`) |
| `badgeVariant` | `String` | Varian warna badge: `'primary'`, `'success'`, `'warning'`, `'danger'`, `'info'` |
| `children` | `Array` | Sub-menu bertingkat (mendukung kedalaman tak terbatas / *recursive nesting*) |
| `heading` | `String` | Menjadikan item sebagai judul kategori/seksi teks kecil abu-abu |
| `separator` | `Boolean` | Menjadikan item sebagai garis pemisah horizontal |
| `active` | `Boolean` | Menandai menu aktif secara manual |
| `disabled` | `Boolean` | Menonaktifkan interaksi klik menu |

---

## 🔔 Events API (`<Sidebar />`)

| Event Name | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `@update:collapsed` | `value: Boolean` | Dipancarkan saat status ciut berubah |
| `@update:mobileOpen` | `value: Boolean` | Dipancarkan saat status mobile drawer dibuka/ditutup |
| `@navigate` | `item: Object` | Dipancarkan saat salah satu item menu diklik |

---

## 🪟 Slots API (`<Sidebar />`)

| Slot Name | Deskripsi |
| :--- | :--- |
| `logo` | Kustomisasi area logo dan identitas merek di bagian atas |
| `header` | Menggantikan seluruh kontainer header atas sidebar |
| `footer` | Area bawah sidebar (sangat ideal untuk foto profil user, tombol logout, atau tombol toggle tema) |

---

## 📱 Desain Khusus Mobile

Ketika dibuka di perangkat mobile (lebar layar di bawah `mobileBreakpoint`):
1. **Layar Latar Belakang (Backdrop)**: Menggunakan backdrop gelap dengan efek blur (`backdrop-blur-sm`).
2. **Body Scroll Lock**: Saat drawer terbuka, halaman utama di belakang otomatis dikunci agar tidak dapat di-scroll secara tak sengaja.
3. **Sentuhan di Luar Area**: Mengetuk di luar drawer mobile otomatis menutup navigasi.
