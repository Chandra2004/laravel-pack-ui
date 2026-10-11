import { ref, computed, watch } from 'vue';
import { formatRupiah } from './useNumberFormat.js';

/**
 * Global reactive singleton state for the shopping cart.
 * Berbagi status tunggal antar seluruh komponen (Header, CartDrawer, ProductCard, Checkout).
 */
const STORAGE_KEY = 'pack_cart_v1';

// Initial state singleton
const items = ref([]);
const isCartOpen = ref(false);
const activeVoucher = ref(null);
const voucherError = ref('');
const taxRate = ref(0.11); // 11% PPN default Indonesia
const shippingCost = ref(20000); // Rp 20.000 default
const freeShippingThreshold = ref(150000); // Rp 150.000 batas bebas ongkir

let isInitialized = false;

/**
 * Membaca data keranjang dari localStorage secara aman (aman SSR).
 */
const initStorage = () => {
    if (isInitialized || typeof window === 'undefined') return;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed.items)) {
                items.value = parsed.items;
            }
            if (parsed.activeVoucher) {
                activeVoucher.value = parsed.activeVoucher;
            }
        }
    } catch (e) {
        console.warn('[useCart] Gagal memulihkan keranjang dari localStorage:', e);
    }
    isInitialized = true;
};

/**
 * Menyimpan mutasi data keranjang ke localStorage.
 */
const persistStorage = () => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                items: items.value,
                activeVoucher: activeVoucher.value,
            })
        );
    } catch (e) {
        console.warn('[useCart] Gagal menyimpan keranjang ke localStorage:', e);
    }
};

// Inisialisasi pengawasan persistensi & sinkronisasi multi-tab (browser klien)
if (typeof window !== 'undefined') {
    initStorage();
    watch([items, activeVoucher], persistStorage, { deep: true });

    // Sinkronisasi real-time jika keranjang diubah di tab browser lain
    window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY && event.newValue) {
            try {
                const parsed = JSON.parse(event.newValue);
                if (Array.isArray(parsed.items)) {
                    items.value = parsed.items;
                }
                if (parsed.activeVoucher !== undefined) {
                    activeVoucher.value = parsed.activeVoucher;
                }
            } catch (err) {
                console.warn('[useCart] Gagal menyinkronkan data antar-tab:', err);
            }
        }
    });
}

/**
 * Menghasilkan kunci unik item berdasarkan ID dan variasi atributnya.
 */
const getItemKey = (id, attributes = {}) => {
    const attrKey = Object.keys(attributes || {})
        .sort()
        .map((k) => `${k}:${attributes[k]}`)
        .join('|');
    return attrKey ? `${id}__${attrKey}` : String(id);
};

/**
 * Mencari item dalam keranjang berdasarkan cartKey atau ID produk.
 */
const findCartItem = (keyOrId) => {
    if (keyOrId === null || keyOrId === undefined) return null;
    const strKey = String(keyOrId);
    return items.value.find((i) => i.cartKey === strKey || String(i.id) === strKey || i.id === keyOrId);
};

/**
 * Preset voucher bawaan untuk kebutuhan simulasi & promosi.
 */
export const PRESET_VOUCHERS = [
    {
        code: 'DISKON10',
        type: 'percent',
        value: 10,
        minSpend: 50000,
        maxDiscount: 25000,
        description: 'Diskon 10% s.d. Rp 25.000 (Min. Belanja Rp 50.000)',
    },
    {
        code: 'HEMAT50K',
        type: 'fixed',
        value: 50000,
        minSpend: 200000,
        maxDiscount: 50000,
        description: 'Potongan Langsung Rp 50.000 (Min. Belanja Rp 200.000)',
    },
    {
        code: 'ONGKIRGRATIS',
        type: 'fixed',
        value: 20000,
        minSpend: 75000,
        maxDiscount: 20000,
        description: 'Subsidi Ongkir Rp 20.000 (Min. Belanja Rp 75.000)',
    },
];

/**
 * Enterprise Composable for Shopping Cart Management
 */
export function useCart() {
    initStorage();

    // -------------------------------------------------------------
    // COMPUTED TOTALS & CALCULATIONS
    // -------------------------------------------------------------

    /** Total kuantitas seluruh item di keranjang */
    const totalItems = computed(() => {
        return items.value.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
    });

    /** Jumlah baris variasi produk unik */
    const uniqueItemCount = computed(() => items.value.length);

    /** True jika keranjang tidak memiliki item sama sekali */
    const isCartEmpty = computed(() => items.value.length === 0);

    /** Subtotal: akumulasi (item.discountPrice ?? item.price) * quantity */
    const subtotal = computed(() => {
        return items.value.reduce((acc, item) => {
            const unitPrice =
                item.discountPrice !== undefined && item.discountPrice !== null
                    ? Number(item.discountPrice)
                    : Number(item.price);
            return acc + unitPrice * (Number(item.quantity) || 1);
        }, 0);
    });

    /** Subtotal asli berdasarkan harga normal sebelum diskon per produk */
    const originalSubtotal = computed(() => {
        return items.value.reduce((acc, item) => {
            return acc + Number(item.price) * (Number(item.quantity) || 1);
        }, 0);
    });

    /** Total penghematan dari potongan diskon langsung pada produk */
    const productDiscountSavings = computed(() => {
        return Math.max(0, originalSubtotal.value - subtotal.value);
    });

    /** Nominal potongan harga dari voucher diskon aktif */
    const voucherDiscount = computed(() => {
        if (!activeVoucher.value) return 0;
        const v = activeVoucher.value;
        const currentSubtotal = subtotal.value;

        if (v.minSpend && currentSubtotal < v.minSpend) {
            return 0;
        }

        let discount = 0;
        if (v.type === 'percent' || v.type === 'percentage') {
            discount = (currentSubtotal * (Number(v.value ?? v.discount) || 0)) / 100;
            if (v.maxDiscount && discount > v.maxDiscount) {
                discount = Number(v.maxDiscount);
            }
        } else if (v.type === 'fixed') {
            discount = Number(v.value ?? v.discount) || 0;
        }

        return Math.min(discount, currentSubtotal);
    });

    /** Subtotal bersih setelah dipotong diskon voucher */
    const subtotalAfterVoucher = computed(() => {
        return Math.max(0, subtotal.value - voucherDiscount.value);
    });

    /** Status pembebasan biaya ongkos kirim */
    const isFreeShipping = computed(() => {
        if (freeShippingThreshold.value <= 0) return true;
        return subtotal.value >= freeShippingThreshold.value;
    });

    /** Biaya ongkir efektif yang dikenakan */
    const effectiveShippingCost = computed(() => {
        if (isCartEmpty.value) return 0;
        return isFreeShipping.value ? 0 : Number(shippingCost.value);
    });

    /** Kekurangan belanja untuk mendapatkan gratis ongkir */
    const freeShippingRemaining = computed(() => {
        if (isFreeShipping.value) return 0;
        return Math.max(0, freeShippingThreshold.value - subtotal.value);
    });

    /** Persentase progres menuju batas gratis ongkir (0 - 100) */
    const freeShippingProgress = computed(() => {
        if (freeShippingThreshold.value <= 0) return 100;
        const prog = (subtotal.value / freeShippingThreshold.value) * 100;
        return Math.min(100, Math.round(prog));
    });

    /** Estimasi nominal PPN */
    const taxAmount = computed(() => {
        if (taxRate.value <= 0) return 0;
        return Math.round(subtotalAfterVoucher.value * taxRate.value);
    });

    /** Total akhir pembayaran (Grand Total) */
    const grandTotal = computed(() => {
        if (isCartEmpty.value) return 0;
        return subtotalAfterVoucher.value + taxAmount.value + effectiveShippingCost.value;
    });

    // -------------------------------------------------------------
    // FORMATTED VALUES & COMPATIBILITY ALIASES
    // -------------------------------------------------------------
    const formattedSubtotal = computed(() => formatRupiah(subtotal.value));
    const formattedVoucherDiscount = computed(() => formatRupiah(voucherDiscount.value));
    const formattedShipping = computed(() => {
        if (isCartEmpty.value) return formatRupiah(0);
        return isFreeShipping.value ? 'Gratis' : formatRupiah(effectiveShippingCost.value);
    });
    const formattedTax = computed(() => formatRupiah(taxAmount.value));
    const formattedGrandTotal = computed(() => formatRupiah(grandTotal.value));
    const formattedSavings = computed(() => formatRupiah(productDiscountSavings.value + voucherDiscount.value));

    // Aliases untuk konsistensi penamaan lintas template/dokumentasi
    const subtotalFormatted = formattedSubtotal;
    const discountAmountFormatted = formattedVoucherDiscount;
    const discountAmount = voucherDiscount;
    const taxAmountFormatted = formattedTax;
    const grandTotalFormatted = formattedGrandTotal;
    const shippingCostFormatted = formattedShipping;
    const savingsFormatted = formattedSavings;

    // -------------------------------------------------------------
    // ITEM HELPERS
    // -------------------------------------------------------------

    /**
     * Menghitung subtotal untuk satu baris item tertentu di keranjang.
     */
    const getItemSubtotal = (item) => {
        if (!item) return 0;
        const unitPrice =
            item.discountPrice !== undefined && item.discountPrice !== null
                ? Number(item.discountPrice)
                : Number(item.price);
        return unitPrice * (Number(item.quantity) || 1);
    };

    const getItemSubtotalFormatted = (item) => formatRupiah(getItemSubtotal(item));

    // -------------------------------------------------------------
    // ACTIONS / MUTATIONS
    // -------------------------------------------------------------

    /**
     * Menambahkan item ke keranjang atau menambah kuantitas jika sudah ada.
     * @param {Object} itemData - Data item produk
     * @param {number} [qty=1] - Jumlah yang ditambahkan
     * @returns {boolean} True jika berhasil
     */
    const addItem = (itemData, qty = 1) => {
        if (!itemData || itemData.id === undefined) return false;

        const quantityToAdd = Math.max(1, Number(qty) || 1);
        const itemKey = getItemKey(itemData.id, itemData.attributes);
        const existingIndex = items.value.findIndex((i) => i.cartKey === itemKey);

        const maxStock = itemData.maxStock !== undefined ? Number(itemData.maxStock) : Infinity;

        if (existingIndex > -1) {
            const existingItem = items.value[existingIndex];
            const newQty = existingItem.quantity + quantityToAdd;

            if (newQty > maxStock) {
                existingItem.quantity = maxStock;
                return false; // Mencapai batas stok
            }
            existingItem.quantity = newQty;
        } else {
            const finalQty = Math.min(quantityToAdd, maxStock);
            items.value.push({
                cartKey: itemKey,
                id: itemData.id,
                sku: itemData.sku || `SKU-${itemData.id}`,
                name: itemData.name || 'Produk',
                price: Number(itemData.price) || 0,
                discountPrice: itemData.discountPrice !== undefined ? Number(itemData.discountPrice) : null,
                maxStock: maxStock,
                image: itemData.image || '',
                attributes: itemData.attributes ? { ...itemData.attributes } : {},
                notes: itemData.notes || '',
                quantity: finalQty,
                addedAt: Date.now(),
            });
        }

        return true;
    };

    /**
     * Menghapus item dari keranjang berdasarkan cartKey atau ID produk.
     * @param {string|number} keyOrId
     */
    const removeItem = (keyOrId) => {
        const item = findCartItem(keyOrId);
        if (item) {
            items.value = items.value.filter((i) => i.cartKey !== item.cartKey);
        } else {
            items.value = items.value.filter((i) => i.cartKey !== String(keyOrId) && i.id !== keyOrId);
        }
    };

    /**
     * Memperbarui kuantitas item secara langsung.
     * @param {string|number} keyOrId
     * @param {number} newQty
     */
    const updateQuantity = (keyOrId, newQty) => {
        const item = findCartItem(keyOrId);
        if (!item) return;

        const qty = Number(newQty);
        if (qty <= 0) {
            removeItem(item.cartKey);
            return;
        }

        const max = item.maxStock !== undefined ? Number(item.maxStock) : Infinity;
        item.quantity = Math.min(qty, max);
    };

    /** Menambah kuantitas item sebanyak 1 */
    const incrementQuantity = (keyOrId) => {
        const item = findCartItem(keyOrId);
        if (item) {
            const max = item.maxStock !== undefined ? Number(item.maxStock) : Infinity;
            if (item.quantity < max) {
                item.quantity += 1;
            }
        }
    };

    /** Mengurangi kuantitas item sebanyak 1 (otomatis dihapus jika kuantitas mencapai 0) */
    const decrementQuantity = (keyOrId) => {
        const item = findCartItem(keyOrId);
        if (item) {
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                removeItem(item.cartKey);
            }
        }
    };

    /** Memperbarui catatan pembeli pada item tertentu */
    const updateItemNotes = (keyOrId, notes) => {
        const item = findCartItem(keyOrId);
        if (item) {
            item.notes = String(notes || '');
        }
    };

    /** Mengosongkan seluruh isi keranjang dan mereset voucher */
    const clearCart = () => {
        items.value = [];
        activeVoucher.value = null;
        voucherError.value = '';
    };

    // -------------------------------------------------------------
    // VOUCHER / PROMO ENGINE
    // -------------------------------------------------------------

    /**
     * Memasang kode kupon voucher ke keranjang belanja.
     * @param {string} code
     * @param {Array} [customVouchers] - Kumpulan voucher opsional
     * @returns {boolean} True jika berhasil diterapkan
     */
    const applyVoucher = (code, customVouchers = null) => {
        voucherError.value = '';
        if (!code || !String(code).trim()) {
            voucherError.value = 'Silakan masukkan kode voucher.';
            return false;
        }

        const normalizedCode = String(code).trim().toUpperCase();
        const pool = customVouchers || PRESET_VOUCHERS;
        const found = pool.find((v) => v.code.toUpperCase() === normalizedCode);

        if (!found) {
            voucherError.value = `Kode voucher "${normalizedCode}" tidak valid atau telah kedaluwarsa.`;
            return false;
        }

        if (found.minSpend && subtotal.value < found.minSpend) {
            voucherError.value = `Minimal transaksi untuk voucher ini adalah ${formatRupiah(found.minSpend)}.`;
            return false;
        }

        activeVoucher.value = { ...found };
        return true;
    };

    /** Menghapus voucher aktif */
    const removeVoucher = () => {
        activeVoucher.value = null;
        voucherError.value = '';
    };

    // -------------------------------------------------------------
    // DRAWER CONTROLS
    // -------------------------------------------------------------
    const openCart = () => {
        isCartOpen.value = true;
    };

    const closeCart = () => {
        isCartOpen.value = false;
    };

    const toggleCart = () => {
        isCartOpen.value = !isCartOpen.value;
    };

    // -------------------------------------------------------------
    // SETTINGS CONFIGURATORS
    // -------------------------------------------------------------
    const setTaxRate = (rate) => {
        taxRate.value = Math.max(0, Number(rate) || 0);
    };

    const setShippingCost = (cost) => {
        shippingCost.value = Math.max(0, Number(cost) || 0);
    };

    const setFreeShippingThreshold = (threshold) => {
        freeShippingThreshold.value = Math.max(0, Number(threshold) || 0);
    };

    return {
        // State
        items,
        isCartOpen,
        activeVoucher,
        voucherError,
        taxRate,
        shippingCost,
        freeShippingThreshold,

        // Computed
        totalItems,
        uniqueItemCount,
        isCartEmpty,
        subtotal,
        originalSubtotal,
        productDiscountSavings,
        voucherDiscount,
        discountAmount,
        subtotalAfterVoucher,
        isFreeShipping,
        effectiveShippingCost,
        freeShippingRemaining,
        freeShippingProgress,
        taxAmount,
        grandTotal,

        // Formatted strings
        formattedSubtotal,
        formattedVoucherDiscount,
        formattedShipping,
        formattedTax,
        formattedGrandTotal,
        formattedSavings,

        // Compatibility Aliases
        subtotalFormatted,
        discountAmountFormatted,
        taxAmountFormatted,
        grandTotalFormatted,
        shippingCostFormatted,
        savingsFormatted,

        // Item Calculations
        getItemSubtotal,
        getItemSubtotalFormatted,

        // Actions
        addItem,
        removeItem,
        updateQuantity,
        incrementQuantity,
        decrementQuantity,
        updateItemNotes,
        clearCart,
        applyVoucher,
        removeVoucher,

        // Drawer Controls
        openCart,
        closeCart,
        toggleCart,

        // Config
        setTaxRate,
        setShippingCost,
        setFreeShippingThreshold,
        PRESET_VOUCHERS,
        formatRupiah,
    };
}
