# Dokumentasi Pack Components

Dokumen ini berisi spesifikasi, panduan penggunaan, dan referensi API untuk komponen-komponen reusable yang berada di folder `resources/js/Components/Pack/`.

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
  Tambahkan directive dan konfigurasi dark mode di [resources/css/app.css](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/css/app.css):
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
  Lalu tambahkan directive Tailwind di [resources/css/app.css](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/css/app.css):
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

---

### 3. Konfigurasi Backend Laravel Middleware (`HandleInertiaRequests.php`)
Agar data notifikasi & pesan session dari Controller Laravel otomatis tersedia di frontend Vue 3 / InertiaJS (baik untuk Alert Banner maupun Toast Notification), pastikan file [HandleInertiaRequests.php](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/app/Http/Middleware/HandleInertiaRequests.php) membagikan array `flash` pada method `share()`:

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
Agar proses kompilasi berkas produksi (`npm run build`) berjalan optimal, cepat, dan terbebas dari peringatan ukuran chunk (*chunk size warning*), konfigurasikan opsi `build` pada file [vite.config.js](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/vite.config.js):

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

### Daftar Komponen & Composables dalam Pack

| Kategori | Nama File | Lokasi File | Deskripsi Singkat |
| :--- | :--- | :--- | :--- |
| **Components** | `Alert.vue` | [Alert.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Alert.vue) | Inline banner alert dengan auto-close, variant & dismiss |
| **Components** | `ToastNotification.vue` | [ToastNotification.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/ToastNotification.vue) | Floating toast notification dengan progress bar & timer |
| **Components** | `Avatar.vue` | [Avatar.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Avatar.vue) | Foto user / inisial dengan status dot & group stack |
| **Components** | `Breadcrumb.vue` | [Breadcrumb.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Breadcrumb.vue) | Navigasi breadcrumb responsif dengan separator & ikon |
| **Components** | `Card.vue` | [Card.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Card.vue) | Container card universal dengan collapsible & loading |
| **Components** | `Dropdown.vue` | [Dropdown.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Dropdown.vue) | Menu dropdown dengan keyboard navigation |
| **Components** | `Sidebar.vue` | [Sidebar.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Sidebar.vue) | Sidebar navigasi collapsible dengan mobile drawer |
| **Components** | `Skeleton.vue` | [Skeleton.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Skeleton.vue) | Standalone skeleton loader (circle, rect, text) |
| **Components** | `Stepper.vue` | [Stepper.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Stepper.vue) | Multi-step wizard / progress indicator |
| **Components** | `ButtonSubmit.vue` | [ButtonSubmit.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/ButtonSubmit.vue) | Polymorphic button (`button`, `Link`, `a`) dengan loading spinner |
| **Components** | `ButtonTheme.vue` | [ButtonTheme.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/ButtonTheme.vue) | Toggle mode terang/gelap (light/dark mode) |
| **Components** | `InputField.vue` | [InputField.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/InputField.vue) | Facade universal input form (mendelegasikan ke 12 sub-komponen `Input/`) |
| **Components** | `Modal.vue` | [Modal.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Modal.vue) | Overlay dialog modal via `<Teleport>` dengan Focus Trap & Expose API |
| **Components** | `Pagination.vue` | [Pagination.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Pagination.vue) | Navigasi halaman kompatibel Laravel Paginator & Client-side |
| **Components** | `TableComponent.vue` | [TableComponent.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/TableComponent.vue) | Data table wrapper dengan skeleton loader, export CSV & empty state |
| **Sub-Components** | `Input/*.vue` *(12 files)* | [Input/](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Input/) | 12 sub-komponen terspesialisasi: Text, DatePicker, File, Select, Color, Radio, Checkbox, Textarea, Range, Switch, Otp, Mask |
| **Sub-Components** | `SidebarItem.vue` | [SidebarItem.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/SidebarItem.vue) | Sub-komponen rekursif untuk item sidebar multi-level & popover flyout menu |
| **Composables** | `useNotification.js` | [useNotification.js](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Composables/Pack/useNotification.js) | State management & API pemicu toast notification |
| **Composables** | `useTheme.js` | [useTheme.js](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Composables/Pack/useTheme.js) | State management & toggle dark/light theme |
| **Composables** | `useClickOutside.js` | [useClickOutside.js](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Composables/Pack/useClickOutside.js) | Hook pendeteksi klik luar elemen target (popover, calendar, dropdown) |
| **Composables** | `useFormValidation.js` | [useFormValidation.js](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Composables/Pack/useFormValidation.js) | Composable validasi form & field level dengan rule presets & integrasi error Laravel |

---

## 1. Alert Component (`Alert.vue`)

Komponen banner notifikasi **inline** yang menggunakan utilitas **Tailwind CSS** dan ikon **Google Material Symbols**. Komponen ini menempel di dalam alur halaman / form / card untuk menampilkan informasi status, peringatan statis, atau pengumuman penting secara responsif, proporsional, dan mendukung penuh mode gelap (*dark mode*).

### Lokasi File

* **Component**: [Alert.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Alert.vue)

### Fitur Desain & Styling:
* **Tailwind CSS Utility Classes**: Dirancang menggunakan class Tailwind (`rounded-xl`, `p-4`, `shadow-xs`, `transition-all`) tanpa CSS kustom yang memberatkan.
* **Full Dark Mode Ready**: Seluruh varian (`soft`, `solid`, `outline`) dilengkapi kelas utilitas `dark:` dengan kontras yang teruji dan nyaman dibaca.
* **Google Material Symbols & Slot Ikon**: Menggunakan ikon bawaan (`check_circle`, `warning`, `error`, `notifications`, `info`, `close`) serta menyediakan slot `#icon` jika ingin menyematkan SVG atau komponen ikon kustom.
* **Reaktif Auto-Close & Progress Bar**: Mendukung penutupan otomatis berbasis milidetik dengan animasi progress countdown bar di bagian bawah alert, serta otomatis jeda (*pause*) saat kursor mouse di-hover.
* **Transisi Halus**: Transisi buka dan tutup yang natural (`enter` dan `leave` selaras).
* **Indikator Garis Samping**: Bar aksen visual di sisi kiri hadir di semua varian (termasuk varian solid dengan aksen semi-transparan).

### Component Props API (`<Alert />`)

| Prop | Tipe Data | Default | Deskripsi / Pilihan Nilai |
| :--- | :--- | :--- | :--- |
| `v-model` | `Boolean` | `undefined` | Kontrol status buka/tutup alert secara reaktif (memiliki prioritas tertinggi) |
| `show` | `Boolean` | `true` | Kontrol fallback visibilitas jika `v-model` tidak digunakan (backward compatibility) |
| `type` | `String` | `'info'` | Jenis alert: `'success'`, `'warning'`, `'error'`, `'info'`, `'neutral'` |
| `variant` | `String` | `'soft'` | Tampilan visual: `'soft'` (latar lembut), `'solid'` (warna penuh), `'outline'` (garis tepi) |
| `title` | `String` | `''` | Judul pesan alert |
| `message` | `String` | `''` | Isi ringkas pesan alert |
| `dismissible` | `Boolean` | `false` | Menampilkan tombol silang `(X)` penutup alert |
| `autoClose` | `Number` | `0` | Durasi tutup otomatis dalam ms (`0` = tidak otomatis tutup). Reaktif jika diubah secara dinamis |
| `icon` | `String` | `''` | Nama Google Material Icon kustom (misal `'verified'`, `'security'`) |

### Slots API (`<Alert />`)

| Slot Name | Props Slot | Deskripsi |
| :--- | :--- | :--- |
| `default` | — | Konten kustom di dalam bodi alert (teks paragraf, list, link) |
| `action` | `{ dismiss }` | Tombol/area tindakan di sebelah kanan alert |
| `icon` | — | Kustomisasi elemen ikon di sebelah kiri (menggantikan ikon bawaan) |

### Events API (`<Alert />`)

| Event Name | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `@update:modelValue` | `value: Boolean` | Dipancarkan saat status visibilitas berubah (sinkronisasi `v-model`) |
| `@update:show` | `value: Boolean` | Dipancarkan saat status visibilitas berubah (sinkronisasi prop `show`) |
| `@dismiss` | — | Dipancarkan saat alert ditutup melalui tombol silang (X) atau durasi autoClose habis |
| `@close` | — | Dipancarkan saat alert mulai menutup |
| `@open` | — | Dipancarkan saat alert terbuka/ditampilkan di layar |

### Contoh Penggunaan Alert

#### 1. Alert Manual di Halaman
```vue
<script setup>
import { ref } from 'vue';
import Alert from '@/Components/Pack/Alert.vue';

const showAlert = ref(true);
</script>

<template>
  <!-- Alert Informasi Dasar dengan Auto Close (5 detik) & Progress Bar -->
  <Alert 
    type="info" 
    variant="soft" 
    title="Pengumuman" 
    message="Sistem akan mengalami pemeliharaan rutin pada pukul 23:00 WIB."
    :auto-close="5000"
    dismissible
  />

  <!-- Alert Warning dengan Tombol Dismiss & Slot Aksi -->
  <Alert 
    v-model="showAlert"
    type="warning" 
    variant="soft" 
    title="Akun Belum Diverifikasi" 
    dismissible
  >
    <p>Silakan verifikasi email Anda untuk membuka fitur lengkap.</p>

    <template #action="{ dismiss }">
      <button 
        @click="resendEmail(); dismiss();" 
        class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 hover:bg-amber-100/60 dark:hover:bg-amber-900/50 transition cursor-pointer"
      >
        Kirim Ulang Email
      </button>
    </template>
  </Alert>

  <!-- Alert Error Variant Solid -->
  <Alert 
    type="error" 
    variant="solid" 
    title="Gagal Menyimpan" 
    message="Terjadi kesalahan server saat memproses data transaksi." 
    dismissible
  />

  <!-- Alert Outline dengan Slot Icon Kustom -->
  <Alert
    type="success"
    variant="outline"
    title="Transaksi Berhasil"
    message="Pembayaran QRIS telah diterima."
  >
    <template #icon>
      <svg class="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>
    </template>
  </Alert>
</template>
```

#### 2. Alert Otomatis dari Backend Laravel Flash
```vue
<template>
  <!-- Mengonsumsi flash 'alert' dari Backend Laravel -->
  <Alert 
    v-if="$page.props.flash.alert"
    :type="$page.props.flash.alert.type || 'info'"
    :variant="$page.props.flash.alert.variant || 'soft'"
    :title="$page.props.flash.alert.title"
    :message="$page.props.flash.alert.message"
    :dismissible="$page.props.flash.alert.dismissible ?? true"
  />
</template>
```

---

## 2. ToastNotification Component & Composable

Sistem notifikasi toast melayang (*floating toast system*) yang menggunakan utilitas **Tailwind CSS** dan ikon **Google Material Symbols**. Komponen ini dirancang agar dapat digunakan kembali (*reusable*) dan mudah dirawat (*maintainable*) di berbagai project Vue 3 / InertiaJS.

### Lokasi File

* **Component**: [ToastNotification.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/ToastNotification.vue)
* **Composable**: [useNotification.js](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Composables/Pack/useNotification.js)

### Fitur Desain & Styling:
* **Tailwind CSS Utility Classes**: Dibangun sepenuhnya dengan class Tailwind (`rounded-xl`, `shadow-lg`, `border-slate-200/80`, dark mode ready via `dark:bg-slate-900`) tanpa CSS kustom yang terisolasi.
* **4 Pilihan Varian Visual**: Mendukung varian `'default'` (kartu elegan bergaris aksen), `'soft'` (latar lembut berwarna sesuai tipe), `'solid'` (warna penuh dengan kontras tinggi), dan `'outline'` (tepi tegas dengan warna tipe).
* **Google Material Symbols**: Menggunakan class `material-symbols-outlined` (`check_circle`, `warning`, `error`, `notifications`, `info`, `close`, `progress_activity`).
* **Fitur Interaktif & Performa Tinggi**: Real-time progress countdown bar berbasis `requestAnimationFrame` (hemat baterai & CPU), otomatis jeda timer saat kursor mouse di-hover, tombol aksi callback kustom dengan dukungan ikon dan `autoDismiss`, deduplikasi pesan otomatis, dan multi-positioning (6 sudut layar).

### Integration (Cara Pasang)

Cukup pasang komponen `<ToastNotification />` di root Layout aplikasi Anda (seperti `AuthenticatedLayout.vue` atau `HomepageLayout.vue`).

```vue
<script setup>
import ToastNotification from '@/Components/Pack/ToastNotification.vue';
</script>

<template>
  <div class="app-layout">
    <!-- Konten Aplikasi -->
    <slot />

    <!-- Notifikasi Toast Global -->
    <ToastNotification position="top-right" clearable />
  </div>
</template>
```

### Component Props API (`<ToastNotification />`)

| Prop | Tipe Data | Default | Pilihan Nilai / Deskripsi |
| :--- | :--- | :--- | :--- |
| `position` | `String` | `'top-right'` | Posisi default container: `'top-right'`, `'top-left'`, `'top-center'`, `'bottom-right'`, `'bottom-left'`, `'bottom-center'` |
| `duration` | `Number` | `4000` | Durasi interval default dalam milidetik (ms) untuk seluruh toast (misal: `5000` untuk 5 detik) |
| `autoWatchFlash` | `Boolean` | `true` | Otomatis menangkap flash message dari InertiaJS (`page.props.flash`) tanpa duplikasi |
| `maxToasts` | `Number` | `5` | Jumlah maksimal toast yang dapat tampil bersamaan per posisi |
| `clearable` | `Boolean` | `false` | Menampilkan tombol "Bersihkan Semua" jika ada 2 atau lebih toast aktif pada posisi tersebut |
| `typeLabels` | `Object` | `{}` | Kustomisasi label tipe (misal: `{ success: 'Berhasil', error: 'Gagal' }`) |

### Composable API (`useNotification()`)

Import composable `useNotification` di komponen Vue atau script mana saja untuk memicu notifikasi.

```javascript
import { useNotification } from '@/Composables/Pack/useNotification';

const notify = useNotification();
```

#### Method Ringkasan:
* `notify.success(message, options)`
* `notify.error(message, options)`
* `notify.warning(message, options)`
* `notify.info(message, options)`
* `notify.neutral(message, options)`
* `notify.promise(promiseOrFn, { loading, success, error }, options)`: Otomatis menampilkan loading spinner lalu bertransisi ke sukses atau error setelah promise selesai
* `notify.add(options)`: Menambahkan toast kustom dan mengembalikan `toastId`
* `notify.update(id, options)`: Memperbarui data/durasi toast yang sedang aktif
* `notify.remove(id)`: Menghapus 1 toast berdasarkan ID
* `notify.clear(position = null)`: Menghapus seluruh toast (atau spesifik pada posisi tertentu)

### Parameter Opsi Notifikasi (`options`)

Saat memanggil `notify.add()` atau method pintas, Anda dapat mengirimkan objek opsi berikut:

| Field | Tipe | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `message` | `String` | `''` | Pesan utama notifikasi (Wajib) |
| `title` | `String` | `''` | Judul notifikasi (Opsional) |
| `type` | `String` | `'info'` | Jenis toast: `'success'`, `'error'`, `'warning'`, `'info'`, `'neutral'` |
| `variant` | `String` | `'default'` | Gaya visual kartu: `'default'`, `'soft'`, `'solid'`, `'outline'` |
| `duration` | `Number` | `4000` | Durasi tampil dalam ms. Set `0` agar toast tidak otomatis tutup |
| `position` | `String` | Default prop | Mengubah posisi khusus untuk toast ini (`'bottom-right'`, `'top-center'`, dll) |
| `icon` | `String` | `null` | Google Material Icon kustom untuk menggantikan icon bawaan |
| `dedupe` | `Boolean` | `true` | Jika `true`, pesan & tipe yang sama tidak akan bertumpuk melainkan mereset durasi |
| `customStyle` | `Object` | `null` | Custom warna `{ bg: '#101827', color: '#ffffff', border: '#374151' }` |
| `action` | `Object` | `null` | Tombol aksi kustom `{ label: 'Urungkan', icon: 'undo', autoDismiss: true, onClick: (toast) => {} }` |
| `dismissible` | `Boolean` | `true` | Menampilkan tombol silang `(X)` untuk menutup notifikasi |

### Contoh-Contoh Penggunaan Toast

#### 1. Notifikasi Dasar & Varian Visual
```javascript
import { useNotification } from '@/Composables/Pack/useNotification';

const notify = useNotification();

// Sukses dengan varian Soft
notify.success('Data transaksi berhasil disimpan!', {
  variant: 'soft',
});

// Gagal / Error Solid dengan Judul
notify.error('Koneksi pembayaran terputus.', {
  title: 'Gagal Memproses',
  variant: 'solid',
});

// Peringatan Outline
notify.warning('Stok produk tinggal 2 unit.', {
  variant: 'outline',
});
```

#### 2. Penanganan Asynchronous dengan `notify.promise()`
Sangat berguna untuk proses submit HTTP, transfer data, atau mutasi database:

```javascript
await notify.promise(
  axios.post('/api/pembayaran/verifikasi', { trx_id: 'TRX-10293' }),
  {
    loading: 'Memverifikasi transaksi ke server bank...',
    success: (res) => `Pembayaran ${res.data.nominal} berhasil diverifikasi!`,
    error: (err) => err.response?.data?.message || 'Gagal memverifikasi transaksi.',
  }
);
```

#### 3. Kustomisasi Posisi & Durasi Waktu
```javascript
// Tampil di sudut bawah kanan selama 10 detik
notify.info('Pembaruan sistem akan dilakukan malam ini.', {
  position: 'bottom-right',
  duration: 10000,
});

// Tidak otomatis tutup (harus di-klik silang oleh user)
notify.error('Lisensi Anda telah kadaluarsa. Silakan perbarui.', {
  position: 'top-center',
  duration: 0,
});
```

#### 4. Tombol Aksi dengan Ikon & Non-Dismiss
```javascript
notify.warning('Item berhasil dihapus dari keranjang.', {
  action: {
    label: 'Urungkan',
    icon: 'undo',
    autoDismiss: true, // Set false jika ingin dialog konfirmasi lanjutan
    onClick: (toast) => {
      restoreCartItem();
    },
  },
});
```

#### 5. Integrasi Otomatis dengan Flash Message Laravel/Inertia
Controller Laravel cukup mengirimkan `with('success', '...')` atau `with('error', '...')`:

```php
// Di Controller Laravel
return redirect()->back()->with('success', 'Pembayaran berhasil diverifikasi!');
```

Komponen `<ToastNotification auto-watch-flash />` akan otomatis menangkap flash message tersebut dan menampilkannya sebagai toast di antarmuka frontend tanpa duplikasi.

---

## 3. TableComponent (`TableComponent.vue`)

Komponen wrapper tabel data responsif yang dibangun menggunakan utilitas **Tailwind CSS** dan ikon **Google Material Symbols**. Komponen ini menangani loading state (*multi-column skeleton loader*), empty state, toolbar pencarian/aksi, serta footer pagination secara otomatis dan modular.

### Lokasi File

* **Component**: [TableComponent.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/TableComponent.vue)

### Fitur Desain & Styling:
* **Tailwind CSS Modern Styling**: Desain tabel bersih dengan `rounded-2xl`, `border border-slate-200/80 dark:border-slate-800`, `divide-y`, dan dukungan dark mode.
* **Auto-Skeleton Transition**: Otomatis menampilkan skeleton loader saat terjadi pergantian halaman (pagination), live search/filter data, ataupun saat perpindahan halaman Inertia (`router.on('start')`/`finish`).
* **Realistic Multi-Column Skeleton**: Animasi `animate-pulse` berkolom dengan variasi lebar dinamis (`w-16`, `w-48`, `w-28`, `w-24`, `w-36`) saat `loading: true` atau saat transisi data.
* **Row Selection (Checkbox)**: Mendukung pemilihan baris data (`v-model:selected`) dengan checkbox *Select All* otomatis (mendukung state *indeterminate*).
* **Sticky Header**: Opsi `stickyHeader` agar `<thead>` tetap melayang saat tabel di-scroll secara vertikal.
* **CSV Data Export**: Menyediakan fungsi bawaan `exportToCsv(filename)` yang dapat dipanggil langsung dari slot toolbar atau ref komponen.
* **Harmonisasi Striped & Hover**: Warna hover dan zebra striping telah diselaraskan sehingga baris ganjil dan genap tetap memiliki kontras yang jelas saat di-hover.

### Component Props API (`<TableComponent />`)

| Prop | Tipe Data | Default | Deskripsi / Pilihan Nilai |
| :--- | :--- | :--- | :--- |
| `items` | `Array` | `[]` | Array data yang akan dirender ke dalam baris tabel |
| `loading` | `Boolean` | `false` | Kontrol manual state skeleton loading |
| `autoLoading` | `Boolean` | `true` | Otomatis tampilkan skeleton loading singkat saat data `items` berubah (search/page) |
| `autoLoadingDuration` | `Number` | `300` | Durasi tampil skeleton otomatis dalam milidetik (ms) |
| `watchInertia` | `Boolean` | `true` | Otomatis memicu skeleton saat request navigasi halaman Inertia berlangsung |
| `skeletonRows` | `Number` | `5` | Jumlah baris skeleton saat state loading |
| `skeletonCols` | `Number` | `4` | Jumlah kolom skeleton saat state loading |
| `selectable` | `Boolean` | `false` | Menampilkan kolom checkbox pemilihan di sebelah kiri |
| `selected` | `Array` | `[]` | Array item terpilih (`v-model:selected`) |
| `itemKey` | `String` | `'id'` | Kunci unik pengenal objek data baris (misal: `'id'`, `'uuid'`) |
| `stickyHeader` | `Boolean` | `false` | Menjadikan header kolom tetap di atas saat tabel di-scroll |
| `clickableRows` | `Boolean` | `false` | Menambahkan cursor pointer pada baris tabel |
| `emptyTitle` | `String` | `'Tidak Ada Data'` | Judul tampilan ketika data kosong |
| `emptyMessage` | `String` | `'Belum ada data yang tersedia...'` | Pesan teks ketika data kosong |
| `emptyIcon` | `String` | `'inbox'` | Nama Google Material Icon untuk tampilan kosong |
| `responsive` | `Boolean` | `true` | Mengaktifkan pembungkus horizontal scroll (`overflow-x-auto`) |
| `hoverable` | `Boolean` | `true` | Memberikan efek highlight background saat baris di-hover |
| `striped` | `Boolean` | `false` | Memberikan warna latar belang-belang (*zebra rows*) |
| `compact` | `Boolean` | `false` | Padding tabel lebih rapat untuk tampilan data padat |
| `borderless` | `Boolean` | `false` | Menghilangkan border dan shadow luar kontainer tabel |

### Slots API (`<TableComponent />`)

| Slot Name | Props Slot | Deskripsi |
| :--- | :--- | :--- |
| `toolbar` | `{ startLoading, stopLoading, isLoading, exportCsv }` | Area atas tabel (pencarian, filter status, export CSV) |
| `headers` | — | Elemen `<th>` untuk judul kolom tabel |
| `row` | `{ item, index }` | Scoped slot elemen `<td>` untuk setiap data pada `items` |
| `empty` | — | Kustomisasi tampilan penuh ketika data kosong |
| `footer` | — | Area bawah tabel (komponen pagination atau ringkasan total) |

### Events API (`<TableComponent />`)

| Event Name | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `@row-click` | `{ item, index }` | Dipancarkan saat sebuah baris data diklik (kecuali klik pada tombol/input) |
| `@update:selected` | `selectedItems: Array` | Dipancarkan saat daftar item yang dicentang berubah (`v-model:selected`) |
| `@select` | `{ item, selected: Boolean }` | Dipancarkan saat satu baris dicentang atau dilepas |
| `@select-all` | `selectedItems: Array` | Dipancarkan saat checkbox select-all di header di-toggle |

### Component Expose API (`defineExpose`)

Melalui template ref (misal: `<TableComponent ref="tableRef" />`), komponen induk dapat mengakses fungsi dan status berikut secara langsung:

| Property / Method | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `exportToCsv(filename)` | `Function(filename?: String)` | Mengekspor seluruh data array `items` ke dalam berkas CSV dan otomatis memicu download di browser pengguna |
| `startLoading()` | `Function()` | Mengaktifkan tampilan skeleton loading tabel secara manual |
| `stopLoading()` | `Function()` | Menghentikan tampilan skeleton loading tabel dan membersihkan timer |
| `isLoading` | `ComputedRef<Boolean>` | Status boolean reaktif apakah tabel saat ini sedang menampilkan skeleton (gabungan manual prop & transisi otomatis) |

### Contoh Penggunaan TableComponent

```vue
<script setup>
import { ref } from 'vue';
import TableComponent from '@/Components/Pack/TableComponent.vue';

const products = ref([
  { id: 1, name: 'Gateway API Pro', price: 'Rp 750.000', status: 'Active' },
  { id: 2, name: 'Webhook Starter', price: 'Rp 250.000', status: 'Active' },
]);
const isLoading = ref(false);
</script>

<template>
  <TableComponent
    :items="products"
    :loading="isLoading"
    :skeleton-rows="3"
    :skeleton-cols="4"
    hoverable
  >
    <!-- Slot Toolbar Pencarian / Aksi -->
    <template #toolbar>
      <input type="text" placeholder="Cari data..." class="px-3 py-1.5 text-xs border rounded-lg" />
      <button class="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg">+ Tambah</button>
    </template>

    <!-- Slot Header Kolom -->
    <template #headers>
      <th class="px-4 py-3">ID</th>
      <th class="px-4 py-3">Nama Produk</th>
      <th class="px-4 py-3">Harga</th>
      <th class="px-4 py-3">Status</th>
      <th class="px-4 py-3 text-right">Aksi</th>
    </template>

    <!-- Slot Baris Data (Scoped) -->
    <template #row="{ item, index }">
      <td class="px-4 py-3.5 text-xs font-mono">#{{ item.id }}</td>
      <td class="px-4 py-3.5 text-xs font-semibold text-slate-900">{{ item.name }}</td>
      <td class="px-4 py-3.5 text-xs">{{ item.price }}</td>
      <td class="px-4 py-3.5 text-xs">
        <span class="px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-700 font-semibold">
          {{ item.status }}
        </span>
      </td>
      <td class="px-4 py-3.5 text-xs text-right">
        <button class="text-blue-600 hover:underline">Edit</button>
      </td>
    </template>

    <!-- Slot Footer / Pagination -->
    <template #footer>
      <Pagination :data="products" item-name="produk" />
    </template>
  </TableComponent>
</template>
```

---

## 4. Pagination Component (`Pagination.vue`)

Komponen navigasi paginasi responsif berbasis **Tailwind CSS** dan ikon **Google Material Symbols**. Komponen ini dirancang untuk bekerja langsung dengan objek `LengthAwarePaginator` dari Laravel (InertiaJS), serta mendukung mode paginasi sisi klien (*client-side*) dan mode ringkas (*simple mode*).

### Lokasi File

* **Component**: [Pagination.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Pagination.vue)

### Fitur Desain & Styling:
* **Tailwind CSS Utility Classes**: Desain tombol modern (`rounded-xl`, `border border-slate-200 dark:border-slate-700`, `bg-white dark:bg-slate-800`), status aktif (`bg-blue-600 text-white font-bold`), dan status nonaktif (`opacity-60 cursor-not-allowed`).
* **Google Material Symbols**: Ikon chevron navigasi `chevron_left` dan `chevron_right` yang terpusat dan presisi.
* **Intelligent Windowing & Ellipsis**: Dihitung melalui `computed(paginationPages)` secara efisien, menyisipkan `...` secara otomatis ketika jumlah halaman banyak.
* **Dua Mode Operasi**:
  * **Server-side Mode (Default)**: Menggunakan komponen Inertia `<Link>` dengan atribut `preserve-scroll` dan `preserve-state`.
  * **Client-side Mode (`client-side: true`)**: Menggunakan elemen `<button>` yang memancarkan event `@change(page)` untuk pemrosesan data lokal di Vue.
* **Simple Mode**: Opsi menampilkan tombol *Sebelumnya* dan *Selanjutnya* disertai indikator posisi halaman (`Hal. X / Y`) tanpa deretan angka.
* **Per-Page Selector**: Dropdown pilihan jumlah data per halaman (`showPerPage`, `perPageOptions`, `v-model:perPage`).
* **Jump to Page**: Input cepat langsung menuju nomor halaman tertentu (`showJump`).
* **Loading State**: Prop `loading` untuk menonaktifkan seluruh tombol navigasi saat proses asinkron/transisi halaman berlangsung.

### Component Props API (`<Pagination />`)

| Prop | Tipe Data | Default | Deskripsi / Pilihan Nilai |
| :--- | :--- | :--- | :--- |
| `data` | `Object` | `() => ({})` | Objek pagination (struktur Laravel Paginator seperti `current_page`, `last_page`, `from`, `to`, `total`, dll.) |
| `itemName` | `String` | `'Data'` | Label nama entitas data pada teks ringkasan (contoh: `'transaksi'`, `'pengguna'`) |
| `showInfo` | `Boolean` | `true` | Menampilkan atau menyembunyikan teks ringkasan "Menampilkan x-y dari z Data" |
| `simple` | `Boolean` | `false` | Menampilkan tombol Sebelumnya, Selanjutnya, dan indikator `Hal. X / Y` (*Simple Pagination*) |
| `clientSide` | `Boolean` | `false` | Mengaktifkan mode interaksi lokal berbasis tombol `<button>` dan event `@change` alih-alih navigasi `<Link>` Inertia |
| `path` | `String` | `''` | Prefix URL kustom untuk link halaman |
| `preserveScroll`| `Boolean` | `true` | Mempertahankan posisi scroll saat berpindah halaman (Inertia Link) |
| `preserveState` | `Boolean` | `true` | Mempertahankan state komponen saat berpindah halaman (Inertia Link) |
| `loading` | `Boolean` | `false` | Menonaktifkan interaksi klik pada tombol paginasi saat proses pemuatan berlangsung |
| `showPerPage` | `Boolean` | `false` | Menampilkan dropdown pemilih jumlah data per halaman |
| `perPage` | `Number` | `10` | Nilai data per halaman aktif (mendukung `v-model:perPage`) |
| `perPageOptions`| `Array` | `[10, 25, 50, 100]`| Pilihan jumlah data pada dropdown `showPerPage` |
| `showJump` | `Boolean` | `false` | Menampilkan input untuk lompat langsung ke nomor halaman tertentu |

### Events API (`<Pagination />`)

| Event Name | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `@change` | `page: Number` | Dipancarkan saat user berpindah halaman via tombol nomor, panah, atau jump input |
| `@update:perPage` | `value: Number` | Dipancarkan saat user mengubah dropdown per halaman (`v-model:perPage`) |
| `@per-page-change`| `value: Number` | Dipancarkan saat user memilih opsi jumlah data per halaman |

### Struktur Data Paginator Laravel
Objek `data` yang dikirim dari controller Laravel melalui `LengthAwarePaginator` (contoh: `User::paginate(10)`):

```json
{
  "current_page": 2,
  "last_page": 10,
  "from": 11,
  "to": 20,
  "total": 100,
  "prev_page_url": "https://example.com/users?page=1",
  "next_page_url": "https://example.com/users?page=3",
  "links": [...]
}
```

### Contoh Penggunaan Pagination

#### 1. Server-side Inertia Pagination di dalam TableComponent
```vue
<script setup>
import TableComponent from '@/Components/Pack/TableComponent.vue';
import Pagination from '@/Components/Pack/Pagination.vue';

// Props yang diterima dari Controller Laravel Inertia
defineProps({
  users: Object, // Laravel LengthAwarePaginator
});
</script>

<template>
  <TableComponent :items="users.data">
    <template #headers>
      <th>Nama</th>
      <th>Email</th>
      <th>Role</th>
    </template>

    <template #row="{ item }">
      <td>{{ item.name }}</td>
      <td>{{ item.email }}</td>
      <td>{{ item.role }}</td>
    </template>

    <!-- Paginasi di Footer Tabel -->
    <template #footer>
      <Pagination :data="users" item-name="pengguna" />
    </template>
  </TableComponent>
</template>
```

#### 2. Client-side Pagination (Data Lokal / Filter Frontend)
```vue
<script setup>
import { ref, computed } from 'vue';
import Pagination from '@/Components/Pack/Pagination.vue';

const currentPage = ref(1);
const allItems = ref([...]); // 50 items
const perPage = 10;

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return allItems.value.slice(start, start + perPage);
});

const paginatorData = computed(() => ({
  current_page: currentPage.value,
  last_page: Math.ceil(allItems.value.length / perPage),
  from: (currentPage.value - 1) * perPage + 1,
  to: Math.min(currentPage.value * perPage, allItems.value.length),
  total: allItems.value.length,
}));
</script>

<template>
  <div>
    <!-- Render paginatedItems di sini -->

    <!-- Pagination Client-side -->
    <Pagination
      :data="paginatorData"
      item-name="transaksi"
      client-side
      @change="(page) => currentPage = page"
    />
  </div>
</template>
```

#### 3. Simple Pagination (Mode Ringkas)
```vue
<template>
  <!-- Hanya tombol Sebelumnya / Selanjutnya -->
  <Pagination
    :data="transactions"
    item-name="transaksi"
    simple
  />
</template>
```

#### 4. Pagination Lanjutan (Per-Page Selector & Jump to Page)
```vue
<script setup>
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import Pagination from '@/Components/Pack/Pagination.vue';

defineProps({
  settlements: Object, // Laravel LengthAwarePaginator
});

const currentPerPage = ref(25);

const handlePerPageChange = (newPerPage) => {
  currentPerPage.value = newPerPage;
  router.get(route('settlements.index'), { per_page: newPerPage }, {
    preserveState: true,
    preserveScroll: true,
  });
};
</script>

<template>
  <!-- Paginasi lengkap dengan pemilih per halaman & lompat langsung ke nomor halaman -->
  <Pagination
    :data="settlements"
    item-name="penyelesaian dana"
    show-per-page
    :per-page="currentPerPage"
    :per-page-options="[10, 25, 50, 100]"
    show-jump
    @update:per-page="handlePerPageChange"
  />
</template>
```

---

## 5. Modal Component (`Modal.vue`)

Komponen dialog overlay / modal responsif berbasis **Tailwind CSS** dan ikon **Google Material Symbols**. Dirender ke level teratas DOM menggunakan `<Teleport to="body">` dengan transisi animasi halus, proteksi scroll body otomatis, penanganan tombol Escape & klik backdrop, serta varian status badge.

### Lokasi File

* **Component**: [Modal.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Modal.vue)

### Fitur Desain & Styling:
* **Tailwind CSS Utility Classes**: Desain modal card modern (`rounded-2xl sm:rounded-3xl`, `border border-slate-200/80 dark:border-slate-800`, `bg-white dark:bg-slate-900`, `shadow-2xl`) dan backdrop blur (`bg-slate-900/60 backdrop-blur-xs`).
* **Google Material Symbols**: Badge ikon status dinamis (`delete_forever`, `warning`, `check_circle`, `info`, `help`, `close`) dengan warna badge yang serasi.
* **Single Synchronized Transition**: Transisi halus terkoordinasi antara backdrop dan card tanpa lag atau desinkronisasi.
* **Focus Trap (WCAG 2.1 AA)**: Menjebak siklus fokus keyboard (`Tab` / `Shift+Tab`) di dalam modal saat aktif dan mengembalikan fokus ke elemen pemanggil saat ditutup.
* **Aria Accessibility**: Dukungan penuh `role="dialog"`, `aria-modal="true"`, serta generator `aria-labelledby` otomatis yang terhubung ke ID judul modal.
* **Nested Modal Scroll Lock**: Penghitungan modal tumpuk modular sehingga scroll lock body tidak terlepas prematur saat salah satu sub-modal ditutup.
* **Position & Drawer Mode**: Mendukung posisi `'center'`, `'top'`, `'bottom'` (mobile bottom sheet), `'left'` (drawer kiri), dan `'right'` (drawer kanan).
* **Variant Accent Bar**: Garis aksen visual di bagian atas modal sesuai status variant (`danger`, `warning`, `success`, `info`, `confirm`).
* **Responsive Flex Body**: Body dialog elastis (`flex-1 min-h-0 overflow-y-auto`) tanpa batasan tinggi hardcode.
* **v-model Support**: Mendukung `v-model="isOpen"`, `v-model:show="isOpen"`, atau prop `:show="isOpen"`.

### Component Props API (`<Modal />`)

| Prop | Tipe Data | Default | Deskripsi / Pilihan Nilai |
| :--- | :--- | :--- | :--- |
| `v-model` / `show` | `Boolean` | `false` | Kontrol status buka/tutup modal secara reaktif |
| `title` | `String` | `''` | Judul modal pada area header |
| `context` | `String` | `''` | Teks eyebrow / kategori di atas judul (contoh: `'Tindakan Berisiko'`, `'Katalog Produk'`) |
| `variant` | `String` | `'default'` | Varian status visual: `'default'`, `'danger'`, `'warning'`, `'success'`, `'info'`, `'confirm'` |
| `icon` | `String` | `''` | Nama Google Material Icon kustom untuk menggantikan ikon bawaan varian |
| `maxWidth` | `String` | `'md'` | Lebar modal: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`, `'4xl'`, `'5xl'`, `'full'` |
| `position` | `String` | `'center'` | Posisi/mode tampilan: `'center'`, `'top'`, `'bottom'` (sheet), `'left'` (drawer), `'right'` (drawer) |
| `persistent` | `Boolean` | `false` | Mencegah modal tertutup saat user mengklik backdrop atau menekan tombol `Escape` |
| `loading` | `Boolean` | `false` | Menampilkan spinner loading pada tombol konfirmasi dan mengunci seluruh aksi penutupan modal |
| `confirmText` | `String` | `''` *(otomatis)*| Label teks tombol konfirmasi (default cerdas: `'Hapus'` untuk danger, `'Lanjutkan'` untuk warning, `'Simpan'` untuk lainnya) |
| `cancelText` | `String` | `'Batal'` | Label teks pada tombol pembatalan |
| `showConfirm` | `Boolean` | `true` | Menampilkan atau menyembunyikan tombol konfirmasi |
| `showCancel` | `Boolean` | `true` | Menampilkan atau menyembunyikan tombol batal |
| `showClose` | `Boolean` | `true` | Menampilkan atau menyembunyikan tombol silang `(X)` di sudut header |
| `showFooter` | `Boolean` | `true` | Menampilkan atau menyembunyikan kontainer footer tombol aksi |
| `bodyClass` | `String` | `''` | Kelas CSS tambahan untuk styling kustom area body modal |

### Slots API (`<Modal />`)

| Slot Name | Props Slot | Deskripsi |
| :--- | :--- | :--- |
| `default` | — | Konten utama modal (form, tabel ringkasan, teks deskripsi) |
| `header` | — | Kustomisasi penuh area judul header modal |
| `footer` | — | Kustomisasi tombol-tombol aksi pada footer modal |

### Events API (`<Modal />`)

| Event Name | Deskripsi |
| :--- | :--- |
| `@update:modelValue` | Dipicu saat modal dibuka atau ditutup melalui `v-model` |
| `@close` | Dipicu saat tombol Batal, tombol silang (X), backdrop, atau tombol Escape diklik |
| `@confirm` | Dipicu saat tombol konfirmasi utama diklik |

### Component Expose API (`defineExpose`)

Melalui template ref (misal: `<Modal ref="modalRef" />`), komponen induk dapat mengakses method dan status modal:

| Property / Method | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `close()` | `Function()` | Menutup modal secara programatik (menghormati status `loading`) |
| `isOpen` | `ComputedRef<Boolean>` | Status boolean reaktif apakah modal saat ini sedang terbuka |

### Contoh Penggunaan Modal

#### 1. Modal Konfirmasi Hapus (Danger Variant)
```vue
<script setup>
import { ref } from 'vue';
import Modal from '@/Components/Pack/Modal.vue';

const showDeleteModal = ref(false);
const isDeleting = ref(false);

const handleDelete = () => {
  isDeleting.value = true;
  setTimeout(() => {
    isDeleting.value = false;
    showDeleteModal.value = false;
  }, 1000);
};
</script>

<template>
  <button @click="showDeleteModal = true">Hapus Data</button>

  <Modal
    v-model="showDeleteModal"
    variant="danger"
    title="Hapus Pengguna"
    context="Tindakan Permanen"
    confirm-text="Ya, Hapus Sekarang"
    cancel-text="Batalkan"
    :loading="isDeleting"
    @confirm="handleDelete"
  >
    <p>Apakah Anda yakin ingin menghapus data pengguna ini secara permanen?</p>
  </Modal>
</template>
```

#### 2. Modal Form Input (Lebar Kustom & Slot Default)
```vue
<script setup>
import { ref } from 'vue';
import Modal from '@/Components/Pack/Modal.vue';

const showForm = ref(false);
const formData = ref({ name: '', email: '' });

const submitForm = () => {
  // Simpan data...
  showForm.value = false;
};
</script>

<template>
  <button @click="showForm = true">+ Tambah Merchant</button>

  <Modal
    v-model="showForm"
    title="Registrasi Merchant Baru"
    context="Manajemen Akun"
    max-width="lg"
    confirm-text="Simpan Merchant"
    @confirm="submitForm"
  >
    <form @submit.prevent="submitForm" class="space-y-3">
      <div>
        <label class="block text-xs font-semibold mb-1">Nama Perusahaan</label>
        <input v-model="formData.name" type="text" class="w-full px-3 py-2 text-xs border rounded-xl" />
      </div>
      <div>
        <label class="block text-xs font-semibold mb-1">Email Kontak</label>
        <input v-model="formData.email" type="email" class="w-full px-3 py-2 text-xs border rounded-xl" />
      </div>
    </form>
  </Modal>
</template>
```

#### 3. Side Drawer / Panel Samping (`position="right"`)
```vue
<template>
  <Modal
    v-model="showFilterDrawer"
    position="right"
    max-width="md"
    title="Filter Lanjutan"
    context="Pencarian Data"
    confirm-text="Terapkan Filter"
    @confirm="applyFilters"
  >
    <!-- Konten form filter atau detail panel -->
    <div class="space-y-4">
      <p>Panel meluncur mulus dari sisi kanan layar sebagai drawer/sheet.</p>
    </div>
  </Modal>
</template>
```

#### 4. Nested Modal (Modal Bersarang & Ref Control)
Komponen `Modal.vue` dilengkapi pelacak modal aktif modular (`activeModalsCount`). Ketika sub-modal kedua dibuka dari dalam modal utama, scroll lock pada elemen body tetap terjaga utuh dan baru dilepas saat seluruh modal telah tertutup:

```vue
<script setup>
import { ref } from 'vue';
import Modal from '@/Components/Pack/Modal.vue';

const mainModalRef = ref(null);
const showMainModal = ref(false);
const showConfirmSubModal = ref(false);

const handleCloseAll = () => {
  showConfirmSubModal.value = false;
  // Menutup modal utama secara programatik via template ref
  mainModalRef.value?.close();
};
</script>

<template>
  <button @click="showMainModal = true">Buka Form Transaksi</button>

  <!-- Modal Utama (Tingkat 1) -->
  <Modal
    ref="mainModalRef"
    v-model="showMainModal"
    title="Form Pembayaran Batch"
    max-width="2xl"
    confirm-text="Proses Batch"
    @confirm="showConfirmSubModal = true"
  >
    <p>Daftar transaksi yang akan diproses...</p>

    <!-- Sub-Modal Konfirmasi (Tingkat 2) -->
    <Modal
      v-model="showConfirmSubModal"
      variant="warning"
      title="Konfirmasi Eksekusi Batch"
      confirm-text="Ya, Eksekusi Sekarang"
      @confirm="handleCloseAll"
    >
      <p>Apakah Anda yakin ingin memproses 25 pembayaran ini sekaligus?</p>
    </Modal>
  </Modal>
</template>
```

---

## 6. ButtonTheme Component & useTheme Composable

Sistem pengubah tema mode gelap/terang (*dark & light mode toggle*) yang terintegrasi penuh dengan Tailwind CSS `class="dark"` pada tag `<html>`, deteksi preferensi OS pengguna (*prefers-color-scheme*), serta persistensi state di `localStorage`.

### Lokasi File

* **Component**: [ButtonTheme.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/ButtonTheme.vue)
* **Composable**: [useTheme.js](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Composables/Pack/useTheme.js)
* **Stylesheet (CSS)**: [resources/css/app.css](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/css/app.css)

### 📁 File yang Terkait & Konfigurasi CSS (`app.css`)

Untuk mengaktifkan tombol ini di project, pastikan file CSS dan modul berikut terpasang:

1. **Konfigurasi CSS ([resources/css/app.css](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/css/app.css))**:
   ```css
   @import 'tailwindcss';
   @import 'material-symbols';

   /* Baris 4: Wajib untuk Tailwind v4 agar mengenali class="dark" di <html> */
   @custom-variant dark (&:where(.dark, .dark *));
   ```
2. **State Composable**: `resources/js/Composables/Pack/useTheme.js`
3. **Komponen UI**: `resources/js/Components/Pack/ButtonTheme.vue`
4. **Layout Aplikasi**: Tempelkan `<ButtonTheme />` pada topbar/header layout Anda.

---

### Fitur Desain & Styling:
* **Murni Tailwind CSS**: Desain tombol modern (`rounded-xl`, `border border-slate-200/80 dark:border-slate-800`, `bg-white dark:bg-slate-900`, `active:scale-95`).
* **Google Material Symbols**: Ikon `dark_mode` (saat mode terang) dan `light_mode` (warna amber hangat saat mode gelap).
* **Animasi Mikro Transisi Ikon**: Efek hover scale dan transition halus pada interaksi kursor dengan palet warna biru serasi.
* **Deteksi Otomatis & Cepat Preferensi Sistem (OS)**: Otomatis mengevaluasi preferensi tema pengguna (`prefers-color-scheme: dark`) secara instan sejak pemuatan pertama tanpa flicker salah default.
* **Multi-Varian Desain**: Mendukung tombol ikon (`variant="icon"`), tombol berlabel (`variant="button"`), slider toggle standar (`variant="switch"` dengan dimensi baku `h-6 w-11`), dan segmented tab (`variant="segmented"` dengan warna aktif konsisten).
* **Aksesibilitas Lengkap (A11y)**: Dilengkapi `role="group"`, `aria-label`, `aria-pressed`, dan `role="switch"` untuk pengalaman screen reader optimal.
* **Siklus 3 Mode & Subscribable**: Mendukung siklus mode sistem via prop `cycle` / `cycleTheme()`, serta fungsi reaktif `subscribe()` dari luar komponen.

### Component Props API (`<ButtonTheme />`)

| Prop | Tipe Data | Default | Deskripsi / Pilihan Nilai |
| :--- | :--- | :--- | :--- |
| `variant` | `String` | `'icon'` | Bentuk tampilan tombol: `'icon'`, `'button'`, `'switch'`, `'segmented'` |
| `size` | `String` | `'md'` | Ukuran tombol: `'sm'` (32px), `'md'` (38px), `'lg'` (44px) |
| `showLabel` | `Boolean` | `false` | Menampilkan teks deskripsi tema di samping ikon |
| `labelLight` | `String` | `'Mode Terang'` | Teks yang ditampilkan saat tema terang aktif |
| `labelDark` | `String` | `'Mode Gelap'` | Teks yang ditampilkan saat tema gelap aktif |
| `labelSystem`| `String` | `'Mode Sistem'` | Teks yang ditampilkan saat tema sistem aktif |
| `cycle` | `Boolean` | `false` | Mengaktifkan siklus 3 mode (*Terang $\to$ Gelap $\to$ Sistem*) saat tombol ikon/button diklik |

### Composable API (`useTheme()`)

```javascript
import { useTheme } from '@/Composables/Pack/useTheme';

const { theme, isDark, toggleTheme, cycleTheme, setTheme, initTheme, cleanupTheme, subscribe } = useTheme();
```

| Return Property / Method | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `theme` | `Ref<String>` | Nilai tema yang tersimpan (`'light'`, `'dark'`, atau `'system'`) |
| `isDark` | `Ref<Boolean>` | `true` jika mode gelap sedang aktif di aplikasi |
| `toggleTheme(includeSystem = false)` | `Function` | Mengubah tema antara light $\leftrightarrow$ dark (atau siklus jika `includeSystem = true`) |
| `cycleTheme()` | `Function` | Mengganti tema berurutan: `'light'` $\to$ `'dark'` $\to$ `'system'` $\to$ `'light'` |
| `setTheme(themeName)`| `Function` | Mengatur tema secara langsung (`'light'`, `'dark'`, atau `'system'`) |
| `initTheme()` | `Function` | Menginisialisasi tema dan memasang listener OS (*auto-called by component*) |
| `cleanupTheme()` | `Function` | Melepas listener event mediaQuery OS untuk mencegah memory leak |
| `subscribe(callback)`| `Function` | Mendaftarkan fungsi listener saat tema berubah; mengembalikan fungsi unsubscribe |

### Contoh Penggunaan ButtonTheme

#### 1. Pasang di Topbar / Header Layout
```vue
<script setup>
import ButtonTheme from '@/Components/Pack/ButtonTheme.vue';
</script>

<template>
  <header class="flex items-center justify-between p-4 border-b">
    <div class="logo font-bold">Aplikasi Saya</div>

    <!-- Tombol Ganti Tema Ikon Standar -->
    <ButtonTheme size="md" />
  </header>
</template>
```

#### 2. Varian Segmented (Pilihan 3 Mode: Terang, Gelap, Sistem)
```vue
<template>
  <ButtonTheme variant="segmented" />
</template>
```

#### 3. Varian Switch Pill Toggle
```vue
<template>
  <!-- Slider switch toggle interaktif -->
  <ButtonTheme variant="switch" show-label />
</template>
```

---

## 7. ButtonSubmit Component (`ButtonSubmit.vue`)

Komponen tombol aksi universal dan polimorfik berbasis **Tailwind CSS** dan ikon **Google Material Symbols**. Dapat bertindak sebagai elemen `<button>`, navigasi Inertia `<Link>`, maupun tag tautan `<a>`, dengan dukungan terintegrasi untuk *loading spinner*, varian warna lengkap, skala ukuran fleksibel, dan mikro-interaksi responsif.

### Lokasi File

* **Component**: [ButtonSubmit.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/ButtonSubmit.vue)

### Fitur Desain & Styling:
* **Murni Tailwind CSS**: Desain tombol modern dengan status fokus aksesibel (`focus-visible:ring-2`), efek klik halus (`active:scale-98`), dan transisi warna cepat.
* **Polimorfik Tag (`as`) dengan Safe Fallback**: Secara dinamis merender tag `<button>`, komponen Inertia `<Link>`, atau tautan `<a>`. Jika `as="Link"` atau `as="a"` dipakai tanpa `href`, otomatis fallback ke tombol `<button>` disertai peringatan dev console.
* **Inert Disabled Link**: Menghapus atribut `href` dan memblokir event navigasi saat tombol dalam kondisi `disabled` atau `loading`, mencegah navigasi tak sengaja melalui tombol keyboard Enter pada tag `<a>` / `<Link>`.
* **WCAG AAA Contrast Warning Variant**: Varian `warning` menggunakan warna teks kontras tinggi `text-slate-950` di atas `bg-amber-500` (rasio kontras > 10:1, lolos uji WCAG AAA).
* **Ekspansi Varian Soft Pastel**: Mendukung varian lembut untuk berbagai status: `soft` / `soft-primary`, `soft-danger`, `soft-success`, `soft-warning`, dan `soft-secondary`.
* **Kontrol Radius Fleksibel & Pill Mode**: Mendukung kustomisasi kelengkungan sudut melalui prop `rounded` (`none`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `full`) atau shorthand prop `pill` untuk bentuk kapsul penuh.
* **Konsistensi State `active:`**: Seluruh varian memiliki penegasan warna status aktif (*active background tone*) saat ditekan.
* **Google Material Symbols**: Terintegrasi langsung dengan ikon Google (`material-symbols-outlined`), mendukung penempatan di sebelah kiri (`icon-position="left"`), kanan (`icon-position="right"`), atau ikon saja (`size="icon"`).
* **State Loading Interaktif**: Menampilkan animasi spinner `progress_activity` secara otomatis saat `loading: true`, sekaligus menonaktifkan interaksi klik ganda (*prevent double submit*).

### Component Props API (`<ButtonSubmit />`)

| Prop | Tipe Data | Default | Deskripsi / Pilihan Nilai |
| :--- | :--- | :--- | :--- |
| `as` | `String` | `'button'` | Tag elemen yang dirender: `'button'`, `'Link'` (Inertia), `'a'` (HTML link) |
| `href` | `String` | `null` | URL tujuan jika prop `as` bernilai `'Link'` atau `'a'` |
| `type` | `String` | `'submit'` | Atribut tipe tombol HTML: `'submit'`, `'button'`, `'reset'` |
| `variant` | `String` | `'primary'` | Varian warna: `'primary'`, `'secondary'`, `'danger'`, `'success'`, `'warning'`, `'outline'`, `'ghost'`, `'soft'`, `'soft-danger'`, `'soft-success'`, `'soft-warning'`, `'soft-secondary'` |
| `size` | `String` | `'md'` | Skala ukuran tombol: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'icon'` |
| `rounded` | `String` | `'default'` | Radius sudut: `'default'`, `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`, `'full'` |
| `pill` | `Boolean` | `false` | Pintasan bentuk kapsul bulat penuh (*shorthand* untuk `rounded="full"`) |
| `loading` | `Boolean` | `false` | Menampilkan spinner loading dan mengunci interaksi tombol |
| `disabled` | `Boolean` | `false` | Menonaktifkan tombol secara visual dan fungsional |
| `loadingText` | `String` | `''` | Teks alternatif yang ditampilkan saat state loading aktif |
| `icon` | `String` | `''` | Nama Google Material Icon (contoh: `'add'`, `'download'`, `'send'`) |
| `iconPosition` | `String` | `'left'` | Posisi ikon terhadap teks: `'left'`, `'right'` |
| `fullWidth` | `Boolean` | `false` | Membuat tombol melebar 100% kontainer (`w-full`) |
| `preserveScroll`| `Boolean` | `true` | Mempertahankan posisi scroll saat `as="Link"` |
| `preserveState` | `Boolean` | `true` | Mempertahankan state komponen saat `as="Link"` |

### Slots API (`<ButtonSubmit />`)

| Slot Name | Deskripsi |
| :--- | :--- |
| `default` | Konten teks atau elemen label di dalam tombol |

### Contoh Penggunaan ButtonSubmit

#### 1. Tombol Submit Form dengan Loading State
```vue
<script setup>
import { useForm } from '@inertiajs/vue3';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const form = useForm({ email: '', password: '' });

const submit = () => {
  form.post('/login');
};
</script>

<template>
  <form @submit.prevent="submit">
    <!-- Form Inputs... -->

    <ButtonSubmit
      type="submit"
      variant="primary"
      size="md"
      :loading="form.processing"
      loading-text="Memverifikasi..."
      full-width
    >
      Masuk ke Akun
    </ButtonSubmit>
  </form>
</template>
```

#### 2. Tombol Navigasi Inertia Link (`as="Link"`)
```vue
<template>
  <!-- Berperilaku sebagai Inertia Link dengan tampilan tombol -->
  <ButtonSubmit
    as="Link"
    href="/dashboard/products/create"
    variant="primary"
    icon="add"
    icon-position="left"
    size="sm"
  >
    Tambah Produk Baru
  </ButtonSubmit>
</template>
```

#### 3. Tombol Ikon Saja & Tombol Bahaya (Danger Variant)
```vue
<template>
  <!-- Tombol Khusus Ikon -->
  <ButtonSubmit
    size="icon"
    variant="ghost"
    icon="delete"
    class="text-rose-500 hover:text-rose-600"
    title="Hapus Baris Data"
    @click="deleteItem"
  />

  <!-- Tombol Bahaya dengan Teks -->
  <ButtonSubmit
    variant="danger"
    icon="delete_forever"
    size="sm"
    @click="confirmDelete"
  >
    Hapus Akun
  </ButtonSubmit>
</template>
```

#### 4. Varian Soft Pastel & Mode Pill (Bentuk Kapsul)
```vue
<template>
  <div class="flex flex-wrap gap-2">
    <ButtonSubmit variant="soft-primary" pill icon="check">Selesai</ButtonSubmit>
    <ButtonSubmit variant="soft-danger" pill icon="close">Tolak</ButtonSubmit>
    <ButtonSubmit variant="soft-warning" pill icon="schedule">Tertunda</ButtonSubmit>
    <ButtonSubmit variant="soft-success" pill icon="verified">Terverifikasi</ButtonSubmit>
  </div>
</template>
```

---

## 8. Komponen InputField (`InputField.vue`)

Komponen universal input form yang menggabungkan seluruh variasi elemen input HTML5 standar dan kontrol form modern dalam 1 komponen seragam yang adaptif terhadap dark mode Tailwind CSS dan Google Material Icons.

### Fitur Utama:
1. **Dukungan 20+ Tipe Input Lengkap**: Mendukung seluruh tipe HTML5 standar (`text`, `email`, `password`, `number`, `tel`, `url`, `search`, `date`, `time`, `datetime-local`, `month`, `week`) serta komponen khusus (`textarea`, `select`, `checkbox`, `radio`, `switch`, `file`, `color`, `range`).
2. **Password Reveal Toggle**: Tombol otomatis (ikon mata) untuk melihat/menyembunyikan sandi pada input `type="password"`.
3. **Search Auto-Clear**: Tombol silang untuk menghapus kata kunci pencarian secara instan pada `type="search"`.
4. **File Drag & Drop with Live Preview**: Area unggah berkas interaktif dengan drag-and-drop, validasi tipe file, serta pratinjau thumbnail instan untuk gambar dan nama file.
5. **Textarea dengan Character Counter**: Menampilkan sisa karakter otomatis saat prop `maxlength` digunakan.
6. **Selection Dropdown Modern**: Dropdown `<select>` dengan ikon chevron kustom, opsi array string atau pasangan `{ value, label }`.
7. **Switch & Toggles**: Komponen switch toggle animasi halus dan radio button group.
8. **Addon Prefix & Suffix**: Penambahan teks addon di kiri/kanan (misal: `"Rp"`, `"%"`, `"IDR"`, `"https://"`) atau ikon Google Material Symbols.
9. **Status Validasi Error**: Border merah otomatis, ikon peringatan, dan pesan error ramah pengguna yang selaras dengan error validation Inertia / Laravel.

---

### Daftar Tipe Input yang Didukung (`type="..."`)

| Kategori | Nilai `type` | Deskripsi & Fitur Khusus |
| :--- | :--- | :--- |
| **Kredensial & Teks** | `'text'` | Input teks umum dengan addon prefix/suffix dan ikon |
| | `'email'` | Input alamat email dengan validasi format bawaan browser |
| | `'password'` | Input kata sandi dengan tombol toggle show/hide password (Google Icons) |
| | `'search'` | Input pencarian dengan tombol hapus/clear instan |
| | `'number'` | Input angka dengan dukungan min, max, step, dan prefix mata uang (`"Rp"`) |
| | `'tel'` | Input nomor telepon / WhatsApp |
| | `'url'` | Input tautan web dengan prefix link |
| **Tanggal & Waktu** | `'date'` | Pemilih tanggal kalender kustom ala PrimeVue (navigasi bulan/tahun, badge tanggal aktif, tombol hari ini & hapus) |
| | `'time'` | Pemilih jam & menit popover kustom dengan kontrol spinner |
| | `'datetime-local'` | Pemilih tanggal dan waktu terintegrasi dalam satu panel popover kustom |
| | `'month'` | Pemilih bulan & tahun |
| | `'week'` | Pemilih minggu & tahun |
| **Pilihan & Multiline** | `'select'` | Custom floating dropdown popover ala PrimeVue dengan filter pencarian, checkmark terpilih, dan keyboard navigation |
| | `'textarea'` | Input teks multiline dengan `rows` dan live character counter limit |
| | `'checkbox'` | Kotak centang dengan label dan subteks penjelasan |
| | `'radio'` | Pilihan radio group dengan array `options` |
| | `'switch'` | Toggle sakelar switch on/off modern |
| **Media & Spesial** | `'file'` | Box upload drag-and-drop dengan live thumbnail preview |
| | `'color'` | Floating color picker popover dengan palet warna cepat, eyedropper layar, dan salin HEX |
| | `'range'` | Slider rentang nilai dengan indikator badge angka dinamis |
| | `'otp'` | Input One-Time Password / PIN dengan slot digit terpisah, auto-focus, paste parsing, masking, dan countdown timer |
| | `'mask'` | Input berformat pola kustom/preset (kartu kredit, NPWP, NIK, kode pos) dengan pemformatan otomatis dan pengikatan raw value |

---

### Component Props API (`<InputField />`)

| Prop | Tipe Data | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `modelValue` / `v-model` | `[String, Number, Boolean, File, Array, Object]` | `''` | State binding reaktif nilai input |
| `type` | `String` | `'text'` | Tipe kontrol input (mendukung 20+ HTML5 & kontrol form khusus) |
| `label` | `String` | `''` | Judul label di atas input |
| `subtext` | `String` | `''` | Teks penjelasan tambahan di sebelah label/switch/radio |
| `name` | `String` | `''` | Atribut nama input HTML |
| `id` | `String` | `''` | Atribut ID elemen input (menggunakan `useId()` Vue 3.5 secara SSR-safe) |
| `placeholder` | `String` | `''` | Teks placeholder bantuan |
| `required` | `Boolean` | `false` | Menandai field wajib diisi (menambahkan tanda `*` merah) |
| `disabled` | `Boolean` | `false` | Menonaktifkan interaksi input |
| `readonly` | `Boolean` | `false` | Mengunci input hanya dapat dibaca |
| `error` | `String` | `''` | Pesan error validasi (border merah & ring glow ala PrimeVue) |
| `hint` | `String` | `''` | Teks bantuan / petunjuk di bawah input |
| `icon` | `String` | `''` | Nama Google Material Icon di sisi kiri input |
| `iconRight` | `String` | `''` | Nama Google Material Icon di sisi kanan input |
| `prefix` | `String` | `''` | Teks addon di sisi kiri (contoh: `'Rp'`, `'https://'`) |
| `suffix` | `String` | `''` | Teks addon di sisi kanan (contoh: `'%'`, `'IDR'`, `'/ bln'`) |
| `autocomplete` | `String` | `''` | Nilai atribut autocomplete browser |
| `maxlength` | `[Number, String]` | `null` | Batas maksimum panjang karakter (menampilkan live counter) |
| `min` | `[Number, String]` | `null` | Batas nilai minimum (untuk `number`, `range`, `date`) |
| `max` | `[Number, String]` | `null` | Batas nilai maksimum (untuk `number`, `range`, `date`) |
| `step` | `[Number, String]` | `null` | Interval loncatan nilai (untuk `number`, `range`) |
| `rows` | `[Number, String]` | `3` | Jumlah baris awal untuk `type="textarea"` |
| `options` | `Array` | `[]` | Opsi pilihan untuk `type="select"`, `type="radio"`, atau saran pencarian pada `type="search"` |
| `multiple` | `Boolean` | `false` | Mengizinkan multi-select atau multi-file upload |
| `accept` | `String` | `''` | Format file yang diterima untuk `type="file"` (default kosong = menerima semua jenis berkas) |
| `size` | `String` | `'md'` | Ukuran kontrol form (`'sm'`, `'md'`, `'lg'`) |
| `clearable` | `Boolean` | `false` | Menampilkan tombol hapus instan pada input yang memiliki nilai (otomatis aktif pada `type="search"`) |
| `showPasswordToggle`| `Boolean` | `true` | Menampilkan toggle ikon mata lihat/sembunyikan sandi pada `type="password"` |
| `loading` | `Boolean` | `false` | Menampilkan spinner loading halus di sisi kanan input/select |
| `currency` | `[Boolean, String]` | `false` | Mengaktifkan format nominal uang lokal (pemisah ribuan otomatis) dan mengikat nilai murni numerik ke `v-model` |
| `maxSize` | `[Number, String]` | `null` | Batas ukuran file maksimal pada `type="file"` (misal: `'5MB'`, `'500KB'`, atau bytes) dengan validasi instan |
| `maxFiles` | `Number` | `null` | Batas jumlah file maksimal pada upload multi-berkas |
| `variant` / `layout` | `String` | `''` | Varian tampilan upload berkas (`'avatar'`, `'dropzone'` untuk single file; `'grid'`, `'list'` untuk multiple file). Default otomatis `'dropzone'` (single) dan `'grid'` (multiple) |
| `uploading` | `Boolean` | `false` | Menampilkan progress bar dan status loading unggah pada `type="file"` |
| `progress` | `Number` | `null` | Angka persentase progress unggah (0-100) pada `type="file"` |
| `liveValidation`| `Boolean` | `true` | Mengaktifkan validasi langsung format email, password strength meter, dan format nomor telepon |
| `rangeLabel` | `String` | `'Nilai'` | Label teks sebelum angka nilai pada `type="range"` |
| `rangeFormatter` | `Function` | `null` | Fungsi kustom pemformatan angka slider (misal: `(v) => `${v}%`` atau `(v) => `Rp ${v}``) |
| `autoResize` | `Boolean` | `false` | Textarea otomatis menyesuaikan tinggi dengan konten (`type="textarea"`) |
| `minRows` | `[Number, String]` | `null` | Batas minimal baris saat auto-resize (`type="textarea"`) |
| `maxRows` | `[Number, String]` | `null` | Batas maksimal baris saat auto-resize (`type="textarea"`) |
| `resize` | `String` | `'vertical'` | Kontrol arah resize manual CSS: `'none'`, `'vertical'`, `'both'`, `'horizontal'` |
| `indeterminate`| `Boolean` | `false` | Status parsial "sebagian tercentang" dengan ikon minus (`type="checkbox"`) |
| `chipDisplay` | `Boolean` | `true` | Menampilkan opsi terpilih sebagai chips/tags dengan tombol hapus individual pada multi-select (`type="select"`) |
| `length` | `Number` | `6` | Jumlah slot digit pada input PIN/OTP (`type="otp"`) |
| `integerOnly` | `Boolean` | `true` | Hanya mengizinkan karakter angka pada OTP (`type="otp"`) |
| `masked` | `Boolean` | `false` | Menyembunyikan tampilan karakter OTP dengan titik sandi (`type="otp"`) |
| `separator` | `String` | `''` | Karakter pemisah antar grup slot OTP (contoh: `'-'`) |
| `separatorAfter`| `Number` | `null` | Posisi pemisah setelah slot ke-N (default: tengah) (`type="otp"`) |
| `countdown` | `Number` | `0` | Durasi timer hitung mundur kirim ulang OTP dalam detik (`type="otp"`) |
| `resendText` | `String` | `'Kirim Ulang Kode OTP'` | Teks label tombol kirim ulang setelah countdown habis (`type="otp"`) |
| `mask` | `String` | `''` | Pola masking kustom: `#` (angka), `A` (huruf), `*` (alfanumerik) (`type="mask"`) |
| `preset` | `String` | `''` | Preset pola mask bawaan: `'credit-card'`, `'npwp'`, `'nik'`, `'postal-code'`, `'phone-id'`, `'expiry'`, `'cvv'` |
| `slotChar` | `String` | `'_'` | Karakter placeholder pada posisi slot yang belum diisi (`type="mask"`) |
| `emitRaw` | `Boolean` | `true` | Mengikat nilai murni tanpa pemisah ke `v-model` (`type="mask"`) |

---

### Slots API (`<InputField />`)

| Slot Name | Deskripsi |
| :--- | :--- |
| `default` | Kustomisasi konten label checkbox/radio atau fallback opsi select |
| `label` | Kustomisasi elemen label judul |
| `prefix` | Kustomisasi elemen prefix addon kiri |
| `suffix` | Kustomisasi elemen suffix addon kanan |
| `hint` | Kustomisasi teks petunjuk di bawah input |
| `error` | Kustomisasi pesan validasi error |

---

### Events API (`<InputField />`)

| Event Name | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `update:modelValue` | `value` | Dipicu saat nilai input berubah (sinkronisasi `v-model`) |
| `change` | `Event` | Dipicu saat terjadi event change native pada elemen kontrol |
| `blur` | `FocusEvent` | Dipicu saat elemen kehilangan fokus |
| `focus` | `FocusEvent` | Dipicu saat elemen menerima fokus |
| `clear` | — | Dipicu saat tombol clear/hapus pada input (search, text, date picker, select, mask) diklik |
| `error` | `String` | Dipicu saat terjadi error validasi berkas (`maxSize` atau `maxFiles`) |
| `cancel-upload` | — | Dipicu saat tombol batalkan unggahan pada `type="file"` diklik |
| `validate` | `{ valid: Boolean, message: String }` | Dipicu saat live validation mengevaluasi keabsahan format (email, password, tel) |
| `complete` | `String` | Dipicu saat seluruh digit OTP telah lengkap terisi (`type="otp"`) |
| `resend` | — | Dipicu saat tombol kirim ulang OTP diklik setelah timer countdown selesai (`type="otp"`) |

### Component Expose API (`defineExpose`)

Melalui template ref (misal: `<InputField ref="fieldRef" />`), komponen induk dapat mengakses fungsionalitas berikut:

| Property / Method | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `focus()` | `Function()` | Memicu fokus secara programatik ke elemen input/kontrol aktif di dalam subkomponen |
| `blur()` | `Function()` | Melepas fokus dari elemen input/kontrol aktif di dalam subkomponen |
| `inputId` | `ComputedRef<String>` | ID elemen input unik yang dipakai oleh label dan atribut HTML |
| `controlRef` | `Ref<Component>` | Template ref langsung ke instance sub-komponen aktif (`InputText`, `InputSelect`, dll.) |

---

### Contoh Penggunaan InputField

#### 1. Form Autentikasi (Text, Email & Password with Toggle)
```vue
<script setup>
import { useForm } from '@inertiajs/vue3';
import InputField from '@/Components/Pack/InputField.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const form = useForm({
  name: '',
  email: '',
  password: '',
  terms: false,
});

const handleRegister = () => {
  form.post('/register');
};
</script>

<template>
  <form @submit.prevent="handleRegister" class="space-y-4">
    <InputField
      v-model="form.name"
      label="Nama Lengkap"
      placeholder="Masukkan nama sesuai KTP"
      icon="person"
      :error="form.errors.name"
      required
    />

    <InputField
      v-model="form.email"
      type="email"
      label="Alamat Email"
      placeholder="nama@perusahaan.com"
      icon="mail"
      :error="form.errors.email"
      required
    />

    <InputField
      v-model="form.password"
      type="password"
      label="Kata Sandi"
      placeholder="Minimal 8 karakter"
      icon="lock"
      hint="Kombinasikan huruf besar, angka, dan simbol"
      :error="form.errors.password"
      required
    />

    <InputField
      v-model="form.terms"
      type="checkbox"
      label="Saya menyetujui Ketentuan Layanan"
      subtext="Kebijakan Privasi dan Merchant Agreement"
      :error="form.errors.terms"
      required
    />

    <ButtonSubmit
      type="submit"
      variant="primary"
      :loading="form.processing"
      full-width
    >
      Daftar Sekarang
    </ButtonSubmit>
  </form>
</template>
```

#### 2. Form Keuangan & Konfigurasi Transaksi (Prefix "Rp", Select & Textarea)
```vue
<script setup>
import { ref } from 'vue';
import InputField from '@/Components/Pack/InputField.vue';

const amount = ref(250000);
const paymentChannel = ref('qris');
const notes = ref('');

const channelOptions = [
  { value: 'va_bca', label: 'BCA Virtual Account' },
  { value: 'va_mandiri', label: 'Mandiri Virtual Account' },
  { value: 'qris', label: 'QRIS Dynamic Merchant' },
  { value: 'ewallet_gopay', label: 'GoPay Instant' },
];
</script>

<template>
  <div class="space-y-4">
    <!-- Input Angka dengan Prefix Rupiah & Suffix IDR -->
    <InputField
      v-model="amount"
      type="number"
      label="Nominal Deposit"
      prefix="Rp"
      suffix="IDR"
      icon="payments"
      :min="10000"
      :step="5000"
      hint="Minimal transaksi Rp 10.000"
      required
    />

    <!-- Dropdown Select Saluran Pembayaran -->
    <InputField
      v-model="paymentChannel"
      type="select"
      label="Metode Pembayaran"
      :options="channelOptions"
      icon="account_balance"
      required
    />

    <!-- Textarea dengan Character Counter Limit -->
    <InputField
      v-model="notes"
      type="textarea"
      label="Catatan Pembayaran (Opsional)"
      placeholder="Tuliskan keterangan transfer..."
      :rows="3"
      :maxlength="150"
      hint="Maksimal 150 karakter"
    />
  </div>
</template>
```

#### 3. Upload File & Rich Metadata Preview (4 Varian Desain)
Mendukung 4 varian desain: 2 untuk *Single File* (`'avatar'`, `'dropzone'`) dan 2 untuk *Multiple File* (`'grid'`, `'list'`). Setiap varian dilengkapi kartu informasi detail berkas (ekstensi/MIME badge, ukuran KB/MB, dimensi piksel foto, timestamp waktu upload, tombol zoom modal, serta progress bar loading unggah).

```vue
<script setup>
import { ref } from 'vue';
import InputField from '@/Components/Pack/InputField.vue';

// 1. Single File: Avatar / Logo
const merchantLogo = ref(null);

// 2. Single File: Hero Dropzone
const kycDocument = ref(null);

// 3. Multiple File: Visual Gallery Grid
const productGallery = ref([]);

// 4. Multiple File: Compact List / Table
const financialReports = ref([]);

const isUploading = ref(false);
const uploadProgress = ref(65);
</script>

<template>
  <div class="space-y-6">
    <!-- Single File: Avatar / Logo Profil -->
    <InputField
      v-model="merchantLogo"
      type="file"
      variant="avatar"
      label="Logo Merchant / Avatar"
      accept="image/*"
      max-size="2MB"
      hint="Format PNG/JPG/WebP, maksimal 2 MB"
    />

    <!-- Single File: Hero Dropzone Dokumen -->
    <InputField
      v-model="kycDocument"
      type="file"
      variant="dropzone"
      label="Dokumen KYC / NPWP Perusahaan"
      accept="image/*,.pdf"
      max-size="5MB"
      :uploading="isUploading"
      :progress="uploadProgress"
      hint="Mendukung Drag & Drop berkas KTP, NPWP atau NIB"
      required
    />

    <!-- Multiple File: Visual Gallery Grid -->
    <InputField
      v-model="productGallery"
      type="file"
      variant="grid"
      multiple
      :max-files="6"
      max-size="10MB"
      label="Galeri Foto Produk / Bukti Transaksi"
      accept="image/*"
      hint="Rasio 1:1 kartu grid dengan fitur klik perbesar (zoom modal)"
    />

    <!-- Multiple File: Compact Row List / Table -->
    <InputField
      v-model="financialReports"
      type="file"
      variant="list"
      multiple
      :max-files="10"
      max-size="20MB"
      label="Lampiran Rekonsiliasi Keuangan"
      accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
      hint="Format tabel ringkas dengan badge tipe file, ukuran KB/MB, dan aksi cepat"
    />
  </div>
</template>
```

#### 4. Pengaturan Sistem (Switch, Radio Group, Slider & Color Picker)
```vue
<script setup>
import { ref } from 'vue';
import InputField from '@/Components/Pack/InputField.vue';

const isAutoRetry = ref(true);
const gatewayEnv = ref('sandbox');
const fraudThreshold = ref(80);
const brandColor = ref('#2563eb');

const envOptions = [
  { value: 'sandbox', label: 'Sandbox Mode (Development)' },
  { value: 'production', label: 'Production Mode (Live)' },
];
</script>

<template>
  <div class="space-y-5">
    <!-- Switch Toggle -->
    <InputField
      v-model="isAutoRetry"
      type="switch"
      label="Otomatis Kirim Ulang Webhook"
      subtext="Kirim ulang callback hingga 3x jika server merchant gagal merespons"
    />

    <!-- Radio Options -->
    <InputField
      v-model="gatewayEnv"
      type="radio"
      name="gateway_environment"
      label="Lingkungan API"
      :options="envOptions"
    />

    <!-- Range Slider -->
    <InputField
      v-model="fraudThreshold"
      type="range"
      label="Skor Proteksi Anti-Fraud"
      :min="0"
      :max="100"
      :step="5"
      hint="Transaksi di bawah skor ini akan otomatis ditolak"
    />

    <!-- Color Picker -->
    <InputField
      v-model="brandColor"
      type="color"
      label="Warna Aksen Halaman Pembayaran"
      hint="Sesuaikan dengan identitas visual merek Anda"
    />
  </div>
</template>
```

#### 5. Kontrol Programatik via Template Ref (`ref.focus()`)
```vue
<script setup>
import { ref } from 'vue';
import InputField from '@/Components/Pack/InputField.vue';

const emailFieldRef = ref(null);
const emailValue = ref('');

const focusEmailInput = () => {
  // Memicu fokus secara programatik langsung ke elemen input native di dalam subkomponen
  emailFieldRef.value?.focus();
};
</script>

<template>
  <div class="space-y-3">
    <InputField
      ref="emailFieldRef"
      v-model="emailValue"
      type="email"
      label="Email Notifikasi Webhook"
      placeholder="webhook@merchant.com"
      icon="mail"
    />
    <button
      @click="focusEmailInput"
      class="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
    >
      Fokuskan Kursor ke Email
    </button>
  </div>
</template>
```

#### 6. Verifikasi Transaksi & Kartu Kredit (OTP & Masked Input)
```vue
<script setup>
import { ref } from 'vue';
import InputField from '@/Components/Pack/InputField.vue';

const otpCode = ref('');
const cardNumber = ref('');
const cardExpiry = ref('');
const cardCvv = ref('');
const npwp = ref('');

const handleOtpComplete = (code) => {
  console.log('OTP siap diverifikasi:', code);
};

const handleResendOtp = () => {
  console.log('Mengirim ulang OTP ke nomor WhatsApp merchant...');
};
</script>

<template>
  <div class="space-y-5">
    <!-- Input OTP / PIN 6-digit dengan countdown & separator '-' -->
    <InputField
      v-model="otpCode"
      type="otp"
      label="Kode Verifikasi OTP"
      hint="Masukkan 6 digit kode yang dikirim via SMS/WhatsApp"
      :length="6"
      separator="-"
      :countdown="60"
      auto-focus
      @complete="handleOtpComplete"
      @resend="handleResendOtp"
      required
    />

    <!-- Input Nomor Kartu Kredit dengan Masking Otomatis -->
    <InputField
      v-model="cardNumber"
      type="mask"
      preset="credit-card"
      label="Nomor Kartu Kredit / Debit"
      icon="credit_card"
      clearable
      required
    />

    <div class="grid grid-cols-2 gap-3">
      <!-- Expiry Date MM/YY -->
      <InputField
        v-model="cardExpiry"
        type="mask"
        preset="expiry"
        label="Masa Berlaku"
        placeholder="BB/TT"
        required
      />

      <!-- CVV 3-digit -->
      <InputField
        v-model="cardCvv"
        type="mask"
        preset="cvv"
        label="Kode CVV"
        placeholder="123"
        icon-right="lock"
        required
      />
    </div>

    <!-- Input NPWP Perusahaan -->
    <InputField
      v-model="npwp"
      type="mask"
      preset="npwp"
      label="Nomor Pokok Wajib Pajak (NPWP)"
      hint="Format: 00.000.000.0-000.000"
    />
  </div>
</template>
```

#### 7. Fitur Lanjutan (Auto-Resize Textarea, Grouped Select & Indeterminate Checkbox)
```vue
<script setup>
import { ref } from 'vue';
import InputField from '@/Components/Pack/InputField.vue';

const complaintNote = ref('');
const selectedBank = ref('');
const selectedChannels = ref(['qris', 'va_bca']);
const isAllSelected = ref(false);
const isIndeterminate = ref(true);

const groupedBanks = [
  { value: 'bca', label: 'BCA (Bank Central Asia)', group: 'Bank Konvensional' },
  { value: 'mandiri', label: 'Bank Mandiri', group: 'Bank Konvensional' },
  { value: 'bri', label: 'Bank BRI', group: 'Bank Konvensional' },
  { value: 'bsi', label: 'BSI (Bank Syariah Indonesia)', group: 'Bank Syariah' },
  { value: 'muamalat', label: 'Bank Muamalat', group: 'Bank Syariah' },
];
</script>

<template>
  <div class="space-y-4">
    <!-- Textarea yang mengembang otomatis (Auto-Resize) -->
    <InputField
      v-model="complaintNote"
      type="textarea"
      label="Keterangan Komplain Transaksi"
      placeholder="Ketik detail transaksi yang ingin diinvestigasi..."
      auto-resize
      :min-rows="2"
      :max-rows="8"
      hint="Textarea otomatis meninggi tanpa scrollbar hingga batas 8 baris"
    />

    <!-- Select dengan Pengelompokan Opsi (Grouped Options) & Clearable -->
    <InputField
      v-model="selectedBank"
      type="select"
      label="Pilih Bank Penyelesaian"
      :options="groupedBanks"
      clearable
      required
    />

    <!-- Multi-Select dengan Tampilan Chips/Badges -->
    <InputField
      v-model="selectedChannels"
      type="select"
      label="Saluran Pembayaran Aktif"
      :options="groupedBanks"
      multiple
      chip-display
    />

    <!-- Checkbox Indeterminate (State Parsial) -->
    <InputField
      v-model="isAllSelected"
      type="checkbox"
      label="Pilih Semua Transaksi"
      subtext="Menampilkan ikon tanda minus (-) saat sebagian data terpilih"
      :indeterminate="isIndeterminate"
    />
  </div>
</template>
```

---

## 9. Arsitektur Internal & Sub-Komponen Input (`Input/`)

Untuk menjaga agar komponen `InputField.vue` tetap bersih, modular, dan mudah dirawat, arsitektur form control Pack menggunakan pola **Facade Pattern**. Komponen induk `InputField.vue` bertindak sebagai *orchestrator / facade* (menangani label, *required asterisk*, *character counter limit*, slot header/hint/error, dan forwarding `ref="controlRef"`), sementara logika render dan penanganan interaksi spesifik didelegasikan ke **10 sub-komponen** yang berada di dalam folder [resources/js/Components/Pack/Input/](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Input/).
Untuk menjaga agar komponen `InputField.vue` tetap bersih, modular, dan mudah dirawat, arsitektur form control Pack menggunakan pola **Facade Pattern**. Komponen induk `InputField.vue` bertindak sebagai *orchestrator / facade* (menangani label, *required asterisk*, *character counter limit*, slot header/hint/error, dan forwarding `ref="controlRef"`), sementara logika render dan penanganan interaksi spesifik didelegasikan ke **12 sub-komponen** yang berada di dalam folder [resources/js/Components/Pack/Input/](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Input/).

### Diagram Alur Delegasi Facade InputField

```
InputField.vue (Facade Orchestrator)
│
├── type="text" | "email" | "password" | "number" | "tel" | "url" | "search" | "currency"
│     └── → InputText.vue
│           ├── Live Validation & Password Strength Meter
│           ├── Currency Formatter (id-ID) & Phone Formatter
│           ├── Search Suggestions Dropdown & Auto-Clear
│           └── Password Reveal Toggle
│
├── type="select"
│     └── → InputSelect.vue (Custom PrimeVue-style Dropdown with Search & Keyboard Nav)
│     └── → InputSelect.vue (Custom PrimeVue-style Dropdown with Grouping, Chips & Keyboard Nav)
│
├── type="textarea"
│     └── → InputTextarea.vue (Multiline Text Input with Auto-rows & Character Counter)
│     └── → InputTextarea.vue (Multiline Text Input with Auto-Resize, Min/Max Rows & Char Counter)
│
├── type="checkbox"
│     └── → InputCheckbox.vue (Custom Checkbox with Label & Subtext Slots)
│     └── → InputCheckbox.vue (Custom Checkbox with Indeterminate State & Group Options Mode)
│
├── type="radio"
│     └── → InputRadio.vue (Radio Group with Rich Option Card / Standard Styling)
│
├── type="switch"
│     └── → InputSwitch.vue (Modern Animated On/Off Toggle Pill)
│
├── type="otp"
│     └── → InputOtp.vue (Digit Slot Entry, Auto-Focus, Paste Parsing, Masking & Countdown Timer)
│
├── type="mask"
│     └── → InputMask.vue (Pattern Masking: Credit Card, NPWP, NIK, Expiry, CVV & Raw Binding)
│
├── type="file"
│     └── → InputFile.vue
│           ├── Single: 'dropzone' (Hero Drag-and-Drop) & 'avatar' (Circular/Square Logo)
│           ├── Multiple: 'grid' (Gallery Cards with Zoom Modal) & 'list' (Table Attachments)
│           └── Live Thumbnail, MIME Validation, Size/Count Limits, Upload Progress Bar
│
├── type="color"
│     └── → InputColor.vue (Color Picker Popover with Swatches & Screen Eyedropper)
│
├── type="range"
│     └── → InputRange.vue (Value Slider with Dynamic Value Badge & Range Formatter)
│
└── type="date" | "time" | "datetime-local"
      └── → InputDatePicker.vue (Custom PrimeVue-style Calendar, Time Spinner, Datetime Popover)
```

---

### Inventaris & Spesifikasi 10 Sub-Komponen Input
### Inventaris & Spesifikasi 12 Sub-Komponen Input

#### 9.1 `InputText.vue`
* **Lokasi File**: [InputText.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Input/InputText.vue)
* **Tipe yang Ditangani**: `'text'`, `'email'`, `'password'`, `'number'`, `'tel'`, `'url'`, `'search'`, `'currency'`.
* **Fitur Unggulan**:
  * **Password Toggle & Strength Meter**: Menghitung skor kekuatan sandi (1-4) berdasarkan panjang karakter, kombinasi huruf besar/kecil, angka, dan simbol khusus dengan visual progress bar.
  * **Live Validation**: Validasi format email secara langsung dan format nomor telepon Indonesia (`08xx-xxxx-xxxx`).
  * **Currency Auto-Formatting**: Otomatis memformat tampilan nominal rupiah (`id-ID`) sementara `v-model` tetap menyimpan nilai numerik bersih (`Number` atau `null`).
  * **Search Suggestions Popover**: Menggunakan `useClickOutside` untuk menutup panel saran pencarian otomatis saat pengguna mengklik di luar kontainer.
  * **Expose API**: Menyediakan method `focus()`, `blur()`, dan `inputRef` ke elemen native `<input>`.

#### 9.2 `InputFile.vue`
* **Lokasi File**: [InputFile.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Input/InputFile.vue)
* **Tipe yang Ditangani**: `'file'`.
* **Fitur Unggulan**:
  * **4 Varian Tata Letak**:
    1. `'dropzone'`: Area drag-and-drop hero untuk upload single dokumen (KYC, NPWP, NIB).
    2. `'avatar'`: Pratinjau upload logo/foto profil berbentuk lingkaran atau persegi rounded.
    3. `'grid'`: Galeri kartu multi-berkas dengan thumbnail gambar, dimensi piksel, dan tombol zoom pratinjau modal.
    4. `'list'`: Format tabel lampiran multi-berkas dengan badge ekstensi berkas, ukuran KB/MB, timestamp, dan tombol hapus individual.
  * **Validasi Sisi Klien Instan**: Validasi batas ukuran maksimum (`max-size="5MB"` atau bytes) dan jumlah berkas maksimum (`max-files="6"`).
  * **State Unggah Asinkron**: Mendukung prop `uploading` dan `progress` (0-100%) dengan bar indikator progres animasi.

#### 9.3 `InputDatePicker.vue`
* **Lokasi File**: [InputDatePicker.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Input/InputDatePicker.vue)
* **Tipe yang Ditangani**: `'date'`, `'time'`, `'datetime-local'`.
* **Fitur Unggulan**:
  * **Desain Popover ala PrimeVue**: Floating overlay kalender interaktif tanpa mengandalkan datepicker native browser yang inkonsisten antar OS.
  * **Integrasi `useClickOutside`**: Otomatis menutup panel kalender saat pengguna mengklik di luar area input.
  * **Time Spinner Selector**: Pengatur jam dan menit presisi dengan tombol increment/decrement dan format 24 jam.
  * **Tombol Cepat**: Tombol *Hari Ini* dan *Hapus (Clear)* bawaan.

#### 9.4 `InputSelect.vue`
* **Lokasi File**: [InputSelect.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Input/InputSelect.vue)
* **Tipe yang Ditangani**: `'select'`.
* **Fitur Unggulan**:
  * **Option Grouping**: Mendukung pengelompokan opsi dengan header divider otomatis jika properti `group` disertakan pada opsi (contoh: `{ value: 'bca', label: 'BCA', group: 'Bank Transfer' }`).
  * **Multi-Select Chips Mode**: Opsi terpilih ditampilkan sebagai badge chip individual yang dapat dihapus satu per satu (`chipDisplay`, default `true`).
  * **Clearable Single Select**: Tombol `(X)` untuk mereset pilihan kembali ke kosong (`clearable: true`).
  * **Search Filter**: Input pencarian real-time di dalam dropdown jika jumlah opsi > 5 atau prop `searchable` aktif.
  * **Navigasi Keyboard Lengkap**: Mendukung tombol panah atas/bawah (`ArrowUp`/`ArrowDown`), `Enter` untuk memilih, dan `Escape` untuk menutup.
  * **Integrasi `useClickOutside`**: Menutup panel listbox secara mulus saat klik di luar.
  * **Expose API**: Menyediakan `open()`, `close()`, `focus()`, dan `isOpen`.

#### 9.5 `InputColor.vue`
* **Lokasi File**: [InputColor.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Input/InputColor.vue)
* **Tipe yang Ditangani**: `'color'`.
* **Fitur Unggulan**:
  * **Palet Warna Cepat**: Grid preset palet warna modern yang siap dipilih dalam 1 klik.
  * **Hex Manual Input & Copy**: Input teks nilai hexadecimal langsung dengan tombol salin instan.
  * **Screen Eyedropper API**: Menggunakan `window.EyeDropper` native browser untuk mengambil warna dari layar mana saja bila didukung.

#### 9.6 `InputRadio.vue`
* **Lokasi File**: [InputRadio.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Input/InputRadio.vue)
* **Tipe yang Ditangani**: `'radio'`.
* **Fitur Unggulan**:
  * Menerima array opsi string sederhana maupun objek kaya `{ value, label, subtext, disabled }`.
  * Status visual aktif/fokus yang jelas dengan border kontras dan ring glow.

#### 9.7 `InputCheckbox.vue`
* **Lokasi File**: [InputCheckbox.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Input/InputCheckbox.vue)
* **Tipe yang Ditangani**: `'checkbox'`.
* **Fitur Unggulan**:
  * Checkbox kustom dengan ikon centang Google Icons.
  * Mendukung label, subteks penjelasan tambahan, serta slot default untuk link syarat & ketentuan interaktif.
  * **Indeterminate State**: Mendukung status parsial (`indeterminate: true`) yang menampilkan ikon minus (`remove`), sangat berguna untuk checkbox *"Select All"* pada tabel data.
  * **Group Options Mode**: Mendukung prop `options` untuk merender daftar pilihan banyak sekaligus dengan binding array ke `v-model`.
  * **Array Value Binding**: Mendukung prop `value` untuk menambahkan/menghapus item ke dalam array `modelValue`.
  * **Aksesibilitas**: Dilengkapi atribut `aria-checked="mixed"` saat kondisi indeterminate aktif.

#### 9.8 `InputTextarea.vue`
* **Lokasi File**: [InputTextarea.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Input/InputTextarea.vue)
* **Tipe yang Ditangani**: `'textarea'`.
* **Fitur Unggulan**:
  * Atribut baris dinamis (`rows`) dan batas karakter (`maxlength`).
  * Styling fokus seragam dengan `InputText`.
  * Expose API: `focus()`, `blur()`, dan `textareaRef`.
  * **Auto-Resize Otomatis**: Textarea mengembang otomatis menyesuaikan tinggi isi teks tanpa scrollbar (`autoResize: true`).
  * **Min & Max Rows Constraints**: Membatasi batas minimum (`minRows`) dan batas maksimum (`maxRows`) ketinggian saat auto-resize aktif.
  * **Resize Handle Control**: Kontrol arah handle resize CSS via prop `resize` (`'none'`, `'vertical'`, `'both'`, `'horizontal'`).
  * **Expose API**: Menyediakan `focus()`, `blur()`, `adjustHeight()`, dan `textareaRef`.

#### 9.9 `InputRange.vue`
* **Lokasi File**: [InputRange.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Input/InputRange.vue)
* **Tipe yang Ditangani**: `'range'`.
* **Fitur Unggulan**:
  * Slider rentang nilai responsif dengan badge visual indikator angka saat digeser.
  * Mendukung fungsi `rangeFormatter` kustom (contoh: `(v) => \`\${v}%\`` atau `(v) => \`Rp \${v.toLocaleString()}\``).

#### 9.10 `InputSwitch.vue`
* **Lokasi File**: [InputSwitch.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Input/InputSwitch.vue)
* **Tipe yang Ditangani**: `'switch'`.
* **Fitur Unggulan**:
  * Toggle pill modern dengan transisi geser halus.
  * Aksesibilitas bawaan dengan `role="switch"` dan `aria-checked`.

#### 9.11 `InputOtp.vue` *(Komponen Baru)*
* **Lokasi File**: [InputOtp.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Input/InputOtp.vue)
* **Tipe yang Ditangani**: `'otp'`.
* **Fitur Unggulan**:
  * **Slot-Based Digits**: Input terpisah per digit (default 6 digit) dengan navigasi otomatis keyboard (`ArrowLeft`, `ArrowRight`, `Backspace`).
  * **Clipboard Paste Auto-Distribute**: Otomatis mendistribusikan kode OTP saat pengguna melakukan paste (*Ctrl+V*) dari SMS atau pesan WhatsApp.
  * **Masking Support**: Mode `masked: true` untuk menyembunyikan angka menjadi titik sandi (cocok untuk PIN transaksi/keuangan).
  * **Separator Visual**: Menampilkan pemisah visual antar grup angka (misal `separator="-"` setelah digit ke-3).
  * **Built-in Resend Countdown**: Fitur timer hitung mundur bawaan (`countdown="60"`) dengan tombol kirim ulang otomatis aktif saat waktu habis.
  * **Event `@complete`**: Otomatis memicu event saat seluruh slot telah terisi penuh.
  * **Expose API**: `focus()`, `clear()`, `getValue()`, `startCountdown()`.

#### 9.12 `InputMask.vue` *(Komponen Baru)*
* **Lokasi File**: [InputMask.vue](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Components/Pack/Input/InputMask.vue)
* **Tipe yang Ditangani**: `'mask'`.
* **Fitur Unggulan**:
  * **Pattern Masking Fleksibel**: Mendukung pola kustom dengan karakter `#` (angka), `A` (huruf), dan `*` (alfanumerik).
  * **Preset Pola Bawaan**:
    * `'credit-card'`: `####-####-####-####`
    * `'npwp'`: `##.###.###.#-###.###`
    * `'nik'`: `################` (16 digit)
    * `'postal-code'`: `#####` (5 digit)
    * `'phone-id'`: `####-####-####`
    * `'expiry'`: `##/##` (MM/YY)
    * `'cvv'`: `###`
  * **Dual Value Binding**: Nilai yang diikat ke `v-model` adalah nilai mentah tanpa separator (`emitRaw: true`), sementara tampilan input memformat otomatis secara visual.
  * **Slot Placeholder**: Menampilkan karakter panduan pada posisi yang belum terisi (default `slotChar="_"`).
  * **Expose API**: `focus()`, `blur()`, `inputRef`.

---

## 10. Composable `useClickOutside.js`

Composable utilitas ringan (*lightweight composable*) untuk mendeteksi interaksi klik di luar elemen target. Digunakan secara internal oleh sub-komponen yang memiliki panel melayang / popover (`InputSelect.vue`, `InputDatePicker.vue`, `InputColor.vue`, dan pencarian autocomplete pada `InputText.vue`).

### Lokasi File

* **Composable**: [useClickOutside.js](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Composables/Pack/useClickOutside.js)

### Fitur & Keunggulan:
* **Event Pointerdown**: Menggunakan event `pointerdown` alih-alih `click` biasa untuk menangkap interaksi sentuh (touchscreen) dan mouse secara instan sebelum bubbling dimulai.
* **Capture Phase**: Menggunakan opsi `capture: true` (`document.addEventListener('pointerdown', listener, true)`) untuk memastikan deteksi klik luar tetap bekerja meskipun ada elemen anak yang memanggil `stopPropagation()`.
* **Auto Cleanup**: Otomatis melepas event listener pada siklus hidup `onUnmounted()` untuk mencegah memory leak.

### Signature API (`useClickOutside`)

```javascript
useClickOutside(targetRef, handler);
```

| Parameter | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `targetRef` | `Ref<HTMLElement>` | Template ref ke elemen kontainer utama yang diproteksi dari penutupan |
| `handler` | `(event: MouseEvent \| TouchEvent) => void` | Fungsi callback yang dipanggil ketika klik terjadi di luar `targetRef` |

### Contoh Penggunaan di Komponen Kustom

```vue
<script setup>
import { ref } from 'vue';
import { useClickOutside } from '@/Composables/Pack/useClickOutside.js';

const menuRef = ref(null);
const isMenuOpen = ref(false);

// Tutup menu otomatis jika user mengklik area mana pun di luar menuRef
useClickOutside(menuRef, () => {
  if (isMenuOpen.value) {
    isMenuOpen.value = false;
  }
});
</script>

<template>
  <div ref="menuRef" class="relative inline-block">
    <button @click="isMenuOpen = !isMenuOpen" class="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg">
      Aksi Cepat
    </button>

    <!-- Dropdown Menu -->
    <div v-if="isMenuOpen" class="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-2 z-20 space-y-1">
      <a href="#" class="block px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cetak Invoice</a>
      <a href="#" class="block px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Kirim Ulang Webhook</a>
    </div>
  </div>
</template>
```

---

## 11. Composable `useFormValidation.js` *(Baru)*

Composable tingkat form (*form-level validation*) yang fleksibel untuk mengelola validasi berbasis aturan (*rule-based*), status kesalahan (*error state*), status field disentuh (*touched*), serta kompatibel penuh dengan objek formulir InertiaJS (`useForm`) dan response error Laravel (HTTP 422).

### Lokasi File

* **Composable**: [useFormValidation.js](file:///c:/SPEED/INTEGRATION-PAYMENT-GATEWAY/resources/js/Composables/Pack/useFormValidation.js)

### Fitur & Keunggulan:
* **Rule-Based Declarative Schema**: Mendukung skema validasi bersih dan deklaratif tanpa library eksternal berat.
* **Bahasa Indonesia Ramah Pengguna**: Pesan kesalahan bawaan disajikan dalam Bahasa Indonesia yang profesional dan otomatis menyesuaikan label field.
* **Mode Validasi Fleksibel**:
  * `'touched'` *(Default)*: Validasi langsung berjalan setelah pengguna menyentuh/mengisi field tersebut.
  * `'eager'`: Validasi langsung dievaluasi pada setiap ketukan karakter sejak awal.
  * `'lazy'`: Validasi hanya dievaluasi saat fungsi `validate()` dipanggil (misal saat form disubmit).
* **Integrasi Backend Laravel**: Menyediakan fungsi `setErrors(response.data.errors)` untuk langsung memasukkan pesan kesalahan dari controller Laravel ke dalam form frontend.

### Aturan Validasi yang Didukung (`schemaRules`)

| Rule | Tipe | Contoh Nilai | Deskripsi |
| :--- | :--- | :--- | :--- |
| `required` | `Boolean \| String` | `true` atau `'Harus diisi!'` | Memastikan field tidak kosong, null, false, atau array kosong |
| `email` | `Boolean \| String` | `true` | Validasi format alamat email standar RFC |
| `phone` | `Boolean \| String` | `true` | Validasi nomor telepon Indonesia (10–15 digit angka) |
| `numeric` | `Boolean \| String` | `true` | Memastikan nilai berupa angka numerik valid |
| `min` | `Number` | `10000` | Batas nilai minimum angka |
| `max` | `Number` | `10000000` | Batas nilai maksimum angka |
| `minLength` | `Number` | `8` | Batas minimal panjang karakter teks |
| `maxLength` | `Number` | `100` | Batas maksimal panjang karakter teks |
| `pattern` | `RegExp \| String` | `/^[A-Z0-9]+$/` | Validasi kecocokan pola regular expression kustom |
| `confirmed` | `String` | `'password'` | Memastikan nilai sama persis dengan field lain (konfirmasi sandi) |
| `custom` | `Function` | `(val, all) => ...` | Fungsi validasi logika kustom; mengembalikan pesan string jika error, atau null jika valid |
| `label` | `String` | `'Nomor Rekening'` | Kustomisasi nama label field yang muncul pada pesan error |

### Signature API (`useFormValidation`)

```javascript
import { useFormValidation } from '@/Composables/Pack/useFormValidation';

const {
  errors,         // Objek reaktif pesan error { [field]: string }
  touched,        // Objek reaktif status field yang sudah disentuh { [field]: boolean }
  isValid,        // Computed boolean: true jika tidak ada error
  isDirty,        // Computed boolean: true jika minimal 1 field telah disentuh
  validate,       // Function(): Mengevaluasi seluruh form, return boolean
  validateField,  // Function(field): Mengevaluasi 1 field tertentu
  touch,          // Function(field): Menandai field telah disentuh (blur event)
  clearErrors,    // Function(field?): Menghapus error satu atau seluruh field
  setFieldError,  // Function(field, msg): Menetapkan pesan error manual
  setErrors,      // Function(errorsObj): Batch assign error dari response Laravel
  reset,          // Function(): Mereset seluruh state error dan touched
} = useFormValidation(formData, schemaRules, { mode: 'touched' });
```

### Contoh Penggunaan `useFormValidation`

#### 1. Validasi Form Transaksi Pembayaran
```vue
<script setup>
import { reactive } from 'vue';
import InputField from '@/Components/Pack/InputField.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';
import { useFormValidation } from '@/Composables/Pack/useFormValidation';

const form = reactive({
  merchantName: '',
  email: '',
  phone: '',
  nominal: 0,
  pin: '',
});

const rules = {
  merchantName: { required: true, minLength: 3, label: 'Nama Merchant' },
  email: { required: true, email: true, label: 'Alamat Email' },
  phone: { required: true, phone: true, label: 'Nomor WhatsApp' },
  nominal: { required: true, numeric: true, min: 10000, max: 50000000, label: 'Nominal Transaksi' },
  pin: { required: true, minLength: 6, maxLength: 6, label: 'PIN Keamanan' },
};

const { errors, validate, touch, reset } = useFormValidation(form, rules);

const handleSubmit = () => {
  if (!validate()) {
    console.warn('Form masih mengandung kesalahan!');
    return;
  }
  console.log('Data valid, kirim ke backend:', form);
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <InputField
      v-model="form.merchantName"
      label="Nama Merchant"
      :error="errors.merchantName"
      @blur="touch('merchantName')"
      required
    />

    <InputField
      v-model="form.email"
      type="email"
      label="Email Notifikasi"
      :error="errors.email"
      @blur="touch('email')"
      required
    />

    <InputField
      v-model="form.phone"
      type="tel"
      label="Nomor WhatsApp"
      :error="errors.phone"
      @blur="touch('phone')"
      required
    />

    <InputField
      v-model="form.nominal"
      type="currency"
      currency
      prefix="Rp"
      label="Nominal Transaksi"
      :error="errors.nominal"
      @blur="touch('nominal')"
      required
    />

    <InputField
      v-model="form.pin"
      type="otp"
      masked
      :length="6"
      label="PIN Keamanan Transaksi"
      :error="errors.pin"
      required
    />

    <div class="flex gap-2">
      <ButtonSubmit type="submit" variant="primary">Proses Pembayaran</ButtonSubmit>
      <ButtonSubmit type="button" variant="outline" @click="reset">Reset</ButtonSubmit>
    </div>
  </form>
</template>
```

#### 2. Integrasi dengan Inertia `useForm` & Error Laravel 422
```javascript
import { useForm } from '@inertiajs/vue3';
import { useFormValidation } from '@/Composables/Pack/useFormValidation';

const form = useForm({
  account_number: '',
  bank_code: '',
});

const rules = {
  account_number: { required: true, numeric: true, minLength: 10, label: 'Nomor Rekening' },
  bank_code: { required: true, label: 'Bank Penerima' },
};

const { errors, validate, setErrors } = useFormValidation(form, rules);

const submitDisbursement = () => {
  if (!validate()) return;

  form.post('/disbursements', {
    onError: (backendErrors) => {
      // Sinkronkan response error 422 Laravel langsung ke composable
      setErrors(backendErrors);
    },
  });
};
```

---

## 12. ⚠️ Ringkasan Perubahan Pemakaian (Release & Upgrade Notes)

Berikut adalah panduan bagi pengembang mengenai fitur-fitur baru dan pembaruan pada Form Input Pack UI:

| Komponen / Modul | Fitur Baru | Dampak Pemakaian | Cara Memakai |
| :--- | :--- | :--- | :--- |
| **`InputField.vue`** | Dukungan `type="otp"` dan `type="mask"` | **Tidak Breaking** | Tambahkan prop `type="otp"` untuk input PIN atau `type="mask"` untuk nomor kartu/NPWP |
| **`InputTextarea.vue`** | Auto-Resize dinamis | **Tidak Breaking** | Berikan prop `auto-resize`, `:min-rows="2"`, `:max-rows="8"`. Tinggi textarea akan menyesuaikan otomatis |
| **`InputCheckbox.vue`** | Indeterminate state & Group Mode | **Tidak Breaking** | Gunakan `:indeterminate="true"` untuk checkbox parsial. Gunakan `:options="[...]"` untuk checkbox grup |
| **`InputSelect.vue`** | Option Grouping, Chips Display & Clearable | **Tidak Breaking** | Sertakan properti `group` pada array opsi untuk divider grup. Multi-select kini default menggunakan visual chips (`chip-display`) |
| **`InputOtp.vue`** | Komponen baru | **Komponen Baru** | `<InputField v-model="pin" type="otp" :length="6" separator="-" :countdown="60" @complete="..." />` |
| **`InputMask.vue`** | Komponen baru | **Komponen Baru** | `<InputField v-model="card" type="mask" preset="credit-card" />` (v-model otomatis mengikat raw digits murni) |
| **`useFormValidation.js`** | Composable baru | **Composable Baru** | `const { errors, validate, touch } = useFormValidation(form, rules)` untuk validasi form level lengkap |

