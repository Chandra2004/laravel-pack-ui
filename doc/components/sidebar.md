# Sidebar Component

Komponen bilah navigasi samping (*vertical sidebar navigation*) kelas enterprise dengan arsitektur Dual-API (deklaratif berbasis sub-komponen *Compound Components* dan konfiguratif berbasis array data `:items="[...]"`), pemisahan header aplikasi dari navigasi (*decoupled header*), dukungan hierarki anak turunan bertingkat (*multi-level nested submenus*), transisi ciut (*collapse*), tombol toggle melayang (*floating toggle button*), pintasan keyboard global `Ctrl+B`, serta tata letak responsif lintas desktop, tablet, dan ponsel (*mobile drawer*).

---

## 01. Overview

`Sidebar` dirancang khusus untuk memandu alur navigasi aplikasi dashboard SaaS berskala besar:

- **Arsitektur Dual-API Fleksibel**: Mendukung mode deklaratif menggunakan sub-komponen (`SidebarHeader`, `SidebarNav`, `SidebarGroup`, `SidebarItem`, `SidebarFooter`) maupun mode berbasis konfigurasi array data (`:items="[...]"`).
- **Pemisahan Header Mandiri (Decoupled Header)**: Secara default (`:show-header="false"`), sidebar fokus murni sebagai navigasi samping tanpa memaksakan header brand internal, sehingga dapat dipasangkan secara serasi dengan Topbar Header horizontal utama aplikasi. Tersedia opsi `:show-header="true"` atau slot `#header` jika ingin menyertakan logo brand langsung di dalam bilah samping.
- **Hierarki Anak Turunan Bertingkat (Multi-Level Submenus)**: Mendukung menu anak turunan bersarang hingga Level 3 dan seterusnya dengan animasi akordion halus, garis panduan pohon (*tree guideline*), serta deteksi otomatis status aktif rantai leluhur (*ancestor chain*).
- **Variasi Visual Beragam (7 Varian Desain)**: Menyediakan gaya tampilan bervariasi: `default`, `bordered`, `floating`, `rail`, `glass`, `flat`, dan `gradient`.
- **Animasi Ciut & Melebar Halus**: Transisi perpindahan lebar sidebar antara mode normal (lebar `w-64` atau `w-72`) dan mode ciut ringkas (`w-16`) tanpa loncatan tata letak (*zero layout jump*).
- **Flyout & Accordion Submenu**: Saat diperluas, submenu terbuka sebagai akordion bertingkat; saat diciutkan, submenu bertransformasi menjadi popover melayang (*hover flyout menu*).
- **Pintasan Keyboard Global (Ctrl+B / Cmd+B)**: Pengguna profesional dapat menciutkan atau memperluas sidebar secara instan menggunakan kombinasi tombol keyboard.
- **Persistensi Preferensi LocalStorage**: Menyimpan status ciut pengguna secara otomatis di peramban (`localStorage`) agar tetap konsisten saat berpindah rute halaman.

### 1.1 Apa Entitas Ini

**Vue Component** (Single File Component) yang berlokasi di [Sidebar.vue](file:///c:/SPEED/LARAVEL-PACK-UI/resources/js/Components/Pack/Sidebar.vue) dan [SidebarComponent.vue](file:///c:/SPEED/LARAVEL-PACK-UI/resources/js/Components/Pack/SidebarComponent.vue). Komponen ini mengekspos facade utama beserta sub-komponen terintegrasi dan composable [useSidebar.js](file:///c:/SPEED/LARAVEL-PACK-UI/resources/js/Composables/Pack/useSidebar.js).

### 1.2 Fungsi Utama

- Mengorganisir struktur navigasi rute aplikasi multi-halaman dalam hierarki bertingkat yang rapi dan terstruktur.
- Memberikan indikator lencana (*badge notification counter*) pada modul yang memerlukan perhatian pengguna (misal: "Pesanan Baru (14)").
- Memisahkan bilah navigasi dengan topbar aplikasi secara fleksibel agar tata letak tidak tumpang tindih.
- Mengoptimalkan ruang kerja data visual dengan memberikan opsi penciutan bilah samping bagi pengguna.
- Beralih secara otomatis menjadi drawer geser samping (*off-canvas sheet*) pada layar tablet dan perangkat seluler.

### 1.3 Kapan Digunakan

- Portal dasbor administratif korporat (ERP, CRM, Billing Portal, atau Cloud Console).
- Aplikasi web SaaS multi-tenant dengan modul fungsionalitas yang padat dan memiliki menu anak turunan bersarang.
- Sistem manajemen konten (*Content Management System* / CMS) dengan banyak entitas publikasi.
- Aplikasi e-commerce backoffice untuk pemrosesan katalog produk, faktur keuangan, dan logistik.

### 1.4 Karakteristik Penting

- **Floating Border Toggle**: Tombol bulat melayang di garis batas tepi sidebar (*linear / Notion style*) yang memudahkan penciutan kapan saja.
- **Kompatibilitas Inertia.js Link**: Mendukung tag tautan bawaan `@inertiajs/vue3` untuk navigasi SPA cepat tanpa memuat ulang seluruh halaman web.
- **Kombinasi Gaya Item Semantik**: Menyediakan 4 gaya pewarnaan item aktif: `soft` (latar pastel lembut), `solid` (warna pekat berbayangan), `outline` (garis tepi kontras), dan `pill` (kapsul membulat penuh).
- **Penggunaan Komponen Atomik**: Sepenuhnya memanfaatkan komponen Pack UI seperti `ButtonSubmit`, `Badge`, `InputField`, dan `Avatar` tanpa tag HTML mentah yang tidak terstandardisasi.

---

## 02. Preview

> [!TIP]
> Pengujian visual dan showcase interaktif entitas ini tersedia secara native pada rute demo native:
>
> <a href="/demo/sidebar" target="_self" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 8px; background-color: var(--vp-c-brand-1, #4f46e5); color: #ffffff;">Buka Live Demo Komponen Sidebar &rarr;</a>

---

## 03. Usage

### Pohon Konsep Penggunaan

```text
Sidebar
├── Pemisahan Header (:show-header="false" vs :show-header="true")
│   ├── Mode Terpisah: Sidebar murni navigasi + Topbar aplikasi eksternal
│   └── Mode Terintegrasi: Header brand langsung di dalam bilah samping
├── Hierarki Menu Bersarang (Anak Turunan)
│   ├── Level 1: Menu Utama / Induk
│   ├── Level 2: Sub-menu Cabang (children: [])
│   └── Level 3: Sub-menu Daun / Aksi Detail
├── Variasi Gaya Visual (:variant="...")
│   ├── default (Latar Slate Lembut)
│   ├── bordered (Garis Batas Kontras 2px)
│   ├── floating (Pulau Melayang Kartu)
│   ├── rail (Dok Ikon Ramping)
│   ├── glass (Kaca Buram Transparan)
│   ├── flat (Murni Seamless)
│   └── gradient (Gradasi Halus)
├── Mode Konfiguratif (Config-Driven)
│   ├── Daftar Item Hirarkis (:items="menuList")
│   └── Sinkronisasi Status (v-model:collapsed="isCollapsed")
└── Mode Responsif 3-Perangkat
    ├── Desktop (Lebar w-64 atau dock w-16)
    ├── Tablet (Auto-collapse atau drawer terpilih)
    └── Mobile (Slide-in off-canvas drawer dengan backdrop blur)
```

### Sintaks Dasar Single File Component

```vue
<script setup>
import { ref } from 'vue';
import Sidebar from '@/Components/Pack/Sidebar.vue';

const isCollapsed = ref(false);

const navigationItems = [
    { label: 'Dashboard', icon: 'dashboard', href: '/dashboard', active: true },
    { label: 'Analitik Data', icon: 'analytics', href: '/analytics', badge: 'Live', badgeVariant: 'emerald' },
    {
        label: 'Finansial & Tagihan',
        icon: 'receipt_long',
        children: [
            { label: 'Ringkasan Saldo', icon: 'account_balance_wallet', href: '/finance/overview' },
            {
                label: 'Faktur Penjualan',
                icon: 'description',
                children: [
                    { label: 'Invoice Reguler', icon: 'receipt', href: '/finance/invoices/regular' },
                    { label: 'Nota Retur Kredit', icon: 'undo', href: '/finance/invoices/credits', badge: 'Draf', badgeVariant: 'amber' },
                    { label: 'Rekap Faktur Pajak', icon: 'request_quote', href: '/finance/invoices/tax' },
                ],
            },
            { label: 'Rekonsiliasi Bank', icon: 'account_balance', href: '/finance/reconcile' },
        ],
    },
    { separator: true },
    { heading: 'Sistem' },
    { label: 'Pengaturan', icon: 'settings', href: '/settings' },
];

function onNavigate(item) {
    console.log('Navigasi ke:', item.label);
}
</script>

<template>
    <div class="flex h-screen bg-slate-50 dark:bg-slate-950">
        <!-- Sidebar Navigation Murni (Header Terpisah) -->
        <Sidebar
            :items="navigationItems"
            v-model:collapsed="isCollapsed"
            :show-header="false"
            variant="default"
            color="indigo"
            item-style="soft"
            radius="xl"
            @navigate="onNavigate"
        />

        <!-- Canvas Utama Dashboard -->
        <main class="flex-1 p-8 overflow-y-auto">
            <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">
                Dashboard Konten
            </h1>
        </main>
    </div>
</template>
```

---

## 04. Anatomy

Struktur arsitektur visual `Sidebar` tersusun dari blok-blok pembangun berikut:

```text
+-------------------------------------------------------------+
| [1] Header Bar (Opsional): [Logo] Brand Name (Admin Portal) |
+-------------------------------------------------------------+
| [2] Top Extra Slot: (Workspace Switcher / Search Input)     |
+-------------------------------------------------------------+
| [3] Navigation Group: "Layanan Finansial"                   |
|   [*] Dashboard                                             |
|   [*] Analitik & Metrik                  [Live] (Badge)     |
|   [*] Layanan Finansial                  [v] (Chevron)      |
|       |-- Ringkasan Saldo                                   |
|       |-- Faktur Penjualan               [v] (Level 2)      |
|           |-- Invoice Reguler            [*] (Level 3)      |
|           |-- Nota Retur Kredit          [Draf] (Level 3)   |
|                                                             |
| ----------------------------------------------------------- |
| [4] Navigation Heading: "SISTEM"                            |
|   [*] Manajemen Akses RBAC                                  |
|   [*] Kunci API                          [v4.2]             |
+-------------------------------------------------------------+
| [5] Floating Border Toggle Button: [ < / > ]                |
+-------------------------------------------------------------+
| [6] Footer Bar: [Avatar] User Profile & Logout              |
+-------------------------------------------------------------+
```

### Rincian Bagian Anatomi

1. **Header Bar (Opsional)**: Area atas yang memuat ikon logo entitas, nama merek (`brandName`), dan sub-judul merek (`brandSub`). Dinonaktifkan secara default (`:show-header="false"`) agar terpisah dari topbar horizontal utama aplikasi.
2. **Top Extra Slot**: Ruang kustom di bawah header untuk pemilih ruang kerja (*workspace dropdown*) atau kotak pencarian cepat via slot `#top`.
3. **Hierarki Anak Turunan (Multi-Level Submenus)**: Susunan tautan navigasi bersarang dengan garis pembimbing vertikal (*tree guideline*) yang elegan untuk Level 1, Level 2, dan Level 3.
4. **Separators & Headings**: Pembagi kategori modul untuk membedakan alur operasional dan konfigurasi sistem.
5. **Floating Border Toggle Button**: Tombol bulat melayang di garis pemisah samping untuk aksi ciut/melebar yang cepat.
6. **Footer Bar**: Area bawah untuk informasi akun pengguna aktif, tombol bantuan, atau tombol keluar (*logout*) via slot `#footer`.

---

## 05. Variants

Prop `variant` mengatur gaya visual bingkai luar dan elevasi `Sidebar`:

| Varian | Karakter Tampilan | Skenario Penggunaan |
| :--- | :--- | :--- |
| `default` | Latar slate lembut dengan garis pemisah tipis minimalis (**Default**) | Antarmuka aplikasi modern dengan konsistensi latar belakang serasi. |
| `bordered` | Latar putih/gelap bersih dengan garis batas pembatas tegas 2px | Dasbor standar korporat, aplikasi akuntansi, dan portal keuangan. |
| `floating` | Pulau kartu modern melayang dengan margin luar dan bayangan lembut | Dasbor analitik modern bergaya SaaS studio atau portal pengembang. |
| `rail` | Dok ramping ringkas berbasis ikon dengan bayangan tegas | Ruang kerja produktivitas padat yang mengutamakan luas area kanvas. |
| `glass` | Efek kaca buram (*frosted glass*) dengan `backdrop-blur-xl` tembus pandang | Antarmuka web modern premium dengan latar belakang gradien halus. |
| `flat` | Murni transparan tanpa garis pemisah samping (*seamless blend*) | Tata letak dokumen atau dashboard minimalis tanpa sekat tegas. |
| `gradient` | Permukaan dengan gradasi vertikal halus dari atas ke bawah | Halaman berorientasi branding atau presentasi visual korporat. |

---

## 06. Sizes

### Skala Lebar Sidebar (`width` & `collapsedWidth`)

- **Expanded Width (`width`)**:
  - `'56'`: Lebar `w-56` (224px). Sangat kompak, cocok untuk aplikasi dengan menu singkat.
  - `'64'`: Lebar `w-64` (256px) (**Default**). Ukuran standar industri untuk dashboard SaaS.
  - `'72'`: Lebar `w-72` (288px). Ideal untuk modul dengan label menu panjang atau terjemahan multi-bahasa.
  - `'80'`: Lebar `w-80` (320px). Ukuran maksimal untuk navigasi dengan informasi hierarki kompleks.
- **Collapsed Width (`collapsedWidth`)**:
  - `'14'`: Lebar `w-14` (56px).
  - `'16'`: Lebar `w-16` (64px) (**Default**). Memuat ikon tunggal secara simetris dan proporsional.
  - `'20'`: Lebar `w-20` (80px).

---

## 07. States

| State | Indikasi Visual | Perilaku Interaktif |
| :--- | :--- | :--- |
| **Expanded** | Sidebar terbuka penuh dengan lebar `w-64`; seluruh label teks dan heading terlihat jelas. | Menampilkan submenu dalam bentuk accordion yang meluncur ke bawah (*collapsible tree*). |
| **Collapsed** | Sidebar menciut ke lebar `w-16`; label teks tersembunyi, hanya menampilkan ikon. | Mengarahkan kursor ke item dengan submenu memicu popover flyout mengambang di samping kanan ikon. |
| **Active Item** | Item memiliki aksen warna semantik (sesuai prop `color` dan `itemStyle`) dengan indikator garis tepi. | Menandai rute halaman yang sedang aktif saat ini. Cabang leluhur otomatis terbuka. |
| **Mobile Drawer Open** | Sidebar desktop disembunyikan; laci navigasi meluncur dari kiri dengan overlay backdrop gelap blur. | Interaksi klik di luar laci atau penekanan tombol Escape otomatis menutup drawer seluler. |

---

## 08. Props / Attributes

| Nama Prop | Tipe Data | Nilai Bawaan | Opsi / Rentang | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `items` | `Array` | `[]` | Array of item objects | Daftar item navigasi hierarkis (label, icon, href, children, dll). |
| `showHeader` | `Boolean` | `false` | `true`, `false` | Pemisahan Header: false untuk memisahkan sidebar murni dari header aplikasi; true untuk menampilkan header brand internal. |
| `collapsed` | `Boolean` | `null` | `true`, `false`, `null` | Status ciut sidebar untuk pengikatan dua arah (`v-model:collapsed`). |
| `collapsible` | `Boolean` | `true` | `true`, `false` | Menentukan apakah sidebar diizinkan untuk diciutkan/diperluas. |
| `floatingToggle` | `Boolean` | `true` | `true`, `false` | Menampilkan tombol ciut bulat melayang di garis batas samping. |
| `persistKey` | `String \| Boolean` | `'pack_sidebar_collapsed'` | String key / `false` | Kunci penyimpanan status di `localStorage` (`false` untuk mematikan). |
| `enableShortcut` | `Boolean` | `true` | `true`, `false` | Mengaktifkan pintasan keyboard `Ctrl+B` / `Cmd+B` untuk toggle ciut. |
| `width` | `String` | `'64'` | `'56'`, `'64'`, `'72'`, `'80'` | Lebar sidebar saat dalam posisi diperluas. |
| `collapsedWidth` | `String` | `'16'` | `'14'`, `'16'`, `'18'`, `'20'` | Lebar sidebar saat dalam posisi diciutkan. |
| `variant` | `String` | `'default'` | `'default'`, `'bordered'`, `'floating'`, `'rail'`, `'glass'`, `'flat'`, `'gradient'` | Gaya visual kontainer pembungkus sidebar. |
| `color` | `String` | `'primary'` | `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'` | Palet warna semantik untuk item menu aktif. |
| `itemStyle` | `String` | `'soft'` | `'soft'`, `'solid'`, `'outline'`, `'pill'` | Gaya pewarnaan item menu yang sedang aktif. |
| `radius` | `String` | `'xl'` | `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'full'` | Kelengkungan sudut item menu dan kontainer. |
| `size` | `String` | `'md'` | `'sm'`, `'md'`, `'lg'` | Skala ukuran tipografi dan jarak padding menu. |
| `brandName` | `String` | `''` | Teks bebas | Judul utama nama merek di header sidebar. |
| `brandSub` | `String` | `''` | Teks bebas | Sub-judul atau keterangan versi di header sidebar. |
| `showFooter` | `Boolean` | `false` | `true`, `false` | Menampilkan bilah footer akun pengguna di bagian bawah. |
| `mobileBreakpoint` | `Number` | `768` | Angka piksel (lebar layar) | Batas lebar layar peramban untuk beralih ke mobile drawer. |
| `tabletBreakpoint` | `Number` | `1024` | Angka piksel (lebar layar) | Batas lebar layar peramban untuk kategori tablet. |
| `autoCollapseTablet`| `Boolean` | `false` | `true`, `false` | Otomatis menciutkan sidebar menjadi dock saat layar masuk rentang tablet. |
| `mobileOpen` | `Boolean` | `null` | `true`, `false`, `null` | Status visibilitas laci seluler (`v-model:mobileOpen`). |
| `activeRoute` | `String` | `''` | String path URL | Rute URL yang sedang aktif untuk penandaan otomatis item. |
| `teleport` | `Boolean` | `true` | `true`, `false` | Menentukan apakah mobile drawer diteleport ke `body` (default: `true`). Set ke `false` untuk simulator/wadah terisolasi agar drawer tidak meluap ke layar peramban asli. |
| `forceMobile` | `Boolean` | `null` | `true`, `false`, `null` | Memaksa status mobile aktif (berguna untuk pengujian atau frame simulator tanpa bergantung pada ukuran peramban). |
| `forceTablet` | `Boolean` | `null` | `true`, `false`, `null` | Memaksa status tablet aktif pada simulator. |

---

## 09. Slots

| Nama Slot | Properti yang Disediakan | Deskripsi Penggunaan |
| :--- | :--- | :--- |
| `#default` | — | Wadah utama untuk mode deklaratif sub-komponen `SidebarNav` dan `SidebarItem`. |
| `#header` | `{ isCollapsed }` | Mengambil alih tampilan header brand atas saat `showHeader` aktif. |
| `#logo` | — | Mengambil alih tampilan logo brand pada saat sidebar diperluas. |
| `#logo-collapsed` | — | Tampilan logo ringkas (ikon) saat sidebar berada pada mode ciut. |
| `#header-extra` | — | Aksi tambahan di samping tombol toggle pada header brand. |
| `#top` | `{ isCollapsed }` | Wadah di bawah header untuk pemilih ruang kerja (*workspace switcher*) atau kotak cari. |
| `#item` | `{ item, isActive, isCollapsed }` | Mengambil alih format rendering setiap tautan navigasi item. |
| `#footer` | `{ isCollapsed }` | Mengambil alih tampilan bilah bawah profil akun pengguna. |
| `#mobile-header` | — | Mengambil alih bilah judul atas pada laci drawer seluler. |
| `#mobile-footer` | — | Mengambil alih bilah bawah footer khusus pada laci drawer seluler. |

---

## 10. Events / Interactions

### Events yang Dipancarkan (Emits)

| Nama Event | Parameter Emitted | Waktu Pemicuan (Trigger Lifecycle) |
| :--- | :--- | :--- |
| `@update:collapsed` | `(value: Boolean)` | Dipancarkan saat status ciut/melebar sidebar berganti. |
| `@update:mobileOpen` | `(value: Boolean)` | Dipancarkan saat status drawer seluler dibuka atau ditutup. |
| `@navigate` | `(item: Object)` | Dipancarkan saat tautan item navigasi diklik oleh pengguna. |

### API Publik yang Diekspos (`defineExpose`)

Melalui template `ref="sidebarRef"`, komponen induk dapat mengakses metode dan state reaktif publik berikut:

| Method / Property | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `toggleCollapse()` | `Function` | Membalikkan status ciut atau melebar sidebar desktop. |
| `openMobile()` | `Function` | Membuka laci drawer seluler pada layar mobile/tablet. |
| `closeMobile()` | `Function` | Menutup laci drawer seluler. |
| `isCollapsed` | `ComputedRef<Boolean>` | State reaktif boolean apakah sidebar dalam posisi ciut. |
| `isMobileOpen` | `ComputedRef<Boolean>` | State reaktif boolean apakah drawer seluler sedang terbuka. |
| `isMobile` | `ComputedRef<Boolean>` | State reaktif boolean apakah layar berada di bawah breakpoint mobile. |
| `isTablet` | `ComputedRef<Boolean>` | State reaktif boolean apakah layar berada di rentang breakpoint tablet. |

---

## 11. Code Example

Contoh implementasi tata letak profesional dengan header topbar terpisah dan sidebar dengan anak turunan 3 tingkat:

```vue
<script setup>
import { ref } from 'vue';
import {
    Sidebar,
    SidebarNav,
    SidebarItem,
    SidebarFooter,
} from '@/Components/Pack/Sidebar.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';
import Avatar from '@/Components/Pack/Avatar.vue';
import Badge from '@/Components/Pack/Badge.vue';

const isCollapsed = ref(false);
const sidebarRef = ref(null);
const currentRoute = ref('/finance/invoices/regular');

const menuItems = [
    { label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
    {
        label: 'Layanan Finansial',
        icon: 'receipt_long',
        children: [
            { label: 'Ringkasan Akun', icon: 'account_balance_wallet', href: '/finance/overview' },
            {
                label: 'Faktur Tagihan',
                icon: 'description',
                children: [
                    { label: 'Invoice Reguler', icon: 'receipt', href: '/finance/invoices/regular' },
                    { label: 'Nota Retur', icon: 'undo', href: '/finance/invoices/returns', badge: 'Draf' },
                ],
            },
        ],
    },
    { separator: true },
    { label: 'Pengaturan', icon: 'settings', href: '/settings' },
];

function openMobile() {
    sidebarRef.value?.openMobile();
}
</script>

<template>
    <div class="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <!-- 1. Sidebar Navigasi Murni (Tanpa Header Internal) -->
        <Sidebar
            ref="sidebarRef"
            :items="menuItems"
            v-model:collapsed="isCollapsed"
            :show-header="false"
            :active-route="currentRoute"
            variant="default"
            color="indigo"
            item-style="soft"
            radius="xl"
            @navigate="(item) => currentRoute = item.href"
        />

        <!-- 2. Area Kerja Utama dengan Topbar Header Terpisah -->
        <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
            <!-- Header Topbar Horizontal Luar -->
            <header class="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between shrink-0">
                <div class="flex items-center gap-3">
                    <ButtonSubmit
                        variant="ghost"
                        size="xs"
                        icon="menu"
                        class="md:hidden"
                        @click="openMobile"
                    />
                    <span class="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {{ currentRoute }}
                    </span>
                </div>
                <div class="flex items-center gap-3">
                    <Badge variant="soft" color="emerald">Sistem Online</Badge>
                    <Avatar name="Admin User" size="sm" status="online" rounded="full" />
                </div>
            </header>

            <!-- Isi Konten Kanvas -->
            <main class="flex-1 p-6 overflow-y-auto">
                <h1 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Konten Halaman
                </h1>
            </main>
        </div>
    </div>
</template>
```

---

## 12. Result / Behavior

1. **Pemisahan Header & Sidebar Bersih**: Tidak terjadi penumpukan judul brand atau tombol hamburger yang ganda antara header atas dan sidebar samping.
2. **Garis Pembimbing Pohon (*Tree Guideline*)**: Pada submenu anak turunan bersarang, garis batas vertikal di sebelah kiri memandu mata pengguna dalam memahami kedalaman hierarki navigasi.
3. **Deteksi Rute Aktif Rantai Leluhur**: Ketika pengguna mendarat di rute anak turunan (misal: Level 3), seluruh cabang induk otomatis terdeteksi aktif dan terbuka secara mulus.
4. **Transisi Lebar Terkendali**: Menggunakan transisi Tailwind `transition-all duration-300 ease-in-out` dengan overflow terisolasi untuk memastikan teks menu menghilang dengan opasitas halus saat sidebar menciut.
5. **Flyout Teleportasi Cerdas**: Saat sidebar diciutkan, submenu tidak memanjangkan sidebar melainkan memunculkan popover flyout mengambang di sisi kanan yang otomatis menutup jika kursor mouse bergerak menjauh.
6. **Penyelamatan Pintasan Global**: Menekan tombol kombinasi `Ctrl+B` atau `Cmd+B` mendeteksi event keyboard global dan membalik status `isCollapsed` tanpa mengganggu fokus elemen masukan teks form.

---

## 13. Customization

### Menggunakan Bilah Dok Ikon Ramping (Rail Compact Mode)

```vue
<template>
    <Sidebar
        :items="compactItems"
        variant="rail"
        color="cyan"
        item-style="soft"
        radius="xl"
    />
</template>
```

### Menggunakan Efek Kaca Buram (Frosted Glass Mode)

```vue
<template>
    <Sidebar
        :items="navItems"
        variant="glass"
        color="rose"
        item-style="soft"
        :show-header="true"
        brand-name="Glass Workspace"
        brand-sub="Portal Frosted v2"
    />
</template>
```

### Menggunakan Gradasi Vertikal Mewah (Gradient Brand Mode)

```vue
<template>
    <Sidebar
        :items="navItems"
        variant="gradient"
        color="emerald"
        item-style="solid"
        :show-header="true"
        brand-name="Enterprise Cloud"
        brand-sub="Console Admin v4"
    />
</template>
```

### Menggunakan Gaya Pulau Melayang (Floating Island macOS Style)

```vue
<template>
    <Sidebar
        :items="studioItems"
        variant="floating"
        color="purple"
        radius="xl"
    />
</template>
```

---

## 14. Accessibility

- **Elemen Semantik `<aside>` dan `<nav>`**: Memenuhi struktur semantik HTML5 dengan atribut `aria-label="Navigasi Utama Aplikasi"`.
- **Keyboard Navigation**: Seluruh item menu dan tombol toggle dapat difokuskan menggunakan tombol `Tab` dan diaktifkan dengan tombol `Enter` atau `Space`.
- **Penutupan Drawer Mobile via Escape**: Menekan tombol keyboard `Escape` saat drawer seluler terbuka akan langsung menutup panel dan mengembalikan fokus ke tombol pembuka hamburger.
- **Standar Tombol `type="button"`**: Seluruh pemicu interaktif menggunakan elemen tombol dengan atribut `type="button"` eksplisit untuk mencegah *form submission* yang tidak disengaja.

---

## 15. Responsive Behavior

- **Mobile Viewport (< 768px)**:
  - Sidebar desktop disembunyikan secara otomatis untuk memberikan ruang layar penuh bagi konten utama.
  - Membuka laci geser (*slide-in mobile drawer*) via tombol hamburger navbar atau metode `openMobile()`.
  - Tombol penutup laci memanfaatkan `ButtonSubmit` berbentuk pill bundar yang mudah disentuh jari (*touch target* nyaman).
  - Teks lencana status di dalam menu secara terpadu menggunakan komponen `Badge` dengan ukuran kompak `size="xs"`.
- **Tablet Viewport (768px - 1024px)**:
  - Mengadaptasi ruang layar menengah dengan opsi mode ciut (*collapsed width w-16*) secara bawaan atau memanfaatkan prop `autoCollapseTablet="true"`.
  - Interaksi cepat tetap terjaga melalui popover flyout melayang tanpa mengorbankan ruang tabel data atau grafik analitik.
- **Desktop Viewport (>= 1024px)**:
  - Sidebar berlabuh permanen dengan opsi transisi ciut/melebar bebas via tombol floating chevron samping, toggle header, atau pintasan keyboard global `Ctrl+B`.

---

## 16. Do / Don't

| Do (Praktik Direkomendasikan) | Don't (Praktik Dihindari) |
| :--- | :--- |
| **Pisahkan header aplikasi dari sidebar (`showHeader: false`)**: Gunakan topbar horizontal untuk judul dan profil global, lalu biarkan sidebar fokus pada navigasi rute. | **Jangan menduplikasi logo brand di sidebar jika sudah ada di topbar header**: Membuat antarmuka terlihat sempit dan membingungkan pengguna. |
| **Gunakan `persistKey` pada aplikasi multi-halaman**: Mempertahankan preferensi ruang kerja pengguna saat berpindah halaman rute. | **Jangan menumpuk submenu lebih dari 3 tingkat kedalaman**: Hierarki yang terlalu dalam menyulitkan navigasi di layar kecil. |
| **Gunakan lencana status (`badge`) untuk peringatan operasional**: Memudahkan pengguna melihat notifikasi pesanan tertunda secara instan. | **Jangan menonaktifkan `collapsible` jika layar dashboard memuat tabel data lebar**: Berikan fleksibilitas bagi pengguna untuk memperluas area tabel. |
| **Letakkan item profil dan keluar di bilah footer**: Memberikan pemisahan yang jelas antara navigasi tugas bisnis dan akun. | **Jangan menghilangkan ikon pada mode ciut**: Ikon adalah satu-satunya penanda visual saat teks label tersembunyi. |

---

## 17. Examples / Recipes

### Recipe 1: Dashboard E-Commerce dengan Notifikasi Pesanan

```vue
<script setup>
import Sidebar from '@/Components/Pack/Sidebar.vue';

const ecommerceMenu = [
    { label: 'Katalog Produk', icon: 'inventory', href: '/products' },
    { label: 'Pesanan Masuk', icon: 'shopping_cart', href: '/orders', badge: '8 Baru', badgeVariant: 'rose' },
    { label: 'Pelanggan', icon: 'person', href: '/customers' },
    { separator: true },
    { label: 'Laporan Finansial', icon: 'payments', href: '/reports' },
];
</script>

<template>
    <Sidebar :items="ecommerceMenu" color="rose" variant="bordered" :show-header="false" />
</template>
```

### Recipe 2: Developer Platform Cloud Console dengan Anak Turunan

```vue
<script setup>
import Sidebar from '@/Components/Pack/Sidebar.vue';

const devMenu = [
    { label: 'Klaster Kubernetes', icon: 'hub', href: '/clusters' },
    {
        label: 'Keamanan & Akses',
        icon: 'security',
        children: [
            { label: 'Kunci API', icon: 'key', href: '/security/keys' },
            {
                label: 'Kebijakan IAM',
                icon: 'policy',
                children: [
                    { label: 'Matriks Peran', icon: 'admin_panel_settings', href: '/security/iam/roles' },
                    { label: 'Audit Trail', icon: 'history', href: '/security/iam/audit' },
                ],
            },
        ],
    },
    { label: 'Container Registry', icon: 'archive', href: '/registry' },
];
</script>

<template>
    <Sidebar :items="devMenu" color="indigo" variant="floating" :show-header="false" />
</template>
```

---

## 18. Related Components

- [Badge](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/badge.md): Lencana penghitung status yang disematkan di sebelah label menu sidebar secara terintegrasi.
- [ButtonSubmit](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/button-submit.md): Tombol interaktif untuk kontrol pembuka dan penutup drawer mobile sidebar.
- [InputField](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/input-field.md): Masukan pencarian atau switch kontrol preferensi sidebar.
- [ButtonTheme](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/button-theme.md): Tombol pengalih tema gelap/terang yang sering dipasang pada footer sidebar.
- [Avatar](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/avatar.md): Foto profil pengguna yang diletakkan pada bilah footer sidebar.
- [Card](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/card.md): Kartu kontainer untuk metrik dan panel dalam tata letak aplikasi.
- [Breadcrumb](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/breadcrumb.md): Penanda hierarki rute halaman pendamping navigasi sidebar.

---

## 19. Notes / Limitations

- **Penyimpanan LocalStorage**: Prop `persistKey` menggunakan `window.localStorage`. Pada pengujian unit test tanpa lingkungan DOM atau saat fitur penyimpanan peramban diblokir, komponen secara aman menggunakan fallback memori reaktif lokal tanpa menimbulkan exception error.
- **Z-Index pada Mode Mobile**: Drawer seluler menggunakan kelas `z-50` dengan backdrop tembus pandang. Pastikan tidak ada elemen overlay luar yang menimpa tingkat tumpukan `z-50`.
- **Pemisahan Header & Fleksibilitas Layout**: Direkomendasikan mempertahankan `:show-header="false"` jika aplikasi Anda memiliki bar header atas tersendiri (*external topbar*), guna menjaga konsistensi visual dan menghindari redundansi ruang vertikal.
