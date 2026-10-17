# FileDropzone Component

Komponen pengunggah berkas serbaguna (*drag-and-drop file uploader*) enterprise berbasis Vue 3 dan Tailwind CSS dengan dukungan pratinjau gambar instan, validasi format/ekstensi file, batas ukuran berkas, multi-file upload, indikator progres unggahan, dan mode foto profil avatar.

---

## 01. Overview

`FileDropzone.vue` menyederhanakan interaksi pemilihan dan pengunggahan berkas melalui antarmuka drag-and-drop yang intuitif, aman, dan berkinerja tinggi.

### 1.1 Apa Entitas Ini
Komponen Vue 3 berbasis Composition API (`packages/laravel-pack-ui/resources/js/Components/Pack/FileDropzone.vue` serta facade resmi `FileDropzoneComponent.vue`) yang membungkus mesin input berkas terpadu dengan 8 mode tata letak visual: `dropzone` (banner hero utama), `avatar` (lingkaran foto profil), `grid` (galeri gambar modular), `list` (daftar baris dokumen), `button` (tombol pemicu ringkas), `compact` (inline bar hemat tempat), `banner` (hero memanjang), dan `paste` (area penempelan clipboard Ctrl+V), lengkap dengan dukungan file eksisting database dan simulasi unggahan sistem.

### 1.2 Fungsi Utama
- Memungkinkan pengguna memilih berkas melalui klik eksplorator sistem maupun penyeretan langsung (*drag-and-drop*).
- Menampilkan pratinjau langsung gambar lokal (*instant client-side preview*) menggunakan `URL.createObjectURL` sebelum berkas dikirim ke server.
- Melakukan validasi awal pada sisi klien (*client-side pre-validation*) untuk batas ukuran berkas (`maxSize`) dan filter tipe ekstensi MIME (`accept`).
- Menyediakan animasi bilah persentase kemajuan unggah (*upload progress bar*) terintegrasi.
- Mendukung mode pengunggahan banyak berkas (*multiple upload*) dengan batasan jumlah maksimum (`maxFiles`).

### 1.3 Kapan Digunakan
- Pada formulir verifikasi identitas (KYC) untuk mengunggah foto KTP, paspor, atau berkas legalitas perusahaan.
- Pada modul katalog e-commerce untuk mengunggah deretan foto produk dalam format galeri kisi.
- Pada halaman profil akun pengguna untuk memperbarui foto avatar profil.
- Pada modul keuangan untuk melampirkan berkas bukti transaksi pembayaran, kuitansi, atau faktur PDF.

### 1.4 Karakteristik Penting
- **Client-Side Safe Pre-Validation**: Mencegah pengiriman berkas berukuran terlalu besar ke server dengan memfilter ukuran dan ekstensi sebelum proses transmisi jaringan dimulai.
- **Automatic Memory Cleanup**: Objek URL pratinjau lokal dibersihkan secara otomatis saat komponen dilepas (*unmounted*) atau berkas diganti untuk mencegah kebocoran memori (*memory leak*).
- **Inertia useForm Symbiosis**: Bekerja harmonis dengan objek form Inertia.js termasuk penanganan status `form.processing`, `form.progress`, dan `form.errors`.

---

## 02. Preview

> [!TIP]
> Pengujian visual dan showcase interaktif entitas ini tersedia secara native pada portal pratinjau aplikasi:
>
> - Rute Demo Native: `/demo/file-dropzone`
> - Portal Pratinjau: `/preview/file-dropzone`
>
> <a href="/demo/file-dropzone" target="_self" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 8px; background-color: var(--vp-c-brand-1, #4f46e5); color: #ffffff;">Buka Live Demo Komponen FileDropzone &rarr;</a>

---

## 03. Usage

### Pohon Konsep Penggunaan

```text
FileDropzone
├── 8 Varian Tata Letak (variant / layout)
│   ├── dropzone (Banner hero area seret luas dengan daftar multi-berkas rapi)
│   ├── avatar (Bentuk lingkaran foto profil pengguna dengan tombol kamera & mode minimal)
│   ├── grid (Koleksi petak multi-gambar untuk produk atau galeri foto)
│   ├── list (Daftar baris ramping untuk dokumen PDF/spreadsheet)
│   ├── button (Tombol pemicu ringkas dengan triggerPicker dialog asli)
│   ├── compact (Bilah inline horizontal hemat ruang formulir)
│   ├── banner (Banner horizontal memanjang dengan tombol CTA terintegrasi)
│   └── paste (Area penempelan clipboard langsung via pintasan Ctrl+V)
├── Validasi Sisi Klien
│   ├── accept (Filter MIME bebas campuran misal 'image/*', '.pdf', '.docx', 'video/*')
│   ├── maxSize (Batas ukuran fleksibel misal '2KB', '500KB', '10MB', '1GB')
│   └── maxFiles (Batas kuantitas berkas pada multiple upload)
└── Umpan Balik Status & Integrasi
    ├── uploading / simulateUpload (Spinner dan simulasi progres pengiriman sistem)
    ├── progress (Bilah atau cincin persentase 0-100% spesifik per varian)
    ├── existingFiles (Penanganan berkas tersimpan di database dengan aksi ganti/hapus)
    └── error (Pesan kesalahan validasi merah menyala)
```

### Matriks Kapan Digunakan vs Dihindari

| Kasus Penggunaan | Gunakan FileDropzone | Hindari (Gunakan Alternatif) |
|---|---|---|
| Upload dokumen identitas / KTP / PDF | Ya (`variant="dropzone"` atau `"list"`) | Jangan gunakan input teks URL |
| Galeri multi-foto produk e-commerce | Ya (`variant="grid"`, `multiple`) | Hindari membuat beberapa input file terpisah |
| Foto profil avatar akun | Ya (`variant="avatar"`) | Jangan gunakan kotak dropzone persegi besar |
| Pengurutan urutan antar kartu | Tidak | Gunakan DragDrop |

### Contoh Penggunaan Cepat

```vue
<script setup>
import { ref } from 'vue';
import FileDropzone from '@/Components/Pack/FileDropzone.vue';

const attachments = ref(null);

function handleFileChange(files) {
  console.log('Berkas terpilih:', files);
}
</script>

<template>
  <FileDropzone
    v-model="attachments"
    label="Upload Berkas Persyaratan"
    sublabel="Format PDF atau Gambar (Maks. 5MB)"
    accept=".pdf,image/*"
    max-size="5MB"
    @change="handleFileChange"
  />
</template>
```

---

## 04. Anatomy

### Diagram Struktur Anatomi

```text
1. Mode Hero Dropzone (variant="dropzone"):
+--------------------------------------------------------------+
| [LABEL AREA]                                                 |
| Label Utama Unggah Dokumen (*)      [Sublabel: PDF Maks 5MB] |
+--------------------------------------------------------------+
| [AREA DROP INTERAKTIF: Dashed Border / Hover Blue Ring]      |
|                                                              |
|                     ( cloud_upload )                         |
|            Tarik dan lepaskan berkas di sini                 |
|       atau klik untuk memilih berkas dari komputer           |
|                                                              |
+--------------------------------------------------------------+
| [DAFTAR PRATINJAU BERKAS TERPILIH]                           |
| [Thumb] Dokumen_Kontrak_2026.pdf (1.4 MB)        [Hapus (X)] |
| [======================= PROGRESS BAR 75% =================] |
+--------------------------------------------------------------+
| [HINT / ERROR AREA] Pesan galat validasi merah di bawah      |
+--------------------------------------------------------------+

2. Mode Avatar (variant="avatar"):
           +-------------------+
           |    ( AVATAR )     |
           |   Foto Profil     |
           |  (photo_camera)   |
           +-------------------+
```

### Komponen Anatomi Rinci
1. **Header Metadata**: Label judul input, indikator tanda bintang wajib diisi (*required indicator*), dan teks sublabel penjelas format.
2. **Drop Target Surface**: Area seret interaktif bergaris putus-putus (*dashed border*) yang menyala biru ketika berkas melayang di atasnya (*dragover*).
3. **Dropzone Directives**: Ikon awan pengunggah (`cloud_upload`), teks instruksi penyeretan, dan subteks alternatif klik manual.
4. **File Preview Cards**: Baris atau kartu pratinjau yang memuat thumbnail visual (khusus gambar), nama dokumen, ukuran berkas terformat (KB/MB), serta tombol hapus silang (*remove button*).
5. **Upload Progress Track**: Bilah animasi persentase kemajuan berwarna biru saat berkas sedang dalam proses pengiriman asinkron.
6. **Error / Hint Notification**: Pesan peringatan kesalahan ukuran berkas atau format ekstensi yang tidak diizinkan.

---

## 05. Variants

### Tabel Mode Tata Letak (`variant` / `layout`)

| Nama Nilai | Kapan Dipakai | Ringkasan Visual |
|---|---|---|
| `dropzone` | Unggahan dokumen standar, formulir utama KYC, pendaftaran akun | Banner hero berbidang luas dengan ikon awan terpusat (bawaan) dan daftar berkas terpisah rapi tanpa tumpang tindih |
| `avatar` | Foto profil pengguna, logo organisasi, gambar avatar akun | Tampilan melingkar/persegi proporsional dengan ikon kamera melayang, mendukung mode minimal |
| `grid` | Portofolio foto, multi-gambar produk e-commerce, galeri desain | Tata letak petak kisi modular dengan slot kartu penambahan berkas baru di samping pratinjau |
| `list` | Lampiran berkas hukum, dokumen PDF, arsip spreadsheet keuangan | Format baris dokumen ramping berurutan ke bawah hemat ruang |
| `button` | Tombol pemicu ringkas mandiri pada toolbar atau modal sempit | Tombol pemicu ringkas yang langsung memanggil dialog pemilih berkas sistem tanpa kontainer besar |
| `compact` | Formulir satu baris, tiket bantuan helpdesk, area komentar | Bilah horizontal inline hemat tempat dengan tombol pilih berkas tersemat di kanan |
| `banner` | Header lanskap, halaman landing pendaftaran, formulir berdinding luas | Banner horizontal lebar memanjang dengan teks dan tombol aksi eksplisit di samping |
| `paste` | Tangkapan layar kilat, penempelan dokumen dari aplikasi desktop | Area interaktif yang mendukung penempelan berkas langsung dari clipboard via pintasan Ctrl+V atau Cmd+V |

### Tabel Tema Warna Semantik (`colorTheme`)

| Nama Nilai | Kapan Dipakai | Ringkasan Visual |
|---|---|---|
| `primary` | Tema bawaan merek aplikasi | Garis tepi putus-putus dan ring fokus biru brand |
| `indigo` | Dasbor enterprise, modul analitik | Aksen garis tepi dan latar hover indigo modern |
| `emerald` | Formulir data terverifikasi, persetujuan transaksi | Aksen border dan status kemajuan hijau sukses |
| `rose` | Formulir darurat atau penandaan berkas krusial | Aksen border dan highlight mawar merah |
| `amber` | Modul evaluasi, unggahan sementara | Aksen border dan ring fokus kuning amber |
| `violet` | Modul media kreatif, ruang kerja AI | Aksen ungu violet pada badge dan bilah progres |
| `cyan` | Modul telemetri, metrik performa | Aksen biru cyan cerah pada sorotan hover |
| `dark` | Antarmuka mode monokrom kontras tinggi | Aksen border netral gelap tanpa saturasi warna tinggi |

---

## 06. Sizes & Radius

### Dimensi Skala Ukuran (`size`)
- **xs**: Tata letak mikro sangat hemat tempat, padding minimal, ikon 24px, teks 11px.
- **sm**: Padding kompak `p-4 sm:p-5`, ikon 28px, teks judul 12px, tombol aksi ukuran `xs`, tinggi pratinjau grid `h-28`.
- **md** (default): Dimensi proporsional `p-6 sm:p-8`, ikon 36px, teks judul 14px, tombol aksi ukuran `sm`, tinggi pratinjau grid `h-32`.
- **lg**: Dimensi lapang `p-8 sm:p-10`, ikon 44px, teks judul 16px, tombol aksi ukuran `md`, tinggi pratinjau grid `h-36`.
- **xl**: Dimensi ekstra besar untuk formulir landing page atau hero dropzone utama, padding lapang, ikon 52px.
- **full**: Lebar penuh fleksibel adaptif 100% mengikuti kontainer induk.

### Token Kelengkungan Sudut (`rounded` / `radius`)
Mendukung skala kelengkungan token terpusat: `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'` (default), `'3xl'`, dan `'full'`. Seluruh elemen internal (kartu pratinjau, kotak ikon, badge, dan modal zoom) secara otomatis mengalkulasikan kelengkungan dalam (`innerRadius`) secara presisi dan selaras.

---

## 07. States

- **Idle / Empty State**: Menampilkan instruksi seret atau klik untuk membuka jendela pemilih berkas sistem.
- **Drag Over State**: Garis tepi berubah menjadi biru tegas (`border-blue-500`) dan latar belakang berkedip lembut menyambut berkas yang diseret.
- **Has Files State**: Menampilkan daftar kartu thumbnail berkas yang telah dipilih dan siap diunggah.
- **Uploading State (`uploading="true"`)**: Menampilkan indikator spinner dan bilah progres persentase kemajuan.
- **Disabled State (`disabled="true"`)**: Seluruh elemen meredup (`opacity-50`) dengan kursor dilarang (`cursor-not-allowed`).
- **Error State**: Garis tepi berubah menjadi merah menyala (`border-rose-500`) dan pesan kesalahan muncul di bawah area drop.

---

## 08. Props / Attributes

| Prop | Tipe Data | Default | Keterangan |
|---|---|---|---|
| `modelValue` | `File \| Array \| String \| Object` | `null` | Objek berkas atau array berkas terpilih (`v-model`) |
| `variant` / `layout` | `String` | `'dropzone'` | Gaya tata letak: `'dropzone'`, `'avatar'`, `'grid'`, `'list'`, `'button'`, `'compact'`, `'banner'`, `'paste'` |
| `size` | `String` | `'md'` | Skala dimensi ukuran komponen: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'full'` |
| `rounded` / `radius` | `String` | `'2xl'` | Kelengkungan sudut border: `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`, `'full'` |
| `colorTheme` / `color` | `String` | `'primary'` | Tema warna aksen, ring fokus, border hover, dan badge: `'primary'`, `'indigo'`, `'emerald'`, `'rose'`, `'amber'`, `'violet'`, `'cyan'`, `'dark'` |
| `id` | `String` | `''` | ID elemen HTML unik. Jika kosong, digenerate otomatis melalui `useId()` |
| `name` | `String` | `''` | Atribut nama input HTML |
| `label` | `String` | `''` | Judul label di atas area dropzone |
| `sublabel` | `String` | `''` | Teks keterangan format di sebelah kanan label |
| `placeholder` | `String` | `''` | Teks instruksi utama di dalam area dropzone |
| `subtext` | `String` | `''` | Keterangan tambahan di bawah judul dropzone |
| `accept` | `String` | `''` | Filter ekstensi atau tipe MIME bebas campuran (contoh: `'image/*'`, `'.pdf,.docx'`, `'video/*'`, `'.dwg'`) |
| `multiple` | `Boolean` | `false` | Mengizinkan pemilihan lebih dari 1 berkas sekaligus |
| `required` | `Boolean` | `false` | Menandai input berkas wajib diisi |
| `disabled` | `Boolean` | `false` | Menonaktifkan interaksi klik dan drag |
| `minimal` | `Boolean` | `false` | Mode minimalis, menghilangkan teks instruksi pendukung (sangat cocok untuk avatar ringkas) |
| `hideInfo` | `Boolean` | `false` | Menyembunyikan informasi spesifikasi format dan batas ukuran berkas |
| `maxSize` | `Number \| String` | `null` | Batas maksimum ukuran berkas fleksibel (contoh: `'2KB'`, `'500KB'`, `'10MB'`, `'1GB'`) |
| `maxFiles` | `Number` | `null` | Batas maksimum kuantitas berkas pada multiple upload |
| `uploading` | `Boolean` | `false` | Mengaktifkan indikator proses pengunggahan aktif |
| `simulateUpload` | `Boolean` | `false` | Menjalankan simulasi proses unggah otomatis oleh sistem dengan persentase bertahap |
| `progress` | `Number` | `null` | Angka persentase kemajuan unggahan (0 sampai 100) |
| `existingFiles` | `Array \| Object \| String` | `null` | Berkas awal yang sudah tersimpan di database untuk ditampilkan, diganti, atau dihapus |
| `error` | `String` | `''` | Pesan kesalahan validasi berkas |
| `hint` | `String` | `''` | Teks petunjuk bantuan di bawah dropzone |

---

## 09. Slots

| Nama Slot | Keterangan | Parameter Lingkup |
|---|---|---|
| `default` | Kustomisasi penuh tampilan antarmuka area hero dropzone | `{ isDragging, triggerPicker, uploading, progress }` |
| `label` | Kustomisasi teks atau ikon label utama | — |
| `label-right` | Kustomisasi teks metadata di sudut kanan atas | — |
| `hint` | Kustomisasi teks petunjuk di bawah dropzone | — |
| `footer` | Area bebas di bawah kartu pratinjau berkas | — |
| `loading` | Kustomisasi desain indikator progres loading unggahan dari developer | `{ progress, uploading, cancel }` |

---

## 10. Events / Interactions

### 10.1 Daftar Emits Komponen

| Nama Event | Parameter | Deskripsi Pemancaran |
|---|---|---|
| `update:modelValue` | `File \| Array` | Dipancarkan saat berkas baru dipilih atau berkas dihapus (binding `v-model`) |
| `change` | `File \| Array` | Dipancarkan seketika terjadi mutasi berkas |
| `error` | `String` | Dipancarkan saat berkas melanggar batas `maxSize` atau tipe `accept` |
| `cancel-upload` | — | Dipancarkan saat pengguna menekan tombol batalkan unggahan |
| `delete-existing` | `Object \| String` | Dipancarkan saat berkas eksisting dari database dihapus oleh pengguna |
| `upload-start` | `File \| Array` | Dipancarkan seketika pengunggahan atau simulasi unggahan sistem dimulai |
| `upload-progress` | `Number` | Dipancarkan berkala dengan persentase kemajuan unggahan (0 sampai 100) |
| `upload-complete` | `File \| Array` | Dipancarkan saat seluruh berkas selesai diproses atau diunggah 100% |

### 10.2 Metode Terprogram (Exposed Methods via `defineExpose`)

Komponen mengekspos fungsi-fungsi berikut ke komponen induk melalui template ref (`ref="dropzoneRef"`):

| Nama Metode / Properti | Tipe | Keterangan |
|---|---|---|
| `triggerPicker()` | `Function` | Membuka jendela dialog pemilih berkas native peramban secara terprogram |
| `clear()` | `Function` | Mengosongkan seluruh berkas terpilih dan membersihkan memori blob URL |
| `removeFile(index)` | `Function` | Menghapus berkas tertentu berdasarkan nomor indeks daftar pratinjau |
| `processFiles(files)` | `Function` | Memvalidasi dan memasukkan daftar berkas (FileList atau Array File) secara manual |
| `filePreviews` | `Ref<Array>` | Getter reaktif berisi daftar objek pratinjau berkas yang sedang aktif |
| `fileInputRef` | `Ref<HTMLInputElement>` | Referensi elemen `<input type="file">` HTML native |

---

## 11. Code Example

### 11.1 Pengunggahan Berkas Identitas KYC Resmi
```vue
<script setup>
import { ref } from 'vue';
import FileDropzone from '@/Components/Pack/FileDropzone.vue';

const kycDoc = ref(null);
const uploadError = ref('');

function onFileError(msg) {
  uploadError.value = msg;
}
</script>

<template>
  <FileDropzone
    v-model="kycDoc"
    variant="dropzone"
    label="Unggah KTP / Paspor Resmi"
    sublabel="Format PDF / JPG (Maks. 2MB)"
    accept=".pdf,image/jpeg,image/png"
    max-size="2MB"
    :error="uploadError"
    placeholder="Letakkan berkas identitas di sini"
    subtext="Pastikan tulisan NIK terbaca jelas tanpa pantulan cahaya"
    @error="onFileError"
  />
</template>
```

### 11.2 Galeri Multi-Foto Produk Toko Online
```vue
<script setup>
import { ref } from 'vue';
import FileDropzone from '@/Components/Pack/FileDropzone.vue';

const productImages = ref([]);
</script>

<template>
  <FileDropzone
    v-model="productImages"
    variant="grid"
    label="Foto Galeri Produk"
    sublabel="Maksimal 6 Foto"
    accept="image/*"
    multiple
    :max-files="6"
    max-size="5MB"
  />
</template>
```

### 11.3 Foto Profil Akun Pengguna (Avatar Mode)
```vue
<script setup>
import { ref } from 'vue';
import FileDropzone from '@/Components/Pack/FileDropzone.vue';

const profileAvatar = ref(null);
</script>

<template>
  <div class="flex justify-center">
    <FileDropzone
      v-model="profileAvatar"
      variant="avatar"
      label="Foto Profil Akun"
      accept="image/*"
      max-size="2MB"
    />
  </div>
</template>
```

### 11.4 Area Tangkapan Clipboard (Ctrl+V Ready)
```vue
<script setup>
import { ref } from 'vue';
import FileDropzone from '@/Components/Pack/FileDropzone.vue';

const pastedImage = ref(null);
</script>

<template>
  <FileDropzone
    v-model="pastedImage"
    variant="paste"
    label="Tangkapan Layar Langsung"
    placeholder="Tekan Ctrl + V untuk menempelkan gambar dari clipboard"
    subtext="Screenshot dari Snipping Tool atau foto tersalin langsung terdeteksi otomatis"
    accept="image/*"
    max-size="5MB"
  />
</template>
```

---

## 12. Result / Behavior

- **Pratinjau Klien Instan**: Berkas gambar secara otomatis dikonversi menjadi URL objek lokal melalui `URL.createObjectURL(file)`, memungkinkan pratinjau foto instan tanpa membebani server backend.
- **Validasi Klien Otomatis**: Jika pengguna menyeret berkas yang ukurannya melebihi `maxSize` (misal 8MB pada batas 5MB) atau ekstensi tidak sesuai `accept`, berkas langsung ditolak di sisi peramban dan event `@error` dipancarkan seketika.
- **Integrasi Input File Tersembunyi**: Tag `<input type="file">` disembunyikan secara visual (`sr-only` atau `hidden`) namun tetap terhubung secara semantik dengan label pembungkusnya.

---

## 13. Customization

### Integrasi Formulir Pengiriman Inertia.js
```vue
<script setup>
import { useForm } from '@inertiajs/vue3';
import FileDropzone from '@/Components/Pack/FileDropzone.vue';

const form = useForm({
  title: 'Laporan Finansial Q1',
  attachment: null,
});

function submit() {
  form.post('/reports/upload', {
    forceFormData: true,
  });
}
</script>

<template>
  <form @submit.prevent="submit" class="space-y-4">
    <FileDropzone
      v-model="form.attachment"
      :uploading="form.processing"
      :progress="form.progress ? form.progress.percentage : null"
      :error="form.errors.attachment"
      label="Berkas Laporan"
      accept=".pdf,.xlsx"
      max-size="10MB"
    />
    <button type="submit" :disabled="form.processing" class="px-4 py-2 bg-blue-600 text-white rounded-lg">
      Kirim Berkas
    </button>
  </form>
</template>
```

---

## 14. Accessibility

- **Keyboard Selectability**: Pengguna dapat memfokuskan tombol pemicu dropzone menggunakan tombol `Tab` dan membuka dialog pemilih berkas sistem menggunakan tombol `Enter` atau `Space`.
- **Accessible Removal**: Setiap tombol hapus berkas pada daftar pratinjau memiliki atribut `aria-label="Hapus berkas [nama_file]"`.
- **Live Error Announcement**: Pesan galat validasi menggunakan live region `aria-live="polite"` agar terdengar oleh teknologi pembaca layar (*screen reader*).

---

## 15. Responsive Behavior

- **Mobile Viewport (<640px)**:
  - Tata letak area seret dan pratinjau beralih ke orientasi vertikal (stacked flex column) untuk memastikan kenyamanan pada genggaman satu tangan.
  - Varian `grid` secara adaptif menggunakan 1 atau 2 kolom (`grid-cols-1 sm:grid-cols-2`) sehingga thumbnail tetap jelas dan detail terbaca.
  - Varian `list` membagi baris menjadi blok nama file dan deretan aksi terpisah dengan target sentuh minimal 40px x 40px.
  - Tombol aksi pada hero card menggunakan ukuran ringkas dan tombol hapus mudah dijangkau.
- **Tablet Viewport (640px - 1024px)**:
  - Mode hero preview memosisikan thumbnail di sisi kiri dan rincian metadata di sisi kanan secara horizontal.
  - Varian `grid` menampilkan 2 hingga 3 kolom seimbang (`sm:grid-cols-2 md:grid-cols-3`).
  - Baris dokumen pada mode `list` sejajar horizontal dengan informasi tanggal modifikasi dan ukuran berkas.
- **Desktop Viewport (>1024px)**:
  - Varian `grid` menampilkan hingga 4 kolom penuh (`xl:grid-cols-4`).
  - Drop area hero banner memaksimalkan ruang horizontal dengan panduan drag-over yang lapang dan jelas.

---

## 16. Do / Don't

| Rekomendasi (Do) | Pantangan (Don't) |
|---|---|
| Selalu cantumkan petunjuk batas ukuran dan format file yang diterima pada prop `sublabel` atau `subtext`. | Jangan membiarkan pengguna menebak-nebak format apa saja yang diizinkan oleh sistem. |
| Pasang prop `:max-files` pada mode `multiple` untuk mencegah pengguna mengunggah ratusan foto sekaligus. | Jangan menerima semua jenis berkas tanpa menyaring prop `accept` demi keamanan aplikasi. |
| Gunakan varian `avatar` khusus untuk foto profil satu berkas. | Jangan gunakan varian `avatar` untuk mengunggah dokumen PDF atau spreadsheet. |
| Tampilkan bilah progres persentase saat berkas berukuran besar sedang dikirim ke server. | Jangan mengunci antarmuka tanpa indikator status saat proses unggah berlangsung. |

---

## 17. Examples / Recipes

### Recipe 1: Formulir Lampiran Bukti Pajak & Faktur
```vue
<FileDropzone
  variant="list"
  label="Lampiran Faktur Pajak"
  sublabel="PDF / ZIP hingga 10MB"
  accept=".pdf,.zip"
  max-size="10MB"
  multiple
  :max-files="3"
/>
```

### Recipe 2: Pratinjau Foto Profil Eksekutif
```vue
<FileDropzone
  variant="avatar"
  label="Foto Profil Eksekutif"
  accept="image/jpeg,image/png,image/webp"
  max-size="2MB"
/>
```

---

## 18. Related Components

- **[CtaButton Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/cta-button.md)**: Tombol aksi terpadu yang digunakan di dalam antarmuka dropzone untuk memilih berkas, mengganti, memperbesar, menghapus, atau membatalkan unggahan.
- **[Badge Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/badge.md)**: Lencana penanda format ekstensi berkas, kapasitas ukuran, dan status unggahan.
- **[Card Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/card.md)**: Kontainer kartu pembungkus formulir dan pratinjau pengunggahan berkas.
- **[InputField Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/input-field.md)**: Masukan teks, switch, dan selektor pendamping dalam satu kesatuan formulir entri data.
- **[Tabs Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/tabs.md)**: Tab navigasi pemilihan varian dan skenario pengunggahan berkas.
- **[TableComponent](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/table.md)**: Tabel terstruktur untuk menampilkan daftar dokumen terunggah atau dokumentasi API.

---

## 19. Notes / Limitations

- **Browser Object URL Revocation**: URL pratinjau yang dibuat via `URL.createObjectURL` berada di dalam memori peramban. Komponen membersihkan URL ini secara otomatis, namun jika Anda mengekstrak URL tersebut ke luar komponen, pastikan memanggil `URL.revokeObjectURL(url)` setelah selesai digunakan.
- **Server Upload Limits**: Validasi `maxSize` pada komponen ini bekerja di sisi frontend. Pastikan konfigurasi server backend Anda (`upload_max_filesize` dan `post_max_size` pada PHP, serta `client_max_body_size` pada Nginx) selaras dengan batasan ukuran berkas.
- **HEIC Image Format**: Format foto iOS (`.heic`) memerlukan konversi sisi klien khusus jika ingin ditampilkan secara langsung pada peramban non-Safari.
