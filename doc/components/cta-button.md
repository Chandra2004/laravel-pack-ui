# CTA Button Component

Komponen tombol ajakan bertindak (*Call-To-Action*) konversi tinggi yang dirancang untuk halaman landing, etalase pemasaran, formulir transaksi finansial, hingga widget bantuan mengambang. Mendukung sublabel penjelasan mikro, tombol split dengan menu popover, konfirmasi tahan tekan (*hold-to-confirm*), penyalin papan klip (*copy-to-clipboard*), floating WhatsApp, dan tombol kembali ke atas (*scroll-to-top*).

---

## 01. Overview

`CtaButton.vue` adalah komponen aksi pendorong konversi (*high-converting action trigger*) yang melampaui kemampuan tombol biasa. Komponen ini dirancang untuk menurunkan resistensi psikologis pengguna saat mengambil keputusan penting dengan menyajikan hierarki teks berlapis, animasi kilau cahaya (*shine/glow*), dan umpan balik haptik visual instan.

### 1.1 Apa Entitas Ini
Komponen Vue 3 berbasis Composition API (`packages/laravel-pack-ui/resources/js/Components/Pack/CtaButton.vue`) yang menyediakan 8 tipe operasional tombol aksi, 11 varian gaya permukaan, 8 tema warna semantik, dan integrasi mulus dengan routing Inertia.js.

### 1.2 Fungsi Utama
- Menjadi titik fokus ajakan bertindak utama pada halaman muka (*hero landing page*).
- Menampilkan teks sublabel penjelas (misal: "Tanpa perlu kartu kredit", "Gratis 14 hari") di bawah label utama guna mendongkrak rasio klik (*Click-Through Rate / CTR*).
- Menyediakan tombol pemisah (*split button*) untuk memilih aksi utama versus aksi turunan (misal: "Kirim Sekarang" vs "Jadwalkan Pengiriman").
- Menyediakan tombol tahan (*hold-to-confirm*) untuk aksi destruktif atau transaksi finansial berisiko tinggi tanpa memerlukan modal konfirmasi terpisah.
- Menyalin kode promo, tautan referral, atau teks token ke clipboard secara instan dengan indikator centang sukses visual.
- Menyajikan widget mengambang obrolan langsung WhatsApp dan tombol kembali ke atas (*back-to-top*).

### 1.3 Kapan Digunakan
- Pada bagian atas (*hero section*) dan bagian penutup (*pricing section*) halaman produk atau SaaS.
- Pada tombol transfer uang, pembayaran final, atau penghapusan data permanen yang membutuhkan konfirmasi penekanan terukur.
- Pada kartu kode promo voucher belanja untuk memudahkan pembeli menyalin kode secara instan.
- Pada sudut kanan bawah aplikasi sebagai saluran bantuan pelanggan langsung via WhatsApp.

### 1.4 Karakteristik Penting
- **Micro-Copy Sublabel Architecture**: Label utama dan sublabel diposisikan dalam kolom vertikal yang tetap terpusat secara optik terhadap ikon pendamping.
- **Conversion-Grade Visual Effects**: Dilengkapi varian kilau (*shine*) dan pendaran (*glow*) berbasis animasi CSS murni tanpa pustaka eksternal.
- **Universal Render Target**: Dapat dirender sebagai elemen tombol HTML biasa (`as="button"`), tautan halaman Inertia (`as="Link"`), maupun tag tautan eksternal (`as="a"`).

---

## 02. Preview

> [!TIP]
> Pengujian visual dan showcase interaktif entitas ini tersedia secara native pada portal pratinjau aplikasi:
>
> Rute Showcase: `/demo/cta-button` atau `/preview/cta-button`

---

## 03. Usage

### Pohon Konsep Penggunaan

```text
CtaButton
├── 8 Tipe Fungsional
│   ├── direct (Aksi langsung satu klik standar)
│   ├── split (Aksi primer + pemisah chevron dropdown aksi sekunder)
│   ├── menu (Tombol pembuka popover daftar aksi)
│   ├── fab (Speed-dial floating action button melayang)
│   ├── hold (Tekan dan tahan untuk verifikasi aksi krusial)
│   ├── copy (Salin teks ke clipboard dengan umpan balik instan)
│   ├── whatsapp (Widget melayang obrolan WhatsApp)
│   └── to-top (Tombol melayang kembali ke atas otomatis saat gulir)
├── Gaya Visual & Tema
│   ├── Varian (primary, gradient, glow, shine, secondary, danger, success, warning, dark, outline, soft)
│   └── Palet (primary, indigo, emerald, purple, amber, rose, cyan, dark)
└── Peningkatan Konversi
    ├── Sublabel mikro peredam resistensi
    └── Ikon penjelas arah (leading & trailing icons)
```

### Matriks Kapan Digunakan vs Dihindari

| Kasus Penggunaan | Gunakan CtaButton | Hindari (Gunakan Alternatif) |
|---|---|---|
| Tombol registrasi akun baru pada landing page | Ya (`type="direct"`, `variant="gradient"`) | Jangan gunakan tombol teks biasa yang redup |
| Aksi berbahaya (Hapus Basis Data / Transfer Dana) | Ya (`type="hold"`) | Hindari tombol klik sekali tanpa konfirmasi |
| Tombol kirim formulir standar dengan status simpan | Gunakan ButtonSubmit | CtaButton dirancang untuk konversi pemasaran |
| Tombol navigasi link teks di footer | Tidak | Gunakan komponen Link biasa |

### Contoh Penggunaan Cepat

```vue
<script setup>
import CtaButton from '@/Components/Pack/CtaButton.vue';
</script>

<template>
  <!-- CTA Pemasaran Utama dengan Sublabel -->
  <CtaButton
    label="Mulai Uji Coba Gratis"
    sublabel="Akses penuh selama 14 hari tanpa kartu kredit"
    icon="rocket_launch"
    trailing-icon="arrow_forward"
    color-theme="emerald"
    variant="gradient"
    size="lg"
    rounded="2xl"
    as="Link"
    href="/register"
  />
</template>
```

---

## 04. Anatomy

### Diagram Struktur Anatomi

```text
1. Mode Direct dengan Sublabel:
+--------------------------------------------------------------+
|  (Icon)  LABEL UTAMA KONVERSI                (Trailing Icon) |
|          Sublabel penjelas mikro pereda friksi               |
+--------------------------------------------------------------+

2. Mode Split Button:
+-------------------------------------------------+------------+
|  (Icon)  Kirim Dokumen Kontrak                  |    ( v )   |
|          Kirim langsung ke email klien          |  [Divider] |
+-------------------------------------------------+------------+
                                                  | Popover    |
                                                  | - Simpan   |
                                                  | - Jadwal   |
                                                  +------------+

3. Mode Hold-to-Confirm:
+--------------------------------------------------------------+
|  [=== Progress Bar Pengisian Tahan === (65%) ]               |
|  (Icon)  Tahan 2 Detik untuk Menghapus Server                |
+--------------------------------------------------------------+
```

### Komponen Anatomi Rinci
1. **Main Trigger Container**: Kontainer tombol utama yang membungkus teks dan efek visual dengan kelengkungan sudut adaptif.
2. **Leading Icon**: Ikon Google Material Symbol di sisi kiri yang mempertegas konteks tindakan (misal: roket, unduh, perisai).
3. **Primary Label**: Teks ajakan bertindak utama berukuran tebal dan tegas.
4. **Sublabel Micro Text**: Teks kecil di bawah label utama yang menyajikan bukti nilai (*value proposition*) tambahan.
5. **Trailing Icon**: Ikon di sisi kanan (seperti panah `arrow_forward` atau chevron) yang mengindikasikan kelanjutan alur.
6. **Split Divider Border**: Garis vertikal tipis yang memisahkan area klik aksi utama dengan tombol pemicu menu tambahan.
7. **Popover Action List**: Panel daftar tindakan anak (*children*) yang muncul saat tombol split atau menu ditekan.
8. **Hold Progress Indicator**: Visualisasi lingkaran (*circular SVG*) atau bar pengisian linier yang bergerak seiring lamanya tombol ditekan.
9. **Copied Feedback Layer**: Transformasi label dan ikon menjadi tanda centang hijau sesaat setelah teks berhasil tersalin ke papan klip.
10. **Floating Speed-Dial FAB**: Kontainer melayang di sudut layar yang memunculkan deretan aksi cepat saat disentuh.

---

## 05. Variants

### Tabel Tipe Desain Fungsional (`type`)

| Nama Nilai | Kapan Dipakai | Ringkasan Visual |
|---|---|---|
| `direct` | Aksi utama langsung sekali klik tanpa submenu | Tombol tunggal dengan label, sublabel, dan ikon penjelas |
| `split` | Pilihan antara aksi utama langsung atau memilih aksi turunan | Tombol ganda terpisah border divider dengan panah chevron toggle |
| `menu` | Menampilkan menu popover daftar opsi saat tombol ditekan | Tombol tunggal pembuka popover daftar aksi anak (*children*) |
| `fab` | Aksesibilitas aksi melayang sudut bawah layar (speed dial) | Tombol bulat mengambang yang mengekspansi daftar aksi ke atas |
| `hold` | Mencegah ketidaksengajaan pada aksi destruktif atau pembayaran | Tombol dengan visual progress pengisian saat ditekan berkesinambungan |
| `copy` | Penyalinan token, kode promo, atau URL referral sekali klik | Tombol dengan transisi feedback centang hijau seketika tersalin |
| `whatsapp` | Saluran layanan bantuan langsung dan kontak pesan | Tombol floating dengan gelembung ucapan dan auto-redirect chat |
| `to-top` | Navigasi kembali ke atas pada halaman panjang | Tombol melayang yang otomatis tampil saat melewati batas scroll |

### Tabel Gaya Visual Permukaan (`variant`)

| Nama Nilai | Kapan Dipakai | Ringkasan Visual |
|---|---|---|
| `primary` | Tombol penarik aksi utama standar | Permukaan solid pekat sesuai warna tema aktif |
| `gradient` | Hero banner atau kartu penetapan harga SaaS premium | Gradasi dua warna modern yang kontras dan mewah |
| `glow` | Menonjolkan satu tombol paling krusial di halaman muka | Pendar aura cahaya lembut (*ambient glow*) di sekeliling tombol |
| `shine` | Menarik perhatian mata pengguna secara dinamis | Animasi kilatan cahaya putih diagonal yang bergerak berkala |
| `secondary` | Aksi pelengkap atau penyeimbang tombol primer | Latar netral abu-abu elegan dengan teks berbobot sedang |
| `danger` | Aksi berbahaya atau penghapusan permanen | Latar merah tegas yang menandakan risiko tinggi |
| `success` | Konfirmasi transaksi selesai atau persetujuan berhasil | Latar hijau sukses dengan kontras tinggi |
| `warning` | Tindakan pencegahan atau peringatan transaksi | Latar amber kuning tanda kehati-hatian |
| `dark` | Desain antarmuka monokromatis atau dark mode | Latar hitam pekat (*midnight black*) dengan teks terang |
| `outline` | Aksi sekunder dengan latar belakang bersih | Garis tepi berwarna transparan dengan latar transparan |
| `soft` | Aksi santai di dalam formulir atau kartu dashboard | Latar pastel lembut dengan teks bertema warna serasi |

### Tema Warna Semantik (`colorTheme`)
Tersedia 8 palet tema warna: `primary`, `indigo`, `emerald`, `purple`, `amber`, `rose`, `cyan`, dan `dark`.

---

## 06. Sizes

### Pilihan Ukuran Tombol (`size`)
| Nilai Prop | Padding Horizontal & Vertikal | Tinggi Minimum | Ukuran Font Label | Ukuran Font Sublabel |
|---|---|---|---|---|
| `xs` | `px-2.5 py-1` | `28px` | `text-xs` (12px) | `text-[9px]` |
| `sm` | `px-3.5 py-1.5` | `32px` | `text-sm` (14px) | `text-[10px]` |
| `md` | `px-5 py-2.5` | `40px` | `text-base` (16px)| `text-xs` (12px) |
| `lg` | `px-6 py-3.5` | `48px` | `text-lg` (18px)  | `text-xs` (12px) |
| `xl` | `px-8 py-4`   | `56px` | `text-xl` (20px)  | `text-sm` (14px) |

### Kelengkungan Sudut (`rounded`)
Tersedia opsi sudut: `default`, `none`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, dan `full`.

---

## 07. States

- **Normal / Default State**: Tampilan pasif siap klik dengan kontras warna optimal.
- **Hover State**: Peningkatan elevasi bayangan dan intensitas kecerahan warna saat kursor berada di atas tombol.
- **Active / Pressed State**: Skala tombol sedikit menyusut (`scale-[0.98]`) untuk memberikan rasa tekanan fisik yang nyata.
- **Holding State (Tipe `hold`)**: Indikator lingkaran progres SVG atau bar latar belakang terisi secara proporsional sesuai durasi penekanan.
- **Hold Completed State**: Berhasil mencapai target waktu penahanan dan langsung memancarkan event `hold-complete`.
- **Copied State (Tipe `copy`)**: Label berubah menjadi "Tersalin!" dengan ikon centang hijau selama 2 detik sebelum kembali normal.
- **Loading State**: Menampilkan ikon animasi spinner berputar dan menonaktifkan interaksi tombol.
- **Disabled State**: Opasitas tombol meredup (`opacity-50`) dengan kursor dilarang (`cursor-not-allowed`).

---

## 08. Props / Attributes

| Prop | Tipe Data | Default | Keterangan |
|---|---|---|---|
| `type` | `String` | `'direct'` | Tipe operasional tombol: `'direct'`, `'split'`, `'menu'`, `'fab'`, `'hold'`, `'copy'`, `'whatsapp'`, `'to-top'` |
| `colorTheme` | `String` | `'emerald'` | Skema warna semantik: `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'` |
| `variant` | `String` | `'primary'` | Gaya visual: `'primary'`, `'gradient'`, `'glow'`, `'shine'`, `'secondary'`, `'danger'`, `'success'`, `'warning'`, `'dark'`, `'outline'`, `'soft'` |
| `size` | `String` | `'md'` | Skala dimensi: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'` |
| `rounded` | `String` | `'default'` | Radius sudut: `'default'`, `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`, `'full'` |
| `as` | `String` | `'button'` | Tag elemen pembungkus: `'button'`, `'Link'`, `'a'` |
| `href` | `String` | `null` | Alamat URL tujuan jika `as="Link"` atau `as="a"` |
| `label` | `String` | `''` | Teks utama pada tombol |
| `sublabel` | `String` | `''` | Teks mikro pendukung di bawah label utama |
| `icon` | `String` | `''` | Nama ikon Google Material Symbols di sisi kiri |
| `iconPosition` | `String` | `'left'` | Posisi ikon terhadap label: `'left'`, `'right'` |
| `trailingIcon` | `String` | `''` | Nama ikon penunjuk di tepi kanan tombol |
| `children` | `Array` | `[]` | Daftar item aksi turunan untuk tipe `'split'`, `'menu'`, atau `'fab'` |
| `menuAlign` | `String` | `'right'` | Perataan horizontal menu popover: `'left'`, `'right'` |
| `menuPosition` | `String` | `'bottom'` | Posisi vertikal menu popover: `'bottom'`, `'top'` |
| `fabPosition` | `String` | `'inline'` | Posisi tetap tombol floating: `'inline'`, `'bottom-right'`, `'bottom-left'`, `'bottom-center'`, `'top-right'`, `'top-left'` |
| `loading` | `Boolean` | `false` | Menampilkan indikator proses pemuatan spinner |
| `loadingText` | `String` | `''` | Teks label pengganti saat status loading aktif |
| `disabled` | `Boolean` | `false` | Menonaktifkan seluruh interaksi klik pada tombol |
| `glow` | `Boolean` | `false` | Mengaktifkan efek pendaran cahaya di sekeliling tombol |
| `shine` | `Boolean` | `false` | Mengaktifkan efek kilatan cahaya animasi yang bergerak berkala |
| `pulse` | `Boolean` | `false` | Mengaktifkan animasi detak pulsasi ritmis halus |
| `ripple` | `Boolean` | `true` | Mengaktifkan efek riak gelombang air saat tombol diklik |
| `holdDuration` | `Number` | `1500` | Durasi penahanan dalam milidetik untuk tipe `'hold'` |
| `holdText` | `String` | `'Tahan...'` | Teks instruksi saat proses penahanan berlangsung |
| `holdSuccessText` | `String` | `'Berhasil!'` | Teks konfirmasi sesaat setelah penahanan selesai |
| `copyText` | `String` | `''` | String teks yang akan disalin ke clipboard untuk tipe `'copy'` |
| `copiedText` | `String` | `'Tersalin!'` | Label umpan balik visual sukses salin |
| `closeOnClick` | `Boolean` | `true` | Menutup dropdown menu seketika aksi anak diklik |
| `fullWidth` | `Boolean` | `false` | Membuat tombol membentang selebar 100% kontainer |
| `phone` | `String` | `'628123456789'` | Nomor WhatsApp tujuan internasional tanpa tanda plus |
| `whatsappMessage` | `String` | `'Halo, ...'` | Pesan pembuka awal saat membuka ruang percakapan WhatsApp |
| `whatsappBubbleText` | `String` | `'Ada yang bisa ...'` | Teks sapaan pada balon pesan obrolan WhatsApp |
| `whatsappStatus` | `String` | `'Online'` | Teks status operasional pada balon WhatsApp |
| `showBubble` | `Boolean` | `true` | Menampilkan atau menyembunyikan balon pesan sapaan WhatsApp |
| `scrollThreshold` | `Number` | `200` | Batas piksel scroll jendela sebelum tombol to-top muncul |
| `showProgress` | `Boolean` | `false` | Menampilkan lingkaran progres persentase gulir pada to-top |

---

## 09. Slots

| Nama Slot | Parameter Lingkup (Scope Props) | Keterangan |
|---|---|---|
| `default` | — | Konten kustom di dalam tombol utama (menggantikan perenderan default label) |
| `bubble` | `{ phone, status }` | Kustomisasi tampilan kotak balon sapaan WhatsApp |
| `menu` | `{ children, close }` | Kustomisasi template daftar aksi turunan popover menu |

---

## 10. Events / Interactions

| Nama Event | Parameter (Payload) | Deskripsi Pemancaran |
|---|---|---|
| `click` | `MouseEvent` | Dipancarkan saat tombol utama diklik (diabaikan jika disabled atau loading) |
| `child-click` | `Object` | Dipancarkan saat salah satu item aksi anak pada split, menu, atau fab diklik |
| `hold-start` | — | Dipancarkan saat pengguna mulai menekan tombol tipe `hold` |
| `hold-complete` | — | Dipancarkan saat penahanan tombol tipe `hold` berhasil tuntas 100% |
| `hold-cancel` | — | Dipancarkan saat pengguna melepaskan tombol sebelum waktu penahanan selesai |
| `copy` | `String` | Dipancarkan saat teks berhasil disalin ke papan klip pada tipe `copy` |
| `open` | — | Dipancarkan saat menu popover atau speed-dial FAB terbuka |
| `close` | — | Dipancarkan saat menu popover atau speed-dial FAB tertutup |
| `to-top` | — | Dipancarkan saat tombol tipe `to-top` diklik untuk menggulir ke puncak |


---

## 11. Code Example

### 11.1 Tombol Ajakan Bertindak Landing Page dengan Efek Kilau (*Shine*)
```vue
<script setup>
import CtaButton from '@/Components/Pack/CtaButton.vue';
</script>

<template>
  <div class="flex justify-center p-8 bg-slate-950 rounded-2xl">
    <CtaButton
      label="Dapatkan Akses Sekarang"
      sublabel="Hanya Rp 99.000 / bulan - Garansi 30 hari uang kembali"
      icon="verified"
      trailing-icon="arrow_forward"
      variant="shine"
      color-theme="emerald"
      size="xl"
      rounded="2xl"
      as="Link"
      href="/checkout/pro-plan"
    />
  </div>
</template>
```

### 11.2 Tombol Tahan untuk Penghapusan Server Permanen (*Hold-to-Confirm*)
```vue
<script setup>
import CtaButton from '@/Components/Pack/CtaButton.vue';

function handleServerDelete() {
  alert('Server produksi berhasil dihapus secara permanen.');
}
</script>

<template>
  <CtaButton
    type="hold"
    label="Tahan untuk Menghapus Server"
    sublabel="Aksi destruktif tidak dapat dibatalkan"
    icon="delete_forever"
    variant="danger"
    color-theme="rose"
    size="lg"
    :hold-duration="2000"
    @hold-complete="handleServerDelete"
  />
</template>
```

### 11.3 Tombol Salin Kode Voucher Belanja (*One-Click Copy*)
```vue
<script setup>
import CtaButton from '@/Components/Pack/CtaButton.vue';
</script>

<template>
  <div class="flex items-center gap-4 p-4 border border-dashed border-amber-300 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
    <div>
      <span class="text-xs font-bold text-amber-700 dark:text-amber-300">KODE PROMO SPESIAL</span>
      <div class="text-lg font-mono font-black text-slate-900 dark:text-white">DISKON50PERSEN</div>
    </div>

    <CtaButton
      type="copy"
      label="Salin Kode"
      icon="content_copy"
      copy-text="DISKON50PERSEN"
      variant="primary"
      color-theme="amber"
      size="sm"
    />
  </div>
</template>
```

### 11.4 Tombol Mengambang Layanan Pelanggan WhatsApp
```vue
<script setup>
import CtaButton from '@/Components/Pack/CtaButton.vue';
</script>

<template>
  <CtaButton
    type="whatsapp"
    phone="628123456789"
    whatsapp-message="Halo Tim Layanan Pelanggan, saya ingin bertanya tentang paket langganan Enterprise."
  />
</template>
```

---

## 12. Result / Behavior

- **Animasi Kilau Menarik Perhatian (*Shine Wave*)**: Menggunakan elemen semu CSS `::after` dengan kemiringan sudut 45 derajat yang menyapu secara halus setiap beberapa detik, memberikan rangsangan optik visual tanpa mengganggu keterbacaan teks.
- **Kalkulasi Tekan Tahan Kinetis**: Mendengarkan event `mousedown` dan `touchstart` secara simultan. Jika jari atau kursor terangkat atau bergeser sebelum waktu `holdDuration` terpenuhi, timer dibatalkan seketika dan animasi progres kembali ke posisi 0.
- **Sinkronisasi Papan Klip Asinkron**: Menggunakan `navigator.clipboard.writeText()` dengan penanganan fallback otomatis untuk lingkungan peramban lawas, dilanjutkan dengan pengubahan status visual secara reaktif selama 2000ms.
- **Deteksi Ambang Gulir Cerdas**: Tipe `to-top` mendengarkan posisi `window.scrollY`. Ketika posisi melebihi properti `scrollThreshold`, tombol meluncur masuk secara mulus dari sudut kanan bawah.

---

## 13. Customization

### Mengubah Tag Pembungkus untuk Navigasi Inertia
Anda dapat mengintegrasikan CtaButton langsung ke dalam router Inertia tanpa merusak tautan SPA (*Single Page Application*):

```vue
<CtaButton
  as="Link"
  href="/auth/register"
  label="Daftar Sekarang"
  variant="gradient"
  color-theme="indigo"
/>
```

### Menyesuaikan Menu Tindakan Anak pada Tipe Split
```vue
<script setup>
import CtaButton from '@/Components/Pack/CtaButton.vue';

const childActions = [
  { label: 'Simpan sebagai Draf', icon: 'draft', action: () => console.log('Draft') },
  { label: 'Jadwalkan Besok', icon: 'schedule', action: () => console.log('Jadwal') },
];
</script>

<template>
  <CtaButton
    type="split"
    label="Publikasikan Artikel"
    icon="publish"
    variant="primary"
    color-theme="primary"
    :children="childActions"
  />
</template>
```

---

## 14. Accessibility

- **Keyboard Triggerability**: Tombol tipe direct, split, dan copy dapat diaktifkan menggunakan tombol `Enter` atau `Space`.
- **Holding Announcement**: Pada tombol tipe `hold`, elemen penunjuk progres dilengkapi atribut `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="100"`, dan `aria-valuenow` yang terbarui secara berkala.
- **Clipboard Confirmation**: Saat teks disalin, pembaruan status diumumkan ke pembaca layar (*screen reader*) melalui live region `aria-live="polite"`.
- **Accessible Popovers**: Menu dropdown pada tipe split dan menu memiliki atribut `aria-haspopup="true"` dan `aria-expanded="true|false"` untuk menginformasikan ketersediaan daftar aksi turunan.

---

## 15. Responsive Behavior

- **Mobile Viewport Optimization**: Pada layar seluler, tombol CTA utama dapat dikonfigurasi menggunakan kelas `w-full` agar mencakup seluruh lebar layar, memberikan area ketuk jempol (*thumb tap target*) yang sangat ergonomis.
- **Floating Button Safe Insets**: Tombol mengambang (tipe `whatsapp`, `fab`, dan `to-top`) memperhitungkan batas bawah perangkat bergerak melalui `calc(1rem + env(safe-area-inset-bottom))` agar tidak tertutup oleh navigasi bar sistem iOS/Android.

---

## 16. Do / Don't

| Rekomendasi (Do) | Pantangan (Don't) |
|---|---|
| Gunakan sublabel untuk menjawab keraguan utama pengguna (seperti kartu kredit atau biaya tersembunyi). | Jangan membuat teks sublabel terlalu panjang melebihi 2 baris kalimat. |
| Gunakan tipe `hold` pada aksi berbahaya berisiko tinggi seperti penghapusan server atau database. | Jangan gunakan tipe `hold` pada aksi rutin harian seperti tombol pencarian atau navigasi. |
| Gunakan efek `shine` atau `glow` secara terukur pada 1 tombol utama per halaman. | Jangan memasang efek `shine` pada seluruh tombol di layar karena akan memicu disorientasi visual. |
| Cantumkan trailing icon `arrow_forward` untuk mengindikasikan langkah lanjutan transaksi. | Jangan menggunakan ikon yang tidak memiliki hubungan semantik dengan ajakan bertindak. |

---

## 17. Examples / Recipes

### Recipe 1: Tombol Konversi Paket Langganan Premium
```vue
<CtaButton
  label="Tingkatkan ke Paket Enterprise"
  sublabel="Fitur keamanan perbankan, SLA 99.9%, dan dukungan prioritas"
  icon="verified_user"
  trailing-icon="arrow_forward"
  variant="gradient"
  color-theme="indigo"
  size="xl"
  rounded="2xl"
  as="Link"
  href="/pricing/enterprise"
/>
```

### Recipe 2: Konfirmasi Transfer Dana Dompet Digital
```vue
<CtaButton
  type="hold"
  label="Tahan untuk Kirim Rp 500.000"
  sublabel="Pastikan nomor rekening tujuan sudah sesuai"
  icon="send"
  variant="primary"
  color-theme="emerald"
  size="lg"
  :hold-duration="1800"
  @hold-complete="executeTransfer"
/>
```

---

## 18. Related Components

- **[ButtonSubmit Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/button-submit.md)**: Tombol aksi asinkron untuk pengiriman formulir standar.
- **[ButtonTheme Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/button-theme.md)**: Tombol khusus pengalih mode gelap dan terang aplikasi.
- **[Badge Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/badge.md)**: Lencana penanda diskon atau status yang kerap mendampingi tombol CTA.
- **[Card Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/card.md)**: Kontainer kartu presentasi paket harga yang memuat CtaButton.

---

## 19. Notes / Limitations

- **Clipboard Security Context**: Fitur penyalinan papan klip (`type="copy"`) mengharuskan halaman disajikan melalui protokol aman `HTTPS` atau lingkungan `localhost`. Pada protokol HTTP tidak aman, peramban modern memblokir akses ke Clipboard API.
- **Scroll Touch Cancellation**: Pada perangkat layar sentuh, jika pengguna menempelkan jari pada tombol `hold` kemudian menggeser layar untuk menggulir halaman (*scrolling*), penahanan tombol secara otomatis dibatalkan untuk mencegah eksekusi yang tidak disengaja.
- **WhatsApp Web Intent**: Tautan WhatsApp otomatis memilih aplikasi WhatsApp bawaan pada ponsel pintar dan beralih ke WhatsApp Web pada peramban desktop.
