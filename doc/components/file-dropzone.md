# 📁 FileDropzone Component (`FileDropzone.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen area unggah berkas berbasis *drag-and-drop* tingkat lanjut yang dirancang khusus untuk alur kerja unggah berkas modern. Komponen ini menyediakan fasad *standalone* yang elegan dengan auto-generated identifier, label & hint wrapper, pratinjau thumbnail instan, progress bar per-file, validasi ukuran & format MIME otomatis, modal zoom lightbox, serta pembersihan memori otomatis (`URL.revokeObjectURL`) untuk mencegah memory leak pada browser.

---

## 🚀 Import & Penggunaan Dasar

Dapat langsung di-import menggunakan path alias `@/Components/Pack/FileDropzone.vue`:

```vue
<script setup>
import { ref } from 'vue';
import FileDropzone from '@/Components/Pack/FileDropzone.vue';

// State berkas tunggal (File object atau string URL)
const avatarFile = ref(null);

// State berkas ganda (Array of File objects)
const galleryFiles = ref([]);
</script>

<template>
  <div class="space-y-6">
    <!-- 1. Dropzone Hero Banner (Default) -->
    <FileDropzone
      v-model="avatarFile"
      label="Bukti Pembayaran / Dokumen Tagihan"
      sublabel="Wajib PDF / Gambar"
      placeholder="Tarik & seret berkas ke sini, atau klik untuk memilih"
      subtext="Format JPG, PNG, WEBP, atau PDF hingga 5MB"
      accept="image/*,.pdf"
      max-size="5MB"
      required
    />

    <!-- 2. Dropzone Galeri Multi-Berkas (Grid Variant) -->
    <FileDropzone
      v-model="galleryFiles"
      variant="grid"
      label="Galeri Foto Produk"
      hint="Unggah hingga 6 foto sekaligus untuk galeri produk katalog."
      accept="image/*"
      multiple
      :max-files="6"
      max-size="3MB"
    />
  </div>
</template>
```

---

## 🎨 4 Varian Tampilan (`variant`)

`FileDropzone.vue` mendukung 4 varian tampilan fleksibel:

| Varian | Deskripsi & Skenario Penggunaan |
| :--- | :--- |
| `'dropzone'` *(Default)* | Banner hero lebar dengan ikon tengah, drag-and-drop border dashed, thumbnail hero card, dan tombol zoom modal. Cocok untuk dokumen tunggal, bukti transfer, dan lampiran kontrak. |
| `'grid'` | Drag-and-drop bar ringkas di atas kartu-kartu galeri foto multi-kolom (2-3 kolom) dengan badge ukuran, tombol hapus per kartu, dan pratinjau thumbnail. Cocok untuk foto katalog produk. |
| `'list'` | Format baris daftar/tabel ringkas untuk dokumen kantor dengan ikon ekstensi warna-warni (PDF merah, XLSX hijau, DOCX biru, ZIP oranye). Cocok untuk lampiran berkas pajak atau laporan keuangan. |
| `'avatar'` | Kotak profil ringkas 96px - 112px dengan overlay kamera saat di-hover. Cocok untuk upload foto profil pengguna atau logo merchant. |

---

## 📋 Props API (`<FileDropzone />`)

| Prop | Tipe Data | Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `modelValue` | `File` \| `Array` \| `String` \| `Object` | `null` | Nilai file reaktif (*mendukung `v-model`*). Menerima objek File, Array of Files, atau URL string berkas tersimpan. |
| `variant` | `String` | `'dropzone'` | Pilihan varian tata letak: `'dropzone'`, `'grid'`, `'list'`, `'avatar'` |
| `label` | `String` | `''` | Label judul field di atas dropzone |
| `sublabel` | `String` | `''` | Teks keterangan kecil di sisi kanan label atas |
| `hint` | `String` | `''` | Teks panduan pembantu di bawah area dropzone |
| `error` | `String` | `''` | Pesan galat validasi eksternal (otomatis menampilkan alert merah) |
| `placeholder` | `String` | `''` | Teks instruksi utama di dalam area dropzone (misal: "Tarik & seret berkas ke sini") |
| `subtext` | `String` | `''` | Teks info batas ukuran/format di dalam area dropzone |
| `accept` | `String` | `''` | Filter format MIME/ekstensi. Contoh: `'image/*'`, `'.pdf,.docx'`, `'image/*,.pdf'` |
| `multiple` | `Boolean` | `false` | Izinkan pemilihan lebih dari 1 berkas sekaligus |
| `maxSize` | `Number` \| `String` | `null` | Batas ukuran per berkas. Mendukung string mudah: `'2MB'`, `'500KB'`, `'1GB'` atau angka bytes |
| `maxFiles` | `Number` | `null` | Batas maksimum total berkas untuk mode `multiple` |
| `uploading` | `Boolean` | `false` | Mengaktifkan indikator loading progress bar upload |
| `progress` | `Number` | `null` | Persentase unggahan berkas (0 - 100). Jika null, menampilkan pulse animation |
| `required` | `Boolean` | `false` | Menandai field wajib diisi (menampilkan tanda asteris merah `*`) |
| `disabled` | `Boolean` | `false` | Menonaktifkan interaksi klik dan drag-and-drop |

---

## ⚡ Events (`defineEmits`)

| Event | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `update:modelValue` | `(value)` | Dipancarkan saat file baru dipilih, diganti, atau dihapus (*v-model sync*) |
| `change` | `(value)` | Dipancarkan saat terjadi perubahan berkas |
| `error` | `(errorMessage)` | Dipancarkan jika ada berkas yang ditolak karena format tidak sesuai atau melebihi `maxSize` / `maxFiles` |
| `cancel-upload` | `-` | Dipancarkan saat pengguna mengklik tombol "Batal" pada progress bar unggah |

---

## 🧩 Slots

| Nama Slot | Cakupan / Konten |
| :--- | :--- |
| `#label` | Kustomisasi elemen label judul field |
| `#label-right` | Kustomisasi konten di sisi kanan label atas |
| `#hint` | Kustomisasi teks bantuan di bawah dropzone |
| `#footer` | Slot tambahan di bagian paling bawah kontainer |

---

## 💡 Contoh Skenario: Simulasi Unggah Berkas dengan Progress Bar

```vue
<script setup>
import { ref } from 'vue';
import FileDropzone from '@/Components/Pack/FileDropzone.vue';

const documentFile = ref(null);
const isUploading = ref(false);
const uploadProgress = ref(0);

const handleFileSelected = (file) => {
  if (!file) return;

  // Simulasi progress bar upload 0% -> 100%
  isUploading.value = true;
  uploadProgress.value = 15;

  const interval = setInterval(() => {
    uploadProgress.value += 20;
    if (uploadProgress.value >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        isUploading.value = false;
        uploadProgress.value = 0;
      }, 500);
    }
  }, 300);
};

const cancelUpload = () => {
  isUploading.value = false;
  uploadProgress.value = 0;
  documentFile.value = null;
};
</script>

<template>
  <FileDropzone
    v-model="documentFile"
    label="Lampiran Bukti Settlement"
    accept=".pdf,.xlsx,.csv"
    max-size="10MB"
    :uploading="isUploading"
    :progress="uploadProgress"
    @change="handleFileSelected"
    @cancel-upload="cancelUpload"
  />
</template>
```
