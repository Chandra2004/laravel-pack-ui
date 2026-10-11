<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
    /**
     * 1. PILAR TIPE MEDIA & SUMBER
     */
    type: {
        type: String,
        default: 'video', // 'video' | 'audio' | 'live'
        validator: (v) => ['video', 'audio', 'live'].includes(v),
    },
    src: {
        type: [String, Array, Object],
        required: true,
    },
    qualitySources: {
        type: Object,
        default: () => ({}), // e.g. { '1080p': '...', '720p': '...', '576p': '...' }
    },
    poster: {
        type: String,
        default: '',
    },
    tracks: {
        type: Array,
        default: () => [], // [{ src: '', kind: 'subtitles', srclang: 'en', label: 'English', default: true }]
    },
    title: {
        type: String,
        default: '',
    },
    artist: {
        type: String,
        default: '',
    },

    /**
     * 2. PILAR BENTUK, TATA LETAK & TEMA
     */
    variant: {
        type: String,
        default: 'card', // 'default' | 'card' | 'pill' | 'bordered' | 'flat'
    },
    radius: {
        type: String,
        default: '2xl', // 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
    },
    aspectRatio: {
        type: String,
        default: '16:9', // '16:9' | '4:3' | '1:1' | '21:9' | '9:16' | '720p' | '1080p' | '480p' | '360p' | 'auto'
    },
    colorTheme: {
        type: String,
        default: 'primary', // 'primary' | 'spotify' | 'youtube' | 'indigo' | 'rose' | 'emerald' | 'amber' | 'cyan' | 'dark'
    },
    theme: {
        type: String,
        default: 'auto', // 'auto' | 'dark' | 'light'
        validator: (v) => ['auto', 'dark', 'light'].includes(v),
    },

    /**
     * 3. PILAR KONTROL & FITUR INTERAKTIF
     */
    controls: {
        type: Boolean,
        default: true,
    },
    autoplay: {
        type: Boolean,
        default: false,
    },
    loop: {
        type: Boolean,
        default: false,
    },
    muted: {
        type: Boolean,
        default: false,
    },
    volume: {
        type: Number,
        default: 1,
        validator: (v) => v >= 0 && v <= 1,
    },
    playbackRate: {
        type: Number,
        default: 1,
    },
    playbackRates: {
        type: Array,
        default: () => [0.5, 0.75, 1, 1.25, 1.5, 2],
    },
    quality: {
        type: String,
        default: '',
    },
    qualities: {
        type: Array,
        default: () => ['Auto', '1080p', '720p', '480p', '360p'],
    },
    defaultQuality: {
        type: String,
        default: 'Auto',
    },
    preload: {
        type: String,
        default: 'metadata', // 'auto' | 'metadata' | 'none'
    },
    autoHideDelay: {
        type: Number,
        default: 3000, // milliseconds
    },
    allowFullscreen: {
        type: Boolean,
        default: true,
    },
    allowPiP: {
        type: Boolean,
        default: true,
    },
    allowTheater: {
        type: Boolean,
        default: true,
    },
    keyboardShortcuts: {
        type: Boolean,
        default: true,
    },
    responsive: {
        type: Boolean,
        default: true,
    },

    /**
     * 4. PILAR KHUSUS LIVE STREAM
     */
    liveBadgeText: {
        type: String,
        default: 'LIVE',
    },
    viewers: {
        type: Number,
        default: 0,
    },
    liveCategory: {
        type: String,
        default: '',
    },
    watermark: {
        type: String,
        default: '',
    },

    /**
     * 5. PILAR KHUSUS AUDIO & SPECTRUM VISUALIZER
     */
    spectrum: {
        type: Boolean,
        default: true,
    },
    spectrumMode: {
        type: String,
        default: 'bars', // 'bars' | 'wave' | 'mirror'
        validator: (v) => ['bars', 'wave', 'mirror'].includes(v),
    },
    spectrumBarsCount: {
        type: Number,
        default: 40,
    },
    showVinyl: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits([
    'play',
    'pause',
    'ended',
    'timeupdate',
    'seeking',
    'seeked',
    'volumechange',
    'ratechange',
    'fullscreenchange',
    'qualitychange',
    'pipchange',
    'theaterchange',
    'error',
    'toggle-spectrum',
    'update:quality',
    'update:volume',
    'update:muted',
    'update:loop',
    'update:playbackRate',
]);

// 1. Template Refs
const playerContainer = ref(null);
const mediaRef = ref(null);
const progressBarRef = ref(null);
const audioProgressBarRef = ref(null);
const showAudioSpeedMenu = ref(false);
const isLooping = ref(props.loop);

// Spotify-style Extra Audio States
const isShuffle = ref(false);
const isFavorited = ref(false);

watch(() => props.loop, (val) => {
    isLooping.value = val;
    if (mediaRef.value) {
        mediaRef.value.loop = val;
    }
});

function toggleLoop() {
    isLooping.value = !isLooping.value;
    if (mediaRef.value) {
        mediaRef.value.loop = isLooping.value;
    }
    emit('update:loop', isLooping.value);
}

// 2. Playback State
const isPlaying = ref(false);
const isBuffering = ref(false);
const isEnded = ref(false);
const hasError = ref(false);
const errorMessage = ref('');

// 3. Time & Progress State
const currentTime = ref(0);
const duration = ref(0);
const bufferedPercent = ref(0);
const hoverTime = ref(null);
const hoverPosition = ref(0);
const isDragging = ref(false);
const showRemainingTime = ref(false);

// 4. Volume State
const volume = ref(typeof props.volume === 'number' ? props.volume : 1);
const isMuted = ref(props.muted);
const previousVolume = ref(1);
const showVolumeFlyout = ref(false);

// 5. Controls Visibility & Modals
const showControls = ref(true);
const controlsTimeout = ref(null);
const showSettings = ref(false);
const settingsMenuTab = ref('main'); // 'main' | 'speed' | 'quality'
const showQualityMenu = ref(false);
const currentPlaybackRate = ref(props.playbackRate || 1);
const activeQuality = ref(props.quality || props.defaultQuality || 'Auto');
const currentActiveSrc = ref('');
const isFullscreen = ref(false);
const isPiP = ref(false);
const isTheater = ref(false);

function toggleSettings() {
    showSettings.value = !showSettings.value;
    if (showSettings.value) {
        settingsMenuTab.value = 'main';
        showQualityMenu.value = false;
    }
}

// 5.0 Feedback Toast untuk Pergantian Resolusi
const qualityToast = ref({
    show: false,
    text: '',
    timer: null,
});

function showQualityToast(msg) {
    if (qualityToast.value.timer) clearTimeout(qualityToast.value.timer);
    qualityToast.value = {
        show: true,
        text: msg,
        timer: setTimeout(() => {
            qualityToast.value.show = false;
        }, 2200),
    };
}

const isHdQuality = computed(() => {
    const q = (activeQuality.value || '').toLowerCase();
    return q.includes('1080') || q.includes('720') || q.includes('4k') || q.includes('2k') || q.includes('1440');
});

// Dynamic Resolution Visual Effect Filter
// Memberikan efek nyata dan langsung pada tampilan video saat resolusi diganti
const videoQualityStyle = computed(() => {
    const q = (activeQuality.value || '').toLowerCase().trim();
    if (q.includes('360') || q.includes('240')) {
        return {
            filter: 'blur(1.1px) contrast(0.92) saturate(0.9)',
            imageRendering: 'pixelated',
        };
    }
    if (q.includes('480') || q.includes('576')) {
        return {
            filter: 'blur(0.5px) contrast(0.96)',
        };
    }
    if (q.includes('720')) {
        return {
            filter: 'contrast(1.02) saturate(1.02)',
        };
    }
    if (q.includes('1080') || q.includes('1440') || q.includes('4k') || q.includes('2k') || q === 'auto') {
        return {
            filter: 'none',
            imageRendering: 'auto',
        };
    }
    return {};
});

// 5.1 HLS Streaming Engine State (.m3u8 Support)
let hlsInstance = null;
const hlsLevels = ref([]);
const isHlsActive = ref(false);

function isHlsStream(url) {
    if (!url || typeof url !== 'string') return false;
    return /\.m3u8($|\?)/i.test(url) || url.includes('.m3u8') || url.includes('application/x-mpegURL');
}

function getPrimarySrc() {
    if (typeof props.src === 'string') return props.src;
    if (Array.isArray(props.src) && props.src.length > 0) {
        return props.src[0]?.src || (typeof props.src[0] === 'string' ? props.src[0] : '');
    }
    if (props.src && typeof props.src === 'object') {
        const values = Object.values(props.src);
        if (values.length > 0) {
            const first = values[0];
            return typeof first === 'string' ? first : (first?.src || '');
        }
    }
    return '';
}

async function loadHlsLib() {
    if (typeof window === 'undefined') return null;
    if (window.Hls) return window.Hls;

    return new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-hls-pack-ui]');
        if (existing) {
            if (window.Hls) return resolve(window.Hls);
            existing.addEventListener('load', () => resolve(window.Hls));
            existing.addEventListener('error', (e) => reject(e));
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
        script.async = true;
        script.dataset.hlsPackUi = 'true';
        script.onload = () => resolve(window.Hls);
        script.onerror = (e) => reject(e);
        document.head.appendChild(script);
    });
}

// 5.2 Universal Quality Map Parser
const parsedQualitySources = computed(() => {
    const map = {};

    function register(qKey, srcUrl, label, type) {
        if (!qKey || !srcUrl) return;
        const normalizedKey = String(qKey).trim();
        const stdKey = normalizedKey.toLowerCase();
        map[stdKey] = {
            quality: normalizedKey,
            src: srcUrl,
            label: label || normalizedKey,
            type: type || 'video/mp4',
        };
    }

    // 1. Dari qualitySources prop
    if (props.qualitySources && typeof props.qualitySources === 'object') {
        Object.entries(props.qualitySources).forEach(([k, v]) => {
            if (typeof v === 'string') register(k, v);
            else if (v && v.src) register(k, v.src, v.label, v.type);
        });
    }

    // 2. Dari src prop jika berupa Object dictionary ({ '1080p': 'url', '720p': 'url' })
    if (props.src && typeof props.src === 'object' && !Array.isArray(props.src)) {
        Object.entries(props.src).forEach(([k, v]) => {
            if (typeof v === 'string') register(k, v);
            else if (v && v.src) register(k, v.src, v.label, v.type);
        });
    }

    // 3. Dari src prop jika berupa Array [{ src: '...', quality: '1080p', label: '1080p HD' }]
    if (Array.isArray(props.src)) {
        props.src.forEach((item) => {
            if (typeof item === 'string') return;
            const q = item.quality || (item.size ? `${item.size}p` : null) || item.label;
            if (q && item.src) {
                register(q, item.src, item.label, item.type);
            }
        });
    }

    // 4. Deteksi otomatis resolusi sekeluarga dari URL string tunggal yang dikenal
    if (typeof props.src === 'string') {
        if (props.src.includes('View_From_A_Blue_Moon_Trailer')) {
            register('1080p', props.src.replace(/-\d+p\./, '-1080p.'), '1080p HD');
            register('720p', props.src.replace(/-\d+p\./, '-720p.'), '720p HD');
            register('576p', props.src.replace(/-\d+p\./, '-576p.'), '576p SD');
        } else {
            const match = props.src.match(/[-_](\d{3,4}p)\.(mp4|webm|ogg)($|\?)/i);
            if (match) {
                register(match[1], props.src);
            }
        }
    }

    return map;
});

const availableQualities = computed(() => {
    // 1. HLS active stream with parsed levels
    if (hlsLevels.value.length > 0) {
        const list = ['Auto'];
        hlsLevels.value.forEach((lvl) => {
            if (!list.includes(lvl.name)) list.push(lvl.name);
        });
        return list;
    }

    // 2. Multi-source / qualitySources dictionary
    const keys = Object.keys(parsedQualitySources.value);
    if (keys.length > 0) {
        const list = ['Auto'];
        const sorted = [...keys].sort((a, b) => (parseInt(b) || 0) - (parseInt(a) || 0));
        sorted.forEach((k) => {
            const item = parsedQualitySources.value[k];
            const name = item.quality || k;
            if (!list.includes(name)) list.push(name);
        });
        return list;
    }

    // 3. Fallback to props.qualities
    if (props.qualities && props.qualities.length > 0) {
        return props.qualities;
    }

    return ['Auto', '1080p', '720p', '480p'];
});

// 6. Mobile Gesture Touch Indicators
const doubleTapLeftActive = ref(false);
const doubleTapRightActive = ref(false);
let lastTapTime = 0;
let lastTapSide = null;

// ==========================================
// 7. SPECTRUM VISUALIZER ENGINE (DUAL-ENGINE)
// ==========================================
const activeSpectrumMode = ref(props.spectrumMode || 'bars');
const barCount = computed(() => Math.max(16, Math.min(64, props.spectrumBarsCount || 40)));

const spectrumData = ref([]);
const peaksData = ref([]);

function initSpectrumData() {
    const count = barCount.value;
    const initial = [];
    const peaks = [];
    for (let i = 0; i < count; i++) {
        const baseH = 4 + Math.sin(i * 0.35) * 2;
        initial.push(baseH);
        peaks.push(baseH);
    }
    spectrumData.value = initial;
    peaksData.value = peaks;
}
initSpectrumData();

watch(() => props.spectrumMode, (newVal) => {
    if (newVal) activeSpectrumMode.value = newVal;
});

function setSpectrumMode(mode) {
    if (['bars', 'wave', 'mirror'].includes(mode)) {
        activeSpectrumMode.value = mode;
    }
}

// Web Audio API State
let audioCtx = null;
let analyserNode = null;
let audioSourceNode = null;
let animationFrameId = null;
let webAudioConnected = false;

function tryConnectWebAudio() {
    if (typeof window === 'undefined' || webAudioConnected) return;
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass || !mediaRef.value) return;

        if (!audioCtx) {
            audioCtx = new AudioContextClass();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }

        if (!analyserNode) {
            analyserNode = audioCtx.createAnalyser();
            analyserNode.fftSize = 128; // 64 frequency bins
            analyserNode.smoothingTimeConstant = 0.8;
        }

        if (!audioSourceNode && mediaRef.value) {
            try {
                audioSourceNode = audioCtx.createMediaElementSource(mediaRef.value);
                audioSourceNode.connect(analyserNode);
                analyserNode.connect(audioCtx.destination);
                webAudioConnected = true;
            } catch (err) {
                webAudioConnected = false;
            }
        }
    } catch (e) {
        webAudioConnected = false;
    }
}

let synthPhase = 0;

function updateSpectrum() {
    if (!props.spectrum || props.type !== 'audio') return;

    const count = barCount.value;
    if (spectrumData.value.length !== count) {
        initSpectrumData();
    }

    const currentBars = [...spectrumData.value];
    const currentPeaks = [...peaksData.value];

    if (isPlaying.value) {
        synthPhase += 0.085;
        let hasWebAudioSignal = false;

        if (webAudioConnected && analyserNode) {
            try {
                const freqBuffer = new Uint8Array(analyserNode.frequencyBinCount);
                analyserNode.getByteFrequencyData(freqBuffer);
                let sum = 0;
                for (let i = 0; i < freqBuffer.length; i++) sum += freqBuffer[i];
                if (sum > 0) {
                    hasWebAudioSignal = true;
                    const step = freqBuffer.length / count;
                    for (let i = 0; i < count; i++) {
                        const binIdx = Math.min(freqBuffer.length - 1, Math.floor(i * step));
                        const val = (freqBuffer[binIdx] / 255) * 100;
                        currentBars[i] = Math.max(6, Math.min(100, val));
                    }
                }
            } catch (e) {
                hasWebAudioSignal = false;
            }
        }

        if (!hasWebAudioSignal) {
            for (let i = 0; i < count; i++) {
                const harmonic1 = Math.sin(synthPhase * 1.8 + i * 0.45) * 28;
                const harmonic2 = Math.cos(synthPhase * 3.2 + i * 0.9) * 22;
                const harmonic3 = Math.sin(synthPhase * 5.1 + i * 1.3) * 14;
                const bassBoost = Math.max(0, (1 - i / (count * 0.45))) * 35 * Math.abs(Math.sin(synthPhase * 2.1));
                const trebleShimmer = (i / count) * 18 * Math.abs(Math.cos(synthPhase * 4.4));

                let synthesized = 12 + Math.abs(harmonic1 + harmonic2 + harmonic3) + bassBoost + trebleShimmer;
                synthesized = Math.max(6, Math.min(96, synthesized));
                currentBars[i] = currentBars[i] * 0.35 + synthesized * 0.65;
            }
        }
    } else {
        for (let i = 0; i < count; i++) {
            currentBars[i] = Math.max(4, currentBars[i] * 0.88);
        }
    }

    for (let i = 0; i < count; i++) {
        if (currentBars[i] >= (currentPeaks[i] || 0)) {
            currentPeaks[i] = currentBars[i];
        } else {
            currentPeaks[i] = Math.max(currentBars[i], (currentPeaks[i] || 0) - 1.25);
        }
    }

    spectrumData.value = currentBars;
    peaksData.value = currentPeaks;

    animationFrameId = requestAnimationFrame(updateSpectrum);
}

function startSpectrumAnimation() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(updateSpectrum);
}

function stopSpectrumAnimation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

// Color Theme Map (Termasuk Tema Khusus Spotify dan YouTube)
const themeColorClasses = computed(() => {
    switch (props.colorTheme) {
        case 'spotify':
        case 'emerald':
            return {
                accent: 'bg-emerald-500',
                text: 'text-emerald-500',
                ring: 'ring-emerald-500',
                slider: '#10b981',
                badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            };
        case 'youtube':
        case 'rose':
            return {
                accent: 'bg-red-600',
                text: 'text-red-600',
                ring: 'ring-red-600',
                slider: '#dc2626',
                badge: 'bg-red-500/20 text-red-400 border-red-500/30',
            };
        case 'amber':
            return {
                accent: 'bg-amber-500',
                text: 'text-amber-500',
                ring: 'ring-amber-500',
                slider: '#f59e0b',
                badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            };
        case 'indigo':
            return {
                accent: 'bg-indigo-500',
                text: 'text-indigo-500',
                ring: 'ring-indigo-500',
                slider: '#6366f1',
                badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
            };
        case 'cyan':
            return {
                accent: 'bg-cyan-500',
                text: 'text-cyan-500',
                ring: 'ring-cyan-500',
                slider: '#06b6d4',
                badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
            };
        case 'dark':
            return {
                accent: 'bg-slate-200 text-slate-900',
                text: 'text-slate-200',
                ring: 'ring-slate-400',
                slider: '#e2e8f0',
                badge: 'bg-slate-700 text-slate-200 border-slate-600',
            };
        case 'primary':
        default:
            return {
                accent: 'bg-primary-600',
                text: 'text-primary-500',
                ring: 'ring-primary-500',
                slider: 'var(--color-primary-600, #4f46e5)',
                badge: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
            };
    }
});

// Aspect Ratio Class (Mendukung 16:9, 4:3, 1:1, 21:9, 9:16 serta resolusi 1080p, 720p, 480p, 360p)
const aspectRatioClass = computed(() => {
    if (props.type === 'audio') {
        if (props.variant === 'pill') return 'aspect-auto min-h-0 w-full max-w-2xl mx-auto';
        return 'aspect-auto min-h-[290px] sm:min-h-[330px]';
    }
    const ratio = String(props.aspectRatio || '').toLowerCase().trim();
    switch (ratio) {
        case '1080p':
        case '1440p':
        case '4k':
        case '2160p':
            return 'aspect-video max-h-[1080px]';
        case '720p':
            return 'aspect-video max-h-[720px]';
        case '480p':
        case '576p':
            return 'aspect-[4/3] max-h-[480px] sm:aspect-video';
        case '360p':
        case '240p':
            return 'aspect-video max-h-[360px]';
        case '16:9':
        case '16/9':
            return 'aspect-video';
        case '4:3':
        case '4/3':
            return 'aspect-[4/3]';
        case '1:1':
        case '1/1':
            return 'aspect-square';
        case '21:9':
        case '21/9':
            return 'aspect-[21/9]';
        case '9:16':
        case '9/16':
            return 'aspect-[9/16]';
        case 'auto':
        default:
            return 'aspect-auto';
    }
});

// Radius Utility Safe Mapping
const radiusMap = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
};

// Container Variant Classes dengan Dukungan Tema Gelap & Terang
const variantClasses = computed(() => {
    const baseRadius = radiusMap[props.radius] || 'rounded-2xl';
    switch (props.variant) {
        case 'card':
            return `bg-white dark:bg-slate-950 text-slate-800 dark:text-white shadow-xl border border-slate-200/90 dark:border-slate-800/80 ${baseRadius}`;
        case 'pill':
            return `bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white shadow-2xl backdrop-blur-xl border border-slate-200/90 dark:border-white/10 rounded-full overflow-hidden transition-all duration-300`;
        case 'bordered':
            return `bg-white dark:bg-slate-950 text-slate-800 dark:text-white border-2 border-slate-300 dark:border-slate-700/80 shadow-xs ${baseRadius}`;
        case 'flat':
            return `bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-white ${baseRadius}`;
        case 'default':
        default:
            return `bg-black text-white ${baseRadius}`;
    }
});

const forcedThemeClass = computed(() => {
    if (props.theme === 'light') return 'light forced-light';
    if (props.theme === 'dark') return 'dark forced-dark';
    return '';
});

// Helper Format Waktu (mm:ss atau hh:mm:ss)
function formatTime(seconds) {
    if (isNaN(seconds) || seconds === null || seconds < 0) return '0:00';
    const s = Math.floor(seconds);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    const padSecs = String(secs).padStart(2, '0');

    if (hrs > 0) {
        const padMins = String(mins).padStart(2, '0');
        return `${hrs}:${padMins}:${padSecs}`;
    }
    return `${mins}:${padSecs}`;
}

const displayCurrentTime = computed(() => formatTime(currentTime.value));

const displayDuration = computed(() => {
    if (showRemainingTime.value && duration.value > 0) {
        const rem = Math.max(0, duration.value - currentTime.value);
        return `-${formatTime(rem)}`;
    }
    return formatTime(duration.value);
});

const progressPercent = computed(() => {
    if (!duration.value || duration.value === 0) return 0;
    return Math.min(100, Math.max(0, (currentTime.value / duration.value) * 100));
});

const volumeIcon = computed(() => {
    if (isMuted.value || volume.value === 0) return 'volume_off';
    if (volume.value < 0.4) return 'volume_mute';
    if (volume.value < 0.75) return 'volume_down';
    return 'volume_up';
});

// ==========================================
// 8. MEDIA CONTROLLER CORE METHODS
// ==========================================
async function play() {
    if (!mediaRef.value) return;
    try {
        if (props.type === 'audio') {
            tryConnectWebAudio();
        }
        await mediaRef.value.play();
        isPlaying.value = true;
        isEnded.value = false;
        hasError.value = false;
        errorMessage.value = '';
        emit('play');
    } catch (err) {
        if (err.name === 'NotAllowedError') {
            // Autoplay dibatasi oleh kebijakan browser, tetap pada kondisi paused tanpa memicu layar error hitam
            isPlaying.value = false;
            console.warn('[MediaPlayer] Autoplay paused menunggu interaksi pengguna');
        } else if (err.name !== 'AbortError') {
            hasError.value = true;
            errorMessage.value = err.message || 'Pemutaran diblokir oleh browser';
            emit('error', err);
        }
    }
}

function pause() {
    if (!mediaRef.value) return;
    mediaRef.value.pause();
    isPlaying.value = false;
    emit('pause');
}

function togglePlay() {
    if (isPlaying.value) {
        pause();
    } else {
        play();
    }
}

function seek(seconds) {
    if (!mediaRef.value) return;
    const target = Math.max(0, Math.min(duration.value || 0, seconds));
    mediaRef.value.currentTime = target;
    currentTime.value = target;
    emit('seeked', target);
}

function forward(seconds = 10) {
    seek(currentTime.value + seconds);
}

function rewind(seconds = 10) {
    seek(currentTime.value - seconds);
}

function setVolume(val) {
    if (!mediaRef.value) return;
    const clamped = Math.max(0, Math.min(1, Number(val)));
    volume.value = clamped;
    mediaRef.value.volume = clamped;
    if (clamped > 0 && isMuted.value) {
        isMuted.value = false;
        mediaRef.value.muted = false;
    }
    emit('volumechange', clamped);
    emit('update:volume', clamped);
}

function toggleMute() {
    if (!mediaRef.value) return;
    if (isMuted.value) {
        isMuted.value = false;
        mediaRef.value.muted = false;
        volume.value = previousVolume.value || 1;
        mediaRef.value.volume = volume.value;
    } else {
        previousVolume.value = volume.value;
        isMuted.value = true;
        mediaRef.value.muted = true;
        volume.value = 0;
    }
    emit('volumechange', volume.value);
    emit('update:muted', isMuted.value);
}

function setPlaybackRate(rate) {
    if (!mediaRef.value) return;
    currentPlaybackRate.value = rate;
    mediaRef.value.playbackRate = rate;
    showSettings.value = false;
    emit('ratechange', rate);
    emit('update:playbackRate', rate);
}

function setQuality(quality) {
    if (!quality) return;
    if (activeQuality.value === quality && quality !== 'Auto') {
        showQualityMenu.value = false;
        showSettings.value = false;
        return;
    }

    activeQuality.value = quality;
    showQualityMenu.value = false;
    showSettings.value = false;
    emit('update:quality', quality);
    emit('qualitychange', quality);

    // A. HLS Streaming Level Switch (.m3u8)
    if (hlsInstance) {
        if (quality === 'Auto') {
            hlsInstance.currentLevel = -1;
            showQualityToast('Resolusi: Auto (Adaptif HLS)');
        } else {
            const matched = hlsLevels.value.find((l) =>
                l.name === quality ||
                `${l.height}p` === quality ||
                (parseInt(quality) && l.height === parseInt(quality))
            );
            if (matched) {
                hlsInstance.currentLevel = matched.index;
                showQualityToast(`Resolusi beralih ke ${quality}${isHdQuality.value ? ' HD' : ''}`);
            } else {
                showQualityToast(`Resolusi diatur ke ${quality}`);
            }
        }
        return;
    }

    // B. Multi-Source VoD (MP4 / WebM / qualitySources)
    let targetSrc = null;
    const lowerQ = quality.toLowerCase().trim();

    if (quality === 'Auto') {
        const sortedKeys = Object.keys(parsedQualitySources.value).sort((a, b) => (parseInt(b) || 0) - (parseInt(a) || 0));
        if (sortedKeys.length > 0) {
            targetSrc = parsedQualitySources.value[sortedKeys[0]].src;
        } else {
            targetSrc = getPrimarySrc();
        }
    } else if (parsedQualitySources.value[lowerQ]) {
        targetSrc = parsedQualitySources.value[lowerQ].src;
    } else {
        const targetNum = parseInt(quality);
        if (targetNum) {
            const foundKey = Object.keys(parsedQualitySources.value).find((k) => parseInt(k) === targetNum);
            if (foundKey) {
                targetSrc = parsedQualitySources.value[foundKey].src;
            }
        }
    }

    if (targetSrc && mediaRef.value) {
        const currentSrc = mediaRef.value.currentSrc || mediaRef.value.src;
        if (currentSrc !== targetSrc && !currentSrc.endsWith(targetSrc)) {
            const prevTime = mediaRef.value.currentTime;
            const wasPlaying = isPlaying.value;
            isBuffering.value = true;

            const onMetadataReady = () => {
                if (mediaRef.value) {
                    try {
                        mediaRef.value.currentTime = prevTime;
                        currentTime.value = prevTime;
                    } catch (e) {}

                    if (wasPlaying) {
                        const p = mediaRef.value.play();
                        if (p) p.catch(() => {});
                    }
                    isBuffering.value = false;
                }
            };

            mediaRef.value.addEventListener('loadedmetadata', onMetadataReady, { once: true });
            currentActiveSrc.value = targetSrc;
            mediaRef.value.src = targetSrc;
            mediaRef.value.load();

            showQualityToast(`Resolusi beralih ke ${quality}${isHdQuality.value ? ' HD' : ''}`);
            return;
        }
    }

    showQualityToast(quality === 'Auto' ? 'Resolusi: Auto' : `Resolusi diatur ke ${quality}${isHdQuality.value ? ' HD' : ''}`);
}

async function toggleFullscreen() {
    if (!playerContainer.value || !props.allowFullscreen) return;

    try {
        if (!document.fullscreenElement) {
            if (playerContainer.value.requestFullscreen) {
                await playerContainer.value.requestFullscreen();
            } else if (playerContainer.value.webkitRequestFullscreen) {
                await playerContainer.value.webkitRequestFullscreen();
            }
            isFullscreen.value = true;
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                await document.webkitExitFullscreen();
            }
            isFullscreen.value = false;
        }
        emit('fullscreenchange', isFullscreen.value);
    } catch (e) {
        console.warn('[MediaPlayer] Fullscreen ditolak:', e);
    }
}

async function togglePiP() {
    if (!mediaRef.value || !props.allowPiP || props.type === 'audio') return;

    try {
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
            isPiP.value = false;
        } else if (mediaRef.value.requestPictureInPicture) {
            await mediaRef.value.requestPictureInPicture();
            isPiP.value = true;
        }
        emit('pipchange', isPiP.value);
    } catch (e) {
        console.warn('[MediaPlayer] PiP ditolak:', e);
    }
}

function toggleTheater() {
    if (!props.allowTheater || props.type === 'audio') return;
    isTheater.value = !isTheater.value;
    emit('theaterchange', isTheater.value);
}

// 9. Auto Hide Controls Timer
function resetControlsTimer() {
    if (controlsTimeout.value) clearTimeout(controlsTimeout.value);
    showControls.value = true;

    if (isPlaying.value && !showSettings.value && !showQualityMenu.value && !showAudioSpeedMenu.value) {
        controlsTimeout.value = setTimeout(() => {
            if (isPlaying.value && !isDragging.value) {
                showControls.value = false;
            }
        }, props.autoHideDelay);
    }
}

function onPlayerMouseMove() {
    resetControlsTimer();
}

function onPlayerMouseLeave() {
    if (isPlaying.value && !showSettings.value && !showQualityMenu.value && !showAudioSpeedMenu.value && !isDragging.value) {
        showControls.value = false;
    }
}

// 10. Scrubber Interaction Handler
function calculateProgressFromEvent(e, targetBar) {
    if (!targetBar) return 0;
    const rect = targetBar.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (offsetX / rect.width);
}

function onProgressBarMouseMove(e) {
    const bar = e.currentTarget || progressBarRef.value || audioProgressBarRef.value;
    const ratio = calculateProgressFromEvent(e, bar);
    hoverPosition.value = ratio * 100;
    hoverTime.value = ratio * (duration.value || 0);
}

function onProgressBarMouseLeave() {
    if (!isDragging.value) {
        hoverTime.value = null;
    }
}

function onProgressBarMouseDown(e) {
    e.preventDefault();
    isDragging.value = true;
    const bar = e.currentTarget || progressBarRef.value || audioProgressBarRef.value;
    const ratio = calculateProgressFromEvent(e, bar);
    seek(ratio * (duration.value || 0));

    function onMouseMoveDoc(ev) {
        if (!isDragging.value) return;
        const moveRatio = calculateProgressFromEvent(ev, bar);
        currentTime.value = moveRatio * (duration.value || 0);
        emit('seeking', currentTime.value);
    }

    function onMouseUpDoc(ev) {
        if (isDragging.value) {
            isDragging.value = false;
            hoverTime.value = null;
            const finalRatio = calculateProgressFromEvent(ev, bar);
            seek(finalRatio * (duration.value || 0));
            document.removeEventListener('mousemove', onMouseMoveDoc);
            document.removeEventListener('mouseup', onMouseUpDoc);
        }
    }

    document.addEventListener('mousemove', onMouseMoveDoc);
    document.addEventListener('mouseup', onMouseUpDoc);
}

function onProgressBarTouchStart(e) {
    isDragging.value = true;
    const bar = e.currentTarget || progressBarRef.value || audioProgressBarRef.value;
    const ratio = calculateProgressFromEvent(e, bar);
    seek(ratio * (duration.value || 0));
}

function onProgressBarTouchMove(e) {
    if (!isDragging.value) return;
    const bar = e.currentTarget || progressBarRef.value || audioProgressBarRef.value;
    const ratio = calculateProgressFromEvent(e, bar);
    currentTime.value = ratio * (duration.value || 0);
    emit('seeking', currentTime.value);
}

function onProgressBarTouchEnd() {
    isDragging.value = false;
    seek(currentTime.value);
}

// 11. Gesture Double Tap Handler (Mobile YouTube style)
function handleScreenTap(e) {
    if (props.type === 'audio') return;
    const now = Date.now();
    const rect = playerContainer.value?.getBoundingClientRect();
    if (!rect) {
        togglePlay();
        return;
    }

    const clickX = e.clientX - rect.left;
    const isLeft = clickX < rect.width / 2;
    const currentSide = isLeft ? 'left' : 'right';

    if (now - lastTapTime < 320 && lastTapSide === currentSide) {
        if (isLeft) {
            rewind(10);
            doubleTapLeftActive.value = true;
            setTimeout(() => { doubleTapLeftActive.value = false; }, 600);
        } else {
            forward(10);
            doubleTapRightActive.value = true;
            setTimeout(() => { doubleTapRightActive.value = false; }, 600);
        }
        lastTapTime = 0;
        lastTapSide = null;
        return;
    }

    lastTapTime = now;
    lastTapSide = currentSide;
    setTimeout(() => {
        if (lastTapTime === now) {
            togglePlay();
        }
    }, 280);
}

// 12. Keyboard Shortcuts Handler (YouTube style)
function handleKeyDown(e) {
    if (!props.keyboardShortcuts) return;
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
        return;
    }

    switch (e.code) {
        case 'Space':
        case 'KeyK':
            e.preventDefault();
            togglePlay();
            resetControlsTimer();
            break;
        case 'ArrowLeft':
        case 'KeyJ':
            e.preventDefault();
            rewind(e.shiftKey ? 5 : 10);
            resetControlsTimer();
            break;
        case 'ArrowRight':
        case 'KeyL':
            e.preventDefault();
            forward(e.shiftKey ? 5 : 10);
            resetControlsTimer();
            break;
        case 'ArrowUp':
            e.preventDefault();
            setVolume(Math.min(1, volume.value + 0.05));
            resetControlsTimer();
            break;
        case 'ArrowDown':
            e.preventDefault();
            setVolume(Math.max(0, volume.value - 0.05));
            resetControlsTimer();
            break;
        case 'KeyM':
            e.preventDefault();
            toggleMute();
            resetControlsTimer();
            break;
        case 'KeyF':
            e.preventDefault();
            toggleFullscreen();
            break;
        case 'KeyT':
            e.preventDefault();
            toggleTheater();
            break;
        case 'KeyI':
            e.preventDefault();
            togglePiP();
            break;
        case 'Digit0':
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
            if (duration.value > 0) {
                e.preventDefault();
                const pct = parseInt(e.key) * 10;
                seek((pct / 100) * duration.value);
                resetControlsTimer();
            }
            break;
    }
}

// 13. Media Native Event Listeners
function onMediaPlay() {
    isPlaying.value = true;
    isBuffering.value = false;
    isEnded.value = false;
    resetControlsTimer();
    emit('play');
}

function onMediaPause() {
    isPlaying.value = false;
    showControls.value = true;
    emit('pause');
}

function onMediaEnded() {
    isPlaying.value = false;
    isEnded.value = true;
    showControls.value = true;
    emit('ended');
}

function onMediaTimeUpdate() {
    if (!mediaRef.value || isDragging.value) return;
    currentTime.value = mediaRef.value.currentTime;

    if (mediaRef.value.buffered && mediaRef.value.buffered.length > 0 && duration.value > 0) {
        try {
            const bufferedEnd = mediaRef.value.buffered.end(mediaRef.value.buffered.length - 1);
            bufferedPercent.value = Math.min(100, (bufferedEnd / duration.value) * 100);
        } catch (e) {}
    }
    emit('timeupdate', currentTime.value);
}

function onMediaLoadedMetadata() {
    if (!mediaRef.value) return;
    duration.value = mediaRef.value.duration || 0;
    isBuffering.value = false;
}

function onMediaWaiting() {
    isBuffering.value = true;
}

function onMediaPlaying() {
    isBuffering.value = false;
}

function onMediaError(e) {
    isBuffering.value = false;
    isPlaying.value = false;
    hasError.value = true;
    const mediaErr = mediaRef.value?.error;
    errorMessage.value = mediaErr ? (mediaErr.message || `Kode kesalahan berkas media (${mediaErr.code})`) : 'Berkas video tidak dapat dimuat';
    emit('error', e);
}

// 14. Fullscreen Change Observer
function onFullscreenChangeDoc() {
    isFullscreen.value = !!(document.fullscreenElement || document.webkitFullscreenElement);
    emit('fullscreenchange', isFullscreen.value);
}

// 15. Native Src Computed Helper (HLS vs Native)
const nativeVideoSrc = computed(() => {
    const primary = getPrimarySrc();
    if (!primary) return undefined;
    const isHls = isHlsStream(primary) || (Array.isArray(props.src) && props.src.some((s) => s.type?.includes('mpegURL') || isHlsStream(s.src)));
    if (isHls) {
        if (typeof document !== 'undefined') {
            const v = document.createElement('video');
            if (v.canPlayType('application/vnd.apple.mpegurl')) {
                return currentActiveSrc.value || primary;
            }
        }
        return undefined; // Hls.js mengelola buffer MediaSource
    }
    return currentActiveSrc.value || primary;
});

const nativeAudioSrc = computed(() => {
    const primary = getPrimarySrc();
    return currentActiveSrc.value || primary || undefined;
});

async function initMediaSource() {
    if (!mediaRef.value) return;

    const srcUrl = getPrimarySrc();
    if (!srcUrl) return;

    const isHls = isHlsStream(srcUrl) || (Array.isArray(props.src) && props.src.some((s) => s.type?.includes('mpegURL') || isHlsStream(s.src)));

    destroyHls();
    hasError.value = false;
    errorMessage.value = '';

    if (isHls && props.type !== 'audio') {
        isHlsActive.value = true;
        // Safari & iOS WebKit
        if (mediaRef.value.canPlayType('application/vnd.apple.mpegurl')) {
            currentActiveSrc.value = srcUrl;
            mediaRef.value.src = srcUrl;
            mediaRef.value.load();
        } else {
            // Chrome, Firefox, Edge, Android via Hls.js
            try {
                isBuffering.value = true;
                const Hls = await loadHlsLib();
                if (Hls && Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: props.type === 'live',
                        backBufferLength: 90,
                    });

                    hlsInstance.loadSource(srcUrl);
                    hlsInstance.attachMedia(mediaRef.value);

                    hlsInstance.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                        isBuffering.value = false;
                        hasError.value = false;
                        if (data && data.levels && data.levels.length > 0) {
                            const levelsMap = [];
                            data.levels.forEach((lvl, idx) => {
                                const label = lvl.height ? `${lvl.height}p` : `Level ${idx + 1}`;
                                levelsMap.push({
                                    index: idx,
                                    height: lvl.height,
                                    bitrate: lvl.bitrate,
                                    name: label,
                                });
                            });
                            hlsLevels.value = levelsMap;
                        }
                        if (props.autoplay) {
                            play();
                        }
                    });

                    hlsInstance.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
                        if (data.level === -1) {
                            activeQuality.value = 'Auto';
                        } else if (hlsLevels.value[data.level]) {
                            activeQuality.value = hlsLevels.value[data.level].name;
                        }
                    });

                    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
                        if (data.fatal) {
                            isBuffering.value = false;
                            hasError.value = true;
                            errorMessage.value = `Gagal streaming HLS: ${data.details || 'Jaringan bermasalah'}`;
                        }
                    });
                } else {
                    currentActiveSrc.value = srcUrl;
                    mediaRef.value.src = srcUrl;
                    mediaRef.value.load();
                }
            } catch (err) {
                console.error('[MediaPlayer] Gagal memuat Hls.js:', err);
                currentActiveSrc.value = srcUrl;
                mediaRef.value.src = srcUrl;
                mediaRef.value.load();
            }
        }
    } else {
        isHlsActive.value = false;
        // Cek resolusi target awal jika activeQuality bukan 'Auto'
        let chosen = srcUrl;
        const lowerQ = activeQuality.value?.toLowerCase()?.trim();
        if (lowerQ && lowerQ !== 'auto' && parsedQualitySources.value[lowerQ]) {
            chosen = parsedQualitySources.value[lowerQ].src;
        }
        currentActiveSrc.value = chosen;
        mediaRef.value.src = chosen;
        mediaRef.value.load();
    }
}

function destroyHls() {
    if (hlsInstance) {
        try {
            hlsInstance.destroy();
        } catch (e) {}
        hlsInstance = null;
    }
    hlsLevels.value = [];
    isHlsActive.value = false;
}

// Reactive Watchers for Props
watch(() => props.volume, (val) => {
    if (typeof val === 'number' && !isNaN(val)) setVolume(val);
});
watch(() => props.muted, (val) => {
    isMuted.value = val;
    if (mediaRef.value) mediaRef.value.muted = val;
});
watch(() => props.playbackRate, (val) => {
    if (typeof val === 'number' && !isNaN(val)) setPlaybackRate(val);
});
watch(() => props.quality, (val) => {
    if (val && val !== activeQuality.value) setQuality(val);
});
watch(() => props.defaultQuality, (val) => {
    if (val && activeQuality.value === 'Auto') setQuality(val);
});
watch(() => [props.src, props.type], () => {
    currentTime.value = 0;
    isPlaying.value = false;
    hasError.value = false;
    initMediaSource();
    if (props.type === 'audio') {
        startSpectrumAnimation();
    } else {
        stopSpectrumAnimation();
    }
});

// Lifecycle Mount & Cleanups
onMounted(() => {
    document.addEventListener('fullscreenchange', onFullscreenChangeDoc);
    document.addEventListener('webkitfullscreenchange', onFullscreenChangeDoc);
    if (props.keyboardShortcuts) {
        window.addEventListener('keydown', handleKeyDown);
    }
    initMediaSource();
    if (props.type === 'audio') {
        startSpectrumAnimation();
    }
});

onBeforeUnmount(() => {
    stopSpectrumAnimation();
    if (audioCtx && audioCtx.state !== 'closed') {
        try { audioCtx.close(); } catch (e) {}
    }
    destroyHls();
    document.removeEventListener('fullscreenchange', onFullscreenChangeDoc);
    document.removeEventListener('webkitfullscreenchange', onFullscreenChangeDoc);
    if (controlsTimeout.value) clearTimeout(controlsTimeout.value);
    if (qualityToast.value && qualityToast.value.timer) clearTimeout(qualityToast.value.timer);
    if (props.keyboardShortcuts) {
        window.removeEventListener('keydown', handleKeyDown);
    }
});

// Expose public API
defineExpose({
    mediaElement: mediaRef,
    playerContainer,
    hlsInstance: () => hlsInstance,
    isHlsActive,
    availableQualities,
    showQualityMenu,
    isHdQuality,
    qualityToast,
    qualitySources: () => parsedQualitySources.value,
    currentActiveSrc,
    play,
    pause,
    togglePlay,
    seek,
    forward,
    rewind,
    setVolume,
    mute: () => { if (!isMuted.value) toggleMute(); },
    unmute: () => { if (isMuted.value) toggleMute(); },
    toggleMute,
    setPlaybackRate,
    setQuality,
    toggleFullscreen,
    togglePiP,
    toggleTheater,
    currentTime,
    duration,
    isPlaying,
    isBuffering,
    isMuted,
    volume,
    playbackRate: currentPlaybackRate,
    activeQuality,
    isFullscreen,
    isPiP,
    isTheater,
    spectrumData,
    peaksData,
    activeSpectrumMode,
    setSpectrumMode,
    isLooping,
    toggleLoop,
    isShuffle,
    isFavorited,
    toggleShuffle: () => { isShuffle.value = !isShuffle.value; },
    toggleFavorite: () => { isFavorited.value = !isFavorited.value; },
});
</script>

<template>
    <div
        ref="playerContainer"
        tabindex="0"
        role="region"
        aria-label="Media Player"
        class="relative overflow-hidden select-none outline-none group/player font-sans transition-all duration-300"
        :class="[
            forcedThemeClass,
            variantClasses,
            aspectRatioClass,
            isTheater ? 'max-w-none! w-full! rounded-none! z-30 shadow-2xl' : '',
            isFullscreen ? 'fixed! inset-0! z-50! w-screen! h-screen! rounded-none!' : '',
        ]"
        @mousemove="onPlayerMouseMove"
        @mouseleave="onPlayerMouseLeave"
    >
        <!-- 1. HTML5 Video / Audio Element -->
        <video
            v-if="type === 'video' || type === 'live'"
            ref="mediaRef"
            class="w-full h-full object-cover cursor-pointer block bg-black transition-all duration-300"
            :src="nativeVideoSrc"
            :poster="poster"
            :autoplay="autoplay"
            :loop="loop"
            :muted="muted"
            :preload="preload"
            :style="videoQualityStyle"
            playsinline
            @play="onMediaPlay"
            @pause="onMediaPause"
            @ended="onMediaEnded"
            @timeupdate="onMediaTimeUpdate"
            @loadedmetadata="onMediaLoadedMetadata"
            @waiting="onMediaWaiting"
            @playing="onMediaPlaying"
            @error="onMediaError"
            @click="handleScreenTap"
        >
            <track
                v-for="(track, idx) in tracks"
                :key="idx"
                :src="track.src"
                :kind="track.kind || 'subtitles'"
                :srclang="track.srclang || 'en'"
                :label="track.label || 'English'"
                :default="track.default"
            />
        </video>

        <audio
            v-else
            ref="mediaRef"
            class="hidden"
            :src="nativeAudioSrc"
            :autoplay="autoplay"
            :loop="loop"
            :muted="muted"
            :preload="preload"
            @play="onMediaPlay"
            @pause="onMediaPause"
            @ended="onMediaEnded"
            @timeupdate="onMediaTimeUpdate"
            @loadedmetadata="onMediaLoadedMetadata"
            @waiting="onMediaWaiting"
            @playing="onMediaPlaying"
            @error="onMediaError"
        >
            <source
                v-if="Array.isArray(src)"
                v-for="(source, idx) in src"
                :key="idx"
                :src="source.src"
                :type="source.type || 'audio/mpeg'"
            />
        </audio>

        <!-- 2. Khusus Audio Player Visual Canvas & Responsive Spectrum Studio (Spotify Style) -->
        <template v-if="type === 'audio'">
            <!-- 2.1 Mode Pill (Ultra-compact Floating Audio Pill - Apple Dynamic Island / Spotify Style) -->
            <div
                v-if="variant === 'pill'"
                class="w-full relative flex flex-col justify-between overflow-hidden rounded-full bg-slate-900/95 dark:bg-slate-950/95 text-white shadow-2xl backdrop-blur-2xl border border-white/15 transition-all duration-300 select-none group/pill"
            >
                <div class="w-full flex items-center justify-between gap-2 sm:gap-4 py-2 px-3 sm:px-4 z-10">
                    <!-- Sisi Kiri: Artwork & Info Lagu -->
                    <div class="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
                        <!-- Round Rotating Disc Poster -->
                        <div class="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 border border-white/20 shadow-md bg-slate-800 flex items-center justify-center">
                            <img
                                v-if="poster"
                                :src="poster"
                                :alt="title || 'Audio Art'"
                                class="w-full h-full object-cover"
                                :class="isPlaying ? 'animate-spin [animation-duration:5s]' : ''"
                            />
                            <span v-else class="material-symbols-outlined text-lg text-slate-300">music_note</span>
                            <!-- Vinyl Center Pin Point -->
                            <div class="absolute inset-0 m-auto w-2 h-2 rounded-full bg-slate-900 border border-white/40 pointer-events-none"></div>
                        </div>

                        <!-- Track Title & Artist -->
                        <div class="min-w-0 max-w-32.5 sm:max-w-45 lg:max-w-55">
                            <p class="text-xs sm:text-sm font-semibold text-white truncate leading-tight tracking-tight">{{ title || 'Audio Track' }}</p>
                            <p class="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5">{{ artist || 'Artis' }}</p>
                        </div>

                        <!-- Spotify-style Heart Favorite Button -->
                        <button
                            type="button"
                            class="w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer outline-none focus:outline-none ring-0 border-none shrink-0 max-xs:hidden"
                            :class="isFavorited ? 'text-rose-500' : 'text-slate-400 hover:text-white'"
                            :title="isFavorited ? 'Hapus dari Favorit' : 'Tambah ke Favorit'"
                            @click="isFavorited = !isFavorited"
                        >
                            <span class="material-symbols-outlined text-base">
                                {{ isFavorited ? 'favorite' : 'favorite_border' }}
                            </span>
                        </button>
                    </div>

                    <!-- Sisi Tengah: Transport Controls (Rewind 10s, Play/Pause Bulat Mewah, Forward 10s) -->
                    <div class="flex items-center gap-1 sm:gap-2 shrink-0">
                        <button
                            type="button"
                            class="w-7 h-7 rounded-full text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer outline-none focus:outline-none ring-0 border-none max-sm:hidden"
                            title="Mundur 10 detik"
                            @click="rewind(10)"
                        >
                            <span class="material-symbols-outlined text-lg">replay_10</span>
                        </button>

                        <!-- Clean Play/Pause Button (Tanpa double border/ring) -->
                        <button
                            type="button"
                            class="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg transition-transform hover:scale-105 active:scale-95 outline-none focus:outline-none ring-0 border-none"
                            :class="themeColorClasses.accent"
                            :title="isPlaying ? 'Jeda Audio' : 'Putar Audio'"
                            @click="togglePlay"
                        >
                            <span class="material-symbols-outlined text-xl sm:text-2xl" :class="isPlaying ? '' : 'translate-x-0.5'">
                                {{ isPlaying ? 'pause' : 'play_arrow' }}
                            </span>
                        </button>

                        <button
                            type="button"
                            class="w-7 h-7 rounded-full text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer outline-none focus:outline-none ring-0 border-none max-sm:hidden"
                            title="Maju 10 detik"
                            @click="forward(10)"
                        >
                            <span class="material-symbols-outlined text-lg">forward_10</span>
                        </button>

                        <!-- Equalizer Animasi Halus (Spectrum) -->
                        <div v-if="spectrum" class="hidden md:flex items-end gap-1 h-5 px-2 shrink-0">
                            <div
                                v-for="idx in 8"
                                :key="idx"
                                class="w-1 rounded-full transition-all duration-75"
                                :class="themeColorClasses.accent"
                                :style="{
                                    height: `${Math.max(15, (spectrumData[idx * 3] || 25))}%`,
                                    opacity: isPlaying ? 0.95 : 0.35,
                                }"
                            ></div>
                        </div>
                    </div>

                    <!-- Sisi Kanan: Waktu & Volume -->
                    <div class="flex items-center gap-1.5 sm:gap-2.5 shrink-0 text-slate-300 font-mono text-[11px] tabular-nums">
                        <span class="text-white font-medium">{{ displayCurrentTime }}</span>
                        <span class="text-slate-500">/</span>
                        <button
                            type="button"
                            class="hover:text-white transition-colors cursor-pointer outline-none focus:outline-none ring-0 border-none"
                            title="Klik beralih waktu tersisa"
                            @click="showRemainingTime = !showRemainingTime"
                        >
                            {{ displayDuration }}
                        </button>

                        <div class="relative flex items-center">
                            <button
                                type="button"
                                class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer transition-colors outline-none focus:outline-none ring-0 border-none"
                                :title="isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'"
                                @click="toggleMute"
                            >
                                <span class="material-symbols-outlined text-lg">{{ volumeIcon }}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Micro Scrubber Bar di sepanjang tepi bawah kapsul Pill -->
                <div
                    class="w-full h-1 group-hover/pill:h-1.5 bg-white/10 cursor-pointer transition-all duration-150 relative flex items-center"
                    title="Geser durasi"
                    @mousemove="onProgressBarMouseMove"
                    @mouseleave="onProgressBarMouseLeave"
                    @mousedown="onProgressBarMouseDown"
                    @touchstart.passive="onProgressBarTouchStart"
                    @touchmove.passive="onProgressBarTouchMove"
                    @touchend="onProgressBarTouchEnd"
                >
                    <div
                        class="absolute left-0 top-0 bottom-0 bg-white/20 pointer-events-none transition-all duration-150"
                        :style="{ width: `${bufferedPercent}%` }"
                    ></div>
                    <div
                        class="absolute left-0 top-0 bottom-0 pointer-events-none transition-all duration-75"
                        :class="themeColorClasses.accent"
                        :style="{ width: `${progressPercent}%` }"
                    ></div>
                    <div
                        class="absolute w-2.5 h-2.5 rounded-full bg-white shadow-md -translate-x-1/2 pointer-events-none transition-transform scale-0 group-hover/pill:scale-100"
                        :style="{ left: `${progressPercent}%` }"
                    ></div>
                </div>
            </div>

            <!-- 2.2 Mode Full Card / Studio (Desktop, Tablet & Mobile Responsive) -->
            <div
                v-else
                class="w-full h-full p-4 sm:p-6 lg:p-7 flex flex-col justify-between bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl relative overflow-hidden transition-colors duration-200"
            >
                <!-- Background Ambient Glow -->
                <div class="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary-500/10 dark:bg-primary-600/15 blur-3xl pointer-events-none"></div>
                <div class="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/10 dark:bg-indigo-600/10 blur-3xl pointer-events-none"></div>

                <!-- 2.2.1 Header: Artwork / Cassette + Spacious Title/Artist + Mode Toggle -->
                <div class="flex items-center justify-between gap-3 sm:gap-5 z-10">
                    <div class="flex items-center min-w-0 flex-1">
                        <!-- Dedicated Cassette / Vinyl Container with guaranteed clearance -->
                        <div class="relative flex items-center shrink-0 w-28 sm:w-36 h-16 sm:h-20 select-none mr-3 sm:mr-5">
                            <!-- Cassette / Vinyl Record Disc (slides out smoothly when playing) -->
                            <div
                                v-if="showVinyl"
                                class="absolute left-2 sm:left-3 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-950 border-2 border-slate-700/80 shadow-2xl transition-all duration-700 ease-out flex items-center justify-center pointer-events-none overflow-hidden z-0"
                                :class="[
                                    isPlaying ? 'translate-x-8 sm:translate-x-12 rotate-0 opacity-100' : 'translate-x-0 rotate-[-45deg] opacity-60',
                                ]"
                            >
                                <div
                                    class="w-full h-full rounded-full flex items-center justify-center bg-[radial-gradient(circle,transparent_20%,rgba(255,255,255,0.08)_21%,transparent_22%,rgba(255,255,255,0.08)_35%,transparent_36%,rgba(255,255,255,0.08)_50%,transparent_51%,rgba(255,255,255,0.08)_65%,transparent_66%,rgba(255,255,255,0.08)_80%)]"
                                    :class="isPlaying ? 'animate-spin [animation-duration:3.5s]' : ''"
                                >
                                    <!-- Vinyl Center Spindle Label -->
                                    <div
                                        class="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-black/40 shadow-inner flex items-center justify-center"
                                        :class="themeColorClasses.accent"
                                    >
                                        <div class="w-1.5 h-1.5 rounded-full bg-slate-950"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Album / Cassette Artwork Sleeve -->
                            <slot name="audio-artwork">
                                <div class="relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-2xl border border-slate-200/60 dark:border-white/15 shrink-0 bg-slate-800 flex items-center justify-center">
                                    <img
                                        v-if="poster"
                                        :src="poster"
                                        :alt="title || 'Album Artwork'"
                                        class="w-full h-full object-cover"
                                    />
                                    <div v-else class="w-full h-full bg-linear-to-br from-slate-700 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-1 text-slate-300">
                                        <span class="material-symbols-outlined text-2xl text-slate-300">album</span>
                                        <span class="text-[8px] font-mono tracking-widest mt-0.5 opacity-60">CASSETTE</span>
                                    </div>
                                    <div
                                        v-if="isPlaying"
                                        class="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-black animate-pulse"
                                        title="Sedang Memutar"
                                    ></div>
                                </div>
                            </slot>
                        </div>

                        <!-- Track Metadata (Spacious, safe distance from cassette/vinyl!) -->
                        <div class="min-w-0 flex-1">
                            <div class="flex items-center gap-2">
                                <slot name="title">
                                    <h4 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate leading-tight tracking-tight hover:underline cursor-pointer">
                                        {{ title || 'Audio Track' }}
                                    </h4>
                                </slot>
                                <!-- Heart / Favorite Button (Spotify style) -->
                                <button
                                    type="button"
                                    class="text-slate-400 hover:text-emerald-500 transition-colors p-0.5 cursor-pointer shrink-0"
                                    :class="isFavorited ? 'text-emerald-500!' : ''"
                                    :title="isFavorited ? 'Hapus dari Favorit' : 'Simpan ke Favorit'"
                                    @click="isFavorited = !isFavorited"
                                >
                                    <span class="material-symbols-outlined text-lg leading-none" :style="isFavorited ? { fontVariationSettings: '\'FILL\' 1' } : {}">
                                        {{ isFavorited ? 'favorite' : 'favorite_border' }}
                                    </span>
                                </button>
                            </div>
                            <slot name="artist">
                                <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                                    {{ artist || 'Artis / Kreator' }}
                                </p>
                            </slot>
                            <!-- Audio Badges -->
                            <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    STEREO
                                </span>
                                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/5">
                                    44.1 kHz
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Spectrum Mode Switcher -->
                    <div v-if="spectrum" class="flex items-center p-0.5 rounded-lg bg-slate-200/80 dark:bg-black/40 border border-slate-300/80 dark:border-white/10 shrink-0 self-start sm:self-center">
                        <button
                            type="button"
                            class="px-2 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer"
                            :class="activeSpectrumMode === 'bars' ? [themeColorClasses.accent, 'text-white shadow-xs'] : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
                            title="Mode Spektrum Bars"
                            @click="setSpectrumMode('bars')"
                        >
                            BARS
                        </button>
                        <button
                            type="button"
                            class="px-2 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer"
                            :class="activeSpectrumMode === 'wave' ? [themeColorClasses.accent, 'text-white shadow-xs'] : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
                            title="Mode Spektrum Wave"
                            @click="setSpectrumMode('wave')"
                        >
                            WAVE
                        </button>
                        <button
                            type="button"
                            class="px-2 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer"
                            :class="activeSpectrumMode === 'mirror' ? [themeColorClasses.accent, 'text-white shadow-xs'] : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
                            title="Mode Spektrum Mirror"
                            @click="setSpectrumMode('mirror')"
                        >
                            MIRROR
                        </button>
                    </div>
                </div>

                <!-- 2.2.2 Center: Audio Spectrum Visualizer Studio Rack -->
                <slot name="audio-spectrum" :spectrum-data="spectrumData" :mode="activeSpectrumMode" :is-playing="isPlaying">
                    <div
                        v-if="spectrum"
                        class="w-full my-3 sm:my-4 p-2.5 sm:p-3 rounded-xl bg-slate-100/90 dark:bg-slate-950/80 border border-slate-200/90 dark:border-white/10 shadow-inner flex flex-col justify-between relative overflow-hidden backdrop-blur-md"
                    >
                        <!-- Grid Overlay -->
                        <div class="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

                        <!-- Top Info Bar -->
                        <div class="flex items-center justify-between text-[9px] font-mono text-slate-500 dark:text-slate-400 mb-1 z-10 select-none">
                            <span class="flex items-center gap-1.5">
                                <span class="w-1.5 h-1.5 rounded-full" :class="isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400 dark:bg-slate-600'"></span>
                                FREQUENCY SPECTRUM ANALYZER
                            </span>
                            <span class="text-slate-600 dark:text-slate-400 font-semibold tracking-wider uppercase">
                                {{ activeSpectrumMode }}
                            </span>
                        </div>

                        <!-- Responsive Spectrum Bars -->
                        <div
                            class="h-20 sm:h-28 w-full flex justify-between gap-[2px] sm:gap-[3px] px-1 relative z-10"
                            :class="activeSpectrumMode === 'mirror' ? 'items-center' : 'items-end'"
                        >
                            <template v-for="(val, idx) in spectrumData" :key="idx">
                                <div
                                    class="relative flex-1 min-w-[2px] max-w-[8px] sm:max-w-[10px] h-full transition-all duration-75 flex flex-col"
                                    :class="[
                                        idx >= 32 ? 'hidden lg:flex' : (idx >= 24 ? 'hidden sm:flex' : 'flex'),
                                        activeSpectrumMode === 'mirror' ? 'justify-center items-center' : 'justify-end items-center'
                                    ]"
                                >
                                    <!-- Peak Hold Dot / Tick (Bars Mode) -->
                                    <div
                                        v-if="activeSpectrumMode === 'bars'"
                                        class="absolute w-full h-[2px] rounded-full bg-slate-900/80 dark:bg-white/90 shadow-xs pointer-events-none transition-[bottom] duration-100 ease-out"
                                        :style="{ bottom: `${peaksData[idx] || val}%` }"
                                    ></div>

                                    <!-- Frequency Bar -->
                                    <div
                                        class="w-full transition-[height] duration-75 ease-out"
                                        :class="[
                                            activeSpectrumMode === 'mirror' ? 'rounded-full' : (activeSpectrumMode === 'wave' ? 'rounded-full' : 'rounded-t-sm'),
                                            themeColorClasses.accent,
                                        ]"
                                        :style="{
                                            height: `${Math.max(4, val)}%`,
                                            opacity: isPlaying ? 0.95 : 0.45,
                                        }"
                                    ></div>
                                </div>
                            </template>
                        </div>

                        <!-- Frequency Scale Markers -->
                        <div class="flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-slate-500 dark:text-slate-500 pt-1 mt-1 border-t border-slate-200 dark:border-white/5 z-10 select-none">
                            <span>20Hz</span>
                            <span>100Hz</span>
                            <span class="hidden sm:inline">500Hz</span>
                            <span>1kHz</span>
                            <span class="hidden sm:inline">4kHz</span>
                            <span>16kHz</span>
                        </div>
                    </div>
                </slot>

                <!-- 2.2.3 Bottom: Spotify-Style Audio Player Controls -->
                <div v-if="controls" class="flex flex-col gap-2.5 z-10 pt-2">
                    <!-- Spotify Progress Scrubber Row (Timestamp Left - Slider - Timestamp Right) -->
                    <div class="flex items-center gap-2.5 sm:gap-3 w-full">
                        <!-- Current Time -->
                        <span class="text-[11px] font-mono text-slate-600 dark:text-slate-400 min-w-9 text-right select-none">
                            {{ displayCurrentTime }}
                        </span>

                        <!-- Scrubber Bar -->
                        <div
                            ref="audioProgressBarRef"
                            class="relative flex-1 h-1 hover:h-1.5 bg-slate-200 dark:bg-white/20 rounded-full cursor-pointer transition-all duration-150 group/audiobar flex items-center"
                            role="slider"
                            :aria-valuenow="currentTime"
                            aria-valuemin="0"
                            :aria-valuemax="duration || 0"
                            aria-label="Progress bar audio"
                            @mousemove="onProgressBarMouseMove"
                            @mouseleave="onProgressBarMouseLeave"
                            @mousedown="onProgressBarMouseDown"
                            @touchstart.passive="onProgressBarTouchStart"
                            @touchmove.passive="onProgressBarTouchMove"
                            @touchend="onProgressBarTouchEnd"
                        >
                            <!-- Buffered Bar -->
                            <div
                                class="absolute left-0 top-0 bottom-0 bg-slate-300 dark:bg-white/20 rounded-full pointer-events-none"
                                :style="{ width: `${bufferedPercent}%` }"
                            ></div>

                            <!-- Playback Fill -->
                            <div
                                class="absolute left-0 top-0 bottom-0 rounded-full pointer-events-none transition-all duration-75"
                                :class="themeColorClasses.accent"
                                :style="{ width: `${progressPercent}%` }"
                            ></div>

                            <!-- Knob -->
                            <div
                                class="absolute w-3 h-3 rounded-full bg-slate-800 dark:bg-white shadow-md -translate-x-1/2 pointer-events-none transition-transform opacity-0 group-hover/audiobar:opacity-100"
                                :class="isDragging ? 'scale-125 opacity-100' : ''"
                                :style="{ left: `${progressPercent}%` }"
                            ></div>

                            <!-- Hover Tooltip -->
                            <div
                                v-if="hoverTime !== null"
                                class="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 text-white text-[10px] font-mono font-bold pointer-events-none shadow-lg border border-white/10"
                                :style="{ left: `${hoverPosition}%` }"
                            >
                                {{ formatTime(hoverTime) }}
                            </div>
                        </div>

                        <!-- Duration Time (clickable to toggle remaining) -->
                        <button
                            type="button"
                            class="text-[11px] font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer min-w-9 select-none"
                            title="Klik untuk beralih waktu sisa"
                            @click="showRemainingTime = !showRemainingTime"
                        >
                            {{ displayDuration }}
                        </button>
                    </div>

                    <!-- Spotify Main Control Toolbar (3-column layout) -->
                    <div class="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                        <!-- Left: Secondary Controls (Equalizer Toggle) -->
                        <div class="flex items-center gap-1">
                            <button
                                type="button"
                                class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10"
                                :class="spectrum ? [themeColorClasses.text] : ''"
                                :title="spectrum ? 'Sembunyikan Visualizer' : 'Tampilkan Visualizer'"
                                @click="emit('toggle-spectrum')"
                            >
                                <span class="material-symbols-outlined text-lg">graphic_eq</span>
                            </button>
                        </div>

                        <!-- Center: Spotify Core Playback Cluster -->
                        <div class="flex items-center gap-2 sm:gap-4 mx-auto">
                            <!-- Shuffle Button -->
                            <button
                                type="button"
                                class="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                                :class="isShuffle ? [themeColorClasses.text] : 'text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'"
                                :title="isShuffle ? 'Acak Lagu Aktif' : 'Acak Lagu Nonaktif'"
                                @click="isShuffle = !isShuffle"
                            >
                                <span class="material-symbols-outlined text-lg">shuffle</span>
                            </button>

                            <!-- Rewind 10s -->
                            <button
                                type="button"
                                class="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                title="Mundur 10 detik"
                                @click="rewind(10)"
                            >
                                <span class="material-symbols-outlined text-xl">replay_10</span>
                            </button>

                            <!-- Main Play/Pause Button (Spotify circular button) -->
                            <button
                                type="button"
                                class="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ring-4"
                                :class="[
                                    themeColorClasses.accent,
                                    'text-white',
                                    isPlaying ? 'ring-primary-500/30' : 'ring-transparent'
                                ]"
                                :title="isPlaying ? 'Jeda Audio (Space)' : 'Putar Audio (Space)'"
                                @click="togglePlay"
                            >
                                <span class="material-symbols-outlined text-2xl sm:text-3xl" :class="isPlaying ? '' : 'translate-x-0.5'">
                                    {{ isPlaying ? 'pause' : 'play_arrow' }}
                                </span>
                            </button>

                            <!-- Forward 10s -->
                            <button
                                type="button"
                                class="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                title="Maju 10 detik"
                                @click="forward(10)"
                            >
                                <span class="material-symbols-outlined text-xl">forward_10</span>
                            </button>

                            <!-- Loop / Repeat Button -->
                            <button
                                type="button"
                                class="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                                :class="isLooping ? [themeColorClasses.text] : 'text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'"
                                :title="isLooping ? 'Putar Ulang Aktif' : 'Putar Ulang Nonaktif'"
                                @click="toggleLoop"
                            >
                                <span class="material-symbols-outlined text-lg">
                                    {{ isLooping ? 'repeat_one' : 'repeat' }}
                                </span>
                            </button>
                        </div>

                        <!-- Right: Speed & Volume Controls -->
                        <div class="flex items-center gap-1.5 sm:gap-2">
                            <!-- Playback Rate Pill -->
                            <div class="relative">
                                <button
                                    type="button"
                                    class="px-2 py-1 rounded-md text-[11px] font-mono font-semibold transition-colors cursor-pointer flex items-center gap-0.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10"
                                    title="Kecepatan Putar Audio"
                                    @click="showAudioSpeedMenu = !showAudioSpeedMenu"
                                >
                                    <span>{{ currentPlaybackRate }}x</span>
                                </button>
                                <div
                                    v-if="showAudioSpeedMenu"
                                    class="absolute right-0 bottom-9 z-40 w-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1.5 shadow-2xl grid grid-cols-3 gap-1 text-[11px]"
                                >
                                    <button
                                        v-for="r in playbackRates"
                                        :key="r"
                                        type="button"
                                        class="py-1 rounded font-mono font-bold transition-colors cursor-pointer text-center"
                                        :class="currentPlaybackRate === r ? [themeColorClasses.accent, 'text-white'] : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'"
                                        @click="setPlaybackRate(r); showAudioSpeedMenu = false"
                                    >
                                        {{ r }}x
                                    </button>
                                </div>
                            </div>

                            <!-- Volume Controller -->
                            <div
                                class="relative flex items-center group/audiovolume"
                                @mouseenter="showVolumeFlyout = true"
                                @mouseleave="showVolumeFlyout = false"
                            >
                                <button
                                    type="button"
                                    class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                    :title="isMuted ? 'Nyalakan Suara (M)' : 'Bisukan Suara (M)'"
                                    @click="toggleMute"
                                >
                                    <span class="material-symbols-outlined text-lg">
                                        {{ volumeIcon }}
                                    </span>
                                </button>
                                <div
                                    class="overflow-hidden transition-all duration-200 flex items-center px-1"
                                    :class="showVolumeFlyout ? 'w-20 opacity-100' : 'w-0 opacity-0 pointer-events-none sm:group-hover/audiovolume:w-20 sm:group-hover/audiovolume:opacity-100'"
                                >
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        :value="isMuted ? 0 : volume"
                                        class="w-18 h-1 bg-slate-300 dark:bg-white/30 rounded-lg appearance-none cursor-pointer accent-slate-800 dark:accent-white"
                                        aria-label="Pengatur Volume Audio"
                                        @input="setVolume($event.target.value)"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <!-- YouTube-Style Quality Toast Banner -->
        <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-2 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
        >
            <div
                v-if="qualityToast.show && type !== 'audio'"
                class="absolute top-3.5 right-3.5 z-35 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/85 backdrop-blur-md text-white text-xs font-semibold shadow-2xl border border-white/20 pointer-events-none"
            >
                <span class="material-symbols-outlined text-[17px] text-amber-400">hd</span>
                <span>{{ qualityToast.text }}</span>
            </div>
        </transition>

        <!-- 3. Watermark Brand Logo Overlay -->
        <div
            v-if="watermark && type !== 'audio'"
            class="absolute top-4 right-4 z-20 pointer-events-none opacity-80 transition-opacity hover:opacity-100"
        >
            <slot name="watermark">
                <span class="px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white/90 text-xs font-bold border border-white/10 tracking-wider">
                    {{ watermark }}
                </span>
            </slot>
        </div>

        <!-- 4. Live Stream Header Overlay (Pulsing LIVE badge & Viewer Count) -->
        <div
            v-if="type === 'live'"
            class="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none"
        >
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 animate-pulse">
                <span class="w-2 h-2 rounded-full bg-white"></span>
                <span>{{ liveBadgeText }}</span>
            </div>
            <div v-if="viewers > 0" class="flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/10">
                <span class="material-symbols-outlined text-[14px] text-red-400">visibility</span>
                <span>{{ viewers.toLocaleString('id-ID') }} penonton</span>
            </div>
            <div v-if="liveCategory" class="hidden sm:inline-flex px-2 py-1 rounded-md bg-black/40 backdrop-blur-md text-slate-300 text-xs border border-white/5">
                {{ liveCategory }}
            </div>
        </div>

        <!-- 5. Double Tap Feedback Ripple (Mobile Touch Animation) -->
        <div
            v-if="doubleTapLeftActive"
            class="absolute left-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-md animate-ping pointer-events-none text-white font-bold text-xs"
        >
            <span class="material-symbols-outlined text-2xl">fast_rewind</span>
            <span>-10s</span>
        </div>
        <div
            v-if="doubleTapRightActive"
            class="absolute right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-md animate-ping pointer-events-none text-white font-bold text-xs"
        >
            <span class="material-symbols-outlined text-2xl">fast_forward</span>
            <span>+10s</span>
        </div>

        <!-- 6. Buffering Spinner Overlay -->
        <div
            v-if="isBuffering"
            class="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none"
        >
            <div class="w-12 h-12 rounded-full border-3 border-white/20 border-t-white animate-spin"></div>
        </div>

        <!-- 7. Media Error Screen Overlay -->
        <div
            v-if="hasError"
            class="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950 p-6 text-center"
        >
            <slot name="error">
                <span class="material-symbols-outlined text-4xl text-rose-500 mb-2">error</span>
                <h4 class="text-sm font-bold text-white mb-1">Gagal Memutar Media</h4>
                <p class="text-xs text-slate-400 max-w-sm mb-4">{{ errorMessage }}</p>
                <button
                    type="button"
                    class="px-4 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                    @click="hasError = false; initMediaSource(); play()"
                >
                    Coba Lagi
                </button>
            </slot>
        </div>

        <!-- 8. Big Center Play Button Overlay (when paused / idle) -->
        <div
            v-if="!isPlaying && !isBuffering && !hasError && type !== 'audio'"
            class="absolute inset-0 z-10 flex items-center justify-center cursor-pointer bg-black/30 backdrop-blur-[2px] transition-all"
            @click="play"
        >
            <button
                type="button"
                class="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-white/30 cursor-pointer"
                :class="themeColorClasses.ring"
                aria-label="Putar Media"
            >
                <span class="material-symbols-outlined text-3xl sm:text-4xl translate-x-0.5">
                    play_arrow
                </span>
            </button>
        </div>

        <!-- 9. Modern Bottom Control Bar Overlay (Authentic YouTube Style) -->
        <div
            v-if="controls && type !== 'audio'"
            class="absolute inset-x-0 bottom-0 z-20 px-3 sm:px-4 pb-2 pt-8 bg-linear-to-t from-black/95 via-black/60 to-transparent transition-all duration-300 flex flex-col gap-0.5 select-none"
            :class="showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'"
        >
            <!-- 9.1 Seek Progress Bar (YouTube Style: 3px normal, 5px hover, YouTube Red, hover red knob) -->
            <div
                v-if="type !== 'live'"
                ref="progressBarRef"
                class="group/scrubber py-2 cursor-pointer relative flex items-center w-full select-none"
                role="slider"
                :aria-valuenow="currentTime"
                aria-valuemin="0"
                :aria-valuemax="duration || 0"
                aria-label="Progress bar pemutaran video"
                @mousemove="onProgressBarMouseMove"
                @mouseleave="onProgressBarMouseLeave"
                @mousedown="onProgressBarMouseDown"
                @touchstart.passive="onProgressBarTouchStart"
                @touchmove.passive="onProgressBarTouchMove"
                @touchend="onProgressBarTouchEnd"
            >
                <!-- Background Rail -->
                <div class="w-full h-1 group-hover/scrubber:h-1.5 bg-white/20 rounded-full transition-all duration-150 relative flex items-center overflow-visible">
                    <!-- Buffer Loaded Bar -->
                    <div
                        class="absolute left-0 top-0 bottom-0 bg-white/40 rounded-full pointer-events-none transition-all duration-150"
                        :style="{ width: `${bufferedPercent}%` }"
                    ></div>

                    <!-- Current Playback Fill Bar (YouTube Red) -->
                    <div
                        class="absolute left-0 top-0 bottom-0 rounded-full bg-[#ff0000] pointer-events-none transition-all duration-75"
                        :style="{ width: `${progressPercent}%` }"
                    ></div>

                    <!-- YouTube Red Scrubber Handle Knob (grows on hover / drag) -->
                    <div
                        class="absolute w-3.5 h-3.5 rounded-full bg-[#ff0000] shadow-md -translate-x-1/2 pointer-events-none transition-transform duration-100 scale-0 group-hover/scrubber:scale-100"
                        :class="isDragging ? 'scale-125!' : ''"
                        :style="{ left: `${progressPercent}%` }"
                    ></div>
                </div>

                <!-- Timestamp Tooltip on Hover (YouTube Style) -->
                <div
                    v-if="hoverTime !== null"
                    class="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-[#1f1f1f]/95 text-white text-[11px] font-sans font-medium pointer-events-none shadow-xl border border-white/10"
                    :style="{ left: `${hoverPosition}%` }"
                >
                    {{ formatTime(hoverTime) }}
                </div>
            </div>

            <!-- 9.2 Bottom Toolbar Actions Row (YouTube Style) -->
            <div class="flex items-center justify-between gap-2 text-white">
                <!-- Left Action Controls -->
                <div class="flex items-center gap-0.5 sm:gap-1">
                    <slot name="controls-left">
                        <!-- Play / Pause Button -->
                        <button
                            type="button"
                            class="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15 active:bg-white/20 transition-colors cursor-pointer text-white outline-none focus:outline-none ring-0 focus:ring-0 border-none"
                            :title="isPlaying ? 'Jeda (Space / K)' : 'Putar (Space / K)'"
                            @click="togglePlay"
                        >
                            <span class="material-symbols-outlined text-2xl">
                                {{ isPlaying ? 'pause' : 'play_arrow' }}
                            </span>
                        </button>

                        <!-- Forward 10s -->
                        <button
                            v-if="type !== 'live'"
                            type="button"
                            class="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15 active:bg-white/20 transition-colors cursor-pointer text-white outline-none focus:outline-none ring-0 focus:ring-0 border-none max-sm:hidden"
                            title="Maju 10 detik (L)"
                            @click="forward(10)"
                        >
                            <span class="material-symbols-outlined text-xl">forward_10</span>
                        </button>

                        <!-- Volume Control & Slider (YouTube Style Hover Expansion) -->
                        <div
                            class="relative flex items-center group/volume"
                            @mouseenter="showVolumeFlyout = true"
                            @mouseleave="showVolumeFlyout = false"
                        >
                            <button
                                type="button"
                                class="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15 active:bg-white/20 transition-colors cursor-pointer text-white outline-none focus:outline-none ring-0 focus:ring-0 border-none"
                                :title="isMuted ? 'Nyalakan Suara (M)' : 'Bisukan Suara (M)'"
                                @click="toggleMute"
                            >
                                <span class="material-symbols-outlined text-xl">
                                    {{ volumeIcon }}
                                </span>
                            </button>

                            <!-- Inline Volume Slider (Expanded on Hover) -->
                            <div
                                class="overflow-hidden transition-all duration-200 flex items-center"
                                :class="showVolumeFlyout ? 'w-18 opacity-100 ml-1' : 'w-0 opacity-0 pointer-events-none sm:group-hover/volume:w-18 sm:group-hover/volume:opacity-100 sm:group-hover/volume:ml-1'"
                            >
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    :value="isMuted ? 0 : volume"
                                    class="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
                                    aria-label="Pengatur Volume"
                                    @input="setVolume($event.target.value)"
                                />
                            </div>
                        </div>

                        <!-- Time / Duration Display (YouTube Format: 0:15 / 3:42) -->
                        <div class="flex items-center gap-1 font-sans text-xs text-white/90 ml-1.5 select-none tabular-nums">
                            <span v-if="type === 'live'" class="flex items-center gap-1.5 text-red-500 font-bold">
                                <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                LIVE
                            </span>
                            <template v-else>
                                <span class="font-medium text-white">{{ displayCurrentTime }}</span>
                                <span class="text-white/60">/</span>
                                <button
                                    type="button"
                                    class="hover:text-white transition-colors cursor-pointer outline-none focus:outline-none ring-0 border-none text-white/90"
                                    title="Klik untuk beralih waktu sisa"
                                    @click="showRemainingTime = !showRemainingTime"
                                >
                                    {{ displayDuration }}
                                </button>
                            </template>
                        </div>
                    </slot>
                </div>

                <!-- Right Action Controls -->
                <div class="flex items-center gap-0.5 sm:gap-1">
                    <slot name="controls-right">
                        <!-- Subtitles / CC Button (if tracks available) -->
                        <button
                            v-if="tracks && tracks.length > 0"
                            type="button"
                            class="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15 active:bg-white/20 transition-colors cursor-pointer text-white/90 hover:text-white outline-none focus:outline-none ring-0 focus:ring-0 border-none"
                            title="Subtitel / CC"
                        >
                            <span class="material-symbols-outlined text-xl">subtitles</span>
                        </button>

                        <!-- Settings Gear Popover (Authentic YouTube 2-Tier Settings Menu: Quality & Speed) -->
                        <div class="relative">
                            <button
                                type="button"
                                class="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15 active:bg-white/20 transition-colors cursor-pointer text-white/90 hover:text-white outline-none focus:outline-none ring-0 focus:ring-0 border-none"
                                title="Setelan"
                                @click="toggleSettings"
                            >
                                <span class="material-symbols-outlined text-2xl transition-transform duration-300" :class="showSettings ? 'rotate-45' : ''">
                                    settings
                                </span>
                                <!-- YouTube HD Badge on Gear Icon -->
                                <span
                                    v-if="isHdQuality"
                                    class="absolute top-1.5 right-1 px-1 py-[0.5px] rounded-xs text-[8px] font-black bg-[#ff0000] text-white leading-none tracking-tight pointer-events-none shadow-xs"
                                >
                                    HD
                                </span>
                            </button>

                            <!-- YouTube-Style Settings Menu Popover -->
                            <div
                                v-if="showSettings"
                                class="absolute right-0 bottom-12 z-40 w-64 rounded-xl bg-[#1c1c1c]/95 backdrop-blur-xl border border-white/15 py-1.5 shadow-2xl text-xs text-white select-none transition-all animate-in fade-in zoom-in-95 duration-150"
                            >
                                <!-- Tab 1: Main Menu -->
                                <div v-if="settingsMenuTab === 'main'" class="py-0.5 space-y-0.5">
                                    <!-- Playback Speed Row -->
                                    <button
                                        type="button"
                                        class="w-full px-3.5 py-2 hover:bg-white/10 flex items-center justify-between cursor-pointer transition-colors outline-none focus:outline-none border-none text-left"
                                        @click="settingsMenuTab = 'speed'"
                                    >
                                        <div class="flex items-center gap-2.5">
                                            <span class="material-symbols-outlined text-lg text-slate-300">speed</span>
                                            <span class="text-xs font-medium">Kecepatan pemutaran</span>
                                        </div>
                                        <div class="flex items-center gap-0.5 text-slate-400">
                                            <span class="text-xs">{{ currentPlaybackRate === 1 ? 'Normal' : `${currentPlaybackRate}x` }}</span>
                                            <span class="material-symbols-outlined text-base">chevron_right</span>
                                        </div>
                                    </button>

                                    <!-- Video Quality Row -->
                                    <button
                                        v-if="availableQualities && availableQualities.length > 0"
                                        type="button"
                                        class="w-full px-3.5 py-2 hover:bg-white/10 flex items-center justify-between cursor-pointer transition-colors outline-none focus:outline-none border-none text-left"
                                        @click="settingsMenuTab = 'quality'"
                                    >
                                        <div class="flex items-center gap-2.5">
                                            <span class="material-symbols-outlined text-lg text-slate-300">tune</span>
                                            <span class="text-xs font-medium">Kualitas</span>
                                        </div>
                                        <div class="flex items-center gap-1 text-slate-400">
                                            <span class="text-xs flex items-center gap-1">
                                                {{ activeQuality }}
                                                <span v-if="isHdQuality" class="px-1 py-[0.5px] rounded-xs text-[8px] font-black bg-[#ff0000] text-white leading-none">HD</span>
                                            </span>
                                            <span class="material-symbols-outlined text-base">chevron_right</span>
                                        </div>
                                    </button>
                                </div>

                                <!-- Tab 2: Playback Speed Sub-menu -->
                                <div v-else-if="settingsMenuTab === 'speed'" class="py-0.5">
                                    <div class="flex items-center gap-2 px-3 py-1.5 border-b border-white/10 mb-1">
                                        <button
                                            type="button"
                                            class="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 cursor-pointer outline-none focus:outline-none border-none text-white"
                                            @click="settingsMenuTab = 'main'"
                                        >
                                            <span class="material-symbols-outlined text-base">arrow_back</span>
                                        </button>
                                        <span class="text-xs font-semibold text-white">Kecepatan pemutaran</span>
                                    </div>
                                    <div class="max-h-56 overflow-y-auto space-y-0.5">
                                        <button
                                            v-for="rate in playbackRates"
                                            :key="rate"
                                            type="button"
                                            class="w-full px-3.5 py-1.5 hover:bg-white/10 flex items-center justify-between cursor-pointer transition-colors outline-none focus:outline-none border-none text-left text-xs"
                                            @click="setPlaybackRate(rate)"
                                        >
                                            <span :class="currentPlaybackRate === rate ? 'font-bold text-white' : 'text-slate-300'">
                                                {{ rate === 1 ? 'Normal' : `${rate}x` }}
                                            </span>
                                            <span v-if="currentPlaybackRate === rate" class="material-symbols-outlined text-base text-[#ff0000]">
                                                check
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <!-- Tab 3: Video Quality Sub-menu -->
                                <div v-else-if="settingsMenuTab === 'quality'" class="py-0.5">
                                    <div class="flex items-center gap-2 px-3 py-1.5 border-b border-white/10 mb-1">
                                        <button
                                            type="button"
                                            class="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 cursor-pointer outline-none focus:outline-none border-none text-white"
                                            @click="settingsMenuTab = 'main'"
                                        >
                                            <span class="material-symbols-outlined text-base">arrow_back</span>
                                        </button>
                                        <span class="text-xs font-semibold text-white">Kualitas</span>
                                    </div>
                                    <div class="max-h-56 overflow-y-auto space-y-0.5">
                                        <button
                                            v-for="q in availableQualities"
                                            :key="q"
                                            type="button"
                                            class="w-full px-3.5 py-1.5 hover:bg-white/10 flex items-center justify-between cursor-pointer transition-colors outline-none focus:outline-none border-none text-left text-xs"
                                            @click="setQuality(q)"
                                        >
                                            <div class="flex items-center gap-2">
                                                <span :class="activeQuality === q ? 'font-bold text-white' : 'text-slate-300'">
                                                    {{ q === 'Auto' ? 'Otomatis' : q }}
                                                </span>
                                                <span
                                                    v-if="q.includes('1080') || q.includes('720') || q.includes('4K') || q.includes('2K')"
                                                    class="px-1 py-[0.5px] rounded-xs text-[8px] font-black bg-[#ff0000] text-white leading-none"
                                                >
                                                    HD
                                                </span>
                                            </div>
                                            <span v-if="activeQuality === q" class="material-symbols-outlined text-base text-[#ff0000]">
                                                check
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Picture-in-Picture (PiP) -->
                        <button
                            v-if="allowPiP && type !== 'audio'"
                            type="button"
                            class="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15 active:bg-white/20 transition-colors cursor-pointer text-white/90 hover:text-white outline-none focus:outline-none ring-0 focus:ring-0 border-none max-sm:hidden"
                            title="Picture in Picture (PiP)"
                            @click="togglePiP"
                        >
                            <span class="material-symbols-outlined text-xl">
                                {{ isPiP ? 'pip_exit' : 'picture_in_picture_alt' }}
                            </span>
                        </button>

                        <!-- Theater Mode Widescreen -->
                        <button
                            v-if="allowTheater && !isFullscreen && type !== 'audio'"
                            type="button"
                            class="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15 active:bg-white/20 transition-colors cursor-pointer text-white/90 hover:text-white outline-none focus:outline-none ring-0 focus:ring-0 border-none max-md:hidden"
                            :title="isTheater ? 'Mode Normal' : 'Mode Teater Lebar'"
                            @click="toggleTheater"
                        >
                            <span class="material-symbols-outlined text-xl">
                                {{ isTheater ? 'aspect_ratio' : 'crop_16_9' }}
                            </span>
                        </button>

                        <!-- Fullscreen Toggle -->
                        <button
                            v-if="allowFullscreen"
                            type="button"
                            class="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15 active:bg-white/20 transition-colors cursor-pointer text-white/90 hover:text-white outline-none focus:outline-none ring-0 focus:ring-0 border-none"
                            :title="isFullscreen ? 'Keluar Layar Penuh (F / Esc)' : 'Layar Penuh (F)'"
                            @click="toggleFullscreen"
                        >
                            <span class="material-symbols-outlined text-2xl">
                                {{ isFullscreen ? 'fullscreen_exit' : 'fullscreen' }}
                            </span>
                        </button>
                    </slot>
                </div>
            </div>
        </div>

        <!-- 10. Custom Overlay Injected Content -->
        <div v-if="$slots.overlay" class="absolute inset-0 pointer-events-none z-15">
            <slot name="overlay" :is-playing="isPlaying" :current-time="currentTime" :duration="duration" />
        </div>
    </div>
</template>
