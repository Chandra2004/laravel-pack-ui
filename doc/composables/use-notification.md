# useNotification

Modul composable sistem notifikasi toast global berbasis Vue 3 dan Inertia.js dengan dukungan antrian multi-posisi, transisi status asinkron (Promise toast), pembaruan konten aktif, dan penangkapan otomatis pesan flash backend Laravel.

---

## 01. Overview

### 1.1 Deskripsi Komponen
`useNotification` adalah sistem state management tersentralisasi untuk notifikasi toast di aplikasi web. Composable ini mengelola antrian notifikasi reaktif di tingkat modul yang dibagikan ke seluruh komponen aplikasi. Notifikasi kemudian dirender secara visual melalui komponen pendamping `ToastNotification.vue` di posisi layar yang telah ditentukan.

### 1.2 Masalah yang Diselesaikan
- Event Bus Usang: Menghilangkan kebutuhan event bus (`$emit` global) atau library pihak ketiga yang membengkakkan bundle aplikasi hanya untuk menampilkan pesan konfirmasi.
- Integrasi Flash Message Laravel: Menjembatani pesan flash sesi Laravel (`session()->flash('success', '...')`) dengan antarmuka frontend Vue tanpa perlu menulis watcher berulang di setiap halaman.
- Indikator Status Asinkron: Mengatasi masalah "flickering" saat proses panjang (seperti upload atau checkout) dengan mekanisme `promise()` yang mengubah status toast dari spinner loading menjadi pesan sukses atau gagal dalam satu wadah yang sama.
- Duplikasi Notifikasi: Menyediakan opsi deduplikasi untuk mencegah penumpukan toast identik saat pengguna mengklik tombol secara beruntun.

### 1.3 Kapan Harus Menggunakan
- Menampilkan umpan balik instan setelah pengguna melakukan aksi CRUD (tambah, ubah, hapus).
- Menampilkan pesan keberhasilan atau kegagalan dari respon pengiriman form Inertia.js.
- Menampilkan progres operasi asinkron berdurasi panjang dengan tombol pembatalan atau aksi undo.
- Menampilkan peringatan status koneksi jaringan atau habisnya masa sesi otentikasi.

### 1.4 Kapan TIDAK Menggunakan
- Konfirmasi Aksi Destruktif yang Memerlukan Keputusan Kritis: Untuk menghapus data penting permanen atau transaksi irreversibel, gunakan composable `useConfirm` atau komponen `Modal.vue` yang mengharuskan interaksi eksplisit pengguna.
- Konten Informasi Panjang: Notifikasi toast dirancang untuk pesan ringkas (1-2 kalimat). Hindari menaruh paragraf panjang, tabel data, atau formulir di dalam toast.

---

## 02. Preview

> [!TIP]
> Pengujian fungsional dan showcase composable ini dapat diuji secara native pada portal pratinjau aplikasi:
>
> <a href="/preview" target="_self" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 8px; background-color: var(--vp-c-brand-1, #4f46e5); color: #ffffff;">Buka Live Preview Portal Komponen &rarr;</a>

---

## 03. Installation & Import

Modul `useNotification` diimpor langsung dari direktori Composables:

```javascript
import { useNotification } from '@/Composables/Pack/useNotification';
```

---

## 04. Anatomy

### Diagram Struktur State Global
```
+-------------------------------------------------------------+
|               Module-Level Shared State                     |
|  - notifications: Ref<Array<ToastItem>>                     |
|  - defaultPosition: Ref<string>                             |
|  - defaultDuration: Ref<number>                             |
+-------------------------------------------------------------+
          |                                   |
          v                                   v
+-----------------------+           +-----------------------+
|   useNotification()   |           | ToastNotification.vue |
|  - success() / error()|           | - Render multi-sudut  |
|  - promise()          |           | - Progress countdown  |
|  - initFlashWatcher() |           | - Tombol dismiss      |
+-----------------------+           +-----------------------+
          |                                   ^
          +--- Memanipulasi Array Antrian ----+
```

### Mermaid Diagram Alur Notifikasi Promise
```mermaid
flowchart TD
    A[Panggil promise()] --> B[Buat Toast ID dengan Spinner Loading]
    B --> C[Set duration = 0 & dismissible = false]
    C --> D{Tunggu Hasil Eksekusi}
    D -->|Promise Berhasil Resolusi| E[Update Toast: type = 'success']
    D -->|Promise Melempar Error| F[Update Toast: type = 'error']
    E --> G[Set Durasi Tayang & Aktifkan Tombol Tutup]
    F --> G
    G --> H[Hitung Mundur Selesai & Hapus dari Antrian]
```

---

## 05. Props / Options

Parameter yang diterima oleh fungsi `add(options)`:

| Parameter | Tipe | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `options.message` | `string` | Wajib | Teks isi notifikasi utama. |
| `options.type` | `'success' \| 'error' \| 'warning' \| 'info' \| 'neutral' \| 'purple' \| 'dark'` | `'info'` | Tipe gaya visual notifikasi. |
| `options.title` | `string` | `''` | Judul opsional di bagian atas teks pesan. |
| `options.duration` | `number` | `4000` | Durasi tampil dalam milidetik. Berikan `0` untuk toast persisten. |
| `options.position` | `'top-right' \| 'top-center' \| 'top-left' \| 'bottom-right' \| 'bottom-center' \| 'bottom-left'` | `'top-right'` | Posisi penempatan toast pada viewport. |
| `options.icon` | `string \| null` | `null` | Nama ikon Material Symbols kustom. |
| `options.dismissible` | `boolean` | `true` | Menampilkan tombol silang untuk menutup notifikasi secara manual. |
| `options.dedupe` | `boolean` | `false` | Jika true, mencegah munculnya toast duplikat dengan pesan, tipe, dan posisi yang sama. |
| `options.action` | `Object \| null` | `null` | Objek tombol aksi: `{ label, icon, autoDismiss, onClick }`. |

Parameter untuk alur asinkron `promise(promiseOrFn, messages, options)`:

| Parameter | Tipe | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `promiseOrFn` | `Promise \| Function` | Wajib | Instance Promise atau fungsi async yang akan dieksekusi. |
| `messages.loading` | `string` | `'Sedang memproses...'` | Pesan teks saat state operasi masih berlangsung. |
| `messages.success` | `string \| Function` | `'Berhasil diselesaikan!'` | Pesan saat sukses, dapat berupa fungsi penerima hasil `(result) => string`. |
| `messages.error` | `string \| Function` | `'Terjadi kesalahan...'` | Pesan saat gagal, dapat berupa fungsi penerima error `(error) => string`. |
| `options.successDuration`| `number` | `4000` | Durasi tayang toast status berhasil. |
| `options.errorDuration`  | `number` | `5000` | Durasi tayang toast status kesalahan. |

---

## 06. Slots

Komponen utilitas ini merupakan Composable logic murni dan tidak menggunakan slot template.

---

## 07. Emits / Events

Komponen utilitas ini merupakan Composable logic murni dan tidak memancarkan event emit komponen.

---

## 08. Methods / Exposes

### Return Nilai dari Composable `useNotification`

| Properti / Fungsi | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `notifications` | `Ref<Array>` | Array reaktif berisi seluruh item notifikasi yang sedang aktif. |
| `defaultPosition` | `Ref<string>` | Ref posisi default yang digunakan jika pemanggil tidak menentukan posisi. |
| `defaultDuration` | `Ref<number>` | Ref durasi default (dalam ms) untuk seluruh toast baru. |
| `add(options)` | `Function` | Menambahkan notifikasi baru ke antrian dan mengembalikan string `id` unik. |
| `update(id, options)` | `Function` | Memperbarui properti toast aktif berdasarkan ID yang diberikan. |
| `remove(id)` | `Function` | Menghapus toast tertentu dari antrian berdasarkan ID. |
| `clear(position)` | `Function` | Menghapus seluruh toast (atau hanya toast di posisi tertentu jika parameter diisi). |
| `setDefaultDuration(ms)` | `Function` | Mengatur nilai durasi default baru secara global. |
| `success(message, opts)` | `Function` | Shortcut untuk memunculkan notifikasi tipe success. |
| `error(message, opts)` | `Function` | Shortcut untuk memunculkan notifikasi tipe error. |
| `warning(message, opts)` | `Function` | Shortcut untuk memunculkan notifikasi tipe warning. |
| `info(message, opts)` | `Function` | Shortcut untuk memunculkan notifikasi tipe info. |
| `promise(fn, msgs, opts)` | `Function` | Wrapper async yang menangani siklus hidup toast loading -> success/error. |
| `initFlashWatcher(page)` | `Function` | Mengaktifkan listener otomatis terhadap `page.props.flash` milik Inertia.js. |

---

## 09. Keyboard Navigation / Accessibility

Penyampaian status visual toast harus dapat diakses oleh perangkat bantu:
- Live Region ARIA: Komponen `ToastNotification.vue` membungkus kontainer notifikasi dengan atribut `aria-live="polite"` untuk toast informatif dan `aria-live="assertive"` serta `role="alert"` untuk toast error agar screen reader segera membacakan pesan kesalahan.
- Tombol Tutup yang Dapat Difokuskan: Tombol close pada setiap toast wajib memiliki label yang jelas (`aria-label="Tutup notifikasi"`) dan dapat dijangkau via navigasi keyboard (tombol Tab).
- Pause on Hover / Focus: Perhitungan mundur durasi toast otomatis dijeda (paused) saat kursor mouse berada di atas elemen toast atau saat elemen anak menerima fokus keyboard.

---

## 10. State Management & Lifecycle

- Desain Singleton Terpusat: Deklarasi `const notifications = ref([])` berada di luar fungsi `useNotification()` (module scope). Ini menjamin bahwa memanggil `useNotification()` di sepuluh komponen berbeda akan tetap berinteraksi dengan antrian yang sama.
- Pembersihan Listener Flash: Fungsi `initFlashWatcher()` melacak referensi `unwatchFlash` untuk memastikan watcher lama dihentikan sebelum watcher baru dibuat jika dipanggil berulang kali.

---

## 11. Code Examples

### 11.1 Contoh Dasar (Basic Example)
```vue
<script setup>
import { useNotification } from '@/Composables/Pack/useNotification';

const { success, error } = useNotification();

const handleSave = async () => {
  try {
    // Simulasi penyimpanan data
    await new Promise((resolve) => setTimeout(resolve, 500));
    success('Profil pengguna berhasil diperbarui!');
  } catch (err) {
    error('Gagal memperbarui profil.');
  }
};
</script>

<template>
  <button
    type="button"
    class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
    @click="handleSave"
  >
    Simpan Perubahan
  </button>
</template>
```

### 11.2 Contoh Menengah (Alur Async Promise dengan Parameter Dinamis)
```vue
<script setup>
import { useNotification } from '@/Composables/Pack/useNotification';
import axios from 'axios';

const { promise } = useNotification();

const handleExport = async () => {
  await promise(
    () => axios.post('/api/reports/generate'),
    {
      loading: 'Sedang mengompilasi laporan tahunan PDF...',
      success: (res) => `Laporan selesai! Berkas: ${res.data.filename}`,
      error: (err) => `Gagal mencetak: ${err.response?.data?.message || err.message}`,
    },
    { successDuration: 6000 }
  );
};
</script>

<template>
  <button
    type="button"
    class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
    @click="handleExport"
  >
    Unduh Laporan Tahunan
  </button>
</template>
```

### 11.3 Contoh Lanjutan (Toast dengan Tombol Aksi Pembatalan / Undo)
```vue
<script setup>
import { ref } from 'vue';
import { useNotification } from '@/Composables/Pack/useNotification';
import { router } from '@inertiajs/vue3';

const { add, remove } = useNotification();
const deletedItem = ref(null);

const handleDelete = (item) => {
  deletedItem.value = item;

  const toastId = add({
    type: 'warning',
    title: 'Item Dipindahkan ke Tong Sampah',
    message: `Data "${item.title}" telah dihapus.`,
    duration: 8000,
    action: {
      label: 'Batalkan (Undo)',
      autoDismiss: true,
      onClick: () => {
        // Eksekusi pemulihan data
        router.post(route('items.restore', item.id), {}, {
          preserveScroll: true,
          onSuccess: () => {
            deletedItem.value = null;
          }
        });
      },
    },
  });
};
</script>

<template>
  <button
    type="button"
    class="px-3 py-1.5 bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-colors"
    @click="handleDelete({ id: 104, title: 'Invoice Piutang PT. ABC' })"
  >
    Hapus Data
  </button>
</template>
```

---

## 12. Integration with Laravel & Inertia

### 12.1 Penanganan Pesan Flash Sesi Laravel
Di controller Laravel, kirimkan notifikasi feedback melalui metode `with()` atau `session()->flash()`:

```php
// app/Http/Controllers/ProductController.php
namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
        ]);

        Product::create($validated);

        return redirect()->route('products.index')
            ->with('success', 'Produk baru berhasil ditambahkan ke katalog.');
    }
}
```

Pastikan middleware `HandleInertiaRequests` membagikan variabel flash ke frontend:
```php
// app/Http/Middleware/HandleInertiaRequests.php
public function share(Request $request): array
{
    return array_merge(parent::share($request), [
        'flash' => [
            'success' => fn () => $request->session()->get('success'),
            'error'   => fn () => $request->session()->get('error'),
            'warning' => fn () => $request->session()->get('warning'),
            'info'    => fn () => $request->session()->get('info'),
        ],
    ]);
}
```

Di komponen root layout aplikasi (`AppLayout.vue` atau `AuthenticatedLayout.vue`):
```vue
<script setup>
import { onMounted } from 'vue';
import { useNotification } from '@/Composables/Pack/useNotification';
import ToastNotification from '@/Components/Pack/ToastNotification.vue';

const { initFlashWatcher } = useNotification();

onMounted(() => {
  // Aktifkan pemantau flash message dari Inertia secara global
  initFlashWatcher();
});
</script>

<template>
  <div>
    <!-- Letakkan wadah ToastNotification di tingkat layout root -->
    <ToastNotification position="top-right" />
    <slot />
  </div>
</template>
```

---

## 13. Styling & Customization

Penataan tampilan notifikasi diatur melalui komponen visual `ToastNotification.vue` menggunakan kelas Tailwind CSS v4:

```html
<!-- Toast Sukses Modern dengan Progress Bar Bawah -->
<div class="relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-zinc-900 shadow-xl p-4 flex gap-3">
  <span class="material-symbols-outlined text-emerald-500">check_circle</span>
  <div class="space-y-1">
    <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ item.title }}</h4>
    <p class="text-xs text-zinc-500">{{ item.message }}</p>
  </div>
  <!-- Indikator Durasi Berjalan -->
  <div
    class="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-100 ease-linear"
    :style="{ width: `${item.progress}%` }"
  ></div>
</div>
```

---

## 14. Responsive Behavior

- Penyesuaian Posisi di Layar Ponsel: Pada layar sempit (`< 640px`), posisi `top-right` atau `top-left` dapat dipindahkan secara adaptif ke `top-center` atau `bottom-center` dengan lebar kontainer penuh (`w-full px-4`) untuk meminimalkan pemotongan teks.
- Interaksi Sentuh (Swipe to Dismiss): Komponen pendamping dapat menambahkan listener gesture `touchstart` dan `touchend` untuk menutup notifikasi saat disapu ke kanan atau ke kiri.

---

## 15. Performance Optimization & Benchmarks

1. Manajemen Tanda Tangan Flash: Variabel `lastFlashSignature` menyimpan string hash JSON dari objek flash terakhir. Hal ini mencegah pengulangan render toast yang tidak perlu saat terjadi event navigasi Inertia internal yang tidak memperbarui data flash.
2. Pengalokasian Memori O(1): Penambahan item baru menggunakan `push()` langsung dan pencarian index menggunakan ID unik pada pembaruan status `update()`.

---

## 16. Security Best Practices

- Pencegahan Serangan XSS: Teks `message` dan `title` dirender sebagai text node murni di template Vue (menggunakan interpolasi `{{ }}` standar), bukan directive `v-html`. Hal ini memastikan string error atau respon pengguna yang tidak disanitasi dari backend tidak dapat mengeksekusi script berbahaya di browser.
- Proteksi Data Sensitif: Jangan menyertakan informasi rahasia seperti token otentikasi penuh, password sementara, atau payload data pribadi di dalam pesan toast yang tampil di layar.

---

## 17. Troubleshooting / FAQ

### Pertanyaan 1: Mengapa notifikasi yang saya panggil via `success()` tidak muncul di layar?
Jawaban: Pastikan komponen visual `<ToastNotification />` telah dipasang di dalam template layout aplikasi Anda (misal di `AuthenticatedLayout.vue`). Composable `useNotification()` hanya mengelola state array data; komponen visual bertanggung jawab untuk merendernya ke layar.

### Pertanyaan 2: Mengapa flash message dari Laravel muncul dua kali saat navigasi?
Jawaban: Pastikan `initFlashWatcher()` hanya dipanggil SATU KALI di layout utama (`AppLayout.vue`). Jika Anda memanggilnya di setiap halaman individual, beberapa watcher akan aktif bersamaan dan memicu notifikasi ganda.

---

## 18. Comparison with Alternatives

| Fitur / Karakteristik | useNotification (Pack UI) | Vue-Toastification | SweetAlert2 |
| :--- | :--- | :--- | :--- |
| Ukuran Dependensi | 0 KB Tambahan (Native Vue 3) | ~25 KB | ~45 KB |
| Desain Sistem | Terintegrasi Tailwind CSS v4 | CSS Terpisah bawaan | Desain Kustom Bawaan |
| Integrasi Laravel Inertia Flash | Bawaan (`initFlashWatcher`) | Manual | Manual |
| Dukungan Promise State | Ya (`promise()`) | Terbatas | Ya |
| Aksesibilitas WCAG Live Region | Terintegrasi | Terintegrasi | Terbatas |

---

## 19. Notes / Limitations

- Ketergantungan pada Komponen View: Composable ini bekerja sebagai penyedia state headless. Diperlukan komponen render seperti `ToastNotification.vue` agar toast tampil secara grafis.
- Hilang Saat Reload Halaman: State antrian notifikasi bersifat in-memory dan tidak disimpan ke `localStorage`. Me-refresh jendela browser secara manual akan menghapus notifikasi yang sedang aktif.
