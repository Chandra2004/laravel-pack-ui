# 🗂️ Composable `useSidebar`

[← Kembali ke Dokumentasi Utama](../../README.md) | [Lihat Komponen Sidebar](../components/sidebar.md)

`useSidebar` adalah composable pengelola status reaktif bilah sisi (*sidebar state manager*) yang menangani status ciut (*collapsed*), drawer seluler (*mobile drawer*), persistensi otomatis ke `localStorage`, penguncian scroll layar (`body scroll-lock`), serta shortcut keyboard global (`Ctrl+B` / `⌘B`).

Composable ini menggunakan pola **Shared Global State (Singleton)** secara default sehingga tombol toggle di Topbar/Header luar dapat mengendalikan status Sidebar tanpa perlu mengoper props/events secara bertingkat (*prop-drilling*).

---

## 🚀 Import & Inisialisasi

```javascript
import { useSidebar } from '@/Composables/Pack/useSidebar';

const {
    isCollapsed,
    isMobileOpen,
    toggleCollapse,
    setCollapsed,
    openMobile,
    closeMobile,
    toggleMobile,
    setMobileOpen,
} = useSidebar({
    persistKey: 'my-app-sidebar', // Opsional: simpan preferensi ciut di localStorage
    enableShortcut: true,         // Opsional: aktifkan Ctrl+B / ⌘B (default: true)
    defaultCollapsed: false,      // Opsional: status awal (default: false)
    isolated: false,              // Opsional: jika true, buat instance state independen lokal
});
```

---

## ⚙️ Opsi Konfigurasi (`options`)

| Opsi | Tipe | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `persistKey` | `String \| null` | `null` | Kunci penyimpanan di `localStorage` untuk mengingat status ciut pengguna. Jika `null`, state hanya tersimpan di memori runtime. |
| `defaultCollapsed` | `Boolean` | `false` | Nilai awal status ciut jika belum ada data yang tersimpan di `localStorage`. |
| `enableShortcut` | `Boolean` | `true` | Mendaftarkan listener keyboard global `Ctrl+B` / `⌘+B` untuk menciutkan / membuka sidebar. |
| `isolated` | `Boolean` | `false` | Jika `true`, membuat state lokal baru yang terisolasi dan tidak berbagi state dengan pemanggilan `useSidebar()` di tempat lain. |

---

## 📋 Daftar API & Method

| Properti / Method | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `isCollapsed` | `Ref<Boolean>` | State reaktif apakah sidebar sedang dalam mode ciut (*icon-only*). |
| `isMobileOpen` | `Ref<Boolean>` | State reaktif apakah drawer navigasi seluler sedang terbuka. |
| `toggleCollapse(forceVal?)` | `(forceVal?: boolean) => void` | Membalikkan status ciut desktop, atau menyetelnya secara eksplisit jika `forceVal` diberikan. |
| `setCollapsed(val)` | `(val: boolean) => void` | Menyetel status ciut desktop secara eksplisit (`true` / `false`). |
| `openMobile()` | `() => void` | Membuka drawer navigasi seluler dan mengunci scroll `document.body`. |
| `closeMobile()` | `() => void` | Menutup drawer navigasi seluler dan membuka kembali scroll `document.body`. |
| `toggleMobile(forceVal?)` | `(forceVal?: boolean) => void` | Membalikkan status drawer seluler. |
| `setMobileOpen(val)` | `(val: boolean) => void` | Menyetel status drawer seluler secara eksplisit (`true` / `false`). |

---

## 💡 Contoh Penggunaan

### 1. Tombol Hamburger di Header/Topbar Luar

Jika Anda memiliki Header navigasi terpisah di luar sidebar, Anda dapat membuka drawer seluler atau menciutkan sidebar desktop tanpa perlu *event emit*:

```vue
<!-- AppHeader.vue -->
<script setup>
import { useSidebar } from '@/Composables/Pack/useSidebar';

const { toggleCollapse, openMobile, isCollapsed } = useSidebar();
</script>

<template>
  <header class="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 justify-between">
    <div class="flex items-center gap-2">
      <!-- Tombol Mobile Drawer (Hanya tampil di HP) -->
      <button 
        @click="openMobile" 
        class="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
      >
        <span class="material-symbols-outlined">menu</span>
      </button>

      <!-- Tombol Collapse Desktop (Tampil di Desktop) -->
      <button 
        @click="toggleCollapse()" 
        class="hidden md:flex p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
      >
        <span class="material-symbols-outlined">
          {{ isCollapsed ? 'menu_open' : 'menu' }}
        </span>
      </button>

      <span class="font-bold text-slate-800 dark:text-white">Aplikasi Saya</span>
    </div>
  </header>
</template>
```

### 2. Terintegrasi dengan Komponen `<Sidebar />`

```vue
<!-- AppLayout.vue -->
<script setup>
import { useSidebar } from '@/Composables/Pack/useSidebar';
import Sidebar from '@/Components/Pack/Sidebar.vue';

const { isCollapsed, isMobileOpen } = useSidebar({
    persistKey: 'app-sidebar-state',
});

const menuItems = [
    { label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
    { label: 'Laporan', icon: 'bar_chart', href: '/reports' },
];
</script>

<template>
  <div class="flex min-h-screen">
    <!-- State v-model langsung tersinkronisasi dengan useSidebar -->
    <Sidebar
      :items="menuItems"
      v-model:collapsed="isCollapsed"
      v-model:mobile-open="isMobileOpen"
    />

    <main class="flex-1 p-6">
      <slot />
    </main>
  </div>
</template>
```
