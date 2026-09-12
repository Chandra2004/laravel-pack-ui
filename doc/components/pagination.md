# 📄 Pagination Component (`Pagination.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md) | [Komponen Table](table.md)

---

## 4. Pagination Component (`Pagination.vue`)

Komponen navigasi paginasi responsif berbasis **Tailwind CSS** dan ikon **Google Material Symbols**. Komponen ini dirancang untuk bekerja langsung dengan objek `LengthAwarePaginator` dari Laravel (InertiaJS), serta mendukung mode paginasi sisi klien (*client-side*) dan mode ringkas (*simple mode*).

### Lokasi File

* **Component**: `Pagination.vue`

### Fitur Desain & Styling:
* **Tailwind CSS Utility Classes**: Desain tombol modern (`rounded-xl`, `border border-slate-200 dark:border-slate-700`, `bg-white dark:bg-slate-800`), status aktif (`bg-blue-600 text-white font-bold`), dan status nonaktif (`opacity-60 cursor-not-allowed`).
* **Google Material Symbols**: Ikon chevron navigasi `chevron_left` dan `chevron_right` yang terpusat dan presisi.
* **Intelligent Windowing & Ellipsis**: Dihitung melalui `computed(paginationPages)` secara efisien, menyisipkan `...` secara otomatis ketika jumlah halaman banyak.
* **Dua Mode Operasi**:
  * **Server-side Mode (Default)**: Menggunakan komponen Inertia `<Link>` dengan atribut `preserve-scroll` dan `preserve-state`.
  * **Client-side Mode (`client-side: true`)**: Menggunakan elemen `<button>` yang memancarkan event `@change(page)` untuk pemrosesan data lokal di Vue.
* **Simple Mode**: Opsi menampilkan tombol *Sebelumnya* dan *Selanjutnya* disertai indikator posisi halaman (`Hal. X / Y`) tanpa deretan angka.
* **Per-Page Selector**: Dropdown pilihan jumlah data per halaman (`showPerPage`, `perPageOptions`, `v-model:perPage`).
* **Jump to Page**: Input cepat langsung menuju nomor halaman tertentu (`showJump`).
* **Loading State**: Prop `loading` untuk menonaktifkan seluruh tombol navigasi saat proses asinkron/transisi halaman berlangsung.

### Component Props API (`<Pagination />`)

| Prop | Tipe Data | Default | Deskripsi / Pilihan Nilai |
| :--- | :--- | :--- | :--- |
| `data` | `Object` | `() => ({})` | Objek pagination (struktur Laravel Paginator seperti `current_page`, `last_page`, `from`, `to`, `total`, dll.) |
| `itemName` | `String` | `'Data'` | Label nama entitas data pada teks ringkasan (contoh: `'transaksi'`, `'pengguna'`) |
| `showInfo` | `Boolean` | `true` | Menampilkan atau menyembunyikan teks ringkasan "Menampilkan x-y dari z Data" |
| `simple` | `Boolean` | `false` | Menampilkan tombol Sebelumnya, Selanjutnya, dan indikator `Hal. X / Y` (*Simple Pagination*) |
| `clientSide` | `Boolean` | `false` | Mengaktifkan mode interaksi lokal berbasis tombol `<button>` dan event `@change` alih-alih navigasi `<Link>` Inertia |
| `path` | `String` | `''` | Prefix URL kustom untuk link halaman |
| `preserveScroll`| `Boolean` | `true` | Mempertahankan posisi scroll saat berpindah halaman (Inertia Link) |
| `preserveState` | `Boolean` | `true` | Mempertahankan state komponen saat berpindah halaman (Inertia Link) |
| `loading` | `Boolean` | `false` | Menonaktifkan interaksi klik pada tombol paginasi saat proses pemuatan berlangsung |
| `showPerPage` | `Boolean` | `false` | Menampilkan dropdown pemilih jumlah data per halaman |
| `perPage` | `Number` | `10` | Nilai data per halaman aktif (mendukung `v-model:perPage`) |
| `perPageOptions`| `Array` | `[10, 25, 50, 100]`| Pilihan jumlah data pada dropdown `showPerPage` |
| `showJump` | `Boolean` | `false` | Menampilkan input untuk lompat langsung ke nomor halaman tertentu |

### Events API (`<Pagination />`)

| Event Name | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `@change` | `page: Number` | Dipancarkan saat user berpindah halaman via tombol nomor, panah, atau jump input |
| `@update:perPage` | `value: Number` | Dipancarkan saat user mengubah dropdown per halaman (`v-model:perPage`) |
| `@per-page-change`| `value: Number` | Dipancarkan saat user memilih opsi jumlah data per halaman |

### Struktur Data Paginator Laravel
Objek `data` yang dikirim dari controller Laravel melalui `LengthAwarePaginator` (contoh: `User::paginate(10)`):

```json
{
  "current_page": 2,
  "last_page": 10,
  "from": 11,
  "to": 20,
  "total": 100,
  "prev_page_url": "https://example.com/users?page=1",
  "next_page_url": "https://example.com/users?page=3",
  "links": [...]
}
```

### Contoh Penggunaan Pagination

#### 1. Server-side Inertia Pagination di dalam TableComponent
```vue
<script setup>
import TableComponent from '@/Components/Pack/TableComponent.vue';
import Pagination from '@/Components/Pack/Pagination.vue';

// Props yang diterima dari Controller Laravel Inertia
defineProps({
  users: Object, // Laravel LengthAwarePaginator
});
</script>

<template>
  <TableComponent :items="users.data">
    <template #headers>
      <th>Nama</th>
      <th>Email</th>
      <th>Role</th>
    </template>

    <template #row="{ item }">
      <td>{{ item.name }}</td>
      <td>{{ item.email }}</td>
      <td>{{ item.role }}</td>
    </template>

    <!-- Paginasi di Footer Tabel -->
    <template #footer>
      <Pagination :data="users" item-name="pengguna" />
    </template>
  </TableComponent>
</template>
```

#### 2. Client-side Pagination (Data Lokal / Filter Frontend)
```vue
<script setup>
import { ref, computed } from 'vue';
import Pagination from '@/Components/Pack/Pagination.vue';

const currentPage = ref(1);
const allItems = ref([...]); // 50 items
const perPage = 10;

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return allItems.value.slice(start, start + perPage);
});

const paginatorData = computed(() => ({
  current_page: currentPage.value,
  last_page: Math.ceil(allItems.value.length / perPage),
  from: (currentPage.value - 1) * perPage + 1,
  to: Math.min(currentPage.value * perPage, allItems.value.length),
  total: allItems.value.length,
}));
</script>

<template>
  <div>
    <!-- Render paginatedItems di sini -->

    <!-- Pagination Client-side -->
    <Pagination
      :data="paginatorData"
      item-name="transaksi"
      client-side
      @change="(page) => currentPage = page"
    />
  </div>
</template>
```

#### 3. Simple Pagination (Mode Ringkas)
```vue
<template>
  <!-- Hanya tombol Sebelumnya / Selanjutnya -->
  <Pagination
    :data="transactions"
    item-name="transaksi"
    simple
  />
</template>
```

#### 4. Pagination Lanjutan (Per-Page Selector & Jump to Page)
```vue
<script setup>
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import Pagination from '@/Components/Pack/Pagination.vue';

defineProps({
  settlements: Object, // Laravel LengthAwarePaginator
});

const currentPerPage = ref(25);

const handlePerPageChange = (newPerPage) => {
  currentPerPage.value = newPerPage;
  router.get(route('settlements.index'), { per_page: newPerPage }, {
    preserveState: true,
    preserveScroll: true,
  });
};
</script>

<template>
  <!-- Paginasi lengkap dengan pemilih per halaman & lompat langsung ke nomor halaman -->
  <Pagination
    :data="settlements"
    item-name="penyelesaian dana"
    show-per-page
    :per-page="currentPerPage"
    :per-page-options="[10, 25, 50, 100]"
    show-jump
    @update:per-page="handlePerPageChange"
  />
</template>
```

---