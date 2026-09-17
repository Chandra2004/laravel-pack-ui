# 🔘 ButtonSubmit Component (`ButtonSubmit.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen tombol aksi universal dan polimorfik bertenaga **Tailwind CSS** dan ikon **Google Material Symbols**. Dapat bertindak sebagai tombol form standar (`button`), navigasi Inertia (`<Link>`), maupun tag tautan (`<a>`), serta kini dilengkapi model interaktif kaya media sosial: **YouTube Segmented Like/Dislike**, **YouTube Subscribe dengan Lonceng Notifikasi**, **Instagram Heart Like dengan Animasi Pop**, **Instagram Follow/Following**, **Vibrant Gradient**, dan **Ambient Glow Aura** sesuai panduan **5 Pilar UI (`peraturan.md`)**.

---

## 🏛️ Evaluasi & Penerapan 5 Pilar Desain (`peraturan.md`)

| Pilar Desain | Penerapan pada Komponen `ButtonSubmit` |
| :--- | :--- |
| **1. Warna** | 9 preset palet tema (`colorTheme`: `default`, `primary`, `indigo`, `emerald`, `purple`, `amber`, `rose`, `cyan`, `dark`), efek pendaran ambient `glow`, varian gradien dinamis (`gradient`), efek frosted glass (`glass`), serta varian resmi brand (`youtube`, `instagram`). Seluruh varian soft pastel (`soft-primary`, `soft-danger`, dll.) tetap didukung penuh. |
| **2. Bentuk** | Kapsul segmented (`model="split-like"` ala YouTube), kontrol kelengkungan sudut (`rounded`: `none`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `full`), dan *shorthand* `pill` untuk bentuk kapsul membulat sempurna. |
| **3. Teks Konten** | Transisi teks dinamis sesuai status (`label` $\to$ `activeLabel`, misal: *"Follow"* $\to$ *"Following"* atau *"Subscribe"* $\to$ *"Subscribed"*), format kalkulasi counter otomatis (`count` / `displayCount`: misal `1420` $\to$ `"1.4k"` atau `+1` saat di-like), serta pencegahan teks patah dengan `truncate`. |
| **4. Icon** | Ikon Google Material Symbols terintegrasi dengan dukungan status terisi (*filled icon* via `font-variation-settings: 'FILL' 1`), animasi mikro mekar kursor (*heart pop bounce*) pada like Instagram, dan getaran lonceng (*bell shake ring*) pada subscribe YouTube. |
| **5. Responsif** | *Mobile-first touch target* minimum 38px/44px, efek kompresi sentuh interaktif (`active:scale-95`), serta dukungan penuh lebar kontainer (`fullWidth`). |

---

## 🚀 Model Khusus Media Sosial ("Engagement Models")

1. **`model="split-like"` (YouTube Style Segmented Like & Dislike Pill)**:
   Tombol kapsul terintegrasi yang membagi aksi Suka (*thumbs up* + angka like reaktif) dan Tidak Suka (*thumbs down*) dengan garis pemisah tipis di tengah. Jika status dislike ditekan saat like aktif, like otomatis dinonaktifkan dan sebaliknya.
2. **`model="subscribe"` (YouTube Style Subscribe Button)**:
   Tombol tebal tegas (*bold dark/red*) saat belum berlangganan, bertransformasi menjadi kapsul abu-abu lembut bertuliskan *"Subscribed"* dengan ikon lonceng notifikasi interaktif yang bergetar saat diklik.
3. **`model="like"` (Instagram Style Heart Like Button)**:
   Ikon hati dengan mikro-animasi mekar (*heart pop bounce*) saat diaktifkan, warna berubah menjadi merah/rose pendaran penuh, dan counter like otomatis bertambah 1 angka.
4. **`model="follow"` (Instagram Style Follow Button)**:
   Tombol biru terang *"Follow"* yang bertransisi menjadi tombol abu-abu berbingkai halus *"Following"* saat pengguna mulai mengikuti.
5. **`model="bookmark"` (Instagram/TikTok Style Save Button)**:
   Tombol simpan postingan dengan ikon pita pembatas buku yang otomatis terisi penuh (*filled*) saat disimpan.

---

## 📋 Component Props API (`<ButtonSubmit />`)

| Prop | Tipe Data | Default | Deskripsi / Pilihan Nilai |
| :--- | :--- | :--- | :--- |
| `model` | `String` | `'default'` | Model interaksi tombol: `'default'`, `'like'`, `'subscribe'`, `'follow'`, `'split-like'`, `'bookmark'` |
| `variant` | `String` | `'primary'` | Gaya visual: `'primary'`, `'secondary'`, `'danger'`, `'success'`, `'warning'`, `'outline'`, `'ghost'`, `'soft'`, `'soft-danger'`, `'soft-success'`, `'soft-warning'`, `'soft-secondary'`, `'gradient'`, `'glass'`, `'youtube'`, `'instagram'` |
| `colorTheme` | `String` | `'default'` | Palet tema: `'default'`, `'primary'`, `'indigo'`, `'emerald'`, `'purple'`, `'amber'`, `'rose'`, `'cyan'`, `'dark'` |
| `glow` | `Boolean` | `false` | Memberikan bayangan pendaran berwarna (*ambient glowing aura*) sesuai tema |
| `social` | `String` | `'none'` | Preset gaya sosial: `'none'`, `'youtube'`, `'instagram'` |
| `active` | `Boolean` | `false` | Status aktif/toggled (mendukung `v-model:active`) |
| `activeLabel` | `String` | `''` | Label teks saat status aktif (contoh: `'Subscribed'`, `'Following'`) |
| `activeIcon` | `String` | `''` | Ikon khusus saat status aktif (contoh: `'notifications_active'`, `'check'`) |
| `count` | `Number\|String` | `null` | Angka counter (otomatis bertambah +1 saat di-like) |
| `showCount` | `Boolean` | `true` | Menampilkan indikator angka di dalam tombol |
| `disliked` | `Boolean` | `false` | Status dislike pada `model="split-like"` (mendukung `v-model:disliked`) |
| `as` | `String` | `'button'` | Tag elemen yang dirender: `'button'`, `'Link'` (Inertia), `'a'` (HTML link) |
| `href` | `String` | `null` | URL tujuan jika prop `as` bernilai `'Link'` atau `'a'` |
| `type` | `String` | `'submit'` | Atribut tipe tombol HTML: `'submit'`, `'button'`, `'reset'` |
| `size` | `String` | `'md'` | Skala ukuran tombol: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'icon'` |
| `rounded` | `String` | `'default'` | Radius sudut: `'default'`, `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`, `'full'` |
| `pill` | `Boolean` | `false` | Pintasan bentuk kapsul bulat penuh (*shorthand* untuk `rounded="full"`) |
| `loading` | `Boolean` | `false` | Menampilkan spinner loading dan mengunci interaksi tombol |
| `disabled` | `Boolean` | `false` | Menonaktifkan tombol secara visual dan fungsional |
| `loadingText` | `String` | `''` | Teks alternatif yang ditampilkan saat state loading aktif |
| `icon` | `String` | `''` | Nama Google Material Symbols (contoh: `'send'`, `'download'`, `'favorite'`) |
| `iconPosition` | `String` | `'left'` | Posisi ikon terhadap teks: `'left'`, `'right'` |
| `fullWidth` | `Boolean` | `false` | Membuat tombol melebar 100% kontainer (`w-full`) |
| `preserveScroll`| `Boolean` | `true` | Mempertahankan posisi scroll saat `as="Link"` |
| `preserveState` | `Boolean` | `true` | Mempertahankan state komponen saat `as="Link"` |

---

## 🔔 Events API (`<ButtonSubmit />`)

| Event Name | Parameter | Deskripsi |
| :--- | :--- | :--- |
| `@click` | `event: MouseEvent` | Dipancarkan saat tombol diklik |
| `@update:active` | `val: Boolean` | Sinkronisasi dua arah `v-model:active` |
| `@toggle` | `val: Boolean` | Dipancarkan saat status tombol berganti aktif/non-aktif |
| `@like` | `val: Boolean` | Dipancarkan saat tombol Like atau sisi Like pada Split-Like diklik |
| `@dislike` | `val: Boolean` | Dipancarkan saat sisi Dislike pada Split-Like diklik |
| `@update:disliked`| `val: Boolean` | Sinkronisasi dua arah `v-model:disliked` |
| `@subscribe` | `val: Boolean` | Dipancarkan saat tombol Subscribe diklik |

---

## 💡 Ragam Contoh Penggunaan

### 1. YouTube Segmented Like & Dislike Pill
```vue
<script setup>
import { ref } from 'vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const isLiked = ref(false);
const isDisliked = ref(false);
const totalLikes = ref(1420);
</script>

<template>
  <ButtonSubmit
    model="split-like"
    v-model:active="isLiked"
    v-model:disliked="isDisliked"
    :count="totalLikes"
    glow
    color-theme="primary"
  />
</template>
```

### 2. YouTube Subscribe Button dengan Lonceng Notifikasi
```vue
<script setup>
import { ref } from 'vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const isSubscribed = ref(false);
</script>

<template>
  <ButtonSubmit
    model="subscribe"
    v-model:active="isSubscribed"
    :count="24800"
    social="youtube"
    @subscribe="(val) => console.log('Subscribed:', val)"
  />
</template>
```

### 3. Instagram Heart Like Pop Button dengan Counter
```vue
<script setup>
import { ref } from 'vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const isLiked = ref(false);
</script>

<template>
  <ButtonSubmit
    model="like"
    social="instagram"
    v-model:active="isLiked"
    :count="3840"
    glow
    color-theme="rose"
    pill
  >
    Like
  </ButtonSubmit>
</template>
```

### 4. Instagram Follow / Following Button
```vue
<script setup>
import { ref } from 'vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const isFollowing = ref(false);
</script>

<template>
  <ButtonSubmit
    model="follow"
    v-model:active="isFollowing"
    size="sm"
  />
</template>
```

### 5. Tombol Form Standar dengan Loading State & Ikon
```vue
<script setup>
import { ref } from 'vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const isLoading = ref(false);
</script>

<template>
  <ButtonSubmit
    type="submit"
    variant="primary"
    icon="save"
    :loading="isLoading"
    loading-text="Menyimpan Data..."
    glow
  >
    Simpan Perubahan
  </ButtonSubmit>
</template>
```

### 6. Vibrant Gradient & Ambient Glow Button
```vue
<template>
  <div class="flex gap-3">
    <ButtonSubmit variant="gradient" color-theme="purple" glow icon="auto_awesome">
      Purple Magic
    </ButtonSubmit>
    <ButtonSubmit variant="gradient" color-theme="emerald" glow icon="savings">
      Emerald Mint
    </ButtonSubmit>
    <ButtonSubmit variant="instagram" icon="camera_alt">
      Instagram Gradient
    </ButtonSubmit>
  </div>
</template>
```