# ToastNotification Component

## 01. Overview

ToastNotification adalah sistem notifikasi melayang (*floating toast system*) global berbasis Vue 3 dan Tailwind CSS untuk aplikasi Laravel Inertia. Komponen ini dirancang untuk memberikan umpan balik instan (*non-blocking feedback*) atas aksi pengguna seperti konfirmasi penyimpanan, pesan peringatan, laporan kegagalan transaksi, hingga progres asinkron tanpa menggeser tata letak konten utama halaman.

Sistem notifikasi ini terdiri dari dua bagian yang saling terintegrasi:
1. **`<ToastNotification.vue />`**: Komponen kontainer antarmuka yang dipasang sekali pada layout induk aplikasi untuk merender tumpukan notifikasi pada posisi layar yang ditentukan.
2. **`useNotification()`**: Composable reaktif yang dapat dipanggil dari halaman, komponen anak, maupun aksi skrip mana pun untuk memunculkan, memperbarui, atau membersihkan notifikasi secara terpusat.

### Fungsi Utama
* Menampilkan notifikasi melayang di 6 koordinat posisi layar (`top-right`, `top-left`, `top-center`, `bottom-right`, `bottom-left`, `bottom-center`).
* Menyediakan 7 skema tipe semantik: `success`, `error`, `warning`, `info`, `neutral`, `purple` (fitur VIP/eksklusif), dan `dark` (status sistem/terminal).
* Menyediakan 4 varian visual terstandarisasi: `default` (kartu bersih beraksen bilah samping), `soft` (latar pastel sejuk), `solid` (warna pekat berdaya tarik tinggi), dan `outline` (bingkai aksen minimalis).
* Dilengkapi penghitung waktu mundur otomatis (*countdown timer*) dengan bilah progres dinamis dan fitur jeda otomatis saat kursor mouse berada di atas kartu (*pause on hover*).
* Menangani operasi asinkron secara otomatis melalui helper `notify.promise()` dengan transisi transparan dari status loading berputar (*spinning icon*) menjadi sukses atau gagal.
* Memiliki integrasi otomatis dengan session flash message Laravel (`page.props.flash`) tanpa perlu menulis watcher manual di setiap controller.
* Mendukung tombol aksi interaktif (seperti tombol "Urungkan" atau "Coba Lagi") serta slot scoped kustom penuh.

### Kapan Digunakan
* **Konfirmasi Aksi Singkat**: Memberikan umpan balik sesaat setelah pengguna membuat, menyunting, atau menghapus rekaman data.
* **Notifikasi Sistem & Background Jobs**: Memberitahu bahwa proses ekspor laporan telah selesai di latar belakang.
* **Integrasi Flash Session**: Menampilkan pesan `Redirect::back()->with('success', '...')` dari backend Laravel secara otomatis.
* **Aksi Pembatalan (Undo Flow)**: Memberikan kesempatan bagi pengguna untuk membatalkan tindakan destruktif dalam batas waktu tertentu.

### Kapan Tidak Digunakan
* **Peringatan Statis Halaman**: Jika pesan harus tetap terbaca di dalam alur formulir hingga masalah diselesaikan (misalnya instruksi pengisian dokumen), gunakan **Alert**.
* **Konfirmasi Aksi Berisiko Tinggi**: Jika membutuhkan keputusan mutlak dari pengguna sebelum data dihapus permanen, gunakan **ConfirmDialog** atau **Modal**.
* **Label Status Nilai Tabel**: Jika menandai status statis satu baris data (misalnya "Lunas", "Draf"), gunakan **Badge**.

### Karakteristik Penting
* **Non-Blocking Overlay**: Menggunakan kontainer `fixed` dengan pointer events selektif (`pointer-events-none` pada area kosong dan `pointer-events-auto` pada kartu notifikasi) sehingga pengguna tetap dapat berinteraksi dengan elemen di bawahnya.
* **High-Precision Timer**: Menggunakan delta `performance.now()` dengan interval 25ms untuk menghasilkan animasi bilah hitung mundur yang halus tanpa lonjakan frame.
* **WAI-ARIA Polite Region**: Menerapkan atribut `aria-live="polite"` dan `role="alert"` untuk memastikan pembaca layar mengumumkan pesan tanpa memotong ucapan yang sedang berlangsung.
* **Full Dark Mode**: Terintegrasi penuh dengan kelas `dark:` Tailwind CSS, termasuk latar kaca buram `backdrop-blur-md` dan kontur pembatas yang adaptif.

---

## 02. Preview

> [!TIP]
> Pengujian visual dan showcase interaktif entitas ini tersedia secara native pada portal pratinjau aplikasi:
>
> <a href="/preview/toast-notification" target="_self" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 8px; background-color: var(--vp-c-brand-1, #4f46e5); color: #ffffff;">Buka Live Preview Komponen ToastNotification &rarr;</a>

---

## 03. Usage

Konsep integrasi sistem ToastNotification dalam arsitektur aplikasi Laravel Inertia:

```text
Arsitektur Notifikasi Global
├── 1. Layout Induk (AppLayout.vue / AuthenticatedLayout.vue)
│      └── Mount <ToastNotification position="top-right" clearable />
│
├── 2. Halaman Vue / Form Komponen
│      └── import { useNotification } from '@/Composables/Pack/useNotification'
│      └── const notify = useNotification()
│      └── notify.success('Data tersimpan!')
│
└── 3. Backend Laravel Controller
       └── return redirect()->back()->with('success', 'Profil diperbarui!')
       └── Otomatis ditangkap oleh watcher internal props.flash
```

### Panduan Penempatan
Letakkan komponen `<ToastNotification />` tepat satu kali di dalam berkas layout utama aplikasi Anda (misalnya `resources/js/Layouts/AppLayout.vue`). Seluruh halaman atau subkomponen yang dimuat di dalam layout tersebut dapat langsung memanggil composable `useNotification()` tanpa perlu memasang komponen toast berulang kali.

---

## 04. Anatomy

Struktur internal hierarki elemen di dalam `ToastNotification.vue`:

```text
ToastNotification (Root Container)
│
├── Positional Viewport Wrapper (Fixed, Z-[9999], Pointer Events None)
│   │
│   ├── Clear All Button (Tampil jika clearable=true & terdapat >= 2 toast)
│   │
│   └── TransitionGroup (Animasi translate & scale masuk/keluar)
│       │
│       └── Toast Card Container (Role="alert", Pointer Events Auto, Hover Pause)
│           │
│           ├── Left Accent Indicator Bar (Garis warna tebal di sisi kiri)
│           │
│           ├── Content Layout (Flex horizontal dengan penataan iconPosition)
│           │   │
│           │   ├── Semantic Icon Box (Material Symbol / Slot Icon / Spinning Loader)
│           │   │
│           │   ├── Body Section
│           │   │   ├── Header Tag (Type Label uppercase e.g. 'SUKSES')
│           │   │   ├── Title Heading (Teks tebal judul notifikasi)
│           │   │   ├── Message Text (Keterangan teks pesan utama)
│           │   │   └── Custom Action Button (Tombol aksi misal 'Urungkan')
│           │   │
│           │   └── Dismiss Close Button (Tombol silang penutup manual)
│           │
│           └── Progress Bar Track (Bilah hitung mundur di bagian bawah kartu)
│               └── Active Progress Fill (Lebar 0-100% tersinkronisasi timer)
```

---

## 05. Variants

Komponen menyediakan 4 varian visual kartu melalui prop `variant` atau parameter per-notifikasi:

| Varian | Prop Value | Deskripsi Tampilan | Kasus Penggunaan yang Direkomendasikan |
| :--- | :--- | :--- | :--- |
| **Default** | `'default'` *(default)* | Kartu bersih bernuansa putih/gelap (`bg-white dark:bg-slate-900`) dengan bilah indikator warna di sisi kiri. | Standar tampilan antarmuka profesional, aplikasi dashboard bisnis, dan notifikasi umum. |
| **Soft** | `'soft'` | Latar belakang bernuansa warna pastel lembut yang selaras dengan tipe semantik beserta border halus. | Pengumuman ramah, umpan balik fitur sekunder, dan pesan informatif non-kritis. |
| **Solid** | `'solid'` | Warna penuh solid berdaya kontras tinggi yang identik dengan Alert solid, dengan teks dan ikon putih bersih. | Galat fatal sistem, transaksi perbankan gagal, atau peringatan keamanan mendesak. |
| **Outline** | `'outline'` | Garis tepi (*border*) berwarna semantik tegas dengan latar belakang netral transparan. | Tampilan bergaya wireframe minimalis, tema monokrom, atau antarmuka berkepadatan tinggi. |

---

## 06. Sizes & Shapes

### 1. Skala Ukuran (`size`)

Komponen menyediakan 3 skala ukuran proporsional yang ramping dan hemat ruang:

| Ukuran | Prop Value | Padding Kontainer | Dimensi Kotak Ikon | Ukuran Font Judul | Ukuran Font Pesan | Kapan Digunakan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Small** | `'sm'` | `py-1.5 pl-3 pr-2 gap-2` | `w-5 h-5` | `text-xs` | `text-[11.5px]` | Tampilan mobile, layar kasir POS padat, atau sidebar sempit. |
| **Medium** | `'md'` *(default)* | `py-2 pl-3.5 pr-2.5 gap-2.5` | `w-6 h-6` | `text-xs` | `text-xs` | Standar default aplikasi desktop dan tablet modern. |
| **Large** | `'lg'` | `py-2.5 pl-4 pr-3 gap-3` | `w-7 h-7` | `text-sm` | `text-[13px]` | Banner pengumuman penting atau mode aksesibilitas tinggi. |

### 2. Kelengkungan Sudut (`radius`)

Prop `radius` secara otomatis menyelaraskan kelengkungan kartu utama, kotak ikon dalam, dan tombol di dalamnya:
* `'none'`: Sudut siku-siku tajam (`rounded-none`).
* `'sm'`: Kelengkungan mikro (`rounded-sm`).
* `'md'`: Kelengkungan standar sedang (`rounded-md`).
* `'lg'` *(default)*: Kelengkungan modern halus (`rounded-lg`).
* `'xl'`: Kelengkungan tegas (`rounded-xl`).
* `'2xl'`: Kelengkungan melengkung anggun (`rounded-2xl`).
* `'full'`: Format kapsul elips penuh (*capsule / pill toast*).

---

## 07. States

| State | Kondisi Pemicu | Representasi Visual | Makna Fungsional |
| :--- | :--- | :--- | :--- |
| **Active / Counting Down** | Notifikasi baru dimunculkan | Bilah progress bar bergerak menyusut dari 100% ke 0%. | Notifikasi sedang aktif menghitung mundur menuju penutupan otomatis. |
| **Hovered / Paused** | Kursor mouse diarahkan ke dalam area kartu | Bilah progress bar berhenti seketika, kartu sedikit terangkat (`hover:-translate-y-0.5`). | Memberikan waktu membaca lebih lama bagi pengguna tanpa risiko tertutup mendadak. |
| **Loading / Spinning** | Dipicu via `notify.promise()` | Ikon `progress_activity` berputar terus-menerus (`animate-spin`), tombol tutup disembunyikan. | Menandakan proses latar belakang asinkron sedang berlangsung. |
| **Success Resolved** | Operasi promise berhasil selesai | Ikon berganti menjadi `check_circle`, warna berubah hijau zamrud, bilah timer mulai aktif. | Konfirmasi keberhasilan proses asinkron. |
| **Error Rejected** | Operasi promise mengalami kegagalan | Ikon berganti menjadi `error`, warna berubah merah mawar, pesan galat dimunculkan. | Laporan kegagalan proses asinkron. |
| **Exiting / Dismissed** | Tombol silang diklik atau timer habis | Kartu mengecil halus dan memudar keluar (`opacity-0 scale-90`). | Penghapusan elemen dari memori antarmuka. |

---

## 08. Props / Attributes

### 1. Props Komponen `<ToastNotification />`

| Prop | Tipe Data | Default | Pilihan Nilai | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| `position` | `String` | `'top-right'` | `'top-right'`, `'top-left'`, `'top-center'`, `'bottom-right'`, `'bottom-left'`, `'bottom-center'` | Sudut posisi penempatan tumpukan notifikasi pada layar. |
| `variant` | `String` | `'default'` | `'default'`, `'soft'`, `'solid'`, `'outline'` | Varian visual standar untuk seluruh notifikasi yang tidak menentukan varian spesifik. |
| `size` | `String` | `'md'` | `'sm'`, `'md'`, `'lg'` | Skala dimensi kartu, ikon, dan tipografi teks default. |
| `radius` | `String` | `'lg'` | `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'full'` | Kelengkungan sudut kartu default. |
| `duration` | `Number` | `4000` | Angka Positif (ms) | Durasi tampil default dalam milidetik. Nilai `0` menonaktifkan penutupan otomatis. |
| `maxToasts` | `Number` | `5` | Angka Positif | Batas jumlah maksimal kartu yang dapat ditampilkan bersamaan per posisi penempatan. |
| `clearable` | `Boolean` | `false` | `true`, `false` | Menampilkan tombol "Bersihkan Semua" di atas tumpukan jika terdapat 2 notifikasi atau lebih. |
| `autoWatchFlash`| `Boolean` | `true` | `true`, `false` | Otomatis mengamati dan merender session flash message dari Inertia (`page.props.flash`). |
| `showIcon` | `Boolean` | `true` | `true`, `false` | Menampilkan kotak ikon semantik di sisi kartu. |
| `showTypeLabel`| `Boolean` | `false` | `true`, `false` | Menampilkan teks label tipe kategori di atas judul (misal: "SUKSES"). |
| `showIndicatorBar` | `Boolean` | `true` | `true`, `false` | Menampilkan bilah strip aksen warna tebal di sisi kiri kartu. |
| `showProgressBar` | `Boolean` | `true` | `true`, `false` | Menampilkan bilah animasi hitung mundur di bagian dasar kartu. |
| `teleport` | `Boolean` | `true` | `true`, `false` | Memindahkan wadah rendering toast langsung ke `document.body` via Vue Teleport agar selalu melayang di atas modal, header, dan tidak terdistorsi transform/overflow kontainer induk. |
| `typeLabels` | `Object` | `{}` | Key-Value Object | Kamus penyesuaian label kategori teks, misal `{ success: 'Berhasil', error: 'Galat' }`. |

### 2. Parameter Opsi `useNotification().add(options)`

Setiap kali memanggil method `notify.add()` atau method pintas (`notify.success`, `notify.error`, dll), Anda dapat meneruskan parameter string pesan atau objek opsi lengkap:

| Opsi | Tipe Data | Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `message` | `String` | `''` | Isi pesan utama notifikasi. |
| `title` | `String` | `''` | Judul tebal di atas isi pesan. |
| `type` | `String` | `'info'` | Tipe semantik: `'success'`, `'error'`, `'warning'`, `'info'`, `'purple'`, `'dark'`, `'neutral'`. |
| `variant` | `String` | *(warisan prop)* | Menimpa varian kartu khusus untuk notifikasi ini (`'default'`, `'soft'`, `'solid'`, `'outline'`). |
| `size` | `String` | *(warisan prop)* | Menimpa ukuran khusus (`'sm'`, `'md'`, `'lg'`). |
| `radius` | `String` | *(warisan prop)* | Menimpa kelengkungan sudut (`'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'full'`). |
| `position` | `String` | *(warisan prop)* | Mengarahkan notifikasi ke posisi koordinat layar tertentu secara spesifik. |
| `duration` | `Number` | `4000` | Durasi tampil khusus notifikasi ini dalam milidetik. Nilai `0` = persisten tanpa timer. |
| `icon` | `String` | `null` | Nama ikon Material Symbols kustom (menggantikan ikon semantik default). |
| `iconPosition` | `String` | `'left'` | Posisi penempatan ikon: `'left'` atau `'right'`. |
| `showIcon` | `Boolean` | `true` | Mengatur visibilitas ikon khusus untuk notifikasi ini. |
| `showTypeLabel`| `Boolean` | `true` | Mengatur visibilitas teks label tipe khusus untuk notifikasi ini. |
| `showIndicatorBar` | `Boolean` | `true` | Mengatur visibilitas bilah aksen samping. |
| `showProgressBar` | `Boolean` | `true` | Mengatur visibilitas bilah hitung mundur timer. |
| `isSpinning` | `Boolean` | `false` | Menerapkan animasi putar terus-menerus pada ikon (`animate-spin`). |
| `dismissible` | `Boolean` | `true` | Mengizinkan atau menyembunyikan tombol silang penutup manual. |
| `dedupe` | `Boolean` | `false` | Jika `true`, pesan yang identik tidak akan ditumpuk ganda melainkan menyegarkan timer pesan lama. |
| `customStyle` | `Object` | `null` | Kustomisasi warna CSS bebas `{ bg: '#0f172a', color: '#f8fafc', border: '#334155' }`. |
| `action` | `Object` | `null` | Konfigurasi tombol aksi: `{ label: string, icon?: string, autoDismiss?: boolean, onClick: (toast) => void }`. |

### 3. API Method Composable `useNotification()`

```javascript
import { useNotification } from '@/Composables/Pack/useNotification';

const notify = useNotification();

// Dapat dipanggil langsung sebagai fungsi atau via method:
notify('Pesan singkat');
notify({ message: 'Pesan', type: 'success' });
notify.notify({ message: 'Pesan', type: 'info' }); // Alias backward-compatible
```

* `notify(options)` / `notify.notify(options)`: Callable shorthand instance yang setara dengan `notify.add(options)`.
* `notify.success(message, options)`: Memunculkan notifikasi sukses (hijau emerald).
* `notify.error(message, options)`: Memunculkan notifikasi galat (merah rose).
* `notify.warning(message, options)`: Memunculkan notifikasi peringatan (kuning amber).
* `notify.info(message, options)`: Memunculkan notifikasi informasi umum (biru blue).
* `notify.neutral(message, options)`: Memunculkan notifikasi netral (abu-abu slate).
* `notify.purple(message, options)`: Memunculkan notifikasi fitur eksklusif / VIP (ungu purple).
* `notify.dark(message, options)`: Memunculkan notifikasi sistem / console log (hitam zinc).
* `notify.promise(promiseOrFn, { loading, success, error }, options)`: Menangani siklus promise otomatis.
* `notify.add(options)`: Mendaftarkan notifikasi baru dengan konfigurasi kustom penuh.
* `notify.show(options)`: Alias alternatif untuk `notify.add(options)`.
* `notify.update(id, options)`: Memperbarui properti notifikasi yang sedang aktif berdasarkan ID-nya.
* `notify.remove(id)`: Menutup paksa satu notifikasi berdasarkan ID.
* `notify.clear(position = null)`: Menghapus seluruh notifikasi aktif di layar (atau posisi tertentu).
* `notify.setDefaultDuration(ms)`: Mengatur durasi penutupan default baru secara global.
* `notify.initFlashWatcher()`: Mengaktifkan pengamatan session flash message Inertia.

---

## 09. Slots

Komponen `<ToastNotification />` menyediakan sejumlah scoped slot untuk memberikan fleksibilitas kustomisasi markup tingkat tinggi:

| Slot Name | Scope Props | Deskripsi |
| :--- | :--- | :--- |
| `default` | `{ toast, close }` | Menggantikan seluruh struktur internal kartu notifikasi dengan tata letak kustom Anda. |
| `icon` | `{ toast }` | Menggantikan elemen ikon Material Symbols default (misal SVG custom atau Avatar profil). |
| `title` | `{ toast }` | Menggantikan elemen judul notifikasi. |
| `message` | `{ toast }` | Menggantikan area isi teks pesan (misal menyisipkan tautan link Inertia atau markup tebal). |
| `action` | `{ toast, close }` | Menggantikan tombol aksi kustom bawaan dengan deretan tombol aksi kustom Anda. |

---

## 10. Events / Interactions

| Interaksi | Perilaku Komponen | Dampak pada Sistem |
| :--- | :--- | :--- |
| **Mouse Enter (Hover)** | State `item.paused` diatur menjadi `true`. | Animasi progress bar membeku seketika dan hitung mundur timer dihentikan sementara. |
| **Mouse Leave** | State `item.paused` diatur menjadi `false`. | Timer melanjutkan sisa durasi yang ada hingga mencapai 0. |
| **Klik Tombol Silang** | Mengeksekusi `remove(item.id)`. | Memicu animasi transisi keluar dan menghapus objek dari array reaktif `notifications`. |
| **Klik Tombol Aksi** | Mengeksekusi callback `action.onClick(item)`. | Menjalankan logika pemanggil. Jika `action.autoDismiss !== false`, notifikasi otomatis ditutup. |
| **Klik "Bersihkan Semua"** | Mengeksekusi `clear(pos)`. | Seluruh notifikasi pada koordinat posisi tersebut langsung ditutup sekaligus. |

---

## 11. Code Example

### 1. Pemasangan Global di Layout Utama Aplikasi Laravel Inertia

Pasang komponen ini di berkas layout aplikasi Anda (misal `AppLayout.vue`):

```vue
<script setup>
import ToastNotification from '@/Components/Pack/ToastNotification.vue';
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
    <!-- Navigasi & Konten Aplikasi -->
    <slot />

    <!-- Notifikasi Toast Global Melayang -->
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

#### Penjelasan Detail Parameter & Alur:
* `position="top-right"`: Menempatkan seluruh notifikasi baru di pojok kanan atas layar dengan jarak `top-4 right-4`.
* `clearable`: Menampilkan tombol "Bersihkan Semua" di pojok atas tumpukan secara otomatis apabila terdapat 2 atau lebih notifikasi yang sedang aktif bersamaan.
* `autoWatchFlash`: Secara bawaan bernilai `true`, sehingga pesan flash dari controller Laravel (seperti `flash.success` atau `flash.error`) langsung ditampilkan tanpa konfigurasi tambahan.

---

### 2. Operasi CRUD Standar dengan Berbagai Varian Visual

Contoh pemanggilan dari komponen halaman formulir:

```vue
<script setup>
import { useNotification } from '@/Composables/Pack/useNotification';

const notify = useNotification();

const handleSaveSuccess = () => {
    notify.success('Pengaturan profil organisasi berhasil diperbarui.', {
        title: 'Perubahan Disimpan',
        variant: 'soft',
    });
};

const handleValidationError = () => {
    notify.error('Nomor induk kependudukan harus terdiri dari 16 digit angka.', {
        title: 'Validasi Gagal',
        variant: 'solid',
        duration: 6000,
    });
};

const handleNotice = () => {
    notify.purple('Selamat! Akun Anda mendapatkan bonus penyimpanan 50GB.', {
        title: 'Klaim Hadiah',
        icon: 'card_giftcard',
    });
};
</script>

<template>
  <div class="flex items-center gap-3">
    <button @click="handleSaveSuccess" class="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
      Simpan (Soft)
    </button>
    <button @click="handleValidationError" class="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">
      Error (Solid)
    </button>
    <button @click="handleNotice" class="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold">
      VIP Promo
    </button>
  </div>
</template>
```

---

### 3. Operasi Asinkron Otomatis dengan `notify.promise()`

Helper `notify.promise()` menyederhanakan penanganan siklus hidup request HTTP asinkron (misalnya pengunggahan dokumen atau sinkronisasi basis data):

```vue
<script setup>
import { useNotification } from '@/Composables/Pack/useNotification';
import axios from 'axios';

const notify = useNotification();

const uploadBackupArchive = async () => {
    // 1. Eksekusi request API dibungkus oleh notify.promise
    await notify.promise(
        axios.post('/api/system/backup-now'),
        {
            loading: 'Sedang mengompresi dan mengenkripsi basis data sistem...',
            success: (response) => `Cadangan selesai! Ukuran arsip: ${response.data.size} MB.`,
            error: (err) => `Gagal mencadangkan: ${err.response?.data?.message || 'Server sibuk'}.`,
        },
        {
            title: 'Pencadangan Cloud',
            variant: 'default',
        }
    );
};
</script>

<template>
  <button
    @click="uploadBackupArchive"
    class="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
  >
    Mulai Backup Sekarang
  </button>
</template>
```

#### Alur Eksekusi Internal `notify.promise()`:
1. Notifikasi seketika muncul dengan tipe `'info'`, ikon `progress_activity` yang berputar terus-menerus (`isSpinning = true`), `duration = 0` (tidak tertutup otomatis), dan tombol silang disembunyikan.
2. Jika promise berhasil diselesaikan (*resolved*), notifikasi yang sama langsung diperbarui (*in-place update*) menjadi tipe `'success'`, memuat pesan hasil resolusi, dan menyalakan kembali countdown timer selama 4 detik.
3. Jika promise gagal (*rejected*), notifikasi yang sama diperbarui menjadi tipe `'error'` dengan durasi 5 detik agar pengguna sempat membaca penyebab galat.

---

### 4. Notifikasi Penghapusan dengan Tombol "Urungkan" (Undo Pattern)

Memberikan perlindungan bagi pengguna untuk membatalkan penghapusan data secara instan:

```vue
<script setup>
import { useNotification } from '@/Composables/Pack/useNotification';

const notify = useNotification();

const deleteRecord = (item) => {
    // Tandai draf terhapus secara visual di antarmuka terlebih dahulu
    item.isArchived = true;

    notify.neutral(`1 dokumen "${item.title}" dipindahkan ke Sampah.`, {
        title: 'Dokumen Dihapus',
        duration: 5000,
        action: {
            label: 'Urungkan',
            icon: 'undo',
            autoDismiss: true,
            onClick: () => {
                // Batalkan penghapusan
                item.isArchived = false;
                notify.success('Penghapusan dibatalkan. Dokumen telah dipulihkan.');
            },
        },
    });
};
</script>
```

---

## 12. Result / Behavior

### 1. Diagram Alur Siklus Hidup Notifikasi Standar
```text
[Aksi Pengguna / Event] ──► notify.success('Pesan', options)
                                  │
                                  ▼
                    [Kalkulasi ID & Inisialisasi Objek]
                                  │
                                  ▼
                    [Push ke Array Reaktif notifications]
                                  │
                                  ▼
                    [Vite & Vue Render Elemen di Layar]
                                  │
                                  ▼
                    [Timer 25ms Mengurangi remaining ms]
                                  │
            ┌─────────────────────┴─────────────────────┐
            ▼                                           ▼
   [Mouse Hover Kartu]                         [Timer Berjalan Normal]
            │                                           │
   [item.paused = true]                        [item.progress = remaining / duration]
   (Timer Membeku Sementara)                            │
            │                                           ▼
   [Mouse Leave Kartu]                         [remaining <= 0]
            │                                           │
   [item.paused = false] ───────────────►               ▼
   (Lanjutkan Hitung Mundur)                  [Hapus Notifikasi via remove(id)]
                                                        │
                                                        ▼
                                              [Animasi Fade-out & Unmount]
```

### 2. Diagram Transisi Status `notify.promise()`
```text
[Panggil notify.promise(promiseInstance, messages)]
                         │
                         ▼
        [Buat Toast ID dengan isSpinning: true, duration: 0]
                         │
                         ▼
             [Tampilkan Status Loading Spinner]
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
[Promise Resolved]                [Promise Rejected]
        │                                 │
[Update Toast ID:                 [Update Toast ID:
 type: 'success',                  type: 'error',
 isSpinning: false,                isSpinning: false,
 duration: 4000]                   duration: 5000]
        │                                 │
        └────────────────┬────────────────┘
                         ▼
             [Hitung Mundur Selesai] ──► [Unmount Toast]
```

---

## 13. Customization

### 1. Kustomisasi Kamus Label Tipe (`typeLabels`)
Ubah label default teks kategori semantik di atas judul:

```vue
<template>
  <ToastNotification
    :type-labels="{
      success: 'BERHASIL DIVERIFIKASI',
      error: 'KEGAGALAN SISTEM',
      warning: 'PERHATIAN PENTING',
      info: 'PENGUMUMAN',
    }"
  />
</template>
```

### 2. Kustomisasi Gaya Warna Hex Bebas (`customStyle`)
Jika membutuhkan kartu dengan identitas visual merek kustom di luar palet Tailwind standar:

```javascript
notify.add({
    title: 'Tema Brand Kustom',
    message: 'Menerapkan kombinasi warna hex khusus korporat.',
    customStyle: {
        bg: '#0f172a',
        color: '#f8fafc',
        border: '#3b82f6',
    },
});
```

### 3. Menggunakan Ikon SVG Kustom via Scoped Slot `#icon`
Menyisipkan logo brand, foto avatar mini, atau SVG kustom di dalam kotak ikon notifikasi:

```vue
<template>
  <ToastNotification>
    <template #icon="{ toast }">
      <svg v-if="toast.type === 'purple'" class="w-5 h-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </template>
  </ToastNotification>
</template>
```

---

## 14. Accessibility

Komponen `ToastNotification.vue` mematuhi pedoman WAI-ARIA dan WCAG 2.2:

* **Live Region (`aria-live="polite"`)**:
  * Kontainer tumpukan notifikasi dilengkapi atribut `aria-live="polite"` dan `aria-atomic="true"`. Pembaca layar (*screen reader*) akan menunggu jeda bicara pembaca sebelum mengumumkan notifikasi baru, mencegah gangguan saat pengguna sedang membaca formulir.
* **Peran Semantik (`role="alert"`)**:
  * Setiap kartu notifikasi secara eksplisit memiliki atribut `role="alert"` agar diidentifikasi sebagai pesan status dinamis.
* **Aksesibilitas Tombol Tutup**:
  * Tombol silang dilengkapi atribut `aria-label="Tutup notifikasi"` dan `title="Tutup"` sehingga tujuan tombol dipahami dengan jelas oleh teknologi asistif.
* **Kontras Warna Teruji**:
  * Seluruh varian teks semantik (hijau emerald-950, merah rose-950, biru blue-950) diuji memenuhi standar rasio kontras WCAG AA (minimal 4.5:1) baik pada mode terang maupun mode gelap.

---

## 15. Responsive Behavior

* **Kesesuaian Lebar Layar Mobile**:
  * Kontainer notifikasi menggunakan kelas responsif `w-full max-w-sm sm:max-w-md px-3 sm:px-4`. Pada layar ponsel kecil, kartu otomatis mengisi lebar viewport dengan batas margin samping 12px-16px sehingga tidak pernah terpotong di tepi layar.
* **Auto-Centering & Header Clearance Seluler**:
  * Di layar mobile, kontainer toast menerapkan `inset-x-0 mx-auto items-center` dan `top-16 sm:top-5` sehingga notifikasi atas memiliki jarak bebas yang cukup dari navigasi bilah atas (navbar) perangkat dan selalu terpusat secara proporsional. Pada breakpoint desktop (`sm:`), kontainer otomatis kembali ke sudut layar yang ditentukan (`sm:right-5 sm:items-end` atau `sm:left-5 sm:items-start`).
* **Arah Tumpukan Cerdas (Stacking Order)**:
  * Posisi bawah (`bottom-left`, `bottom-center`, `bottom-right`) menggunakan `flex-col-reverse` dan `bottom-4 sm:bottom-5` sehingga notifikasi baru bertumpuk rapi ke atas tanpa menutupi area bilah navigasi bawah (bottom bar).
* **Pencegahan Teks Meluap (`wrap-break-word`)**:
  * Teks pesan dibungkus utilitas `break-words` dan `min-w-0` sehingga teks panjang tanpa spasi (misalnya URL panjang atau hash token transaksi) dipotong secara alami tanpa merusak dimensi kartu.

---

## 16. Do / Don't

| Panduan Do (Direkomendasikan) | Panduan Don't (Dilarang / Hindari) |
| :--- | :--- |
| **Gunakan pesan singkat dan padat**: Toast dirancang untuk dibaca dalam hitungan 3-5 detik. Tulis informasi secara langsung ke inti pesan. | **Jangan letakkan formulir kompleks di dalam toast**: Hindari meletakkan input teks, dropdown panjang, atau alur multi-langkah di dalam notifikasi melayang. |
| **Gunakan notify.promise untuk aksi jaringan**: Memastikan pengguna selalu mengetahui bahwa proses sedang berlangsung tanpa rasa cemas. | **Jangan menumpuk terlalu banyak toast**: Hindari memicu loop notifikasi bertubi-tubi yang menutupi separuh layar pengguna. |
| **Aktifkan pause-on-hover**: Selalu biarkan fitur jeda hover aktif agar pengguna leluasa membaca pesan yang lebih panjang. | **Jangan gunakan duration terlalu singkat**: Durasi di bawah 2500ms sering kali terlewatkan oleh pengguna dan merusak aksesibilitas. |
| **Gunakan varian Solid hanya untuk galat kritis**: Cadangkan kontras warna solid pekat untuk pesan penting agar pengguna tidak mengalami kelelahan visual. | **Jangan pasang komponen `<ToastNotification />` ganda**: Pasang hanya satu kali di root layout aplikasi untuk mencegah render ganda. |

---

## 17. Examples / Recipes

### Resep 1: Integrasi Session Flash Message dari Laravel Controller

Pola navigasi umum di Laravel Inertia di mana controller mengembalikan pesan flash pada aksi redirect:

```php
// app/Http/Controllers/ProductController.php
public function update(Request $request, Product $product)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'price' => 'required|numeric|min:0',
    ]);

    $product->update($validated);

    // Kirim pesan flash session
    return redirect()->route('products.index')->with('success', 'Data produk berhasil diperbarui!');
}
```

Di sisi frontend Vue, pastikan middleware `HandleInertiaRequests.php` membagikan flash session:

```php
// app/Http/Middleware/HandleInertiaRequests.php
public function share(Request $request): array
{
    return array_merge(parent::share($request), [
        'flash' => [
            'success' => fn () => $request->session()->get('success'),
            'error'   => fn () => $request->session()->get('error'),
            'warning' => fn () => $request->session()->get('warning'),
            'info'    => fn () => $request->session()->get('info'),
        ],
    ]);
}
```

Karena prop `autoWatchFlash="true"` aktif secara bawaan pada `<ToastNotification />`, setiap kali redirect selesai, toast sukses otomatis muncul di pojok layar tanpa perlu menulis event listener manual apa pun.

---

### Resep 2: Form Submission Inertia `useForm` dengan Feedback Toast

Contoh integrasi langsung dengan helper form resmi `@inertiajs/vue3`:

```vue
<script setup>
import { useForm } from '@inertiajs/vue3';
import { useNotification } from '@/Composables/Pack/useNotification';

const notify = useNotification();

const form = useForm({
    title: '',
    description: '',
    category_id: null,
});

const submitArticle = () => {
    form.post('/articles', {
        preserveScroll: true,
        onSuccess: () => {
            notify.success('Artikel baru berhasil dipublikasikan!', {
                title: 'Publikasi Selesai',
            });
            form.reset();
        },
        onError: (errors) => {
            const firstKey = Object.keys(errors)[0];
            notify.error(errors[firstKey] || 'Terdapat kesalahan pada input formulir.', {
                title: 'Periksa Input',
                variant: 'solid',
            });
        },
    });
};
</script>

<template>
  <form @submit.prevent="submitArticle" class="space-y-4">
    <input v-model="form.title" type="text" placeholder="Judul artikel" class="w-full border rounded-xl p-2.5 text-xs" />
    <button type="submit" :disabled="form.processing" class="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
      {{ form.processing ? 'Menyimpan...' : 'Publikasikan' }}
    </button>
  </form>
</template>
```

---

## 18. Related Components

| Komponen | Fungsi | Kapan Digunakan |
| :--- | :--- | :--- |
| [Alert](/components/alert) | Kotak pesan kontekstual inline yang menyatu dengan aliran layout | Menampilkan peringatan tetap di dalam halaman atau formulir yang tidak boleh hilang otomatis |
| [AutoSaveStatus](/components/auto-save-status) | Indikator visual status penyimpanan draf otomatis | Menampilkan jejak autosave draf dokumen (tersimpan, menyinkronkan, luring) |
| [ConfirmDialog](/components/confirm-dialog) | Kotak dialog konfirmasi aksi berisiko tinggi | Meminta kepastian persetujuan pengguna sebelum melakukan tindakan destruktif |
| [Badge](/components/badge) | Label status dan penanda kategori ringkas | Menampilkan status data ringkas pada baris tabel (Aktif, Draf, Kedaluwarsa) |

---

## 19. Notes / Limitations

* **Ketergantungan Font Google Material Symbols**: Ikon bawaan (`check_circle`, `error`, `warning`, `info`, `auto_awesome`, `terminal`, `progress_activity`, `close`) mengandalkan font Google Material Symbols. Pastikan font tersebut telah dimuat pada layout induk aplikasi.
* **Perilaku Timer di Latar Belakang (*Browser Throttling*)**: Peramban modern secara otomatis memperlambat interval `setInterval` saat tab berada di latar belakang atau jendela diminimalkan untuk menghemat baterai. Begitu pengguna kembali membuka tab, logika delta waktu `performance.now()` akan langsung menyelaraskan sisa durasi tanpa lonjakan anomali.
* **Pencegahan Duplikasi Flash Message**: Logika pengamatan flash `initFlashWatcher` menyimpan jejak tanda tangan hash JSON dari pesan flash terakhir (`lastFlashSignature`). Hal ini mencegah pesan flash yang sama terpental ganda saat terjadi navigasi internal Inertia yang tidak mengubah isi flash session.
