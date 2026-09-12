# 📝 Komponen InputField (`InputField.vue`) & Sub-Komponen (`Input/`)

[← Kembali ke Dokumentasi Utama](../../README.md) | [Validasi Form](../composables/use-form-validation.md)

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

Untuk menjaga agar komponen `InputField.vue` tetap bersih, modular, dan mudah dirawat, arsitektur form control Pack menggunakan pola **Facade Pattern**. Komponen induk `InputField.vue` bertindak sebagai *orchestrator / facade* (menangani label, *required asterisk*, *character counter limit*, slot header/hint/error, dan forwarding `ref="controlRef"`), sementara logika render dan penanganan interaksi spesifik didelegasikan ke **10 sub-komponen** yang berada di dalam folder `resources/js/Components/Pack/Input/`.
Untuk menjaga agar komponen `InputField.vue` tetap bersih, modular, dan mudah dirawat, arsitektur form control Pack menggunakan pola **Facade Pattern**. Komponen induk `InputField.vue` bertindak sebagai *orchestrator / facade* (menangani label, *required asterisk*, *character counter limit*, slot header/hint/error, dan forwarding `ref="controlRef"`), sementara logika render dan penanganan interaksi spesifik didelegasikan ke **12 sub-komponen** yang berada di dalam folder `resources/js/Components/Pack/Input/`.

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
* **Lokasi File**: `InputText.vue`
* **Tipe yang Ditangani**: `'text'`, `'email'`, `'password'`, `'number'`, `'tel'`, `'url'`, `'search'`, `'currency'`.
* **Fitur Unggulan**:
  * **Password Toggle & Strength Meter**: Menghitung skor kekuatan sandi (1-4) berdasarkan panjang karakter, kombinasi huruf besar/kecil, angka, dan simbol khusus dengan visual progress bar.
  * **Live Validation**: Validasi format email secara langsung dan format nomor telepon Indonesia (`08xx-xxxx-xxxx`).
  * **Currency Auto-Formatting**: Otomatis memformat tampilan nominal rupiah (`id-ID`) sementara `v-model` tetap menyimpan nilai numerik bersih (`Number` atau `null`).
  * **Search Suggestions Popover**: Menggunakan `useClickOutside` untuk menutup panel saran pencarian otomatis saat pengguna mengklik di luar kontainer.
  * **Expose API**: Menyediakan method `focus()`, `blur()`, dan `inputRef` ke elemen native `<input>`.

#### 9.2 `InputFile.vue`
* **Lokasi File**: `InputFile.vue`
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
* **Lokasi File**: `InputDatePicker.vue`
* **Tipe yang Ditangani**: `'date'`, `'time'`, `'datetime-local'`.
* **Fitur Unggulan**:
  * **Desain Popover ala PrimeVue**: Floating overlay kalender interaktif tanpa mengandalkan datepicker native browser yang inkonsisten antar OS.
  * **Integrasi `useClickOutside`**: Otomatis menutup panel kalender saat pengguna mengklik di luar area input.
  * **Time Spinner Selector**: Pengatur jam dan menit presisi dengan tombol increment/decrement dan format 24 jam.
  * **Tombol Cepat**: Tombol *Hari Ini* dan *Hapus (Clear)* bawaan.

#### 9.4 `InputSelect.vue`
* **Lokasi File**: `InputSelect.vue`
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
* **Lokasi File**: `InputColor.vue`
* **Tipe yang Ditangani**: `'color'`.
* **Fitur Unggulan**:
  * **Palet Warna Cepat**: Grid preset palet warna modern yang siap dipilih dalam 1 klik.
  * **Hex Manual Input & Copy**: Input teks nilai hexadecimal langsung dengan tombol salin instan.
  * **Screen Eyedropper API**: Menggunakan `window.EyeDropper` native browser untuk mengambil warna dari layar mana saja bila didukung.

#### 9.6 `InputRadio.vue`
* **Lokasi File**: `InputRadio.vue`
* **Tipe yang Ditangani**: `'radio'`.
* **Fitur Unggulan**:
  * Menerima array opsi string sederhana maupun objek kaya `{ value, label, subtext, disabled }`.
  * Status visual aktif/fokus yang jelas dengan border kontras dan ring glow.

#### 9.7 `InputCheckbox.vue`
* **Lokasi File**: `InputCheckbox.vue`
* **Tipe yang Ditangani**: `'checkbox'`.
* **Fitur Unggulan**:
  * Checkbox kustom dengan ikon centang Google Icons.
  * Mendukung label, subteks penjelasan tambahan, serta slot default untuk link syarat & ketentuan interaktif.
  * **Indeterminate State**: Mendukung status parsial (`indeterminate: true`) yang menampilkan ikon minus (`remove`), sangat berguna untuk checkbox *"Select All"* pada tabel data.
  * **Group Options Mode**: Mendukung prop `options` untuk merender daftar pilihan banyak sekaligus dengan binding array ke `v-model`.
  * **Array Value Binding**: Mendukung prop `value` untuk menambahkan/menghapus item ke dalam array `modelValue`.
  * **Aksesibilitas**: Dilengkapi atribut `aria-checked="mixed"` saat kondisi indeterminate aktif.

#### 9.8 `InputTextarea.vue`
* **Lokasi File**: `InputTextarea.vue`
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
* **Lokasi File**: `InputRange.vue`
* **Tipe yang Ditangani**: `'range'`.
* **Fitur Unggulan**:
  * Slider rentang nilai responsif dengan badge visual indikator angka saat digeser.
  * Mendukung fungsi `rangeFormatter` kustom (contoh: `(v) => \`\${v}%\`` atau `(v) => \`Rp \${v.toLocaleString()}\``).

#### 9.10 `InputSwitch.vue`
* **Lokasi File**: `InputSwitch.vue`
* **Tipe yang Ditangani**: `'switch'`.
* **Fitur Unggulan**:
  * Toggle pill modern dengan transisi geser halus.
  * Aksesibilitas bawaan dengan `role="switch"` dan `aria-checked`.

#### 9.11 `InputOtp.vue` *(Komponen Baru)*
* **Lokasi File**: `InputOtp.vue`
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
* **Lokasi File**: `InputMask.vue`
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