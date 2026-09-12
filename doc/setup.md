# 🛠 Panduan Prasyarat & Instalasi (Setup Guide)

Dokumen ini menjelaskan prasyarat lingkungan, konfigurasi stylesheet Tailwind CSS, integrasi ikon Google Material Symbols, konfigurasi middleware backend Laravel untuk flash notification, serta optimasi build bundler Vite.

---

## 🛠 Prasyarat & Setup Pack (Requirements & Setup)

Sebelum menggunakan komponen-komponen dalam Pack ini, pastikan dependensi ikon (**Google Material Icons**), utilitas CSS (**Tailwind CSS**), dan konfigurasi backend (**Laravel HandleInertiaRequests Middleware**) telah terpasang di project Anda.

### 1. Google Icons (Material Symbols / Icons)
Komponen-komponen Pack (seperti `Alert.vue`, `ToastNotification.vue`, `InputField.vue`, `ButtonTheme.vue`, dll) menggunakan ikon **Google Material Symbols / Icons**.

#### Cara Instalasi:

* **Metode CDN (Rekomendasi Cepat - HTML Head)**:
  Tambahkan tag `<link>` berikut di dalam elemen `<head>` pada file template utama aplikasi Anda (misal `resources/views/app.blade.php` atau `index.html`):

  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined|Material+Symbols+Outlined" rel="stylesheet">
  ```

* **Metode NPM Package**:
  ```bash
  npm install material-symbols
  ```
  Lalu import di file entry-point CSS/JS Anda (`resources/css/app.css` atau `resources/js/app.js`):
  ```javascript
  import 'material-symbols';
  ```

---

### 2. Tailwind CSS (dengan Konfigurasi Dark Mode Class)
Seluruh komponen Pack dirancang selaras dengan konvensi tata letak dan utilitas dari **Tailwind CSS**. Agar toggle mode gelap/terang (`ButtonTheme.vue`) dapat mengubah tampilan secara dinamis lewat class `.dark` pada tag `<html>`, pastikan file `app.css` dan Tailwind dikonfigurasi sebagai berikut:

#### Cara Instalasi & Konfigurasi File:

* **Vite + Tailwind CSS v4 (Laravel / Vue 3 Default)**:
  ```bash
  npm install tailwindcss @tailwindcss/vite
  ```
  Tambahkan plugin di `vite.config.js`:
  ```javascript
  import tailwindcss from '@tailwindcss/vite';

  export default defineConfig({
    plugins: [
      tailwindcss(),
      vue(),
    ],
  });
  ```
  Tambahkan directive dan konfigurasi dark mode di `resources/css/app.css`:
  ```css
  @import 'tailwindcss';
  @import 'material-symbols';

  /* PENTING: Wajib agar class="dark" di <html> dikenali oleh Tailwind v4 */
  @custom-variant dark (&:where(.dark, .dark *));
  ```

* **Vite + Tailwind CSS v3**:
  ```bash
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```
  Aktifkan `darkMode: 'class'` di `tailwind.config.js`:
  ```javascript
  module.exports = {
    darkMode: 'class', // PENTING untuk Tailwind v3
    content: [
      './resources/**/*.blade.php',
      './resources/**/*.js',
      './resources/**/*.vue',
    ],
    theme: { extend: {} },
    plugins: [],
  }
  ```
  Lalu tambahkan directive Tailwind di `resources/css/app.css`:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

---

### 3. Konfigurasi Backend Laravel Middleware (`HandleInertiaRequests.php`)
Agar data notifikasi & pesan session dari Controller Laravel otomatis tersedia di frontend Vue 3 / InertiaJS (baik untuk Alert Banner maupun Toast Notification), pastikan file `HandleInertiaRequests.php` membagikan array `flash` pada method `share()`:

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

#### Cara Pengiriman dari Controller Laravel:

1. **Untuk Alert Banner Inline Terstruktur**:
   ```php
   // Mengirim objek alert lengkap dengan judul, pesan, tipe, dan varian
   return redirect()->back()->with('alert', [
       'type'        => 'warning',
       'title'       => 'Akun Belum Diverifikasi',
       'message'     => 'Silakan cek inbox email Anda untuk mengaktifkan akun.',
       'variant'     => 'soft',
       'dismissible' => true,
   ]);
   ```

2. **Untuk Toast Notification (Otomatis ditangkap oleh Toast)**:
   ```php
   return redirect()->back()->with('success', 'Pembayaran berhasil diverifikasi!');
   return redirect()->back()->with('error', 'Gagal memproses transaksi.');
   ```

---

### 4. Konfigurasi Build & Code Splitting Vite (`vite.config.js`)
Agar proses kompilasi berkas produksi (`npm run build`) berjalan optimal, cepat, dan terbebas dari peringatan ukuran chunk (*chunk size warning*), konfigurasikan opsi `build` pada file `vite.config.js`:

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
        // Toleransi batas peringatan ukuran bundle (default Vite: 500 kB)
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                // Memisahkan library pihak ketiga ke chunk 'vendor.js' terpisah
                manualChunks: {
                    vendor: ['vue', '@inertiajs/vue3', 'axios'],
                },
            },
        },
    },
});
```

#### Manfaat Optimasi Build Vite:
* **Pemisahan Vendor (`vendor.js`)**: Memisahkan framework inti (Vue, Inertia, Axios) dari kode aplikasi. Browser pengguna dapat menyimpan cache file vendor secara permanen meskipun kode aplikasi diperbarui.
* **Bebas Warning Ukuran (*Zero Chunk Warning*)**: Memecah bundle monolitik menjadi chunk-chunk terpisah yang berada jauh di bawah batas ambang 500 kB.
* **Kecepatan Download**: Mempercepat proses pemuatan awal halaman (*First Contentful Paint*) melalui transfer paralel berkas pada HTTP/2.

---

### 5. Panduan Pembaruan Versi (Upgrade & Update Guide)

Ketika paket `laravel-pack-ui` merilis versi baru (Patch, Minor, atau Major):

1. **Jalankan Update Composer**:
   ```bash
   composer update chandra2004/laravel-pack-ui
   ```
   * **Patch / Minor**: Otomatis tertarik jika menggunakan format default `"^1.3"`.
   * **Mayor (Breaking Changes)**: Jalankan `composer require chandra2004/laravel-pack-ui:^2.0`.

2. **Sinkronkan Berkas Komponen Terbaru ke Project**:
   ```bash
   php artisan pack:install --force
   ```
   *Atau secara terpisah:*
   ```bash
   php artisan vendor:publish --tag=pack-ui-components --force
   php artisan vendor:publish --tag=pack-ui-composables --force
   ```

3. **Build Ulang Asset Frontend**:
   ```bash
   npm run build
   ```

---

### 📚 Daftar Dokumentasi Komponen & Composables

| Kategori | Komponen / File | Tautan Dokumentasi | Deskripsi Singkat |
| :--- | :--- | :--- | :--- |
| **Components** | `Alert.vue` | [Dokumentasi Alert](components/alert.md) | Inline banner alert dengan auto-close, varian & dismiss |
| **Components** | `Avatar.vue` | [Dokumentasi Avatar](components/avatar.md) | Foto profil, inisial deterministik, presence dot & group stack |
| **Components** | `Breadcrumb.vue` | [Dokumentasi Breadcrumb](components/breadcrumb.md) | Navigasi breadcrumb responsif dengan auto-collapse & ikon presisi |
| **Components** | `ButtonSubmit.vue` | [Dokumentasi ButtonSubmit](components/button-submit.md) | Tombol polimorfik (`button`, `Link`, `a`) dengan spinner loading |
| **Components** | `ButtonTheme.vue` | [Dokumentasi ButtonTheme](components/button-theme.md) | Toggle mode terang/gelap (icon, button, switch, segmented) |
| **Components** | `Card.vue` | [Dokumentasi Card](components/card.md) | Kartu universal dengan animasi collapsible & loading overlay |
| **Components** | `Dropdown.vue` | [Dokumentasi Dropdown](components/dropdown.md) | Menu aksi popover dengan navigasi keyboard ARIA & click-outside |
| **Components** | `InputField.vue` | [Dokumentasi InputField](components/input-field.md) | Facade universal input form terintegrasi 12 sub-komponen `Input/` |
| **Components** | `Modal.vue` | [Dokumentasi Modal](components/modal.md) | Dialog modal via `<Teleport>` dengan focus trap & responsive sizes |
| **Components** | `Pagination.vue` | [Dokumentasi Pagination](components/pagination.md) | Navigasi paginasi Laravel `LengthAwarePaginator` & client-side |
| **Components** | `Sidebar.vue` | [Dokumentasi Sidebar](components/sidebar.md) | Sidebar responsif bertingkat, drawer mobile, & floating collapse |
| **Components** | `Skeleton.vue` | [Dokumentasi Skeleton](components/skeleton.md) | Kerangka placeholder loader dengan animasi shimmer wave |
| **Components** | `Stepper.vue` | [Dokumentasi Stepper](components/stepper.md) | Multi-step form wizard horizontal/vertikal dengan penanda error |
| **Components** | `TableComponent.vue` | [Dokumentasi Table](components/table.md) | Data table responsif dengan skeleton loader, sort, & ekspor CSV |
| **Components** | `ToastNotification.vue` | [Dokumentasi Toast](components/toast.md) | Floating toast notification dengan progress bar & timer |
| **Composables** | `useClickOutside.js` | [Dokumentasi useClickOutside](composables/use-click-outside.md) | Hook pendeteksi klik luar elemen (popover, dropdown, kalender) |
| **Composables** | `useFormValidation.js` | [Dokumentasi useFormValidation](composables/use-form-validation.md) | Validasi form reaktif skema rules & integrasi flash error |
| **Composables** | `useNotification.js` | [Dokumentasi useNotification](composables/use-notification.md) | State management & API pemanggil toast notification global |
| **Composables** | `useTheme.js` | [Dokumentasi useTheme](composables/use-theme.md) | Pengelola dark/light theme, OS sync & persistensi localStorage |

---

[← Kembali ke README Utama](../README.md)
