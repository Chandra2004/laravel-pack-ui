# 🪟 Modal Component (`Modal.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

---

## 5. Modal Component (`Modal.vue`)

Komponen dialog overlay / modal responsif berbasis **Tailwind CSS** dan ikon **Google Material Symbols**. Dirender ke level teratas DOM menggunakan `<Teleport to="body">` dengan transisi animasi halus, proteksi scroll body otomatis, penanganan tombol Escape & klik backdrop, serta varian status badge.

### Lokasi File

* **Component**: `Modal.vue`

### Fitur Desain & Styling:
* **Tailwind CSS Utility Classes**: Desain modal card modern (`rounded-2xl sm:rounded-3xl`, `border border-slate-200/80 dark:border-slate-800`, `bg-white dark:bg-slate-900`, `shadow-2xl`) dan backdrop blur (`bg-slate-900/60 backdrop-blur-xs`).
* **Google Material Symbols**: Badge ikon status dinamis (`delete_forever`, `warning`, `check_circle`, `info`, `help`, `close`) dengan warna badge yang serasi.
* **Single Synchronized Transition**: Transisi halus terkoordinasi antara backdrop dan card tanpa lag atau desinkronisasi.
* **Focus Trap (WCAG 2.1 AA)**: Menjebak siklus fokus keyboard (`Tab` / `Shift+Tab`) di dalam modal saat aktif dan mengembalikan fokus ke elemen pemanggil saat ditutup.
* **Aria Accessibility**: Dukungan penuh `role="dialog"`, `aria-modal="true"`, serta generator `aria-labelledby` otomatis yang terhubung ke ID judul modal.
* **Nested Modal Scroll Lock**: Penghitungan modal tumpuk modular sehingga scroll lock body tidak terlepas prematur saat salah satu sub-modal ditutup.
* **Position & Drawer Mode**: Mendukung posisi `'center'`, `'top'`, `'bottom'` (mobile bottom sheet), `'left'` (drawer kiri), dan `'right'` (drawer kanan).
* **Variant Accent Bar**: Garis aksen visual di bagian atas modal sesuai status variant (`danger`, `warning`, `success`, `info`, `confirm`).
* **Responsive Flex Body**: Body dialog elastis (`flex-1 min-h-0 overflow-y-auto`) tanpa batasan tinggi hardcode.
* **v-model Support**: Mendukung `v-model="isOpen"`, `v-model:show="isOpen"`, atau prop `:show="isOpen"`.

### Component Props API (`<Modal />`)

| Prop | Tipe Data | Default | Deskripsi / Pilihan Nilai |
| :--- | :--- | :--- | :--- |
| `v-model` / `show` | `Boolean` | `false` | Kontrol status buka/tutup modal secara reaktif |
| `title` | `String` | `''` | Judul modal pada area header |
| `context` | `String` | `''` | Teks eyebrow / kategori di atas judul (contoh: `'Tindakan Berisiko'`, `'Katalog Produk'`) |
| `variant` | `String` | `'default'` | Varian status visual: `'default'`, `'danger'`, `'warning'`, `'success'`, `'info'`, `'confirm'` |
| `icon` | `String` | `''` | Nama Google Material Icon kustom untuk menggantikan ikon bawaan varian |
| `maxWidth` | `String` | `'md'` | Lebar modal: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`, `'4xl'`, `'5xl'`, `'full'` |
| `position` | `String` | `'center'` | Posisi/mode tampilan: `'center'`, `'top'`, `'bottom'` (sheet), `'left'` (drawer), `'right'` (drawer) |
| `persistent` | `Boolean` | `false` | Mencegah modal tertutup saat user mengklik backdrop atau menekan tombol `Escape` |
| `loading` | `Boolean` | `false` | Menampilkan spinner loading pada tombol konfirmasi dan mengunci seluruh aksi penutupan modal |
| `confirmText` | `String` | `''` *(otomatis)*| Label teks tombol konfirmasi (default cerdas: `'Hapus'` untuk danger, `'Lanjutkan'` untuk warning, `'Simpan'` untuk lainnya) |
| `cancelText` | `String` | `'Batal'` | Label teks pada tombol pembatalan |
| `showConfirm` | `Boolean` | `true` | Menampilkan atau menyembunyikan tombol konfirmasi |
| `showCancel` | `Boolean` | `true` | Menampilkan atau menyembunyikan tombol batal |
| `showClose` | `Boolean` | `true` | Menampilkan atau menyembunyikan tombol silang `(X)` di sudut header |
| `showFooter` | `Boolean` | `true` | Menampilkan atau menyembunyikan kontainer footer tombol aksi |
| `bodyClass` | `String` | `''` | Kelas CSS tambahan untuk styling kustom area body modal |

### Slots API (`<Modal />`)

| Slot Name | Props Slot | Deskripsi |
| :--- | :--- | :--- |
| `default` | — | Konten utama modal (form, tabel ringkasan, teks deskripsi) |
| `header` | — | Kustomisasi penuh area judul header modal |
| `footer` | — | Kustomisasi tombol-tombol aksi pada footer modal |

### Events API (`<Modal />`)

| Event Name | Deskripsi |
| :--- | :--- |
| `@update:modelValue` | Dipicu saat modal dibuka atau ditutup melalui `v-model` |
| `@close` | Dipicu saat tombol Batal, tombol silang (X), backdrop, atau tombol Escape diklik |
| `@confirm` | Dipicu saat tombol konfirmasi utama diklik |

### Component Expose API (`defineExpose`)

Melalui template ref (misal: `<Modal ref="modalRef" />`), komponen induk dapat mengakses method dan status modal:

| Property / Method | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `close()` | `Function()` | Menutup modal secara programatik (menghormati status `loading`) |
| `isOpen` | `ComputedRef<Boolean>` | Status boolean reaktif apakah modal saat ini sedang terbuka |

### Contoh Penggunaan Modal

#### 1. Modal Konfirmasi Hapus (Danger Variant)
```vue
<script setup>
import { ref } from 'vue';
import Modal from '@/Components/Pack/Modal.vue';

const showDeleteModal = ref(false);
const isDeleting = ref(false);

const handleDelete = () => {
  isDeleting.value = true;
  setTimeout(() => {
    isDeleting.value = false;
    showDeleteModal.value = false;
  }, 1000);
};
</script>

<template>
  <button @click="showDeleteModal = true">Hapus Data</button>

  <Modal
    v-model="showDeleteModal"
    variant="danger"
    title="Hapus Pengguna"
    context="Tindakan Permanen"
    confirm-text="Ya, Hapus Sekarang"
    cancel-text="Batalkan"
    :loading="isDeleting"
    @confirm="handleDelete"
  >
    <p>Apakah Anda yakin ingin menghapus data pengguna ini secara permanen?</p>
  </Modal>
</template>
```

#### 2. Modal Form Input (Lebar Kustom & Slot Default)
```vue
<script setup>
import { ref } from 'vue';
import Modal from '@/Components/Pack/Modal.vue';

const showForm = ref(false);
const formData = ref({ name: '', email: '' });

const submitForm = () => {
  // Simpan data...
  showForm.value = false;
};
</script>

<template>
  <button @click="showForm = true">+ Tambah Merchant</button>

  <Modal
    v-model="showForm"
    title="Registrasi Merchant Baru"
    context="Manajemen Akun"
    max-width="lg"
    confirm-text="Simpan Merchant"
    @confirm="submitForm"
  >
    <form @submit.prevent="submitForm" class="space-y-3">
      <div>
        <label class="block text-xs font-semibold mb-1">Nama Perusahaan</label>
        <input v-model="formData.name" type="text" class="w-full px-3 py-2 text-xs border rounded-xl" />
      </div>
      <div>
        <label class="block text-xs font-semibold mb-1">Email Kontak</label>
        <input v-model="formData.email" type="email" class="w-full px-3 py-2 text-xs border rounded-xl" />
      </div>
    </form>
  </Modal>
</template>
```

#### 3. Side Drawer / Panel Samping (`position="right"`)
```vue
<template>
  <Modal
    v-model="showFilterDrawer"
    position="right"
    max-width="md"
    title="Filter Lanjutan"
    context="Pencarian Data"
    confirm-text="Terapkan Filter"
    @confirm="applyFilters"
  >
    <!-- Konten form filter atau detail panel -->
    <div class="space-y-4">
      <p>Panel meluncur mulus dari sisi kanan layar sebagai drawer/sheet.</p>
    </div>
  </Modal>
</template>
```

#### 4. Nested Modal (Modal Bersarang & Ref Control)
Komponen `Modal.vue` dilengkapi pelacak modal aktif modular (`activeModalsCount`). Ketika sub-modal kedua dibuka dari dalam modal utama, scroll lock pada elemen body tetap terjaga utuh dan baru dilepas saat seluruh modal telah tertutup:

```vue
<script setup>
import { ref } from 'vue';
import Modal from '@/Components/Pack/Modal.vue';

const mainModalRef = ref(null);
const showMainModal = ref(false);
const showConfirmSubModal = ref(false);

const handleCloseAll = () => {
  showConfirmSubModal.value = false;
  // Menutup modal utama secara programatik via template ref
  mainModalRef.value?.close();
};
</script>

<template>
  <button @click="showMainModal = true">Buka Form Transaksi</button>

  <!-- Modal Utama (Tingkat 1) -->
  <Modal
    ref="mainModalRef"
    v-model="showMainModal"
    title="Form Pembayaran Batch"
    max-width="2xl"
    confirm-text="Proses Batch"
    @confirm="showConfirmSubModal = true"
  >
    <p>Daftar transaksi yang akan diproses...</p>

    <!-- Sub-Modal Konfirmasi (Tingkat 2) -->
    <Modal
      v-model="showConfirmSubModal"
      variant="warning"
      title="Konfirmasi Eksekusi Batch"
      confirm-text="Ya, Eksekusi Sekarang"
      @confirm="handleCloseAll"
    >
      <p>Apakah Anda yakin ingin memproses 25 pembayaran ini sekaligus?</p>
    </Modal>
  </Modal>
</template>
```

---