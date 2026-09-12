# 🌓 Composable `useTheme`

[← Kembali ke Dokumentasi Utama](../../README.md) | [Lihat Komponen ButtonTheme](../components/button-theme.md)

`useTheme` adalah composable pengelola mode tampilan (gelap/terang/sistem) yang terintegrasi secara langsung dengan Tailwind CSS class `.dark` pada elemen `<html>`, mendengarkan preferensi sistem operasi (*OS prefers-color-scheme*), serta menyimpan pilihan pengguna ke `localStorage`.

---

## 🚀 Import & Inisialisasi

```javascript
import { useTheme } from '@/Composables/Pack/useTheme';

const {
    theme,
    isDark,
    toggleTheme,
    cycleTheme,
    setTheme,
    initTheme,
    cleanupTheme,
    subscribe,
} = useTheme();
```

---

## 📋 Daftar API & Method

| Properti / Method | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `theme` | `Ref<String>` | State tema saat ini: `'light'`, `'dark'`, atau `'system'` |
| `isDark` | `Ref<Boolean>` | Menghasilkan nilai `true` jika tampilan saat ini sedang berada pada mode gelap |
| `toggleTheme(includeSystem)` | `(includeSystem?: boolean) => void` | Beralih antara light $\leftrightarrow$ dark (atau siklus 3-arah jika `includeSystem = true`) |
| `cycleTheme()` | `() => void` | Beralih berurutan: `'light'` $\to$ `'dark'` $\to$ `'system'` $\to$ `'light'` |
| `setTheme(themeName)` | `(name: 'light' \| 'dark' \| 'system') => void` | Menyetel tema secara eksplisit dan memperbarui DOM serta `localStorage` |
| `initTheme()` | `() => void` | Menginisialisasi tema dari `localStorage` atau OS dan memasang event listener mediaQuery |
| `cleanupTheme()` | `() => void` | Melepas listener event mediaQuery sistem untuk mencegah memory leak |
| `subscribe(callback)` | `(cb: (state) => void) => () => void` | Mendaftarkan listener kustom saat tema berganti; mengembalikan fungsi *unsubscribe* |

---

## ⚙️ Prasyarat Konfigurasi Tailwind CSS v4

Agar class `.dark` pada tag `<html>` dapat mempengaruhi seluruh class utilitas `dark:` di Tailwind CSS v4, tambahkan konfigurasi `@custom-variant dark` pada file stylesheet utama Anda (`resources/css/app.css`):

```css
@import 'tailwindcss';
@import 'material-symbols';

/* Wajib untuk Tailwind v4 */
@custom-variant dark (&:where(.dark, .dark *));
```

---

## 💡 Contoh Penggunaan

### 1. Toggle Sederhana di Tombol Kustom
```vue
<script setup>
import { useTheme } from '@/Composables/Pack/useTheme';

const { isDark, toggleTheme } = useTheme();
</script>

<template>
  <button 
    @click="toggleTheme()" 
    class="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
  >
    <span>Mode Saat Ini: {{ isDark ? 'Gelap 🌙' : 'Terang ☀️' }}</span>
  </button>
</template>
```

### 2. Memilih Tema Eksplisit (Light / Dark / System)
```vue
<script setup>
import { useTheme } from '@/Composables/Pack/useTheme';

const { theme, setTheme } = useTheme();
</script>

<template>
  <div class="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 gap-1">
    <button 
      @click="setTheme('light')" 
      :class="[theme === 'light' ? 'bg-white shadow text-blue-600' : 'text-slate-600 dark:text-slate-400']"
      class="px-3 py-1.5 text-xs font-semibold rounded-lg transition"
    >
      Terang
    </button>
    <button 
      @click="setTheme('dark')" 
      :class="[theme === 'dark' ? 'bg-slate-900 shadow text-amber-400' : 'text-slate-600 dark:text-slate-400']"
      class="px-3 py-1.5 text-xs font-semibold rounded-lg transition"
    >
      Gelap
    </button>
    <button 
      @click="setTheme('system')" 
      :class="[theme === 'system' ? 'bg-white dark:bg-slate-900 shadow text-indigo-600' : 'text-slate-600 dark:text-slate-400']"
      class="px-3 py-1.5 text-xs font-semibold rounded-lg transition"
    >
      Sistem (Otomatis)
    </button>
  </div>
</template>
```

### 3. Berlangganan Perubahan Tema dari Luar Komponen
```javascript
import { useTheme } from '@/Composables/Pack/useTheme';

const { subscribe } = useTheme();

// Reaksi terhadap perubahan tema, misal untuk mengubah konfigurasi grafik Chart.js / ApexCharts
const unsubscribe = subscribe(({ theme, isDark }) => {
    console.log('Tema berganti ke:', theme, 'isDark:', isDark);
    myChart.updateOptions({
        theme: { mode: isDark ? 'dark' : 'light' }
    });
});

// Panggil unsubscribe() saat komponen dilepas (onUnmounted)
```

