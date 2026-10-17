# Card Component

Komponen kontainer konten serbaguna yang dirancang untuk kartu dashboard analitik, katalog produk e-commerce, slider konten, hingga kartu bolak-balik 3D (3D Flip Card). Komponen ini mematuhi standar desain Laravel Pack UI dengan dukungan tema adaptif terang/gelap, sudut dinamis, aksen warna, efek spotlight kursor, dan paralaks tilt interaktif.

---

## 01. Overview

`Card.vue` adalah komponen pembungkus visual atomik dan terstruktur yang mengelompokkan informasi terkait dalam satu kesatuan antarmuka yang bersih, modular, dan terorganisir.

### 1.1 Apa Entitas Ini
Komponen Vue 3 berbasis Composition API (`packages/laravel-pack-ui/resources/js/Components/Pack/Card.vue`) yang berfungsi sebagai bingkai modular konten dengan 7 varian gaya, 9 skema warna tema, 4 mode operasional (default, product, slider, flip), serta kemampuan interaksi mikro mutakhir.

### 1.2 Fungsi Utama
- Mengelompokkan data metrik analitik, grafik, atau tabel dalam panel dashboard terstruktur.
- Menampilkan item produk belanja lengkap dengan gambar, badge diskon, varian warna, rating bintang, dan tombol aksi beli.
- Menyediakan mode akordeon ringkas (*collapsible*) untuk menghemat ruang vertikal antarmuka.
- Memberikan interaksi visual premium melalui *cursor-tracking spotlight* dan *3D tilt parallax*.
- Menyediakan kartu bolak-balik (*flip card*) dua sisi untuk kartu loyalitas, lisensi, atau kartu pembayaran.

### 1.3 Kapan Digunakan
- Pada halaman dashboard admin untuk membungkus KPI statistik, widget ringkasan, dan grafik metrik.
- Pada etalase e-commerce untuk menyajikan katalog barang secara seragam dalam grid responsif.
- Pada formulir pengaturan panjang yang membutuhkan pemisahan logis antar seksi dengan kemampuan ciut-bentang (*collapsible*).
- Pada modul presentasi fitur atau profil kartu keanggotaan interaktif.

### 1.4 Karakteristik Penting
- **Zero Layout Shift**: Mengunci rasio dan struktur kontainer sehingga pergeseran tata letak (*layout shift*) terminimalisir saat konten asinkron dimuat.
- **Micro-Interaction Aware**: Dilengkapi mekanisme perhitungan pointer kursor untuk menghasilkan efek pendaran radial (*spotlight*) dan rotasi matriks 3D (*tilt*) yang halus tanpa membebani performa browser.
- **Composable Subcomponents**: Struktur internal memisahkan area header, body, dan footer secara modular, memungkinkan penggantian total melalui slot maupun kontrol otomatis melalui properti.

---

## 02. Preview

> [!TIP]
> Pengujian visual dan showcase interaktif entitas ini tersedia secara native pada portal pratinjau aplikasi:
>
> <a href="/preview/card" target="_self" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 8px; background-color: var(--vp-c-brand-1, #4f46e5); color: #ffffff;">Buka Live Preview Komponen Card &rarr;</a>

---

## 03. Usage

### Pohon Konsep Penggunaan

```text
Card
├── Mode Operasional
│   ├── Default (Kontainer dashboard serbaguna, metrik, form wrapper)
│   ├── Product (Etalase e-commerce, gambar, rating, harga, keranjang)
│   ├── Slider (Koleksi multi-kartu dengan paginasi atau carousel)
│   └── Flip (Dua sisi depan-belakang dengan transisi putar 3D)
├── Gaya Visual
│   ├── Varian (default, bordered, elevated, flat, glass, gradient, accent)
│   └── Tema Warna (default, primary, indigo, emerald, purple, amber, rose, cyan, dark)
└── Peningkatan Interaktif
    ├── Collapsible (Ciut-bentang area body dengan animasi tinggi)
    ├── Spotlight (Efek pendar kursor radial dinamis)
    └── 3D Tilt (Efek perspektif miring responsif posisi pointer)
```

### Matriks Kapan Digunakan vs Dihindari

| Kasus Penggunaan | Gunakan Card | Hindari (Gunakan Alternatif) |
|---|---|---|
| Widget ringkasan metrik dashboard | Ya (`variant="default"` atau `"elevated"`) | Jangan gunakan Modal dialog |
| Kartu item katalog e-commerce | Ya (`type="product"`) | Hindari membuat div manual berulang |
| Pesan umpan balik sukses/gagal inline | Tidak | Gunakan Alert |
| Panel samping keranjang belanja melayang | Tidak | Gunakan CartDrawer |
| Dialog konfirmasi aksi berbahaya | Tidak | Gunakan Modal |

### Contoh Penggunaan Cepat

```vue
<script setup>
import Card from '@/Components/Pack/Card.vue';
</script>

<template>
  <!-- Kartu Analitik Sederhana -->
  <Card
    title="Total Pendapatan"
    subtitle="Agregasi transaksi berhasil bulan ini"
    icon="payments"
    badge="+14.8%"
    color-theme="emerald"
    accent-border="top"
  >
    <div class="text-3xl font-extrabold text-slate-900 dark:text-white">
      Rp 148.520.000
    </div>
    <p class="text-xs text-slate-500 mt-1">
      Meningkat dibanding periode bulan sebelumnya.
    </p>
  </Card>
</template>
```

---

## 04. Anatomy

### Diagram Struktur Anatomi

```text
+--------------------------------------------------------------+
| [Accent Border: top / left / bottom]                        |
| [Card Outer Container: rounded, shadow, theme border/bg]     |
|                                                              |
| [HEADER AREA]                                                |
| (Icon) Title Text                       [Badge] [CollapseBtn]|
|        Subtitle description                                  |
+--------------------------------------------------------------+
| [BODY AREA: Default Slot]                                    |
|                                                              |
| Konten utama, metrik, grafik, tabel, atau input formulir...  |
|                                                              |
+--------------------------------------------------------------+
| [FOOTER AREA: Slot Footer]                                   |
| Status info / Metadata                  [Aksi Batal] [Simpan]|
+--------------------------------------------------------------+
```

### Komponen Anatomi Rinci
1. **Accent Border**: Garis aksen warna semantik pada sisi atas, kiri, atau bawah kartu untuk identifikasi kategori cepat.
2. **Card Outer Container**: Elemen pembungkus utama dengan isolasi overflow, border tema halus, dan latar belakang adaptif terang/gelap.
3. **Card Header**: Area penampang atas yang mengintegrasikan ikon Google Material Symbol, teks judul (*title*), teks subjudul (*subtitle*), lencana status (*badge*), dan tombol ciut-bentang (*collapsible toggle*).
4. **Card Body**: Area muatan konten dinamis utama yang diproyeksikan melalui slot bawaan (*default slot*).
5. **Card Footer**: Area bawah terpisah yang dirancang khusus untuk metadata ringkas, status sinkronisasi, atau tombol aksi konfirmasi formulir.
6. **Spotlight Radial Overlay**: Lapisan kursor transparan dengan gradasi radial yang mengikuti koordinat `(x, y)` tetikus.
7. **3D Parallax Canvas**: Transformasi CSS `perspective(1000px) rotateX() rotateY()` yang menghasilkan ilusi kedalaman spasial saat pengguna mengarahkan kursor.

---

## 05. Variants

### Gaya Permukaan Visual (`variant`)
- **default**: Latar belakang putih bersih (`bg-white dark:bg-slate-900`) dengan border halus (`border-slate-200 dark:border-slate-800`) dan bayangan lembut.
- **bordered**: Garis tepi tegas (`border-2`) dengan bayangan minimal untuk antarmuka berdensitas informasi tinggi.
- **elevated**: Bayangan melayang berlapis (*deep layered drop shadow*) yang menonjolkan kartu dari permukaan bidang latar belakang.
- **flat**: Latar belakang abu-abu tenang (`bg-slate-100 dark:bg-slate-800/60`) tanpa garis tepi, cocok untuk kartu sekunder.
- **glass**: Efek kaca buram modern (*frosted glassmorphism*) memanfaatkan `backdrop-blur-md` dan transparansi parsial latar.
- **gradient**: Latar belakang gradasi warna lembut yang berorientasi diagonal dari terang ke gelap.
- **accent**: Latar belakang dengan sentuhan rona warna tema terintegrasi secara halus.

### Mode Operasional Kartu (`type`)
- **default**: Kartu serbaguna dengan header, body, dan footer standar.
- **product**: Tata letak khusus e-commerce dengan preview gambar, thumbnail sekunder on-hover, harga coret, rating bintang, dan tombol pembelian langsung.
- **slider**: Kontainer kartu berformat geser (*carousel*) dengan navigasi prev/next bawaan.
- **flip**: Kartu dua sisi (depan dan belakang) yang berputar 180 derajat pada sumbu Y saat pemicu putar ditekan.

### Tema Warna Semantik (`colorTheme`)
Tersedia 9 skema palet tema: `default`, `primary`, `indigo`, `emerald`, `purple`, `amber`, `rose`, `cyan`, dan `dark`.

---

## 06. Sizes

### Kelengkungan Sudut (`rounded`)
| Nilai Prop | Kelas CSS Tailwind | Keterangan |
|---|---|---|
| `none` | `rounded-none` | Sudut siku tanpa kelengkungan |
| `sm` | `rounded-sm` | Kelengkungan mikro (2px) |
| `md` | `rounded-md` | Kelengkungan standar ringkas (6px) |
| `lg` | `rounded-lg` | Kelengkungan reguler kartu (8px) |
| `xl` | `rounded-xl` | Kelengkungan modern (12px) |
| `2xl` | `rounded-2xl` | Standar bawaan kartu Laravel Pack UI (16px) |
| `3xl` | `rounded-3xl` | Sudut sangat melengkung (24px) |
| `full` | `rounded-full` | Bentuk kapsul utuh (biasanya untuk kartu pill) |

### Padding Dalam Kontainer (`padding`)
| Nilai Prop | Padding Header & Body | Rekomendasi Kasus |
|---|---|---|
| `none` | `p-0` | Gambar penuh tepi atau tata letak kustom |
| `xs` | `p-2.5` | Kartu ringkas dalam sidebar sempit |
| `sm` | `p-3.5` | Widget metrik miniatur |
| `md` | `p-4 sm:p-5` | Standar bawaan dashboard analitik |
| `lg` | `p-6 sm:p-7` | Formulir data profil atau kartu landing page |
| `xl` | `p-7 sm:p-9` | Banner promosi atau fitur unggulan hero |

---

## 07. States

- **Default**: Status pasif saat kartu diam dan menampilkan informasi sebagaimana mestinya.
- **Hoverable**: Kartu mengangkat posisinya ke atas (`-translate-y-1`) dengan penambahan kedalaman bayangan saat kursor mouse melayang di atasnya.
- **Clickable**: Menampilkan kursor bertipe pointer (`cursor-pointer`) dan memberikan umpan balik skala mikro (`active:scale-[0.99]`) saat diklik.
- **Collapsible / Collapsed**: Area body menutup secara otomatis dengan transisi tinggi (`transition-all duration-300`) saat header ditekan.
- **Loading State**: Menampilkan lapisan penahan atau placeholder skeleton yang berkedip saat data latar belakang sedang ditarik.
- **Spotlight Active**: Lapisan pendaran radial aktif merespons koordinat tetikus seketika pengguna menggerakkan kursor di atas kartu.
- **3D Tilt Active**: Permukaan kartu mengalami transformasi sudut miring dinamis berdasarkan posisi relatif kursor dari pusat kartu.

---

## 08. Props / Attributes

### Core Props (Semua Tipe)

| Prop | Tipe Data | Default | Keterangan |
|---|---|---|---|
| `type` | `String` | `'default'` | Tipe kartu: `'default'`, `'product'`, `'slider'`, `'flip'` |
| `variant` | `String` | `'default'` | Gaya visual: `'default'`, `'bordered'`, `'elevated'`, `'flat'`, `'glass'`, `'gradient'`, `'accent'` |
| `colorTheme` | `String` | `'default'` | Skema warna: `'default'`, `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'` |
| `title` | `String` | `''` | Teks judul utama kartu |
| `subtitle` | `String` | `''` | Teks subjudul penjelasan di bawah judul |
| `icon` | `String` | `''` | Nama ikon Google Material Symbol pada header |
| `iconVariant` | `String` | `'subtle'` | Tampilan kotak ikon: `'subtle'`, `'solid'`, `'outline'`, `'none'` |
| `iconColor` | `String` | `''` | Kelas warna kustom untuk ikon |
| `badge` | `String` | `''` | Teks lencana pada sudut kanan atas kartu |
| `badgeVariant` | `String` | `'soft'` | Gaya varian lencana: `'soft'`, `'solid'`, `'outline'` |
| `badgeColor` | `String` | `''` | Warna tema kustom untuk badge |
| `padding` | `String` | `'md'` | Ruang spasi dalam: `'none'`, `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'` |
| `rounded` | `String` | `'2xl'` | Radius kelengkungan sudut kartu |
| `accentBorder` | `String` | `'none'` | Garis aksen penanda: `'none'`, `'top'`, `'left'`, `'bottom'` |
| `collapsible` | `Boolean` | `false` | Mengaktifkan tombol toggle buka-tutup konten |
| `collapsed` | `Boolean` | `false` | Kondisi awal keterbukaan kartu jika collapsible aktif |
| `hoverable` | `Boolean` | `false` | Efek melayang dan peningkatan bayangan saat di-hover |
| `clickable` | `Boolean` | `false` | Menjadikan seluruh permukaan kartu dapat diklik |
| `loading` | `Boolean` | `false` | Menampilkan overlay indikator proses pemuatan |
| `showHeader` | `Boolean` | `true` | Menampilkan atau menyembunyikan blok header kartu |
| `showFooter` | `Boolean` | `true` | Menampilkan atau menyembunyikan blok footer kartu |
| `spotlight` | `Boolean` | `false` | Mengaktifkan efek pendaran kursor radial dinamis |
| `tilt` | `Boolean` | `false` | Mengaktifkan efek miring 3D mengikuti kursor |
| `maxTilt` | `Number` | `8` | Derajat kemiringan maksimal untuk efek 3D tilt |

### Props Khusus Product Card (`type="product"`)

| Prop | Tipe Data | Default | Keterangan |
|---|---|---|---|
| `image` | `String` | `''` | URL berkas gambar utama produk |
| `hoverImage` | `String` | `''` | URL berkas gambar sekunder yang muncul saat mouse diarahkan |
| `price` | `String|Number` | `''` | Harga jual produk saat ini |
| `originalPrice` | `String|Number` | `''` | Harga coret sebelum potongan diskon |
| `discount` | `String` | `''` | Teks badge persentase potongan harga (misal: `'20% OFF'`) |
| `rating` | `Number` | `0` | Nilai peringkat kepuasan konsumen (skala 0 sampai 5) |
| `reviewCount` | `Number|String` | `0` | Total ulasan konsumen yang masuk |
| `category` | `String` | `''` | Kategori taksonomi produk |
| `stock` | `Number` | `null` | Jumlah sisa persediaan barang |
| `wishlistable` | `Boolean` | `false` | Menampilkan tombol aksi favorit/wishlist |
| `isWishlisted` | `Boolean` | `false` | Status aktif ikon hati wishlist |
| `colors` | `Array` | `[]` | Daftar palet swatch warna yang dapat dipilih |

---

## 09. Slots

| Nama Slot | Keterangan | Lingkup Parameter |
|---|---|---|
| `default` | Konten isi utama kartu (body) | - |
| `header` | Penggantian kustom seluruh blok header kartu | - |
| `header-actions` | Penambahan elemen aksi kustom di sisi kanan header sebelum tombol collapse | - |
| `footer` | Area bawah kartu untuk aksi tombol atau catatan metadata | - |
| `media` | Area media di atas header (cocok untuk gambar produk atau video) | - |
| `actions` | Slot tombol aksi belanja pada mode produk | - |
| `rating` | Slot kustom indikator rating bintang produk | - |
| `slide` | Template kartu item individual pada mode slider | `{ slide, index }` |
| `back` | Sisi belakang khusus untuk mode kartu bolak-balik (`type="flip"`) | - |

---

## 10. Events / Interactions

| Nama Event | Parameter | Deskripsi Pemancaran |
|---|---|---|
| `click` | `MouseEvent` | Dipancarkan saat pengguna mengklik kartu (jika `clickable="true"`) |
| `update:collapsed` | `Boolean` | Dipancarkan seketika status ciut-bentang kartu berubah |
| `update:wishlisted` | `Boolean` | Dipancarkan saat status favorit berubah (`v-model:wishlisted`) |
| `wishlist` | `Boolean` | Dipancarkan saat ikon tombol wishlist pada mode produk ditekan |
| `quick-view` | - | Dipancarkan saat tombol pratinjau cepat produk diklik |
| `add-to-cart` | - | Dipancarkan saat tombol '+ Keranjang' pada kartu produk diklik |
| `select-color` | `String|Object` | Dipancarkan saat salah satu varian warna produk dipilih |
| `slide-change` | `Number` | Dipancarkan saat indeks slide aktif berganti pada `type="slider"` |
| `update:flipped` | `Boolean` | Dipancarkan saat status sisi kartu berbalik (`v-model:flipped`) |
| `flip` | `Boolean` | Dipancarkan saat kartu berputar dari depan ke belakang atau sebaliknya |

---

## 11. Code Example

### 11.1 Kartu Dashboard Analitik dengan Aksen Warna
```vue
<script setup>
import Card from '@/Components/Pack/Card.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';
</script>

<template>
  <Card
    title="Pertumbuhan Pelanggan"
    subtitle="Data pendaftaran akun 7 hari terakhir"
    icon="group_add"
    color-theme="indigo"
    accent-border="left"
    variant="bordered"
    hoverable
  >
    <template #header-extra>
      <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
        Mingguan
      </span>
    </template>

    <div class="space-y-3">
      <div class="flex items-baseline gap-2">
        <span class="text-3xl font-black text-slate-900 dark:text-white">1.240</span>
        <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">+12% vs minggu lalu</span>
      </div>
      <div class="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div class="h-full bg-indigo-600 rounded-full" style="width: 78%"></div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between text-xs text-slate-500">
        <span>Target: 1.500 user</span>
        <a href="#" class="font-semibold text-indigo-600 hover:underline">Lihat Rincian</a>
      </div>
    </template>
  </Card>
</template>
```

### 11.2 Kartu Produk E-Commerce Interaktif
```vue
<script setup>
import Card from '@/Components/Pack/Card.vue';

function handleAddToCart() {
  alert('Produk berhasil ditambahkan ke keranjang belanja');
}
</script>

<template>
  <Card
    type="product"
    title="Wireless Noise-Cancelling Headphones"
    category="Audio & Gadget"
    price="Rp 2.499.000"
    original-price="Rp 3.199.000"
    discount="22% OFF"
    :rating="4.9"
    :rating-count="342"
    image="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"
    wishlistable
    hoverable
    @add-to-cart="handleAddToCart"
  />
</template>
```

### 11.3 Kartu Bolak-Balik 3D (3D Membership Flip Card)
```vue
<script setup>
import Card from '@/Components/Pack/Card.vue';
</script>

<template>
  <Card
    type="flip"
    color-theme="purple"
    variant="gradient"
    class="w-full max-w-sm h-56"
  >
    <template #front="{ flipCard }">
      <div class="flex flex-col justify-between h-full p-6 text-white">
        <div class="flex justify-between items-center">
          <span class="text-xs uppercase font-bold tracking-widest opacity-80">VIP Membership</span>
          <button @click="flipCard" class="text-xs underline opacity-80 hover:opacity-100">Info Balik &rarr;</button>
        </div>
        <div>
          <div class="text-lg font-mono tracking-widest mb-1">**** **** **** 8829</div>
          <div class="text-xs opacity-75">Alexandria Morgan</div>
        </div>
      </div>
    </template>

    <template #back="{ flipCard }">
      <div class="flex flex-col justify-between h-full p-6 text-white bg-slate-900 rounded-2xl">
        <div class="text-xs opacity-80">Pindai QR ini pada resepsionis lounge eksekutif.</div>
        <div class="flex justify-center">
          <div class="w-20 h-20 bg-white rounded-lg p-1.5 flex items-center justify-center text-slate-900 text-xs font-mono">
            [QR CODE]
          </div>
        </div>
        <button @click="flipCard" class="text-xs text-center underline opacity-80 hover:opacity-100">Kembali ke Depan</button>
      </div>
    </template>
  </Card>
</template>
```

---

## 12. Result / Behavior

- **Transisi Collapsible**: Menghitung tinggi elemen secara dinamis dan menerapkan kurva bezier halus (`transition-[max-height,opacity]`) sehingga tidak terjadi lonjakan visual mendadak.
- **Spotlight Dynamics**: Perhitungan offset kursor tetikus dinormalisasi terhadap dimensi *bounding client rect* kartu, menghasilkan gradien radial yang bergerak presisi mengikuti posisi tetikus dengan *blend-mode* halus.
- **3D Tilt Geometry**: Rotasi kemiringan dihitung melalui formula:
  $$\text{rotX} = -\left(\frac{y - \text{centerY}}{\text{height}}\right) \times \text{maxTilt}$$
  $$\text{rotY} = \left(\frac{x - \text{centerX}}{\text{width}}\right) \times \text{maxTilt}$$
  Kalkulasi ini menghasilkan respons kinetik instan yang kembali ke orientasi netral `(0, 0)` secara halus saat kursor meninggalkan area kartu.
- **Transformasi Flip**: Menggunakan atribut CSS `transform-style: preserve-3d` dengan rotasi `rotateY(180deg)` dan `backface-visibility: hidden` pada masing-masing sisi untuk mencegah flicker visual.

---

## 13. Customization

### Mengubah Kedalaman Bayangan dan Latar Belakang
Anda dapat menambahkan kelas utilitas kustom melalui atribut `class`:

```vue
<Card
  title="Server Health Monitoring"
  variant="glass"
  class="border-emerald-500/30 shadow-emerald-500/10 backdrop-blur-xl"
>
  <p class="text-sm">Semua simpul server berfungsi optimal tanpa anomali beban.</p>
</Card>
```

### Mengonfigurasi Sensitivitas 3D Tilt
Sesuaikan sudut maksimum kemiringan dan skala kartu saat diarahkan:

```vue
<Card
  title="Kartu Interaktif Responsif"
  tilt
  :max-tilt="15"
  :hover-scale="1.04"
>
  <p class="text-sm">Kemiringan terasa lebih dinamis dengan perbesaran skala yang tegas.</p>
</Card>
```

---

## 14. Accessibility

- **Semantic Role**: Secara default dirender sebagai tag `<article>` atau `<div>` semantik yang mengelompokkan unit konten mandiri.
- **ARIA Disclosure**: Saat properti `collapsible="true"` aktif, tombol pemicu memiliki atribut `aria-expanded="true|false"` dan `aria-controls="card-content-id"` yang terhubung dengan ID unik pada area konten.
- **Keyboard Navigation**:
  - Tombol ciut-bentang dapat diakses dan diaktifkan menggunakan tombol `Enter` atau `Space`.
  - Kartu dengan `clickable="true"` memiliki atribut `tabindex="0"` dan merespons penekanan tombol `Enter`.
- **Contrast Compliance**: Semua kombinasi teks judul, subjudul, dan garis aksen telah memenuhi rasio kontras WCAG 2.1 Level AA (minimal 4.5:1 untuk teks reguler).

---

## 15. Responsive Behavior

- **Mobile First**: Pada layar ponsel cerdas (`< 640px`), padding kartu secara otomatis mengecil ke skala proporsional untuk memaksimalkan ruang baca konten.
- **Touch Screen Guard**: Pada perangkat dengan layar sentuh (*coarse pointer*), event kursor spotlight dan tilt dinonaktifkan secara otomatis untuk mencegah konflik gestur gulir vertikal alami pengguna.
- **Flexibility in Grid**: Kartu secara alami mengisi 100% lebar kontainer induknya (`w-full`), menjadikannya sangat ideal dipasangkan dalam sistem CSS Grid (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`).

---

## 16. Do / Don't

| Rekomendasi (Do) | Pantangan (Don't) |
|---|---|
| Gunakan `accentBorder="left"` atau `"top"` untuk membedakan kategori status penting pada dashboard. | Jangan gunakan aksen warna bertabrakan tanpa makna semantik yang jelas. |
| Pasang `hoverable` pada kartu yang berfungsi sebagai pemicu navigasi atau tautan klik. | Jangan aktifkan `hoverable` pada kartu formulir statis yang sedang diisi pengguna. |
| Manfaatkan slot `#footer` untuk menaruh tombol aksi formulir (Simpan, Batal). | Jangan menaruh tombol aksi utama di dalam area teks subjudul header. |
| Gunakan mode `type="product"` untuk menjaga keseragaman rasio gambar produk di katalog e-commerce. | Jangan memuat gambar resolusi tinggi tanpa penanganan aspek rasio atau lazy loading. |
| Matikan fitur tilt pada tabel berdensitas data tinggi agar tidak membingungkan pengguna saat membaca angka. | Jangan memasang efek tilt dan spotlight bersamaan pada setiap kartu dalam satu halaman penuh. |

---

## 17. Examples / Recipes

### Recipe 1: Kartu Metrik KPI Analitik
```vue
<Card
  title="Tingkat Konversi"
  subtitle="Periode kuartal ketiga"
  icon="insights"
  color-theme="emerald"
  accent-border="top"
  hoverable
>
  <div class="flex items-center justify-between mt-2">
    <div class="text-3xl font-black text-slate-900 dark:text-white">4.82%</div>
    <span class="text-xs font-semibold px-2 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
      +0.6% MoM
    </span>
  </div>
</Card>
```

### Recipe 2: Seksi Pengaturan Akun yang Dapat Diciutkan (*Collapsible*)
```vue
<Card
  title="Preferensi Notifikasi"
  subtitle="Tentukan saluran komunikasi mana yang Anda izinkan"
  icon="notifications"
  collapsible
  :collapsed="false"
>
  <div class="space-y-4">
    <label class="flex items-center gap-3">
      <input type="checkbox" checked class="rounded text-indigo-600" />
      <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Kirim pemberitahuan via Email</span>
    </label>
    <label class="flex items-center gap-3">
      <input type="checkbox" class="rounded text-indigo-600" />
      <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Kirim notifikasi push ke perangkat seluler</span>
    </label>
  </div>
</Card>
```

---

## 18. Related Components

- **[Badge Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/badge.md)**: Komponen penanda status ringkas yang sering disematkan pada header kartu.
- **[ButtonSubmit Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/button-submit.md)**: Tombol aksi asinkron yang ideal ditempatkan pada slot footer kartu.
- **[Avatar Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/avatar.md)**: Komponen foto profil pengguna untuk kartu profil atau ulasan konsumen.
- **[CartDrawer Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/cart-drawer.md)**: Drawer keranjang belanja yang menerima produk dari aksi kartu produk.

---

## 19. Notes / Limitations

- **CSS Stacking Context**: Penggunaan efek `transform` pada kartu (seperti saat hover atau 3D tilt) menciptakan *stacking context* baru. Hal ini dapat menyebabkan menu dropdown absolut di dalam kartu terpotong jika pembungkus induk memiliki `overflow: hidden`. Gunakan `overflow="visible"` bila kartu memuat menu dropdown.
- **3D Transform Browser Quirks**: Pada peramban berbasis WebKit versi lama, transisi putar 3D flip card terkadang membutuhkan penambahan `-webkit-backface-visibility: hidden` untuk mencegah flicker bayangan.
- **Performa Pointer Tracking**: Listener pergerakan mouse pada efek spotlight dan tilt telah dioptimalkan dengan pembacaan koordinat berbasis `requestAnimationFrame` untuk menjamin rendering 60 FPS tanpa jank visual.
