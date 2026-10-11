# Scroll Progress Component

Komponen indikator kemajuan membaca (*reading scroll progress indicator*) berbasis Vue 3 dan Tailwind CSS yang memantau pergerakan viewport secara real-time dengan 5 ragam tipe tampilan (Linear Bar, Floating Pill, Circular Gauge, Minimalis, dan Inertia NProgress style), 7 varian visual permukaan, 10 tema warna, nodus ujung presisi, serta estimasi sisa waktu membaca dinamis.

---

## 01. Overview

`ScrollProgress` (tersedia juga melalui facade resmi `ScrollProgressComponent`) memanfaatkan composable berkinerja tinggi `useScrollProgress` yang dioptimasi dengan `requestAnimationFrame` untuk menghasilkan pelacakan posisi gulir yang sangat presisi tanpa membebani thread rendering utama peramban:

- **Performa Tinggi Berbasis rAF**: Menggunakan teknik throttling `requestAnimationFrame` untuk memastikan animasi pergerakan bar berjalan stabil pada 60/120 FPS tanpa menyebabkan *layout thrashing* atau lonjakan CPU.
- **5 Ragam Tipe Visual Fleksibel**: Menyediakan 5 tipe penyajian: `bar` (bilah linear atas/bawah/kiri/kanan), `inertia` (gaya bilah pemuatan NProgress / Inertia.js dengan spinner radar), `floating-pill` (kapsul melayang Dynamic Island dengan bar mikro dan estimasi waktu), `circular` (gauge lingkaran SVG interaktif di sudut layar), dan `minimal` (garis tipis bersih tanpa rel).
- **7 Varian Gaya Visual Permukaan**: Mendukung `solid` (pekat tegas), `gradient` (gradasi multi-stop), `glow` (pendaran cahaya neon intens), `soft` (warna pastel lembut dengan border aksen), `glass` (efek kaca buram transparan), `surface` (kartu elevasi bersih), dan `outline` (garis tepi kontras).
- **Penargetan Kontainer Adaptif**: Mampu mendeteksi dan melacak pergerakan scroll pada jendela utama peramban (`window`) maupun elemen kontainer lokal tertentu melalui selector string (`target="#my-scroll-box"`), ref Vue, atau elemen DOM.
- **Nodus Ujung (*Head Indicator*) Presisi**: Pilihan dekorasi nodus ujung bilah tanpa artefak: `dot` (nodus jewel berbingkai warna), `glow-spark` (laser spark bercahaya presisi), `pulse` (radar berdenyut halus), `icon` (panah arah dinamis), atau `none`.
- **Tooltip Persentase Cerdas (*Clamped Follower*)**: Badge persentase melayang yang otomatis menyesuaikan posisi (menggantung di bawah saat bar di atas layar) dengan panah segitiga mikro dan batas geser (*clamped transform*) agar tidak pernah terpotong di tepi layar.
- **Aksi Cepat Kembali ke Atas (Back-to-Top)**: Terintegrasi langsung dengan helper pemulusan gulir (*smooth scroll*) untuk mengembalikan viewport ke posisi paling atas saat indikator diklik.
- **Estimasi Waktu Membaca Cerdas**: Mendukung kalkulasi estimasi menit membaca tersisa secara reaktif berdasarkan jumlah kata dokumen (`wordsCount`) dan kecepatan baca (`wordsPerMinute`).

### 1.1 Apa Entitas Ini

- **Vue Component Core**: Berlokasi di [ScrollProgress.vue](file:///c:/SPEED/LARAVEL-PACK-UI/resources/js/Components/Pack/ScrollProgress.vue).
- **Vue Component Facade / Alias**: Berlokasi di [ScrollProgressComponent.vue](file:///c:/SPEED/LARAVEL-PACK-UI/resources/js/Components/Pack/ScrollProgressComponent.vue).
- **Composable Engine**: Berlokasi di [useScrollProgress.js](file:///c:/SPEED/LARAVEL-PACK-UI/resources/js/Composables/Pack/useScrollProgress.js).

### 1.2 Fungsi Utama

- Memberikan umpan balik visual instan mengenai seberapa jauh pengguna telah menelusuri artikel panjang, whitepaper, atau dokumentasi teknis.
- Menyediakan tombol pintas kembali ke atas halaman yang muncul secara halus saat pengguna menggulir ke bawah.
- Menginformasikan persentase kemajuan kelengkapan membaca dokumen legalitas yang memerlukan verifikasi hingga 100%.
- Menggantikan atau melengkapi bilah progres pemuatan halaman SPA Inertia.js dengan kontrol penuh Tailwind CSS v4.

### 1.3 Kapan Digunakan

- Halaman artikel blog, berita portal, atau publikasi whitepaper panjang.
- Dokumentasi teknis, API reference, dan buku panduan pengembang bertingkat.
- Halaman syarat dan ketentuan hukum (*terms of service*) yang mewajibkan pengguna membaca hingga batas akhir sebelum tombol persetujuan aktif.
- Kontainer tabel atau modal dengan scrollbar vertikal mandiri.

### 1.4 Karakteristik Penting

- **Bebas Artefak Bayangan**: Desain nodus dan pendaran bar tidak menggunakan rotasi miring yang menyebabkan garis bergerigi, menjamin rendering bersih di layar beresolusi tinggi maupun mode gelap.
- **Z-Index Ekstrem Aman**: Menggunakan `zIndex: 99999` sehingga bilah progres di tepi atas layar tidak tertutup oleh navbar fixed atau header situs.
- **Pilihan Posisi Lengkap**: Mendukung orientasi bilah (`top`, `bottom`, `left`, `right`, `inline`) serta 5 titik jangkar floating (`bottom-right`, `bottom-left`, `top-right`, `top-left`, `bottom-center`).

---

## 02. Preview

> [!TIP]
> Pengujian visual interaktif dan live sandbox entitas ini tersedia secara native pada rute demo native:
>
> <a href="/demo/scroll-progress" target="_self" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 8px; background-color: var(--vp-c-brand-1, #4f46e5); color: #ffffff;">Buka Live Demo ScrollProgress Showcase &rarr;</a>

Portal preview menyediakan:
1. **Viewport Simulator**: Simulasi langsung tata letak Desktop (100%), Tablet (768px), dan Mobile (375px).
2. **6 Preset Cepat**: *Linear Inertia*, *Neon Glow Bar*, *Floating Pill*, *Circular Gauge*, *Rainbow Minimal*, dan *Enterprise Soft*.
3. **Kontrol Knobs Reaktif**: Menggunakan komponen resmi Pack UI (`InputField`, `ButtonSubmit`, `Card`, `Badge`) tanpa elemen HTML native.
4. **Quick Seek Slider & Buttons**: Lompat instan ke posisi 0%, 25%, 50%, 75%, dan 100%.
5. **Activity Event Logger**: Perekaman emit `@update:progress`, `@complete`, dan `@scroll-to-top` secara real-time.

---

## 03. Usage

### Pohon Konsep Penggunaan

```text
ScrollProgress / ScrollProgressComponent
├── Mode Global Jendela (Window Viewport)
│   ├── Bilah Atas Minimalis (type="bar", position="top", variant="gradient")
│   ├── Bilah Gaya Inertia.js (type="inertia", showSpinner="true", peg="true")
│   └── Tombol Melayang Sudut Kanan (type="circular", backToTop="true")
└── Mode Kontainer Terisolasi (Local Element)
    ├── Target Kotak Spesifik (target="#article-wrapper", fixed="false")
    └── Kapsul Waktu Membaca (type="floating-pill", showReadingTime="true", wordsCount="1400")
```

### Sintaks Dasar Single File Component

```vue
<script setup>
import { ScrollProgress } from '@/Components/Pack/ScrollProgressComponent.vue';

function handleComplete() {
    console.log('Dokumen telah dibaca hingga tuntas (100%)');
}

function handleBackToTop() {
    console.log('Pengguna kembali ke posisi atas halaman');
}
</script>

<template>
    <!-- Bilah Progres Linear di Atas Layar -->
    <ScrollProgress
        type="bar"
        position="top"
        color-theme="indigo"
        variant="gradient"
        thickness="md"
        head-indicator="glow-spark"
        :glow="true"
        :track="true"
        :show-percentage="true"
        percentage-position="follower"
        :clickable="true"
        :back-to-top="true"
        @complete="handleComplete"
        @scroll-to-top="handleBackToTop"
    />
</template>
```

---

## 04. Anatomy

Struktur elemen arsitektur visual `ScrollProgress`:

```text
Mode 1: Linear Top Bar
+-----------------------------------------------------------------------------------+
| [1] Track Background Rail (track / trackColor / bg-slate-200 dark:bg-slate-800)   |
| [2] Progress Bar Fill (width: dynamic%)                 [3] Head Indicator (Dot)  |
|                                                         [4] Follower Tooltip (85%)|
+-----------------------------------------------------------------------------------+

Mode 2: Floating Pill (Dynamic Island Capsule)
+-------------------------------------------------------------------------+
| [5] Action Icon  |  [6] Label / Reading Time (~4 mnt)  |  [7] Pct (64%) |
| (Arrow / Check)  |  [8] Micro Progress Bar (=================          )|
+-------------------------------------------------------------------------+

Mode 3: Circular Speedometer Gauge (Floating)
        +-----------------------------+
        |         ,-''''''-.          |
        |       ,'   [9]    `.        |
        |      /   SVG Ring   \       |
        |     |    Track       | [10] |
        |     |      64%       | Icon |
        |      \   [11] ^     /       |
        |       `.  Top     ,'        |
        |         `-......-'          |
        +-----------------------------+
```

### Rincian Bagian Anatomi

1. **Track Background Rail**: Rel jalur latar belakang abu-abu transparan penunjuk panjang total area baca.
2. **Progress Bar Fill**: Elemen bar dinamis dengan transisi lebar/tinggi halus berbasis persentase scroll aktual.
3. **Head Indicator**: Nodus presisi di ujung bar terdepan (`dot`, `pulse`, `glow-spark`, `icon`).
4. **Follower Tooltip**: Panel persentase melayang dengan panah segitiga mikro dan pergeseran koordinat adaptif agar tidak pernah keluar viewport.
5. **Action Icon (Pill)**: Lingkaran ikon navigasi yang otomatis bertransisi menjadi centang hijau saat mencapai 100%.
6. **Label & Reading Time**: Teks judul dan kalkulasi estimasi sisa menit membaca dokumen.
7. **Percentage Text**: Angka kemajuan pembacaan (0% s/d 100%).
8. **Micro Progress Bar**: Bilah mikro terintegrasi di dalam kapsul floating pill.
9. **SVG Ring & Track**: Cincin vektor dengan kalkulasi `stroke-dashoffset` dinamis.
10. **Center Icon**: Ikon Material Symbol di tengah lingkaran yang membesar lembut saat di-hover.
11. **Back-to-Top Action**: Aksi klik yang memicu fungsi `scrollToTop('smooth')`.

---

## 05. Variants

### Tipe Komponen (`type`)

| Tipe Tampilan | Karakter Visual | Skenario Penggunaan |
| :--- | :--- | :--- |
| `bar` | Bilah linear horizontal atau vertikal (**Default**) | Navigasi halaman artikel blog, portal berita, dan dokumentasi resmi. |
| `inertia` | Bilah ala Inertia.js / NProgress dengan spinner radar | Transisi halaman SPA Laravel Inertia. |
| `floating-pill` | Kapsul melayang modern dengan bar mikro dan estimasi waktu | Whitepaper panjang, laporan keuangan, riset teknis. |
| `circular` | Tombol bulat melayang dengan SVG gauge di sudut layar | Antarmuka responsif mobile, e-commerce, dashboard. |
| `minimal` | Garis linear ultra-tipis (2px) bersih tanpa rel | SaaS minimalis yang mengutamakan ruang kerja bersih. |

### Gaya Permukaan Visual (`variant`)

| Nama Varian | Karakteristik Gaya Visual |
| :--- | :--- |
| `solid` | Warna pekat tegas dengan pencahayaan tepi (*inset highlight*). |
| `gradient` | Gradasi multi-stop modern horizontal atau vertikal sesuai tema. |
| `glow` | Memancarkan drop-shadow aura cahaya neon intensif. |
| `soft` | Warna pastel transparan dengan batas garis (*border*) aksen atas dan bawah. |
| `glass` | Efek kaca buram transparan (*backdrop-blur-md*) dengan border halus. |
| `surface` | Permukaan elevasi kartu monokromatik bersih. |
| `outline` | Bilah dengan cincin garis batas kontras (*ring-1*). |

---

## 06. Sizes & Positions

### Ketebalan Bar (`thickness`)

- **`xs`**: `2px`. Garis sangat tipis, ideal untuk gaya ultra-minimalis.
- **`sm`**: `3px` (**Standar Inertia/NProgress**). Keseimbangan visual optimal.
- **`md`**: `4px`. Ketebalan ideal yang jelas terlihat di monitor resolusi tinggi.
- **`lg`**: `6px`. Ketebalan tegas untuk dokumen kepatuhan hukum wajib baca.
- **`xl`**: `8px`. Ketebalan maksimum untuk penekanan status kritis.
- **Number**: Angka piksel kustom (misal `5` menghasilkan tinggi `5px`).

### Posisi Penempatan (`position`)

- **Linear Bar & Minimal**: `'top'`, `'bottom'`, `'left'`, `'right'`, `'inline'` (relatif).
- **Circular & Floating Pill**: `'bottom-right'`, `'bottom-left'`, `'top-right'`, `'top-left'`, `'bottom-center'`, `'inline'`.

---

## 07. States

| State | Indikasi Visual | Perilaku Interaktif |
| :--- | :--- | :--- |
| **At Top (0%)** | Bar berada pada panjang 0%; jika `hideAtTop="true"`, indikator disembunyikan (*opacity-0*). | Menunggu pengguna memulai pengguliran halaman. |
| **In Progress (1-99%)** | Bar memanjang halus; nodus dan tooltip persentase bergerak mengikuti posisi kursor gulir. | Mengklik indikator (jika `clickable="true"`) akan memicu scroll halus ke posisi 0%. |
| **Completed (100%)** | Bar mencapai panjang 100% penuh; ikon bertransisi menjadi centang hijau (`check_circle`). | Memancarkan event `@complete`. |
| **Hovered (Floating / Pill)** | Tombol membesar lembut (*scale-105*) dengan bayangan lebih tegas (*shadow-xl*). | Menandakan tombol dapat diklik untuk kembali ke atas. |

---

## 08. Props / Parameters / Attributes

Tabel lengkap **33 properti** yang didukung secara penuh:

| Nama Prop | Tipe Data | Nilai Bawaan | Opsi / Rentang | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `target` | `String \| Object` | `'auto'` | `'auto'`, selector CSS (misal `'#my-box'`), ref, elemen DOM | Target elemen yang dipantau pergerakan scroll-nya. |
| `type` | `String` | `'bar'` | `'bar'`, `'inertia'`, `'floating-pill'`, `'circular'`, `'minimal'` | Ragam tipe komponen indikator scroll. |
| `position` | `String` | `'top'` | `'top'`, `'bottom'`, `'left'`, `'right'`, `'bottom-right'`, dll | Titik penempatan indikator pada layar atau kontainer. |
| `fixed` | `Boolean` | `true` | `true`, `false` | Memasang posisi menempel pada viewport (`fixed`) atau lokal (`absolute`). |
| `zIndex` | `Number \| String` | `99999` | Angka integer / string | Tingkat tumpukan z-index agar selalu di atas navbar. |
| `color` | `String` | `''` | String HEX / RGB kustom (misal `'#6366f1'`) | Menimpa warna tema aktif pada bar, cincin SVG, dan pendaran glow. |
| `colorTheme` | `String` | `'indigo'` | `'default'`, `'dark'`, `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'rainbow'` | Palet tema warna semantik terpadu. |
| `variant` | `String` | `'solid'` | `'solid'`, `'surface'`, `'soft'`, `'gradient'`, `'glass'`, `'glow'`, `'outline'` | Gaya visual pewarnaan bar dan kontainer. |
| `glow` | `Boolean` | `false` | `true`, `false` | Mengaktifkan bayangan pendaran cahaya bersinar di sekitar bar/tombol. |
| `track` | `Boolean` | `false` | `true`, `false` | Menampilkan rel latar belakang di belakang bar. |
| `trackColor` | `String` | `''` | Kelas CSS Tailwind / warna kustom | Menyesuaikan warna rel latar belakang track. |
| `barColor` | `String` | `''` | Kelas CSS Tailwind kustom | Menyesuaikan kelas warna elemen pengisi bar langsung. |
| `thickness` | `String \| Number` | `'sm'` | `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, angka px | Ketebalan bilah linear atau garis cincin SVG lingkaran. |
| `rounded` | `String` | `'none'` | `'none'`, `'sm'`, `'md'`, `'lg'`, `'full'` | Kelengkungan sudut pada ujung bilah kemajuan. |
| `headIndicator` | `String` | `'none'` | `'none'`, `'dot'`, `'pulse'`, `'glow-spark'`, `'icon'` | Nodus dekorasi di ujung bilah kemajuan. |
| `size` | `Number \| String` | `56` | Angka piksel positif (diameter) | Diameter fisik lingkaran untuk tipe `circular`. |
| `showPercentage` | `Boolean` | `false` | `true`, `false` | Menampilkan angka persentase kemajuan membaca. |
| `percentagePosition` | `String` | `'follower'` | `'follower'`, `'inside'`, `'center'` | Penempatan badge persentase (melayang, di dalam bar, atau tengah). |
| `prefix` | `String` | `''` | String teks | Awalan sebelum angka persentase (misal `'Hal '`). |
| `suffix` | `String` | `'%'` | String teks | Akhiran setelah angka persentase (default `'%'`). |
| `label` | `String` | `''` | String teks | Label judul teks pada floating pill atau circular. |
| `showReadingTime` | `Boolean` | `false` | `true`, `false` | Menampilkan estimasi menit membaca tersisa pada floating pill. |
| `wordsCount` | `Number` | `0` | Angka positif | Total jumlah kata dalam artikel untuk kalkulasi waktu baca. |
| `wordsPerMinute` | `Number` | `200` | Angka positif (default 200) | Kecepatan baca rata-rata per menit untuk kalkulasi estimasi. |
| `showIcon` | `Boolean` | `true` | `true`, `false` | Menampilkan ikon navigasi pada tipe circular atau pill. |
| `showText` | `Boolean` | `true` | `true`, `false` | Menampilkan teks label atau persentase pada circular atau pill. |
| `icon` | `String` | `''` | Nama Material Symbol | Ikon kustom untuk tombol circular atau floating pill. |
| `completeIcon` | `String` | `'check_circle'` | Nama Material Symbol | Ikon yang ditampilkan saat progres mencapai 100%. |
| `clickable` | `Boolean` | `false` | `true`, `false` | Mengizinkan klik pada bar/tombol untuk kembali ke atas halaman. |
| `backToTop` | `Boolean` | `false` | `true`, `false` | Mengaktifkan fungsi aksi otomatis scroll to top saat diklik. |
| `hideAtTop` | `Boolean` | `false` | `true`, `false` | Menyembunyikan indikator saat posisi scroll berada di 0%. |
| `threshold` | `Number` | `1` | Angka persentase (default 1) | Ambang batas scroll atas untuk status `isAtTop`. |
| `showSpinner` | `Boolean` | `false` | `true`, `false` | Menampilkan radar spinner berputar NProgress di pojok kanan atas. |
| `peg` | `Boolean` | `false` | `true`, `false` | Mengaktifkan pendaran bayangan di ujung terdepan bar. |

---

## 09. Slots / Content

| Nama Slot | Scope Parameter yang Disediakan | Deskripsi Penggunaan |
| :--- | :--- | :--- |
| `#percentage` | `{ progress: Number }` | Mengambil alih format tampilan teks persentase angka. |
| `#icon` | `{ isComplete: Boolean }` | Mengambil alih tampilan ikon di dalam tombol circular atau floating pill. |
| `#default` | `{ progress: Number, isComplete: Boolean }` | Mengambil alih seluruh konten internal pada tombol circular. |

---

## 10. Events & Exposed Methods

### Events yang Dipancarkan

| Nama Event | Parameter Payload | Waktu Pemicuan (Trigger Lifecycle) |
| :--- | :--- | :--- |
| `@update:progress` | `(value: Number)` | Dipancarkan secara real-time setiap kali nilai persentase scroll berubah (0 s/d 100). |
| `@complete` | `(value: Number)` | Dipancarkan saat scroll mencapai batas paling bawah dokumen (progress >= 99.5%). |
| `@scroll-to-top` | — | Dipancarkan saat pengguna mengklik tombol dan memicu pengguliran ke atas. |

### Metode Terbuka (*Exposed Template Ref*)

Komponen mengekspos metode dan state berikut melalui `defineExpose`:

```vue
<script setup>
import { ref } from 'vue';
import ScrollProgress from '@/Components/Pack/ScrollProgress.vue';

const progressRef = ref(null);

function scrollToTopManually() {
    progressRef.value?.scrollToTop('smooth');
}

function jumpToFiftyPercent() {
    progressRef.value?.scrollToProgress(50, 'smooth');
}
</script>

<template>
    <ScrollProgress ref="progressRef" />
</template>
```

| Nama Metode / Properti Expose | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `scrollToTop(behavior = 'smooth')` | `Function` | Menggulir halaman atau kontainer target kembali ke posisi paling atas. |
| `scrollToProgress(targetPct, behavior)` | `Function` | Menggulir halaman atau kontainer target langsung ke persentase tertentu (0 s/d 100). |
| `progress` | `Ref<Number>` | Nilai persentase scroll saat ini (0 s/d 100). |
| `isComplete` | `ComputedRef<Boolean>` | Status boolean apakah scroll telah mencapai akhir halaman. |
| `readingTimeRemaining` | `ComputedRef<Number>` | Estimasi sisa menit membaca dokumen yang belum diselesaikan. |

---

## 11. Code Example

### Contoh 1: Bilah Linear dengan Follower Tooltip Cerdas

```vue
<script setup>
import ScrollProgress from '@/Components/Pack/ScrollProgress.vue';

function onScrollTop() {
    console.log('Pengguna kembali ke posisi atas halaman');
}
</script>

<template>
    <ScrollProgress
        type="bar"
        position="top"
        color-theme="indigo"
        variant="gradient"
        thickness="md"
        head-indicator="glow-spark"
        :glow="true"
        :track="true"
        :show-percentage="true"
        percentage-position="follower"
        :clickable="true"
        :back-to-top="true"
        @scroll-to-top="onScrollTop"
    />
</template>
```

### Contoh 2: Kapsul Floating Pill dengan Estimasi Waktu Baca

```vue
<template>
    <ScrollProgress
        type="floating-pill"
        position="bottom-right"
        color-theme="indigo"
        variant="glass"
        label="Artikel"
        :show-reading-time="true"
        :words-count="1400"
        :clickable="true"
        :back-to-top="true"
    />
</template>
```

### Contoh 3: Circular Speedometer Gauge dengan Centang Otomatis

```vue
<template>
    <ScrollProgress
        type="circular"
        position="bottom-right"
        color-theme="emerald"
        variant="solid"
        :size="56"
        thickness="md"
        :show-percentage="true"
        :clickable="true"
        :back-to-top="true"
        :hide-at-top="true"
    />
</template>
```

---

## 12. Result / Behavior

1. **Throttling Berbasis rAF Bebas Beban CPU**: Composable `useScrollProgress` mendelegasikan pembaruan posisi ke siklus `requestAnimationFrame` berikutnya sehingga beban CPU peramban tetap di bawah 1%.
2. **Penempatan Tooltip Bebas Tabrakan**: Saat bilah berada di posisi atas layar (`top`), badge persentase otomatis menggantung di bawah bilah (`top-full mt-2`) sehingga tidak pernah menutupi bilah navigasi atau URL.
3. **Clamping Koordinat Horisontal**: Transformasi `translateX(-${currentProgress}%)` memastikan tooltip tidak pernah terpotong di tepi kiri (0%) maupun tepi kanan (100%) layar.
4. **Bebas Artefak Bayangan**: Nodus dan pendaran ujung dirancang rata horizontal sehingga tidak menimbulkan garis miring bergerigi di layar.
5. **Pengguliran Mulus Terstandar**: Menggunakan pemanggilan native `window.scrollTo({ top: 0, behavior: 'smooth' })` yang ramah bagi pengguna tanpa loncatan visual mendadak.

---

## 13. Customization

### Menggunakan Warna HEX Kustom

```vue
<template>
    <ScrollProgress
        type="bar"
        position="top"
        color="#10b981"
        variant="glow"
        thickness="md"
    />
</template>
```

### Melacak Scroll pada Kontainer Modal Terisolasi

```vue
<template>
    <div id="modal-scroll-area" class="relative h-96 overflow-y-auto p-4 border rounded-xl">
        <ScrollProgress
            target="#modal-scroll-area"
            type="bar"
            position="top"
            :fixed="false"
            color-theme="indigo"
            thickness="sm"
        />
        <div class="space-y-4">
            <p v-for="n in 20" :key="n">Paragraf panjang isi modal ke-{{ n }}...</p>
        </div>
    </div>
</template>
```

---

## 14. Accessibility

- **WAI-ARIA Progressbar Role Pattern**: Elemen bar menerapkan `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="100"`, dan `aria-valuenow="Math.round(currentProgress)"`.
- **Keyboard Navigation pada Tombol Back-to-Top**: Tombol circular dan floating pill dapat difokuskan menggunakan tombol `Tab` dan diaktifkan dengan menekan `Enter` atau `Space`.
- **Dukungan Reduced Motion**: Menghormati preferensi pengguna `prefers-reduced-motion: reduce` dengan menonaktifkan transisi animasi jika diperlukan.

---

## 15. Responsive Behavior

- **Mobile Viewport (< 640px)**:
  - Posisi floating corner menggunakan padding adaptif `bottom-4 right-4 sm:bottom-6 sm:right-6`.
  - Tipe `bar` di posisi `'top'` berukuran tipis (`sm` / 3px) sangat direkomendasikan agar tidak mengurangi area baca ponsel.
  - Tipe `circular` berdiameter 48px–56px memberikan touch target sentuh jari yang nyaman.
- **Tablet Viewport (640px – 1024px)**:
  - Tipe `floating-pill` tampil proporsional di sudut layar tanpa menutupi tombol formulir utama.
- **Desktop Viewport (> 1024px)**:
  - Seluruh varian dan efek pendaran glow tampil maksimal di layar monitor lebar.

---

## 16. Do / Don't

| Do (Praktik Direkomendasikan) | Don't (Praktik Dihindari) |
| :--- | :--- |
| **Gunakan `hideAtTop="true"` pada tombol circular**: Menghindari kekacauan visual saat pengguna baru membuka halaman di posisi 0%. | **Jangan gunakan ketebalan di atas 8px pada bar atas**: Ketebalan berlebihan mendominasi layar dan mengalihkan fokus pembaca dari artikel. |
| **Gunakan `percentage-position="follower"` untuk visual interaktif**: Memberikan petunjuk visual posisi baca dinamis yang modern. | **Jangan menumpuk ScrollProgress dengan sticky navbar tanpa z-index aman**: Pastikan bilah progres tidak terpotong oleh bayangan navbar. |
| **Pasang `clickable="true"` pada tipe circular**: Memberikan fungsi ganda sebagai navigasi kembali ke atas halaman yang praktis. | **Jangan memasang ScrollProgress pada halaman pendek tanpa scroll**: Membingungkan pengguna jika bar selalu menunjukkan angka 100%. |

---

## 17. Examples / Recipes

### Recipe 1: Kapsul Waktu Baca pada Artikel Berita Panjang

```vue
<template>
    <ScrollProgress
        type="floating-pill"
        position="bottom-center"
        color-theme="indigo"
        variant="glass"
        label="Artikel"
        :show-reading-time="true"
        :words-count="1850"
        :clickable="true"
        :back-to-top="true"
    />
</template>
```

### Recipe 2: Syarat & Ketentuan Kepatuhan Wajib Baca

```vue
<script setup>
import { ref } from 'vue';
import ScrollProgress from '@/Components/Pack/ScrollProgress.vue';

const isAgreed = ref(false);
const hasReadToBottom = ref(false);

function onComplete() {
    hasReadToBottom.value = true;
}
</script>

<template>
    <div id="legal-box" class="relative h-64 overflow-y-auto p-4 border rounded-xl">
        <ScrollProgress
            target="#legal-box"
            :fixed="false"
            color-theme="emerald"
            @complete="onComplete"
        />
        <div class="space-y-3 text-xs">
            <p v-for="i in 15" :key="i">Klausul hukum perjanjian perbankan nomor {{ i }}...</p>
        </div>
    </div>

    <button
        type="button"
        :disabled="!hasReadToBottom"
        class="mt-4 px-4 py-2 text-xs rounded-xl bg-emerald-600 text-white font-bold disabled:opacity-40"
    >
        Saya Menyetujui Seluruh Klausul
    </button>
</template>
```

---

## 18. Related Components

- [ButtonSubmit](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/button-submit.md): Tombol aksi persetujuan yang diaktifkan setelah dokumen digulir hingga 100%.
- [Badge](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/badge.md): Penanda status atau kategori yang sering disandingkan dengan estimasi waktu baca dokumen.
- [Card](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/card.md): Kontainer tata letak dokumen yang menjadi target scroll lokal.
- [InputField](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/input-field.md): Komponen input form yang digunakan dalam formulir bertingkat dengan pemantau scroll.

---

## 19. Notes / Limitations

- **Deteksi Kontainer Overflow**: Jika menggunakan prop `target` kustom, pastikan elemen kontainer yang ditunjuk memiliki aturan CSS `overflow-y: auto` atau `overflow-y: scroll` serta batas tinggi (`height` atau `max-height`) yang jelas.
- **Dukungan Peramban**: Metode `requestAnimationFrame` dan `scrollTo({ behavior: 'smooth' })` didukung secara native oleh seluruh peramban modern (Chrome, Firefox, Safari, Edge).
