# 📊 TableComponent (`TableComponent.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md) | [Komponen Pagination](pagination.md)

---

## 3. TableComponent (`TableComponent.vue`)

Komponen wrapper tabel data responsif yang dibangun menggunakan utilitas **Tailwind CSS** dan ikon **Google Material Symbols**. Komponen ini menangani loading state (*multi-column skeleton loader*), empty state, toolbar pencarian/aksi, serta footer pagination secara otomatis dan modular.

### Lokasi File

* **Component**: `TableComponent.vue`

### Fitur Desain & Styling:
* **Tailwind CSS Modern Styling**: Desain tabel bersih dengan `rounded-2xl`, `border border-slate-200/80 dark:border-slate-800`, `divide-y`, dan dukungan dark mode.
* **Auto-Skeleton Transition**: Otomatis menampilkan skeleton loader saat terjadi pergantian halaman (pagination), live search/filter data, ataupun saat perpindahan halaman Inertia (`router.on('start')`/`finish`).
* **Realistic Multi-Column Skeleton**: Animasi `animate-pulse` berkolom dengan variasi lebar dinamis (`w-16`, `w-48`, `w-28`, `w-24`, `w-36`) saat `loading: true` atau saat transisi data.
* **Row Selection (Checkbox)**: Mendukung pemilihan baris data (`v-model:selected`) dengan checkbox *Select All* otomatis (mendukung state *indeterminate*).
* **Sticky Header**: Opsi `stickyHeader` agar `<thead>` tetap melayang saat tabel di-scroll secara vertikal.
* **CSV Data Export**: Menyediakan fungsi bawaan `exportToCsv(filename)` yang dapat dipanggil langsung dari slot toolbar atau ref komponen.
* **Harmonisasi Striped & Hover**: Warna hover dan zebra striping telah diselaraskan sehingga baris ganjil dan genap tetap memiliki kontras yang jelas saat di-hover.

### Component Props API (`<TableComponent />`)

| Prop | Tipe Data | Default | Deskripsi / Pilihan Nilai |
| :--- | :--- | :--- | :--- |
| `items` | `Array` | `[]` | Array data yang akan dirender ke dalam baris tabel |
| `loading` | `Boolean` | `false` | Kontrol manual state skeleton loading |
| `autoLoading` | `Boolean` | `true` | Otomatis tampilkan skeleton loading singkat saat data `items` berubah (search/page) |
| `autoLoadingDuration` | `Number` | `300` | Durasi tampil skeleton otomatis dalam milidetik (ms) |
| `watchInertia` | `Boolean` | `true` | Otomatis memicu skeleton saat request navigasi halaman Inertia berlangsung |
| `skeletonRows` | `Number` | `5` | Jumlah baris skeleton saat state loading |
| `skeletonCols` | `Number` | `4` | Jumlah kolom skeleton saat state loading |
| `selectable` | `Boolean` | `false` | Menampilkan kolom checkbox pemilihan di sebelah kiri |
| `selected` | `Array` | `[]` | Array item terpilih (`v-model:selected`) |
| `itemKey` | `String` | `'id'` | Kunci unik pengenal objek data baris (misal: `'id'`, `'uuid'`) |
| `stickyHeader` | `Boolean` | `false` | Menjadikan header kolom tetap di atas saat tabel di-scroll |
| `clickableRows` | `Boolean` | `false` | Menambahkan cursor pointer pada baris tabel |
| `emptyTitle` | `String` | `'Tidak Ada Data'` | Judul tampilan ketika data kosong |
| `emptyMessage` | `String` | `'Belum ada data yang tersedia...'` | Pesan teks ketika data kosong |
| `emptyIcon` | `String` | `'inbox'` | Nama Google Material Icon untuk tampilan kosong |
| `responsive` | `Boolean` | `true` | Mengaktifkan pembungkus horizontal scroll (`overflow-x-auto`) |
| `hoverable` | `Boolean` | `true` | Memberikan efek highlight background saat baris di-hover |
| `striped` | `Boolean` | `false` | Memberikan warna latar belang-belang (*zebra rows*) |
| `compact` | `Boolean` | `false` | Padding tabel lebih rapat untuk tampilan data padat |
| `borderless` | `Boolean` | `false` | Menghilangkan border dan shadow luar kontainer tabel |

### Slots API (`<TableComponent />`)

| Slot Name | Props Slot | Deskripsi |
| :--- | :--- | :--- |
| `toolbar` | `{ startLoading, stopLoading, isLoading, exportCsv }` | Area atas tabel (pencarian, filter status, export CSV) |
| `headers` | — | Elemen `<th>` untuk judul kolom tabel |
| `row` | `{ item, index }` | Scoped slot elemen `<td>` untuk setiap data pada `items` |
| `empty` | — | Kustomisasi tampilan penuh ketika data kosong |
| `footer` | — | Area bawah tabel (komponen pagination atau ringkasan total) |

### Events API (`<TableComponent />`)

| Event Name | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `@row-click` | `{ item, index }` | Dipancarkan saat sebuah baris data diklik (kecuali klik pada tombol/input) |
| `@update:selected` | `selectedItems: Array` | Dipancarkan saat daftar item yang dicentang berubah (`v-model:selected`) |
| `@select` | `{ item, selected: Boolean }` | Dipancarkan saat satu baris dicentang atau dilepas |
| `@select-all` | `selectedItems: Array` | Dipancarkan saat checkbox select-all di header di-toggle |

### Component Expose API (`defineExpose`)

Melalui template ref (misal: `<TableComponent ref="tableRef" />`), komponen induk dapat mengakses fungsi dan status berikut secara langsung:

| Property / Method | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `exportToCsv(filename)` | `Function(filename?: String)` | Mengekspor seluruh data array `items` ke dalam berkas CSV dan otomatis memicu download di browser pengguna |
| `startLoading()` | `Function()` | Mengaktifkan tampilan skeleton loading tabel secara manual |
| `stopLoading()` | `Function()` | Menghentikan tampilan skeleton loading tabel dan membersihkan timer |
| `isLoading` | `ComputedRef<Boolean>` | Status boolean reaktif apakah tabel saat ini sedang menampilkan skeleton (gabungan manual prop & transisi otomatis) |

### Contoh Penggunaan TableComponent

```vue
<script setup>
import { ref } from 'vue';
import TableComponent from '@/Components/Pack/TableComponent.vue';

const products = ref([
  { id: 1, name: 'Gateway API Pro', price: 'Rp 750.000', status: 'Active' },
  { id: 2, name: 'Webhook Starter', price: 'Rp 250.000', status: 'Active' },
]);
const isLoading = ref(false);
</script>

<template>
  <TableComponent
    :items="products"
    :loading="isLoading"
    :skeleton-rows="3"
    :skeleton-cols="4"
    hoverable
  >
    <!-- Slot Toolbar Pencarian / Aksi -->
    <template #toolbar>
      <input type="text" placeholder="Cari data..." class="px-3 py-1.5 text-xs border rounded-lg" />
      <button class="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg">+ Tambah</button>
    </template>

    <!-- Slot Header Kolom -->
    <template #headers>
      <th class="px-4 py-3">ID</th>
      <th class="px-4 py-3">Nama Produk</th>
      <th class="px-4 py-3">Harga</th>
      <th class="px-4 py-3">Status</th>
      <th class="px-4 py-3 text-right">Aksi</th>
    </template>

    <!-- Slot Baris Data (Scoped) -->
    <template #row="{ item, index }">
      <td class="px-4 py-3.5 text-xs font-mono">#{{ item.id }}</td>
      <td class="px-4 py-3.5 text-xs font-semibold text-slate-900">{{ item.name }}</td>
      <td class="px-4 py-3.5 text-xs">{{ item.price }}</td>
      <td class="px-4 py-3.5 text-xs">
        <span class="px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-700 font-semibold">
          {{ item.status }}
        </span>
      </td>
      <td class="px-4 py-3.5 text-xs text-right">
        <button class="text-blue-600 hover:underline">Edit</button>
      </td>
    </template>

    <!-- Slot Footer / Pagination -->
    <template #footer>
      <Pagination :data="products" item-name="produk" />
    </template>
  </TableComponent>
</template>
```

---