# 🔍 FilterToolbar Component (`FilterToolbar.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen bilah filter data terpadu (*dynamic filter toolbar*) yang dirancang khusus untuk mempermudah penyaringan ribuan baris data tabel secara cepat, interaktif, dan terstruktur. Dilengkapi input pencarian ter-debounce, tombol filter tanggal cepat (*quick date presets*), selektor status, tombol reset dinamis dengan counter badge, serta dukungan integrasi otomatis (*plug-and-play*) dengan composable **`useServerTable.js`**.

---

## 🚀 2 Mode Penggunaan Fleksibel

### Mode 1: Integrasi Otomatis dengan `useServerTable.js` *(Sangat Direkomendasikan)*

Hanya dengan mengoper prop `:table="table"`, seluruh state pencarian, filter tanggal cepat, filter status, indikator loading, dan aksi reset akan otomatis terhubung tanpa penulisan logika manual:

```vue
<script setup>
import { useServerTable } from '@/Composables/Pack/useServerTable.js';
import FilterToolbar from '@/Components/Pack/FilterToolbar.vue';
import TableComponent from '@/Components/Pack/TableComponent.vue';

const table = useServerTable({
  routeName: 'transactions.index',
  defaultPerPage: 15,
  defaultFilters: {
    status: '',
    date_preset: 'all',
  },
});

const statusOptions = [
  { label: 'Berhasil (Settled)', value: 'success' },
  { label: 'Menunggu (Pending)', value: 'pending' },
  { label: 'Gagal (Failed)', value: 'failed' },
];
</script>

<template>
  <div class="space-y-4">
    <!-- FilterToolbar Otomatis Menangani useServerTable -->
    <FilterToolbar
      :table="table"
      search-placeholder="Cari ID transaksi, nama pelanggan, nominal..."
      :status-options="statusOptions"
      status-label="Status Pembayaran"
      show-status
    >
      <!-- Slot Actions untuk Tombol Tambahan -->
      <template #actions>
        <button
          type="button"
          class="px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
        >
          Export Excel
        </button>
      </template>
    </FilterToolbar>

    <!-- Tabel Data -->
    <TableComponent :loading="table.isLoading.value" ... />
  </div>
</template>
```

---

### Mode 2: Pemakaian Mandiri (*Standalone Mode*) dengan Direct `v-model`

Dapat juga digunakan secara mandiri untuk tabel client-side tanpa Inertia:

```vue
<script setup>
import { ref } from 'vue';
import FilterToolbar from '@/Components/Pack/FilterToolbar.vue';

const searchQuery = ref('');
const datePreset = ref('today');
const statusFilter = ref('');

const statusList = [
  { label: 'Semua Status', value: '' },
  { label: 'Aktif', value: 'active' },
  { label: 'Non-Aktif', value: 'inactive' },
];

const onReset = () => {
  searchQuery.value = '';
  datePreset.value = 'all';
  statusFilter.value = '';
};
</script>

<template>
  <FilterToolbar
    v-model:search="searchQuery"
    v-model:date-preset="datePreset"
    v-model:status="statusFilter"
    :status-options="statusList"
    show-status
    @reset="onReset"
  />
</template>
```

---

## 📋 Props API (`<FilterToolbar />`)

| Prop | Tipe Data | Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `table` | `Object` | `null` | Objek kembalian dari `useServerTable()`. Jika diisi, toolbar otomatis menyinkronkan search, filters, isLoading, & reset. |
| `search` | `String` | `''` | Nilai query pencarian (*mendukung `v-model:search`*) |
| `showSearch` | `Boolean` | `true` | Tampilkan atau sembunyikan kotak input pencarian |
| `searchPlaceholder` | `String` | `'Cari data...'` | Teks placeholder pada kotak pencarian |
| `searchDebounce` | `Number` | `350` | Durasi jeda debounce ketikan input pencarian dalam milidetik (ms) |
| `showDatePresets` | `Boolean` | `true` | Tampilkan bar tombol preset tanggal cepat |
| `datePreset` | `String` | `'all'` | Kunci preset tanggal yang aktif (*mendukung `v-model:datePreset`*) |
| `datePresets` | `Array` | `[...]` | Daftar opsi preset. Default: `[{ key: 'all', label: 'Semua' }, { key: 'today', label: 'Hari Ini' }, { key: '7days', label: '7 Hari' }, { key: '30days', label: '30 Hari' }, { key: 'this_month', label: 'Bulan Ini' }]` |
| `showStatus` | `Boolean` | `false` | Tampilkan selektor dropdown filter status |
| `status` | `String` \| `Number` | `''` | Nilai filter status aktif (*mendukung `v-model:status`*) |
| `statusLabel` | `String` | `'Status'` | Label pada opsi default select (misal: "Semua Status") |
| `statusOptions` | `Array` | `[]` | Opsi filter status format: `[{ label: 'Berhasil', value: 'success' }, ...]` |
| `showReset` | `Boolean` | `true` | Tampilkan tombol reset filter |
| `resetLabel` | `String` | `'Reset'` | Label teks pada tombol reset |
| `alwaysShowReset` | `Boolean` | `false` | Tetap tampilkan tombol reset meskipun tidak ada filter aktif |
| `loading` | `Boolean` | `false` | Status loading manual (menampilkan spinner berputar pada ikon pencarian) |
| `borderless` | `Boolean` | `false` | Menghilangkan border dan kontainer card bawaan |

---

## ⚡ Events (`defineEmits`)

| Event | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `update:search` | `(value)` | Dipancarkan saat nilai search berubah (*v-model:search*) |
| `update:datePreset` | `(presetKey)` | Dipancarkan saat preset tanggal dipilih (*v-model:datePreset*) |
| `update:status` | `(statusValue)` | Dipancarkan saat status dropdown berubah (*v-model:status*) |
| `search` | `(query)` | Dipancarkan setelah jeda debounce pencarian terpenuhi |
| `date-preset-change` | `(presetKey)` | Dipancarkan seketika tombol preset tanggal diklik |
| `status-change` | `(statusValue)` | Dipancarkan seketika opsi status dipilih |
| `reset` | `-` | Dipancarkan saat tombol reset filter diklik |
| `refresh` | `-` | Dipancarkan saat tombol segarkan data diklik |

---

## 🧩 Slots

| Nama Slot | Lokasi / Kegunaan |
| :--- | :--- |
| `#prepend` | Sisi paling kiri sebelum kotak pencarian (misal: checkbox batch select) |
| `#filters` atau `#default` | Area filter kustom di samping input pencarian (misal: select kategori, filter merchant) |
| `#date` | Area kustom di samping tombol preset tanggal (misal: komponen `<InputDatePicker>` custom range) |
| `#actions` | Sisi kanan toolbar untuk tombol aksi tabel (misal: "Export CSV", "Tambah Data") |

---

## 🛠️ Method Ter-ekspos (`defineExpose`)

Komponen mengekspos properti reaktif dan fungsi yang dapat diakses via template ref:

```javascript
const toolbarRef = ref(null);

// Contoh pemanggilan programatik:
toolbarRef.value.clearSearch();        // Hapus teks pencarian
toolbarRef.value.handleReset();         // Reset seluruh filter
toolbarRef.value.handleRefresh();       // Segarkan data
console.log(toolbarRef.value.activeFiltersCount); // Jumlah filter yang aktif (angka)
console.log(toolbarRef.value.hasActiveFilters);   // Boolean apakah ada filter aktif
```
