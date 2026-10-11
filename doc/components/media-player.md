# Media Player Component

Komponen pemutar media terpadu (*unified media player*) berbasis Vue 3 dan Tailwind CSS yang dirancang untuk menangani berbagai bentuk media digital secara komprehensif, mulai dari video simpanan (*Video on Demand* / VoD), siaran langsung (*Live Streaming*), hingga pemutar suara/musik (*Audio Podcast Player*) lengkap dengan animasi gelombang visualizer.

---

## 01. Overview

`MediaPlayer` (dan fasad resminya `MediaPlayerComponent`) menyajikan antarmuka pemutar media modern bergaya *glassmorphism* dengan kendali pemutaran interaktif, bilah pencarian waktu (*scrubber seekbar*), kendali volume presisi, pemilih kecepatan putar (*playback rate*), pilihan resolusi kualitas video, *Picture-in-Picture* (PiP), mode teater lebar (*theater mode*), hingga kontrol layar penuh (*fullscreen*).

- **Dukungan Multi-Tipe Media Terintegrasi**: Mengakomodasi 3 mode media utama:
  1. `video`: Video on Demand (VoD) untuk rekaman pembelajaran LMS, trailer film, atau video katalog produk.
  2. `live`: Siaran langsung (*live broadcast*) dengan badge berkedip merah `LIVE`, counter jumlah penonton aktif, dan sinkronisasi real-time.
  3. `audio`: Pemutar podcast atau musik yang menampilkan sampul album (*artwork*), judul, artis, dan visualizer gelombang audio frekuensi dinamis.
- **Rasio Aspek Adaptif Penuh**: Menyediakan rasio aspek standar layar lebar (`16:9`), bioskop ultrawide (`21:9`), klasik (`4:3`), kotak persegi feed sosial (`1:1`), hingga video vertikal mobile (*Reels / Shorts*) (`9:16`).
- **Antarmuka Kontrol Glassmorphism Elegan**: Bilah kontrol mengambang dengan latar belakang *backdrop-blur* transparan yang otomatis tersembunyi (*auto-hide*) setelah beberapa detik inaktivitas saat media sedang diputar.
- **Navigasi Tombol Pintas Keyboard**: Mendukung shortcut keyboard standar YouTube / media profesional (`Space`/`K` untuk putar/jeda, `M` untuk bisukan, `F` untuk layar penuh, panah kiri/kanan untuk lompat waktu, dan panah atas/bawah untuk volume).
- **Gestur Sentuh Cerdas (Mobile Touch Gestures)**: Mendukung ketukan ganda (*double-tap*) pada sisi kiri untuk mundur 10 detik dan sisi kanan untuk maju 10 detik dengan animasi ripple interaktif.
- **Aksesibilitas Penuh WAI-ARIA**: Slider pencarian waktu dan volume menerapkan `role="slider"` dengan atribut `aria-valuenow`, `aria-valuemin`, dan `aria-valuemax` yang dapat dikendalikan melalui keyboard.

### 1.1 Apa Entitas Ini

**Vue Component** (Single File Component) yang berlokasi di [MediaPlayer.vue](file:///c:/SPEED/LARAVEL-PACK-UI/resources/js/Components/Pack/MediaPlayer.vue) dan diekspos melalui fasad [MediaPlayerComponent.vue](file:///c:/SPEED/LARAVEL-PACK-UI/resources/js/Components/Pack/MediaPlayerComponent.vue). Komponen ini membungkus elemen native HTML5 `<video>` dan `<audio>` dengan sistem kontrol kustom berbasis CSS murni dan reaktivitas Vue 3 Composition API.

### 1.2 Fungsi Utama

- Memutar video simpanan (MP4, WebM, Ogg) dengan kendali resolusi, kecepatan, dan buffering waktu.
- Menayangkan siaran streaming langsung dengan indikator status penonton dan waktu siaran.
- Menyajikan audio podcast atau trek musik dengan album art cover dan visualizer bar yang berdenyut selaras dengan status pemutaran.
- Memberikan kendali penuh melalui metode API publik seperti `play()`, `pause()`, `seek()`, `setVolume()`, dan `toggleFullscreen()`.

### 1.3 Kapan Digunakan

- Modul video tutorial, kursus online, dan kuliah interaktif pada sistem manajemen pembelajaran (LMS).
- Siaran webinar, live demo produk, dan acara peluncuran online pada platform komunitas.
- Pemutar trek musik, cuplikan suara produk, dan podcast berkala.
- Galeri video promosi, teaser trailer bioskop, dan video feed vertikal bergaya media sosial.

### 1.4 Karakteristik Penting

- **Double-Tap Ripple Gesture**: Mendeteksi ketukan cepat layar sentuh perangkat mobile untuk melompat 10 detik tanpa perlu menyentuh progress bar yang sempit.
- **Zero Heavy Dependency**: Menggunakan kapabilitas native browser HTML5 Media API dengan styling Tailwind CSS murni, tanpa dependensi pustaka pihak ketiga yang membebani bundle aplikasi.
- **Decoupled Facade Architecture**: Menggunakan pola fasad `MediaPlayerComponent.vue` yang meneruskan seluruh atribut, event emits, dan slot scoped secara transparan.

---

## 02. Preview

> [!TIP]
> Pengujian visual interaktif, pengalihan mode video/audio/live, dan skenario produksi tersedia langsung pada portal pratinjau aplikasi:
>
> <a href="/demo/media-player" target="_self" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 8px; background-color: var(--vp-c-brand-1, #4f46e5); color: #ffffff;">Buka Live Preview Komponen Media Player &rarr;</a>

---

## 03. Usage

### Pohon Konsep Penggunaan

```text
MediaPlayer / MediaPlayerComponent
├── 1. Video on Demand (type="video")
│   ├── Rasio 16:9 Widescreen Standar (Kuliah LMS / Tutorial)
│   ├── Rasio 21:9 Cinema Ultrawide (Trailer Bioskop / Teaser)
│   └── Rasio 9:16 Vertical Mobile (Shorts / Reels)
├── 2. Live Streaming (type="live")
│   ├── Siaran Webinar / Talkshow (live-badge-text="LIVE")
│   └── Counter Penonton Aktif (:viewers="3420")
└── 3. Audio Player (type="audio")
    ├── Podcast Player dengan Artwork & Judul Episode
    └── Visualizer Gelombang Frekuensi Berdenyut
```

### Kapan Digunakan vs Kapan Dihindari

| Skenario Kebutuhan | Gunakan `MediaPlayer` | Gunakan Alternatif Lain |
| :--- | :--- | :--- |
| Memutar video rekaman tutorial, video promosi, atau materi kursus dengan kontrol modern | Ya (`type="video"`) | — |
| Menayangkan live stream siaran dengan badge LIVE dan jumlah penonton aktif | Ya (`type="live"`) | — |
| Memutar file audio / podcast dengan tampilan album artwork dan equalizer animasi | Ya (`type="audio"`) | — |
| Menampilkan galeri foto produk dengan thumbnail zoom dan lightbox interaktif | Tidak | Gunakan `ProductGallery` |
| Mengunggah berkas audio/video dari perangkat pengguna ke server | Tidak | Gunakan `FileDropzone` |

### Alur Kerja Konseptual

```text
Inisialisasi Props (type, src, poster) -> Render Element Media (Video / Audio) ->
Bind Event Listeners (@timeupdate, @play, @pause, @waiting) ->
Hitung Buffer Range & Posisi Scrubber Progress Bar ->
Render Glassmorphism Overlay Controls (Play, Volume, Speed, Fullscreen) ->
Ekspos Metode Publik via defineExpose (play, pause, seek, setVolume)
```

### Format Berkas & Ekstensi yang Didukung

`MediaPlayer` dirancang dengan arsitektur multi-format adaptif yang mendeteksi format berkas secara dinamis:

| Kategori Media | Ekstensi & MIME Type | Mesin Pemutar (*Playback Engine*) | Keterangan & Fitur |
| :--- | :--- | :--- | :--- |
| **Live Stream (HLS)** | `.m3u8`<br>`application/x-mpegURL` | **Safari**: Native AVPlayer<br>**Chrome/Edge/Firefox**: Dynamic `Hls.js` Loader | Siaran langsung adaptif multi-bitrate (1080p, 720p, 480p, 360p) dengan auto-switching. |
| **Video VoD Standar** | `.mp4`, `.m4v`<br>`video/mp4` | Native HTML5 `<video>` | Format universal standar web dengan kompresi H.264 / AAC. |
| **Video Open Web** | `.webm`<br>`video/webm` | Native HTML5 `<video>` | Format web modern VP8 / VP9 / AV1 dengan efisiensi tinggi. |
| **Video Ogg / QuickTime**| `.ogv`, `.ogg`, `.mov`<br>`video/ogg` | Native HTML5 `<video>` | Format video terbuka dan berkas rekaman Apple QuickTime. |
| **Audio Studio / Musik** | `.mp3`<br>`audio/mpeg` | Native HTML5 `<audio>` | Format audio terpopuler dengan equalizer visualizer aktif. |
| **Audio Lossless / Wave**| `.wav`, `.flac`<br>`audio/wav`, `audio/flac` | Native HTML5 `<audio>` | Format audio jernih tanpa kompresi untuk instrumen presisi. |
| **Audio AAC / M4A** | `.aac`, `.m4a`, `.oga`<br>`audio/aac`, `audio/mp4` | Native HTML5 `<audio>` | Format audio streaming efisien standar industri penyiaran. |

> [!NOTE]
> Untuk siaran live streaming HLS (`.m3u8`), komponen **MediaPlayer** secara otomatis mendeteksi kapabilitas peramban:
> - Pada Safari & perangkat iOS/iPadOS, media langsung dieksekusi menggunakan mesin native WebKit AVPlayer.
> - Pada Chrome, Firefox, Edge, dan Android, MediaPlayer secara dinamis mengunduh pustaka `Hls.js` berbobot ringan saat pertama kali dibutuhkan (*on-demand CDN loading*), membaca manifest level resolusi, dan menyajikan opsi kualitas video secara otomatis tanpa menambah beban instalasi npm!

### Daftar Sampel Berkas Terverifikasi (CORS & Live Tested)

Berikut adalah tautan sampel publik yang telah teruji 100% aktif, mendukung HTTP 206 Partial Content, dan bebas dari kendala CORS:

| Tipe Media | Label Sampel | URL Sumber Media (`src`) | Poster Pratinjau |
| :--- | :--- | :--- | :--- |
| **Live Stream (.m3u8)** | Mux HLS Multi-Bitrate Broadcast | `https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8` | `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80` |
| **Live Stream (.m3u8)** | Tears of Steel HLS Stream | `https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8` | `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80` |
| **Video VoD (.mp4)** | View From A Blue Moon (1080p HD) | `https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4` | `https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg` |
| **Video VoD (.mp4)** | Disney Oceans Documenter (720p HD)| `https://vjs.zencdn.net/v/oceans.mp4` | `https://vjs.zencdn.net/v/oceans.png` |
| **Audio Studio (.mp3)** | Kishi Bashi — It All Began With a Burst | `https://cdn.plyr.io/static/demo/Kishi_Bashi_-_It_All_Began_With_a_Burst.mp3` | `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80` |
| **Audio Synth (.mp3)** | SoundHelix Instrumental Symphony | `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3` | `https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80` |

### Sintaks Dasar Single File Component

```vue
<script setup>
import MediaPlayerComponent from '@/Components/Pack/MediaPlayerComponent.vue';

// 1. Contoh Video on Demand (1080p MP4)
const videoUrl = 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4';
const posterUrl = 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg';

// 2. Contoh Live Streaming HLS (.m3u8)
const liveUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

// 3. Contoh Audio Podcast (.mp3)
const audioUrl = 'https://cdn.plyr.io/static/demo/Kishi_Bashi_-_It_All_Began_With_a_Burst.mp3';
</script>

<template>
    <!-- Contoh Pemutar Video on Demand -->
    <MediaPlayerComponent
        type="video"
        :src="videoUrl"
        :poster="posterUrl"
        title="View From A Blue Moon — 1080p"
        artist="Brain Farm Cinema"
        color-theme="primary"
        aspect-ratio="16:9"
        variant="card"
    />

    <!-- Contoh Pemutar Siaran Langsung HLS (.m3u8) -->
    <MediaPlayerComponent
        type="live"
        :src="liveUrl"
        live-badge-text="LIVE"
        :viewers="4890"
        live-category="Webinar Teknologi"
        color-theme="rose"
        aspect-ratio="16:9"
    />

    <!-- Contoh Pemutar Audio / Suara -->
    <MediaPlayerComponent
        type="audio"
        :src="audioUrl"
        title="It All Began With a Burst"
        artist="Kishi Bashi"
        color-theme="emerald"
        variant="card"
    />
</template>
```

---

## 04. Anatomy

Struktur arsitektur visual `MediaPlayer` tersusun dari blok-blok pembangun berikut:

```text
+-------------------------------------------------------------------------+
| [1] Header Overlay: Live Badge ("● LIVE") | Viewers | Watermark Logo   |
|                                                                         |
|                                                                         |
|                [2] Big Center Play Button (Glass Circle)                 |
|                                                                         |
|                                                                         |
| [3] Double-Tap Feedback (<- 10s / 10s ->)                               |
|                                                                         |
| +---------------------------------------------------------------------+ |
| | [4] Scrubber Progress Bar: [====Loaded====|===Played===(o)        ] | |
| |                                                                     | |
| | [5] Play/Pause [6] Rewind/Forward [7] Volume [8] Time (02:14/10:00) | |
| |                                    [9] Speed [10] PiP [11] Fullscreen | |
| +---------------------------------------------------------------------+ |
+-------------------------------------------------------------------------+
```

### Diagram Alur Reaktivitas Mermaid

```mermaid
graph TD
    A[Mount MediaPlayer] --> B[Inisialisasi Elemen Video / Audio]
    B --> C[Muat Metadata: Durasi, Volume, Status Mute]
    C --> D[Render Tampilan: Video Canvas / Audio Artwork]
    D --> E{Interaksi Pengguna?}
    E -->|Klik Play / Space| F[Panggil HTML5 play() / pause()]
    F --> G[Update isPlaying & Reset Auto-Hide Timer]
    E -->|Scrubbing Progress Bar| H[Kalkulasi Offset Waktu & Panggil seek()]
    H --> I[Update currentTime & Emit @seeked]
    E -->|Double Tap Layar| J[Pemicu Rewind -10s atau Forward +10s]
    J --> K[Tampilkan Animasi Ripple & Update Waktu]
    E -->|Ganti Kecepatan / Resolusi| L[Set playbackRate / activeQuality]
    L --> G
    E -->|Tombol Fullscreen / F| M[Panggil requestFullscreen()]
    M --> N[Update isFullscreen & Sesuaikan Layout]
```

### Rincian Bagian Anatomi

1. **Header Overlay**: Memuat badge siaran langsung (`liveBadgeText`), jumlah penonton (`viewers`), serta logo watermark brand di sudut kanan atas.
2. **Big Center Play Button**: Tombol lingkaran besar mengambang berbingkai *backdrop-blur* transparan saat media dalam kondisi jeda (*paused*).
3. **Double-Tap Feedback**: Indikator lingkaran animasi yang muncul sesaat ketika pengguna mengetuk dua kali sisi kiri atau kanan layar sentuh.
4. **Scrubber Progress Bar**: Bilah interaktif yang memuat persentase data terunduh (*buffer bar*), durasi berjalan (*played bar*), pin scrubber (*knob*), dan tooltip pratinjau waktu saat kursor melayang (*hover timestamp*).
5. **Playback Controls**: Tombol aksi putar, jeda, lompat mundur 10 detik, dan lompat maju 10 detik.
6. **Volume & Mute Control**: Ikon volume adaptif yang otomatis memunculkan slider geser volume horizontal saat kursor diarahkan ke atasnya (*hover expansion*).
7. **Time Duration Display**: Label waktu digital format menit dan detik (`mm:ss`) yang dapat diklik untuk beralih menampilkan sisa waktu pemutaran (*countdown*).
8. **Settings & Extras**: Menu popover untuk mengubah kecepatan putar (0.5x hingga 2x), resolusi berkas, Picture-in-Picture (PiP), mode teater lebar, dan tombol layar penuh.

---

## 05. Variants

Prop `variant` mengatur gaya wadah pembungkus (*container shell*) komponen:

| Varian | Karakter Tampilan | Skenario Penggunaan |
| :--- | :--- | :--- |
| `card` | Wadah gelap berbingkai halus dengan sudut membulat (*rounded-2xl*) dan bayangan lembut | Standar default untuk halaman kursus LMS, modul artikel, dan modal dialog. |
| `default` | Tampilan latar hitam pekat murni tanpa bayangan luar | Penyematan video layar penuh, halaman bioskop fokus tinggi. |
| `pill` | Bentuk kapsul melengkung membulat penuh (*rounded-full*) | Pemutar audio minimalis di bilah navigasi bawah (*floating bottom player*). |
| `bordered` | Garis tepi tegas (*border-2*) dengan sudut modern minimalis | Desain antarmuka teknis arsitektural atau dashboard korporat. |
| `flat` | Latar warna solid abu-abu gelap rata tanpa batas tepi | Integrasi widget video di dalam kartu dashboard yang sudah memiliki bingkai luar. |

---

## 06. Sizes & Aspect Ratios

### Skala Rasio Aspek (`aspectRatio`)

| Rasio Aspek | Proporsi Nilai | Karakter Visual | Penggunaan yang Direkomendasikan |
| :--- | :--- | :--- | :--- |
| `16:9` | Lebar standar 16:9 | Proporsional horizontal | Kuliah LMS, video YouTube, tutorial umum (**Default**). |
| `21:9` | Ultra lebar sinematik | Format bioskop lebar | Trailer film, teaser sinematik game, showcase visual. |
| `4:3` | Format klasik standar | Sedikit lebih tegak | Video dokumenter arsip, rekaman presentasi slide lama. |
| `1:1` | Persegi sempurna | Simetris bujur sangkar | Postingan feed sosial, cuplikan produk e-commerce. |
| `9:16` | Format vertikal mobile | Tegak penuh (*portrait*) | Video gaya TikTok / Instagram Reels / YouTube Shorts. |
| `auto` | Mengikuti berkas asli | Fleksibel adaptif | Pemutar podcast audio atau berkas dengan dimensi unik. |

---

## 07. States

| State | Indikasi Visual | Perilaku Interaktif |
| :--- | :--- | :--- |
| **Idle / Paused** | Poster gambar tampak jelas; tombol play besar lingkaran putih tampil di tengah layar. | Mengklik layar atau menekan `Space` memulai pemutaran seketika. |
| **Buffering** | Spinner lingkaran putih berputar di tengah layar dengan latar semi-transparan. | Pemutaran tertahan sementara menunggu segmen data terunduh dari jaringan. |
| **Playing** | Video bergerak mulus; bilah kontrol otomatis memudar dan tersembunyi setelah 3 detik. | Menggerakkan mouse atau menyentuh layar memunculkan kembali bilah kontrol. |
| **Ended** | Video berhenti pada frame akhir; tombol putar kembali ke status siap putar (*replay*). | Mengklik tombol putar memutar ulang media dari detik ke 0. |
| **Error** | Layar hitam dengan ikon peringatan merah dan pesan kesalahan jaringan/format. | Tombol "Coba Lagi" tersedia untuk memicu pemuatan ulang berkas. |
| **Live** | Badge merah berkedip `LIVE` tampil di kiri atas; progress bar disesuaikan ke mode siaran. | Pengguna menyaksikan siaran real-time bersama penonton lainnya. |

---

## 08. Props / Parameters / Attributes

| Prop | Tipe Data | Nilai Default | Wajib | Deskripsi & Validasi |
| :--- | :--- | :--- | :--- | :--- |
| `type` | `String` | `'video'` | Tidak | Mode media: `'video'` (VoD), `'audio'` (podcast/musik), atau `'live'` (siaran langsung). |
| `src` | `String \| Array \| Object` | — | Ya | URL berkas media tunggal, array sumber multi-resolusi `[{ src, quality, label }]`, atau mapping object `{ '1080p': '...', '720p': '...' }`. |
| `qualitySources`| `Object` | `{}` | Tidak | Peta sumber resolusi video eksplisit (misal: `{ '1080p': 'url1', '720p': 'url2' }`) untuk pergantian resolusi otomatis. |
| `poster` | `String` | `''` | Tidak | URL gambar poster pratinjau sebelum media dimainkan. |
| `tracks` | `Array` | `[]` | Tidak | Daftar berkas subtitle/closed-captions WebVTT. |
| `title` | `String` | `''` | Tidak | Judul konten media yang ditampilkan pada header/audio card. |
| `artist` | `String` | `''` | Tidak | Nama artis, kreator, pembicara, atau instruktur konten. |
| `theme` | `String` | `'auto'` | Tidak | Tema tampilan antarmuka: `'auto'` (mengikuti sistem/aplikasi), `'dark'` (memaksa tema gelap), atau `'light'` (memaksa tema terang dengan kartu audio latar bersih dan kontras tinggi). |
| `variant` | `String` | `'card'` | Tidak | Gaya wadah: `'card'`, `'default'`, `'pill'`, `'bordered'`, `'flat'`. |
| `radius` | `String` | `'2xl'` | Tidak | Kelengkungan sudut kontainer: `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'full'`. |
| `aspectRatio` | `String` | `'16:9'` | Tidak | Rasio aspek atau resolusi tampilan: `'16:9'`, `'1080p'`, `'720p'`, `'480p'`, `'360p'`, `'4:3'`, `'1:1'`, `'21:9'`, `'9:16'`, `'auto'`. Penggunaan rasio resolusi memberikan efek penyesuaian visual nyata pada video. |
| `colorTheme` | `String` | `'primary'` | Tidak | Tema warna aksen bilah kontrol: `'primary'`, `'spotify'` (hijau Spotify #10b981), `'youtube'` (merah YouTube #dc2626), `'indigo'`, `'rose'`, `'emerald'`, `'amber'`, `'cyan'`, `'dark'`. |
| `controls` | `Boolean` | `true` | Tidak | Menampilkan bilah kendali kontrol overlay modern (Spotify style untuk audio dan YouTube style untuk video). |
| `autoplay` | `Boolean` | `false` | Tidak | Memutar media otomatis saat dimuat (patuh kebijakan browser). |
| `loop` | `Boolean` | `false` | Tidak | Mengulang pemutaran media secara terus-menerus. |
| `muted` | `Boolean` | `false` | Tidak | Memulai pemutaran dalam kondisi suara dibisukan (didukung via `v-model:muted`). |
| `volume` | `Number` | `1` | Tidak | Tingkat volume suara awal (0.0 hingga 1.0) dengan dukungan sinkronisasi `v-model:volume`. |
| `playbackRate` | `Number` | `1` | Tidak | Kecepatan pemutaran awal (contoh: 1, 1.25, 1.5) dengan dukungan sinkronisasi `v-model:playbackRate`. |
| `quality` | `String` | `''` | Tidak | Label resolusi kualitas video aktif yang dipilih dengan dukungan sinkronisasi `v-model:quality`. |
| `preload` | `String` | `'metadata'` | Tidak | Strategi pra-muat browser: `'auto'`, `'metadata'`, `'none'`. |
| `autoHideDelay` | `Number` | `3000` | Tidak | Durasi jeda inaktivitas sebelum kontrol tersembunyi (dalam milidetik). |
| `playbackRates` | `Array` | `[0.5, 0.75, 1, 1.25, 1.5, 2]` | Tidak | Daftar opsi kecepatan putar media yang tersedia. |
| `qualities` | `Array` | `['Auto', '1080p', '720p', '480p', '360p']` | Tidak | Daftar label pilihan resolusi kualitas video fallback. |
| `defaultQuality`| `String` | `'Auto'` | Tidak | Kualitas resolusi bawaan yang terpilih pertama kali. |
| `allowFullscreen`| `Boolean` | `true` | Tidak | Mengaktifkan kemampuan tampilan layar penuh. |
| `allowPiP` | `Boolean` | `true` | Tidak | Mengaktifkan tombol Picture-in-Picture mengambang. |
| `allowTheater` | `Boolean` | `true` | Tidak | Mengaktifkan tombol mode teater lebar. |
| `keyboardShortcuts`| `Boolean` | `true` | Tidak | Mengaktifkan navigasi shortcut tombol keyboard. |
| `responsive` | `Boolean` | `true` | Tidak | Mengaktifkan adaptasi tata letak responsif otomatis. |
| `liveBadgeText` | `String` | `'LIVE'` | Tidak | Teks label badge siaran langsung pada mode `'live'`. |
| `viewers` | `Number` | `0` | Tidak | Jumlah total penonton aktif yang ditampilkan pada badge live. |
| `liveCategory` | `String` | `''` | Tidak | Label kategori siaran langsung (misal: 'Webinar Coding'). |
| `watermark` | `String` | `''` | Tidak | Teks label watermark identitas brand di sudut kanan atas. |
| `spectrum` | `Boolean` | `true` | Tidak | Mengaktifkan visualizer spektrum frekuensi audio real-time (khusus mode `type="audio"`). |
| `spectrumMode` | `String` | `'bars'` | Tidak | Mode visualisasi spektrum: `'bars'` (equalizer bar dengan peak hold), `'wave'` (gelombang sinus), `'mirror'` (simetris vertikal tengah). |
| `spectrumBarsCount`| `Number` | `40` | Tidak | Jumlah bar spektrum frekuensi yang dianalisis (rentang 16-64 bar, responsif otomatis di mobile/tablet). |
| `showVinyl` | `Boolean` | `true` | Tidak | Menampilkan animasi piringan kaset/vinyl yang berputar dan bergeser keluar dengan jarak aman dari judul album saat lagu dimainkan. |

---

## 09. Slots / Content

Komponen `MediaPlayer` dirancang sebagai sistem pemutar media mandiri (*fully self-contained media engine*). Seluruh elemen antarmuka—termasuk kontrol transport, penampil poster, bilah waktu scrubber, visualizer spektrum, dan penanda watermark—dikelola secara internal dan terpadu melalui props tanpa slot eksternal.

---

## 10. Events / Interactions / Returns

### Event yang Dipancarkan (Emits)

| Nama Event | Payload Tipe | Kondisi Pemicu | Deskripsi |
| :--- | :--- | :--- | :--- |
| `@play` | — | Media mulai diputar | Dipancarkan saat pemutaran dimulai. |
| `@pause` | — | Media dijeda | Dipancarkan saat pengguna menghentikan sementara pemutaran. |
| `@ended` | — | Pemutaran selesai | Dipancarkan saat video/audio mencapai durasi akhir. |
| `@timeupdate` | `Number` | Waktu pemutaran bergeser | Mengirimkan detik waktu pemutaran saat ini secara berkala. |
| `@seeking` | `Number` | Pengguna menyeret scrubber | Dipancarkan saat penyeretan scrubber sedang berlangsung. |
| `@seeked` | `Number` | Waktu baru dikonfirmasi | Dipancarkan saat lompatan waktu telah selesai dieksekusi. |
| `@volumechange`| `Number` | Volume diubah / dimute | Mengirimkan tingkat volume baru antara 0 hingga 1. |
| `@update:volume`| `Number` | Nilai volume berubah | Dipancarkan untuk sinkronisasi dua arah via `v-model:volume`. |
| `@update:muted` | `Boolean`| Status bisu berubah | Dipancarkan untuk sinkronisasi dua arah via `v-model:muted`. |
| `@update:loop` | `Boolean`| Status pengulangan berubah | Dipancarkan untuk sinkronisasi dua arah via `v-model:loop`. |
| `@ratechange` | `Number` | Kecepatan putar diubah | Mengirimkan nilai kecepatan baru (misal: 1.5). |
| `@update:playbackRate`| `Number`| Kecepatan putar berubah | Dipancarkan untuk sinkronisasi dua arah via `v-model:playbackRate`. |
| `@fullscreenchange`| `Boolean` | Status fullscreen berganti | Bernilai `true` saat masuk fullscreen dan `false` saat keluar. |
| `@qualitychange`| `String` | Pilihan resolusi diganti | Mengirimkan label kualitas baru (misal: '1080p'). |
| `@update:quality`| `String`| Resolusi aktif berubah | Dipancarkan untuk sinkronisasi dua arah via `v-model:quality`. |
| `@pipchange` | `Boolean` | Status PiP berganti | Bernilai `true` saat jendela Picture-in-Picture aktif. |
| `@theaterchange`| `Boolean` | Mode teater berganti | Bernilai `true` saat mode teater lebar diaktifkan. |
| `@toggle-spectrum`| — | Mode spektrum beralih | Dipancarkan saat visualizer spektrum frekuensi dialihkan. |
| `@error` | `Event` | Berkas gagal dimuat | Mengirimkan event error native browser. |

### Properti & Metode yang Diekspos (`defineExpose`)

Komponen `MediaPlayerComponent` mengekspos instance internal melalui template ref:

| Metode / Properti | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `play()` | `Method` | Memulai pemutaran media secara terprogram. |
| `pause()` | `Method` | Menjeda pemutaran media secara terprogram. |
| `togglePlay()` | `Method` | Beralih antara status putar dan jeda. |
| `seek(seconds)` | `Method` | Melompat ke detik waktu tertentu secara instan. |
| `forward(seconds)` | `Method` | Memajukan waktu sebesar durasi tertentu (default: 10 detik). |
| `rewind(seconds)` | `Method` | Memundurkan waktu sebesar durasi tertentu (default: 10 detik). |
| `setVolume(value)`| `Method` | Mengatur tingkat volume suara antara rentang `0.0` hingga `1.0`. |
| `mute()` / `unmute()`| `Method` | Membisukan atau menyalakan kembali suara audio. |
| `toggleMute()` | `Method` | Beralih antara status bersuara dan bisu. |
| `setPlaybackRate(r)`| `Method` | Mengubah kecepatan pemutaran (contoh: 0.75, 1, 1.5, 2). |
| `setQuality(q)` | `Method` | Mengubah kualitas resolusi video (misal: `'1080p'`, `'720p'`, `'Auto'`) secara mulus dengan mempertahankan posisi waktu (`currentTime`) dan status pemutaran (`isPlaying`). |
| `activeQuality` | `Ref<String>` | Label resolusi video aktif saat ini (contoh: `'1080p'`, `'720p'`, `'Auto'`). |
| `availableQualities`| `Computed<Array<String>>` | Daftar resolusi yang tersedia dari stream HLS atau konfigurasi multi-sumber berkas. |
| `showQualityMenu` | `Ref<Boolean>` | Status buka/tutup menu popover pilihan resolusi. |
| `isHdQuality` | `Computed<Boolean>` | Status apakah resolusi aktif tergolong High Definition (1080p, 720p, 4K, 2K). |
| `toggleFullscreen()`| `Method` | Mengaktifkan atau menonaktifkan mode layar penuh. |
| `togglePiP()` | `Method` | Mengaktifkan atau menonaktifkan Picture-in-Picture mengambang. |
| `toggleTheater()` | `Method` | Mengaktifkan atau menonaktifkan mode teater lebar. |
| `currentTime` | `Ref<Number>` | Detik waktu pemutaran aktif saat ini. |
| `duration` | `Ref<Number>` | Total durasi berkas media dalam detik. |
| `isPlaying` | `Ref<Boolean>` | Status apakah media sedang berjalan aktif. |
| `isBuffering` | `Ref<Boolean>` | Status apakah media sedang dalam proses buffering jaringan. |
| `isMuted` | `Ref<Boolean>` | Status apakah suara sedang dalam kondisi bisu. |
| `spectrumData` | `Ref<Array<Number>>` | Data bar frekuensi spektrum audio (0-100) per rentang Hz. |
| `peaksData` | `Ref<Array<Number>>` | Posisi titik puncak (*peak-hold dots*) yang melayang di atas bar. |
| `activeSpectrumMode`| `Ref<String>` | Mode spektrum aktif saat ini (`'bars'`, `'wave'`, atau `'mirror'`). |
| `setSpectrumMode(m)`| `Method` | Mengubah mode spektrum secara dinamis (`'bars'`, `'wave'`, `'mirror'`). |
| `isLooping` | `Ref<Boolean>` | Status pengulangan audio/media. |
| `toggleLoop()` | `Method` | Mengaktifkan atau mematikan fitur pemutaran ulang berkala (*loop*). |
| `isShuffle` | `Ref<Boolean>` | Status mode acak pada pemutar audio Spotify style. |
| `toggleShuffle()` | `Method` | Mengaktifkan atau mematikan pemutaran acak trek audio. |
| `isFavorited` | `Ref<Boolean>` | Status trek audio favorit (ikon love Spotify style). |
| `toggleFavorite()`| `Method` | Menandai atau membatalkan status favorit trek audio. |

---

## 11. Code Example

### 1. Penggunaan Dasar Video on Demand (Basic Example)

Penerapan minimal pemutar video 16:9 untuk modul halaman artikel atau kartu berita:

```vue
<script setup>
import MediaPlayerComponent from '@/Components/Pack/MediaPlayerComponent.vue';
</script>

<template>
    <MediaPlayerComponent
        type="video"
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        poster="https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80"
        title="Video Tutorial Dasar Laravel"
    />
</template>
```

### 2. Penggunaan Menengah Audio Podcast (Intermediate Example)

Penerapan pemutar suara podcast dengan poster cover art, judul episode, dan visualizer equalizer gelombang:

```vue
<script setup>
import MediaPlayerComponent from '@/Components/Pack/MediaPlayerComponent.vue';
</script>

<template>
    <MediaPlayerComponent
        type="audio"
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        poster="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&q=80"
        title="Episode 42: Menguasai Vue 3 Composition API"
        artist="Developer Insight Indonesia"
        color-theme="emerald"
        variant="card"
    />
</template>
```

### 3. Penggunaan Lanjutan Live Stream Siaran (Advanced / Enterprise Example)

Implementasi siaran langsung webinar dengan badge LIVE, counter penonton, kendali external controller, dan interaksi chat feed real-time:

```vue
<script setup>
import { ref } from 'vue';
import MediaPlayerComponent from '@/Components/Pack/MediaPlayerComponent.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const playerRef = ref(null);
const viewersCount = ref(4820);
const streamUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
const posterImage = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80';

function handleExternalPlay() {
    playerRef.value?.play();
}

function handleExternalMute() {
    playerRef.value?.toggleMute();
}
</script>

<template>
    <div class="max-w-4xl mx-auto space-y-4">
        <!-- Live Stream Video -->
        <MediaPlayerComponent
            ref="playerRef"
            type="live"
            :src="streamUrl"
            :poster="posterImage"
            live-badge-text="LIVE"
            :viewers="viewersCount"
            live-category="Webinar Architecture 2026"
            color-theme="rose"
            aspect-ratio="16:9"
            variant="card"
            watermark="ENTERPRISE-LIVE"
        />

        <!-- Panel Kendali Eksternal -->
        <div class="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span class="text-xs text-slate-500 font-medium">Bilah Kendali Moderator:</span>
            <div class="flex items-center gap-2">
                <ButtonSubmit size="xs" variant="primary" icon="play_arrow" @click="handleExternalPlay">
                    Mulai Siaran
                </ButtonSubmit>
                <ButtonSubmit size="xs" variant="outline" icon="volume_off" @click="handleExternalMute">
                    Toggle Bisukan
                </ButtonSubmit>
            </div>
        </div>
    </div>
</template>
```

### 4. Penggunaan Multi-Resolusi Video VoD & Penggantian Kualitas Dinamis (Change Resolution)

Mendukung pemutaran video dengan ragam pilihan resolusi (1080p Full HD, 720p HD, 576p SD, 480p, 360p, hingga Auto) baik melalui larik (*array*) sumber berkas, objek dictionary, maupun siaran adaptif HLS (.m3u8). Penggantian resolusi dilakukan secara mulus (*seamless stream swap*) tanpa mereset posisi durasi (`currentTime`) atau status putar:

```vue
<script setup>
import { ref } from 'vue';
import MediaPlayerComponent from '@/Components/Pack/MediaPlayerComponent.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const playerRef = ref(null);

// Opsi 1: Larik sumber multi-resolusi
const videoSources = [
    {
        src: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
        quality: '1080p',
        label: '1080p Full HD'
    },
    {
        src: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4',
        quality: '720p',
        label: '720p HD'
    },
    {
        src: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4',
        quality: '576p',
        label: '576p SD'
    }
];

// Opsi 2: Menggunakan prop qualitySources terpisah
const customQualityMap = {
    '1080p': 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
    '720p': 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4',
    '576p': 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4'
};

function changeTo720p() {
    playerRef.value?.setQuality('720p');
}

function changeTo1080p() {
    playerRef.value?.setQuality('1080p');
}
</script>

<template>
    <div class="max-w-4xl mx-auto space-y-4">
        <!-- Pemutar Video Multi-Resolusi -->
        <MediaPlayerComponent
            ref="playerRef"
            type="video"
            :src="videoSources"
            default-quality="1080p"
            title="View From A Blue Moon — Multi-Resolution VoD"
            artist="Brain Farm Cinema"
            color-theme="primary"
            aspect-ratio="16:9"
            variant="card"
        />

        <!-- Pengendali Resolusi Eksternal -->
        <div class="flex items-center gap-2 p-3 bg-slate-900 text-white rounded-xl">
            <span class="text-xs text-slate-400">Pilih Cepat Resolusi:</span>
            <ButtonSubmit size="xs" variant="primary" @click="changeTo1080p">
                Paksa 1080p HD
            </ButtonSubmit>
            <ButtonSubmit size="xs" variant="outline" @click="changeTo720p">
                Beralih ke 720p
            </ButtonSubmit>
        </div>
    </div>
</template>
```

---

## 12. Result / Behavior

1. **Auto-Hide Bilah Kontrol**: Ketika media sedang diputar, bilah kontrol akan memudar menghilang secara otomatis setelah 3 detik inaktivitas kursor pengguna, memberikan pengalaman menonton tanpa gangguan visual.
2. **Double-Tap Seeking di Layar Sentuh**: Mengetuk sisi kiri layar dua kali akan melompat mundur 10 detik, sedangkan mengetuk sisi kanan layar akan melompat maju 10 detik, memunculkan efek ripple melingkar sesaat.
3. **Penyelarasan Buffer Jaringan**: Bilah progress bar memuat lapisan abu-abu transparan yang merefleksikan persentase segmen berkas yang sudah berhasil diunduh ke buffer memori browser.
4. **Navigasi Tombol Keyboard**:
   - `Space` / `K`: Beralih antara status putar dan jeda.
   - `M`: Membisukan atau membunyikan suara audio.
   - `F`: Membuka atau menutup mode tampilan layar penuh (*fullscreen*).
   - `ArrowLeft` / `J`: Melompat mundur 5 detik (atau 10 detik dengan tombol `Shift`).
   - `ArrowRight` / `L`: Melompat maju 5 detik (atau 10 detik dengan tombol `Shift`).
   - `ArrowUp`: Menambah volume suara sebesar 10%.
   - `ArrowDown`: Mengurangi volume suara sebesar 10%.

---

## 13. Customization

### 13.1 Kustomisasi Tema Warna Bilah Kontrol (`colorTheme`)

Mengatur warna aksen progress bar, tombol aktif, dan badge tema:

```vue
<template>
    <!-- Aksen Emerald Hijau -->
    <MediaPlayerComponent src="/sample.mp4" color-theme="emerald" />

    <!-- Aksen Rose Merah Muda -->
    <MediaPlayerComponent src="/sample.mp4" color-theme="rose" />

    <!-- Aksen Amber Oranye -->
    <MediaPlayerComponent src="/sample.mp4" color-theme="amber" />
</template>
```

### 13.2 Format Vertikal Mobile Shorts / Reels (`aspectRatio="9:16"`)

Sangat cocok untuk membuat antarmuka cerita video vertikal ramah gawai ponsel pintar:

```vue
<template>
    <div class="max-w-xs mx-auto">
        <MediaPlayerComponent
            type="video"
            src="/reel-sample.mp4"
            aspect-ratio="9:16"
            color-theme="amber"
            title="Tips Desain Komponen #Shorts"
        />
    </div>
</template>
```

### 13.3 Kustomisasi Lapisan Konten Mengambang (`#overlay`)

Menyematkan tombol Call-To-Action (CTA), kartu kuis, atau pertanyaan interaktif di atas video:

```vue
<template>
    <MediaPlayerComponent type="video" src="/lecture.mp4">
        <template #overlay="{ isPlaying, currentTime }">
            <div v-if="currentTime > 30 && currentTime < 45" class="absolute top-6 left-6 z-25 p-3 rounded-xl bg-black/80 backdrop-blur-md text-white border border-white/20">
                <p class="text-xs font-bold">Kuis Interaktif Bab 1</p>
                <p class="text-[11px] text-slate-300">Siapakah penemu Vue.js?</p>
            </div>
        </template>
    </MediaPlayerComponent>
</template>
```

---

## 14. Accessibility (a11y)

- **WAI-ARIA Slider Pattern**: Elemen scrubber progress bar dan slider volume suara mengimplementasikan `role="slider"` lengkap dengan atribut `aria-valuenow`, `aria-valuemin="0"`, dan `aria-valuemax`.
- **Keyboard Trapping Protection**: Handler tombol pintas keyboard memeriksa elemen dokumen yang sedang aktif (`document.activeElement`) sehingga tidak menginterupsi pengetikan pengguna pada form `<input>` atau `<textarea>`.
- **Screen Reader Labels**: Seluruh tombol aksi kontrol dilengkapi atribut `aria-label` eksplisit (contoh: "Putar Media", "Bisukan Suara", "Layar Penuh") dan judul bantuan (*tooltips*).
- **Target Sentuh Minimum 44px**: Seluruh tombol kontrol memiliki area sentuh minimum 32px hingga 44px untuk memastikan keramahan pengoperasian pada layar gawai sentuh.

---

## 15. Responsive Behavior

### Tabel Adaptasi Breakpoint

| Viewport | Rentang Lebar | Perilaku Antarmuka Media Player |
| :--- | :--- | :--- |
| **Mobile** | `< 640px` | Tombol lompat waktu sekunder (-10s / +10s) dan mode teater otomatis disembunyikan untuk memberi ruang lega pada tombol putar dan durasi waktu; kontrol sentuh double-tap dioptimalkan. |
| **Tablet** | `640px - 1024px` | Menampilkan seluruh tombol kontrol dasar termasuk tombol lompat 10 detik dan kontrol Picture-in-Picture. |
| **Desktop** | `>= 1024px` | Bilah kontrol horizontal penuh dengan ekspansi hover slider volume, pemilih kecepatan, resolusi, mode teater, dan layar penuh. |

---

## 16. Do / Don't

| Do (Praktik Direkomendasikan) | Don't (Praktik Dihindari) |
| :--- | :--- |
| **Sediakan gambar `poster` berkualitas proporsional**: Mencegah layout shift dan memberikan visual menarik sebelum video dimuat. | **Jangan aktifkan `autoplay` bersuara keras tanpa interaksi**: Kebijakan browser modern memblokir autoplay bersuara dan mengganggu kenyamanan pengguna. |
| **Gunakan `type="audio"` untuk berkas suara / podcast**: Menghadirkan tampilan kartu khusus audio dengan animasi visualizer alih-alih layar video kosong. | **Jangan menonaktifkan `keyboardShortcuts` kecuali ada form game kompleks**: Tombol shortcut `Space`, `M`, dan panah sangat diharapkan pengguna awam. |
| **Gunakan `type="live"` untuk siaran streaming langsung**: Memastikan badge LIVE berkedip merah dan tombol seek menyesuaikan dengan mode siaran. | **Jangan memaksakan rasio aspek 16:9 untuk video vertikal ponsel**: Gunakan `aspectRatio="9:16"` agar video vertikal tidak terpotong. |

---

## 17. Examples / Recipes

### Recipe 1: Modul Kuliah LMS dengan Daftar Putar Bab Pembelajaran

```vue
<script setup>
import { ref } from 'vue';
import MediaPlayerComponent from '@/Components/Pack/MediaPlayerComponent.vue';

const playerRef = ref(null);
const chapters = [
    { title: '01. Pengenalan Komponen UI', time: 0 },
    { title: '02. Konfigurasi Props & Emits', time: 140 },
    { title: '03. Pengujian Responsif Mobile', time: 320 },
];

function jumpToChapter(seconds) {
    playerRef.value?.seek(seconds);
    playerRef.value?.play();
}
</script>

<template>
    <div class="space-y-4">
        <MediaPlayerComponent
            ref="playerRef"
            type="video"
            src="/courses/lecture-01.mp4"
            poster="/courses/cover.jpg"
            title="Arsitektur Komponen Modern"
            aspect-ratio="16:9"
        />
        <div class="grid grid-cols-3 gap-2">
            <button
                v-for="ch in chapters"
                :key="ch.title"
                type="button"
                class="p-2 text-xs rounded-lg border bg-white dark:bg-slate-800 text-left cursor-pointer hover:bg-slate-50"
                @click="jumpToChapter(ch.time)"
            >
                {{ ch.title }}
            </button>
        </div>
    </div>
</template>
```

### Recipe 2: Siaran Langsung Webinar dengan Counter Penonton Real-Time

```vue
<script setup>
import MediaPlayerComponent from '@/Components/Pack/MediaPlayerComponent.vue';
</script>

<template>
    <MediaPlayerComponent
        type="live"
        src="/live/stream.m3u8"
        poster="/live/webinar-poster.jpg"
        live-badge-text="LIVE"
        :viewers="3420"
        live-category="Tech Keynote 2026"
        color-theme="rose"
    />
</template>
```

### Recipe 3: Pemutar Audio Podcast dengan Cover Art dan Visualizer Frekuensi

```vue
<script setup>
import MediaPlayerComponent from '@/Components/Pack/MediaPlayerComponent.vue';
</script>

<template>
    <MediaPlayerComponent
        type="audio"
        src="/podcasts/episode-10.mp3"
        poster="/podcasts/cover-art.jpg"
        title="Ep. 10: Merancang Desain Sistem Skala Besar"
        artist="Podcast Teknologi"
        color-theme="emerald"
        variant="card"
    />
</template>
```

### Recipe 4: Format Video Vertikal 9:16 untuk Reels / Shorts Mobile

```vue
<script setup>
import MediaPlayerComponent from '@/Components/Pack/MediaPlayerComponent.vue';
</script>

<template>
    <div class="max-w-xs mx-auto">
        <MediaPlayerComponent
            type="video"
            src="/shorts/tip-01.mp4"
            poster="/shorts/cover.jpg"
            aspect-ratio="9:16"
            color-theme="amber"
            title="Tips Kilat Optimasi CSS #Shorts"
        />
    </div>
</template>
```

---

## 18. Related Items

- [Badge](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/badge.md): Komponen lencana untuk menampilkan label status siaran langsung atau kategori video.
- [ButtonSubmit](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/button-submit.md): Tombol interaksi untuk kendali kontrol eksternal player.
- [Card](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/card.md): Kontainer pembungkus modul video dan daftar materi terkait.
- [Skeleton](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/skeleton.md): Komponen animasi pemuatan sementara saat data streaming berkas sedang disiapkan.
- [ProductGallery](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/product-gallery.md): Galeri media foto produk komplementer untuk ulasan visual.

---

## 19. Notes / Limitations

- **Kebijakan Autoplay Browser**: Kebijakan keamanan browser modern (seperti Chrome Autoplay Policy) memblokir pemutaran otomatis berkas video/audio yang bersuara tanpa interaksi gesture pengguna sebelumnya. Gunakan prop `muted="true"` jika membutuhkan fitur *autoplay* saat halaman pertama kali dibuka.
- **Kepatuhan CORS Subtitle**: File WebVTT pada prop `tracks` harus disajikan dari domain yang sama atau memiliki header `Access-Control-Allow-Origin: *` agar browser diizinkan merender teks subtitle.
- **Dukungan HLS Streaming (.m3u8)**: Untuk berkas siaran live streaming HLS (`.m3u8`), browser Safari/iOS menggunakan native AVPlayer WebKit, sedangkan Chrome, Edge, Firefox, dan Android secara otomatis memanfaatkan *dynamic on-demand loader* `Hls.js` yang langsung membaca multi-bitrate levels dan menyediakan opsi resolusi adaptif (1080p, 720p, 480p, 360p).
- **Sinkronisasi Fasad**: Komponen `MediaPlayerComponent.vue` merupakan fasad alias resmi dari `MediaPlayer.vue`. Keduanya memiliki fungsionalitas dan dukungan props yang 100% identik.
