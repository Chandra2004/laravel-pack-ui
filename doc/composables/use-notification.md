# 💬 Composable `useNotification`

[← Kembali ke Dokumentasi Utama](../../README.md) | [Lihat Komponen ToastNotification](../components/toast.md)

`useNotification` adalah composable state global reaktif untuk mengelola dan memicu sistem notifikasi toast (*floating notifications*) dari mana saja di dalam aplikasi Vue 3 atau InertiaJS tanpa perlu melakukan prop drilling atau event bus manual.

---

## 🚀 Import & Inisialisasi

```javascript
import { useNotification } from '@/Composables/Pack/useNotification';

const notify = useNotification();
```

---

## 📋 Daftar API & Method

| Method | Parameter | Return | Deskripsi |
| :--- | :--- | :--- | :--- |
| `notify.success()` | `(message: string, options?: Object)` | `string` (id) | Menampilkan toast sukses hijau dengan ikon centang |
| `notify.error()` | `(message: string, options?: Object)` | `string` (id) | Menampilkan toast galat merah dengan ikon peringatan |
| `notify.warning()` | `(message: string, options?: Object)` | `string` (id) | Menampilkan toast peringatan amber dengan ikon warning |
| `notify.info()` | `(message: string, options?: Object)` | `string` (id) | Menampilkan toast informasi biru |
| `notify.neutral()` | `(message: string, options?: Object)` | `string` (id) | Menampilkan toast slate netral |
| `notify.promise()` | `(promiseOrFn, messages, options?)` | `Promise<any>` | Otomatis menampilkan status loading $\to$ sukses / galat |
| `notify.add()` | `(options: Object \| string)` | `string` (id) | Menambahkan notifikasi kustom tingkat lanjut |
| `notify.update()` | `(id: string, options: Object)` | `Object \| null` | Memperbarui properti toast aktif secara reaktif |
| `notify.remove()` | `(id: string)` | `void` | Menutup satu toast berdasarkan ID uniknya |
| `notify.clear()` | `(position?: string \| null)` | `void` | Menghapus semua toast (atau spesifik posisi tertentu) |
| `notify.setDefaultDuration()` | `(ms: number)` | `void` | Mengubah durasi timer default global |

---

## ⚙️ Parameter Opsi Notifikasi (`options`)

Objek opsi yang dapat dikirimkan ke `notify.add()` atau method pintas:

| Field | Tipe | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `message` | `String` | `''` | Pesan utama notifikasi (**Wajib**) |
| `title` | `String` | `''` | Judul tebal di atas pesan notifikasi (Opsional) |
| `type` | `String` | `'info'` | Jenis: `'success'`, `'error'`, `'warning'`, `'info'`, `'neutral'` |
| `variant` | `String` | `'default'` | Desain kartu: `'default'`, `'soft'`, `'solid'`, `'outline'` |
| `duration` | `Number` | `4000` | Durasi tampil dalam milidetik (`0` = permanen tanpa auto-close) |
| `position` | `String` | `'top-right'` | Sudut layar: `'top-right'`, `'top-left'`, `'top-center'`, `'bottom-right'`, `'bottom-left'`, `'bottom-center'` |
| `icon` | `String` | `null` | Ikon kustom dari Google Material Symbols (misal `'verified'`, `'send'`) |
| `isSpinning` | `Boolean` | `false` | Menambahkan animasi putar berkesinambungan pada ikon |
| `dedupe` | `Boolean` | `false` | Jika `true`, pesan & tipe identik tidak akan bertumpuk melainkan mereset durasi |
| `dismissible` | `Boolean` | `true` | Menampilkan tombol silang `(X)` penutup |
| `action` | `Object` | `null` | Tombol tindakan: `{ label, icon, autoDismiss, onClick }` |
| `customStyle` | `Object` | `null` | Kustomisasi warna CSS: `{ bg, color, border }` |

---

## 💡 Contoh Penggunaan

### 1. Pemanggilan Notifikasi Cepat
```javascript
// Notifikasi sederhana
notify.success('Data profil pengguna berhasil disimpan!');

// Notifikasi dengan judul & durasi kustom (6 detik)
notify.error('Gagal menghubungi server pembayaran.', {
    title: 'Koneksi Terputus',
    duration: 6000,
});

// Varian Solid dengan sudut bawah
notify.warning('Masa berlangganan Anda akan berakhir dalam 3 hari.', {
    variant: 'solid',
    position: 'bottom-right',
});
```

### 2. Notifikasi dengan Tombol Aksi (Action Callback)
```javascript
notify.success('Item berhasil dipindahkan ke tempat sampah.', {
    title: 'Dihapus',
    duration: 8000,
    action: {
        label: 'Urungkan',
        icon: 'undo',
        autoDismiss: true,
        onClick: (toast) => {
            restoreDeletedItem();
            notify.info('Penghapusan telah dibatalkan.');
        },
    },
});
```

### 3. Menangani Operasi Asinkron (`notify.promise`)
Sangat cocok untuk request API (Axios, Fetch, Inertia Form):
```javascript
import axios from 'axios';

const handleSyncData = async () => {
    await notify.promise(
        axios.post('/api/sync-catalog'),
        {
            loading: 'Sedang menyinkronkan 1.200 produk...',
            success: (response) => `Sinkronisasi selesai! ${response.data.synced} produk diperbarui.`,
            error: (error) => error.response?.data?.message || 'Gagal menyinkronkan katalog.',
        },
        {
            position: 'top-right',
        }
    );
};
```

### 4. Menghapus & Mengontrol Toast
```javascript
// Menghapus semua notifikasi di layar
notify.clear();

// Menghapus hanya notifikasi di sudut kiri bawah
notify.clear('bottom-left');

// Membuat toast permanen dan menutupnya secara manual lewat ID
const id = notify.info('Mengunggah dokumen berukuran besar...', { duration: 0 });
setTimeout(() => {
    notify.remove(id);
    notify.success('Unggahan selesai!');
}, 5000);
```
