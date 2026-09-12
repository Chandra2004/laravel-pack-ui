# 👤 Avatar Component (`Avatar.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen visual avatar modern serbaguna untuk menampilkan foto profil pengguna, inisial nama dengan warna aksen otomatis, atau ikon fallback. Dilengkapi dengan indikator status kehadiran (*presence status dot*) yang tidak terpotong oleh mask lingkaran, border ring luar, serta dukungan avatar stack/group.

---

## 🚀 Import & Penggunaan Dasar

```vue
<script setup>
import Avatar from '@/Components/Pack/Avatar.vue';
</script>

<template>
  <!-- Avatar Foto dengan Status Online -->
  <Avatar 
    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128" 
    name="Alex Morgan" 
    size="md" 
    status="online" 
  />

  <!-- Avatar Inisial Otomatis dari Nama (Warna Gradasi Deterministik) -->
  <Avatar 
    name="Chandra Tri Antomo" 
    size="lg" 
    status="busy" 
    status-position="bottom-right" 
  />

  <!-- Avatar Ikon Standar -->
  <Avatar 
    icon="person" 
    size="sm" 
    rounded="xl" 
  />
</template>
```

---

## 📋 Props API (`<Avatar />`)

| Prop | Tipe Data | Default | Pilihan Nilai / Deskripsi |
| :--- | :--- | :--- | :--- |
| `src` | `String` | `''` | URL gambar avatar pengguna |
| `alt` | `String` | `''` | Teks alternatif (*alt text*) gambar untuk pembaca layar |
| `name` | `String` | `''` | Nama pengguna. Jika `src` kosong atau gagal dimuat, akan mengekstrak inisial nama secara otomatis |
| `size` | `String` | `'md'` | Ukuran avatar: `'xs'` (24px), `'sm'` (32px), `'md'` (40px), `'lg'` (48px), `'xl'` (64px), `'2xl'` (80px) |
| `rounded` | `String` | `'full'` | Kelengkungan sudut: `'full'` (lingkaran bulat), `'xl'`, `'lg'`, `'md'` |
| `status` | `String` | `''` | Indikator status kehadiran: `''`, `'online'`, `'offline'`, `'away'`, `'busy'` |
| `statusPosition` | `String` | `'bottom-right'` | Posisi titik status: `'top-right'`, `'bottom-right'` |
| `icon` | `String` | `''` | Ikon Material Symbols kustom jika gambar & nama tidak tersedia |
| `color` | `String` | `''` | Class warna Tailwind kustom (misal `'bg-indigo-600 text-white'`) atau hex code (`'#3b82f6'`) |
| `border` | `Boolean` | `false` | Menambahkan border ring putih/gelap di sekeliling avatar |
| `clickable` | `Boolean` | `false` | Mengaktifkan kursor pointer dan efek hover/active scale |

---

## 🔔 Events API (`<Avatar />`)

| Event Name | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `@click` | `event: MouseEvent` | Dipancarkan ketika avatar diklik (berguna jika `clickable="true"`) |
| `@error` | `event: Event` | Dipancarkan ketika berkas gambar pada prop `src` gagal dimuat (*image load error*) |

---

## 🎨 Logika Fallback & Pewarnaan Otomatis

1. **Gambar (`src`)**: Prioritas pertama. Jika berkas gambar rusak atau tidak ditemukan, avatar otomatis beralih ke inisial tanpa tampilan gambar pecah.
2. **Inisial Nama (`name`)**: Jika gambar tidak ada, avatar membuat inisial (1 huruf untuk nama 1 kata, 2 huruf untuk nama majemuk) dan memilih salah satu dari 10 palet warna modern secara deterministik berdasarkan hash karakter nama.
3. **Ikon Fallback (`icon`)**: Jika `src` dan `name` kosong, avatar menampilkan ikon Google Material Symbols (default: `person`).
4. **Status Dot Tanpa Masking**: Indikator status diletakkan di luar wrapper `overflow-hidden`, sehingga bentuk bulat status tetap utuh sempurna dan tidak terpangkas oleh batas lingkaran avatar.

---

## 💡 Ragam Contoh Penggunaan

### 1. Avatar Status Kehadiran
```vue
<div class="flex items-center gap-4">
  <Avatar name="Sarah Connor" size="md" status="online" />
  <Avatar name="John Doe" size="md" status="away" />
  <Avatar name="Michael Smith" size="md" status="busy" />
  <Avatar name="Emma Watson" size="md" status="offline" />
</div>
```

### 2. Avatar Group Stack (Tumpukan Tim)
```vue
<div class="flex -space-x-2.5 overflow-hidden p-1">
  <Avatar src="/img/user1.jpg" name="User Satu" border size="md" />
  <Avatar src="/img/user2.jpg" name="User Dua" border size="md" />
  <Avatar src="/img/user3.jpg" name="User Tiga" border size="md" />
  <Avatar name="Budi Hartono" border size="md" />
  <div class="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
    +5
  </div>
</div>
```

