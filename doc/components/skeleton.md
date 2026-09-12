# 💀 Skeleton Component (`Skeleton.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen kerangka pemuatan (*skeleton placeholder loader*) yang digunakan untuk menampilkan representasi bentuk konten saat data masih diambil dari server. Dilengkapi dengan animasi shimmer wave modern, varian bentuk lengkap, dan generator multi-baris otomatis.

---

## 🚀 Import & Penggunaan Dasar

```vue
<script setup>
import Skeleton from '@/Components/Pack/Skeleton.vue';
</script>

<template>
  <!-- 1. Skeleton Teks Paragraf 3 Baris -->
  <Skeleton variant="text" :lines="3" />

  <!-- 2. Skeleton Avatar Bulat -->
  <Skeleton variant="circular" size="lg" animation="wave" />

  <!-- 3. Skeleton Kotak Gambar Banner -->
  <Skeleton variant="rounded" width="100%" height="180px" />
</template>
```

---

## 📋 Props API (`<Skeleton />`)

| Prop | Tipe Data | Default | Pilihan Nilai / Deskripsi |
| :--- | :--- | :--- | :--- |
| `variant` | `String` | `'text'` | Bentuk dasar kerangka: `'text'` (baris teks), `'circular'` (lingkaran), `'rectangular'` (persegi tajam), `'rounded'` (persegi sudut melengkung) |
| `width` | `String` | `''` | Lebar elemen (misal `'100%'`, `'240px'`, `'w-48'`) |
| `height` | `String` | `''` | Tinggi elemen (misal `'40px'`, `'12rem'`, `'h-6'`) |
| `lines` | `Number` | `1` | Jumlah baris kerangka teks yang akan dibuat secara berulang |
| `lineSpacing` | `String` | `'3'` | Jarak spasi antar baris ketika `lines > 1`: `'2'`, `'3'`, `'4'` |
| `lastLineWidth` | `String` | `'70%'` | Lebar baris terakhir paragraf agar menyerupai teks asli yang tidak penuh |
| `animation` | `String` | `'pulse'` | Jenis efek animasi pemuatan: `'pulse'` (redup-terang lembut), `'wave'` (efek kilau shimmer menyapu), `'none'` (tanpa animasi) |
| `size` | `String` | `'md'` | Pilihan ukuran terstandarisasi: `'sm'`, `'md'`, `'lg'` |

---

## 💡 Pola Penerapan Skeleton yang Lazim

### 1. Kartu Profil Pengguna (Avatar + Teks)
```vue
<div class="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
  <!-- Lingkaran Avatar -->
  <Skeleton variant="circular" size="md" animation="wave" />

  <div class="flex-1 space-y-2">
    <!-- Baris Nama -->
    <Skeleton variant="text" width="50%" size="sm" animation="wave" />
    <!-- Baris Email/Jabatan -->
    <Skeleton variant="text" width="30%" size="xs" animation="wave" />
  </div>
</div>
```

### 2. Kartu Produk / Blog (Hero Image + Judul + Paragraf)
```vue
<div class="w-72 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-white dark:bg-slate-900">
  <!-- Gambar Thumbnail -->
  <Skeleton variant="rounded" height="140px" animation="pulse" />

  <!-- Judul Artikel -->
  <Skeleton variant="text" width="80%" size="lg" />

  <!-- Paragraf Ringkasan -->
  <Skeleton variant="text" :lines="3" size="sm" line-spacing="2" />
</div>
```

### 3. Baris Tabel Data (Table Row Skeleton)
```vue
<tr v-for="i in 5" :key="i" class="border-b border-slate-100 dark:border-slate-800">
  <td class="p-3"><Skeleton variant="text" width="24px" /></td>
  <td class="p-3"><Skeleton variant="text" width="120px" /></td>
  <td class="p-3"><Skeleton variant="text" width="80px" /></td>
  <td class="p-3"><Skeleton variant="circular" size="sm" /></td>
</tr>
```
