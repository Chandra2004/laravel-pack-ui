# Modal Component

Komponen dialog *overlay* aksesibel berbasis Vue 3 dan Tailwind CSS untuk menampilkan konten prioritas tinggi, formulir terisolasi, dialog konfirmasi tindakan, serta panel laci (*off-canvas drawer*) dengan penguncian scroll latar belakang dan *focus trapping* WAI-ARIA otomatis.

---

## 01. Overview

`Modal` dirancang untuk mengisolasi perhatian pengguna pada alur kerja krusial tanpa meninggalkan halaman saat ini:

- **Aksesibilitas WAI-ARIA Penuh**: Mengimplementasikan `role="dialog"`, `aria-modal="true"`, *focus trapping* dengan siklus tabulasi terkunci, serta pemulihan fokus kursor ke elemen pemanggil saat dialog ditutup.
- **Penguncian Scroll Cerdas**: Mengunci gulir dokumen `body` saat modal terbuka dan mengelola tumpukan modal bertingkat (*nested modal count*) secara aman.
- **Ragam Varian Semantik**: Menyediakan tema semantik `default`, `danger`, `warning`, `success`, `info`, dan `confirm` dengan ikon penjelas visual.
- **Fleksibilitas Penempatan & Skala Ukuran**: Mendukung 10 skala lebar (dari `xs` hingga `full`) serta 5 titik penempatan (*center*, *top*, *bottom*, *left*, *right*).
- **Penanganan Aksi Asinkron**: Terintegrasi langsung dengan status `loading` pada tombol konfirmasi untuk mencegah submit ganda.

### 1.1 Apa Entitas Ini

**Vue Component** (Single File Component) yang berlokasi di [Modal.vue](file:///c:/SPEED/LARAVEL-PACK-UI/resources/js/Components/Pack/Modal.vue). Komponen ini merender dialog menggunakan Teleport ke elemen `body`, lengkap dengan backdrop blur, animasi transisi scale/opacity, serta tombol kontrol header dan footer.

### 1.2 Fungsi Utama

- Menghentikan sementara interaksi halaman induk untuk memfokuskan pengguna pada tindakan konfirmasi atau input data mendesak.
- Menyediakan slot fleksibel `#header`, `#default`, dan `#footer` untuk kustomisasi antarmuka formulir bertingkat.
- Mencegah penutupan tidak sengaja melalui prop `persistent` saat pengguna mengisi formulir penting.
- Mendukung mode drawer samping (*off-canvas panel*) dengan mengubah prop `position="right"` atau `position="left"`.

### 1.3 Kapan Digunakan

- Dialog konfirmasi aksi destruktif (misal: penghapusan akun, pembatalan pesanan, pemusnahan basis data).
- Formulir pembuatan atau pengeditan data cepat tanpa berpindah rute halaman (*in-place CRUD forms*).
- Alur kerja bertingkat (*multi-step wizard / onboarding modal*).
- Panel inspeksi detail dokumen, rincian faktur transaksi, atau jejak audit log.
- Penampil media dan pratinjau dokumen berukuran besar.

### 1.4 Karakteristik Penting

- **Teleport ke Root Body**: Menghilangkan masalah *z-index stacking context* atau pemotongan kontainer `overflow-hidden` dari elemen induk.
- **Dukungan Dua Arah**: Sinkronisasi status terbuka/tertutup melalui `v-model` maupun prop `show`.
- **Keyboard Friendly**: Tombol `Escape` otomatis menutup modal kecuali prop `persistent` diaktifkan.
- **Pembersihan Bersih**: Mengembalikan overflow dokumen ke kondisi normal saat komponen di-*unmount*.

---

## 02. Preview

> [!TIP]
> Pengujian visual dan showcase interaktif entitas ini tersedia secara native pada portal pratinjau aplikasi:
>
> <a href="http://localhost:8000/preview/modal" target="_self" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 8px; background-color: var(--vp-c-brand-1, #4f46e5); color: #ffffff;">Buka Live Preview Komponen Modal &rarr;</a>

---

## 03. Usage

### Pohon Konsep Penggunaan

```text
Modal
├── Alur Konfirmasi Standar
│   ├── Konfirmasi Sederhana (title, confirmText, cancelText)
│   └── Konfirmasi Destruktif (variant="danger")
├── Formulir di Dalam Modal
│   ├── Form CRUD Ringkas (InputField di slot #default)
│   └── Form Bertahap (Multi-step Wizard)
└── Panel Off-Canvas
    ├── Drawer Kanan (position="right")
    └── Panel Bawah Ponsel (position="bottom")
```

### Sintaks Dasar Single File Component

```vue
<script setup>
import { ref } from 'vue';
import Modal from '@/Components/Pack/Modal.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const isOpen = ref(false);
const isSubmitting = ref(false);

function handleConfirm() {
    isSubmitting.value = true;
    setTimeout(() => {
        isSubmitting.value = false;
        isOpen.value = false;
    }, 1000);
}
</script>

<template>
    <ButtonSubmit variant="primary" @click="isOpen = true">
        Buka Dialog Modal
    </ButtonSubmit>

    <Modal
        v-model="isOpen"
        title="Konfirmasi Perubahan Data"
        context="Pastikan seluruh informasi akun telah diverifikasi sebelum disimpan."
        icon="verified_user"
        max-width="md"
        confirm-text="Simpan Data"
        cancel-text="Batalkan"
        :loading="isSubmitting"
        @confirm="handleConfirm"
    >
        <p class="text-xs text-slate-600 dark:text-slate-400">
            Perubahan yang Anda simpan akan segera diterapkan pada seluruh sistem operasional.
        </p>
    </Modal>
</template>
```

---

## 04. Anatomy

Struktur elemen arsitektur visual `Modal` tersusun dari komponen overlay bertingkat:

```text
+-------------------------------------------------------------------------+
| [1] Backdrop Overlay (bg-slate-900/60 backdrop-blur-xs)                 |
|                                                                         |
|         +-----------------------------------------------------+         |
|         | [2] Dialog Container Card (rounded-2xl shadow-2xl)  |         |
|         | +-------------------------------------------------+ |         |
|         | | [3] Header Bar                                  | |         |
|         | | [*] (Icon)  Judul Modal               [X] Close | |         |
|         | |             Teks Konteks Subjudul               | |         |
|         | +-------------------------------------------------+ |         |
|         | | [4] Modal Body Content (Slot #default)          | |         |
|         | |                                                 | |         |
|         | |   Konten formulir, pesan konfirmasi, atau tabel | |         |
|         | |                                                 | |         |
|         | +-------------------------------------------------+ |         |
|         | | [5] Footer Action Bar (Slot #footer)            | |         |
|         | |                     [Batal]   [Konfirmasi / OK] | |         |
|         | +-------------------------------------------------+ |         |
|         +-----------------------------------------------------+         |
|                                                                         |
+-------------------------------------------------------------------------+
```

### Rincian Bagian Anatomi

1. **Backdrop Overlay**: Lapisan latar belakang gelap tembus pandang (`bg-slate-900/60`) dengan efek blur yang menutupi seluruh viewport jendela.
2. **Dialog Container Card**: Kartu pembungkus konten utama yang menerapkan radius sudut `rounded-2xl`, elevasi bayangan tebal `shadow-2xl`, serta isolasi batas visual yang kontras.
3. **Header Bar**: Berisi ikon semantik berbentuk kotak membulat, judul dialog (`title`), teks konteks pembantu (`context`), serta tombol silang penutup (`showClose`).
4. **Modal Body Content**: Wadah konten utama yang fleksibel dan mendukung *scrolling* vertikal mandiri jika isi konten melebihi tinggi layar.
5. **Footer Action Bar**: Bilah aksi penutup di bagian bawah yang memuat tombol pembatalan dan tombol aksi konfirmasi utama.

---

## 05. Variants

Prop `variant` mengatur skema warna ikon, judul, dan tombol konfirmasi otomatis:

| Varian | Karakter Tampilan | Skenario Penggunaan |
| :--- | :--- | :--- |
| `default` | Aksen biru primer (`text-blue-600 bg-blue-600`) | Formulir pengisian data umum, perubahan preferensi, atau dialog notifikasi standar. |
| `danger` | Aksen merah menyala (`text-rose-600 bg-rose-600`) | Aksi berisiko tinggi atau permanen (hapus rekaman, pembatalan langganan, pemusnahan sumber daya). |
| `warning` | Aksen kuning amber (`text-amber-600 bg-amber-600`) | Peringatan dampak operasional sebelum melanjutkan proses transaksi penting. |
| `success` | Aksen hijau emerald (`text-emerald-600 bg-emerald-600`) | Konfirmasi keberhasilan proses berskala besar atau penerimaan hasil akhir. |
| `info` | Aksen biru langit (`text-sky-600 bg-sky-600`) | Penyampaian informasi penting, syarat & ketentuan baru, atau panduan tutorial. |
| `confirm` | Aksen indigo modern (`text-indigo-600 bg-indigo-600`) | Dialog persetujuan alur kerja (persetujuan dokumen kontrak, checkout pesanan). |

---

## 06. Sizes

### Skala Lebar Kontainer (`maxWidth`)

- **`xs`**: Lebar `max-w-xs` (320px), ideal untuk dialog konfirmasi yes/no ringkas.
- **`sm`**: Lebar `max-w-sm` (384px), cocok untuk dialog prompt 1 input.
- **`md`**: Lebar `max-w-md` (448px), **Default**. Ukuran standar untuk formulir konfirmasi akun.
- **`lg`**: Lebar `max-w-lg` (512px), ideal untuk formulir entri data berukuran sedang.
- **`xl`**: Lebar `max-w-xl` (576px), cocok untuk formulir dengan kisi 2 kolom.
- **`2xl`**: Lebar `max-w-2xl` (672px), cocok untuk multi-step wizard.
- **`3xl` / `4xl` / `5xl`**: Lebar hingga 1024px, untuk tabel pratinjau data berskala besar.
- **`full`**: Lebar penuh layar dengan margin adaptif.

### Posisi Penempatan (`position`)

- **`center`**: Posisi default di tengah layar viewport.
- **`top`**: Muncul menempel di bagian atas layar.
- **`bottom`**: Muncul dari bagian bawah layar (sangat cocok untuk mobile action sheet).
- **`left`**: Panel drawer samping kiri.
- **`right`**: Panel drawer samping kanan untuk inspeksi detail data atau filter kompleks.

---

## 07. States

| State | Indikasi Visual | Perilaku Interaktif |
| :--- | :--- | :--- |
| **Open / Visible** | Backdrop muncul dengan animasi fade-in, kontainer dialog membesar halus dari skala 95% ke 100%. | Kursor pengguna difokuskan otomatis ke elemen pertama di dalam modal; scroll layar belakang dikunci. |
| **Closed** | Kontainer dialog mengecil dan memudar, backdrop menghilang. | Scroll dokumen dipulihkan; fokus kursor dikembalikan ke elemen pemicu. |
| **Loading** | Tombol konfirmasi menampilkan spinner berputar dan terkunci. | Seluruh tombol aksi dinonaktifkan sementara untuk mencegah submit berulang; tombol Escape diabaikan. |
| **Persistent** | Tidak ada perbedaan visual khusus saat idle. | Mengklik area backdrop luar tidak akan menutup modal, melindungi pengguna dari kehilangan data form. |

---

## 08. Props / Attributes

| Nama Prop | Tipe Data | Nilai Bawaan | Opsi / Rentang | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `modelValue` | `Boolean` | `false` | `true`, `false` | Status visibilitas modal untuk pengikatan dua arah (`v-model`). |
| `show` | `Boolean` | `false` | `true`, `false` | Alias kontrol visibilitas eksplisit. |
| `title` | `String` | `''` | Teks judul | Judul utama yang ditampilkan pada bilah header. |
| `context` | `String` | `''` | Teks keterangan | Deskripsi atau konteks pembantu di bawah judul. |
| `icon` | `String` | `''` | Nama icon Material | Ikon yang ditampilkan di samping judul dialog. |
| `maxWidth` | `String` | `'md'` | `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`, `full` | Batas lebar maksimum kontainer kartu dialog. |
| `position` | `String` | `'center'` | `center`, `top`, `bottom`, `left`, `right` | Titik penempatan dan animasi jangkar modal. |
| `persistent` | `Boolean` | `false` | `true`, `false` | Mencegah penutupan saat backdrop diklik atau tombol Esc ditekan. |
| `variant` | `String` | `'default'` | `default`, `danger`, `warning`, `success`, `info`, `confirm` | Skema warna semantik dan tombol aksi. |
| `confirmText` | `String` | `''` | Teks bebas | Label tombol konfirmasi (jika kosong, disesuaikan dengan varian). |
| `cancelText` | `String` | `'Batal'` | Teks bebas | Label tombol pembatalan. |
| `showConfirm` | `Boolean` | `true` | `true`, `false` | Menampilkan atau menyembunyikan tombol konfirmasi. |
| `showCancel` | `Boolean` | `true` | `true`, `false` | Menampilkan atau menyembunyikan tombol pembatalan. |
| `showClose` | `Boolean` | `true` | `true`, `false` | Menampilkan tombol silang (*close button*) di sudut kanan atas. |
| `showFooter` | `Boolean` | `true` | `true`, `false` | Menampilkan atau menyembunyikan seluruh bilah footer aksi. |
| `loading` | `Boolean` | `false` | `true`, `false` | Mengaktifkan status pemuatan asinkron pada tombol aksi. |
| `bodyClass` | `String` | `''` | Class Tailwind | Kelas CSS tambahan untuk kontainer badan modal. |

---

## 09. Slots

| Nama Slot | Properti yang Disediakan (Scope Props) | Deskripsi Penggunaan |
| :--- | :--- | :--- |
| `#default` | — | Konten utama badan formulir atau teks pesan dialog. |
| `#header` | `{ title, context, icon, close }` | Mengambil alih tampilan bilah judul modal secara menyeluruh dengan akses ke properti header dan fungsi penutup. |
| `#footer` | `{ close, confirm, loading, confirmText, cancelText }` | Mengambil alih susunan tombol aksi penutup dan konfirmasi di bagian bawah dengan kontrol handler. |
| `#trigger` | `{ open }` | Elemen pemicu deklaratif di luar modal yang otomatis menyediakan fungsi `open` saat diklik. |

---

## 10. Events / Interactions

| Nama Event | Parameter Emitted | Waktu Pemicuan (Trigger Lifecycle) |
| :--- | :--- | :--- |
| `@update:modelValue` | `(value: Boolean)` | Dipancarkan saat status visibilitas modal berubah. |
| `@update:show` | `(value: Boolean)` | Dipancarkan secara sinkron dengan pembaruan status visibilitas. |
| `@close` | — | Dipancarkan saat modal ditutup melalui tombol close, batal, backdrop, atau tombol Escape. |
| `@confirm` | — | Dipancarkan saat tombol konfirmasi utama ditekan oleh pengguna. |

### 10.1 Exposed Methods (Template Ref)

Komponen mengekspos API publik melalui `defineExpose` untuk kontrol interaktif via `ref`:

| Nama Method / Property | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `open()` | `Function: () => void` | Membuka modal secara langsung tanpa harus memodifikasi variabel state manual. |
| `close()` | `Function: () => void` | Menutup modal dan memicu siklus pembersihan fokus serta pengembalian scroll body. |
| `isOpen` | `ComputedRef<Boolean>` | Properti reaktif untuk memeriksa apakah modal sedang terbuka atau tertutup. |

---

## 11. Code Example

Contoh implementasi dialog penghapusan data permanen dengan proteksi teks konfirmasi:

```vue
<script setup>
import { ref } from 'vue';
import Modal from '@/Components/Pack/Modal.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';
import InputField from '@/Components/Pack/InputField.vue';

const isDeleteModalOpen = ref(false);
const isDeleting = ref(false);
const confirmationInput = ref('');

function executeDelete() {
    if (confirmationInput.value !== 'HAPUS') return;

    isDeleting.value = true;
    setTimeout(() => {
        isDeleting.value = false;
        isDeleteModalOpen.value = false;
        confirmationInput.value = '';
        alert('Server instance berhasil dimusnahkan.');
    }, 1200);
}
</script>

<template>
    <ButtonSubmit variant="danger" icon="delete" @click="isDeleteModalOpen = true">
        Hapus Server Instance
    </ButtonSubmit>

    <Modal
        v-model="isDeleteModalOpen"
        title="Konfirmasi Pemusnahan Server"
        context="Tindakan ini tidak dapat dibatalkan dan seluruh snapshot akan dihapus."
        icon="delete_forever"
        variant="danger"
        max-width="md"
        confirm-text="Musnahkan Sekarang"
        :loading="isDeleting"
        @confirm="executeDelete"
    >
        <div class="space-y-3 py-2 text-xs text-slate-700 dark:text-slate-300">
            <p>Ketik <strong>HAPUS</strong> pada kolom di bawah untuk memverifikasi tindakan Anda:</p>
            <InputField
                v-model="confirmationInput"
                placeholder="HAPUS"
                size="sm"
                color="danger"
            />
        </div>
    </Modal>
</template>
```

---

## 12. Result / Behavior

1. **Perilaku Transisi Lembut**: Saat modal diaktifkan, elemen backdrop memudar dengan efek blur halus, sementara kartu dialog membesar sedikit dari skala 0.95 ke 1.0 dengan transisi yang nyaman di mata.
2. **Manajemen Scroll Dokumen**: Mengakses `document.body.style.overflow = 'hidden'` untuk mencegah pengguna menggulir halaman latar belakang saat modal aktif. Jika terdapat modal bertingkat, scroll hanya akan dipulihkan setelah modal terakhir ditutup.
3. **Focus Trapping Aksesibel**: Menjaga navigasi tombol keyboard `Tab` tetap berputar di dalam elemen-elemen interaktif modal, mencegah fokus melompat ke elemen di balik overlay gelap.
4. **Pemulihan Kursor Presisi**: Saat modal ditutup, fokus kursor secara otomatis dikembalikan ke tombol atau elemen yang awalnya membuka modal tersebut.

---

## 13. Customization

### Mengubah Modal Menjadi Drawer Samping (Off-Canvas Right)

Cukup ubah prop `position="right"` dan sesuaikan `maxWidth`:

```vue
<template>
    <Modal
        v-model="isDrawerOpen"
        title="Detail Audit Log Transaksi"
        position="right"
        max-width="lg"
        :show-confirm="false"
        cancel-text="Tutup Panel"
    >
        <div class="space-y-3 py-2 text-xs">
            <p>Menampilkan metadata lengkap jejak audit keamanan sistem.</p>
        </div>
    </Modal>
</template>
```

### Kustomisasi Penuh Bilah Header & Footer

```vue
<script setup>
import { ref } from 'vue';
import Modal from '@/Components/Pack/Modal.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const isOpen = ref(false);
</script>

<template>
    <ButtonSubmit variant="secondary" @click="isOpen = true">Buka Modal Kustom</ButtonSubmit>

    <Modal v-model="isOpen">
        <template #header="{ close }">
            <div class="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <h3 class="font-bold text-sm">Header Khusus Saya</h3>
                <ButtonSubmit variant="secondary" size="xs" icon="close" @click="close">
                    Tutup
                </ButtonSubmit>
            </div>
        </template>

        <p class="p-4 text-xs">Isi konten kustom...</p>

        <template #footer="{ close }">
            <div class="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <ButtonSubmit variant="primary" size="sm" @click="close">
                    Selesai
                </ButtonSubmit>
            </div>
        </template>
    </Modal>
</template>
```

---

## 14. Accessibility

- **WAI-ARIA Dialog Design Pattern**: Elemen root menerapkan `role="dialog"` dan `aria-modal="true"` dengan relasi label `aria-labelledby`.
- **Keyboard Navigation**: Tombol `Escape` secara otomatis memicu penutupan dialog kecuali prop `persistent` bernilai `true`.
- **Focus Trap Implementation**: Menghalangi fokus melompat ke elemen halaman latar belakang yang sedang tertutup overlay.
- **Ukuran Target Sentuh**: Tombol silang penutup dan tombol footer memiliki luas area sentuh minimal 36x36 piksel.

---

## 15. Responsive Behavior

- **Mobile Viewport (< 640px)**: Modal otomatis menyesuaikan lebarnya menjadi `w-[calc(100%-2rem)]` dengan margin horizontal aman. Pada varian `position="bottom"`, modal menempel ke dasar layar seperti *native mobile sheet*.
- **Desktop Viewport (>= 640px)**: Modal mengadopsi ukuran proporsional sesuai nilai `maxWidth` dan diposisikan tepat di pusat layar (*centered layout*).

---

## 16. Do / Don't

| Do (Praktik Direkomendasikan) | Don't (Praktik Dihindari) |
| :--- | :--- |
| **Gunakan `variant="danger"` untuk aksi berisiko tinggi**: Berikan sinyal visual tegas saat pengguna akan menghapus data permanen. | **Jangan menumpuk modal lebih dari 2 lapis**: Membuka modal di atas modal secara berlebihan membingungkan navigasi pengguna. |
| **Aktifkan `persistent` pada formulir panjang**: Mencegah hilangnya data ketikan pengguna akibat klik tidak sengaja pada area backdrop. | **Jangan menghilangkan tombol close jika tidak ada tombol pembatalan**: Pastikan selalu ada jalan keluar yang jelas bagi pengguna. |
| **Gunakan status `loading` saat proses asinkron**: Kunci interaksi tombol untuk mencegah pengiriman permintaan berulang kali ke server. | **Jangan memasukkan halaman web lengkap ke dalam modal**: Modal ditujukan untuk alur tugas terfokus, bukan wadah layout halaman utama. |

---

## 17. Examples / Recipes

### Recipe 1: Konfirmasi Penghapusan Data Destruktif

```vue
<script setup>
import { ref } from 'vue';
import Modal from '@/Components/Pack/Modal.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const isOpen = ref(false);
const isDeleting = ref(false);

function deleteAccount() {
    isDeleting.value = true;
    setTimeout(() => {
        isDeleting.value = false;
        isOpen.value = false;
    }, 1000);
}
</script>

<template>
    <ButtonSubmit variant="danger" size="sm" icon="delete" @click="isOpen = true">
        Hapus Akun
    </ButtonSubmit>

    <Modal
        v-model="isOpen"
        title="Hapus Akun Pengguna"
        context="Data profil dan lisensi Anda akan segera dinonaktifkan."
        icon="warning"
        variant="danger"
        confirm-text="Ya, Hapus Akun"
        :loading="isDeleting"
        @confirm="deleteAccount"
    >
        <p class="text-xs text-slate-600 dark:text-slate-400">
            Apakah Anda yakin ingin menghapus akun ini secara permanen?
        </p>
    </Modal>
</template>
```

### Recipe 2: Drawer Detail Audit Log Samping

```vue
<script setup>
import { ref } from 'vue';
import Modal from '@/Components/Pack/Modal.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const isDrawerOpen = ref(false);
</script>

<template>
    <ButtonSubmit variant="secondary" size="sm" icon="dock_to_right" @click="isDrawerOpen = true">
        Lihat Jejak Audit
    </ButtonSubmit>

    <Modal
        v-model="isDrawerOpen"
        title="Jejak Audit Aktivitas"
        position="right"
        max-width="lg"
        :show-confirm="false"
        cancel-text="Tutup"
    >
        <div class="space-y-2 text-xs">
            <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                <strong>Admin Login:</strong> Sukses dari IP 192.168.1.1
            </div>
        </div>
    </Modal>
</template>
```

---

## 18. Related Components

- [ButtonSubmit](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/button-submit.md): Tombol aksi terintegrasi yang digunakan pada bilah footer modal untuk memicu status loading.
- [InputField](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/input-field.md): Fasad kontrol input yang ideal ditempatkan di dalam badan modal dialog.
- [Badge](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/badge.md): Penanda status yang sering disematkan di samping judul modal.
- [Card](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/card.md): Kontainer tata letak dengan struktur serupa untuk tampilan non-overlay.
- [Alert](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/alert.md): Penampil pesan kontekstual yang dapat disematkan di dalam modal.

---

## 19. Notes / Limitations

- **Teleport Element Target**: Komponen melakukan teleport ke `body`. Pastikan aplikasi berjalan pada peramban yang mendukung Vue 3 Teleport dan elemen `body` telah tersedia di DOM.
- **Scroll Lock Restorasi**: Komponen melacak jumlah modal yang aktif melalui variabel penghitung internal (`activeModalsCount`). Overflow dokumen hanya akan dipulihkan jika seluruh modal bertingkat telah tertutup sempurna.
- **Z-Index Default**: Modal menggunakan nilai `z-50` untuk overlay dan dialog. Pastikan komponen mengambang eksternal lainnya (seperti dropdown atau tooltip) berada di bawah layer `z-50` kecuali jika dipasang di dalam konten modal itu sendiri.