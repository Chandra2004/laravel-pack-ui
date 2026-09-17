# 💬 ToastNotification Component (`ToastNotification.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md) | [Composable useNotification](../composables/use-notification.md)

`ToastNotification.vue` adalah sistem notifikasi toast melayang (*floating toast system*) mandiri yang dirancang agar sangat fleksibel, memiliki performa tinggi, dan mudah dikustomisasi dari 4 pilar desain: **Warna**, **Bentuk**, **Teks Konten**, dan **Icon**.

---

## 🚀 Integrasi Cepat (Cara Pasang)

Cukup letakkan komponen `<ToastNotification />` satu kali di layout utama aplikasi Anda (misal `AppLayout.vue` atau `AuthenticatedLayout.vue`):

```vue
<script setup>
import ToastNotification from '@/Components/Pack/ToastNotification.vue';
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950">
    <slot />

    <!-- Notifikasi Toast Global -->
    <ToastNotification
      position="top-right"
      variant="default"
      size="md"
      radius="2xl"
      clearable
    />
  </div>
</template>
```

---

## 🎨 4 Pilar Kustomisasi Komponen

### 1. Warna (Theme & Color Variants)
Mendukung 7 skema tipe semantik dan 4 varian visual yang dapat ditentukan baik secara global di props komponen maupun per-notifikasi di `useNotification`:

* **Pilihan Tipe Semantik**:
  * `'success'` (Hijau Emerald) – Konfirmasi keberhasilan tindakan / transaksi lunas.
  * `'error'` (Merah Rose) – Galat fatal, kegagalan validasi, atau transaksi gagal.
  * `'warning'` (Kuning Amber) – Peringatan stok tipis, sesi kedaluwarsa.
  * `'info'` (Biru Blue) – Pengumuman atau notifikasi umum.
  * `'neutral'` (Abu-abu Slate) – Catatan status netral.
  * `'purple'` *(Baru)* (Ungu Purple) – Fitur eksklusif, mode VIP / promo, notifikasi brand.
  * `'dark'` *(Baru)* (Hitam Zinc) – Status console sistem, audit log, atau tema monochrome.

* **4 Varian Visual (`variant`)**:
  * `'default'`: Kartu putih/gelap bersih dengan strip aksen warna tebal di sisi kiri dan progress bar.
  * `'soft'`: Latar belakang bernuansa lembut/pastel dengan teks warna kontras semantik.
  * `'solid'`: Warna penuh dengan kontras tinggi (cocok untuk pesan urgensi tinggi).
  * `'outline'`: Garis batas (*border*) tegas dengan latar belakang transparan/kartu.

* **Kustomisasi Bar Aksen & Warna CSS Bebas**:
  * `showIndicatorBar`: Set `false` jika ingin menghilangkan strip warna di sisi kiri.
  * `customStyle`: Opsi menyetel warna hex/RGB kustom bebas `{ bg: '#0f172a', color: '#f8fafc', border: '#334155' }`.

```javascript
// Contoh Varian Warna
notify.purple('Fitur Premium Anda telah aktif!', { variant: 'soft' });
notify.dark('Migrasi data latar belakang sedang berjalan.', { variant: 'solid' });
notify.success('Pembayaran terkonfirmasi!', { showIndicatorBar: false });
```

---

### 2. Bentuk (Shape, Size & Radius)
Ukuran kartu dan kelengkungan sudut dapat disesuaikan dengan mudah:

* **Pilihan Ukuran (`size`)**:
  * `'sm'`: Mode kompak (padding ramping `p-2.5`, icon kecil `w-7 h-7`, teks `11px`). Sangat cocok untuk tampilan mobile atau antarmuka kasir/POS yang padat.
  * `'md'` *(Default)*: Ukuran seimbang standar untuk aplikasi dashboard desktop.
  * `'lg'`: Mode luas (padding `p-4`, icon besar `w-10 h-10`, teks `14px`). Cocok untuk pengumuman penting.

* **Kelengkungan Sudut (`radius`)**:
  * Mendukung: `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'` *(Default)*, dan `'full'` (desain kapsul / pill).
  * Mengubah prop `radius` otomatis menyelaraskan kelengkungan kartu luar, kotak ikon, dan tombol di dalamnya secara harmonis.

```javascript
// Contoh Kustomisasi Bentuk Per-Toast
notify.info('Sesi login Anda akan habis dalam 5 menit.', {
    size: 'sm',
    radius: 'lg',
});

// Toast Model Kapsul (Pill)
notify.success('Data tersimpan!', {
    radius: 'full',
    size: 'sm',
});
```

---

### 3. Teks Konten & Scoped Slots (Content Customization)
Menawarkan kontrol penuh atas teks, label tipe, dan struktur HTML di dalam toast:

* **Teks & Label**:
  * `title`: Judul tebal di atas isi pesan.
  * `message`: Isi keterangan detail pesan.
  * `typeLabels`: Kustomisasi kamus teks badge (misal mengganti `'success'` menjadi `'Berhasil'`).
  * `showTypeLabel`: Set `false` untuk menyembunyikan tag uppercase tipe (misal hanya menampilkan judul dan pesan tanpa label "SUKSES").

* **Fleksibilitas Scoped Slot Vue**:
  Jika membutuhkan tata letak atau komponen custom di dalam toast, gunakan slot berikut:
  * `#title="{ toast }"`: Kustomisasi rendering judul.
  * `#message="{ toast }"`: Kustomisasi isi pesan (misal menambahkan tautan link Inertia atau styling teks HTML).
  * `#action="{ toast, close }"`: Tombol aksi kustom dengan fungsi callback sendiri.
  * `#icon="{ toast }"`: Kustomisasi icon atau gambar avatar.
  * `#default="{ toast, close }"`: Menimpa (*override*) seluruh tata letak kartu toast.

```vue
<!-- Contoh Penggunaan Scoped Slot -->
<ToastNotification position="top-right">
  <!-- Slot Pesan dengan Tautan Link Inertia -->
  <template #message="{ toast }">
    <div class="text-xs">
      <span>{{ toast.message }}</span>
      <Link href="/billing" class="text-blue-600 underline font-semibold ml-1">
        Lihat Tagihan →
      </Link>
    </div>
  </template>

  <!-- Slot Tombol Aksi Kustom -->
  <template #action="{ toast, close }">
    <div class="flex gap-1.5 mt-2">
      <button @click="close" class="px-2 py-0.5 text-[11px] rounded bg-zinc-800 text-white">
        Tutup
      </button>
    </div>
  </template>
</ToastNotification>
```

---

### 4. Icon (Iconography & Positioning)
* **Google Material Symbols Bawaan**: Otomatis memilih ikon semantik (`check_circle`, `warning`, `error`, `auto_awesome`, `terminal`, `info`).
* **Ikon Kustom**: Gunakan opsi `icon: 'send'` untuk menggunakan ikon Google Symbols apa pun.
* **Sembunyikan Ikon (`showIcon: false`)**: Sangat ideal untuk desain minimalis teks murni tanpa kotak ikon.
* **Posisi Ikon (`iconPosition`)**: Mendukung `'left'` (bawaan) dan `'right'`.
* **Animasi Putar (`isSpinning: true`)**: Menambahkan rotasi terus-menerus untuk proses *background loading*.
* **Slot `#icon="{ toast }"`**: Memungkinkan developer menyisipkan icon SVG eksternal (Lucide, Heroicons, FontAwesome) atau Avatar foto pengguna:

```vue
<ToastNotification>
  <template #icon="{ toast }">
    <!-- SVG Icon Kustom -->
    <svg class="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
      <path d="..." />
    </svg>
  </template>
</ToastNotification>
```

---

## 📋 Props Komponen `<ToastNotification />`

| Prop | Tipe Data | Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `position` | `String` | `'top-right'` | Sudut penempatan: `'top-right'`, `'top-left'`, `'top-center'`, `'bottom-right'`, `'bottom-left'`, `'bottom-center'` |
| `variant` | `String` | `'default'` | Varian visual default global: `'default'`, `'soft'`, `'solid'`, `'outline'` |
| `size` | `String` | `'md'` | Ukuran skala default: `'sm'`, `'md'`, `'lg'` |
| `radius` | `String` | `'2xl'` | Kelengkungan sudut: `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'full'` |
| `duration` | `Number` | `4000` | Durasi tampil default dalam milidetik (ms). `0` = tanpa auto-close |
| `showIcon` | `Boolean` | `true` | Visibilitas kotak ikon default |
| `showTypeLabel` | `Boolean` | `true` | Menampilkan/menyembunyikan teks label kategori tipe di atas judul |
| `showIndicatorBar` | `Boolean` | `true` | Menampilkan garis aksen warna tebal di tepi kiri kartu |
| `showProgressBar` | `Boolean` | `true` | Menampilkan baris animasi hitung mundur di bagian bawah kartu |
| `maxToasts` | `Number` | `5` | Batas jumlah maksimal toast aktif bersamaan per posisi |
| `clearable` | `Boolean` | `false` | Menampilkan tombol "Bersihkan Semua" jika ada 2 atau lebih toast |
| `autoWatchFlash` | `Boolean` | `true` | Menangkap otomatis flash message dari session Laravel (`page.props.flash`) |
| `typeLabels` | `Object` | `{}` | Kamus kustomisasi label tipe status |

---

## 🛠️ Composable API `useNotification()`

```javascript
import { useNotification } from '@/Composables/Pack/useNotification';

const notify = useNotification();
```

### Method Pintas:
* `notify.success(message, options)`
* `notify.error(message, options)`
* `notify.warning(message, options)`
* `notify.info(message, options)`
* `notify.neutral(message, options)`
* `notify.purple(message, options)` *(Baru)*
* `notify.dark(message, options)` *(Baru)*
* `notify.promise(promiseOrFn, { loading, success, error }, options)`
* `notify.add(options)`
* `notify.update(id, options)`
* `notify.remove(id)`
* `notify.clear(position = null)`

### Parameter Objek `options`:
* `title`: `string`
* `variant`: `'default' | 'soft' | 'solid' | 'outline'`
* `size`: `'sm' | 'md' | 'lg'`
* `radius`: `'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'`
* `icon`: `string` (nama Material Symbol)
* `iconPosition`: `'left' | 'right'`
* `showIcon`: `boolean`
* `showTypeLabel`: `boolean`
* `showIndicatorBar`: `boolean`
* `showProgressBar`: `boolean`
* `isSpinning`: `boolean`
* `duration`: `number` (ms)
* `position`: `string`
* `action`: `{ label: string, icon?: string, autoDismiss?: boolean, onClick: (toast) => void }`
* `customStyle`: `{ bg: string, color: string, border: string }`
* `dismissible`: `boolean`
* `dedupe`: `boolean`
