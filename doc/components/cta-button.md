# 🚀 CTA Button Component (`CtaButton.vue` / `ButtonCta.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen tombol aksi konversi tinggi (*Call-to-Action / CTA Button*) enterprise berbasis Vue 3 dan Tailwind CSS yang telah menerapkan **5 Pilar Standar UI (Warna, Bentuk, Teks Konten, Icon, & Responsif)**. Dirancang untuk mendorong interaksi dan konversi pengguna melalui beragam tipe tombol canggih: **sekali tekan langsung aksi (`direct`)**, **tombol split dengan dropdown anak (`split`)**, **tombol menu pembuka child actions (`menu`)**, **speed-dial floating action button (`fab`)**, **tombol tahan untuk konfirmasi (`hold`)**, **tombol salin sekali klik (`copy`)**, **widget melayang WhatsApp resmi (`whatsapp`)**, dan **tombol melayang kembali ke atas (`to-top`)**.

---

## 🏛️ Penerapan 5 Pilar UI (`peraturan.md`)

1. **Warna (`colorTheme` & `variant`)**:
   - Mendukung 8 tema warna resmi: `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, dan `'dark'`.
   - Varian gaya visual: `'primary'`, `'gradient'`, `'glow'`, `'shine'`, `'secondary'`, `'danger'`, `'success'`, `'warning'`, `'dark'`, `'outline'`, `'soft'`.
   - Warna gradien, glowing aura, dan kilatan specular sweep beradaptasi dinamis mengikuti `colorTheme` yang dipilih.
   - Kompatibilitas penuh dengan mode gelap (*dark mode*) dan terang (*light mode*).

2. **Bentuk & Desain Anti-Monoton (`rounded`, `size`, `type`)**:
   - **`rounded`**: Pilihan sudut border (`'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`, `'full'`).
   - **`size`**: Dimensi ukuran tombol (`'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`).
   - **Ragam Tipe CTA (Anti-Monoton)**:
     1. `type="direct"`: Tombol aksi langsung dengan sublabel persuasif.
     2. `type="split"`: Tombol terbagi dua (aksi utama + toggle chevron dropdown anak).
     3. `type="menu"`: Seluruh tombol berfungsi membuka menu opsi anak lengkap.
     4. `type="fab"`: Speed-dial floating action button melayang dengan animasi anak bertingkat.
     5. `type="hold"`: Long-press to confirm dengan visual progress fill bar 0% s/d 100%.
     6. `type="copy"`: Salin instan ke clipboard dengan feedback visual "Tersalin!".
     7. `type="whatsapp"`: Widget tombol melayang WhatsApp dengan speech bubble popover dan redirect chat.
     8. `type="to-top"`: Tombol melayang kembali ke atas halaman dengan auto-show saat scroll.

3. **Teks Konten**:
   - Label utama (`label`), teks persuasif kecil 2-baris (`sublabel`), status holding (`holdText`, `holdSuccessText`), loading text (`loadingText`), dan copy feedback (`copiedText`).
   - Teks WhatsApp: `whatsappMessage`, `whatsappBubbleText`, `whatsappStatus`.
   - Scoped slots: `#default`, `#menu`, `#bubble`.

4. **Icon & Mikro-Animasi**:
   - Google Material Symbols untuk leading icon, trailing icon, split chevron, dan to-top arrow.
   - SVG resmi brand WhatsApp dengan resolusi presisi tinggi.
   - Efek visual: animated specular shine sweep (`shine`), diffuse glow aura (`glow`), ripple ink water click (`ripple`), dan pulsing breathing badge (`pulse`).

5. **Responsif & Posisi Layar**:
   - `fabPosition`: `'bottom-right'`, `'bottom-left'`, `'bottom-center'`, `'top-right'`, `'top-left'`, `'inline'`.
   - Full width support (`fullWidth: true`).
   - Posisi melayang dengan *viewport safe margin* di perangkat smartphone.

---

## 📋 Props API (`<CtaButton />`)

| Prop | Tipe | Default | Deskripsi / Pilihan Nilai |
|---|---|---|---|
| `type` | `String` | `'direct'` | Tipe tombol: `'direct'`, `'split'`, `'menu'`, `'fab'`, `'hold'`, `'copy'`, `'whatsapp'`, `'to-top'` |
| `colorTheme` | `String` | `'emerald'` | Tema warna: `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'` |
| `variant` | `String` | `'primary'` | Varian gaya: `'primary'`, `'gradient'`, `'glow'`, `'shine'`, `'secondary'`, `'danger'`, `'success'`, `'warning'`, `'dark'`, `'outline'`, `'soft'` |
| `size` | `String` | `'md'` | Ukuran: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'` |
| `rounded` | `String` | `'default'` | Kelengkungan sudut: `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`, `'full'` |
| `label` | `String` | `''` | Teks utama tombol |
| `sublabel` | `String` | `''` | Teks pendukung kecil di bawah label |
| `icon` | `String` | `''` | Nama Google Material Symbols utama |
| `iconPosition` | `String` | `'left'` | Posisi ikon: `'left'` atau `'right'` |
| `trailingIcon` | `String` | `''` | Ikon tambahan di sebelah kanan (misal: panah maju) |
| `children` | `Array` | `[]` | Daftar aksi anak untuk tipe `'split'`, `'menu'`, `'fab'` |
| `fabPosition` | `String` | `'inline'` | Posisi floating: `'inline'`, `'bottom-right'`, `'bottom-left'`, `'bottom-center'`, `'top-right'`, `'top-left'` |
| `glow` | `Boolean` | `false` | Mengaktifkan efek aura bercahaya di belakang tombol |
| `shine` | `Boolean` | `false` | Mengaktifkan animasi kilau garis cahaya bergerak melintas |
| `pulse` | `Boolean` | `false` | Mengaktifkan detak pernapasan pulsasi halus |
| `ripple` | `Boolean` | `true` | Mengaktifkan efek riak air (*ink ripple*) saat tombol diklik |
| `holdDuration` | `Number` | `1500` | Durasi tahan tombol hold dalam milidetik |
| `copyText` | `String` | `''` | Teks yang disalin ke clipboard untuk `type="copy"` |
| `phone` | `String` | `'628123456789'` | Nomor kontak WhatsApp untuk `type="whatsapp"` |
| `whatsappMessage` | `String` | `'Halo...'` | Pesan teks pembuka default saat membuka WhatsApp |
| `whatsappBubbleText` | `String` | `'...'` | Teks pada speech bubble popover WhatsApp |
| `whatsappStatus` | `String` | `'Online'` | Teks status agen CS pada speech bubble WhatsApp |
| `showBubble` | `Boolean` | `true` | Menampilkan speech bubble ajakan chat di atas tombol WhatsApp |
| `scrollThreshold` | `Number` | `200` | Batas piksel scroll sebelum tombol `to-top` muncul |
| `showProgress` | `Boolean` | `false` | Menampilkan indikator lingkaran progres scroll pada tombol `to-top` |
| `loading` | `Boolean` | `false` | Status memuat dengan animasi spinner |
| `disabled` | `Boolean` | `false` | Menonaktifkan interaksi klik tombol |

---

## 📡 Events API (`<CtaButton />`)

| Event Name | Parameter | Deskripsi |
|---|---|---|
| `@click` | `(event)` | Dipicu saat tombol utama diklik |
| `@child-click` | `(childItem, event)` | Dipicu saat salah satu item menu anak diklik |
| `@hold-complete` | `()` | Dipicu saat penahanan tombol `hold` mencapai 100% |
| `@hold-start` | `()` | Dipicu saat penahanan tombol dimulai |
| `@hold-cancel` | `()` | Dipicu saat tombol dilepaskan sebelum mencapai 100% |
| `@copy` | `(copiedText)` | Dipicu saat teks berhasil disalin ke clipboard |
| `@to-top` | `()` | Dipicu saat tombol kembali ke atas ditekan |
| `@open` | `()` | Dipicu saat menu dropdown anak terbuka |
| `@close` | `()` | Dipicu saat menu dropdown anak tertutup |

---

## 🚀 Contoh Penggunaan

### 1. WhatsApp Floating Chat Widget di Pojok Kanan Bawah
```vue
<script setup>
import CtaButton from '@/Components/Pack/CtaButton.vue';
</script>

<template>
  <!-- Menempel di pojok kanan bawah layar -->
  <CtaButton
    type="whatsapp"
    phone="6281234567890"
    whatsapp-message="Halo admin, saya ingin bertanya tentang integrasi gateway pembayaran."
    whatsapp-bubble-text="Butuh bantuan integrasi pembayaran? Chat tim sales kami!"
    whatsapp-status="Online 24 Jam"
    fab-position="bottom-right"
    pulse
    size="lg"
  />
</template>
```

### 2. Back to Top Floating Button di Pojok Layar
```vue
<template>
  <!-- Otomatis muncul saat pengguna menggulir halaman lebih dari 200px -->
  <CtaButton
    type="to-top"
    fab-position="bottom-right"
    variant="gradient"
    color-theme="indigo"
    show-progress
    size="md"
  />
</template>
```

### 3. Direct Action CTA dengan Efek Gradient, Glow, dan Sublabel
```vue
<template>
  <CtaButton
    type="direct"
    label="Mulai Berlangganan"
    sublabel="Uji coba gratis 14 hari"
    icon="rocket_launch"
    trailing-icon="arrow_forward"
    variant="gradient"
    color-theme="emerald"
    glow
    shine
    size="lg"
    @click="handleSubscribe"
  />
</template>
```

### 4. Split Button dengan Aksi Anak
```vue
<template>
  <CtaButton
    type="split"
    label="Publikasikan Artikel"
    icon="publish"
    variant="gradient"
    color-theme="purple"
    :children="[
      { label: 'Simpan sebagai Draf', icon: 'draft', action: () => saveDraft() },
      { label: 'Jadwalkan Publikasi', icon: 'schedule', action: () => openSchedule() },
    ]"
    @click="publishImmediately"
  />
</template>
```
