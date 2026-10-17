# DragDrop Component

Komponen interaktif drag-and-drop serbaguna untuk ekosistem Laravel Inertia Vue 3 dan Tailwind CSS. Dibuat murni menggunakan API bawaan web standar (zero external dependency) sehingga ringan, berkinerja tinggi, dan stabil. Mendukung pengurutan satu dimensi (Sortable List), penataan kisi responsif (Grid Reorder), serta papan kerja multi-kolom (Enterprise Kanban Board) dengan dukungan perangkat sentuh (touch/mobile).

---

## 01. Overview

`DragDrop.vue` menyediakan solusi pengurutan data drag-and-drop yang menyeluruh tanpa memerlukan dependensi eksternal seperti `SortableJS` atau `vuedraggable`.

### 1.1 Apa Entitas Ini
Komponen Vue 3 berbasis Composition API (`packages/laravel-pack-ui/resources/js/Components/Pack/DragDrop.vue`) yang mengelola status urutan array data secara reaktif menggunakan HTML5 Drag and Drop API dan fallback pointer/touch events.

### 1.2 Fungsi Utama
- Mengurutkan daftar item satu dimensi secara vertikal maupun horizontal (*list reordering*).
- Menyusun ulang kartu atau widget dalam tata letak kisi (*responsive grid reordering*).
- Mengelola papan kerja multi-kolom (*Kanban Board*) dengan kemampuan pemindahan item lintas kolom (*cross-column transfer*).
- Menghadirkan animasi pergeseran halus berbasis teknik FLIP (*First-Last-Invert-Play*) melalui `<TransitionGroup>`.
- Mengisolasi penarikan hanya melalui ikon pegangan (*drag handle*) untuk mencegah konflik seleksi teks atau input form.

### 1.3 Kapan Digunakan
- Pada penyusun formulir (*form builder*) untuk mengatur urutan pertanyaan atau kolom input.
- Pada modul manajemen proyek (*project management*) untuk menggeser status tugas dari backlog, in progress, hingga selesai.
- Pada galeri media untuk menyusun urutan tampilan foto produk atau banner promosi.
- Pada bilah navigasi atau dashboard untuk menyesuaikan susunan widget metrik analitik.

### 1.4 Karakteristik Penting
- **Zero External Dependencies**: Mengeliminasi beban ukuran bundel (*bundle size*) pustaka pihak ketiga dengan memanfaatkan API peramban standar.
- **Hardware-Accelerated FLIP Transitions**: Menggunakan translasi CSS murni (`transform: translate(...)`) untuk menghasilkan pergeseran kartu 60 FPS tanpa memicu reflow layout yang berat.
- **Smart Touch Fallback**: Mendukung perangkat layar sentuh ponsel dan tablet melalui listener touch manual terkalibrasi.

---

## 02. Preview

> [!TIP]
> Pengujian visual dan showcase interaktif entitas ini tersedia secara native pada portal pratinjau aplikasi:
>
> Rute Showcase: `/demo/drag-drop` atau `/preview/drag-drop`

---

## 03. Usage

### Pohon Konsep Penggunaan

```text
DragDrop
├── 4 Mode Operasional
│   ├── list (Daftar berurutan satu dimensi, vertikal atau horizontal)
│   ├── grid (Kisi multi-kolom responsif untuk galeri atau widget)
│   ├── kanban (Papan kerja multi-kolom dengan perpindahan lintas status)
│   └── transfer (Dua daftar berpasangan dengan pencarian dan transfer massal)
├── Gaya Visual Kartu (cardVariant)
│   ├── bordered, flat, glass, elevated, glow, pills, gradient, brutalist, default
│   ├── radius (default, none, sm, md, lg, xl, full)
│   └── size (xs, sm, md, lg, xl) + dense: true/false
├── Tema Warna Semantik (colorTheme)
│   └── primary, indigo, emerald, purple, amber, rose, cyan, dark
└── Pengendali Penarikan & Aksesibilitas
    ├── handle: true (Penarikan via grip icon)
    ├── handlePosition (left, right)
    └── WAI-ARIA Keyboard Navigation (Space/Enter/Arrows/Escape)
```

### Matriks Kapan Digunakan vs Dihindari

| Kasus Penggunaan | Gunakan DragDrop | Hindari (Gunakan Alternatif) |
|---|---|---|
| Mengurutkan baris data atau prioritas tugas | Ya (`mode="list"`) | Jangan gunakan tombol panah naik/turun yang kaku |
| Papan sprint proyek (To Do / In Progress / Done) | Ya (`mode="kanban"`) | Hindari manipulasi array manual tanpa animasi |
| Area unggah berkas dari komputer pengguna | Tidak | Gunakan FileDropzone |
| Pengurutan tabel data besar (> 1000 baris) | Tidak | Gunakan Pagination atau sorting kolom SQL pada Table |

### Contoh Penggunaan Cepat

```vue
<script setup>
import { ref } from 'vue';
import DragDrop from '@/Components/Pack/DragDrop.vue';

const tasks = ref([
  { id: '1', title: 'Audit Keamanan Token JWT', badge: 'Critical' },
  { id: '2', title: 'Refaktor Komponen Dropdown', badge: 'High' },
  { id: '3', title: 'Optimasi Kueri PostgreSQL', badge: 'Medium' },
]);
</script>

<template>
  <DragDrop
    v-model="tasks"
    mode="list"
    :handle="true"
    card-variant="bordered"
  >
    <template #item="{ item, index }">
      <div class="flex items-center justify-between w-full">
        <span class="font-bold text-slate-800 dark:text-slate-100">{{ item.title }}</span>
        <span class="text-xs text-slate-400 font-mono">#{{ index + 1 }}</span>
      </div>
    </template>
  </DragDrop>
</template>
```

---

## 04. Anatomy

### Diagram Struktur Anatomi

```text
1. Mode List / Grid:
+--------------------------------------------------------------+
| [Grip Handle (Left)]  Item Content Text / Badge              |
| (drag_indicator)      Audit Keamanan Token JWT    [Critical] |
+--------------------------------------------------------------+
| [Drop Indicator Bar: Garis biru pulsing di antara kartu]     |
+--------------------------------------------------------------+
| [Grip Handle (Left)]  Refaktor Komponen Dropdown      [High] |
+--------------------------------------------------------------+

2. Mode Kanban Board:
+--------------------------+  +--------------------------+
| KOLOM: TO DO         [2] |  | KOLOM: IN PROGRESS   [1] |
+--------------------------+  +--------------------------+
| [Grip] Kartu Tugas 1     |  | [Grip] Kartu Tugas 3     |
|        Riset API         |  |        Implementasi DND  |
| [Grip] Kartu Tugas 2     |  +--------------------------+
|        Dokumentasi       |  | [Dropzone Kosong / Slot] |
+--------------------------+  +--------------------------+
```

### Komponen Anatomi Rinci
1. **Container Wrapper (`<TransitionGroup>`)**: Kontainer flex atau grid dengan kelas animasi FLIP untuk perhitungan pergeseran koordinat otomatis.
2. **Draggable Card Shell**: Kartu pembungkus item yang membawa atribut `draggable="true"` serta listener drag-and-drop.
3. **Drop Indicator Bar**: Garis horizontal atau vertikal biru berpendar (*pulsing bar*) yang menandai lokasi pasti penyisipan kartu baru sebelum dilepaskan.
4. **Drag Handle Grip**: Ikon pegangan `drag_indicator` untuk memicu aksi seret tanpa mengganggu interaksi elemen anak di dalam kartu.
5. **Scoped Item Slot (`#item`)**: Area templat bebas bagi pengembang untuk merender teks judul, deskripsi, avatar penanggung jawab, atau tombol aksi.
6. **Kanban Column Shell**: Kontainer kolom vertikal yang memuat header nama kolom, penghitung jumlah item (*counter badge*), daftar kartu, dan placeholder dropzone saat kolom kosong.

---

## 05. Variants

### Tabel Mode Tata Letak (`mode`)

| Nama Nilai | Kapan Dipakai | Ringkasan Visual |
|---|---|---|
| `list` | Susunan daftar satu dimensi (urutan tugas, playlist, navigasi) | Kartu tersusun berbaris vertikal atau horizontal dalam satu kolom |
| `grid` | Galeri foto, kartu portofolio, dashboard widget | Kartu tersusun dalam kisi multi-kolom responsif (1 hingga 6 kolom) |
| `kanban` | Alur kerja sprint manajemen proyek (multi-kolom) | Beberapa kolom paralel dengan perpindahan kartu bebas antar kolom |
| `transfer` | Pemilihan dan pemindahan item antara dua daftar berpasangan | Dua daftar bersanding dengan kontrol pemindahan dan kotak pencarian |

### Tabel Gaya Permukaan Kartu (`cardVariant`)

| Nama Nilai | Kapan Dipakai | Ringkasan Visual |
|---|---|---|
| `bordered` | Antarmuka dasbor administratif terstruktur | Latar solid dengan garis tepi border tegas dan bayangan halus |
| `flat` | Sidebar sempit atau modal dialog ringkas | Latar abu-abu datar bersih tanpa garis tepi border |
| `glass` | Tema gelap modern dengan latar belakang visual kaya | Permukaan semi-transparan dengan efek blur kaca (*backdrop-blur-md*) |
| `elevated` | Kartu yang perlu tampil menonjol dari latar belakang | Efek bayangan mengambang (*box-shadow*) dengan transisi hover |
| `glow` | Menonjolkan item aktif atau bertema futuristik | Garis tepi dan bayangan beraksen pendaran neon lembut |
| `pills` | Filter tag atau chip kategori ringkas | Sudut membulat penuh menyerupai kapsul (*rounded-full*) |
| `gradient` | Kartu prioritas tinggi atau tampilan presentasi | Gradasi warna halus dari latar belakang menuju aksen semantik |
| `brutalist` | Desain tren neo-brutalism dengan kontras tinggi | Garis border hitam tebal 2px dengan bayangan solid tegas |
| `default` | Tampilan minimalis bawaan netral | Garis tepi tipis standar tanpa efek visual tambahan |

### Tema Warna Semantik (`colorTheme`)
Mengatur warna garis indikator penempatan drop bar, cincin fokus ghost saat kartu diseret, serta highlight kolom Kanban. Tersedia 8 opsi: `primary`, `indigo`, `emerald`, `purple`, `amber`, `rose`, `cyan`, dan `dark`.

---

## 06. Sizes

### Skala Dimensi Kartu (`size`)
| Nilai Prop | Padding Dalam | Ukuran Font Utama | Radius Sudut | Ukuran Ikon Grip |
|---|---|---|---|---|
| `xs` | `p-2` | `text-xs` (11px) | `rounded-lg` (8px) | `text-xs` (14px) |
| `sm` | `p-2.5` | `text-xs` (12px) | `rounded-xl` (12px) | `text-sm` (16px) |
| `md` | `p-3.5` | `text-sm` (14px) | `rounded-xl` (12px) | `text-base` (20px) |
| `lg` | `p-4` | `text-base` (16px) | `rounded-2xl` (16px) | `text-lg` (24px) |
| `xl` | `p-5` | `text-lg` (18px) | `rounded-2xl` (16px) | `text-xl` (28px) |

### Kolom Grid Responsif (`columns`)
Pada `mode="grid"`, prop `columns` mengontrol pembagian lajur pada layar desktop:
- `1`: `grid-cols-1`
- `2`: `grid-cols-1 sm:grid-cols-2`
- `3`: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3` (default)
- `4`: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- `5`: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5`
- `6`: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6`

---

## 07. States

- **Normal / Idle State**: Kartu berada dalam posisi diam dengan kursor grab aktif pada drag handle.
- **Dragging / Ghost State**: Kartu yang sedang ditarik kursor mengalami reduksi opasitas (`opacity-35`), pembesaran skala mikro, bayangan mengambang, serta rotasi ringan 1 derajat untuk memberikan sensasi fisik tarikan gravitasi.
- **Drop Target Active State**: Garis indikator biru menyala dengan animasi denyut pulse di atas (*before*) atau di bawah (*after*) kartu target.
- **Disabled State**: Interaksi penarikan dinonaktifkan (`draggable="false"`), kursor kembali ke default, dan event drag dibatalkan.
- **Empty Dropzone State**: Ditampilkan saat kontainer atau kolom Kanban belum memiliki item, berupa area garis putus-putus (*dashed border*) yang siap menerima item drop.

---

## 08. Props / Attributes

| Prop | Tipe Data | Default | Keterangan |
|---|---|---|---|
| `modelValue` | `Array \| Object` | `[]` | Array data item (mode list/grid), array kolom (mode kanban), atau objek transfer. Mendukung `v-model`. |
| `mode` | `String` | `'list'` | Pilihan mode: `'list'`, `'grid'`, `'kanban'`, `'transfer'` |
| `direction` | `String` | `'vertical'` | Orientasi susunan mode list: `'vertical'` atau `'horizontal'` |
| `columns` | `Number \| String` | `3` | Jumlah kolom pada mode grid (`1`, `2`, `3`, `4`, `5`, `6`) |
| `kanbanColumns` | `Number \| String` | `'auto'` | Konfigurasi pembagian kolom grid pada mode kanban ('auto', 2, 3, 4, 5) |
| `itemKey` | `String` | `'id'` | Kunci properti pengenal unik pada masing-masing item objek data |
| `handle` | `Boolean` | `true` | Membatasi aksi drag hanya dapat dimulai melalui penekanan ikon grip handle |
| `handlePosition` | `String` | `'left'` | Posisi ikon drag handle pada kartu: `'left'` atau `'right'` |
| `cardVariant` | `String` | `'bordered'` | 9 varian gaya: `'bordered'`, `'flat'`, `'glass'`, `'elevated'`, `'glow'`, `'pills'`, `'gradient'`, `'brutalist'`, `'default'` |
| `colorTheme` | `String` | `'indigo'` | Tema warna semantik indikator & aksen: `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'` |
| `radius` | `String` | `'default'` | Kelengkungan sudut kartu: `'default'`, `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'full'` |
| `size` | `String` | `'md'` | Ukuran dimensi kartu: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'` |
| `dense` | `Boolean` | `false` | Mode baris item rapat dengan ruang padding minimalis |
| `disabled` | `Boolean` | `false` | Menonaktifkan seluruh interaksi drag-and-drop |
| `emptyText` | `String` | `'Tarik atau letakkan item di sini'` | Teks pesan pada area dropzone kosong |
| `transferTitles` | `Array` | `['Item Tersedia', 'Item Terpilih']` | Judul label kolom kiri dan kanan pada mode transfer |
| `transferSearchable` | `Boolean` | `true` | Menampilkan bilah pencarian instan pada kolom mode transfer |
| `allowAddCard` | `Boolean` | `false` | Menampilkan tombol tambah kartu di bagian bawah kolom Kanban |
| `dropIndicatorClass` | `String` | `''` | Kelas CSS kustom untuk garis indikator posisi drop |
| `ghostClass` | `String` | `''` | Kelas CSS kustom untuk kartu yang sedang ditarik kursor |
| `animation` | `Number` | `300` | Durasi transisi FLIP animasi dalam milidetik (ms) |

---

## 09. Slots

| Nama Slot | Parameter Lingkup (Scope Props) | Keterangan |
|---|---|---|
| `item` | `{ item, index, column, isPickedUp }` | Kustomisasi menyeluruh tampilan kartu data dan status seleksi keyboard |
| `drag-handle` | — | Mengganti elemen ikon grip pegangan penarik kartu |
| `empty` | `{ column }` | Kustomisasi tampilan placeholder saat kolom atau area drop kosong |
| `column-header` | `{ column, count }` | Kustomisasi bilah header nama dan badge jumlah kartu kolom Kanban |
| `add-card` | `{ column }` | Kustomisasi tombol tambah kartu baru di bagian bawah kolom Kanban |

---

## 10. Events / Interactions

| Nama Event | Parameter (Payload) | Deskripsi Pemancaran |
|---|---|---|
| `update:modelValue` | `Array \| Object` | Dipancarkan saat susunan item atau kolom berubah untuk sinkronisasi `v-model` |
| `change` | `Object` | Dipancarkan dengan detail mutasi lengkap (`{ type, item, ... }`) |
| `drag-start` | `Object` | Dipancarkan seketika pengguna mulai menyeret kartu (`{ item, index, columnId }`) |
| `drag-end` | `Object` | Dipancarkan saat proses penyeretan selesai (`{ item, from, to }`) |
| `reorder` | `Object` | Dipancarkan saat terjadi pengurutan ulang dalam daftar/kolom (`{ from, to, item, columnId }`) |
| `transfer` | `Object` | Dipancarkan saat kartu berpindah lintas kolom (`{ item, fromColumn, toColumn, newIndex }`) |
| `add-card` | `Object` | Dipancarkan saat tombol tambah kartu ditekan (`{ columnId, item }`) |


---

## 11. Code Example

### 11.1 Pengatur Prioritas Formulir (Form Builder Sorter)
```vue
<script setup>
import { ref } from 'vue';
import DragDrop from '@/Components/Pack/DragDrop.vue';

const formFields = ref([
  { id: 'f1', label: 'Nama Lengkap', type: 'text', required: true },
  { id: 'f2', label: 'Alamat Email', type: 'email', required: true },
  { id: 'f3', label: 'Nomor WhatsApp', type: 'tel', required: false },
]);

function onFieldReorder(newOrder) {
  console.log('Urutan field baru:', newOrder);
}
</script>

<template>
  <DragDrop
    v-model="formFields"
    mode="list"
    :handle="true"
    card-variant="bordered"
    @reorder="onFieldReorder"
  >
    <template #item="{ item, index }">
      <div class="flex items-center justify-between w-full">
        <div>
          <span class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ item.label }}</span>
          <span class="text-xs text-slate-400 block font-mono">Tipe: {{ item.type }}</span>
        </div>
        <span class="text-xs font-mono font-bold text-slate-400">#{{ index + 1 }}</span>
      </div>
    </template>
  </DragDrop>
</template>
```

### 11.2 Papan Kerja Multi-Kolom (Kanban Sprint Board)
```vue
<script setup>
import { ref } from 'vue';
import DragDrop from '@/Components/Pack/DragDrop.vue';

const kanbanColumns = ref([
  {
    id: 'backlog',
    title: 'Backlog',
    color: 'indigo',
    items: [
      { id: 'kb-1', title: 'Audit Keamanan JWT', priority: 'High' },
      { id: 'kb-2', title: 'Perbaikan Typo Dokumentasi', priority: 'Low' },
    ],
  },
  {
    id: 'in_progress',
    title: 'Sedang Dikerjakan',
    color: 'amber',
    items: [
      { id: 'kb-3', title: 'Implementasi DragDrop Touch Event', priority: 'Critical' },
    ],
  },
  {
    id: 'done',
    title: 'Selesai',
    color: 'emerald',
    items: [
      { id: 'kb-4', title: 'Validasi Kontras Tema Gelap', priority: 'Medium' },
    ],
  },
]);

function handleCardTransfer({ item, fromColumn, toColumn }) {
  // Kirim mutasi status ke backend Laravel via Inertia / router.patch
  console.log(`Tugas ${item.title} bergeser dari ${fromColumn} ke ${toColumn}`);
}
</script>

<template>
  <DragDrop
    v-model="kanbanColumns"
    mode="kanban"
    card-variant="bordered"
    :handle="true"
    @transfer="handleCardTransfer"
  >
    <template #item="{ item }">
      <div class="space-y-1">
        <h5 class="text-xs font-bold text-slate-800 dark:text-slate-100">{{ item.title }}</h5>
        <span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
          {{ item.priority }}
        </span>
      </div>
    </template>
  </DragDrop>
</template>
```

---

## 12. Result / Behavior

- **Teknik Animasi FLIP**: Menggunakan kurva bezier `cubic-bezier(0.16, 1, 0.3, 1)` untuk menghitung selisih koordinat awal dan akhir kartu saat DOM dimutasi, menciptakan transisi pergeseran yang sangat halus.
- **Smart Handle Isolation**: Jika `handle="true"`, event `dragstart` hanya aktif saat kursor menekan elemen pegangan grip. Hal ini mencegah konflik saat pengguna ingin memblok teks atau mengklik input di dalam kartu.
- **Auto Non-Enumerable Unique Key**: Jika item data tidak memiliki properti `id` unik, komponen menyuntikkan ID pengenal tersembunyi `_dnd_id` secara non-enumerable agar rendering `<TransitionGroup>` tidak terganggu benturan kunci virtual DOM.
- **Pemberitahuan Denyut Indikator**: Garis drop indicator bar bergerak dinamis di sisi atas atau bawah kartu target saat pointer melayang di atas setengah bagian atas atau bawah elemen.

---

## 13. Customization

### Galeri Media Kisi 4 Kolom
```vue
<template>
  <DragDrop
    v-model="galleryImages"
    mode="grid"
    :columns="4"
    card-variant="glass"
    size="sm"
    :handle="false"
  >
    <template #item="{ item, index }">
      <div class="aspect-square rounded-lg overflow-hidden relative">
        <img :src="item.thumbnail" class="w-full h-full object-cover" />
        <span class="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1 rounded font-mono">
          #{{ index + 1 }}
        </span>
      </div>
    </template>
  </DragDrop>
</template>
```

---

## 14. Accessibility

- **Navigasi Keyboard WAI-ARIA Asli**: Pengguna dapat memindahkan kartu tanpa tetikus:
  - Tombol `Tab`: Berpindah antar elemen kartu item.
  - Tombol `Space` atau `Enter`: Mengangkat (*pick up*) kartu aktif atau meletakkan (*drop*) kartu ke posisi baru.
  - Tombol `ArrowUp` / `ArrowLeft`: Menggeser kartu ke urutan sebelumnya.
  - Tombol `ArrowDown` / `ArrowRight`: Menggeser kartu ke urutan berikutnya.
  - Tombol `Escape`: Membatalkan aksi pemindahan kartu dan mengembalikan kartu ke posisi semula.
- **Atribut Semantik ARIA**: Setiap kontainer membawa `role="list"`, setiap kartu membawa `role="listitem"`, serta atribut dinamis `aria-grabbed="true|false"` dan `aria-dropeffect="move"` saat kartu sedang aktif diangkat.
- **Inspectable Data Attributes**: Seluruh kartu yang dapat diseret dilengkapi atribut `data-dnd-item="true"`, `data-dnd-index`, dan `data-dnd-column` untuk memudahkan otomasi testing (Cypress / Playwright).
- **Pointer Clarity**: Kursor secara dinamis berganti antara `cursor-grab` saat diam dan `cursor-grabbing` saat sedang ditarik.

---

## 15. Responsive Behavior

- **Touch Device Support**: Pada layar ponsel cerdas, sentuhan jari pada handle diubah menjadi interaksi drag yang stabil dengan isolasi scroll vertikal sementara.
- **Fluid Grid Wrapping**: Mode grid secara otomatis menyusut dari 4 kolom di desktop menjadi 2 kolom di tablet dan 1 kolom penuh di layar ponsel.
- **Kanban Horizontal Scroll**: Pada layar berukuran kecil, papan Kanban dapat digulir secara horizontal dengan rapi tanpa merusak tata letak halaman.

---

## 16. Do / Don't

| Rekomendasi (Do) | Pantangan (Don't) |
|---|---|
| Selalu sediakan properti kunci unik (`id`) pada setiap item data di dalam array `modelValue`. | Jangan gunakan indeks array statis sebagai kunci `itemKey` karena akan memicu flicker visual. |
| Pasang `handle="true"` jika di dalam kartu item terdapat tombol aksi, tautan link, atau kolom input teks. | Jangan membiarkan seluruh permukaan kartu dapat di-drag jika kartu tersebut memiliki teks panjang yang perlu disalin pengguna. |
| Manfaatkan event `@change` atau `@transfer` untuk mengirim batch update urutan ke server secara debounced. | Jangan mengirim request AJAX ke backend pada setiap frame event dragstart atau dragover. |
| Berikan visual dropzone kosong yang jelas saat kolom Kanban belum memiliki kartu. | Jangan menaruh form input teks yang sangat rumit di dalam kartu yang dapat di-drag. |

---

## 17. Examples / Recipes

### Recipe 1: Penata Urutan Tab Navigasi Horizontal
```vue
<DragDrop
  v-model="navigationTabs"
  mode="list"
  direction="horizontal"
  card-variant="flat"
  size="sm"
  :handle="false"
/>
```

### Recipe 2: Papan Kanban Kolaborasi Tim dengan Footer Tambah Tugas
```vue
<DragDrop
  v-model="projectColumns"
  mode="kanban"
  card-variant="bordered"
>
  <template #column-footer="{ column }">
    <button class="w-full py-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl hover:bg-indigo-50/50">
      + Tambah Kartu Baru
    </button>
  </template>
</DragDrop>
```

---

## 18. Related Components

- **[Card Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/card.md)**: Kartu kontainer konten visual yang kerap dibungkus di dalam area DragDrop.
- **[Badge Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/badge.md)**: Lencana penanda prioritas tugas pada item DragDrop.
- **[ButtonSubmit Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/button-submit.md)**: Tombol aksi simpan urutan formulir ke server.
- **[Dropdown Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/dropdown.md)**: Menu aksi konteks yang dapat diletakkan di dalam kartu item.

---

## 19. Notes / Limitations

- **Browser Security Restrictions on Files**: Komponen ini dirancang untuk manipulasi data model internal aplikasi. Untuk menarik berkas dari sistem operasi komputer lokal pengguna, gunakan komponen khusus `FileDropzone`.
- **Nested Scrolling Containers**: Jika kontainer induk memiliki `overflow: auto` dengan batasan ketinggian yang sangat sempit, pastikan ruang margin mencukupi agar garis drop indicator tidak terpotong tepi kontainer.
- **Touch Hold Threshold**: Pada perangkat sentuh, penahanan jari sekitar 150ms dianjurkan sebelum memulai penarikan agar peramban dapat membedakan antara gestur gulir halaman (*scroll*) dan aksi seret item (*drag*).
