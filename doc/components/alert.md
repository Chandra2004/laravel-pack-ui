# 🔔 Alert Component (`Alert.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md) | [Lihat Panduan Setup](../setup.md)

---

## 1. Alert Component (`Alert.vue`)

Komponen banner notifikasi **inline** yang menggunakan utilitas **Tailwind CSS** dan ikon **Google Material Symbols**. Komponen ini menempel di dalam alur halaman / form / card untuk menampilkan informasi status, peringatan statis, atau pengumuman penting secara responsif, proporsional, dan mendukung penuh mode gelap (*dark mode*).

### Lokasi File

* **Component**: `Alert.vue`

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