# 🏷️ Badge Component (`Badge.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen label status (*status pill / badge*) serbaguna yang dirancang untuk menandai status transaksi, peran pengguna (*user role*), kategori, serta tag interaktif yang dapat dihapus. Dilengkapi dukungan Google Material Symbols, 8 skema warna semantik, 4 varian visual, titik indikator status (*dot*), animasi denyut (*pulsing ping*), dan aksi penutupan (*removable close*).

---

## 🚀 Import & Penggunaan Dasar

Komponen dapat langsung di-import menggunakan path alias `@/Components/Pack/Badge.vue`:

```vue
<script setup>
import Badge from '@/Components/Pack/Badge.vue';
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <!-- Soft Badge Default -->
    <Badge color="success">Aktif</Badge>

    <!-- Badge dengan Titik Indikator & Animasi Ping (Live Indicator) -->
    <Badge color="warning" dot ping>Menunggu Pembayaran</Badge>

    <!-- Badge dengan Ikon Google -->
    <Badge color="danger" icon="error">Transaksi Gagal</Badge>

    <!-- Solid Badge -->
    <Badge variant="solid" color="primary">Lunas</Badge>
  </div>
</template>
```

---

## 📋 Props API (`<Badge />`)

| Prop | Tipe Data | Default | Pilihan Nilai / Deskripsi |
| :--- | :--- | :--- | :--- |
| `variant` | `String` | `'soft'` | Gaya visual: `'soft'` (latar pastel + border halus), `'solid'` (warna penuh), `'outline'` (tepi tegas transparan), `'dot'` (teks polos dengan titik status) |
| `color` | `String` | `'primary'` | Skema warna semantik: `'primary'` / `'blue'`, `'success'` / `'emerald'`, `'danger'` / `'rose'`, `'warning'` / `'amber'`, `'info'` / `'sky'`, `'purple'`, `'indigo'`, `'neutral'` / `'slate'` |
| `size` | `String` | `'md'` | Skala ukuran badge: `'xs'`, `'sm'`, `'md'`, `'lg'` |
| `rounded` | `String` | `'full'` | Kelengkungan sudut: `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'full'` (kapsul) |
| `dot` | `Boolean` | `false` | Menampilkan lingkaran titik status di sisi kiri teks |
| `ping` | `Boolean` | `false` | Menambahkan efek animasi denyut bergelombang (*pulsing ping*) pada titik status |
| `icon` | `String` | `''` | Nama ikon Google Material Symbols di sisi kiri teks |
| `removable` | `Boolean` | `false` | Menampilkan tombol 'x' untuk menghapus/menutup badge |
| `removeLabel` | `String` | `'Hapus badge'` | Atribut aria-label tombol hapus untuk aksesibilitas |
| `clickable` | `Boolean` | `false` | Memberikan efek hover dan pointer interaktif |
| `as` | `String` | `'span'` | Tag elemen HTML yang dirender: `'span'`, `'button'`, `'div'`, `'a'` |

---

## 🎨 Pilihan Varian Gaya (`variant`)

### 1. Varian `soft` (Standar Enterprise Dashboard)
Latar belakang lembut dengan teks kontras tinggi dan garis tepi tipis:
```vue
<Badge variant="soft" color="success">Transaksi Sukses</Badge>
<Badge variant="soft" color="danger">Pembayaran Ditolak</Badge>
<Badge variant="soft" color="warning">Dalam Antrean</Badge>
```

### 2. Varian `solid` (Warna Kontras Kuat)
Latar warna pekat dengan teks putih:
```vue
<Badge variant="solid" color="primary">Terverifikasi</Badge>
<Badge variant="solid" color="purple">Merchant VIP</Badge>
```

### 3. Varian `outline` (Garis Tepi Minimalis)
Latar transparan dengan batas tepi berwarna:
```vue
<Badge variant="outline" color="indigo">API Webhook</Badge>
```

### 4. Varian `dot` (Minimalist Status)
Teks tanpa background dengan titik indikator warna:
```vue
<Badge variant="dot" color="success">Sistem Normal</Badge>
<Badge variant="dot" color="danger" ping>Gangguan Gateway</Badge>
```

---

## 🔴 Status Dinamis & Denyut (*Live Ping Indicator*)

Sangat efektif untuk menampilkan status proses yang sedang berjalan atau data real-time:
```vue
<Badge color="success" dot ping size="sm">
  Online (Settlement Siap)
</Badge>

<Badge color="warning" dot ping size="sm">
  Memproses Dana...
</Badge>
```

---

## 🏷️ Removable Tag (Filter & Kategori)

Dapat digunakan sebagai filter aktif pada tabel yang bisa ditutup pengguna:
```vue
<script setup>
import { ref } from 'vue';
import Badge from '@/Components/Pack/Badge.vue';

const activeFilters = ref(['Bank BCA', 'Metode QRIS', 'Nominal > 500rb']);

const removeFilter = (index) => {
  activeFilters.value.splice(index, 1);
};
</script>

<template>
  <div class="flex gap-2">
    <Badge
      v-for="(filter, index) in activeFilters"
      :key="filter"
      color="neutral"
      removable
      @remove="removeFilter(index)"
    >
      {{ filter }}
    </Badge>
  </div>
</template>
```

---

## 🧩 Slots API

| Slot Name | Parameter | Penjelasan |
| :--- | :--- | :--- |
| `default` | — | Konten teks utama di dalam badge |
| `icon` | — | Kustomisasi elemen ikon di sisi kiri |

---

## 📢 Events

| Event Name | Parameter | Penjelasan |
| :--- | :--- | :--- |
| `click` | `(event: MouseEvent)` | Dipancarkan saat badge diklik (*jika prop `clickable` aktif*) |
| `remove` | `(event: MouseEvent)` | Dipancarkan saat tombol ikon hapus (*close*) diklik |
