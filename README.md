# Laravel Pack UI

[![Latest Version on Packagist](https://img.shields.io/packagist/v/chandra2004/laravel-pack-ui.svg?style=flat-square&color=blue)](https://packagist.org/packages/chandra2004/laravel-pack-ui)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)
[![PHP Version](https://img.shields.io/badge/PHP-%3E%3D8.2-777bb4.svg?style=flat-square&logo=php)](https://php.net)
[![Laravel Framework](https://img.shields.io/badge/Laravel-11.x%20%7C%2012.x-FF2D20.svg?style=flat-square&logo=laravel)](https://laravel.com)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-Vue%203-9553e9.svg?style=flat-square&logo=inertia)](https://inertiajs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4.x-38bdf8.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

**Laravel Pack UI** adalah paket komponen antarmuka (*UI Component Kit*) dan composables *enterprise-grade* yang dirancang khusus untuk ekosistem **Laravel + Inertia.js + Vue 3**, ditenagai oleh **Tailwind CSS v4** dan **Google Material Symbols**.

Paket ini mengadopsi filosofi *headless-copy* (seperti halnya **Shadcn UI** dan **Laravel Breeze**): seluruh kode komponen dipublikasikan langsung ke dalam direktori `resources/js/` project Anda. Pendekatan ini memberikan kebebasan penuh bagi developer untuk menyesuaikan desain, memperluas fitur, dan menikmati performa tanpa beban *runtime wrapper* tambahan.

---

## 🌟 Mengapa Memilih Laravel Pack UI?

* 🚀 **Smart Auto-Installer**: Mendeteksi secara cerdas apakah project Anda sudah memiliki Vue 3, Inertia.js, Ziggy Router, Tailwind v4, atau Google Icons, dan otomatis mengonfigurasinya dari nol jika belum tersedia.
* 🧭 **Ziggy Router Terintegrasi**: Pemasangan otomatis `tightenco/ziggy` dan `ziggy-js` lengkap dengan penyuntikan directive `@routes` pada blade dan plugin `ZiggyVue` pada Vue entrypoint (`route('nama.rute')`).
* 🎨 **Desain Modern & Konsisten**: Standar border-radius harmonis (`rounded-xl` untuk input dan `rounded-2xl` untuk card/dialog), shadow lembut (`shadow-2xs`), serta tipografi Google Material Symbols.
* 🔒 **Sistem Form & Validasi Tangguh**: `InputField.vue` universal mencakup 10+ tipe input (email regex, phone auto-hyphen, currency mask `Rp 1.500.000`, 4-tahap password strength meter, autocomplete search).
* 📁 **Rich File Upload & Lightbox**: Mendukung 4 varian unggah berkas (`avatar`, `dropzone` hero, `grid` galeri multi-foto, dan `list` tabel dokumen) lengkap dengan pembersih memory leak blob dan modal preview resolusi penuh.
* ⚡ **Kompatibel Penuh Tailwind CSS v4**: Menggunakan engine performa tinggi `@tailwindcss/vite` dengan konfigurasi dark mode instan `@custom-variant dark`.
* 🌓 **Manajemen Tema Bawaan**: Composable `useTheme` terintegrasi dengan `ButtonTheme.vue` yang mendukung mode Terang, Gelap, dan Sinkronisasi Preferensi OS (*System*).

---

## 📦 Komponen & Composables yang Disediakan

| Komponen | Deskripsi Singkat |
|---|---|
| **`InputField.vue`** | Universal form control facade mendukung teks, sandi, angka, tanggal, upload file, select, switch, checkbox, radio, color, range slider, dan textarea. |
| **`TableComponent.vue`** | Tabel data interaktif dilengkapi multi-column skeleton loader, sortable header, toolbar pencarian, dan penanganan status kosong (*empty state*). |
| **`Pagination.vue`** | Paginator responsif yang kompatibel langsung dengan Laravel `LengthAwarePaginator` maupun pagination client-side. |
| **`Modal.vue`** | Dialog popup & confirmation overlay dengan transisi Tailwind halus, varian status (info, danger, success, warning), dan focus-trap. |
| **`Alert.vue`** | Banner notifikasi inline (solid, soft, outline) dengan strip aksen warna ramping dan progress bar auto-close. |
| **`ToastNotification.vue`** | Sistem floating notification global dengan antrian reaktif, countdown timer, dan dukungan multi-posisi. |
| **`ButtonSubmit.vue`** | Tombol aksi polimorfik dengan dukungan Google Icons, indikator loading spinner, dan ragam varian warna kontras tinggi. |
| **`ButtonTheme.vue`** | Pengubah tema dark/light mode dengan 4 pilihan tampilan (icon-only, button, switch pill, dan segmented 3-way). |

### 🧩 Composables (State Helpers)
* **`useNotification.js`** – Pemicu notifikasi toast reaktif dari mana saja (`notify.success()`, `notify.error()`, `notify.warning()`, `notify.info()`).
* **`useTheme.js`** – State manager tema gelap/terang dengan persistensi `localStorage` dan sinkronisasi preferensi sistem operasi.
* **`useClickOutside.js`** – Helper penutup otomatis popover, dropdown, atau menu saat pengguna mengklik di luar area elemen.

---

## 🚀 Instalasi di Project Laravel

Karena paket ini telah terdaftar resmi di **Packagist.org**, Anda dapat langsung memasangnya menggunakan **`composer require`** tanpa perlu menambahkan konfigurasi repositori manual.

### Langkah 1: Pasang Paket via Composer

Jalankan perintah berikut di terminal project Laravel Anda:

```bash
composer require chandra2004/laravel-pack-ui
```

---

### Langkah 2: Jalankan Smart Auto-Installer

Setelah paket berhasil diunduh oleh Composer, jalankan perintah instalasi cerdas:

```bash
php artisan pack:install
```

#### 💡 Apa Saja yang Dilakukan Smart Auto-Installer?
Perintah ini akan memeriksa lingkungan project Anda secara otomatis:
1. **Pemeriksaan & Instalasi Otomatis Backend (Composer)**:
   - Jika project belum memiliki `inertiajs/inertia-laravel`, installer mengeksekusi `composer require inertiajs/inertia-laravel`.
   - Jika project belum memiliki `tightenco/ziggy`, installer mengeksekusi `composer require tightenco/ziggy`.
2. **Pemeriksaan & Instalasi Frontend (Node.js/npm)**:
   - Memastikan `vue` (^3.5) dan `@vitejs/plugin-vue` (^5.0) terpasang.
   - Memastikan `@inertiajs/vue3` (^2.0) terpasang.
   - Memastikan `ziggy-js` (^2.4) terpasang untuk navigasi rute Laravel di Vue.
   - Memastikan `tailwindcss` (^4.0) dan `@tailwindcss/vite` terpasang.
   - Memastikan `material-symbols` (^0.47) terpasang.
3. **Konfigurasi Otomatis Template & Entrypoint**:
   - **`resources/views/app.blade.php`**: Menyisipkan directive `@routes`, `@inertiaHead`, dan `@inertia` secara otomatis.
   - **`resources/js/app.js`**: Mengonfigurasi `createInertiaApp` dan mendaftarkan plugin `ZiggyVue` (`createApp().use(ZiggyVue)`).
   - **`resources/css/app.css`**: Menyisipkan directive `@import 'tailwindcss';` dan `@import 'material-symbols';`.
   - **`vite.config.js`**: Mengonfigurasi plugin `vue()`, `tailwindcss()`, dan path alias `'ziggy-js'` serta `'@'`.
4. **Penerbitan Komponen & Composables**:
   - Menyalin seluruh file komponen ke `resources/js/Components/Pack/`.
   - Menyalin seluruh file composable ke `resources/js/Composables/Pack/`.

#### Opsi Perintah Tambahan:
```bash
# Otomatis pasang seluruh dependensi prasyarat tanpa pertanyaan konfirmasi
php artisan pack:install --all

# Timpa seluruh berkas komponen jika sebelumnya sudah pernah dipasang
php artisan pack:install --force

# Pilihan terbaik untuk project Laravel yang baru dibuat (fresh install):
php artisan pack:install --all --force
```

---

## 📖 Contoh Penggunaan Sederhana

Semua komponen dapat langsung di-import menggunakan path alias standar `@/Components/Pack/...`:

### 1. Form Lengkap dengan Validasi (`InputField.vue` & `ButtonSubmit.vue`)

```vue
<script setup>
import { useForm } from '@inertiajs/vue3';
import InputField from '@/Components/Pack/InputField.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const form = useForm({
    name: '',
    email: '',
    password: '',
    role: 'merchant',
    is_active: true,
});

const submit = () => {
    form.post(route('users.store'));
};
</script>

<template>
    <form @submit.prevent="submit" class="space-y-4 max-w-lg">
        <!-- Input Teks Biasa -->
        <InputField
            v-model="form.name"
            label="Nama Lengkap"
            placeholder="Masukkan nama pengguna..."
            icon="person"
            :error="form.errors.name"
            required
        />

        <!-- Input Email dengan Live Validation -->
        <InputField
            v-model="form.email"
            type="email"
            label="Alamat Email"
            placeholder="nama@domain.com"
            icon="mail"
            :error="form.errors.email"
            required
        />

        <!-- Input Password dengan Indikator Kekuatan & Toggle Visibility -->
        <InputField
            v-model="form.password"
            type="password"
            label="Kata Sandi Akun"
            placeholder="Minimal 8 karakter..."
            :error="form.errors.password"
            required
        />

        <!-- Switch Toggle -->
        <InputField
            v-model="form.is_active"
            type="switch"
            label="Aktifkan Akun"
            subtext="Pengguna dapat langsung login setelah pendaftaran"
        />

        <!-- Tombol Submit dengan Auto Loading Spinner -->
        <ButtonSubmit
            type="submit"
            variant="primary"
            icon="check_circle"
            :loading="form.processing"
        >
            Simpan Data
        </ButtonSubmit>
    </form>
</template>
```

---

### 2. Notifikasi Toast & Dialog Konfirmasi (`useNotification` & `Modal.vue`)

```vue
<script setup>
import { ref } from 'vue';
import Modal from '@/Components/Pack/Modal.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';
import ToastNotification from '@/Components/Pack/ToastNotification.vue';
import { useNotification } from '@/Composables/Pack/useNotification.js';

const notify = useNotification();
const showDeleteModal = ref(false);

const handleDelete = () => {
    showDeleteModal.value = false;
    // Memicu notifikasi toast mengambang
    notify.success('Data layanan berhasil dihapus secara permanen!');
};
</script>

<template>
    <div class="p-6 space-y-4">
        <ButtonSubmit variant="danger" icon="delete" @click="showDeleteModal = true">
            Hapus Layanan
        </ButtonSubmit>

        <!-- Dialog Modal Konfirmasi -->
        <Modal
            v-model="showDeleteModal"
            variant="danger"
            title="Konfirmasi Hapus"
            context="Tindakan Berisiko"
            confirm-text="Ya, Hapus Sekarang"
            cancel-text="Batalkan"
            @confirm="handleDelete"
        >
            <p class="text-xs text-slate-600 dark:text-slate-300">
                Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
            </p>
        </Modal>

        <!-- Kontainer Global Toast (Cukup pasang 1x di App Layout Anda) -->
        <ToastNotification position="top-right" />
    </div>
</template>
```

---

### 3. Pengubah Tema Dark / Light (`ButtonTheme.vue`)

```vue
<script setup>
import ButtonTheme from '@/Components/Pack/ButtonTheme.vue';
</script>

<template>
    <header class="flex items-center justify-between p-4 border-b">
        <h1 class="text-lg font-bold">Dashboard</h1>

        <!-- Tombol Pengubah Tema (Bisa pilih variant: switch, icon, button, segmented) -->
        <ButtonTheme variant="switch" show-label />
    </header>
</template>
```

---

## 📚 Dokumentasi Lengkap Komponen (API Reference)

Dokumentasi teknis menyeluruh yang mengupas tuntas seluruh daftar properti (*props*), *events*, *slots*, *method expose*, aturan validasi, serta katalog ragam varian dropzone berkas dapat Anda baca pada berkas:

👉 **[Buka Dokumentasi Lengkap: PACK-COMPONENT-LAYOUT.md](./PACK-COMPONENT-LAYOUT.md)**

### Isi dari `PACK-COMPONENT-LAYOUT.md`:
* 📌 **Setup & Prasyarat**: Font Google Material Symbols, konfigurasi Tailwind v4, dan Inertia Layout setup.
* 📌 **Alert Component**: Varian styling (`solid`, `soft`, `outline`), penanganan event `dismiss`, dan custom icon slot.
* 📌 **ToastNotification System**: Penggunaan composable `notify.success()`, `notify.error()`, `notify.warning()`, notifikasi dengan tombol aksi (*action callback*), serta pengaturan timer auto-close.
* 📌 **TableComponent**: Konfigurasi header dinamis, sorting, kolom checkbox selection, multi-column skeleton loader, ekspor CSV bawaan, dan kustomisasi baris.
* 📌 **Pagination Component**: Parameter pagination Laravel `LengthAwarePaginator`, mode client-side, dynamic rendering, dan jump-to-page.
* 📌 **Modal Overlay**: Ukuran lebar responsif (`sm`, `md`, `lg`, `xl`, `full`), posisi dialog (center, top, bottom sheet), varian status badge, dan custom footer action.
* 📌 **ButtonTheme**: Mode segmented 3-arah, switch toggle pill, tombol teks, dan persistensi tema.
* 📌 **ButtonSubmit**: Varian tombol polimorfik (Primary, Danger, Success, Warning, Soft, Ghost), posisi ikon, dan status loading spinner.
* 📌 **InputField Deep-Dive**: Bedah tuntas 10 sub-komponen input form:
  * Text, Email & Telepon (dengan live validation & formatting)
  * Password (dengan checklist kriteria keamanan & strength score)
  * Currency (auto rupiah formatting `id-ID`)
  * Select & Autocomplete Search (dropdown popover)
  * File Upload 4 Varian: `avatar`, `dropzone`, `grid`, dan `list`
  * Date & Time Picker (kalender popover bahasa Indonesia)
  * Color Picker (swatch & eyedropper screen API)
  * Range Slider (kustomisasi formatter & track)
  * Checkbox, Radio Group & Switch Toggle

---

## 📄 Lisensi

Paket ini dirilis di bawah lisensi terbuka [MIT License](LICENSE.md) &copy; 2026 **[Chandra Tri Antomo](https://github.com/Chandra2004)**.
Bebas digunakan untuk project pribadi maupun komersial.
