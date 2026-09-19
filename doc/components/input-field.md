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

| Kategori                      | Nilai`type`        | Deskripsi & Fitur Khusus                                                                                                    |
| :---------------------------- | :------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| **Kredensial & Teks**   | `'text'`           | Input teks umum dengan addon prefix/suffix dan ikon                                                                         |
|                               | `'email'`          | Input alamat email dengan validasi format bawaan browser                                                                    |
|                               | `'password'`       | Input kata sandi dengan tombol toggle show/hide password (Google Icons)                                                     |
|                               | `'search'`         | Input pencarian dengan tombol hapus/clear instan                                                                            |
|                               | `'number'`         | Input angka dengan dukungan min, max, step, dan prefix mata uang (`"Rp"`)                                                 |
|                               | `'tel'`            | Input nomor telepon / WhatsApp                                                                                              |
|                               | `'url'`            | Input tautan web dengan prefix link                                                                                         |
| **Tanggal & Waktu**     | `'date'`           | Pemilih tanggal kalender kustom ala PrimeVue (navigasi bulan/tahun, badge tanggal aktif, tombol hari ini & hapus)           |
|                               | `'time'`           | Pemilih jam & menit popover kustom dengan kontrol spinner                                                                   |
|                               | `'datetime-local'` | Pemilih tanggal dan waktu terintegrasi dalam satu panel popover kustom                                                      |
|                               | `'month'`          | Pemilih bulan & tahun                                                                                                       |
|                               | `'week'`           | Pemilih minggu & tahun                                                                                                      |
| **Pilihan & Multiline** | `'select'`         | Custom floating dropdown popover ala PrimeVue dengan filter pencarian, checkmark terpilih, dan keyboard navigation          |
|                               | `'textarea'`       | Input teks multiline dengan`rows` dan live character counter limit                                                        |
|                               | `'checkbox'`       | Kotak centang dengan label dan subteks penjelasan                                                                           |
|                               | `'radio'`          | Pilihan radio group dengan array`options`                                                                                 |
|                               | `'switch'`         | Toggle sakelar switch on/off modern                                                                                         |
| **Media & Spesial**     | `'file'`           | Box upload drag-and-drop dengan live thumbnail preview                                                                      |
|                               | `'color'`          | Floating color picker popover dengan palet warna cepat, eyedropper layar, dan salin HEX                                     |
|                               | `'range'`          | Slider rentang nilai dengan indikator badge angka dinamis                                                                   |
|                               | `'otp'`            | Input One-Time Password / PIN dengan slot digit terpisah, auto-focus, paste parsing, masking, dan countdown timer           |
|                               | `'mask'`           | Input berformat pola kustom/preset (kartu kredit, NPWP, NIK, kode pos) dengan pemformatan otomatis dan pengikatan raw value |

---

---

### Component Props API (`<InputField />`)

Berikut adalah daftar lengkap properti (*props*) yang didukung oleh `<InputField />`, dikelompokkan berdasarkan fungsinya:

#### 1. Properti Umum & Tipografi Form

| Prop                         | Tipe Data                                          | Default    | Deskripsi                                                                                                                                                                                                                                                                                                                                                          |
| :--------------------------- | :------------------------------------------------- | :--------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue` / `v-model` | `[String, Number, Boolean, File, Array, Object]` | `''`     | State binding reaktif nilai input.                                                                                                                                                                                                                                                                                                                                 |
| `type`                     | `String`                                         | `'text'` | Tipe kontrol input (mendukung 20+ varian:`text`, `email`, `password`, `number`, `tel`, `url`, `search`, `date`, `time`, `datetime-local`, `month`, `week`, `currency`, `textarea`, `select`, `checkbox`, `radio`, `switch`, `file`, `color`, `range`, `otp`, `mask`, `location`, `tag`, `tags`, `repeater`). |
| `label`                    | `String`                                         | `''`     | Teks judul label di atas input.                                                                                                                                                                                                                                                                                                                                    |
| `subtext`                  | `String`                                         | `''`     | Teks penjelasan sekunder di samping label, switch, atau checkbox.                                                                                                                                                                                                                                                                                                  |
| `name`                     | `String`                                         | `''`     | Atribut nama input HTML untuk form submission.                                                                                                                                                                                                                                                                                                                     |
| `id`                       | `String`                                         | `''`     | Atribut ID elemen input (otomatis dibuat secara unik dan SSR-safe dengan`useId()` Vue 3.5 jika dikosongkan).                                                                                                                                                                                                                                                     |
| `placeholder`              | `String`                                         | `''`     | Teks petunjuk abu-abu saat input masih kosong.                                                                                                                                                                                                                                                                                                                     |
| `required`                 | `Boolean`                                        | `false`  | Menandai field wajib diisi dan otomatis menambahkan tanda bintang (`*`) merah.                                                                                                                                                                                                                                                                                   |
| `disabled`                 | `Boolean`                                        | `false`  | Menonaktifkan interaksi input dan memberikan styling redup (*opacity 60%*).                                                                                                                                                                                                                                                                                      |
| `readonly`                 | `Boolean`                                        | `false`  | Mengunci nilai input agar tidak dapat diedit pengguna namun tetap dapat disalin dan difokuskan.                                                                                                                                                                                                                                                                    |
| `error`                    | `String`                                         | `''`     | Pesan error validasi (otomatis memberi border merah, glow ring, dan ikon peringatan di bawah input). Selaras dengan`form.errors.field` Inertia.                                                                                                                                                                                                                  |
| `hint`                     | `String`                                         | `''`     | Teks panduan atau petunjuk pengisian di bawah kontrol form (hanya muncul saat tidak ada`error`).                                                                                                                                                                                                                                                                 |
| `icon`                     | `String`                                         | `''`     | Nama Google Material Icon di sisi kiri input (contoh:`'mail'`, `'lock'`, `'person'`).                                                                                                                                                                                                                                                                        |
| `iconRight`                | `String`                                         | `''`     | Nama Google Material Icon di sisi kanan input.                                                                                                                                                                                                                                                                                                                     |
| `prefix`                   | `String`                                         | `''`     | Teks addon di sisi kiri luar (contoh:`'Rp'`, `'https://'`).                                                                                                                                                                                                                                                                                                    |
| `suffix`                   | `String`                                         | `''`     | Teks addon di sisi kanan luar (contoh:`'%'`, `'IDR'`, `'/ bulan'`).                                                                                                                                                                                                                                                                                          |
| `size`                     | `String`                                         | `'md'`   | Ukuran skala komponen:`'sm'` (kompak/tabel), `'md'` (standar form), `'lg'` (hero input).                                                                                                                                                                                                                                                                     |
| `autocomplete`             | `String`                                         | `''`     | Atribut HTML5 autocomplete (contoh:`'current-password'`, `'new-password'`, `'email'`).                                                                                                                                                                                                                                                                       |
| `clearable`                | `Boolean`                                        | `false`  | Menampilkan tombol silang (*clear*) instan saat input terisi (otomatis `true` pada `type="search"`).                                                                                                                                                                                                                                                         |
| `loading`                  | `Boolean`                                        | `false`  | Menampilkan spinner animasi memuat di sisi kanan input atau select.                                                                                                                                                                                                                                                                                                |

#### 2. Fitur Universal Watch & Validasi Kustom (Untuk Semua Input)

| Prop               | Tipe Data            | Default                                   | Deskripsi                                                                                                                                                                                                 |
| :----------------- | :------------------- | :---------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `liveValidation` | `Boolean`          | `true`                                  | Mengaktifkan evaluasi format real-time saat pengguna mengetik (email, password, tel, url, number).                                                                                                        |
| `validator`      | `Function(value)`  | `null`                                  | Fungsi validasi kustom untuk**seluruh tipe input**. Mengembalikan `true` jika valid, atau `String` pesan error jika tidak valid. Pesan error langsung tampil di bawah input (*liveFeedback*). |
| `pattern`        | `[String, RegExp]` | `null`                                  | Pola ekspresi reguler (Regex) untuk validasi langsung pada input teks.                                                                                                                                    |
| `patternMessage` | `String`           | `'Format input tidak sesuai ketentuan'` | Pesan kesalahan yang ditampilkan saat input tidak lolos pengecekan`pattern`.                                                                                                                            |
| `onWatch`        | `Function(newVal)` | `null`                                  | Callback hook pemantau yang dipicu setiap kali nilai input berubah secara reaktif (fitur*watch universal*).                                                                                             |

#### 3. Fitur Password & Kekuatan Sandi (`type="password"`)

| Prop                     | Tipe Data   | Default           | Deskripsi                                                                                                                                |
| :----------------------- | :---------- | :---------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `showPasswordToggle`   | `Boolean` | `true`          | Menampilkan tombol ikon mata (lihat/sembunyikan sandi).                                                                                  |
| `showPasswordStrength` | `Boolean` | `true`          | Menampilkan atau menyembunyikan floating box*Strength Meter* dan checklist kriteria saat input password difokuskan.                    |
| `passwordRules`        | `Object`  | *Lihat default* | Objek konfigurasi aturan kekuatan sandi. Bar indikator dan checklist otomatis beradaptasi secara dinamis hanya dengan aturan yang aktif. |

Default konfigurasi `passwordRules`:

```javascript
{
  minLength: 8,           // Batas minimal panjang karakter (misal: 6, 8, 10, 12)
  requireUppercase: true, // Wajib memiliki minimal 1 huruf kapital (A-Z)
  requireLowercase: true, // Wajib memiliki minimal 1 huruf kecil (a-z)
  requireNumbers: true,   // Wajib mengandung angka (0-9)
  requireSymbols: true,   // Wajib mengandung karakter simbol unik (!@#$%^&*)
}
```

#### 4. Angka, Finansial & Slider (`type="number"`, `'range'`, `'currency'`)

| Prop               | Tipe Data             | Default     | Deskripsi                                                                                                                  |
| :----------------- | :-------------------- | :---------- | :------------------------------------------------------------------------------------------------------------------------- |
| `currency`       | `[Boolean, String]` | `false`   | Mengaktifkan pemformatan ribuan uang lokal (`1.500.000`) dan otomatis mengikat nilai angka murni numerik ke `v-model`. |
| `min`            | `[Number, String]`  | `null`    | Nilai angka atau tanggal minimum yang diizinkan (dilengkapi validasi live).                                                |
| `max`            | `[Number, String]`  | `null`    | Nilai angka atau tanggal maksimum yang diizinkan (dilengkapi validasi live).                                               |
| `step`           | `[Number, String]`  | `null`    | Interval loncatan kelipatan nilai.                                                                                         |
| `rangeLabel`     | `String`            | `'Nilai'` | Label teks sebelum angka nilai slider pada`type="range"`.                                                                |
| `rangeFormatter` | `Function(val)`     | `null`    | Fungsi kustom pemformatan angka slider (contoh:`(v) => \`\${v}%\``atau`(v) => \`Rp \${v}\``).                          |

#### 5. Textarea Multiline (`type="textarea"`)

| Prop           | Tipe Data            | Default        | Deskripsi                                                                            |
| :------------- | :------------------- | :------------- | :----------------------------------------------------------------------------------- |
| `rows`       | `[Number, String]` | `3`          | Jumlah baris awal textarea.                                                          |
| `maxlength`  | `[Number, String]` | `null`       | Batas maksimal karakter (menampilkan indikator live counter`charCount/maxlength`). |
| `autoResize` | `Boolean`          | `false`      | Textarea otomatis membesar ke bawah mengikuti panjang teks yang diketik.             |
| `minRows`    | `[Number, String]` | `null`       | Batas minimal baris saat`autoResize: true`.                                        |
| `maxRows`    | `[Number, String]` | `null`       | Batas maksimal baris sebelum scrollbar vertikal muncul saat`autoResize: true`.     |
| `resize`     | `String`           | `'vertical'` | Pengarah resize kursor CSS:`'none'`, `'vertical'`, `'both'`, `'horizontal'`. |

#### 6. Dropdown & Pilihan (`type="select"`, `'radio'`, `'checkbox'`, `'switch'`)

| Prop              | Tipe Data                     | Default   | Deskripsi                                                                                                                                                       |
| :---------------- | :---------------------------- | :-------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`       | `Array`                     | `[]`    | Pilihan array item (berupa array string`['A', 'B']` atau objek `[{ value: 1, label: 'Satu' }]`). Juga dipakai untuk saran pencarian pada `type="search"`. |
| `multiple`      | `Boolean`                   | `false` | Mengizinkan pemilihan multi-opsi atau multi-upload berkas.                                                                                                      |
| `chipDisplay`   | `Boolean`                   | `true`  | Menampilkan item terpilih dalam bentuk badge chips dengan tombol silang individual pada multi-select.                                                           |
| `indeterminate` | `Boolean`                   | `false` | Status parsial "sebagian tercentang" (ikon minus`-`) pada checkbox parent.                                                                                    |
| `value`         | `[String, Number, Boolean]` | `null`  | Nilai spesifik untuk binding checkbox / radio grup.                                                                                                             |

#### 7. OTP / PIN Kode (`type="otp"`)

| Prop               | Tipe Data   | Default                    | Deskripsi                                                    |
| :----------------- | :---------- | :------------------------- | :----------------------------------------------------------- |
| `length`         | `Number`  | `6`                      | Jumlah kotak slot digit OTP (misal: 4 atau 6 digit).         |
| `integerOnly`    | `Boolean` | `true`                   | Hanya mengizinkan input karakter angka (0-9).                |
| `masked`         | `Boolean` | `false`                  | Menyembunyikan tampilan digit dengan bulatan sandi.          |
| `separator`      | `String`  | `''`                     | Karakter pemisah antar slot (contoh:`'-'`).                |
| `separatorAfter` | `Number`  | `null`                   | Posisi slot ke-N sebelum pemisah diletakkan.                 |
| `countdown`      | `Number`  | `0`                      | Durasi hitung mundur kirim ulang OTP (dalam detik).          |
| `resendText`     | `String`  | `'Kirim Ulang Kode OTP'` | Teks label tombol kirim ulang setelah hitung mundur selesai. |

#### 8. Pola Masking (`type="mask"`)

| Prop         | Tipe Data   | Default  | Deskripsi                                                                                                                      |
| :----------- | :---------- | :------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `mask`     | `String`  | `''`   | Pola mask kustom:`#` (angka), `A` (huruf), `*` (alfanumerik). Contoh: `####-####-####-####`.                           |
| `preset`   | `String`  | `''`   | Preset bawaan siap pakai:`'credit-card'`, `'npwp'`, `'nik'`, `'postal-code'`, `'phone-id'`, `'expiry'`, `'cvv'`. |
| `slotChar` | `String`  | `'_'`  | Karakter placeholder pada posisi slot yang belum terisi.                                                                       |
| `emitRaw`  | `Boolean` | `true` | Mengikat nilai angka/karakter murni tanpa simbol pemisah ke`v-model`.                                                        |

#### 9. Tag Input (`type="tag"` / `'tags'`)

| Prop                  | Tipe Data            | Default                   | Deskripsi                                                                                                                   |
| :-------------------- | :------------------- | :------------------------ | :-------------------------------------------------------------------------------------------------------------------------- |
| `allowCustom`       | `Boolean`          | `true`                  | Mengizinkan penambahan tag teks baru di luar array`options`.                                                              |
| `separatorKeys`     | `Array`            | `['Tab', 'Enter', ',']` | Tombol keyboard yang memicu pembentukan tag baru.                                                                           |
| `allowDuplicates`   | `Boolean`          | `false`                 | Mencegah penambahan tag yang sama dua kali.                                                                                 |
| `maxTags`           | `Number`           | `null`                  | Batas maksimum jumlah tag yang dapat dibuat.                                                                                |
| `tagVariant`        | `String`           | `'default'`             | Skema warna badge tag:`'default'`, `'primary'`, `'success'`, `'warning'`, `'danger'`, `'purple'`, `'random'`. |
| `tagStyle`          | `String`           | `'soft'`                | Gaya tampilan tag:`'soft'` (pastel), `'solid'` (kontras), `'outline'` (garis tepi).                                   |
| `tagIcon`           | `String`           | `''`                    | Ikon Google Material Symbols di sebelah kiri setiap tag.                                                                    |
| `pasteSeparators`   | `[RegExp, String]` | `/[,;\n\t]+/`           | Karakter pemisah otomatis saat pengguna menempel (*paste*) teks panjang ke input tag.                                     |
| `addOnBlur`         | `Boolean`          | `true`                  | Otomatis menjadikan teks yang belum disubmit sebagai tag baru saat elemen kehilangan fokus.                                 |
| `removeOnBackspace` | `Boolean`          | `true`                  | Menghapus tag terakhir saat pengguna menekan tombol Backspace pada input kosong.                                            |
| `lowercase`         | `Boolean`          | `false`                 | Mengonversi seluruh teks tag ke huruf kecil secara otomatis.                                                                |

#### 10. Dynamic Form Repeater (`type="repeater"` / `'form-repeater'`)

| Prop              | Tipe Data              | Default              | Deskripsi                                                                                             |
| :---------------- | :--------------------- | :------------------- | :---------------------------------------------------------------------------------------------------- |
| `fields`        | `Array`              | `[]`               | Definisi skema kolom input di setiap baris repeater.                                                  |
| `defaultItem`   | `Object`             | `null`             | Template data bawaan untuk baris entri baru.                                                          |
| `addButtonText` | `String`             | `'Tambahkan Data'` | Teks pada tombol penambahan baris.                                                                    |
| `addIcon`       | `String`             | `'add'`            | Nama ikon pada tombol penambahan.                                                                     |
| `addPosition`   | `String`             | `'bottom'`         | Posisi tombol tambah:`'bottom'`, `'top'`, `'both'`.                                             |
| `itemTitle`     | `[String, Function]` | `'Item'`           | Judul header per kartu item (mendukung fungsi dinamis`(item, index) => \`Peserta #${index + 1}\``). |
| `columns`       | `[Number, String]`   | `2`                | Jumlah kolom grid layout pada kartu repeater.                                                         |
| `collapsible`   | `Boolean`            | `false`            | Kartu item dapat diperluas atau dilipat.                                                              |
| `reorderable`   | `Boolean`            | `true`             | Mengaktifkan tombol geser urutan baris ke atas / ke bawah.                                            |
| `deletable`     | `Boolean`            | `true`             | Mengaktifkan tombol hapus baris.                                                                      |
| `duplicable`    | `Boolean`            | `true`             | Mengaktifkan tombol duplikasi instan baris yang sudah terisi.                                         |
| `confirmDelete` | `Boolean`            | `false`            | Memunculkan konfirmasi sebelum baris dihapus.                                                         |

---

### Slots API (`<InputField />`)

| Slot Name   | Parameter | Deskripsi                                                                  |
| :---------- | :-------- | :------------------------------------------------------------------------- |
| `default` | —        | Konten kustom di samping label checkbox, radio, atau fallback opsi select. |
| `label`   | —        | Kustomisasi elemen teks/komponen label judul di bagian atas.               |
| `prefix`  | —        | Kustomisasi elemen konten addon di sisi kiri.                              |
| `suffix`  | —        | Kustomisasi elemen konten addon di sisi kanan.                             |
| `hint`    | —        | Kustomisasi teks petunjuk atau link bantuan di bawah input.                |
| `error`   | —        | Kustomisasi tampilan pesan error validasi.                                 |

---

### Events API (`<InputField />`)

Komponen `<InputField />` memancarkan event-event berikut untuk integrasi yang fleksibel:

| Event Name             | Parameter                                    | Kapan Dipicu?                                                                                                                                                                             |
| :--------------------- | :------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@update:modelValue` | `(value: any)`                             | Dipicu setiap kali nilai state input berubah (sinkronisasi dua arah`v-model`).                                                                                                          |
| `@input`             | `(event: Event)`                           | Dipicu secara native setiap kali karakter baru diketik atau diinput ke elemen kontrol.                                                                                                    |
| `@change`            | `(event: Event)`                           | Dipicu saat nilai telah selesai dikomit (misal saat enter ditekan atau kontrol kehilangan fokus).                                                                                         |
| `@focus`             | `(event: FocusEvent)`                      | Dipicu saat elemen menerima fokus pengguna.                                                                                                                                               |
| `@blur`              | `(event: FocusEvent)`                      | Dipicu saat elemen kehilangan fokus pengguna.                                                                                                                                             |
| `@clear`             | —                                           | Dipicu saat tombol hapus/silang pada input (`clearable`, `search`, `mask`, `select`) diklik.                                                                                      |
| `@validate`          | `(result: Object)`                         | Dipicu setiap kali fungsi validasi dievaluasi. Mengembalikan payload lengkap:`{ valid: boolean, message: string, value: any, score?: number, totalScore?: number, criteria?: Object }`. |
| `@error`             | `(errorMessage: string)`                   | Dipicu saat terjadi kegagalan validasi berkas pada`type="file"` (misal file melebihi `maxSize` atau `maxFiles`).                                                                    |
| `@cancel-upload`     | —                                           | Dipicu saat tombol batal unggah pada berkas diklik.                                                                                                                                       |
| `@complete`          | `(otpCode: string)`                        | Dipicu saat seluruh digit OTP telah selesai diisi (`type="otp"`).                                                                                                                       |
| `@resend`            | —                                           | Dipicu saat tombol kirim ulang kode OTP diklik (`type="otp"`).                                                                                                                          |
| `@tag-add`           | `(tag: string \| object)`                   | Dipicu saat tag baru berhasil ditambahkan (`type="tag"`).                                                                                                                               |
| `@tag-remove`        | `(tag: string \| object)`                   | Dipicu saat salah satu tag dihapus (`type="tag"`).                                                                                                                                      |
| `@max-reached`       | `(max: number)`                            | Dipicu saat jumlah tag atau baris repeater telah menyentuh batas maksimum.                                                                                                                |
| `@item-add`          | `(newItem: object)`                        | Dipicu saat baris entri baru ditambahkan ke repeater (`type="repeater"`).                                                                                                               |
| `@item-remove`       | `(index: number)`                          | Dipicu saat baris entri pada repeater dihapus.                                                                                                                                            |
| `@item-duplicate`    | `(index: number)`                          | Dipicu saat baris entri pada repeater diduplikasi.                                                                                                                                        |
| `@item-move`         | `({ fromIndex: number, toIndex: number })` | Dipicu saat urutan baris entri pada repeater dipindahkan.                                                                                                                                 |

#### Contoh Menangani Events:

```vue
<InputField
  v-model="username"
  label="Username"
  :validator="(val) => val.length < 4 ? 'Minimal 4 karakter' : true"
  @input="handleNativeInput"
  @validate="onValidationChanged"
  @clear="onFieldCleared"
/>
```

---

### Component Expose API (`defineExpose`)

Melalui template reference Vue (misal: `<InputField ref="inputRef" />`), komponen induk dapat mengakses properti dan metode programatik berikut:

| Method / Property | Tipe Data                    | Deskripsi & Kegunaan                                                                                                                          |
| :---------------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| `focus()`       | `Function()`               | Menempatkan kursor fokus secara programatik ke elemen input/textarea/kontrol aktif di dalam subkomponen.                                      |
| `blur()`        | `Function()`               | Melepas fokus dari elemen kontrol aktif.                                                                                                      |
| `clear()`       | `Function()`               | Mengosongkan nilai input secara instan dan membersihkan pesan validasi sementara.                                                             |
| `validate()`    | `Function(): Object`       | Menjalankan proses validasi secara programatik tanpa harus menunggu interaksi pengguna. Mengembalikan`{ valid: Boolean, message: String }`. |
| `inputId`       | `ComputedRef<String>`      | Mengambil string ID unik elemen input yang terhubung dengan atribut`<label for="...">`.                                                     |
| `controlRef`    | `Ref<Component>`           | Referensi langsung ke instance Vue sub-komponen aktif (`InputText`, `InputSelect`, `InputFile`, dll.).                                  |
| `inputRef`      | `ComputedRef<HTMLElement>` | Referensi langsung ke elemen HTML native (`<input>`, `<textarea>`, `<select>`) untuk manipulasi DOM tingkat rendah jika dibutuhkan.     |
| `value`         | `ComputedRef<any>`         | Mengakses nilai state terkini yang sedang disimpan oleh input.                                                                                |

#### Contoh Pemanggilan Programatik via Template Ref:

```vue
<script setup>
import { ref } from 'vue';
import InputField from '@/Components/Pack/InputField.vue';

const nameField = ref(null);
const nameValue = ref('');

const handleFocusInput = () => {
  // 1. Fokuskan kursor langsung ke kolom
  nameField.value?.focus();
};

const handleResetForm = () => {
  // 2. Kosongkan nilai kolom via expose
  nameField.value?.clear();
};

const handleCheckValidity = () => {
  // 3. Cek validitas secara programatik
  const result = nameField.value?.validate();
  if (!result.valid) {
    console.warn('Validasi gagal:', result.message);
  }
};
</script>

<template>
  <div class="space-y-3">
    <InputField
      ref="nameField"
      v-model="nameValue"
      label="Nama Lengkap"
      :validator="(val) => val ? true : 'Nama tidak boleh kosong!'"
    />

    <div class="flex gap-2">
      <button @click="handleFocusInput">Fokuskan</button>
      <button @click="handleResetForm">Bersihkan</button>
      <button @click="handleCheckValidity">Validasi Sekarang</button>
    </div>
  </div>
</template>
```

---

## 🔍 Panduan Fitur Unggulan

### 1. Fitur Live Watch & Custom Validator (Universal di Semua Input)

Tidak hanya terbatas pada alamat email, fitur pemantauan (*watch*) dan validasi interaktif dapat diterapkan pada **semua jenis input** (`text`, `number`, `url`, `tel`, dll.).

1. **Validasi URL Bawaan (`type="url"`)**:
   Otomatis mengecek protokol `http://` / `https://` dan struktur domain valid.
2. **Validasi Rentang Angka (`type="number"`)**:
   Otomatis memverifikasi batasan prop `:min="..."` dan `:max="..."` secara instan dan menampilkan pesan bantuan jika nilai di luar batas.
3. **Validator Kustom via Prop `:validator`**:
   Anda dapat memberikan fungsi logika bebas:
   ```vue
   <InputField
     v-model="referralCode"
     label="Kode Referral"
     placeholder="Contoh: DISKON50"
     :validator="(val) => {
       if (!val) return true;
       if (val.length < 5) return 'Kode referral minimal 5 karakter.';
       if (!/^[A-Z0-9]+$/.test(val)) return 'Hanya huruf kapital dan angka.';
       return true;
     }"
   />
   ```
4. **Validasi Regex Cepat via Prop `:pattern` & `:pattern-message`**:
   ```vue
   <InputField
     v-model="npwp"
     label="Nomor Pokok"
     pattern="^[0-9]{15,16}$"
     pattern-message="Nomor wajib terdiri dari 15 atau 16 digit angka."
   />
   ```
5. **Hook Pemantau Realtime via Prop `:on-watch`**:
   ```vue
   <InputField
     v-model="searchQuery"
     type="search"
     label="Cari Produk"
     :on-watch="(val) => console.log('User mengetik:', val)"
   />
   ```

---

### 2. Fitur Kustomisasi Password Strength Meter

Kotak indikator kekuatan password yang muncul saat kolom sandi difokuskan dapat:

* **Dinonaktifkan Sepenuhnya**:
  Gunakan prop `:show-password-strength="false"`. Tombol reveal password (mata) tetap berfungsi normal.
* **Dikustomisasi Aturan & Kriterianya**:
  Gunakan prop `:password-rules="{ ... }"`. Bar indikator dan checklist otomatis beradaptasi hanya dengan aturan yang Anda pilih.

#### Contoh 1: Mematikan Strength Meter

```vue
<InputField
  v-model="password"
  type="password"
  label="Kata Sandi Akun"
  :show-password-strength="false"
/>
```

#### Contoh 2: Kustomisasi Sandi Sederhana (Hanya Panjang Karakter & Angka)

```vue
<InputField
  v-model="pinCode"
  type="password"
  label="PIN Akses Cepat"
  :password-rules="{
    minLength: 6,
    requireNumbers: true,
    requireSymbols: false,
    requireUppercase: false,
    requireLowercase: false,
  }"
  hint="Hanya butuh minimal 6 karakter dan angka"
/>
```

*Hasil*: Checklist kriteria hanya menampilkan 2 butir ("Min. 6 karakter" & "Mengandung angka"), dan bar kekuatan sandi hanya terbagi menjadi 2 segmen proporsional.

---

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
  * Mendukung fungsi `rangeFormatter` kustom (contoh: `(v) => \`\${v}%\``atau`(v) => \`Rp \${v.toLocaleString()}\``).

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

#### 9.12 `InputMask.vue`

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
