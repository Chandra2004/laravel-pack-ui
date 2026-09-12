# 📑 Tabs Component (`Tabs.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen navigasi tab reaktif serbaguna (*responsive tabs*) yang dirancang untuk memecah form panjang, dashboard analitik, dan halaman pengaturan menjadi panel-panel konten modular. Dilengkapi dukungan Google Material Symbols, badge counter, 4 varian visual, orientasi vertikal/horizontal, serta navigasi keyboard (aksesibilitas ARIA).

---

## 🚀 Import & Penggunaan Dasar

Semua komponen dapat langsung di-import menggunakan path alias `@/Components/Pack/Tabs.vue`:

```vue
<script setup>
import { ref } from 'vue';
import Tabs from '@/Components/Pack/Tabs.vue';

const activeTab = ref('overview');

const tabsList = [
  { id: 'overview', label: 'Ringkasan', icon: 'dashboard' },
  { id: 'transactions', label: 'Transaksi', icon: 'receipt_long', badge: '14', badgeVariant: 'primary' },
  { id: 'settings', label: 'Pengaturan', icon: 'settings' },
];
</script>

<template>
  <Tabs :tabs="tabsList" v-model="activeTab">
    <!-- Konten per Tab ID menggunakan Named Slot -->
    <template #overview>
      <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <p class="text-sm text-slate-600 dark:text-slate-300">Konten Ringkasan Dashboard.</p>
      </div>
    </template>

    <template #transactions>
      <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <p class="text-sm text-slate-600 dark:text-slate-300">Daftar riwayat 14 transaksi terkini.</p>
      </div>
    </template>

    <template #settings>
      <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <p class="text-sm text-slate-600 dark:text-slate-300">Form konfigurasi akun merchant.</p>
      </div>
    </template>
  </Tabs>
</template>
```

---

## 📋 Props API (`<Tabs />`)

| Prop | Tipe Data | Default | Pilihan Nilai / Deskripsi |
| :--- | :--- | :--- | :--- |
| `tabs` | `Array` | **Wajib** | Daftar tab. Format objek: `{ id, label, icon, badge, badgeVariant, disabled }` atau array string: `['Tab A', 'Tab B']` |
| `modelValue` | `String` \| `Number` | `null` | ID tab yang sedang aktif (*mendukung `v-model`*) |
| `variant` | `String` | `'underline'` | Gaya visual tab bar: `'underline'`, `'pills'`, `'segmented'`, `'enclosed'` |
| `orientation` | `String` | `'horizontal'` | Orientasi susunan tab: `'horizontal'`, `'vertical'` |
| `size` | `String` | `'md'` | Skala ukuran tombol & teks tab: `'sm'`, `'md'`, `'lg'` |
| `color` | `String` | `'blue'` | Aksen warna aktif: `'blue'`, `'indigo'`, `'emerald'`, `'violet'`, `'amber'`, `'rose'`, `'slate'` |
| `fullWidth` | `Boolean` | `false` | Meratakan tab membentang memenuhi lebar kontainer (*flex-1*) |
| `align` | `String` | `'left'` | Perataan tab horizontal: `'left'`, `'center'`, `'right'` |
| `showIcon` | `Boolean` | `true` | Menampilkan ikon Google Material Symbols jika didefinisikan pada tab |
| `showBadge` | `Boolean` | `true` | Menampilkan badge label/counter jika didefinisikan pada tab |
| `lazy` | `Boolean` | `false` | Jika `true`, panel konten yang tidak aktif tidak akan di-render ke DOM |

---

## 🎨 Pilihan Varian Gaya (`variant`)

### 1. Varian `underline` (Garis Bawah Aktif - Standar Dashboard)
Cocok untuk navigasi utama di halaman master data, profil, atau detail pesanan:
```vue
<Tabs :tabs="myTabs" variant="underline" color="indigo" />
```

### 2. Varian `pills` (Tombol Kapsul Modern)
Tombol oval dengan latar belakang warna solid ketika aktif:
```vue
<Tabs :tabs="myTabs" variant="pills" color="emerald" />
```

### 3. Varian `segmented` (Segmented Control Pill)
Tombol tab berada di dalam wadah berlatar abu-abu netral (`bg-slate-100 dark:bg-slate-800`), mirip toggle iOS / macOS:
```vue
<Tabs :tabs="myTabs" variant="segmented" color="blue" />
```

### 4. Varian `enclosed` (Tab Boxed / Folders)
Desain tab yang menyatu langsung dengan batas atas kartu konten di bawahnya:
```vue
<Tabs :tabs="myTabs" variant="enclosed" color="slate" />
```

---

## ↕️ Orientasi Vertikal (`orientation="vertical"`)

Sangat ideal untuk halaman **Pengaturan / Akun (Settings Page)** dengan sidebar menu di kiri dan formulir di kanan:

```vue
<Tabs
  :tabs="[
    { id: 'profile', label: 'Profil Saya', icon: 'person' },
    { id: 'security', label: 'Keamanan & 2FA', icon: 'lock' },
    { id: 'notifications', label: 'Preferensi Notifikasi', icon: 'notifications' },
    { id: 'billing', label: 'Metode Pembayaran', icon: 'credit_card' },
  ]"
  orientation="vertical"
  variant="underline"
  color="blue"
>
  <template #profile>
    <div class="space-y-4">
      <h3 class="font-bold text-base">Informasi Biodata</h3>
      <!-- Form InputField -->
    </div>
  </template>

  <template #security>
    <div class="space-y-4">
      <h3 class="font-bold text-base">Ubah Kata Sandi</h3>
      <!-- Form Password -->
    </div>
  </template>
</Tabs>
```

---

## 🧩 Slots API

| Slot Name | Parameter Slot | Penjelasan |
| :--- | :--- | :--- |
| `[tab.id]` | `{ tab, active, index }` | Named slot dinamis untuk merender isi panel per-ID tab (*contoh: `#overview`, `#security`*) |
| `default` | `{ tab, activeTab, activeIndex }` | Fallback slot umum jika named slot tidak disediakan |
| `tab` | `{ tab, active, index }` | Kustomisasi elemen tombol tab (menggantikan icon & label default) |
| `extra` | — | Konten tambahan di sisi kanan header tab horizontal (misal: tombol CTA) |

---

## 📢 Events

| Event Name | Parameter | Penjelasan |
| :--- | :--- | :--- |
| `update:modelValue` | `tabId: String \| Number` | Dipancarkan saat tab aktif berubah (*v-model*) |
| `change` | `{ tab: Object, index: Number }` | Dipancarkan saat pengguna mengklik tab aktif baru |

---

## ♿ Aksesibilitas & Keyboard Navigation

* Komponen telah menerapkan standar atribut WAI-ARIA (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `role="tabpanel"`).
* **Navigasi Panah Keyboard**:
  * Orientasi horizontal: Panah Kiri (`ArrowLeft`) & Kanan (`ArrowRight`) berpindah antar tab.
  * Orientasi vertikal: Panah Atas (`ArrowUp`) & Bawah (`ArrowDown`) berpindah antar tab.
  * Tombol `Home` melompat ke tab pertama, tombol `End` melompat ke tab terakhir.
  * Tab dengan status `disabled: true` otomatis dilewati saat navigasi keyboard.
