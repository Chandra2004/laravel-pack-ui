# 🇮🇩 Composable `useFormat` (Formatting Standar Indonesia & Finansial)

[← Kembali ke Dokumentasi Utama](../../README.md)

`useFormat` adalah koleksi helper dan composable pemformat data terstandarisasi untuk ekosistem aplikasi di Indonesia. Mencakup konversi mata uang Rupiah (`IDR`), tanggal dan waktu berbahasa Indonesia, waktu relatif manusiawi, nomor telepon seluler (+62), ukuran berkas (*file size*), serta penyensoran (*masking*) data sensitif transaksi perbankan.

Dapat digunakan baik sebagai hook composable `useFormat()` di template Vue maupun di-import sebagai fungsi mandiri (*pure functions*).

---

## 🚀 Import & Penggunaan

### 1. Di dalam Komponen Vue via Composable Hook
```vue
<script setup>
import { useFormat } from '@/Composables/Pack/useFormat';

const {
    formatRupiah,
    formatDate,
    formatRelativeTime,
    formatPhone,
    formatBytes,
    maskSensitive,
    formatPercent,
} = useFormat();
</script>

<template>
  <div>
    <p>Nominal: {{ formatRupiah(1500000) }}</p>
    <!-- Hasil: Rp 1.500.000 -->

    <p>Waktu: {{ formatDate('2026-09-13T14:30:00Z', 'DD MMMM YYYY HH:mm') }}</p>
    <!-- Hasil: 13 September 2026 21:30 -->
  </div>
</template>
```

### 2. Import Langsung Sebagai Utilitas Mandiri (Script / Service)
```javascript
import { formatRupiah, formatDate, maskSensitive } from '@/Composables/Pack/useFormat';

const maskedCard = maskSensitive('4000123456789010', 'card');
// Output: '**** **** **** 9010'
```

---

## 📋 Daftar API & Method

| Fungsi | Parameter | Default | Contoh Output |
| :--- | :--- | :--- | :--- |
| `formatRupiah()` | `(amount, withPrefix = true, decimalPlaces = 0)` | `withPrefix: true` | `formatRupiah(2450000)` $\to$ **`Rp 2.450.000`** |
| `formatNumber()` | `(value, decimalPlaces = 0)` | `decimalPlaces: 0` | `formatNumber(1250000)` $\to$ **`1.250.000`** |
| `formatDate()` | `(dateInput, pattern = 'DD MMMM YYYY HH:mm')` | `'DD MMMM YYYY HH:mm'` | `formatDate(new Date())` $\to$ **`13 September 2026 14:30`** |
| `formatRelativeTime()` | `(dateInput)` | — | `formatRelativeTime(time)` $\to$ **`5 menit yang lalu`** / **`baru saja`** |
| `formatPhone()` | `(number, formatType = 'international')` | `'international'` | `formatPhone('081234567890')` $\to$ **`+62 812-3456-7890`** |
| `formatBytes()` | `(bytes, decimals = 2)` | `decimals: 2` | `formatBytes(14942208)` $\to$ **`14.25 MB`** |
| `maskSensitive()` | `(text, type = 'card')` | `'card'` | `maskSensitive('user@domain.com', 'email')` $\to$ **`u****r@domain.com`** |
| `formatPercent()` | `(value, decimals = 2, isFraction = false)` | `isFraction: false` | `formatPercent(12.5)` $\to$ **`12.50%`** |
| `formatInitials()` | `(name, length = 2, options = {})` | `length: 2` | `formatInitials('Chandra Tri Antomo')` $\to$ **`CA`** / **`CTA`** |
| `formatAvatarColor()` | `(seed, options = {})` | `{}` | `formatAvatarColor('Chandra')` $\to$ **`{ hex, bgClass, ... }`** |
| `slugify()` | `(text, separator = '-')` | `'-'` | `slugify('Judul Berita & Promo!')` $\to$ **`judul-berita-promo`** |
| `truncate()` | `(text, length = 100, options = {})` | `length: 100` | `truncate(text, 50, { wordBoundary: true })` $\to$ **`Teks rapi...`** |
| `formatCompactNumber()` | `(number, options = {})` | `decimals: 1` | `formatCompactNumber(2500000)` $\to$ **`2,5 jt`** / **`2.5M`** |
| `formatDuration()` | `(seconds, options = {})` | `format: 'digital'` | `formatDuration(3725)` $\to$ **`01:02:05`** / **`1 jam 2 menit`** |
| `titleCase()` | `(text)` | — | `titleCase('laporan transaksi harian')` $\to$ **`Laporan Transaksi Harian`** |
| `camelCase()` | `(text)` | — | `camelCase('user-profile-id')` $\to$ **`userProfileId`** |
| `snakeCase()` | `(text)` | — | `snakeCase('userProfileId')` $\to$ **`user_profile_id`** |
| `kebabCase()` | `(text)` | — | `kebabCase('userProfileId')` $\to$ **`user-profile-id`** |
| `stripHtml()` | `(html)` | — | `stripHtml('<p>Halo <b>Dunia</b></p>')` $\to$ **`Halo Dunia`** |
| `formatOrdinal()` | `(number, locale = 'id')` | `'id'` | `formatOrdinal(3)` $\to$ **`ke-3`** (ID) / **`3rd`** (EN) |

---

## 💡 Detail Fitur & Spesifikasi

### 1. Pemformatan Mata Uang Rupiah (`formatRupiah`)
Mendukung nilai angka, string numerik, serta kontrol awalan dan desimal:
```javascript
formatRupiah(2450000);                      // "Rp 2.450.000"
formatRupiah(2450000, false);               // "2.450.000"
formatRupiah(2450000.5, true, 2);           // "Rp 2.450.000,50"
formatRupiah(null);                         // "Rp 0"
```

### 2. Tanggal & Waktu Bahasa Indonesia (`formatDate`)
Mendukung ragam pola (*pattern token*):
* `YYYY` (Tahun 4 digit), `YY` (Tahun 2 digit)
* `MMMM` (Nama bulan: Januari..Desember), `MMM` (Nama bulan singkat: Jan..Des), `MM` (01..12), `M` (1..12)
* `DDDD` (Nama hari: Minggu..Sabtu), `DDD` (Nama hari singkat: Min..Sab), `DD` (01..31), `D` (1..31)
* `HH` (Jam 24 format 00..23), `H` (0..23), `mm` (Menit 00..59), `ss` (Detik 00..59)

```javascript
formatDate('2026-09-13T07:30:00Z', 'DDDD, DD MMMM YYYY');
// "Minggu, 13 September 2026"

formatDate(Date.now(), 'DD/MM/YYYY HH:mm');
// "13/09/2026 14:30"
```

### 3. Waktu Relatif Dinamis (`formatRelativeTime`)
Sangat ideal untuk feed aktivitas, audit log, atau notifikasi transaksi:
```javascript
formatRelativeTime(Date.now() - 5000);          // "baru saja"
formatRelativeTime(Date.now() - 1000 * 60 * 12); // "12 menit yang lalu"
formatRelativeTime(Date.now() - 1000 * 3600 * 3); // "3 jam yang lalu"
formatRelativeTime(Date.now() - 1000 * 86400 * 2); // "2 hari yang lalu"
formatRelativeTime(Date.now() + 1000 * 60 * 30); // "30 menit lagi"
```

### 4. Normalisasi Nomor Telepon Indonesia (`formatPhone`)
Mendeteksi format awalan lokal `08...`, kode negara `628...`, atau `+628...`:
```javascript
formatPhone('081234567890');                // "+62 812-3456-7890" (international)
formatPhone('6281234567890', 'national');    // "0812-3456-7890"
formatPhone('081234567890', 'e164');        // "+6281234567890"
```

### 5. Sensor Data Sensitif (`maskSensitive`)
Melindungi privasi data pengguna dan kepatuhan PCI-DSS:
```javascript
// Kartu Kredit / Debit (Menyisakan 4 digit terakhir)
maskSensitive('4000123456789010', 'card');  // "**** **** **** 9010"

// Alamat Email (Karakter pertama & terakhir username)
maskSensitive('budi.santoso@gmail.com', 'email'); // "b****o@gmail.com"

// Nomor HP (4 digit awal & 4 digit akhir)
maskSensitive('081234567890', 'phone');     // "0812 **** 7890"

// NIK / KTP (4 digit awal & 4 digit akhir)
maskSensitive('3201012345670001', 'nik');   // "3201 ******** 0001"
```

### 6. Pembuatan Inisial Nama Pintar (`formatInitials`)
Mengekstrak inisial nama secara cerdas dari nama lengkap, email, atau teks perusahaan:
```javascript
// Default: first_last strategy (2 karakter)
formatInitials('Chandra Tri Antomo');        // "CA"
formatInitials('Chandra Tri Antomo', 3);     // "CTA"
formatInitials('Budi');                      // "BU" (fallback 2 huruf pertama jika 1 kata)

// Otomatis mengenali & memotong alamat email
formatInitials('dewi.lestari@speedpay.id');  // "DL"

// Pembersihan gelar profesional & kehormatan
formatInitials('Dr. Sarah Smith, Sp.A');     // "SS"
formatInitials('PT Maju Bersama');           // "MB"

// Pilihan strategi:
// 'first_last' (default): huruf pertama dari kata awal & kata akhir
// 'first_consecutive': kata-kata berurutan dari depan
// 'first_only': hanya 1 huruf kata pertama
formatInitials('Chandra Tri Antomo', 2, { strategy: 'first_consecutive' }); // "CT"
```

### 7. Warna Avatar Deterministik (`formatAvatarColor`)
Menghasilkan warna solid, gradien Tailwind, dan warna teks kontras yang selalu konsisten untuk satu nama/ID menggunakan algoritma DJB2 hash:
```javascript
const color = formatAvatarColor('Chandra Tri Antomo');
// {
//   hex: '#0284c7',
//   bgClass: 'bg-sky-600',
//   gradientClass: 'bg-gradient-to-tr from-sky-600 to-indigo-600',
//   textColor: '#ffffff',
//   ringClass: 'ring-sky-200 dark:ring-sky-900',
//   name: 'sky'
// }
```

### 8. Pembuat Slug URL SEO (`slugify`)
Mengubah teks sembarang menjadi slug URL ramah SEO, membersihkan simbol khusus dan karakter aksen:
```javascript
slugify('Panduan Integrasi Payment Gateway & Webhook v1.7!');
// "panduan-integrasi-payment-gateway-webhook-v17"

slugify('Kategori Produk Elektronik', '_');
// "kategori_produk_elektronik"
```

### 9. Pemotongan Teks Pintar (`truncate`)
Memotong teks panjang dengan opsi mempertahankan batas kata (*word boundary*) agar kata tidak terpotong di tengah:
```javascript
const text = 'Laravel Pack UI menyediakan kumpulan komponen enterprise Vue 3 Tailwind.';

// Default
truncate(text, 25);
// "Laravel Pack UI menyediak..."

// Word boundary aktif (memotong di spasi terdekat)
truncate(text, 25, { wordBoundary: true });
// "Laravel Pack UI..."

// Kustom suffix
truncate(text, 20, { suffix: ' [Baca Selengkapnya]' });
```

### 10. Format Angka Ringkas (`formatCompactNumber`)
Mengonversi angka besar ke format singkatan yang ramah dashboard (`K`, `M`, `B` untuk EN; `rb`, `jt`, `M` untuk ID):
```javascript
formatCompactNumber(2500000);              // "2,5 jt" (locale 'id')
formatCompactNumber(1250000000);           // "1,25 Miliar"
formatCompactNumber(2500000, { locale: 'en' }); // "2.5M"
formatCompactNumber(15400, { decimals: 0 });    // "15 rb"
```

### 11. Format Durasi Waktu (`formatDuration`)
Mengubah durasi detik menjadi tampilan digital jam menit detik atau teks manusiawi:
```javascript
// Digital (hh:mm:ss atau mm:ss)
formatDuration(3725);                         // "01:02:05"
formatDuration(125);                          // "02:05"

// Human (Bahasa Indonesia / Inggris)
formatDuration(3725, { format: 'human' });    // "1 jam 2 menit"
formatDuration(3725, { format: 'human', locale: 'en' }); // "1 hr 2 mins"

// Short (Format ringkas)
formatDuration(3725, { format: 'short' });    // "1j 2m"
```

### 12. Utilitas Teks & Case Converters
Transformasi format penamaan string dan sanitasi HTML:
```javascript
titleCase('laporan transaksi harian');        // "Laporan Transaksi Harian"
camelCase('user_profile_id');                 // "userProfileId"
snakeCase('userProfileId');                   // "user_profile_id"
kebabCase('userProfileId');                   // "user-profile-id"
stripHtml('<p>Teks <strong>tebal</strong></p>'); // "Teks tebal"
formatOrdinal(1);                             // "ke-1" (ID)
formatOrdinal(3, 'en');                       // "3rd" (EN)
```

