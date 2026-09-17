# 📊 TableComponent (`TableComponent.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md) | [Komponen Pagination](pagination.md)

Komponen tabel data enterprise modern (*data table wrapper*) berbasis Vue 3 dan Tailwind CSS v4. Menerapkan secara penuh **5 Pilar Kustomisasi UI** (`peraturan.md`): **Warna**, **Bentuk**, **Teks Konten**, **Icon**, dan **Responsif**.

Dilengkapi header kartu otomatis (*card title & subtitle*), multi-column skeleton loader adaptif, pemilihan baris multi-item (*row selection*) dengan bilah aksi massal (*bulk actions bar*), pembekuan kolom pertama (*sticky first column*), indikator gradasi gulir horizontal (*scroll indicator*), ekspor CSV instan, dan integrasi otomatis dengan navigasi halaman Inertia.js.

---

## 🎨 5 Pilar Kustomisasi (`peraturan.md`)

### 1. Warna (Color & Theme)
* **Pilihan Palet Aksen Semantik (`color`)**:
  - `'primary'` / `'blue'`: Biru enterprise (default)
  - `'indigo'`: Indigo modern
  - `'emerald'` / `'success'`: Hijau sukses
  - `'purple'` / `'violet'`: Ungu kreatif
  - `'amber'` / `'warning'`: Kuning emas peringatan
  - `'rose'` / `'danger'`: Merah risiko
  - `'cyan'` / `'sky'`: Cyan teal cerah
  - `'dark'` / `'slate'`: Hitam/putih kontras tinggi
* Mengontrol warna highlight baris saat di-hover, baris yang sedang dicentang (*selected row highlight*), aksen checkbox, dan badge counter seleksi massal.

### 2. Bentuk (Shape, Radius, & Size)
* **Border Radius Container (`radius`)**:
  - `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'` (default), `'3xl'`.
  - Memungkinkan gaya mulai dari tabel brutalist kotak (`radius="none"`) hingga kontainer sudut membulat modern (`radius="2xl"`).
* **Bayangan Container (`shadow`)**:
  - `'none'`, `'2xs'` (default), `'xs'`, `'sm'`, `'md'`.
* **Skala Ukuran (`size`)**:
  - `'sm'`: Padding sel dan header rapat (`px-3.5 py-2.5 text-xs`), ideal untuk data padat / invoice list.
  - `'md'`: Standar enterprise yang nyaman dibaca (`px-5 py-3.5 text-xs sm:text-sm`).
  - `'lg'`: Padding lapang (`px-6 py-4.5 text-sm sm:text-base`) untuk tabel data utama.
* **Border & Garis Pemisah**: Mendukung opsi `borderless` untuk meniadakan garis luar kartu saat disematkan di dalam kontainer lain.

### 3. Teks Konten (Content, Headers, & Slots)
* **Header Judul & Subtitle Otomatis**: Properti `title`, `subtitle`, dan `icon` otomatis menghasilkan header tabel yang rapi tanpa perlu membuat markup kartu tambahan.
* **Bilah Aksi Massal (*Bulk Actions Bar*)**: Saat baris dipilih (`selectable="true"`), otomatis memunculkan baris aksi dengan counter baris terpilih, tombol "Batal Pilih", dan slot `#bulk-actions`.
* **Empty State Informatif**: Dilengkapi `emptyTitle`, `emptyMessage`, `emptyIcon`, serta tombol aksi interaktif via `emptyActionText` dan event `@empty-action` (misal untuk mereset filter atau menambah data).
* **Slot Fleksibel**:
  - `#title`: Kustomisasi penuh area judul header
  - `#toolbar`: Bilah pencarian dan tombol aksi atas
  - `#bulk-actions`: Tombol tindakan kolektif saat ada baris yang dicentang
  - `#headers`: Baris elemen `<th>`
  - `#row`: Scoped slot elemen `<td>` per data baris
  - `#empty`: Kustomisasi tampilan penuh saat data kosong
  - `#footer`: Area bawah untuk pagination atau ringkasan data

### 4. Icon (Iconography & Precision Alignment)
* Terintegrasi penuh dengan **Google Material Symbols**.
* Ikon judul tabel (`icon="database"`), ikon empty state (`emptyIcon="inbox"`), ikon pembatalan seleksi (`close`), dan ikon pencarian.
* Seluruh badge dan tombol aksi dalam sel tabel menggunakan penjajaran vertikal presisi `inline-flex items-center justify-center leading-none`.

### 5. Responsif (Responsiveness & Scrolling)
* **Indikator Gulir Visual (*Scroll Indicator*)**: Menampilkan efek gradasi fade halus di sisi kiri dan kanan saat tabel melebihi lebar layar, memberi tahu pengguna bahwa tabel dapat digulir horizontal.
* **Sticky First Column (`stickyFirstColumn="true"`)**: Membekukan kolom pertama (seperti ID atau Checkbox) agar tetap terlihat saat pengguna menggulir tabel lebar ke arah samping.
* **Sticky Header (`stickyHeader="true"`)**: Membekukan `<thead>` di posisi atas saat tabel digulir vertikal dengan `maxHeight`.
* **Auto Skeleton Loader**: Otomatis menampilkan animasi kerangka loader berkolom saat transisi data atau request Inertia berlangsung.

---

## 🚀 Cara Penggunaan

### 1. Penggunaan Standar dengan Judul & Toolbar

```vue
<script setup>
import { ref } from 'vue';
import TableComponent from '@/Components/Pack/TableComponent.vue';
import Pagination from '@/Components/Pack/Pagination.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const products = ref([
  { id: 'PRD-01', name: 'Gateway API Pro', category: 'Payment API', price: 'Rp 750.000', status: 'Active' },
  { id: 'PRD-02', name: 'Webhook Realtime', category: 'Integration', price: 'Rp 250.000', status: 'Active' },
]);
</script>

<template>
  <TableComponent
    :items="products"
    title="Katalog Produk & API"
    subtitle="Kelola konfigurasi paket integrasi dan status ketersediaan"
    icon="storefront"
    color="primary"
    hoverable
  >
    <!-- Toolbar Pencarian & Aksi -->
    <template #toolbar>
      <input type="text" placeholder="Cari layanan..." class="px-3 py-1.5 text-xs border rounded-xl" />
      <ButtonSubmit size="sm" icon="add">Tambah Layanan</ButtonSubmit>
    </template>

    <!-- Header Kolom -->
    <template #headers>
      <th class="px-5 py-3.5">Kode</th>
      <th class="px-5 py-3.5">Nama Layanan</th>
      <th class="px-5 py-3.5">Kategori</th>
      <th class="px-5 py-3.5">Harga</th>
      <th class="px-5 py-3.5 text-right">Aksi</th>
    </template>

    <!-- Baris Data (Scoped Slot) -->
    <template #row="{ item }">
      <td class="px-5 py-4 text-xs font-mono font-medium text-slate-500">{{ item.id }}</td>
      <td class="px-5 py-4 text-xs font-semibold text-slate-900">{{ item.name }}</td>
      <td class="px-5 py-4 text-xs">{{ item.category }}</td>
      <td class="px-5 py-4 text-xs font-bold">{{ item.price }}</td>
      <td class="px-5 py-4 text-xs text-right">
        <button class="text-blue-600 font-semibold hover:underline">Edit</button>
      </td>
    </template>
  </TableComponent>
</template>
```

---

### 2. Seleksi Baris Multi-Item & Bilah Aksi Massal (*Bulk Actions*)

```vue
<script setup>
import { ref } from 'vue';
import TableComponent from '@/Components/Pack/TableComponent.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const selectedItems = ref([]);
const users = ref([
  { id: 1, name: 'Budi Santoso', email: 'budi@domain.com', role: 'Merchant' },
  { id: 2, name: 'Siti Aminah', email: 'siti@domain.com', role: 'Finance' },
]);

const handleBulkDelete = (count) => {
  alert(`Menghapus ${count} data terpilih.`);
  selectedItems.value = [];
};
</script>

<template>
  <TableComponent
    :items="users"
    selectable
    v-model:selected="selectedItems"
    item-key="id"
    color="indigo"
    hoverable
  >
    <!-- Tombol Tindakan pada Bilah Seleksi Massal -->
    <template #bulk-actions="{ count }">
      <ButtonSubmit
        size="xs"
        variant="danger"
        icon="delete"
        @click="handleBulkDelete(count)"
      >
        Hapus {{ count }} Item
      </ButtonSubmit>
    </template>

    <template #headers>
      <th class="px-5 py-3.5">Nama Pengguna</th>
      <th class="px-5 py-3.5">Alamat Email</th>
      <th class="px-5 py-3.5">Peran Akun</th>
    </template>

    <template #row="{ item }">
      <td class="px-5 py-4 text-xs font-semibold">{{ item.name }}</td>
      <td class="px-5 py-4 text-xs text-slate-500">{{ item.email }}</td>
      <td class="px-5 py-4 text-xs">{{ item.role }}</td>
    </template>
  </TableComponent>
</template>
```

---

### 3. Tabel Lebar dengan Sticky First Column & Scroll Indicator

```vue
<template>
  <TableComponent
    :items="largeDataset"
    sticky-header
    sticky-first-column
    max-height="500px"
    scroll-indicator
    color="emerald"
  >
    <template #headers>
      <!-- Kolom pertama akan membeku saat di-scroll horizontal -->
      <th class="px-5 py-3.5">Invoice #</th>
      <th class="px-5 py-3.5">Pelanggan</th>
      <th class="px-5 py-3.5">Metode Bayar</th>
      <th class="px-5 py-3.5">Nominal</th>
      <th class="px-5 py-3.5">Fee</th>
      <th class="px-5 py-3.5">Settlement</th>
      <th class="px-5 py-3.5">Waktu Transaksi</th>
      <th class="px-5 py-3.5">Status</th>
    </template>

    <template #row="{ item }">
      <td class="px-5 py-4 text-xs font-mono font-bold">{{ item.invoice_no }}</td>
      <td class="px-5 py-4 text-xs">{{ item.customer }}</td>
      <td class="px-5 py-4 text-xs">{{ item.channel }}</td>
      <td class="px-5 py-4 text-xs">{{ item.amount }}</td>
      <td class="px-5 py-4 text-xs">{{ item.fee }}</td>
      <td class="px-5 py-4 text-xs">{{ item.net }}</td>
      <td class="px-5 py-4 text-xs text-slate-400">{{ item.created_at }}</td>
      <td class="px-5 py-4 text-xs">{{ item.status }}</td>
    </template>
  </TableComponent>
</template>
```

---

## 🛠️ API Reference

### Props

| Prop | Tipe Data | Default | Pilihan Nilai / Deskripsi |
| :--- | :--- | :--- | :--- |
| `items` | `Array` | `[]` | Array data baris yang ditampilkan. |
| `title` | `String` | `''` | Judul teks otomatis di bagian atas tabel. |
| `subtitle` | `String` | `''` | Subjudul / deskripsi di bawah judul tabel. |
| `icon` | `String` | `''` | Ikon Material Symbols di samping judul. |
| `color` | `String` | `'primary'` | Skema warna aksen: `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'`, `'slate'`. |
| `radius` | `String` | `'2xl'` | Kelengkungan sudut kontainer: `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`. |
| `size` | `String` | `'md'` | Ukuran kepadatan tabel: `'sm'` (compact), `'md'`, `'lg'`. |
| `shadow` | `String` | `'2xs'` | Intensitas bayangan: `'none'`, `'2xs'`, `'xs'`, `'sm'`, `'md'`. |
| `loading` | `Boolean` | `false` | Kontrol manual animasi skeleton loading. |
| `autoLoading` | `Boolean` | `true` | Otomatis memicu skeleton saat data `items` berubah (search/page). |
| `autoLoadingDuration`| `Number` | `300` | Durasi tampil skeleton otomatis dalam milidetik (ms). |
| `watchInertia` | `Boolean` | `true` | Otomatis menampilkan skeleton saat terjadi request navigasi Inertia.js. |
| `skeletonRows` | `Number` | `5` | Jumlah baris skeleton saat memuat data. |
| `skeletonCols` | `Number` | `4` | Jumlah kolom skeleton saat memuat data. |
| `selectable` | `Boolean` | `false` | Menampilkan kolom checkbox pemilihan baris. |
| `selected` | `Array` | `[]` | Array item terpilih (`v-model:selected`). |
| `itemKey` | `String` | `'id'` | Kunci unik pengenal objek data (cth: `'id'`, `'uuid'`). |
| `stickyHeader` | `Boolean` | `false` | Header kolom tetap berada di atas saat tabel di-scroll vertikal. |
| `stickyFirstColumn` | `Boolean` | `false` | Kolom pertama membeku di posisi kiri saat tabel digulir ke samping. |
| `maxHeight` | `String \| Number` | `null` | Batas tinggi maksimal tabel untuk scroll vertikal (cth: `'450px'`). |
| `scrollIndicator` | `Boolean` | `true` | Menampilkan efek gradasi fade saat ada konten terpotong horizontal. |
| `clickableRows` | `Boolean` | `false` | Mengubah kursor menjadi pointer pada setiap baris data. |
| `hoverable` | `Boolean` | `true` | Memberikan efek warna highlight saat baris disorot kursor. |
| `striped` | `Boolean` | `false` | Memberikan warna selang-seling pada baris (*zebra pattern*). |
| `borderless` | `Boolean` | `false` | Menghilangkan garis border dan bayangan kontainer luar. |
| `emptyTitle` | `String` | `'Tidak Ada Data'` | Judul tampilan saat data kosong. |
| `emptyMessage` | `String` | `'Belum ada data...'` | Pesan deskripsi saat data kosong. |
| `emptyIcon` | `String` | `'inbox'` | Ikon Material Symbols tampilan kosong. |
| `emptyActionText`| `String` | `''` | Teks tombol aksi di bawah pesan data kosong. |

---

### Slots

| Slot Name | Scope Props | Deskripsi |
| :--- | :--- | :--- |
| `title` | — | Kustomisasi area judul dan ikon di atas tabel. |
| `toolbar` | `{ startLoading, stopLoading, isLoading, exportCsv, selected, count }` | Bilah atas tabel (pencarian, filter, tombol tambah). |
| `bulk-actions` | `{ selected, count, clearSelection }` | Bilah tindakan massal saat baris dicentang. |
| `headers` | — | Tempat elemen `<th>` untuk judul kolom. |
| `row` | `{ item, index, selected }` | Scoped slot untuk elemen `<td>` per baris data. |
| `empty` | — | Kustomisasi penuh area tampilan ketika data kosong. |
| `empty-action` | — | Kustomisasi tombol tindakan di dalam empty state. |
| `footer` | — | Area bawah tabel (komponen pagination atau ringkasan). |

---

### Events

| Event Name | Payload | Deskripsi |
| :--- | :--- | :--- |
| `@row-click` | `{ item, index }` | Dipancarkan saat baris data diklik (diabaikan jika klik pada tombol/input). |
| `@update:selected` | `selectedItems: Array` | Dipancarkan saat daftar baris terpilih berubah (`v-model:selected`). |
| `@select` | `{ item, selected: Boolean }` | Dipancarkan saat status centang sebuah baris berubah. |
| `@select-all` | `selectedItems: Array` | Dipancarkan saat checkbox *Select All* di-toggle. |
| `@empty-action` | — | Dipancarkan saat tombol aksi pada empty state diklik. |

---

### Expose API (`defineExpose`)

Dapat diakses via template ref (misal `<TableComponent ref="myTable" />`):

* `exportToCsv(filename?: string)`: Mengekspor seluruh array `items` ke berkas CSV dan memicu download otomatis.
* `startLoading()`: Mengaktifkan animasi skeleton loader secara manual.
* `stopLoading()`: Menghentikan animasi skeleton loader secara manual.
* `clearSelection()`: Mengosongkan seluruh baris yang sedang dicentang.
* `toggleSelectAll()`: Memilih atau membatalkan seluruh pilihan baris.
* `isLoading`: Boolean reaktif yang menandakan status loading tabel saat ini.
