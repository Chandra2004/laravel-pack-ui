# 🌐 Composable `useNetworkStatus`

[← Kembali ke Dokumentasi Utama](../../README.md)

`useNetworkStatus` adalah composable untuk memantau status konektivitas internet pengguna secara reaktif (`online` / `offline`) serta membaca informasi kecepatan jaringan (Network Information API).

---

## 🚀 Penggunaan

```vue
<script setup>
import { useNetworkStatus } from '@/Composables/Pack/useNetworkStatus';
import Alert from '@/Components/Pack/Alert.vue';

const { isOnline, offlineAt, effectiveType } = useNetworkStatus();
</script>

<template>
  <div>
    <!-- Banner Peringatan Saat Koneksi Terputus -->
    <Alert
      v-if="!isOnline"
      variant="solid"
      type="danger"
      title="Koneksi Internet Terputus"
    >
      Anda sedang dalam mode offline sejak {{ offlineAt?.toLocaleTimeString() }}. Beberapa fitur transaksi perbankan dinonaktifkan sementara.
    </Alert>
  </div>
</template>
```

---

## 📋 Nilai Return

| Property | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `isOnline` | `Ref<boolean>` | `true` jika internet aktif, `false` jika terputus |
| `offlineAt` | `Ref<Date \| null>` | Stempel waktu saat koneksi pertama kali terputus |
| `effectiveType` | `Ref<string \| null>` | Kategori koneksi: `'4g'`, `'3g'`, `'2g'`, `'slow-2g'` |
| `downlink` | `Ref<number \| null>` | Estimasi kecepatan download dalam Mb/s |
| `rtt` | `Ref<number \| null>` | Estimasi round-trip latency dalam milidetik |
| `saveData` | `Ref<boolean>` | Apakah browser menyalakan mode hemat kuota (*data-saver*) |
