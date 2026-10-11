<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted, useId } from 'vue';
import { useClipboard } from '@/Composables/Pack/useClipboard';
import Modal from './Modal.vue';
import ButtonSubmit from './ButtonSubmit.vue';

// Leaflet Instance Global
let L = null;

// Loader Leaflet yang Kuat (Bundled + CDN Fallback)
const ensureLeaflet = async () => {
    if (typeof window === 'undefined') return null;
    if (window.L) {
        L = window.L;
        return L;
    }
    // Coba import modul lokal
    try {
        const leafletModule = await import('leaflet');
        L = leafletModule.default || leafletModule;
        if (L) {
            window.L = L;
        }
    } catch (e) {
        console.warn('[LocationPicker] Bundled Leaflet import failed, trying CDN fallback...', e);
    }

    // Pastikan CSS Leaflet terpasang di head
    if (!document.getElementById('leaflet-core-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-core-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }

    if (L) return L;

    // Fallback script CDN
    return new Promise((resolve) => {
        if (window.L) {
            L = window.L;
            return resolve(L);
        }
        let script = document.getElementById('leaflet-core-js');
        if (!script) {
            script = document.createElement('script');
            script.id = 'leaflet-core-js';
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.async = true;
            document.head.appendChild(script);
        }
        script.onload = () => {
            L = window.L;
            resolve(L);
        };
        script.onerror = () => {
            console.error('[LocationPicker] Failed to load Leaflet.');
            resolve(null);
        };
    });
};

const props = defineProps({
    modelValue: {
        type: [Object, String],
        default: null,
    },
    lat: {
        type: Number,
        default: null,
    },
    lng: {
        type: Number,
        default: null,
    },
    address: {
        type: String,
        default: '',
    },
    label: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: 'Tentukan lokasi di peta atau gunakan GPS...',
    },
    required: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    readonly: {
        type: Boolean,
        default: false,
    },
    error: {
        type: String,
        default: '',
    },
    hint: {
        type: String,
        default: '',
    },
    size: {
        type: String,
        default: 'md',
        validator: (v) => ['sm', 'md', 'lg'].includes(v),
    },
    rounded: {
        type: String,
        default: 'xl',
        validator: (v) => ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'].includes(v),
    },
    defaultCenter: {
        type: Array,
        default: () => [-6.2088, 106.8456], // Jakarta Pusat
    },
    defaultZoom: {
        type: Number,
        default: 14,
    },
    showCoordinatesBadge: {
        type: Boolean,
        default: true,
    },
    showCoordinates: {
        type: Boolean,
        default: null,
    },
    displayMode: {
        type: String,
        default: 'modal',
        validator: (v) => ['modal', 'inline'].includes(v),
    },
    color: {
        type: String,
        default: 'primary',
        validator: (v) => ['primary', 'emerald', 'blue', 'indigo', 'violet', 'amber', 'rose', 'cyan'].includes(v),
    },
    autocomplete: {
        type: Boolean,
        default: true,
    },
    embedded: {
        type: Boolean,
        default: false,
    },
    hideHeader: {
        type: Boolean,
        default: false,
    },
    hideFooter: {
        type: Boolean,
        default: false,
    },
    id: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        default: '',
    },
    tileLayer: {
        type: String,
        default: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    },
});

const emit = defineEmits([
    'update:modelValue',
    'update:lat',
    'update:lng',
    'update:address',
    'change',
    'select',
]);

const generatedId = useId();
const inputId = computed(() => props.id || props.name || generatedId);

// State internal lokasi
const currentLat = ref(props.lat ?? props.modelValue?.lat ?? null);
const currentLng = ref(props.lng ?? props.modelValue?.lng ?? null);
const currentAddress = ref(props.address ?? props.modelValue?.address ?? (typeof props.modelValue === 'string' ? props.modelValue : ''));
const currentCity = ref(props.modelValue?.city ?? '');
const currentPostalCode = ref(props.modelValue?.postal_code ?? '');

// State UI Peta
const isModalOpen = ref(false);
const isInlineOpen = ref(false);
const isDetectingGps = ref(false);
const isReverseGeocoding = ref(false);

// State Pencarian & Autocomplete
const searchQuery = ref('');
const searchResults = ref([]);
const isSearching = ref(false);
let searchTimeout = null;

const inputSuggestions = ref([]);
const isSearchingInput = ref(false);
const showSuggestions = ref(false);
let mainInputTimeout = null;

// Referensi DOM Kontainer Peta
const modalMapContainerRef = ref(null);
const inlineMapContainerRef = ref(null);
const containerRef = ref(null);

// Leaflet Instance References
let leafletMap = null;
let leafletMarker = null;
let resizeObserver = null;

// Nilai Tersalin Clipboard
const { copy: execCopy, copied: isCopied } = useClipboard({ timeout: 1800 });

// Evaluasi apakah badge koordinat ditampilkan
const shouldShowCoordinates = computed(() => {
    if (props.showCoordinates !== null && props.showCoordinates !== undefined) {
        return Boolean(props.showCoordinates);
    }
    return Boolean(props.showCoordinatesBadge);
});

// Tipografi Label yang disamakan persis dengan InputField (size md = text-xs font-semibold)
const labelClass = computed(() => {
    switch (props.size) {
        case 'sm':
            return 'text-xs text-slate-700 dark:text-slate-300';
        case 'lg':
            return 'text-sm font-bold text-slate-700 dark:text-slate-300';
        case 'md':
        default:
            return 'text-xs font-semibold text-slate-700 dark:text-slate-300';
    }
});

// Ukuran Proporsional Input Bar (disamakan persis dengan InputText.vue Pack UI)
const inputSizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return {
                input: 'pl-8.5 pr-28 py-1 text-xs min-h-[32px]',
                iconPin: 'w-4 h-4',
                iconWrap: 'pl-2.5',
                btnPeta: 'px-2 py-0.5 text-[11px] gap-1',
                btnIconSquare: 'w-6 h-6',
                iconFont: 'text-[15px]',
                iconSvg: 'w-3 h-3',
            };
        case 'lg':
            return {
                input: 'pl-11 pr-40 py-2.5 text-base min-h-[46px]',
                iconPin: 'w-5 h-5',
                iconWrap: 'pl-3.5',
                btnPeta: 'px-3 py-1.5 text-sm gap-2',
                btnIconSquare: 'w-8.5 h-8.5',
                iconFont: 'text-[20px]',
                iconSvg: 'w-4 h-4',
            };
        case 'md':
        default:
            return {
                input: 'pl-9.5 pr-34 py-1.5 text-sm min-h-[38px]',
                iconPin: 'w-4.5 h-4.5',
                iconWrap: 'pl-3',
                btnPeta: 'px-2.5 py-1 text-xs gap-1.5',
                btnIconSquare: 'w-7 h-7',
                iconFont: 'text-[17px]',
                iconSvg: 'w-3.5 h-3.5',
            };
    }
});

// Kelengkungan Sudut Komponen (rounded prop)
const roundedClass = computed(() => {
    switch (props.rounded) {
        case 'none':
            return 'rounded-none';
        case 'xs':
            return 'rounded-xs';
        case 'sm':
            return 'rounded-sm';
        case 'md':
            return 'rounded-md';
        case 'lg':
            return 'rounded-lg';
        case '2xl':
            return 'rounded-2xl';
        case '3xl':
            return 'rounded-3xl';
        case 'full':
            return 'rounded-full';
        case 'xl':
        default:
            return 'rounded-xl';
    }
});

// Kelengkungan Sudut Tombol di Dalam Bar
const buttonRoundedClass = computed(() => {
    switch (props.rounded) {
        case 'none':
            return 'rounded-none';
        case 'xs':
        case 'sm':
            return 'rounded-xs';
        case 'md':
            return 'rounded-sm';
        case 'full':
            return 'rounded-full';
        case 'lg':
        case 'xl':
        case '2xl':
        case '3xl':
        default:
            return 'rounded-lg';
    }
});

// Skema Tema Warna Aksen
const theme = computed(() => {
    switch (props.color) {
        case 'emerald':
            return {
                hex1: '#10b981',
                hex2: '#047857',
                textAccent: 'text-emerald-600 dark:text-emerald-400',
                bgLight: 'bg-emerald-50 dark:bg-emerald-950/60',
                bgBadge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
                borderLight: 'border-emerald-200/80 dark:border-emerald-800/80',
                textButton: 'text-emerald-700 dark:text-emerald-300',
                hoverBg: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/60',
                focusClass: 'focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15',
                btnVariant: 'success',
            };
        case 'indigo':
            return {
                hex1: '#6366f1',
                hex2: '#4338ca',
                textAccent: 'text-indigo-600 dark:text-indigo-400',
                bgLight: 'bg-indigo-50 dark:bg-indigo-950/60',
                bgBadge: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
                borderLight: 'border-indigo-200/80 dark:border-indigo-800/80',
                textButton: 'text-indigo-700 dark:text-indigo-300',
                hoverBg: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/60',
                focusClass: 'focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15',
                btnVariant: 'primary',
            };
        case 'violet':
            return {
                hex1: '#8b5cf6',
                hex2: '#6d28d9',
                textAccent: 'text-violet-600 dark:text-violet-400',
                bgLight: 'bg-violet-50 dark:bg-violet-950/60',
                bgBadge: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400',
                borderLight: 'border-violet-200/80 dark:border-violet-800/80',
                textButton: 'text-violet-700 dark:text-violet-300',
                hoverBg: 'hover:bg-violet-100 dark:hover:bg-violet-900/60',
                focusClass: 'focus:border-violet-600 dark:focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15',
                btnVariant: 'primary',
            };
        case 'amber':
            return {
                hex1: '#f59e0b',
                hex2: '#b45309',
                textAccent: 'text-amber-600 dark:text-amber-400',
                bgLight: 'bg-amber-50 dark:bg-amber-950/60',
                bgBadge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
                borderLight: 'border-amber-200/80 dark:border-amber-800/80',
                textButton: 'text-amber-700 dark:text-amber-300',
                hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-900/60',
                focusClass: 'focus:border-amber-600 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15',
                btnVariant: 'warning',
            };
        case 'rose':
            return {
                hex1: '#f43f5e',
                hex2: '#be123c',
                textAccent: 'text-rose-600 dark:text-rose-400',
                bgLight: 'bg-rose-50 dark:bg-rose-950/60',
                bgBadge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
                borderLight: 'border-rose-200/80 dark:border-rose-800/80',
                textButton: 'text-rose-700 dark:text-rose-300',
                hoverBg: 'hover:bg-rose-100 dark:hover:bg-rose-900/60',
                focusClass: 'focus:border-rose-600 dark:focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15',
                btnVariant: 'danger',
            };
        case 'cyan':
            return {
                hex1: '#06b6d4',
                hex2: '#0e7490',
                textAccent: 'text-cyan-600 dark:text-cyan-400',
                bgLight: 'bg-cyan-50 dark:bg-cyan-950/60',
                bgBadge: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400',
                borderLight: 'border-cyan-200/80 dark:border-cyan-800/80',
                textButton: 'text-cyan-700 dark:text-cyan-300',
                hoverBg: 'hover:bg-cyan-100 dark:hover:bg-cyan-900/60',
                focusClass: 'focus:border-cyan-600 dark:focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15',
                btnVariant: 'primary',
            };
        case 'blue':
        case 'primary':
        default:
            return {
                hex1: '#3b82f6',
                hex2: '#1d4ed8',
                textAccent: 'text-blue-600 dark:text-blue-400',
                bgLight: 'bg-blue-50 dark:bg-blue-950/60',
                bgBadge: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
                borderLight: 'border-blue-200/80 dark:border-blue-800/80',
                textButton: 'text-blue-700 dark:text-blue-300',
                hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900/60',
                focusClass: 'focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15',
                btnVariant: 'primary',
            };
    }
});

const hasValue = computed(() => {
    return (currentLat.value !== null && currentLng.value !== null) || Boolean(currentAddress.value);
});

const formattedCoordinates = computed(() => {
    if (currentLat.value !== null && currentLng.value !== null && !isNaN(currentLat.value) && !isNaN(currentLng.value)) {
        return `${Number(currentLat.value).toFixed(6)}, ${Number(currentLng.value).toFixed(6)}`;
    }
    return '';
});

// Sinkronisasi dari luar (v-model)
watch(() => props.modelValue, (newVal) => {
    if (newVal && typeof newVal === 'object') {
        if (newVal.lat !== undefined && newVal.lat !== currentLat.value) currentLat.value = newVal.lat;
        if (newVal.lng !== undefined && newVal.lng !== currentLng.value) currentLng.value = newVal.lng;
        if (newVal.address !== undefined && newVal.address !== currentAddress.value) currentAddress.value = newVal.address;
        if (newVal.city !== undefined) currentCity.value = newVal.city;
        if (newVal.postal_code !== undefined) currentPostalCode.value = newVal.postal_code;
    } else if (typeof newVal === 'string') {
        currentAddress.value = newVal;
    }
}, { deep: true });

watch(() => props.lat, (val) => { if (val !== undefined && val !== currentLat.value) currentLat.value = val; });
watch(() => props.lng, (val) => { if (val !== undefined && val !== currentLng.value) currentLng.value = val; });
watch(() => props.address, (val) => { if (val !== undefined && val !== currentAddress.value) currentAddress.value = val; });

// Emitting data ke parent
const emitUpdate = () => {
    const payload = {
        lat: currentLat.value,
        lng: currentLng.value,
        address: currentAddress.value,
        city: currentCity.value,
        postal_code: currentPostalCode.value,
    };
    emit('update:modelValue', payload);
    emit('update:lat', currentLat.value);
    emit('update:lng', currentLng.value);
    emit('update:address', currentAddress.value);
    emit('change', payload);
    emit('select', payload);
};

// Database Preset Landmark Lokal Indonesia (Respon Cepat Instan 0ms)
const localLandmarkPresets = [
    {
        name: 'Monas (Monumen Nasional), Jakarta Pusat',
        display_name: 'Kawasan Monumen Nasional, Gambir, Jakarta Pusat, DKI Jakarta',
        lat: -6.175392,
        lon: 106.827153,
        address: { road: 'Jl. Medan Merdeka Barat', suburb: 'Gambir', city: 'Jakarta Pusat', state: 'DKI Jakarta', postcode: '10110' }
    },
    {
        name: 'Bundaran HI (Hotel Indonesia), Jakarta',
        display_name: 'Bundaran Hotel Indonesia, Menteng, Jakarta Pusat, DKI Jakarta',
        lat: -6.195000,
        lon: 106.823000,
        address: { road: 'Jl. M.H. Thamrin', suburb: 'Menteng', city: 'Jakarta Pusat', state: 'DKI Jakarta', postcode: '10310' }
    },
    {
        name: 'Gedung Sate, Bandung',
        display_name: 'Jl. Diponegoro No.22, Citarum, Bandung Wetan, Kota Bandung, Jawa Barat',
        lat: -6.902484,
        lon: 107.618810,
        address: { road: 'Jl. Diponegoro No.22', suburb: 'Citarum', city: 'Kota Bandung', state: 'Jawa Barat', postcode: '40115' }
    },
    {
        name: 'Jalan Malioboro, Yogyakarta',
        display_name: 'Jl. Malioboro, Sosromenduran, Gedong Tengen, Kota Yogyakarta, DIY',
        lat: -7.792889,
        lon: 110.365845,
        address: { road: 'Jl. Malioboro', suburb: 'Gedong Tengen', city: 'Kota Yogyakarta', state: 'DI Yogyakarta', postcode: '55271' }
    },
    {
        name: 'Tugu Yogyakarta (Tugu Pal Putih)',
        display_name: 'Jl. Jend. Sudirman, Gowongan, Jetis, Kota Yogyakarta, DIY',
        lat: -7.782889,
        lon: 110.367082,
        address: { road: 'Jl. Jend. Sudirman', suburb: 'Jetis', city: 'Kota Yogyakarta', state: 'DI Yogyakarta', postcode: '55233' }
    },
    {
        name: 'Simpang Lima, Semarang',
        display_name: 'Kawasan Simpang Lima, Pleburan, Semarang Selatan, Kota Semarang, Jawa Tengah',
        lat: -6.990425,
        lon: 110.422894,
        address: { road: 'Kawasan Simpang Lima', suburb: 'Pleburan', city: 'Kota Semarang', state: 'Jawa Tengah', postcode: '50241' }
    },
    {
        name: 'Balai Pemuda, Surabaya',
        display_name: 'Jl. Gubernur Suryo No.15, Embong Kaliasin, Genteng, Kota Surabaya, Jawa Timur',
        lat: -7.265757,
        lon: 112.748367,
        address: { road: 'Jl. Gubernur Suryo No.15', suburb: 'Genteng', city: 'Kota Surabaya', state: 'Jawa Timur', postcode: '60271' }
    },
    {
        name: 'Pantai Kuta, Bali',
        display_name: 'Jl. Pantai Kuta, Kuta, Kabupaten Badung, Bali',
        lat: -8.7185,
        lon: 115.1690,
        address: { road: 'Jl. Pantai Kuta', suburb: 'Kuta', city: 'Kabupaten Badung', state: 'Bali', postcode: '80361' }
    },
    {
        name: 'Jam Gadang, Bukittinggi',
        display_name: 'Pusat Kota Bukittinggi, Benteng Pasar Atas, Bukittinggi, Sumatera Barat',
        lat: -0.3055,
        lon: 100.3693,
        address: { road: 'Jl. Pemuda', suburb: 'Pasar Atas', city: 'Bukittinggi', state: 'Sumatera Barat', postcode: '26136' }
    },
    {
        name: 'Kawasan Sudirman SCBD, Jakarta Selatan',
        display_name: 'Sudirman Central Business District, Senayan, Kebayoran Baru, Jakarta Selatan',
        lat: -6.2244,
        lon: 106.8098,
        address: { road: 'Jl. Jenderal Sudirman Kav. 52-53', suburb: 'Senayan', city: 'Jakarta Selatan', state: 'DKI Jakarta', postcode: '12190' }
    },
];

// Input Handlers untuk Autocomplete Alamat
const handleMainAddressInput = (e) => {
    emitUpdate();
    if (!props.autocomplete || props.disabled || props.readonly) return;
    clearTimeout(mainInputTimeout);

    const query = currentAddress.value ? currentAddress.value.trim().toLowerCase() : '';
    if (query.length < 2) {
        inputSuggestions.value = [];
        showSuggestions.value = false;
        return;
    }

    // 1. Cek Cepat Preset Landmark Lokal (Respons Instan 0ms)
    const localMatches = localLandmarkPresets.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.display_name.toLowerCase().includes(query)
    );

    if (localMatches.length > 0) {
        inputSuggestions.value = localMatches;
        showSuggestions.value = true;
    }

    isSearchingInput.value = true;
    showSuggestions.value = true;

    // 2. Query Asinkron Nominatim OpenStreetMap
    mainInputTimeout = setTimeout(async () => {
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
            const response = await fetch(url, {
                headers: { 'Accept-Language': 'id, en' },
            });
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    const combined = [...localMatches];
                    data.forEach(item => {
                        if (!combined.some(c => Math.abs(c.lat - item.lat) < 0.001 && Math.abs(c.lon - item.lon) < 0.001)) {
                            combined.push(item);
                        }
                    });
                    inputSuggestions.value = combined.slice(0, 6);
                }
            }
        } catch (err) {
            console.warn('[LocationPicker] Address autocomplete network error:', err);
            if (localMatches.length > 0) {
                inputSuggestions.value = localMatches;
            }
        } finally {
            isSearchingInput.value = false;
        }
    }, 300);
};

const selectAddressSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon || item.lng);

    if (item.address) {
        const addr = item.address;
        const road = addr.road || addr.street || addr.pedestrian || '';
        const houseNumber = addr.house_number ? `No. ${addr.house_number}` : '';
        const suburb = addr.suburb || addr.neighbourhood || addr.village || '';
        const city = addr.city || addr.town || addr.municipality || addr.county || '';
        const state = addr.state || '';
        const postcode = addr.postcode || '';

        const addressParts = [road, houseNumber, suburb, city, state].filter(Boolean);
        currentAddress.value = addressParts.length > 0 ? addressParts.join(', ') : (item.display_name || '');
        currentCity.value = city;
        currentPostalCode.value = postcode;
    } else {
        currentAddress.value = item.display_name || item.name || '';
        if (item.name) {
            currentCity.value = item.name.split(',')[1]?.trim() || '';
        }
    }

    showSuggestions.value = false;
    setCoordinates(lat, lng, false);
};

const handleClickOutside = (event) => {
    if (containerRef.value && !containerRef.value.contains(event.target)) {
        showSuggestions.value = false;
    }
};

const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
        showSuggestions.value = false;
    }
};

onMounted(() => {
    if (typeof window !== 'undefined') {
        window.addEventListener('click', handleClickOutside);
        window.addEventListener('keydown', handleKeyDown);
    }
});

onUnmounted(() => {
    destroyMap();
    clearTimeout(searchTimeout);
    clearTimeout(mainInputTimeout);
    clearTimeout(reverseTimeout);
    if (typeof window !== 'undefined') {
        window.removeEventListener('click', handleClickOutside);
        window.removeEventListener('keydown', handleKeyDown);
    }
});

// Pembuat Custom Pin Icon Elegan Berbasis SVG Presisi Tinggi
const createCustomPinIcon = (Leaflet) => {
    const LInstance = Leaflet || L || (typeof window !== 'undefined' ? window.L : null);
    if (!LInstance || !LInstance.divIcon) return undefined;

    const fill1 = theme.value.hex1 || '#3b82f6';
    const fill2 = theme.value.hex2 || '#1d4ed8';

    // SVG Pin: Lebar 34px, Tinggi 42px. Ujung jarum pin berada tepat di koordinat (x = 17, y = 42).
    // iconAnchor: [17, 42] menempatkan titik ujung jarum 100% presisi pixel-perfect pada titik klik peta.
    return LInstance.divIcon({
        className: 'custom-leaflet-marker-pin',
        html: `
            <div style="position: relative; width: 34px; height: 42px; margin: 0; padding: 0; line-height: 0; display: block;">
                <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35)); display: block;">
                    <path d="M17 0C7.611 0 0 7.611 0 17C0 26.917 14.875 40.833 15.938 41.792C16.542 42.326 17.458 42.326 18.062 41.792C19.125 40.833 34 26.917 34 17C34 7.611 26.389 0 17 0Z" fill="${fill1}"/>
                    <circle cx="17" cy="17" r="6.5" fill="#ffffff"/>
                    <circle cx="17" cy="17" r="3.5" fill="${fill2}"/>
                </svg>
            </div>
        `,
        iconSize: [34, 42],
        iconAnchor: [17, 42],
        popupAnchor: [0, -42],
    });
};

// Inisialisasi Peta Leaflet dengan Mekanisme Retry Tahan Banting & ResizeObserver
const initMap = async () => {
    const targetEl = props.displayMode === 'inline'
        ? inlineMapContainerRef.value
        : modalMapContainerRef.value;

    if (!targetEl) return;
    if (leafletMap) {
        leafletMap.invalidateSize();
        return;
    }

    const Leaflet = await ensureLeaflet();
    if (!Leaflet) return;

    const initialCenter = [
        currentLat.value ?? props.defaultCenter[0],
        currentLng.value ?? props.defaultCenter[1],
    ];

    try {
        leafletMap = Leaflet.map(targetEl, {
            center: initialCenter,
            zoom: currentLat.value ? 16 : props.defaultZoom,
            zoomControl: false,
        });

        // Tile Layer OpenStreetMap Standard
        Leaflet.tileLayer(props.tileLayer || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap',
            maxZoom: 19,
        }).addTo(leafletMap);

        // Zoom Control di Kanan Atas
        Leaflet.control.zoom({ position: 'topright' }).addTo(leafletMap);

        // Marker Pin Draggable
        const customIcon = createCustomPinIcon(Leaflet);
        const markerOptions = {
            draggable: !props.readonly && !props.disabled,
        };
        if (customIcon) {
            markerOptions.icon = customIcon;
        }

        leafletMarker = Leaflet.marker(initialCenter, markerOptions).addTo(leafletMap);

        leafletMarker.on('dragend', (e) => {
            const { lat, lng } = e.target.getLatLng();
            setCoordinates(lat, lng, true);
        });

        leafletMap.on('click', (e) => {
            if (props.readonly || props.disabled) return;
            const { lat, lng } = e.latlng;
            setCoordinates(lat, lng, true);
        });

        // Resize Observer agar peta otomatis menyesuaikan saat modal/accordion mekar penuh
        if (typeof ResizeObserver !== 'undefined') {
            if (resizeObserver) resizeObserver.disconnect();
            resizeObserver = new ResizeObserver(() => {
                if (leafletMap) leafletMap.invalidateSize();
            });
            resizeObserver.observe(targetEl);
        }

        // Invalidate size bertahap agar tidak blank/abu-abu
        setTimeout(() => { if (leafletMap) leafletMap.invalidateSize(); }, 60);
        setTimeout(() => { if (leafletMap) leafletMap.invalidateSize(); }, 180);
        setTimeout(() => { if (leafletMap) leafletMap.invalidateSize(); }, 350);
        setTimeout(() => { if (leafletMap) leafletMap.invalidateSize(); }, 600);
    } catch (err) {
        console.error('[LocationPicker] Failed to init Leaflet map:', err);
    }
};

// Retry Loop untuk memastikan DOM Target ter-mount sempurna
const tryInitMap = (retryCount = 0) => {
    const targetEl = props.displayMode === 'inline'
        ? inlineMapContainerRef.value
        : modalMapContainerRef.value;

    if (!targetEl) {
        if (retryCount < 20) {
            setTimeout(() => tryInitMap(retryCount + 1), 50);
        }
        return;
    }

    initMap();
};

// Hancurkan Instance Peta saat Ditutup
const destroyMap = () => {
    if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
    }
    if (leafletMap) {
        try {
            leafletMap.remove();
        } catch (e) {}
        leafletMap = null;
        leafletMarker = null;
    }
};

// Update Koordinat dan Sinkronkan Posisi Marker
const setCoordinates = (lat, lng, fetchAddress = false) => {
    currentLat.value = parseFloat(Number(lat).toFixed(7));
    currentLng.value = parseFloat(Number(lng).toFixed(7));

    if (leafletMarker) {
        leafletMarker.setLatLng([currentLat.value, currentLng.value]);
    }
    if (leafletMap) {
        leafletMap.panTo([currentLat.value, currentLng.value]);
    }

    if (fetchAddress) {
        reverseGeocode(currentLat.value, currentLng.value);
    } else {
        emitUpdate();
    }
};

// Reverse Geocoding
let reverseTimeout = null;
const reverseGeocode = async (lat, lng) => {
    clearTimeout(reverseTimeout);
    isReverseGeocoding.value = true;

    reverseTimeout = setTimeout(async () => {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;
            const response = await fetch(url, {
                headers: { 'Accept-Language': 'id, en' },
            });
            if (!response.ok) throw new Error('Geocoding request failed');
            const data = await response.json();

            if (data && data.address) {
                const addr = data.address;
                const road = addr.road || addr.street || addr.pedestrian || '';
                const houseNumber = addr.house_number ? `No. ${addr.house_number}` : '';
                const suburb = addr.suburb || addr.neighbourhood || addr.village || '';
                const city = addr.city || addr.town || addr.municipality || addr.county || '';
                const state = addr.state || '';
                const postcode = addr.postcode || '';

                const addressParts = [road, houseNumber, suburb, city, state].filter(Boolean);
                currentAddress.value = addressParts.length > 0 ? addressParts.join(', ') : (data.display_name || '');
                currentCity.value = city;
                currentPostalCode.value = postcode;
            } else if (data.display_name) {
                currentAddress.value = data.display_name;
            }
        } catch (error) {
            console.warn('[LocationPicker] Reverse geocode error:', error);
        } finally {
            isReverseGeocoding.value = false;
            emitUpdate();
        }
    }, 350);
};

// Pencarian Tempat di Atas Peta
const handleSearchInput = () => {
    clearTimeout(searchTimeout);
    if (!searchQuery.value || searchQuery.value.trim().length < 2) {
        searchResults.value = [];
        return;
    }

    const q = searchQuery.value.trim().toLowerCase();
    const local = localLandmarkPresets.filter(item => item.name.toLowerCase().includes(q) || item.display_name.toLowerCase().includes(q));
    if (local.length > 0) {
        searchResults.value = local;
    }

    isSearching.value = true;
    searchTimeout = setTimeout(async () => {
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=5`;
            const response = await fetch(url, {
                headers: { 'Accept-Language': 'id, en' },
            });
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    searchResults.value = data;
                }
            }
        } catch (error) {
            console.warn('[LocationPicker] Search places error:', error);
        } finally {
            isSearching.value = false;
        }
    }, 350);
};

const selectSearchResult = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon || item.lng);
    searchQuery.value = item.display_name || item.name || '';
    searchResults.value = [];

    setCoordinates(lat, lng, true);

    if (leafletMap) {
        leafletMap.flyTo([lat, lng], 16, { duration: 1.2 });
    }
};

// Deteksi Lokasi GPS Browser
const detectCurrentLocation = () => {
    if (props.disabled || props.readonly) return;
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
        alert('Browser Anda tidak mendukung deteksi lokasi otomatis.');
        return;
    }

    isDetectingGps.value = true;
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            isDetectingGps.value = false;

            setCoordinates(lat, lng, true);

            if (leafletMap) {
                leafletMap.flyTo([lat, lng], 17, { duration: 1 });
            }
        },
        (err) => {
            isDetectingGps.value = false;
            let msg = 'Gagal mendeteksi lokasi GPS.';
            if (err.code === 1) msg = 'Izin lokasi GPS ditolak oleh browser.';
            else if (err.code === 2) msg = 'Sinyal lokasi perangkat tidak tersedia.';
            else if (err.code === 3) msg = 'Waktu permintaan deteksi GPS habis.';
            alert(msg);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
};

// Buka/Tutup Modal Peta
const openMapModal = () => {
    if (props.disabled || props.readonly) return;
    isModalOpen.value = true;
};

const closeMapModal = () => {
    isModalOpen.value = false;
};

// Watcher untuk inisialisasi Peta saat modal dibuka
watch(isModalOpen, async (isOpen) => {
    if (isOpen) {
        await nextTick();
        tryInitMap(0);
    } else {
        destroyMap();
    }
});

// Toggle Inline Map Accordion
const toggleInlineMap = async () => {
    if (props.disabled || props.readonly) return;
    isInlineOpen.value = !isInlineOpen.value;
    if (isInlineOpen.value) {
        await nextTick();
        tryInitMap(0);
    } else {
        destroyMap();
    }
};

// Pantau jika status disabled diaktifkan
watch(() => props.disabled, (isDisabled) => {
    if (isDisabled) {
        isModalOpen.value = false;
        isInlineOpen.value = false;
        showSuggestions.value = false;
        destroyMap();
    }
});

// Pantau pergantian mode tampilan
watch(() => props.displayMode, () => {
    isModalOpen.value = false;
    isInlineOpen.value = false;
    destroyMap();
});

// Preset Kota Indonesia untuk Navigasi Cepat
const cityPresets = [
    { name: 'Jakarta', coords: [-6.2088, 106.8456] },
    { name: 'Bandung', coords: [-6.9175, 107.6191] },
    { name: 'Yogyakarta', coords: [-7.7956, 110.3695] },
    { name: 'Semarang', coords: [-6.9667, 110.4167] },
    { name: 'Surabaya', coords: [-7.2575, 112.7521] },
    { name: 'Bali (Denpasar)', coords: [-8.6705, 115.2126] },
    { name: 'Medan', coords: [3.5952, 98.6722] },
];

const flyToPreset = (coords) => {
    if (!leafletMap) return;
    leafletMap.flyTo(coords, 14, { duration: 1.2 });
    setCoordinates(coords[0], coords[1], true);
};

// Reset Lokasi
const clearLocation = () => {
    currentLat.value = null;
    currentLng.value = null;
    currentAddress.value = '';
    currentCity.value = '';
    currentPostalCode.value = '';
    emitUpdate();
};

defineExpose({
    openMapModal,
    closeMapModal,
    toggleInlineMap,
    detectCurrentLocation,
    clearLocation,
    currentLat,
    currentLng,
    currentAddress,
});
</script>

<template>
    <div
        ref="containerRef"
        :class="embedded ? 'w-full relative space-y-1.5' : 'w-full relative space-y-1.5'"
    >
        <!-- 1. FIELD HEADER (Label & Required Asterisk - Identik 100% dengan gaya InputField) -->
        <div
            v-if="!embedded && !hideHeader && (label || $slots.label)"
            class="flex items-center justify-between gap-2 select-none"
        >
            <label
                :for="id || inputId"
                class="block"
                :class="labelClass"
            >
                <slot name="label">{{ label }}</slot>
                <span v-if="required" class="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span>
            </label>
        </div>

        <!-- 2. CONTROL BODY (Input Bar Utama Berdimensi Proporsional Sesuai InputText) -->
        <div class="relative flex items-center group w-full">
            <!-- Leading Icon Pin Peta (Selalu Terpusat Vertikal) -->
            <div
                class="absolute inset-y-0 left-0 flex items-center pointer-events-none transition-colors select-none"
                :class="[
                    inputSizeClasses.iconWrap,
                    hasValue ? theme.textAccent : 'text-slate-400 dark:text-slate-500'
                ]"
            >
                <svg :class="inputSizeClasses.iconPin" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-2.5 2.5z"/>
                </svg>
            </div>

            <!-- Input Teks Alamat -->
            <input
                :id="id || inputId"
                type="text"
                v-model="currentAddress"
                :placeholder="placeholder"
                :required="required"
                :disabled="disabled"
                :readonly="readonly"
                class="w-full transition-all duration-150 bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs border focus:outline-hidden"
                :class="[
                    roundedClass,
                    inputSizeClasses.input,
                    error
                        ? 'border-rose-500 dark:border-rose-500 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/10 dark:bg-rose-950/10 text-rose-900 dark:text-rose-100'
                        : `border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 ${theme.focusClass} text-slate-800 dark:text-slate-100`,
                    disabled ? 'opacity-60 bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed select-none' : '',
                    readonly ? 'bg-slate-50 dark:bg-slate-800/40 cursor-default' : '',
                ]"
                @input="handleMainAddressInput"
                @focus="currentAddress && currentAddress.length >= 2 && inputSuggestions.length > 0 ? (showSuggestions = true) : null"
            />

            <!-- Action Buttons di Dalam Bar Kanan -->
            <div class="absolute inset-y-0 right-0 pr-1.5 flex items-center gap-1 select-none pointer-events-auto">
                <!-- Indikator Loading Pencarian Input -->
                <div v-if="isSearchingInput" class="flex items-center justify-center shrink-0" :class="inputSizeClasses.btnIconSquare">
                    <span class="material-symbols-outlined animate-spin leading-none select-none" :class="[inputSizeClasses.iconFont, theme.textAccent]">progress_activity</span>
                </div>

                <!-- Tombol Hapus Nilai (X) -->
                <button
                    v-if="hasValue && !disabled && !readonly"
                    type="button"
                    class="flex items-center justify-center shrink-0 transition-colors cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    :class="[inputSizeClasses.btnIconSquare, buttonRoundedClass]"
                    title="Hapus Titik Lokasi"
                    @click="clearLocation"
                >
                    <span class="material-symbols-outlined leading-none select-none" :class="inputSizeClasses.iconFont">close</span>
                </button>

                <!-- Tombol GPS Deteksi Lokasi Sekarang -->
                <button
                    type="button"
                    :disabled="disabled || readonly || isDetectingGps"
                    class="flex items-center justify-center shrink-0 transition-colors select-none"
                    :class="[
                        inputSizeClasses.btnIconSquare,
                        buttonRoundedClass,
                        disabled || readonly
                            ? 'opacity-30 cursor-not-allowed pointer-events-none text-slate-400'
                            : `text-slate-500 dark:text-slate-400 cursor-pointer ${theme.hoverBg} hover:${theme.textAccent}`
                    ]"
                    :title="disabled ? 'Komponen dinonaktifkan' : 'Deteksi Lokasi GPS Saya'"
                    @click="detectCurrentLocation"
                >
                    <span
                        class="material-symbols-outlined leading-none select-none"
                        :class="[
                            inputSizeClasses.iconFont,
                            isDetectingGps ? `animate-spin ${theme.textAccent}` : ''
                        ]"
                        style="font-variation-settings: 'FILL' 1;"
                    >
                        {{ isDetectingGps ? 'progress_activity' : 'my_location' }}
                    </span>
                </button>

                <!-- Tombol Buka Peta Interaktif -->
                <button
                    type="button"
                    :disabled="disabled || readonly"
                    class="flex items-center border font-semibold transition-all select-none shadow-2xs shrink-0"
                    :class="[
                        inputSizeClasses.btnPeta,
                        buttonRoundedClass,
                        disabled || readonly
                            ? 'opacity-40 cursor-not-allowed pointer-events-none bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 shadow-none'
                            : `${theme.bgLight} ${theme.borderLight} ${theme.textButton} ${theme.hoverBg} cursor-pointer active:scale-95`
                    ]"
                    :title="disabled ? 'Komponen dinonaktifkan' : 'Pilih Titik di Peta'"
                    @click="displayMode === 'inline' ? toggleInlineMap() : openMapModal()"
                >
                    <svg class="shrink-0" :class="[inputSizeClasses.iconSvg, disabled || readonly ? 'text-slate-400' : theme.textAccent]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-2.5 2.5z"/>
                    </svg>
                    <span>Peta</span>
                </button>
            </div>
        </div>

        <!-- ======================================================== -->
        <!-- DROPDOWN SARAN ALAMAT AUTOCOMPLETE SAAT MENGETIK         -->
        <!-- ======================================================== -->
        <div
            v-if="showSuggestions && (inputSuggestions.length > 0 || isSearchingInput)"
            class="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150"
        >
            <div v-if="isSearchingInput && inputSuggestions.length === 0" class="px-4 py-3 flex items-center gap-2.5 text-xs text-slate-500">
                <span class="material-symbols-outlined text-base animate-spin" :class="theme.textAccent">progress_activity</span>
                <span>Mencari rekomendasi alamat jalan terdekat...</span>
            </div>

            <div v-else-if="inputSuggestions.length === 0" class="px-4 py-3 text-xs text-slate-400 italic">
                Tidak ditemukan alamat yang cocok untuk "{{ currentAddress }}". Tekan tombol Peta untuk memilih langsung titiknya.
            </div>

            <div v-else class="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-64 overflow-y-auto">
                <div
                    v-for="(item, idx) in inputSuggestions"
                    :key="item.place_id || idx"
                    class="flex items-start gap-3 px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group text-left"
                    @click="selectAddressSuggestion(item)"
                >
                    <slot name="suggestion" :item="item" :select="() => selectAddressSuggestion(item)">
                        <div class="mt-0.5 p-1.5 rounded-lg shrink-0 transition-colors" :class="[theme.bgLight, theme.textAccent]">
                            <span class="material-symbols-outlined text-[17px]">location_on</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:underline truncate">
                                {{ item.name || (item.display_name ? item.display_name.split(',')[0] : 'Lokasi Terpilih') }}
                            </div>
                            <div class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                {{ item.display_name }}
                            </div>
                        </div>
                        <span class="text-[10px] font-mono text-slate-400 shrink-0 self-center hidden sm:inline-block">
                            {{ parseFloat(item.lat).toFixed(3) }}, {{ parseFloat(item.lon || item.lng).toFixed(3) }}
                        </span>
                    </slot>
                </div>
            </div>
        </div>

        <!-- Coordinates Badge Pill (Lat & Lng) -->
        <div
            v-if="shouldShowCoordinates && formattedCoordinates"
            class="flex flex-wrap items-center gap-2 pt-0.5 text-[11px]"
        >
            <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 font-mono">
                <svg class="w-3.5 h-3.5 shrink-0" :class="theme.textAccent" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-2.5 2.5z"/>
                </svg>
                <span>Lat: {{ Number(currentLat).toFixed(6) }}</span>
                <span class="text-slate-300 dark:text-slate-600">|</span>
                <span>Lng: {{ Number(currentLng).toFixed(6) }}</span>
                <button
                    type="button"
                    class="ml-1 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                    :title="isCopied ? 'Tersalin!' : 'Salin Koordinat'"
                    @click="execCopy(formattedCoordinates)"
                >
                    <span class="material-symbols-outlined text-[13px]">
                        {{ isCopied ? 'check' : 'content_copy' }}
                    </span>
                </button>
            </div>

            <!-- Indikator Loading Reverse Geocoding -->
            <span v-if="isReverseGeocoding" class="flex items-center gap-1 text-[10px] text-slate-400">
                <span class="material-symbols-outlined text-[12px] animate-spin">progress_activity</span>
                <span>Mengambil nama jalan...</span>
            </span>

            <span v-else-if="currentCity" class="px-1.5 py-0.5 rounded font-medium" :class="theme.bgBadge">
                {{ currentCity }}
            </span>
        </div>

        <!-- ========================================================= -->
        <!-- 1. TAMPILAN INLINE ACCORDION PETA (displayMode='inline')   -->
        <!-- ========================================================= -->
        <div
            v-if="displayMode === 'inline' && isInlineOpen"
            class="relative rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 transition-all duration-300 animate-in fade-in slide-in-from-top-3"
        >
            <!-- Header Bilah Atas Accordion -->
            <div class="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                    <div class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" :class="[theme.bgLight, theme.textAccent]">
                        <span class="material-symbols-outlined text-sm">map</span>
                    </div>
                    <div class="min-w-0">
                        <div class="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 truncate">
                            <span>Peta Titik Presisi</span>
                            <span v-if="formattedCoordinates" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-normal">
                                {{ Number(currentLat).toFixed(4) }}, {{ Number(currentLng).toFixed(4) }}
                            </span>
                        </div>
                        <div class="text-[10px] text-slate-400 truncate">
                            Klik pada peta atau geser pin ke posisi yang diinginkan
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                    <ButtonSubmit
                        type="button"
                        variant="outline"
                        size="xs"
                        :disabled="disabled || readonly || isDetectingGps"
                        icon="my_location"
                        class="text-[11px] py-1 px-2"
                        @click="detectCurrentLocation"
                    >
                        GPS
                    </ButtonSubmit>
                    <ButtonSubmit
                        type="button"
                        variant="ghost"
                        size="xs"
                        icon="close"
                        class="text-[11px] py-1 px-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        title="Tutup Peta"
                        @click="toggleInlineMap"
                    />
                </div>
            </div>

            <!-- Kanvas Peta Leaflet Mount Point -->
            <div class="relative w-full h-72 sm:h-84 bg-slate-100 dark:bg-slate-950">
                <!-- Search Overlay di Dalam Accordion Peta -->
                <div class="absolute top-2.5 left-2.5 right-2.5 sm:right-16 z-10 max-w-sm">
                    <div class="relative shadow-md rounded-xl">
                        <div class="absolute left-2.5 top-2 flex items-center pointer-events-none text-slate-400">
                            <span class="material-symbols-outlined text-[17px]">search</span>
                        </div>
                        <input
                            type="text"
                            v-model="searchQuery"
                            placeholder="Cari gedung, jalan, atau kota..."
                            class="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            @input="handleSearchInput"
                        />
                        <div v-if="isSearching" class="absolute right-2 top-2">
                            <span class="material-symbols-outlined text-[15px] animate-spin text-blue-500">
                                progress_activity
                            </span>
                        </div>
                    </div>

                    <!-- Hasil Pencarian di Dalam Accordion Peta -->
                    <div
                        v-if="searchResults.length > 0"
                        class="mt-1 p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 max-h-40 overflow-y-auto space-y-0.5"
                    >
                        <button
                            v-for="(res, idx) in searchResults"
                            :key="idx"
                            type="button"
                            class="w-full p-1.5 text-left text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-start gap-1.5 transition-colors cursor-pointer text-slate-700 dark:text-slate-200"
                            @click="selectSearchResult(res)"
                        >
                            <span class="material-symbols-outlined text-[15px] text-blue-500 shrink-0 mt-0.5">location_on</span>
                            <span class="truncate text-[11px]">{{ res.display_name }}</span>
                        </button>
                    </div>
                </div>

                <!-- Leaflet DOM Mount Element untuk Inline Accordion -->
                <div ref="inlineMapContainerRef" class="w-full h-full z-0" />
            </div>

            <!-- Footer Bilah Bawah Accordion -->
            <div class="px-3.5 py-2 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div class="text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-md">
                    <strong class="text-slate-800 dark:text-slate-100">Alamat:</strong>
                    <span class="ml-1 text-slate-500 dark:text-slate-400">{{ currentAddress || 'Silakan tentukan titik di peta.' }}</span>
                </div>
                <ButtonSubmit
                    type="button"
                    :variant="theme.btnVariant"
                    size="xs"
                    icon="check"
                    class="font-medium shrink-0 justify-center"
                    @click="toggleInlineMap"
                >
                    Selesai Memilih Titik
                </ButtonSubmit>
            </div>
        </div>

        <!-- 3. FIELD FOOTER (Hint & Error Messages - Identik 100% dengan gaya InputField) -->
        <template v-if="!embedded && !hideFooter">
            <!-- Hint Text -->
            <div v-if="hint && !error" class="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                <slot name="hint">{{ hint }}</slot>
            </div>

            <!-- Error Message with Google Icon -->
            <div
                v-if="error"
                class="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium pt-0.5"
                role="alert"
            >
                <span class="material-symbols-outlined text-sm leading-none shrink-0">error</span>
                <span><slot name="error">{{ error }}</slot></span>
            </div>
        </template>

        <!-- ========================================================= -->
        <!-- 2. TAMPILAN MODAL DIALOG PETA (displayMode='modal')        -->
        <!-- ========================================================= -->
        <Modal
            v-if="displayMode === 'modal'"
            v-model="isModalOpen"
            max-width="4xl"
            title="Pilih Titik Lokasi di Peta"
            context="Penentuan Titik Koordinat Presisi"
            icon="pin_drop"
            :show-footer="true"
            body-class="!p-0 relative flex-1 min-h-0 flex flex-col overflow-hidden"
            @close="closeMapModal"
        >
            <!-- Map Interactive Canvas Area -->
            <div class="relative w-full h-[60vh] sm:h-[65vh] min-h-80 sm:min-h-115 bg-slate-100 dark:bg-slate-950 flex flex-col">
                <!-- Search Overlay di Atas Peta -->
                <div class="absolute top-3 left-3 right-3 sm:right-16 z-10 max-w-md">
                    <div class="relative shadow-lg rounded-xl">
                        <div class="absolute left-3 top-2.5 flex items-center pointer-events-none text-slate-400">
                            <span class="material-symbols-outlined text-[18px]">search</span>
                        </div>
                        <input
                            type="text"
                            v-model="searchQuery"
                            placeholder="Cari gedung, jalan, atau daerah..."
                            class="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-md text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            @input="handleSearchInput"
                        />
                        <div v-if="isSearching" class="absolute right-2.5 top-2.5">
                            <span class="material-symbols-outlined text-[16px] animate-spin text-blue-500">
                                progress_activity
                            </span>
                        </div>
                    </div>

                    <!-- Search Dropdown Results -->
                    <div
                        v-if="searchResults.length > 0"
                        class="mt-1.5 p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 max-h-48 sm:max-h-56 overflow-y-auto space-y-0.5"
                    >
                        <button
                            v-for="(res, idx) in searchResults"
                            :key="idx"
                            type="button"
                            class="w-full p-2 text-left text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-start gap-2 transition-colors cursor-pointer text-slate-700 dark:text-slate-200"
                            @click="selectSearchResult(res)"
                        >
                            <svg class="w-4 h-4 text-blue-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-2.5 2.5z"/>
                            </svg>
                            <span class="truncate">{{ res.display_name }}</span>
                        </button>
                    </div>
                </div>

                <!-- Preset Kota Cepat Floating Pills -->
                <div class="absolute bottom-3 left-3 right-28 sm:right-auto z-10 flex items-center gap-1.5 p-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl shadow-md border border-slate-200/80 dark:border-slate-800 max-w-[calc(100%-8rem)] sm:max-w-none overflow-x-auto no-scrollbar">
                    <span class="text-[10px] text-slate-400 px-1.5 font-medium shrink-0">Lompat:</span>
                    <button
                        v-for="city in cityPresets"
                        :key="city.name"
                        type="button"
                        class="px-2 py-0.5 text-[11px] rounded-lg text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer font-medium shrink-0 whitespace-nowrap"
                        @click="flyToPreset(city.coords)"
                    >
                        {{ city.name }}
                    </button>
                </div>

                <!-- Floating Button "GPS Saya" di Peta -->
                <div class="absolute bottom-3 right-3 z-10">
                    <ButtonSubmit
                        type="button"
                        variant="outline"
                        size="sm"
                        :disabled="isDetectingGps"
                        class="bg-white/95! dark:bg-slate-900/95! backdrop-blur-md shadow-lg text-xs! font-semibold text-slate-700! dark:text-slate-200! hover:text-blue-600! dark:hover:text-blue-400! border border-slate-200 dark:border-slate-800"
                        @click="detectCurrentLocation"
                    >
                        <span
                            class="material-symbols-outlined text-[18px] mr-1"
                            :class="isDetectingGps ? 'animate-spin text-blue-500' : 'text-blue-600'"
                        >
                            {{ isDetectingGps ? 'progress_activity' : 'my_location' }}
                        </span>
                        <span>GPS</span>
                    </ButtonSubmit>
                </div>

                <!-- Leaflet DOM Mount Element -->
                <div ref="modalMapContainerRef" class="w-full flex-1 z-0 min-h-80" />
            </div>

            <!-- Modal Footer Status & Actions via slot #footer -->
            <template #footer>
                <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
                    <!-- Info Hasil Koordinat & Alamat Terpilih -->
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-bold text-slate-900 dark:text-white shrink-0">
                                Koordinat Terpilih:
                            </span>
                            <span v-if="formattedCoordinates" class="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 truncate">
                                {{ formattedCoordinates }}
                            </span>
                            <span v-else class="text-xs text-slate-400 italic">
                                Belum ada titik dipilih
                            </span>
                        </div>
                        <div class="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xl mt-0.5">
                            {{ currentAddress || 'Silakan klik pada peta atau gunakan kotak pencarian.' }}
                        </div>
                    </div>

                    <!-- Tombol Aksi Konfirmasi -->
                    <div class="flex items-center justify-end gap-2 shrink-0">
                        <ButtonSubmit
                            type="button"
                            variant="outline"
                            size="sm"
                            class="w-full sm:w-auto justify-center"
                            @click="closeMapModal"
                        >
                            Batal
                        </ButtonSubmit>
                        <ButtonSubmit
                            type="button"
                            :variant="theme.btnVariant"
                            size="sm"
                            icon="check_circle"
                            class="w-full sm:w-auto justify-center shadow-md"
                            @click="closeMapModal"
                        >
                            Gunakan Titik Ini
                        </ButtonSubmit>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<style>
/* Reset Z-Index Leaflet Control agar tidak menutupi Modal Navigasi */
.leaflet-top,
.leaflet-bottom {
    z-index: 20 !important;
}

.leaflet-pane {
    z-index: 10 !important;
}

.custom-leaflet-marker-pin {
    background: transparent !important;
    border: none !important;
}
</style>
