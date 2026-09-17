# 📍 LocationPicker Component (`LocationPicker.vue` / `InputLocation.vue`)

Komponen pemilih tag lokasi (*Interactive Map Tag Location & Address Picker*) berbasis Vue 3, Leaflet, dan OpenStreetMap. Memungkinkan pengguna menentukan titik lokasi presisi di peta, mendeteksi lokasi GPS secara instan, melakukan pencarian tempat/gedung, serta memperoleh koordinat latitude dan longitude beserta nama jalan lengkap secara otomatis tanpa biaya API Key (*100% Zero-Config & Free*).

---

## ✨ Fitur Utama

1. **Peta Interaktif Bebas Biaya (OpenStreetMap & Leaflet)**:
   - Tidak memerlukan Google Maps API Key ataupun pendaftaran kartu kredit.
   - Menggunakan OpenStreetMap tiles berkecepatan tinggi dengan kontrol zoom dan pan yang mulus.
2. **Pin Marker Draggable & Clickable**:
   - Pengguna dapat menggeser (*drag*) pin marker atau mengklik di titik mana saja pada peta untuk menandai lokasi.
   - Desain pin modern berbasis Google Material Symbols dan SVG yang bebas dari kendala missing asset Leaflet.
3. **Deteksi GPS Otomatis (HTML5 Geolocation)**:
   - Tombol cepat *"GPS Saya"* (`my_location`) membaca koordinat GPS perangkat secara akurat dan memusatkan peta ke posisi terkini pengguna.
4. **Auto Reverse-Geocoding (Nominatim OSM)**:
   - Setiap kali pin digeser atau titik dipilih, sistem secara otomatis menerjemahkan koordinat menjadi nama jalan, kelurahan/kecamatan, kota, dan kode pos.
5. **Kotak Pencarian Tempat Terpadu**:
   - Pengguna dapat mengetik nama gedung, alamat, atau daerah di kolom pencarian peta untuk langsung melompat (*flyTo*) ke titik tersebut.
6. **Tombol Pintas Preset Kota Populer**:
   - Preset kota Indonesia (Jakarta, Bandung, Surabaya, Yogyakarta, Denpasar, Medan) untuk navigasi cepat.
7. **Dukungan Dua Mode Tampilan**:
   - `displayMode="modal"` (default): Dialog popover layar lebar yang nyaman dan imersif.
   - `displayMode="inline"`: Tampilan peta akordeon langsung di bawah form input.
8. **Integrasi Facade `InputField.vue`**:
   - Dapat digunakan langsung sebagai `<LocationPicker />` maupun melalui `<InputField type="location" />`.

---

## 🚀 Cara Penggunaan

### 1. Penggunaan Dasar dengan Objek `v-model`

```vue
<script setup>
import { ref } from 'vue';
import LocationPicker from '@/Components/Pack/LocationPicker.vue';

const location = ref({
    lat: -6.2088,
    lng: 106.8456,
    address: 'Monas, Gambir, Jakarta Pusat',
    city: 'Jakarta Pusat',
    postal_code: '10110',
});
</script>

<template>
  <LocationPicker
    v-model="location"
    label="Titik Alamat Pengiriman"
    placeholder="Pilih lokasi di peta atau gunakan GPS..."
    required
  />
</template>
```

---

### 2. Penggunaan Melalui Facade `InputField.vue`

```vue
<script setup>
import { useForm } from '@inertiajs/vue3';
import InputField from '@/Components/Pack/InputField.vue';

const form = useForm({
    outlet_name: 'Toko Cabang Sudirman',
    location: null,
});
</script>

<template>
  <InputField
    v-model="form.location"
    type="location"
    label="Titik Koordinat Outlet"
    placeholder="Tandai lokasi toko di peta..."
    :error="form.errors.location"
    required
  />
</template>
```

---

### 3. Binding Prop Terpisah (`lat`, `lng`, `address`)

Jika skema basis data Anda memisahkan kolom koordinat:

```vue
<script setup>
import { ref } from 'vue';
import LocationPicker from '@/Components/Pack/LocationPicker.vue';

const latitude = ref(-7.2575);
const longitude = ref(112.7521);
const fullAddress = ref('Surabaya, Jawa Timur');
</script>

<template>
  <LocationPicker
    v-model:lat="latitude"
    v-model:lng="longitude"
    v-model:address="fullAddress"
    label="Lokasi Gudang Logistik"
  />
</template>
```

---

### 4. Mode Tampilan Inline Accordion

```vue
<template>
  <LocationPicker
    v-model="form.location"
    display-mode="inline"
    label="Pilih Lokasi Acara"
  />
</template>
```

---

## 📋 Props API

| Prop | Tipe | Default | Deskripsi |
|---|---|---|---|
| `modelValue` | `Object \| String` | `null` | Objek data `{ lat, lng, address, city, postal_code }` atau string koordinat. |
| `lat` | `Number` | `null` | Nilai Latitude langsung. |
| `lng` | `Number` | `null` | Nilai Longitude langsung. |
| `address` | `String` | `''` | Nilai teks alamat jalan langsung. |
| `label` | `String` | `''` | Label formulir input. |
| `placeholder` | `String` | `'Tentukan lokasi...'` | Teks placeholder input. |
| `required` | `Boolean` | `false` | Menampilkan penanda wajib diisi (*). |
| `disabled` | `Boolean` | `false` | Menonaktifkan interaksi input dan peta. |
| `readonly` | `Boolean` | `false` | Mode hanya baca. |
| `error` | `String` | `''` | Pesan error validasi form. |
| `hint` | `String` | `''` | Teks panduan pembantu di bawah input. |
| `defaultCenter` | `Array` | `[-6.2088, 106.8456]` | Koordinat tengah awal peta `[lat, lng]`. |
| `defaultZoom` | `Number` | `14` | Level perbesaran awal peta. |
| `showCoordinatesBadge` | `Boolean` | `true` | Menampilkan badge pill koordinat ber-tombol salin. |
| `displayMode` | `String` | `'modal'` | Mode tampilan: `'modal'` atau `'inline'`. |

---

## 📡 Events

| Event | Parameter | Deskripsi |
|---|---|---|
| `@update:modelValue` | `(payload)` | Dipicu saat data lokasi (lat, lng, address, dll) berubah. |
| `@update:lat` | `(lat)` | Dipicu saat latitude berubah. |
| `@update:lng` | `(lng)` | Dipicu saat longitude berubah. |
| `@update:address` | `(address)` | Dipicu saat alamat berubah. |
| `@change` | `(payload)` | Dipicu saat pengguna menyelesaikan pemilihan titik. |
