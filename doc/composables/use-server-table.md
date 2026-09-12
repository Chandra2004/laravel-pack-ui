# 📊 Composable `useServerTable`

[← Kembali ke Dokumentasi Utama](../../README.md) | [Lihat Komponen TableComponent](../components/table.md)

`useServerTable` adalah composable state manager untuk menyinkronkan data tabel server-side (*search query*, *sorting*, *custom filters*, *per-page rows*, dan *pagination*) secara otomatis dan reaktif dengan query string URL Inertia.js. Composable ini mengeliminasi penulisan berulang *watcher* URL dan `router.get()` manual di setiap halaman daftar resource.

---

## 🚀 Import & Inisialisasi

```javascript
import { useServerTable } from '@/Composables/Pack/useServerTable';

const {
    search,
    sortColumn,
    sortDirection,
    perPage,
    page,
    filters,
    isLoading,
    queryParams,
    applySort,
    setFilter,
    goToPage,
    resetFilters,
    reload,
} = useServerTable({
    routeName: 'transactions.index',
    defaultPerPage: 10,
    defaultSort: { column: 'created_at', direction: 'desc' },
    defaultFilters: {
        status: '',
        channel: '',
    },
    debounceMs: 350,
});
```

---

## 📋 Konfigurasi Opsi (`options`)

| Opsi | Tipe Data | Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `routeName` | `String` | `''` | Nama rute Ziggy (misal `'users.index'`) atau path URL. Jika kosong, otomatis membaca `window.location.pathname`. |
| `routeParams` | `Object` | `{}` | Parameter rute dinamis tambahan (misal `{ tenant: 'org-1' }`). |
| `defaultSort` | `Object` | `{ column: 'id', direction: 'desc' }` | Nilai default kolom dan arah sortir. |
| `defaultPerPage` | `Number` | `10` | Jumlah default baris per halaman. |
| `defaultFilters` | `Object` | `{}` | Objek reaktif untuk filter spesifik (status, channel, date range, dll). |
| `debounceMs` | `Number` | `350` | Jeda milidetik debounce otomatis saat pengguna mengetik di kolom `search`. |
| `preserveState` | `Boolean` | `true` | Mempertahankan state internal komponen Vue saat navigasi Inertia. |
| `preserveScroll` | `Boolean` | `true` | Mencegah window melompat ke atas (*scroll jump*) saat data tabel diperbarui. |
| `replace` | `Boolean` | `true` | Mengganti (*replace*) history state browser agar tidak menumpuk riwayat URL saat mencari. |
| `only` | `Array<string>` | `[]` | Parsial reload hanya untuk props tertentu pada response Inertia (misal `['transactions']`). |
| `onStart` | `Function` | `null` | Callback yang dipanggil sesaat sebelum request Inertia dimulai. |
| `onFinish` | `Function` | `null` | Callback yang dipanggil setelah request Inertia selesai (sukses/gagal). |

---

## 🛠️ Nilai Return (State & Actions)

### 1. State Reaktif
| Properti | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `search` | `Ref<string>` | Query teks pencarian. Mengubah nilai ini otomatis memicu request dengan debounce dan mereset halaman ke 1. |
| `sortColumn` | `Ref<string>` | Nama kolom yang saat ini diurutkan. |
| `sortDirection` | `Ref<'asc' \| 'desc'>` | Arah sortir (`asc` atau `desc`). |
| `perPage` | `Ref<number>` | Jumlah baris per halaman. |
| `page` | `Ref<number>` | Halaman aktif paginasi. |
| `filters` | `Reactive<Object>` | Objek nilai filter kustom. Mengubah nilai di dalamnya otomatis memicu request debounced. |
| `isLoading` | `Ref<boolean>` | Bernilai `true` saat request Inertia sedang berlangsung (berguna untuk menampilkan skeleton/loading state). |
| `queryParams` | `Computed<Object>` | Objek parameter bersih siap kirim (parameter kosong/null otomatis dibersihkan). |

### 2. Actions / Methods
| Method | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `applySort(column)` | `(column: string)` | Jika kolom sama: balik arah `asc` $\leftrightarrow$ `desc`. Jika kolom berbeda: set kolom baru dengan urutan awal `asc`. Otomatis mereset ke halaman 1. |
| `setFilter(key, value)` | `(key: string, value: any)` | Mengubah nilai filter kustom secara langsung dan memicu request. |
| `goToPage(pageNumber)` | `(pageNumber: number)` | Berpindah ke nomor halaman tertentu. |
| `resetFilters()` | `()` | Mereset search, filter kustom, sort, dan halaman kembali ke kondisi awal secara instan. |
| `reload()` | `()` | Memuat ulang (*refresh*) data tabel dengan parameter aktif. |

---

## 💡 Contoh Implementasi Lengkap

```vue
<script setup>
import { useServerTable } from '@/Composables/Pack/useServerTable';
import InputField from '@/Components/Pack/InputField.vue';
import TableComponent from '@/Components/Pack/TableComponent.vue';
import Pagination from '@/Components/Pack/Pagination.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

// Menerima data paginated dari Controller Laravel
const props = defineProps({
    transactions: Object, // LengthAwarePaginator
});

const {
    search,
    sortColumn,
    sortDirection,
    perPage,
    filters,
    isLoading,
    applySort,
    goToPage,
    resetFilters,
} = useServerTable({
    routeName: 'transactions.index',
    defaultPerPage: 10,
    defaultSort: { column: 'created_at', direction: 'desc' },
    defaultFilters: {
        status: '',
    },
});
</script>

<template>
    <div class="space-y-4">
        <!-- Toolbar Filter & Search -->
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
                <InputField
                    v-model="search"
                    placeholder="Cari ID transaksi / pelanggan..."
                    icon="search"
                    size="sm"
                />

                <select
                    v-model="filters.status"
                    class="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
                >
                    <option value="">Semua Status</option>
                    <option value="PAID">Lunas</option>
                    <option value="PENDING">Menunggu</option>
                    <option value="FAILED">Gagal</option>
                </select>
            </div>

            <ButtonSubmit
                variant="ghost"
                size="sm"
                icon="restart_alt"
                @click="resetFilters"
            >
                Reset Filter
            </ButtonSubmit>
        </div>

        <!-- Tabel Data -->
        <TableComponent
            :data="transactions.data"
            :loading="isLoading"
            :current-sort="sortColumn"
            :sort-direction="sortDirection"
            @sort="applySort"
        />

        <!-- Paginasi -->
        <Pagination
            :links="transactions.links"
            :meta="transactions"
            @page-change="goToPage"
        />
    </div>
</template>
```
