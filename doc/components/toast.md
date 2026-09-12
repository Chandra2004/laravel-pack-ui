# 💬 ToastNotification Component (`ToastNotification.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md) | [Composable useNotification](../composables/use-notification.md)

---

## 2. ToastNotification Component & Composable

Sistem notifikasi toast melayang (*floating toast system*) yang menggunakan utilitas **Tailwind CSS** dan ikon **Google Material Symbols**. Komponen ini dirancang agar dapat digunakan kembali (*reusable*) dan mudah dirawat (*maintainable*) di berbagai project Vue 3 / InertiaJS.

### Lokasi File

* **Component**: `ToastNotification.vue`
* **Composable**: `useNotification.js`

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