<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useCart } from '../../Composables/Pack/useCart';
import { formatRupiah } from '../../Composables/Pack/useNumberFormat';

const props = defineProps({
    /**
     * Optional v-model:isOpen control. If not provided, binds to cart.isCartOpen automatically.
     */
    modelValue: {
        type: Boolean,
        default: undefined,
    },
    title: {
        type: String,
        default: 'Keranjang Belanja',
    },
    checkoutUrl: {
        type: String,
        default: '',
    },
    checkoutLabel: {
        type: String,
        default: 'Lanjut ke Pembayaran',
    },
    showFreeShipping: {
        type: Boolean,
        default: true,
    },
    showVoucherInput: {
        type: Boolean,
        default: true,
    },
    showTax: {
        type: Boolean,
        default: true,
    },
    showNotes: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(['update:modelValue', 'checkout', 'close']);

const cart = useCart();

// Controlled vs Uncontrolled open state
const isOpen = computed({
    get: () => (props.modelValue !== undefined ? props.modelValue : cart.isCartOpen.value),
    set: (val) => {
        if (props.modelValue !== undefined) {
            emit('update:modelValue', val);
        } else {
            cart.isCartOpen.value = val;
        }
        if (!val) {
            emit('close');
        }
    },
});

const closeDrawer = () => {
    isOpen.value = false;
};

// Handle Escape key to close drawer
const onKeyDown = (e) => {
    if (e.key === 'Escape' && isOpen.value) {
        closeDrawer();
    }
};

// Lock body scroll when drawer is open
watch(isOpen, (open) => {
    if (typeof document !== 'undefined') {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
});

onMounted(() => {
    if (typeof window !== 'undefined') {
        window.addEventListener('keydown', onKeyDown);
    }
});

onUnmounted(() => {
    if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', onKeyDown);
        document.body.style.overflow = '';
    }
});

// Voucher Input State
const voucherInput = ref('');
const isApplyingVoucher = ref(false);

const handleApplyVoucher = () => {
    if (!voucherInput.value.trim()) return;
    isApplyingVoucher.value = true;
    setTimeout(() => {
        const success = cart.applyVoucher(voucherInput.value);
        if (success) {
            voucherInput.value = '';
        }
        isApplyingVoucher.value = false;
    }, 200);
};

// Active Note Editing Modal / State
const editingNoteKey = ref(null);
const activeNoteText = ref('');

const toggleEditNote = (item) => {
    if (editingNoteKey.value === item.cartKey) {
        editingNoteKey.value = null;
    } else {
        editingNoteKey.value = item.cartKey;
        activeNoteText.value = item.notes || '';
    }
};

const saveNote = (cartKey) => {
    cart.updateItemNotes(cartKey, activeNoteText.value);
    editingNoteKey.value = null;
};

// Checkout Trigger
const isCheckingOut = ref(false);

const handleCheckout = () => {
    if (cart.isCartEmpty.value) return;

    isCheckingOut.value = true;
    const checkoutData = {
        items: cart.items.value,
        totalItems: cart.totalItems.value,
        subtotal: cart.subtotal.value,
        discount: cart.voucherDiscount.value,
        tax: cart.taxAmount.value,
        shipping: cart.effectiveShippingCost.value,
        grandTotal: cart.grandTotal.value,
        voucher: cart.activeVoucher.value,
    };

    emit('checkout', checkoutData);

    if (props.checkoutUrl && typeof window !== 'undefined') {
        window.location.href = props.checkoutUrl;
    } else {
        setTimeout(() => {
            isCheckingOut.value = false;
        }, 500);
    }
};
</script>

<template>
    <Teleport to="body">
        <div
            v-show="isOpen"
            class="fixed inset-0 z-50 overflow-hidden"
            aria-labelledby="slide-over-title"
            role="dialog"
            aria-modal="true"
        >
            <!-- Backdrop with Blur -->
            <Transition
                enter-active-class="ease-out duration-300"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="ease-in duration-200"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
            >
                <div
                    v-show="isOpen"
                    class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
                    @click="closeDrawer"
                />
            </Transition>

            <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <!-- Slide-over Drawer Panel -->
                <Transition
                    enter-active-class="transform transition ease-out duration-300"
                    enter-from-class="translate-x-full"
                    enter-to-class="translate-x-0"
                    leave-active-class="transform transition ease-in duration-200"
                    leave-from-class="translate-x-0"
                    leave-to-class="translate-x-full"
                >
                    <div
                        v-show="isOpen"
                        class="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800"
                    >
                        <!-- 1. Drawer Header -->
                        <div class="px-5 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
                            <slot name="header">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                                        <span class="material-symbols-outlined text-[20px]">shopping_bag</span>
                                    </div>
                                    <div>
                                        <h2 id="slide-over-title" class="text-base font-bold text-slate-900 dark:text-white leading-none">
                                            {{ title }}
                                        </h2>
                                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                                            {{ cart.totalItems.value }} barang dipilih
                                        </p>
                                    </div>
                                </div>
                            </slot>

                            <div class="flex items-center gap-1.5">
                                <button
                                    v-if="!cart.isCartEmpty.value"
                                    type="button"
                                    class="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    title="Kosongkan Keranjang"
                                    @click="cart.clearCart"
                                >
                                    <span class="material-symbols-outlined text-[20px]">delete_sweep</span>
                                </button>
                                <button
                                    type="button"
                                    class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    @click="closeDrawer"
                                >
                                    <span class="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            </div>
                        </div>

                        <!-- 2. Free Shipping Progress Bar (Optional) -->
                        <div
                            v-if="showFreeShipping && !cart.isCartEmpty.value"
                            class="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 shrink-0"
                        >
                            <div class="flex items-center justify-between text-xs font-semibold mb-1.5">
                                <div class="flex items-center gap-1.5">
                                    <span class="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">
                                        {{ cart.isFreeShipping.value ? 'verified' : 'local_shipping' }}
                                    </span>
                                    <span v-if="cart.isFreeShipping.value" class="text-emerald-700 dark:text-emerald-400">
                                        Selamat! Anda mendapat <b>Bebas Ongkir</b>
                                    </span>
                                    <span v-else class="text-slate-700 dark:text-slate-300">
                                        Tambah <b class="text-emerald-600 dark:text-emerald-400">{{ cart.formatRupiah(cart.freeShippingRemaining.value) }}</b> lagi untuk Bebas Ongkir
                                    </span>
                                </div>
                                <span class="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                                    {{ cart.freeShippingProgress.value }}%
                                </span>
                            </div>
                            <!-- Bar Track -->
                            <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    class="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
                                    :style="{ width: `${cart.freeShippingProgress.value}%` }"
                                />
                            </div>
                        </div>

                        <!-- 3. Scrollable Items Area -->
                        <div class="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
                            <!-- Empty State -->
                            <div
                                v-if="cart.isCartEmpty.value"
                                class="h-full min-h-80 flex flex-col items-center justify-center text-center px-4"
                            >
                                <slot name="empty">
                                    <div class="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 shadow-inner">
                                        <span class="material-symbols-outlined text-4xl">production_quantity_limits</span>
                                    </div>
                                    <h3 class="text-base font-bold text-slate-800 dark:text-white">
                                        Keranjang Anda Kosong
                                    </h3>
                                    <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1 leading-relaxed">
                                        Belum ada barang yang ditambahkan. Temukan produk favorit Anda dan tambahkan ke sini.
                                    </p>
                                    <button
                                        type="button"
                                        class="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-all"
                                        @click="closeDrawer"
                                    >
                                        <span class="material-symbols-outlined text-[16px]">storefront</span>
                                        Mulai Belanja
                                    </button>
                                </slot>
                            </div>

                            <!-- Cart Items List -->
                            <template v-else>
                                <div
                                    v-for="item in cart.items.value"
                                    :key="item.cartKey"
                                    class="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-2.5"
                                >
                                    <slot name="item" :item="item">
                                        <div class="flex gap-3">
                                            <!-- Product Thumbnail -->
                                            <div class="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 overflow-hidden shrink-0 flex items-center justify-center">
                                                <img
                                                    v-if="item.image"
                                                    :src="item.image"
                                                    :alt="item.name"
                                                    class="w-full h-full object-cover"
                                                />
                                                <span v-else class="material-symbols-outlined text-slate-400 dark:text-slate-500 text-2xl">
                                                    inventory_2
                                                </span>
                                            </div>

                                            <!-- Product Info -->
                                            <div class="flex-1 min-w-0">
                                                <div class="flex items-start justify-between gap-2">
                                                    <h4 class="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">
                                                        {{ item.name }}
                                                    </h4>
                                                    <button
                                                        type="button"
                                                        class="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-0.5"
                                                        title="Hapus barang"
                                                        @click="cart.removeItem(item.cartKey)"
                                                    >
                                                        <span class="material-symbols-outlined text-[16px]">close</span>
                                                    </button>
                                                </div>

                                                <!-- Attributes / Variants Pill -->
                                                <div
                                                    v-if="item.attributes && Object.keys(item.attributes).length"
                                                    class="flex flex-wrap gap-1 mt-1"
                                                >
                                                    <span
                                                        v-for="(val, key) in item.attributes"
                                                        :key="key"
                                                        class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                                    >
                                                        {{ key }}: {{ val }}
                                                    </span>
                                                </div>

                                                <!-- Price Display -->
                                                <div class="flex items-baseline gap-1.5 mt-1.5">
                                                    <span class="text-xs font-bold text-slate-900 dark:text-white font-mono">
                                                        {{ cart.formatRupiah(item.discountPrice ?? item.price) }}
                                                    </span>
                                                    <span
                                                        v-if="item.discountPrice && item.discountPrice < item.price"
                                                        class="text-[10px] line-through text-slate-400 dark:text-slate-500 font-mono"
                                                    >
                                                        {{ cart.formatRupiah(item.price) }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Row Bottom: Stepper + Note Button -->
                                        <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                            <!-- Note Toggle Button -->
                                            <button
                                                v-if="showNotes"
                                                type="button"
                                                class="inline-flex items-center gap-1 text-[11px] font-medium transition-colors"
                                                :class="item.notes ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'"
                                                @click="toggleEditNote(item)"
                                            >
                                                <span class="material-symbols-outlined text-[14px]">
                                                    {{ item.notes ? 'sticky_note_2' : 'edit_note' }}
                                                </span>
                                                <span>{{ item.notes ? 'Ubah Catatan' : 'Tulis Catatan' }}</span>
                                            </button>
                                            <div v-else />

                                            <!-- Quantity Stepper -->
                                            <div class="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
                                                <button
                                                    type="button"
                                                    class="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
                                                    :disabled="item.quantity <= 1"
                                                    :class="{ 'opacity-40 cursor-not-allowed': item.quantity <= 1 }"
                                                    @click="cart.decrementQuantity(item.cartKey)"
                                                >
                                                    <span class="material-symbols-outlined text-[14px]">remove</span>
                                                </button>
                                                <span class="w-8 text-center text-xs font-bold font-mono text-slate-900 dark:text-white">
                                                    {{ item.quantity }}
                                                </span>
                                                <button
                                                    type="button"
                                                    class="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
                                                    :disabled="item.maxStock && item.quantity >= item.maxStock"
                                                    :class="{ 'opacity-40 cursor-not-allowed': item.maxStock && item.quantity >= item.maxStock }"
                                                    @click="cart.incrementQuantity(item.cartKey)"
                                                >
                                                    <span class="material-symbols-outlined text-[14px]">add</span>
                                                </button>
                                            </div>
                                        </div>

                                        <!-- Item Note Preview / Input Box -->
                                        <div
                                            v-if="editingNoteKey === item.cartKey"
                                            class="pt-2"
                                        >
                                            <div class="flex gap-1.5">
                                                <input
                                                    v-model="activeNoteText"
                                                    type="text"
                                                    maxlength="100"
                                                    placeholder="Tulis instruksi khusus (contoh: minta pedas / bubble wrap)..."
                                                    class="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                    @keyup.enter="saveNote(item.cartKey)"
                                                />
                                                <button
                                                    type="button"
                                                    class="px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold"
                                                    @click="saveNote(item.cartKey)"
                                                >
                                                    Simpan
                                                </button>
                                            </div>
                                        </div>
                                        <div
                                            v-else-if="item.notes"
                                            class="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-lg italic flex items-center gap-1"
                                        >
                                            <span class="material-symbols-outlined text-[13px] text-slate-400 shrink-0">chat</span>
                                            <span class="truncate">"{{ item.notes }}"</span>
                                        </div>
                                    </slot>
                                </div>
                            </template>
                        </div>

                        <!-- 4. Drawer Footer (Voucher & Cost Breakdown & Checkout) -->
                        <div
                            v-if="!cart.isCartEmpty.value"
                            class="px-5 py-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 backdrop-blur-xs space-y-3.5 shrink-0"
                        >
                            <!-- Voucher Input -->
                            <div v-if="showVoucherInput" class="space-y-1.5">
                                <div v-if="cart.activeVoucher.value" class="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-xs">
                                    <div class="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
                                        <span class="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">sell</span>
                                        <span class="font-bold">{{ cart.activeVoucher.value.code }}</span>
                                        <span class="text-[11px] text-emerald-600 dark:text-emerald-400">(-{{ cart.formattedVoucherDiscount.value }})</span>
                                    </div>
                                    <button
                                        type="button"
                                        class="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1"
                                        title="Hapus voucher"
                                        @click="cart.removeVoucher"
                                    >
                                        <span class="material-symbols-outlined text-[14px]">close</span>
                                    </button>
                                </div>

                                <div v-else class="flex gap-2">
                                    <div class="relative flex-1">
                                        <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                                            <span class="material-symbols-outlined text-[16px]">sell</span>
                                        </span>
                                        <input
                                            v-model="voucherInput"
                                            type="text"
                                            placeholder="Kode Voucher (cth: DISKON10)"
                                            class="w-full pl-8 pr-3 py-2 text-xs uppercase font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-1 focus:ring-primary-500"
                                            @keyup.enter="handleApplyVoucher"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        class="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-50 transition-all shrink-0"
                                        :disabled="!voucherInput.trim() || isApplyingVoucher"
                                        @click="handleApplyVoucher"
                                    >
                                        {{ isApplyingVoucher ? 'Cek...' : 'Terapkan' }}
                                    </button>
                                </div>

                                <p v-if="cart.voucherError.value" class="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                                    {{ cart.voucherError.value }}
                                </p>
                            </div>

                            <!-- Cost Breakdown -->
                            <div class="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                                <div class="flex justify-between">
                                    <span>Subtotal</span>
                                    <span class="font-mono text-slate-900 dark:text-white font-medium">{{ cart.formattedSubtotal.value }}</span>
                                </div>
                                <div v-if="cart.voucherDiscount.value > 0" class="flex justify-between text-emerald-600 dark:text-emerald-400">
                                    <span>Diskon Voucher</span>
                                    <span class="font-mono font-medium">-{{ cart.formattedVoucherDiscount.value }}</span>
                                </div>
                                <div v-if="showTax && cart.taxAmount.value > 0" class="flex justify-between">
                                    <span>PPN ({{ Math.round(cart.taxRate.value * 100) }}%)</span>
                                    <span class="font-mono text-slate-900 dark:text-white font-medium">{{ cart.formattedTax.value }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Estimasi Ongkir</span>
                                    <span class="font-mono font-medium" :class="cart.isFreeShipping.value ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'">
                                        {{ cart.formattedShipping.value }}
                                    </span>
                                </div>

                                <div class="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                                    <div>
                                        <span class="text-sm font-bold text-slate-900 dark:text-white">Total Belanja</span>
                                        <span v-if="cart.productDiscountSavings.value > 0 || cart.voucherDiscount.value > 0" class="block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                            Hemat {{ cart.formattedSavings.value }}
                                        </span>
                                    </div>
                                    <span class="text-base font-extrabold font-mono text-primary-600 dark:text-primary-400">
                                        {{ cart.formattedGrandTotal.value }}
                                    </span>
                                </div>
                            </div>

                            <!-- Checkout CTA Button -->
                            <slot name="footer">
                                <button
                                    type="button"
                                    class="w-full py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 active:scale-[0.99] text-white text-xs font-bold tracking-wide shadow-md shadow-primary-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    :disabled="isCheckingOut || cart.isCartEmpty.value"
                                    @click="handleCheckout"
                                >
                                    <span v-if="isCheckingOut" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span v-else class="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
                                    <span>{{ isCheckingOut ? 'Memproses...' : checkoutLabel }}</span>
                                </button>
                            </slot>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>
    </Teleport>
</template>
