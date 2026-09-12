# 🃏 Card Component (`Card.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen kontainer kartu universal (*card container*) dengan desain modern, sudut membulat, bayangan halus, serta dilengkapi fitur lipat (*collapsible*) dengan animasi transisi yang mulus, status loading overlay, dan fleksibilitas slot.

---

## 🚀 Import & Penggunaan Dasar

```vue
<script setup>
import { ref } from 'vue';
import Card from '@/Components/Pack/Card.vue';

const isCollapsed = ref(false);
const isLoading = ref(false);
</script>

<template>
  <Card 
    title="Ringkasan Penjualan" 
    subtitle="Data transaksi selama 30 hari terakhir" 
    icon="analytics"
    variant="default"
  >
    <div class="space-y-4">
      <p class="text-sm text-slate-600 dark:text-slate-400">Total Transaksi: Rp 45.000.000</p>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <button class="text-xs font-semibold text-blue-600 hover:underline">Unduh Laporan PDF</button>
      </div>
    </template>
  </Card>
</template>
```

---

## 📋 Props API (`<Card />`)

| Prop | Tipe Data | Default | Pilihan Nilai / Deskripsi |
| :--- | :--- | :--- | :--- |
| `title` | `String` | `''` | Judul kartu |
| `subtitle` | `String` | `''` | Sub-judul atau deskripsi singkat di bawah judul |
| `icon` | `String` | `''` | Nama Google Material Symbols di sebelah kiri judul |
| `variant` | `String` | `'default'` | Gaya visual kartu: `'default'` (border halus + soft shadow), `'bordered'` (tepi tegas tanpa bayangan), `'elevated'` (bayangan menonjol), `'flat'` (latar datar polos) |
| `padding` | `String` | `'md'` | Ukuran ruang dalam bodi kartu: `'none'`, `'sm'`, `'md'`, `'lg'` |
| `rounded` | `String` | `'2xl'` | Kelengkungan sudut: `'none'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'` |
| `collapsible` | `Boolean` | `false` | Mengaktifkan tombol ciutkan/lebarkan konten kartu |
| `collapsed` | `Boolean` | `false` | Status awal apakah bodi kartu sedang terlipat (*mendukung `v-model:collapsed`*) |
| `loading` | `Boolean` | `false` | Menampilkan efek overlay loading spinner di atas konten kartu |
| `hoverable` | `Boolean` | `false` | Memberikan efek angkat kartu (*elevate & border accent*) saat kursor diarahkan |
| `clickable` | `Boolean` | `false` | Menjadikan seluruh permukaan kartu dapat diklik (`cursor-pointer`) |
| `showHeader` | `Boolean` | `true` | Mengatur visibilitas area header |
| `showFooter` | `Boolean` | `true` | Mengatur visibilitas area footer |

---

## 🔔 Events API (`<Card />`)

| Event Name | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `@click` | `event: MouseEvent` | Dipancarkan saat kartu diklik (berfungsi jika `clickable="true"`) |
| `@update:collapsed` | `value: Boolean` | Dipancarkan saat status lipat berubah (sinkronisasi dua arah `v-model:collapsed`) |

---

## 🪟 Slots API (`<Card />`)

| Slot Name | Props Slot | Deskripsi |
| :--- | :--- | :--- |
| `default` | — | Konten utama di dalam bodi kartu |
| `header` | — | Menggantikan seluruh blok area header kartu |
| `title` | — | Kustomisasi teks/elemen judul |
| `subtitle` | — | Kustomisasi teks/elemen sub-judul |
| `action` | — | Area tombol aksi di sisi kanan header (misal tombol refresh, dropdown menu) |
| `footer` | — | Area kaki kartu di bagian bawah |

---

## 💡 Ragam Contoh Penggunaan

### 1. Card Collapsible (Bisa Dilipat)
```vue
<Card 
  title="Pengaturan Notifikasi Email" 
  subtitle="Kelola frekuensi pengiriman ringkasan mingguan" 
  collapsible
  v-model:collapsed="isCollapsed"
>
  <div class="space-y-3 py-2">
    <label class="flex items-center gap-2">
      <input type="checkbox" checked /> Kirim notifikasi transaksi baru
    </label>
    <label class="flex items-center gap-2">
      <input type="checkbox" /> Kirim newsletter bulanan
    </label>
  </div>
</Card>
```

### 2. Card dengan Status Loading Overlay
```vue
<Card title="Statistik Server" :loading="isLoading">
  <div class="h-32 flex items-center justify-center">
    <p>Grafik penggunaan CPU dan RAM</p>
  </div>
</Card>
```

### 3. Card dengan Slot Action di Sisi Kanan Header
```vue
<Card title="Daftar Tagihan Pelanggan" icon="receipt_long">
  <template #action>
    <button class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
      + Tagihan Baru
    </button>
  </template>

  <p>Isi tabel atau data tagihan...</p>
</Card>
```

