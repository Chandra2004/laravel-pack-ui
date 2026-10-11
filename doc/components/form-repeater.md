# InputRepeater Component

Komponen formulir dinamis multi-baris (*dynamic form repeater*) enterprise untuk mengelola sekumpulan data berulang terstruktur seperti item faktur, rincian biaya, alokasi tim, spesifikasi teknis, daftar kontak darurat, maupun riwayat pengalaman kerja.

---

## 01. Overview

InputRepeater menyediakan arsitektur berbasis kartu (*card repeater*) dengan dukungan manipulasi data dua arah (`v-model`), pengurutan seret-lepas (*HTML5 Drag and Drop*) beranimasi FLIP (*First, Last, Invert, Play*), tombol pemindahan urutan naik/turun, duplikasi baris instan, pelipatan akordeon (*collapsible*), validasi galat Laravel bersarang per-indeks (`items.0.name`), serta slot scoped untuk kustomisasi antarmuka tanpa batas.

### 1.1 Apa Entitas Ini

**Vue Component** (Single File Component) yang berlokasi di [InputRepeater.vue](file:///c:/SPEED/LARAVEL-PACK-UI/resources/js/Components/Pack/InputRepeater.vue) dengan inti logika rendering di [InputRepeater.vue](file:///c:/SPEED/LARAVEL-PACK-UI/resources/js/Components/Pack/Input/InputRepeater.vue). Komponen ini secara otomatis mengabstraksikan operasi array mutabel (tambah, hapus, duplikasi, pemindahan indeks) ke dalam antarmuka kartu terisolasi dengan animasi transisi yang mulus.

### 1.2 Fungsi Utama

- **Otomasi Grid Formulir**: Menerima skema kolom `fields` deklaratif dan secara instan merender form input berbasis komponen `InputField`.
- **Pengurutan Drag and Drop FLIP**: Mendukung pemindahan posisi baris secara visual menggunakan HTML5 Drag and Drop API dengan garis panduan (*drop indicator line*) presisi tinggi.
- **Aksi Baris Mandiri**: Setiap kartu dilengkapi kontrol terintegrasi untuk pemindahan naik (`moveUp`), pemindahan turun (`moveDown`), duplikasi baris (`duplicateItem`), lipat/buka (`toggleCollapse`), dan hapus (`removeItem`).
- **Pelipatan Akordeon (Collapsible)**: Mengurangi beban visual pada formulir yang memiliki banyak kolom dengan menyembunyikan isi isian dan hanya menampilkan baris ringkasan judul.
- **Sinkronisasi Validasi Laravel**: Menguraikan galat validasi formulir dari bagasi `errors` Inertia/Laravel ke masing-masing bidang masukan berdasarkan pola indeks baris.
- **Ekspos API Terprogram**: Mengekspos metode pengendali publik (`addItem`, `removeItem`, `duplicateItem`, `moveUp`, `moveDown`, `toggleCollapse`, `createBlankItem`, `items`) melalui template ref.

### 1.3 Kapan Digunakan

- Pengisian item transaksi keuangan seperti *line items* invoice, kwitansi, atau penawaran harga (*quotation*).
- Pendaftaran anggota tim, kontak darurat, atau data tanggungan pada sistem informasi sumber daya manusia (HRIS).
- Pengisian daftar inventaris, katalog produk dengan spesifikasi varian majemuk, atau logistik pengiriman.
- Formulir riwayat hidup (CV), pengalaman kerja, riwayat pendidikan, dan sertifikasi keahlian.
- Konfigurasi parameter teknis seperti *environment variables*, pemetaan port kontainer, atau aturan *firewall*.

### 1.4 Karakteristik Penting

- **Identitas Stabil**: Menghasilkan `_repeater_id` unik non-enumerable pada setiap objek data untuk mencegah rendering ulang yang merusak fokus kursor dan state komponen internal.
- **Kepatuhan Batas Minimum & Maksimum**: Menjamin jumlah data tidak berkurang di bawah prop `min` dan mencegah penambahan melebihi prop `max`.
- **Integrasi Penuh Scoped Slots**: Menyediakan slot `#default` untuk perancangan formulir bebas, `#item-header` untuk kustomisasi judul kartu, serta `#field-{name}` untuk menyisipkan input khusus.
- **Desain Modern Tailwind CSS**: Mendukung varian kartu `bordered`, `flat`, `glass`, dan `default` yang adaptif terhadap tema terang dan gelap.

---

## 02. Preview

Rujukan rute showcase interaktif dan pengujian live native:

- Rute Demo Native: `http://localhost:8000/demo/form-repeater` (atau alias `http://localhost:8000/demo/input-repeater`)
- Rute Portal Preview: `http://localhost:8000/preview/form-repeater`

---

## 03. Usage

### Pohon Konsep Penggunaan

```text
InputRepeater
├── Mode Otomatis (Prop `fields`)
│   ├── Formulir Sederhana 1 Kolom (fields + columns=1)
│   ├── Formulir Berkolom Ganda (fields + columns=2/3)
│   └── Formulir Kolapsibel (fields + collapsible=true)
├── Mode Kustom Penuh (Scoped Slots)
│   ├── Custom Item Body (#default)
│   ├── Custom Item Header (#item-header)
│   └── Custom Slot per-Field (#field-{name})
└── Pengendalian Terprogram
    ├── Template Ref (ref.value.addItem())
    └── Sinkronisasi Laravel Inertia (form.items)
```

### Sintaks Dasar Single File Component

Import komponen `<InputRepeater />` dan hubungkan array data reaktif melalui `v-model`:

```vue
<script setup>
import { ref } from 'vue';
import InputRepeater from '@/Components/Pack/InputRepeater.vue';

const invoiceItems = ref([
    {
        serviceName: 'Pengembangan API Gateway Enterprise',
        qty: 1,
        unitPrice: 15000000,
        notes: 'Termasuk integrasi OAuth2 dan enkripsi token HMAC.',
    },
]);

const fields = [
    { name: 'serviceName', label: 'Nama Layanan / Modul', type: 'text', colSpan: 1, placeholder: 'cth: Lisensi Software' },
    { name: 'qty', label: 'Kuantitas Unit', type: 'number', colSpan: 1, placeholder: '1' },
    { name: 'unitPrice', label: 'Tarif Satuan (IDR)', type: 'number', colSpan: 1, placeholder: '0' },
    { name: 'notes', label: 'Keterangan Spesifikasi', type: 'textarea', colSpan: 'full', placeholder: 'Rincian lingkup kerja...' },
];
</script>

<template>
    <InputRepeater
        v-model="invoiceItems"
        :fields="fields"
        :columns="2"
        card-variant="bordered"
        item-title="Layanan TI"
        add-button-text="Tambah Item Baru"
        :min="1"
        :max="10"
        collapsible
    />
</template>
```

---

## 04. Anatomy

Struktur anatomi visual komponen `InputRepeater` dirancang secara hierarkis untuk menjamin kenyamanan interaksi pengguna:

```text
+-------------------------------------------------------------------------+
| [1] Top Header Bar (Optional)                                           |
| Total: 3 / 10                           [+ Tambahkan Data (Atas)]       |
+-------------------------------------------------------------------------+
| [2] Repeater Card Container                                             |
| +---------------------------------------------------------------------+ |
| | [3] Card Header                                                     | |
| | [::] (Drag)  [1] (Index)  Judul Item #1           [^] [v] [D] [^] [X] | |
| +---------------------------------------------------------------------+ |
| | [4] Card Body (Fields Grid / #default slot)                         | |
| | +--------------------------------+ +------------------------------+ | |
| | | InputField: Nama Layanan       | | InputField: Kategori         | | |
| | +--------------------------------+ +------------------------------+ | |
| | +--------------------------------+ +------------------------------+ | |
| | | InputField: Qty                | | InputField: Tarif Satuan     | | |
| | +--------------------------------+ +------------------------------+ | |
| | +-----------------------------------------------------------------+ | |
| | | InputField: Catatan (colSpan: 'full')                           | | |
| | +-----------------------------------------------------------------+ | |
| +---------------------------------------------------------------------+ |
|                                                                         |
| === [5] Drop Indicator Line (Muncul saat proses drag berlangsung) ===   |
|                                                                         |
+-------------------------------------------------------------------------+
| [6] Bottom Action Bar                                                   |
| [+ Tambah Item Baru]                      Jumlah: 3 entri | Kapasitas Ok|
+-------------------------------------------------------------------------+
```

### Rincian Bagian Anatomi

1. **Top Header Bar**: Area ringkasan atas opsional (`addPosition="header"` atau `"both"`) yang menampilkan jumlah data terkini dan tombol penambah cepat.
2. **Repeater Card Container**: Bingkai pembungkus masing-masing baris data dengan animasi FLIP smooth transition.
3. **Card Header**:
   - **Drag Handle**: Ikon pegangan titik enam untuk memulai seret-lepas dengan mouse.
   - **Index Badge**: Indikator nomor urut baris (1, 2, 3...) yang diperbarui secara otomatis.
   - **Item Title & Subtitle**: Judul deskriptif yang dapat dikonfigurasi melalui teks statis atau fungsi dinamis.
   - **Row Actions Group**: Deretan tombol aksi mencakup Pindah Atas, Pindah Bawah, Duplikasi, Lipat/Buka Akordeon, dan Hapus.
4. **Card Body**: Area formulir berisi kisi-kisi input otomatis berdasarkan skema `fields` atau konten bebas melalui scoped slot `#default`.
5. **Drop Indicator Line**: Garis biru menyala dengan titik tumpuan ganda untuk memberikan umpan balik visual lokasi penyisipan baris.
6. **Bottom Action Bar**: Tombol utama penambah entri formulir di bagian bawah beserta status batasan minimum dan maksimum.

---

## 05. Variants

Prop `cardVariant` mengatur penampilan visual kartu pembungkus setiap baris repeater:

| Nama Nilai | Kapan Dipakai | Ringkasan Visual |
|---|---|---|
| `bordered` | Standar formulir bertingkat dengan latar belakang netral | Latar putih/gelap dengan border border-slate-200/90 tebal tipis dan shadow-2xs |
| `flat` | Formulir dalam kartu modal, drawer, atau panel bertingkat | Latar abu-abu datar halus tanpa border tebal |
| `glass` | Landing page, dashboard estetis, atau antarmuka modern | Efek kaca glassmorphism modern dengan backdrop-blur-md dan border semi-transparan |
| `default` | Formulir minimalis dengan pemisahan halus | Penampilan solid minimalis dengan garis batas tipis yang menyatu |
| `elevated` | Penekanan kedalaman kartu formulir berlapis | Kartu dengan bayangan terangkat lembut shadow-md |
| `accent` | Formulir bertema warna atau entri prioritas khusus | Kartu dengan aksen border sisi kiri atau border bertema |

---

## 06. Sizes

### Skala Dimensi Padding (`size`)

Komponen menyediakan 3 skala proporsi visual:

- **`sm`**: Padding `p-3`, header ringkas, teks label `text-xs`. Direkomendasikan untuk formulir sempit di dalam drawer samping atau modal popover.
- **`md`**: Padding `p-4`, spasi seimbang, ukuran default untuk sebagian besar kebutuhan formulir aplikasi web enterprise.
- **`lg`**: Padding `p-5`, spasi luas, target klik besar untuk kemudahan pengisian pada perangkat tablet atau layar sentuh.

### Penataan Kolom Grid (`columns`)

Prop `columns` menentukan jumlah lajur kisi pada bagian isi kartu:

- `columns: 1`: Seluruh bidang masukan tersusun memanjang ke bawah dalam satu kolom tunggal.
- `columns: 2` (**Default**): Tata letak dua kolom responsif yang otomatis berubah menjadi satu kolom pada layar ponsel.
- `columns: 3`: Tata letak tiga kolom untuk formulir dengan masukan ringkas (seperti Nama, Email, Peran).
- `columns: 4`: Tata letak empat kolom untuk data tabular ringkas (SKU, Qty, Harga, Diskon).

Masing-masing objek kolom pada skema `fields` dapat menentukan proporsi lebarnya sendiri:
- `colSpan: 1`: Menempati 1 kolom standar.
- `colSpan: 2` atau `'2'`: Membentang sepanjang 2 kolom (`sm:col-span-2`).
- `colSpan: 'full'`: Membentang melintasi seluruh lebar kolom grid yang tersedia.

---

## 07. States

| State | Indikator Visual & Mekanisme Internal | Perilaku Pengguna |
| :--- | :--- | :--- |
| **Normal / Idle** | Seluruh kartu terbuka, field input interaktif, kontrol baris aktif. | Pengguna dapat mengisi formulir, mengubah urutan, atau menambah baris baru. |
| **Collapsed** | Badan kartu tersembunyi dengan transisi rolling accordion (`grid-rows-[0fr]`), menyisakan header ringkas. | Ikon chevron berputar 90 derajat; mengklik header atau tombol chevron akan membuka kembali isian kartu. |
| **Dragging** | Kartu yang diseret memiliki `opacity-40 scale-[0.98]` dengan garis tepi putus-putus (*dashed border*). | Pengguna mengarahkan kursor mouse ke posisi sisip target di antara kartu-kartu lain. |
| **Drop Target Line** | Garis biru tebal dengan aksen titik tumpu ganda muncul di atas (`before`) atau di bawah (`after`) kartu target. | Memberikan petunjuk visual lokasi indeks tempat kartu yang diseret akan disisipkan saat tombol mouse dilepas. |
| **Just Added** | Kartu yang baru dibuat diberi highlight cincin biru menyala (`ring-2 ring-blue-500/60`) selama 1.2 detik. | Membantu mata pengguna langsung fokus ke baris baru yang baru saja disisipkan. |
| **Moving** | Kartu yang sedang dipindahkan posisinya diberi elevasi bayangan tebal (`shadow-lg ring-1 ring-blue-500/40`). | Menandakan perubahan urutan akibat penekanan tombol naik atau turun. |
| **Max Reached** | Tombol tambah berstatus `disabled` dengan opacity 50%, badge status menampilkan teks 'Maksimal Tercapai'. | Pemanggilan fungsi tambah tidak akan mengeksekusi penambahan baris baru dan memancarkan event `@max-reached`. |
| **Min Bound** | Tombol hapus pada baris berstatus `disabled` dengan opacity 30% dan kursor *not-allowed*. | Mencegah penghapusan jika jumlah baris yang tersisa sama dengan prop `min`. |
| **Disabled Mode** | Seluruh tombol aksi, tombol tambah, dan field input tidak dapat dioperasikan. | Penampilan visual meredup dan drag-and-drop dinonaktifkan sepenuhnya. |
| **Readonly Mode** | Pengguna dapat melihat data dan membaca nilai, namun tombol modifikasi urutan dan penghapusan dinonaktifkan. | Cocok untuk mode pratinjau verifikasi berkas sebelum persetujuan akhir (*approval*). |

---

## 08. Props / Attributes

Spesifikasi lengkap properti yang diterima oleh komponen `InputRepeater`:

| Nama Prop | Tipe Data | Nilai Bawaan | Opsi / Rentang | Penjelasan Fungsional |
| :--- | :--- | :--- | :--- | :--- |
| `modelValue` | `Array` | `[]` | Array of Objects | Data utama yang disinkronisasi melalui dua arah `v-model`. |
| `fields` | `Array` | `[]` | Array of Field Objects | Skema kolom otomatis: `[{ name, label, type, placeholder, defaultValue, icon, colSpan, options, hint, required, disabled, readonly, props }]`. |
| `defaultItem` | `Object` | `null` | Any Object | Template data bawaan yang diisi saat pengguna menekan tombol tambah. Jika tidak ditentukan, template dibuat dari `defaultValue` skema `fields`. |
| `min` | `Number` | `1` | `>= 0` | Batas minimal jumlah baris yang wajib tersedia dalam formulir. |
| `max` | `Number` | `null` | `null \| Number` | Batas maksimal jumlah entri data yang diizinkan. |
| `addButtonText` | `String` | `'Tambahkan Data'` | String teks bebas | Label teks yang tertera pada tombol tambah baris. |
| `addIcon` | `String` | `'add'` | Nama icon Material | Ikon pada tombol penambah entri baris. |
| `addPosition` | `String` | `'bottom'` | `'bottom'`, `'top'`, `'both'`, `'header'`, `'none'` | Posisi penempatan tombol penambah data. |
| `addAlignment` | `String` | `'left'` | `'left'`, `'center'`, `'right'`, `'full'` | Penjajaran posisi tombol penambah data. |
| `rounded` | `String` | `'2xl'` | `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`, `'full'` | Kelengkungan sudut kartu pembungkus dan elemen internal. |
| `itemTitle` | `String \| Function` | `'Item'` | String atau `(item, index) => string` | Judul yang ditampilkan pada header kartu baris. |
| `itemSubtitle` | `String \| Function` | `''` | String atau `(item, index) => string` | Subjudul di bawah judul utama kartu baris. |
| `columns` | `Number \| String` | `2` | `1`, `2`, `3`, `4` | Jumlah kolom kisi formulir pada layar desktop. |
| `collapsible` | `Boolean` | `false` | `true`, `false` | Mengaktifkan kemampuan melipat dan membuka badan formulir kartu. |
| `defaultCollapsed` | `Boolean` | `false` | `true`, `false` | Menjadikan seluruh baris terlipat saat komponen pertama kali dirender. |
| `reorderable` | `Boolean` | `true` | `true`, `false` | Menampilkan tombol pemindahan urutan baris ke atas dan ke bawah. |
| `draggable` | `Boolean` | `true` | `true`, `false` | Mengaktifkan interaksi seret-lepas (drag-and-drop) HTML5. |
| `dragHandleOnly` | `Boolean` | `true` | `true`, `false` | Membatasi drag hanya pada ikon titik enam (mencegah bentrok seleksi teks formulir). |
| `deletable` | `Boolean` | `true` | `true`, `false` | Menampilkan tombol hapus baris. |
| `duplicable` | `Boolean` | `true` | `true`, `false` | Menampilkan tombol duplikasi instan baris data. |
| `confirmDelete` | `Boolean` | `true` | `true`, `false` | Memunculkan dialog konfirmasi sebelum eksekusi penghapusan. |
| `confirmDeleteTitle` | `String` | `'Hapus Entri Formulir?'` | String teks bebas | Judul dialog konfirmasi penghapusan baris. |
| `confirmDeleteMessage` | `String` | `'Apakah Anda yakin ingin menghapus entri ini? Seluruh data yang telah dimasukkan tidak dapat dikembalikan.'` | String teks bebas | Pesan penjelasan pada dialog konfirmasi penghapusan. |
| `swipeToDelete` | `Boolean` | `true` | `true`, `false` | Mengaktifkan gestur usap layar ponsel untuk menghapus baris. |
| `cardVariant` | `String` | `'bordered'` | `'bordered'`, `'flat'`, `'glass'`, `'default'`, `'elevated'`, `'accent'` | Gaya visual kartu pembungkus baris data. |
| `size` | `String` | `'md'` | `'sm'`, `'md'`, `'lg'` | Skala dimensi padding kartu dan teks kontrol. |
| `disabled` | `Boolean` | `false` | `true`, `false` | Menonaktifkan seluruh interaksi dan input formulir. |
| `readonly` | `Boolean` | `false` | `true`, `false` | Mengunci data dalam mode baca tanpa kontrol modifikasi. |
| `name` | `String` | `'items'` | Nama string | Nama atribut formulir untuk prefix penamaan field HTML dan pemetaan error. |
| `errors` | `Object` | `{}` | Key-value error bag | Objek galat validasi Laravel Inertia (misal: `{ 'items.0.name': 'Nama wajib diisi' }`). |
| `emptyTitle` | `String` | `'Belum ada data'` | String teks bebas | Judul saat daftar kosong (ketika `min: 0` dan tidak ada baris data). |
| `emptyDescription` | `String` | `'Klik tombol di bawah untuk menambahkan entri formulir pertama.'` | String teks bebas | Deskripsi instruksi pada kondisi data kosong. |

---

## 09. Slots

Komponen `InputRepeater` menyediakan sejumlah scoped slot untuk memberikan fleksibilitas perancangan tampilan tanpa mengorbankan logika internal:

| Nama Slot | Properti Slot yang Disediakan | Deskripsi Penggunaan |
| :--- | :--- | :--- |
| `#default` | `{ item, index, remove, canRemove, isFirst, isLast, moveUp, moveDown, duplicate, updateField }` | Mengambil alih rendering seluruh badan kartu formulir. Digunakan ketika formulir membutuhkan input kustom di luar skema standar `fields`. |
| `#item-header` | `{ item, index, title, remove, canRemove, toggleCollapse, isCollapsed, dragHandleProps, isDragging, isDragOver }` | Mengambil alih tampilan header kartu. Cocok untuk menampilkan avatar, status badge, tombol aksi khusus, atau indikator verifikasi. |
| `#field-{name}` | `{ item, index, field, value, update }` | Kustomisasi spesifik untuk kolom tertentu pada skema `fields` tanpa perlu merombak seluruh badan kartu. |
| `#add-button` | `{ add, canAdd, count, max, isMaxReached }` | Merancang tombol penambah data kustom (misal: tombol dengan menu dropdown pilihan tipe template data). |
| `#empty` | — | Mengambil alih tampilan kondisi kosong ketika tidak ada baris data dalam repeater. |

---

## 10. Events / Interactions

| Nama Event | Parameter Emitted | Waktu Pemicuan (Trigger Lifecycle) |
| :--- | :--- | :--- |
| `@update:modelValue` | `(items: Array)` | Dipancarkan secara instan setiap kali terjadi mutasi pada array data (penambahan, pengurangan, pengurutan, atau perubahan nilai input). |
| `@change` | `(items: Array)` | Dipancarkan saat nilai input pada salah satu field mengalami event `change`. |
| `@item-add` | `{ item: Object, index: Number }` | Dipancarkan tepat setelah entri baris baru berhasil disisipkan ke dalam array data. |
| `@item-remove` | `{ item: Object, index: Number }` | Dipancarkan tepat setelah sebuah baris data dihapus dari array. |
| `@item-duplicate` | `{ item: Object, newIndex: Number }` | Dipancarkan saat baris berhasil diduplikasi dan disisipkan di bawah baris sumber. |
| `@item-move` | `{ fromIndex: Number, toIndex: Number, method: 'drag' \| 'button' }` | Dipancarkan ketika baris berpindah posisi, baik melalui seret-lepas (*drag*) maupun tombol panah (*button*). |
| `@max-reached` | `(max: Number)` | Dipancarkan ketika penambahan baris ditolak karena jumlah data telah mencapai batas prop `max`. |
| `@drag-start` | `{ index: Number, item: Object }` | Dipancarkan saat operasi seret kartu dimulai oleh pengguna. |
| `@drag-end` | `{ index: Number }` | Dipancarkan saat kartu yang diseret dilepaskan atau dibatalkan. |
| `@delete-request` | `{ item: Object, index: Number }` | Dipancarkan saat permintaan konfirmasi hapus dipicu sebelum penghapusan. |
| `@delete-cancel` | `{ item: Object, index: Number }` | Dipancarkan saat konfirmasi penghapusan dibatalkan oleh pengguna. |

---

## 11. Code Example

Contoh implementasi komprehensif formulir penawaran proyek dengan skema kolom otomatis, validasi Laravel Inertia, dan ringkasan kalkulasi otomatis:

```vue
<script setup>
import { ref, computed } from 'vue';
import { useForm } from '@inertiajs/vue3';
import InputRepeater from '@/Components/Pack/InputRepeater.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

// Inisialisasi formulir Inertia
const form = useForm({
    clientName: 'PT Nusantara Teknologi Sejahtera',
    proposalDate: '2026-10-01',
    items: [
        {
            serviceName: 'Audit Arsitektur Cloud & Keamanan',
            category: 'consulting',
            qty: 1,
            unitPrice: 25000000,
            notes: 'Peninjauan konfigurasi VPC, IAM roles, dan kepatuhan ISO 27001.',
        },
        {
            serviceName: 'Migrasi Database Multi-Region',
            category: 'infrastructure',
            qty: 2,
            unitPrice: 18000000,
            notes: 'Penerapan replikasi data zero-downtime antar data center.',
        },
    ],
});

// Definisi skema input kolom
const fields = [
    {
        name: 'serviceName',
        type: 'text',
        label: 'Nama Layanan / Modul',
        placeholder: 'cth: Lisensi Software',
        icon: 'dns',
        colSpan: 1,
        required: true,
    },
    {
        name: 'category',
        type: 'select',
        label: 'Kategori Pekerjaan',
        icon: 'category',
        colSpan: 1,
        options: [
            { label: 'Konsultasi & Audit', value: 'consulting' },
            { label: 'Infrastruktur Cloud', value: 'infrastructure' },
            { label: 'Pengembangan Perangkat Lunak', value: 'software' },
            { label: 'Dukungan Teknis & SLA', value: 'support' },
        ],
    },
    {
        name: 'qty',
        type: 'number',
        label: 'Kuantitas Unit',
        placeholder: '1',
        icon: 'numbers',
        colSpan: 1,
        defaultValue: 1,
        required: true,
    },
    {
        name: 'unitPrice',
        type: 'number',
        label: 'Tarif Satuan (IDR)',
        placeholder: '0',
        icon: 'payments',
        colSpan: 1,
        defaultValue: 0,
        required: true,
    },
    {
        name: 'notes',
        type: 'textarea',
        label: 'Rincian Spesifikasi & Deliverable',
        placeholder: 'Deskripsikan output yang diharapkan...',
        icon: 'description',
        colSpan: 'full',
    },
];

// Kalkulasi total biaya secara reaktif
const grandTotal = computed(() => {
    return form.items.reduce((acc, curr) => {
        const qty = Number(curr.qty) || 0;
        const price = Number(curr.unitPrice) || 0;
        return acc + (qty * price);
    }, 0);
});

function formatCurrency(val) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
}

function submitProposal() {
    form.post('/proposals', {
        preserveScroll: true,
        onSuccess: () => {
            alert('Proposal penawaran berhasil diajukan!');
        },
    });
}
</script>

<template>
    <form @submit.prevent="submitProposal" class="max-w-4xl mx-auto space-y-6 p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800">
        <div>
            <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">Penyusunan Rincian Penawaran Proyek</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">Silakan tambahkan modul layanan dan rincian alokasi biaya yang ditawarkan kepada klien.</p>
        </div>

        <InputRepeater
            v-model="form.items"
            :fields="fields"
            :columns="2"
            card-variant="bordered"
            size="md"
            add-position="both"
            add-button-text="Tambah Modul Layanan"
            item-title="Modul Penawaran"
            :min="1"
            :max="8"
            collapsible
            reorderable
            draggable
            duplicable
            deletable
            :errors="form.errors"
            name="items"
        />

        <!-- Ringkasan Kalkulasi -->
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
                <span class="text-slate-500 dark:text-slate-400">Total Biaya Penawaran Bersih:</span>
                <div class="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {{ formatCurrency(grandTotal) }}
                </div>
            </div>
            <ButtonSubmit
                type="submit"
                variant="primary"
                size="md"
                :loading="form.processing"
                text="Simpan Penawaran Proyek"
                loading-text="Menyimpan Proposal..."
            />
        </div>
    </form>
</template>
```

---

## 12. Result / Behavior

1. **Inisialisasi Data Cerdas**: Komponen secara otomatis memeriksa jumlah data awal. Jika data kosong dan prop `min` lebih besar dari 0, komponen akan membuat objek kosong sebanyak nilai `min` secara otomatis.
2. **Pelacakan ID Non-Enumerate**: Setiap objek yang masuk ke dalam list disuntik properti non-enumerable `_repeater_id`. Hal ini memungkinkan Vue `TransitionGroup` mempertahankan kunci unik yang stabil tanpa mengotori hasil serialisasi data saat dikirim ke server via HTTP POST/PUT.
3. **Animasi FLIP Multi-Arah**: Saat baris dipindahkan posisinya (baik melalui tombol naik/turun maupun drag-and-drop), elemen kartu lain bergeser secara mulus menggunakan kurva gerak `cubic-bezier(0.16, 1, 0.3, 1)`.
4. **Penanganan Validasi Otomatis**: Jika backend Laravel mengembalikan kesalahan validasi bersarang seperti `items.1.serviceName`, komponen secara otomatis mengekstrak pesan kesalahan tersebut dan meneruskannya ke bidang input pada baris ke-2 kolom `serviceName`.
5. **Pencegahan Kehilangan Data Tak Terduga**: Jika prop `confirmDelete` diaktifkan, dialog konfirmasi peramban akan muncul sebelum data dihapus dari memori.

---

## 13. Customization

### Kustomisasi Penuh Menggunakan Scoped Slot `#default`

Jika formulir membutuhkan tata letak unik (misalnya menampilkan komponen file upload, peta lokasi, atau tombol aksi khusus di dalam badan kartu), gunakan scoped slot `#default`:

```vue
<template>
    <InputRepeater v-model="emergencyContacts">
        <template #default="{ item, updateField }">
            <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InputField
                        label="Nama Kontak Darurat"
                        v-model="item.contactName"
                        placeholder="Nama kerabat..."
                        icon="person"
                        @change="updateField('contactName', item.contactName)"
                    />
                    <InputField
                        label="Hubungan Kerabat"
                        v-model="item.relationship"
                        type="select"
                        :options="[
                            { label: 'Orang Tua', value: 'parents' },
                            { label: 'Pasangan (Suami/Istri)', value: 'spouse' },
                            { label: 'Saudara Kandung', value: 'sibling' },
                        ]"
                        icon="family_restroom"
                        @change="updateField('relationship', item.relationship)"
                    />
                </div>
                <InputField
                    label="Nomor Telepon Darurat"
                    v-model="item.phone"
                    placeholder="081234567890"
                    icon="phone"
                    @change="updateField('phone', item.phone)"
                />
            </div>
        </template>
    </InputRepeater>
</template>
```

### Kustomisasi Header Kartu Menggunakan Slot `#item-header`

Anda dapat menyisipkan badge status dinamis, inisial pengguna, atau menu tambahan di bagian atas kartu:

```vue
<template>
    <InputRepeater v-model="members">
        <template #item-header="{ item, index, remove, canRemove, toggleCollapse, isCollapsed }">
            <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center font-mono">
                        {{ index + 1 }}
                    </span>
                    <span class="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {{ item.name || 'Anggota Belum Bernama' }}
                    </span>
                    <Badge variant="indigo" size="sm">{{ item.role || 'Contributor' }}</Badge>
                </div>

                <div class="flex items-center gap-1">
                    <button type="button" @click="toggleCollapse" class="p-1 text-slate-400 hover:text-slate-600">
                        <span class="material-symbols-outlined text-base">{{ isCollapsed ? 'expand_more' : 'expand_less' }}</span>
                    </button>
                    <button v-if="canRemove" type="button" @click="remove" class="p-1 text-slate-400 hover:text-rose-600">
                        <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                </div>
            </div>
        </template>
    </InputRepeater>
</template>
```

---

## 14. Accessibility

Komponen dirancang mengikuti standar aksesibilitas antarmuka pengguna WAI-ARIA:

- **Alternative to Drag-and-Drop**: Seluruh pengguna yang menggunakan navigasi keyboard atau pembaca layar (*screen reader*) dapat mengubah urutan baris menggunakan tombol panah naik dan turun yang memiliki atribut `aria-label="Pindah ke Atas"` dan `aria-label="Pindah ke Bawah"`.
- **Drag Handle Separation**: Prop `dragHandleOnly="true"` (default) memisahkan target seret mouse pada ikon pegangan khusus, sehingga seleksi teks pada input di dalam kartu tidak terganggu oleh event *drag start*.
- **Touch Targets**: Seluruh tombol aksi header kartu (naik, turun, duplikasi, lipat, hapus) memiliki dimensi minimum 28x28 piksel dengan area sentuh efektif yang memadai untuk penggunaan jemari pada perangkat seluler.
- **Focus Retention**: Berkat pelacakan `_repeater_id`, pergerakan urutan elemen tidak menyebabkan input kehilangan fokus kursor aktif (`document.activeElement`).

---

## 15. Responsive Behavior

- **Mobile Grid Flattening**: Kisi-kisi formulir multi-kolom (`columns: 2`, `columns: 3`, atau `columns: 4`) secara otomatis melebur menjadi 1 kolom penuh pada breakpoint di bawah `640px` (layar ponsel).
- **Header Actions Wrapping**: Bilah kontrol aksi pada header kartu menggunakan tata letak `flex items-center gap-1 shrink-0` dengan pemotongan teks judul otomatis (`truncate`), mencegah tombol meluap ke luar kartu di layar sempit.
- **Touch Gestures Fallback**: Pada peramban perangkat seluler yang tidak mendukung event `HTML5 dragstart`, tombol panah naik dan turun tetap tersedia penuh untuk mengatur urutan baris secara instan.

---

## 16. Do / Don't

| Do (Praktik Direkomendasikan) | Don't (Praktik Dihindari) |
| :--- | :--- |
| **Gunakan `defaultItem` untuk nilai awal yang konsisten**: Sediakan objek template bawaan agar baris baru yang ditambahkan memiliki struktur atribut yang lengkap. | **Jangan mengubah array `modelValue` secara langsung di luar komponen**: Hindari memanggil `splice()` atau `push()` pada array induk tanpa memperhatikan sinkronisasi ID internal. |
| **Aktifkan `collapsible` jika baris formulir panjang**: Gunakan mode lipat akordeon jika masing-masing entri memiliki lebih dari 3 input agar halaman formulir tetap rapi. | **Jangan matikan kedua opsi reorder**: Jika menonaktifkan `draggable`, pastikan `reorderable` tetap aktif agar pengguna tetap dapat menyusun urutan prioritas data. |
| **Gunakan `itemTitle` berupa fungsi untuk judul kontekstual**: Kembalikan nama entitas yang sedang diisi (misal: `(item) => item.serviceName || 'Layanan Baru'`) agar baris terlipat mudah dikenali. | **Jangan mengabaikan prop `min` dan `max`**: Jangan membiarkan pengguna menghapus baris hingga 0 jika backend Anda mewajibkan setidaknya satu baris transaksi (`min: 1`). |
| **Sediakan `name` unik untuk pemetaan galat**: Berikan nilai `name="order_items"` yang sesuai dengan skema validasi `FormRequest` Laravel backend Anda. | **Jangan menaruh komponen repeater bersarang (*nested repeater*) tanpa membatasi kolom**: Form repeater bersarang di dalam repeater lain akan membuat tampilan sempit jika menggunakan banyak kolom. |

---

## 17. Examples / Recipes

### Recipe 1: Faktur Tagihan Line Items dengan Perhitungan Pajak

```vue
<script setup>
import { ref, computed } from 'vue';
import InputRepeater from '@/Components/Pack/InputRepeater.vue';

const items = ref([
    { sku: 'SRV-01', name: 'Dedicated Server E5', qty: 2, price: 3500000 },
    { sku: 'LIC-99', name: 'Control Panel Enterprise', qty: 2, price: 450000 },
]);

const fields = [
    { name: 'sku', label: 'Kode SKU', type: 'text', icon: 'qr_code', colSpan: 1 },
    { name: 'name', label: 'Deskripsi Item', type: 'text', icon: 'inventory_2', colSpan: 1 },
    { name: 'qty', label: 'Jumlah', type: 'number', icon: 'tag', colSpan: 1, defaultValue: 1 },
    { name: 'price', label: 'Harga Satuan (IDR)', type: 'number', icon: 'payments', colSpan: 1, defaultValue: 0 },
];

const subtotal = computed(() => {
    return items.value.reduce((acc, it) => acc + ((Number(it.qty) || 0) * (Number(it.price) || 0)), 0);
});
</script>

<template>
    <div class="space-y-4">
        <InputRepeater
            v-model="items"
            :fields="fields"
            :columns="2"
            item-title="Item Tagihan"
            add-button-text="Tambah Item Tagihan"
            :min="1"
            :max="15"
        />
        <div class="text-right text-sm font-bold text-slate-800 dark:text-slate-200">
            Total Subtotal: Rp {{ subtotal.toLocaleString('id-ID') }}
        </div>
    </div>
</template>
```

### Recipe 2: Riwayat Karir & Pengalaman Kerja dengan Fungsi Judul Dinamis

```vue
<script setup>
import { ref } from 'vue';
import InputRepeater from '@/Components/Pack/InputRepeater.vue';

const experiences = ref([
    { company: 'PT Finansial Unggul', position: 'Tech Lead', startYear: '2021', endYear: 'Sekarang', description: 'Memimpin tim engineering 12 orang.' },
]);

const fields = [
    { name: 'company', label: 'Nama Perusahaan', type: 'text', icon: 'domain', colSpan: 1 },
    { name: 'position', label: 'Jabatan Terakhir', type: 'text', icon: 'badge', colSpan: 1 },
    { name: 'startYear', label: 'Tahun Mulai', type: 'text', icon: 'calendar_today', colSpan: 1 },
    { name: 'endYear', label: 'Tahun Selesai', type: 'text', icon: 'event', colSpan: 1 },
    { name: 'description', label: 'Pencapaian & Deskripsi Peran', type: 'textarea', icon: 'description', colSpan: 'full' },
];
</script>

<template>
    <InputRepeater
        v-model="experiences"
        :fields="fields"
        :columns="2"
        collapsible
        :default-collapsed="false"
        :item-title="(it) => it.position || 'Posisi Pekerjaan'"
        :item-subtitle="(it) => it.company ? `${it.company} (${it.startYear || ''} - ${it.endYear || ''})` : ''"
        add-button-text="Tambah Riwayat Pekerjaan"
        card-variant="bordered"
        :min="1"
        :max="6"
    />
</template>
```

### Recipe 3: Manajemen Anggota Tim Proyek Menggunakan Template Ref Programmatik

```vue
<script setup>
import { ref } from 'vue';
import InputRepeater from '@/Components/Pack/InputRepeater.vue';

const repeaterRef = ref(null);

const team = ref([
    { name: 'Budi Santoso', role: 'DevOps Engineer', email: 'budi@company.id' },
]);

const fields = [
    { name: 'name', label: 'Nama Personel', type: 'text', icon: 'person', colSpan: 1 },
    { name: 'role', label: 'Peran Tanggung Jawab', type: 'text', icon: 'work', colSpan: 1 },
    { name: 'email', label: 'Surel Perusahaan', type: 'email', icon: 'mail', colSpan: 2 },
];

function tambahOtomatis() {
    repeaterRef.value?.addItem();
}
</script>

<template>
    <div class="space-y-4">
        <div class="flex justify-between items-center">
            <h3 class="text-sm font-bold">Daftar Tim Proyek</h3>
            <button
                type="button"
                @click="tambahOtomatis"
                class="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg font-bold"
            >
                Tambah Cepat via API Ref
            </button>
        </div>

        <InputRepeater
            ref="repeaterRef"
            v-model="team"
            :fields="fields"
            :columns="2"
            item-title="Personel Tim"
            :min="1"
            :max="10"
        />
    </div>
</template>
```

---

## 18. Related Components

- [InputField](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/input-field.md): Fasad input universal yang digunakan secara internal oleh `InputRepeater` untuk merender field masukan teks, angka, pilihan (*select*), dan textarea.
- [Card](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/card.md): Kontainer pembungkus konten berstruktur header, body, dan footer.
- [DragDrop](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/drag-drop.md): Komponen pengurutan drag-and-drop mandiri untuk daftar umum atau kartu Kanban.
- [Badge](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/badge.md): Penanda nomor urut dan status kuantitas data.
- [ButtonSubmit](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/button-submit.md): Tombol pengiriman formulir dengan proteksi multi-klik dan feedback status asinkron.
- [FilterToolbar](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/filter-toolbar.md): Bilah pencarian dan penyaringan data terintegrasi.
- [Table](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/table.md): Tampilan data tabular terstruktur untuk menyajikan sekumpulan data hasil formulir.

---

## 19. Notes / Limitations

- **Identifikasi Non-Enumerable `_repeater_id`**: Komponen menyematkan properti `_repeater_id` dengan konfigurasi `enumerable: false`. Hal ini memastikan bahwa saat data diserialisasi melalui `JSON.stringify(items)` atau dikirimkan melalui `form.post()` pada Inertia, properti internal tersebut tidak terkirim ke server.
- **Dukungan Touch Screen pada Mobile**: Pustaka HTML5 Drag and Drop bawaan peramban memiliki keterbatasan pada layar sentuh ponsel. Oleh karena itu, tombol navigasi naik (`arrow_upward`) dan turun (`arrow_downward`) tetap aktif dan dapat ditekan dengan sentuhan jari untuk menggeser posisi entri secara aman.
- **Skalabilitas Data**: `InputRepeater` dioptimalkan untuk formulir berulang berskala 1 hingga 50 entri data. Jika data Anda melebihi 100 baris dengan ratusan field masukan, pertimbangkan untuk menggunakan pagination baris atau beralih ke komponen `Table` berbasis *inline editing* untuk menghemat konsumsi memori DOM.
- **Validasi Server-Side**: Pastikan konfigurasi rules Laravel Anda menggunakan pola wildcard array, contoh: `'items.*.serviceName' => 'required|string|max:255'`, `'items.*.qty' => 'required|integer|min:1'`. Prop `:errors="form.errors"` akan memetakan galat tersebut secara tepat ke input yang bersangkutan.
