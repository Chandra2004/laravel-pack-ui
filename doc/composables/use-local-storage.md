# 💾 Composable `useLocalStorage`

[← Kembali ke Dokumentasi Utama](../../README.md)

`useLocalStorage` adalah composable untuk menyinkronkan state reaktif Vue dengan `localStorage` browser secara otomatis. Dilengkapi fitur serialisasi JSON otomatis, deep watching untuk struktur data kompleks (Array & Object), serta sinkronisasi lintas-tab browser secara instan via `storage` event.

---

## 🚀 Penggunaan

```vue
<script setup>
import { useLocalStorage } from '@/Composables/Pack/useLocalStorage';

// Nilai tersimpan di localStorage dengan key 'app_user_preferences'
const { data: preferences, remove } = useLocalStorage('app_user_preferences', {
    compactTable: false,
    sidebarCollapsed: false,
    defaultCurrency: 'IDR',
});
</script>

<template>
  <div>
    <label class="flex items-center gap-2">
      <input type="checkbox" v-model="preferences.compactTable" />
      <span>Mode Tabel Ramping</span>
    </label>

    <button @click="remove" class="text-xs text-rose-600 mt-2">
      Reset ke Bawaan
    </button>
  </div>
</template>
```

---

## 📋 Parameter & Opsi

```javascript
useLocalStorage(key, defaultValue, options)
```

| Parameter | Tipe | Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `key` | `String` | — | Kunci unik localStorage (**Wajib**) |
| `defaultValue` | `any` | — | Nilai awal jika key belum pernah disimpan |
| `options.listenToStorage` | `Boolean` | `true` | Dengarkan perubahan nilai jika diubah di tab/window browser lain |
| `options.deep` | `Boolean` | `true` | Lacak mutasi properti di dalam object/array |
