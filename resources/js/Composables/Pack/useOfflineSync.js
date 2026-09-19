import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

// Nama database IndexedDB & fallback localStorage
const DEFAULT_DB_NAME = 'pack_offline_outbox';
const DEFAULT_STORE_NAME = 'outbox_queue';
const LOCAL_STORAGE_FALLBACK_KEY = 'pack_offline_outbox_queue';

/**
 * Helper pembuka IndexedDB dengan Promise
 */
function openOutboxDB(dbName = DEFAULT_DB_NAME, storeName = DEFAULT_STORE_NAME) {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !window.indexedDB) {
            return reject(new Error('IndexedDB tidak didukung pada lingkungan ini.'));
        }

        const request = window.indexedDB.open(dbName, 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error || new Error('Gagal membuka IndexedDB.'));
        };
    });
}

/**
 * Membaca semua item antrean dari storage (IndexedDB dengan fallback localStorage)
 */
async function loadQueueFromStorage(dbName, storeName) {
    try {
        const db = await openOutboxDB(dbName, storeName);
        return new Promise((resolve) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => {
                resolve(loadQueueFromLocalStorage());
            };
        });
    } catch {
        return loadQueueFromLocalStorage();
    }
}

/**
 * Menyimpan / memperbarui satu item antrean ke storage
 */
async function saveItemToStorage(item, dbName, storeName) {
    try {
        const db = await openOutboxDB(dbName, storeName);
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const req = store.put(item);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    } catch {
        // Fallback localStorage
        const list = loadQueueFromLocalStorage();
        const idx = list.findIndex((i) => i.id === item.id);
        if (idx !== -1) {
            list[idx] = item;
        } else {
            list.push(item);
        }
        saveQueueToLocalStorage(list);
    }
}

/**
 * Menghapus satu item dari storage
 */
async function deleteItemFromStorage(id, dbName, storeName) {
    try {
        const db = await openOutboxDB(dbName, storeName);
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const req = store.delete(id);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    } catch {
        const list = loadQueueFromLocalStorage().filter((i) => i.id !== id);
        saveQueueToLocalStorage(list);
    }
}

/**
 * Menghapus seluruh item dari storage
 */
async function clearStorage(dbName, storeName) {
    try {
        const db = await openOutboxDB(dbName, storeName);
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const req = store.clear();
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    } catch {
        saveQueueToLocalStorage([]);
    }
}

// LocalStorage Fallback Helpers
function loadQueueFromLocalStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    try {
        const raw = window.localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveQueueToLocalStorage(items) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
        window.localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(items));
    } catch {
        // Kuota penuh atau error
    }
}

/**
 * useOfflineSync
 * Composable enterprise untuk mengelola antrean mutasi data saat pengguna offline (Outbox Pattern)
 * yang 100% berjalan di browser tanpa ketergantungan background daemon worker Laravel.
 *
 * @param {Object} [options={}]
 * @param {string} [options.dbName='pack_offline_outbox'] - Nama IndexedDB
 * @param {string} [options.storeName='outbox_queue'] - Nama ObjectStore IndexedDB
 * @param {boolean} [options.autoSync=true] - Otomatis proses antrean saat koneksi kembali online
 * @param {number} [options.maxRetries=3] - Batas maksimal percobaan pengiriman ulang
 * @param {number} [options.baseRetryDelayMs=2000] - Jeda dasar eksponensial backoff retry (ms)
 * @param {string} [options.pingUrl=''] - URL opsional untuk verifikasi ping koneksi nyata
 * @param {Function} [options.onItemSuccess] - Callback saat item berhasil disinkronkan
 * @param {Function} [options.onItemFailed] - Callback saat item gagal disinkronkan
 * @param {Function} [options.onSyncComplete] - Callback saat seluruh siklus penyelarasan tuntas
 */
export function useOfflineSync(options = {}) {
    const {
        dbName = DEFAULT_DB_NAME,
        storeName = DEFAULT_STORE_NAME,
        autoSync = true,
        maxRetries = 3,
        baseRetryDelayMs = 2000,
        pingUrl = '',
        onItemSuccess = null,
        onItemFailed = null,
        onSyncComplete = null,
    } = options;

    const isSupported = typeof window !== 'undefined';
    const rawIsOnline = ref(isSupported && 'navigator' in window && 'onLine' in navigator ? navigator.onLine : true);
    
    // Fitur simulator offline untuk pengujian interaktif developer
    const simulateOffline = ref(false);

    // Status koneksi efektif (mempertimbangkan simulator)
    const isOnline = computed(() => {
        if (simulateOffline.value) return false;
        return rawIsOnline.value;
    });

    // Otomatis picu sinkronisasi saat koneksi beralih dari offline ke online (baik event nyata maupun saklar simulator)
    watch(isOnline, (newVal, oldVal) => {
        if (newVal && !oldVal && autoSync && !isPaused.value && queue.value.length > 0) {
            syncNow();
        }
    });

    const queue = ref([]);
    const isSyncing = ref(false);
    const isPaused = ref(false);
    const isCheckingPing = ref(false);
    const lastSyncAt = ref(null);

    // Hitungan reaktif
    const pendingCount = computed(() => {
        return queue.value.filter((item) => item.status === 'pending' || item.status === 'syncing' || (item.status === 'failed' && item.retryCount < (item.maxRetries || maxRetries))).length;
    });

    const failedCount = computed(() => {
        return queue.value.filter((item) => item.status === 'failed' && item.retryCount >= (item.maxRetries || maxRetries)).length;
    });

    const totalCount = computed(() => queue.value.length);

    /**
     * Memuat ulang data dari storage ke memory
     * Dilengkapi Self-Healing: memulihkan item yang tersisa dalam status 'syncing' (misal akibat refresh browser) ke 'pending'
     */
    const refreshQueue = async () => {
        const items = await loadQueueFromStorage(dbName, storeName);
        for (const item of items) {
            if (item.status === 'syncing') {
                item.status = 'pending';
                await saveItemToStorage(item, dbName, storeName);
            }
        }
        queue.value = items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    };

    /**
     * Verifikasi koneksi nyata melalui ping handshake
     */
    const verifyRealConnection = async () => {
        if (!isOnline.value) return false;
        if (!pingUrl) return true;

        isCheckingPing.value = true;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            
            const separator = pingUrl.includes('?') ? '&' : '?';
            const res = await fetch(`${pingUrl}${separator}_t=${Date.now()}`, {
                method: 'HEAD',
                cache: 'no-store',
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return res.ok;
        } catch {
            return false;
        } finally {
            isCheckingPing.value = false;
        }
    };

    /**
     * Menambahkan mutasi/request baru ke dalam antrean Outbox
     *
     * @param {Object} job
     * @param {string} job.title - Judul ringkas pekerjaan
     * @param {string} job.url - URL endpoint target
     * @param {string} [job.method='POST'] - HTTP method (POST, PUT, PATCH, DELETE)
     * @param {any} [job.payload={}] - Payload data yang dikirim
     * @param {Object} [job.headers={}] - Custom headers tambahan
     * @param {number} [job.maxRetries] - Batas retry khusus untuk job ini
     * @param {Object} [job.metadata={}] - Data tambahan untuk konteks UI pengguna
     * @param {boolean} [job.immediateSync=true] - Otomatis picu sync jika sedang online
     * @returns {Promise<Object>} Job item yang dibuat
     */
    const enqueue = async (job) => {
        const id = `outbox_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const now = new Date().toISOString();

        const newItem = {
            id,
            title: job.title || 'Aksi Form / Data',
            url: job.url || '/',
            method: (job.method || 'POST').toUpperCase(),
            payload: job.payload !== undefined ? job.payload : {},
            headers: job.headers || {},
            createdAt: now,
            clientUpdatedAt: now,
            status: 'pending', // 'pending' | 'syncing' | 'failed'
            retryCount: 0,
            maxRetries: job.maxRetries || maxRetries,
            lastError: null,
            lastAttemptAt: null,
            metadata: job.metadata || {},
        };

        await saveItemToStorage(newItem, dbName, storeName);
        queue.value.push(newItem);

        // Jika saat ini online, autoSync aktif, dan tidak dilarang
        const shouldSync = job.immediateSync !== undefined ? job.immediateSync : true;
        if (isOnline.value && autoSync && !isPaused.value && shouldSync) {
            syncNow();
        }

        return newItem;
    };

    /**
     * Helper eksekusi request (seperti fetch) dengan auto-fallback ke outbox jika offline
     * Mendukung opsi `forceQueue: true` untuk pengujian memasukkan ke antrean outbox saat online
     *
     * @param {Object} config
     * @param {string} config.url - Endpoint target
     * @param {string} [config.method='POST'] - HTTP method
     * @param {any} [config.data={}] - Data payload
     * @param {string} [config.title] - Deskripsi aksi untuk outbox
     * @param {Object} [config.headers={}] - Headers tambahan
     * @param {boolean} [config.forceQueue=false] - Paksa simpan ke antrean outbox (untuk uji coba)
     * @returns {Promise<{ success: boolean, queued: boolean, data?: any, item?: Object, error?: any, status?: number }>}
     */
    const send = async (config) => {
        const { url, method = 'POST', data = {}, title, headers = {}, forceQueue = false } = config;

        // Jika mode offline aktif atau user secara eksplisit ingin memasukkan ke outbox
        if (!isOnline.value || forceQueue) {
            const item = await enqueue({
                title: title || `Kirim ${method.toUpperCase()} ke ${url}`,
                url,
                method,
                payload: data,
                headers,
                immediateSync: false, // Jangan langsung sync jika dipaksa masuk antrean
            });
            return { success: true, queued: true, item };
        }

        // Coba kirim langsung ke server
        try {
            const csrfMeta = typeof document !== 'undefined' ? document.querySelector('meta[name="csrf-token"]') : null;
            const csrfToken = csrfMeta ? csrfMeta.getAttribute('content') : null;

            const finalHeaders = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-Client-Updated-At': new Date().toISOString(),
                ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                ...headers,
            };

            const isBodyAllowed = !['GET', 'HEAD'].includes(method.toUpperCase());

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000);

            let response;
            try {
                response = await fetch(url, {
                    method: method.toUpperCase(),
                    headers: finalHeaders,
                    body: isBodyAllowed ? JSON.stringify(data) : undefined,
                    signal: controller.signal,
                });
            } finally {
                clearTimeout(timeoutId);
            }

            if (!response.ok) {
                // Jika server merespons error server 5xx atau timeout, masukkan ke outbox untuk retry otomatis
                if (response.status >= 500) {
                    throw new Error(`Server Error (${response.status})`);
                }
                const errData = await response.json().catch(() => ({ message: response.statusText || `HTTP ${response.status}` }));
                return { success: false, queued: false, error: errData, status: response.status };
            }

            const responseData = await response.json().catch(() => null);
            return { success: true, queued: false, data: responseData, status: response.status };
        } catch (error) {
            // Tangkap kegagalan jaringan (NetworkError, DNS failure, drop connection, timeout)
            const item = await enqueue({
                title: title || `Kirim ${method.toUpperCase()} ke ${url}`,
                url,
                method,
                payload: data,
                headers,
            });
            return { success: true, queued: true, item, networkError: error.message };
        }
    };

    /**
     * Mengirimkan satu item antrean ke endpoint tujuan dengan timeout protection
     */
    const dispatchItem = async (item) => {
        const csrfMeta = typeof document !== 'undefined' ? document.querySelector('meta[name="csrf-token"]') : null;
        const csrfToken = csrfMeta ? csrfMeta.getAttribute('content') : null;

        const finalHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Client-Updated-At': item.clientUpdatedAt || item.createdAt,
            'X-Offline-Queue-Id': item.id,
            ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
            ...(item.headers || {}),
        };

        const isBodyAllowed = !['GET', 'HEAD'].includes(item.method.toUpperCase());
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 detik batas timeout

        try {
            const response = await fetch(item.url, {
                method: item.method.toUpperCase(),
                headers: finalHeaders,
                body: isBodyAllowed ? JSON.stringify(item.payload) : undefined,
                signal: controller.signal,
            });
            return response;
        } finally {
            clearTimeout(timeoutId);
        }
    };

    /**
     * Memproses antrean Outbox secara berurutan (Sequential FIFO)
     */
    const processQueue = async () => {
        if (isSyncing.value || isPaused.value || !isOnline.value) return;
        if (queue.value.length === 0) return;

        // Ambil item yang perlu dikirim (pending, syncing terputus, atau failed yang masih punya sisa retry)
        const candidates = queue.value.filter((i) => {
            if (i.status === 'pending' || i.status === 'syncing') return true;
            if (i.status === 'failed' && i.retryCount < (i.maxRetries || maxRetries)) return true;
            return false;
        });

        if (candidates.length === 0) return;

        isSyncing.value = true;
        let succeededCount = 0;
        let failedCountResult = 0;

        try {
            // Cek keaslian koneksi via ping jika dikonfigurasi
            const isConnected = await verifyRealConnection();
            if (!isConnected) {
                return;
            }

            for (const item of candidates) {
                // Jika user menjeda atau beralih offline saat pemrosesan berlangsung, hentikan loop
                if (!isOnline.value || isPaused.value) {
                    item.status = 'pending';
                    await saveItemToStorage(item, dbName, storeName);
                    break;
                }

                item.status = 'syncing';
                item.lastAttemptAt = new Date().toISOString();
                await saveItemToStorage(item, dbName, storeName);

                try {
                    const response = await dispatchItem(item);

                    if (response.ok) {
                        // Sukses 2xx: Hapus dari storage dan memory
                        await deleteItemFromStorage(item.id, dbName, storeName);
                        queue.value = queue.value.filter((i) => i.id !== item.id);
                        succeededCount++;

                        if (typeof onItemSuccess === 'function') {
                            const resBody = await response.clone().json().catch(() => null);
                            onItemSuccess(item, resBody);
                        }
                    } else if (response.status >= 400 && response.status < 500) {
                        // Client error (422, 401, 404): Kunci agar tidak spam, butuh perbaikan manual
                        item.status = 'failed';
                        item.retryCount = item.maxRetries || maxRetries;
                        const errBody = await response.json().catch(() => ({ message: response.statusText }));
                        item.lastError = `HTTP ${response.status}: ${errBody.message || response.statusText || 'Gagal diproses'}`;
                        await saveItemToStorage(item, dbName, storeName);
                        failedCountResult++;

                        if (typeof onItemFailed === 'function') {
                            onItemFailed(item, new Error(item.lastError));
                        }
                    } else {
                        // Server error (5xx)
                        throw new Error(`HTTP ${response.status}: Server Error`);
                    }
                } catch (err) {
                    item.retryCount = (item.retryCount || 0) + 1;
                    item.status = 'failed';
                    item.lastError = err.name === 'AbortError' ? 'Koneksi timeout (>12 detik)' : (err.message || 'Kesalahan jaringan');
                    await saveItemToStorage(item, dbName, storeName);
                    failedCountResult++;

                    if (typeof onItemFailed === 'function') {
                        onItemFailed(item, err);
                    }

                    // Jika error karena kehilangan koneksi
                    if (!navigator.onLine || simulateOffline.value) {
                        item.status = 'pending'; // Pulihkan ke pending agar otomatis retry saat online
                        await saveItemToStorage(item, dbName, storeName);
                        break;
                    }

                    // Exponential backoff sebelum item berikutnya jika error
                    const delay = Math.min(baseRetryDelayMs * Math.pow(2, item.retryCount - 1), 10000);
                    await new Promise((r) => setTimeout(r, delay));
                }
            }
        } finally {
            lastSyncAt.value = new Date();
            isSyncing.value = false;

            if (typeof onSyncComplete === 'function' && (succeededCount > 0 || failedCountResult > 0)) {
                onSyncComplete({
                    total: candidates.length,
                    succeeded: succeededCount,
                    failed: failedCountResult,
                });
            }
        }
    };

    /**
     * Memicu proses sinkronisasi manual sekarang juga
     */
    const syncNow = async () => {
        await processQueue();
    };

    /**
     * Mencoba ulang satu item antrean tertentu
     */
    const retryItem = async (id) => {
        const item = queue.value.find((i) => i.id === id);
        if (!item) return;

        item.status = 'pending';
        item.retryCount = 0;
        item.lastError = null;
        await saveItemToStorage(item, dbName, storeName);

        if (isOnline.value && !isPaused.value) {
            syncNow();
        }
    };

    /**
     * Menghapus satu item dari antrean
     */
    const removeItem = async (id) => {
        await deleteItemFromStorage(id, dbName, storeName);
        queue.value = queue.value.filter((i) => i.id !== id);
    };

    /**
     * Menghapus seluruh item dari antrean
     */
    const clearQueue = async () => {
        await clearStorage(dbName, storeName);
        queue.value = [];
    };

    /**
     * Kontrol jeda / lanjutkan dispatcher
     */
    const pause = () => {
        isPaused.value = true;
    };

    const resume = () => {
        isPaused.value = false;
        if (isOnline.value && autoSync) {
            syncNow();
        }
    };

    // Event Listener Koneksi Jaringan
    const handleWindowOnline = () => {
        rawIsOnline.value = true;
        if (autoSync && !isPaused.value && !simulateOffline.value) {
            syncNow();
        }
    };

    const handleWindowOffline = () => {
        rawIsOnline.value = false;
    };

    onMounted(async () => {
        if (!isSupported) return;

        rawIsOnline.value = navigator.onLine;
        window.addEventListener('online', handleWindowOnline);
        window.addEventListener('offline', handleWindowOffline);

        await refreshQueue();

        // Coba sinkronkan saat pertama kali aplikasi dibuka jika ada antrean tertunda
        if (isOnline.value && autoSync && queue.value.length > 0) {
            syncNow();
        }
    });

    onUnmounted(() => {
        if (!isSupported) return;
        window.removeEventListener('online', handleWindowOnline);
        window.removeEventListener('offline', handleWindowOffline);
    });

    return {
        // State
        queue,
        isOnline,
        isSyncing,
        isPaused,
        isCheckingPing,
        simulateOffline,
        lastSyncAt,

        // Computed
        pendingCount,
        failedCount,
        totalCount,

        // Actions
        enqueue,
        send,
        syncNow,
        retryItem,
        removeItem,
        clearQueue,
        pause,
        resume,
        refreshQueue,
    };
}
