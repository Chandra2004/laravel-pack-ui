# AutoSaveStatus Component

## 01. Overview

AutoSaveStatus adalah komponen visual indikator status penyimpanan formulir real-time dan banner pemulihan draf lokal (*Draft Recovery Alert*). Komponen ini dirancang untuk berpasangan langsung dengan composable `useAutoSave.js` atau digunakan secara independen melalui prop manual untuk memberikan kepastian kepada pengguna bahwa perubahan data mereka tersimpan secara aman.

### Fungsi Utama
* Menampilkan status siklus hidup penyimpanan formulir otomatis (idle, sedang menyimpan, tersimpan, gagal, dijeda).
* Menampilkan banner notifikasi pemulihan data draf jika ditemukan draf belum tersimpan dari sesi kerja sebelumnya.
* Menyediakan aksi instan bagi pengguna untuk memulihkan (*restore*) atau mengabaikan (*discard*) data draf.
* Menyediakan tombol coba lagi (*retry*) secara langsung saat proses penyimpanan ke server mengalami kegagalan jaringan.

### Kapan Digunakan
* Pada formulir panjang atau editor teks (artikel, laporan, pengaturan profil) di mana kehilangan data input akibat refresh atau putus koneksi dapat merugikan pengguna.
* Pada panel admin atau CMS yang menerapkan mekanisme *auto-save background*.
* Pada formulir multi-langkah (stepper) untuk mempertahankan progres isian pengguna secara lokal.

### Karakteristik Penting
* **One-Prop Binding**: Cukup menyematkan objek hasil instansiasi `useAutoSave()` ke prop `:auto-save="autoSave"` tanpa perlu mengelola status manual.
* **Dual Display Mode**: Mendukung mode gabungan (banner + badge), mode hanya badge ringkas, atau mode hanya banner pemulihan.
* **Aksesibilitas Dinamis**: Menggunakan `role="status"` dan `aria-live="polite"` untuk pembaruan status normal, serta eskalasi ke `role="alert"` dan `aria-live="assertive"` saat terjadi kegagalan penyimpanan.
* **Full Dark Mode**: Seluruh elemen badge dan banner dilengkapi kelas utilitas Tailwind `dark:` yang teruji kontrasnya.

### Mekanisme & Destinasi Penyimpanan (Storage Engine)

Komponen ini bekerja beriringan dengan logika penyimpanan otomatis (`useAutoSave`) yang memiliki 3 target destinasi penyimpanan:

1. **Penyimpanan Lokal (`storage: 'local'`) - Pilihan Default**:
   * **Lokasi**: Disimpan langsung di browser peramban pengguna menggunakan API `window.localStorage`.
   * **Kunci Penyimpanan (Storage Key)**: Otomatis diberi prefiks `pack_draft_{key}` (misalnya: `pack_draft_article_create` atau `pack_draft_profile_form`).
   * **Struktur Data JSON**:
     ```json
     {
       "data": { "title": "Draf Judul", "content": "Isi..." },
       "savedAt": 1727339525000
     }
     ```
   * **Masa Kedaluwarsa Draf (`expiryDays`)**: Secara default berumur 7 hari. Jika draf tersimpan lebih lama dari masa kedaluwarsa tanpa pernah disentuh, draf otomatis dibersihkan dari penyimpanan lokal untuk mencegah penumpukan sampah memori.

2. **Penyimpanan Cloud Server (`storage: 'remote'`)**:
   * **Endpoint REST API**: Mengirimkan data formulir via HTTP request `POST` berformat JSON ke URL server yang dikonfigurasi pada opsi `endpoint` (misalnya: `endpoint: '/api/v1/drafts/save'`). Request otomatis disertai header `X-Requested-With: XMLHttpRequest` yang kompatibel dengan CSRF protection Laravel.
   * **Kustom Handler Asinkron (`saveHandler`)**: Mendukung callback kustom `async (payload) => { ... }` jika ingin mengirim draf via Axios kustom, GraphQL, atau Inertia router.

3. **Penyimpanan Ganda (`storage: 'both'`)**:
   * Data disimpan secara simultan ke `localStorage` (sebagai proteksi instan saat koneksi putus tiba-tiba) dan ke database server melalui endpoint API.

#### Kapan Auto-Save Dijalankan?
* **Debounce Timer (`debounceMs: 1500`)**: Penyimpanan tidak dieksekusi pada setiap ketikan tombol, melainkan menunggu jeda diam (idle) pengguna selama 1.5 detik setelah ketukan terakhir. Ini mencegah beban berlebih (*over-request*) pada server dan peramban.
* **Dirty Checking Snapshot**: Sebelum eksekusi penyimpanan, sistem membandingkan snapshot serialisasi data form saat ini dengan data simpan terakhir. Jika tidak ada perubahan nilai, proses simpan otomatis dibatalkan.

#### Kapan Banner Draf Muncul dan Kapan Draf Dibersihkan?
* **Pemicu Banner**: Saat halaman formulir dimount, sistem memeriksa apakah ada entri di `localStorage` dengan key yang cocok. Jika data ditemukan, belum kedaluwarsa, dan nilainya berbeda dengan nilai inisial form, prop `hasDraft` otomatis menjadi `true` dan banner pemulihan draf ditampilkan di atas formulir.
* **Pembersihan Draf**: Draf lokal harus dibersihkan secara permanen dari browser dengan memanggil `autoSave.clearDraft()` di dalam callback `onSuccess` saat pengguna resmi mengklik tombol submit final formulir ke server database utama.

---

## 02. Preview

> [!TIP]
> Pengujian visual dan showcase interaktif entitas ini tersedia secara native pada portal pratinjau aplikasi:
>
> <a href="http://localhost:8000/preview/auto-save-status" target="_self" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 8px; background-color: var(--vp-c-brand-1, #4f46e5); color: #ffffff;">Buka Live Preview Komponen AutoSaveStatus</a>

### Blueprint Skematik Antarmuka

```text
1. Draft Recovery Alert Banner (variant="both" / "banner", hasDraft=true)
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ [history] Draf Belum Tersimpan Ditemukan                                                 │
│           Ada data tersimpan dari 17:42 WIB. Pulihkan data?  [Pulihkan Draf] [Abaikan]   │
└──────────────────────────────────────────────────────────────────────────────────────────┘

2. Real-Time Status Badge (variant="both" / "badge")
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│ [check_circle] Tersimpan (17:45 WIB) │  │ [error] Gagal menyimpan [Coba Lagi] │
└──────────────────────────────────────┘  └──────────────────────────────────────┘
```

---

## 03. Usage

Konsep penggunaan komponen AutoSaveStatus dalam hierarki formulir aplikasi:

```text
AutoSaveStatus
├── Form Header / Footer (Indikator status badge: idle, saving, saved, error, paused)
├── Top of Form (Banner pemulihan draf belum tersimpan)
├── Network Failure State (Pemicu retry simpan ulang manual)
└── useAutoSave Composable Companion (Binding reaktif otomatis)
```

### Penempatan yang Direkomendasikan
* **Badge Status**: Letakkan di samping tombol aksi utama formulir, di bagian header halaman, atau di sudut bawah form input.
* **Banner Pemulihan**: Letakkan di paling atas formulir (sebelum baris input pertama) agar segera terlihat saat halaman dibuka.

---

## 04. Anatomy

Struktur elemen internal komponen `AutoSaveStatus.vue`:

```text
AutoSaveStatus (Container)
│
├── Draft Recovery Banner (Muncul bila hasDraft = true & variant !== 'badge')
│   ├── History Icon Container (Ikon penanda waktu draf)
│   ├── Information Text
│   │   ├── Title ("Draf Belum Tersimpan Ditemukan")
│   │   └── Description (Menampilkan resolvedDraftTime atau teks fallback)
│   └── Action Buttons Container
│       ├── Restore Button (Memicu restoreDraft() & emit @restore)
│       └── Discard Button (Memicu discardDraft() & emit @discard)
│
└── Status Badge (Muncul bila variant !== 'banner')
    ├── Saving State (Spinner animasi putar + "Menyimpan draf...")
    ├── Saved State (Ikon check_circle + "Tersimpan otomatis" + waktu simpan)
    ├── Error State (Ikon error + "Gagal menyimpan" + tombol "Coba Lagi")
    ├── Paused State (Ikon pause_circle + "Auto-save dijeda")
    └── Idle State (Ikon cloud_done + "Semua perubahan tersimpan")
```

---

## 05. Variants

Komponen menyediakan 3 opsi varian tampilan melalui prop `variant`:

| Varian | Prop Value | Elemen yang Ditampilkan | Kapan Digunakan |
| :--- | :--- | :--- | :--- |
| **Both** | `'both'` *(default)* | Menampilkan banner pemulihan (jika ada draf) dan badge status real-time. | Formulir halaman penuh standar di mana ruang vertikal memadai. |
| **Badge** | `'badge'` | Hanya menampilkan status badge mini (menyembunyikan banner). | Header formulir sempit, modal dialog, atau inline toolbar. |
| **Banner** | `'banner'` | Hanya menampilkan banner pemulihan draf (menyembunyikan badge status). | Area atas form yang hanya membutuhkan konfirmasi pemulihan draf. |

---

## 06. Sizes

Komponen menyediakan 5 skala ukuran melalui prop `size`:

| Ukuran | Prop Value | Dimensi Badge | Dimensi Banner | Kapan Digunakan |
| :--- | :--- | :--- | :--- | :--- |
| **Extra Small** | `'xs'` | `text-[10px] px-2 py-0.5 min-h-[22px]`, spinner 10px | `py-1.5 px-3 gap-2 text-xs`, tombol `text-[10px]` | Area mikro, sel tabel, atau header dialog kompak. |
| **Small** | `'sm'` | `text-[11px] px-2.5 py-0.5 min-h-[26px]`, spinner 12px | `py-2 px-3.5 gap-2.5 text-xs`, tombol `text-[11px]` | Dialog modal, panel drawer, atau area formulir padat. |
| **Medium** | `'md'` *(default)* | `text-xs px-3 py-1 min-h-[30px]`, spinner 14px | `py-2.5 px-4 gap-3 text-xs`, tombol `text-xs` | Halaman formulir standar dan tata letak dashboard umum. |
| **Large** | `'lg'` | `text-xs px-3.5 py-1.5 min-h-[34px]`, spinner 16px | `py-3 px-4.5 gap-3.5 text-sm`, tombol `text-xs font-medium` | Formulir satu kolom lebar, hero editor artikel, atau landing CMS. |
| **Extra Large** | `'xl'` | `text-sm px-4 py-2 min-h-[40px]`, spinner 18px | `py-3.5 px-5 gap-4 text-base`, tombol `text-sm font-medium` | Banner pengumuman status hero atau form layar lebar penuh. |

---

## 07. States

Siklus status badge pada komponen `AutoSaveStatus.vue`:

| State | Status Value | Representasi Visual | Makna Fungsional |
| :--- | :--- | :--- | :--- |
| **Idle** | `'idle'` | Teks abu-abu redup + ikon `cloud_done`. | Tidak ada perubahan tertunda; seluruh input telah tersinkronisasi. |
| **Saving** | `'saving'` | Badge latar abu-abu + spinner animasi berputar. | Proses pengiriman data ke server atau penyimpanan lokal sedang berlangsung. |
| **Saved** | `'saved'` | Badge latar hijau lembut (`emerald`) + ikon `check_circle` + waktu simpan. | Data berhasil disimpan. Menampilkan waktu eksekusi terakhir. |
| **Error** | `'error'` | Badge latar merah lembut (`rose`) + ikon `error` + tombol "Coba Lagi". | Terjadi kendala saat menyimpan. Pengguna dapat menekan tombol coba lagi. |
| **Paused** | `'paused'` | Badge latar abu-abu netral + ikon `pause_circle`. | Mekanisme simpan otomatis dijeda sementara (misal sedang offline). |

---

## 08. Props / Attributes

Daftar parameter lengkap konfigurasi prop pada `AutoSaveStatus.vue`:

| Prop | Tipe Data | Default | Pilihan Nilai | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| `modelValue` | `String` | `undefined` | `'idle'`, `'saving'`, `'saved'`, `'error'`, `'paused'` | Binding dua arah `v-model` untuk status penyimpanan otomatis. |
| `autoSave` | `Object` | `null` | Objek Composable | Objek hasil instansiasi `useAutoSave()`. Menyediakan seluruh binding otomatis. |
| `status` | `String` | `'idle'` | `'idle'`, `'saving'`, `'saved'`, `'error'`, `'paused'` | Nilai status manual jika tidak menggunakan prop `autoSave` atau `modelValue`. |
| `design` | `String` | `'default'` | `'default'`, `'minimal'`, `'bordered'`, `'floating'`, `'modern'` | Arsitektur dan tata letak kontainer indikator status (5 Dimensi Desain Paten). |
| `color` | `String` | `undefined` | `'indigo'`, `'primary'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'`, `'success'`, `'warning'`, `'error'`, `'danger'`, `'info'`, `'neutral'` | Palet aksen warna semantik badge dan tombol (5 Dimensi Desain Paten). |
| `style` | `String` | `'soft'` | `'soft'`, `'solid'`, `'outline'`, `'pill'` | Gaya visual presentasi permukaan badge status (5 Dimensi Desain Paten). |
| `variant` | `String` | `'both'` | `'both'`, `'badge'`, `'banner'` | Mode tampilan elemen (banner + badge, hanya badge, atau hanya banner). |
| `radius` | `String` | `'full'` | `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'full'` | Skala kelengkungan sudut badge dan elemen banner (5 Dimensi Desain Paten). |
| `size` | `String` | `'md'` | `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'` | Skala ukuran badge, banner, font, dan tombol aksi (5 Dimensi Desain Paten). |
| `lastSaved` | `String\|Date` | `null` | String / Date | Label waktu penyimpanan terakhir (misal: `'14:30:15'` atau `'Baru saja'`). |
| `hasDraft` | `Boolean` | `false` | `true`, `false` | Penanda keberadaan draf lokal untuk memunculkan banner pemulihan. |
| `draftTime` | `String` | `''` | Teks bebas | Keterangan waktu pembuatan draf (misal: `'10 menit yang lalu'`). |
| `showBanner` | `Boolean` | `true` | `true`, `false` | Kontrol eksplisit untuk menampilkan atau menyembunyikan banner pemulihan. |
| `savingText` | `String` | `'Menyimpan draf...'` | Teks bebas | Teks kustom untuk status sedang menyimpan. |
| `savedText` | `String` | `'Tersimpan otomatis'` | Teks bebas | Teks kustom untuk status tersimpan. |
| `errorText` | `String` | `'Gagal menyimpan'` | Teks bebas | Teks kustom untuk status gagal. |
| `pausedText` | `String` | `'Auto-save dijeda'` | Teks bebas | Teks kustom untuk status dijeda. |
| `idleText` | `String` | `'Semua perubahan tersimpan'` | Teks bebas | Teks kustom untuk status idle. |
| `restoreText` | `String` | `'Pulihkan Draf'` | Teks bebas | Label tombol pemulihan draf pada banner. |
| `discardText` | `String` | `'Abaikan'` | Teks bebas | Label tombol abaikan draf pada banner. |
| `retryText` | `String` | `'Coba Lagi'` | Teks bebas | Label tombol coba simpan ulang pada status error. |
| `isLog` | `Boolean` | `false` | `true`, `false` | Mengaktifkan telemetri diagnostik ke console browser dan memancarkan event `@log`. |

---

## 09. Slots

| Slot Name | Scope Props | Deskripsi |
| :--- | :--- | :--- |
| `banner` | `{ hasDraft, draftTime, restore, discard }` | Menggantikan seluruh markup banner pemulihan draf dengan tampilan kustom. |
| `actions` | `{ restore, discard }` | Menggantikan area tombol aksi pada banner pemulihan draf. |
| `badge` | `{ status, lastSaved, retry }` | Menggantikan seluruh markup badge status dengan indikator kustom. |

---

## 10. Events / Interactions

| Event Name | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `@update:modelValue` | `(status: string)` | Dipancarkan saat status penyimpanan berubah untuk sinkronisasi dua arah `v-model`. |
| `@update:status` | `(status: string)` | Dipancarkan saat status penyimpanan berubah. |
| `@restore` | — | Dipancarkan saat pengguna menekan tombol "Pulihkan Draf". |
| `@discard` | — | Dipancarkan saat pengguna menekan tombol "Abaikan" draf. |
| `@retry` | — | Dipancarkan saat pengguna menekan tombol "Coba Lagi" pada status galat penyimpanan. |
| `@log` | `(payload: object)` | Dipancarkan saat terjadi aktivitas telemetri jika `isLog` bernilai `true`. |

---

## 11. Code Example

### 1. Integrasi Penuh dengan `useAutoSave` (Rekomendasi Utama)

Pendekatan ini adalah standar utama yang paling efisien karena seluruh logika penyimpanan, debounce, snapshot perbandingan data, penulisan ke `localStorage`, dan pemeriksaan draf dikelola otomatis oleh composable `useAutoSave`.

```vue
<script setup>
import { ref } from 'vue';
import AutoSaveStatus from '@/Components/Pack/AutoSaveStatus.vue';
import { useAutoSave } from '@/Composables/Pack/useAutoSave';
import { router } from '@inertiajs/vue3';

const articleForm = ref({
    title: '',
    slug: '',
    content: '',
});

// Inisialisasi composable dengan key unik
const autoSave = useAutoSave(articleForm, {
    key: 'draft_article_create', // Disimpan di localStorage: pack_draft_draft_article_create
    debounceMs: 1500,            // Jeda 1.5 detik setelah ketukan terakhir
    storage: 'local',            // Opsi: 'local' | 'remote' | 'both'
});

const submitArticle = () => {
    router.post('/articles', articleForm.value, {
        onSuccess: () => {
            // Bersihkan draf lokal saat form resmi berhasil terkirim ke database server
            autoSave.clearDraft();
        },
    });
};
</script>

<template>
  <form @submit.prevent="submitArticle" class="space-y-4">
    <!-- Cukup teruskan objek autoSave ke prop :auto-save -->
    <AutoSaveStatus :auto-save="autoSave" />

    <input
      v-model="articleForm.title"
      type="text"
      placeholder="Judul Artikel..."
      class="w-full border rounded-xl p-3 text-sm"
    />

    <textarea
      v-model="articleForm.content"
      rows="6"
      placeholder="Tuliskan konten artikel..."
      class="w-full border rounded-xl p-3 text-sm"
    />

    <button type="submit" class="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold">
      Terbitkan Artikel
    </button>
  </form>
</template>
```

#### Alur Kerja Runtime:
1. Pengguna mengisi judul atau konten artikel $\to$ `useAutoSave` mendeteksi mutasi data reaktif.
2. Timer debounce berjalan selama 1500ms. Jika pengguna mengetik lagi sebelum 1500ms, timer di-reset.
3. Setelah 1500ms tanpa ketikan, status berubah menjadi `'saving'`, data diserialisasi dan disimpan ke `localStorage`.
4. Komponen `AutoSaveStatus` otomatis menampilkan indikator spinner, lalu berubah menjadi centang hijau `'saved'` beserta label waktu.
5. Jika pengguna me-refresh halaman atau tidak sengaja menutup tab, banner draf otomatis muncul menawarkan pemulihan data.

---

### 2. Penggunaan Mandiri Manual (Standalone Mode)

Gunakan mode ini ketika Anda tidak menggunakan composable `useAutoSave` bawaan, melainkan mengelola proses penyimpanan melalui state machine kustom sendiri—misalnya menggunakan Axios langsung, Pinia store, WebSocket channel, atau watcher kustom.

Pada mode ini, Anda bertanggung jawab mengontrol variabel reaktif `status` dan `last-saved`, serta menangani event `@retry` saat terjadi kegagalan jaringan.

```vue
<script setup>
import { ref, watch } from 'vue';
import AutoSaveStatus from '@/Components/Pack/AutoSaveStatus.vue';
import axios from 'axios';

const userProfile = ref({
    full_name: 'Budi Santoso',
    bio: 'Software Engineer di Jakarta',
});

// 1. Variabel state yang mengontrol komponen AutoSaveStatus
const saveStatus = ref('idle'); // 'idle' | 'saving' | 'saved' | 'error' | 'paused'
const lastSavedAt = ref('');
let saveTimeout = null;

// 2. Fungsi eksekusi simpan ke backend API
const executeSave = async () => {
    saveStatus.value = 'saving';

    try {
        await axios.post('/api/user/profile-draft', userProfile.value);

        // Jika berhasil, perbarui status dan catat waktu jam saat ini
        const now = new Date();
        lastSavedAt.value = now.toLocaleTimeString('id-ID');
        saveStatus.value = 'saved';

        // Kembalikan ke status idle setelah 3 detik
        setTimeout(() => {
            if (saveStatus.value === 'saved') {
                saveStatus.value = 'idle';
            }
        }, 3000);
    } catch (error) {
        // Jika gagal koneksi, set ke status error agar tombol 'Coba Lagi' muncul
        console.error('Gagal auto-save:', error);
        saveStatus.value = 'error';
    }
};

// 3. Debounce watcher: Memicu simpan otomatis saat form berubah
watch(userProfile, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        executeSave();
    }, 1500);
}, { deep: true });

// 4. Handler saat pengguna menekan tombol 'Coba Lagi' di dalam badge error
const handleRetrySave = () => {
    executeSave();
};
</script>

<template>
  <div class="space-y-4 max-w-xl">
    <div>
      <label class="block text-sm font-semibold mb-1">Nama Lengkap</label>
      <input
        v-model="userProfile.full_name"
        type="text"
        class="w-full border rounded-xl p-2.5 text-sm"
      />
    </div>

    <div>
      <label class="block text-sm font-semibold mb-1">Bio Singkat</label>
      <textarea
        v-model="userProfile.bio"
        rows="3"
        class="w-full border rounded-xl p-2.5 text-sm"
      />
    </div>

    <!-- Toolbar Bawah: Status Badge di samping Tombol Submit -->
    <div class="flex items-center justify-between pt-3 border-t">
      <!-- AutoSaveStatus hanya bertindak sebagai visualizer murni -->
      <AutoSaveStatus
        variant="badge"
        size="sm"
        :status="saveStatus"
        :last-saved="lastSavedAt"
        @retry="handleRetrySave"
      />

      <button
        type="button"
        class="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
      >
        Simpan Permanen
      </button>
    </div>
  </div>
</template>
```

#### Penjelasan Detail Parameter & Alur:
* `variant="badge"`: Memerintahkan komponen untuk hanya menampilkan badge status ringkas di samping tombol submit, tanpa memunculkan banner pemulihan draf.
* `size="sm"`: Menggunakan skala dimensi kompak (`text-[11px]`, spinner 12px) yang proporsional diletakkan di footer atau header form sejajar dengan tombol aksi.
* `:status="saveStatus"`: Nilai reaktif string (`'idle'`, `'saving'`, `'saved'`, `'error'`, `'paused'`) yang secara langsung mengubah warna latar dan ikon status.
* `:last-saved="lastSavedAt"`: Nilai jam string yang ditampilkan di dalam kurung di samping teks centang hijau tersimpan.
* `@retry="handleRetrySave"`: Ketika status bernilai `'error'`, komponen otomatis menyisipkan tombol interaktif bertuliskan "Coba Lagi". Saat tombol tersebut diklik user, event `@retry` dipancarkan dan memicu fungsi `executeSave()` kembali.

---

### 3. Banner Draf Saja dengan Kustomisasi Teks (i18n)

Gunakan varian `variant="banner"` ketika Anda hanya membutuhkan blok notifikasi pemulihan draf di bagian atas halaman formulir onboarding, form pendaftaran panjang, atau lamaran kerja, tanpa perlu menampilkan badge status real-time di bawah.

Contoh berikut menunjukkan cara mendeteksi draf dari `window.localStorage` secara mandiri saat halaman dibuka, memulihkan data ke form, atau menghapusnya jika diabaikan.

```vue
<script setup>
import { ref, onMounted } from 'vue';
import AutoSaveStatus from '@/Components/Pack/AutoSaveStatus.vue';

const DRAFT_STORAGE_KEY = 'user_onboarding_draft';

const form = ref({
    company_name: '',
    npwp: '',
    address: '',
});

const hasDraft = ref(false);
const draftSavedTime = ref('');

// 1. Saat halaman dimount, periksa apakah terdapat draf tersimpan di localStorage browser
onMounted(() => {
    const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (rawDraft) {
        try {
            const parsed = JSON.parse(rawDraft);
            if (parsed && parsed.data) {
                hasDraft.value = true;
                draftSavedTime.value = parsed.time || 'sesi sebelumnya';
            }
        } catch (e) {
            console.error('Format draf tidak valid:', e);
        }
    }
});

// 2. Aksi saat pengguna menekan tombol "Ambil Kembali Data"
const onRestoreDraft = () => {
    const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (rawDraft) {
        const parsed = JSON.parse(rawDraft);
        form.value = { ...parsed.data };
    }
    // Sembunyikan banner setelah data dipulihkan ke form
    hasDraft.value = false;
};

// 3. Aksi saat pengguna menekan tombol "Buang Draf"
const onDiscardDraft = () => {
    // Hapus data dari localStorage agar tidak muncul lagi
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    // Sembunyikan banner
    hasDraft.value = false;
};
</script>

<template>
  <div class="space-y-5 max-w-xl">
    <!-- Banner Pemulihan Draf dengan Teks Bahasa Kustom (i18n) -->
    <AutoSaveStatus
      variant="banner"
      size="md"
      :has-draft="hasDraft"
      :draft-time="draftSavedTime"
      restore-text="Ambil Kembali Data"
      discard-text="Buang Draf"
      @restore="onRestoreDraft"
      @discard="onDiscardDraft"
    />

    <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100">
      Informasi Badan Usaha
    </h2>

    <div>
      <label class="block text-sm font-semibold mb-1">Nama Perusahaan</label>
      <input
        v-model="form.company_name"
        type="text"
        placeholder="PT Contoh Sejahtera"
        class="w-full border rounded-xl p-2.5 text-sm"
      />
    </div>

    <div>
      <label class="block text-sm font-semibold mb-1">Nomor Pokok Wajib Pajak (NPWP)</label>
      <input
        v-model="form.npwp"
        type="text"
        placeholder="00.000.000.0-000.000"
        class="w-full border rounded-xl p-2.5 text-sm"
      />
    </div>

    <div>
      <label class="block text-sm font-semibold mb-1">Alamat Kantor</label>
      <textarea
        v-model="form.address"
        rows="3"
        placeholder="Alamat domisili..."
        class="w-full border rounded-xl p-2.5 text-sm"
      />
    </div>
  </div>
</template>
```

#### Penjelasan Detail Parameter & Alur:
* `variant="banner"`: Menyembunyikan badge status secara total dan hanya merender banner draf kotak amber di atas formulir.
* `:has-draft="hasDraft"`: Boolean yang mengatur kemunculan banner. Jika `false`, banner tidak dirender (atau langsung menutup dengan transisi halus).
* `:draft-time="draftSavedTime"`: Menampilkan keterangan waktu kapan draf terakhir disimpan (misalnya: `"2 jam yang lalu"` atau `"Kemarin, 21:00"`).
* `restore-text="Ambil Kembali Data"`: Menggantikan teks tombol default (*"Pulihkan Draf"*) menjadi label yang sesuai dengan tone bahasa aplikasi Anda.
* `discard-text="Buang Draf"`: Menggantikan teks tombol kedua default (*"Abaikan"*).
* `@restore`: Callback yang dieksekusi saat tombol restore ditekan. Pada contoh di atas, data dari `localStorage` diambil dan dimasukkan ke variabel reaktif `form.value`, lalu `hasDraft.value` diset `false`.
* `@discard`: Callback yang dieksekusi saat tombol abaikan ditekan. Data di `localStorage` dihapus permanen (`removeItem`), lalu `hasDraft.value` diset `false`.

---

### 4. Sinkronisasi Dua Arah (`v-model="status"`)

Komponen mendukung binding dua arah native Vue 3 `v-model` untuk variabel status. Saat status berganti (misal via timeout atau aksi retry), nilai variabel di parent component otomatis tersinkronisasi.

```vue
<script setup>
import { ref } from 'vue';
import AutoSaveStatus from '@/Components/Pack/AutoSaveStatus.vue';

// Variabel status reaktif dua arah
const saveStatus = ref('saved'); // 'idle' | 'saving' | 'saved' | 'error' | 'paused'
const lastSaved = ref('17:45:10 WIB');
const hasDraft = ref(true);
const draftTime = ref('Hari ini, 17:42 WIB');

const onRestore = () => {
    hasDraft.value = false;
    saveStatus.value = 'saved';
};

const onDiscard = () => {
    hasDraft.value = false;
};

const onRetry = () => {
    saveStatus.value = 'saving';
    setTimeout(() => {
        saveStatus.value = 'saved';
    }, 1000);
};
</script>

<template>
  <div class="space-y-4">
    <!-- Binding dua arah v-model untuk status penyimpanan -->
    <AutoSaveStatus
      v-model="saveStatus"
      design="default"
      color="emerald"
      style="soft"
      radius="full"
      size="md"
      :last-saved="lastSaved"
      :has-draft="hasDraft"
      :draft-time="draftTime"
      @restore="onRestore"
      @discard="onDiscard"
      @retry="onRetry"
    />
  </div>
</template>
```

---

## 12. Result / Behavior

Diagram alur interaksi dan siklus status penyimpanan formulir:

```text
[User Mengetik pada Input Form]
               ↓
[useAutoSave Debounce Timer Dimulai (misal 1500ms)]
               ↓
[Timer Berakhir -> Status Berubah Menjadi 'saving']
               ↓
[AutoSaveStatus Menampilkan Spinner Animasi + "Menyimpan draf..."]
               ↓
        [Hasil Penyimpanan]
        ├── SUKSES ──→ Status Berubah Menjadi 'saved'
        │                 │
        │                 ├── Tampilkan check_circle + waktu simpan terakhir
        │                 └── Setelah delay tertentu, status transisi kembali ke 'idle'
        │
        └── GAGAL  ──→ Status Berubah Menjadi 'error'
                          │
                          ├── WAI-ARIA role="alert" diumumkan ke Screen Reader
                          ├── Tampilkan ikon error merah + teks gagal
                          └── User klik "Coba Lagi" ──→ Pemicu @retry / saveNow()
```

---

## 13. Customization

### Kustomisasi Label Bahasa (Internasionalisasi / i18n)
Jika aplikasi menggunakan bahasa Inggris atau terminologi spesifik:

```vue
<AutoSaveStatus
  :auto-save="autoSave"
  saving-text="Saving changes..."
  saved-text="All changes saved"
  error-text="Failed to save"
  paused-text="Auto-save paused"
  idle-text="Cloud synced"
  restore-text="Restore Draft"
  discard-text="Discard"
  retry-text="Retry Now"
/>
```

### Kustomisasi Slot Tombol Aksi Banner
Menambahkan tombol pratinjau tambahan di samping tombol pulihkan:

```vue
<AutoSaveStatus :auto-save="autoSave">
  <template #actions="{ restore, discard }">
    <div class="flex items-center gap-2">
      <button
        type="button"
        @click="previewDraft()"
        class="text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-300"
      >
        Lihat Draf
      </button>
      <button
        type="button"
        @click="restore()"
        class="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-600 text-white"
      >
        Pulihkan
      </button>
    </div>
  </template>
</AutoSaveStatus>
```

---

## 14. Accessibility

Komponen `AutoSaveStatus.vue` dibangun mengikuti pedoman aksesibilitas W3C WAI-ARIA:

* **WAI-ARIA Role Status Dinamis**:
  * Status normal (`idle`, `saving`, `saved`, `paused`) menggunakan `role="status"` dan `aria-live="polite"` agar screen reader membacakan pembaruan status secara halus tanpa mengganggu input pengguna.
  * Status `error` secara otomatis menaikkan tingkat prioritas menjadi `role="alert"` dan `aria-live="assertive"` agar pengguna tuna netra segera mengetahui bahwa proses penyimpanan data gagal.
* **Kontainer Banner Semantik**:
  * Banner pemulihan draf dilengkapi `role="region"` dan `aria-label="Pemberitahuan pemulihan draf"` untuk kemudahan navigasi via landmark pembaca layar.
* **Fokus Keyboard Interaktif**:
  * Seluruh tombol aksi (`restore`, `discard`, `retry`) memiliki kontur fokus visual yang tegas (`focus-visible:ring-2 focus-visible:ring-offset-1`).
  * Tombol retry dilengkapi atribut `aria-label="Coba simpan ulang draf"` untuk kejelasan konteks saat dibaca screen reader.

---

## 15. Responsive Behavior

* **Mobile Viewport (< 640px)**:
  * Banner pemulihan otomatis berubah menjadi susunan vertikal (`flex-col items-start gap-3`).
  * Tombol aksi meregang proporsional (`w-full flex-1`) untuk mempermudah sentuhan layar sentuh (*touch target*).
* **Desktop Viewport (>= 640px)**:
  * Banner tersusun horizontal sejajar (`flex-row items-center justify-between`).
  * Tombol aksi berada di sisi kanan dengan ukuran kompak (`w-auto flex-initial`).

---

## 16. Do / Don't

| Panduan Do (Direkomendasikan) | Panduan Don't (Dilarang / Hindari) |
| :--- | :--- |
| **Gunakan bersama useAutoSave**: Manfaatkan binding `:auto-save="autoSave"` untuk integrasi reaktif instan tanpa *state boilerplate*. | **Jangan duplikasi notifikasi**: Jika sudah memakai AutoSaveStatus, jangan memunculkan modal popup setiap kali auto-save berhasil. |
| **Beri ruang vertikal untuk banner**: Letakkan banner di bagian atas formulir sebelum tombol atau kolom input pertama. | **Jangan sembunyikan status error**: Pastikan status error selalu terlihat agar pengguna sadar saat terjadi kegagalan koneksi. |
| **Gunakan ukuran sm di header padat**: Pilih `size="sm"` jika indikator disematkan di dalam bar navigasi atau modal header. | **Jangan abaikan pembersihan draf**: Selalu pastikan draf dibersihkan setelah form berhasil di-submit secara permanen ke server. |

---

## 17. Examples / Recipes

### Resep 1: Formulir Artikel dengan Auto-Save dan Pemulihan Draf Lengkap

```vue
<script setup>
import { ref } from 'vue';
import AutoSaveStatus from '@/Components/Pack/AutoSaveStatus.vue';
import { useAutoSave } from '@/Composables/Pack/useAutoSave';
import { router } from '@inertiajs/vue3';

const form = ref({
    title: '',
    category_id: '',
    body: '',
});

const autoSave = useAutoSave(form, {
    key: 'article_editor_draft',
    debounceMs: 2000,
});

const submitArticle = () => {
    router.post('/articles', form.value, {
        onSuccess: () => {
            // Bersihkan draf lokal setelah berhasil submit permanen
            autoSave.clearDraft();
        },
    });
};
</script>

<template>
  <form @submit.prevent="submitArticle" class="space-y-6">
    <!-- Banner dan Status AutoSave -->
    <AutoSaveStatus :auto-save="autoSave" />

    <div>
      <label class="block text-sm font-semibold mb-1">Judul Artikel</label>
      <input v-model="form.title" type="text" class="w-full border rounded-xl p-2.5 text-sm" />
    </div>

    <div>
      <label class="block text-sm font-semibold mb-1">Isi Artikel</label>
      <textarea v-model="form.body" rows="8" class="w-full border rounded-xl p-2.5 text-sm" />
    </div>

    <div class="flex items-center justify-end gap-3 pt-4 border-t">
      <!-- Badge Status di sebelah tombol Simpan -->
      <AutoSaveStatus :auto-save="autoSave" variant="badge" size="sm" />
      <button type="submit" class="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold">
        Terbitkan Artikel
      </button>
    </div>
  </form>
</template>
```

### Resep 2: Modal Form dengan Badge Status Ukuran Kecil

```vue
<script setup>
import AutoSaveStatus from '@/Components/Pack/AutoSaveStatus.vue';

defineProps({
    savingState: { type: String, default: 'idle' },
    lastSavedTime: { type: String, default: '' },
});
</script>

<template>
  <div class="p-6 space-y-4">
    <div class="flex items-center justify-between pb-3 border-b">
      <h3 class="font-bold text-base">Edit Pengaturan Akun</h3>
      <!-- Badge mini di pojok kanan modal header -->
      <AutoSaveStatus
        variant="badge"
        size="sm"
        :status="savingState"
        :last-saved="lastSavedTime"
      />
    </div>

    <!-- Isi form modal -->
    <slot />
  </div>
</template>
```

---

## 18. Related Components

| Komponen | Fungsi | Kapan Digunakan |
| :--- | :--- | :--- |
| [Alert](/components/alert) | Banner notifikasi inline kontekstual | Menampilkan pesan error validasi umum atau pengumuman halaman |
| [Toast](/components/toast) | Notifikasi pop-up mengambang (*floating*) | Umpan balik sesaat setelah aksi tombol manual berhasil |
| [Badge](/components/badge) | Label status ringkas serbaguna | Penanda status statis entitas data seperti status akun atau pesanan |

---

## 19. Notes / Limitations

* **Ketergantungan Composable**: Untuk fungsionalitas otomatis penuh, komponen ini idealnya dipasangkan dengan `useAutoSave.js`. Namun komponen tetap dapat beroperasi secara mandiri (*standalone*) menggunakan prop manual.
* **Dependensi Font Ikon**: Komponen memanfaatkan ikon Google Material Symbols (`history`, `restore`, `check_circle`, `error`, `pause_circle`, `cloud_done`). Pastikan font Google Material Symbols telah dimuat di aplikasi Anda.
* **Penyimpanan Lokal vs Server**: Komponen hanya bertugas menyajikan status visual; persistensi data lokal dikelola oleh storage browser (`localStorage` / `sessionStorage`) melalui composable terkait.
* **Pembersihan Draf**: Pastikan untuk memanggil fungsi `clearDraft()` setelah pengiriman formulir berhasil ke server agar banner pemulihan draf tidak muncul kembali saat halaman dimuat ulang.
