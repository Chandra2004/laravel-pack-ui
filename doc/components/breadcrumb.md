# 🧭 Breadcrumb Component (`Breadcrumb.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen penunjuk jalur navigasi (*breadcrumb navigation*) yang responsif, terintegrasi penuh dengan Inertia Link, serta dirancang dengan penjajaran (*alignment*) vertikal dan horizontal yang presisi antara teks huruf dan ikon Google Material Symbols.

---

## 🚀 Import & Penggunaan Dasar

```vue
<script setup>
import Breadcrumb from '@/Components/Pack/Breadcrumb.vue';

const navItems = [
    { label: 'Beranda', href: '/' },
    { label: 'Manajemen Produk', href: '/products' },
    { label: 'Kategori Elektronik', href: '/products/category/electronics' },
    { label: 'Edit Laptop Asus ROG', active: true },
];
</script>

<template>
  <Breadcrumb :items="navItems" />
</template>
```

---

## 📋 Props API (`<Breadcrumb />`)

| Prop | Tipe Data | Default | Pilihan Nilai / Deskripsi |
| :--- | :--- | :--- | :--- |
| `items` | `Array` | `[]` | Daftar item navigasi: `[{ label, href, icon, active }]` |
| `separator` | `String` | `'chevron_right'` | Karakter pemisah atau nama Google Material Icon (misal `'chevron_right'`, `'arrow_forward_ios'`, `'/'`, `'>'`) |
| `homeIcon` | `String` | `'home'` | Nama ikon Google Material Symbols untuk item pertama / beranda |
| `showHome` | `Boolean` | `true` | Menampilkan ikon rumah pada item pertama |
| `showHomeLabel` | `Boolean` | `false` | Menampilkan label teks di samping ikon rumah item pertama |
| `maxItems` | `Number` | `0` | Jumlah maksimal item yang tampil. Jika total item melebihi angka ini, item di tengah otomatis diringkas menjadi titik-titik `...` (`0` = tampilkan semua) |

---

## 🧩 Struktur Objek Item (`items`)

Setiap elemen dalam array `items` mendukung properti berikut:

```javascript
{
    label: 'Nama Halaman',    // Teks judul link (Wajib)
    href: '/url-tujuan',      // URL tujuan (Opsional, jika kosong akan dirender sebagai teks biasa)
    icon: 'folder',           // Ikon khusus item tersebut (Opsional)
    active: false,            // Status aktif/halaman saat ini (Otomatis diberi warna aksen tebal)
}
```

---

## 🪟 Slots API (`<Breadcrumb />`)

| Slot Name | Props Slot | Deskripsi |
| :--- | :--- | :--- |
| `item` | `{ item, index, isLast }` | Kustomisasi tampilan link / elemen item tertentu |
| `separator` | `{ separator }` | Kustomisasi elemen pemisah antar item |

---

## 💡 Ragam Contoh Penggunaan

### 1. Breadcrumb dengan Separator Karakter Garis Miring
```vue
<Breadcrumb 
  :items="[
    { label: 'Home', href: '/' },
    { label: 'Pengaturan', href: '/settings' },
    { label: 'Keamanan Akun', active: true }
  ]"
  separator="/"
  show-home-label
/>
```

### 2. Auto-Collapse untuk Struktur Folder Sangat Dalam
```vue
<!-- Menampilkan maksimal 3 item: item pertama, ellipsis (...), dan 2 item terakhir -->
<Breadcrumb 
  :items="[
    { label: 'Home', href: '/' },
    { label: 'Dokumen', href: '/docs' },
    { label: 'Keuangan', href: '/docs/finance' },
    { label: 'Tahun 2026', href: '/docs/finance/2026' },
    { label: 'Kuartal 1', href: '/docs/finance/2026/q1' },
    { label: 'Laporan Pajak.pdf', active: true }
  ]"
  :max-items="3"
/>
```

### 3. Slot Kustom Item dengan Tag Badge
```vue
<Breadcrumb :items="navItems">
  <template #item="{ item, isLast }">
    <span v-if="isLast" class="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
      <span class="material-symbols-outlined text-[16px]">pin_drop</span>
      {{ item.label }}
    </span>
  </template>
</Breadcrumb>
```
