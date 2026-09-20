# 📑 Sidebar (`SidebarComponent.vue` / `Sidebar.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md) | [Lihat Composable useSidebar](../composables/use-sidebar.md)

`Sidebar.vue` (dan `SidebarComponent.vue`) adalah komponen bilah navigasi samping (*vertical navigation bar*) enterprise dengan arsitektur **Dual-API**:

1. **Compound Components (Deklaratif)**: Penggunaan modular yang intuitif via subkomponen (`SidebarHeader`, `SidebarNav`, `SidebarGroup`, `SidebarItem`, `SidebarFooter`, `SidebarToggle`).
2. **Config-Driven (Array-based)**: Penggunaan berbasis konfigurasi array `:items="[...]"`, 100% *backward-compatible*.

Komponen ini dirancang untuk bekerja secara mandiri (*standalone*) maupun diintegrasikan ke dalam layout kustom dengan state manager reaktif [**`useSidebar.js`**](../composables/use-sidebar.md).

> [!TIP]
> Jika Anda membutuhkan kerangka tata letak dasbor lengkap yang sudah mengintegrasikan Sidebar bersama Topbar, Search ⌘K, Notifikasi, Breadcrumb, dan Profil Pengguna, silakan gunakan [**UIDashboardLayout.vue**](../layouts/ui-dashboard-layout.md).

---

## 🎨 5 Pilar Kustomisasi Terapan

1. **Warna (`colorTheme` / `color`)**:
   - `primary` (Blue), `indigo`, `emerald`, `purple`, `amber`, `rose`, `cyan`, `dark`.
   - Otomatis dialirkan (*injected*) ke seluruh sub-komponen anak tanpa *prop-drilling*.
2. **Bentuk & Gaya (`radius`, `itemStyle`, `variant`)**:
   - **Radius**: `none`, `sm`, `md`, `lg` (default), `xl`, `full`.
   - **Item Style**:
     - `soft`: Background transparan lembut dengan teks aksen berwarna.
     - `solid`: Background solid kontras tinggi dengan teks putih (efek fokus tajam).
     - `outline`: Border tipis berwarna dengan aksen lembut.
   - **Sidebar Variant**:
     - `default`: Tampilan klasik menempel tepi dengan border standar.
     - `bordered`: Border kanan dipertegas dengan shadow halus.
     - `floating`: Melayang bergaya kartu (*island layout*) dengan margin di sekelilingnya.
3. **Teks Konten**:
   - Judul kategori (`heading`/`title`), label menu, badge status/angka, teks profil footer.
   - Teks terpotong rapi (*truncate*) saat mode ciut (*collapsed*) dengan tooltip bawaan.
4. **Ikon**:
   - Google Material Symbols didukung penuh pada menu utama dan submenu.
   - Indikator ekspansi chevron berputar mulus (`transition-transform duration-200`).
   - Ukuran ikon otomatis berskala sesuai prop `size` (`sm`, `md`, `lg`).
5. **Responsif**:
   - Beralih mulus ke mode *Mobile Drawer* saat layar di bawah `mobileBreakpoint` (default `768px`).
   - Dilengkapi *backdrop blur*, penguncian scroll layar (`body scroll-lock`), dan penutupan otomatis saat klik luar (*click outside*).

---

## 🚀 Pola 1: Compound Components Deklaratif (Direkomendasikan)

Pola ini memberikan fleksibilitas tertinggi, mudah dibaca, dan modular:

```vue
<script setup>
import {
  Sidebar,
  SidebarHeader,
  SidebarNav,
  SidebarGroup,
  SidebarItem,
  SidebarFooter,
  SidebarToggle,
  useSidebar
} from '@/Components/Pack/Sidebar.vue';

const { isCollapsed, isMobileOpen } = useSidebar({
  persistKey: 'app-sidebar-pref',
});
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-slate-950">
    <Sidebar
      v-model:collapsed="isCollapsed"
      v-model:mobile-open="isMobileOpen"
      color="indigo"
      item-style="soft"
      radius="lg"
      variant="bordered"
    >
      <!-- Header / Brand -->
      <SidebarHeader title="Acme Corp" subtitle="Admin Portal" icon="token" />

      <!-- Navigasi Menu -->
      <SidebarNav>
        <SidebarGroup title="Utama" />
        <SidebarItem label="Dashboard" icon="dashboard" href="/dashboard" :active="true" />
      
        <!-- Menu bertingkat (Submenu) dengan slot default -->
        <SidebarItem label="Transaksi" icon="receipt_long" badge="12" badge-variant="warning">
          <SidebarItem label="Semua Transaksi" href="/transactions" />
          <SidebarItem label="Menunggu Konfirmasi" href="/transactions/pending" badge="3" />
        </SidebarItem>

        <SidebarGroup title="Sistem" :separator="true" />
        <SidebarItem label="Pengaturan" icon="settings" href="/settings" />
      </SidebarNav>

      <!-- Footer Profil -->
      <SidebarFooter>
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
            JD
          </div>
          <div v-if="!isCollapsed" class="min-w-0 flex-1">
            <p class="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">John Doe</p>
            <p class="text-[11px] text-slate-500 truncate">Super Admin</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>

    <!-- Konten Utama Halaman -->
    <main class="flex-1 p-6">
      <SidebarToggle variant="button" mobile />
      <slot />
    </main>
  </div>
</template>
```

---

## ⚡ Pola 2: Config-Driven Array (`:items="[...]"`)

Cocok jika data menu berasal dari API backend atau konfigurasi JSON:

```vue
<script setup>
import { ref } from 'vue';
import Sidebar from '@/Components/Pack/Sidebar.vue';

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
    <Sidebar
      :items="menuItems"
      v-model:collapsed="isCollapsed"
      v-model:mobile-open="isMobileOpen"
      color="indigo"
      item-style="soft"
      radius="lg"
      variant="bordered"
      active-route="/dashboard"
    />

    <main class="flex-1 p-6">
      <slot />
    </main>
  </div>
</template>
```

---

## 📋 Props API `<Sidebar />` (`SidebarComponent.vue`)

| Prop                       | Tipe Data   | Default       | Deskripsi                                                                                                            |
| :------------------------- | :---------- | :------------ | :------------------------------------------------------------------------------------------------------------------- |
| `items`                  | `Array`   | `[]`        | Struktur array menu (opsional jika menggunakan slot anak deklaratif)                                                 |
| `color` / `colorTheme` | `String`  | `'primary'` | Tema warna:`'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'` |
| `itemStyle`              | `String`  | `'soft'`    | Gaya item menu:`'soft'`, `'solid'`, `'outline'`                                                                |
| `radius`                 | `String`  | `'lg'`      | Bentuk sudut item:`'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'full'`                                     |
| `variant`                | `String`  | `'default'` | Gaya wadah sidebar:`'default'`, `'bordered'`, `'floating'`                                                     |
| `size`                   | `String`  | `'md'`      | Ukuran item & ikon:`'sm'`, `'md'`, `'lg'`                                                                      |
| `collapsed`              | `Boolean` | `false`     | Status ciut sidebar (*mendukung `v-model:collapsed`*)                                                            |
| `collapsible`            | `Boolean` | `true`      | Menampilkan/mengaktifkan fitur ciut sidebar                                                                          |
| `floatingToggle`         | `Boolean` | `true`      | Tombol lingkaran melayang di tepi kanan sidebar desktop                                                              |
| `width`                  | `String`  | `'64'`      | Lebar sidebar saat terbuka:`'56'`, `'64'` (256px), `'72'`, `'80'`                                            |
| `collapsedWidth`         | `String`  | `'16'`      | Lebar sidebar saat ciut:`'14'`, `'16'` (64px), `'18'`, `'20'`                                                |
| `showLogo`               | `Boolean` | `true`      | Menampilkan area header logo default (jika tidak menggunakan slot)                                                   |
| `showFooter`             | `Boolean` | `false`     | Menampilkan area footer default                                                                                      |
| `mobileBreakpoint`       | `Number`  | `768`       | Batas breakpoint layar (px) untuk drawer seluler                                                                     |
| `mobileOpen`             | `Boolean` | `false`     | Status buka drawer seluler (*mendukung `v-model:mobileOpen`*)                                                    |
| `activeRoute`            | `String`  | `''`        | URL path aktif untuk pencocokan otomatis                                                                             |

---

## 🧩 Subkomponen API

### 1. `<SidebarHeader />`

Header bilah sisi yang adaptif terhadap status ciut.

- **Props**:
  - `title` (`String`, default: `'Pack UI'`): Judul aplikasi / merek.
  - `subtitle` (`String`, default: `''`): Subjudul atau deskripsi singkat.
  - `icon` (`String`, default: `'dashboard'`): Ikon Material Symbols jika tidak memakai slot logo.
  - `collapsed` (`Boolean`, default: `null`): Mengambil dari parent context secara otomatis.
- **Slots**:
  - `#default`: Kustomisasi logo/branding penuh saat sidebar terbuka.
  - `#collapsed`: Kustomisasi logo saat sidebar ciut.
  - `#actions`: Tombol aksi di sisi kanan header.

### 2. `<SidebarNav />`

Wadah scrollbar vertikal ramping (*thin custom scrollbar*) untuk menampung item menu.

### 3. `<SidebarGroup />`

Pemisah kategori menu navigasi.

- **Props**:
  - `title` (`String`, default: `''`): Label judul kategori huruf besar.
  - `separator` (`Boolean`, default: `false`): Menampilkan garis pembagi horizontal tipis di atasnya.

### 4. `<SidebarItem />`

Item menu interaktif dengan dukungan link href, active state, chevron berputar, dan slot submenu bersarang.

- **Props**:
  - `label` (`String`, default: `''`): Teks nama menu.
  - `icon` (`String`, default: `''`): Nama Google Material Symbols.
  - `href` (`String`, default: `''`): Tautan URL tujuan.
  - `active` (`Boolean`, default: `false`): Menandai menu sedang aktif.
  - `badge` (`String | Number`, default: `''`): Teks atau angka counter badge.
  - `badgeVariant` (`String`, default: `'primary'`): Varian badge (`primary`, `success`, `warning`, `danger`, `info`).
  - `badgeColor` (`String`, default: `''`): Kelas warna kustom badge Tailwind.
  - `item` (`Object`, default: `null`): Objek config item (mode backward-compatible).
  - `collapsedTooltip` (`String`, default: `''`): Tooltip saat menu diciutkan.
- **Slots**:
  - `#default`: Tempat menaruh komponen `<SidebarItem />` anak (submenu bertingkat).
  - `#badge`: Kustomisasi badge menu.

### 5. `<SidebarFooter />`

Wadah profil pengguna atau copyright di bagian bawah sidebar. Otomatis memiliki border atas dan penyesuaian padding saat ciut.

### 6. `<SidebarToggle />`

Tombol pemicu collapse atau mobile drawer serbaguna yang dapat diletakkan di dalam maupun di luar sidebar (misal di topbar).

- **Props**:
  - `variant` (`String`, default: `'icon'`): Gaya tombol (`'floating'`, `'icon'`, `'button'`).
  - `mobile` (`Boolean`, default: `false`): Jika `true`, tombol ini mengontrol drawer seluler bukan collapse desktop.
  - `label` (`String`, default: `''`): Teks label jika memakai variant `'button'`.

---

## 🪟 Slots API `<Sidebar />` (Root)

- `#default`: Area konten kustom (Compound Components atau elemen Vue apa pun).
- `#logo`: Menyesuaikan logo saat sidebar terbuka (mode konfigurasi).
- `#logo-collapsed`: Menyesuaikan logo saat sidebar ciut (mode konfigurasi).
- `#header-extra`: Komponen tambahan di header samping logo.
- `#footer`: Konten footer sidebar desktop.
- `#mobile-footer`: Konten footer drawer mobile.
