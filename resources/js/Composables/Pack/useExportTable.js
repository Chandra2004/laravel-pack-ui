import { ref } from 'vue';

/**
 * useExportTable
 * Composable untuk mengekspor data array tabel ke format CSV (Excel-ready ber-BOM UTF-8),
 * file JSON, atau mencetak dokumen (print preview terisolasi).
 */
export function useExportTable() {
    const isExporting = ref(false);

    /**
     * Download blob file ke perangkat pengguna
     * @param {Blob} blob
     * @param {string} filename
     */
    const downloadBlob = (blob, filename) => {
        if (typeof window === 'undefined') return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
    };

    /**
     * Mengekspor array data ke format file CSV
     * @param {Array<Object>} data - Array objek data tabel
     * @param {Object} [options={}]
     * @param {string} [options.filename='export.csv'] - Nama file unduhan
     * @param {Array<Object|string>} [options.columns] - [{ key: 'id', label: 'ID' }] atau ['id', 'name']
     * @param {string} [options.delimiter=','] - Pemisah kolom (koma atau titik koma)
     * @returns {boolean}
     */
    const exportToCsv = (data, options = {}) => {
        if (!Array.isArray(data) || data.length === 0) {
            console.warn('[useExportTable] Data kosong, ekspor dibatalkan.');
            return false;
        }

        const {
            filename = 'export.csv',
            columns = null,
            delimiter = ',',
        } = options;

        isExporting.value = true;

        try {
            // Tentukan kolom header
            let cols = [];
            if (columns && Array.isArray(columns) && columns.length > 0) {
                cols = columns.map((col) => {
                    return typeof col === 'string' ? { key: col, label: col } : col;
                });
            } else {
                const sample = data[0] || {};
                cols = Object.keys(sample).map((k) => ({ key: k, label: k }));
            }

            // Header Baris CSV
            const headerRow = cols.map((col) => {
                const text = String(col.label || col.key).replace(/"/g, '""');
                return `"${text}"`;
            }).join(delimiter);

            // Baris Data CSV
            const rows = data.map((item) => {
                return cols.map((col) => {
                    let val = item[col.key];
                    if (val === null || val === undefined) val = '';
                    if (typeof val === 'object') val = JSON.stringify(val);
                    const escaped = String(val).replace(/"/g, '""');
                    return `"${escaped}"`;
                }).join(delimiter);
            });

            // Tambahkan UTF-8 Byte Order Mark (\uFEFF) agar Microsoft Excel langsung membaca aksen & simbol dengan benar
            const csvContent = '\uFEFF' + [headerRow, ...rows].join('\r\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

            const safeFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
            downloadBlob(blob, safeFilename);

            return true;
        } catch (err) {
            console.error('[useExportTable] Gagal ekspor CSV:', err);
            return false;
        } finally {
            isExporting.value = false;
        }
    };

    /**
     * Mengekspor array data ke format file JSON
     * @param {Array<Object>|Object} data
     * @param {string} [filename='export.json']
     * @returns {boolean}
     */
    const exportToJson = (data, filename = 'export.json') => {
        isExporting.value = true;
        try {
            const jsonContent = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
            const safeFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
            downloadBlob(blob, safeFilename);
            return true;
        } catch (err) {
            console.error('[useExportTable] Gagal ekspor JSON:', err);
            return false;
        } finally {
            isExporting.value = false;
        }
    };

    /**
     * Mencetak elemen tabel secara terisolasi via jendela print browser
     * @param {string} elementId - ID atribut dari kontainer tabel
     * @param {string} [docTitle='Laporan Cetak'] - Judul dokumen cetak
     */
    const printTable = (elementId, docTitle = 'Laporan Cetak') => {
        if (typeof document === 'undefined') return;

        const targetEl = document.getElementById(elementId);
        if (!targetEl) {
            console.warn(`[useExportTable] Elemen dengan ID "${elementId}" tidak ditemukan.`);
            return;
        }

        const printWindow = window.open('', '_blank', 'width=900,height=650');
        if (!printWindow) {
            console.warn('[useExportTable] Pop-up cetak diblokir browser.');
            return;
        }

        const html = `
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="utf-8">
                <title>${docTitle}</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #0f172a; }
                    h2 { margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
                    th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
                    th { background-color: #f1f5f9; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f8fafc; }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <h2>${docTitle}</h2>
                <div>${targetEl.innerHTML}</div>
                <script>
                    window.onload = function() {
                        window.focus();
                        window.print();
                        window.close();
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
    };

    return {
        exportToCsv,
        exportToJson,
        printTable,
        isExporting,
    };
}
