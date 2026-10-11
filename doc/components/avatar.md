# Avatar Component

## 01. Overview

Avatar adalah komponen representasi visual profil pengguna berbasis Vue 3 dan Tailwind CSS untuk aplikasi Laravel Inertia. Komponen ini dirancang untuk menyajikan foto profil pengguna secara adaptif dengan sistem fallback cerdas tanpa celah kegagalan tampilan: jika foto profil gagal dimuat atau belum diunggah, komponen otomatis merender inisial nama dengan gradien warna deterministik, atau ikon siluet standar jika nama tidak tersedia.

Selain fungsi visual dasar, komponen ini dilengkapi modul interaktivitas tingkat lanjut: **Profile Dropdown Popover** dengan pengubah status kehadiran instan (*quick status switcher*), **Instagram Story Ring** (cincin cerita interaktif unread, close friends, dan live streaming), **Radar Pulse Presence Indicator** (gelombang ping status online), **Verified Official Badge** (lencana verifikasi akun resmi), serta subkomponen **`AvatarGroup.vue`** untuk menampilkan tumpukan tim kolaborator secara elegan.

### Fungsi Utama
* Menampilkan foto profil pengguna dengan aspek rasio presisi dan pemotongan rapi (`object-cover`).
* Mencegah tampilan gambar rusak (*broken image icon*) melalui rantai fallback otomatis: Foto -> Inisial Nama -> Ikon Material Symbols.
* Menghasilkan gradien warna latar belakang inisial secara deterministik berdasarkan nama pengguna (nama yang sama selalu menghasilkan warna yang sama).
* Menyajikan indikator kehadiran (*presence status*) dengan 4 status standar (*online*, *away*, *busy*, *offline*) beserta animasi radar pulse ping.
* Menyediakan popover menu profil instan yang mendukung deteksi klik di luar (*click-outside*) dan navigasi keyboard.
* Menyajikan tumpukan avatar tim kolaborasi dengan pembatasan jumlah maksimal (`max`) dan gelembung sisa anggota (`+N`).

### Kapan Digunakan
* **Header Navigasi / Topbar**: Sebagai tombol identitas akun pengguna yang dapat diklik untuk membuka menu dropdown profil dan opsi keluar (*log out*).
* **Tabel & Daftar Pengguna**: Menampilkan identitas visual pengguna di samping nama, email, dan peran (*role*) dalam panel admin.
* **Kolaborasi Realtime**: Menampilkan daftar pengguna yang sedang aktif melihat atau menyunting dokumen secara bersamaan menggunakan `AvatarGroup`.
* **Feed & Percakapan (Chat / Komentar)**: Menampilkan foto pengirim pesan beserta lencana terverifikasi (*verified badge*) dan status online.
* **Timeline Aktivitas**: Menampilkan jejak audit pelaku aksi (*user log*) dalam sistem.

### Karakteristik Penting
* **Graceful Fallback Chain**: Event `@error` pada elemen gambar langsung mengaktifkan kalkulasi inisial nama tanpa jeda (*flicker*).
* **Deterministic Color Hash**: Algoritma hashing string ringan mengubah nama menjadi salah satu dari 8 palet gradien modern secara konsisten.
* **Instagram Story Ring Mode**: Cincin terluar berjarak (*ring offset*) dengan gradien warna Instagram, cincin hijau *Close Friends*, atau cincin merah berkedip untuk siaran *LIVE*.
* **Aksesibilitas Terintegrasi**: Mengatur atribut WAI-ARIA `role="button"`, `aria-haspopup="menu"`, `aria-expanded`, serta navigasi keyboard penuh (Enter, Space, Escape).
* **Full Dark Mode**: Terintegrasi penuh dengan tema gelap Tailwind CSS, termasuk kontur pembatas cincin (*ring border*) yang otomatis menyesuaikan warna latar belakang.

---

## 02. Preview

> [!TIP]
> Pengujian visual dan showcase interaktif entitas ini tersedia secara native pada portal pratinjau aplikasi:
>
> <a href="http://localhost:8000/preview/avatar" target="_self" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 8px; background-color: var(--vp-c-brand-1, #4f46e5); color: #ffffff;">Buka Live Preview Komponen Avatar &rarr;</a>

---

## 03. Usage

Konsep penggunaan komponen Avatar dalam tata letak antarmuka aplikasi:

```text
Avatar Ecosystem
├── Header Topbar Navigation (Avatar + Dropdown Popover + Quick Status Switcher)
├── Data Tables & Lists (Avatar + Verified Badge + Status Dot)
├── Chat & Comment Threads (Avatar + Pulse Online Ping + Author Subtext)
├── Social & Feed Stream (Avatar + Instagram Story Ring + LIVE Streamer Mode)
└── Team Collaboration Bar (AvatarGroup Stack + Limit Max + Counter +N Bubble)
```

### Panduan Pemilihan Komponen
* Gunakan **`<Avatar />`** mandiri untuk profil tunggal, menu akun di navbar, atau baris data pengguna dalam tabel.
* Gunakan **`<AvatarGroup />`** jika Anda memiliki koleksi data pengguna (tim proyek, peserta rapat, kontributor tugas) yang perlu ditata dalam satu baris tumpukan hemat ruang.

---

## 04. Anatomy

Struktur internal elemen di dalam `Avatar.vue` dan `AvatarGroup.vue`:

### 1. Anatomi `Avatar.vue`
```text
Avatar (Root Container / Button Wrapper)
│
├── Story Ring Container (Aktif jika story !== 'none' atau clickable)
│   │
│   ├── Inner Media Container (Overflow Hidden, Rounded, Border)
│   │   ├── 1. Real Image (<img> saat src valid & tidak error)
│   │   ├── 2. Auto Initials (<span> inisial huruf saat gambar kosong/gagal)
│   │   ├── 3. Fallback Icon (<span class="material-symbols-outlined">)
│   │   └── 4. Custom Slot (Slot default di dalam media lingkaran)
│   │
│   ├── Presence Status Dot (Titik status online/away/busy/offline di tepi luar)
│   │   └── Pulse Ping Wave (Animasi radar memancar saat online & pulse=true)
│   │
│   ├── Verified Official Badge (Lencana centang biru resmi di sudut kanan bawah)
│   ├── Counter / Text Badge (Gelembung angka notifikasi e.g. '3' / 'VIP')
│   └── LIVE Story Badge (Label teks 'LIVE' di dasar cincin cerita)
│
├── User Info Text Section (Tampil jika showInfo = true)
│   ├── User Name (Heading teks tebal dengan penanganan truncate)
│   └── Subtext / Role (Keterangan teks kecil seperti email atau jabatan)
│
├── Dropdown Indicator (Ikon chevron expand_more saat dropdown = true)
│
└── Dropdown Popover Menu (Panel transisi mengambang saat isDropdownOpen = true)
    ├── Default Profile Card Header (Foto mini, nama, subteks)
    ├── Quick Status Switcher (Tombol titik pemilihan status instan)
    └── Menu Items List (Daftar link/tombol aksi, ikon, badge, pemisah divider)
```

### 2. Anatomi `AvatarGroup.vue`
```text
AvatarGroup (Flex Inline Container dengan Spacing Negatif)
│
├── Visible Avatar Items (Koleksi <Avatar border /> dengan batas limit max)
│   ├── Avatar 1 (z-index bertingkat + hover pop scale)
│   ├── Avatar 2
│   └── Avatar N (hingga batas indeks max)
│
└── Extra Counter Bubble (Gelembung penanda sisa anggota e.g. '+3')
```

---

## 05. Variants

### 1. Varian Visual Media (`variant`)
Komponen menyediakan 5 opsi varian visual melalui prop `variant`:

| Varian | Prop Value | Deskripsi Tampilan | Kasus Penggunaan yang Direkomendasikan |
| :--- | :--- | :--- | :--- |
| **Default** | `'default'` *(default)* | Warna solid standar atau gradien terhitung dari hash nama pengguna. | Standar foto profil, inisial nama umum di tabel dan daftar pengguna. |
| **Gradient** | `'gradient'` | Gradien dua warna tajam sesuai tema palet yang dipilih (`colorTheme`). | Kartu anggota unggulan, pemenang leaderboard, atau akun VIP. |
| **Glass** | `'glass'` | Efek kaca buram (*frosted glass*) dengan `backdrop-blur` dan border transparan. | Desain antarmuka modern di atas latar belakang gambar atau grafis dinamis. |
| **Outline** | `'outline'` | Latar belakang transparan dengan garis tepi berjarak yang tegas. | Antarmuka bergaya wireframe minimalis atau avatar placeholder kosong. |
| **Soft** | `'soft'` | Latar belakang berwarna pastel lembut dengan teks bertema kontras tinggi. | Tampilan inisial nama yang elegan tanpa warna mencolok. |

### 2. Tema Warna (`colorTheme`)
Tersedia 9 preset tema warna yang mengontrol gradien, bayangan pendar (*glow*), dan varian *soft*:
* `default`: Slate netral abu-abu elegan.
* `primary`: Biru royal ke indigo (`from-blue-600 to-indigo-600`).
* `indigo`: Indigo ke ungu (`from-indigo-600 to-purple-600`).
* `emerald`: Hijau zamrud ke teal (`from-emerald-500 to-teal-600`).
* `purple`: Ungu ke pink (`from-purple-600 to-pink-600`).
* `amber`: Kuning emas ke oranye (`from-amber-500 to-orange-600`).
* `rose`: Merah mawar ke merah tua (`from-rose-500 to-red-600`).
* `cyan`: Biru langit terang ke biru safir (`from-cyan-500 to-blue-600`).
* `dark`: Zinc pekat ke hitam malam (*dark luxury*).

### 3. Cincin Cerita Instagram (`story`)
Menambahkan cincin melingkar di sekeliling avatar dengan pemisah halus (*ring offset*):
* `none` *(default)*: Tanpa cincin cerita.
* `gradient` / `unread`: Cincin gradien warna-warni khas Instagram (*amber-rose-purple*) untuk konten cerita yang belum dilihat.
* `emerald`: Cincin hijau zamrud untuk cerita daftar teman dekat (*Close Friends*).
* `live`: Cincin merah berdenyut dengan badge teks *"LIVE"* di dasar avatar untuk pengguna yang sedang melakukan siaran langsung.

### 4. Bentuk Kelengkungan Sudut (`rounded`)
* `full` *(default)*: Lingkaran penuh 360 derajat (standar utama avatar).
* `squircle`: Kelengkungan *superellipse* halus ala iOS/macOS (`rounded-2xl`).
* `xl`: Sudut membulat modern (`rounded-xl`).
* `lg`: Sudut membulat sedang (`rounded-lg`).
* `md`: Sudut membulat kompak (`rounded-md`).
* `none`: Persegi bersudut siku murni tanpa kelengkungan.

---

## 06. Sizes

Komponen menyediakan 7 skala ukuran terukur mulai dari ukuran terkecil hingga ukuran pahlawan (*hero banner*):

| Ukuran | Prop Value | Dimensi Kontainer | Ukuran Font Inisial | Ukuran Ikon | Titik Status | Lencana Verified | Kapan Digunakan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Extra Small** | `'xs'` | `w-6 h-6` (24px) | `text-[10px]` | `text-[13px]` | `w-1.5 h-1.5` | `w-2.5 h-2.5` (10px) | Baris tabel padat, rekam jejak revisi mini, breadcrumb. |
| **Small** | `'sm'` | `w-8 h-8` (32px) | `text-xs` (12px) | `text-[16px]` | `w-2 h-2` | `w-3 h-3` (12px) | Topbar navbar padat, kolom komentar bertingkat, dropdown menu. |
| **Medium** | `'md'` *(default)* | `w-10 h-10` (40px) | `text-sm` (14px) | `text-[19px]` | `w-2 h-2` | `w-3.5 h-3.5` (14px) | Ukuran standar antarmuka aplikasi, navbar utama, kartu profil ringkas. |
| **Large** | `'lg'` | `w-12 h-12` (48px) | `text-sm` (14px) | `text-[24px]` | `w-2.5 h-2.5` | `w-3.5 h-3.5` (14px) | Header profil pengguna, popover kartu detail, list anggota tim. |
| **Extra Large** | `'xl'` | `w-16 h-16` (64px) | `text-base` (16px) | `text-[30px]` | `w-3 h-3` | `w-4 h-4` (16px) | Cincin cerita Instagram, halaman profil pengaturan akun pengguna. |
| **2X Large** | `'2xl'` | `w-20 h-20` (80px) | `text-xl` (20px) | `text-[38px]` | `w-3.5 h-3.5` | `w-5 h-5` (20px) | Hero header halaman profil publik, kartu bio perkenalan narasumber. |
| **3X Large** | `'3xl'` | `w-26 h-26` (104px) | `text-2xl` (24px) | `text-[48px]` | `w-4 h-4` | `w-6 h-6` (24px) | Banner pendaftaran, tampilan upload foto profil ukuran penuh. |

---

## 07. States

| State | Kondisi Pemicu | Representasi Visual | Makna Fungsional |
| :--- | :--- | :--- | :--- |
| **Online** | `status="online"` | Titik hijau zamrud pekat (`bg-emerald-500`) dengan border putih/gelap. | Pengguna sedang aktif terhubung ke aplikasi saat ini. |
| **Online + Pulse** | `status="online"` & `pulse="true"` | Titik hijau disertai gelombang lingkaran radar memancar berulang (`animate-ping`). | Menegaskan kehadiran pengguna secara *live realtime*. |
| **Away** | `status="away"` | Titik kuning amber (`bg-amber-400`). | Pengguna sedang tidak di depan layar atau sesi idle sementara. |
| **Busy** | `status="busy"` | Titik merah mawar (`bg-rose-500`). | Pengguna dalam status sibuk atau dalam mode Jangan Ganggu (*Do Not Disturb*). |
| **Offline** | `status="offline"` | Titik abu-abu slate (`bg-slate-400 dark:bg-slate-500`). | Pengguna sedang tidak terhubung atau telah keluar dari sesi kerja. |
| **Hovered (Clickable)** | `clickable="true"` atau `dropdown="true"` | Skala avatar membesar lembut (`hover:scale-105`), kursor pointer. | Menandakan elemen dapat diinteraksikan oleh pengguna. |
| **Active / Pressed** | Klik mouse ditahan pada avatar | Efek kompresi skala halus (`active:scale-95`). | Umpan balik taktil saat tombol diklik. |
| **Dropdown Open** | `dropdown="true"` & `isDropdownOpen="true"` | Popover menu profil muncul di bawah avatar, panah chevron berputar 180 derajat. | Menampilkan menu opsi akun dan status switcher. |

---

## 08. Props / Attributes

### 1. Props `<Avatar />`

| Prop | Tipe Data | Default | Pilihan Nilai | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| `design` | `String` | `'default'` | `'default'`, `'minimal'`, `'bordered'`, `'floating'`, `'modern'` | Arsitektur dan tata letak kontainer avatar. |
| `color` | `String` | `''` | `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'`, atau Kode Hex | Palet aksen warna semantik atau warna latar kustom. |
| `style` | `String` | `undefined` | `'solid'`, `'soft'`, `'outline'`, `'pill'`, `'gradient'`, `'glass'` | Gaya visual presentasi permukaan avatar. |
| `radius` | `String` | `undefined` | `'full'`, `'xl'`, `'lg'`, `'md'`, `'sm'`, `'none'`, `'squircle'` | Skala kelengkungan sudut kontainer avatar. |
| `size` | `String` | `'md'` | `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'` | Skala dimensi keseluruhan avatar dan elemen indikatornya. |
| `src` | `String` | `''` | URL Gambar valid | Alamat URL foto profil pengguna. Jika gagal memuat, otomatis fallback ke inisial. |
| `alt` | `String` | `''` | Teks bebas | Deskripsi alternatif gambar untuk aksesibilitas pembaca layar (*screen reader*). |
| `name` | `String` | `''` | Teks bebas | Nama lengkap pengguna. Digunakan untuk auto inisial dan generator gradien warna. |
| `subtext` | `String` | `''` | Teks bebas | Keterangan tambahan di bawah nama (misal alamat email atau jabatan) saat `showInfo` aktif. |
| `showInfo` | `Boolean` | `false` | `true`, `false` | Menampilkan label nama dan subteks di sebelah kanan avatar. |
| `rounded` | `String` | `'full'` | `'full'`, `'squircle'`, `'xl'`, `'lg'`, `'md'`, `'none'` | Alias backward-compatible untuk kelengkungan sudut kontainer media avatar. |
| `status` | `String` | `''` | `''`, `'online'`, `'offline'`, `'away'`, `'busy'` | Indikator titik status kehadiran pengguna. |
| `statusPosition` | `String` | `'bottom-right'` | `'top-right'`, `'bottom-right'`, `'top-left'`, `'bottom-left'` | Posisi penempatan titik status kehadiran di sekeliling avatar. |
| `pulse` | `Boolean` | `false` | `true`, `false` | Menambahkan animasi gelombang radar ping memancar pada status online. |
| `story` | `String` | `'none'` | `'none'`, `'gradient'`, `'unread'`, `'live'`, `'emerald'` | Cincin cerita interaktif berjarak di luar lingkaran avatar. |
| `verified` | `Boolean` | `false` | `true`, `false` | Menampilkan lencana centang biru akun resmi di sudut kanan bawah. |
| `badge` | `String\|Number` | `''` | Angka atau Teks | Gelembung notifikasi counter angka (misal `'3'`, `'99+'`) atau label `'VIP'`. |
| `badgeColor` | `String` | `''` | Kelas Tailwind | Kustomisasi kelas warna latar dan teks untuk gelembung badge. |
| `colorTheme` | `String` | `'default'` | `'default'`, `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'` | Alias tema visual gradien inisial. |
| `variant` | `String` | `'default'` | `'default'`, `'gradient'`, `'glass'`, `'outline'`, `'soft'` | Alias gaya perlakuan visual pada kontainer media. |
| `border` | `Boolean` | `false` | `true`, `false` | Menambahkan garis cincin pemisah putih/gelap di tepi kontainer avatar. |
| `clickable` | `Boolean` | `false` | `true`, `false` | Mengaktifkan kursor pointer dan efek animasi transisi hover/active scale. |
| `dropdown` | `Boolean` | `false` | `true`, `false` | Mengaktifkan menu popover profil akun yang terbuka saat avatar diklik. |
| `dropdownAlign` | `String` | `'right'` | `'left'`, `'right'`, `'center'` | Penjajaran posisi popover menu profil terhadap posisi avatar. |
| `menuItems` | `Array` | `[]` | Array of Object | Daftar item menu aksi di dalam popover `[{ label, icon, action, badge, danger, divider }]`. |
| `isLog` | `Boolean` | `false` | `true`, `false` | Mengaktifkan telemetri diagnostik ke console browser dan memancarkan event `@log`. |

### 2. Props `<AvatarGroup />`

| Prop | Tipe Data | Default | Pilihan Nilai | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| `items` | `Array` | `[]` | Array of Object | Koleksi data pengguna `[{ src, name, alt, status, icon, color }]`. |
| `max` | `Number` | `4` | Angka Positif | Batas maksimal avatar yang ditampilkan sebelum sisa anggota diringkas menjadi `+N`. |
| `size` | `String` | `'md'` | `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'` | Ukuran seragam untuk seluruh avatar di dalam kelompok tumpukan. |
| `rounded` | `String` | `'full'` | `'full'`, `'squircle'`, `'xl'`, `'lg'`, `'none'` | Kelengkungan sudut untuk seluruh avatar di dalam kelompok. |
| `spacing` | `String` | `'normal'` | `'tight'`, `'normal'`, `'loose'` | Derajat tumpang tindih margin negatif (`-space-x-3.5`, `-space-x-2.5`, `-space-x-1.5`). |

---

## 09. Slots

| Slot Name | Scope Props | Deskripsi |
| :--- | :--- | :--- |
| `default` | — | Konten kustom di dalam area lingkaran avatar (ditempatkan di atas fallback). |
| `dropdown` | `{ close }` | Menggantikan seluruh panel popover menu profil dengan markup kustom Anda. |
| `menu` | `{ close }` | Menggantikan area daftar tombol menu aksi di dalam dropdown bawaan. |

---

## 10. Events / Interactions

| Event Name | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `@click` | `event: MouseEvent` | Dipancarkan saat avatar diklik oleh pengguna (jika `clickable` atau `dropdown` aktif). |
| `@error` | `event: Event` | Dipancarkan saat berkas gambar pada prop `src` gagal dimuat (memicu fallback inisial). |
| `@toggle-dropdown` | `isOpen: Boolean` | Dipancarkan saat status visibilitas popover dropdown berubah (terbuka atau tertutup). |
| `@menu-click` | `item: Object` | Dipancarkan saat pengguna mengklik salah satu item dari prop `menuItems`. |
| `@change-status` | `status: String` | Dipancarkan saat pengguna memilih status baru dari quick status switcher di header popover. |
| `@log` | `(payload: object)` | Dipancarkan saat terjadi aktivitas telemetri jika `isLog` bernilai `true`. |

---

## 11. Code Example

### 1. Dasar Foto Profil dengan Rantai Fallback Otomatis

Contoh ini menunjukkan bagaimana komponen Avatar menangani tiga skenario identitas visual: foto profil dari server, inisial nama otomatis jika foto tidak ada, dan ikon siluet standar jika nama kosong.

```vue
<script setup>
import Avatar from '@/Components/Pack/Avatar.vue';

// URL foto profil pengguna dari server
const userAvatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';
</script>

<template>
  <div class="flex items-center gap-6">
    <!-- Kasus A: Foto Profil Normal -->
    <Avatar
      :src="userAvatarUrl"
      name="Alex Morgan"
      size="lg"
      border
    />

    <!-- Kasus B: Gambar Kosong / Gagal Muat -> Fallback ke Inisial "SJ" -->
    <Avatar
      name="Sarah Jenkins"
      size="lg"
      border
    />

    <!-- Kasus C: Foto dan Nama Kosong -> Fallback ke Ikon Siluet "person" -->
    <Avatar
      size="lg"
      border
    />
  </div>
</template>
```

#### Penjelasan Detail Parameter & Alur:
* `src`: Komponen pertama-tama mencoba memuat elemen `<img>` menggunakan URL ini. Jika URL menghasilkan kode status HTTP 404, koneksi putus, atau URL tidak valid, event bawaan `@error` otomatis dieksekusi dan mengubah state internal `imgFailed = true`.
* `name`: Saat gambar tidak ada atau gagal dimuat, fungsi komputasi `initials` mengekstrak kata dari string nama. Jika nama terdiri dari 2 kata atau lebih (*Sarah Jenkins*), sistem mengambil huruf pertama dari kata pertama dan kata terakhir menjadi `"SJ"`. Jika hanya 1 kata (*Alex*), sistem mengambil huruf pertamanya `"A"`.
* **Deterministic Hash Color**: Saat menampilkan inisial tanpa prop `colorTheme`, fungsi `hashColor` menghitung nilai ASCII dari setiap karakter nama pengguna secara matematis (`hash = charCode + ((hash << 5) - hash)`). Hasil modulus menentukan 1 dari 8 palet gradien dua warna bawaan. Ini menjamin bahwa pengguna bernama *"Sarah Jenkins"* akan selalu mendapatkan warna latar belakang yang sama di setiap halaman aplikasi tanpa perlu menyimpan kode warna di basis data.
* `icon`: Jika `src` dan `name` kosong, komponen menampilkan ikon Google Material Symbols bawaan `'person'`. Pengguna juga dapat memasukkan nama ikon lain melalui prop `icon="support_agent"` atau `icon="business"`.

---

### 2. Profile Dropdown Popover dengan Quick Status Switcher

Gunakan konfigurasi ini di bar navigasi atas (*topbar header*) aplikasi Anda sebagai tombol akun pengguna interaktif lengkap dengan menu aksi dan pemilih status kehadiran real-time.

```vue
<script setup>
import { ref } from 'vue';
import Avatar from '@/Components/Pack/Avatar.vue';
import { router } from '@inertiajs/vue3';

// Status kehadiran reaktif pengguna saat ini
const currentPresence = ref('online');

// Daftar item navigasi dropdown
const userNavLinks = [
    {
        label: 'Profil Pengguna',
        icon: 'person',
        action: () => router.visit('/profile'),
    },
    {
        label: 'Pengaturan Keamanan',
        icon: 'security',
        action: () => router.visit('/settings/security'),
    },
    {
        label: 'Langganan Enterprise',
        icon: 'workspace_premium',
        badge: 'Pro',
        action: () => router.visit('/billing'),
    },
    { divider: true },
    {
        label: 'Keluar (Log Out)',
        icon: 'logout',
        danger: true,
        action: () => router.post('/logout'),
    },
];

// Menangani perubahan status dari pemilih cepat
const handlePresenceUpdate = (newStatus) => {
    currentPresence.value = newStatus;
    // Mengirim pembaruan status ke backend Laravel via Inertia router
    router.put('/api/user/presence', { status: newStatus }, { preserveState: true });
};
</script>

<template>
  <div class="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between">
    <div class="text-xs text-slate-500 font-medium">
      Sesi Aktif: <span class="font-bold text-slate-800 dark:text-slate-200 capitalize">{{ currentPresence }}</span>
    </div>

    <!-- Avatar dengan Popover Dropdown Terintegrasi -->
    <Avatar
      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
      name="Alex Morgan"
      subtext="alex.morgan@speed.id"
      size="md"
      :status="currentPresence"
      pulse
      verified
      dropdown
      dropdown-align="right"
      :menu-items="userNavLinks"
      @change-status="handlePresenceUpdate"
    />
  </div>
</template>
```

#### Penjelasan Detail Parameter & Alur:
* `dropdown`: Nilai `true` mengaktifkan perilaku interaktif di mana avatar bertindak sebagai tombol pembuka popover. Komponen otomatis menambahkan panah penanda chevron `expand_more` di samping avatar yang berputar halus saat popover terbuka.
* `dropdown-align="right"`: Menyelaraskan sisi kanan panel menu popover tepat di tepi kanan avatar, mencegah menu meluap keluar layar pada viewport desktop di pojok kanan atas layar. Opsi lain adalah `'left'` dan `'center'`.
* `:menu-items`: Menerima array objek menu. Properti `divider: true` merender garis pemisah tipis, `danger: true` memberikan warna teks merah mawar (`rose`) untuk aksi destruktif seperti logout, dan `badge: 'Pro'` menampilkan label penanda status paket di sisi kanan menu.
* `@change-status`: Header popover dropdown menyajikan 4 tombol titik warna untuk status online (hijau), away (kuning), busy (merah), dan offline (abu-abu). Saat diklik, komponen memancarkan event `@change-status` dengan nilai string status baru sehingga aplikasi dapat memperbarui status reaktif secara langsung.
* **Click-Outside & ESC Handling**: Popover dilengkapi listener `useClickOutside` yang mendeteksi sentuhan atau klik di luar area komponen dan otomatis menutup popover. Menekan tombol keyboard `Escape` juga akan menutup menu dan mengembalikan fokus ke avatar.

---

### 3. Instagram Story Ring & LIVE Streamer Mode

Contoh berikut menunjukkan penerapan cincin cerita berjarak (*story ring*) untuk fitur feed sosial, siaran langsung, atau penanda konten cerita baru pengguna.

```vue
<script setup>
import Avatar from '@/Components/Pack/Avatar.vue';

const openUserStory = (userId) => {
    console.log('Membuka modal cerita untuk user ID:', userId);
};
</script>

<template>
  <div class="flex items-center gap-8 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
    <!-- 1. Cerita Instagram Unread (Cincin Gradien Instagram) -->
    <div class="flex flex-col items-center gap-2">
      <Avatar
        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80"
        name="Sarah Jenkins"
        size="xl"
        story="gradient"
        clickable
        @click="openUserStory(101)"
      />
      <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">Cerita Baru</span>
    </div>

    <!-- 2. Cerita Teman Dekat (Cincin Hijau Emerald) -->
    <div class="flex flex-col items-center gap-2">
      <Avatar
        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80"
        name="Reno Prasetyo"
        size="xl"
        story="emerald"
        clickable
        @click="openUserStory(102)"
      />
      <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Teman Dekat</span>
    </div>

    <!-- 3. Siaran Langsung (Cincin Merah + Animasi Denyut + Badge LIVE) -->
    <div class="flex flex-col items-center gap-2">
      <Avatar
        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&q=80"
        name="Dewi Lestari"
        size="xl"
        story="live"
        clickable
        @click="openUserStory(103)"
      />
      <span class="text-xs font-bold text-rose-600 dark:text-rose-400">Sedang Siaran</span>
    </div>
  </div>
</template>
```

#### Penjelasan Detail Parameter & Alur:
* `story="gradient"`: Membungkus avatar di dalam kontainer cincin gradien multi-warna (*amber via rose to purple*). Tepi dalam kontainer diberi jarak konsentris (*padding offset*) dengan border `ring-2 ring-white dark:ring-slate-900` untuk memisahkan foto dari warna cincin luar.
* `story="live"`: Menerapkan cincin merah menyala dengan animasi denyut `animate-pulse` dan secara otomatis menyisipkan elemen badge teks `"LIVE"` berwarna merah mawar di bawah dasar avatar.
* `clickable`: Mengaktifkan kursor pointer dan efek animasi transisi `hover:scale-105 active:scale-95` saat pengguna mengarahkan atau menekan kursor di atas avatar.

---

### 4. Tumpukan Kolaborasi Tim (`AvatarGroup`) dengan Kalkulasi Sisa Otomatis

Gunakan subkomponen `AvatarGroup.vue` untuk menyajikan tim pengembang, kontributor proyek, atau anggota ruang obrolan secara ringkas tanpa memakan ruang horisontal yang berlebihan.

```vue
<script setup>
import { ref } from 'vue';
import AvatarGroup from '@/Components/Pack/AvatarGroup.vue';

// Daftar seluruh anggota tim di dalam proyek
const projectMembers = ref([
    { name: 'Alex Morgan', src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80', status: 'online' },
    { name: 'Reno Prasetyo', src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80', status: 'busy' },
    { name: 'Sarah Jenkins', src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80', status: 'away' },
    { name: 'David Lee', src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80', status: 'offline' },
    { name: 'Dewi Lestari', name: 'Dewi Lestari', status: 'online' },
    { name: 'Budi Santoso', name: 'Budi Santoso' },
    { name: 'Citra Kirana', name: 'Citra Kirana' },
]);
</script>

<template>
  <div class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between">
    <div>
      <h3 class="text-sm font-bold text-slate-900 dark:text-white">Kontributor Proyek UI Core</h3>
      <p class="text-xs text-slate-500">Menampilkan 4 anggota pertama dari total {{ projectMembers.length }} anggota</p>
    </div>

    <!-- Tumpukan Avatar Tim dengan limit max="4" -->
    <AvatarGroup
      :items="projectMembers"
      :max="4"
      spacing="normal"
      size="md"
      rounded="full"
    />
  </div>
</template>
```

#### Penjelasan Detail Parameter & Alur:
* `:items`: Menerima array objek pengguna. Setiap item otomatis dipetakan ke prop `src`, `name`, `status`, `color`, dan `icon` pada komponen `<Avatar />`.
* `:max="4"`: Komponen menggunakan fungsi komputasi `visibleItems = items.slice(0, 4)` untuk hanya merender 4 avatar pertama. Sisa anggota dihitung otomatis melalui `remainingCount = Math.max(0, items.length - max)`. Jika terdapat 7 anggota dan limit bernilai 4, gelembung counter bertuliskan `+3` otomatis dibuat di ujung kanan tumpukan.
* `spacing="normal"`: Mengatur tumpang tindih margin negatif horisontal (`-space-x-2.5`). Nilai `'tight'` menggunakan `-space-x-3.5` untuk tumpukan lebih padat, sedangkan `'loose'` menggunakan `-space-x-1.5`.
* **Elevated Hover Pop**: Setiap avatar di dalam tumpukan diberi border putih (`border`) dan kelas `hover:z-10 hover:scale-105 transition-all duration-150`. Saat kursor mouse diarahkan ke salah satu avatar yang tertindih, avatar tersebut otomatis melompat ke lapisan z-index paling atas dan sedikit membesar sehingga identitasnya terbaca jelas.

---

## 12. Result / Behavior

### 1. Diagram Alur Logika Rantai Fallback Rendering
```text
[Input Prop Diterima: src, name, icon]
                   │
                   ▼
     [Apakah prop src tersedia?]
          ├── YA ──► [Coba render elemen <img>]
          │                │
          │                ├── [Gambar Sukses Dimuat] ──► Tampilkan Foto Profil
          │                └── [Event @error Dipicu]  ──► Set imgFailed = true
          │                                                    │
          └── TIDAK ───────────────────────────────────────────┤
                                                               │
                                                               ▼
                                              [Apakah prop name tersedia?]
                                                   ├── YA ──► [Ekstraksi Inisial Huruf (1-2 Karakter)]
                                                   │                │
                                                   │                ▼
                                                   │          [Hitung Hash Warna Deterministik]
                                                   │                │
                                                   │                ▼
                                                   │          Tampilkan Inisial Berwarna
                                                   │
                                                   └── TIDAK ──► Tampilkan Ikon Material Symbols
                                                                 (Bawaan: 'person' atau prop icon)
```

### 2. Diagram Siklus Interaksi Popover Dropdown
```text
[Avatar dengan dropdown="true" diklik atau tombol Enter ditekan]
                   │
                   ▼
     [Toggle State: isDropdownOpen = !isDropdownOpen]
                   │
                   ├── isDropdownOpen = true ──► [Emit @toggle-dropdown(true)]
                   │                                     │
                   │                                     ▼
                   │                           [Animasi Masuk Transisi Scale Fade-in]
                   │                                     │
                   │                                     ▼
                   │                           [Pasang Event Listener pointerdown & ESC]
                   │                                     │
                   │               ┌─────────────────────┴────────────────────┐
                   │               ▼                                          ▼
                   │      [Klik di Luar Area]                        [Tekan Tombol ESC]
                   │               │                                          │
                   │               └─────────────────────┬────────────────────┘
                   │                                     │
                   │                                     ▼
                   └── isDropdownOpen = false ◄── [Set isDropdownOpen = false]
                                                         │
                                                         ▼
                                               [Emit @toggle-dropdown(false)]
                                                         │
                                                         ▼
                                               [Animasi Keluar Transisi Scale Fade-out]
```

---

## 13. Customization

### 1. Warna Latar Belakang Kustom Bebas (Hex Code)
Jika Anda ingin menerapkan warna dari basis data pengguna (misal kode hex identitas perusahaan), gunakan prop `color`:

```vue
<template>
  <Avatar
    name="Perusahaan Maju"
    color="#059669"
    size="lg"
    border
  />
</template>
```

### 2. Kustomisasi Konten Dropdown Menu via Slot `#menu`
Gantikan daftar tombol menu standar dengan navigasi Inertia `<Link>` atau elemen form kustom:

```vue
<script setup>
import Avatar from '@/Components/Pack/Avatar.vue';
import { Link } from '@inertiajs/vue3';
</script>

<template>
  <Avatar
    src="/img/profile.jpg"
    name="Chandra Tri Antomo"
    dropdown
  >
    <template #menu="{ close }">
      <div class="space-y-1">
        <Link
          href="/dashboard"
          @click="close"
          class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 text-xs"
        >
          <span class="material-symbols-outlined text-base">dashboard</span>
          <span>Dashboard Panel</span>
        </Link>
        <Link
          href="/settings"
          @click="close"
          class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 text-xs"
        >
          <span class="material-symbols-outlined text-base">tune</span>
          <span>Preferensi Sistem</span>
        </Link>
      </div>
    </template>
  </Avatar>
</template>
```

### 3. Kustomisasi Badge Notifikasi Angka
Gunakan kombinasi `badge` dan `badgeColor` untuk mengubah warna gelembung penanda status:

```vue
<template>
  <!-- Badge Kategori VIP Emas -->
  <Avatar
    src="/img/alex.jpg"
    badge="VIP"
    badge-color="bg-gradient-to-r from-amber-500 to-yellow-600 ring-2 ring-white dark:ring-slate-900"
    size="lg"
  />

  <!-- Badge Notifikasi Pesan 99+ -->
  <Avatar
    name="Budi Santoso"
    badge="99+"
    badge-color="bg-rose-600 ring-2 ring-white dark:ring-slate-900"
    size="lg"
  />
</template>
```

---

## 14. Accessibility

Komponen `Avatar.vue` dan `AvatarGroup.vue` dirancang mematuhi standar aksesibilitas W3C WAI-ARIA dan WCAG 2.2:

* **Teks Alternatif Gambar (`alt`)**:
  * Elemen `<img>` selalu menyertakan atribut `alt`. Jika prop `alt` tidak diisi secara eksplisit, komponen otomatis menggunakan prop `name` sebagai fallback agar pembaca layar mengumumkan nama orang tersebut kepada pengguna tunanetra.
* **Peran Semantik Tombol (`role="button"`)**:
  * Ketika `clickable="true"` atau `dropdown="true"` aktif, kontainer pembungkus otomatis diberi atribut `role="button"` dan `tabindex="0"`.
* **State WAI-ARIA Menu Popover**:
  * Kontainer dropdown dilengkapi atribut `aria-haspopup="menu"` dan nilai reaktif `:aria-expanded="isDropdownOpen"`.
* **Navigasi Keyboard**:
  * Pengguna dapat membuka dan menutup menu dropdown menggunakan tombol keyboard `Enter` atau tombol spasi (`Space`).
  * Menekan tombol `Escape` saat popover terbuka akan langsung menutup popover dan mengembalikan fokus interaksi ke tombol avatar.
* **Label Status Kehadiran**:
  * Titik status kehadiran dilengkapi atribut `:aria-label="'Status: ' + status"` sehingga teknologi asistif dapat membaca status kehadiran pengguna dengan jelas tanpa mengandalkan persepsi warna semata.
* **Pengelompokan AvatarGroup**:
  * Kontainer `AvatarGroup.vue` menerapkan atribut `role="group"` dan `aria-label="Tumpukan avatar tim"`.

---

## 15. Responsive Behavior

* **Pencegahan Overflow Teks (`truncate` & `min-w-0`)**:
  * Saat `showInfo="true"`, kontainer teks nama dan subteks dibatasi oleh utilitas `min-w-0` dan `truncate`. Jika nama pengguna sangat panjang atau ditempatkan di dalam sidebar sempit, teks otomatis dipotong dengan elipsis (`...`) tanpa merusak lebar layout.
* **Penjajaran Popover Cerdas (`dropdownAlign`)**:
  * Opsi `dropdownAlign="right"` mencegah popover menu terpotong di tepi kanan layar pada viewport desktop.
  * Opsi `dropdownAlign="center"` ideal untuk tata letak avatar di bagian tengah layar atau tampilan mobile.
* **Skalabilitas Proporsional**:
  * Seluruh offset titik status, lencana centang verifikasi, dan ukuran font inisial dikalkulasikan secara matematis melalui fungsi `sizeClasses` sehingga proporsinya tetap seimbang di setiap skala ukuran (`xs` hingga `3xl`).

---

## 16. Do / Don't

| Panduan Do (Direkomendasikan) | Panduan Don't (Dilarang / Hindari) |
| :--- | :--- |
| **Selalu berikan prop name**: Meskipun menyediakan foto `src`, selalu sertakan prop `name` agar fallback inisial dan atribut `alt` berfungsi optimal saat koneksi lambat. | **Jangan biarkan src dan name kosong bersamaan**: Menghindari rendering avatar kosong yang hanya menampilkan siluet abu-abu tanpa identitas. |
| **Gunakan AvatarGroup untuk tumpukan anggota**: Gunakan `AvatarGroup` dengan batas `max` terukur (misal 3-5) agar daftar pengguna tidak meluap keluar layar. | **Jangan menumpuk avatar manual dengan margin negatif**: Hindari menulis `-ml-4` manual secara berulang di template; gunakan subkomponen `AvatarGroup`. |
| **Pilih ukuran yang sesuai konteks**: Gunakan `sm` atau `md` untuk navbar dan tabel data; simpan ukuran `xl` atau `2xl` untuk halaman profil akun. | **Jangan gunakan ukuran 3xl di dalam tabel data**: Ukuran raksasa di ruang sempit akan merusak hierarki visual dan tata letak tabel. |
| **Gunakan dropdown-align="right" di pojok navbar**: Menjamin popover akun selalu terbuka ke arah dalam layar. | **Jangan letakkan elemen interaktif lain di dalam avatar**: Hindari menyisipkan tombol tautan lain di dalam default slot saat `dropdown="true"` aktif. |

---

## 17. Examples / Recipes

### Resep 1: Topbar Navbar User Profile Menu di Laravel Inertia

Pola navigasi profil paling umum yang terhubung langsung dengan objek `auth.user` dari Inertia.js:

```vue
<script setup>
import { computed } from 'vue';
import { usePage, router } from '@inertiajs/vue3';
import Avatar from '@/Components/Pack/Avatar.vue';

const page = usePage();
const authUser = computed(() => page.props.auth?.user || {});

const accountMenuItems = [
    {
        label: 'Profil Saya',
        icon: 'person',
        action: () => router.visit('/profile'),
    },
    {
        label: 'Pengaturan Akun',
        icon: 'settings',
        action: () => router.visit('/settings'),
    },
    { divider: true },
    {
        label: 'Keluar',
        icon: 'logout',
        danger: true,
        action: () => router.post('/logout'),
    },
];

const updateStatus = (newStatus) => {
    router.put('/user/presence', { status: newStatus }, { preserveScroll: true });
};
</script>

<template>
  <header class="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
    <div class="font-bold text-lg text-slate-800 dark:text-white">
      Aplikasi Speed
    </div>

    <!-- Avatar Profil Akun Pengguna -->
    <Avatar
      :src="authUser.avatar_url"
      :name="authUser.name || 'Pengguna'"
      :subtext="authUser.email"
      size="md"
      status="online"
      pulse
      verified
      dropdown
      dropdown-align="right"
      :menu-items="accountMenuItems"
      @change-status="updateStatus"
    />
  </header>
</template>
```

### Resep 2: Tabel Pengguna Admin dengan Status Kehadiran Realtime

Menampilkan identitas visual pengguna di dalam baris tabel data admin lengkap dengan badge verifikasi dan status kehadiran:

```vue
<script setup>
import Avatar from '@/Components/Pack/Avatar.vue';

defineProps({
    users: {
        type: Array,
        default: () => [],
    },
});
</script>

<template>
  <div class="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
    <table class="w-full text-left text-sm">
      <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b">
        <tr>
          <th class="px-4 py-3">Pengguna</th>
          <th class="px-4 py-3">Peran</th>
          <th class="px-4 py-3">Status Akun</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
        <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
          <td class="px-4 py-3">
            <Avatar
              :src="user.avatar_url"
              :name="user.name"
              :subtext="user.email"
              :status="user.is_online ? 'online' : 'offline'"
              :pulse="user.is_online"
              :verified="user.is_verified"
              show-info
              size="sm"
              border
            />
          </td>
          <td class="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
            {{ user.role_title }}
          </td>
          <td class="px-4 py-3">
            <span
              class="px-2 py-0.5 rounded-full text-xs font-bold font-mono"
              :class="user.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600'"
            >
              {{ user.is_active ? 'AKTIF' : 'SUSPEND' }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

### Resep 3: Kolaborasi Dokumen Realtime dengan AvatarGroup

Menampilkan bar kolaborator yang sedang aktif menyunting dokumen secara bersamaan di header editor:

```vue
<script setup>
import { computed } from 'vue';
import AvatarGroup from '@/Components/Pack/AvatarGroup.vue';

const props = defineProps({
    activeCollaborators: {
        type: Array,
        default: () => [],
    },
});

const collaboratorItems = computed(() => {
    return props.activeCollaborators.map(c => ({
        name: c.name,
        src: c.avatar_url,
        status: 'online',
    }));
});
</script>

<template>
  <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border rounded-2xl">
    <div class="flex items-center gap-2">
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
      <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">
        {{ activeCollaborators.length }} pengguna sedang melihat dokumen ini
      </span>
    </div>

    <!-- Tumpukan Avatar Kolaborator -->
    <AvatarGroup
      :items="collaboratorItems"
      :max="5"
      size="sm"
      spacing="tight"
    />
  </div>
</template>
```

---

## 18. Related Components

| Komponen | Fungsi | Kapan Digunakan |
| :--- | :--- | :--- |
| [Badge](/components/badge) | Label status dan penanda kategori ringkas | Menampilkan status data non-personal (status pesanan, tag kategori, level akses) |
| [Dropdown](/components/dropdown) | Menu popover kontekstual generik | Membuat menu navigasi mengambang untuk tombol selain avatar profil |
| [Skeleton](/components/skeleton) | Placeholder animasi pemuatan data | Menampilkan bingkai lingkaran abu-abu berkedip saat data profil masih diunduh |
| [Button](/components/button) | Tombol aksi primer dan sekunder | Tombol trigger aksi di luar hierarki profil avatar |

---

## 19. Notes / Limitations

* **Ketergantungan Font Google Material Symbols**: Ikon siluet fallback (`person`), panah dropdown (`expand_more`), centang verifikasi (`check`), dan ikon menu popover mengandalkan font Google Material Symbols. Pastikan stylesheet font tersebut telah disertakan di layout utama aplikasi (`head`).
* **Kebijakan CORS pada Berkas Gambar**: Jika foto avatar dimuat dari domain pihak ketiga (seperti AWS S3, Google Cloud Storage, atau CDN eksternal), pastikan server CDN tersebut mengirimkan header `Access-Control-Allow-Origin: *` agar peramban tidak memblokir render gambar saat diterapkan filter visual.
* **Batasan Panjang Inisial Nama**: Algoritma ekstraksi inisial secara otomatis membatasi inisial maksimal 2 karakter (huruf pertama kata pertama dan huruf pertama kata terakhir). Nama yang sangat panjang tidak akan menghasilkan lebih dari 2 huruf guna menjaga kesimetrisan bentuk lingkaran avatar.
* **Performa Hashing Warna**: Algoritma hashing karakter ASCII dijalankan secara lokal di peramban via `computed` tanpa melibatkan request jaringan, sehingga aman digunakan pada ratusan baris data tabel tanpa degradasi performa render.
