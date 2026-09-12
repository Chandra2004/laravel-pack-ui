# 🛡️ Composable `useFormValidation`

[← Kembali ke Dokumentasi Utama](../../README.md) | [Komponen InputField](../components/input-field.md)

---

## 11. Composable `useFormValidation.js` *(Baru)*

Composable tingkat form (*form-level validation*) yang fleksibel untuk mengelola validasi berbasis aturan (*rule-based*), status kesalahan (*error state*), status field disentuh (*touched*), serta kompatibel penuh dengan objek formulir InertiaJS (`useForm`) dan response error Laravel (HTTP 422).

### Lokasi File

* **Composable**: `useFormValidation.js`

### Fitur & Keunggulan:
* **Rule-Based Declarative Schema**: Mendukung skema validasi bersih dan deklaratif tanpa library eksternal berat.
* **Bahasa Indonesia Ramah Pengguna**: Pesan kesalahan bawaan disajikan dalam Bahasa Indonesia yang profesional dan otomatis menyesuaikan label field.
* **Mode Validasi Fleksibel**:
  * `'touched'` *(Default)*: Validasi langsung berjalan setelah pengguna menyentuh/mengisi field tersebut.
  * `'eager'`: Validasi langsung dievaluasi pada setiap ketukan karakter sejak awal.
  * `'lazy'`: Validasi hanya dievaluasi saat fungsi `validate()` dipanggil (misal saat form disubmit).
* **Integrasi Backend Laravel**: Menyediakan fungsi `setErrors(response.data.errors)` untuk langsung memasukkan pesan kesalahan dari controller Laravel ke dalam form frontend.

### Aturan Validasi yang Didukung (`schemaRules`)

| Rule | Tipe | Contoh Nilai | Deskripsi |
| :--- | :--- | :--- | :--- |
| `required` | `Boolean \| String` | `true` atau `'Harus diisi!'` | Memastikan field tidak kosong, null, false, atau array kosong |
| `email` | `Boolean \| String` | `true` | Validasi format alamat email standar RFC |
| `phone` | `Boolean \| String` | `true` | Validasi nomor telepon Indonesia (10–15 digit angka) |
| `numeric` | `Boolean \| String` | `true` | Memastikan nilai berupa angka numerik valid |
| `min` | `Number` | `10000` | Batas nilai minimum angka |
| `max` | `Number` | `10000000` | Batas nilai maksimum angka |
| `minLength` | `Number` | `8` | Batas minimal panjang karakter teks |
| `maxLength` | `Number` | `100` | Batas maksimal panjang karakter teks |
| `pattern` | `RegExp \| String` | `/^[A-Z0-9]+$/` | Validasi kecocokan pola regular expression kustom |
| `confirmed` | `String` | `'password'` | Memastikan nilai sama persis dengan field lain (konfirmasi sandi) |
| `custom` | `Function` | `(val, all) => ...` | Fungsi validasi logika kustom; mengembalikan pesan string jika error, atau null jika valid |
| `label` | `String` | `'Nomor Rekening'` | Kustomisasi nama label field yang muncul pada pesan error |

### Signature API (`useFormValidation`)

```javascript
import { useFormValidation } from '@/Composables/Pack/useFormValidation';

const {
  errors,         // Objek reaktif pesan error { [field]: string }
  touched,        // Objek reaktif status field yang sudah disentuh { [field]: boolean }
  isValid,        // Computed boolean: true jika tidak ada error
  isDirty,        // Computed boolean: true jika minimal 1 field telah disentuh
  validate,       // Function(): Mengevaluasi seluruh form, return boolean
  validateField,  // Function(field): Mengevaluasi 1 field tertentu
  touch,          // Function(field): Menandai field telah disentuh (blur event)
  clearErrors,    // Function(field?): Menghapus error satu atau seluruh field
  setFieldError,  // Function(field, msg): Menetapkan pesan error manual
  setErrors,      // Function(errorsObj): Batch assign error dari response Laravel
  reset,          // Function(): Mereset seluruh state error dan touched
} = useFormValidation(formData, schemaRules, { mode: 'touched' });
```

### Contoh Penggunaan `useFormValidation`

#### 1. Validasi Form Transaksi Pembayaran
```vue
<script setup>
import { reactive } from 'vue';
import InputField from '@/Components/Pack/InputField.vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';
import { useFormValidation } from '@/Composables/Pack/useFormValidation';

const form = reactive({
  merchantName: '',
  email: '',
  phone: '',
  nominal: 0,
  pin: '',
});

const rules = {
  merchantName: { required: true, minLength: 3, label: 'Nama Merchant' },
  email: { required: true, email: true, label: 'Alamat Email' },
  phone: { required: true, phone: true, label: 'Nomor WhatsApp' },
  nominal: { required: true, numeric: true, min: 10000, max: 50000000, label: 'Nominal Transaksi' },
  pin: { required: true, minLength: 6, maxLength: 6, label: 'PIN Keamanan' },
};

const { errors, validate, touch, reset } = useFormValidation(form, rules);

const handleSubmit = () => {
  if (!validate()) {
    console.warn('Form masih mengandung kesalahan!');
    return;
  }
  console.log('Data valid, kirim ke backend:', form);
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <InputField
      v-model="form.merchantName"
      label="Nama Merchant"
      :error="errors.merchantName"
      @blur="touch('merchantName')"
      required
    />

    <InputField
      v-model="form.email"
      type="email"
      label="Email Notifikasi"
      :error="errors.email"
      @blur="touch('email')"
      required
    />

    <InputField
      v-model="form.phone"
      type="tel"
      label="Nomor WhatsApp"
      :error="errors.phone"
      @blur="touch('phone')"
      required
    />

    <InputField
      v-model="form.nominal"
      type="currency"
      currency
      prefix="Rp"
      label="Nominal Transaksi"
      :error="errors.nominal"
      @blur="touch('nominal')"
      required
    />

    <InputField
      v-model="form.pin"
      type="otp"
      masked
      :length="6"
      label="PIN Keamanan Transaksi"
      :error="errors.pin"
      required
    />

    <div class="flex gap-2">
      <ButtonSubmit type="submit" variant="primary">Proses Pembayaran</ButtonSubmit>
      <ButtonSubmit type="button" variant="outline" @click="reset">Reset</ButtonSubmit>
    </div>
  </form>
</template>
```

#### 2. Integrasi dengan Inertia `useForm` & Error Laravel 422
```javascript
import { useForm } from '@inertiajs/vue3';
import { useFormValidation } from '@/Composables/Pack/useFormValidation';

const form = useForm({
  account_number: '',
  bank_code: '',
});

const rules = {
  account_number: { required: true, numeric: true, minLength: 10, label: 'Nomor Rekening' },
  bank_code: { required: true, label: 'Bank Penerima' },
};

const { errors, validate, setErrors } = useFormValidation(form, rules);

const submitDisbursement = () => {
  if (!validate()) return;

  form.post('/disbursements', {
    onError: (backendErrors) => {
      // Sinkronkan response error 422 Laravel langsung ke composable
      setErrors(backendErrors);
    },
  });
};
```

---