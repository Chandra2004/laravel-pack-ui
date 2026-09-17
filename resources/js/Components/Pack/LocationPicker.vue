<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useClipboard } from '@/Composables/Pack/useClipboard';

const props = defineProps({
    /**
     * Objek model lokasi: { lat, lng, address, city, postal_code }
     * Atau string koordinat/alamat
     */
    modelValue: {
        type: [Object, String],
        default: null,
    },
    /**
     * Nilai Latitude langsung (jika binding terpisah)
     */
    lat: {
        type: Number,
        default: null,
    },
    /**
     * Nilai Longitude langsung (jika binding terpisah)
     */
    lng: {
        type: Number,
        default: null,
    },
    /**
     * Nilai Alamat langsung (jika binding terpisah)
     */
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
    /**
     * Default koordinat tengah saat peta pertama kali dibuka jika belum ada nilai
     */
    defaultCenter: {
        type: Array,
        default: () => [-6.2088, 106.8456], // Monas, Jakarta Pusat
    },
    /**
     * Level zoom default peta
     */
    defaultZoom: {
        type: Number,
        default: 14,
    },
    /**
     * Apakah menampilkan badge pill koordinat di bawah input
     */
    showCoordinatesBadge: {
        type: Boolean,
        default: true,
    },
    /**
     * Mode tampilan peta: 'modal' (dialog popup) atau 'inline' (accordion di bawah input)
     */
    displayMode: {
        type: String,
        default: 'modal',
        validator: (v) => ['modal', 'inline'].includes(v),
    },
});

const emit = defineEmits(['update:modelValue', 'update:lat', 'update:lng', 'update:address', 'change']);

const { copy: execCopy, copied: isCopied } = useClipboard({ timeout: 1800 });

// State Internal Lokasi
const currentLat = ref(null);
const currentLng = ref(null);
const currentAddress = ref('');
const currentCity = ref('');
const currentPostalCode = ref('');

// State UI & Interaksi
const isModalOpen = ref(false);
const isInlineOpen = ref(false);
const isDetectingGps = ref(false);
const isReverseGeocoding = ref(false);
const isSearching = ref(false);
const searchQuery = ref('');
const searchResults = ref([]);
const mapContainerRef = ref(null);

// Leaflet Instances
let leafletMap = null;
let leafletMarker = null;

// Sinkronisasi Nilai Awal dari Props
const syncFromProps = () => {
    if (props.modelValue && typeof props.modelValue === 'object') {
        currentLat.value = props.modelValue.lat ?? props.modelValue.latitude ?? null;
        currentLng.value = props.modelValue.lng ?? props.modelValue.longitude ?? null;
        currentAddress.value = props.modelValue.address ?? '';
        currentCity.value = props.modelValue.city ?? '';
        currentPostalCode.value = props.modelValue.postal_code ?? props.modelValue.postalCode ?? '';
    } else if (typeof props.modelValue === 'string' && props.modelValue.includes(',')) {
        const parts = props.modelValue.split(',').map((s) => parseFloat(s.trim()));
        if (!isNaN(parts[0]) && !isNaN(parts[1])) {
            currentLat.value = parts[0];
            currentLng.value = parts[1];
        }
    } else if (props.lat !== null && props.lng !== null) {
        currentLat.value = props.lat;
        currentLng.value = props.lng;
        currentAddress.value = props.address || '';
    }
};

syncFromProps();

watch(
    () => [props.modelValue, props.lat, props.lng, props.address],
    () => {
        syncFromProps();
    },
    { deep: true }
);

// Format Koordinat untuk Tampilan
const formattedCoordinates = computed(() => {
    if (currentLat.value === null || currentLng.value === null) return null;
    return `${Number(currentLat.value).toFixed(6)}, ${Number(currentLng.value).toFixed(6)}`;
});

const hasValue = computed(() => {
    return (currentLat.value !== null && currentLng.value !== null) || currentAddress.value;
});

// Emit Pembaruan Data ke Parent
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
};

// Pembuat Custom HTML Marker Pin (Teardrop Droplet Pin Presisi Tinggi)
const createCustomPinIcon = () => {
    return L.divIcon({
        className: 'custom-leaflet-marker-pin',
        html: `
            <div class="relative flex flex-col items-center select-none cursor-grab active:cursor-grabbing group" style="width: 38px; height: 50px; transform: translate(-50%, -100%);">
                <!-- Ground Ripple Pulse -->
                <span class="w-8 h-8 rounded-full bg-emerald-500/30 animate-ping absolute bottom-0 -mb-4 pointer-events-none"></span>
                
                <!-- Ground Soft Shadow Under Pin Tip -->
                <div class="absolute bottom-0 -mb-1 w-6 h-2 bg-slate-950/40 dark:bg-black/60 rounded-full blur-[1.5px] pointer-events-none"></div>

                <!-- Teardrop Map Pin SVG (Pointy bottom pointing directly to coordinate ground) -->
                <svg class="w-[38px] h-[50px] drop-shadow-md transition-transform duration-150 group-hover:scale-105 group-active:scale-110" viewBox="0 0 38 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="customPinGrad" x1="0" y1="0" x2="38" y2="50" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#10b981"/>
                            <stop offset="1" stop-color="#047857"/>
                        </linearGradient>
                    </defs>
                    <!-- Pin Teardrop Body -->
                    <path d="M19 0C8.50659 0 0 8.50659 0 19C0 32.5 19 50 19 50C19 50 38 32.5 38 19C38 8.50659 29.4934 0 19 0Z" fill="url(#customPinGrad)" stroke="#ffffff" stroke-width="2.2" stroke-linejoin="round"/>
                    <!-- Center White Circle -->
                    <circle cx="19" cy="18" r="6.5" fill="#ffffff"/>
                    <!-- Inner Emerald Dot -->
                    <circle cx="19" cy="18" r="3.2" fill="#047857"/>
                </svg>
            </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
    });
};

// Inisialisasi Peta Leaflet
const initMap = () => {
    if (!mapContainerRef.value || leafletMap) return;

    const initialCenter = [
        currentLat.value ?? props.defaultCenter[0],
        currentLng.value ?? props.defaultCenter[1],
    ];

    leafletMap = L.map(mapContainerRef.value, {
        center: initialCenter,
        zoom: currentLat.value ? 16 : props.defaultZoom,
        zoomControl: false,
    });

    // Tile Layer OpenStreetMap Standard
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
    }).addTo(leafletMap);

    // Zoom Control Kustom di Kanan Atas
    L.control.zoom({ position: 'topright' }).addTo(leafletMap);

    // Marker Pin Draggable
    leafletMarker = L.marker(initialCenter, {
        draggable: !props.readonly && !props.disabled,
        icon: createCustomPinIcon(),
    }).addTo(leafletMap);

    // Event Drag Marker
    leafletMarker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        setCoordinates(lat, lng, true);
    });

    // Event Klik di Area Peta untuk Pindahkan Pin
    leafletMap.on('click', (e) => {
        if (props.readonly || props.disabled) return;
        const { lat, lng } = e.latlng;
        setCoordinates(lat, lng, true);
    });

    // Fix bug render tampilan kontainer Leaflet
    setTimeout(() => {
        leafletMap.invalidateSize();
    }, 200);
};

// Hancurkan Instance Peta saat Ditutup
const destroyMap = () => {
    if (leafletMap) {
        leafletMap.remove();
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

// Reverse Geocoding: Koordinat -> Alamat Jalan (via Nominatim OpenStreetMap)
let reverseTimeout = null;
const reverseGeocode = async (lat, lng) => {
    clearTimeout(reverseTimeout);
    isReverseGeocoding.value = true;

    reverseTimeout = setTimeout(async () => {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;
            const response = await fetch(url, {
                headers: {
                    'Accept-Language': 'id, en',
                },
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

                // Susun string alamat yang natural dan rapi
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
    }, 400);
};

// Pencarian Lokasi/Nama Tempat di Atas Peta
let searchTimeout = null;
const handleSearchInput = () => {
    clearTimeout(searchTimeout);
    if (!searchQuery.value || searchQuery.value.trim().length < 3) {
        searchResults.value = [];
        return;
    }

    searchTimeout = setTimeout(async () => {
        isSearching.value = true;
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(searchQuery.value)}&limit=5&addressdetails=1`;
            const response = await fetch(url, {
                headers: { 'Accept-Language': 'id, en' },
            });
            const data = await response.json();
            searchResults.value = Array.isArray(data) ? data : [];
        } catch (err) {
            console.warn('[LocationPicker] Search failed:', err);
        } finally {
            isSearching.value = false;
        }
    }, 350);
};

const selectSearchResult = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    searchQuery.value = item.display_name;
    searchResults.value = [];

    if (leafletMap) {
        leafletMap.flyTo([lat, lng], 16, { duration: 1.2 });
    }
    setCoordinates(lat, lng, true);
};

// Tombol Deteksi Lokasi Sekarang (HTML5 Geolocation)
const detectCurrentLocation = () => {
    if (props.disabled || props.readonly) return;
    if (!('geolocation' in navigator)) {
        alert('Perangkat Anda tidak mendukung fitur Geolocation GPS.');
        return;
    }

    isDetectingGps.value = true;
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            isDetectingGps.value = false;

            setCoordinates(lat, lng, true);

            if (isModalOpen.value && leafletMap) {
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

// Buka Modal Peta
const openMapModal = () => {
    if (props.disabled || props.readonly) return;
    isModalOpen.value = true;
    nextTick(() => {
        initMap();
    });
};

const closeMapModal = () => {
    isModalOpen.value = false;
    destroyMap();
};

// Toggle Inline Map
const toggleInlineMap = () => {
    if (props.disabled || props.readonly) return;
    isInlineOpen.value = !isInlineOpen.value;
    if (isInlineOpen.value) {
        nextTick(() => {
            initMap();
        });
    } else {
        destroyMap();
    }
};

// Preset Kota Populer Indonesia untuk Navigasi Cepat
const cityPresets = [
    { name: 'Jakarta', coords: [-6.2088, 106.8456] },
    { name: 'Bandung', coords: [-6.9175, 107.6191] },
    { name: 'Surabaya', coords: [-7.2575, 112.7521] },
    { name: 'Yogyakarta', coords: [-7.7956, 110.3695] },
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

onUnmounted(() => {
    destroyMap();
});
</script>

<template>
    <div class="space-y-1.5 w-full">
        <!-- Label & Required Asterisk -->
        <div v-if="label" class="flex items-center justify-between">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 select-none">
                {{ label }}
                <span v-if="required" class="text-rose-500 font-bold ml-0.5">*</span>
            </label>
        </div>

        <!-- Input Bar Utama -->
        <div class="relative flex items-center group">
            <!-- Leading Icon Pin (Solid High-Contrast Map Pin) -->
            <div class="absolute left-3 flex items-center pointer-events-none transition-colors" :class="hasValue ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'">
                <svg class="w-5 h-5 drop-shadow-2xs" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
            </div>

            <!-- Input Teks Alamat -->
            <input
                type="text"
                v-model="currentAddress"
                :placeholder="placeholder"
                :disabled="disabled"
                :readonly="readonly"
                class="w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm rounded-xl border transition-all duration-150 bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed"
                :class="[
                    error
                        ? 'border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100 focus:ring-rose-500/20 focus:border-rose-500'
                        : 'border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-emerald-500/20 focus:border-emerald-500'
                ]"
                @input="emitUpdate"
            />

            <!-- Action Buttons di Dalam Bar Kanan -->
            <div class="absolute right-1.5 flex items-center gap-1">
                <!-- Tombol Hapus Nilai -->
                <button
                    v-if="hasValue && !disabled && !readonly"
                    type="button"
                    class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Hapus Titik Lokasi"
                    @click="clearLocation"
                >
                    <span class="material-symbols-outlined text-[16px]">close</span>
                </button>

                <!-- Tombol GPS Deteksi Lokasi Sekarang -->
                <button
                    type="button"
                    :disabled="disabled || readonly || isDetectingGps"
                    class="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer disabled:opacity-50"
                    title="Deteksi Lokasi GPS Saya"
                    @click="detectCurrentLocation"
                >
                    <span
                        class="material-symbols-outlined text-[19px]"
                        :class="isDetectingGps ? 'animate-spin text-emerald-500' : ''"
                        style="font-variation-settings: 'FILL' 1;"
                    >
                        {{ isDetectingGps ? 'progress_activity' : 'my_location' }}
                    </span>
                </button>

                <!-- Tombol Buka Peta Interaktif -->
                <button
                    type="button"
                    :disabled="disabled || readonly"
                    class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/80 text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
                    @click="displayMode === 'inline' ? toggleInlineMap() : openMapModal()"
                >
                    <svg class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span>Peta</span>
                </button>
            </div>
        </div>

        <!-- Coordinates Badge Pill (Lat & Lng) -->
        <div
            v-if="showCoordinatesBadge && formattedCoordinates"
            class="flex flex-wrap items-center gap-2 pt-0.5 text-[11px]"
        >
            <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 font-mono">
                <svg class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
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

            <span v-else-if="currentCity" class="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-medium">
                {{ currentCity }}
            </span>
        </div>

        <!-- Hint & Error Message -->
        <p v-if="error" class="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">error</span>
            <span>{{ error }}</span>
        </p>
        <p v-else-if="hint" class="text-xs text-slate-500 dark:text-slate-400">
            {{ hint }}
        </p>

        <!-- ========================================================= -->
        <!-- 1. TAMPILAN INLINE ACCORDION PETA (displayMode='inline')   -->
        <!-- ========================================================= -->
        <div
            v-if="displayMode === 'inline' && isInlineOpen"
            class="relative mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md"
        >
            <div ref="mapContainerRef" class="w-full h-72 z-0" />
            <div class="p-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span class="text-slate-500">Geser pin untuk menentukan titik koordinat yang tepat.</span>
                <button
                    type="button"
                    class="px-2 py-1 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 cursor-pointer"
                    @click="toggleInlineMap"
                >
                    Selesai
                </button>
            </div>
        </div>

        <!-- ========================================================= -->
        <!-- 2. TAMPILAN MODAL DIALOG PETA (displayMode='modal')        -->
        <!-- ========================================================= -->
        <Teleport to="body">
            <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
            >
                <div
                    v-if="isModalOpen"
                    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs"
                    role="dialog"
                    aria-modal="true"
                >
                    <!-- Modal Card Container -->
                    <div class="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
                        
                        <!-- Modal Header -->
                        <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
                            <div class="flex items-center gap-2.5">
                                <div class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3 class="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                        Pilih Titik Lokasi di Peta
                                    </h3>
                                    <p class="text-[11px] text-slate-500 dark:text-slate-400">
                                        Geser pin atau klik di mana saja untuk menandai koordinat presisi
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                class="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                @click="closeMapModal"
                            >
                                <span class="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        <!-- Map Interactive Canvas Area -->
                        <div class="relative flex-1 min-h-[420px] bg-slate-100 dark:bg-slate-950">
                            
                            <!-- Search Overlay di Atas Peta -->
                            <div class="absolute top-3 left-3 right-16 z-10 max-w-md">
                                <div class="relative shadow-lg rounded-xl">
                                    <div class="absolute left-3 top-2.5 flex items-center pointer-events-none text-slate-400">
                                        <span class="material-symbols-outlined text-[18px]">search</span>
                                    </div>
                                    <input
                                        type="text"
                                        v-model="searchQuery"
                                        placeholder="Cari gedung, jalan, atau daerah..."
                                        class="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-md text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        @input="handleSearchInput"
                                    />
                                    <div v-if="isSearching" class="absolute right-2.5 top-2.5">
                                        <span class="material-symbols-outlined text-[16px] animate-spin text-emerald-500">
                                            progress_activity
                                        </span>
                                    </div>
                                </div>

                                <!-- Search Dropdown Results -->
                                <div
                                    v-if="searchResults.length > 0"
                                    class="mt-1.5 p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 max-h-52 overflow-y-auto space-y-0.5"
                                >
                                    <button
                                        v-for="(res, idx) in searchResults"
                                        :key="idx"
                                        type="button"
                                        class="w-full p-2 text-left text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-start gap-2 transition-colors cursor-pointer text-slate-700 dark:text-slate-200"
                                        @click="selectSearchResult(res)"
                                    >
                                        <svg class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                        </svg>
                                        <span class="truncate">{{ res.display_name }}</span>
                                    </button>
                                </div>
                            </div>

                            <!-- Preset Kota Cepat Floating Pills -->
                            <div class="absolute bottom-3 left-3 z-10 hidden sm:flex items-center gap-1.5 p-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl shadow-md border border-slate-200/80 dark:border-slate-800">
                                <span class="text-[10px] text-slate-400 px-1.5 font-medium">Lompat:</span>
                                <button
                                    v-for="city in cityPresets"
                                    :key="city.name"
                                    type="button"
                                    class="px-2 py-0.5 text-[11px] rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer font-medium"
                                    @click="flyToPreset(city.coords)"
                                >
                                    {{ city.name }}
                                </button>
                            </div>

                            <!-- Floating Button "Lokasi Saya" di Peta -->
                            <button
                                type="button"
                                class="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-lg text-xs font-semibold cursor-pointer transition-transform active:scale-95"
                                :disabled="isDetectingGps"
                                @click="detectCurrentLocation"
                            >
                                <span class="material-symbols-outlined text-[18px]" :class="isDetectingGps ? 'animate-spin text-emerald-500' : 'text-emerald-600'">
                                    {{ isDetectingGps ? 'progress_activity' : 'my_location' }}
                                </span>
                                <span>GPS Saya</span>
                            </button>

                            <!-- Leaflet DOM Mount Element -->
                            <div ref="mapContainerRef" class="w-full h-full min-h-[420px] z-0" />
                        </div>

                        <!-- Modal Footer Status & Actions -->
                        <div class="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                            <!-- Info Hasil Koordinat & Alamat Terpilih -->
                            <div class="min-w-0">
                                <div class="flex items-center gap-2">
                                    <span class="text-xs font-bold text-slate-900 dark:text-white">
                                        Koordinat Terpilih:
                                    </span>
                                    <span v-if="formattedCoordinates" class="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                        {{ formattedCoordinates }}
                                    </span>
                                    <span v-else class="text-xs text-slate-400 italic">
                                        Belum ada titik dipilih
                                    </span>
                                </div>
                                <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xl mt-0.5">
                                    {{ currentAddress || 'Silakan klik pada peta atau gunakan kotak pencarian.' }}
                                </p>
                            </div>

                            <!-- Tombol Aksi Konfirmasi -->
                            <div class="flex items-center justify-end gap-2 shrink-0">
                                <button
                                    type="button"
                                    class="px-4 py-2 text-xs font-medium rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                    @click="closeMapModal"
                                >
                                    Tutup
                                </button>
                                <button
                                    type="button"
                                    class="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
                                    @click="closeMapModal"
                                >
                                    <span class="material-symbols-outlined text-[16px]">check_circle</span>
                                    <span>Gunakan Titik Ini</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<style>
/* Reset Z-Index Leaflet Control agar tidak menutupi Modal Navigasi */
.leaflet-pane {
    z-index: 1 !important;
}
.leaflet-top,
.leaflet-bottom {
    z-index: 2 !important;
}
.custom-leaflet-pin,
.custom-leaflet-marker-pin {
    background: transparent !important;
    border: none !important;
}
</style>
