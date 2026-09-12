# 🔽 Dropdown Component (`Dropdown.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen menu dropdown aksi melayang (*action popover menu*) yang dilengkapi navigasi keyboard lengkap (panah atas/bawah, Enter, Escape), penutupan otomatis saat klik di luar area (*click outside*), serta fleksibilitas kustomisasi pemicu (*trigger*) dan isi menu.

---

## 🚀 Import & Penggunaan Dasar

```vue
<script setup>
import Dropdown from '@/Components/Pack/Dropdown.vue';

const menuItems = [
    { label: 'Lihat Profil', icon: 'person', href: '/profile' },
    { label: 'Pengaturan Akun', icon: 'settings', href: '/settings' },
    { separator: true },
    { 
        label: 'Hapus Data', 
        icon: 'delete', 
        variant: 'danger', 
        action: () => confirm('Yakin ingin menghapus?') 
    },
];

const handleSelect = (item) => {
    console.log('Item dipilih:', item.label);
};
</script>

<template>
  <Dropdown :items="menuItems" align="right" @select="handleSelect">
    <template #trigger="{ isOpen }">
      <button class="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium">
        <span>Opsi Akun</span>
        <span class="material-symbols-outlined text-sm transition-transform duration-200" :class="{ 'rotate-180': isOpen }">
          expand_more
        </span>
      </button>
    </template>
  </Dropdown>
</template>
```

---

## 📋 Props API (`<Dropdown />`)

| Prop | Tipe Data | Default | Pilihan Nilai / Deskripsi |
| :--- | :--- | :--- | :--- |
| `items` | `Array` | `[]` | Daftar item menu: `[{ label, icon, href, action, disabled, separator, variant }]` |
| `align` | `String` | `'left'` | Penjajaran menu terhadap tombol pemicu: `'left'`, `'right'` |
| `width` | `String` | `'48'` | Lebar container menu: `'32'`, `'40'`, `'48'` (192px), `'56'`, `'64'`, `'full'` |
| `contentClasses` | `String` | `''` | Class Tailwind tambahan untuk elemen kontainer popover menu |
| `closeOnClick` | `Boolean` | `true` | Otomatis menutup menu setelah salah satu opsi diklik |
| `disabled` | `Boolean` | `false` | Menonaktifkan interaksi tombol dropdown |

---

## 🧩 Format Objek Item Menu (`items`)

| Field | Tipe Data | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `label` | `String` | `''` | Teks judul item menu |
| `icon` | `String` | `''` | Nama Google Material Symbols di sebelah kiri teks |
| `href` | `String` | `''` | Tautan navigasi Inertia Link (jika diisi, akan dirender sebagai `<Link>`) |
| `action` | `Function` | `null` | Fungsi callback yang dijalankan saat item diklik: `(item) => void` |
| `disabled` | `Boolean` | `false` | Menonaktifkan item sehingga tidak dapat diklik atau dipilih |
| `separator` | `Boolean` | `false` | Menjadikan item ini sebagai garis pemisah horizontal (*divider line*) |
| `variant` | `String` | `'default'` | Varian warna: `'default'` (teks biasa) atau `'danger'` (warna merah bahaya untuk Hapus/Logout) |

---

## 🔔 Events API (`<Dropdown />`)

| Event Name | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `@select` | `item: Object` | Dipancarkan ketika salah satu item menu diklik |
| `@open` | — | Dipancarkan saat menu popover mulai terbuka |
| `@close` | — | Dipancarkan saat menu popover tertutup |

---

## 🪟 Slots API (`<Dropdown />`)

| Slot Name | Props Slot | Deskripsi |
| :--- | :--- | :--- |
| `trigger` | `{ isOpen, toggle, open, close }` | Kustomisasi tombol pemicu dropdown |
| `content` | `{ close }` | Menggantikan seluruh daftar item dengan konten HTML/Vue kustom |
| `item` | `{ item, index, close }` | Kustomisasi per-baris item menu |

---

## ⌨️ Aksesibilitas Keyboard (A11y)

Komponen ini mematuhi standar WAI-ARIA Menu Button:
* **Arrow Down / Panah Bawah**: Membuka menu dan memfokuskan item pertama.
* **Arrow Up / Panah Atas**: Bergerak ke item sebelumnya.
* **Home**: Langsung melompat ke item pertama yang dapat diklik.
* **End**: Langsung melompat ke item terakhir.
* **Enter / Space**: Memilih dan mengeksekusi item yang sedang difokuskan.
* **Escape**: Menutup menu dropdown dan mengembalikan fokus ke tombol trigger.
