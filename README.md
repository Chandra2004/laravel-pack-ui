# Laravel Pack UI

Enterprise UI Components & Composables untuk **Laravel + Inertia.js + Vue 3**, dirancang dengan **Tailwind CSS v4** dan **Google Material Symbols**.

---

## 📦 Komponen yang Disediakan

1. **`InputField.vue`** – Universal Form Facade dengan 10+ varian (`text`, `email`, `password`, `select`, `date`, `file`, `switch`, `checkbox`, `radio`, `color`, `range`, `textarea`).
2. **`TableComponent.vue`** – Tabel data interaktif lengkap dengan multi-column skeleton loader, sorting, empty state, dan search toolbar.
3. **`Pagination.vue`** – Komponen pagination responsif kompatibel dengan Laravel LengthAwarePaginator dan client-side mode.
4. **`Modal.vue`** – Dialog overlay dengan animasi Tailwind, variant status badges, dan teleport.
5. **`Alert.vue`** – Banner notifikasi inline (info, success, warning, error, neutral) dengan aksen bar ramping dan progress auto-close.
6. **`ToastNotification.vue`** – Floating toast notification dengan antrian reactive global, multi-position, dan countdown progress bar.
7. **`ButtonSubmit.vue`** – Tombol aksi polimorfik dengan dukungan Google Icons, loading spinner, dan ragam varian warna.
8. **`ButtonTheme.vue`** – Dark/Light/System mode theme switcher dengan deteksi preferensi OS dan multi-style (switch, icon, button, segmented).

### 🧩 Composables
- **`useNotification.js`** – Global reactive toast notifier (`notify.success()`, `notify.error()`, dll).
- **`useTheme.js`** – Theme manager dengan persistensi localStorage dan deteksi skema sistem.
- **`useClickOutside.js`** – Utility penutup dropdown/popover saat klik di luar elemen.

---

## 📚 Dokumentasi API & Panduan Komponen Lengkap
Dokumentasi teknis mendalam untuk setiap props, events, slots, varian tipe input, preview file, dan contoh kodenya tersedia di:
👉 **[PACK-COMPONENT-LAYOUT.md](./PACK-COMPONENT-LAYOUT.md)**

---

## 🚀 Cara Instalasi di Project Laravel Lain

### 1. Tambahkan ke `composer.json` Project Anda

Tambahkan repositori Git di `composer.json`:

```json
"repositories": [
    {
        "type": "vcs",
        "url": "https://github.com/Chandra2004/laravel-pack-ui.git"
    }
],
"require": {
    "chandra2004/laravel-pack-ui": "^1.0"
}
```

Lalu jalankan di terminal:

```bash
composer update chandra2004/laravel-pack-ui
```

### 2. Jalankan Smart Auto-Installer

Jalankan perintah instalasi cerdas:

```bash
php artisan pack:install
```

> 💡 **Fitur Cerdas `pack:install` (v1.1.0+)**:
> Command ini akan secara otomatis mengaudit project Anda:
> 1. ✅ **Deteksi Vue 3 & Inertia.js**: Jika belum terpasang, otomatis memasang `inertiajs/inertia-laravel` via Composer dan dependensi Vue 3 + `@inertiajs/vue3` di `package.json`.
> 2. ✅ **Deteksi Tailwind CSS v4 Engine**: Jika belum ada, otomatis memasang `tailwindcss` dan `@tailwindcss/vite`.
> 3. ✅ **Deteksi Google Material Symbols**: Otomatis memasang paket font ikon `material-symbols`.
> 4. ✅ **Auto-Config `app.css` & `vite.config.js`**: Otomatis menambahkan directive `@import 'tailwindcss';`, `@import 'material-symbols';`, dan plugin Vite.
> 5. ✅ **Publish Komponen**: Menyalin seluruh komponen UI dan composable ke `resources/js/`.

Opsi tambahan yang tersedia:
```bash
# Otomatis konfirmasi pasang seluruh prasyarat tanpa prompt interaktif
php artisan pack:install --all

# Timpa berkas komponen jika sebelumnya sudah pernah dipasang
php artisan pack:install --force
```

---

## 📖 Contoh Penggunaan

```vue
<script setup>
import InputField from '@/Components/Pack/InputField.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';
import { useNotification } from '@/Composables/Pack/useNotification.js';

const notify = useNotification();
</script>

<template>
    <InputField
        label="Nama Lengkap"
        placeholder="Masukkan nama Anda..."
        icon="person"
        required
    />

    <ButtonSubmit variant="primary" @click="notify.success('Data tersimpan!')">
        Simpan Perubahan
    </ButtonSubmit>
</template>
```

---

## 📄 Lisensi
MIT License &copy; 2026 [Chandra Tri Antomo](https://github.com/Chandra2004)

