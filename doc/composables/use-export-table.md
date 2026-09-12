# 📤 Composable `useExportTable`

[← Kembali ke Dokumentasi Utama](../../README.md) | [Lihat Komponen TableComponent](../components/table.md)

`useExportTable` adalah composable untuk mengekspor data tabel menjadi file **CSV** (dioptimasi khusus untuk Microsoft Excel dengan *UTF-8 Byte Order Mark*), berkas **JSON**, atau mencetak tabel secara terisolasi tanpa merusak layout dashboard utama.

---

## 🚀 Penggunaan

```vue
<script setup>
import { useExportTable } from '@/Composables/Pack/useExportTable';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';

const { exportToCsv, exportToJson, printTable, isExporting } = useExportTable();

const sampleTransactions = [
    { id: 'TRX-001', customer: 'Budi Santoso', amount: 1500000, status: 'PAID' },
    { id: 'TRX-002', customer: 'Siti Aminah', amount: 850000, status: 'PENDING' },
];

const handleExport = () => {
    exportToCsv(sampleTransactions, {
        filename: 'Laporan-Transaksi.csv',
        columns: [
            { key: 'id', label: 'Nomor Transaksi' },
            { key: 'customer', label: 'Nama Pelanggan' },
            { key: 'amount', label: 'Total Pembayaran (IDR)' },
            { key: 'status', label: 'Status' },
        ],
    });
};
</script>

<template>
  <div class="flex gap-2">
    <ButtonSubmit
      size="sm"
      variant="secondary"
      icon="download"
      :loading="isExporting"
      @click="handleExport"
    >
      Unduh CSV Excel
    </ButtonSubmit>

    <ButtonSubmit
      size="sm"
      variant="ghost"
      icon="print"
      @click="printTable('my-table-id', 'Laporan Transaksi')"
    >
      Cetak Dokumen
    </ButtonSubmit>
  </div>
</template>
```

---

## 📋 Daftar API & Method

| Method | Parameter | Keterangan |
| :--- | :--- | :--- |
| `exportToCsv()` | `(data: Array, options?: Object)` | Mengunduh file CSV dengan BOM UTF-8 `\uFEFF` |
| `exportToJson()` | `(data: Array \| Object, filename?: string)` | Mengunduh file data berformat JSON |
| `printTable()` | `(elementId: string, docTitle?: string)` | Mencetak isi kontainer tabel dalam iframe/window terpisah |
| `isExporting` | `Ref<boolean>` | Status loading saat proses ekspor berkas |
