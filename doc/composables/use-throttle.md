---
title: "useThrottle"
description: "Re-ekspor alias dari useDebounce. Composable dan helper throttle untuk membatasi frekuensi eksekusi fungsi maksimal satu kali per interval waktu tertentu, ideal untuk scroll, resize, dan event pointer berkecepatan tinggi."
---

# useThrottle (`useThrottle.js`)

## 01. Overview

`useThrottle` adalah alias re-ekspor dari [useDebounce.js](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/resources/js/Composables/Pack/useDebounce.js). Modul ini mengekspor `throttle` (helper pure) dan `useThrottle` (composable reaktif) yang diimplementasikan di dalam `useDebounce.js` dan dapat diimpor dari dua jalur yang berbeda.

> [!NOTE]
> Seluruh implementasi throttle berada di `useDebounce.js`. Dokumentasi teknis lengkap, termasuk API, contoh kode, dan diagram arsitektur, tersedia di halaman [useDebounce](/composables/use-debounce).

### 1.1 Apa Entitas Ini

- **Tipe Artefak**: Re-ekspor alias dari `useDebounce.js`.
- **Lokasi Berkas Sumber**: [useThrottle.js](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/resources/js/Composables/Pack/useThrottle.js).
- **Ekspor Kunci**: `throttle`, `useThrottle`.
- **Sumber Implementasi**: [useDebounce.js](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/resources/js/Composables/Pack/useDebounce.js).

### 1.2 Fungsi Utama

- `throttle(fn, interval, options?)`: Helper pure yang membatasi pemanggilan `fn` maksimal satu kali setiap `interval` milidetik.
- `useThrottle(fn, interval, options?)`: Composable dengan auto-cleanup lifecycle yang otomatis membatalkan throttle aktif saat komponen di-unmount.

### 1.3 Kapan Digunakan

- Event `scroll` atau `resize` yang menembak puluhan kali per detik.
- Handler pergerakan kursor (`mousemove`, `pointermove`) untuk visualisasi realtime.
- Tombol refresh atau reload data yang perlu dibatasi frekuensi kliknya.
- Operasi yang harus berjalan berkala namun tidak boleh menumpuk (berbeda dari debounce yang menunggu jeda).

### 1.4 Karakteristik Penting

- **Leading + Trailing**: Secara default, throttle mengeksekusi di awal interval (leading) DAN di akhir (trailing), memastikan eksekusi pertama langsung dan eksekusi terakhir tidak terlewat.
- **Kontrol Eksekusi**: Mendukung `.cancel()` untuk membatalkan trailing call yang tertunda dan `.flush()` untuk memaksakan eksekusi segera.
- **Auto-Cleanup**: `useThrottle` menggunakan guard `getCurrentInstance()` untuk mendaftarkan `onUnmounted` secara aman, bahkan jika dipanggil di luar setup context.

---

## 02. Preview

> [!TIP]
> Pengujian fungsional dan showcase composable ini dapat diuji secara native pada portal pratinjau aplikasi:
>
> <a href="http://localhost:8000/preview" target="_self" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 8px; background-color: var(--vp-c-brand-1, #4f46e5); color: #ffffff;">Buka Live Preview Portal Komponen &rarr;</a>

---

## 03. Usage

### Perbedaan Debounce vs Throttle

```text
Debounce: Tunggu jeda (idle period)
Event: --A---B---C-----------D---
Timer:          |reset|reset|wait...|fire!
Eksekusi:                           D

Throttle: Batas kecepatan berkala
Event: -A-B-C-D-E-F-G-H-I-J---K
Interval: |--100ms--|--100ms--|--100ms--|
Eksekusi:  A         E         I        K
```

### Contoh Penggunaan

```javascript
// Dari useThrottle.js
import { throttle, useThrottle } from '@/Composables/Pack/useThrottle';

// Atau langsung dari useDebounce.js (sama saja)
import { throttle, useThrottle } from '@/Composables/Pack/useDebounce';
```

---

## 04. Anatomy

File `useThrottle.js` hanya berisi satu baris:

```javascript
export { throttle, useThrottle } from './useDebounce';
```

Semua logika berada di `useDebounce.js`. Lihat [Anatomy di dokumentasi useDebounce](/composables/use-debounce#04-anatomy) untuk diagram lengkap.

---

## 05. Variants

| Fungsi | Deskripsi |
| :--- | :--- |
| `throttle(fn, interval)` | Pure helper. Mengembalikan fungsi ter-throttle. |
| `useThrottle(fn, interval)` | Composable. Otomatis cleanup di `onUnmounted`. |
| `useThrottledRef(value, interval)` | `Ref` kustom reaktif yang memperbarui nilai ter-throttle. |
| `useThrottleFn(fn, interval)` | Alias `useThrottle` dengan nama alternatif. |

Semua tersedia sebagai ekspor di `useDebounce.js`.

---

## 06. Sizes

Tidak relevan.

---

## 07. States

Lihat [States di dokumentasi useDebounce](/composables/use-debounce#07-states).

---

## 08. Props / Parameters

### `throttle(fn, interval, options?)`

| Parameter | Tipe | Default | Wajib | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `fn` | `Function` | - | Ya | Fungsi target yang akan di-throttle |
| `interval` | `number` | - | Ya | Interval minimum antar eksekusi dalam milidetik |
| `options.leading` | `boolean` | `true` | Tidak | Eksekusi di awal interval |
| `options.trailing` | `boolean` | `true` | Tidak | Eksekusi di akhir interval jika ada pemanggilan yang tertunda |

### `useThrottle(fn, interval, options?)`

Parameter sama dengan `throttle()`. Tambahan: registrasi `onUnmounted` otomatis.

---

## 09. Slots / Content

Tidak relevan.

---

## 10. Events / Interactions / Returns

### Return `useThrottle()`

| Properti / Method | Tipe | Deskripsi |
| :--- | :--- | :--- |
| Fungsi ter-throttle | `Function` | Fungsi wrapper yang harus dipanggil alih-alih `fn` asli |
| `.cancel()` | `Function` | Membatalkan trailing call yang tertunda |
| `.flush()` | `Function` | Memaksa eksekusi segera dan mereset timer |
| `.pending()` | `Function` | Mengembalikan `true` jika ada trailing call yang sedang menunggu |

---

## 11. Code Example

### Basic: Throttle Event Scroll

```javascript
import { useThrottle } from '@/Composables/Pack/useThrottle';

const handleScroll = useThrottle(() => {
    console.log('Scroll position:', window.scrollY);
}, 100); // Maksimal 10 kali per detik

window.addEventListener('scroll', handleScroll);
```

### Intermediate: Throttle Pengiriman Data Posisi Kursor

```vue
<script setup>
import { ref } from 'vue';
import { useThrottle } from '@/Composables/Pack/useThrottle';

const cursorX = ref(0);
const cursorY = ref(0);

const updateCursor = useThrottle((e) => {
    cursorX.value = e.clientX;
    cursorY.value = e.clientY;
}, 50);
</script>

<template>
    <div @mousemove="updateCursor" class="relative h-64 border rounded-xl">
        <span class="text-xs text-gray-500">
            X: {{ cursorX }}, Y: {{ cursorY }}
        </span>
    </div>
</template>
```

### Advanced: Tombol Refresh dengan Throttle

```vue
<script setup>
import { ref } from 'vue';
import { useThrottle } from '@/Composables/Pack/useThrottle';
import { useNotification } from '@/Composables/Pack/useNotification';

const { info } = useNotification();
const loading = ref(false);

const fetchData = useThrottle(async () => {
    loading.value = true;
    try {
        await axios.get('/api/data');
    } finally {
        loading.value = false;
    }
}, 2000, { trailing: false }); // Hanya leading; tidak ada delay trailing call

const handleRefresh = () => {
    if (fetchData.pending()) {
        info('Mohon tunggu sebelum refresh ulang.');
        return;
    }
    fetchData();
};
</script>

<template>
    <button @click="handleRefresh" :disabled="loading" class="btn-primary">
        {{ loading ? 'Memuat...' : 'Refresh Data' }}
    </button>
</template>
```

---

## 12. Result / Behavior

- Dengan `leading: true, trailing: true` (default): eksekusi pertama langsung terjadi, lalu jika ada pemanggilan baru di akhir interval, eksekusi trailing juga terjadi.
- Dengan `trailing: false`: setelah eksekusi leading, semua pemanggilan dalam interval diabaikan sepenuhnya hingga interval berikutnya.
- `.cancel()` membatalkan trailing call — berguna di `onUnmounted` jika cleanup manual diperlukan.

---

## 13. Customization

Lihat [Customization di dokumentasi useDebounce](/composables/use-debounce#13-customization).

---

## 14. Accessibility

Tidak ada pertimbangan aksesibilitas khusus. Throttle adalah teknik performa, bukan UI.

---

## 15. Responsive Behavior

Tidak relevan untuk composable ini.

---

## 16. Do / Don't

**Lakukan:**

- Gunakan throttle (bukan debounce) untuk event yang harus terus berjalan namun dibatasi frekuensinya (scroll, resize, mousemove).
- Gunakan debounce untuk input yang harus menunggu pengguna berhenti sebelum memicu aksi (search, auto-save).

**Jangan:**

- Jangan menggunakan throttle dengan interval sangat besar (> 1000ms) untuk event scroll; ini akan membuat UI terasa lamban.
- Jangan lupa membersihkan listener event yang menggunakan throttle melalui `removeEventListener`; composable `useThrottle` hanya membersihkan timer internal, bukan listener DOM.

---

## 17. Examples / Recipes

Lihat [Examples / Recipes di dokumentasi useDebounce](/composables/use-debounce#17-examples--recipes) untuk resep lengkap termasuk kombinasi throttle + debounce.

---

## 18. Related Items

```text
useThrottle
├── Implementasi Asli
│   └── useDebounce.js → Semua implementasi throttle berada di sini
│
└── Lihat Juga
    ├── useScrollProgress.js → Menggunakan throttle internal via requestAnimationFrame
    └── useServerTable.js    → Menggunakan debounce untuk pencarian
```

---

## 19. Notes / Limitations

- `useThrottle.js` **hanya** mengekspor `throttle` dan `useThrottle`. Ekspor lain dari `useDebounce.js` (seperti `useDebouncedRef`, `useThrottledRef`, `debounce`) harus diimpor langsung dari `useDebounce.js`.
- Semua batasan yang berlaku di `useDebounce` juga berlaku di sini. Lihat [Notes / Limitations di useDebounce](/composables/use-debounce#19-notes--limitations).
