# 📝 RichTextEditor Component (`RichTextEditor.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen editor teks kaya (*WYSIWYG Rich Text Editor*) enterprise bertenaga **Tiptap v2 (ProseMirror Engine)** yang dirancang dengan estetika **modern minimalis** (ala Notion/Substack/Linear), taat terhadap spesifikasi plugin Tiptap, mendukung **unggah berkas gambar lokal** (selain tautan URL), drag & drop / paste gambar langsung ke kanvas, serta dilengkapi **fitur pratinjau interaktif multi-perangkat**.

---

## 🎨 5 Pilar Kustomisasi Terapan

1. **Warna (`colorTheme`)**:
   - Pilihan: `'primary'` (Blue), `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'`.
   - Diterapkan konsisten pada tombol aktif toolbar (*soft-tint* elegan), floating bubble menu, cincin fokus editor, link teks, dan indikator status.
2. **Bentuk & Gaya (`radius`, `variant`, `size`)**:
   - **Radius**: `'none'`, `'sm'`, `'md'`, `'lg'` (default), `'xl'`, `'full'`.
   - **Varian Kontur (`variant`)**:
     - `'bordered'`: Border tegas dengan kontras optimal (default).
     - `'default'`: Border klasik tipis dengan bayangan halus.
     - `'floating'`: Kartu melayang berkontur elevasi dengan bayangan medium.
     - `'subtle'`: Latar belakang bernuansa lembut (*tinted canvas*).
   - **Ukuran (`size`)**:
     - `'sm'`: Kompak (*padding* ringkas, font 12px, tinggi minimal 176px).
     - `'md'`: Standar (*padding* proporsional, font 14px, tinggi minimal 224px).
     - `'lg'`: Luas (*padding* leluasa, font 16px, tinggi minimal 288px).
3. **Teks Konten**:
   - Mendukung label input, petunjuk (*hint*), pesan error validasi, teks placeholder, batas karakter, serta slot kustom (`#label`, `#hint`, `#error`, `#toolbar-extra`, `#footer-extra`).
4. **Ikon**:
   - Google Material Symbols didukung penuh pada toolbar, menu popover, dan dialog modal dengan ukuran yang berskala otomatis mengikuti prop `size`.
5. **Responsif**:
   - Toolbar terstruktur rapi dengan tata letak fleksibel di layar ponsel.
   - Fitur pratinjau dilengkapi simulator multi-viewport (Desktop, Tablet 768px, dan Ponsel 375px).
   - Mode Layar Penuh (*Zen Focus Mode*) responsif dengan penutupan via tombol `Esc`.

---

## 🖼️ Fitur Unggah & Penanganan Berkas Gambar

Komponen ini mendukung penyisipan gambar melalui 3 cara:
1. **Modal Dialog Unggah Berkas**:
   - Tab **Unggah Berkas**: Drag-and-drop file dropzone atau klik untuk memilih file dari komputer (PNG, JPG, WebP, GIF, SVG maks 10MB). Dilengkapi pratinjau instan, informasi ukuran berkas, tombol ganti gambar, dan input alt text.
   - Tab **Tautan URL**: Masukkan URL eksternal gambar seperti biasa.
2. **Drag-and-Drop Langsung ke Kanvas Editor**:
   - Tarik satu atau beberapa file gambar dari komputer Anda dan lepaskan langsung ke area pengetikan editor Tiptap.
3. **Paste Gambar dari Clipboard (Ctrl + V)**:
   - Salin gambar (atau tangkapan layar / screenshot) dan tekan Ctrl+V di editor; gambar akan otomatis diproses dan disisipkan.

### Konfigurasi Backend Upload (`imageUploadHandler`):
Secara default, jika Anda tidak menyertakan handler, gambar otomatis dikonversi menjadi **Base64 Data URL** (`FileReader.readAsDataURL`) sehingga langsung dapat disimpan dan ditampilkan tanpa konfigurasi backend.

Jika Anda ingin mengunggah file ke backend Laravel Storage / S3 / Cloudinary, cukup operkan prop `imageUploadHandler`:

```vue
<script setup>
import { ref } from 'vue';
import RichTextEditor from '@/Components/Pack/RichTextEditor.vue';

const content = ref('');

// Handler upload kustom ke backend Laravel
const handleCustomImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/uploads/image', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        }
    });

    const data = await response.json();
    return data.url; // Kembalikan string URL publik gambar
};
</script>

<template>
  <RichTextEditor
    v-model="content"
    :image-upload-handler="handleCustomImageUpload"
  />
</template>
```

---

## 👁️ Fitur Pratinjau Interaktif (Preview Mode)

Mode pratinjau dapat diakses kapan saja melalui tombol **Pratinjau** di pojok kanan toolbar:
- **Simulasi 3 Viewport**:
  - 🖥️ **Desktop**: Lebar penuh 100%.
  - 📱 **Tablet**: Frame terisolasi 768px.
  - 📲 **Ponsel**: Bingkai ponsel dengan notch bergaya iOS (375px).
- **Aksi Cepat Ekspor**:
  - **Salin HTML**: Menyalin string markup HTML bersih langsung ke clipboard.
  - **Unduh HTML**: Mengunduh draf dokumen mandiri dalam berkas `.html`.

---

## 📋 Props API (`<RichTextEditor />`)

| Prop | Tipe Data | Default | Pilihan Nilai / Keterangan |
| :--- | :--- | :--- | :--- |
| `modelValue` | `String` | `''` | Konten HTML yang terikat dua arah (*v-model*) |
| `label` | `String` | `''` | Label teks di atas editor |
| `placeholder` | `String` | `'Tuliskan ide...'` | Teks placeholder saat editor kosong |
| `error` | `String` | `''` | Pesan error validasi form (*misal dari `$page.props.errors`*) |
| `hint` | `String` | `''` | Pesan petunjuk di bawah editor |
| `required` | `Boolean` | `false` | Menampilkan tanda bintang merah (*) pada label |
| `disabled` | `Boolean` | `false` | Menonaktifkan interaksi editor dan toolbar |
| `editable` | `Boolean` | `true` | Menentukan apakah teks dapat diedit (*false* untuk read-only) |
| `colorTheme` | `String` | `'primary'` | `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'` |
| `radius` | `String` | `'lg'` | `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'full'` |
| `variant` | `String` | `'bordered'` | `'default'`, `'bordered'`, `'floating'`, `'subtle'` |
| `size` | `String` | `'md'` | `'sm'`, `'md'`, `'lg'` |
| `minHeight` | `String` | `''` | Ketinggian minimal custom (misal `'min-h-80'`) |
| `maxHeight` | `String` | `''` | Batas ketinggian maksimal dengan scroll vertikal |
| `borderless` | `Boolean` | `false` | Menghilangkan garis tepi kontainer |
| `showToolbar` | `Boolean` | `true` | Menampilkan bilah toolbar atas |
| `showBubbleMenu`| `Boolean` | `true` | Menampilkan floating contextual bubble menu saat teks disorot |
| `showCharCount` | `Boolean` | `true` | Menampilkan penghitung karakter di status bar bawah |
| `showWordCount` | `Boolean` | `true` | Menampilkan penghitung kata di status bar bawah |
| `maxChars` | `Number` | `0` | Batas maksimal karakter (dengan progress bar otomatis jika > 0) |
| `imageUploadHandler` | `Function` | `null` | Fungsi async kustom `(file: File) => Promise<string>` |

---

## ⚡ Events API (`defineEmits`)

| Event | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `update:modelValue` | `(html: String)` | Dipancarkan setiap kali konten HTML diperbarui (*v-model sync*) |
| `change` | `(html: String)` | Dipancarkan saat konten selesai diedit |
| `focus` | `-` | Dipancarkan saat editor menerima fokus kursor |
| `blur` | `-` | Dipancarkan saat kursor keluar dari editor |
| `image-uploaded` | `({ file, src })` | Dipancarkan saat gambar berhasil disisipkan |

---

## 🪟 Slots API

| Slot Name | Deskripsi |
| :--- | :--- |
| `#label` | Kustomisasi elemen label input |
| `#hint` | Kustomisasi teks petunjuk di bawah editor |
| `#error` | Kustomisasi tampilan pesan validasi error |
| `#toolbar-extra` | Menyisipkan tombol aksi kustom di sisi kanan toolbar |
| `#footer-extra` | Menyisipkan metadata tambahan di bilah status bawah |

---

## 🔧 Exposed Methods (`defineExpose`)

Akses instance inti Tiptap dan fungsi helper melalui template ref:

```javascript
const editorRef = ref(null);

// Buka dialog gambar secara programatis
editorRef.value?.openImageDialog();

// Buka dialog tautan web
editorRef.value?.openLinkDialog();

// Beralih mode pratinjau / layar penuh
editorRef.value?.togglePreview();
editorRef.value?.toggleFullscreen();

// Bersihkan format teks
editorRef.value?.clearFormatting();

// Salin / Unduh HTML
editorRef.value?.copyHtml();
editorRef.value?.downloadHtml();

// Akses Tiptap instance langsung
editorRef.value?.editor.commands.focus();
```
