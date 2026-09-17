# 🖼️ ProductGallery Component (`ProductGallery.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen galeri media dan produk modular (*Enterprise Product & Media Gallery*) berbasis Vue 3 dan Tailwind CSS v4 yang telah menerapkan **5 Pilar Standar UI (Warna, Bentuk, Teks Konten, Icon, & Responsif)**. Dirancang khusus untuk etalase e-commerce, showroom otomotif (mobil/motor), marketplace, dan listing properti. Dilengkapi penampil foto utama (*hero image*) dengan gestur usap sentuh mobile (*touch swipe*), sistem **Floating Badges** kaya (Icon + Judul + Penjelasan dengan alur alami **kebawah lalu kesamping**), bilah thumbnail berlabel caption kategori (*caption cards*), penghitung foto (*photo counter*), serta modal lightbox layar penuh (*zoom lightbox modal*).

---

## 🏛️ Penerapan 5 Pilar UI (`peraturan.md`)

1. **Warna (`colorTheme`)**:
   - Mendukung 8 tema warna resmi Pack UI: `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, dan `'dark'`.
   - Mengatur warna ring/border sorot aktif pada thumbnail serta aksen warna lencana badge dan tombol aksi.
   - Mendukung mode gelap (*dark mode*) dan terang (*light mode*) dengan kontras tinggi.

2. **Bentuk (`radius`, `aspectRatio`, `thumbnailsVariant`)**:
   - **`radius`**: Mengatur kelengkungan sudut kontainer hero dan thumbnail (`'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`, `'full'`).
   - **`aspectRatio`**: Pilihan rasio proporsional foto utama (`'aspect-video'`, `'aspect-16/10'`, `'aspect-4/3'`, `'aspect-square'`, atau custom).
   - **`thumbnailsVariant`**: Gaya thumbnail `'compact'` (strip ring minimalis) atau `'card'` (kartu dengan caption label gelap di bawah).

3. **Teks Konten & Floating Badges Kaya**:
   - **Floating Badges**: Setiap badge mendukung **Icon + Judul (`title`) + Penjelasan Deskriptif (`description`)**.
   - **Alur Tata Letak Badges (`badgeLayout="column"`)**: Mengalir **ke bawah (*vertical column*)** terlebih dahulu, kemudian secara otomatis membungkus **ke samping (*wrap sideways*)** saat ada lebih dari 1 badge sehingga tidak menutupi produk.
   - Kustomisasi teks counter foto, watermark showroom, serta label caption setiap thumbnail.
   - Scoped slot: `#badges`, `#badge="{ badge, index }"`, `#counter`, `#watermark`.

4. **Icon**:
   - Setiap badge mendukung ikon Google Material Symbols kustom (`'verified'`, `'eco'`, `'shield_with_heart'`, `'two_wheeler'`, `'speed'`, dll).
   - Ikon navigasi panah (`chevron_left`, `chevron_right`) dengan efek hover scale.
   - Ikon pembesar zoom modal (`zoom_in`, `fullscreen`) dan counter (`photo_camera`).

5. **Responsif & Gestur Sentuh Mobile**:
   - **Touch Swipe Gestures**: Pengguna smartphone dapat mengusap foto hero ke kiri/kanan (*swipe left/right*) untuk berpindah foto secara alami tanpa perlu menekan tombol panah kecil.
   - **Auto-Adapt Thumbnail**: Pada layar kecil (`< 768px`), posisi thumbnail samping (`left`/`right`) secara otomatis beradaptasi ke bawah (*bottom strip*) agar foto hero tidak tertekan menyempit.
   - Modal zoom Lightbox 100% responsif dengan kontrol pinch/drag/pan dan tombol keyboard panah & `Escape`.

---

## 🚀 Contoh Penggunaan

### 1. Showroom Otomotif dengan Badges Kaya (Icon + Judul + Penjelasan)

```vue
<script setup>
import { ref } from 'vue';
import ProductGallery from '@/Components/Pack/ProductGallery.vue';

const activePhoto = ref(0);

const carGallery = [
  { src: '/images/car-1.jpg', thumb: '/images/car-1-sm.jpg', label: 'DASHBOARD' },
  { src: '/images/car-2.jpg', thumb: '/images/car-2-sm.jpg', label: 'EKSTERIOR' },
  { src: '/images/car-3.jpg', thumb: '/images/car-3-sm.jpg', label: 'INTERIOR' },
  { src: '/images/car-4.jpg', thumb: '/images/car-4-sm.jpg', label: 'BAGASI' },
];

// Badges dengan Icon, Judul, dan Penjelasan (mengalir kebawah lalu kesamping)
const carBadges = [
  {
    title: 'SHOWROOM PRISTINE',
    description: 'Lulus inspeksi 160 titik uji kelayakan',
    icon: 'auto_awesome',
    colorTheme: 'dark',
  },
  {
    title: 'GARANSI RESMI 1 TAHUN',
    description: 'Perlindungan mesin, transmisi & AC',
    icon: 'shield_with_heart',
    colorTheme: 'emerald',
  },
  {
    title: 'TANGAN PERTAMA',
    description: 'Kilometer rendah orisinil terverifikasi',
    icon: 'verified',
    colorTheme: 'primary',
  },
];
</script>

<template>
  <ProductGallery
    v-model="activePhoto"
    :images="carGallery"
    thumbnails-variant="card"
    color-theme="amber"
    radius="2xl"
    :badges="carBadges"
    badge-layout="column"
    watermark="Galeri Resmi Dealer"
  />
</template>
```

### 2. Marketplace Motor dengan Multi-Badge Kebawah Lalu Kesamping

```vue
<script setup>
import { ref } from 'vue';
import ProductGallery from '@/Components/Pack/ProductGallery.vue';

const bikePhotos = [
  '/images/bike-1.jpg',
  '/images/bike-2.jpg',
  '/images/bike-3.jpg',
];

const bikeBadges = [
  {
    title: 'Servis Rutin AHASS',
    description: 'Buku servis & riwayat bengkel resmi lengkap',
    icon: 'verified',
    colorTheme: 'primary',
  },
  {
    title: '100% Bebas Asap',
    description: 'Lolos uji emisi standar EURO 4',
    icon: 'eco',
    colorTheme: 'emerald',
  },
  {
    title: 'Siap Pakai Touring',
    description: 'Ban tubeless tebal & oli mesin baru',
    icon: 'two_wheeler',
    colorTheme: 'purple',
  },
  {
    title: 'Surat Lengkap & Sah',
    description: 'BPKB, STNK faktur asli pajak hidup',
    icon: 'verified_user',
    colorTheme: 'rose',
  },
];
</script>

<template>
  <ProductGallery
    :images="bikePhotos"
    thumbnails-variant="compact"
    color-theme="purple"
    :badges="bikeBadges"
    badge-layout="column"
  />
</template>
```

---

## 📋 Props API (`<ProductGallery />`)

| Prop | Tipe Data | Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `images` | `Array` | `[]` | Daftar foto produk: array string URL atau array objek `{ src, thumb, alt, label, badge }` |
| `modelValue` / `active` | `Number` | `0` | Indeks foto yang sedang aktif (*mendukung `v-model`*) |
| `colorTheme` | `String` | `'primary'` | **(Pilar 1)** Warna tema aksen: `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'` |
| `radius` | `String` | `'2xl'` | **(Pilar 2)** Kelengkungan sudut: `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`, `'full'` |
| `aspectRatio` | `String` | `'aspect-video'` | **(Pilar 2)** Rasio hero: `'aspect-video'`, `'aspect-16/10'`, `'aspect-4/3'`, `'aspect-square'` |
| `imageFit` | `String` | `'contain'` | **(Pilar 2)** Penyesuaian gambar: `'contain'` (utuh tanpa terpotong + ambient blur) atau `'cover'` |
| `borderless` | `Boolean` | `false` | **(Pilar 2)** Menghilangkan garis border kontainer hero |
| `badges` | `Array` | `[]` | **(Pilar 3 & 4)** Lencana status. Menerima array string atau array objek `{ title, description, icon, colorTheme, variant }` |
| `badgeLayout` | `String` | `'column'` | **(Pilar 3)** Alur tata letak badge: `'column'` (kebawah lalu kesamping, default), `'row'`, atau `'compact'` |
| `badgePosition` | `String` | `'top-left'` | **(Pilar 3)** Sudut penempatan badge: `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'` |
| `watermark` | `String` | `''` | **(Pilar 3)** Teks watermark/kredit showroom di sudut kiri bawah |
| `showCounter` | `Boolean` | `true` | **(Pilar 3)** Menampilkan penghitung foto di kanan bawah (*"1/5 Foto"*) |
| `thumbnailsVariant` | `String` | `'compact'` | Gaya thumbnail: `'compact'` (ring sorot) atau `'card'` (kartu dengan caption kategori) |
| `thumbnailsPosition`| `String` | `'bottom'` | Posisi bilah thumbnail: `'bottom'`, `'left'`, atau `'right'` |
| `showThumbnails` | `Boolean` | `true` | Menampilkan atau menyembunyikan bilah thumbnail |
| `showArrows` | `Boolean` | `true` | Menampilkan tombol panah navigasi kiri & kanan pada foto utama |
| `enableLightbox` | `Boolean` | `true` | Mengaktifkan modal zoom layar penuh saat foto diklik |
| `enableSwipe` | `Boolean` | `true` | **(Pilar 5)** Mengaktifkan gestur usap sentuh (*touch swipe left/right*) pada layar sentuh mobile |

---

## ⚡ Events (`defineEmits`)

| Event | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `update:modelValue` | `(index)` | Dipancarkan saat foto aktif berganti (*v-model sync*) |
| `change` | `(index)` | Dipancarkan saat pengguna memilih atau mengusap ke foto lain |
| `click-image` | `(imageItem, index)` | Dipancarkan saat foto utama diklik |
| `open-lightbox` | `(index)` | Dipancarkan saat modal zoom layar penuh dibuka |

---

## 🧩 Slots

| Nama Slot | Parameter Scoped | Cakupan / Konten |
| :--- | :--- | :--- |
| `#badges` | `{ badges }` | Kustomisasi menyeluruh kontainer lencana status |
| `#badge` | `{ badge, index }` | Kustomisasi tampilan per-lencana (ikon, judul, deskripsi) |
| `#watermark` | - | Kustomisasi elemen watermark / kredit showroom di kiri bawah |
| `#counter` | `{ current, total }` | Kustomisasi teks penghitung jumlah foto di kanan bawah |
