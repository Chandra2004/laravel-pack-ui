# 🖼️ ProductGallery Component (`ProductGallery.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen galeri media dan produk modular (*Enterprise Product & Media Gallery*) yang dirancang khusus untuk etalase e-commerce, showroom otomotif (mobil/motor), marketplace, dan listing properti. Dilengkapi penampil foto utama (*hero image*), bilah thumbnail berlabel kategori (*caption labels*), lencana status mengambang (*floating badges*), penghitung foto (*photo counter*), serta modal lightbox layar penuh (*zoom lightbox modal*) dengan navigasi keyboard panah dan escape.

---

## 🚀 Struktur Modular

Untuk menjaga fleksibilitas dan pemisahan tanggung jawab (*Separation of Concerns*), galeri ini dipecah menjadi 3 berkas modular:

1. **`ProductGallery.vue`**: Fasad utama orkestrator tampilan dan kontrol galeri.
2. **`Gallery/ProductGalleryThumbnails.vue`**: Sub-komponen bilah thumbnail dengan varian *compact* atau kartu berlabel caption teks.
3. **`Gallery/ProductGalleryLightbox.vue`**: Sub-komponen modal zoom layar penuh (`<Teleport to="body">`) dengan navigasi keyboard (`ArrowLeft`, `ArrowRight`, `Escape`).

---

## 💡 Contoh Penggunaan

### 1. Gaya Showroom Otomotif dengan Caption Kartu (Seperti Innova / Mobil)

```vue
<script setup>
import { ref } from 'vue';
import ProductGallery from '@/Components/Pack/ProductGallery.vue';

const activePhoto = ref(0);

const carGallery = [
  {
    src: '/images/cars/innova-dashboard.jpg',
    thumb: '/images/cars/innova-dashboard-sm.jpg',
    alt: 'Dashboard Innova Zenix',
    label: 'DASHBOARD',
  },
  {
    src: '/images/cars/innova-exterior.jpg',
    thumb: '/images/cars/innova-exterior-sm.jpg',
    alt: 'Eksterior Depan Innova Zenix',
    label: 'EXTERIOR',
  },
  {
    src: '/images/cars/innova-interior.jpg',
    thumb: '/images/cars/innova-interior-sm.jpg',
    alt: 'Interior Kabin Captain Seat',
    label: 'INTERIOR KABIN',
  },
  {
    src: '/images/cars/innova-bagasi.jpg',
    thumb: '/images/cars/innova-bagasi-sm.jpg',
    alt: 'Kapasitas Bagasi Koper',
    label: 'BAGASI KOPER',
  },
];
</script>

<template>
  <ProductGallery
    v-model="activePhoto"
    :images="carGallery"
    thumbnails-variant="card"
    watermark="Galeri Foto Resmi LUMINO"
    :badges="[
      { label: 'SHOWROOM PRISTINE', icon: 'auto_awesome' }
    ]"
  />
</template>
```

---

### 2. Gaya Marketplace / Motor dengan Multi-Badge (Seperti Scoopy)

```vue
<script setup>
import { ref } from 'vue';
import ProductGallery from '@/Components/Pack/ProductGallery.vue';

const motorcyclePhotos = [
  '/images/bikes/scoopy-main.jpg',
  '/images/bikes/scoopy-side.jpg',
  '/images/bikes/scoopy-front.jpg',
  '/images/bikes/scoopy-speedo.jpg',
  '/images/bikes/scoopy-trunk.jpg',
];
</script>

<template>
  <ProductGallery
    :images="motorcyclePhotos"
    thumbnails-variant="compact"
    :badges="[
      'Servis Rutin AHASS',
      '100% Bebas Asap & Bersih'
    ]"
    aspect-ratio="aspect-video"
  />
</template>
```

---

## 📋 Props API (`<ProductGallery />`)

| Prop | Tipe Data | Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `images` | `Array` | `[]` | Daftar foto produk. Menerima array string URL atau array objek: `{ src, thumb, alt, label, badge }` |
| `modelValue` / `active` | `Number` | `0` | Indeks foto yang sedang aktif (*mendukung `v-model`*) |
| `aspectRatio` | `String` | `'aspect-video'` | Rasio tampilan hero: `'aspect-video'` (16:9), `'aspect-16/10'`, `'aspect-4/3'`, `'aspect-square'` (1:1) |
| `imageFit` | `String` | `'contain'` | Penyesuaian gambar hero: `'contain'` (gambar utuh dari atas ke bawah tanpa di-crop/zoom, dilengkapi ambient blur backdrop untuk foto portrait) atau `'cover'` |
| `thumbnailsVariant` | `String` | `'compact'` | Gaya thumbnail: `'compact'` (strip ring sorot) atau `'card'` (kartu dengan caption label gelap) |
| `thumbnailsPosition`| `String` | `'bottom'` | Posisi thumbnail bar: `'bottom'`, `'left'`, atau `'right'` |
| `showThumbnails` | `Boolean` | `true` | Menampilkan atau menyembunyikan bilah thumbnail |
| `showCounter` | `Boolean` | `true` | Menampilkan lencana counter foto di kanan bawah (*"1/5 Foto"*) |
| `showArrows` | `Boolean` | `true` | Menampilkan tombol panah navigasi kiri & kanan pada foto utama |
| `enableLightbox` | `Boolean` | `true` | Mengaktifkan modal zoom layar penuh saat foto diklik |
| `badges` | `Array` | `[]` | Lencana status mengambang di kiri atas. Format string: `['Promo', 'Garansi']` atau objek: `[{ label, icon, variant }]` |
| `watermark` | `String` | `''` | Teks kredit/watermark showroom di kiri bawah foto |
| `rounded` | `String` | `'rounded-2xl'` | Kelas border-radius Tailwind |
| `borderless` | `Boolean` | `false` | Menghilangkan border pada kontainer hero |

---

## ⚡ Events (`defineEmits`)

| Event | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `update:modelValue` | `(index)` | Dipancarkan saat foto aktif berganti (*v-model sync*) |
| `change` | `(index)` | Dipancarkan saat pengguna mengganti pilihan foto |
| `click-image` | `(imageItem, index)` | Dipancarkan saat foto utama diklik |
| `open-lightbox` | `(index)` | Dipancarkan saat modal zoom dibuka |

---

## 🧩 Slots

| Nama Slot | Cakupan / Konten |
| :--- | :--- |
| `#badges` | Kustomisasi penuh deretan lencana status di kiri atas |
| `#watermark` | Kustomisasi watermark / kredit showroom di kiri bawah |
| `#counter` | Slot kustomisasi teks counter (menerima slot props: `{ current, total }`) |

---

## 🔍 Fitur & Kontrol Lightbox Modal

Modal zoom mendukung eksplorasi foto resolusi tinggi secara detail:
* **Interactive Drag & Pan**: Klik dan tarik mouse saat gambar diperbesar untuk menjelajahi seluruh area foto.
* **Scroll Wheel Zoom**: Putar roda mouse ke atas untuk memperbesar (*zoom in* hingga 300%) dan ke bawah untuk memperkecil (*zoom out*).
* **Double Click**: Klik ganda pada foto untuk toggle cepat antara ukuran 100% dan 200%.
* **Kontrol Keyboard**:
  * `+` / `=` : Memperbesar foto (*Zoom In*).
  * `-` : Memperkecil foto (*Zoom Out*).
  * `0` : Mengembalikan ukuran normal (*Reset Zoom 100%*).
  * `ArrowRight` : Berpindah ke foto berikutnya (*Next*, saat zoom 100%).
  * `ArrowLeft` : Berpindah ke foto sebelumnya (*Previous*, saat zoom 100%).
  * `Escape` : Menutup modal zoom (*Close*).
