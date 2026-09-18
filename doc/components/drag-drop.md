# 🔀 Drag and Drop Universal (`DragDrop.vue`)

[← Kembali ke Dokumentasi Utama](../../README.md)

Komponen interaktif **DragDrop** serbaguna untuk ekosistem **Laravel Inertia Vue 3** dan **Tailwind CSS**. Dibuat menggunakan API bawaan web standar (*zero external dependency*) sehingga sangat ringan dan cepat. Mendukung pengurutan satu dimensi (*Sortable List*), kisi responsif dua dimensi (*Grid Reorder*), serta papan kerja multi-kolom (*Enterprise Kanban Board*) dengan dukungan perangkat sentuh (*touch/mobile*).

---

## 🌟 Fitur Unggulan

1. **Zero External Dependency**:
   - Berjalan murni di atas HTML5 Drag & Drop API dan Pointer/Touch Event fallback.
   - Tidak memerlukan dependensi pihak ketiga seperti `SortableJS` atau `vuedraggable`.
2. **3 Mode Operasi Utama**:
   - `mode="list"`: Pengurutan daftar vertikal atau horizontal.
   - `mode="grid"`: Penataan kartu dalam kisi (*grid layout*) 2, 3, 4, atau 6 kolom.
   - `mode="kanban"`: Papan kerja lintas kolom dengan kemampuan transfer kartu antar kolom, counter kuota, dan custom slot header/footer.
3. **Animasi FLIP Berkinerja Tinggi**:
   - Menggunakan Vue `<TransitionGroup>` dengan class transisi FLIP (`.dnd-flip-move`) sehingga kartu bergeser secara halus saat di-drag.
4. **Drag Handle atau Whole-Card Grab**:
   - `handle: true` (default): Item hanya dapat dipindahkan melalui ikon grip pegangan (`drag_indicator`) untuk mencegah konflik seleksi teks/input.
   - `handle: false`: Seluruh area kartu dapat ditarik (*grab & drop*).
5. **Dukungan Perangkat Sentuh (Mobile/Tablet)**:
   - Dilengkapi fallback event `touchstart`, `touchmove`, dan `touchend` dengan micro haptic feedback (`navigator.vibrate(10)`).
6. **Desain Modern & Kontras Solid**:
   - Mendukung 4 varian kartu: `bordered`, `flat`, `glass`, dan `default`.
   - Visual drop indicator bar berkontras tajam dengan efek denyut halus (*pulsing indicator*).
   - Ghost preview saat ditarik (`opacity-35 scale-[0.98] ring-2 ring-blue-500/60 shadow-xl rotate-1`).

---

## 🚀 Contoh Penggunaan Praktis

### 1. Sortable Task List (Mode: `list`)

```vue
<script setup>
import { ref } from 'vue';
import DragDrop from '@/Components/Pack/DragDrop.vue';

const tasks = ref([
    { id: '1', title: 'Review Pull Request Webhook' },
    { id: '2', title: 'Perbaiki Warna & Kontras UI' },
    { id: '3', title: 'Testing Deployment Server' },
]);
</script>

<template>
    <DragDrop
        v-model="tasks"
        mode="list"
        :handle="true"
        card-variant="bordered"
    >
        <template #item="{ item, index }">
            <div class="flex items-center justify-between w-full">
                <span class="font-bold text-slate-800 dark:text-slate-100">
                    {{ item.title }}
                </span>
                <span class="text-xs text-slate-400 font-mono">
                    #{{ index + 1 }}
                </span>
            </div>
        </template>
    </DragDrop>
</template>
```

---

### 2. Responsive Dashboard Widgets Grid (Mode: `grid`)

```vue
<script setup>
import { ref } from 'vue';
import DragDrop from '@/Components/Pack/DragDrop.vue';

const widgets = ref([
    { id: 'rev', title: 'Total Pendapatan', value: 'Rp 128.500.000', icon: 'payments' },
    { id: 'usr', title: 'Pengguna Aktif', value: '18.420', icon: 'group' },
    { id: 'cvr', title: 'Tingkat Konversi', value: '5.2%', icon: 'trending_up' },
]);
</script>

<template>
    <DragDrop
        v-model="widgets"
        mode="grid"
        :columns="3"
        :handle="false"
        card-variant="bordered"
    >
        <template #item="{ item }">
            <div class="space-y-1">
                <span class="text-xs text-slate-500 uppercase">{{ item.title }}</span>
                <div class="text-xl font-black text-slate-900 dark:text-white">{{ item.value }}</div>
            </div>
        </template>
    </DragDrop>
</template>
```

---

### 3. Enterprise Kanban Board (Mode: `kanban`)

```vue
<script setup>
import { ref } from 'vue';
import DragDrop from '@/Components/Pack/DragDrop.vue';

const boardColumns = ref([
    {
        id: 'todo',
        title: 'To Do',
        color: 'blue',
        items: [
            { id: 't1', title: 'Riset API Eksternal', priority: 'Medium' },
            { id: 't2', title: 'Setup Backup Database', priority: 'High' },
        ],
    },
    {
        id: 'in_progress',
        title: 'In Progress',
        color: 'amber',
        items: [
            { id: 't3', title: 'Implementasi Fitur DragDrop', priority: 'High' },
        ],
    },
    {
        id: 'done',
        title: 'Done',
        color: 'emerald',
        items: [
            { id: 't4', title: 'Standarisasi Palet Tailwind v4', priority: 'High' },
        ],
    },
]);
</script>

<template>
    <DragDrop
        v-model="boardColumns"
        mode="kanban"
        :handle="true"
        card-variant="bordered"
    >
        <template #item="{ item }">
            <div class="space-y-1">
                <h5 class="text-xs font-bold text-slate-800 dark:text-slate-100">{{ item.title }}</h5>
                <span class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {{ item.priority }}
                </span>
            </div>
        </template>
    </DragDrop>
</template>
```

---

## ⚙️ Referensi Props

| Nama Prop | Tipe Data | Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `modelValue` | `Array` | `[]` | Data array item (mode list/grid) atau array kolom (mode kanban). Mendukung `v-model`. |
| `mode` | `String` | `'list'` | Pilihan mode: `'list'`, `'grid'`, atau `'kanban'`. |
| `direction` | `String` | `'vertical'` | Orientasi mode list: `'vertical'` atau `'horizontal'`. |
| `columns` | `Number \| String` | `3` | Jumlah kolom pada mode grid (`1`, `2`, `3`, `4`, `6`). |
| `itemKey` | `String` | `'id'` | Nama properti unik pembeda antar item objek. |
| `handle` | `Boolean` | `true` | Jika `true`, hanya dapat ditarik melalui ikon grip drag handle. |
| `handlePosition` | `String` | `'left'` | Posisi ikon pegangan: `'left'` atau `'right'`. |
| `cardVariant` | `String` | `'bordered'` | Gaya kontainer kartu: `'bordered'`, `'flat'`, `'glass'`, `'default'`. |
| `size` | `String` | `'md'` | Ukuran padding dan teks: `'sm'`, `'md'`, `'lg'`. |
| `disabled` | `Boolean` | `false` | Menonaktifkan seluruh interaksi drag-and-drop. |
| `emptyText` | `String` | `'Tarik atau letakkan item di sini'` | Pesan placeholder saat daftar kosong. |

---

## 📡 Event (`emits`)

| Nama Event | Payload | Waktu Terpicu |
| :--- | :--- | :--- |
| `update:modelValue` | `Array` | Saat urutan item berubah atau berpindah kolom (two-way binding). |
| `change` | `{ type, item, fromIndex, toIndex, fromColumn, toColumn }` | Saat perubahan susunan selesai dieksekusi. |
| `drag-start` | `{ item, index, columnId }` | Saat pengguna mulai menarik item. |
| `drag-end` | `{ item, fromColumn, toColumn, fromIndex, toIndex }` | Saat item dilepaskan. |
| `reorder` | `Array` | Saat terjadi perubahan urutan di dalam list atau kolom yang sama. |
| `transfer` | `{ item, fromColumn, toColumn }` | Saat item dipindahkan dari satu kolom ke kolom lain (pada mode kanban). |

---

## 🧩 Scoped Slots

| Nama Slot | Parameter Slot | Keterangan |
| :--- | :--- | :--- |
| `#item` | `{ item, index, column, isDragging, handleProps }` | Kustomisasi tampilan isi kartu item secara penuh. |
| `#drag-handle` | `-` | Mengganti ikon default pegangan drag handle. |
| `#column-header` | `{ column, index, count }` | Kustomisasi bagian atas kolom Kanban. |
| `#column-footer` | `{ column, index }` | Menambahkan aksi di bagian bawah kolom Kanban (misal tombol *+ Tambah Kartu*). |

