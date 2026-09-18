# 📋 Dynamic Form Repeater / Multiple Input Form (`InputRepeater.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen form input berulang dinamis (*Dynamic Form Repeater / Multiple Input Form*) enterprise untuk ekosistem **Laravel Inertia Vue 3** dan **Tailwind CSS**. Dirancang khusus untuk kasus multi-entri (seperti form pendaftar, delegasi anggota, detail invoice berulang, atau varian produk) lengkap dengan sistem batasan kuota (*limitations* min/max), penomoran kartu otomatis, reordering posisi, duplikasi baris cepat, dan kebebasan kustomisasi 100% via scoped slots.

Dapat digunakan langsung melalui komponen universal `<InputField type="repeater" />` maupun komponen mandiri `<InputRepeater />`.

---

## 🌟 Fitur Unggulan

1. **Dual Facade Integration**:
   - Sebagai bagian dari universal input: `<InputField type="repeater" :fields="[...]" v-model="form.pendaftar" />`
   - Sebagai komponen mandiri: `<InputRepeater :fields="[...]" v-model="form.pendaftar" />`
2. **Sistem Batasan Kuota (*Limitations Control*)**:
   - `:max="4"`: Menonaktifkan tombol tambah otomatis saat batas tercapai, memicu event `@max-reached`, dan menampilkan badge peringatan kuota penuh.
   - `:min="1"`: Melindungi integritas form dengan menonaktifkan tombol hapus jika jumlah item telah mencapai batas minimal.
3. **Deklarasi Skema Dinamis (`:fields="[...]"`)**:
   - Mengonfigurasi kolom formulir per baris secara deklaratif dengan dukungan tipe input bawaan `InputField` (`text`, `email`, `textarea`, `select`, `date`, `number`, dll.) lengkap dengan lebar kolom grid (`colSpan: 1 | 2 | 'full'`).
4. **Alat Manajemen Entri Lengkap**:
   - ⬆️ / ⬇️ **Reordering**: Tombol pindah posisi ke atas dan ke bawah secara instan.
   - 📋 **Duplikasi Cepat**: Salin seluruh data baris terpilih ke baris baru dalam 1 klik.
   - 🔽 **Collapsible Accordion**: Melipat baris kartu agar tampilan form panjang tetap bersih dan terorganisir.
   - 🗑️ **Proteksi Hapus**: Opsional dialog konfirmasi sebelum item dihapus (`:confirm-delete="true"`).
5. **Animasi & Reaktivitas Halus**:
   - Didukung `<TransitionGroup>` untuk animasi masuk/keluar saat item ditambah atau dihapus.
   - Sinkronisasi dua arah real-time dengan objek model array.

---

## 🚀 Contoh Penggunaan Praktis

### 1. Form Pendaftaran Peserta (Kasus User: Nama, Alamat, Email dengan Limit)

```vue
<script setup>
import { ref } from 'vue';
import InputField from '@/Components/Pack/InputField.vue';

const pendaftarList = ref([
    { nama: 'Chandra Tri Antomo', email: 'chandra@example.com', alamat: 'Jl. Sudirman No. 45' }
]);

const fields = [
    {
        name: 'nama',
        label: 'Nama Lengkap',
        type: 'text',
        placeholder: 'Masukkan nama pendaftar...',
        required: true,
        icon: 'person',
        colSpan: 1,
    },
    {
        name: 'email',
        label: 'Alamat Email',
        type: 'email',
        placeholder: 'pendaftar@domain.com',
        required: true,
        icon: 'mail',
        colSpan: 1,
    },
    {
        name: 'alamat',
        label: 'Alamat Domisili',
        type: 'textarea',
        placeholder: 'Masukkan alamat lengkap domisili...',
        rows: 2,
        required: true,
        colSpan: 2,
    },
];
</script>

<template>
    <InputField
        v-model="pendaftarList"
        type="repeater"
        label="Data Peserta / Pendaftar"
        hint="Minimal 1 pendaftar dan maksimal 4 pendaftar per pengajuan"
        :fields="fields"
        :min="1"
        :max="4"
        add-button-text="Tambahkan Pendaftar"
        add-icon="person_add"
        item-title="Pendaftar"
        :item-subtitle="(item, index) => item.nama ? `Peserta: ${item.nama}` : 'Belum diisi'"
        reorderable
        duplicable
        collapsible
        columns="2"
        card-variant="bordered"
    />
</template>
```

---

### 2. Penggunaan Mandiri (`<InputRepeater />`) dengan Scoped Slot Kustom

Jika Anda menginginkan tata letak kustom tanpa skema `fields`, gunakan scoped slot `#default`:

```vue
<script setup>
import { ref } from 'vue';
import InputRepeater from '@/Components/Pack/InputRepeater.vue';
import InputField from '@/Components/Pack/InputField.vue';

const anggota = ref([
    { nama: '', divisi: 'Engineering', lead: false }
]);
</script>

<template>
    <InputRepeater
        v-model="anggota"
        :min="1"
        :max="5"
        add-button-text="Tambah Anggota Tim"
        item-title="Anggota"
    >
        <template #default="{ item, index, remove, canRemove, updateField }">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <InputField
                    v-model="item.nama"
                    label="Nama Anggota"
                    placeholder="Nama lengkap..."
                    required
                />
                <InputField
                    v-model="item.divisi"
                    type="select"
                    label="Divisi"
                    :options="['Engineering', 'Product', 'Design', 'Marketing']"
                />
                <InputField
                    v-model="item.lead"
                    type="switch"
                    label="Team Lead"
                    subtext="Koordinator kelompok"
                />
            </div>
        </template>
    </InputRepeater>
</template>
```

---

## 📋 Props API

| Prop | Tipe | Default | Deskripsi |
|---|---|---|---|
| `modelValue` / `v-model` | `Array` | `[]` | Array data baris formulir (array of objects). |
| `fields` | `Array` | `[]` | Definisi skema input per baris: `name`, `label`, `type`, `placeholder`, `required`, `icon`, `colSpan`, `rows`, `options`, `props`. |
| `min` / `minItems` | `Number` | `1` | Batas minimal item. Tombol hapus dinonaktifkan jika jumlah item $\le$ `min`. |
| `max` / `maxItems` | `Number` | `null` | Batas maksimal item. Tombol tambah dinonaktifkan saat batas tercapai. |
| `addButtonText` | `String` | `'Tambahkan Data'` | Teks pada tombol penambahan entri baru. |
| `addIcon` | `String` | `'add'` | Nama Google Material Symbols untuk tombol tambah. |
| `addPosition` | `String` | `'bottom'` | Posisi tombol penambahan: `'bottom'`, `'header'`, atau `'both'`. |
| `itemTitle` | `String \| Function` | `'Item'` | Judul kartu: string (`"Pendaftar"`) atau fungsi `(item, index) => string`. |
| `itemSubtitle` | `String \| Function` | `''` | Subjudul kartu atau fungsi `(item, index) => string`. |
| `columns` | `Number \| String` | `2` | Jumlah kolom grid input per kartu (`1`, `2`, `3`, `4`). |
| `collapsible` | `Boolean` | `false` | Menampilkan tombol akordeon untuk melipat/membuka kartu baris. |
| `defaultCollapsed`| `Boolean` | `false` | Kondisi awal apakah baris kartu terlipat. |
| `reorderable` | `Boolean` | `true` | Menampilkan tombol pindah posisi baris ke atas / ke bawah. |
| `deletable` | `Boolean` | `true` | Menampilkan tombol hapus baris. |
| `duplicable` | `Boolean` | `true` | Menampilkan tombol duplikasi baris. |
| `confirmDelete` | `Boolean` | `false` | Menampilkan konfirmasi sebelum menghapus baris. |
| `cardVariant` | `String` | `'bordered'` | Gaya kontainer kartu: `'bordered'`, `'flat'`, `'glass'`, `'default'`. |
| `defaultItem` | `Object` | `null` | Template data nilai bawaan untuk baris baru. |
| `errors` | `Object` | `{}` | Objek galat validasi Laravel/Inertia (misal `errors['pendaftar.0.nama']`). |
| `emptyTitle` | `String` | `'Belum ada data'` | Judul pesan saat data kosong (ketika `min: 0`). |
| `emptyDescription`| `String` | `'Klik tombol...'`| Penjelasan saat data kosong. |

---

## ⚡ Events / Emits

| Event | Payload | Keterangan |
|---|---|---|
| `update:modelValue` | `Array` | Dipicu setiap kali ada perubahan pada data array. |
| `change` | `Array` | Dipicu saat nilai field atau jumlah item berubah. |
| `item-add` | `{ item, index }` | Dipicu saat baris baru berhasil ditambahkan. |
| `item-remove` | `{ item, index }` | Dipicu saat sebuah baris dihapus. |
| `item-duplicate` | `{ item, newIndex }` | Dipicu saat baris diduplikasi. |
| `item-move` | `{ fromIndex, toIndex }` | Dipicu saat urutan baris digeser ke atas atau ke bawah. |
| `max-reached` | `Number` | Dipicu saat pengguna mencoba menambah item melampaui batas maksimal `max`. |

---

## 🧩 Scoped Slots

| Slot Name | Parameter Slot | Deskripsi |
|---|---|---|
| `#default` | `{ item, index, remove, canRemove, isFirst, isLast, moveUp, moveDown, duplicate, updateField }` | Mengganti seluruh isi bidang formulir di dalam kartu baris. |
| `#item-header` | `{ item, index, title, remove, canRemove, toggleCollapse, isCollapsed }` | Mengganti tampilan header kartu baris dan tombol aksinya. |
| `#add-button` | `{ add, canAdd, count, max, isMaxReached }` | Mengganti tampilan tombol tambah dan status limitasi. |
| `#field-[name]` | `{ item, index, field, value, update }` | Kustomisasi tampilan input untuk field spesifik berdasarkan namanya. |

