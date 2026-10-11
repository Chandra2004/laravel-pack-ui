# Laravel Pack UI

[![Latest Version on Packagist](https://img.shields.io/packagist/v/chandra2004/laravel-pack-ui.svg?style=flat-square&color=blue)](https://packagist.org/packages/chandra2004/laravel-pack-ui)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)
[![PHP Version](https://img.shields.io/badge/PHP-%3E%3D8.2-777bb4.svg?style=flat-square&logo=php)](https://php.net)
[![Laravel Framework](https://img.shields.io/badge/Laravel-11.x%20%7C%2012.x-FF2D20.svg?style=flat-square&logo=laravel)](https://laravel.com)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-Vue%203-9553e9.svg?style=flat-square&logo=inertia)](https://inertiajs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4.x-38bdf8.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

Laravel Pack UI adalah paket antarmuka enterprise dan koleksi composables modern untuk ekosistem Laravel, Inertia.js, dan Vue 3, ditenagai oleh Tailwind CSS v4 serta Google Material Symbols.

Paket ini menerapkan filosofi **headless-copy** (arsitektur penerbitan langsung mirip Shadcn UI dan Laravel Breeze): seluruh kode komponen, composable, dan layout disalin langsung ke direktori `resources/js/` aplikasi Anda. Hal ini memberikan kebebasan mutlak dan kepemilikan penuh atas kode antarmuka tanpa beban abstraksi runtime pihak ketiga.

---

## Daftar Isi

- [Fitur Utama v2.0.0](#fitur-utama-v200)
- [Prasyarat Sistem](#prasyarat-sistem)
- [Panduan Instalasi](#panduan-instalasi)
- [Katalog Komponen UI](#katalog-komponen-ui)
- [Katalog Composables](#katalog-composables)
- [Contoh Penggunaan Praktis](#contoh-penggunaan-praktis)
  - [1. Universal InputField](#1-universal-inputfield)
  - [2. Server Table & Export](#2-server-table--export)
  - [3. Auto-Save & Offline Sync](#3-auto-save--offline-sync)
  - [4. Rich Text Editor (Tiptap)](#4-rich-text-editor-tiptap)
  - [5. Media Player](#5-media-player)
  - [6. UI Dashboard Layout](#6-ui-dashboard-layout)
- [Integrasi Backend Laravel](#integrasi-backend-laravel)
- [Konfigurasi Lingkungan](#konfigurasi-lingkungan)
- [Panduan Migrasi ke v2.0.0](#panduan-migrasi-ke-v200)
- [Lisensi](#lisensi)

---

## Fitur Utama v2.0.0

- **30+ Komponen Antarmuka Teruji:** Mencakup elemen form interaktif, navigasi bertingkat, layout modular, media interaktif, hingga visualisasi data.
- **26 Composables Modular:** Solusi siap pakai untuk validasi formulir, pencegah kehilangan data (*unsaved changes guard*), siklus sinkronisasi luring (*offline outbox pattern*), manajemen tema, pemformatan, hingga aksesibilitas.
- **Arsitektur Komponen Majemuk (Compound Architecture):** Komponen kompleks seperti `Sidebar`, `Skeleton`, `InputField`, `ProductGallery`, dan `RichTextEditor` disusun secara modular dengan sub-komponen terisolasi.
- **Smart Auto-Installer:** Perintah Artisan cerdas yang mengaudit dependensi sistem, mengonfigurasi `app.blade.php`, `app.js`, `app.css`, `vite.config.js`, dan middleware sesi flash secara otomatis.
- **Standar Desain Terpadu:** Mendukung 5 dimensi kontrol visual konsisten (Desain, Warna, Gaya, Radius, dan Ukuran) dengan dukungan dark mode bawaan dan pemenuhan kontras WCAG 2.1.
- **Zero Runtime Overhead:** Komponen menjadi bagian langsung dari proyek Laravel Anda, mudah diubah, ditata ulang, dan dioptimalkan sesuai kebutuhan aplikasi.

---

## Prasyarat Sistem

| Komponen | Versi Minimum yang Didukung |
| --- | --- |
| PHP | ^8.2 (Termasuk PHP 8.3 & 8.4) |
| Laravel Framework | 11.x atau 12.x |
| Node.js | >= 18.x (Rekomendasi Node 20 LTS) |
| Vue | ^3.4 |
| Inertia.js (Vue) | ^1.0 atau ^2.0 |
| Tailwind CSS | v4.x (Tersedia panduan fallback untuk v3.x) |

---

## Panduan Instalasi

### 1. Pemasangan Paket via Composer

Jalankan perintah Composer di direktori utama aplikasi Laravel:

```bash
composer require chandra2004/laravel-pack-ui
```

### 2. Eksekusi Smart Installer

Jalankan perintah Artisan installer untuk mengaudit lingkungan, menginstal dependensi prasyarat, dan mempublikasikan berkas:

```bash
php artisan pack:install
```

Opsi eksekusi installer:

- `php artisan pack:install --all` : Mengotomatiskan seluruh konfirmasi instalasi dependensi Composer dan Node.
- `php artisan pack:install --force` : Menimpa berkas komponen, composables, atau layout yang sudah ada di direktori `resources/js/`.
- `php artisan pack:install --all --force` : Rekomendasi instalasi bersih pada proyek baru.
- `php artisan pack:install --tag=pack-ui-components` : Hanya mempublikasikan komponen UI.
- `php artisan pack:install --tag=pack-ui-composables` : Hanya mempublikasikan modul composables.
- `php artisan pack:install --tag=pack-ui-layouts` : Hanya mempublikasikan layout dashboard.

### 3. Kompilasi Aset Frontend

Setelah installer selesai, jalankan kompilasi aset frontend:

```bash
npm run dev
```

---

## Katalog Komponen UI

Seluruh komponen ditempatkan di `resources/js/Components/Pack/`.

### 1. Formulir dan Input

| Komponen | Deskripsi | Sub-Komponen / Fitur Utama |
| --- | --- | --- |
| `InputField.vue` | Form input universal terpadu | Mendukung 15 sub-tipe: `text`, `textarea`, `select`, `checkbox`, `radio`, `switch`, `datepicker`, `color`, `range`, `file`, `otp`, `mask`, `repeater`, `tag`, dan `location`. Dilengkapi watch validation dan password meter. |
| `ButtonSubmit.vue` | Tombol submit aksi dengan indikator pemrosesan | State loading dinamis, spinner bawaan, pencegah double-click, opsi disabled aman. |
| `CtaButton.vue` | Tombol call-to-action multifungsi | Variasi visual solid, outline, soft, efek kilau hover, dan dukungan rute internal. |
| `TagInput.vue` | Input tag/label interaktif | Penambahan via keyboard (Enter/Koma), pencegahan duplikat, batasan maksimal tag, autocomplete suggestions. |
| `InputRepeater.vue` | Formulir data dinamis berulang | Tambah/hapus baris formulir, reorder baris, validasi skema array bertingkat. |
| `LocationPicker.vue` | Pemilih koordinat geografis interaktif | Integrasi Leaflet & OpenStreetMap, reverse geocoding, pencarian alamat, input manual latitude/longitude. |

### 2. Tampilan Data dan Konten

| Komponen | Deskripsi | Sub-Komponen / Fitur Utama |
| --- | --- | --- |
| `TableComponent.vue` | Tabel data enterprise | Pencarian instan, sorting multi-kolom, filter dinamis, seleksi baris massal, pagination terintegrasi, dan opsi ekspor. |
| `Card.vue` | Kontainer kartu konten fleksibel | Header, body, footer modular, border aksen, interaksi hover, serta varian `CardSlider` dan `CardProduct`. |
| `Badge.vue` | Label status visual kompak | Skala warna semantik (success, warning, error, info), dot indicator, dan variasi border/soft. |
| `Avatar.vue` | Tampilan profil pengguna | Foto profil, inisial fallback cerdas (`useInitials`), indikator status online/offline, dan `AvatarGroup` dengan badge sisa. |
| `Rating.vue` | Penilaian bintang interaktif | Dukungan nilai desimal/setengah bintang, hover preview, mode baca-saja (*read-only*), dan kustomisasi ikon. |
| `Skeleton.vue` | Placeholder pemuatan konten (*skeleton loading*) | Compound sub-komponen: `Avatar`, `Badge`, `Button`, `Card`, `Image`, `Input`, `Layout`, `Shape`, dan `Text` dengan animasi shimmer/pulse. |

### 3. Navigasi dan Tata Letak

| Komponen | Deskripsi | Sub-Komponen / Fitur Utama |
| --- | --- | --- |
| `UIDashboardLayout.vue` | Kerangka dashboard aplikasi lengkap | Pengelolaan responsif desktop/mobile, sinkronisasi state sidebar, integrasi header & breadcrumb. |
| `Sidebar.vue` | Navigasi samping bertingkat | Arsitektur majemuk: `SidebarHeader`, `SidebarNav`, `SidebarGroup`, `SidebarItem`, `SidebarToggle`, `SidebarFooter`, dan `SidebarFlyoutProvider` untuk mode collapsed. |
| `Breadcrumb.vue` | Jejak navigasi hirarkis | Penanganan pemotongan teks panjang, ikon pemisah kustom, dan dukungan rute Inertia/Ziggy. |
| `Pagination.vue` | Kontrol paginasi data | Nomor halaman cerdas (ellipsis), tombol navigasi prev/next, pemilih ukuran per-halaman (*per page*), dan info rentang data. |
| `Stepper.vue` | Alur tahapan formulir (*multi-step wizard*) | Orientasi horizontal/vertikal, status tahapan (selesai, aktif, pending, error), validasi transisi antar tahap. |
| `Tabs.vue` | Navigasi panel bertab | Gaya underline, pill, boxed, keyboard arrow navigation, dan dukungan sinkronisasi query URL. |
| `ScrollProgress.vue` | Indikator progres gulir halaman | Bar progres di atas layar atau lingkaran floating dengan persentase dan tombol kembali ke atas (*back-to-top*). |

### 4. Umpan Balik dan Dialog

| Komponen | Deskripsi | Sub-Komponen / Fitur Utama |
| --- | --- | --- |
| `Alert.vue` | Banner peringatan dan pengumuman | Varian solid, soft, outline, aksi tombol tersemat, mode dismissible, integrasi flash session Laravel. |
| `ToastNotification.vue` | Notifikasi mengambang (*toast*) | Manajemen stack notifikasi, auto-dismiss dengan progress timer, posisi multi-sudut, dan integrasi `useNotification`. |
| `Modal.vue` | Dialog modal serbaguna | Backdrop backdrop-blur, trap focus keyboard (Esc untuk tutup), transisi halus, ukuran dari sm hingga full. |
| `ConfirmDialog.vue` | Dialog konfirmasi aksi destruktif | Integrasi Promise melalui composable `useConfirm`, pesan kustom, dan varian tombol konfirmasi bahaya. |
| `AutoSaveStatus.vue` | Indikator status penyimpanan otomatis | Menampilkan status tersimpan, sedang menyimpan, error, dan stempel waktu penyimpanan terakhir via `useAutoSave`. |

### 5. Media dan Utilitas Lanjutan

| Komponen | Deskripsi | Sub-Komponen / Fitur Utama |
| --- | --- | --- |
| `MediaPlayer.vue` | Pemutar video dan audio kustom | Kontrol kustom penuh, pintasan keyboard, Picture-in-Picture, fullscreen, theater mode, kontrol kecepatan playback, dan penanganan audio buffer. |
| `RichTextEditor.vue` | Editor teks kaya berbasis Tiptap | Menu bubble mengambang, toolbar format lengkap, modal penyematan tautan, modal unggah gambar, dan mode pratinjau HTML. |
| `ProductGallery.vue` | Galeri pratinjau produk interaktif | Galeri thumbnail geser, zoom interaktif saat hover, dan modal lightbox layar penuh (`ProductGalleryLightbox`). |
| `FileDropzone.vue` | Area unggah berkas drag-and-drop | Validasi tipe MIME, pembatasan ukuran berkas, preview thumbnail gambar, dan indikator progres unggahan. |
| `DragDrop.vue` | Kontainer penyusunan ulang elemen drag-and-drop | Pengurutan daftar (*reorderable list*), transfer antar kolom (Kanban), animasi perpindahan halus. |
| `CartDrawer.vue` | Laci keranjang belanja meluncur (*slide-over*) | Tampilan item keranjang, modifikasi jumlah kuantitas, kalkulasi subtotal/pajak/diskon terhubung dengan `useCart`. |
| `ButtonTheme.vue` | Tombol pengalih tema tampilan | Mode terang (*light*), gelap (*dark*), dan sistem (*system preference*), transisi rotasi ikon Material Symbols. |

---

## Katalog Composables

Seluruh composables ditempatkan di `resources/js/Composables/Pack/`.

### 1. Manajemen State & Sinkronisasi Data

| Composable | Deskripsi |
| --- | --- |
| `useAutoSave(saveFn, options)` | Melakukan auto-save berkala dengan debounce otomatis pada form data, melacak status penyimpanan dan waktu terakhir tersimpan. |
| `useOfflineSync(storeName, syncFn)` | Mengimplementasikan pola outbox berbasis IndexedDB untuk mencatat mutasi saat luring dan menyinkronkannya kembali saat daring. |
| `useLocalStorage(key, defaultValue)` | State reaktif yang disinkronkan langsung dengan Web LocalStorage secara null-safe. |
| `useCart(options)` | Pengelolaan keranjang belanja reaktif (tambah, kurang, hapus, kupon, perhitungan total, persistensi storage). |

### 2. Formulir & Interaktivitas Input

| Composable | Deskripsi |
| --- | --- |
| `useFormValidation(rules)` | Engine validasi form reaktif untuk mengevaluasi aturan validasi kustom di sisi klien secara instan. |
| `useUnsavedChanges(isDirty, message)` | Melindungi form dari navigasi tidak sengaja (mencegah penutupan tab atau perubahan rute Inertia jika ada perubahan belum disimpan). |
| `useMask(pattern)` | Memformat input teks berdasarkan pola masker tertentu (nomor telepon, NPWP, kartu kredit, mata uang). |

### 3. Data Tabel & Ekspor

| Composable | Deskripsi |
| --- | --- |
| `useServerTable(endpoint, options)` | Sinkronisasi tabel data dengan backend Laravel (search, sort, filter, per-page) melalui Inertia Visit atau API fetch. |
| `useExportTable(data, columns, options)` | Mengekspor kumpulan data tabel ke format CSV, Excel (XLSX), atau tampilan siap cetak (*print preview*). |

### 4. Dialog, UI & Notifikasi

| Composable | Deskripsi |
| --- | --- |
| `useConfirm()` | Membuka modal konfirmasi berbasis asynchronous Promise (`const confirmed = await confirm({...})`). |
| `useNotification()` | Mengirim notifikasi toast reaktif dengan tipe success, error, warning, info, atau loading. |
| `usePopover()` | Mengontrol posisi dan visibilitas elemen melayang (*popover/dropdown*) dengan proteksi klik di luar. |
| `useClickOutside(targetRef, handler)` | Mendeteksi interaksi klik di luar elemen referensi untuk menutup modal, dropdown, atau menu. |
| `useScrollProgress()` | Menghitung persentase gulir jendela atau kontainer dan status keterbacaan dokumen. |
| `useTheme()` | Mengelola tema aplikasi (light/dark/system) dan menyinkronkan class `.dark` pada dokumen HTML. |
| `useSidebar()` | Mengelola status buka-tutup, collapse, dan responsivitas menu samping (*sidebar*). |

### 5. Utilitas & Transformasi Data

| Composable | Deskripsi |
| --- | --- |
| `useDebounce(fn, delay)` | Menunda eksekusi fungsi hingga jeda waktu tertentu berlalu sejak pemanggilan terakhir. |
| `useThrottle(fn, interval)` | Membatasi frekuensi eksekusi fungsi agar berjalan maksimal satu kali dalam interval tertentu. |
| `useClipboard()` | Menyalin teks ke clipboard sistem operasi dengan penanganan fallback dan umpan balik status berhasil. |
| `useFormat()` | Utilitas format angka, tanggal, dan string terpadu dalam satu gerbang composable. |
| `useDateFormat(date, format)` | Memformat tanggal dan waktu ke berbagai format standar internasional maupun lokal Indonesia. |
| `useNumberFormat(number, options)` | Memformat angka numerik ke format mata uang (Rupiah/IDR, USD), persen, atau pembagi ribuan. |
| `useStringFormat()` | Manipulasi teks (slug, truncate, capitalize, camelCase, snake_case, titleCase). |
| `useInitials(name)` | Mengekstrak inisial nama secara aman untuk ditampilkan pada komponen `Avatar`. |
| `useNetworkStatus()` | Memantau status konektivitas jaringan pengguna (online/offline) secara langsung (*real-time*). |
| `usePermission(userPermissions)` | Memeriksa kepemilikan izin akses (*permission*) atau peran (*role*) pengguna di antarmuka Vue. |

---

## Contoh Penggunaan Praktis

### 1. Universal InputField

Komponen `InputField` menangani berbagai variasi formulir secara otomatis hanya dengan mengubah prop `type`:

```vue
<script setup>
import { ref } from 'vue';
import InputField from '@/Components/Pack/InputField.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const form = ref({
    fullName: '',
    email: '',
    role: 'editor',
    birthDate: '',
    bio: '',
    terms: false,
});

const isSubmitting = ref(false);

const handleSubmit = () => {
    isSubmitting.value = true;
    // Logika pengiriman form...
};
</script>

<template>
    <form @submit.prevent="handleSubmit" class="space-y-4 max-w-lg">
        <InputField
            v-model="form.fullName"
            type="text"
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            required
        />

        <InputField
            v-model="form.email"
            type="email"
            label="Alamat Email"
            placeholder="nama@domain.com"
            required
        />

        <InputField
            v-model="form.role"
            type="select"
            label="Peran Pengguna"
            :options="[
                { label: 'Administrator', value: 'admin' },
                { label: 'Editor Konten', value: 'editor' },
                { label: 'Peninjau', value: 'reviewer' },
            ]"
        />

        <InputField
            v-model="form.birthDate"
            type="datepicker"
            label="Tanggal Lahir"
        />

        <InputField
            v-model="form.bio"
            type="textarea"
            label="Biografi Singkat"
            :rows="3"
        />

        <InputField
            v-model="form.terms"
            type="checkbox"
            label="Saya menyetujui syarat dan ketentuan layanan"
        />

        <ButtonSubmit :loading="isSubmitting">
            Simpan Perubahan
        </ButtonSubmit>
    </form>
</template>
```

---

### 2. Server Table & Export

Implementasi tabel dengan pengurutan, pencarian, dan tombol ekspor:

```vue
<script setup>
import TableComponent from '@/Components/Pack/TableComponent.vue';
import { useServerTable } from '@/Composables/Pack/useServerTable';
import { useExportTable } from '@/Composables/Pack/useExportTable';

const props = defineProps({
    users: Object, // Paginator dari Laravel Controller
});

const { query, onSort, onSearch } = useServerTable('/users');
const { exportToCsv } = useExportTable();

const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Nama Pengguna', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Peran' },
    { key: 'created_at', label: 'Terdaftar' },
];

const handleExport = () => {
    exportToCsv(props.users.data, columns, 'daftar-pengguna.csv');
};
</script>

<template>
    <div class="space-y-4">
        <div class="flex justify-between items-center">
            <h1 class="text-xl font-bold">Daftar Pengguna</h1>
            <button
                type="button"
                @click="handleExport"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
            >
                Ekspor CSV
            </button>
        </div>

        <TableComponent
            :columns="columns"
            :data="users.data"
            :pagination="users"
            @sort="onSort"
            @search="onSearch"
        />
    </div>
</template>
```

---

### 3. Auto-Save & Offline Sync

Menyimpan draf secara otomatis saat pengguna mengetik dan mencadangkan data jika koneksi terputus:

```vue
<script setup>
import { ref, watch } from 'vue';
import { useAutoSave } from '@/Composables/Pack/useAutoSave';
import { useOfflineSync } from '@/Composables/Pack/useOfflineSync';
import AutoSaveStatus from '@/Components/Pack/AutoSaveStatus.vue';
import InputField from '@/Components/Pack/InputField.vue';
import axios from 'axios';

const documentData = ref({
    title: '',
    content: '',
});

// Composable Offline Sync (Outbox Pattern)
const { addToOutbox, isOnline } = useOfflineSync('documents_store', async (item) => {
    await axios.post('/api/documents', item);
});

// Composable Auto Save
const { status, lastSaved, triggerSave } = useAutoSave(async () => {
    if (isOnline.value) {
        await axios.post('/api/documents/draft', documentData.value);
    } else {
        await addToOutbox(documentData.value);
    }
}, { delay: 1500 });

watch(documentData, () => {
    triggerSave();
}, { deep: true });
</script>

<template>
    <div class="space-y-4 max-w-2xl">
        <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold">Tulis Dokumen</h2>
            <AutoSaveStatus :status="status" :last-saved="lastSaved" />
        </div>

        <InputField
            v-model="documentData.title"
            label="Judul Dokumen"
            placeholder="Masukkan judul..."
        />

        <InputField
            v-model="documentData.content"
            type="textarea"
            label="Isi Dokumen"
            :rows="6"
        />
    </div>
</template>
```

---

### 4. Rich Text Editor (Tiptap)

Editor teks dengan bilah alat lengkap dan menu mengambang:

```vue
<script setup>
import { ref } from 'vue';
import RichTextEditor from '@/Components/Pack/RichTextEditor.vue';

const articleBody = ref('<h2>Pengenalan</h2><p>Tulis artikel menarik di sini...</p>');
</script>

<template>
    <div class="max-w-3xl">
        <RichTextEditor
            v-model="articleBody"
            label="Konten Artikel"
            placeholder="Mulai menulis konten..."
        />
    </div>
</template>
```

---

### 5. Media Player

Pemutar video/audio dengan kustomisasi kontrol:

```vue
<script setup>
import MediaPlayer from '@/Components/Pack/MediaPlayer.vue';
</script>

<template>
    <div class="max-w-4xl">
        <MediaPlayer
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            title="Demo Video Laravel Pack UI"
            poster="/images/poster.jpg"
            :aspect-ratio="'16/9'"
        />
    </div>
</template>
```

---

### 6. UI Dashboard Layout

Kerangka dashboard dengan Sidebar modular dan tombol pengalih tema:

```vue
<script setup>
import UIDashboardLayout from '@/Layouts/Pack/UIDashboardLayout.vue';
import ButtonTheme from '@/Components/Pack/ButtonTheme.vue';
</script>

<template>
    <UIDashboardLayout app-name="Enterprise App">
        <template #header-actions>
            <ButtonTheme />
        </template>

        <div class="p-6">
            <h1 class="text-2xl font-bold mb-4">Ringkasan Dashboard</h1>
            <p class="text-neutral-600 dark:text-neutral-400">
                Selamat datang di sistem manajemen dashboard.
            </p>
        </div>
    </UIDashboardLayout>
</template>
```

---

## Integrasi Backend Laravel

### 1. Flash Session Middleware (`HandleInertiaRequests.php`)

Agar flash session dari Controller Laravel otomatis tertangkap oleh komponen `Alert` dan `ToastNotification`, daftarkan kunci flash pada method `share()`:

```php
<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'flash' => [
                'info'    => fn() => $request->session()->get('info'),
                'success' => fn() => $request->session()->get('success'),
                'warning' => fn() => $request->session()->get('warning'),
                'error'   => fn() => $request->session()->get('error'),
                'message' => fn() => $request->session()->get('message'),
                'alert'   => fn() => $request->session()->get('alert'),
            ],
        ];
    }
}
```

### 2. Cara Mengirim Notifikasi dari Controller

```php
// Mengirim notifikasi Toast sederhana
return redirect()->back()->with('success', 'Data profil berhasil diperbarui.');
return redirect()->back()->with('error', 'Terjadi kesalahan saat memproses data.');

// Mengirim banner Alert terstruktur
return redirect()->back()->with('alert', [
    'type'        => 'warning',
    'title'       => 'Pemberitahuan Akun',
    'message'     => 'Harap lakukan verifikasi nomor ponsel sebelum bertransaksi.',
    'variant'     => 'soft',
    'dismissible' => true,
]);
```

---

## Konfigurasi Lingkungan

> [!NOTE]
> Seluruh pengaturan di bawah ini telah dikonfigurasi secara otomatis jika Anda menggunakan perintah `php artisan pack:install`. Bagian ini dicantumkan sebagai referensi arsitektur teknis proyek Anda.

### 1. Google Material Symbols

Tambahkan pada bagian `<head>` di `resources/views/app.blade.php`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined|Material+Symbols+Outlined" rel="stylesheet">
```

### 2. Tailwind CSS v4 & Dark Mode

Pada berkas `resources/css/app.css`:

```css
@import 'tailwindcss';

@custom-variant dark (&:where(.dark, .dark *));
```

### 3. Optimasi Code Splitting (`vite.config.js`)

Untuk memisahkan pustaka pihak ketiga ke dalam vendor chunk dan menghindari peringatan batas ukuran berkas:

```javascript
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            'ziggy-js': path.resolve('vendor/tightenco/ziggy'),
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['vue', '@inertiajs/vue3', 'axios'],
                },
            },
        },
    },
});
```

---

## Panduan Migrasi ke v2.0.0

Pembaruan dari versi v1.x ke v2.0.0 membawa arsitektur komponen majemuk dan peningkatan performa besar:

1. **Perbarui Dependensi Composer:**
   ```bash
   composer require chandra2004/laravel-pack-ui:^2.0
   ```

2. **Perbarui Berkas Komponen dan Composables:**
   Jalankan installer dengan flag `--force` untuk menyinkronkan pembaruan komponen ke dalam direktori aplikasi (pastikan pekerjaan sebelumnya telah dicatat di Git):
   ```bash
   php artisan pack:install --force
   ```

3. **Catatan Perubahan Arsitektur v2.0.0:**
   - **Sidebar Majemuk:** `Sidebar.vue` kini menggunakan compound components (`SidebarHeader`, `SidebarNav`, `SidebarGroup`, `SidebarItem`, `SidebarToggle`, `SidebarFooter`).
   - **Skeleton Majemuk:** `Skeleton.vue` menyediakan 9 sub-varian terisolasi (`SkeletonAvatar`, `SkeletonCard`, dll).
   - **Komponen Baru Ditambahkan:** `MediaPlayer.vue`, composable `usePopover.js`, serta penyempurnaan integrasi Leaflet & Tiptap.
   - **Dukungan Tailwind CSS v4:** Seluruh token styling telah diselaraskan dengan standar Tailwind CSS v4.

4. **Kompilasi Ulang Aset:**
   ```bash
   npm run build
   ```

---

## Lisensi

Paket ini dirilis di bawah lisensi terbuka [MIT License](LICENSE.md) Copyright (c) 2026 Chandra Tri Antomo.
