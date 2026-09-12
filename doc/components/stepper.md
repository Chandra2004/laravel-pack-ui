# 🪜 Stepper Component (`Stepper.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen penunjuk langkah tahapan alur kerja (*stepper wizard*) untuk form multi-langkah (*multi-step forms*), checkout pembelian, atau alur onboarding. Mendukung orientasi horizontal dan vertikal, mode linear, penanda status error, serta varian nomor atau ikon.

---

## 🚀 Import & Penggunaan Dasar

```vue
<script setup>
import { ref } from 'vue';
import Stepper from '@/Components/Pack/Stepper.vue';

const activeStep = ref(0);

const wizardSteps = [
    { label: 'Informasi Akun', description: 'Nama dan email', icon: 'person' },
    { label: 'Detail Alamat', description: 'Lokasi pengiriman', icon: 'location_on' },
    { label: 'Metode Pembayaran', description: 'Pilih bank / e-wallet', icon: 'credit_card' },
    { label: 'Konfirmasi', description: 'Tinjau kembali pesanan', icon: 'verified' },
];
</script>

<template>
  <div>
    <!-- Stepper Navigasi -->
    <Stepper 
      :steps="wizardSteps" 
      v-model="activeStep"
      variant="numbered"
    />

    <!-- Panel Form Berdasarkan Langkah -->
    <div class="mt-6 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div v-if="activeStep === 0">Form Informasi Akun...</div>
      <div v-else-if="activeStep === 1">Form Detail Alamat...</div>
      <div v-else-if="activeStep === 2">Form Metode Pembayaran...</div>
      <div v-else-if="activeStep === 3">Halaman Konfirmasi Pesanan...</div>

      <!-- Tombol Aksi Sebelumnya & Selanjutnya -->
      <div class="flex justify-between mt-8">
        <button 
          :disabled="activeStep === 0" 
          @click="activeStep--" 
          class="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 disabled:opacity-50"
        >
          Sebelumnya
        </button>
        <button 
          v-if="activeStep < wizardSteps.length - 1"
          @click="activeStep++" 
          class="px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          Selanjutnya
        </button>
        <button 
          v-else 
          @click="submitOrder()" 
          class="px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Selesaikan Pesanan
        </button>
      </div>
    </div>
  </div>
</template>
```

---

## 📋 Props API (`<Stepper />`)

| Prop | Tipe Data | Default | Pilihan Nilai / Deskripsi |
| :--- | :--- | :--- | :--- |
| `steps` | `Array` | `[]` | Daftar langkah: `[{ label, description, icon, optional }]` |
| `modelValue` | `Number` | `0` | Indeks langkah aktif saat ini (dimulai dari `0`). Mendukung `v-model` |
| `orientation` | `String` | `'horizontal'` | Arah tampilan langkah: `'horizontal'`, `'vertical'` |
| `variant` | `String` | `'default'` | Desain indikator bulatan langkah: `'default'` (lingkaran titik sederhana), `'numbered'` (angka urut 1, 2, 3), `'icon'` (ikon Material Symbols) |
| `size` | `String` | `'md'` | Ukuran bulatan dan teks: `'sm'`, `'md'`, `'lg'` |
| `linear` | `Boolean` | `false` | Mode sekuensial ketat: pengguna tidak bisa melompati langkah yang belum selesai |
| `clickable` | `Boolean` | `true` | Apakah bulatan langkah dapat diklik langsung untuk berpindah |
| `showDescription` | `Boolean` | `true` | Menampilkan teks deskripsi di bawah label langkah |
| `completedIcon` | `String` | `'check'` | Nama Google Material Symbols untuk langkah yang telah tuntas |
| `errorSteps` | `Array` | `[]` | Array berisi indeks langkah yang sedang memiliki kesalahan/validasi gagal (misal `[1]`) |

---

## 🔔 Events API (`<Stepper />`)

| Event Name | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `@update:modelValue` | `stepIndex: Number` | Dipancarkan saat langkah aktif berpindah (sinkronisasi dua arah `v-model`) |
| `@step-click` | `stepIndex: Number` | Dipancarkan saat pengguna mengklik bulatan langkah tertentu |

---

## 🪟 Slots API (`<Stepper />`)

| Slot Name | Props Slot | Deskripsi |
| :--- | :--- | :--- |
| `step` | `{ step, index, status }` | Kustomisasi tampilan indikator bulatan langkah |
| `content` | `{ currentStep }` | Kontainer slot praktis untuk konten panel form di bawah stepper |

---

## 💡 Ragam Contoh Penggunaan

### 1. Stepper Vertikal (Cocok untuk Sidebar Form)
```vue
<Stepper 
  :steps="wizardSteps" 
  v-model="activeStep" 
  orientation="vertical"
  variant="icon"
/>
```

### 2. Penandaan Langkah Error / Validasi Gagal
```vue
<script setup>
import { ref } from 'vue';
const errors = ref([1]); // Langkah ke-2 (index 1) ditandai merah karena input belum lengkap
</script>

<template>
  <Stepper 
    :steps="wizardSteps" 
    v-model="activeStep" 
    :error-steps="errors"
  />
</template>
```
