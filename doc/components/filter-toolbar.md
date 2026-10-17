# FilterToolbar Component

Komponen bilah filter data terpadu (*dynamic filter toolbar*) yang dirancang khusus untuk menyederhanakan penyaringan data tabel secara cepat, interaktif, dan terstruktur. Dilengkapi input pencarian ter-debounce, tombol filter tanggal cepat (*quick date presets*), selektor status opsi, tombol reset dinamis dengan lencana penghitung filter aktif, kustomisasi props yang kaya (`size`, `rounded`, `variant`, `colorTheme`, `icons`, `labels`), serta dukungan integrasi otomatis dengan composable `useServerTable.js`.

---

## 01. Overview

`FilterToolbar.vue` menyediakan antarmuka terpusat untuk kontrol penyaringan data tabel aplikasi enterprise.

### 1.1 Apa Entitas Ini
Komponen Vue 3 berbasis Composition API (`packages/laravel-pack-ui/resources/js/Components/Pack/FilterToolbar.vue`) yang mengoordinasikan parameter pencarian kata kunci, preset rentang waktu, dan status kategori dalam satu bilah navigasi yang ringkas, responsif, dan dapat dikustomisasi secara fleksibel. Tersedia juga `FilterToolbarComponent.vue` sebagai alias facade resmi untuk diimpor di aplikasi.

### 1.2 Fungsi Utama
- Menyediakan input pencarian terpadu dengan jeda waktu debounce (default 350ms) dan tombol pembersihan instan (*clear button*).
- Menampilkan bilah preset tanggal cepat berformat pil tersegmentasi (`Semua`, `Hari Ini`, `7 Hari`, `30 Hari`, `Bulan Ini`).
- Menyediakan dropdown pemilih status data yang dapat disesuaikan label dan pilihannya.
- Menyediakan tombol reset adaptif yang hanya muncul ketika ada filter yang sedang aktif, lengkap dengan lencana penghitung jumlah filter aktif.
- Kustomisasi menyeluruh melalui props: `size` (sm, md, lg), `rounded`/`radius` (none, sm, md, lg, xl, 2xl, 3xl, full), `variant` (default, card, soft, glass, minimal, flat, accent, floating), dan `colorTheme` (primary, slate, emerald, rose, amber, violet, indigo, dark).
- Menyediakan integrasi dua arah otomatis dengan composable `useServerTable.js` melalui prop `:table="table"`.
- Menyediakan slot ekspansi kustom untuk filter tambahan (`#filters`), aksi tabel (`#actions`), chip/tag aktif (`#chips`, `#tags`), serta area bawah (`#bottom`).

### 1.3 Kapan Digunakan
- Pada bagian atas tabel data master (seperti transaksi penjualan, daftar pengguna, atau log aktivitas).
- Pada halaman laporan analitik untuk membatasi rentang tanggal data yang divisualisasikan.
- Pada modul manajemen tiket bantuan (*helpdesk*) untuk menyaring tiket berdasarkan prioritas dan status penanganan.
- Pada modul e-commerce untuk menyaring pesanan berbasis status workflow (pilled status tabs).

### 1.4 Karakteristik Penting
- **Debounced Server Protection**: Menahan pengiriman permintaan HTTP hingga pengguna berhenti mengetik selama durasi debounce yang ditentukan, menghemat beban server backend secara drastis.
- **Dynamic Active Badge Counter**: Secara cerdas menghitung berapa banyak kriteria filter yang sedang menyimpang dari nilai default untuk ditampilkan pada tombol reset.
- **Tokenized Customization Props**: Seluruh ukuran, kelengkungan border, varian visual, dan tema warna diatur via token terpusat tanpa harcode styling lokal.
- **Radius Propagation**: Token `effectiveRadius` (prioritas: `radius` > `rounded` > `2xl`) otomatis diteruskan ke seluruh sub-komponen internal (InputField, CtaButton) dan ke semua slot melalui parameter `innerRadius`.

---

## 02. Preview

Rujukan rute showcase interaktif dan pengujian live native:

- Rute Demo Native: `/demo/filter-toolbar`
- Rute Portal Preview: `/preview/filter-toolbar`

---

## 03. Usage

### Pohon Konsep Penggunaan

```text
FilterToolbar
├── Konfigurasi Props Tampilan (Developer Customization)
│   ├── size ('sm' | 'md' | 'lg')
│   ├── rounded / radius ('none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full')
│   ├── variant ('default' | 'card' | 'soft' | 'glass' | 'minimal' | 'flat' | 'accent' | 'floating')
│   └── colorTheme / color ('primary' | 'slate' | 'emerald' | 'rose' | 'amber' | 'violet' | 'indigo' | 'dark')
├── Kontrol Pencarian
│   ├── showSearch (Input teks pencarian kata kunci)
│   ├── searchPlaceholder (Teks panduan pencarian)
│   ├── searchIcon (Ikon material, default: 'search')
│   └── searchDebounce (Jeda pengetikan, default 350ms)
├── Preset Tanggal Cepat (Quick Date Presets)
│   ├── showDatePresets (Bilah segmented pills tanggal)
│   ├── dateLabel (Label teks prefix baris tanggal)
│   ├── dateIcon (Ikon material prefix tanggal)
│   └── datePresets (Daftar opsi: all, today, 7days, 30days, this_month)
├── Filter Status
│   ├── showStatus (Dropdown select opsi status)
│   ├── statusLabel (Label teks dropdown)
│   ├── allStatusText (Teks kustom "Semua Status")
│   └── statusOptions (Pilihan array [{ label, value }])
├── Tombol Reset & Refresh
│   ├── showReset (Tampil saat ada filter aktif)
│   ├── resetLabel / resetIcon (Teks & ikon tombol reset)
│   ├── refreshLabel / refreshIcon (Teks & ikon tombol refresh)
│   └── alwaysShowReset (Selalu tampil meski tidak ada filter aktif)
├── Slot Ekspansi Interaktif
│   ├── #prepend (Batch selector / Checkbox)
│   ├── #filters (Custom drilldown / category selects)
│   ├── #chips / #tags (Active filter badges)
│   ├── #date (DateRangePicker kustom)
│   ├── #actions (Tombol ekspor / tambah data)
│   └── #bottom (Status pilled tabs / bottom summary)
└── Mode Integrasi
    ├── Terikat Tabel Server (`:table="table"`)
    └── Mandiri Lokal (`v-model:search`, `v-model:datePreset`, `v-model:status`)
```

### Contoh Penggunaan Cepat dengan Kustomisasi Props

```vue
<script setup>
import { ref } from 'vue';
import FilterToolbar from '@/Components/Pack/FilterToolbar.vue';
import CtaButton from '@/Components/Pack/CtaButton.vue';

const searchQuery = ref('');
const datePreset = ref('all');
const statusFilter = ref('');

const statusOptions = [
  { label: 'Berhasil (Settled)', value: 'success' },
  { label: 'Menunggu (Pending)', value: 'pending' },
  { label: 'Gagal (Failed)', value: 'failed' },
];
</script>

<template>
  <FilterToolbar
    v-model:search="searchQuery"
    v-model:date-preset="datePreset"
    v-model:status="statusFilter"
    size="md"
    rounded="xl"
    variant="glass"
    color-theme="emerald"
    search-placeholder="Cari ID transaksi atau nama pelanggan..."
    :status-options="statusOptions"
    status-label="Status Bayar"
    show-status
  >
    <template #actions>
      <CtaButton
        variant="primary"
        colorTheme="emerald"
        size="sm"
        icon="download"
        label="Ekspor Excel"
      />
    </template>
  </FilterToolbar>
</template>
```

---

## 04. Anatomy

### Diagram Struktur Anatomi

```text
+-----------------------------------------------------------------------------------------+
| [BARIS UTAMA]                                                                           |
| [#prepend] [ (search) Cari data...      (X) ] [ Status: Semua Status (v) ] [#filters]  |
|            [Tombol Reset Filter Aktif (badge: 2)]             [#actions: Ekspor / Tambah|
+-----------------------------------------------------------------------------------------+
| [#chips / #tags: Badge Filter Aktif]                                                    |
+-----------------------------------------------------------------------------------------+
| [BARIS KEDUA: Quick Date Presets Bar]                                                   |
| (calendar_today) PERIODE: [ Semua | Hari Ini | 7 Hari | 30 Hari | Bulan Ini ]  [#date] |
+-----------------------------------------------------------------------------------------+
| [#bottom: Status Pilled Tabs / Bottom Bar]                                              |
+-----------------------------------------------------------------------------------------+
```

---

## 05. Variants

### Varian Kontainer (`variant`)

Komponen menyediakan 8 varian tampilan kontainer yang mengatur latar belakang, garis batas, dan bayangan:

| Nama Nilai | Kapan Dipakai | Ringkasan Visual |
|---|---|---|
| `default` | Standar tata letak aplikasi umum | Kartu putih/gelap dengan border halus dan bayangan lembut |
| `card` | Tata letak dengan kontur kartu tertegas | Kartu dengan border 2px dan bayangan sedikit lebih tegas |
| `soft` | Konten halaman yang sudah memiliki kartu pembungkus luar | Latar abu-abu lembut tanpa bayangan menyatu dengan konten |
| `glass` | Antarmuka modern, dashboard analitik, atau landing page | Efek glassmorphism dengan backdrop-blur-xl dan ring semi-transparan |
| `minimal` | Diletakkan langsung menempel di atas tabel data tanpa kartu | Mode borderless garis bawah tipis tanpa latar belakang tebal |
| `flat` | Area formulir padat dan modal popup | Latar padat abu-abu tanpa border dan bayangan |
| `accent` | Toolbar bertema khusus atau kategori prioritas | Latar bernuansa tinted colorTheme dengan garis tepi senada |
| `floating` | Toolbar mengambang atau popover melayang | Kartu mengambang dengan shadow-xl dan border halus |

### Tema Warna (`colorTheme` / `color`)

Mengatur warna aksen kontrol fokus, tombol reset, tabs preset tanggal, dan lencana status aktif:

| Nama Nilai | Kapan Dipakai | Ringkasan Visual |
|---|---|---|
| `primary` | Skema warna standar aplikasi | Aksen biru royal (`indigo-600` / `blue-600`) |
| `slate` | Nuansa monokromatik dan profesional | Aksen abu-abu gelap netral (`slate-700` / `slate-300`) |
| `emerald` | Modul keuangan, kesuksesan, dan data operasional positif | Aksen hijau emerald cerah (`emerald-600`) |
| `rose` | Modul pengawasan risiko atau audit kritis | Aksen merah mawar (`rose-600`) |
| `amber` | Modul peringatan, inventaris, atau transaksi menunggu | Aksen kuning oranye hangat (`amber-600`) |
| `violet` | Modul analitik, AI, dan metrik performa | Aksen ungu violet elegan (`violet-600`) |
| `indigo` | Modul enterprise dan portal administratif | Aksen nila modern (`indigo-600`) |
| `dark` | Antarmuka kontras tinggi bernuansa gelap pekat | Aksen hitam netral (`slate-900` / `slate-100`) |

---

## 06. Sizes & Radius Tokens

### Ukuran (`size`)

| Nilai | Padding Kontainer | Gap | Size Input | Size Button |
|---|---|---|---|---|
| `sm` | `p-2 sm:p-2.5` | `gap-2` | `sm` | `xs` |
| `md` | `p-3 sm:p-3.5` | `gap-2.5 sm:gap-3` | `md` | `sm` |
| `lg` | `p-4 sm:p-5` | `gap-3.5 sm:gap-4` | `lg` | `md` |

### Kelengkungan (`rounded` / `radius`)

Token berlaku untuk kontainer luar. Inner controls (InputField, CtaButton) menerima nilai yang sama melalui `innerRadius` (identik dengan `effectiveRadius`). Date preset (`Tabs`) memakai token radius `Tabs` yang dipetakan dari token toolbar agar sudutnya konsentris:

| Nilai | Kontainer | Inner Controls (`innerRadius`) | Radius `Tabs` (date preset) |
|---|---|---|---|
| `none` | `rounded-none` | `none` | `none` |
| `sm` | `rounded-sm` | `sm` | `xs` |
| `md` | `rounded-md` | `md` | `sm` |
| `lg` | `rounded-lg` | `lg` | `md` |
| `xl` | `rounded-xl` | `xl` | `lg` |
| `2xl` | `rounded-2xl` | `2xl` | `xl` |
| `3xl` | `rounded-3xl` | `3xl` | `full` |
| `full` | `rounded-full` | `full` | `full` |

Ukuran `Tabs` untuk date preset: `xs` pada size `sm`/`md`, `sm` pada size `lg`.

---

## 07. States

- **Default / Clean State**: Seluruh kolom input berada pada nilai awal, tombol reset tersembunyi (kecuali `alwaysShowReset`).
- **Active Filters State**: Tombol reset muncul otomatis dengan lencana merah berisi total kriteria aktif (misal: "Reset [2]").
- **Searching / Debouncing State**: Teks terisi pada kolom pencarian, tombol silang (x) muncul, jeda debounce menghitung mundur sebelum memancarkan event `@search`.
- **Loading State**: Ikon pencarian berubah menjadi spinner animasi berputar menandakan request sedang diproses backend.
- **Date Preset Active State**: Tab preset yang dipilih tampil sebagai segmen terangkat (varian `segmented` dari `Tabs`) dengan warna mengikuti `colorTheme`; preset selain `all` dihitung sebagai filter aktif pada lencana reset.
- **Table Integration State**: Semua state (search, datePreset, status) disinkronkan dua arah dengan objek `table` dari `useServerTable`.

---

## 08. Props / Attributes

| Prop | Tipe Data | Default | Keterangan |
|---|---|---|---|
| `table` | `Object` | `null` | Objek hasil instansiasi `useServerTable()`. Mengotomasi seluruh sinkronisasi filter |
| `size` | `String` | `'md'` | Ukuran skala toolbar: `'sm'`, `'md'`, `'lg'` |
| `rounded` | `String` | `'2xl'` | Kelengkungan border token (lihat section 06) |
| `radius` | `String` | `''` | Alias `rounded` dengan prioritas lebih tinggi saat keduanya diberikan |
| `variant` | `String` | `'default'` | Varian tampilan: `'default'`, `'card'`, `'soft'`, `'glass'`, `'minimal'`, `'flat'`, `'accent'`, `'floating'` |
| `colorTheme` | `String` | `'primary'` | Tema warna aksen: `'primary'`, `'slate'`, `'emerald'`, `'rose'`, `'amber'`, `'violet'`, `'indigo'`, `'dark'` |
| `color` | `String` | `''` | Alias `colorTheme` dengan prioritas lebih tinggi |
| `search` | `String` | `''` | Nilai kata kunci pencarian aktif (`v-model:search`) |
| `showSearch` | `Boolean` | `true` | Menampilkan atau menyembunyikan input pencarian |
| `searchPlaceholder` | `String` | `'Cari data...'` | Teks petunjuk bantuan pada kolom pencarian |
| `searchDebounce` | `Number` | `350` | Jeda waktu debounce pengetikan dalam milidetik (ms) |
| `searchIcon` | `String` | `'search'` | Nama ikon Material Symbols pada kolom pencarian |
| `showDatePresets` | `Boolean` | `true` | Menampilkan baris tombol periode tanggal cepat |
| `datePreset` | `String` | `'all'` | Kunci preset tanggal yang aktif (`v-model:datePreset`) |
| `datePresets` | `Array` | `[...]` | Daftar opsi preset tanggal `[{ key, label }]`. Field `icon` diteruskan ke `Tabs` namun tidak ditampilkan karena `showIcon` dinonaktifkan |
| `dateLabel` | `String` | `'Periode:'` | Label teks judul baris preset tanggal |
| `dateIcon` | `String` | `'calendar_today'` | Nama ikon Material Symbols prefix baris tanggal |
| `showStatus` | `Boolean` | `false` | Menampilkan dropdown filter status |
| `status` | `String \| Number` | `''` | Nilai status yang sedang dipilih (`v-model:status`) |
| `statusLabel` | `String` | `'Status'` | Label pada opsi default select ("Semua [statusLabel]") |
| `allStatusText` | `String` | `''` | Teks kustom untuk opsi "Semua Status" (override label auto) |
| `statusOptions` | `Array` | `[]` | Daftar pilihan opsi status `[{ label, value }]` |
| `showReset` | `Boolean` | `true` | Menampilkan tombol reset filter |
| `resetLabel` | `String` | `'Reset'` | Teks label pada tombol reset |
| `resetIcon` | `String` | `'filter_alt_off'` | Nama ikon Material Symbols pada tombol reset |
| `alwaysShowReset` | `Boolean` | `false` | Selalu menampilkan tombol reset meskipun tidak ada filter aktif |
| `refreshLabel` | `String` | `'Segarkan'` | Teks label tombol refresh bawaan (mode integrasi `table`) |
| `refreshIcon` | `String` | `'refresh'` | Nama ikon Material Symbols pada tombol refresh |
| `loading` | `Boolean` | `false` | Status memuat data manual (aktifkan spinner search) |
| `compact` | `Boolean` | `false` | Paksa ukuran ke `sm` terlepas dari nilai prop `size` |
| `borderless` | `Boolean` | `false` | Alias backward-compat untuk `variant="minimal"` |

---

## 09. Slots

| Nama Slot | Keterangan | Parameter Lingkup (Scoped) |
|---|---|---|
| `prepend` | Sisi paling kiri sebelum kolom input pencarian (Batch selector / Checkbox) | `{ innerRadius, size, buttonSize, colorTheme }` |
| `filters` | Area di samping input search untuk menyisipkan filter dropdown kustom tambahan | `{ innerRadius, size, buttonSize, colorTheme }` |
| `default` | Alias slot `filters` — disisipkan di posisi yang sama | `{ innerRadius, size, buttonSize, colorTheme }` |
| `chips` | Area khusus untuk menampilkan lencana filter aktif (Active Tag Filter Chips) | `{ innerRadius, colorTheme }` |
| `tags` | Alias slot `chips` | `{ innerRadius, colorTheme }` |
| `date` | Area di samping baris preset tanggal (misal DateRangePicker kustom) | `{ innerRadius, size, colorTheme }` |
| `actions` | Sisi kanan toolbar untuk tombol aksi tabel (Ekspor, Tambah Data, dll) | `{ innerRadius, size, colorTheme }` |
| `bottom` | Area bawah toolbar (misal untuk status pilled tabs workflow) | `{ innerRadius, colorTheme, pillRadiusClass, pillButtonRadius }` |

> [!TIP]
> Gunakan parameter `innerRadius` dari setiap slot untuk meneruskan token radius ke komponen yang disisipkan, agar tampilan konsisten dengan toolbar.

```vue
<template #actions="{ innerRadius, size }">
  <CtaButton
    variant="primary"
    :rounded="innerRadius"
    :size="size"
    icon="download"
    label="Ekspor"
  />
</template>
```

---

## 10. Events / Interactions

| Nama Event | Parameter | Deskripsi Pemancaran |
|---|---|---|
| `update:search` | `String` | Dipancarkan saat nilai search berubah (`v-model:search`) |
| `update:datePreset` | `String` | Dipancarkan saat preset tanggal dipilih (`v-model:datePreset`) |
| `update:status` | `String` | Dipancarkan saat opsi status berubah (`v-model:status`) |
| `search` | `String` | Dipancarkan setelah batas waktu debounce pencarian terpenuhi |
| `date-preset-change` | `String` | Dipancarkan seketika tombol preset tanggal diklik |
| `status-change` | `String` | Dipancarkan seketika opsi dropdown status berubah |
| `reset` | — | Dipancarkan saat tombol reset diklik dan filter direset |
| `refresh` | — | Dipancarkan saat tombol segarkan data diklik |

---

## 11. Computed Values (Internal)

| Nama Computed | Deskripsi |
|---|---|
| `effectiveRadius` | Token radius final: prioritas `radius` > `rounded` > `'2xl'` |
| `innerRadius` | Token radius untuk sub-komponen internal dan parameter slot |
| `tabsRadius` | Token radius `Tabs` untuk date preset, dipetakan dari `effectiveRadius` (lihat section 06) |
| `tabsSize` | Ukuran `Tabs` date preset: `'sm'` jika size `lg`, selain itu `'xs'` |
| `datePresetTabs` | Konversi `datePresets` ke format item `Tabs` (`{ id, label, icon }`) |
| `pillRadiusClass` | Class Tailwind radius; tidak lagi dipakai date preset, hanya diteruskan ke slot `bottom` |
| `pillButtonRadius` | Token radius tombol turunan; tidak lagi dipakai date preset, hanya diteruskan ke slot `bottom` |
| `effectiveSize` | Size final: `'sm'` jika `compact=true`, else nilai `size` |
| `effectiveColorTheme` | Theme final: prioritas `color` > `colorTheme` > `'primary'` |
| `activeFiltersCount` | Jumlah filter yang sedang aktif (berbeda dari nilai default) |
| `hasActiveFilters` | Boolean `true` jika `activeFiltersCount > 0` |
| `isLoading` | Kombinasi `loading` prop dan `table.isLoading.value` |

---

## 12. Methods / Exposes

Metode dan nilai yang dapat diakses dari parent via `ref`:

```vue
<FilterToolbarComponent ref="toolbarRef" />
```

| Nama | Tipe | Deskripsi |
|---|---|---|
| `clearSearch()` | Method | Mengosongkan nilai search input secara programatik |
| `handleReset()` | Method | Menjalankan reset seluruh filter (identik dengan klik tombol Reset) |
| `handleRefresh()` | Method | Menjalankan refresh data (memanggil `table.reload()` atau emit `@refresh`) |
| `activeFiltersCount` | Computed Ref | Jumlah filter aktif saat ini |
| `hasActiveFilters` | Computed Ref | Boolean ada filter aktif atau tidak |

---

## 13. Integration / useServerTable

Saat prop `:table` dioper, toolbar masuk ke mode **Table Integration** yang mengotomasi sinkronisasi dua arah:

```vue
<script setup>
import { useServerTable } from '@/Composables/useServerTable';
import FilterToolbar from '@/Components/Pack/FilterToolbar.vue';

const table = useServerTable({
    url: '/api/transactions',
    filters: { status: '', date_preset: '' },
});
</script>

<template>
  <FilterToolbar :table="table" show-status :status-options="statusOptions" />
</template>
```

Dalam mode integrasi:
- `table.search.value` — disinkronkan dua arah dengan kolom pencarian.
- `table.filters.date_preset` — diperbarui saat preset tanggal dipilih.
- `table.filters.status` — diperbarui saat dropdown status berubah.
- `table.isLoading.value` — digunakan untuk spinner loading otomatis.
- `table.resetFilters()` — dipanggil saat tombol Reset diklik.
- `table.reload()` — dipanggil saat tombol Refresh diklik.

---

## 14. Accessibility

- Seluruh input (`InputField`) memiliki label tersirat via prop `placeholder` dan `label`.
- Preset tanggal memakai komponen `Tabs` (varian `segmented`) dengan role `tablist`/`tab`, atribut `aria-selected`, dan navigasi keyboard.
- Tombol Reset dan Refresh memiliki label teks eksplisit dan ikon Material Symbols yang bersifat dekoratif.
- Toolbar menggunakan layout flexbox responsif yang berfungsi baik di semua viewport (sm, md, lg).

---

## 15. Performance

- **Debounce**: Default 350ms mencegah request berlebihan ke server. Sesuaikan `searchDebounce` untuk use-case lokal (bisa 0ms) vs remote (minimal 300ms).
- **`onUnmounted` Cleanup**: Timeout debounce dibersihkan otomatis saat komponen di-unmount untuk mencegah memory leak.
- **Shallow Reactivity**: State local (`localSearch`, `localDatePreset`, `localStatus`) menggunakan `ref` primitif untuk menghindari deep-tracking yang tidak diperlukan.

---

## 16. Do / Don't

| Rekomendasi (Do) | Pantangan (Don't) |
|---|---|
| Gunakan prop `:table="table"` bersama composable `useServerTable` untuk konsistensi state tabel server-side. | Jangan membuat elemen HTML native manual di luar komponen atomik yang sudah tersedia. |
| Sesuaikan `size`, `rounded`, dan `colorTheme` agar selaras dengan tema UI utama aplikasi. | Jangan mengabaikan jeda debounce pencarian karena dapat membebani database backend. |
| Gunakan slot `#chips` / `#tags` untuk menampilkan daftar filter aktif yang mudah dihapus pengguna. | Jangan menaruh formulir entri data panjang di dalam toolbar filter. |
| Gunakan parameter `innerRadius` dari slot untuk meneruskan token radius ke komponen sisipan. | Jangan hardcode nilai `rounded` di dalam slot tanpa menggunakan `innerRadius` yang diteruskan. |
| Gunakan `variant="accent"` + `colorTheme` untuk toolbar bertema warna yang kuat. | Jangan menumpuk dua `FilterToolbar` vertikal dalam satu halaman tanpa pembeda visual yang jelas. |

---

## 17. Changelog

| Versi | Perubahan |
|---|---|
| 1.0.0 | Rilis awal: `showSearch`, `showDatePresets`, `showStatus`, slot `#actions`, integrasi `useServerTable`. |
| 1.1.0 | Tambah props `size`, `rounded`, `variant`, `colorTheme` dan token radius terpusat. |
| 1.2.0 | Tambah slot `#prepend`, `#filters`, `#chips`, `#tags`, `#date`, `#bottom` dengan scoped parameters. |
| 1.3.0 | Tambah varian `accent` dan `floating`. Tambah `effectiveRadius`, `innerRadius`, `pillButtonRadius` tokens. Tambah props `resetIcon`, `refreshIcon`, `refreshLabel`, `dateIcon`, `dateLabel`, `radius`, `color`, `compact`. |
| 1.4.0 | Preset tanggal memigrasi tombol `CtaButton` ke komponen `Tabs` (varian `segmented`) agar sudut konsentris dengan radius toolbar. Tambah computed `tabsRadius`, `tabsSize`, `datePresetTabs`. Perubahan visual (breaking minor): ikon pada `datePresets` tidak lagi ditampilkan; `pillRadiusClass` dan `pillButtonRadius` tidak lagi dipakai preset tanggal. `Tabs` varian `segmented` kini mengikuti prop `radius`. |

---

## 18. Related Components

- **[Table Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/table.md)**: Komponen tabel data utama.
- **[Badge Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/badge.md)**: Lencana penanda status.
- **[InputField Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/input-field.md)**: Komponen input dasar.
- **[CtaButton Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/cta-button.md)**: Tombol aksi.
- **[Tabs Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/tabs.md)**: Dipakai untuk bilah preset tanggal (varian `segmented`, `compactPanel`).
- **[Dropdown Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/dropdown.md)**: Menu popover aksi lanjutan.

---

## 19. Source Files

| File | Keterangan |
|---|---|
| `packages/laravel-pack-ui/resources/js/Components/Pack/FilterToolbar.vue` | Implementasi inti komponen |
| `packages/laravel-pack-ui/resources/js/Components/Pack/FilterToolbarComponent.vue` | Alias facade resmi untuk diimpor di aplikasi |
| `resources/js/Pages/Preview/Showcases/FilterToolbarShowcase.vue` | Halaman showcase interaktif (6 jenis, 3 desain per jenis) |
| `packages/laravel-pack-ui/doc/components/filter-toolbar.md` | File dokumentasi ini |
