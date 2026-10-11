# ProductGallery Component

Komponen galeri media produk interaktif (*interactive product media gallery*) berbasis Vue 3 dan Tailwind CSS untuk aplikasi e-commerce, portal otomotif, direktori properti, dan portofolio produk premium. Dilengkapi thumbnail multi-varian, modal Lightbox resolusi tinggi layar penuh, gestur geser (*swipe gestures*), lencana garansi kaya (*rich badges*), dan tanda air (*watermark*).

---

## 01. Overview

`ProductGallery` memberikan pengalaman visual eksplorasi produk yang imersif dan terpadu:

- **Fleksibilitas Rasio Aspek**: Mendukung rasio kanvas `aspect-video` (16:9), `aspect-16/10` (laptop/layar lebar), `aspect-4/3` (standar), dan `aspect-square` (1:1).
- **Mode Pengepasan Gambar (*Image Fit*)**: Mode `contain` (menampilkan gambar utuh tanpa terpotong) atau `cover` (mengisi penuh kanvas bingkai).
- **Integrasi Pemutar Video HD MediaPlayer**: Mendukung media video secara langsung di kanvas galeri dan modal Lightbox dengan kontrol video, autoplay policy aman, dan tombol play overlay pada thumbnail.
- **Modal Lightbox Terintegrasi**: Pengguna dapat mengklik gambar utama untuk membuka penampil media resolusi tinggi layar penuh lengkap dengan tombol zoom dan navigasi panah.
- **Dukungan Gestur Layar Sentuh (*Touch Gestures*)**: Pengguna perangkat seluler dapat menggeser (*swipe*) foto ke kiri atau kanan secara intuitif.
- **Ragam Posisi & Auto-Scrolling Thumbnails**: Bilah thumbnail dapat ditempatkan di posisi `bottom` (bawah), `top` (atas), `left` (kiri), atau `right` (kanan). Posisi bawah/atas presisi selebar card dan scroll kesamping jika banyak item; posisi samping sejajar tinggi card dan scroll kebawah.
- **Kustomisasi Lencana Independen (*Badge Controls*)**: On/Off badge pada card (`showCardBadges`) dan thumbnail (`showThumbnailBadges`) serta tata letak badge card yang dapat diatur kebawah (`column`) atau berjejer kesamping (`row`).

### 1.1 Apa Entitas Ini

**Vue Component** (Single File Component) yang berlokasi di [ProductGallery.vue](file:///c:/SPEED/LARAVEL-PACK-UI/resources/js/Components/Pack/ProductGallery.vue) didukung sub-komponen [ProductGalleryThumbnails.vue](file:///c:/SPEED/LARAVEL-PACK-UI/resources/js/Components/Pack/Gallery/ProductGalleryThumbnails.vue) dan [ProductGalleryLightbox.vue](file:///c:/SPEED/LARAVEL-PACK-UI/resources/js/Components/Pack/Gallery/ProductGalleryLightbox.vue).

### 1.2 Fungsi Utama

- Menyajikan kumpulan foto produk secara hierarkis dengan satu kanvas tampilan utama dan deretan thumbnail pendukung.
- Mengelola sinkronisasi indeks foto yang aktif melalui dua arah `v-model`.
- Memungkinkan penambahan tanda air (*watermark*) semi-transparan untuk proteksi hak cipta media digital.
- Menampilkan nomor urut foto aktif terhadap total gambar (*counter badge*, misal: "1 / 4").

### 1.3 Kapan Digunakan

- Halaman detail produk e-commerce (smartphone, laptop, pakaian, sepatu).
- Listing properti real estate (interior villa, denah arsitektur, lanskap luar).
- Showroom otomotif online (eksterior mobil, roda velg, kokpit kemudi).
- Portofolio fotografi karya kreatif dan galeri seni digital.

### 1.4 Karakteristik Penting

- **Dual Image Source Format**: Menerima array string URL sederhana (`['/img1.jpg', '/img2.jpg']`) maupun array objek terstruktur (`[{ src, thumb, alt, label, badge }]`).
- **Pencegahan Redraw Glitch**: Pengalihan gambar halus dengan penanganan status pemuatan (*skeleton placeholder*).
- **Integrasi Penuh Tema Gelap & Terang**: Bingkai dan latar belakang kanvas beradaptasi otomatis terhadap preferensi tema sistem.

---

## 02. Preview

> [!TIP]
> Pengujian visual dan showcase interaktif entitas ini tersedia secara native pada portal pratinjau aplikasi:
>
> <a href="/demo/product-gallery" target="_self" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 8px; background-color: var(--vp-c-brand-1, #4f46e5); color: #ffffff;">Buka Live Preview Komponen ProductGallery &rarr;</a>

---

## 03. Usage

### Pohon Konsep Penggunaan

```text
ProductGallery
├── Konfigurasi Media
│   ├── Format String Array (['url1', 'url2'])
│   └── Format Objek Kaya ([{ src, thumb, alt, label, badge }])
├── Tata Letak & Geometri
│   ├── Rasio Aspek (aspect-video, aspect-square, aspect-16/10)
│   ├── Posisi Thumbnails (bottom, left, right)
│   └── Gaya Thumbnails (compact, card)
└── Fitur Interaktif
    ├── Dialog Lightbox Layar Penuh (enable-lightbox)
    ├── Touch Swipe Gestures (enable-swipe)
    └── Lencana & Watermark (badges, watermark)
```

### Sintaks Dasar Single File Component

```vue
<script setup>
import { ref } from 'vue';
import ProductGallery from '@/Components/Pack/ProductGallery.vue';

const activePhoto = ref(0);

const productPhotos = [
    {
        src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
        thumb: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=240&q=80',
        alt: 'Studio Headphone Nirkabel Flagship',
        label: 'Tampak Utama',
    },
    {
        src: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80',
        thumb: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=240&q=80',
        alt: 'Detail Bantalan Memory Foam',
        label: 'Detail Earcups',
    },
];

const productBadges = [
    { title: 'Garansi Resmi 2 Tahun', icon: 'verified', colorTheme: 'emerald' },
];
</script>

<template>
    <div class="max-w-2xl mx-auto">
        <ProductGallery
            v-model="activePhoto"
            :images="productPhotos"
            aspect-ratio="aspect-video"
            image-fit="contain"
            color-theme="indigo"
            :badges="productBadges"
            watermark="ENTERPRISE STORE"
            enable-lightbox
        />
    </div>
</template>
```

---

## 04. Anatomy

Struktur arsitektur elemen visual komponen `ProductGallery`:

```text
+-------------------------------------------------------------------------+
| [1] Main Gallery Canvas Container (rounded-2xl relative overflow-hidden)|
| +---------------------------------------------------------------------+ |
| | [2] Badges Overlay (Top-Left)           [3] Counter Badge (Top-Right)| |
| | [*] Garansi Resmi 2 Tahun                                     [1/4] | |
| |                                                                     | |
| | [<] (Prev Arrow)            [4] Main Image             [>] (Next)   | |
| |                                                                     | |
| |                             [5] Watermark (Bottom-Center)           | |
| |                                 AUTHENTIC ENTERPRISE                | |
| +---------------------------------------------------------------------+ |
|                                                                         |
| [6] Thumbnails Navigation Bar (Position: bottom / left / right)         |
| +---------------------------------------------------------------------+ |
| |  [(1) Foto 1]      [ (2) Foto 2 ]      [ (3) Foto 3 ]      [ (4) ]  | |
| +---------------------------------------------------------------------+ |
+-------------------------------------------------------------------------+
```

### Rincian Bagian Anatomi

1. **Main Gallery Canvas Container**: Bingkai utama dengan rasio aspek terkunci dan sudut membulat halus (`rounded-2xl`).
2. **Badges Overlay**: Wadah lencana informasi produk di sudut kiri atas dengan dukungan tata letak vertikal (*column*) atau horizontal (*row*).
3. **Counter Badge**: Indikator penunjuk urutan foto aktif (misal: "1 / 4") di sudut kanan atas.
4. **Main Image**: Elemen gambar utama yang aktif ditampilkan, mendukung efek zoom saat diklik untuk membuka Lightbox.
5. **Watermark Label**: Teks penanda hak cipta digital semi-transparan di bagian dasar kanvas gambar.
6. **Thumbnails Navigation Bar**: Deretan gambar kecil pratinjau yang disorot cincin aktif sesuai foto yang sedang ditampilkan.

---

## 05. Variants

### Pilar Rasio Aspek (`aspectRatio`)

- **`aspect-video`** (16:9): Rasio sinematik standar, sangat ideal untuk gadget, laptop, dan kendaraan bermotor.
- **`aspect-16/10`**: Rasio layar monitor lebar, cocok untuk tangkapan layar perangkat lunak (*software screenshots*).
- **`aspect-4/3`**: Rasio fotografi tradisional, cocok untuk karya seni dan foto produk vertikal.
- **`aspect-square`** (1:1): Format bujur sangkar seragam, sangat populer pada katalog e-commerce busana dan marketplace.

### Pilar Mode Gambar (`imageFit`)

- **`contain`**: Gambar diskalakan secara proporsional tanpa terpotong sedikitpun di dalam kanvas (cocok untuk produk elektronik yang detailnya utuh).
- **`cover`**: Gambar diperbesar untuk mengisi seluruh kanvas bingkai tanpa menyisakan ruang kosong (cocok untuk fotografi properti dan otomotif).

### Pilar Varian Thumbnail (`thumbnailsVariant`)

- **`compact`**: Pratinjau gambar mini tanpa label teks, ditandai cincin sorot halus.
- **`card`**: Pratinjau gambar mini berbentuk kartu dengan label teks deskriptif (misal: "TAMPAK DEPAN", "INTERIOR").

---

## 06. Sizes

### Posisi Thumbnails (`thumbnailsPosition`)

- **`bottom`**: **Default**. Terletak di bawah kanvas gambar utama, presisi selebar card dan otomatis scroll horizontal (`overflow-x-auto`) jika gambar banyak.
- **`top`**: Terletak di atas kanvas gambar utama, presisi selebar card dan otomatis scroll horizontal jika gambar banyak.
- **`left`**: Terletak di sisi kiri gambar utama, di desktop tinggi sejajar 100% dengan card dan scroll vertikal (`overflow-y-auto`) jika gambar banyak.
- **`right`**: Terletak di sisi kanan gambar utama, di desktop tinggi sejajar 100% dengan card dan scroll vertikal (`overflow-y-auto`) jika gambar banyak.

### Sudut Kelengkungan (`radius`)

Mendukung opsi: `none`, `sm`, `md`, `lg`, `xl`, `2xl` (**default**), `3xl`, dan `full`.

---

## 07. States

| State | Indikasi Visual | Perilaku Interaktif |
| :--- | :--- | :--- |
| **Idle** | Foto aktif tampil tajam di kanvas utama, thumbnail yang sesuai diberi cincin warna tema. | Pengguna dapat menggulir thumbnail atau menekan panah navigasi. |
| **Hover** | Panah navigasi samping kiri/kanan membesar halus dan latar belakangnya menggelap. | Menandakan tombol panah siap diklik untuk berpindah foto. |
| **Swiping (Touch)** | Kanvas merespons geseran jemari secara langsung pada layar ponsel. | Geser ke kiri memuat foto berikutnya; geser ke kanan memuat foto sebelumnya. |
| **Lightbox Open** | Modal dialog layar penuh terbuka dengan latar belakang hitam gelap (`bg-black/95`). | Foto resolusi asli ditampilkan maksimal; tombol panah dan tombol Escape menutup lightbox. |

---

## 08. Props / Attributes

| Nama Prop | Tipe Data | Nilai Bawaan | Opsi / Rentang | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `images` | `Array` | `[]` | Array URL atau Objek | Daftar foto/video: `['url1']` atau `[{ src, thumb, alt, label, badge, type: 'video' \| 'image', poster }]`. |
| `modelValue / active` | `Number` | `0` | Indeks integer | Indeks foto yang sedang aktif ditampilkan. |
| `aspectRatio` | `String` | `'aspect-video'` | `'aspect-video'`, `'aspect-16/10'`, `'aspect-4/3'`, `'aspect-square'` | Rasio proporsi kanvas gambar utama. |
| `imageFit` | `String` | `'contain'` | `'contain'`, `'cover'` | Mode penskalaan gambar di dalam kontainer kanvas. |
| `radius` | `String` | `'2xl'` | `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`, `'full'` | Kelengkungan sudut bingkai galeri dan thumbnail. |
| `rounded` | `String` | `''` | Class string Tailwind | Properti backward compatibility untuk kelengkungan sudut bingkai. |
| `borderless` | `Boolean` | `false` | `true`, `false` | Menghilangkan garis tepi kontainer luar. |
| `colorTheme` | `String` | `'primary'` | `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, dll. | Aksen warna tema cincin aktif dan badge. |
| `thumbnailsPosition` | `String` | `'bottom'` | `'bottom'`, `'top'`, `'left'`, `'right'` | Posisi penempatan bilah thumbnail foto. |
| `thumbnailsVariant` | `String` | `'compact'` | `'compact'`, `'card'` | Gaya visual thumbnail (lingkaran ringkas atau kartu berlabel). |
| `showThumbnails` | `Boolean` | `true` | `true`, `false` | Menampilkan atau menyembunyikan bilah navigasi thumbnail. |
| `showArrows` | `Boolean` | `true` | `true`, `false` | Menampilkan tombol panah navigasi kiri dan kanan. |
| `showCounter` | `Boolean` | `true` | `true`, `false` | Menampilkan badge penanda urutan nomor foto aktif. |
| `enableLightbox` | `Boolean` | `true` | `true`, `false` | Mengaktifkan modal zoom layar penuh saat foto diklik. |
| `enableSwipe` | `Boolean` | `true` | `true`, `false` | Mengaktifkan deteksi gestur geser sentuh layar ponsel. |
| `badges` | `Array` | `[]` | Array string atau objek | Daftar lencana garansi/fitur produk di atas foto. |
| `showCardBadges` | `Boolean` | `true` | `true`, `false` | Menampilkan atau menyembunyikan lencana produk pada area card utama. |
| `showThumbnailBadges` | `Boolean` | `true` | `true`, `false` | Menampilkan atau menyembunyikan lencana mini pada item thumbnail. |
| `badgeLayout` | `String` | `'column'` | `'column'`, `'row'`, `'compact'` | Tata letak susunan lencana: `'column'` (kebawah) atau `'row'` (kesamping). |
| `badgePosition` | `String` | `'top-left'` | `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'` | Sudut penempatan lencana pada foto. |
| `watermark` | `String` | `''` | Teks bebas | Teks tanda air perlindungan hak cipta gambar. |

---

## 09. Slots

Komponen `ProductGallery` menyediakan slot kustom berikut:

| Nama Slot | Properti Slot | Deskripsi Penggunaan |
| :--- | :--- | :--- |
| `#badges` | `{ badges }` | Mengambil alih rendering seluruh kontainer floating badges di atas foto. |
| `#badge` | `{ badge, index }` | Mengkustomisasi tiap kartu badge keunggulan produk. |
| `#watermark` | — | Mengkustomisasi tampilan tanda air hak cipta di sudut kiri bawah. |
| `#counter` | `{ current, total }` | Mengkustomisasi elemen penghitung nomor urut foto di sudut kanan bawah. |

---

## 10. Events / Interactions

| Nama Event | Parameter Emitted | Waktu Pemicuan (Trigger Lifecycle) |
| :--- | :--- | :--- |
| `@update:modelValue` | `(index: Number)` | Dipancarkan saat indeks foto yang aktif berubah (`v-model`). |
| `@update:active` | `(index: Number)` | Dipancarkan seirama dengan pembaruan indeks aktif. |
| `@change` | `(index: Number)` | Dipancarkan saat pengguna mengganti foto via thumbnail, panah, atau swipe. |
| `@click-image` | `(currentImage: Object, currentIndex: Number)` | Dipancarkan saat gambar utama diklik oleh pengguna. |
| `@open-lightbox` | `(index: Number)` | Dipancarkan saat dialog modal Lightbox berhasil terbuka. |

---

## 11. Code Example

Contoh implementasi galeri produk laptop dengan rasio `aspect-16/10`, thumbnail di posisi bawah, dan penanganan event:

```vue
<script setup>
import { ref } from 'vue';
import ProductGallery from '@/Components/Pack/ProductGallery.vue';

const currentPhoto = ref(0);

const laptopMedia = [
    { src: '/images/laptop-front.jpg', thumb: '/images/laptop-front-sm.jpg', alt: 'MacBook Pro Tampak Depan', label: 'Tampak Utama' },
    { src: '/images/laptop-side.jpg', thumb: '/images/laptop-side-sm.jpg', alt: 'Port Thunderbolt 4', label: 'Port Samping' },
    { src: '/images/laptop-keyboard.jpg', thumb: '/images/laptop-keyboard-sm.jpg', alt: 'Magic Keyboard dengan Touch ID', label: 'Keyboard' },
];

function onPhotoChange(idx) {
    console.log('Pengguna melihat foto ke:', idx + 1);
}
</script>

<template>
    <div class="max-w-3xl mx-auto p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <ProductGallery
            v-model="currentPhoto"
            :images="laptopMedia"
            aspect-ratio="aspect-16/10"
            image-fit="cover"
            color-theme="indigo"
            thumbnails-variant="card"
            watermark="APPLE OFFICIAL PARTNER"
            enable-lightbox
            @change="onPhotoChange"
        />
    </div>
</template>
```

---

## 12. Result / Behavior

1. **Rotasi Foto Halus**: Saat thumbnail ditekan atau panah navigasi diklik, indeks foto aktif diperbarui secara instan dan kanvas utama menampilkan foto yang bersangkutan tanpa loncatan tata letak.
2. **Pengalaman Lightbox Imersif**: Menekan foto utama akan meluncurkan modal dialog layar penuh berlatar hitam pekat. Seluruh navigasi thumbnail dan panah tetap tersedia di dalam Lightbox dengan resolusi visual maksimal.
3. **Penyelarasan Posisi Thumbnail**: Jika jumlah foto melebihi lebar layar, bilah thumbnail mendukung pengguliran horizontal halus (*smooth horizontal scroll*) dan secara otomatis memusatkan thumbnail foto yang sedang aktif.

---

## 13. Customization

### Galeri Properti Real Estate dengan Thumbnail di Sisi Kanan

```vue
<template>
    <ProductGallery
        :images="villaPhotos"
        aspect-ratio="aspect-video"
        image-fit="cover"
        thumbnails-position="right"
        color-theme="amber"
        watermark="BALI LUXURY REALTY"
    />
</template>
```

---

## 14. Accessibility

- **Atribut Alt Komprehensif**: Setiap gambar kanvas dan thumbnail mempertahankan atribut teks alternatif `alt` untuk pembaca layar.
- **Navigasi Tombol Keyboard**: Pada modal Lightbox, penekanan tombol panah kiri (`ArrowLeft`) dan panah kanan (`ArrowRight`) memindahkan foto secara langsung; tombol `Escape` menutup tampilan Lightbox.
- **Label Tombol Semantik**: Tombol panah navigasi memiliki label aksesibel `aria-label="Foto Sebelumnya"` dan `aria-label="Foto Selanjutnya"`.

---

## 15. Responsive Behavior

- **Mobile Viewport (< 640px)**: Thumbnail di posisi samping (`left` atau `right`) otomatis berpindah ke bawah (`bottom`) untuk menghemat lebar layar horizontal. Gestur geser jemari (*touch swipe*) aktif penuh.
- **Desktop Viewport (>= 640px)**: Mendukung tata letak multi-kolom dengan thumbnail samping dan resolusi gambar kanvas tajam.

---

## 16. Do / Don't

| Do (Praktik Direkomendasikan) | Don't (Praktik Dihindari) |
| :--- | :--- |
| **Gunakan `imageFit="contain"` untuk produk dengan detail presisi**: Mencegah teks spesifikasi atau ujung produk terpotong oleh bingkai kanvas. | **Jangan mengunggah foto dengan rasio aspek yang terlalu berbeda**: Menyatukan foto lanskap dan potret ekstrem dalam satu galeri akan menghasilkan ruang kosong yang tidak serasi. |
| **Sediakan `thumb` beresolusi terkompresi**: Gunakan gambar berukuran kecil untuk thumbnail agar waktu muat awal halaman tetap sangat cepat. | **Jangan mematikan fitur Lightbox pada foto produk detail**: Biarkan pengguna memperbesar foto untuk memverifikasi kualitas material barang. |
| **Tentukan atribut `alt` yang deskriptif**: Membantu optimasi mesin pencari (SEO) dan aksesibilitas pembaca layar bagi tunanetra. | **Jangan menaruh watermark terlalu kontras dan besar**: Tanda air yang terlalu pekat menutupi detail produk yang ingin ditinjau pembeli. |

---

## 17. Examples / Recipes

### Recipe 1: Galeri Katalog Busana E-Commerce (Bujur Sangkar)

```vue
<script setup>
import { ref } from 'vue';
import ProductGallery from '@/Components/Pack/ProductGallery.vue';

const photoIndex = ref(0);
const fashionPhotos = [
    { src: '/images/jacket-front.jpg', thumb: '/images/jacket-front-sm.jpg', alt: 'Jaket Denim Vintage Tampak Depan' },
    { src: '/images/jacket-back.jpg', thumb: '/images/jacket-back-sm.jpg', alt: 'Jaket Denim Tampak Belakang' },
];
</script>

<template>
    <ProductGallery
        v-model="photoIndex"
        :images="fashionPhotos"
        aspect-ratio="aspect-square"
        image-fit="cover"
        color-theme="rose"
        watermark="INDIGO APPAREL"
    />
</template>
```

### Recipe 2: Showroom Otomotif dengan Sertifikasi Inspeksi

```vue
<script setup>
import ProductGallery from '@/Components/Pack/ProductGallery.vue';

const carPhotos = [
    { src: '/images/porsche-front.jpg', thumb: '/images/porsche-front-sm.jpg', alt: 'Porsche GT3 RS Eksterior' },
    { src: '/images/porsche-interior.jpg', thumb: '/images/porsche-interior-sm.jpg', alt: 'Interior Kokpit Balap' },
];

const badges = [
    { title: 'Lolos Inspeksi 160 Titik', icon: 'verified', colorTheme: 'emerald' },
];
</script>

<template>
    <ProductGallery
        :images="carPhotos"
        aspect-ratio="aspect-video"
        image-fit="cover"
        color-theme="emerald"
        :badges="badges"
        watermark="VERIFIED DEALER"
    />
</template>
```

---

## 18. Related Components

- [Badge](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/badge.md): Komponen penanda status yang disematkan di atas kanvas galeri untuk garansi dan label produk.
- [MediaPlayer](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/media-player.md): Pemutar audio dan video HD terintegrasi yang menjadi mesin pemutar video di kanvas galeri dan dialog lightbox.
- [Modal](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/modal.md): Dialog overlay yang menjadi fondasi arsitektur Lightbox tampilan layar penuh.
- [Card](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/card.md): Kontainer pembungkus informasi produk dan harga di samping galeri.
- [ButtonSubmit](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/button-submit.md): Tombol aksi beli sekarang atau masukkan keranjang belanja.

---

## 19. Notes / Limitations

- **Dukungan Touch Gestures**: Fitur *swipe* memanfaatkan event `touchstart`, `touchmove`, dan `touchend` dengan ambang batas jarak geser horizontal minimum 40 piksel.
- **Pengaturan Lazy Loading**: Untuk performa terbaik, pastikan gambar selain foto pertama dimuat secara bertahap (*lazy loading*) agar tidak membebani penggunaan kuota data seluler.
- **Dukungan Media Video**: Komponen ini mendukung berkas video (`.mp4`, `.webm`) secara terintegrasi via komponen `MediaPlayer`. Video dapat dimainkan langsung di kanvas utama dengan rasio terjaga dan navigasi slide tetap aktif.
