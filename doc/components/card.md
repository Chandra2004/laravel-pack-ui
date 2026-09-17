# 🃏 Card Component (`Card.vue`, `CardSlider.vue`, `CardProduct.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen kartu universal (*card container*) multifungsi tingkat lanjut yang dirancang memenuhi **5 Pilar Desain UI (`peraturan.md`)** serta dilengkapi varian canggih siap pakai: **Kartu Kontainer Universal**, **Kartu Produk E-Commerce**, **Card Slider / Carousel dengan Tombol Prev & Next**, dan **Interactive 3D Flip Card**.

Dilengkapi fitur inovatif yang jarang dimiliki template UI luar: **Spotlight Radial Glow ala Linear/Vercel**, **3D Dynamic Perspective Tilt**, **Dual-Image Hover Swap**, **Flash Sale Live Countdown Timer**, dan **Animasi Rotasi 3D Bolak-Balik**.

---

## 🏛️ Evaluasi & Penerapan 5 Pilar Desain (`peraturan.md`)

| Pilar Desain | Penerapan pada Komponen `Card` |
| :--- | :--- |
| **1. Warna** | Mendukung 9 preset palet tema (`colorTheme`: `default`, `primary`, `indigo`, `emerald`, `purple`, `amber`, `rose`, `cyan`, `dark`). Dilengkapi efek ambient `glow`, `accentBorder` (`top`, `left`, `bottom`), serta varian visual permukaan: `default`, `bordered`, `elevated`, `flat`, `glass` (frosted glass blur), `gradient`, dan `accent`. Dark mode terintegrasi penuh. |
| **2. Bentuk** | Kelengkungan sudut dinamis (`rounded`: `none`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `full`), rasio gambar adaptif (`imageAspectRatio`: `square`, `video`, `tall`, `wide`), efek interaktif **Spotlight Radial Glow** (sorotan kursor mouse) dan **3D Interactive Tilt** (kemiringan fisik mengikuti posisi mouse). |
| **3. Teks Konten** | Tipografi hirarkis dengan pemotongan teks aman (`truncate`, `line-clamp-2`), badge status promo/diskon (`badge`, `badgeColor`, `discount`), harga coret (`price`, `originalPrice`), bar urgensi stok tersisa (`stock`, `maxStock`, `stockLabel`), serta banner **Flash Sale Live Countdown Timer** (`countdown`). |
| **4. Icon** | Ikon Google Material Symbols di header dengan ragam gaya (`iconVariant`: `subtle`, `solid`, `outline`), tombol interaktif Wishlist/Favorit hati (`wishlistable`), tombol Quick View, tombol panah navigasi slider (*chevron prev/next*), dan ikon rotasi flip 3D. |
| **5. Responsif** | *Mobile-first layout*: touch swipe & drag gestures pada slider kartu dengan batas ambang inersia 40px, penyesuaian kolom adaptif, navigasi panah otomatis ergonomis di layar sentuh, dan layout produk yang fleksibel pada grid maupun carousel. |

---

## 🚀 Fitur Unggulan ("Killer Features")

1. **Spotlight Radial Glow (`spotlight="true"`)**:
   Menghasilkan sorotan cahaya gradien radial halus yang melacak pergerakan kursor mouse secara presisi tanpa pustaka eksternal (terinspirasi dari antarmuka modern Linear & Vercel).
2. **Interactive 3D Dynamic Tilt (`tilt="true"`)**:
   Kartu merespons interaksi mouse dengan efek kemiringan perspektif 3D (*perspective 1000px, rotateX, rotateY*) yang halus dan dinamis.
3. **Dual-Image Hover Swap (`type="product"` / `<CardProduct />`)**:
   Otomatis beralih ke gambar sekunder (*preview angle 2 / tampak belakang*) saat kursor diarahkan ke atas foto produk, lengkap dengan transisi perbesaran halus (*scale-105*).
4. **Flash Sale Live Countdown Timer (`countdown="2026-12-31T23:59:59"`)**:
   Ticker hitung mundur otomatis (*HH:MM:SS*) dengan aksen gradien api dan ikon petir berdenyut langsung di atas media produk.
5. **Interactive 3D Flip Card (`type="flip"`)**:
   Kartu bolak-balik 3D interaktif yang menyajikan ringkasan di sisi depan (*front slot*) dan rincian teknis / kode QR di sisi belakang (*back slot*).
6. **Card Slider / Carousel (`type="slider"` / `<CardSlider />`)**:
   Slider kartu horizontal dengan kontrol tombol Prev & Next (posisi header atau sisi melayang), indikator titik paginasi, slide counter (`01 / 05`), dan autoplay dengan auto-pause saat kursor diarahkan.

---

## 📦 Komponen Modular yang Tersedia

1. **`Card.vue`**: Komponen induk utama serbaguna. Cukup tentukan properti `type` (`'default'`, `'product'`, `'slider'`, `'flip'`).
2. **`CardSlider.vue`**: Subkomponen slider kartu mandiri yang dioptimalkan untuk geser horizontal, swipe mobile, dan deretan kartu multi-item.
3. **`CardProduct.vue`**: Subkomponen kartu produk terdedikasi sebagai *shorthand* praktis untuk kebutuhan katalog toko online.

---

## 📋 Props API (`<Card />`)

### 1. General Props (Universal)
| Prop | Tipe Data | Default | Pilihan Nilai / Deskripsi |
| :--- | :--- | :--- | :--- |
| `type` | `String` | `'default'` | Mode tampilan: `'default'` (kontainer), `'product'` (e-commerce), `'slider'` (carousel), `'flip'` (3D bolak-balik) |
| `variant` | `String` | `'default'` | Gaya permukaan: `'default'`, `'bordered'`, `'elevated'`, `'flat'`, `'glass'`, `'gradient'`, `'accent'` |
| `colorTheme` | `String` | `'default'` | Palet tema: `'default'`, `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'` |
| `rounded` | `String` | `'2xl'` | Sudut membulat: `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`, `'full'` |
| `padding` | `String` | `'md'` | Ruang padding: `'none'`, `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'` |
| `accentBorder` | `String` | `'none'` | Garis aksen tepi: `'none'`, `'top'`, `'left'`, `'bottom'` |
| `glow` | `Boolean` | `false` | Menampilkan bayangan pendar ambient sesuai `colorTheme` |
| `spotlight` | `Boolean` | `false` | Mengaktifkan sorotan cahaya radial yang mengikuti pergerakan kursor mouse |
| `tilt` | `Boolean` | `false` | Mengaktifkan efek kemiringan 3D interaktif pada hover |
| `maxTilt` | `Number` | `8` | Derajat sudut kemiringan maksimal saat `tilt="true"` |
| `title` | `String` | `''` | Judul kartu |
| `subtitle` | `String` | `''` | Subjudul atau deskripsi singkat kartu |
| `icon` | `String` | `''` | Nama icon Google Material Symbols |
| `iconVariant` | `String` | `'subtle'` | Gaya ikon: `'subtle'`, `'solid'`, `'outline'`, `'none'` |
| `badge` | `String` | `''` | Teks label badge header/media |
| `badgeColor` | `String` | `''` | Custom class warna badge |
| `collapsible` | `Boolean` | `false` | Mengaktifkan tombol lipat/ciutkan isi kartu |
| `collapsed` | `Boolean` | `false` | Status terlipat (mendukung `v-model:collapsed`) |
| `loading` | `Boolean` | `false` | Menampilkan overlay loading spinner di atas kartu |
| `hoverable` | `Boolean` | `false` | Efek angkat kartu dan bayangan saat disorot kursor |
| `clickable` | `Boolean` | `false` | Menjadikan permukaan kartu dapat diklik |

### 2. Product Card Props (`type="product"` / `<CardProduct />`)
| Prop | Tipe Data | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `image` | `String` | `''` | URL gambar utama produk |
| `hoverImage` | `String` | `''` | URL gambar sekunder yang otomatis muncul saat mouse hover |
| `imageAspectRatio` | `String` | `'square'` | Rasio gambar: `'square'`, `'video'`, `'tall'`, `'wide'` |
| `category` | `String` | `''` | Label kategori atau merek di atas judul |
| `price` | `String\|Number`| `''` | Harga utama (misal: `"Rp 1.429.000"`) |
| `originalPrice`| `String\|Number`| `''` | Harga normal coret (misal: `"Rp 2.199.000"`) |
| `discount` | `String` | `''` | Label diskon promo (misal: `"-35%"`) |
| `rating` | `Number` | `0` | Skor bintang desimal (0 - 5.0) |
| `reviewCount` | `String\|Number`| `0` | Jumlah ulasan pelanggan (misal: `184` atau `"2.4k"`) |
| `stock` | `Number` | `null` | Jumlah sisa stok untuk menampilkan bar ketersediaan |
| `maxStock` | `Number` | `100` | Kapasitas stok maksimum untuk perhitungan persentase |
| `stockLabel` | `String` | `''` | Teks kustom status stok (misal: `"Hampir Habis!"`) |
| `colors` | `Array` | `[]` | Pilihan swatch warna produk (array hex string atau objek warna) |
| `wishlistable` | `Boolean` | `false` | Menampilkan tombol love / favorit di sudut gambar |
| `isWishlisted` | `Boolean` | `false` | Status aktif tombol wishlist (mendukung `v-model:wishlisted`) |
| `countdown` | `String\|Number`| `''` | Target waktu/detik untuk ticker live Flash Sale |
| `actionText` | `String` | `'+ Keranjang'`| Label tombol aksi utama di bawah kartu |
| `actionIcon` | `String` | `'shopping_bag'`| Ikon tombol aksi |
| `actionLoading`| `Boolean` | `false` | Menampilkan status loading spinner pada tombol aksi |

### 3. Slider Props (`type="slider"` / `<CardSlider />`)
| Prop | Tipe Data | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `slides` | `Array` | `[]` | Array data slide |
| `itemsPerView` | `Number\|String`| `1` | Jumlah kartu yang tampak bersamaan dalam track |
| `controlsPosition`| `String` | `'sides'` | Penempatan tombol Prev & Next: `'sides'`, `'header'`, `'bottom'` |
| `showControls` | `Boolean` | `true` | Menampilkan tombol navigasi panah geser |
| `showIndicators`| `Boolean` | `true` | Menampilkan titik indikator pagination di bagian bawah |
| `showCounter` | `Boolean` | `false` | Menampilkan teks counter urutan slide (`01 / 05`) |
| `autoplay` | `Boolean` | `false` | Menjalankan pergantian slide otomatis |
| `autoplayInterval`| `Number` | `4000` | Durasi jeda autoplay dalam milidetik |
| `pauseOnHover` | `Boolean` | `true` | Menjeda autoplay saat kursor berada di atas slider |
| `loop` | `Boolean` | `true` | Mengulang kembali ke awal setelah slide terakhir |

### 4. 3D Flip Props (`type="flip"`)
| Prop | Tipe Data | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `flipped` | `Boolean` | `false` | Status posisi kartu sedang berbalik (mendukung `v-model:flipped`) |
| `flipOnHover` | `Boolean` | `false` | Membalik kartu otomatis saat kursor melintas di atasnya |
| `flipTriggerButton`| `Boolean` | `true` | Menampilkan tombol bawaan "Lihat Detail / Balik" |

---

## 🔔 Events API (`<Card />`)

| Event Name | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `@click` | `event: MouseEvent` | Dipancarkan saat kartu diklik (`clickable="true"`) |
| `@update:collapsed` | `val: Boolean` | Dipancarkan saat status buka/tutup lipatan berubah |
| `@wishlist` | `val: Boolean` | Dipancarkan saat tombol favorit/love produk ditekan |
| `@update:wishlisted`| `val: Boolean` | Sinkronisasi dua arah untuk `v-model:wishlisted` |
| `@add-to-cart` | — | Dipancarkan saat tombol aksi keranjang produk diklik |
| `@quick-view` | — | Dipancarkan saat tombol pratinjau cepat gambar diklik |
| `@select-color` | `color: String\|Object` | Dipancarkan saat pengguna memilih salah satu swatch warna |
| `@slide-change` | `index: Number` | Dipancarkan saat indeks slide berubah pada mode slider |
| `@update:flipped` | `val: Boolean` | Dipancarkan saat kartu 3D berbalik sisi |
| `@flip` | `val: Boolean` | Event callback pembalikan kartu 3D |

---

## 🪟 Slots API

| Slot Name | Props Tersedia | Deskripsi |
| :--- | :--- | :--- |
| `default` | — | Konten utama di dalam bodi kartu |
| `header` | — | Menggantikan seluruh blok area header kartu |
| `title` | — | Kustomisasi elemen judul |
| `subtitle` | — | Kustomisasi elemen subjudul |
| `header-actions`| — | Slot tombol/elemen aksi tambahan di sisi kanan header |
| `media` | — | Menggantikan area foto/gambar pada Product Card |
| `actions` | — | Menggantikan area tombol aksi bawah pada Product Card |
| `footer` | — | Area kaki kartu di bagian paling bawah |
| `loading` | — | Kustomisasi tampilan spinner loading overlay |
| `slide` | `{ slide, index }` | Template tampilan konten tiap slide pada Card Slider |
| `front` | — | Konten sisi depan pada mode 3D Flip Card |
| `back` | — | Konten sisi belakang pada mode 3D Flip Card |

---

## 💡 Ragam Contoh Penggunaan

### 1. Kartu Kontainer dengan Efek Spotlight & 3D Tilt
```vue
<script setup>
import Card from '@/Components/Pack/Card.vue';
</script>

<template>
  <Card
    title="Sorotan Kursor & Kemiringan 3D"
    subtitle="Arahkan kursor untuk melihat efek visual Linear / Vercel"
    icon="flare"
    icon-variant="solid"
    color-theme="primary"
    spotlight
    tilt
    hoverable
  >
    <p class="text-xs text-slate-600 dark:text-slate-300">
      Cahaya radial gradient mengikuti posisi mouse dan kartu memiringkan sudutnya secara fisik.
    </p>
  </Card>
</template>
```

### 2. Kartu Produk E-Commerce Lengkap
```vue
<script setup>
import CardProduct from '@/Components/Pack/CardProduct.vue';

const handleCart = () => {
  alert('Produk masuk ke keranjang!');
};
</script>

<template>
  <CardProduct
    title="Nike Pegasus 40 Electric Runner"
    subtitle="Bantalan Zoom Air ganda responsif."
    category="Running Shoes"
    image="/images/nike-front.jpg"
    hover-image="/images/nike-back.jpg"
    discount="-35%"
    badge="Flash Sale"
    countdown="2026-12-31T23:59:59"
    price="Rp 1.429.000"
    original-price="Rp 2.199.000"
    :rating="4.9"
    review-count="184"
    :stock="4"
    stock-label="Hampir Habis!"
    :colors="['#ef4444', '#1e293b', '#3b82f6']"
    wishlistable
    spotlight
    hoverable
    @add-to-cart="handleCart"
  />
</template>
```

### 3. Card Slider dengan Tombol Prev & Next di Header
```vue
<script setup>
import CardSlider from '@/Components/Pack/CardSlider.vue';

const promoItems = [
  { title: 'Promo QRIS 0% MDR', description: 'Bebas biaya transaksi untuk UMKM baru.' },
  { title: 'Split Payment Instant', description: 'Bagi revenue otomatis ke mitra vendor.' },
  { title: 'Koneksi Keamanan PCI-DSS', description: 'Enkripsi data kartu kredit tingkat tinggi.' },
];
</script>

<template>
  <CardSlider
    title="Pengumuman & Promo Merchant"
    subtitle="Geser menggunakan tombol panah atau geser layar sentuh"
    icon="campaign"
    :slides="promoItems"
    controls-position="header"
    autoplay
    show-counter
    show-indicators
  >
    <template #slide="{ slide, index }">
      <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <h4 class="font-bold text-sm">{{ slide.title }}</h4>
        <p class="text-xs text-slate-500 mt-1">{{ slide.description }}</p>
      </div>
    </template>
  </CardSlider>
</template>
```

### 4. Interactive 3D Flip Card (Kartu Bolak-Balik)
```vue
<script setup>
import { ref } from 'vue';
import Card from '@/Components/Pack/Card.vue';

const isFlipped = ref(false);
</script>

<template>
  <Card
    type="flip"
    v-model:flipped="isFlipped"
    color-theme="purple"
    glow
    accent-border="left"
  >
    <!-- Sisi Depan -->
    <template #front>
      <div class="p-6">
        <h3 class="font-bold text-lg">VIP Member Pass</h3>
        <p class="text-xs text-slate-400">MID: 8842-9910</p>
      </div>
    </template>

    <!-- Sisi Belakang -->
    <template #back>
      <div class="p-6">
        <h3 class="font-bold text-lg">Barcode & API Key</h3>
        <p class="text-xs font-mono text-emerald-400">sk_live_demo_98421</p>
      </div>
    </template>
  </Card>
</template>
```
