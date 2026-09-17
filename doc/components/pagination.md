# 📄 Pagination Component (`Pagination.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md) | [Komponen Table](table.md)

Komponen navigasi paginasi enterprise responsif (*Enterprise Responsive Pagination*) berbasis Vue 3 dan Tailwind CSS yang telah menerapkan **5 Pilar Standar UI (Warna, Bentuk, Teks Konten, Icon, & Responsif)**. Komponen ini dirancang untuk bekerja secara transparan dengan objek `LengthAwarePaginator` dari Laravel (InertiaJS) maupun data array lokal di sisi klien (*client-side*).

Untuk menghindari tampilan yang monoton, komponen menyediakan **5 variasi desain visual**: **`joined`** (*Segmented Toolbar*), **`pills`** (*Floating Rounded*), **`flat`** (*Ghost Minimalist*), **`card`** (*Container Card*), dan **`default`** (*Separated*).

---

## 🏛️ Penerapan 5 Pilar UI (`peraturan.md`)

1. **Warna (`colorTheme`)**:
   - Mendukung 8 tema warna resmi Pack UI: `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, dan `'dark'`.
   - Mengatur warna tombol aktif, ring fokus aksen, efek bayangan lembut (*colored shadow-sm*), dan tombol aksi lompat (*jump*).
   - Mendukung mode gelap (*dark mode*) dan terang (*light mode*) dengan kontras tinggi sesuai standar WCAG.

2. **Bentuk & Desain Anti-Monoton (`variant`, `radius`, `size`)**:
   - **`variant`**:
     - `'joined'`: Tombol bersatu dalam satu *segmented toolbar* dengan garis pemisah (*divider*), gaya modern ala Stripe/GitHub/Linear.
     - `'pills'`: Tombol berbentuk kapsul/lingkaran bulat penuh (*rounded-full*) melayang modern.
     - `'flat'`: Tombol minimalis tanpa border luar (*ghost button*), latar belakang halus hanya muncul saat disentuh/aktif.
     - `'card'`: Komponen dibungkus dalam kontainer kartu (*elevated card*) dengan efek *backdrop blur* dan bayangan elevasi.
     - `'default'`: Tombol individual terpisah dengan border halus.
   - **`radius`**: Pilihan kelengkungan sudut (`'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`, `'full'`).
   - **`size`**: Pilihan dimensi ukuran tombol (`'sm'`, `'md'`, `'lg'`).

3. **Teks Konten**:
   - Kustomisasi teks ringkasan informasi data: `showInfo`, `itemName`, serta scoped slot `#info`.
   - Kustomisasi label tombol navigasi: `prevText`, `nextText`, `firstText`, `lastText`.
   - Opsi `showButtonText: Boolean` untuk menyembunyikan teks label tombol dan hanya menampilkan ikon (berguna untuk antarmuka padat).
   - Dropdown pemilih jumlah data per halaman (`showPerPage`, `perPageOptions`).
   - Input langsung lompat ke nomor halaman (*jump to page*).
   - Scoped slots: `#info`, `#prev`, `#next`, `#first`, `#last`, `#page`, `#per-page`, `#jump`.

4. **Icon & Navigasi Mendalam**:
   - Ikon Google Material Symbols: `chevron_left`, `chevron_right`.
   - Tombol Halaman Pertama (`first_page`) dan Terakhir (`last_page`) melalui prop `showFirstLast`.
   - Kustomisasi ikon via props: `prevIcon`, `nextIcon`, `firstIcon`, `lastIcon`.
   - Mikro-animasi sentuh `active:scale-95` dan transisi warna halus.

5. **Responsif**:
   - Tata letak otomatis menyesuaikan ruang: vertikal berurutan pada layar smartphone (`flex-col sm:flex-row`).
   - *Intelligent Windowing*: Paginasi menyesuaikan batas rentang angka halaman agar tidak terjadi luapan horizontal (*overflow*) pada perangkat seluler.
   - Target area sentuhan (*touch target*) yang ramah jari dengan dimensi terstandarisasi.

---

## ⚙️ Component Props API (`<Pagination />`)

| Prop | Tipe Data | Default | Deskripsi / Pilihan Nilai |
| :--- | :--- | :--- | :--- |
| `data` | `Object` | `() => ({})` | Objek paginator Laravel (`current_page`, `last_page`, `from`, `to`, `total`, `prev_page_url`, dll.) |
| `colorTheme` | `String` | `'primary'` | Tema warna: `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'` |
| `variant` | `String` | `'default'` | Gaya visual: `'default'`, `'joined'`, `'pills'`, `'flat'`, `'card'` |
| `radius` | `String` | `'xl'` | Kelengkungan sudut: `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`, `'full'` |
| `size` | `String` | `'md'` | Ukuran tombol: `'sm'`, `'md'`, `'lg'` |
| `itemName` | `String` | `'Data'` | Label entitas data (contoh: `'transaksi'`, `'pengguna'`, `'invoice'`) |
| `showInfo` | `Boolean` | `true` | Menampilkan atau menyembunyikan teks ringkasan "Menampilkan x-y dari z Data" |
| `simple` | `Boolean` | `false` | Mode ringkas (hanya tombol Sebelumnya / Selanjutnya dan indikator `Hal. X / Y`) |
| `clientSide` | `Boolean` | `false` | Mode interaksi lokal Vue (menggunakan elemen `<button>` & emit `@change`) |
| `showFirstLast` | `Boolean` | `false` | Menampilkan tombol pintas Halaman Pertama dan Halaman Terakhir |
| `showButtonText` | `Boolean` | `true` | Menampilkan teks label di samping ikon pada tombol navigasi |
| `prevText` | `String` | `'Sebelumnya'` | Teks tombol Sebelumnya |
| `nextText` | `String` | `'Selanjutnya'` | Teks tombol Selanjutnya |
| `firstText` | `String` | `'Awal'` | Teks tombol Halaman Pertama |
| `lastText` | `String` | `'Akhir'` | Teks tombol Halaman Terakhir |
| `prevIcon` | `String` | `'chevron_left'` | Ikon Material Symbols tombol Sebelumnya |
| `nextIcon` | `String` | `'chevron_right'` | Ikon Material Symbols tombol Selanjutnya |
| `firstIcon` | `String` | `'first_page'` | Ikon Material Symbols tombol Pertama |
| `lastIcon` | `String` | `'last_page'` | Ikon Material Symbols tombol Terakhir |
| `showPerPage` | `Boolean` | `false` | Menampilkan dropdown pilihan jumlah baris data per halaman |
| `perPage` | `Number` | `10` | Nilai data per halaman aktif (mendukung `v-model:perPage`) |
| `perPageOptions` | `Array` | `[10, 25, 50, 100]` | Pilihan jumlah data pada dropdown `showPerPage` |
| `showJump` | `Boolean` | `false` | Menampilkan input lompat ke halaman tertentu |
| `align` | `String` | `'between'` | Perataan kontainer: `'between'`, `'center'`, `'start'`, `'end'` |
| `loading` | `Boolean` | `false` | Menonaktifkan klik seluruh tombol saat transisi/fetching data |
| `path` | `String` | `''` | Prefix URL kustom untuk link Inertia |
| `preserveScroll` | `Boolean` | `true` | Mempertahankan posisi scroll halaman saat navigasi |
| `preserveState` | `Boolean` | `true` | Mempertahankan state komponen saat navigasi |

---

## 📢 Events API (`<Pagination />`)

| Event Name | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `@change` | `page: Number` | Dipancarkan saat pengguna mengklik halaman, panah, atau jump input |
| `@update:perPage` | `value: Number` | Dipancarkan saat pengguna mengubah dropdown per halaman (`v-model:perPage`) |
| `@per-page-change` | `value: Number` | Dipancarkan saat user memilih opsi jumlah data per halaman |

---

## 🧩 Scoped Slots

| Slot Name | Props Tersedia | Deskripsi |
| :--- | :--- | :--- |
| `#info` | `{ from, to, total, itemName, currentPage, lastPage }` | Kustomisasi template teks ringkasan halaman |
| `#per-page` | `{ perPage, options, loading }` | Kustomisasi elemen pemilih baris per halaman |
| `#jump` | `{ currentPage, lastPage, handleJump }` | Kustomisasi input lompat nomor halaman |

---

## 🚀 Contoh Penggunaan

### 1. Gaya Joined / Segmented Toolbar (Stripe / GitHub Dashboard Style)
```vue
<script setup>
import { ref } from 'vue';
import Pagination from '@/Components/Pack/Pagination.vue';

defineProps({
  transactions: Object, // Laravel LengthAwarePaginator
});
</script>

<template>
  <Pagination
    :data="transactions"
    item-name="transaksi"
    variant="joined"
    color-theme="indigo"
    radius="xl"
  />
</template>
```

### 2. Gaya Pills (Floating Round Modern)
```vue
<template>
  <Pagination
    :data="orders"
    item-name="pesanan"
    variant="pills"
    color-theme="emerald"
    client-side
    @change="(p) => fetchPage(p)"
  />
</template>
```

### 3. Fitur Lengkap Enterprise (First/Last, Per-Page, & Jump)
```vue
<script setup>
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import Pagination from '@/Components/Pack/Pagination.vue';

defineProps({
  settlements: Object,
});

const perPage = ref(25);

const handlePerPageChange = (val) => {
  perPage.value = val;
  router.get(route('settlements.index'), { per_page: val }, {
    preserveState: true,
    preserveScroll: true,
  });
};
</script>

<template>
  <Pagination
    :data="settlements"
    item-name="penyelesaian dana"
    variant="card"
    color-theme="primary"
    show-first-last
    show-per-page
    :per-page="perPage"
    :per-page-options="[10, 25, 50, 100]"
    show-jump
    @update:per-page="handlePerPageChange"
  />
</template>
```

### 4. Mode Ringkas (Simple Pagination)
```vue
<template>
  <Pagination
    :data="invoices"
    item-name="faktur"
    simple
    color-theme="amber"
  />
</template>
```
