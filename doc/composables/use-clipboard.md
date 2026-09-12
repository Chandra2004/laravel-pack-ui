# 📋 Composable `useClipboard`

[← Kembali ke Dokumentasi Utama](../../README.md)

`useClipboard` adalah composable untuk menyalin teks ke clipboard perangkat pengguna secara reaktif. Dilengkapi penanganan status `copied` otomatis (dengan timer reset), penanganan error, serta fallback legacy berbasis `document.execCommand` untuk lingkungan non-HTTPS atau browser lawas.

---

## 🚀 Penggunaan

```vue
<script setup>
import { useClipboard } from '@/Composables/Pack/useClipboard';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const { copy, copied, isSupported } = useClipboard({ timeout: 2000 });

const virtualAccount = '8801234567890123';
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="font-mono text-sm font-bold">{{ virtualAccount }}</span>

    <ButtonSubmit
      size="xs"
      :variant="copied ? 'success' : 'secondary'"
      :icon="copied ? 'check' : 'content_copy'"
      @click="copy(virtualAccount)"
    >
      {{ copied ? 'Tersalin!' : 'Salin Nomor VA' }}
    </ButtonSubmit>
  </div>
</template>
```

---

## 📋 API & Return Values

| Property / Method | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `copy(text)` | `(text: string) => Promise<boolean>` | Menyalin teks target ke clipboard |
| `copied` | `Ref<boolean>` | Bernilai `true` selama durasi timeout setelah teks berhasil disalin |
| `text` | `Ref<string>` | Teks terakhir yang berhasil disalin |
| `isSupported` | `boolean` | Status apakah browser mendukung Clipboard API |
| `error` | `Ref<Error \| null>` | Menyimpan objek galat jika proses penyalinan gagal |
