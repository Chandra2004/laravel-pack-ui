# 💀 Skeleton Component (`Skeleton.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen kerangka pemuatan (*skeleton placeholder loader*) performa tinggi yang dirancang untuk **kecepatan tampil instan** dan **efisiensi memori maksimal** (*zero-JS timers & GPU-accelerated pure CSS shimmer*).

Mendukung **5 Pilar Kustomisasi**, **preset halaman dinamis** siap pakai (*Card, Table, Stats/Dashboard, Profile, Form, Article, dan Feed*), varian atomik dasar, serta fungsi **Conditional Wrapper** (`:loading="true/false"`) yang secara otomatis beralih menampilkan konten asli saat data siap.

---

## 🌟 5 Pilar Kustomisasi

| Pilar | Penerapan pada `<Skeleton />` |
| :--- | :--- |
| **1. Warna** | Mendukung 8 palet semantik (`slate`, `primary`, `indigo`, `emerald`, `purple`, `amber`, `rose`, `cyan`) untuk efek placeholder bernuansa tema/status, dengan kontras dark mode presisi pada latar dan kilau shimmer. |
| **2. Bentuk** | Menyediakan 5 varian atomik (`text`, `circular`, `rectangular`, `rounded`, `icon`) dan 7 preset halaman dinamis (`card`, `table`, `stats`, `profile`, `form`, `article`, `feed`). Dilengkapi kontrol kelengkungan sudut (`radius`: `none`, `sm`, `md`, `lg`, `xl`, `full`) dan skala ukuran (`size`: `xs`, `sm`, `md`, `lg`, `xl`). |
| **3. Teks Konten** | Generator paragraf natural multi-baris (`lines`, `lineSpacing`, `lastLineWidth`), aksesibilitas `role="status"` dan `aria-busy="true"`, serta fungsi **Conditional Wrapper** melalui slot `#default`. |
| **4. Icon** | Varian atomik `variant="icon"` dengan dimensi terstandarisasi proporsional untuk placeholder Google Material Symbols dan tombol ikon. |
| **5. Responsif** | Animasi murni CSS (*GPU-accelerated*) tanpa komputasi JS di latar belakang, *zero memory leak*, serta tata letak grid dan flex yang otomatis responsif dari ponsel hingga layar lebar. |

---

## 🚀 Preset Halaman Dinamis (`type="..."`)

Alih-alih menyusun puluhan elemen `div` skeleton secara manual pada setiap halaman baru, gunakan preset siap pakai:

```
1. type="stats" / "dashboard" : Kartu metrik KPI (ikon kotak, nilai metrik besar, badge tren).
2. type="table"              : Data table multi-kolom dan baris lengkap dengan header dan paginasi.
3. type="card"               : Kartu produk/media (banner media, chip status, judul, teks, author).
4. type="profile" / "user"   : Baris identitas pengguna (avatar bulat, nama, email/jabatan, tombol).
5. type="form"               : Kerangka form input (label, kotak input, tombol submit).
6. type="article" / "post"   : Halaman postingan blog lengkap (kategori, headline, penulis, hero banner, paragraf).
7. type="feed" / "list"      : Alur feed/timeline aktivitas beruntun.
```

---

## 💻 Contoh Penggunaan Praktis

### 1. Conditional Wrapper (Pola Terbaik Hemat Memori)
Bungkus komponen atau markup asli Anda di dalam `<Skeleton :loading="isLoading">`. Saat `isLoading = true`, skeleton otomatis dirender. Saat `isLoading = false`, konten asli langsung muncul tanpa ada elemen skeleton yang membebani memori.

```vue
<script setup>
import { ref, onMounted } from 'vue';
import Skeleton from '@/Components/Pack/Skeleton.vue';

const isLoading = ref(true);
const stats = ref(null);

onMounted(async () => {
    // Simulasi fetch data API
    setTimeout(() => {
        stats.value = { revenue: 'Rp 142.500.000', orders: 1250 };
        isLoading.value = false;
    }, 1500);
});
</script>

<template>
  <Skeleton :loading="isLoading" type="stats" :count="2" color="indigo">
    <!-- Konten Asli (Otomatis tampil saat loading = false) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-5 rounded-2xl border bg-white dark:bg-slate-900">
        <span class="text-xs text-slate-500">Pendapatan</span>
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats?.revenue }}</h3>
      </div>
      <div class="p-5 rounded-2xl border bg-white dark:bg-slate-900">
        <span class="text-xs text-slate-500">Total Pesanan</span>
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats?.orders }}</h3>
      </div>
    </div>
  </Skeleton>
</template>
```

---

### 2. Preset Data Table Skeleton
Placeholder pemuatan tabel data instan dengan pengaturan jumlah baris dan kolom:

```vue
<Skeleton
  type="table"
  :rows="5"
  :cols="4"
  animation="wave"
  color="slate"
/>
```

---

### 3. Preset Product / Media Card Grid
Menampilkan grid kartu produk/berita dengan jumlah kartu yang dapat diatur via `:count`:

```vue
<Skeleton
  type="card"
  :count="3"
  color="emerald"
  animation="wave"
  radius="xl"
/>
```

---

### 4. Preset Profil Pengguna (User List)
Baris daftar pengguna atau anggota tim:

```vue
<Skeleton
  type="profile"
  :count="4"
  color="primary"
  radius="xl"
/>
```

---

### 5. Varian Atomik Dasar (Text, Circular, Icon, Rounded)
Gunakan varian atomik untuk merakit layout kustom yang sangat spesifik:

```vue
<!-- Baris teks paragraf 3 baris natural -->
<Skeleton variant="text" :lines="3" line-spacing="3" />

<!-- Avatar bulat profil -->
<Skeleton variant="circular" size="lg" />

<!-- Kotak ikon proporsional -->
<Skeleton variant="icon" size="md" />

<!-- Banner rounded dengan tinggi kustom -->
<Skeleton variant="rounded" height="12rem" radius="2xl" />
```

---

## 📋 Props API (`<Skeleton />`)

| Prop | Tipe Data | Default | Pilihan Nilai / Deskripsi |
| :--- | :--- | :--- | :--- |
| `loading` | `Boolean` | `true` | Status pemuatan. Jika `false`, langsung merender slot `#default` (konten asli) tanpa overhead |
| `type` | `String` | `''` | Preset halaman dinamis: `'card'`, `'table'`, `'stats'`/`'dashboard'`, `'profile'`/`'user'`, `'form'`, `'article'`/`'post'`, `'feed'`/`'list'` |
| `variant` | `String` | `'text'` | Varian atomik dasar: `'text'`, `'circular'`, `'rectangular'`, `'rounded'`, `'icon'` |
| `color` | `String` | `'slate'` | Palet warna semantik: `'slate'`, `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'` |
| `animation` | `String` | `'wave'` | Efek animasi pemuatan: `'wave'` (shimmer kilau halus), `'pulse'` (redup-terang lembut), `'none'` (statis) |
| `radius` | `String` | `''` | Kelengkungan sudut: `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'full'` (otomatis menyesuaikan varian jika kosong) |
| `size` | `String` | `'md'` | Skala dimensi: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'` |
| `width` | `String` | `''` | Lebar kustom (misal `'100%'`, `'240px'`, `'w-64'`) |
| `height` | `String` | `''` | Tinggi kustom (misal `'40px'`, `'10rem'`, `'h-32'`) |
| `lines` | `Number` | `1` | Jumlah baris kerangka teks pada `variant="text"` |
| `lineSpacing` | `String/Number`| `'3'` | Jarak vertikal antar baris teks: `'2'`, `'3'`, `'4'` |
| `lastLineWidth` | `String` | `'70%'` | Lebar baris terakhir paragraf agar menyerupai teks asli |
| `rows` | `Number` | `4` | Jumlah baris pada preset `table` atau grup input pada `form` |
| `cols` | `Number` | `4` | Jumlah kolom pada preset `table` |
| `count` | `Number` | `1` | Jumlah perulangan kartu/item pada preset `card`, `stats`, `profile`, `feed` |

---

## 🪟 Scoped Slots API (`<Skeleton />`)

| Slot Name | Props Slot | Deskripsi |
| :--- | :--- | :--- |
| `#default` | - | Konten asli yang akan dirender secara instan saat `loading="false"` |

---

## ⚡ Optimasi Performa & Memori

Komponen `<Skeleton />` dioptimalkan dengan prinsip-prinsip performa tinggi:
1. **Zero-JS Animation Loop**: Efek *shimmer wave* dikendalikan murni oleh CSS Keyframes dengan *hardware acceleration* (`will-change: transform`). Tidak ada `setInterval`, `requestAnimationFrame`, atau memory leak pada browser.
2. **Zero DOM Tree saat Ready**: Saat `loading="false"`, seluruh pohon DOM skeleton langsung dibersihkan oleh Vue engine, menjaga memori halaman tetap ringan (*lightweight footprint*).
3. **Adaptive Contrast**: Latar shimmer otomatis menyesuaikan palet warna semantik dengan kontras lembut di tema terang dan gelap.
