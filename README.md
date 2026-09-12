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
| **`Avatar.vue`** | Foto profil user / inisial nama otomatis dengan status indicator (online, away, busy, offline) dan group stack. |
| **`Breadcrumb.vue`** | Navigasi hirarki responsif dengan auto-collapse path panjang, ikon home, dan separator kustom. |
| **`Card.vue`** | Container serbaguna dengan dukungan collapsible body, loading overlay, header icon, dan actions slot. |
| **`Dropdown.vue`** | Menu aksi popover dengan navigasi keyboard lengkap (panah, enter, esc), varian item, separator, dan badge. |
| **`Sidebar.vue`** | Sidebar navigasi dashboard desktop collapsible + mobile drawer teleported, lengkap dengan sub-sub menu rekursif dan popover flyout. |
| **`Skeleton.vue`** | Placeholder loading loader dengan varian teks berparagraf natural, circular, rectangular, rounded, dan efek radiant shimmer. |
| **`Stepper.vue`** | Multi-step form & progress wizard horizontal maupun vertikal dengan status complete/error dan validasi langkah. |

### 🧩 Composables (State Helpers)
* **`useNotification.js`** – Pemicu notifikasi toast reaktif dari mana saja (`notify.success()`, `notify.error()`, `notify.warning()`, `notify.info()`), sinkron otomatis dengan session flash Laravel.
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
4. **Konfigurasi Flash Session Inertia (`HandleInertiaRequests.php`)**:
   - Otomatis membuat atau memperbarui method `share()` pada `app/Http/Middleware/HandleInertiaRequests.php` untuk membagikan session flash (`success`, `error`, `warning`, `info`, `message`, `alert`).
   - Mendaftarkan middleware ke `bootstrap/app.php` (Laravel 11/12) sehingga setiap redirect controller dengan `->with('success', '...')` otomatis memicu toast notification di frontend melalui `useNotification.js`.
5. **Penerbitan Komponen & Composables**:
   - Menyalin seluruh file komponen ke `resources/js/Components/Pack/`.
   - Menyalin seluruh file composable ke `resources/js/Composables/Pack/`.

#### Opsi Perintah Tambahan:
```bash
# Otomatis pasang seluruh dependensi prasyarat tanpa pertanyaan konfirmasi
php artisan pack:install --all

# Timpa seluruh berkas komponen jika sebelumnya sudah pernah dipasang (Sangat disarankan saat Update)
php artisan pack:install --force

# Pilihan terbaik untuk project Laravel yang baru dibuat (fresh install):
php artisan pack:install --all --force
```

---

## 🔄 Panduan Pembaruan Versi (Upgrade & Update Guide)

Ketika paket `chandra2004/laravel-pack-ui` merilis pembaruan versi (baik berupa **Patch**, **Minor**, maupun **Major**), ikuti 3 langkah berikut agar aplikasi Anda mendapatkan fitur, perbaikan bug, dan komponen terbaru:

### Langkah 1: Update Versi Package via Composer

Jalankan perintah berikut di terminal project Anda:

```bash
composer update chandra2004/laravel-pack-ui
```

#### 📌 Ketentuan Batasan Versi (*Version Constraints*):
* **Pembaruan Patch (`v1.3.0` $\to$ `v1.3.1`) & Minor (`v1.3.0` $\to$ `v1.4.0`)**:  
  Jika file `composer.json` project Anda menggunakan format default `"chandra2004/laravel-pack-ui": "^1.3"`, Composer akan **otomatis menarik versi patch dan minor terbaru** yang kompatibel saat Anda mengeksekusi `composer update`.
* **Pembaruan Mayor / Breaking Changes (`v1.x` $\to$ `v2.0.0`)**:  
  Composer sengaja **tidak** mengupdate ke versi mayor secara otomatis guna mencegah error akibat perubahan struktur API (*breaking changes*). Untuk beralih ke versi mayor baru, perbarui constraint secara eksplisit:
  ```bash
  composer require chandra2004/laravel-pack-ui:^2.0
  ```

---

### Langkah 2: Terbitkan Ulang Komponen Terbaru ke Project Anda

> [!IMPORTANT]
> Karena komponen Vue dan Composables disalin langsung (*published*) ke dalam direktori aplikasi Anda (`resources/js/Components/Pack/` dan `resources/js/Composables/Pack/`), menjalankan `composer update` saja **hanya memperbarui berkas di folder `vendor/`**, bukan berkas komponen yang digunakan di project Anda.

Jalankan perintah installer dengan opsi `--force` untuk menyinkronkan berkas komponen terbaru ke project Anda:

```bash
php artisan pack:install --force
```

Atau jika Anda hanya ingin memperbarui file komponen UI saja tanpa menyentuh file konfigurasi blade/app:
```bash
# Terbitkan ulang komponen UI
php artisan vendor:publish --tag=pack-ui-components --force

# Terbitkan ulang composables
php artisan vendor:publish --tag=pack-ui-composables --force
```

> [!WARNING]
> **Penting Sebelum Menjalankan `--force`:**  
> Jika Anda pernah memodifikasi kode secara manual di dalam berkas `resources/js/Components/Pack/...`, opsi `--force` akan **menimpa (*overwrite*)** perubahan kustom tersebut. Pastikan Anda telah melakukan `git commit` atau backup kode terlebih dahulu.

---

### Langkah 3: Kompilasi Ulang Asset Frontend

Setelah berkas komponen terbaru diperbarui di project Anda, jalankan build Vite:

```bash
npm run build
# atau untuk lingkungan development:
npm run dev
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

## 📚 Dokumentasi Lengkap (Documentation Index)

Dokumentasi teknis menyeluruh yang mengupas tuntas seluruh daftar properti (*props*), *events*, *slots*, *method expose*, aturan validasi, serta contoh implementasi praktis telah dikelompokkan secara terstruktur dan modular di dalam direktori [`doc/`](doc/setup.md):

### 🛠️ Prasyarat & Instalasi
* 📖 [**Panduan Setup & Instalasi (`doc/setup.md`)**](doc/setup.md) — Font Google Material Symbols, konfigurasi Tailwind CSS v4 / v3, konfigurasi backend Middleware Laravel `HandleInertiaRequests`, dan optimasi build bundler Vite.

### 🧩 Komponen UI (Components)
* 🔔 [**Alert (`Alert.vue`)**](doc/components/alert.md) — Inline banner alert dengan auto-close, progress countdown bar, varian (`soft`, `solid`, `outline`), & dismissible.
* 👤 [**Avatar (`Avatar.vue`)**](doc/components/avatar.md) — Foto profil, inisial nama otomatis dengan warna deterministik, presence status dot tanpa terpotong mask, & avatar group stack.
* 🧭 [**Breadcrumb (`Breadcrumb.vue`)**](doc/components/breadcrumb.md) — Navigasi breadcrumb terintegrasi Inertia Link dengan auto-collapse ellipsis & penjajaran presisi ikon.
* 🔘 [**ButtonSubmit (`ButtonSubmit.vue`)**](doc/components/button-submit.md) — Tombol polimorfik (`button`, `Link`, `a`) dengan varian warna, ikon, dan animasi loading spinner.
* 🌓 [**ButtonTheme (`ButtonTheme.vue`)**](doc/components/button-theme.md) — Tombol pengubah mode gelap/terang (varian `icon`, `button`, `switch`, `segmented`) tersinkronisasi OS & localStorage.
* 🃏 [**Card (`Card.vue`)**](doc/components/card.md) — Kontainer kartu universal dengan animasi collapsible mulus, varian kartu, dan loading overlay.
* 🔽 [**Dropdown (`Dropdown.vue`)**](doc/components/dropdown.md) — Menu aksi popover dengan navigasi keyboard lengkap (ARIA compliant) & click-outside dismissal.
* 📝 [**InputField & Sub-Komponen (`InputField.vue`)**](doc/components/input-field.md) — Facade universal form input mendelegasikan 12 sub-komponen: Text, Password, DatePicker, File (Dropzone), Select, Color, Radio, Checkbox, Textarea, Range, Switch, OTP, & Mask.
* 🪟 [**Modal (`Modal.vue`)**](doc/components/modal.md) — Dialog overlay via `<Teleport>` dengan Focus Trap, ukuran responsif (`sm` hingga `full`), posisi dialog, & Expose API.
* 📄 [**Pagination (`Pagination.vue`)**](doc/components/pagination.md) — Komponen navigasi halaman kompatibel Laravel `LengthAwarePaginator` dan mode client-side.
* 📑 [**Sidebar & SidebarItem (`Sidebar.vue`)**](doc/components/sidebar.md) — Bilah samping responsif dengan menu bertingkat (*nested dropdown*), mobile drawer backdrop blur & scroll-lock, serta floating circular collapse button.
* 💀 [**Skeleton (`Skeleton.vue`)**](doc/components/skeleton.md) — Kerangka placeholder loader dengan efek animasi shimmer wave modern untuk teks, avatar, kartu, dan tabel.
* 🪜 [**Stepper (`Stepper.vue`)**](doc/components/stepper.md) — Penunjuk alur wizard multi-langkah horizontal/vertikal, mode sekuensial linear, & penanda status error.
* 📊 [**TableComponent (`TableComponent.vue`)**](doc/components/table.md) — Wrapper data table lengkap dengan sorting dinamis, kolom checkbox bulk action, skeleton loader, & ekspor CSV.
* 💬 [**ToastNotification (`ToastNotification.vue`)**](doc/components/toast.md) — Floating toast notification system dengan real-time progress countdown, 6 posisi sudut layar, & multi-toast stack.

### ⚙️ Composables
* 🎯 [**`useClickOutside`**](doc/composables/use-click-outside.md) — Hook pendeteksi interaksi klik di luar elemen target (dropdown, popover, modal).
* 🛡️ [**`useFormValidation`**](doc/composables/use-form-validation.md) — Validasi skema form reaktif dengan preset rules (`required`, `email`, `min`, `max`, `confirmed`, dll) serta sinkronisasi galat Laravel.
* 💬 [**`useNotification`**](doc/composables/use-notification.md) — State manager & trigger API toast notification (`notify.success`, `notify.error`, `notify.promise`, aksi undo callback).
* 🌓 [**`useTheme`**](doc/composables/use-theme.md) — State manager pengatur tema gelap/terang, sinkronisasi OS mediaQuery, & class `.dark` Tailwind CSS.


---

## 📄 Lisensi

Paket ini dirilis di bawah lisensi terbuka [MIT License](LICENSE.md) &copy; 2026 **[Chandra Tri Antomo](https://github.com/Chandra2004)**.
Bebas digunakan untuk project pribadi maupun komersial.
