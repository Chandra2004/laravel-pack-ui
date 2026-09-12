# 🌓 ButtonTheme Component (`ButtonTheme.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md) | [Composable useTheme](../composables/use-theme.md)

---

## 6. ButtonTheme Component & useTheme Composable

Sistem pengubah tema mode gelap/terang (*dark & light mode toggle*) yang terintegrasi penuh dengan Tailwind CSS `class="dark"` pada tag `<html>`, deteksi preferensi OS pengguna (*prefers-color-scheme*), serta persistensi state di `localStorage`.

### Lokasi File

* **Component**: `ButtonTheme.vue`
* **Composable**: `useTheme.js`
* **Stylesheet (CSS)**: `resources/css/app.css`

### 📁 File yang Terkait & Konfigurasi CSS (`app.css`)

Untuk mengaktifkan tombol ini di project, pastikan file CSS dan modul berikut terpasang:

1. **Konfigurasi CSS (`resources/css/app.css`)**:
   ```css
   @import 'tailwindcss';
   @import 'material-symbols';

   /* Baris 4: Wajib untuk Tailwind v4 agar mengenali class="dark" di <html> */
   @custom-variant dark (&:where(.dark, .dark *));
   ```
2. **State Composable**: `resources/js/Composables/Pack/useTheme.js`
3. **Komponen UI**: `resources/js/Components/Pack/ButtonTheme.vue`
4. **Layout Aplikasi**: Tempelkan `<ButtonTheme />` pada topbar/header layout Anda.

---

### Fitur Desain & Styling:
* **Murni Tailwind CSS**: Desain tombol modern (`rounded-xl`, `border border-slate-200/80 dark:border-slate-800`, `bg-white dark:bg-slate-900`, `active:scale-95`).
* **Google Material Symbols**: Ikon `dark_mode` (saat mode terang) dan `light_mode` (warna amber hangat saat mode gelap).
* **Animasi Mikro Transisi Ikon**: Efek hover scale dan transition halus pada interaksi kursor dengan palet warna biru serasi.
* **Deteksi Otomatis & Cepat Preferensi Sistem (OS)**: Otomatis mengevaluasi preferensi tema pengguna (`prefers-color-scheme: dark`) secara instan sejak pemuatan pertama tanpa flicker salah default.
* **Multi-Varian Desain**: Mendukung tombol ikon (`variant="icon"`), tombol berlabel (`variant="button"`), slider toggle standar (`variant="switch"` dengan dimensi baku `h-6 w-11`), dan segmented tab (`variant="segmented"` dengan warna aktif konsisten).
* **Aksesibilitas Lengkap (A11y)**: Dilengkapi `role="group"`, `aria-label`, `aria-pressed`, dan `role="switch"` untuk pengalaman screen reader optimal.
* **Siklus 3 Mode & Subscribable**: Mendukung siklus mode sistem via prop `cycle` / `cycleTheme()`, serta fungsi reaktif `subscribe()` dari luar komponen.

### Component Props API (`<ButtonTheme />`)

| Prop | Tipe Data | Default | Deskripsi / Pilihan Nilai |
| :--- | :--- | :--- | :--- |
| `variant` | `String` | `'icon'` | Bentuk tampilan tombol: `'icon'`, `'button'`, `'switch'`, `'segmented'` |
| `size` | `String` | `'md'` | Ukuran tombol: `'sm'` (32px), `'md'` (38px), `'lg'` (44px) |
| `showLabel` | `Boolean` | `false` | Menampilkan teks deskripsi tema di samping ikon |
| `labelLight` | `String` | `'Mode Terang'` | Teks yang ditampilkan saat tema terang aktif |
| `labelDark` | `String` | `'Mode Gelap'` | Teks yang ditampilkan saat tema gelap aktif |
| `labelSystem`| `String` | `'Mode Sistem'` | Teks yang ditampilkan saat tema sistem aktif |
| `cycle` | `Boolean` | `false` | Mengaktifkan siklus 3 mode (*Terang $\to$ Gelap $\to$ Sistem*) saat tombol ikon/button diklik |

### Composable API (`useTheme()`)

```javascript
import { useTheme } from '@/Composables/Pack/useTheme';

const { theme, isDark, toggleTheme, cycleTheme, setTheme, initTheme, cleanupTheme, subscribe } = useTheme();
```

| Return Property / Method | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `theme` | `Ref<String>` | Nilai tema yang tersimpan (`'light'`, `'dark'`, atau `'system'`) |
| `isDark` | `Ref<Boolean>` | `true` jika mode gelap sedang aktif di aplikasi |
| `toggleTheme(includeSystem = false)` | `Function` | Mengubah tema antara light $\leftrightarrow$ dark (atau siklus jika `includeSystem = true`) |
| `cycleTheme()` | `Function` | Mengganti tema berurutan: `'light'` $\to$ `'dark'` $\to$ `'system'` $\to$ `'light'` |
| `setTheme(themeName)`| `Function` | Mengatur tema secara langsung (`'light'`, `'dark'`, atau `'system'`) |
| `initTheme()` | `Function` | Menginisialisasi tema dan memasang listener OS (*auto-called by component*) |
| `cleanupTheme()` | `Function` | Melepas listener event mediaQuery OS untuk mencegah memory leak |
| `subscribe(callback)`| `Function` | Mendaftarkan fungsi listener saat tema berubah; mengembalikan fungsi unsubscribe |

### Contoh Penggunaan ButtonTheme

#### 1. Pasang di Topbar / Header Layout
```vue
<script setup>
import ButtonTheme from '@/Components/Pack/ButtonTheme.vue';
</script>

<template>
  <header class="flex items-center justify-between p-4 border-b">
    <div class="logo font-bold">Aplikasi Saya</div>

    <!-- Tombol Ganti Tema Ikon Standar -->
    <ButtonTheme size="md" />
  </header>
</template>
```

#### 2. Varian Segmented (Pilihan 3 Mode: Terang, Gelap, Sistem)
```vue
<template>
  <ButtonTheme variant="segmented" />
</template>
```

#### 3. Varian Switch Pill Toggle
```vue
<template>
  <!-- Slider switch toggle interaktif -->
  <ButtonTheme variant="switch" show-label />
</template>
```

---