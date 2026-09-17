# ⏱️ Composable `useDebounce` & Utilitas `debounce`

[← Kembali ke Dokumentasi Utama](../../README.md) | [Lihat useThrottle](use-throttle.md)

`useDebounce` adalah composable untuk menunda eksekusi fungsi berat sampai pengguna berhenti melakukan aktivitas selama jangka waktu tertentu (*debounce delay*). Sangat ideal untuk kolom pencarian (*live search*), validasi input asinkron (*username check*), serta fitur simpan otomatis (*auto-save draft*).

Paket ini menyediakan 3 utilitas:
1. **`useDebounce`**: Hook composable dengan pembersihan otomatis timer saat komponen di-unmount.
2. **`useDebouncedRef`**: `customRef` reaktif Vue di mana nilai baru baru akan terbit setelah jeda debounce.
3. **`debounce`**: Pure helper function mandiri tanpa ketergantungan siklus hidup Vue.

---

## 🚀 Penggunaan

### 1. `useDebounce` (Menunda Pemanggilan Fungsi)
Otomatis membersihkan timer saat komponen di-unmount untuk mencegah kebocoran memori:

```vue
<script setup>
import { ref, watch } from 'vue';
import { useDebounce } from '@/Composables/Pack/useDebounce';

const keyword = ref('');
const suggestions = ref([]);

// Fungsi pencarian hanya dipanggil 400ms setelah user selesai mengetik
const fetchSuggestions = useDebounce(async (query) => {
    if (!query) {
        suggestions.value = [];
        return;
    }
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    suggestions.value = await res.json();
}, 400);

watch(keyword, (newVal) => fetchSuggestions(newVal));
</script>

<template>
  <div>
    <input
      v-model="keyword"
      placeholder="Ketik untuk mencari produk..."
      class="border rounded-xl px-3 py-2 text-sm w-full"
    />
  </div>
</template>
```

---

### 2. `useDebouncedRef` (Ref Reaktif Tertunda)
Gunakan jika Anda ingin nilai reaktif (`Ref`) itu sendiri yang tertunda pembaruannya:

```vue
<script setup>
import { watch } from 'vue';
import { useDebouncedRef } from '@/Composables/Pack/useDebounce';

// Nilai 'search' baru berubah setelah user berhenti mengetik selama 500ms
const search = useDebouncedRef('', 500);

watch(search, (finalValue) => {
    console.log('Query siap dikirim ke backend:', finalValue);
});
</script>

<template>
  <!-- v-model mengikat langsung ke debounced ref -->
  <input v-model="search" placeholder="Cari..." />
</template>
```

---

### 3. Utilitas Mandiri `debounce(fn, delay, options)`
Dapat digunakan di luar komponen Vue (misal di service helper atau modul vanilla JS):

```javascript
import { debounce } from '@/Composables/Pack/useDebounce';

const saveDraft = debounce((data) => {
    api.post('/drafts', data);
}, 1000, { immediate: false });

// Panggilan berkali-kali:
saveDraft({ title: 'A' });
saveDraft({ title: 'AB' });
saveDraft({ title: 'ABC' }); // Hanya payload ini yang akan dikirim setelah 1 detik

// Pembatalan manual jika form ditutup:
saveDraft.cancel();
```

---

## 📋 Daftar API & Spesifikasi

### 1. `useDebounce(fn, delay, options)`
| Parameter | Tipe | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `fn` | `Function` | — | Fungsi target yang akan dieksekusi (**Wajib**) |
| `delay` | `Number` | `300` | Waktu jeda tunggu dalam milidetik |
| `options.immediate` | `Boolean` | `false` | Jika `true`, eksekusi dilakukan segera pada panggilan pertama (*leading edge*) |

**Return Value:**
Fungsi ber-debounce dengan method pembatalan:
* `fn.cancel()`: Membatalkan timer yang sedang berjalan dan mencegah eksekusi berikutnya.

---

### 2. `useDebouncedRef(initialValue, delay)`
| Parameter | Tipe | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `initialValue` | `any` | — | Nilai awal state reaktif |
| `delay` | `Number` | `300` | Jeda milidetik sebelum nilai baru di-commit ke ref |

**Return Value:**
`Ref<any>` yang terikat ke Vue reactivity tracking (`customRef`).

---

### 3. `debounce(fn, delay, options)`
Pure function mandiri dengan return dan parameter yang sama seperti `useDebounce`, namun tanpa hook `onUnmounted`.
