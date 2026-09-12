import { ref, onMounted, onUnmounted } from 'vue';

/**
 * useNetworkStatus
 * Composable untuk memonitor status koneksi jaringan internet browser (online/offline)
 * serta metadata kecepatan koneksi (Network Information API).
 */
export function useNetworkStatus() {
    const isSupported = typeof window !== 'undefined' && 'navigator' in window;

    const isOnline = ref(isSupported && 'onLine' in navigator ? navigator.onLine : true);
    const offlineAt = ref(null);

    // Network Information API Metadata (jika didukung oleh browser)
    const downlink = ref(null);
    const downlinkMax = ref(null);
    const effectiveType = ref(null); // 'slow-2g' | '2g' | '3g' | '4g'
    const rtt = ref(null);
    const saveData = ref(false);
    const type = ref(null);

    const updateConnectionInfo = () => {
        if (!isSupported || !navigator.connection) return;

        const conn = navigator.connection;
        downlink.value = conn.downlink !== undefined ? conn.downlink : null;
        downlinkMax.value = conn.downlinkMax !== undefined ? conn.downlinkMax : null;
        effectiveType.value = conn.effectiveType || null;
        rtt.value = conn.rtt !== undefined ? conn.rtt : null;
        saveData.value = Boolean(conn.saveData);
        type.value = conn.type || null;
    };

    const handleOnline = () => {
        isOnline.value = true;
        offlineAt.value = null;
        updateConnectionInfo();
    };

    const handleOffline = () => {
        isOnline.value = false;
        offlineAt.value = new Date();
    };

    onMounted(() => {
        if (!isSupported) return;

        isOnline.value = navigator.onLine;
        updateConnectionInfo();

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        if (navigator.connection) {
            navigator.connection.addEventListener('change', updateConnectionInfo);
        }
    });

    onUnmounted(() => {
        if (!isSupported) return;

        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);

        if (navigator.connection) {
            navigator.connection.removeEventListener('change', updateConnectionInfo);
        }
    });

    return {
        isOnline,
        offlineAt,
        downlink,
        downlinkMax,
        effectiveType,
        rtt,
        saveData,
        type,
        isSupported,
    };
}
