# CartDrawer Component

Komponen panel samping geser (*slide-over drawer*) untuk keranjang belanja e-commerce yang terhubung penuh dengan state cart reaktif, perhitungan diskon otomatis, kalkulasi PPN/pajak, pelacak ambang batas gratis ongkir, catatan kustom pesanan, dan input voucher promosi.

---

## 01. Overview

`CartDrawer.vue` adalah komponen antarmuka *off-canvas* yang memberikan pengalaman belanja tanpa hambatan (*frictionless e-commerce experience*). Pengguna dapat melihat daftar belanjaan, mengubah kuantitas, menyematkan catatan, dan melanjutkan transaksi ke pembayaran tanpa perlu berpindah atau memuat ulang halaman.

### 1.1 Apa Entitas Ini
Komponen Vue 3 berbasis Composition API (`packages/laravel-pack-ui/resources/js/Components/Pack/CartDrawer.vue`) yang bekerja secara simbiotik dengan composable `useCart` untuk manajemen status terpusat keranjang belanja di seluruh siklus hidup aplikasi.

### 1.2 Fungsi Utama
- Menampilkan daftar produk yang telah dimasukkan ke keranjang belanja dalam panel samping meluncur.
- Memberikan interaksi pengubahan kuantitas produk (+/-) secara langsung dengan proteksi batas stok.
- Menghitung kalkulasi subtotal, diskon kupon, estimasi biaya pengiriman, dan estimasi pajak (PPN) secara real-time.
- Menyediakan progress bar interaktif menuju target gratis ongkir untuk meningkatkan nilai pesanan rata-rata (*Average Order Value / AOV*).
- Menyediakan kolom input catatan khusus pada masing-masing produk (misal: ukuran, warna khusus, atau instruksi penyajian).

### 1.3 Kapan Digunakan
- Pada aplikasi toko online (*e-commerce store*) sebagai panel peninjau pesanan cepat.
- Pada platform pemesanan makanan (*food delivery*) untuk merangkum item pesanan beserta instruksi saus atau alergi.
- Pada antarmuka penjualan lisensi perangkat lunak atau langganan digital dengan opsi penukaran kupon promosi.

### 1.4 Karakteristik Penting
- **Global Reactive Store Synchronization**: Secara otomatis mendengarkan perubahan pada instans `useCart()`, sehingga penambahan produk dari tombol mana pun pada halaman web langsung memperbarui isi drawer.
- **Scroll-Lock Isolation**: Mengunci gulir dokumen latar belakang (`document.body.style.overflow = 'hidden'`) secara otomatis saat drawer terbuka untuk menjaga fokus interaksi pengguna.
- **Micro-State Gamification**: Memanfaatkan visualisasi progress pengiriman gratis untuk memberikan dorongan psikologis positif kepada pembeli.

---

## 02. Preview

> [!TIP]
> Pengujian visual dan showcase interaktif entitas ini tersedia secara native pada portal pratinjau aplikasi:
>
> <a href="/preview/cart-drawer" target="_self" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 8px; background-color: var(--vp-c-brand-1, #4f46e5); color: #ffffff;">Buka Live Preview Komponen CartDrawer &rarr;</a>

---

## 03. Usage

### Pohon Konsep Penggunaan

```text
CartDrawer
├── Kontrol Visibilitas
│   ├── Internal Composable (`cart.isCartOpen = true`)
│   └── Controlled Model (`v-model="isCartOpen"`)
├── Bagian Panel
│   ├── Header (Judul, badge jumlah item, tombol hapus semua, tombol tutup)
│   ├── Gamifikasi Ongkir (Bar progress dinamis menuju ambang gratis ongkir)
│   ├── Feed Produk (Daftar kartu produk, stepper jumlah, catatan, aksi hapus)
│   ├── Voucher Section (Formulir validasi kupon diskon langsung)
│   └── Ringkasan Biaya (Rincian subtotal, diskon, PPN, ongkir, tombol checkout)
└── Siklus Pembayaran
    ├── Redirect Inertia / URL Standar (`checkout-url="/checkout"`)
    └── Event Handler Kustom (`@checkout="onProcessCheckout"`)
```

### Matriks Kapan Digunakan vs Dihindari

| Kasus Penggunaan | Gunakan CartDrawer | Hindari (Gunakan Alternatif) |
|---|---|---|
| Peninjauan belanjaan cepat tanpa navigasi halaman | Ya | Hindari langsung me-redirect ke halaman cart terpisah |
| Konfirmasi satu produk instan (Buy Now) | Opsional | Gunakan Modal Checkout langsung jika hanya 1 produk |
| Formulir pengisian alamat dan pembayaran lengkap | Tidak | Gunakan Halaman Checkout Utama terdedikasi |
| Notifikasi berhasil menambahkan produk | Tidak | Gunakan Toast Notification |

### Contoh Penggunaan Cepat

```vue
<script setup>
import { ref } from 'vue';
import CartDrawer from '@/Components/Pack/CartDrawer.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';
import { useCart } from '@/Composables/Pack/useCart';

const cart = useCart();
const isDrawerOpen = ref(false);

function openCart() {
  isDrawerOpen.value = true;
}

function handleCheckout(summaryData) {
  console.log('Melanjutkan transaksi pembayaran dengan rincian:', summaryData);
}
</script>

<template>
  <div>
    <!-- Tombol Pemicu di Bilah Navigasi -->
    <button @click="openCart" class="relative p-2 text-slate-700 dark:text-slate-200">
      <span class="material-symbols-outlined">shopping_cart</span>
      <span v-if="cart.itemCount.value > 0" class="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
        {{ cart.itemCount.value }}
      </span>
    </button>

    <!-- Komponen CartDrawer -->
    <CartDrawer
      v-model="isDrawerOpen"
      checkout-url="/checkout"
      @checkout="handleCheckout"
    />
  </div>
</template>
```

---

## 04. Anatomy

### Diagram Struktur Anatomi

```text
[Backdrop Blur Overlay (Klik luar untuk menutup)]
+--------------------------------------------------------------+
| [DRAWER PANEL (Meluncur dari sisi kanan layar)]             |
|                                                              |
| [HEADER]                                                     |
| (Icon) Keranjang Belanja [3 Item]        [Hapus Semua] [X]   |
+--------------------------------------------------------------+
| [FREE SHIPPING PROGRESS TRACKER]                             |
| Belanja Rp 120.000 lagi untuk GRATIS ONGKIR!                 |
| [==========================------------] 68%                 |
+--------------------------------------------------------------+
| [SCROLLABLE ITEMS FEED]                                      |
| +----------------------------------------------------------+ |
| | [Img] Nama Produk Sepatu Sneakers          [Hapus Item]  |
| |       Varian: Hitam, Ukuran 42                           |
| |       Rp 650.000               [-] [ 1 ] [+]             |
| |       [+] Tambah Catatan Pesanan                         |
| +----------------------------------------------------------+ |
| | [Img] Kaos Kaki Olahraga Katun             [Hapus Item]  |
| |       Varian: Putih Polos                                |
| |       Rp 35.000                [-] [ 2 ] [+]             |
| +----------------------------------------------------------+ |
+--------------------------------------------------------------+
| [VOUCHER INPUT SECTION]                                      |
| [Masukkan Kode Kupon...] [Terapkan]                          |
| Lencana voucher aktif: 'DISKON50' (-Rp 50.000) [Hapus]       |
+--------------------------------------------------------------+
| [FINANCIAL SUMMARY FOOTER]                                   |
| Subtotal                                        Rp 720.000   |
| Diskon Kupon                                   -Rp  50.000   |
| Pajak (PPN 11%)                                 Rp  73.700   |
| Ongkos Kirim                                     Rp 15.000   |
| TOTAL PEMBAYARAN                                Rp 758.700   |
|                                                              |
| [ TOMBOL CHECKOUT: Lanjut ke Pembayaran -> ]                 |
+--------------------------------------------------------------+
```

### Komponen Anatomi Rinci
1. **Backdrop Blur Overlay**: Lapisan latar belakang gelap bergradasi dengan blur halus (`bg-slate-900/50 backdrop-blur-xs`) yang memusatkan fokus penglihatan ke arah panel geser.
2. **Slide-Over Panel Container**: Kontainer laci dengan batas lebar responsif (`max-w-md` pada layar desktop, layar penuh pada seluler) yang meluncur masuk dari tepi kanan.
3. **Drawer Header**: Area judul yang memuat ikon keranjang, lencana total produk aktif, tombol bersihkan keranjang (*clear cart*), dan tombol tutup silang (*X*).
4. **Free Shipping Progress Tracker**: Bilah kemajuan dinamis yang menghitung selisih nilai subtotal belanja terhadap ambang batas pengiriman gratis.
5. **Scrollable Items Feed**: Area penampung daftar produk yang dapat digulir mandiri tanpa memengaruhi posisi header maupun footer.
6. **Cart Item Card**: Kartu satuan produk berfitur lengkap yang mencakup thumbnail visual, judul, varian warna/ukuran, label harga per satuan, kontrol stepper jumlah kuantitas, dan penyunting catatan inline.
7. **Coupon / Voucher Section**: Kotak input kode promo lengkap dengan verifikasi instan dan tombol pembatalan voucher.
8. **Financial Summary Footer**: Rincian matematis subtotal, besaran diskon, kalkulasi pajak PPN, estimasi ongkir, dan total nominal akhir.
9. **Checkout CTA Button**: Tombol konversi utama dengan indikator pemuatan dan tautan langsung ke halaman pembayaran.
10. **Empty State Placeholder**: Tampilan visual khusus yang muncul secara anggun saat keranjang belanja belum memiliki produk.

---

## 05. Variants

Komponen CartDrawer beradaptasi berdasarkan status muatan keranjang:

- **Populated Cart (Status Berisi)**: Menampilkan seluruh alur dari progress bar, daftar barang belanjaan, input kupon, hingga rincian biaya.
- **Empty Cart (Status Kosong)**: Menyembunyikan rincian biaya dan menampilkan ilustrasi keranjang kosong, pesan ramah, serta tombol CTA ajakan mulai berbelanja (*Start Shopping*).
- **Gamified Shipping Mode**: Mengaktifkan atau menonaktifkan bilah target pengiriman gratis melalui properti `showFreeShipping`.
- **Note-Enabled Mode**: Mengizinkan pembeli menambahkan catatan operasional khusus per item melalui properti `showNotes`.

---

## 06. Sizes

### Dimensi Panel Drawer
- **Desktop & Tablet (`>= 640px`)**: Lebar tetap optimal `max-w-md` (`28rem` atau setara `448px`), memungkinkan pengguna tetap melihat konten halaman utama di sisi kiri.
- **Mobile (`< 640px`)**: Lebar penuh layar (`w-screen` / `100vw`) untuk kenyamanan jempol dan keterbacaan teks maksimal pada perangkat genggam.

### Dimensi Thumbnail Produk
- Thumbnail menggunakan rasio simetris `w-20 h-20` (80px x 80px) dengan kelengkungan sudut `rounded-xl` dan pemangkasan objek `object-cover`.

---

## 07. States

- **Closed State**: Panel drawer tersembunyi di luar area pandang kanan (`translate-x-full`) dan backdrop berada dalam kondisi `opacity-0 pointer-events-none`.
- **Open / Active State**: Panel drawer meluncur masuk ke posisi layar (`translate-x-0`) dengan transisi durasi 300ms.
- **Empty Cart State**: Ditampilkan saat `cart.items.length === 0`.
- **Applying Voucher State**: Menampilkan status pemrosesan spinner mikro pada tombol kupon saat kode promo sedang divalidasi ke backend atau store lokal.
- **Voucher Applied State**: Menampilkan lencana warna hijau sukses dan nominal potongan diskon yang langsung memotong kalkulasi total belanja.
- **Locked Body Scroll State**: Dokumen utama tidak dapat digulir selama drawer aktif.

---

## 08. Props / Attributes

| Prop | Tipe Data | Default | Keterangan |
|---|---|---|---|
| `modelValue` | `Boolean` | `undefined` | Kontrol status buka-tutup (dua arah via `v-model`). Jika tidak disetel, otomatis menggunakan `cart.isCartOpen.value`. |
| `title` | `String` | `'Keranjang Belanja'` | Teks judul utama pada bilah header drawer |
| `checkoutUrl` | `String` | `''` | Alamat URL tujuan untuk diarahkan saat tombol checkout diklik |
| `checkoutLabel` | `String` | `'Lanjut ke Pembayaran'` | Teks label pada tombol konfirmasi checkout |
| `showFreeShipping` | `Boolean` | `true` | Menampilkan atau menyembunyikan bilah kemajuan gratis ongkir |
| `showVoucherInput` | `Boolean` | `true` | Menampilkan atau menyembunyikan seksi masukan kupon diskon |
| `showTax` | `Boolean` | `true` | Menampilkan rincian kalkulasi pajak PPN pada ringkasan biaya |
| `showNotes` | `Boolean` | `true` | Menampilkan opsi tambah catatan instruksi pada setiap item produk |

---

## 09. Slots

| Nama Slot | Keterangan | Parameter Lingkup |
|---|---|---|
| `header` | Kustomisasi menyeluruh bilah header laci keranjang | - |
| `empty` | Tampilan kustom saat keranjang dalam kondisi kosong | - |
| `item` | Kustomisasi tampilan masing-masing kartu produk dalam daftar | `{ item }` |
| `footer` | Kustomisasi tombol aksi checkout di bagian bawah laci | - |

---

## 10. Events / Interactions

| Nama Event | Parameter | Deskripsi Pemancaran |
|---|---|---|
| `update:modelValue`| `Boolean` | Dipancarkan saat status visibilitas drawer berubah (untuk binding `v-model`) |
| `close` | - | Dipancarkan seketika saat drawer ditutup oleh pengguna |
| `checkout` | `Object` | Dipancarkan saat tombol checkout ditekan, membawa payload ringkasan pesanan |

> [!NOTE]
> Manipulasi item keranjang (penambahan, pengurangan, penghapusan item), penerapan kode voucher, dan pengosongan keranjang dikelola langsung secara reaktif melalui fungsi composable `useCart()` (`addItem`, `removeItem`, `applyVoucher`, `clearCart`), bukan melalui pemancaran event komponen anak.

---

## 11. Code Example

### Integrasi Lengkap Toko Online dengan Composable
```vue
<script setup>
import { ref } from 'vue';
import CartDrawer from '@/Components/Pack/CartDrawer.vue';
import { useCart } from '@/Composables/Pack/useCart';

const cart = useCart();
const isCartOpen = ref(false);

// Menambahkan produk ke keranjang secara programatis
function tambahSepatu() {
  cart.addItem({
    id: 101,
    name: 'Sepatu Running Ultralight Pro',
    price: 850000,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    quantity: 1,
    options: {
      color: 'Merah Neon',
      size: '42'
    }
  });
  isCartOpen.value = true;
}

function handleCheckout(payload) {
  // Contoh pengiriman formulir Inertia ke endpoint checkout
  console.log('Memproses order ke server:', payload);
}
</script>

<template>
  <div class="p-8">
    <button
      @click="tambahSepatu"
      class="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700"
    >
      Beli Sepatu Sekarang
    </button>

    <CartDrawer
      v-model="isCartOpen"
      checkout-url="/checkout/step-1"
      checkout-label="Bayar Sekarang"
      :show-free-shipping="true"
      :show-tax="true"
      :show-notes="true"
      @checkout="handleCheckout"
    />
  </div>
</template>
```

---

## 12. Result / Behavior

- **Transisi Halus Slide-Over**: Menggunakan perpaduan animasi Tailwind CSS (`transition-transform ease-in-out duration-300`) sehingga panel meluncur mulus tanpa lonjakan visual.
- **Escape Key Interception**: Mendengarkan event global `keydown` pada window. Jika tombol `Escape` ditekan saat drawer terbuka, drawer akan menutup secara otomatis.
- **Backdrop Click Dismiss**: Mengklik area gelap transparan di luar batas panel samping akan menutup drawer secara instan.
- **Kalkulasi Matematis Presisi**: Pengurangan atau penambahan kuantitas produk langsung memicu rekalkulasi reaktif terhadap subtotal, persentase progress bebas ongkir, potongan diskon voucher, dan besaran PPN.

---

## 13. Customization

### Mengubah Ambang Batas Pengiriman Gratis
Pengaturan ambang batas gratis ongkir dapat diatur langsung melalui composable `useCart`:

```javascript
import { useCart } from '@/Composables/Pack/useCart';

const cart = useCart();
// Set ambang batas gratis ongkir menjadi Rp 500.000
cart.freeShippingThreshold.value = 500000;
```

### Mengganti Tampilan Item Keranjang Menggunakan Slot
```vue
<CartDrawer v-model="isCartOpen">
  <template #item="{ item, updateQuantity, removeItem }">
    <div class="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800">
      <div>
        <h4 class="font-bold text-sm text-slate-800 dark:text-slate-100">{{ item.name }}</h4>
        <span class="text-xs text-indigo-600">Rp {{ item.price.toLocaleString('id-ID') }}</span>
      </div>
      <div class="flex items-center gap-2">
        <button @click="updateQuantity(item.id, item.quantity - 1)" class="w-6 h-6 rounded bg-slate-200">-</button>
        <span class="text-sm font-bold">{{ item.quantity }}</span>
        <button @click="updateQuantity(item.id, item.quantity + 1)" class="w-6 h-6 rounded bg-slate-200">+</button>
      </div>
    </div>
  </template>
</CartDrawer>
```

---

## 14. Accessibility

- **ARIA Role Definition**: Panel utama memiliki atribut `role="dialog"` dan `aria-modal="true"` dengan judul yang ditandai atribut `aria-labelledby="cart-drawer-title"`.
- **Focus Management**: Ketika drawer terbuka, fokus keyboard diarahkan ke elemen pertama yang dapat difokuskan di dalam drawer (misalnya tombol close atau produk pertama).
- **Keyboard Dismissible**: Tombol `Escape` secara otomatis menutup drawer dan mengembalikan fokus ke elemen pemicu awal.
- **Live Quantity Announcement**: Tombol penambah dan pengurang kuantitas memiliki atribut `aria-label="Kurangi kuantitas"` dan `aria-label="Tambah kuantitas"`.

---

## 15. Responsive Behavior

- **Mobile Viewport (`< 640px`)**: Drawer menempati 100% lebar viewport ponsel. Tombol checkout di bagian bawah diposisikan secara *sticky* dengan memperhitungkan jarak aman layar ponsel (*safe-area-inset-bottom*).
- **Desktop Viewport (`>= 640px`)**: Drawer terkunci pada lebar `max-w-md` di sisi kanan layar, membiarkan latar belakang aplikasi tetap terlihat di sisi kiri.
- **Touch Steppers**: Tombol stepper kuantitas dirancang dengan luas sentuhan minimum 40px x 40px untuk mencegah kesalahan penekanan pada layar sentuh.

---

## 16. Do / Don't

| Rekomendasi (Do) | Pantangan (Don't) |
|---|---|
| Gunakan CartDrawer untuk mengizinkan pengguna melanjutkan berbelanja tanpa kehilangan konteks halaman. | Jangan jadikan CartDrawer sebagai formulir pembayaran lengkap yang meminta nomor kartu kredit. |
| Aktifkan fitur progress bar pengiriman gratis untuk merangsang peningkatan nilai transaksi. | Jangan menyembunyikan tombol tutup silang (*X*) atau menghilangkan penutupan via tombol Escape. |
| Berikan konfirmasi visual ringkas saat produk baru berhasil ditambahkan ke keranjang belanja. | Jangan membiarkan gambar produk rusak tanpa gambar fallback bawaan (*fallback placeholder*). |
| Kunci scroll dokumen utama saat drawer terbuka untuk menghindari scroll ganda yang membingungkan. | Jangan menaruh elemen dropdown yang melebihi batas overflow drawer tanpa penanganan z-index. |

---

## 17. Examples / Recipes

### Recipe 1: Keranjang Belanja Toko Retail dengan Target Gratis Ongkir
```vue
<CartDrawer
  title="Keranjang Belanjaan Anda"
  checkout-url="/transaksi/pembayaran"
  checkout-label="Selesaikan Pembelian"
  :show-free-shipping="true"
  :show-voucher-input="true"
/>
```

### Recipe 2: Pemesanan Makanan Restoran dengan Catatan Instruksi Khusus
```vue
<CartDrawer
  title="Daftar Pesanan Menu"
  checkout-url="/meja/checkout"
  checkout-label="Kirim Pesanan ke Dapur"
  :show-free-shipping="false"
  :show-tax="true"
  :show-notes="true"
/>
```

---

## 18. Related Components

- **[Card Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/card.md)**: Kartu produk katalog yang memicu event penambahan item ke dalam CartDrawer.
- **[ButtonSubmit Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/button-submit.md)**: Tombol konfirmasi checkout dengan status loading bawaan.
- **[Badge Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/badge.md)**: Lencana penanda jumlah item di bilah navigasi dan penanda kupon aktif.
- **[InputField Component](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/input-field.md)**: Kolom input kupon diskon dan catatan pesanan.

---

## 19. Notes / Limitations

- **Singleton Composable State**: Instans `useCart()` dirancang sebagai singleton reaktif. Jika aplikasi Anda membutuhkan multi-cart independen pada sesi yang sama, Anda perlu menginstansiasi composable dengan parameter identifier terpisah.
- **Persistensi Data**: Penyimpanan data keranjang belanja secara default tersimpan dalam memori reaktif. Untuk persistensi lintas sesi atau saat muat ulang halaman, pastikan mengintegrasikannya dengan `localStorage` atau sinkronisasi API keranjang belanja di sisi server.
- **Z-Index Hierarchy**: CartDrawer menggunakan kelas `z-50`. Pastikan elemen bilah navigasi atau modal lain di dalam aplikasi memiliki nilai `z-index` yang selaras agar tidak saling menimpa secara tidak sengaja.
