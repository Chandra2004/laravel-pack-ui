# ButtonTheme Component

## 01. Overview

ButtonTheme adalah komponen pengalih tema antarmuka (*dark mode / light mode switcher*) berbasis Vue 3 dan Tailwind CSS untuk aplikasi Laravel Inertia. Komponen ini terintegrasi erat dengan composable `useTheme.js` untuk menyediakan kontrol tema yang adaptif, halus, dan konsisten di seluruh aplikasi tanpa kedipan visual saat halaman dimuat (*Zero-FOUC*).

### Fungsi Utama
* Mengelola mutasi kelas CSS `.dark` pada elemen `<html>` dokumen secara otomatis dan reaktif.
* Mendukung 3 mode tema utama: **Mode Terang** (*Light*), **Mode Gelap** (*Dark*), dan **Mode Sistem OS** (*System preference via `prefers-color-scheme`*).
* Menyimpan pilihan pengguna secara persisten di peramban menggunakan `localStorage` dengan auto-sync saat preferensi OS berubah.
* Menyediakan 4 varian tampilan siap pakai: `icon` bujursangkar, `button` berlabel, `switch` slider kapsul, dan `segmented` tab 3 opsi.
* Mencegah kedipan kontras (*Flash of Unstyled Content / FOUC*) melalui skrip inisialisasi inline pada layout Blade utama.

### Kapan Digunakan
* **Top Navigation Bar / Header**: Menggunakan varian `icon` minimalis di sudut kanan atas navbar di samping menu profil.
* **Halaman Pengaturan Akun / Preferensi Tampilan**: Menggunakan varian `segmented` untuk memberikan kebebasan eksplisit memilih mode Terang, Gelap, atau mengikuti Sistem OS.
* **Sidebar Drawer Mobile**: Menggunakan varian `switch` atau `button` berlabel di bagian bawah navigasi samping ponsel.
* **Footer Website & Landing Page**: Menggunakan varian `icon` atau `segmented` kompak.

### Karakteristik Penting
* **Sinkronisasi Reaktif useTheme**: Menggunakan satu sumber kebenaran (*single source of truth*) yang tersinkronisasi di semua tab browser via event storage.
* **Aksesibilitas WAI-ARIA Penuh**: Menggunakan atribut semantik `role="switch"`, `aria-checked`, `role="group"`, `aria-pressed`, dan kontur cincin fokus keyboard (`focus-visible:ring-2`).
* **Dukungan Siklus 3 Mode (`cycle`)**: Mode toggle dapat diatur bergilir dari Terang -> Gelap -> Sistem secara berurutan.
* **Zero Dependency External**: Hanya menggunakan Tailwind CSS dan Google Material Symbols tanpa pustaka pihak ketiga tambahan.

---

## 02. Preview

> [!TIP]
> Pengujian visual dan showcase interaktif entitas ini tersedia secara native pada portal pratinjau aplikasi:
>
> <a href="/preview/button-theme" target="_self" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 8px; background-color: var(--vp-c-brand-1, #4f46e5); color: #ffffff;">Buka Live Preview Komponen ButtonTheme &rarr;</a>

---

## 03. Usage

Konsep penggunaan komponen ButtonTheme dalam hierarki tata letak aplikasi:

```text
ButtonTheme
├── Top Navbar (Varian icon cepat di header dashboard)
├── User Preferences (Varian segmented di tab tampilan akun)
├── Mobile Navigation Drawer (Varian switch di footer sidebar)
└── useTheme Composable Companion (Sinkronisasi status reaktif)
```

### Penempatan yang Direkomendasikan
* Letakkan varian `icon` di samping avatar pengguna pada header aplikasi.
* Letakkan varian `segmented` pada formulir preferensi profil pengguna di panel admin.

---

## 04. Anatomy

Struktur elemen internal komponen `ButtonTheme.vue`:

```text
ButtonTheme (Container Wrapper)
│
├── Varian 'segmented' (Group tab 3 tombol: Terang, Gelap, Sistem)
│   ├── Light Button (Ikon light_mode + Label "Terang")
│   ├── Dark Button (Ikon dark_mode + Label "Gelap")
│   └── System Button (Ikon settings_suggest + Label "Sistem")
│
├── Varian 'button' (Tombol horizontal lengkap)
│   ├── Theme Icon Container (Animasi rotasi matahari/bulan)
│   └── Label Text (Menampilkan resolvedLabel sesuai tema aktif)
│
├── Varian 'switch' (Sakelar geser modern)
│   ├── Track Capsule (Latar abu-abu / gelap)
│   └── Thumb Slider (Bulatan geser berisi ikon tema mini)
│
└── Varian 'icon' (Tombol bujursangkar ringkas)
    └── Dynamic Material Icon (light_mode / dark_mode dengan transisi halus)
```

---

## 05. Variants

Komponen menyediakan 4 opsi varian tampilan melalui prop `variant`:

| Varian | Prop Value | Tampilan Visual | Kapan Digunakan |
| :--- | :--- | :--- | :--- |
| **Icon** | `'icon'` *(default)* | Tombol bujursangkar minimalis berisi ikon matahari atau bulan. | Header navbar, floating quick actions, atau toolbar sempit. |
| **Button** | `'button'` | Tombol horizontal lengkap dengan ikon dan teks deskripsi tema. | Menu dropdown, toolbar pengaturan, atau panel samping. |
| **Switch** | `'switch'` | Sakelar geser berbentuk kapsul slider interaktif. | Footer sidebar mobile atau panel toggle pengaturan cepat. |
| **Segmented** | `'segmented'` | Kontainer 3 tab pilihan eksplisit (Terang, Gelap, Sistem). | Halaman pengaturan akun / preferensi tampilan utama. |

---

## 06. Sizes

Komponen menyediakan 3 skala ukuran melalui prop `size`:

| Ukuran | Prop Value | Dimensi Icon | Dimensi Segmented | Kapan Digunakan |
| :--- | :--- | :--- | :--- | :--- |
| **Small** | `'sm'` | `w-8 h-8`, ikon `16px` | Tab `px-2 py-1`, teks `text-[11px]` | Navbar kompak atau modal header kecil. |
| **Medium** | `'md'` *(default)* | `w-9.5 h-9.5`, ikon `20px` | Tab `px-3 py-1.5`, teks `text-xs` | Tata letak desktop standar dan form umum. |
| **Large** | `'lg'` | `w-11 h-11`, ikon `24px` | Tab `px-4 py-2`, teks `text-sm` | Halaman pengaturan akun bertema lebar. |

---

## 07. States

Siklus status tema pada komponen `ButtonTheme.vue`:

| State | Kondisi Kelas HTML | Ikon yang Tampil | Makna Fungsional |
| :--- | :--- | :--- | :--- |
| **Light** | Kelas `.dark` dilepas | `light_mode` | Seluruh antarmuka menampilkan palet warna terang dengan kontras tajam. |
| **Dark** | Kelas `.dark` dipasang | `dark_mode` | Seluruh antarmuka menampilkan palet warna gelap ramah mata malam hari. |
| **System** | Mengikuti OS pengguna | `settings_suggest` | Otomatis sinkron dengan pengaturan tema sistem operasi (Windows/macOS/Linux). |

---

## 08. Props / Attributes

Daftar parameter lengkap konfigurasi prop pada `ButtonTheme.vue`:

| Prop | Tipe Data | Default | Pilihan Nilai | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| `variant` | `String` | `'icon'` | `'icon'`, `'button'`, `'switch'`, `'segmented'` | Gaya tampilan komponen pengalih tema. |
| `size` | `String` | `'md'` | `'sm'`, `'md'`, `'lg'` | Skala ukuran dimensi kontainer, teks, dan ikon. |
| `showLabel` | `Boolean` | `false` | `true`, `false` | Menampilkan label teks di samping tombol pada varian button/icon. |
| `cycle` | `Boolean` | `false` | `true`, `false` | Jika `true`, klik tombol menggilir 3 status: Light -> Dark -> System. |
| `labelLight` | `String` | `'Mode Terang'` | Teks bebas | Label teks untuk status mode terang (mendukung i18n). |
| `labelDark` | `String` | `'Mode Gelap'` | Teks bebas | Label teks untuk status mode gelap (mendukung i18n). |
| `labelSystem` | `String` | `'Mode Sistem'` | Teks bebas | Label teks untuk status mode sistem (mendukung i18n). |

---

## 09. Slots

Komponen ini dirancang mandiri tanpa ketergantungan slot rumit. Seluruh ikon dan status dikelola secara otomatis oleh composable `useTheme`.

---

## 10. Events / Interactions

| Interaksi | Pemicu | Efek Runtime |
| :--- | :--- | :--- |
| **Toggle Click** | Klik pada tombol `icon` atau `button` | Beralih antara tema terang dan gelap secara instan. |
| **Cycle Click** | Klik saat prop `:cycle="true"` | Menggilir tema berurutan: `light` &rarr; `dark` &rarr; `system`. |
| **Segment Select** | Klik salah satu tab pada varian `segmented` | Mengatur tema secara langsung ke `'light'`, `'dark'`, atau `'system'`. |

---

## 11. Code Example

### 1. Ikon Ringkas pada Header Topbar (Rekomendasi Utama)

```vue
<script setup>
import ButtonTheme from '@/Components/Pack/ButtonTheme.vue';
</script>

<template>
  <header class="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
    <div class="font-bold text-sm text-slate-900 dark:text-white">Admin Dashboard</div>
    <div class="flex items-center gap-3">
      <ButtonTheme variant="icon" size="sm" />
    </div>
  </header>
</template>
```

### 2. Segmented 3 Pilihan pada Halaman Pengaturan Akun

```vue
<script setup>
import ButtonTheme from '@/Components/Pack/ButtonTheme.vue';
</script>

<template>
  <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
    <h3 class="font-bold text-sm mb-1">Preferensi Tampilan</h3>
    <p class="text-xs text-slate-500 mb-4">Pilih tema antarmuka yang nyaman untuk mata Anda.</p>
    
    <ButtonTheme variant="segmented" size="md" />
  </div>
</template>
```

---

## 12. Result / Behavior

Diagram alur perubahan status tema pada antarmuka:

```text
[Pengguna Mengklik ButtonTheme]
               ↓
[useTheme.js Mengeksekusi setTheme(newTheme)]
               ↓
[Simpan ke window.localStorage('theme')]
               ↓
        [Pembaruan DOM]
        ├── Jika 'dark' ──→ Tambahkan class="dark" pada <html>
        ├── Jika 'light' ─→ Hapus class="dark" dari <html>
        └── Jika 'system' ─→ Cek window.matchMedia('(prefers-color-scheme: dark)')
               ↓
[Seluruh Komponen Tailwind CSS Otomatis Beradaptasi via dark: utilities]
```

---

## 13. Customization

### Kustomisasi Label Bahasa (Internasionalisasi / i18n)

```vue
<ButtonTheme
  variant="button"
  :show-label="true"
  label-light="Light Mode"
  label-dark="Dark Mode"
  label-system="System Mode"
/>
```

---

## 14. Accessibility

Komponen `ButtonTheme.vue` mematuhi standar W3C WAI-ARIA:
* **Role Switch & Checked State**: Pada varian switch, menggunakan atribut `role="switch"` dan `aria-checked="true|false"` untuk dibacakan pembaca layar.
* **Role Group & Pressed State**: Pada varian segmented, menggunakan kontainer `role="group"` dan atribut `aria-pressed="true|false"` pada setiap tombol segmen.
* **Fokus Keyboard Tegas**: Seluruh tombol dilengkapi cincin fokus visual (`focus-visible:ring-2 focus-visible:ring-offset-1`).

---

## 15. Responsive Behavior

* **Mobile (< 640px)**: Varian `segmented` otomatis menyesuaikan padding agar muat pada layar sempit tanpa memicu overflow horizontal.
* **Desktop (>= 640px)**: Varian `icon` dan `segmented` proporsional sejajar dengan navigasi header.

---

## 16. Do / Don't

| Panduan Do (Direkomendasikan) | Panduan Don't (Dilarang / Hindari) |
| :--- | :--- |
| **Gunakan skrip Zero-FOUC di Blade**: Selalu sematkan skrip pencegah kedipan di `app.blade.php` sebelum memuat berkas CSS. | **Jangan ubah class dark secara manual**: Selalu gunakan composable `useTheme` atau `ButtonTheme` agar state tersinkronisasi. |
| **Gunakan varian segmented di pengaturan**: Sediakan opsi 'Sistem' agar pengguna yang menyukai tema dinamis OS terakomodasi. | **Jangan sembunyikan toggle tema**: Pastikan pengguna selalu memiliki akses mudah untuk mengganti tema jika kontras dirasa kurang nyaman. |

---

## 17. Examples / Recipes

### Resep 1: Skrip Zero-FOUC pada Layout Utama Laravel (`app.blade.php`)

Tambahkan skrip inline berikut di dalam tag `<head>` sebelum stylesheet CSS utama dimuat:

```html
<script>
    (function() {
        const storedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark) || (storedTheme === 'system' && systemPrefersDark)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    })();
</script>
```

### Resep 2: Pengalih Tema di Bagian Bawah Sidebar Mobile

```vue
<script setup>
import ButtonTheme from '@/Components/Pack/ButtonTheme.vue';
</script>

<template>
  <aside class="p-4 bg-slate-900 text-white flex flex-col justify-between h-screen">
    <div>Menu Navigasi</div>
    <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
      <span class="text-xs text-slate-400">Mode Tampilan</span>
      <ButtonTheme variant="switch" size="sm" />
    </div>
  </aside>
</template>
```

---

## 18. Related Components

| Komponen | Fungsi | Kapan Digunakan |
| :--- | :--- | :--- |
| [useTheme](/composables/use-theme) | Composable pengelola logika tema | Mengontrol state tema dari fungsi JavaScript atau setup kustom |
| [ButtonSubmit](/components/button-submit) | Tombol aksi submit form | Tombol interaktif untuk aksi pengiriman formulir utama |
| [Badge](/components/badge) | Lencana indikator status | Menampilkan label status tema aktif secara statis |

---

## 19. Notes / Limitations

* **Ketergantungan Font Material Symbols**: Komponen menggunakan ikon Material Symbols (`light_mode`, `dark_mode`, `settings_suggest`). Pastikan font Google Material Symbols telah dimuat di file HTML induk Anda.
* **Persistensi Browser**: Preferensi tema disimpan pada `localStorage.getItem('theme')`. Jika pengguna membersihkan cookies/cache browser, tema akan kembali mengikuti preferensi sistem operasi.