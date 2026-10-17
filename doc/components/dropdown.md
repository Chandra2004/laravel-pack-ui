# Dropdown Component

Komponen menu dropdown aksi melayang (*action popover menu*) enterprise berbasis Vue 3 dan Tailwind CSS yang telah menerapkan standar 5 Pilar UI (Warna, Bentuk, Teks Konten, Ikon, dan Responsif). Komponen ini dirancang untuk menu aksi baris tabel, navigasi profil pengguna pada bilah navigasi, pemilih ruang kerja (*workspace switcher*), dan pemilihan opsi radio (*radio selection*).

---

## 01. Overview

`Dropdown.vue` menyediakan menu aksi mengambang kontekstual yang ringkas, elegan, dan kaya interaksi untuk merapikan antarmuka dari penumpukan tombol aksi.

### 1.1 Apa Entitas Ini
Komponen Vue 3 berbasis Composition API (`packages/laravel-pack-ui/resources/js/Components/Pack/Dropdown.vue` dan facade resmi `DropdownComponent.vue`) yang merender lapisan menu popover dinamis lengkap dengan dukungan WAI-ARIA Menu, deteksi klik di luar area (*click outside*), integrasi komponen atomik `Badge.vue`, serta penyesuaian tata letak responsif desktop, tablet, dan mobile.

### 1.2 Fungsi Utama
- Mengelompokkan berbagai tindakan kontekstual (sunting, duplikasi, bagikan, arsipkan, hapus) dalam satu tombol pemicu ringkas.
- Menyediakan 5 variasi desain popover: `rich` (kartu dua baris dengan kotak latar ikon), `glassmorphic` (kaca tembus pandang dengan blur dan elevasi), `pills` (kapsul rounded-full ala menu modern MacOS), `bordered` (aksen strip warna tema pada sisi atas), dan `default` (bersih dan minimalis).
- Mendukung elemen khusus di dalam menu: judul seksi (*heading*), garis pembatas (*separator*), lencana status (*badge*) berbasis komponen atomik `Badge`, tanda centang aktif (*selected*), dan label pintasan tombol (*keyboard shortcut*).
- Menyediakan navigasi keyboard penuh (`ArrowDown`, `ArrowUp`, `Enter`, `Home`, `End`, `Escape`).

### 1.3 Kapan Digunakan
- Pada kolom terakhir baris tabel data (*data table actions*) untuk menyembunyikan opsi lanjutan agar tabel tetap rapi.
- Pada sudut kanan atas bilah navigasi (*navbar user menu*) untuk menampilkan profil, pengaturan, dan tombol keluar.
- Pada tombol pengubah status atau filter data yang membutuhkan indikator centang terpilih.
- Pada modul pemilih ruang kerja (*workspace switcher*) dengan format kartu multi-informasi.

### 1.4 Karakteristik Penting
- **Click Outside Awareness**: Mengintegrasikan composable `useClickOutside` untuk menutup popover secara otomatis saat pengguna mengklik bagian lain pada layar.
- **Micro-Copy Sublabel Architecture**: Varian `rich` menyediakan ruang deskripsi subteks dua baris yang membantu pengguna memahami konsekuensi setiap pilihan aksi.
- **Escape Key Interception**: Tombol `Escape` secara otomatis membatalkan popover dan mengembalikan fokus interaksi ke tombol pemicu.
- **Responsive Viewport Containment**: Membatasi lebar menu popover (`max-w-[calc(100vw-2rem)]`) dan tinggi vertikal (`max-h-[85vh]` pada mobile dan `sm:max-h-[75vh]` dengan `overflow-y-auto`) agar tidak overflow atau terpotong pada layar ponsel maupun tablet.
- **Atomic Component Synergy**: Memanfaatkan komponen atomik `Badge.vue` untuk merender lencana status pada item menu.
- **Official Facade Support**: Dapat diimpor sebagai `DropdownComponent.vue` maupun `Dropdown.vue`.

---

## 02. Preview

> [!TIP]
> Pengujian visual dan showcase interaktif entitas ini tersedia secara native pada portal pratinjau aplikasi:
>
> - Rute Demo Native: `/demo/dropdown`
> - Portal Pratinjau: `/preview/dropdown`
>
> <a href="/demo/dropdown" target="_self" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 8px; background-color: var(--vp-c-brand-1, #4f46e5); color: #ffffff;">Buka Live Demo Komponen Dropdown &rarr;</a>

---

## 03. Usage

### Pohon Konsep Penggunaan

```text
Dropdown
├── Tombol Pemicu (Trigger)
│   ├── Pemicu Bawaan (Icon, Label, Chevron Arrow)
│   └── Slot Kustom (#trigger: Avatar, ButtonSubmit, Badge)
├── 5 Varian Gaya Visual Popover
│   ├── rich (Format kartu dua baris dengan kotak ikon latar)
│   ├── default (Minimalis klasik dengan border halus)
│   ├── glassmorphic (Efek kaca blur dengan bayangan mendalam)
│   ├── pills (Item rounded-full ala konteks menu modern)
│   └── bordered (Garis tepi tegas dengan aksen strip tema)
├── Struktur Konten Menu
│   ├── Item Interaktif (Button aksi / Tag tautan URL)
│   ├── Kategori Pemisah (Heading seksi & Separator garis)
│   └── Metadata (Badge status, Shortcut keyboard, Tanda selected)
└── Penjajaran & Dimensi
    ├── align (left, center, right)
    └── width (auto, 32, 40, 48, 56, 64, 72, 80, 96, full)
```

### Matriks Kapan Digunakan vs Dihindari

| Kasus Penggunaan | Gunakan Dropdown | Hindari (Gunakan Alternatif) |
|---|---|---|
| Menu aksi pada baris tabel (3-8 aksi) | Ya (`variant="rich"` atau `"default"`) | Jangan meletakkan 5 tombol sekaligus di tiap baris tabel |
| Navigasi profil akun di header aplikasi | Ya (`align="right"`) | Hindari tautan telanjang tanpa pembungkus menu |
| Pilihan formulir dengan 50+ item pencarian | Tidak | Gunakan Autocomplete atau Select Searchable |
| Notifikasi umpan balik aksi | Tidak | Gunakan Toast Notification |

### Contoh Penggunaan Cepat

```vue
<script setup>
import Dropdown from '@/Components/Pack/Dropdown.vue';

const menuItems = [
  { label: 'Ubah Data', icon: 'edit' },
  { label: 'Duplikasi', icon: 'file_copy', badge: 'Baru' },
  { separator: true },
  { label: 'Hapus Entri', icon: 'delete', variant: 'danger' },
];

function handleSelect(item) {
  console.log('Item terpilih:', item.label);
}
</script>

<template>
  <Dropdown
    :items="menuItems"
    trigger-label="Pilihan Aksi"
    show-arrow
    @select="handleSelect"
  />
</template>
```

---

## 04. Anatomy

### Diagram Struktur Anatomi

```text
[TRIGGER BUTTON]
+--------------------------------------------------------------+
| (tune) Pilihan Tindakan                            ( v )     |
+--------------------------------------------------------------+
                                  |
                                  v [Transisi Skala & Opasitas]
[POPOVER PANEL: role="menu"]
+--------------------------------------------------------------+
| [HEADER SLOT: Identitas Akun / Organisasi]                   |
| Alexandria Morgan (alexandria@company.id)                    |
+--------------------------------------------------------------+
| -- SEKSI UTAMA: HEADING --                                   |
| [IconBox]  Sunting Informasi                      [Ctrl+E]   |
|            Perbarui parameter dan rincian                    |
| [IconBox]  Duplikasi Entitas                      [Baru]     |
|            Gandakan data ke draf baru                        |
| [IconBox]  Paling Populer                         ( V Centang)|
+--------------------------------------------------------------+
| ------------------- SEPARATOR PEMISAH ---------------------- |
+--------------------------------------------------------------+
| [IconBox]  Hapus Rekaman (Varian Danger)           [Del]     |
|            Penghapusan permanen tidak dapat batal            |
+--------------------------------------------------------------+
| [FOOTER SLOT: Aksi Cepat / Logout]                           |
+--------------------------------------------------------------+
```

### Komponen Anatomi Rinci
1. **Trigger Container**: Elemen pembungkus pemicu. Jika slot `#trigger` tidak disediakan, komponen merender tombol default dengan `triggerIcon`, `triggerLabel`, dan panah `showArrow` yang berputar 180 derajat saat dibuka.
2. **Popover Panel (`role="menu"`)**: Kontainer melayang absolut dengan `z-50`, isolasi overflow, sudut kelengkungan adaptif, dan bayangan elevasi berlapis.
3. **Header Section (`#header`)**: Area opsional di bagian paling atas popover untuk menampilkan profil akun, email, atau informasi ruang kerja aktif.
4. **Items List**: Kumpulan baris aksi interaktif (`role="menuitem"`), pemisah garis tipis (`separator`), atau teks judul kategori (`heading`).
5. **Item Details**: Elemen terpadu mencakup kotak latar ikon (`iconBox` pada varian rich), label judul, subteks deskripsi, lencana status (*badge*), centang aktif (*selected*), dan label pintasan keyboard (*shortcut*).
6. **Footer Section (`#footer`)**: Area opsional di bagian paling bawah popover untuk tombol aksi cepat seperti logout atau bantuan.

---

## 05. Variants

### Tabel Gaya Visual Popover (`variant`)

| Nama Nilai | Kapan Dipakai | Ringkasan Visual |
|---|---|---|
| `default` | Menu aksi umum, opsi toolbar standar, atau context menu minimalis | Latar belakang solid putih / slate-900 dengan border lembut `border-slate-200/90 dark:border-slate-800` dan bayangan standar |
| `rich` | Menu akun profil, workspace switcher, opsi dengan penjelasan subteks | Format kartu dua baris dengan kotak latar ikon berwarna (*icon badge box*) dan deskripsi subteks penjelas |
| `glassmorphic` | Antarmuka modern bernuansa futuristik, overlay di atas grafis/foto | Latar semi-transparan `backdrop-blur-xl` dengan garis tepi berkilau dan bayangan mendalam `shadow-2xl` |
| `pills` | Context menu bergaya MacOS, navigasi tab mengambang, filter cepat | Item menu dengan kelengkungan kapsul penuh (*rounded-full*) dan padding kompak |
| `bordered` | Menu aksi berstatus tinggi atau panel navigasi beraksen tegas | Garis tepi ganda tegas dengan aksen strip warna tema pada sisi atas popover |

### Tabel Tema Warna Semantik (`colorTheme`)

| Nama Nilai | Kapan Dipakai | Ringkasan Visual |
|---|---|---|
| `primary` | Tema bawaan merek sistem aplikasi | Aksen biru brand pada fokus ring, indikator centang, dan sorotan hover |
| `indigo` | Dasbor analitik, manajemen proyek, dan menu korporat | Aksen indigo elegan pada hover latar dan ikon aktif |
| `emerald` | Menu persetujuan transaksi, modul keuangan, aksi berhasil | Aksen hijau sukses pada indikator terpilih dan sorotan item |
| `purple` | Modul fitur premium, AI assistant, integrasi webhook | Aksen ungu royal pada lencana badge dan kotak latar ikon |
| `amber` | Modul log peringatan, revisi status, mode evaluasi | Aksen kuning amber pada indikator perhatian |
| `rose` | Menu penghapusan data kritis atau konfirmasi bahaya | Aksen merah mawar pada sorotan opsi penting |
| `cyan` | Modul telemetri, metrik performa, informasi sistem | Aksen cyan informatif pada penanda aktif |
| `dark` | Antarmuka mode kontras tinggi atau monokrom gelap | Aksen slate pekat netral tanpa saturasi warna berlebih |

---

## 06. Sizes

### Skala Dimensi Item Menu (`size`)
| Nilai Prop | Padding Item | Ukuran Teks | Ukuran Ikon | Kotak Ikon (Rich) |
|---|---|---|---|---|
| `xs` | `px-2 py-1` | `text-[11px]` | `text-[13px]` | `w-5 h-5` |
| `sm` | `px-2.5 py-1.5` | `text-xs` (12px) | `text-[15px]` | `w-6 h-6` |
| `md` | `px-3 py-2` | `text-xs sm:text-sm` (14px) | `text-base` (16px) | `w-7 h-7` |
| `lg` | `px-3.5 py-2.5` | `text-sm sm:text-base` (16px) | `text-lg` (18px) | `w-8 h-8` |
| `xl` | `px-4 py-3` | `text-base sm:text-lg` (18px) | `text-xl` (20px) | `w-9 h-9` |

### Lebar Kontainer Popover (`width`)
- `auto`: Lebar dinamis mengikuti konten (minimal `160px`).
- `28` (`w-28` / 112px), `32` (`w-32` / 128px), `36` (`w-36` / 144px), `40` (`w-40` / 160px).
- `48` (`w-48` / 192px), `56` (`w-56` / 224px - standar tabel).
- `64` (`w-64` / 256px), `72` (`w-72` / 288px), `80` (`w-80` / 320px - standar menu profil), `96` (`w-96` / 384px).
- `full`: Lebar penuh 100% selebar elemen pemicu induk.

### Batas Tinggi Vertikal Scrollable (`maxHeight`)
- `xs` (`max-h-36` / 144px), `sm` (`max-h-48` / 192px), `md` (`max-h-64` / 256px).
- `lg` (`max-h-80` / 320px), `xl` (`max-h-96` / 384px), `auto` (`max-h-72` / 288px), `none` (tanpa batas).

### Kelengkungan Sudut (`radius`)
Pilihan radius yang didukung: `none`, `sm`, `md`, `lg`, `xl` (default), `2xl`, `3xl`, dan `full`.

---

## 07. States

- **Normal / Closed State**: Popover tertutup dan tersembunyi, tombol pemicu siap menerima klik pengguna.
- **Open / Expanded State**: Popover muncul dengan animasi skala (`scale-95` ke `scale-100`) dan opacity halus, panah chevron berputar 180 derajat jika `showArrow="true"`.
- **Item Hover / Focused State**: Latar baris menu berganti sesuai tema warna atau aksen kelabu slate saat diarahkan mouse atau dinavigasikan melalui tombol panah keyboard.
- **Item Selected State (`selected: true`)**: Ditandai dengan latar belakang aktif dan ikon centang otomatis (`check`) di sisi kanan.
- **Item Disabled State (`disabled: true`)**: Baris menu meredup (`opacity-40`), tidak dapat diklik atau difokuskan oleh kursor.
- **Dropdown Disabled State**: Seluruh komponen non-interaktif dengan kursor dilarang (`cursor-not-allowed`).

---

## 08. Props / Attributes

### Props Utama Komponen

| Prop | Tipe Data | Default | Keterangan |
|---|---|---|---|
| `items` | `Array` | `[]` | Daftar objek item menu (lihat format struktur di bawah) |
| `colorTheme` | `String` | `'primary'` | Tema warna semantik: `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'` |
| `variant` | `String` | `'default'` | Gaya visual popover: `'default'`, `'rich'`, `'glassmorphic'`, `'pills'`, `'bordered'` |
| `radius` | `String` | `'xl'` | Kelengkungan sudut: `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`, `'full'` |
| `size` | `String` | `'md'` | Pilihan ukuran dimensi: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'` |
| `width` | `String` | `'48'` | Lebar kontainer: `'auto'`, `'28'`, `'32'`, `'36'`, `'40'`, `'48'`, `'56'`, `'64'`, `'72'`, `'80'`, `'96'`, `'full'` |
| `maxHeight` | `String` | `'auto'` | Batas tinggi vertikal scrollable: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'auto'`, `'none'` |
| `align` | `String` | `'left'` | Penjajaran popover terhadap pemicu: `'left'`, `'right'`, `'center'` |
| `placement` | `String` | `'bottom'` | Posisi vertikal popover: `'bottom'` (ke bawah) atau `'top'` (ke atas / dropup) |
| `triggerLabel` / `title` | `String` | `''` | Teks judul/label pada tombol pemicu bawaan |
| `triggerIcon` / `iconLeft` | `String` | `'more_vert'` | Ikon Google Material Symbol sisi kiri pada tombol pemicu bawaan |
| `triggerIconRight` / `iconRight` | `String` | `''` | Ikon Google Material Symbol sisi kanan pada tombol pemicu bawaan |
| `triggerVariant` | `String` | `'outline'` | Varian gaya tombol pemicu bawaan: `'outline'`, `'solid'`, `'ghost'`, `'subtle'`, `'secondary'`, `'gradient'`, `'glass'` |
| `triggerColor` | `String` | `'neutral'` | Skema warna tombol pemicu: `'neutral'`, `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'` |
| `triggerBlock` / `fullWidth` | `Boolean` | `false` | Memperluas dimensi tombol pemicu selebar 100% wadah container |
| `triggerType` | `String` | `'click'` | Metode interaksi pemicu: `'click'` (klik mouse) atau `'hover'` (sorot kursor) |
| `showArrow` | `Boolean` | `false` | Menampilkan panah chevron yang berputar saat menu terbuka |
| `searchable` | `Boolean` | `false` | Menampilkan kotak pencarian instan (menggunakan atomik InputField) untuk menyaring opsi menu secara reaktif |
| `searchPlaceholder` | `String` | `'Cari opsi...'` | Placeholder teks pada kotak pencarian opsi |
| `dense` | `Boolean` | `false` | Mode baris item rapat dengan padding minimalis |
| `showShortcuts` | `Boolean` | `true` | Menampilkan badge pintasan keyboard shortcut |
| `showDescriptions` | `Boolean` | `true` | Menampilkan deskripsi subteks dua baris pada item menu |
| `headerText` | `String` | `''` | Teks judul cepat pada header popover tanpa memerlukan slot manual |
| `footerText` | `String` | `''` | Teks catatan cepat pada footer popover tanpa memerlukan slot manual |
| `closeOnClick` | `Boolean` | `true` | Otomatis menutup menu setelah salah satu opsi diklik |
| `closeOnClickOutside` | `Boolean` | `true` | Menutup menu saat pengguna mengklik di luar area dropdown |
| `disabled` | `Boolean` | `false` | Menonaktifkan interaksi dropdown secara keseluruhan |
| `contentClasses` | `String` | `''` | Kelas CSS Tailwind tambahan untuk kontainer popover |

### Format Struktur Objek Item Menu (`items`)

| Field Objek | Tipe Data | Default | Keterangan |
|---|---|---|---|
| `label` | `String` | `''` | Judul teks utama item menu |
| `description` | `String` | `''` | Subteks penjelas di bawah judul (efektif pada varian `rich`) |
| `icon` | `String` | `''` | Nama Google Material Symbol |
| `iconColor` | `String` | `''` | Kelas warna kustom untuk ikon |
| `badge` | `String` | `''` | Teks lencana kecil di samping label |
| `badgeVariant` | `String` | `''` | Warna tema lencana: `'primary'`, `'emerald'`, `'amber'`, `'rose'`, `'slate'` |
| `shortcut` | `String` | `''` | Label pintasan keyboard (misal: `'Ctrl+E'`) |
| `selected` | `Boolean` | `false` | Menampilkan ikon centang aktif |
| `heading` | `String` | `''` | Menjadikan item sebagai judul seksi kategori (non-interaktif) |
| `separator` | `Boolean` | `false` | Menjadikan item sebagai garis pembatas horizontal |
| `disabled` | `Boolean` | `false` | Menonaktifkan klik pada opsi tertentu |
| `href` | `String` | `''` | Tautan URL (otomatis dirender sebagai tag `<a>`) |
| `action` | `Function` | `null` | Callback fungsi saat item diklik: `(item) => void` |
| `variant` | `String` | `'default'` | Varian warna semantik teks item: `'default'`, `'primary'`, `'success'`, `'warning'`, `'danger'`, `'info'` |

---

## 09. Slots

| Nama Slot | Parameter Lingkup (Scope Props) | Keterangan |
|---|---|---|
| `trigger` | `{ isOpen, toggle, open, close }` | Kustomisasi tombol pemicu pembuka dropdown |
| `header` | `{ close }` | Area khusus di bagian paling atas popover |
| `footer` | `{ close }` | Area khusus di bagian paling bawah popover |
| `item` | `{ item, index, close, isSelected, isFocused }` | Kustomisasi rendering baris item menu tertentu |
| `content` | `{ close }` | Penggantian menyeluruh isi daftar menu dengan markup bebas |

---

## 10. Events / Interactions

| Nama Event | Parameter | Deskripsi Pemancaran |
|---|---|---|
| `select` | `Object` | Dipancarkan saat salah satu opsi menu diklik oleh pengguna |
| `open` | — | Dipancarkan seketika saat menu popover mulai terbuka |
| `close` | — | Dipancarkan seketika saat menu popover tertutup |
| `search` | `String` | Dipancarkan saat pengguna mengetik teks kueri pada kotak input pencarian searchable |

---

## 11. Code Example

### 11.1 Menu Akun Pengguna Bilah Navigasi (Navbar User Menu)
```vue
<script setup>
import Dropdown from '@/Components/Pack/Dropdown.vue';

const accountItems = [
  { heading: 'AKUN PENGGUNA' },
  {
    label: 'Profil Pribadi',
    description: 'alexandria@company.id',
    icon: 'person',
  },
  {
    label: 'Ruang Kerja Enterprise',
    description: 'Speed UI Innovations Ltd',
    icon: 'domain',
    badge: 'Pro',
    badgeVariant: 'emerald',
  },
  { separator: true },
  {
    label: 'Dokumentasi & Panduan',
    icon: 'help',
    href: '/docs',
  },
  {
    label: 'Keluar Sesi (Logout)',
    icon: 'logout',
    variant: 'danger',
    action: () => console.log('Proses keluar sesi akun dipicu'),
  },
];
</script>

<template>
  <Dropdown
    :items="accountItems"
    align="right"
    width="72"
    variant="rich"
    color-theme="primary"
    radius="2xl"
  >
    <template #trigger="{ isOpen }">
      <button class="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
          alt="Avatar"
          class="w-8 h-8 rounded-full object-cover ring-2 ring-primary-500/30"
        />
        <span class="material-symbols-outlined text-sm" :class="{ 'rotate-180': isOpen }">
          expand_more
        </span>
      </button>
    </template>
  </Dropdown>
</template>
```

### 11.2 Menu Aksi Baris Tabel Data (Data Table Actions)
```vue
<script setup>
import Dropdown from '@/Components/Pack/Dropdown.vue';

function createRowActions(recordId) {
  return [
    { label: 'Ubah Data', icon: 'edit', action: () => console.log('Edit ID:', recordId) },
    { label: 'Duplikasi', icon: 'file_copy', action: () => console.log('Duplikat ID:', recordId) },
    { separator: true },
    { label: 'Hapus Entri', icon: 'delete', variant: 'danger', action: () => console.log('Hapus ID:', recordId) },
  ];
}
</script>

<template>
  <Dropdown
    :items="createRowActions(42)"
    align="right"
    width="48"
    variant="default"
    trigger-icon="more_vert"
  />
</template>
```

---

## 12. Result / Behavior

- **Transisi Animasi Halus**: Popover memasuki layar dengan transisi durasi 150ms (`opacity-0 scale-95 -translate-y-1.5` ke `opacity-100 scale-100 translate-y-0`), memberikan respons visual yang lincah tanpa lag.
- **Click Outside Dismissal**: Mendengarkan event pointerdown pada window. Jika pengguna mengklik elemen di luar batas kontainer dropdown, popover tertutup secara instan.
- **Navigasi Keyboard Presisi**:
  - `ArrowDown` & `ArrowUp`: Berpindah fokus antar item aktif, secara otomatis melewati separator dan heading.
  - `Enter` / `Space`: Mengaktifkan opsi yang sedang difokuskan atau membuka menu saat tombol trigger difokuskan.
  - `Home` & `End`: Melompat langsung ke item paling pertama atau paling terakhir dalam daftar.
  - `Escape`: Menutup popover seketika dan mengembalikan fokus keyboard ke tombol pemicu awal.

---

## 13. Customization

### Mengganti Seluruh Isi Konten Popover
Gunakan slot `#content` jika ingin menyematkan komponen formulir atau picker kustom:

```vue
<template>
  <Dropdown align="right" width="64">
    <template #trigger>
      <button class="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100">Filter Cepat</button>
    </template>

    <template #content="{ close }">
      <div class="p-4 space-y-3">
        <h4 class="text-xs font-bold text-slate-800">Rentang Tanggal</h4>
        <input type="date" class="w-full text-xs p-1.5 rounded border border-slate-200" />
        <button @click="close" class="w-full py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg">
          Terapkan Filter
        </button>
      </div>
    </template>
  </Dropdown>
</template>
```

---

## 14. Accessibility

- **WAI-ARIA Pattern**: Panel menu menggunakan `role="menu"` dan setiap item membawa `role="menuitem"`. Item berstatus heading menggunakan `role="none"` atau `presentation`.
- **Trigger Association**: Elemen pemicu memiliki atribut `aria-haspopup="true"` dan `aria-expanded="true|false"` yang secara dinamis mencerminkan status popover.
- **Focus Management**: Ketika dibuka melalui keyboard, fokus otomatis diarahkan ke opsi pertama yang dapat dipilih.
- **Contrast Ratios**: Seluruh varian teks dan latar memenuhi standar WCAG 2.1 Level AA dengan rasio kontras minimal 4.5:1.

---

## 15. Responsive Behavior

- **Edge Clamping & Viewport Containment**: Popover panel dibatasi maksimal selebar `max-w-[calc(100vw-2rem)]` dan tinggi vertikal `max-h-[85vh]` pada perangkat mobile (`sm:max-h-[75vh]` pada tablet/desktop) dengan `overflow-y-auto`, mencegah menu meluap keluar batas layar.
- **Top / Bottom Placement Adaptation**: Mendukung `placement="top"` (dropup) jika tombol pemicu berada di dekat bagian bawah viewport seluler agar menu tidak tertutup bilah navigasi bawah browser.
- **Touch-Friendly Tap Targets**: Setiap baris opsi menu dirancang dengan tinggi minimum 36px-44px agar nyaman disentuh jari tanpa terjadi salah tekan.
- **Full Width Support (`triggerBlock`)**: Mode `triggerBlock="true"` dan `width="full"` membuat tombol pemicu dan popover membentang selebar kontainer induk, ideal untuk formulir mobile.

---

## 16. Do / Don't

| Rekomendasi (Do) | Pantangan (Don't) |
|---|---|
| Gunakan varian `rich` untuk menu navigasi akun atau pemilih ruang kerja dengan informasi pendukung. | Jangan menaruh terlalu banyak teks deskripsi hingga item menu terlihat seperti paragraf artikel. |
| Gunakan `align="right"` untuk dropdown yang terletak di tepi kanan halaman atau kolom terakhir tabel. | Jangan biarkan menu melayang keluar batas layar (*overflow screen*) tanpa penyesuaian align. |
| Tempatkan aksi destruktif (seperti Hapus atau Logout) di bagian paling bawah dengan varian `danger`. | Jangan menempatkan tombol hapus di baris pertama tanpa pemisah (*separator*). |
| Sertakan label `shortcut` jika tindakan tersebut memiliki padanan pintasan tombol keyboard global. | Jangan membuat dropdown bertingkat terlalu dalam (*nested submenus*) pada layar sentuh ponsel. |

---

## 17. Examples / Recipes

### Recipe 1: Pemilih Pengurutan Data Tabel (Radio Sorting Selector)
```vue
<DropdownComponent
  :items="[
    { label: 'Paling Baru', selected: true },
    { label: 'Paling Lama', selected: false },
    { label: 'Nominal Tertinggi', selected: false },
  ]"
  trigger-label="Urutkan"
  trigger-icon="sort"
  variant="pills"
  color-theme="emerald"
  show-arrow
/>
```

### Recipe 2: Context Menu Ringkas Ala MacOS dengan Pintasan Keyboard
```vue
<DropdownComponent
  :items="[
    { label: 'Salin Teks', icon: 'content_copy', shortcut: 'Ctrl+C' },
    { label: 'Tempel Teks', icon: 'content_paste', shortcut: 'Ctrl+V' },
    { separator: true },
    { label: 'Pilih Semua', icon: 'select_all', shortcut: 'Ctrl+A' },
  ]"
  variant="pills"
  width="56"
  radius="xl"
/>
```

### Recipe 3: Searchable Action Menu dengan Header & Footer Cepat
```vue
<DropdownComponent
  :items="actionsList"
  trigger-label="Cari Aksi Cepat"
  trigger-icon="search"
  trigger-variant="solid"
  trigger-color="primary"
  variant="rich"
  width="72"
  searchable
  search-placeholder="Ketik nama tindakan..."
  header-text="AKSI CEPAT SISTEM"
  footer-text="Tekan Esc untuk membatalkan"
/>
```

---

## 18. Related Components

- **[ButtonSubmit Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/button-submit.md)**: Komponen tombol yang sering digunakan sebagai elemen pemicu dropdown kustom.
- **[Badge Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/badge.md)**: Lencana penanda status yang disematkan di dalam baris item dropdown.
- **[Avatar Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/avatar.md)**: Komponen foto profil yang kerap menjadi pemicu dropdown akun pengguna.
- **[Card Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/card.md)**: Kontainer kartu yang sering memuat dropdown pada area header.

---

## 19. Notes / Limitations

- **CSS Stacking Context on Parent Overflow**: Jika kontainer induk kartu atau tabel memiliki kelas `overflow: hidden`, panel popover dropdown absolut dapat terpotong secara visual. Solusinya, gunakan `overflow: visible` pada kontainer induk atau pastikan ruang margin mencukupi.
- **Single Instance Focus**: Komponen menutup secara otomatis jika komponen dropdown lain pada halaman yang sama dibuka oleh pengguna.
- **SSR Hydration Compatibility**: Pembuatan ID elemen dan pendeteksi window/document telah dilindungi dengan pengecekan aman agar tidak menimbulkan hydration mismatch saat dirender dari sisi server.
