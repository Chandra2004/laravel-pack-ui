# 🔽 Dropdown Component (`Dropdown.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen menu dropdown aksi melayang (*action popover menu*) enterprise berbasis Vue 3 dan Tailwind CSS yang telah menerapkan **5 Pilar Standar UI (Warna, Bentuk, Teks Konten, Icon, & Responsif)**. Komponen ini dirancang untuk menu aksi baris tabel, menu navigasi profil, pemilih ruang kerja (*workspace switcher*), dan pemilihan opsi radio/centang.

Untuk menghindari tampilan yang kaku dan monoton, komponen menyediakan **5 variasi desain visual**: **`rich`** (*Two-line Cards dengan Icon Box*), **`glassmorphic`** (*Floating Glass*), **`pills`** (*Rounded Capsule Hover*), **`bordered`** (*Accent Top Strip*), dan **`default`** (*Classic Clean*). Dilengkapi pula dengan navigasi keyboard standar WAI-ARIA dan penutupan otomatis saat klik di luar area (*click outside*).

---

## 🏛️ Penerapan 5 Pilar UI (`peraturan.md`)

1. **Warna (`colorTheme` & Varian Item)**:
   - Mendukung 8 tema warna resmi Pack UI: `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, dan `'dark'`.
   - Mengatur warna sorot saat hover/fokus, kotak latar ikon (*icon box*), aksen garis atas varian bordered, ring pemicu, dan ikon centang item aktif (`selected`).
   - Varian warna semantik per item menu: `'default'`, `'primary'`, `'success'`, `'warning'`, `'danger'`, dan `'info'`.
   - Mendukung mode gelap (*dark mode*) dan terang (*light mode*) dengan rasio kontras tinggi.

2. **Bentuk & Desain Anti-Monoton (`variant`, `radius`, `size`, `width`)**:
   - **`variant`**:
     - `'rich'`: Format kartu berpenjelasan 2-baris (judul tebal + deskripsi subteks) dengan kotak ikon berwarna (*icon badge box*), ideal untuk navigasi fitur atau switcher workspace/akun.
     - `'glassmorphic'`: Efek kaca melayang mewah dengan `backdrop-blur-xl` semi-transparan dan bayangan elevasi tinggi (*shadow-2xl*).
     - `'pills'`: Item menu dengan sudut bulat penuh/kapsul (*rounded-full*), padding ramping, modern ala context menu MacOS.
     - `'bordered'`: Popover bergaris tepi tegas dengan aksen strip warna tema pada sisi atas.
     - `'default'`: Popover standar yang bersih, minimalis, dan elegan.
   - **`radius`**: Pilihan sudut kelengkungan kontainer dan item menu (`'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`, `'full'`).
   - **`size`**: Dimensi ukuran teks, ikon, dan padding item menu (`'sm'`, `'md'`, `'lg'`).
   - **`width`**: Lebar kontainer popover (`'auto'`, `'32'`, `'40'`, `'48'`, `'56'`, `'64'`, `'72'`, `'80'`, `'96'`, `'full'`).

3. **Teks Konten & Struktur Item Kaya**:
   - Judul utama (`label`) dan penjelasan subteks (`description`).
   - Label seksi grup kategori (`heading`) dan garis pemisah (`separator`).
   - Badge penanda status (`badge` & `badgeVariant`).
   - Label pintasan keyboard (`shortcut`, misal: `'⌘E'`, `'Ctrl+D'`).
   - Penanda opsi aktif (`selected: true`) dengan ikon centang otomatis.
   - Scoped slots fleksibel: `#trigger`, `#header`, `#footer`, `#item`, dan `#content`.

4. **Icon & Navigasi**:
   - Google Material Symbols untuk setiap item menu.
   - Ikon kotak latar belakang (*icon box*) pada varian `rich`.
   - Ikon centang aktif (`check`) untuk menu opsi radio/pilihan.
   - Kustomisasi tombol pemicu default via props `triggerIcon`, `triggerLabel`, dan `showArrow`.
   - Mikro-animasi rotasi panah chevron saat terbuka/tertutup dan transisi skala popover (`scale-95` ke `scale-100`).

5. **Responsif & Aksesibilitas (WAI-ARIA)**:
   - Penjajaran dinamis: `align: 'left' | 'right' | 'center'`.
   - Area klik sentuh (*touch target*) minimal tinggi 36px-44px pada layar smartphone.
   - Navigasi keyboard penuh: `ArrowDown`, `ArrowUp`, `Home`, `End`, `Enter`, `Space`, dan `Escape`.

---

## ⚙️ Component Props API (`<Dropdown />`)

| Prop | Tipe Data | Default | Pilihan Nilai / Deskripsi |
| :--- | :--- | :--- | :--- |
| `items` | `Array` | `[]` | Daftar item menu (lihat tabel Format Objek Item) |
| `colorTheme` | `String` | `'primary'` | Tema warna: `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'` |
| `variant` | `String` | `'default'` | Gaya visual: `'default'`, `'glassmorphic'`, `'rich'`, `'pills'`, `'bordered'` |
| `radius` | `String` | `'xl'` | Kelengkungan sudut: `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`, `'full'` |
| `size` | `String` | `'md'` | Dimensi ukuran item: `'sm'`, `'md'`, `'lg'` |
| `width` | `String` | `'48'` | Lebar container: `'auto'`, `'32'`, `'40'`, `'48'`, `'56'`, `'64'`, `'72'`, `'80'`, `'96'`, `'full'` |
| `align` | `String` | `'left'` | Penjajaran menu terhadap tombol trigger: `'left'`, `'right'`, `'center'` |
| `triggerIcon` | `String` | `'more_vert'` | Ikon Material Symbols tombol pemicu bawaan |
| `triggerLabel` | `String` | `''` | Teks label tombol pemicu bawaan (jika ingin tombol berisi teks) |
| `showArrow` | `Boolean` | `false` | Menampilkan ikon panah chevron pada tombol pemicu bawaan yang berputar saat dibuka |
| `contentClasses` | `String` | `''` | Class Tailwind tambahan untuk elemen kontainer popover menu |
| `closeOnClick` | `Boolean` | `true` | Otomatis menutup popover setelah salah satu opsi diklik |
| `disabled` | `Boolean` | `false` | Menonaktifkan interaksi tombol dropdown |

---

## 🧩 Format Objek Item Menu (`items`)

| Field | Tipe Data | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `label` | `String` | `''` | Teks judul item menu |
| `description` | `String` | `''` | Teks deskripsi / subteks di bawah judul (berguna pada varian `rich`) |
| `icon` | `String` | `''` | Nama Google Material Symbols |
| `iconColor` | `String` | `''` | Class warna kustom ikon (opsional) |
| `badge` | `String` | `''` | Label badge status kecil di samping judul (misal: `'Pro'`, `'Baru'`) |
| `badgeVariant` | `String` | `''` | Warna badge: `'primary'`, `'indigo'`, `'emerald'`, `'amber'`, `'rose'`, `'slate'` |
| `shortcut` | `String` | `''` | Teks pintasan keyboard (misal: `'⌘D'`, `'Ctrl+S'`) |
| `selected` | `Boolean` | `false` | Menampilkan tanda centang aktif di sebelah kanan |
| `heading` | `String` | `''` | Menjadikan item sebagai judul seksi kategori menu (non-interaktif) |
| `separator` | `Boolean` | `false` | Menjadikan item sebagai garis pemisah horizontal (*divider*) |
| `disabled` | `Boolean` | `false` | Menonaktifkan interaksi klik item |
| `href` | `String` | `''` | Tautan navigasi URL/Inertia (dirender sebagai tag `<a>`) |
| `action` | `Function` | `null` | Fungsi callback yang dijalankan saat diklik: `(item) => void` |
| `variant` | `String` | `'default'` | Varian warna semantik: `'default'`, `'primary'`, `'success'`, `'warning'`, `'danger'`, `'info'` |

---

## 🔔 Events API (`<Dropdown />`)

| Event Name | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `@select` | `item: Object` | Dipancarkan ketika salah satu item menu diklik |
| `@open` | — | Dipancarkan saat menu popover mulai terbuka |
| `@close` | — | Dipancarkan saat menu popover tertutup |

---

## 🪟 Slots API (`<Dropdown />`)

| Slot Name | Props Slot | Deskripsi |
| :--- | :--- | :--- |
| `#trigger` | `{ isOpen, toggle, open, close }` | Kustomisasi tombol pemicu pembuka dropdown |
| `#header` | `{ close }` | Kustomisasi bagian atas popover (misal: info akun, status) |
| `#footer` | `{ close }` | Kustomisasi bagian bawah popover (misal: tombol logout) |
| `#item` | `{ item, index, close, isSelected, isFocused }` | Kustomisasi rendering baris item menu |
| `#content` | `{ close }` | Menggantikan seluruh daftar item dengan konten HTML/Vue kustom bebas |

---

## 🚀 Contoh Penggunaan

### 1. Varian Rich Cards (Workspace / Organisasi Switcher)
```vue
<script setup>
import Dropdown from '@/Components/Pack/Dropdown.vue';

const workspaces = [
  {
    label: 'Enterprise Workspace',
    description: 'Akses seluruh modul & tim tanpa batas',
    icon: 'corporate_fare',
    badge: 'Aktif',
    badgeVariant: 'emerald',
    selected: true,
  },
  {
    label: 'Sandbox Developer',
    description: 'Uji coba integrasi API pembayaran',
    icon: 'code_blocks',
    badge: 'Dev',
  },
  { separator: true },
  {
    label: 'Tambah Workspace Baru',
    description: 'Buat ruang kerja organisasi baru',
    icon: 'add_circle',
    variant: 'primary',
  },
];
</script>

<template>
  <Dropdown
    :items="workspaces"
    variant="rich"
    color-theme="emerald"
    width="80"
    radius="2xl"
  />
</template>
```

### 2. Varian Glassmorphic dengan Trigger Kustom
```vue
<template>
  <Dropdown
    :items="cloudActions"
    variant="glassmorphic"
    color-theme="indigo"
    width="56"
  >
    <template #trigger="{ isOpen }">
      <button class="px-3 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5">
        <span>Aksi Cloud</span>
        <span class="material-symbols-outlined text-sm" :class="{ 'rotate-180': isOpen }">expand_more</span>
      </button>
    </template>
  </Dropdown>
</template>
```

### 3. Varian Pills untuk Radio Selection (Pilihan Mata Uang)
```vue
<template>
  <Dropdown
    :items="currencyList"
    variant="pills"
    color-theme="purple"
    width="64"
    radius="2xl"
    @select="(c) => changeCurrency(c)"
  />
</template>
```
