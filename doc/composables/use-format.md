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
