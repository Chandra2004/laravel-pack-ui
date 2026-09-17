# 👤 Avatar Component (`Avatar.vue`, `AvatarGroup.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen visual avatar modern serbaguna yang dirancang memenuhi **5 Pilar Desain UI (`peraturan.md`)**. Menampilkan foto profil pengguna, inisial nama dengan gradien otomatis atau tema warna, dan ikon *fallback*. Dilengkapi fitur interaktif canggih: **Profile Dropdown Menu**, **Instagram Story Ring** (cincin cerita unread/close-friends/live), **Radar Pulse Ping Kehadiran**, **Verified Official Badge**, serta subkomponen **`AvatarGroup.vue`** untuk tumpukan tim kolaborasi.

---

## 🏛️ Evaluasi & Penerapan 5 Pilar Desain (`peraturan.md`)

| Pilar Desain | Penerapan pada Komponen `Avatar` |
| :--- | :--- |
| **1. Warna** | 9 preset palet tema (`colorTheme`: `default`, `primary`, `indigo`, `emerald`, `purple`, `amber`, `rose`, `cyan`, `dark`), efek pendaran ambient `glow`, varian `gradient`, `glass` (frosted glass), `outline`, dan `soft`. Dilengkapi indikator status kehadiran berwarna (*online* hijau, *away* kuning, *busy* merah, *offline* abu-abu). |
| **2. Bentuk** | Kelengkungan sudut fleksibel (`rounded`: `full`, `squircle` ala Apple/macOS, `xl`, `lg`, `md`, `none`), serta cincin cerita berjarak (*offset story ring*: gradien Instagram, emerald Close Friends, dan pulse LIVE). |
| **3. Teks Konten** | Ekstraksi inisial cerdas (1-2 huruf kapital), dukungan teks info berdampingan (`showInfo`: `name` & `subtext`/jabatan), gelembung notifikasi counter angka (`badge`: misal `'3'`, `'99+'`, atau `'VIP'`), dan dropdown rincian profil. |
| **4. Icon** | Ikon Material Symbols terintegrasi, lencana centang biru resmi (`verified="true"`), ikon panah chevron dropdown (`expand_more`), serta ikon aksi di dalam dropdown menu. |
| **5. Responsif** | Penempatan dropdown cerdas (`dropdownAlign`: `left`, `right`, `center`) dengan deteksi klik di luar (*click-outside*), skala ukuran dari `xs` (24px) hingga hero `3xl` (112px). |

---

## 🚀 Fitur Unggulan ("Killer Features")

1. **Profile Dropdown Menu (`dropdown="true"`)**:
   Menghadirkan menu popover profil instan saat avatar diklik. Berisi kartu profil pengguna, pemilih status kehadiran instan (*quick status switcher*), tautan aksi akun, dan penutupan otomatis saat klik di luar area (*click-outside*) atau menekan tombol `Escape`.
2. **Instagram Story Ring (`story="gradient"` / `story="emerald"` / `story="live"`)**:
   Cincin melingkar di sekeliling avatar dengan pemisah halus (*ring offset*):
   - `story="gradient"`: Cincin gradien warna-warni khas Instagram (*amber-rose-purple*).
   - `story="emerald"`: Cincin hijau untuk daftar teman dekat (*Close Friends*).
   - `story="live"`: Cincin merah berkedip dengan label *"LIVE"* di bawah avatar.
3. **Radar Pulse Presence Dot (`pulse="true"`)**:
   Efek animasi radar ping memancar pada indikator status *online* untuk memberikan kesan aktif secara langsung (*live presence*).
4. **Verified Official Badge (`verified="true"`)**:
   Lencana centang biru resmi di sudut avatar untuk menandai akun terverifikasi.
5. **AvatarGroup Stack (`<AvatarGroup />`)**:
   Subkomponen tumpukan avatar tim kolaborasi (`-space-x-2.5`) dengan kalkulasi sisa anggota otomatis (`max` limit) dan gelembung counter (*+3*).

---

## 📋 Props API

### 1. Props `<Avatar />`
| Prop | Tipe Data | Default | Deskripsi / Pilihan Nilai |
| :--- | :--- | :--- | :--- |
| `src` | `String` | `''` | URL gambar avatar pengguna |
| `alt` | `String` | `''` | Teks alternatif untuk pembaca layar |
| `name` | `String` | `''` | Nama pengguna untuk auto inisial jika `src` kosong/gagal |
| `subtext` | `String` | `''` | Teks keterangan di bawah nama (email atau jabatan) |
| `showInfo` | `Boolean` | `false` | Menampilkan nama dan subteks di samping avatar |
| `size` | `String` | `'md'` | Ukuran avatar: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'` |
| `rounded` | `String` | `'full'` | Kelengkungan: `'full'`, `'squircle'`, `'xl'`, `'lg'`, `'md'`, `'none'` |
| `status` | `String` | `''` | Status kehadiran: `''`, `'online'`, `'offline'`, `'away'`, `'busy'` |
| `statusPosition` | `String` | `'bottom-right'` | Posisi titik status: `'top-right'`, `'bottom-right'`, `'top-left'`, `'bottom-left'` |
| `pulse` | `Boolean` | `false` | Menambahkan animasi gelombang ping berkedip pada status online |
| `story` | `String` | `'none'` | Cincin cerita: `'none'`, `'gradient'`, `'unread'`, `'live'`, `'emerald'` |
| `verified` | `Boolean` | `false` | Menampilkan lencana centang biru resmi |
| `badge` | `String\|Number`| `''` | Notifikasi counter angka (contoh: `'3'`, `'99+'`, `'VIP'`) |
| `badgeColor` | `String` | `''` | Custom class warna latar badge |
| `colorTheme` | `String` | `'default'` | Palet tema: `'default'`, `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'` |
| `variant` | `String` | `'default'` | Gaya visual: `'default'`, `'gradient'`, `'glass'`, `'outline'`, `'soft'` |
| `glow` | `Boolean` | `false` | Memberikan efek pendaran bayangan sesuai tema |
| `border` | `Boolean` | `false` | Menambahkan border ring putih/gelap di sekeliling avatar |
| `clickable` | `Boolean` | `false` | Mengaktifkan kursor pointer dan efek hover/active scale |
| `dropdown` | `Boolean` | `false` | Mengaktifkan popover profile dropdown menu saat diklik |
| `dropdownAlign` | `String` | `'right'` | Penjajaran popover: `'left'`, `'right'`, `'center'` |
| `menuItems` | `Array` | `[]` | Daftar item menu dropdown `[{ label, icon, href, action, badge, divider, danger }]` |

### 2. Props `<AvatarGroup />`
| Prop | Tipe Data | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `items` | `Array` | `[]` | Array data pengguna `[{ src, name, status, color }]` |
| `max` | `Number` | `4` | Jumlah maksimal avatar yang ditampilkan sebelum gelembung `+N` |
| `size` | `String` | `'md'` | Ukuran seragam untuk seluruh avatar di dalam tumpukan |
| `rounded` | `String` | `'full'` | Kelengkungan bentuk avatar |
| `spacing` | `String` | `'normal'` | Jarak tumpukan: `'tight'`, `'normal'`, `'loose'` |

---

## 🔔 Events API (`<Avatar />`)

| Event Name | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `@click` | `event: MouseEvent` | Dipancarkan saat avatar diklik |
| `@error` | `event: Event` | Dipancarkan saat gambar `src` gagal dimuat |
| `@toggle-dropdown` | `isOpen: Boolean` | Dipancarkan saat menu popover dibuka atau ditutup |
| `@menu-click` | `item: Object` | Dipancarkan saat salah satu item menu diklik |
| `@change-status` | `status: String` | Dipancarkan saat status diubah via quick status switcher |

---

## 🪟 Slots API

| Slot Name | Props Tersedia | Deskripsi |
| :--- | :--- | :--- |
| `default` | — | Konten kustom di dalam lingkaran avatar |
| `dropdown` | `{ close }` | Menggantikan seluruh panel konten dropdown menu |
| `menu` | `{ close }` | Menggantikan daftar item tombol aksi di dalam dropdown |
| `badge` | — | Konten kustom di luar area lingkaran avatar |

---

## 💡 Ragam Contoh Penggunaan

### 1. Profile Dropdown Menu Terintegrasi
```vue
<script setup>
import Avatar from '@/Components/Pack/Avatar.vue';

const menuItems = [
  { label: 'Profil Saya', icon: 'person', action: () => console.log('Profil') },
  { label: 'Pengaturan Akun', icon: 'settings', action: () => console.log('Settings') },
  { label: 'Billing', icon: 'receipt_long', badge: 'Pro' },
  { divider: true },
  { label: 'Keluar', icon: 'logout', danger: true, action: () => console.log('Logout') },
];
</script>

<template>
  <Avatar
    src="/img/profile.jpg"
    name="Alex Morgan"
    subtext="alex@example.com"
    size="lg"
    status="online"
    pulse
    verified
    dropdown
    dropdown-align="right"
    :menu-items="menuItems"
  />
</template>
```

### 2. Topbar Navigation Header Bar (Avatar + Info Tag)
```vue
<template>
  <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border">
    <Avatar
      name="Chandra Tri Antomo"
      subtext="Lead Architect"
      size="md"
      status="online"
      show-info
      dropdown
      verified
    />
  </div>
</template>
```

### 3. Instagram Story Ring & LIVE Streamer
```vue
<template>
  <div class="flex items-center gap-6">
    <!-- Unread Instagram Story -->
    <Avatar src="/img/user1.jpg" name="Jessica" size="xl" story="gradient" clickable />

    <!-- Close Friends Emerald Story -->
    <Avatar src="/img/user2.jpg" name="Reno" size="xl" story="emerald" clickable />

    <!-- LIVE Stream Pulse -->
    <Avatar src="/img/user3.jpg" name="Streamer" size="xl" story="live" clickable />
  </div>
</template>
```

### 4. Tumpukan Tim Kolaborasi (`AvatarGroup.vue`)
```vue
<script setup>
import AvatarGroup from '@/Components/Pack/AvatarGroup.vue';

const team = [
  { name: 'Alex M', src: '/img/1.jpg', status: 'online' },
  { name: 'Sarah J', src: '/img/2.jpg', status: 'busy' },
  { name: 'Dewi L', status: 'online' },
  { name: 'Budi S', status: 'away' },
  { name: 'Eko P', status: 'offline' },
];
</script>

<template>
  <!-- Menampilkan 3 avatar pertama dan badge +2 -->
  <AvatarGroup :items="team" :max="3" size="md" />
</template>
```
