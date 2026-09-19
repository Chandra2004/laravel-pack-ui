# 💾 AutoSaveStatus Component (`AutoSaveStatus.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen visual indikator status penyimpanan formulir real-time dan banner pemulihan data draf (*Draft Recovery Alert*), terintegrasi langsung dengan composable [useAutoSave.js](../composables/use-auto-save.md).

---

## 🏛️ Evaluasi & Penerapan 5 Pilar Desain UI

| Pilar Desain | Penerapan pada Komponen `AutoSaveStatus` |
| :--- | :--- |
| **1. Warna** | Warna semantik transparan: Slate (`idle`), Primary/Spinner (`saving`), Emerald (`saved`), Rose (`error`), Amber/Emas (`draft recovery alert`). Mendukung dark mode penuh. |
| **2. Bentuk** | Pill rounded-full untuk status badge mini dan `rounded-2xl` halus untuk alert banner pemulihan draf. |
| **3. Teks Konten** | Format waktu relatif dinamis (*"Tersimpan otomatis 2 menit yang lalu"*), judul pesan jelas, dan tombol aksi tegas (*"Pulihkan Draf"*, *"Abaikan"*, *"Coba Lagi"*). |
| **4. Icon** | Ikon Google Material Symbols semantik: `cloud_done`, `check_circle`, `error`, `history`, `restore`, `pause_circle`. |
| **5. Responsif** | Banner pemulihan otomatis stack rapi di mobile (*col*) dan sejajar di desktop (*row*). |

---

## 🚀 Fitur Unggulan ("Killer Features")

1. **One-Prop Binding (`:auto-save="autoSave"`)**:
   Cukup operasikan objek hasil `useAutoSave()`, komponen otomatis membaca seluruh status (`status`, `lastSavedFormatted`, `hasDraft`, `draftTimeFormatted`).
2. **Draft Recovery Prompt**:
   Banner otomatis muncul saat membuka kembali formulir jika terdapat draf lokal yang belum tersimpan dari sesi sebelumnya.
3. **Animated State Transitions**:
   Pergantian status dari *idle* $\to$ *saving* $\to$ *saved* berjalan mulus tanpa getaran layout (*layout shift*).
4. **Retry Mechanism**:
   Saat status *error*, tombol *Coba Lagi* otomatis memicu pemanggilan ulang `saveNow()`.

---

## 📋 Props API (`<AutoSaveStatus />`)

| Prop | Tipe Data | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `autoSave` | `Object` | `null` | Objek composable dari `useAutoSave()`. |
| `status` | `String` | `'idle'` | Status manual jika tidak memakai prop `autoSave`: `'idle'`, `'saving'`, `'saved'`, `'error'`, `'paused'`. |
| `variant` | `String` | `'both'` | Tampilan yang diinginkan: `'both'` (banner + badge), `'badge'` (hanya badge status), `'banner'` (hanya banner draf). |
| `showBanner`| `Boolean` | `true` | Mengaktifkan/menonaktifkan banner pemulihan draf. |
| `lastSaved` | `String\|Date` | `null` | Waktu simpan terakhir manual. |
| `hasDraft` | `Boolean` | `false` | Status keberadaan draf manual. |

---

## ⚡ Events / Emits

| Event | Deskripsi |
| :--- | :--- |
| `restore` | Dipancarkan saat pengguna menekan tombol "Pulihkan Draf". |
| `discard` | Dipancarkan saat pengguna menekan tombol "Abaikan". |
| `retry` | Dipancarkan saat pengguna menekan tombol "Coba Lagi" pada status galat. |

---

## 💡 Contoh Penggunaan

```vue
<script setup>
import { ref } from 'vue';
import AutoSaveStatus from '@/Components/Pack/AutoSaveStatus.vue';
import { useAutoSave } from '@/Composables/Pack/useAutoSave';

const form = ref({
    title: '',
    content: '',
});

const autoSave = useAutoSave(form, {
    key: 'article_form_new',
    debounceMs: 1500,
});
</script>

<template>
    <div class="space-y-4">
        <!-- Status & Banner Auto-Save -->
        <AutoSaveStatus :auto-save="autoSave" />

        <input v-model="form.title" placeholder="Judul" />
        <textarea v-model="form.content" placeholder="Konten..." />
    </div>
</template>
```
