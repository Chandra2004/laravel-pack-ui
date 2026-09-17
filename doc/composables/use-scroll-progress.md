# 📜 Composable `useScrollProgress`

[← Kembali ke Dokumentasi Utama](../../README.md)

`useScrollProgress` adalah composable untuk melacak posisi dan persentase scroll (baik window maupun kontainer elemen lokal) secara reaktif dengan performa optimal (60fps passive listener + `requestAnimationFrame`), status ambang batas atas, kalkulasi estimasi sisa waktu baca (*reading time*), serta fungsi scroll mulus kembali ke atas.

---

## 🚀 Penggunaan

```vue
<script setup>
import { useScrollProgress } from '@/Composables/Pack/useScrollProgress';

const {
    progress,
    scrollPercent,
    isAtTop,
    isComplete,
    readingTimeRemaining,
    scrollToTop,
} = useScrollProgress({
    target: null, // null = window, atau selector '#article-content' / ref(element)
    threshold: 5,
    wordsCount: 1500,
    wordsPerMinute: 200,
});
</script>

<template>
    <div class="fixed bottom-4 right-4 z-50">
        <!-- Floating indicator yang muncul hanya jika scroll > threshold -->
        <button
            v-if="!isAtTop"
            class="px-3 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-lg"
            @click="scrollToTop('smooth')"
        >
            {{ Math.round(progress) }}% (Sisa {{ readingTimeRemaining }} mnt) ↑
        </button>
    </div>
</template>
```

---

## 📋 API & Return Values

| Property / Method | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `progress` | `Ref<number>` | Nilai persentase scroll saat ini (rentang 0 s/d 100) |
| `scrollPercent` | `Computed<number>` | Nilai desimal persentase scroll (rentang 0.0 s/d 1.0) |
| `scrollTop` | `Ref<number>` | Jarak scroll saat ini dari tepi atas (dalam piksel) |
| `scrollHeight` | `Ref<number>` | Total tinggi area yang dapat di-scroll (dalam piksel) |
| `clientHeight` | `Ref<number>` | Tinggi area pandang tampak / viewport (dalam piksel) |
| `isAtTop` | `Computed<boolean>` | `true` jika posisi scroll masih di bawah ambang batas `threshold` |
| `isComplete` | `Computed<boolean>` | `true` jika scroll telah mencapai bagian paling bawah (>= 99.5%) |
| `readingTimeRemaining` | `Computed<number>` | Estimasi sisa waktu membaca dokumen (dalam menit) |
| `scrollToTop(behavior)` | `(behavior?: 'smooth' \| 'auto') => void` | Melakukan scroll halus kembali ke puncak target |
| `scrollToProgress(pct, behavior)` | `(pct: number, behavior?: 'smooth' \| 'auto') => void` | Melakukan scroll langsung ke persentase target tertentu |
| `calculateProgress()` | `() => void` | Menghitung ulang nilai progres scroll secara manual |

