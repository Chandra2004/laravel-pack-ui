# 🪜 Stepper Component (`Stepper.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen penunjuk langkah alur kerja multi-tahap (*multi-step wizard & progress tracker*) enterprise untuk formulir bertahap (*onboarding*), checkout e-commerce, hingga pelacakan milestone logistik/transaksi. 

Dirancang secara komprehensif mengikuti **5 Pilar Kustomisasi**, mendukung **6 ragam tipe stepper** (*Multi-Stepper Cards, Segmented Progress Bar, Classic Circle, Capsule Pills, Vertical Timeline, dan Compact Dots*), fleksibilitas **penempatan informasi terarah** (*bawah, atas, kanan, kiri*), serta **skeleton loading state** yang adaptif.

---

## 🌟 5 Pilar Kustomisasi

| Pilar | Penerapan pada `<Stepper />` |
| :--- | :--- |
| **1. Warna** | Mendukung 8 palet semantik (`primary`, `indigo`, `emerald`, `purple`, `amber`, `rose`, `cyan`, `dark`) serta 3 gaya pewarnaan (`solid`, `soft`, `outline`) dengan kontras dark mode penuh pada nodus, garis konektor, teks, dan status chip. |
| **2. Bentuk** | Mendukung 6 varian tipe stepper (`cards`, `bar`, `circle`, `pills`, `timeline`, `dots`), orientasi `horizontal` dan `vertical`, serta kontrol kelengkungan sudut (`radius`: `none`, `sm`, `md`, `lg`, `xl`, `full`) dan skala ukuran (`size`: `sm`, `md`, `lg`). |
| **3. Teks Konten** | Header level komponen (`title` & `description` + counter badge), metadata langkah (`title`/`label`, `subtitle`/`description`, `time`, `badge`, `optional`), bilah navigasi aksi bawaan (`showActions`), serta scoped slots `#header`, `#step`, `#label`, `#content`, dan `#actions`. |
| **4. Icon** | Integrasi Google Material Symbols dengan penempatan presisi vertikal (`leading-none inline-flex items-center justify-center`), ikon kustom per langkah, `completedIcon` (default `'check'`), dan `errorIcon` (default `'close'`). |
| **5. Responsif** | Penjajaran teks dan skeleton terarah (`labelPlacement`: `bottom`, `top`, `right`, `left`), layout grid adaptif pada mode kartu, container scroll aman pada mode pills, serta konektor stabil tanpa geser posisi saat teks membungkus. |

---

## 🚀 Ragam Tipe Stepper (`type="..."`)

```
1. 'cards' / 'panel' : Kartu interaktif ber-grid dengan nodus, status chip, judul, dan deskripsi.
2. 'bar' / 'progress' : Segmented progress bar modern ala Stripe & Airbnb dengan persentase otomatis.
3. 'circle'          : Nodus bulatan klasik bergaris konektor (horizontal atau vertikal).
4. 'pills'           : Kapsul tombol langkah terhubung dengan pemisah panah chevron.
5. 'timeline'        : Feed vertikal aktivitas dengan timestamp waktu, badge, dan konten inline.
6. 'dots'            : Indikator titik kompak untuk carousel, kartu dialog modal, atau mobile walkthrough.
```

---

## 💻 Contoh Penggunaan Praktis

### 1. Multi-Stepper Cards / Panels (Tipe Kartu Interaktif)
Sangat ideal untuk alur registrasi bisnis, checkout pembayaran, atau pengaturan wizard yang membutuhkan penjelasan ringkas di setiap langkah.

```vue
<script setup>
import { ref } from 'vue';
import Stepper from '@/Components/Pack/Stepper.vue';

const activeStep = ref(0);
const steps = [
    { title: 'Registrasi', description: 'Buat akun merchant baru', icon: 'person_add' },
    { title: 'Verifikasi Dokumen', description: 'Upload KTP & NPWP', icon: 'verified_user', badge: 'Wajib' },
    { title: 'Pengaturan API', description: 'Konfigurasi webhook transaksi', icon: 'settings' },
    { title: 'Selesai', description: 'Akun siap menerima pembayaran', icon: 'rocket_launch', optional: true },
];
</script>

<template>
  <Stepper
    title="Aktivasi Akun Merchant"
    description="Selesaikan 4 langkah berikut untuk mengaktifkan akun Anda."
    :steps="steps"
    v-model="activeStep"
    type="cards"
    color="indigo"
    radius="xl"
    show-actions
  >
    <template #content="{ step, index }">
      <div class="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
        Konten formulir untuk {{ step.label }} (Langkah {{ index + 1 }})
      </div>
    </template>
  </Stepper>
</template>
```

---

### 2. Segmented Progress Bar Wizard (SaaS Minimalist)
Tampilan bilah progress tersegmen modern dengan persentase penyelesaian otomatis.

```vue
<Stepper
  :steps="steps"
  v-model="activeStep"
  type="bar"
  color="emerald"
  radius="full"
  show-actions
/>
```

---

### 3. Penempatan Informasi & Skeleton Terarah (`labelPlacement`)
Anda dapat mengarahkan penempatan informasi teks langkah (dan placeholder skeleton) ke posisi **bawah**, **atas**, **kanan**, atau **kiri**:

```vue
<!-- Label di sebelah kanan (Inline Horizontal) -->
<Stepper
  :steps="steps"
  v-model="activeStep"
  type="circle"
  variant="icon"
  color="purple"
  label-placement="right"
/>

<!-- Label di atas bulatan nodus -->
<Stepper
  :steps="steps"
  v-model="activeStep"
  type="circle"
  variant="numbered"
  color="blue"
  label-placement="top"
/>
```

---

### 4. Capsule Pills Stepper
Tombol langkah kapsul kompak terhubung dengan chevron separator:

```vue
<Stepper
  :steps="steps"
  v-model="activeStep"
  type="pills"
  color="amber"
  stepper-style="solid"
  radius="full"
/>
```

---

### 5. Vertical Activity Timeline & Milestone Tracker
Pelacakan histori logistik, aktivitas alur pesanan, atau audit transaksi:

```vue
<script setup>
import { ref } from 'vue';
import Stepper from '@/Components/Pack/Stepper.vue';

const currentMilestone = ref(2);
const timelineData = [
    { label: 'Pesanan Masuk', description: 'Pelanggan checkout melalui link invoice', time: '10:00 WIB', icon: 'shopping_cart' },
    { label: 'Pembayaran Dikonfirmasi', description: 'Dana escrow berhasil diterima', time: '10:05 WIB', icon: 'payments', badge: 'Lunas' },
    { label: 'Sedang Dikemas', description: 'Pesanan sedang dipersiapkan oleh seller', time: '11:30 WIB', icon: 'inventory_2' },
    { label: 'Dikirim ke Kurir', description: 'Resi pengiriman JNE-88291040', time: 'Estimasi Besok', icon: 'local_shipping', optional: true },
];
</script>

<template>
  <Stepper
    title="Histori Perjalanan Pesanan"
    description="Pelacakan status transaksi secara real-time."
    :steps="timelineData"
    v-model="currentMilestone"
    orientation="vertical"
    type="timeline"
    variant="icon"
    color="rose"
  />
</template>
```

---

### 6. Mode Loading Skeleton Terarah
Cukup aktifkan prop `:loading="true"` untuk menampilkan animasi pulse skeleton yang otomatis mengikuti arah `labelPlacement`:

```vue
<Stepper
  :loading="true"
  :skeleton-count="4"
  type="circle"
  label-placement="bottom"
/>
```

---

## 📋 Props API (`<Stepper />`)

| Prop | Tipe Data | Default | Pilihan Nilai / Deskripsi |
| :--- | :--- | :--- | :--- |
| `title` | `String` | `''` | Judul alur langkah pada header level komponen |
| `description` | `String` | `''` | Deskripsi atau subjudul alur langkah pada header |
| `steps` | `Array` | `[]` | Array data langkah: `[{ title/label, subtitle/description, icon, optional, time, badge, disabled }]` atau array string |
| `modelValue` | `Number` | `0` | Indeks langkah aktif saat ini (0-indexed). Mendukung `v-model` |
| `type` | `String` | `'circle'` | Ragam varian visual: `'circle'`, `'bar'` / `'progress'`, `'cards'` / `'panel'`, `'pills'`, `'timeline'`, `'dots'` |
| `orientation` | `String` | `'horizontal'` | Arah orientasi (tipe circle & timeline): `'horizontal'`, `'vertical'` |
| `variant` | `String` | `'numbered'` | Tampilan isi bulatan nodus: `'numbered'`, `'icon'`, `'dot'` |
| `labelPlacement` | `String` | `''` | Arah penempatan teks / skeleton: `'bottom'`, `'top'`, `'right'`, `'left'` (otomatis menyesuaikan jika kosong) |
| `color` | `String` | `'primary'` | Palet warna semantik: `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'` |
| `stepperStyle` | `String` | `'solid'` | Gaya pewarnaan: `'solid'`, `'soft'`, `'outline'` |
| `radius` | `String` | `'full'` | Kelengkungan sudut: `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'full'` |
| `size` | `String` | `'md'` | Skala dimensi nodus & teks: `'sm'`, `'md'`, `'lg'` |
| `linear` | `Boolean` | `false` | Mode alur ketat: hanya bisa berpindah ke langkah yang sudah selesai atau langkah berikutnya |
| `clickable` | `Boolean` | `true` | Apakah nodus/kartu langkah dapat diklik langsung |
| `showDescription` | `Boolean` | `true` | Menampilkan teks deskripsi di bawah label |
| `showLabels` | `Boolean` | `true` | Menampilkan teks judul/label langkah |
| `loading` | `Boolean` | `false` | Menampilkan state animated pulse loading skeleton |
| `skeletonCount` | `Number` | `4` | Jumlah skeleton placeholder yang dirender saat `loading="true"` dan steps kosong |
| `completedIcon` | `String` | `'check'` | Nama Google Material Symbols untuk langkah yang telah tuntas |
| `errorIcon` | `String` | `'close'` | Nama Google Material Symbols untuk langkah error |
| `errorSteps` | `Array` | `[]` | Daftar indeks langkah yang ditandai memiliki galat/validasi gagal (misal `[1, 2]`) |
| `showActions` | `Boolean` | `false` | Menampilkan bilah navigasi aksi bawaan (Sebelumnya, Status Counter, Selanjutnya / Selesai) |
| `prevText` | `String` | `'Sebelumnya'` | Teks tombol langkah sebelumnya |
| `nextText` | `String` | `'Langkah Berikutnya'` | Teks tombol langkah selanjutnya |
| `finishText` | `String` | `'Selesai'` | Teks tombol langkah terakhir |

---

## 🔔 Events API (`<Stepper />`)

| Event Name | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `@update:modelValue` | `stepIndex: Number` | Dipancarkan saat langkah aktif berpindah (sinkronisasi dua arah `v-model`) |
| `@step-click` | `stepIndex: Number` | Dipancarkan saat pengguna mengklik langkah tertentu |
| `@finish` | `stepIndex: Number` | Dipancarkan saat tombol selesai pada langkah terakhir diklik |

---

## 🪟 Scoped Slots API (`<Stepper />`)

| Slot Name | Props Slot | Deskripsi |
| :--- | :--- | :--- |
| `#header` | - | Kustomisasi penuh header judul, deskripsi, dan badge counter atas |
| `#step` | `{ step, index, status }` | Kustomisasi tampilan dalam nodus indikator (angka/ikon/titik) |
| `#label` | `{ step, index, status }` | Kustomisasi tampilan judul dan deskripsi per-langkah |
| `#content` | `{ step, index }` | Wadah panel formulir/konten yang aktif |
| `#actions` | `{ currentStep, isFirst, isLast, next, prev, goTo }` | Kustomisasi bilah tombol navigasi alur alur alur alur |

---

## 🛠️ Method Expose (`defineExpose`)

Komponen mengekspos fungsi-fungsi berikut via template ref:

```vue
<script setup>
import { ref } from 'vue';
import Stepper from '@/Components/Pack/Stepper.vue';

const stepperRef = ref(null);

// Memanggil metode secara terprogram:
// stepperRef.value.next();
// stepperRef.value.prev();
// stepperRef.value.goTo(2);
// const step = stepperRef.value.currentStep;
</script>

<template>
  <Stepper ref="stepperRef" :steps="steps" />
</template>
```
