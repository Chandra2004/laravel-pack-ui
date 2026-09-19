import { ref, computed, watch } from 'vue';
import { formatRupiah } from './useNumberFormat';

/**
 * Global reactive singleton state for the cart.
 * Shared across all component instances (Header, CartDrawer, ProductCard, Checkout).
 */
const STORAGE_KEY = 'pack_cart_v1';

// Initial state
const items = ref([]);
const isCartOpen = ref(false);
const activeVoucher = ref(null);
const voucherError = ref('');
const taxRate = ref(0.11); // 11% PPN default Indonesia
const shippingCost = ref(20000); // Rp 20.000 default
const freeShippingThreshold = ref(150000); // Rp 150.000 threshold

// Load state from localStorage on startup (client-side safe)
let isInitialized = false;
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
        console.warn('[useCart] Failed to restore cart from localStorage:', e);
    }
    isInitialized = true;
};

// Save state to localStorage whenever items or activeVoucher change
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
        console.warn('[useCart] Failed to save cart to localStorage:', e);
    }
};

// Auto-watch changes for persistent storage
if (typeof window !== 'undefined') {
    initStorage();
    watch([items, activeVoucher], persistStorage, { deep: true });
}

/**
 * Generate a consistent unique key for an item based on its ID and variation attributes.
 */
const getItemKey = (id, attributes = {}) => {
    const attrKey = Object.keys(attributes || {})
        .sort()
        .map((k) => `${k}:${attributes[k]}`)
        .join('|');
    return attrKey ? `${id}__${attrKey}` : String(id);
};

/**
 * Enterprise Composable for Shopping Cart Management
 */
export function useCart() {
    initStorage();

    // -------------------------------------------------------------
    // COMPUTED TOTALS & CALCULATIONS
    // -------------------------------------------------------------

    /** Total count of all items (sum of quantities) */
    const totalItems = computed(() => {
        return items.value.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
    });

    /** Number of unique item variations in cart */
    const uniqueItemCount = computed(() => items.value.length);

    /** True if cart has no items */
    const isCartEmpty = computed(() => items.value.length === 0);

    /** Subtotal: sum of (item.discountPrice ?? item.price) * quantity */
    const subtotal = computed(() => {
        return items.value.reduce((acc, item) => {
            const unitPrice = item.discountPrice !== undefined && item.discountPrice !== null
                ? Number(item.discountPrice)
                : Number(item.price);
            return acc + (unitPrice * (Number(item.quantity) || 1));
        }, 0);
    });

    /** Total discount saved across products before voucher */
    const originalSubtotal = computed(() => {
        return items.value.reduce((acc, item) => {
            return acc + (Number(item.price) * (Number(item.quantity) || 1));
        }, 0);
    });

    const productDiscountSavings = computed(() => {
        return Math.max(0, originalSubtotal.value - subtotal.value);
    });

    /** Voucher discount nominal amount */
    const voucherDiscount = computed(() => {
        if (!activeVoucher.value) return 0;
        const v = activeVoucher.value;
        const currentSubtotal = subtotal.value;

        if (v.minSpend && currentSubtotal < v.minSpend) {
            return 0;
        }

        let discount = 0;
        if (v.type === 'percent') {
            discount = (currentSubtotal * (Number(v.value) || 0)) / 100;
            if (v.maxDiscount && discount > v.maxDiscount) {
                discount = Number(v.maxDiscount);
            }
        } else if (v.type === 'fixed') {
            discount = Number(v.value) || 0;
        }

        return Math.min(discount, currentSubtotal);
    });

    /** Subtotal after voucher deduction */
    const subtotalAfterVoucher = computed(() => {
        return Math.max(0, subtotal.value - voucherDiscount.value);
    });

    /** Free Shipping Calculations */
    const isFreeShipping = computed(() => {
        if (freeShippingThreshold.value <= 0) return true;
        return subtotal.value >= freeShippingThreshold.value;
    });

    const effectiveShippingCost = computed(() => {
        if (isCartEmpty.value) return 0;
        return isFreeShipping.value ? 0 : Number(shippingCost.value);
    });

    const freeShippingRemaining = computed(() => {
        if (isFreeShipping.value) return 0;
        return Math.max(0, freeShippingThreshold.value - subtotal.value);
    });

    const freeShippingProgress = computed(() => {
        if (freeShippingThreshold.value <= 0) return 100;
        const prog = (subtotal.value / freeShippingThreshold.value) * 100;
        return Math.min(100, Math.round(prog));
    });

    /** Tax calculation (PPN) */
    const taxAmount = computed(() => {
        if (taxRate.value <= 0) return 0;
        return Math.round(subtotalAfterVoucher.value * taxRate.value);
    });

    /** Grand Total */
    const grandTotal = computed(() => {
        if (isCartEmpty.value) return 0;
        return subtotalAfterVoucher.value + taxAmount.value + effectiveShippingCost.value;
    });

    // -------------------------------------------------------------
    // FORMATTED VALUES (Convenience Helpers)
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

    // -------------------------------------------------------------
    // ACTIONS / MUTATIONS
    // -------------------------------------------------------------

    /**
     * Add an item to cart or increment quantity if already exists.
     * @param {Object} itemData - Item attributes { id, sku, name, price, discountPrice, maxStock, image, attributes, notes }
     * @param {number} [qty=1]
     * @returns {boolean} True if successfully added
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
                return false; // Reached stock limit
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
     * Remove an item from the cart completely.
     * @param {string} cartKey - Key identifier of item in cart
     */
    const removeItem = (cartKey) => {
        items.value = items.value.filter((i) => i.cartKey !== cartKey);
    };

    /**
     * Update quantity of an item directly.
     * @param {string} cartKey
     * @param {number} newQty
     */
    const updateQuantity = (cartKey, newQty) => {
        const item = items.value.find((i) => i.cartKey === cartKey);
        if (!item) return;

        const qty = Number(newQty);
        if (qty <= 0) {
            removeItem(cartKey);
            return;
        }

        const max = item.maxStock !== undefined ? Number(item.maxStock) : Infinity;
        item.quantity = Math.min(qty, max);
    };

    /** Increment quantity by 1 */
    const incrementQuantity = (cartKey) => {
        const item = items.value.find((i) => i.cartKey === cartKey);
        if (item) {
            const max = item.maxStock !== undefined ? Number(item.maxStock) : Infinity;
            if (item.quantity < max) {
                item.quantity += 1;
            }
        }
    };

    /** Decrement quantity by 1 (removes item if quantity reaches 0) */
    const decrementQuantity = (cartKey) => {
        const item = items.value.find((i) => i.cartKey === cartKey);
        if (item) {
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                removeItem(cartKey);
            }
        }
    };

    /** Update custom buyer notes on an item */
    const updateItemNotes = (cartKey, notes) => {
        const item = items.value.find((i) => i.cartKey === cartKey);
        if (item) {
            item.notes = String(notes || '');
        }
    };

    /** Clear all items from the cart */
    const clearCart = () => {
        items.value = [];
        activeVoucher.value = null;
        voucherError.value = '';
    };

    // -------------------------------------------------------------
    // VOUCHER / PROMO ENGINE
    // -------------------------------------------------------------

    /** Preset demo vouchers */
    const PRESET_VOUCHERS = [
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
     * Apply a voucher code.
     * @param {string} code
     * @param {Array} [customVouchers] - Optional custom list of vouchers
     * @returns {boolean}
     */
    const applyVoucher = (code, customVouchers = null) => {
        voucherError.value = '';
        if (!code || !code.trim()) {
            voucherError.value = 'Silakan masukkan kode voucher.';
            return false;
        }

        const normalizedCode = code.trim().toUpperCase();
        const pool = customVouchers || PRESET_VOUCHERS;
        const found = pool.find((v) => v.code.toUpperCase() === normalizedCode);

        if (!found) {
            voucherError.value = `Kode voucher "${normalizedCode}" tidak ditemukan atau sudah kadaluwarsa.`;
            return false;
        }

        if (found.minSpend && subtotal.value < found.minSpend) {
            voucherError.value = `Minimal belanja untuk voucher ini adalah ${formatRupiah(found.minSpend)}.`;
            return false;
        }

        activeVoucher.value = { ...found };
        return true;
    };

    /** Remove the active voucher */
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
