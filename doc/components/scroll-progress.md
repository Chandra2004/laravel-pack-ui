# 📊 Scroll Progress Component (`ScrollProgress.vue` & `useScrollProgress.js`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen visual indikator progres scroll (*Scroll Progress Bar*) enterprise berbasis Vue 3 dan Tailwind CSS yang telah menerapkan **5 Pilar Standar UI (Warna, Bentuk, Teks Konten, Icon, & Responsif)**. Dilengkapi composable mandiri `useScrollProgress.js` berkinerja tinggi (60fps passive listener + `requestAnimationFrame`), 4 mode tampilan anti-monoton (**Linear Edge Bar**, **Floating Pill**, **Circular SVG Ring**, dan **Minimal Line**), kalkulasi estimasi sisa waktu baca (*reading time*), serta aksi terintegrasi *Back to Top*.

---

## 🏛️ Penerapan 5 Pilar UI (`peraturan.md`)

1. **Warna (`colorTheme` & `variant`)**:
   - Mendukung 9 palet tema warna solid pekat: `'default'`/`'dark'` (`#4B5563`), `'primary'` (Sky), `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, dan `'rainbow'`.
   - Varian visual:
     - `'solid'` (Default): Warna solid pekat kontras tinggi dengan teks/ikon putih bersih (`text-white`) dan rel kontras tajam. Bebas dari efek neon silau/kabur.
     - `'surface'`: Latar belakang solid netral (`bg-white` / `dark:bg-slate-800`) dengan aksen ring dan teks warna solid.
     - `'soft'`: Latar belakang solid lembut bertingkat (*tinted*).
     - `'gradient'`: Gradien modern dinamis.
     - `'glass'`: Kaca buram translucent (*glassmorphism*).
   - Kustomisasi background track (`track`, `trackColor`) dan fill kustom (`barColor` atau `color`).

2. **Bentuk & Desain Anti-Monoton (`type`, `position`, `thickness`, `rounded`, `headIndicator`)**:
   - **4 Tipe Mode (`type`)**:
     1. `type="bar"`: Bilah linear menempel di tepi atas/bawah/kiri/kanan window atau kontainer (gaya Inertia / NProgress).
     2. `type="floating-pill"`: Kapsul solid mengambang modern dengan kombinasi mini bar, ikon, teks label, persentase, dan aksi scroll-to-top.
     3. `type="circular"`: Lingkaran SVG solid dengan kombinasi **Icon + Teks** vertikal terpusat yang terisi mulus dan bertindak ganda sebagai tombol *Scroll to Top*.
     4. `type="minimal"`: Garis ultra-tipis (2px) bersih di tepi layar tanpa latar belakang track.
   - **Posisi Fleksibel (`position`)**:
     - Untuk mode bar: `'top'`, `'bottom'`, `'left'`, `'right'`, atau `'inline'`.
     - Untuk mode circular & pill: `'bottom-right'`, `'bottom-left'`, `'top-right'`, `'top-left'`, `'bottom-center'`, atau `'inline'`.
   - **Ketebalan (`thickness`)**: Preset `'xs'` (2px), `'sm'` (3px), `'md'` (4px), `'lg'` (6px), `'xl'` (8px), atau nilai numerik kustom (piksel).
   - **Ukuran Lingkaran (`size`)**: Default `56` (px), proporsional dan responsif.
   - **Kelengkungan (`rounded`)**: `'none'`, `'sm'`, `'md'`, `'lg'`, `'full'`.
   - **Indikator Kepala (`headIndicator`)**: `'none'`, `'dot'` (titik lingkaran), `'pulse'` (gelombang radar berdenyut), `'glow-spark'`, dan `'icon'` (ikon roket/panah bergerak maju).

3. **Teks Konten (`showPercentage`, `showReadingTime`, `label`, `showText`)**:
   - `showPercentage`: Menampilkan persentase pembacaan (e.g. `69%`).
   - `showText`: Menentukan apakah teks ditampilkan (default `true`).
   - Pada `type="circular"`, teks persentase atau label otomatis tersusun vertikal tepat di bawah ikon untuk keterbacaan optimal.
   - `showReadingTime`: Menghitung estimasi sisa waktu baca dalam satuan menit berdasarkan kedalaman scroll dan estimasi jumlah kata (`wordsCount` & `wordsPerMinute`).
   - `label`: Label teks deskriptif (misal: `"Dokumentasi API"` atau `"TOP"`).
   - `prefix` & `suffix`: Format teks kustom (misal: `prefix="Selesai "` atau `suffix="%"`);

4. **Icon & Interaktivitas (`showIcon`, `completeIcon`, `clickable`, `backToTop`)**:
   - **Perpaduan Harmonis Icon + Teks**: Pada mode `circular`, ikon (e.g. `arrow_upward`, `rocket_launch`) dan teks persentase tampil berdampingan secara vertikal tanpa efek tabrakan hover.
   - `showIcon`: Kontrol visibilitas ikon (default: `true`).
   - `completeIcon`: Ikon otomatis berganti (default: `'check_circle'`) saat pembacaan mencapai 100%.
   - `clickable` / `backToTop`: Mengklik bar, pill, atau lingkaran akan meluncurkan animasi scroll mulus (*smooth scrolling*) kembali ke puncak halaman/kontainer dengan efek translasi naik halus pada ikon.
   - `hideAtTop`: Sembunyikan otomatis saat di posisi 0% (default `false` agar kontrol tetap tampak).

5. **Responsif & Performa Eksekusi**:
   - Eksekusi scroll throttled via `window.requestAnimationFrame` dan `{ passive: true }` untuk menjaga kestabilan 60-120fps.
   - Ukuran font dan icon otomatis beradaptasi proporsional mengikuti prop `size` (`>=64px`, `>=52px`, `<52px`).
   - `pointer-events-none` pada elemen pasif agar tidak mengganggu klik elemen lain di baliknya, dan `pointer-events-auto` pada tombol interaktif.

---

## 📋 Props API (`<ScrollProgress />`)

| Prop | Tipe | Default | Deskripsi / Pilihan Nilai |
|---|---|---|---|
| `target` | `String \| Object` | `'auto'` | Target scroll (`'auto'` / `null` = auto-detect window/main, selector `#id`, atau `HTMLElement`) |
| `type` | `String` | `'bar'` | Tipe tampilan: `'bar'`, `'floating-pill'`, `'circular'`, `'minimal'`, `'inertia'` |
| `position` | `String` | `'top'` | Posisi: `'top'`, `'bottom'`, `'left'`, `'right'`, `'bottom-right'`, `'bottom-left'`, `'top-right'`, `'top-left'`, `'bottom-center'`, `'inline'` |
| `color` | `String` | `''` | Warna hex kustom (misal: `'#4B5563'` seperti `app.js`, `'#7c3aed'`, `'#059669'`) |
| `showSpinner` | `Boolean` | `false` | Menampilkan spinner NProgress di pojok kanan atas saat scrolling aktif |
| `peg` | `Boolean` | `true` | Efek bayangan pendaran NProgress Peg (glow tip shadow) di ujung depan bar |
| `colorTheme` | `String` | `'dark'` | Tema warna solid: `'dark'` (`#4B5563`), `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'rainbow'` |
| `variant` | `String` | `'solid'` | Varian gaya: `'solid'` (pekat tanpa neon), `'surface'`, `'soft'`, `'gradient'`, `'glass'`, `'glow'` |
| `thickness` | `String \| Number` | `'sm'` | Ketebalan: `'xs'` (2px), `'sm'` (3px), `'md'` (4px), `'lg'` (6px), `'xl'`, atau angka px |
| `rounded` | `String` | `'none'` | Radius sudut: `'none'`, `'sm'`, `'md'`, `'lg'`, `'full'` |
| `headIndicator` | `String` | `'none'` | Hiasan ujung bar: `'none'`, `'dot'`, `'pulse'`, `'glow-spark'`, `'icon'` |
| `size` | `Number \| String` | `56` | Diameter lingkaran SVG untuk `type="circular"` (px) |
| `glow` | `Boolean` | `false` | Menyalakan bayangan pendaran aura neon (default false agar warna tetap solid) |
| `track` | `Boolean` | `false` | Menampilkan latar belakang rel bar (*track*) |
| `trackColor` | `String` | `''` | Kelas Tailwind kustom untuk rel bar |
| `barColor` | `String` | `''` | Kelas Tailwind kustom untuk warna bar |
| `showPercentage` | `Boolean` | `false` | Menampilkan teks angka persentase |
| `showIcon` | `Boolean` | `true` | Menampilkan ikon navigasi / status di mode circular & pill |
| `showText` | `Boolean` | `true` | Menampilkan teks konten di mode circular |
| `percentagePosition` | `String` | `'follower'` | Letak persentase pada bar: `'inside'`, `'follower'`, `'center'` |
| `label` | `String` | `''` | Teks keterangan pada `floating-pill` atau `circular` |
| `showReadingTime` | `Boolean` | `false` | Menghitung sisa menit membaca |
| `wordsCount` | `Number` | `0` | Jumlah kata artikel untuk kalkulasi waktu baca |
| `wordsPerMinute` | `Number` | `200` | Kecepatan rata-rata membaca kata per menit |
| `icon` | `String` | `''` | Nama Material Symbol ikon utama (default auto: `'arrow_upward'`) |
| `completeIcon` | `String` | `'check_circle'` | Ikon saat progres mencapai 100% |
| `clickable` / `backToTop` | `Boolean` | `false` | Mengaktifkan klik untuk meluncur kembali ke atas |
| `hideAtTop` | `Boolean` | `false` | Sembunyikan otomatis saat di posisi 0% (default `false`) |
| `threshold` | `Number` | `1` | Ambang batas persentase atas (%) |
| `fixed` | `Boolean` | `true` | Posisi CSS fixed (`true`) atau inline/relative (`false`) |
| `zIndex` | `Number \| String` | `99999` | Nilai kedalaman z-index |

---

## ⚡ Events & Slots

### Events
- `@update:progress`: Dipancarkan setiap kali nilai progres scroll berubah `(progress: number)`.
- `@complete`: Dipancarkan ketika pembacaan mencapai ambang 100% `(progress: number)`.
- `@scroll-to-top`: Dipancarkan saat pengguna mengklik tombol *Scroll to Top*.

### Slots
- `#default`: Slot kustom untuk konten bagian dalam `circular` atau `floating-pill` `({ progress, isComplete })`.
- `#percentage`: Slot pemformat persentase khusus `({ progress })`.
- `#icon`: Slot kustom untuk ikon `({ isComplete })`.

---

## 🧩 Composable API (`useScrollProgress.js`)

Jika Anda ingin membangun antarmuka scroll kustom tanpa komponen visual bawaan, gunakan composable `useScrollProgress`:

```javascript
import { useScrollProgress } from '@/Composables/Pack/useScrollProgress';

const {
    progress,             // Ref<number> (0 - 100)
    scrollPercent,        // Computed<number> (0 - 1)
    scrollTop,            // Ref<number> (posisi piksel)
    isAtTop,              // Computed<boolean> (apakah <= threshold)
    isComplete,           // Computed<boolean> (apakah >= 99.5%)
    readingTimeRemaining, // Computed<number> (sisa menit)
    scrollToTop,          // Function: scrollToTop('smooth' | 'auto')
    scrollToProgress,     // Function: scrollToProgress(percentage, behavior)
} = useScrollProgress({
    target: null,          // null = window, atau ref/selector HTMLElement
    threshold: 5,          // Ambang persentase atas
    wordsCount: 1200,      // Estimasi jumlah kata
    wordsPerMinute: 200,   // Kecepatan membaca
});
```

---

## 💡 Contoh Penggunaan

### 1. Progress Bar Mode Inertia.js (Persis app.js: progress: { color: '#4B5563', showSpinner: true })
```vue
<script setup>
import ScrollProgress from '@/Components/Pack/ScrollProgress.vue';
</script>

<template>
    <!-- Bar ramping di paling atas layar dengan warna #4B5563, glowing peg, dan spinner -->
    <ScrollProgress
        color="#4B5563"
        show-spinner
        peg
    />
</template>
```

### 2. Rainbow Gradient + Head Indicator Pulse
```vue
<script setup>
import ScrollProgress from '@/Components/Pack/ScrollProgress.vue';
</script>

<template>
    <!-- Bar menempel di paling atas layar dengan pendaran neon rainbow -->
    <ScrollProgress
        color-theme="rainbow"
        variant="gradient"
        thickness="md"
        head-indicator="pulse"
        glow
    />
</template>
```

### 2. Circular Ring Back-to-Top di Pojok Layar
```vue
<script setup>
import ScrollProgress from '@/Components/Pack/ScrollProgress.vue';
</script>

<template>
    <!-- Lingkaran SVG di pojok kanan bawah yang muncul otomatis saat scroll -->
    <ScrollProgress
        type="circular"
        position="bottom-right"
        color-theme="purple"
        thickness="md"
        show-percentage
        clickable
        hide-at-top
    />
</template>
```

### 3. Floating Pill dengan Estimasi Waktu Baca
```vue
<script setup>
import ScrollProgress from '@/Components/Pack/ScrollProgress.vue';
</script>

<template>
    <!-- Kapsul mengambang di bawah layar dengan sisa waktu baca -->
    <ScrollProgress
        type="floating-pill"
        position="bottom-center"
        color-theme="cyan"
        label="Panduan Developer"
        show-percentage
        show-reading-time
        :words-count="2400"
        clickable
    />
</template>
```

### 4. Pelacakan Scroll Box Kontainer Lokal
```vue
<script setup>
import ScrollProgress from '@/Components/Pack/ScrollProgress.vue';
</script>

<template>
    <div class="relative rounded-xl border border-slate-200 overflow-hidden">
        <!-- Progress bar melacak kontainer #article-box -->
        <ScrollProgress
            target="#article-box"
            type="bar"
            position="top"
            color-theme="emerald"
            thickness="sm"
            :fixed="false"
        />

        <div id="article-box" class="h-64 overflow-y-auto p-6">
            <!-- Konten panjang yang di-scroll di dalam box -->
        </div>
    </div>
</template>
```

