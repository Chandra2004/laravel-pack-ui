# Stepper Component

Komponen penunjuk langkah alur kerja multi-tahap (*multi-step wizard & process tracker*) kelas enterprise berbasis Vue 3 dan Tailwind CSS yang mendukung 9 tipe tampilan (*Classic Circle, Segmented Progress Bar, Multi-Stepper Cards, Capsule Pills, Vertical Timeline, Compact Dots, Floating Bubble, Minimal Underline Tabs, dan Connected Segmented Ribbon*), orientasi horizontal/vertikal, mode sekuensial linear, responsivitas lintas perangkat (desktop, tablet, mobile), serta integrasi tombol aksi dan badge status Pack UI.

---

## 01. Overview

`Stepper` memandu pengguna menelusuri formulir bertahap yang panjang atau memantau status alur kerja bisnis secara visual dan terukur:

- **9 Ragam Tipe Desain Modern**: Mendukung `circle` (bulatan klasik bernomor), `bar` (bilah progres bersegmen ala SaaS), `cards` (panel kartu interaktif), `pills` (kapsul bersambung), `timeline` (linimasa vertikal dengan stempel waktu), `dots` (titik navigasi kompak), `floating` (gelembung melayang elevated dengan ring & status badge), `minimal` (garis bawah aksen underline tabs ala Stripe/Linear), dan `segmented` (ribbon bar blok terpadu dengan sekat pembagi).
- **Tata Letak Responsif Lintas Perangkat**: Dilengkapi kontainer adaptif dan penanganan *smooth horizontal scrolling* di layar ponsel (mobile < 640px) dan tablet sehingga nodus dan teks langkah tidak saling bertumpukan atau terpotong.
- **Integrasi Komponen Pack UI**: Tombol aksi bawaan (`showActions`) secara otomatis menggunakan komponen `ButtonSubmit`, badge status menggunakan `Badge`, dan dapat dipadukan mulus dengan `InputField`.
- **Mode Sekuensial Linear**: Prop `linear="true"` memastikan pengguna menyelesaikan tahapan secara urut dan tertib tanpa melompati langkah validasi penting.
- **Deteksi Langkah Error (`errorSteps`)**: Memberikan indikasi visual merah tegas dengan ikon silang pada langkah yang gagal dalam validasi formulir backend.
- **Fleksibilitas Penempatan Label (`labelPlacement`)**: Mendukung penempatan teks deskripsi langkah di bawah (`bottom`), atas (`top`), kanan (`right`), atau kiri (`left`) relatif terhadap nodus bulatan.

---

## 02. Preview

> [!TIP]
> Pengujian visual dan showcase interaktif entitas ini tersedia secara native pada portal pratinjau aplikasi:
>
> <a href="http://localhost:8000/preview/stepper" target="_self" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 8px; background-color: var(--vp-c-brand-1, #4f46e5); color: #ffffff;">Buka Live Preview Komponen Stepper &rarr;</a>

---

## 03. Usage

### Pohon Konsep Penggunaan

```text
Stepper
├── Mode Wizard Horizontal
│   ├── Bulatan Bernomor Klasik (type="circle", variant="numbered")
│   ├── Segmented Progress Bar (type="bar", color="emerald")
│   ├── Panel Kartu Interaktif (type="cards", showActions)
│   ├── Floating Bubble (type="floating", color="indigo")
│   ├── Minimal Underline Tabs (type="minimal", color="primary")
│   └── Connected Segmented Ribbon (type="segmented", color="purple")
├── Mode Timeline Vertikal
│   ├── Linimasa Histori (type="timeline", orientation="vertical")
│   └── Stempel Waktu Milestone (time="10:00 WIB", icon="check")
└── Kontrol & Validasi Alur
    ├── Sekuensial Ketat (linear="true")
    └── Langkah Error (errorSteps="[1]")
```

### Sintaks Dasar Single File Component

```vue
<script setup>
import { ref } from 'vue';
import Stepper from '@/Components/Pack/Stepper.vue';

const activeStep = ref(0);

const steps = [
    { label: 'Informasi Akun', description: 'Email dan kata sandi', icon: 'person' },
    { label: 'Profil Usaha', description: 'Legalitas NPWP dan NIB', icon: 'domain' },
    { label: 'Metode Pembayaran', description: 'Rekening bank operasional', icon: 'payments' },
    { label: 'Selesai', description: 'Aktivasi akses instan', icon: 'verified_user' },
];

function handleFinish() {
    console.log('Seluruh tahapan wizard berhasil diselesaikan!');
}
</script>

<template>
    <div class="p-6 max-w-4xl mx-auto space-y-6">
        <Stepper
            v-model="activeStep"
            :steps="steps"
            type="floating"
            color="indigo"
            :show-actions="true"
            @finish="handleFinish"
        >
            <template #content="{ step, index }">
                <div class="p-6 mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100">
                        Formulir Tahap {{ index + 1 }}: {{ step.label }}
                    </h4>
                    <p class="text-xs text-slate-500 mt-1">Silakan lengkapi kolom formulir untuk tahapan ini.</p>
                </div>
            </template>
        </Stepper>
    </div>
</template>
```

---

## 04. Anatomy

Struktur arsitektur visual `Stepper` (Mode Horizontal Circle):

```text
+-------------------------------------------------------------------------+
| [1] Title Header: "Aktivasi Akun Merchant"                              |
| [2] Subtitle Description: "Selesaikan 4 tahapan untuk memulai"          |
|                                                                         |
|     ( 1 )====================[ 2 ]--------------------( 3 )             |
|   Completed                Active                     Pending           |
| [3] Done Node         [4] Connector Line         [5] Pending Node       |
|  (Icon Centang)         (Aksen Aktif)              (Warna Netral)       |
|                                                                         |
| "Informasi Akun"       "Profil Usaha"            "Metode Bayar"         |
| [6] Label Teks         [6] Label Teks             [6] Label Teks        |
+-------------------------------------------------------------------------+
| [7] Content Slot: (#content / Formulir Tahap Aktif)                     |
+-------------------------------------------------------------------------+
| [8] Action Bar:  [Sebelumnya]                     [Langkah Berikutnya]  |
+-------------------------------------------------------------------------+
```

---

## 05. Variants (9 Desain Stepper)

Prop `type` mengatur ragam bentuk visual representasi langkah:

| Tipe Tampilan | Karakter Visual | Skenario Penggunaan |
| :--- | :--- | :--- |
| `circle` | Nodus bulatan klasik dengan garis konektor horizontal/vertikal (**Default**) | Alur pendaftaran multi-langkah umum, onboarding pengguna baru. |
| `bar` | Bilah kemajuan bersegmen modern dengan persentase otomatis | Alur kasir checkout e-commerce yang mengutamakan kerapian ruang horizontal. |
| `cards` | Kotak kartu interaktif modular berdampingan dengan badge status | Wizard pemilihan paket langganan atau konfigurasi server cloud. |
| `pills` | Kapsul lonjong bersambung dengan pemisah chevron modern | Dasbor administratif dengan hierarki penelusuran ringkas. |
| `timeline` | Linimasa vertikal dengan nodus ikon dan keterangan waktu | Pelacakan status pengiriman kurir logistik atau riwayat audit trail. |
| `dots` | Titik navigasi minimalis kompak dengan animasi ekspansi aktif | Carousel gambar bertingkat, modal dialog singkat 3-4 langkah. |
| `floating` / `bubble` | Kapsul melayang elevated dengan ring aksen, ikon/angka, dan badge status | Wizard formulir modern dengan tampilan premium di desktop dan mobile. |
| `minimal` | Garis aksen bawah (underline tabs) ala Stripe/Linear dengan nomor monospace `01` | Formulir SaaS profesional, distraction-free checkout wizard. |
| `segmented` | Ribbon blok terpadu menyatu dengan sekat pembagi antar-tahap | Setup wizard panduan pengaturan sistem, konfigurasi awal ERP. |

---

## 06. Sizes & Responsivitas

### Skala Ukuran Nodus (`size`)

- **`sm`**: Diameter nodus `28px`, teks label `11px`. Ideal untuk panel samping atau modal kecil.
- **`md`**: Diameter nodus `36px`, teks label `13px` (**Default**). Ukuran standar formulir dashboard.
- **`lg`**: Diameter nodus `44px`, teks label `15px`. Cocok untuk halaman orientasi pendaftaran lebar.

### Responsivitas Lintas Perangkat

- **Desktop (&ge; 1024px)**: Mode horizontal membentang proporsional memenuhi kontainer secara seimbang.
- **Tablet (640px - 1023px)**: Mode cards menyesuaikan ke 2 kolom, horizontal bar terdistribusi rapi.
- **Mobile (< 640px)**: Dilengkapi kontainer *touch-friendly horizontal scrollbar* sehingga teks dan nodus tidak saling tumpang tindih; mode cards beralih ke 1 kolom vertikal yang nyaman diakses jempol pengguna.

---

## 07. States

| State | Indikasi Visual | Perilaku Interaktif |
| :--- | :--- | :--- |
| **Completed** | Nodus terisi warna aksen pekat dengan ikon centang (`check`); garis konektor setelahnya menyala. | Dapat diklik untuk meninjau kembali data langkah sebelumnya. |
| **Active** | Nodus memiliki ring fokus tebal atau latar menyala dengan angka tebal; teks label kontras. | Menandai posisi langkah yang sedang dikerjakan pengguna saat ini. |
| **Pending** | Nodus berwarna abu-abu netral dengan angka pudar; garis konektor berwarna abu-abu redup. | Tidak dapat diakses jika mode `linear="true"` aktif. |
| **Error** | Nodus berubah menjadi merah menyala dengan ikon silang (`close`); label teks beraksen bahaya. | Menandakan data pada tahapan ini gagal dalam validasi server. |
| **Disabled** | Seluruh nodus memudar dengan opasitas 40%; kursor berbentuk tanda dilarang (*not-allowed*). | Langkah terkunci dan tidak dapat dipilih oleh pengguna. |

---

## 08. Props / Attributes

| Nama Prop | Tipe Data | Nilai Bawaan | Opsi / Rentang | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `modelValue` | `Number` | `0` | Integer &ge; 0 | Indeks numerik langkah yang sedang aktif saat ini (`v-model`, 0-indexed). |
| `steps` | `Array` | `[]` | Array of objects / strings | Daftar data langkah yang akan dirender oleh komponen. |
| `title` | `String` | `''` | Teks bebas | Judul utama alur proses di level header komponen. |
| `description` | `String` | `''` | Teks bebas | Keterangan deskripsi alur proses di level header komponen. |
| `type` | `String` | `'circle'` | `'circle'`, `'bar'`, `'cards'`, `'pills'`, `'timeline'`, `'dots'`, `'floating'`, `'minimal'`, `'segmented'` | 9 ragam tipe visual komponen stepper modern. |
| `orientation` | `String` | `'horizontal'` | `'horizontal'`, `'vertical'` | Arah orientasi tata letak penyusunan langkah. |
| `variant` | `String` | `'numbered'` | `'numbered'`, `'icon'`, `'dot'` | Gaya visual representasi nodus bulatan. |
| `labelPlacement` | `String` | `''` | `''`, `'bottom'`, `'top'`, `'right'`, `'left'` | Penempatan teks label relatif terhadap nodus bulatan. |
| `color` | `String` | `'primary'` | `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'` | Palet aksen warna semantik langkah aktif dan selesai. |
| `stepperStyle` | `String` | `'solid'` | `'solid'`, `'soft'`, `'outline'` | Gaya visual pewarnaan nodus bulatan. |
| `radius` | `String` | `'full'` | `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'full'` | Kelengkungan sudut elemen nodus dan panel kartu. |
| `size` | `String` | `'md'` | `'sm'`, `'md'`, `'lg'` | Skala ukuran nodus bulatan dan tipografi label. |
| `linear` | `Boolean` | `false` | `true`, `false` | Mengharuskan pengguna menyelesaikan langkah secara berurutan. |
| `clickable` | `Boolean` | `true` | `true`, `false` | Mengizinkan klik langsung pada nodus untuk navigasi langkah. |
| `showDescription` | `Boolean` | `true` | `true`, `false` | Menampilkan atau menyembunyikan teks deskripsi subjudul langkah. |
| `showLabels` | `Boolean` | `true` | `true`, `false` | Menampilkan atau menyembunyikan label teks utama langkah. |
| `loading` | `Boolean` | `false` | `true`, `false` | State pemuatan animasi skeleton placeholder. |
| `skeletonCount` | `Number` | `4` | Integer &gt; 0 | Jumlah placeholder skeleton saat data steps kosong saat loading. |
| `completedIcon` | `String` | `'check'` | Nama Material Symbols | Ikon penanda langkah yang telah tuntas. |
| `errorIcon` | `String` | `'close'` | Nama Material Symbols | Ikon penanda langkah yang memiliki status error. |
| `errorSteps` | `Array` | `[]` | Array of step indexes (misal `[1]`) | Indeks langkah-langkah yang memiliki status validasi error. |
| `showActions` | `Boolean` | `false` | `true`, `false` | Menampilkan bilah tombol navigasi bawah (ButtonSubmit). |
| `prevText` | `String` | `'Sebelumnya'` | Teks bebas | Label teks untuk tombol navigasi mundur. |
| `nextText` | `String` | `'Langkah Berikutnya'` | Teks bebas | Label teks untuk tombol navigasi maju. |
| `finishText` | `String` | `'Selesai'` | Teks bebas | Label teks untuk tombol selesai pada langkah terakhir. |

---

## 09. Slots

| Nama Slot | Properti yang Disediakan | Deskripsi Penggunaan |
| :--- | :--- | :--- |
| `#header` | — | Kustomisasi header judul, deskripsi, dan counter badge di bagian atas. |
| `#label` | `{ step, index, status }` | Kustomisasi tampilan teks label dan deskripsi langkah individual. |
| `#content` | `{ step, index }` | Wadah formulir yang dirender sesuai langkah aktif saat ini. |
| `#actions` | `{ currentStep, isFirst, isLast, next, prev, goTo }` | Mengambil alih susunan tombol aksi navigasi bawah. |

---

## 10. Events / Interactions

| Nama Event | Parameter Emitted | Waktu Pemicuan (Trigger Lifecycle) |
| :--- | :--- | :--- |
| `@update:modelValue` | `(stepIndex: Number)` | Dipancarkan saat indeks langkah aktif berpindah (v-model). |
| `@step-click` | `(stepIndex: Number)` | Dipancarkan saat pengguna mengklik salah satu nodus langkah secara langsung. |
| `@finish` | `(stepIndex: Number)` | Dipancarkan saat tombol selesai pada tahapan paling akhir diklik. |

---

## 11. Code Example

Contoh implementasi pendaftaran badan usaha (KYC) dengan validasi sekuensial linear:

```vue
<script setup>
import { ref } from 'vue';
import Stepper from '@/Components/Pack/Stepper.vue';

const currentStep = ref(0);

const kycSteps = [
    { label: 'Akun Login', description: 'Email korporat', icon: 'email' },
    { label: 'Badan Hukum', description: 'Unggah SIUP & NPWP', icon: 'business' },
    { label: 'Direktur Utama', description: 'KTP & Surat Kuasa', icon: 'person' },
    { label: 'Konfirmasi', description: 'Verifikasi akhir', icon: 'fact_check' },
];

function submitKyc() {
    alert('Dokumen legalitas berhasil dikirim untuk proses verifikasi tim kepatuhan.');
}
</script>

<template>
    <div class="max-w-3xl mx-auto p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-6">
        <Stepper
            v-model="currentStep"
            :steps="kycSteps"
            type="pills"
            color="emerald"
            :linear="true"
            :show-actions="true"
            finish-text="Ajukan Verifikasi"
            @finish="submitKyc"
        >
            <template #content="{ index }">
                <div class="py-6">
                    <div v-if="index === 0" class="space-y-3">
                        <label class="block text-xs font-semibold">Email Perusahaan</label>
                        <input type="email" placeholder="legal@perusahaan.co.id" class="w-full px-3 py-2 text-xs rounded-xl border" />
                    </div>
                    <div v-else-if="index === 1" class="space-y-3">
                        <label class="block text-xs font-semibold">Nomor Pokok Wajib Pajak (NPWP)</label>
                        <input type="text" placeholder="01.234.567.8-000.000" class="w-full px-3 py-2 text-xs rounded-xl border" />
                    </div>
                    <div v-else class="text-xs text-slate-500">
                        Lengkapi tahapan formulir yang sedang berlangsung.
                    </div>
                </div>
            </template>
        </Stepper>
    </div>
</template>
```

---

## 12. Result / Behavior

1. **Sinkronisasi Garis Konektor Otomatis**: Panjang garis konektor antar-nodus terisi warna aksen semantik secara proporsional sesuai langkah yang telah dituntaskan oleh pengguna.
2. **Penanganan Langkah Terakhir Cerdas**: Pada langkah terakhir (`index === steps.length - 1`), tombol navigasi kanan secara otomatis berganti dari `nextText` menjadi `finishText` dan mengaktifkan event `@finish`.
3. **Proteksi Mode Linear**: Jika `linear="true"`, klik langsung pada langkah-langkah di masa depan yang belum dilewati diblokir secara otomatis demi integritas pengisian formulir.
4. **Isolasi Status Error Visual**: Saat indeks langkah tercantum dalam prop `errorSteps`, nodus memancarkan warna merah bahaya yang langsung memandu pengguna kembali ke tahapan yang bermasalah.

---

## 13. Customization

### Linimasa Vertikal Riwayat Pelacakan Paket Logistik

```vue
<script setup>
import Stepper from '@/Components/Pack/Stepper.vue';

const trackingHistory = [
    { label: 'Pesanan Diterima Penjual', description: 'Gudang Pusat Jakarta', time: '08:30 WIB', icon: 'inventory' },
    { label: 'Diserahkan ke Kurir', description: 'Ekspedisi Express JKT', time: '11:15 WIB', icon: 'local_shipping' },
    { label: 'Paket Sedang Diantar', description: 'Kurir menuju lokasi', time: '14:20 WIB', icon: 'delivery_dining' },
    { label: 'Paket Berhasil Diterima', description: 'Penerima: Bapak Bambang', time: '15:45 WIB', icon: 'check_circle' },
];
</script>

<template>
    <Stepper
        :steps="trackingHistory"
        :model-value="2"
        type="timeline"
        orientation="vertical"
        color="indigo"
        variant="icon"
        :clickable="false"
    />
</template>
```

---

## 14. Accessibility

- **WAI-ARIA Navigation Structure**: Elemen utama menerapkan `role="navigation"` dengan `aria-label="Pemandu langkah alur kerja"`.
- **Indikasi Langkah Aksesibel**: Setiap nodus memiliki atribut `aria-current="step"` pada langkah yang sedang aktif saat ini.
- **Keyboard Navigation**: Pengguna dapat memindahkan fokus ke nodus langkah menggunakan tombol `Tab` dan mengaktifkannya dengan tombol `Enter` atau `Space` (pada mode `clickable="true"`).

---

## 15. Responsive Behavior

- **Mobile Viewport (< 640px)**: Pada tipe `circle`, teks label langkah di bawah bulatan secara otomatis diposisikan terpusat dengan skala tipografi yang mengecil agar tidak bertabrakan dengan nodus sebelah. Pada tipe `cards`, susunan kotak beralih dari baris horizontal menjadi kolom vertikal (`grid-cols-1`).
- **Desktop Viewport (>= 640px)**: Komponen merender seluruh nodus dan garis konektor secara proporsional horizontal dengan jeda ruang yang lapang.

---

## 16. Do / Don't

| Do (Praktik Direkomendasikan) | Don't (Praktik Dihindari) |
| :--- | :--- |
| **Gunakan `linear="true"` jika langkah berikutnya bergantung data sebelumnya**: Menjaga integritas data formulir bertahap. | **Jangan gunakan lebih dari 6 langkah dalam satu horizontal stepper**: Mengakibatkan tata letak berdesakan dan label teks terpotong pada layar sedang. |
| **Gunakan `type="bar"` untuk alur checkout cepat**: Memberikan indikasi visual yang bersih tanpa menyita tinggi kanvas halaman. | **Jangan menghilangkan label teks pada alur yang tidak umum**: Pengguna memerlukan kejelasan tujuan dari setiap tahapan yang mereka tempuh. |
| **Manfaatkan `errorSteps` saat validasi server gagal**: Membimbing pengguna secara spesifik ke langkah formulir yang membutuhkan koreksi. | **Jangan menonaktifkan tombol kembali**: Selalu beri kesempatan kepada pengguna untuk merevisi input di langkah sebelumnya. |

---

## 17. Examples / Recipes

### Recipe 1: Wizard Segmented Bar Kasir Belanja E-Commerce

```vue
<template>
    <Stepper
        :steps="['Keranjang', 'Alamat Kirim', 'Opsi Kurir', 'Pembayaran']"
        :model-value="1"
        type="bar"
        color="emerald"
        :show-actions="false"
    />
</template>
```

### Recipe 2: Linimasa Pipeline CI/CD Deployment

```vue
<template>
    <Stepper
        :steps="[
            { label: 'Lint & Compile', icon: 'code', time: '10:00:15' },
            { label: 'Unit Testing', icon: 'task_alt', time: '10:02:40' },
            { label: 'Container Build', icon: 'inventory_2', time: '10:04:12' },
            { label: 'Deploy Production', icon: 'cloud_upload', time: 'Menunggu' },
        ]"
        :model-value="2"
        type="timeline"
        orientation="vertical"
        color="indigo"
    />
</template>
```

---

## 18. Related Components

- [ButtonSubmit](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/button-submit.md): Tombol navigasi aksi yang digunakan pada bilah footer wizard.
- [Badge](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/badge.md): Lencana status yang disematkan di sebelah judul tahapan stepper.
- [Card](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/card.md): Kontainer tata letak pembungkus formulir anak pada slot `#content`.
- [InputField](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/input-field.md): Elemen masukan data formulir yang mengisi setiap tahapan wizard.

---

## 19. Notes / Limitations

- **Pengurutan Indeks Berbasis Nol (0-Indexed)**: Perlu diingat bahwa prop `modelValue` menggunakan konvensi indeks 0 (`0` untuk langkah pertama, `1` untuk langkah kedua, dst).
- **Penyesuaian Garis Konektor CSS**: Posisi vertikal garis konektor dihitung menggunakan persentase tinggi nodus. Jika menggunakan slot `#step` dengan dimensi kustom yang ekstrem, sesuaikan perataan garis konektor melalui kelas penimpa CSS.
