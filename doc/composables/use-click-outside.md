# 🎯 Composable `useClickOutside`

[← Kembali ke Dokumentasi Utama](../../README.md)

---

## 10. Composable `useClickOutside.js`

Composable utilitas ringan (*lightweight composable*) untuk mendeteksi interaksi klik di luar elemen target. Digunakan secara internal oleh sub-komponen yang memiliki panel melayang / popover (`InputSelect.vue`, `InputDatePicker.vue`, `InputColor.vue`, dan pencarian autocomplete pada `InputText.vue`).

### Lokasi File

* **Composable**: `useClickOutside.js`

### Fitur & Keunggulan:
* **Event Pointerdown**: Menggunakan event `pointerdown` alih-alih `click` biasa untuk menangkap interaksi sentuh (touchscreen) dan mouse secara instan sebelum bubbling dimulai.
* **Capture Phase**: Menggunakan opsi `capture: true` (`document.addEventListener('pointerdown', listener, true)`) untuk memastikan deteksi klik luar tetap bekerja meskipun ada elemen anak yang memanggil `stopPropagation()`.
* **Auto Cleanup**: Otomatis melepas event listener pada siklus hidup `onUnmounted()` untuk mencegah memory leak.

### Signature API (`useClickOutside`)

```javascript
useClickOutside(targetRef, handler);
```

| Parameter | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `targetRef` | `Ref<HTMLElement>` | Template ref ke elemen kontainer utama yang diproteksi dari penutupan |
| `handler` | `(event: MouseEvent \| TouchEvent) => void` | Fungsi callback yang dipanggil ketika klik terjadi di luar `targetRef` |

### Contoh Penggunaan di Komponen Kustom

```vue
<script setup>
import { ref } from 'vue';
import { useClickOutside } from '@/Composables/Pack/useClickOutside.js';

const menuRef = ref(null);
const isMenuOpen = ref(false);

// Tutup menu otomatis jika user mengklik area mana pun di luar menuRef
useClickOutside(menuRef, () => {
  if (isMenuOpen.value) {
    isMenuOpen.value = false;
  }
});
</script>

<template>
  <div ref="menuRef" class="relative inline-block">
    <button @click="isMenuOpen = !isMenuOpen" class="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg">
      Aksi Cepat
    </button>

    <!-- Dropdown Menu -->
    <div v-if="isMenuOpen" class="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-2 z-20 space-y-1">
      <a href="#" class="block px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cetak Invoice</a>
      <a href="#" class="block px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Kirim Ulang Webhook</a>
    </div>
  </div>
</template>
```

---