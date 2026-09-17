# 🏷️ Tag Input Component (`InputTag.vue` / `TagInput.vue`)

Komponen input tag enterprise modern berbasis Vue 3 dan Tailwind CSS v4 yang fleksibel untuk mengelola daftar kata kunci/tag/kategori. Komponen ini menerapkan penuh **4 Pilar Kustomisasi UI** (Warna, Bentuk, Teks Konten, dan Icon) sesuai standar desain, dilengkapi navigasi keyboard presisi (`Tab`, `Enter`, koma `,`, `Backspace`), pemecahan otomatis saat paste multi-item (*smart paste split*), batas maksimum tag, dropdown options dengan z-index tinggi anti-clipping di dalam Card, serta integrasi langsung via `<InputField type="tag" />`.

---

## 🎨 4 Pilar Kustomisasi (`peraturan.md`)

Komponen `InputTag` dirancang modular agar mudah dikustomisasi sesuai kebutuhan tampilan:

### 1. Warna (Color & Variant)
* **Pilihan Varian Warna (`tagVariant`)**:
  - `'default'` (Slate neutral)
  - `'primary'` (Blue enterprise)
  - `'emerald'` (Green success)
  - `'indigo'` (Indigo accent)
  - `'rose'` (Rose danger/pink)
  - `'amber'` (Amber warning)
  - `'purple'` (Purple creative)
  - `'dark'` (Deep zinc dark mode)
  - `'cyan'` (Cyan teal)
  - `'random'` (Algoritma hash deterministik: nama tag yang sama selalu memperoleh kombinasi warna harmonis yang konsisten).
* **Pilihan Gaya Tampilan (`tagStyle`)**:
  - `'soft'` (Default): Background lembut berpadu kontras teks semantik.
  - `'solid'`: Warna penuh pekat kontras tinggi dengan teks putih.
  - `'outline'`: Background transparan dengan border tegas beraksen warna.

### 2. Bentuk (Shape & Size)
* **Border Radius (`radius`)**:
  - `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'full'`.
  - Mengontrol kebulatan sudut container input dan chip tag (misal: `radius="full"` untuk input dan chip kapsul elegan). Panel dropdown menu options secara default tetap menggunakan radius standar menu (`rounded-xl`) agar tata letak opsi dan scrollbar tidak terdistorsi.
* **Ukuran (`size`)**:
  - `'sm'`: Input ringkas untuk tabel data / toolbar filter.
  - `'md'`: Ukuran standar formulir enterprise.
  - `'lg'`: Input menonjol untuk hero section / formulir besar.

### 3. Teks Konten (Content & Slots)
* **Label, Hint, & Error**: Mendukung label informatif, hint panduan, teks error validasi Laravel, placeholder dinamis, dan teks status kosong (`noOptionsText`).
* **Scoped Slot `#tag`**: Kustomisasi total tampilan chip tag (bisa menambahkan foto avatar, badge status, tombol aksi kustom, dll).
* **Scoped Slot `#option`**: Kustomisasi baris opsi dropdown (menampilkan deskripsi, icon, atau rating).
* **Slot `#prefix`**: Menambahkan elemen sebelum daftar tag di dalam kotak input.
* **Kontrol Input**: Pembatasan jumlah (`maxTags`), pencegahan duplikasi (`allowDuplicates`), konversi otomatis huruf kecil (`lowercase`), dan kustomisasi regex pemisah paste (`pasteSeparators`).

### 4. Icon & Perataan Vertikal (Iconography & Alignment)
* **Leading Input Icon (`icon`)**: Menampilkan ikon Google Material Symbols di sisi kiri kotak input (misal: `icon="sell"`, `icon="bookmark"`).
* **Chip Icon (`tagIcon` atau option `icon`)**: Menampilkan ikon spesifik pada setiap chip tag secara otomatis.
* **Perataan Vertikal Sempurna (True Center Alignment)**: Seluruh teks dan ikon (baik leading icon, chip icon, tombol hapus `close`, maupun tombol `clearable`) dirancang menggunakan `inline-flex items-center justify-center font-medium leading-none` sehingga huruf dan ikon berdiri tepat sejajar di tengah tanpa ada pergeseran offset vertikal.
* **Anti-Clipping Card & High Z-Index (`z-[9999]`)**: Panel dropdown autocomplete dibungkus secara independen dengan `z-[9999]` dan bayangan `shadow-2xl`. Bersama integrasi `Card.vue` (`overflow="visible"`), dropdown opsi tidak lagi terpotong atau tertahan di dalam batas kartu.

---

## ✨ Fitur Utama

1. **3 Mode Input Fleksibel**:
   - **Tag Random (Free-form Text)**: Mengetik kata bebas apa saja, contoh: ketik `olahraga` [Tab] `sepak bola` [Tab] `bulu tangkis` [Tab].
   - **Tag dengan Option (Strict Preset)**: Opsi hanya dapat dipilih dari daftar dropdown yang tersedia (`:allow-custom="false"`).
   - **Tag Random + Option (Hybrid Creatable)**: Menampilkan saran dropdown dari `options`, namun pengguna bebas mengetik dan membuat tag baru sendiri (`:allow-custom="true"` + `:options="[...]"`).
2. **Trigger Separator Cepat**:
   - Menekan tombol **`Tab`**, **`Enter`**, atau tanda koma (**,**) langsung mengonversi teks menjadi chip tag dan menjaga fokus input untuk pengetikan cepat berantai tanpa jeda.
   - Mendukung penambahan tag otomatis saat kehilangan fokus (`add-on-blur="true"`).
3. **Smart Paste Split**:
   - Mem-paste teks panjang seperti `"laravel, vue, inertia, tailwind"` atau daftar multi-baris (`\n`) langsung dipecah menjadi tag terpisah secara otomatis.
4. **Kontrol Batas & Duplikasi**:
   - `maxTags`: Membatasi jumlah maksimal tag dengan badge counter interaktif dan event `@max-reached`.
   - `allowDuplicates`: Mencegah tag yang sama diinput berulang kali (dilengkapi animasi shake lembut dan feedback visual).
   - `removeOnBackspace`: Menghapus tag terakhir saat menekan tombol Backspace pada input kosong.

---

## 🚀 Cara Penggunaan

### 1. Tag Random (Free-form Text)

Mode dasar untuk pengetikan cepat dengan tombol `Tab` atau `Enter`:

```vue
<script setup>
import { ref } from 'vue';
import InputTag from '@/Components/Pack/InputTag.vue';

const categories = ref(['olahraga', 'sepak bola']);
</script>

<template>
  <InputTag
    v-model="categories"
    label="Kategori Minat"
    placeholder="Ketik kategori lalu tekan Tab..."
    hint="Tekan Tab, Enter, atau koma untuk memasukkan tag berikutnya"
    icon="label"
    clearable
  />
</template>
```

---

### 2. Tag dengan Option (Strict Preset)

Tag hanya boleh dipilih dari daftar pilihan yang tersedia:

```vue
<script setup>
import { ref } from 'vue';
import InputTag from '@/Components/Pack/InputTag.vue';

const selectedSkills = ref(['Vue.js']);
const skillOptions = [
  'Laravel',
  'Vue.js',
  'Tailwind CSS',
  'Inertia.js',
  'PHP',
  'TypeScript',
  'PostgreSQL',
  'Docker'
];
</script>

<template>
  <InputTag
    v-model="selectedSkills"
    :options="skillOptions"
    :allow-custom="false"
    label="Keahlian Utama (Strict Preset)"
    placeholder="Pilih keahlian dari daftar..."
    icon="school"
    tag-variant="indigo"
  />
</template>
```

---

### 3. Tag Random + Option (Hybrid Creatable)

Bisa memilih rekomendasi dari dropdown atau membuat tag kustom baru:

```vue
<script setup>
import { ref } from 'vue';
import InputTag from '@/Components/Pack/InputTag.vue';

const tags = ref(['teknologi']);
const suggestions = ['teknologi', 'gadget', 'koding', 'ai', 'desain', 'bisnis'];
</script>

<template>
  <InputTag
    v-model="tags"
    :options="suggestions"
    :allow-custom="true"
    label="Topik Artikel"
    placeholder="Pilih saran atau ketik topik baru..."
    icon="auto_awesome"
    tag-variant="primary"
  />
</template>
```

---

### 4. Kustomisasi Penuh 4 Pilar (Warna, Bentuk, Icon)

Menggunakan style solid, bentuk kapsul penuh, dan ikon tag kustom:

```vue
<template>
  <InputTag
    v-model="tags"
    label="Label Keamanan (Solid Capsule)"
    tag-variant="rose"
    tag-style="solid"
    radius="full"
    tag-icon="verified_user"
    icon="shield"
    :max-tags="4"
    clearable
  />
</template>
```

---

### 5. Tag Warna Acak Cerdas (`tagVariant="random"`)

Algoritma hash deterministik menghasilkan variasi warna harmonis otomatis untuk setiap kata:

```vue
<template>
  <InputTag
    v-model="tags"
    tag-variant="random"
    :max-tags="6"
    label="Label Produk (Warna-warni Harmonis)"
    placeholder="Ketik nama label..."
    icon="palette"
    clearable
  />
</template>
```

---

### 6. Kustomisasi Scoped Slots (`#tag` & `#option`)

```vue
<script setup>
import { ref } from 'vue';
import InputTag from '@/Components/Pack/InputTag.vue';

const authors = ref(['Chandra']);
const options = [
  { label: 'Chandra Tri Antomo', role: 'Lead Architect', icon: 'star' },
  { label: 'Taylor Otwell', role: 'Laravel Creator', icon: 'code' },
];
</script>

<template>
  <InputTag v-model="authors" :options="options" label="Tim Pengembang">
    <!-- Kustomisasi Tampilan Chip Tag -->
    <template #tag="{ tag, remove }">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold rounded-full shadow-sm">
        <span class="material-symbols-outlined text-[14px]">person</span>
        <span>{{ tag }}</span>
        <button type="button" @click="remove" class="ml-1 hover:text-red-200">
          <span class="material-symbols-outlined text-[13px]">close</span>
        </button>
      </span>
    </template>

    <!-- Kustomisasi Baris Opsi Dropdown -->
    <template #option="{ option, selected }">
      <div class="flex items-center justify-between w-full py-0.5">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-indigo-500 text-base">{{ option.icon || 'badge' }}</span>
          <div>
            <div class="text-xs font-medium">{{ option.label }}</div>
            <div class="text-[10px] text-slate-400">{{ option.role }}</div>
          </div>
        </div>
        <span v-if="selected" class="material-symbols-outlined text-primary-600 text-xs">check</span>
      </div>
    </template>
  </InputTag>
</template>
```

---

### 7. Integrasi via `<InputField />`

Dapat langsung dipanggil dari komponen facade form utama:

```vue
<script setup>
import { ref } from 'vue';
import InputField from '@/Components/Pack/InputField.vue';

const tags = ref(['olahraga']);
</script>

<template>
  <InputField
    v-model="tags"
    type="tag"
    label="Tag Berita"
    :options="['olahraga', 'politik', 'hiburan', 'otomotif']"
    :allow-custom="true"
    tag-variant="purple"
    tag-style="soft"
    icon="bookmark"
    placeholder="Ketik tag..."
  />
</template>
```

---

## 🛠️ API Reference

### Props

| Prop | Tipe | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `modelValue` | `Array<string\|object>` | `[]` | Nilai array tag terpilih (`v-model`). |
| `options` | `Array<string\|object>` | `[]` | Daftar opsi saran autocomplete atau opsi tetap. |
| `allowCustom` | `Boolean` | `true` | Jika `true`, user bisa membuat tag bebas. Jika `false`, hanya boleh memilih dari `options`. |
| `separatorKeys` | `Array<string>` | `['Tab', 'Enter', ',']` | Tombol keyboard yang memicu pembuatan tag. |
| `allowDuplicates`| `Boolean` | `false` | Izinkan tag duplikat dimasukkan. |
| `maxTags` | `Number` | `null` | Batas maksimum tag yang dapat dibuat. |
| `tagVariant` | `String` | `'default'` | Skema warna chip: `'default'`, `'primary'`, `'emerald'`, `'indigo'`, `'rose'`, `'amber'`, `'purple'`, `'dark'`, `'cyan'`, `'random'`. |
| `tagStyle` | `String` | `'soft'` | Gaya tampilan chip: `'soft'`, `'solid'`, `'outline'`. |
| `tagIcon` | `String` | `''` | Ikon Google Material Symbols untuk setiap chip tag. |
| `icon` | `String` | `''` | Ikon Google Material Symbols di sisi kiri kotak input. |
| `radius` | `String` | `'xl'` | Border radius container & chip: `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'full'`. |
| `pasteSeparators`| `RegExp\|String` | `/[,;\n\t]+/` | Regex pemisah saat user mem-paste teks multi-tag. |
| `addOnBlur` | `Boolean` | `true` | Tambahkan tag otomatis ketika input kehilangan fokus (*blur*). |
| `removeOnBackspace` | `Boolean` | `true` | Hapus tag terakhir saat tombol Backspace ditekan di input kosong. |
| `lowercase` | `Boolean` | `false` | Otomatis konversi tag menjadi huruf kecil (*lowercase*). |
| `clearable` | `Boolean` | `false` | Tampilkan tombol bersihkan semua tag sekaligus. |
| `removable` | `Boolean` | `true` | Tampilkan tombol `x` pada masing-masing chip tag. |
| `size` | `String` | `'md'` | Ukuran komponen (`'sm'`, `'md'`, `'lg'`). |
| `disabled` | `Boolean` | `false` | Nonaktifkan komponen secara menyeluruh. |
| `readonly` | `Boolean` | `false` | Kunci komponen menjadi mode hanya-baca. |
| `error` | `String` | `''` | Pesan error validasi form. |
| `label` | `String` | `''` | Label teks di atas komponen. |
| `hint` | `String` | `''` | Teks petunjuk bantuan di bawah input. |
| `noOptionsText` | `String` | `'Tidak ada opsi yang cocok'` | Pesan ketika filter dropdown tidak menemukan hasil. |

---

### Slots

| Slot | Scope Props | Deskripsi |
| :--- | :--- | :--- |
| `#tag` | `{ tag, index, remove, icon, variantClasses }` | Kustomisasi template tampilan chip tag. |
| `#option` | `{ option, selected, highlighted }` | Kustomisasi template setiap baris pilihan dropdown. |
| `#prefix` | `-` | Slot konten tambahan sebelum daftar chip tag. |

---

### Events

| Event | Payload | Deskripsi |
| :--- | :--- | :--- |
| `update:modelValue` | `Array` | Dipancarkan saat nilai array tag berubah. |
| `change` | `Array` | Dipancarkan saat array tag selesai dimodifikasi. |
| `tag-add` | `String\|Object` | Dipancarkan saat sebuah tag baru ditambahkan. |
| `tag-remove` | `String\|Object` | Dipancarkan saat sebuah tag dihapus. |
| `max-reached` | `Number` | Dipancarkan saat user mencoba menambah tag melebihi `maxTags`. |
| `clear` | `-` | Dipancarkan saat seluruh tag dibersihkan. |
| `focus` | `FocusEvent` | Dipancarkan saat input difokuskan. |
| `blur` | `FocusEvent` | Dipancarkan saat input kehilangan fokus. |

---

## ⌨️ Navigasi Keyboard

- **`Tab`**: Mengonversi teks yang sedang diketik menjadi tag seketika, mencegah blur bawaan browser, dan mempertahankan fokus input untuk pengetikan berantai. Jika dropdown terbuka dan opsi disorot, `Tab` memilih opsi tersebut.
- **`Enter`**: Membuat tag dari input saat ini atau memilih opsi yang aktif dari dropdown.
- **`,` (Koma)**: Otomatis menyelesaikan tag saat ini dan menyiapkan input untuk tag berikutnya.
- **`Backspace`**: Jika input sedang kosong, menghapus tag terakhir dari daftar.
- **`ArrowDown` / `ArrowUp`**: Menavigasi sorotan pilihan pada daftar saran dropdown.
- **`Escape`**: Menutup dropdown saran autocomplete.
