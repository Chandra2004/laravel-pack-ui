# Tabs Component

Komponen navigasi tab responsif modular (*responsive tabs*) yang dirancang untuk pengorganisasian panel informasi, filter periodik, katalog e-commerce, maupun form pengaturan profil enterprise. Komponen ini dirancang dengan prinsip desain minimalis kompak, true center alignment, dan rasio proporsional ikon terhadap tinggi huruf sesuai standar arsitektur Laravel Pack UI.

---

## 01. Overview

`Tabs.vue` menyediakan sistem pengalih panel konten berkinerja tinggi dengan 9 varian visual modern, integrasi chip status `<Badge.vue />`, kontrol navigasi panah dinamis, dan jarak bernapas (*spacing*) proporsional antara tab dan panel konten di layar desktop, tablet, maupun smartphone.

### 1.1 Apa Entitas Ini
Komponen antarmuka pengguna Vue 3 berbasis Composition API (`packages/laravel-pack-ui/resources/js/Components/Pack/Tabs.vue`) yang menghubungkan sekumpulan pemicu tab dengan panel konten terkait secara dinamis, terintegrasi dengan subkomponen `<Badge.vue />`, kompatibel dengan Tailwind CSS v4, dan terintegrasi dengan Google Material Symbols.

### 1.2 Fungsi Utama
- Mengelompokkan konten yang berhubungan erat ke dalam beberapa panel terpisah dalam satu tampilan halaman tanpa perlu me-reload URL.
- Menyediakan kontrol filter tersegmentasi (*segmented control*) untuk pemilihan rentang waktu atau jenis tampilan data.
- Menyediakan 9 varian desain modern dengan identitas visual yang kontras dan khas: `segmented`, `pills`, `boxed` / `cards`, `floating` / `glass`, `bubble`, `minimal`, `underline`, `enclosed`, dan `lifted`.
- Menyediakan navigasi panah scrollable interaktif di mana klik panah kiri/kanan langsung memindahkan tab aktif ke indeks sebelumnya/berikutnya serta menggeser posisi scroll secara otomatis.
- Memberikan jarak bernapas (*spacing*) yang proporsional antara baris tab dan kontainer panel konten baik pada orientasi horizontal (`space-y-4 sm:space-y-6`) maupun vertikal (`gap-6 sm:gap-8`).
- Mengelola navigasi keyboard aksesibel (`ArrowRight`, `ArrowLeft`, `Home`, `End`) sesuai standar WAI-ARIA.
- Mendukung fitur *lazy rendering* (`:lazy="true"`) untuk menunda mount panel yang belum dikunjungi demi optimalisasi memori dan panggilan API.

### 1.3 Kapan Digunakan
- Pada dashboard operasional untuk memisahkan ringkasan metrik, riwayat mutasi, dan log keamanan.
- Pada bilah filter data untuk memilih periode (Harian, Mingguan, Bulanan, Tahunan).
- Pada halaman pengaturan akun dan profil usaha bertingkat dengan deskripsi dua baris.
- Pada katalog opsi pembayaran atau perbankan yang memiliki banyak item menggunakan mode `scrollable`.
- Pada antarmuka e-commerce untuk detail spesifikasi, ulasan, pengiriman, dan FAQ.

### 1.4 Karakteristik Penting
- **Identitas Visual Kontras**: Setiap varian memiliki wujud horizontal yang sangat berbeda (slider terpadu, pil melayang independen, kartu dashboard berbingkai, pulau kaca glassmorphism, balon empuk pastel, dan ghost minimalis).
- **Zero-Overlap Arrow Navigation**: Tombol panah geser berada di luar track dan secara aktif memindahkan tab aktif ke kiri/kanan.
- **Dynamic Lazy Loading**: Mendukung prop `lazy` untuk menunda perenderan panel konten yang tidak aktif ke DOM guna menghemat memori browser dan request API.
- **Pack Component Integration**: Menggunakan komponen internal `<Badge.vue />` untuk render chip counter badge.
- **Jeda Bernapas Nyata**: Panel konten tidak lagi menempel rapat tanpa batas pada tab navigasi, melainkan memiliki bingkai dan jarak pemisah yang rapi.

---

## 02. Preview

> [!TIP]
> Pengujian visual dan showcase interaktif entitas ini tersedia secara native pada portal pratinjau aplikasi:
>
> <a href="http://localhost:8000/preview/tabs" target="_self" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 8px; background-color: var(--vp-c-brand-1, #4f46e5); color: #ffffff;">Buka Live Preview Komponen Tabs &rarr;</a>

---

## 03. Usage

### Pohon Konsep Penggunaan

```text
Tabs
├── Dashboard Panel Navigation
│   ├── Boxed / Cards (Kartu Dashboard Mandiri dengan Aksen Border Atas)
│   ├── Underline Style (Ringkasan, Mutasi, Settlement Klasik)
│   └── Lifted Elevated Style (Folder Tab Bertingkat Modern)
├── Data Filtering & Mode Switcher
│   ├── Segmented (Apple iOS / macOS Slider Track Taktil Terpadu)
│   ├── Pills (Kapsul Melayang Mandiri dengan Glow Ring)
│   ├── Floating / Glass (Glassmorphism Island dengan Blur)
│   └── Bubble Style (Pastel Soft Bouncy untuk E-Commerce)
└── Minimalist Navigation
    └── Minimal (Clean Ghost Tipografi Murni dengan Pulsing Status Dot)
```

### Matriks Kapan Digunakan vs Dihindari

| Skenario Antarmuka | Gunakan Tabs | Alternatif yang Tepat |
|---|---|---|
| Filter data singkat (2-4 opsi) | Ya (`variant="segmented"`) | Hindari dropdown select untuk opsi sedikit |
| Pilihan kategori dengan jarak jelas | Ya (`variant="pills"`) | TagInput jika multi-select |
| Pilihan server / paket kartu dashboard | Ya (`variant="boxed"`) | Card Component biasa |
| Tema dark-mode / landing page modern | Ya (`variant="floating"`) | Underline biasa |
| E-commerce detail produk kasual | Ya (`variant="bubble"`) | Accordion jika konten sangat panjang |
| Sub-navigasi ringkas ala Linear/Notion | Ya (`variant="minimal"`) | Breadcrumb |
| Alur langkah pengisian formulir bertahap | Tidak | Gunakan Stepper.vue |
| Menu navigasi global aplikasi | Tidak | Gunakan Sidebar.vue atau Navbar |

---

## 04. Anatomy

### Diagram Hierarki Elemen

```text
Tabs Container Shell (w-full flex-col / lg:flex-row space-y-4/gap-6)
│
├── Tab List Header Wrapper (relative min-w-0 w-full / lg:w-56)
│   └── Flex Horizontal Wrapper (flex items-center w-full min-w-0)
│       ├── Scroll Left Arrow Button (Pindah ke Tab Sebelumnya)
│       ├── Tab List Track Container (role="tablist")
│       │   └── Tab Button Item (role="tab")
│       │       ├── Pulsing Status Dot (Minimal & Floating)
│       │       ├── Hairline Accent Line (Enclosed & Lifted)
│       │       ├── Leading Icon (material-symbols-outlined)
│       │       ├── Label Text (whitespace-nowrap)
│       │       └── Integrated Badge (<Badge.vue size="xs" />)
│       └── Scroll Right Arrow Button (Pindah ke Tab Berikutnya)
│
└── Content Panels Container (role="tabpanel" - Berjarak & Berbingkai Rapi)
    └── Active Panel Slot Content (#tabId / default)
```

### Diagram Alur Kerja Reaktivitas (Mermaid)

```mermaid
graph TD
    A[Inisialisasi Tabs dengan Data :tabs & v-model] --> B{Normalisasi Data Array / String}
    B --> C[Tentukan Tab Aktif Awal: modelValue || Tab Pertama]
    C --> D[Render Track Navigasi Tab Sesuai Varian & Ukuran]
    D --> E{Apakah scrollable: true?}
    E -->|Ya| F[Pasang Scroll Listener & Hitung Overflow Panah]
    E -->|Tidak| G[Track Statis / Flex Biasa]
    F --> H[Tampilkan Tombol Panah Kiri / Kanan Jika Melebihi Kontainer]
    
    H --> I[Pengguna Klik Tab / Panah / Tombol Keyboard]
    G --> I
    
    I --> J{Apakah Target Tab Disabled?}
    J -->|Ya| K[Abaikan Klik / Navigasi Dibatalkan]
    J -->|Tidak| L[Mutasi activeTabId & Emit update:modelValue + change]
    
    L --> M{Apakah lazy: true?}
    M -->|Ya| N[Mount Slot Panel Konten ke DOM untuk Pertama Kali]
    M -->|Tidak| O[Ubah CSS Display: hidden Menjadi Block]
    
    N --> P[Tampilkan Konten Panel Berjarak Lega & Focus Trap Safe]
    O --> P
```

---

## 05. Variants

Tampilan horizontal telah diredesain secara radikal agar masing-masing memiliki wujud dan karakter visual yang tegas:

| Varian | Wujud & Karakteristik Visual Horizontal | Rekomendasi Kasus |
|---|---|---|
| `segmented` | **Satu Wadah Slider Taktil**: Seluruh tab berada dalam satu track tertutup berlatar abu-abu inset (`bg-slate-200 dark:bg-slate-800`), di mana tab aktif berbentuk tombol kartu putih mengambang dengan bayangan taktil (`shadow-md ring-1 ring-black/5`). | Filter rentang waktu (Harian/Bulanan), toggle mode tampilan list/grid |
| `pills` | **Kapsul Melayang Mandiri**: Bukan dalam satu wadah track tertutup, melainkan deretan tombol kapsul individual (`rounded-full`) dengan jarak antar tombol yang renggang (`gap-2.5`) dan shadow aksen semantik (`glowRing`). | Filter halaman, selektor metode pembayaran checkout |
| `boxed` / `cards` | **Kartu Dashboard Berbingkai**: Tab berwujud kartu kotak tersendiri dengan aksen garis tebal atas (`border-t-4`) pada horizontal atau kiri (`border-l-4`) pada vertikal serta elevasi kartu terangkat (`-translate-y-1`). | Pemilihan node server, jenis paket langganan, tab multi-panel |
| `floating` / `glass` | **Pulau Kaca Mengambang**: Seluruh track mengapung dengan efek *glassmorphism* tebal (`backdrop-blur-xl bg-white/70 border-white/80 shadow-lg`), dan tab aktif memiliki kartu frosted glow dengan status dot menyala. | Dashboard modern bergaya dark-mode, portal analitik premium |
| `bubble` | **Gelembung Pastel Bouncy**: Balon empuk pastel membal tanpa garis border kaku sama sekali (`border-none rounded-2xl scale-[1.03]`), sangat ramah sentuhan. | E-commerce detail produk, filter tag aplikasi seluler |
| `minimal` | **Clean Ghost Tipografi**: Murni teks tanpa latar belakang kartu atau border kontainer, dihiasi titik dot bulat aktif yang berdenyut (*pulsing status dot*). | Sub-navigasi ringkas, dokumentasi developer / API, interface Notion-like |
| `underline` | Garis aksen bawah minimalis terpadu (`border-b-2 -mb-px`) dengan jarak bernapas vertikal seimbang. | Dasbor tabel data utama, form master data |
| `enclosed` | Tab folder kartu klasik enterprise yang menyatu presisi dengan bingkai panel bawah. | Formulir bertingkat, dokumen kartu bersambung |
| `lifted` | Tab terangkat (*elevated folder tab*) dengan garis aksen hairline atas dan bayangan kartu. | Manajemen proyek kanban, manajemen tab dokumen |

---

## 06. Sizes & Spacing

### Skala Dimensi Tab

| Size Key | Tinggi Target Tab | Ukuran Font Label | Dimensi Ikon | Padding Horizontal | Rekomendasi Kasus |
|---|---|---|---|---|---|
| `xs` | `28px` (`h-7`) | `11px` (`text-[11px]`) | `14px` (`text-sm`) | `px-2 py-1` | Widget mini, tabel data compact, sub-filter |
| `sm` | `32px` (`h-8`) | `12px` (`text-xs`) | `16px` (`text-base`) | `px-2.5 py-1.5` | Dashboard padat, modal dialog filter |
| `md` | `38px` (`h-9.5`) | `13px` (`text-xs sm:text-sm`) | `18px` (`text-lg`) | `px-3.5 py-2` | Standar default aplikasi web |
| `lg` | `44px` (`h-11`) | `14px` (`text-sm font-semibold`) | `20px` (`text-xl`) | `px-4.5 py-2.5` | Halaman pengaturan profil utama, tablet |
| `xl` | `52px` (`h-13`) | `16px` (`text-base font-bold`) | `24px` (`text-2xl`) | `px-6 py-3` | Landing page, selektor paket pricing besar |

### Standar Jarak Bernapas Antara Tab dan Panel Konten
- **Orientasi Horizontal**: Kontainer menerapkan `space-y-4 sm:space-y-6` (jarak pemisah 16px - 24px) sehingga deretan tab dan panel konten tidak berhimpitan.
- **Orientasi Vertikal**: Kontainer menerapkan `gap-6 sm:gap-8` (jarak pemisah 24px - 32px) antara sidebar navigasi tab kiri dan panel konten kanan.
- **Panel Konten**: Dibungkus dalam kontainer berbingkai mandiri (`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-6 shadow-xs`).

### Kelengkungan Sudut (`radius`)
Nilai yang didukung: `'none'` (0px), `'xs'` (2px), `'sm'` (4px), `'md'` (6px), `'lg'` (8px - default), `'xl'` (12px), `'full'` (kapsul pill).

> [!NOTE]
> Perubahan perilaku: pada varian `segmented`, prop `radius` kini diterapkan ke tab dan track (track satu tingkat lebih besar dari tab, mis. `lg` tab dengan track `xl`). Sebelumnya radius tab dan track tetap (`rounded-lg` dan `rounded-xl`). Dengan `radius` default `lg` tampilan tidak berubah.

---

## 07. States

| Status | Indikator Visual & DOM | Perilaku Interaksi |
|---|---|---|
| `active` | Mendapatkan warna primer varian, font `font-semibold`, status `aria-selected="true"`, dan border aksen / shadow taktil. | Panel konten yang berpasangan ditampilkan ke layar. |
| `inactive` | Warna teks netral abu-abu (`text-slate-500 dark:text-slate-400`), status `aria-selected="false"`. | Siap menerima interaksi klik atau hover pengguna. |
| `hover` | Perubahan latar belakang halus (`bg-slate-100 dark:bg-slate-800/60`) atau teks menjadi lebih kontras. | Memberi umpan balik bahwa elemen dapat diklik. |
| `focus-visible` | Muncul outline cincin fokus ganda (`ring-2 ring-primary-500 ring-offset-2`). | Memastikan navigasi keyboard terlihat jelas bagi pengguna a11y. |
| `disabled` | Teks pudar (`opacity-40 cursor-not-allowed pointer-events-none`). | Klik dibatalkan, dilewati saat pengguna menekan tombol panah keyboard. |
| `can-scroll-left` / `right` | Tombol panah kiri/kanan (`ButtonSubmit` dengan ikon chevron) aktif dan berkilau di luar track. | Pengguna dapat mengklik panah untuk memindahkan tab dan menggeser track. |
| `at-boundary` | Tombol panah di ujung kiri atau kanan otomatis berstatus `disabled`. | Mencegah loop scroll keluar dari batas tab pertama/terakhir. |
| `lazy-unmounted` | Node panel konten belum dibuat di dalam DOM browser (`v-if="false"`). | Menghemat konsumsi memori dan menghentikan request jaringan sebelum tab dibuka. |

---

## 08. Props / Parameters / Attributes

| Prop | Tipe Data | Nilai Default | Wajib | Deskripsi & Validasi |
|---|---|---|---|---|
| `tabs` | `Array` | — | Ya | Daftar tab item: `[{ id, label, icon, badge, panelTitle, panelDesc, status, disabled }]` |
| `modelValue` | `String \| Number` | `null` | Tidak | ID tab yang sedang aktif (dua arah `v-model`) |
| `variant` | `String` | `'underline'` | Tidak | Varian visual: `'segmented'`, `'pills'`, `'boxed'`, `'floating'`, `'bubble'`, `'minimal'`, `'underline'`, `'enclosed'`, `'lifted'` |
| `tabStyle` | `String` | `null` | Tidak | Gaya pewarnaan tombol: `'soft'`, `'solid'`, `'outline'` |
| `color` | `String` | `'primary'` | Tidak | Palet tema: `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'` |
| `radius` | `String` | `'lg'` | Tidak | Kelengkungan sudut: `'none'`, `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'full'` |
| `size` | `String` | `'md'` | Tidak | Skala dimensi: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'` |
| `orientation` | `String` | `'horizontal'` | Tidak | Orientasi tata letak: `'horizontal'`, `'vertical'` |
| `iconPosition` | `String` | `'left'` | Tidak | Penempatan ikon terhadap label teks: `'left'`, `'top'` |
| `fullWidth` | `Boolean` | `false` | Tidak | Membagi lebar kontainer secara proporsional merata (`flex-1`) |
| `showIcon` | `Boolean` | `true` | Tidak | Menampilkan ikon jika didefinisikan pada data tab |
| `showBadge` | `Boolean` | `true` | Tidak | Menampilkan badge jika didefinisikan pada data tab |
| `scrollable` | `Boolean` | `false` | Tidak | Mengaktifkan tombol panah navigasi yang berpindah tab dan menggeser track |
| `lazy` | `Boolean` | `false` | Tidak | Menunda perenderan panel konten yang tidak aktif ke DOM hingga tab diklik |
| `compactPanel` | `Boolean` | `false` | Tidak | Sembunyikan panel konten bawah jika hanya butuh tab trigger navigasi |

### Penjelasan Khusus Fitur `lazy` (Tunda Render DOM)
- Secara default (`lazy: false`), Vue me-render seluruh slot panel konten (`#panel-1`, `#panel-2`, dst.) ke dalam DOM browser sejak awal halaman dimuat, lalu menyembunyikan panel yang tidak aktif menggunakan CSS `display: none` (`class="hidden"`).
- Ketika prop `lazy: true` diaktifkan: Komponen mengevaluasi `<template v-if="!lazy || activeTabId === tab.id">`. Artinya, panel konten **hanya akan dirender dan dieksekusi ke dalam DOM saat tab tersebut pertama kali diklik oleh pengguna**.
- **Keuntungan Utama**: Mempercepat *Initial Page Load*, mencegah *Memory Bloat* pada tabel besar, dan mencegah bug inisialisasi kanvas lebar 0px pada library peta/grafik (Google Maps, Leaflet, Chart.js).

---

## 09. Slots / Content

| Nama Slot | Scoped Props | Deskripsi |
|---|---|---|
| `tab` | `{ tab, active, index }` | Kustomisasi elemen pemicu tab secara total jika membutuhkan struktur HTML khusus. |
| `[tab.id]` | `{ tab, active, index }` | Slot bernama khusus untuk tiap tab sesuai nilai ID objek tab (contoh: `#general`, `#billing`). |
| `default` | `{ tab, activeTab, activeIndex }` | Slot fallback untuk merender konten jika slot bernama tidak dideklarasikan. |

---

## 10. Events / Interactions / Returns

| Nama Event | Payload Tipe | Kondisi Pemicu | Deskripsi |
|---|---|---|---|
| `@update:modelValue` | `tabId: String \| Number` | Tab baru diklik atau berpindah via panah | Event sinkronisasi `v-model` dua arah. |
| `@change` | `{ tab: Object, index: Number }` | Tab baru terkonfirmasi aktif | Diteruskan saat tab aktif berubah beserta objek data lengkap dan indeksnya. |

---

## 11. Code Example

### 1. Penggunaan Dasar (Basic Example - Segmented Control)
```vue
<script setup>
import { ref } from 'vue';
import Tabs from '@/Components/Pack/Tabs.vue';

const selectedPeriod = ref('monthly');
const periodList = [
    { id: 'daily', label: 'Harian' },
    { id: 'weekly', label: 'Mingguan' },
    { id: 'monthly', label: 'Bulanan' },
    { id: 'yearly', label: 'Tahunan' },
];
</script>

<template>
    <Tabs
        v-model="selectedPeriod"
        :tabs="periodList"
        variant="segmented"
        color="emerald"
        size="sm"
    />
</template>
```

### 2. Penggunaan Menengah (Intermediate Example - Pills Scrollable dengan Slot)
```vue
<script setup>
import { ref } from 'vue';
import Tabs from '@/Components/Pack/Tabs.vue';

const activePayment = ref('qris');
const paymentTabs = [
    { id: 'qris', label: 'QRIS Instan', icon: 'qr_code_2', badge: 'Populer' },
    { id: 'bca', label: 'BCA Virtual Account', icon: 'account_balance' },
    { id: 'mandiri', label: 'Mandiri Livin', icon: 'account_balance' },
    { id: 'card', label: 'Kartu Kredit / Debit', icon: 'credit_card' },
];
</script>

<template>
    <Tabs
        v-model="activePayment"
        :tabs="paymentTabs"
        variant="pills"
        color="indigo"
        radius="full"
        :scrollable="true"
    >
        <template #qris>
            <div class="text-center py-6">
                <div class="font-bold text-slate-800 dark:text-slate-100">Scan QRIS untuk pembayaran instan</div>
            </div>
        </template>
    </Tabs>
</template>
```

### 3. Penggunaan Lanjutan (Advanced Enterprise Example - Vertical Boxed dengan Lazy Loading)
```vue
<script setup>
import { ref } from 'vue';
import Tabs from '@/Components/Pack/Tabs.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';
import InputField from '@/Components/Pack/InputField.vue';

const activeSection = ref('profile');
const formTabs = [
    { id: 'profile', label: 'Profil Pengguna', icon: 'person', panelTitle: 'Pengaturan Identitas' },
    { id: 'security', label: 'Kata Sandi & 2FA', icon: 'security', badge: 'Penting' },
    { id: 'notifications', label: 'Preferensi Notifikasi', icon: 'notifications' },
];

const username = ref('alex_developer');
const email = ref('alex@enterprise.id');
</script>

<template>
    <div class="max-w-4xl mx-auto p-6">
        <Tabs
            v-model="activeSection"
            :tabs="formTabs"
            variant="boxed"
            color="primary"
            orientation="vertical"
            :lazy="true"
        >
            <template #profile>
                <form class="space-y-4" @submit.prevent>
                    <InputField v-model="username" label="Nama Pengguna" icon="badge" />
                    <InputField v-model="email" type="email" label="Alamat Email" icon="mail" />
                    <ButtonSubmit variant="solid" color="primary">Simpan Profil</ButtonSubmit>
                </form>
            </template>

            <template #security>
                <div class="space-y-4">
                    <p class="text-sm text-slate-500">Konfigurasi otentikasi dua langkah akun Anda.</p>
                    <ButtonSubmit variant="outline" color="rose">Reset Semua Sesi Aktif</ButtonSubmit>
                </div>
            </template>
        </Tabs>
    </div>
</template>
```

---

## 12. Result / Behavior

### Alur Aksi ke Reaksi
1. **Pergantian Tab Aktif**:
   - Pengguna mengklik salah satu tombol tab atau menekan tombol panah keyboard.
   - Komponen mengecek apakah tab berstatus `disabled: true`. Jika ya, aksi dibatalkan.
   - Nilai ref internal `activeTabId` diperbarui seketika.
   - Mengirimkan event emit `@update:modelValue(id)` dan `@change({ tab, index })`.
2. **Navigasi Panah Scrollable**:
   - Ketika tombol panah kiri (`chevron_left`) diklik, fungsi `goToPrevTab()` memanggil indeks tab `currentIndex - 1`. Tab aktif berpindah ke kiri dan kontainer track otomatis digeser (*smooth scroll*) agar tab berada di tengah bidang pandang.
   - Ketika tombol panah kanan (`chevron_right`) diklik, fungsi `goToNextTab()` memanggil indeks `currentIndex + 1` dan menggeser track ke kanan.
   - Tombol panah otomatis disabled jika pengguna berada di batas ujung pertama atau terakhir.
3. **Siklus Hidup `lazy: true`**:
   - Panel yang belum pernah dibuka berada dalam status *unmounted* (elemen DOM belum ada di memory browser).
   - Saat tab aktif dipilih, Vue me-mount slot panel tersebut ke dalam DOM dan memicu siklus hidup `onMounted()` pada komponen anak di dalamnya.
   - Ketika pengguna berpindah ke tab lain, panel sebelumnya disembunyikan menggunakan CSS `hidden` tanpa meng-unmount kembali, sehingga state isian formulir pengguna tidak hilang (*preserved form state*).

---

## 13. Customization

### Kustomisasi Utility Tailwind CSS via Prop `class`
Anda dapat menambahkan kelas tata letak tambahan pada kontainer luar `Tabs.vue`:
```vue
<Tabs :tabs="sampleTabs" class="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-3xl" />
```

### Integrasi Dark Mode
Seluruh 9 varian visual `Tabs.vue` telah dilengkapi dengan token warna gelap Tailwind v4:
- Inset track segmented menggunakan `dark:bg-slate-800 dark:border-slate-700`.
- Kontainer panel menggunakan `dark:bg-slate-900/60 dark:border-slate-800`.
- Teks label netral menggunakan `dark:text-slate-400 dark:hover:text-slate-200`.

### Kustomisasi Header Tab melalui Slot `#tab`
Jika ingin menambahkan elemen custom (misalnya avatar pengguna di samping label tab):
```vue
<template #tab="{ tab, active }">
    <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full" :class="active ? 'bg-emerald-500' : 'bg-slate-300'" />
        <span>{{ tab.label }}</span>
    </div>
</template>
```

---

## 14. Accessibility (a11y)

Komponen mematuhi spesifikasi **WAI-ARIA Tabs Pattern**:
- **Atribut ARIA**:
  - Kontainer header menggunakan `role="tablist"` dan `aria-orientation="horizontal|vertical"`.
  - Tiap tombol pemicu menggunakan `role="tab"`, `aria-selected="true|false"`, `aria-controls="panel-{id}"`, dan `id="tab-{id}"`.
  - Kontainer panel konten menggunakan `role="tabpanel"`, `aria-labelledby="tab-{id}"`, dan `tabindex="0"`.
- **Keyboard Navigation**:
  - `ArrowRight` / `ArrowLeft`: Berpindah antar tab pada mode horizontal (melewati tab disabled).
  - `ArrowDown` / `ArrowUp`: Berpindah antar tab pada mode vertikal.
  - `Home`: Langsung melompat ke tab aktif pertama yang tersedia.
  - `End`: Langsung melompat ke tab aktif terakhir yang tersedia.
- **Touch Target**: Seluruh tombol tab memiliki tinggi minimum 32px s/d 52px untuk kenyamanan tap di perangkat seluler (WCAG 2.1 Success Criterion 2.5.5).

---

## 15. Responsive Behavior

### Tabel Breakpoint

| Viewport | Rentang Lebar | Perilaku Antarmuka Tabs |
|---|---|---|
| **Mobile** | `< 768px` | Track tab horizontal dilengkapi `overflow-x-auto` dengan scroll momentum halus. Pada orientasi vertikal, tab berpindah ke format tumpuk penuh (*full width stack*) di atas panel konten. |
| **Tablet** | `768px - 1023px` | Track tab memanfaatkan tombol panah scrollable jika tab meluap. Pada orientasi vertikal, tab menjadi kolom kiri selebar 200px. Jarak bernapas antar tab dan panel menyesuaikan ke 20px. |
| **Desktop** | `>= 1024px` | Kontainer vertikal mengalokasikan kolom kiri statis `lg:w-56` dengan pemisah `gap-8`. Varian kartu boxed mendapatkan elevasi hover 3D penuh. |

---

## 16. Do / Don't

| Rekomendasi (Do) | Larangan (Don't) |
|---|---|
| Gunakan varian `segmented` untuk filter periode singkat (2-4 item). | Jangan gunakan Tabs untuk navigasi menu utama seluruh halaman aplikasi; gunakan Navbar atau Sidebar. |
| Aktifkan `:scrollable="true"` jika memiliki lebih dari 5 tab di perangkat mobile atau layar sempit. | Jangan gunakan Tabs untuk alur wizard formulir bertahap; gunakan Stepper.vue agar pengguna memahami urutan wajib. |
| Aktifkan `:lazy="true"` jika masing-masing panel memuat grafik atau tabel data berukuran besar. | Jangan menjejalkan teks label tab terlalu panjang; gunakan teks ringkas 1-2 kata dan tempatkan deskripsi di dalam panel. |
| Gunakan varian `boxed` saat tab berfungsi sebagai selektor kartu server, tier langganan, atau modul dashboard. | Jangan memasang tombol panah scroll secara manual di luar komponen; manfaatkan fitur built-in `scrollable`. |

---

## 17. Examples / Recipes

### Resep 1: Dasbor Mutasi Keuangan dengan Filter Segmented
```vue
<script setup>
import { ref } from 'vue';
import Tabs from '@/Components/Pack/Tabs.vue';
import Badge from '@/Components/Pack/Badge.vue';

const filterPeriod = ref('monthly');
const periods = [
    { id: 'daily', label: 'Hari Ini' },
    { id: 'weekly', label: 'Minggu Ini' },
    { id: 'monthly', label: 'Bulan Ini' },
];
</script>

<template>
    <div class="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-3">
            <h3 class="font-bold text-slate-900 dark:text-white">Arus Kas Masuk & Keluar</h3>
            <Tabs v-model="filterPeriod" :tabs="periods" variant="segmented" color="emerald" size="xs" :compact-panel="true" />
        </div>
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <p class="text-sm text-slate-600 dark:text-slate-300">Menampilkan mutasi periode: <strong>{{ filterPeriod }}</strong></p>
        </div>
    </div>
</template>
```

### Resep 2: Katalog Detail Produk E-Commerce Tab Bubble
```vue
<script setup>
import { ref } from 'vue';
import Tabs from '@/Components/Pack/Tabs.vue';

const activeDetail = ref('specs');
const productTabs = [
    { id: 'specs', label: 'Spesifikasi', icon: 'tune' },
    { id: 'reviews', label: 'Ulasan (4.9)', icon: 'star', badge: '128' },
    { id: 'shipping', label: 'Pengiriman', icon: 'local_shipping' },
];
</script>

<template>
    <Tabs v-model="activeDetail" :tabs="productTabs" variant="bubble" color="cyan" size="sm">
        <template #specs>
            <ul class="text-xs space-y-2 text-slate-600 dark:text-slate-400">
                <li>Material: Aluminium Alloy Aero-Grade</li>
                <li>Bobot: 185 gram</li>
                <li>Garansi: 2 Tahun Resmi Distributor</li>
            </ul>
        </template>
    </Tabs>
</template>
```

---

## 18. Related Items

- **Komponen Pendukung**:
  - `Badge.vue`: Digunakan secara internal untuk merender chip counter status pada tiap item tab.
  - `ButtonSubmit.vue`: Digunakan untuk merender kontrol navigasi panah scrollable kiri dan kanan.
  - `InputField.vue`: Sering dipasangkan di dalam panel tab formulir pengaturan akun.
- **Komponen Alternatif**:
  - `Stepper.vue`: Untuk alur pengisian bertahap (step-by-step wizard) yang memiliki dependensi urutan.
  - `Accordion.vue`: Jika ingin menyajikan konten bertingkat yang dapat dibuka beberapa bagian sekaligus di perangkat mobile.

---

## 19. Notes / Limitations

- **Dependensi Google Material Symbols**: Pastikan font Google Material Symbols terpasang di `app.blade.php` atau `index.html` jika menggunakan properti `icon`.
- **Lebar Kontainer pada Mode Scrollable**: Fitur auto-scroll dan deteksi overflow membutuhkan kontainer dengan lebar terukur (`max-w` atau `w-full` dengan flexbox aman). Hindari kontainer berstatus `overflow-hidden` kaku tanpa batas lebar.
- **Lazy Rendering State Persistence**: Ketika `:lazy="true"`, komponen anak hanya di-mount sekali saat pertama kali tab dibuka. Setelah dibuka, berpindah ke tab lain tidak akan me-reset data yang sudah diisi oleh pengguna (karena menggunakan caching CSS `hidden`).
