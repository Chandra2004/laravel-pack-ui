# 🔘 ButtonSubmit Component (`ButtonSubmit.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

---

## 7. ButtonSubmit Component (`ButtonSubmit.vue`)

Komponen tombol aksi universal dan polimorfik berbasis **Tailwind CSS** dan ikon **Google Material Symbols**. Dapat bertindak sebagai elemen `<button>`, navigasi Inertia `<Link>`, maupun tag tautan `<a>`, dengan dukungan terintegrasi untuk *loading spinner*, varian warna lengkap, skala ukuran fleksibel, dan mikro-interaksi responsif.

### Lokasi File

* **Component**: `ButtonSubmit.vue`

### Fitur Desain & Styling:
* **Murni Tailwind CSS**: Desain tombol modern dengan status fokus aksesibel (`focus-visible:ring-2`), efek klik halus (`active:scale-98`), dan transisi warna cepat.
* **Polimorfik Tag (`as`) dengan Safe Fallback**: Secara dinamis merender tag `<button>`, komponen Inertia `<Link>`, atau tautan `<a>`. Jika `as="Link"` atau `as="a"` dipakai tanpa `href`, otomatis fallback ke tombol `<button>` disertai peringatan dev console.
* **Inert Disabled Link**: Menghapus atribut `href` dan memblokir event navigasi saat tombol dalam kondisi `disabled` atau `loading`, mencegah navigasi tak sengaja melalui tombol keyboard Enter pada tag `<a>` / `<Link>`.
* **WCAG AAA Contrast Warning Variant**: Varian `warning` menggunakan warna teks kontras tinggi `text-slate-950` di atas `bg-amber-500` (rasio kontras > 10:1, lolos uji WCAG AAA).
* **Ekspansi Varian Soft Pastel**: Mendukung varian lembut untuk berbagai status: `soft` / `soft-primary`, `soft-danger`, `soft-success`, `soft-warning`, dan `soft-secondary`.
* **Kontrol Radius Fleksibel & Pill Mode**: Mendukung kustomisasi kelengkungan sudut melalui prop `rounded` (`none`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `full`) atau shorthand prop `pill` untuk bentuk kapsul penuh.
* **Konsistensi State `active:`**: Seluruh varian memiliki penegasan warna status aktif (*active background tone*) saat ditekan.
* **Google Material Symbols**: Terintegrasi langsung dengan ikon Google (`material-symbols-outlined`), mendukung penempatan di sebelah kiri (`icon-position="left"`), kanan (`icon-position="right"`), atau ikon saja (`size="icon"`).
* **State Loading Interaktif**: Menampilkan animasi spinner `progress_activity` secara otomatis saat `loading: true`, sekaligus menonaktifkan interaksi klik ganda (*prevent double submit*).

### Component Props API (`<ButtonSubmit />`)

| Prop | Tipe Data | Default | Deskripsi / Pilihan Nilai |
| :--- | :--- | :--- | :--- |
| `as` | `String` | `'button'` | Tag elemen yang dirender: `'button'`, `'Link'` (Inertia), `'a'` (HTML link) |
| `href` | `String` | `null` | URL tujuan jika prop `as` bernilai `'Link'` atau `'a'` |
| `type` | `String` | `'submit'` | Atribut tipe tombol HTML: `'submit'`, `'button'`, `'reset'` |
| `variant` | `String` | `'primary'` | Varian warna: `'primary'`, `'secondary'`, `'danger'`, `'success'`, `'warning'`, `'outline'`, `'ghost'`, `'soft'`, `'soft-danger'`, `'soft-success'`, `'soft-warning'`, `'soft-secondary'` |
| `size` | `String` | `'md'` | Skala ukuran tombol: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'icon'` |
| `rounded` | `String` | `'default'` | Radius sudut: `'default'`, `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`, `'full'` |
| `pill` | `Boolean` | `false` | Pintasan bentuk kapsul bulat penuh (*shorthand* untuk `rounded="full"`) |
| `loading` | `Boolean` | `false` | Menampilkan spinner loading dan mengunci interaksi tombol |
| `disabled` | `Boolean` | `false` | Menonaktifkan tombol secara visual dan fungsional |
| `loadingText` | `String` | `''` | Teks alternatif yang ditampilkan saat state loading aktif |
| `icon` | `String` | `''` | Nama Google Material Icon (contoh: `'add'`, `'download'`, `'send'`) |
| `iconPosition` | `String` | `'left'` | Posisi ikon terhadap teks: `'left'`, `'right'` |
| `fullWidth` | `Boolean` | `false` | Membuat tombol melebar 100% kontainer (`w-full`) |
| `preserveScroll`| `Boolean` | `true` | Mempertahankan posisi scroll saat `as="Link"` |
| `preserveState` | `Boolean` | `true` | Mempertahankan state komponen saat `as="Link"` |

### Slots API (`<ButtonSubmit />`)

| Slot Name | Deskripsi |
| :--- | :--- |
| `default` | Konten teks atau elemen label di dalam tombol |

### Contoh Penggunaan ButtonSubmit

#### 1. Tombol Submit Form dengan Loading State
```vue
<script setup>
import { useForm } from '@inertiajs/vue3';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const form = useForm({ email: '', password: '' });

const submit = () => {
  form.post('/login');
};
</script>

<template>
  <form @submit.prevent="submit">
    <!-- Form Inputs... -->

    <ButtonSubmit
      type="submit"
      variant="primary"
      size="md"
      :loading="form.processing"
      loading-text="Memverifikasi..."
      full-width
    >
      Masuk ke Akun
    </ButtonSubmit>
  </form>
</template>
```

#### 2. Tombol Navigasi Inertia Link (`as="Link"`)
```vue
<template>
  <!-- Berperilaku sebagai Inertia Link dengan tampilan tombol -->
  <ButtonSubmit
    as="Link"
    href="/dashboard/products/create"
    variant="primary"
    icon="add"
    icon-position="left"
    size="sm"
  >
    Tambah Produk Baru
  </ButtonSubmit>
</template>
```

#### 3. Tombol Ikon Saja & Tombol Bahaya (Danger Variant)
```vue
<template>
  <!-- Tombol Khusus Ikon -->
  <ButtonSubmit
    size="icon"
    variant="ghost"
    icon="delete"
    class="text-rose-500 hover:text-rose-600"
    title="Hapus Baris Data"
    @click="deleteItem"
  />

  <!-- Tombol Bahaya dengan Teks -->
  <ButtonSubmit
    variant="danger"
    icon="delete_forever"
    size="sm"
    @click="confirmDelete"
  >
    Hapus Akun
  </ButtonSubmit>
</template>
```

#### 4. Varian Soft Pastel & Mode Pill (Bentuk Kapsul)
```vue
<template>
  <div class="flex flex-wrap gap-2">
    <ButtonSubmit variant="soft-primary" pill icon="check">Selesai</ButtonSubmit>
    <ButtonSubmit variant="soft-danger" pill icon="close">Tolak</ButtonSubmit>
    <ButtonSubmit variant="soft-warning" pill icon="schedule">Tertunda</ButtonSubmit>
    <ButtonSubmit variant="soft-success" pill icon="verified">Terverifikasi</ButtonSubmit>
  </div>
</template>
```

---