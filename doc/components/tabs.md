# 📑 Tabs Component (`Tabs.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen navigasi panel konten modular (*responsive tabs*) *enterprise-grade* berbasis Vue 3 dan Tailwind CSS v4. Dirancang ulang dengan estetika modern, taktil, dan bersih, menerapkan penuh **5 Pilar Kustomisasi UI** (`peraturan.md`): **Warna**, **Bentuk**, **Teks Konten**, **Icon**, dan **Responsif**.

Mendukung 4 gaya tata letak tab (*underline*, *pills*, *segmented controller* ala macOS/iOS, dan *enclosed folder card*), tombol geser panah halus (*scrollable arrow controls*), tab dua baris dengan deskripsi (*dual-line subtitle*), posisi ikon fleksibel (*left* atau *top*), serta navigasi keyboard presisi WAI-ARIA.

---

## 🎨 5 Pilar Kustomisasi (`peraturan.md`)

### 1. Warna (Color & Style)
* **Pilihan Palet Warna (`color`)**:
  - `'primary'` / `'blue'`: Biru enterprise modern
  - `'indigo'`: Indigo elegan
  - `'emerald'` / `'success'`: Hijau sukses
  - `'purple'` / `'violet'`: Ungu kreatif
  - `'amber'` / `'warning'`: Kuning emas peringatan
  - `'rose'` / `'danger'`: Merah risiko
  - `'cyan'` / `'sky'`: Cyan teal cerah
  - `'dark'` / `'slate'`: Hitam/putih kontras tinggi
* **Gaya Visual Pewarnaan (`tabStyle`)**:
  - `'soft'` (Default): Background lembut bertransparansi dengan teks kontras semantik.
  - `'solid'`: Warna pekat kontras tinggi dengan teks putih dan bayangan lembut.
  - `'outline'`: Border tegas beraksen warna dengan latar transparan.

### 2. Bentuk (Shape, Variant, & Size)
* **Varian Tata Letak (`variant`)**:
  - `'underline'`: Garis bawah aktif mengambang (*floating bar indicator*) dengan soft hover rounded.
  - `'pills'`: Tombol kapsul independen yang dapat dipadukan dengan gaya `soft`, `solid`, maupun `outline`.
  - `'segmented'`: Kontrol tersegmentasi ala macOS/iOS dengan kedalaman taktil (*shadow-inner* container & elevasi tombol aktif).
  - `'enclosed'`: Tab kartu bertingkat (*folder card*) dengan garis aksen warna di sisi atas.
* **Kelengkungan Sudut (`radius`)**:
  - `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'full'` (misal: `radius="full"` untuk *capsule segmented* atau *capsule pills*).
* **Skala Ukuran (`size`)**:
  - `'xs'`: Tab ultra ringkas untuk toolbar filter data tabel.
  - `'sm'`: Tab ringkas untuk filter card.
  - `'md'`: Standar dashboard enterprise (default).
  - `'lg'`: Tab menonjol untuk master data.
  - `'xl'`: Tab hero besar untuk landing/checkout page.

### 3. Teks Konten (Content, Subtitle, & Slots)
* **Tab Dua Baris (*Dual-line Label & Description*)**: Properti `description` pada item tab memungkinkan menampilkan subjudul ringkas di bawah label utama (sangat ideal untuk tab pengaturan & metode pembayaran).
* **Status Dot Bulat (`dot: true`)**: Menampilkan penanda titik status berwarna di samping label tab.
* **Badge Counter / Label (`badge`)**: Mendukung angka atau teks dengan varian status (`badgeVariant: 'primary' | 'warning' | 'danger' | 'success'`).
* **Scoped Slot `#tab`**: Kustomisasi total tombol pemicu tab.
* **Named Slot `#[tab.id]`**: Konten panel modular sesuai ID masing-masing tab.
* **Slot `#extra`**: Konten tambahan di sudut kanan tab bar (misal: tombol CTA *Ekspor Data*).

### 4. Icon & Perataan Vertikal (Iconography & Precision Alignment)
* **Google Material Symbols**: Terintegrasi langsung via properti `icon: 'nama_ikon'`.
* **Posisi Ikon (`iconPosition`)**:
  - `'left'` (Default): Ikon sejajar di sebelah kiri teks.
  - `'top'`: Ikon bertumpuk di atas teks (sangat cocok untuk navigasi aksi cepat atau tampilan mobile).
* **Perataan Vertikal Sempurna**: Menggunakan `inline-flex items-center justify-center font-medium leading-none` sehingga huruf, ikon, dan badge berada tepat sejajar di tengah tanpa pergeseran baseline font.

### 5. Responsif & Aksesibilitas (Responsiveness & ARIA)
* **Scrollable Arrow Controls (`scrollable="true"`)**: Otomatis memunculkan tombol panah kiri (`chevron_left`) dan kanan (`chevron_right`) saat tab melebihi lebar layar.
* **Touch Swipe & Auto-Scroll**: Klik pada tab otomatis menggulirkan tab tersebut ke area pandang tengah (*auto-center scrollIntoView*).
* **Orientasi Vertikal Responsif (`orientation="vertical"`)**: Menjadi menu samping di desktop (`w-64`) dan otomatis beralih ramah-sentuh di perangkat seluler.
* **Navigasi Keyboard ARIA**: Navigasi menggunakan tombol panah Kiri/Kanan (horizontal), Atas/Bawah (vertikal), `Home`, dan `End`.

---

## 🚀 Cara Penggunaan

### 1. Varian Underline Modern (Horizontal Standard)

```vue
<script setup>
import { ref } from 'vue';
import Tabs from '@/Components/Pack/Tabs.vue';

const activeTab = ref('overview');
const tabs = [
  { id: 'overview', label: 'Ringkasan Eksekutif', icon: 'monitoring' },
  { id: 'transactions', label: 'Transaksi Masuk', icon: 'receipt_long', badge: '28', badgeVariant: 'primary' },
  { id: 'disbursement', label: 'Disbursement', icon: 'payments', badge: 'Pending', badgeVariant: 'warning' },
  { id: 'audit', label: 'Audit Trail', icon: 'history', disabled: true },
];
</script>

<template>
  <Tabs :tabs="tabs" v-model="activeTab" variant="underline" color="primary">
    <!-- Konten Tab Ringkasan -->
    <template #overview>
      <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <p class="text-sm">Ringkasan transaksi bulan berjalan.</p>
      </div>
    </template>

    <!-- Konten Tab Transaksi -->
    <template #transactions>
      <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <p class="text-sm">28 transaksi siap diproses.</p>
      </div>
    </template>
  </Tabs>
</template>
```

---

### 2. Varian Segmented Control (macOS/iOS Style)

```vue
<script setup>
import { ref } from 'vue';
import Tabs from '@/Components/Pack/Tabs.vue';

const period = ref('monthly');
const periodTabs = [
  { id: 'daily', label: 'Harian' },
  { id: 'weekly', label: 'Mingguan' },
  { id: 'monthly', label: 'Bulanan' },
  { id: 'yearly', label: 'Tahunan' },
];
</script>

<template>
  <Tabs
    :tabs="periodTabs"
    v-model="period"
    variant="segmented"
    color="primary"
    radius="xl"
    size="sm"
  >
    <template #default="{ activeTab }">
      <p class="text-xs text-slate-500">Filter terpilih: {{ activeTab.label }}</p>
    </template>
  </Tabs>
</template>
```

---

### 3. Varian Pills Capsule (Soft / Solid Style)

```vue
<script setup>
import { ref } from 'vue';
import Tabs from '@/Components/Pack/Tabs.vue';

const activeChannel = ref('qris');
const channels = [
  { id: 'qris', label: 'QRIS Dinamis', icon: 'qr_code_scanner' },
  { id: 'va', label: 'Virtual Account', icon: 'account_balance', badge: '12 Bank' },
  { id: 'ewallet', label: 'E-Wallet', icon: 'account_balance_wallet' },
];
</script>

<template>
  <!-- Pills Soft Kapsul -->
  <Tabs
    :tabs="channels"
    v-model="activeChannel"
    variant="pills"
    tab-style="soft"
    color="indigo"
    radius="full"
    size="sm"
  />

  <!-- Pills Solid Kapsul -->
  <Tabs
    :tabs="channels"
    v-model="activeChannel"
    variant="pills"
    tab-style="solid"
    color="emerald"
    radius="full"
  />
</template>
```

---

### 4. Varian Enclosed & Scrollable Arrow Controls

```vue
<script setup>
import { ref } from 'vue';
import Tabs from '@/Components/Pack/Tabs.vue';

const activeBank = ref('bca');
const bankTabs = [
  { id: 'bca', label: 'BCA VA', icon: 'account_balance' },
  { id: 'mandiri', label: 'Mandiri Livin', icon: 'account_balance' },
  { id: 'bni', label: 'BNI VA', icon: 'account_balance' },
  { id: 'bri', label: 'BRI BRIVA', icon: 'account_balance' },
  { id: 'cimb', label: 'CIMB Niaga', icon: 'account_balance' },
  { id: 'permata', label: 'Permata Bank', icon: 'account_balance' },
  { id: 'bsi', label: 'BSI Hasanah', icon: 'account_balance' },
];
</script>

<template>
  <Tabs
    :tabs="bankTabs"
    v-model="activeBank"
    variant="enclosed"
    color="emerald"
    scrollable
  >
    <template #default="{ activeTab }">
      <div class="p-4 bg-white dark:bg-slate-900 border border-t-0 border-slate-200 dark:border-slate-800 rounded-b-xl">
        Detail Virtual Account untuk {{ activeTab.label }}.
      </div>
    </template>
  </Tabs>
</template>
```

---

### 5. Orientasi Vertikal dengan Deskripsi Dua Baris (*Dual-line Settings*)

```vue
<script setup>
import { ref } from 'vue';
import Tabs from '@/Components/Pack/Tabs.vue';

const activeMenu = ref('security');
const settingsTabs = [
  { id: 'profile', label: 'Profil Usaha', description: 'Legalitas & kontak penanggung jawab', icon: 'person' },
  { id: 'security', label: 'Keamanan & 2FA', description: 'Kata sandi & Google Authenticator', icon: 'lock', badge: 'Wajib', badgeVariant: 'danger' },
  { id: 'webhook', label: 'Webhook', description: 'Callback endpoint URL payload', icon: 'webhook' },
  { id: 'billing', label: 'Biaya & Settlement', description: 'Rekening pencairan dana otomatis', icon: 'payments' },
];
</script>

<template>
  <Tabs
    :tabs="settingsTabs"
    v-model="activeMenu"
    orientation="vertical"
    variant="underline"
    color="primary"
  >
    <template #profile>
      <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h3 class="text-sm font-bold">Informasi Profil</h3>
      </div>
    </template>

    <template #security>
      <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h3 class="text-sm font-bold">Pengaturan 2FA</h3>
      </div>
    </template>
  </Tabs>
</template>
```

---

## 🛠️ API Reference

### Props

| Prop | Tipe Data | Default | Pilihan Nilai / Deskripsi |
| :--- | :--- | :--- | :--- |
| `tabs` | `Array` | **Wajib** | Format item: `{ id, label, description, icon, badge, badgeVariant, dot, disabled }` atau array string `['Tab 1', 'Tab 2']`. |
| `modelValue` | `String \| Number` | `null` | ID tab yang sedang aktif (`v-model`). |
| `variant` | `String` | `'underline'` | Gaya tata letak: `'underline'`, `'pills'`, `'segmented'`, `'enclosed'`. |
| `tabStyle` | `String` | `'soft'` | Gaya pewarnaan: `'soft'`, `'solid'`, `'outline'`. |
| `color` | `String` | `'primary'` | Aksen warna: `'primary'`, `'blue'`, `'indigo'`, `'emerald'`, `'success'`, `'violet'`, `'purple'`, `'amber'`, `'warning'`, `'rose'`, `'danger'`, `'cyan'`, `'sky'`, `'dark'`, `'slate'`. |
| `radius` | `String` | `'xl'` | Kelengkungan sudut: `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'full'`. |
| `size` | `String` | `'md'` | Skala ukuran: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`. |
| `orientation` | `String` | `'horizontal'` | Susunan tab: `'horizontal'`, `'vertical'`. |
| `iconPosition` | `String` | `'left'` | Posisi ikon: `'left'` (samping), `'top'` (atas teks). |
| `fullWidth` | `Boolean` | `false` | Membentang memenuhi lebar container (`flex-1`). |
| `align` | `String` | `'left'` | Perataan horizontal: `'left'`, `'center'`, `'right'`. |
| `showIcon` | `Boolean` | `true` | Menampilkan ikon jika didefinisikan pada tab. |
| `showBadge` | `Boolean` | `true` | Menampilkan badge jika didefinisikan pada tab. |
| `scrollable` | `Boolean` | `false` | Menampilkan tombol panah navigasi saat konten tab horizontal meluap. |
| `lazy` | `Boolean` | `false` | Menunda render panel konten yang tidak aktif ke DOM. |

---

### Slots

| Slot Name | Scope Props | Deskripsi |
| :--- | :--- | :--- |
| `[tab.id]` | `{ tab, active, index }` | Named slot dinamis per ID tab (misal `#overview`, `#security`). |
| `default` | `{ tab, activeTab, activeIndex }` | Fallback slot umum jika named slot tidak didefinisikan. |
| `tab` | `{ tab, active, index }` | Kustomisasi elemen pemicu tab (mengganti teks, ikon, dan badge). |
| `extra` | — | Konten tambahan di ujung kanan header horizontal (misal tombol aksi CTA). |

---

### Events

| Event Name | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `update:modelValue` | `tabId: String \| Number` | Dipancarkan saat tab aktif berubah (`v-model`). |
| `change` | `{ tab: Object, index: Number }` | Dipancarkan saat pengguna memilih tab baru. |

---

## ♿ Aksesibilitas & Navigasi Keyboard

- Standar atribut WAI-ARIA lengkap: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `role="tabpanel"`.
- **Navigasi Panah**:
  - Horizontal: `ArrowRight` & `ArrowLeft` berpindah antar tab.
  - Vertikal: `ArrowDown` & `ArrowUp` berpindah antar tab.
  - `Home`: Melompat langsung ke tab pertama yang aktif.
  - `End`: Melompat langsung ke tab terakhir yang aktif.
  - Tab dengan status `disabled: true` otomatis dilewati saat navigasi keyboard.
