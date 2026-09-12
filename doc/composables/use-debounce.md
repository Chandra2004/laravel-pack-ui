# ⏱️ Composable `useDebounce` & `useThrottle`

[← Kembali ke Dokumentasi Utama](../../README.md)

Composable dan fungsi utilitas untuk mengontrol laju eksekusi fungsi berat, pengetikan form pencarian, pemantauan scroll window, atau resize handler.

---

## 🚀 Pilihan Penggunaan

### 1. `useDebounce` (Menunda Eksekusi Sampai Input Selesai)
Otomatis membersihkan timer saat komponen di-unmount:

```vue
<script setup>
import { ref, watch } from 'vue';
import { useDebounce } from '@/Composables/Pack/useDebounce';

const search = ref('');

const fetchSuggestions = useDebounce((keyword) => {
    console.log('Mencari kata kunci:', keyword);
}, 350);

watch(search, (newVal) => fetchSuggestions(newVal));
</script>
```

### 2. `useDebouncedRef` (Ref Reaktif Tertunda)
```vue
<script setup>
import { useDebouncedRef } from '@/Composables/Pack/useDebounce';

// Nilai search term baru akan ter-update setelah jeda 400ms
const query = useDebouncedRef('', 400);
</script>
```

### 3. `useThrottle` (Membatasi Frekuensi Eksekusi Maksimal)
```vue
<script setup>
import { useThrottle } from '@/Composables/Pack/useDebounce';

const handleScroll = useThrottle(() => {
    console.log('Posisi scroll:', window.scrollY);
}, 200);
</script>
```
