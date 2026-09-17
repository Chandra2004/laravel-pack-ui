# ⏱️ Composable `useThrottle` & Utilitas `throttle`

[← Kembali ke Dokumentasi Utama](../../README.md) | [Lihat useDebounce](use-debounce.md)

`useThrottle` adalah composable untuk membatasi frekuensi eksekusi fungsi (*rate limiting*) agar hanya dipanggil paling banyak sekali dalam rentang waktu yang ditentukan (*throttle interval*). Sangat penting untuk menangani event intensif seperti pergerakan mouse (*mousemove*), *window scroll*, *window resize*, dan pencegahan klik beruntun (*spam click*).

Dilengkapi pembersihan timer otomatis saat komponen dilepas (*lifecycle cleanup onUnmounted*), method pembatalan manual `.cancel()`, serta utilitas mandiri `throttle()` tanpa ketergantungan siklus hidup Vue.

---

## 🚀 Penggunaan

### 1. Di dalam Komponen Vue (`useThrottle`)
Otomatis membersihkan timer saat komponen di-unmount:

```vue
<script setup>
import { ref } from 'vue';
import { useThrottle } from '@/Composables/Pack/useThrottle';

const scrollY = ref(0);

// Eksekusi fungsi scroll maksimal 1 kali setiap 200 milidetik
const handleScroll = useThrottle(() => {
    scrollY.value = window.scrollY;
    console.log('Posisi scroll terbaru:', window.scrollY);
}, 200);

window.addEventListener('scroll', handleScroll, { passive: true });
</script>

<template>
  <div class="fixed top-4 right-4 text-xs font-mono bg-zinc-900 text-white px-2 py-1 rounded">
    Scroll: {{ scrollY }}px
  </div>
</template>
```

---

### 2. Utilitas Mandiri Pure Function (`throttle`)
Dapat di-import langsung di file helper JavaScript, Pinia store, atau service non-komponen:

```javascript
import { throttle } from '@/Composables/Pack/useThrottle';

const sendHeartbeat = throttle(() => {
    fetch('/api/ping');
}, 5000);

// Panggilan berkali-kali hanya akan dieksekusi 1 kali per 5 detik
sendHeartbeat();
sendHeartbeat();
sendHeartbeat();

// Batalkan penundaan jika diperlukan:
sendHeartbeat.cancel();
```

---

## 📋 Daftar API & Signature

### 1. `useThrottle(fn, limit)`
| Parameter | Tipe | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `fn` | `Function` | — | Fungsi target yang akan dibatasi frekuensinya (**Wajib**) |
| `limit` | `Number` | `300` | Batas interval waktu dalam milidetik |

**Return Value:**
Fungsi ber-throttle dengan method tambahan:
* `fn.cancel()`: Membatalkan eksekusi antrean yang tertunda dan mereset status throttle.

---

### 2. Perbedaan `useThrottle` vs `useDebounce`

| Kategori | `useThrottle` | `useDebounce` |
| :--- | :--- | :--- |
| **Prinsip Kerja** | Menjalankan panggilan pertama, lalu mengabaikan panggilan berikutnya sampai interval waktu habis. | Menunda eksekusi sampai aktivitas pemanggilan benar-benar berhenti selama jeda waktu. |
| **Kasus Terbaik** | Scroll window, resize, drag-and-drop, rate limit pemicu klik. | Kolom pencarian realtime, auto-save form draft, auto-complete API. |
| **Pembersihan** | Otomatis via `onUnmounted`. | Otomatis via `onUnmounted`. |

