# 🛡️ Composable `useConfirm` & Komponen `ConfirmDialog`

[← Kembali ke Dokumentasi Utama](../../README.md)

`useConfirm` adalah composable dialog konfirmasi destruktif/penting berbasis asynchronous **`Promise<boolean>`**. Memungkinkan developer memanggil konfirmasi tindakan semudah fungsi `window.confirm()` bawaan JavaScript, namun dengan antarmuka modal modern, responsif, beranimasi halus, dan terintegrasi penuh dengan sistem tema Tailwind CSS v4.

---

## 🚀 Pemasangan Cepat

### Langkah 1: Pasang Komponen Global `<ConfirmDialog />`
Cukup letakkan komponen `<ConfirmDialog />` satu kali di layout utama aplikasi Anda (misal `AppLayout.vue`):

```vue
<script setup>
import ConfirmDialog from '@/Components/Pack/ConfirmDialog.vue';
</script>

<template>
  <div>
    <!-- Slot Konten Halaman Aplikasi -->
    <slot />

    <!-- Dialog Konfirmasi Global (Teleported to body) -->
    <ConfirmDialog />
  </div>
</template>
```

---

### Langkah 2: Panggil dari Mana Saja di Komponen Anda

```vue
<script setup>
import { router } from '@inertiajs/vue3';
import { useConfirm } from '@/Composables/Pack/useConfirm';
import { useNotification } from '@/Composables/Pack/useNotification';

const confirm = useConfirm();
const notify = useNotification();

const handleDelete = async (productId) => {
    // Membuka dialog dan menunggu respon user secara async
    const isConfirmed = await confirm.confirm({
        title: 'Hapus Produk Permanen?',
        message: 'Produk yang dihapus tidak dapat dipulihkan kembali dari sistem.',
        variant: 'danger',
        confirmText: 'Ya, Hapus Sekarang',
        cancelText: 'Batalkan',
        context: 'Tindakan Destruktif',
    });

    if (isConfirmed) {
        router.delete(route('products.destroy', productId), {
            onSuccess: () => notify.success('Produk berhasil dihapus!'),
        });
    }
};
</script>
```

---

## 📋 Parameter Opsi (`confirm(options)`)

Dapat dipanggil dengan format teks sederhana `confirm('Yakin ingin melanjutkan?')` atau objek opsi:

| Properti | Tipe Data | Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `title` | `String` | `'Konfirmasi Tindakan'` | Judul tebal dialog konfirmasi |
| `message` | `String` | `'Apakah Anda yakin...?'` | Deskripsi detail atau konsekuensi tindakan |
| `variant` | `String` | `'danger'` | Skema warna visual: `'danger'` (merah), `'warning'` (amber), `'info'` (sky), `'primary'` (biru), `'success'` (emerald) |
| `confirmText` | `String` | `'Ya, Lanjutkan'` | Label tombol tindakan konfirmasi |
| `cancelText` | `String` | `'Batal'` | Label tombol batalkan |
| `context` | `String` | `''` | Teks badge konteks kecil di atas judul (misal `'Keamanan Akun'`) |
| `icon` | `String` | `''` | Ikon Google Material Symbols kustom (jika kosong, menggunakan ikon default varian) |
| `closable` | `Boolean` | `true` | Mengizinkan penutupan via tombol 'X' atau klik backdrop |

---

## 🛠️ Daftar Method API

| Method | Parameter | Return | Keterangan |
| :--- | :--- | :--- | :--- |
| `confirm(options)` | `Object \| string` | `Promise<boolean>` | Membuka modal dan mereturn Promise bernilai `true` (jika user klik Konfirmasi) atau `false` (jika Batal/Tutup). |
| `setLoading(boolean)` | `boolean` | `void` | Menampilkan animasi spinner putar pada tombol konfirmasi saat proses async berlangsung sebelum dialog ditutup. |
| `close()` | `()` | `void` | Menutup dialog secara paksa dan me-resolve `false`. |

---

## 🎨 Variasi Gaya Dialog

### 1. Varian `danger` (Hapus Data / Void Transaksi)
```javascript
const ok = await confirm.confirm({
    title: 'Void Transaksi Ini?',
    message: 'Transaksi sebesar Rp 1.500.000 akan dibatalkan secara permanen ke bank.',
    variant: 'danger',
    confirmText: 'Batalkan Transaksi',
});
```

### 2. Varian `warning` (Peringatan Penting)
```javascript
const ok = await confirm.confirm({
    title: 'Generate Ulang Secret API Key?',
    message: 'Kunci API sebelumnya akan segera tidak berlaku dalam 5 menit.',
    variant: 'warning',
    confirmText: 'Generate Kunci Baru',
});
```

### 3. Varian `info` (Konfirmasi Informasi)
```javascript
const ok = await confirm.confirm({
    title: 'Kirim Ulang Email Aktivasi?',
    message: 'Tautan aktivasi baru akan dikirimkan ke alamat merchant@domain.com.',
    variant: 'info',
    confirmText: 'Kirim Email',
});
```
