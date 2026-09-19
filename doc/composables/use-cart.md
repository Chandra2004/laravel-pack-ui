# 🛒 useCart Composable (`useCart.js`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Composable manajemen state keranjang belanja reaktif tingkat enterprise (*Enterprise Shopping Cart State Manager*) yang dirancang sebagai modul singleton global: data keranjang otomatis tersinkronisasi di semua komponen halaman tanpa perlu konfigurasi state management eksternal (Pinia/Vuex).

---

## 🌟 Fitur Utama

1. **Global Singleton State**:
   State keranjang dibagi bersama di seluruh instance komponen (Header Badge, Product Cards, Cart Drawer, Checkout Page).
2. **Dual-Persistence**:
   Otomatis menyimpan dan memulihkan isi keranjang dari `localStorage` browser.
3. **Smart Item Keying**:
   Mendukung diferensiasi otomatis varian produk (ID yang sama dengan kombinasi atribut/warna/ukuran berbeda akan disimpan sebagai item baris terpisah secara aman).
4. **Voucher & Promo Engine**:
   Mendukung perhitungan diskon persentase dengan nilai maksimum diskon (*capped discount*) atau potongan langsung nominal tetap.
5. **Free Shipping Computation**:
   Menghitung ambang batas belanja gratis ongkir, persentase kemajuan, dan sisa nominal belanja yang dibutuhkan.

---

## 📋 API Reference

### State & Properties

| Properti | Tipe | Keterangan |
| :--- | :--- | :--- |
| `items` | `Ref<Array>` | Daftar array item belanja saat ini. |
| `isCartOpen` | `Ref<Boolean>` | Status buka/tutup Cart Drawer secara global. |
| `activeVoucher` | `Ref<Object\|null>` | Objek voucher promo yang sedang aktif. |
| `voucherError` | `Ref<String>` | Pesan error validasi kode voucher. |
| `taxRate` | `Ref<Number>` | Persentase pajak PPN (default: `0.11` = 11%). |
| `shippingCost` | `Ref<Number>` | Biaya ongkir standar sebelum gratis ongkir (default: `20000`). |
| `freeShippingThreshold` | `Ref<Number>` | Batas minimum belanja bebas ongkir (default: `150000`). |

### Computed Values

| Computed | Tipe | Keterangan |
| :--- | :--- | :--- |
| `totalItems` | `Computed<Number>` | Total seluruh kuantitas barang belanjaan. |
| `uniqueItemCount` | `Computed<Number>` | Jumlah jenis varian produk unik di keranjang. |
| `isCartEmpty` | `Computed<Boolean>` | Bernilai `true` jika keranjang belanja kosong. |
| `subtotal` | `Computed<Number>` | Total harga barang sebelum diskon voucher dan pajak. |
| `voucherDiscount` | `Computed<Number>` | Nominal potongan harga dari voucher aktif. |
| `isFreeShipping` | `Computed<Boolean>` | Bernilai `true` jika subtotal mencapai ambang batas gratis ongkir. |
| `freeShippingRemaining`| `Computed<Number>` | Sisa nominal rupiah yang dibutuhkan untuk bebas ongkir. |
| `freeShippingProgress` | `Computed<Number>` | Persentase pencapaian bebas ongkir (0–100%). |
| `taxAmount` | `Computed<Number>` | Nominal pajak PPN. |
| `grandTotal` | `Computed<Number>` | Total akhir yang harus dibayar pembeli. |
| `formattedGrandTotal` | `Computed<String>` | Format Rupiah rapi (contoh: `"Rp 450.000"`). |

### Methods / Actions

| Method | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `addItem(item, qty = 1)` | `(item: Object, qty?: number)` | Menambahkan item ke keranjang atau menaikkan kuantitas jika varian sudah ada. |
| `removeItem(cartKey)` | `(cartKey: string)` | Menghapus barang dari keranjang berdasarkan kunci uniknya. |
| `updateQuantity(cartKey, newQty)` | `(cartKey: string, newQty: number)` | Memperbarui jumlah kuantitas barang (otomatis dibatasi oleh stok maksimum). |
| `incrementQuantity(cartKey)` | `(cartKey: string)` | Menaikkan jumlah kuantitas sebanyak 1. |
| `decrementQuantity(cartKey)` | `(cartKey: string)` | Mengurangi jumlah kuantitas sebanyak 1 (menghapus jika mencapai 0). |
| `updateItemNotes(cartKey, notes)` | `(cartKey: string, notes: string)` | Menyimpan catatan instruksi khusus pembeli pada item tersebut. |
| `applyVoucher(code)` | `(code: string)` | Menerapkan kode voucher promo ke keranjang. |
| `removeVoucher()` | `()` | Menghapus voucher promo yang sedang aktif. |
| `clearCart()` | `()` | Mengosongkan seluruh isi keranjang dan mereset voucher. |
| `openCart()` / `closeCart()` | `()` | Mengatur visibilitas Cart Drawer secara global. |

---

## 💡 Contoh Penggunaan

```javascript
import { useCart } from '@/Composables/Pack/useCart';

const cart = useCart();

// Menambahkan produk ke keranjang
cart.addItem({
    id: 42,
    sku: 'PROD-01',
    name: 'Kemeja Flannel Slim Fit',
    price: 250000,
    discountPrice: 199000,
    maxStock: 10,
    image: '/images/flannel.jpg',
    attributes: { Warna: 'Navy', Ukuran: 'L' },
}, 1);

// Menerapkan voucher
cart.applyVoucher('DISKON10');

// Buka drawer
cart.openCart();
```
