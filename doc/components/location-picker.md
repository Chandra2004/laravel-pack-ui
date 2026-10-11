# LocationPicker Component

Komponen pemilih tag lokasi dan titik alamat interaktif (*Interactive Map Tag Location & Address Picker*) berbasis Vue 3, Leaflet, dan OpenStreetMap. Memungkinkan pengguna menentukan titik lokasi presisi di peta, mendeteksi koordinat GPS secara instan, mencari nama tempat/gedung, serta mendapatkan data latitude, longitude, nama jalan, kota, dan kode pos secara otomatis tanpa biaya API Key.

---

## 01. Overview

`LocationPicker` dirancang untuk menyederhanakan alur penentuan alamat fisik dan koordinat geospasial pada aplikasi web modern:

- **Peta Interaktif OpenStreetMap & Leaflet**: 100% open source dan bebas biaya kuota API perorangan atau korporat.
- **Pin Marker Presisi**: Indikator titik akurat dengan efek *teardrop pin* yang dapat digeser (*drag-and-drop*) atau dipindahkan dengan satu klik di kanvas peta.
- **Deteksi GPS HTML5**: Memusatkan peta langsung ke koordinat perangkat pengguna secara instan via Geolocation API.
- **Reverse Geocoding Otomatis**: Layanan Nominatim OSM menerjemahkan titik latitude/longitude menjadi nama jalan, kelurahan, kecamatan, kota, dan kode pos secara natural.
- **Kotak Pencarian Tempat (Autocomplete)**: Menyediakan pencarian tempat terintegrasi dengan animasi *flyTo* halus ke lokasi yang dipilih.
- **Dua Mode Tampilan**: Mendukung mode `modal` (popup dialog layar penuh responsif) dan mode `inline` (akordeon tersemat langsung di dalam formulir).
- **Integrasi Fasad Universal**: Dapat digunakan sebagai komponen mandiri atau dipanggil via fasad universal `<InputField type="location" />`.

### 1.1 Apa Entitas Ini

**Vue Component** (Single File Component) yang berlokasi di [LocationPicker.vue](file:///c:/SPEED/LARAVEL-PACK-UI/resources/js/Components/Pack/LocationPicker.vue). Komponen ini membungkus kanvas Leaflet, integrasi geocoding Nominatim, manajemen status izin GPS, serta formulir masukan alamat ke dalam satu komponen independen yang siap pakai.

### 1.2 Fungsi Utama

- Menyediakan antarmuka input alamat terpadu dengan tombol pemicu peta, tombol deteksi GPS, dan tombol hapus (*clear*).
- Menyajikan pill badge koordinat ringkas di bawah kolom input lengkap dengan tombol salin cepat (*click to copy*).
- Mengelola inisialisasi peta Leaflet secara dinamis dengan penanganan `invalidateSize()` otomatis saat dialog dibuka.
- Mendukung preset titik kota-kota besar di Indonesia (Jakarta, Bandung, Surabaya, Yogyakarta, Medan, Makassar, Bali) untuk navigasi cepat.
- Menghasilkan data keluaran terstruktur berupa objek `{ lat, lng, address, city, postal_code }` yang langsung siap disimpan ke basis data.

### 1.3 Kapan Digunakan

- Formulir checkout pengiriman pesanan barang (*e-commerce delivery address*).
- Pendaftaran titik cabang kantor, lokasi gudang, gerai ritel, atau agen warung.
- Formulir pelaporan insiden lapangan, presensi kehadiran berbasis radius geofence, atau inspeksi aset.
- Profil pengguna dan alamat penagihan (*billing & shipping address*).
- Panel pencarian properti dan direktori lokasi bisnis (*business directory*).

### 1.4 Karakteristik Penting

- **Tanpa Biaya Layanan**: Tidak memerlukan kredensial berbayar seperti Google Maps Platform API Key untuk kebutuhan fungsionalitas dasar.
- **Dual Binding Support**: Mendukung pengikatan data objek penuh (`v-model="location"`) maupun pengikatan variabel terpisah (`v-model:lat`, `v-model:lng`, `v-model:address`).
- **Aman Layar Sentuh**: Mendukung gestur cubit-zoom (*pinch-to-zoom*) dan geser peta dengan sentuhan jari pada perangkat seluler.
- **Proteksi Hydration SSR**: Penundaan pemuatan pustaka Leaflet pada siklus `onMounted` untuk mencegah galat akses objek `window` pada lingkungan SSR.

---

## 02. Preview

> [!TIP]
> Pengujian visual dan showcase interaktif entitas ini tersedia secara native pada portal pratinjau aplikasi:
>
> <a href="http://localhost:8000/preview/location-picker" target="_self" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 8px; background-color: var(--vp-c-brand-1, #4f46e5); color: #ffffff;">Buka Live Preview Komponen LocationPicker / Input Location &rarr;</a>

---

## 03. Usage

### Pohon Konsep Penggunaan

```text
LocationPicker
├── Cara Pemanggilan
│   ├── Fasad Universal (<InputField type="location" />)
│   └── Komponen Mandiri (<LocationPicker />)
├── Mode Tampilan
│   ├── Modal Overlay (display-mode="modal")
│   └── Inline Accordion (display-mode="inline")
└── Struktur Data Output
    ├── Objek Lengkap ({ lat, lng, address, city, postal_code })
    └── Binding Mandiri (:lat, :lng, :address)
```

### Sintaks Dasar Komponen Mandiri

```vue
<script setup>
import { ref } from 'vue';
import LocationPicker from '@/Components/Pack/LocationPicker.vue';

const location = ref({
    lat: -6.175392,
    lng: 106.827153,
    address: 'Kawasan Monumen Nasional, Gambir, Jakarta Pusat',
    city: 'Jakarta Pusat',
    postal_code: '10110',
});
</script>

<template>
    <LocationPicker
        v-model="location"
        label="Titik Alamat Pengiriman Logistik"
        placeholder="Tentukan lokasi di peta atau gunakan deteksi GPS..."
        hint="Klik tombol Peta untuk membuka dialog peta interaktif."
        required
    />
</template>
```

### Penggunaan Melalui Fasad Universal InputField

```vue
<script setup>
import { ref } from 'vue';
import InputField from '@/Components/Pack/InputField.vue';

const warehouseLocation = ref(null);
</script>

<template>
    <InputField
        v-model="warehouseLocation"
        type="location"
        label="Lokasi Titik Gudang Penyangga"
        placeholder="Pilih koordinat gudang..."
    />
</template>
```

---

## 04. Anatomy

Struktur anatomi visual komponen `LocationPicker` dirancang terpadu antara formulir dan peta kanvas:

```text
+-------------------------------------------------------------------------+
| [1] Label Header: Titik Alamat Pengiriman *                             |
+-------------------------------------------------------------------------+
| [2] [pin] [3] Input Field: Jl. Medan Merdeka Barat...     [X] [GPS] [MAP]|
+-------------------------------------------------------------------------+
| [4] Coordinates Badge Pill:                                             |
| [pin] -6.175392, 106.827153  [copy]              Kota: Jakarta Pusat    |
+-------------------------------------------------------------------------+
|                                                                         |
| (Ketika tombol [MAP] diklik -> Modal / Inline Kanvas Terbuka)           |
| +---------------------------------------------------------------------+ |
| | [5] Search Bar Tempat: [Cari nama gedung, jalan, atau landmark...] | |
| +---------------------------------------------------------------------+ |
| | [6] Leaflet Map Canvas                                              | |
| |   [+]                                                               | |
| |   [-]               ( * ) Teardrop Marker Pin                       | |
| |                                                                     | |
| |   [Presets: Jakarta | Bandung | Surabaya | Bali]                    | |
| +---------------------------------------------------------------------+ |
| | [7] Dialog Footer Actions:  [Batal]             [Gunakan Lokasi Ini]| |
| +---------------------------------------------------------------------+ |
+-------------------------------------------------------------------------+
```

### Diagram Alur Interaksi & Data Geospasial (Mermaid)

```mermaid
graph TD
    A[Pengguna / Interaksi Form] -->|Ketik Alamat di Input Bar| B(Nominatim Autocomplete Search)
    A -->|Klik Tombol GPS| C(HTML5 Geolocation API)
    A -->|Klik Tombol Peta| D(Buka Leaflet Map Canvas)

    B -->|Pilih Item Rekomendasi| E[Ekstrak Koordinat Lat & Lng]
    C -->|Izin Akses Lokasi Diberikan| F[Dapatkan Koordinat Terkini]
    D -->|Geser / Klik Marker Pin di Kanvas| F

    F -->|Reverse Geocoding Asinkron| G[Nominatim Reverse Geocoding]
    G -->|Ekstrak Nama Jalan, Kota, Kode Pos| H[Sinkronisasi Objek Geospasial]
    E --> H

    H -->|Pill Badge Koordinat Terupdate| I[UI Feedback & Salin Cepat]
    H -->|Pancarkan Event Reaktif| J[@update:modelValue / @change]
```

### Rincian Bagian Anatomi

1. **Label Header**: Teks label penjelas field beserta tanda asterisk wajib (`*`) jika properti `required` bernilai true.
2. **Leading Pin Icon**: Ikon pin navigasi yang berubah warna menjadi hijau (`text-emerald-500`) saat titik lokasi valid telah terpilih.
3. **Main Input Field**: Kolom teks alamat yang dapat diedit langsung secara manual atau diisi otomatis oleh hasil reverse geocoding.
4. **Action Button Group**:
   - *Clear Button*: Menghapus teks alamat dan mereset nilai koordinat.
   - *GPS Button*: Mengaktifkan deteksi lokasi perangkat saat ini melalui HTML5 Geolocation.
   - *Map Trigger Button*: Membuka kanvas peta interaktif (modal dialog atau akordeon inline).
5. **Coordinates Badge Pill**: Bilah ringkas di bawah input yang menyajikan teks latitude, longitude, tombol salin ke clipboard, dan status kota.
6. **Search Bar Tempat**: Kolom pencarian alamat dengan query debounce otomatis ke layanan Nominatim OpenStreetMap.
7. **Leaflet Map Canvas**: Area peta interaktif dengan kontrol zoom, drag marker, dan tombol navigasi preset kota.
8. **Dialog Footer Actions**: Tombol konfirmasi penerapan koordinat terpilih kembali ke formulir utama.

---

## 05. Variants

Komponen mendukung dua varian tata letak melalui properti `displayMode`:

| Varian | Mode Tampilan | Karakteristik & Skenario Penggunaan |
| :--- | :--- | :--- |
| `modal` | **Dialog Layar Penuh** | **Default**. Memunculkan modal dialog mengambang dengan latar belakang blur. Memberikan sudut pandang peta yang sangat luas dan nyaman untuk penyesuaian pin di layar desktop maupun perangkat seluler. |
| `inline` | **Akordeon Tersemat** | Menampilkan kontainer peta langsung di bawah kolom input di dalam aliran dokumen formulir. Sangat cocok untuk formulir multi-langkah (*stepper wizard*) atau alur checkout cepat tanpa mengganggu konteks halaman. |

---

## 06. Sizes

Komponen `LocationPicker` menyediakan prop `size` (`'sm'`, `'md'`, `'lg'`) serta kelengkungan sudut `rounded` (`'none'` s/d `'full'`) yang sepenuhnya selaras dengan standar desain antarmuka `InputField`:

### Matriks Ukuran Input & Tombol Aksi (`size`)

| Ukuran (`size`) | Ketinggian Bar | Ukuran Tipografi | Padding Kanan (Action Cluster) | Tombol Aksi Ikon (`w x h`) | Rekomendasi Penggunaan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `sm` | `h-9` (36px) | `text-xs` | `pr-28` (112px) | `w-6 h-6` (24x24px) | Formulir ringkas, modal sempit, atau bilah filter data. |
| `md` | `h-10.5` (42px) | `text-sm` | `pr-34` (136px) | `w-7 h-7` (28x28px) | **Default**. Standar formulir checkout dan registrasi desktop. |
| `lg` | `h-12` (48px) | `text-base` | `pr-40` (160px) | `w-8.5 h-8.5` (34x34px) | Layar sentuh mobile besar, kios swalayan, atau formulir hero. |

### Kelengkungan Sudut (`rounded`)

Mendukung opsi `'none'`, `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'` (bawaan), `'2xl'`, `'3xl'`, dan `'full'` (pill). Border-radius tombol aksi ikon internal di dalamnya otomatis terkalibrasi secara harmonis sehingga efek hover bujur sangkar tidak pernah menabrak tepi luar input bar.

### Dimensi Kanvas Peta & Marker Pin

- **Ketinggian Peta Inline**: Ketinggian tetap `h-72` (288 piksel) yang ringkas dan hemat ruang.
- **Ketinggian Peta Modal**: Ketinggian minimum `min-h-[420px]` dengan batasan container maksimal `max-h-[92vh]` dan lebar proporsional `max-w-4xl`.
- **Marker Pin Geometri**: Custom SVG teardrop pin berdimensi 38x50 piksel dengan *anchor point* presisi pixel-perfect `iconAnchor: [17, 42]` di ujung lancip jarum koordinat.

---

## 07. States

| State | Indikator Visual | Perilaku Pengguna & Sistem |
| :--- | :--- | :--- |
| **Empty / Default** | Kolom input kosong, ikon pin abu-abu netral, badge koordinat tidak muncul. | Menunggu pengguna mengetik alamat, menekan tombol GPS, atau membuka peta. |
| **Filled / Selected** | Ikon pin hijau emerald menyala, teks alamat terisi, pill badge koordinat muncul aktif di bawah input. | Koordinat valid telah terikat; pengguna dapat menyalin koordinat atau membuka peta untuk penyesuaian. |
| **GPS Detecting** | Ikon tombol GPS berputar (*spin animation*) dengan status loading aktif. | Peramban sedang meminta izin akses lokasi ke sistem operasi perangkat. |
| **Reverse Geocoding** | Teks pada badge koordinat menampilkan keterangan "Mengambil nama jalan...". | Sistem sedang mengirim kueri asinkron ke server Nominatim untuk mengonversi koordinat menjadi alamat jalan. |
| **Searching Places** | Indikator spinner aktif di dalam kotak pencarian peta. | Sistem sedang mengambil 5 saran nama tempat atau gedung yang sesuai dengan kata kunci pencarian. |
| **Error** | Garis batas merah `border-rose-500` dengan cincin fokus `ring-rose-500/20`, pesan galat muncul di bawah input. | Validasi formulir gagal (misal: alamat wajib diisi atau koordinat berada di luar wilayah layanan). |
| **Disabled** | Opacity meredup 60%, kursor `not-allowed`, tombol GPS dan Peta terkunci. | Seluruh interaksi input dinonaktifkan. |
| **Readonly** | Peta terkunci, teks alamat tidak dapat diedit manual, namun tombol salin koordinat tetap berfungsi. | Pengguna hanya dapat meninjau titik lokasi yang sudah tersimpan tanpa mengubah posisinya. |

---

## 08. Props / Attributes

Spesifikasi lengkap properti yang diterima oleh komponen `LocationPicker`:

| Nama Prop | Tipe Data | Nilai Bawaan | Opsi / Rentang | Penjelasan Fungsional |
| :--- | :--- | :--- | :--- | :--- |
| `modelValue` | `Object \| String` | `null` | Object atau String | Objek data `{ lat, lng, address, city, postal_code }` atau string koordinat gabungan. |
| `lat` | `Number` | `null` | Koordinat latitude | Nilai latitude langsung untuk pengikatan data terpisah (`v-model:lat`). |
| `lng` | `Number` | `null` | Koordinat longitude | Nilai longitude langsung untuk pengikatan data terpisah (`v-model:lng`). |
| `address` | `String` | `''` | Teks alamat | Nilai alamat langsung untuk pengikatan data terpisah (`v-model:address`). |
| `size` | `String` | `'md'` | `'sm'`, `'md'`, `'lg'` | Dimensi proporsional kolom masukan alamat dan kelompok tombol aksi. |
| `rounded` | `String` | `'xl'` | `'none'`, `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`, `'full'` | Tingkat kelengkungan sudut bingkai bar input dan tombol aksi di dalamnya. |
| `label` | `String` | `''` | String teks | Label judul formulir di atas kolom input. |
| `placeholder` | `String` | `'Tentukan lokasi...'` | String teks | Teks petunjuk di dalam kolom masukan alamat. |
| `required` | `Boolean` | `false` | `true`, `false` | Menampilkan tanda bintang merah pada label dan menandai field wajib diisi. |
| `disabled` | `Boolean` | `false` | `true`, `false` | Menonaktifkan seluruh kontrol input dan peta interaktif. |
| `readonly` | `Boolean` | `false` | `true`, `false` | Mengunci formulir dalam mode baca saja. |
| `error` | `String` | `''` | Pesan galat | Pesan kesalahan validasi formulir dari Laravel Inertia. |
| `hint` | `String` | `''` | Teks petunjuk | Petunjuk operasional di bawah kolom input. |
| `defaultCenter` | `Array` | `[-6.2088, 106.8456]` | Array `[lat, lng]` | Titik pusat awal peta saat pertama kali dibuka jika belum ada koordinat tersimpan. |
| `defaultZoom` | `Number` | `14` | `1` hingga `19` | Tingkat pembesaran (*zoom level*) awal peta kanvas. |
| `showCoordinates` | `Boolean` | `true` | `true`, `false` | Alias kustomisasi on/off tampilan teks badge koordinat Lat & Lng di bawah kolom input. |
| `showCoordinatesBadge` | `Boolean` | `true` | `true`, `false` | Menampilkan pill badge nilai koordinat di bawah kolom input. |
| `displayMode` | `String` | `'modal'` | `'modal'`, `'inline'` | Mode tampilan peta: dialog modal popover atau accordion inline yang mekar di bawah kolom input. |
| `color` | `String` | `'primary'` | `'primary'`, `'emerald'`, `'blue'`, `'indigo'`, `'violet'`, `'amber'`, `'rose'`, `'cyan'` | Kustomisasi skema warna aksen marker pin Leaflet SVG, ground pulse, tombol aksi, dan cincin fokus. |
| `autocomplete` | `Boolean` | `true` | `true`, `false` | Mengaktifkan dropdown rekomendasi alamat instan otomatis saat pengguna mengetik di kolom input teks. |
| `embedded` | `Boolean` | `false` | `true`, `false` | Penanda internal saat dipanggil via `<InputField type="location">` agar header label dan footer pesan galat tidak terduplikasi. |
| `hideHeader` | `Boolean` | `false` | `true`, `false` | Menyembunyikan judul label di atas bar masukan alamat. |
| `hideFooter` | `Boolean` | `false` | `true`, `false` | Menyembunyikan petunjuk hint dan pesan error di bawah bar masukan alamat. |
| `id` | `String` | `''` | String teks | ID unik elemen input untuk atribut formulir DOM. |
| `name` | `String` | `''` | String teks | Atribut nama input untuk identifikasi formulir HTTP. |
| `tileLayer` | `String` | `'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'` | URL template | URL template tile layer peta OpenStreetMap. |

---

## 09. Slots

| Nama Slot | Properti Scope | Deskripsi Penggunaan |
| :--- | :--- | :--- |
| `#label` | -- | Kustomisasi elemen label judul di atas kolom masukan. |
| `#suggestion` | `{ item, select }` | Kustomisasi tampilan tiap baris rekomendasi alamat pada dropdown autocomplete saat mengetik. |
| `#hint` | -- | Kustomisasi area teks petunjuk informasi di bagian footer. |
| `#error` | -- | Kustomisasi struktur tampilan pesan galat validasi di bagian footer. |

---

## 10. Events / Interactions

| Nama Event | Parameter Emitted | Waktu Pemicuan (Trigger Lifecycle) |
| :--- | :--- | :--- |
| `@update:modelValue` | `(payload: Object)` | Dipancarkan secara instan saat data lokasi (lat, lng, atau address) mengalami perubahan. |
| `@update:lat` | `(lat: Number)` | Dipancarkan saat nilai koordinat latitude diperbarui. |
| `@update:lng` | `(lng: Number)` | Dipancarkan saat nilai koordinat longitude diperbarui. |
| `@update:address` | `(address: String)` | Dipancarkan saat teks nama alamat jalan diperbarui. |
| `@change` | `(payload: Object)` | Dipancarkan saat pengguna menyelesaikan penentuan titik lokasi pada peta dan menekan tombol konfirmasi. |
| `@select` | `(payload: Object)` | Dipancarkan saat pengguna mengonfirmasi atau memilih titik lokasi dari peta atau rekomendasi autocomplete. |

---

## 11. Code Example

Contoh implementasi pendaftaran gerai cabang fisik dengan integrasi Inertia Form Helper dan koordinat awal Kota Bandung:

```vue
<script setup>
import { useForm } from '@inertiajs/vue3';
import LocationPicker from '@/Components/Pack/LocationPicker.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const form = useForm({
    branchName: 'Cabang Dago Heritage',
    contactPerson: 'Bambang Soedirman',
    location: {
        lat: -6.8854,
        lng: 107.6137,
        address: 'Jl. Ir. H. Juanda No. 120, Dago, Bandung',
        city: 'Kota Bandung',
        postal_code: '40135',
    },
});

function submitBranch() {
    form.post('/branches', {
        preserveScroll: true,
        onSuccess: () => alert('Data cabang berhasil disimpan!'),
    });
}
</script>

<template>
    <form @submit.prevent="submitBranch" class="max-w-xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">Registrasi Titik Cabang Fisik</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Tentukan koordinat presisi gerai untuk akurasi navigasi armada logistik.</p>
        </div>

        <LocationPicker
            v-model="form.location"
            label="Titik Alamat Cabang"
            placeholder="Pilih lokasi di peta atau gunakan deteksi GPS..."
            hint="Geser pin marker pada peta untuk menentukan posisi gerai."
            :default-center="[-6.8854, 107.6137]"
            :default-zoom="15"
            :error="form.errors.location"
            required
        />

        <div class="flex justify-end pt-2">
            <ButtonSubmit
                type="submit"
                variant="primary"
                size="md"
                :loading="form.processing"
                text="Simpan Data Cabang"
            />
        </div>
    </form>
</template>
```

---

## 12. Result / Behavior

1. **Deteksi GPS HTML5**: Mengklik tombol GPS akan memicu dialog perizinan peramban (*browser permission prompt*). Begitu diizinkan, peta langsung berpusat pada koordinat terkini dan layanan reverse geocoding segera mengekstrak alamat jalan.
2. **Sinkronisasi Marker Peta**: Marker pin dapat digeser secara bebas ke sembarang lokasi di peta. Pelepasan pin memicu permintaan reverse geocode asinkron ke server Nominatim untuk memperbarui nama jalan dan wilayah administratif.
3. **Pencarian Cerdas Tanpa Reload**: Mengetik kata kunci pada bilah pencarian peta mengirimkan permintaan pencarian dengan jeda debounce 350ms. Memilih salah satu hasil dari daftar dropdown akan mengarahkan kamera peta ke lokasi tujuan dengan animasi *flyTo* yang halus.
4. **Pencegahan Redraw Glitch**: Saat peta dibuka di dalam dialog modal, fungsi `map.invalidateSize()` secara otomatis dipanggil setelah transisi modal selesai untuk memastikan seluruh tile peta terender sempurna tanpa area abu-abu kosong.

---

## 13. Customization

### Penentuan Titik Pusat Awal Wilayah Operasional

Jika aplikasi Anda beroperasi di wilayah khusus (misalnya Kota Surabaya):

```vue
<template>
    <LocationPicker
        v-model="surabayaStore"
        :default-center="[-7.2575, 112.7521]"
        :default-zoom="15"
        label="Titik Outlet Surabaya Timur"
    />
</template>
```

### Mode Tampilan Inline pada Formulir Stepper

Untuk formulir bertahap yang tidak ingin menggunakan popup modal:

```vue
<template>
    <LocationPicker
        v-model="shippingAddress"
        display-mode="inline"
        label="Pilih Lokasi Rumah"
    />
</template>
```

### Kustomisasi Ukuran (`size`), Kelengkungan (`rounded`), dan Warna (`color`)

Anda dapat memadukan prop `size`, `rounded`, dan tema `color` sesuai kebutuhan antarmuka:

```vue
<template>
    <!-- Varian Pill Besar Bertema Hijau Emerald -->
    <LocationPicker
        v-model="ecoDelivery"
        size="lg"
        rounded="full"
        color="emerald"
        label="Pengantaran Armada Listrik (Eco)"
    />

    <!-- Atau via Fasad Universal InputField -->
    <InputField
        v-model="incidentPoint"
        type="location"
        size="sm"
        rounded="md"
        color="rose"
        label="Lokasi Titik Insiden (Kompak)"
        required
    />
</template>
```

---

## 14. Accessibility

- **Standar WAI-ARIA**: Dialog modal peta menerapkan atribut `role="dialog"`, `aria-modal="true"`, dan referensi `aria-labelledby`.
- **Label Tombol Semantik**: Tombol aksi internal (`GPS`, `Peta`, `Salin Koordinat`, `Hapus`) dilengkapi atribut `title` dan label aksesibel yang jelas.
- **Dukungan Pembaca Layar**: Status pemuatan reverse geocoding dan proses pencarian tempat menyajikan status teks visual dan non-visual yang terbaca oleh *screen reader*.
- **Kontras Visual**: Warna pin marker merah kontras tinggi dan garis tepi badge koordinat mudah dikenali pada tema terang maupun gelap.

---

## 15. Responsive Behavior

- **Mobile Viewport (< 640px)**: Modal dialog mengisi seluruh layar secara vertikal (`p-3`) untuk memaksimalkan area interaksi sentuh jari. Preset tombol kota disederhanakan agar tidak menghalangi kanvas peta.
- **Tablet & Desktop (>= 640px)**: Modal dialog berukuran proporsional `max-w-4xl` dengan sudut membulat `rounded-2xl`, dilengkapi bilah pencarian tempat lebar dan tombol pintas navigasi kota di sudut kiri bawah peta.

---

## 16. Do / Don't

| Do (Praktik Direkomendasikan) | Don't (Praktik Dihindari) |
| :--- | :--- |
| **Gunakan `displayMode="modal"` untuk formulir umum**: Mode modal memberikan ruang pandang peta yang paling luas dan bebas gangguan bagi pengguna. | **Jangan mengabaikan protokol HTTPS**: Deteksi GPS HTML5 (`navigator.geolocation`) diblokir oleh peramban modern jika aplikasi berjalan pada protokol HTTP non-aman. |
| **Sediakan `defaultCenter` sesuai kota pengguna**: Tentukan koordinat tengah awal yang relevan dengan basis pengguna Anda agar peta tidak terbuka di koordinat default acak. | **Jangan melakukan kueri geocoding berlebihan**: Hindari memanggil reverse geocode secara agresif pada setiap piksel pergerakan mouse; gunakan mekanisme debounce. |
| **Simpan data koordinat terpisah di backend**: Simpan nilai latitude dan longitude pada kolom desimal khusus di basis data (`DECIMAL(10, 8)`) selain teks alamat lengkap. | **Jangan menonaktifkan zoom control**: Mematikan kontrol zoom membuat navigasi peta sangat sulit bagi pengguna yang tidak memiliki mouse dengan scroll wheel. |

---

## 17. Examples / Recipes

### Recipe 1: Formulir Checkout Pengiriman Kurir E-Commerce

```vue
<script setup>
import { ref } from 'vue';
import LocationPicker from '@/Components/Pack/LocationPicker.vue';

const deliveryAddress = ref({
    lat: -6.2088,
    lng: 106.8456,
    address: '',
    city: '',
    postal_code: '',
});
</script>

<template>
    <div class="space-y-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200">Alamat Tujuan Pengiriman</h4>
        <LocationPicker
            v-model="deliveryAddress"
            label="Pin Alamat Pengantaran"
            placeholder="Cari gedung, perumahan, atau jalan tujuan..."
            hint="Pastikan pin berada tepat di depan gerbang atau pintu rumah Anda."
            required
        />
    </div>
</template>
```

### Recipe 2: Mode Inline Accordion pada Form Pendaftaran Mitra

```vue
<script setup>
import { ref } from 'vue';
import LocationPicker from '@/Components/Pack/LocationPicker.vue';

const partnerLocation = ref(null);
</script>

<template>
    <div class="space-y-3">
        <LocationPicker
            v-model="partnerLocation"
            display-mode="inline"
            label="Lokasi Titik Usaha Mitra"
            placeholder="Tentukan titik usaha pada peta inline di bawah..."
        />
    </div>
</template>
```

---

## 18. Related Components

- [InputField](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/input-field.md): Fasad input universal yang dapat memanggil komponen ini secara deklaratif via `<InputField type="location" />`.
- [Modal](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/modal.md): Dialog overlay aksesibel yang digunakan secara internal untuk mode tampilan peta modal.
- [Badge](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/badge.md): Indikator visual untuk status koordinat dan nama kota.
- [ButtonSubmit](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/button-submit.md): Tombol pengiriman formulir dengan proteksi klik ganda dan status pemuatan asinkron.
- [Card](file:///c:/SPEED/LARAVEL-PACK-UI/packages/laravel-pack-ui/doc/components/card.md): Kontainer pembungkus formulir data terstruktur.

---

## 19. Notes / Limitations

- **Batasan Akses Geolocation**: Fitur deteksi GPS mengandalkan API `navigator.geolocation` bawaan peramban, yang mensyaratkan koneksi aman (HTTPS) di lingkungan produksi atau `localhost` pada lingkungan pengembangan.
- **Kebijakan Penggunaan Nominatim OpenStreetMap**: Layanan geocoding gratis Nominatim memiliki batas laju (*rate limit*) maksimum 1 permintaan per detik. Komponen ini menerapkan debounce 350ms dan pembatasan kueri untuk mematuhi kebijakan tersebut.
- **Penyegaran Ukuran Kanvas Leaflet**: Leaflet membutuhkan perhitungan dimensi kontainer yang akurat. Jika Anda menyematkan komponen ini di dalam tab yang awalnya tersembunyi, pastikan untuk memicu resize atau membuka tab terlebih dahulu sebelum peta diinisialisasi.
- **Presisi Pixel-Perfect Titik Marker Pin**: Marker SVG custom dikalibrasi dengan titik jangkar `iconAnchor: [17, 42]` tanpa duplikasi offset `transform` CSS, sehingga ujung jarum pin menancap tepat secara absolut di titik koordinat geospasial klik pengguna baik pada mode modal maupun inline.
