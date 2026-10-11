---
title: Panduan & Setup
---

# Panduan Prasyarat & Instalasi

Laravel Pack UI adalah paket antarmuka (UI component kit) dan composables enterprise untuk ekosistem Laravel, Inertia.js, dan Vue 3, ditenagai oleh Tailwind CSS v4 serta Google Material Symbols.

Paket ini menerapkan filosofi headless-copy: seluruh kode komponen dipublikasikan langsung ke direktori `resources/js/` pada proyek aplikasi Anda, memberikan kendali penuh terhadap kustomisasi tanpa runtime wrapper tambahan.

---

## Fitur Utama

- Auto-Installer Otomatis: Mendeteksi dan mengonfigurasi dependensi Vue 3, Inertia.js, Ziggy, Tailwind CSS v4, dan Google Material Symbols.
- Integrasi Rute Ziggy: Dukungan langsung helper rute `route('nama.rute')` di sisi Vue.
- Form dan Validasi Terpadu: InputField universal dengan 12 sub-tipe, masking input, dan indikator kekuatan kata sandi.
- State Helpers Lengkap: Auto-save draf, pencegah navigasi form kotor (unsaved changes guard), sinkronisasi tabel server-side, dan offline sync outbox pattern.
- Manajemen Tema: Dukungan mode terang, gelap, dan preferensi sistem operasi via `useTheme` dan `ButtonTheme.vue`.
- Optimasi Build Produksi: Konfigurasi manual chunks Vite untuk pemisahan vendor library dan eliminasi warning ukuran bundle.

---

## Panduan Instalasi

### 1. Pemasangan Paket

Jalankan perintah Composer di root proyek Laravel:

```bash
composer require chandra2004/laravel-pack-ui
```

### 2. Eksekusi Smart Auto-Installer

Jalankan perintah instalasi otomatis untuk menyiapkan seluruh konfigurasi dan menerbitkan berkas:

```bash
php artisan pack:install
```

Opsi perintah tambahan:
- `php artisan pack:install --all` : Memasang seluruh dependensi tanpa konfirmasi interaktif.
- `php artisan pack:install --force` : Menimpa berkas komponen dan layout yang sudah ada di `resources/js/`.
- `php artisan pack:install --all --force` : Rekomendasi untuk proyek Laravel baru.

Untuk referensi arsitektur dan parameter teknis, lihat dokumentasi [InstallPackCommand](/install-pack-command) dan [PackUiServiceProvider](/pack-ui-service-provider).


---

## Panduan Pembaruan Versi (Upgrade)

Saat versi baru paket dirilis:

1. Perbarui versi paket via Composer:
   ```bash
   composer update chandra2004/laravel-pack-ui
   ```
   Untuk pembaruan versi mayor dengan breaking changes:
   ```bash
   composer require chandra2004/laravel-pack-ui:^2.0
   ```

2. Sinkronkan berkas komponen terbaru ke proyek:
   ```bash
   php artisan pack:install --force
   ```
   Atau per tag secara terpisah:
   ```bash
   php artisan vendor:publish --tag=pack-ui-components --force
   php artisan vendor:publish --tag=pack-ui-composables --force
   ```

3. Kompilasi ulang aset:
   ```bash
   npm run build
   ```
