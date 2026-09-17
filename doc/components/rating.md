# ⭐ Rating Component (`Rating.vue`)

Komponen penilaian bintang (*Star Rating & Review Indicator*) enterprise berbasis Vue 3 dan Tailwind CSS v4 yang telah menerapkan **5 Pilar Standar UI (Warna, Bentuk, Teks Konten, Icon, & Responsif)**, pengisian fraksional desimal presisi (*fractional/decimal fill e.g. 1.3/5, 2/5, 4.8/5*), interaksi usap sentuh mobile (*touchmove*), kustomisasi ikon Google Material Symbols / slot SVG, serta pola integrasi **Rating Review & Breakdown Drawer** yang adaptif (*Bottom Sheet* di mobile & *Slide-over* di desktop).

---

## 🏛️ Penerapan 5 Pilar UI (`peraturan.md`)

1. **Warna (`colorTheme` & `color`)**:
   - Mendukung 8 palet tema resmi Pack UI melalui prop `colorTheme`: `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'` (default), `'rose'`, `'cyan'`, dan `'dark'`.
   - Tetap mendukung warna CSS/Tailwind melalui `color` dan kode HEX kustom (`#f59e0b`).
   - Penyesuaian `inactiveColor` untuk bintang kosong dengan kontras otomatis dark/light mode.

2. **Bentuk (`variant` & `radius`)**:
   - **`variant`**:
     - `'default'`: Deretan ikon bintang polos (*bare inline-flex*).
     - `'card'`: Kontainer kartu elegan dengan background soft (`bg-slate-50/80 dark:bg-slate-900/60`), border halus, dan bayangan tipis.
     - `'pill'`: Badge kapsul kompak dengan background pill (`px-3 py-1.5 bg-slate-100 dark:bg-slate-800`).
     - `'bordered'`: Kotak minimalis dengan garis border tipis.
   - **`radius`**: Pilihan kelengkungan sudut kontainer (`'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'full'`).

3. **Teks Konten (`showDescriptive`, `descriptiveTexts`, & `countLabel`)**:
   - Format nilai teks fleksibel: `'fraction'` (1.3 / 5), `'single'` (1.3), `'percent'` (26%), atau `'descriptive'` ("Sangat Puas").
   - Label sentimen otomatis melalui `showDescriptive` dengan kamus pesan yang dapat dikustomisasi (`descriptiveTexts`).
   - Kustomisasi teks penghitung ulasan (`countLabel` e.g. `'ulasan'`, `'ratings'`).
   - Scoped slot lengkap: `#label`, `#hint`, `#error`, `#value`, `#descriptive`, dan `#suffix`.

4. **Icon (`icon`, `unfilledIcon`, & Animasi)**:
   - Dukungan penuh seluruh ikon Google Material Symbols (`'star'`, `'favorite'`, `'thumb_up'`, `'bolt'`, `'hotel_class'`, dll).
   - Animasi mikro saat kursor hover (`hover:scale-110 active:scale-95 duration-150`).
   - Scoped slot `#icon` untuk merender custom SVG atau emoji bebas.

5. **Responsif (`responsive`, Sentuhan Mobile, & Drawer)**:
   - Penanganan interaksi usap sentuh mobile (`touchstart` & `touchmove`) agar pengguna di layar smartphone dapat menggeser rating dengan jari tanpa tersendat (*lag-free*).
   - Prop `responsive` untuk penskalaan ukuran otomatis pada layar mobile kecil (`< 640px`).
   - Panduan dan contoh integrasi **Rating Review & Breakdown Drawer** yang bertransformasi menjadi **Bottom Sheet** dengan drag handle di HP (< 640px) dan **Slide-over Drawer** di desktop (>= 640px).

---

## 🚀 Cara Penggunaan

### 1. Penggunaan Dasar Interaktif

```vue
<script setup>
import { ref } from 'vue';
import Rating from '@/Components/Pack/Rating.vue';

const score = ref(4.5);
</script>

<template>
  <Rating
    v-model="score"
    label="Beri Nilai Produk"
    show-value
    show-descriptive
  />
</template>
```

### 2. Rating Desimal Presisi (Contoh: Nilai Nyata 1.3 / 5)

```vue
<template>
  <!-- Menghasilkan bintang pertama terisi 100%, bintang kedua terisi 30% -->
  <Rating
    :model-value="1.3"
    :precision="0.1"
    size="lg"
    color-theme="amber"
    show-value
  />
</template>
```

### 3. Varian Bentuk Kartu Kontainer & Tema Warna Emerald

```vue
<template>
  <Rating
    v-model="satisfaction"
    color-theme="emerald"
    variant="card"
    radius="2xl"
    size="md"
    show-value
    show-descriptive
    :count="1240"
    label="Tingkat Kepuasan Pelanggan:"
  />
</template>
```

### 4. Custom Ikon Hati dengan Tema Warna Rose (Pill Badge)

```vue
<template>
  <Rating
    v-model="favoriteScore"
    icon="favorite"
    color-theme="rose"
    variant="pill"
    radius="full"
    size="md"
    show-value
  />
</template>
```

---

## 📱 Pola Integrasi: Rating Review & Breakdown Drawer Responsif

Pada halaman produk e-commerce atau transaksi, Rating sering dipadukan dengan Drawer rincian ulasan. Gunakan pola di bawah ini untuk menghasilkan drawer yang adaptif: **Bottom Sheet di HP (< 640px)** dan **Slide-over di Desktop (>= 640px)**:

```vue
<script setup>
import { ref, watch } from 'vue';
import Rating from '@/Components/Pack/Rating.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const isDrawerOpen = ref(false);

// Mengunci scroll background saat drawer dibuka
watch(isDrawerOpen, (open) => {
    document.body.style.overflow = open ? 'hidden' : '';
});
</script>

<template>
  <!-- Trigger Tombol -->
  <button @click="isDrawerOpen = true" class="flex items-center gap-2">
    <Rating :model-value="4.8" :readonly="true" size="sm" color-theme="amber" />
    <span class="text-xs font-bold text-blue-600 underline">Lihat 1.284 Ulasan</span>
  </button>

  <!-- Responsive Drawer (Bottom Sheet di HP & Slide-over di Desktop) -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isDrawerOpen"
        class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs"
        @click="isDrawerOpen = false"
      ></div>
    </Transition>

    <Transition name="slide">
      <div
        v-if="isDrawerOpen"
        class="fixed z-50 bottom-0 left-0 right-0 sm:left-auto sm:top-0 sm:right-0 w-full sm:w-[500px] max-h-[88vh] sm:max-h-full h-auto sm:h-full bg-white dark:bg-slate-900 border-t sm:border-l border-slate-200 dark:border-slate-800 shadow-2xl rounded-t-3xl sm:rounded-none flex flex-col"
      >
        <!-- Mobile Pull Handle (< 640px) -->
        <div class="sm:hidden pt-3 pb-1 flex justify-center">
          <div class="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
        </div>

        <!-- Header Drawer -->
        <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 class="font-bold text-slate-900 dark:text-white">Ulasan Pembeli</h3>
          <button @click="isDrawerOpen = false">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Body Drawer (Histogram & Daftar Review) -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Histogram Bintang 5 - 1 -->
          <!-- Daftar Komentar Review -->
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
```

---

## 📋 Props API (`<Rating />`)

| Prop | Tipe Data | Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `modelValue` | `Number` | `0` | Nilai skor saat ini (*v-model*) |
| `max` | `Number` | `5` | Jumlah maksimal bintang / ikon penilaian |
| `precision` | `Number \| String` | `0.1` | Tingkat ketelitian input (`0.1`, `0.5`, `1`, `'any'`) |
| `colorTheme` | `String` | `''` | **(Pilar 1)** Warna tema Pack UI: `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'` |
| `color` | `String` | `'amber'` | **(Pilar 1)** Warna aktif alternatif (`amber`, `rose`, `blue`, hex `#...`) |
| `inactiveColor` | `String` | `''` | **(Pilar 1)** Warna ikon kosong (default abu-abu slate) |
| `variant` | `String` | `'default'` | **(Pilar 2)** Gaya kontainer: `'default'`, `'card'`, `'pill'`, `'bordered'` |
| `radius` | `String` | `'xl'` | **(Pilar 2)** Kelengkungan kontainer: `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'full'` |
| `size` | `String` | `'md'` | Ukuran ikon: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'` |
| `icon` | `String` | `'star'` | **(Pilar 4)** Nama simbol ikon Google Material Symbols |
| `unfilledIcon` | `String` | `''` | **(Pilar 4)** Ikon saat belum terisi (default sama dengan `icon`) |
| `animate` | `Boolean` | `true` | **(Pilar 4)** Efek mikro-animasi zoom saat kursor hover |
| `showValue` | `Boolean` | `false` | **(Pilar 3)** Menampilkan teks skor angka |
| `valueFormat` | `String` | `'fraction'` | **(Pilar 3)** Format skor: `'fraction'` (1.3 / 5), `'single'` (1.3), `'percent'` (26%), `'descriptive'` |
| `valuePosition` | `String` | `'right'` | Posisi teks angka: `'right'` atau `'bottom'` |
| `showDescriptive` | `Boolean` | `false` | **(Pilar 3)** Menampilkan label teks sentimen human-readable |
| `descriptiveTexts` | `Object` | `{1:'Sangat Buruk', ...}` | **(Pilar 3)** Kamus teks pemetaan nilai bintang ke kalimat sentimen |
| `count` | `Number` | `0` | **(Pilar 3)** Jumlah ulasan opsional (*misal: (1.284 ulasan)*) |
| `countLabel` | `String` | `'ulasan'` | **(Pilar 3)** Kata label penghitung ulasan |
| `label` | `String` | `''` | **(Pilar 3)** Label input form di atas rating |
| `hint` | `String` | `''` | **(Pilar 3)** Teks petunjuk kecil di bawah rating |
| `error` | `String` | `''` | **(Pilar 3)** Pesan error validasi form Laravel |
| `required` | `Boolean` | `false` | **(Pilar 3)** Menampilkan tanda bintang merah (*) pada label |
| `responsive` | `Boolean` | `false` | **(Pilar 5)** Mengaktifkan skala ukuran otomatis di layar HP |
| `readonly` | `Boolean` | `false` | Mode baca-saja (tidak dapat digeser/diklik) |
| `disabled` | `Boolean` | `false` | Menonaktifkan interaksi rating dan visual redup |
| `clearable` | `Boolean` | `true` | Mengklik nilai yang sama mereset skor ke 0 |
| `allowHover` | `Boolean` | `true` | Menampilkan pratinjau skor saat kursor melintas |

---

## ⚡ Events (`defineEmits`)

| Event | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `update:modelValue` | `(number)` | Dipancarkan saat nilai rating berubah (*v-model sync*) |
| `change` | `(number)` | Dipancarkan saat pengguna mengklik atau menyelesaikan sentuhan rating |
| `hover` | `(number \| null)` | Dipancarkan saat kursor mouse melintas atau jari menggeser di atas bintang |

---

## 🎨 Slots

- `#icon="{ index, active, fillPercent, color }"`: Mengkustomisasi tampilan elemen setiap bintang (misal custom SVG atau animasi).
- `#value="{ value, formatted, count, descriptive }"`: Mengkustomisasi teks label angka rating.
- `#descriptive="{ value, text }"`: Mengkustomisasi label teks sentimen penilaian.
- `#suffix`: Menambahkan elemen tambahan di sebelah kanan rating (misal badge atau tombol rincian).
- `#label`: Kustomisasi elemen judul form di atas rating.
- `#hint`: Kustomisasi teks petunjuk.
- `#error`: Kustomisasi tampilan pesan validasi error.
