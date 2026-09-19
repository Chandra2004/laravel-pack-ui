# 🛒 CartDrawer Component (`CartDrawer.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen slide-over drawer keranjang belanja enterprise yang dirancang untuk toko online dan SaaS, terintegrasi langsung dengan composable reaktif global [useCart.js](../composables/use-cart.md).

---

## 🏛️ Evaluasi & Penerapan 5 Pilar Desain UI

| Pilar Desain | Penerapan pada Komponen `CartDrawer` |
| :--- | :--- |
| **1. Warna** | Aksen semantik status (Emerald untuk promo/gratis ongkir, Rose untuk penghapusan item, Primary untuk CTA checkout), dark mode terintegrasi penuh (`dark:bg-slate-900`, `dark:border-slate-800`). |
| **2. Bentuk** | Standar sudut `rounded-2xl` pada item produk & voucher chip, stepper kuantitas ergonomis, dan backdrop blur halus (`backdrop-blur-xs`). |
| **3. Teks Konten** | Format Rupiah terstandarisasi (`formatRupiah`), label varian/atribut produk, catatan pesanan pembeli (*buyer notes*), rincian harga transparan (Subtotal, Diskon Voucher, PPN, Ongkir, Grand Total). |
| **4. Icon** | Ikon Google Material Symbols konsisten: `shopping_bag`, `local_shipping`, `verified`, `sell`, `delete_sweep`, `remove`, `add`, `chat`, `shopping_cart_checkout`. |
| **5. Responsif** | Mengisi lebar layar penuh di mobile (*full-width*) dan max-width `max-w-md` di layar tablet/desktop, mendukung navigasi keyboard Escape key dan kunci scroll background (`body overflow-hidden`). |

---

## 🚀 Fitur Unggulan ("Killer Features")

1. **Global Reactive State Synchronization**:
   Drawer otomatis tersinkronisasi dengan seluruh tombol `+ Keranjang` di halaman lain via `useCart()`. Tidak perlu prop-drilling manual.
2. **Dynamic Free Shipping Progress Bar**:
   Menghitung sisa nominal belanja secara real-time untuk mencapai ambang batas Bebas Ongkir dengan animasi bar progress.
3. **Interactive Quantity Stepper & Stock Cap**:
   Stepper kuantitas instan yang memvalidasi stok maksimum barang secara real-time.
4. **Voucher / Promo Code Engine**:
   Mendukung validasi kode voucher (persentase / potongan tetap / ambang belanja minimum) dengan chip voucher aktif yang dapat dihapus.
5. **Per-Item Buyer Notes**:
   Pengguna dapat menambahkan catatan khusus per barang belanjaan (misal: "Minta warna hitam", "Packing bubble wrap").
6. **Customizable Slots**:
   Mendukung kustomisasi header, item list, empty state, dan footer checkout melalui scoped slots.

---

## 📋 Props API (`<CartDrawer />`)

| Prop | Tipe Data | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `modelValue` | `Boolean` | `undefined` | Kontrol visibilitas eksternal (`v-model`). Jika tidak diset, otomatis membaca `cart.isCartOpen`. |
| `title` | `String` | `'Keranjang Belanja'` | Judul header drawer. |
| `checkoutLabel` | `String` | `'Lanjut ke Pembayaran'` | Label teks tombol CTA checkout. |
| `checkoutUrl` | `String` | `''` | URL tujuan checkout (opsional). Jika diisi, otomatis mengarahkan ke halaman tujuan saat diklik. |
| `showFreeShipping` | `Boolean` | `true` | Menampilkan bilah pelacak progres gratis ongkir. |
| `showVoucherInput` | `Boolean` | `true` | Menampilkan area input & status voucher promo. |
| `showTax` | `Boolean` | `true` | Menampilkan kalkulasi pajak (PPN). |
| `showNotes` | `Boolean` | `true` | Mengaktifkan tombol input catatan khusus pembeli per barang. |

---

## ⚡ Events / Emits

| Event | Payload | Deskripsi |
| :--- | :--- | :--- |
| `update:modelValue` | `(isOpen: boolean)` | Dipancarkan saat drawer dibuka atau ditutup. |
| `checkout` | `Object` | Dipancarkan saat tombol checkout ditekan, berisi data: `{ items, totalItems, subtotal, discount, tax, shipping, grandTotal, voucher }`. |
| `close` | — | Dipancarkan saat drawer ditutup oleh pengguna. |

---

## 💡 Contoh Penggunaan

```vue
<script setup>
import CartDrawer from '@/Components/Pack/CartDrawer.vue';
import { useCart } from '@/Composables/Pack/useCart';

const cart = useCart();

const onCheckout = (data) => {
    console.log('Data pesanan untuk checkout:', data);
};
</script>

<template>
    <div>
        <!-- Tombol Pemicu di Header / Navbar -->
        <button @click="cart.openCart" class="relative p-2">
            <span class="material-symbols-outlined">shopping_bag</span>
            <span v-if="cart.totalItems.value > 0" class="badge">
                {{ cart.totalItems.value }}
            </span>
        </button>

        <!-- Komponen Drawer -->
        <CartDrawer
            title="Keranjang Pesanan"
            @checkout="onCheckout"
        />
    </div>
</template>
```
