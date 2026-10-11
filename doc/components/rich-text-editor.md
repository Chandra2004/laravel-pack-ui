# RichTextEditor Component

Komponen editor teks kaya (*WYSIWYG Rich Text Editor*) kelas enterprise berbasis mesin headless Tiptap v2 (ProseMirror Engine) dan Tailwind CSS dengan pemformatan semantik lengkap, bubble menu kontekstual mengambang, modal tautan & gambar, pembatas karakter cerdas, serta pemisahan arsitektur tegas antara **Mode Editing Aktif**, **Mode Pratinjau (Rendered HTML View)**, dan **Mode Belah Berdampingan (Split View)** dengan simulasi multi-viewport.

---

## 01. Overview

`RichTextEditor` dan pembungkus resminya [RichTextEditorComponent.vue](file:///c:/SPEED/LARAVEL-PACK-UI/resources/js/Components/Pack/RichTextEditorComponent.vue) menyediakan pengalaman penulisan artikel, dokumentasi teknis, dan catatan terstruktur dengan manipulasi DOM yang handal:

- **Mesin Tiptap v2 / ProseMirror**: Menjamin konsistensi struktur dokumen HTML bersih tanpa kode kotor (*dirty tags*) atau anomali peramban.
- **Pemisahan Tegas Editing vs Pratinjau vs Split**:
  - **Mode Editing (`mode="edit"`)**: Mode interaktif pengetikan WYSIWYG dengan bilah alat pemformatan lengkap, bubble menu seleksi teks melayang, dan status bar kuota.
  - **Mode Pratinjau (`mode="preview"`)**: Mode murni peninjauan hasil render HTML yang bebas dari gangguan formulir pengetikan, dilengkapi bilah kontrol pratinjau multi-perangkat (*desktop*, *tablet*, *mobile*), tombol salin kode HTML, dan unduh berkas HTML mandiri.
  - **Mode Belah (`mode="split"`)**: Tata letak dua kolom interaktif berdampingan secara *real-time* (penyuntingan di kolom kiri dan hasil render live di kolom kanan) yang responsif pada desktop dan tablet.
- **Bilah Alat Komprehensif (Top Toolbar)**: Grup alat pemformatan teks (Bold, Italic, Underline, Strike, Code), Heading (H1, H2, H3), Alignment (Kiri, Tengah, Kanan, Rata Kanan-Kiri), Daftar (Bullet, Ordered, Blockquote), Tautan, Sisip Gambar, dan Pengalih Mode Instan.
- **Floating Contextual Bubble Menu**: Menu melayang otomatis di atas teks yang sedang disorot/diseleksi kursor untuk pemformatan instan tanpa perlu menggerakkan mouse ke bilah alat atas.
- **Unggah Berkas Gambar Mandiri**: Mendukung penyematan gambar via URL, berkas lokal (Base64 atau fungsi *async upload handler* kustom), serta mekanisme drag-and-drop dan paste langsung dari papan klip.
- **Mode Layar Penuh (Zen Mode) & Multi-Viewport**: Tampilan penulisan fokus tanpa distraksi dengan tombol pengalih simulasi tampilan perangkat desktop (100%), tablet (768px), dan ponsel (375px).

### 1.1 Apa Entitas Ini

**Vue Component** (Single File Component) yang berlokasi di [RichTextEditor.vue](file:///c:/SPEED/LARAVEL-PACK-UI/resources/js/Components/Pack/RichTextEditor.vue) beserta alias resminya [RichTextEditorComponent.vue](file:///c:/SPEED/LARAVEL-PACK-UI/resources/js/Components/Pack/RichTextEditorComponent.vue). Komponen ini merangkul dependensi Tiptap Core, StarterKit, Underline, Link, Image, TextAlign, dan Placeholder dalam satu antarmuka terpadu berpadu komponen Pack UI (`Card`, `ButtonSubmit`, `InputField`, `Badge`).

### 1.2 Fungsi Utama

- Mengolah masukan artikel berbasis HTML yang terikat dua arah melalui `v-model`.
- Memisahkan tampilan penyuntingan aktif dari peninjauan hasil render HTML bersih secara visual dan terprogram.
- Membatasi kuota panjang tulisan pengguna melalui prop `maxChars` dengan progress bar visual.
- Menyediakan mode hanya-baca (*readonly* / *editable=false*) untuk dokumen perjanjian atau tinjauan kontrak legal.
- Menyediakan API method publik yang kaya via `ref` (`getHTML`, `getText`, `setContent`, `clear`, `setMode`, `setPreviewDevice`, dll).

### 1.3 Kapan Digunakan

- Formulir publikasi artikel blog, siaran pers (*press release*), atau berita portal CMS.
- Editor catatan teknis, laporan insiden DevOps, atau dokumentasi arsitektur perangkat lunak RFC.
- Penyusunan klausul perjanjian hukum, syarat & ketentuan, atau dokumen SLA korporat.
- Kolom korespondensi tiket bantuan pelanggan (*customer support helpdesk*).

### 1.4 Karakteristik Penting

- **Sanitisasi Otomatis**: Menghasilkan tag semantik murni. Jika seluruh teks dihapus, komponen mengembalikan string kosong `''` bukan paragraf kosong `<p></p>`.
- **Dukungan Dark Mode Native**: Seluruh bilah alat, modal popover, kanvas pengetikan, dan bubble menu terintegrasi dengan palet Tailwind `dark:` yang kontras dan nyaman di mata.
- **Pintasan Keyboard Terpadu**: Mendukung tombol kombinasi standar industri (Ctrl+B / Cmd+B untuk tebal, Ctrl+I untuk miring, Ctrl+Z untuk batalkan, dan Esc untuk keluar dari layar penuh).

---

## 02. Preview

> [!TIP]
> Pengujian visual dan showcase interaktif entitas ini tersedia secara native pada rute demo native:
>
> <a href="/demo/rich-text-editor" target="_self" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 8px; background-color: var(--vp-c-brand-1, #4f46e5); color: #ffffff;">Buka Live Demo Komponen RichTextEditor &rarr;</a>

---

## 03. Usage

### Pohon Konsep Penggunaan

```text
RichTextEditor
├── 1. Mode Operasi Utama (prop: mode)
│   ├── 'edit'    -> Mode penyuntingan aktif WYSIWYG (default)
│   ├── 'preview' -> Mode peninjauan render HTML murni tanpa input ketik
│   └── 'split'   -> Mode belah 2 kolom (editor kiri, live render kanan)
├── 2. Kontrol Simulasi Perangkat (prop: previewDevice)
│   ├── 'desktop' -> 100% lebar kontainer (default)
│   ├── 'tablet'  -> 768px lebar simulasi tablet
│   └── 'mobile'  -> 375px lebar simulasi ponsel
├── 3. Status Aksesibilitas & Keamanan
│   ├── editable="true/false" -> Mengizinkan/menutup akses edit di kanvas
│   ├── readonly="true/false" -> Kunci dokumen dengan lencana 'Hanya Baca'
│   └── disabled="true/false" -> Redupkan seluruh komponen (opasitas 50%)
└── 4. Metrik & Pembatas Konten
    ├── maxChars="2500"       -> Kuota karakter maksimum
    └── counterType="both"    -> Konfigurasi penghitung kata/karakter
```

### Sintaks Dasar Single File Component

```vue
<script setup>
import { ref } from 'vue';
import RichTextEditor from '@/Components/Pack/RichTextEditor.vue';

const documentHtml = ref('<h2>Rancangan Arsitektur Microservices</h2><p>Dokumen ini memuat spesifikasi gateway antarlayanan.</p>');
const currentMode = ref('edit'); // 'edit', 'preview', 'split'

function handleModeChange(mode) {
    console.log('Mode editor berganti ke:', mode);
}
</script>

<template>
    <RichTextEditor
        v-model="documentHtml"
        v-model:mode="currentMode"
        label="Uraian Spesifikasi Teknis"
        placeholder="Tuliskan rancangan arsitektur di sini..."
        hint="Gunakan bilah alat atas atau sorot teks untuk format instan"
        color-theme="indigo"
        variant="bordered"
        radius="xl"
        min-height="260px"
        :show-mode-toggle="true"
        :show-char-count="true"
        :show-word-count="true"
        :max-chars="5000"
        @mode-change="handleModeChange"
    />
</template>
```

---

## 04. Anatomy

Arsitektur visual `RichTextEditor` memiliki struktur yang berbeda secara visual tergantung pada mode operasi aktif:

### 4.1 Anatomi Mode Editing (`mode="edit"`)

```text
+-------------------------------------------------------------------------+
| [1] Field Label & Status Wajib (label="Konten Artikel" *)               |
|                                                                         |
| +---------------------------------------------------------------------+ |
| | [2] Top Toolbar Action Bar (RichTextToolbar.vue)                    | |
| |  [B][I][U][S][Code] | [H1][H2][H3] | [Link][Img] | [Edit|View|Split] | |
| +---------------------------------------------------------------------+ |
| |                                                                     | |
| |  [3] Floating Bubble Menu (Muncul otomatis saat teks diblok)        | |
| |       +-----------------------------+                               | |
| |       | [B] [I] [U] [Link] [Code]   |                               | |
| |       +-----------------------------+                               | |
| |                                                                     | |
| |  [4] Editable Content Canvas (Tiptap / ProseMirror EditorContent)   | |
| |      Judul Heading Dokumen                                          | |
| |      Paragraf teks yang dapat diketik dengan format semantik...     | |
| |                                                                     | |
| +---------------------------------------------------------------------+ |
| | [5] Status Bar & Metric Counters                                    | |
| |  42 kata | 318 karakter [========------] 318 / 2500 max             | |
| +---------------------------------------------------------------------+ |
| [6] Hint Text / Error Message ("Batas maksimal penulisan 2500 aksara")  |
+-------------------------------------------------------------------------+
```

### 4.2 Anatomi Mode Pratinjau (`mode="preview"`)

```text
+-------------------------------------------------------------------------+
| [1] Field Label & Status Wajib                                          |
|                                                                         |
| +---------------------------------------------------------------------+ |
| | [2] Preview Control Bar                                             | |
| |  [Kembali ke Editor] | [Desktop][Tablet][Mobile] | [Salin] [Unduh]  | |
| +---------------------------------------------------------------------+ |
| |                                                                     | |
| |  [3] Rendered HTML Viewport (Simulasi Desktop / Tablet / Mobile)    | |
| |      +-------------------------------------------------------+      | |
| |      | Judul Heading Ter-render Sempurna                     |      | |
| |      | Teks artikel tanpa cursor pengetikan...               |      | |
| |      +-------------------------------------------------------+      | |
| |                                                                     | |
| +---------------------------------------------------------------------+ |
| | [4] Status Bar (Mode Pratinjau Aktif - Hanya Tinjauan)              | |
+-------------------------------------------------------------------------+
```

### 4.3 Anatomi Mode Belah (`mode="split"`)

```text
+-------------------------------------------------------------------------+
| +---------------------------------------------------------------------+ |
| | [1] Top Toolbar (Mode Belah Aktif)                [Edit|View|Split] | |
| +---------------------------------------------------------------------+ |
| | [2] Kolom Kiri: Area Edit WYSIWYG | [3] Kolom Kanan: Render Live     | |
| |  <h2>Judul Draft</h2>             |  Judul Draft (Ter-render)        | |
| |  Ketikkan teks di sini...         |  Ketikkan teks di sini...        | |
| +-----------------------------------+---------------------------------+ |
| | [4] Status Bar Terpadu (Live Real-time Sync)                        | |
+-------------------------------------------------------------------------+
```

---

## 05. Variants

Prop `variant` mengatur gaya visual pembungkus bingkai editor:

| Varian | Karakter Tampilan | Skenario Penggunaan |
| :--- | :--- | :--- |
| `bordered` | Garis batas border tegas dengan latar putih/gelap bersih (**Default**) | Formulir entri data standar korporat, dashboard CMS. |
| `default` | Latar belakang transparan dengan garis pemisah minimalis | Penyunting dokumen bergaya Notion atau kanvas tanpa batas. |
| `floating` | Kartu modern melayang dengan bayangan lembut (*soft shadow*) | Modal dialog entri cepat atau panel pembuatan draf popup. |
| `subtle` | Latar pastel lembut dengan batas yang sangat halus | Antarmuka formulir bertingkat dengan latar kontras tinggi. |

---

## 06. Sizes

### Skala Dimensi (`size`)

- **`sm`**: Kanvas padding `p-3 sm:p-4 text-xs`, tinggi default `min-h-44` (176px), bilah status ringkas.
- **`md`**: Kanvas padding `p-4 sm:p-5 text-sm`, tinggi default `min-h-56` (224px) (**Default**).
- **`lg`**: Kanvas padding `p-5 sm:p-6 text-base`, tinggi default `min-h-72` (288px), bilah status lega.

### Batasan Tinggi Kanvas

- `minHeight`: Menentukan tinggi awal minimum kanvas (contoh: `'200px'`, `'320px'`).
- `maxHeight`: Mengatur batas tinggi maksimal sebelum kanvas mengaktifkan bilah gulir (*scroll*) vertikal internal.

---

## 07. States

| State | Indikasi Visual | Perilaku Interaktif |
| :--- | :--- | :--- |
| **Idle** | Bingkai border netral (`border-slate-200 dark:border-slate-800`), toolbar dalam keadaan pasif. | Siap menerima klik kursor pengguna untuk memulai pengetikan. |
| **Focused** | Bingkai border mengadopsi warna aksen tema semantik (`border-indigo-500 ring-1 ring-indigo-500`). | Kursor ketik aktif; bubble menu siap dipicu saat teks disorot. |
| **Editing** | Kanvas pengetikan aktif penuh, toolbar menyala, bubble menu aktif. | Pengguna dapat mengetik, menghapus, dan memformat dokumen. |
| **Previewing** | Bilah pratinjau muncul di atas kanvas; kursor pengetikan dinonaktifkan; kanvas menampilkan HTML ter-render murni. | Teks tidak dapat disunting; pengguna dapat beralih viewport desktop/tablet/mobile, menyalin HTML, atau mengunduh berkas. |
| **Split View** | Kanvas terbagi dua kolom (kiri editor WYSIWYG, kanan pratinjau live). | Perubahan pada kolom editor langsung di-render pada kolom pratinjau seketika. |
| **Readonly** | Bilah toolbar tersembunyi atau terkunci; lencana badge "Hanya Baca" tampil di bilah status. | Teks dapat dibaca dan disalin, masukan pengetikan diblokir total. |
| **Disabled** | Seluruh komponen memudar dengan opasitas 50%; tombol toolbar tidak dapat ditekan. | Komponen tidak merespons interaksi apa pun dan dilewati dalam navigasi Tab. |
| **Quota Exceeded** | Bilah penghitung karakter berubah warna menjadi merah menyala; progress bar 100% penuh. | Memberikan peringatan bahwa panjang konten telah melampaui batas maksimum `maxChars`. |

---

## 08. Props / Attributes

| Nama Prop | Tipe Data | Nilai Bawaan | Opsi / Rentang | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `modelValue` | `String` | `''` | Teks HTML | Konten dokumen berformat HTML dua arah (`v-model`). |
| `mode` | `String` | `'edit'` | `'edit'`, `'preview'`, `'split'` | Mode operasi utama: editing aktif, pratinjau render HTML, atau belah dua kolom berdampingan. |
| `showModeToggle` | `Boolean` | `true` | `true`, `false` | Menampilkan kontrol pengalih mode [Edit \| Pratinjau \| Split] langsung pada toolbar. |
| `readonly` | `Boolean` | `false` | `true`, `false` | Mengunci dokumen dalam mode baca saja dengan indikator lencana "Hanya Baca". |
| `previewDevice` | `String` | `'desktop'` | `'desktop'`, `'tablet'`, `'mobile'` | Simulasi viewport pratinjau: 100% kontainer, 768px tablet, atau 375px ponsel. |
| `counterType` | `String` | `'both'` | `'both'`, `'characters'`, `'words'`, `'none'` | Konfigurasi tampilan penghitung di bilah status bawah. |
| `toolbarSticky` | `Boolean` | `true` | `true`, `false` | Toolbar tetap menempel di atas kontainer saat halaman digulir vertikal. |
| `label` | `String` | `''` | Teks bebas | Label judul di atas editor. |
| `id` | `String` | `''` | String ID DOM | Pengenal unik elemen kanvas editor. |
| `placeholder` | `String` | `'Tuliskan ide...'` | Teks bebas | Teks penampung saat kanvas editor kosong. |
| `colorTheme` | `String` | `'primary'` | `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'` | Palet warna aksen tombol aktif, fokus, dan indikator status. |
| `variant` | `String` | `'bordered'` | `'bordered'`, `'default'`, `'floating'`, `'subtle'` | Varian visual bingkai luar editor. |
| `radius` | `String` | `'lg'` | `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'full'` | Kelengkungan sudut bingkai kontainer dan bilah alat. |
| `size` | `String` | `'md'` | `'sm'`, `'md'`, `'lg'` | Skala ukuran tipografi dan kepadatan kanvas pengetikan. |
| `minHeight` | `String` | `''` | Ukuran CSS (misal `'250px'`) | Batas tinggi fisik minimum kanvas editor. |
| `maxHeight` | `String` | `''` | Ukuran CSS (misal `'600px'`) | Batas tinggi fisik maksimum sebelum konten menggulir. |
| `borderless` | `Boolean` | `false` | `true`, `false` | Menghilangkan garis batas luar bingkai kontainer. |
| `showToolbar` | `Boolean` | `true` | `true`, `false` | Menampilkan atau menyembunyikan bilah alat atas. |
| `showBubbleMenu` | `Boolean` | `true` | `true`, `false` | Mengaktifkan menu format melayang saat teks diseleksi. |
| `showCharCount` | `Boolean` | `true` | `true`, `false` | Menampilkan jumlah karakter di bilah status bawah. |
| `showWordCount` | `Boolean` | `true` | `true`, `false` | Menampilkan jumlah kata di bilah status bawah. |
| `maxChars` | `Number` | `0` | Angka positif (0 = tanpa batas) | Batas maksimum karakter yang diizinkan sebelum memicu status peringatan. |
| `editable` | `Boolean` | `true` | `true`, `false` | Mengatur apakah teks di dalam editor dapat disunting pengguna. |
| `disabled` | `Boolean` | `false` | `true`, `false` | Menonaktifkan seluruh interaksi dan meredupkan tampilan. |
| `required` | `Boolean` | `false` | `true`, `false` | Menampilkan tanda bintang merah pada label kolom formulir. |
| `error` | `String` | `''` | Teks bebas | Pesan kesalahan validasi yang mewarnai border menjadi merah. |
| `hint` | `String` | `''` | Teks bebas | Petunjuk pengisian tambahan di bawah kontainer. |
| `imageUploadHandler` | `Function` | `null` | `async (file: File) => Promise<string>` | Fungsi asinkron penanganan unggah berkas gambar ke server/S3. |

---

## 09. Slots

| Nama Slot | Properti yang Disediakan | Deskripsi Penggunaan |
| :--- | :--- | :--- |
| `#label` | `{ label: String, required: Boolean }` | Mengambil alih tampilan elemen judul label formulir di atas editor. |
| `#toolbar-extra` | `{ editor: Object, isEditable: Boolean, mode: String, previewDevice: String }` | Menyematkan tombol tindakan kustom tambahan pada bilah alat atas (misal: tombol AI Generator, template). |
| `#footer-extra` | `{ editor: Object, charCount: Number, wordCount: Number, maxCharacters: Number, isLimitExceeded: Boolean }` | Menyematkan informasi atau tombol aksi tambahan pada bilah status bawah. |
| `#hint` | `{ hint: String }` | Kustomisasi tampilan teks petunjuk bantuan di bawah editor. |
| `#error` | `{ error: String }` | Kustomisasi tampilan pesan kesalahan validasi di bawah editor. |

---

## 10. Events / Interactions

### Event yang Dipancarkan (Emits)

| Nama Event | Parameter Emitted | Waktu Pemicuan (Trigger Lifecycle) |
| :--- | :--- | :--- |
| `@update:modelValue` | `(html: String)` | Dipancarkan saat pengguna mengetik atau memformat konten di kanvas. |
| `@update:mode` | `(mode: String)` | Dipancarkan saat mode operasi berubah (dua arah via `v-model:mode`). |
| `@update:previewDevice` | `(device: String)` | Dipancarkan saat simulasi perangkat pratinjau diubah. |
| `@mode-change` | `(mode: String)` | Dipancarkan saat mode beralih antara `'edit'`, `'preview'`, dan `'split'`. |
| `@change` | `(html: String)` | Dipancarkan saat isi dokumen HTML berubah. |
| `@focus` | — | Dipancarkan saat kursor pengguna masuk dan memfokuskan kanvas editor. |
| `@blur` | — | Dipancarkan saat kursor pengguna keluar dan editor kehilangan fokus. |
| `@image-uploaded` | `(url: String)` | Dipancarkan saat berkas gambar berhasil disematkan ke dalam kanvas. |

### API Publik yang Diekspos (`defineExpose`)

Melalui `ref="editorRef"` pada komponen, induk dapat memanggil fungsi dan properti publik berikut:

| Method / Property | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `editor` | `Object` | Mengembalikan instance inti ProseMirror/Tiptap `Editor`. |
| `getHTML()` | `() => String` | Mengambil seluruh isi dokumen dalam format string HTML semantik. |
| `getRawHTML()` | `() => String` | Mengambil string kode HTML dokumen langsung dari textarea raw source. |
| `getText()` | `() => String` | Mengambil isi dokumen sebagai teks biasa murni (*plain text*). |
| `setContent(html)` | `(html: String) => void` | Mengganti seluruh isi editor secara terprogram. |
| `clear()` | `() => void` | Mengosongkan seluruh konten dokumen. |
| `clearFormatting()` | `() => void` | Menghapus seluruh format tebal, miring, garis bawah pada teks terpilih. |
| `openLinkDialog()` | `() => void` | Membuka modal dialog penyematan tautan link secara terprogram. |
| `openImageDialog()` | `() => void` | Membuka modal dialog penyematan berkas atau URL gambar. |
| `setMode(mode)` | `(mode: 'edit' \| 'preview' \| 'split') => void` | Mengalihkan mode tampilan secara langsung. |
| `setPreviewDevice(device)` | `(device: 'desktop' \| 'tablet' \| 'mobile') => void` | Mengubah lebar simulasi perangkat pratinjau. |
| `togglePreview()` | `() => void` | Beralih antara mode `'edit'` dan `'preview'`. |
| `toggleFullscreen()` | `() => void` | Mengaktifkan atau keluar dari mode Zen Fullscreen. |
| `copyHtml()` | `() => void` | Menyalin string HTML dokumen langsung ke papan klip (*clipboard*). |
| `downloadHtml()` | `() => void` | Mengunduh konten dokumen sebagai berkas `document-preview.html`. |
| `mode` | `Ref<String>` | State reaktif mode yang sedang aktif (`'edit'`, `'preview'`, `'split'`). |
| `previewDevice` | `Ref<String>` | State reaktif lebar viewport pratinjau (`'desktop'`, `'tablet'`, `'mobile'`). |
| `showRawPanel` | `Ref<Boolean>` | State reaktif penampil panel kode HTML mentah (*raw source*). |

---

## 11. Code Example

### 11.1 Integrasi Formulir Publikasi dengan Pengalih Mode

```vue
<script setup>
import { ref } from 'vue';
import RichTextEditor from '@/Components/Pack/RichTextEditor.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const title = ref('Pembaruan Kebijakan Keamanan Data 2026');
const content = ref('<h2>1. Ringkasan Kebijakan</h2><p>Pemberlakuan enkripsi AES-256 pada seluruh repositori transaksi.</p>');
const mode = ref('edit'); // 'edit', 'preview', 'split'

function switchMode(newMode) {
    mode.value = newMode;
}
</script>

<template>
    <div class="max-w-5xl mx-auto p-6 space-y-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 class="text-base font-bold text-slate-800 dark:text-slate-100">Editor Publikasi Berita</h2>
            <div class="flex items-center gap-2">
                <ButtonSubmit
                    :variant="mode === 'edit' ? 'primary' : 'ghost'"
                    size="xs"
                    @click="switchMode('edit')"
                >
                    Penyuntingan
                </ButtonSubmit>
                <ButtonSubmit
                    :variant="mode === 'preview' ? 'primary' : 'ghost'"
                    size="xs"
                    @click="switchMode('preview')"
                >
                    Pratinjau HTML
                </ButtonSubmit>
                <ButtonSubmit
                    :variant="mode === 'split' ? 'primary' : 'ghost'"
                    size="xs"
                    @click="switchMode('split')"
                >
                    Mode Belah
                </ButtonSubmit>
            </div>
        </div>

        <RichTextEditor
            v-model="content"
            v-model:mode="mode"
            label="Isi Konten Publikasi"
            placeholder="Tuliskan isi draf artikel resmi..."
            color-theme="indigo"
            variant="bordered"
            radius="xl"
            min-height="280px"
            :show-mode-toggle="true"
            :max-chars="5000"
        />
    </div>
</template>
```

---

## 12. Result / Behavior

1. **Struktur Tag Semantik Konsisten**: Editor memastikan format heading menggunakan tag `<h1>`, `<h2>`, `<h3>` yang valid, daftar belanja menggunakan `<ul>` dan `<ol>`, kutipan menggunakan `<blockquote>`, serta tautan berjangkar `<a>` yang dilengkapi pengaman `rel="noopener noreferrer"`.
2. **Pemisahan Mode yang Jelas**: Pada mode pratinjau (`mode="preview"`), bilah format toolbar digantikan oleh bilah kontrol pratinjau yang menampilkan simulasi layar perangkat dan aksi salin/unduh HTML murni.
3. **Penyelamatan Fokus Layar Penuh (Zen Mode)**: Menekan tombol keyboard `Escape` saat berada di mode layar penuh akan langsung mengembalikan editor ke tampilan tata letak normal tanpa merusak kursor pengetikan.
4. **Kalkulasi Kuota Real-Time**: Penghitung kata dan karakter beroperasi tanpa jeda (*zero lag*) memanfaatkan event transaksi internal ProseMirror.

---

## 13. Customization

### Menambahkan Tombol Snippet AI pada Bilah Alat Atas

```vue
<template>
    <RichTextEditor v-model="content">
        <template #toolbar-extra="{ editor }">
            <button
                type="button"
                @click="editor.commands.insertContent('<p class=\'bg-indigo-50 p-3 rounded\'>Catatan penting...</p>')"
                class="px-2 py-1 text-xs rounded bg-indigo-50 text-indigo-600 font-semibold hover:bg-indigo-100"
            >
                + Callout Box
            </button>
        </template>
    </RichTextEditor>
</template>
```

---

## 14. Accessibility

- **Atribut ARIA pada Bilah Alat**: Seluruh tombol formatting dilengkapi atribut `title` dan `aria-label` yang menerangkan fungsinya (contoh: "Tebal (Ctrl+B)", "Heading 2").
- **Modal Popover Terisolasi**: Dialog penyematan tautan (Link Modal) dan gambar (Image Modal) menerapkan penjebakan fokus (*focus trapping*) dan dapat ditutup menggunakan tombol keyboard `Escape`.
- **Dukungan Screen Reader**: Teks placeholder dan indikator required dikonfigurasi agar ramah bagi pembaca layar tanpa menghasilkan kebisingan fonetik yang berulang.

---

## 15. Responsive Behavior

- **Mobile Viewport (< 640px)**:
  - Tombol-tombol pada bilah toolbar membungkus rapi (*flex-wrap*) dengan ukuran sentuh minimal 36x36px.
  - Mode belah (*split*) otomatis jatuh menjadi tumpukan vertikal (*stacked*) sehingga pengguna tetap dapat menyunting dan meninjau dengan nyaman.
  - Menu melayang (*bubble menu*) otomatis mendeteksi batas layar ponsel dan tidak pernah terpotong ke luar layar.
- **Tablet Viewport (640px - 1024px)**:
  - Kanvas editor memanfaatkan lebar layar secara proporsional.
  - Mode belah (*split*) menampilkan dua kolom seimbang 50%:50% dengan garis pemisah yang rapi.
  - Bilah status bawah menampilkan metrik kata, karakter, dan persentase kuota secara penuh.
- **Desktop Viewport (>= 1024px)**:
  - Akses instan ke fitur Zen Fullscreen Mode, kontrol pengalih mode terpadu [Edit \| Pratinjau \| Split], dan simulasi viewport perangkat lengkap.

---

## 16. Do / Don't

| Do (Praktik Direkomendasikan) | Don't (Praktik Dihindari) |
| :--- | :--- |
| **Gunakan `mode="split"` untuk dokumentasi teknis**: Memungkinkan penulis melihat langsung hasil kompilasi HTML/markdown saat mengetik. | **Jangan gunakan mode edit biasa jika hanya untuk menampilkan dokumen**: Gunakan `mode="preview"` atau `readonly="true"`. |
| **Gunakan `imageUploadHandler` asinkron untuk produksi**: Unggah berkas ke server atau Cloud Storage untuk mencegah dokumen membengkak akibat string Base64 raksasa. | **Jangan biarkan gambar lokal tersimpan sebagai Base64 di basis data**: Mengakibatkan ukuran kolom teks basis data meledak dan memperlambat waktu muat halaman. |
| **Atur `minHeight` yang memadai**: Berikan ruang awal pengetikan yang lapang (minimal `200px`) agar pengguna nyaman menyusun artikel. | **Jangan menyembunyikan bilah toolbar jika pengguna awam**: Pengguna kasual memerlukan tombol visual untuk memformat teks. |
| **Gunakan `maxChars` saat ada batasan kolom database**: Berikan batas transparan sebelum formulir gagal divalidasi oleh server. | **Jangan memasang editor teks kaya untuk input satu baris sederhana**: Gunakan komponen `InputField` biasa untuk input singkat. |

---

## 17. Examples / Recipes

### Recipe 1: Mode Belah Berdampingan untuk Dokumentasi Teknis

```vue
<script setup>
import { ref } from 'vue';
import RichTextEditor from '@/Components/Pack/RichTextEditor.vue';

const techDocs = ref('<h2>Arsitektur Layanan Auth</h2><p>Layanan ini menggunakan JWT dengan waktu kadaluarsa 15 menit.</p>');
</script>

<template>
    <RichTextEditor
        v-model="techDocs"
        mode="split"
        color-theme="indigo"
        variant="bordered"
        radius="xl"
        min-height="300px"
        :toolbar-sticky="true"
    />
</template>
```

### Recipe 2: Pratinjau Klausul Kontrak Hukum (Readonly + Preview)

```vue
<script setup>
import { ref } from 'vue';
import RichTextEditor from '@/Components/Pack/RichTextEditor.vue';

const contractText = ref('<h4>Pasal 4: Hak & Kewajiban</h4><p>Penyedia layanan berhak melakukan pemeliharaan server berkala...</p>');
</script>

<template>
    <RichTextEditor
        v-model="contractText"
        mode="preview"
        :readonly="true"
        preview-device="tablet"
        variant="subtle"
        radius="lg"
    />
</template>
```

---

## 18. Related Components

- [InputField](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/input-field.md): Komponen masukan teks satu baris standar untuk judul atau atribut dokumen.
- [ButtonSubmit](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/button-submit.md): Tombol publikasi dan pengiriman formulir artikel dengan status loading asinkron.
- [Card](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/card.md): Kartu pembungkus konten yang digunakan dalam tata letak editor dan playground.
- [Badge](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/badge.md): Lencana status untuk menampilkan kategori draf atau status publikasi artikel.

---

## 19. Notes / Limitations

- **Dependensi Tiptap Core**: Komponen ini memerlukan paket `@tiptap/vue-3` dan ekstensi pendukung (`@tiptap/starter-kit`, `@tiptap/extension-underline`, `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/extension-text-align`, `@tiptap/extension-placeholder`). Pastikan dependensi tersebut terpasang di `package.json`.
- **Sanitisasi Server-Side**: Meskipun Tiptap menghasilkan struktur dokumen yang terstandar, aplikasi backend Laravel tetap wajib membersihkan konten HTML menggunakan HTML Purifier sebelum menyimpannya ke basis data publik.
