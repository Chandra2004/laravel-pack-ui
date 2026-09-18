# 🔤 Composable `useInitials` (Ekstraksi Inisial Pintar & Warna Avatar Deterministik)

[← Kembali ke Dokumentasi Utama](../../README.md)

`useInitials` adalah composable Vue 3 reaktif yang mengekstrak inisial nama secara pintar sekaligus menghasilkan warna latar belakang avatar yang konsisten (deterministik) berdasarkan string nama/ID menggunakan algoritma DJB2 hashing.

Sangat ideal dipadukan dengan komponen `<Avatar.vue>` atau digunakan pada profil pengguna, daftar komentar, avatar tim, dan tabel transaksi.

---

## 🚀 Import & Penggunaan

### 1. Penggunaan Dasar
```vue
<script setup>
import { ref } from 'vue';
import { useInitials } from '@/Composables/Pack/useInitials';

const userName = ref('Chandra Tri Antomo');

const { initials, hex, bgClass, gradientClass, textColor, style, avatarProps } = useInitials(userName);
</script>

<template>
  <div class="flex items-center gap-3">
    <!-- Menggunakan inline style langsung -->
    <div
      class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-xs"
      :style="style"
    >
      {{ initials }}
    </div>

    <!-- Atau menggunakan kelas Tailwind -->
    <div
      :class="['w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm', gradientClass]"
      :style="{ color: textColor }"
    >
      {{ initials }}
    </div>

    <div>
      <p class="font-medium text-slate-800 dark:text-slate-200">{{ userName }}</p>
      <p class="text-xs text-slate-400">HEX: {{ hex }}</p>
    </div>
  </div>
</template>
```

### 2. Opsi Konfigurasi Reaktif
`useInitials` mendukung opsi yang dapat berupa nilai konstan maupun `ref` / `computed`:

```javascript
const name = ref('Dr. Sarah Smith, Sp.A');
const length = ref(3);
const strategy = ref('first_last'); // 'first_last' | 'first_consecutive' | 'first_only'
const gradient = ref(true);

const { initials, style } = useInitials(name, {
  length,
  strategy,
  gradient,
  uppercase: true,
});
```

---

## 📋 API & Return Values

### Parameter
`useInitials(source, options = {})`

| Parameter | Tipe | Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `source` | `Ref<string> \| string` | `''` | String nama, email, atau ID yang akan diproses |
| `options.length` | `Ref<number> \| number` | `2` | Panjang inisial yang dihasilkan (1 - 4) |
| `options.strategy` | `Ref<string> \| string` | `'first_last'` | Strategi pemotongan kata: `'first_last'`, `'first_consecutive'`, `'first_only'` |
| `options.uppercase` | `boolean` | `true` | Apakah inisial berupa huruf kapital |
| `options.gradient` | `Ref<boolean> \| boolean` | `false` | Apakah menggunakan gradien warna dua arah |
| `options.customPalette` | `Array<object>` | `null` | Kustomisasi palet warna hashing |

### Nilai Balik (*Return Values*)

| Properti | Tipe | Keterangan |
| :--- | :--- | :--- |
| `initials` | `ComputedRef<string>` | Huruf inisial hasil ekstraksi (misal: `"CT"` atau `"CTA"`) |
| `name` | `ComputedRef<string>` | String nama bersih setelah dibersihkan dari gelar dan simbol |
| `color` | `ComputedRef<object>` | Objek palet lengkap hasil hash |
| `hex` | `ComputedRef<string>` | Kode warna HEX (misal: `"#0284c7"`) |
| `bgClass` | `ComputedRef<string>` | Kelas background Tailwind solid (misal: `"bg-sky-600"`) |
| `gradientClass` | `ComputedRef<string>` | Kelas background gradien Tailwind (misal: `"bg-gradient-to-tr from-sky-600 to-indigo-600"`) |
| `textColor` | `ComputedRef<string>` | Warna teks kontras tinggi (misal: `"#ffffff"`) |
| `ringClass` | `ComputedRef<string>` | Kelas ring aksen Tailwind |
| `style` | `ComputedRef<object>` | Objek CSS siap dipasang pada atribut `:style` elemen |
| `avatarProps` | `ComputedRef<object>` | Objek props siap di-spread ke komponen `<Avatar :initials="avatarProps.initials" ... />` |

---

## 💡 Fitur Pintar

1. **Auto-Clean Email**: Jika input berupa alamat email (`user.name@company.com`), otomatis mengambil username dan memisahkan kata berdasarkan titik/dash/underscore.
2. **Title & Prefix Stripper**: Otomatis membersihkan gelar umum seperti `Dr.`, `Prof.`, `Ir.`, `H.`, `Hj.`, `Sp.A`, `M.Kom`, `S.T`, dll.
3. **Deterministik & Konsisten**: Berbeda dengan warna acak (`Math.random`), nama `"Budi Santoso"` akan selalu mendapatkan warna yang sama persis di setiap sesi dan perangkat.

