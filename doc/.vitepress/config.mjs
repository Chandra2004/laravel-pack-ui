import { defineConfig } from 'vitepress';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docRoot = path.resolve(__dirname, '..');

/**
 * Mencari nama file/direktori tanpa sensitif terhadap huruf besar/kecil (case-insensitive)
 */
function findCaseInsensitivePath(parentDir, targetName) {
  if (!fs.existsSync(parentDir)) return null;
  const entries = fs.readdirSync(parentDir);
  const matched = entries.find(e => e.toLowerCase() === targetName.toLowerCase());
  return matched ? { fullPath: path.join(parentDir, matched), actualName: matched } : null;
}

/**
 * Ekstraksi label judul dari file markdown
 */
function extractLabel(filePath, fileName) {
  const baseName = fileName.replace(/\.md$/, '');
  let label = '';

  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // 1. Ambil title dari frontmatter
    const fmMatch = content.match(/^---\r?\n[\s\S]*?title:\s*["']?([^"'\r\n]+)["']?[\s\S]*?---/);
    if (fmMatch && fmMatch[1]) {
      label = fmMatch[1].trim();
    }

    // 2. Ambil dari heading pertama '# '
    if (!label) {
      const firstHeading = content.split('\n').find(line => line.startsWith('# '));
      if (firstHeading) {
        const matchCode = firstHeading.match(/\(`?([a-zA-Z0-9]+)\.(vue|js)`?\)/i);
        if (matchCode) {
          label = matchCode[1];
        } else {
          label = firstHeading
            .replace(/^#\s+/, '')
            .replace(/^[^\w\s]+/, '')
            .replace(/\(.*?\)/g, '')
            .replace(/[`*]/g, '')
            .trim();
        }
      }
    }
  } catch (e) {}

  // 3. Fallback format nama file
  if (!label) {
    if (baseName.startsWith('use-')) {
      label = baseName.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    } else {
      label = baseName
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');
    }
  }

  return label;
}

/**
 * Pemindai folder rekursif (mendukung subfolder seperti Pack/ dan case-insensitive)
 */
function scanDirectory(currentPath, urlPrefix) {
  if (!fs.existsSync(currentPath)) return [];

  const entries = fs.readdirSync(currentPath, { withFileTypes: true });
  const items = [];

  // Urutkan entri: folder terlebih dahulu lalu file secara alfabetis
  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name.toLowerCase() === 'index.md') continue;

    const fullChildPath = path.join(currentPath, entry.name);

    if (entry.isDirectory()) {
      const nestedItems = scanDirectory(fullChildPath, `${urlPrefix}/${entry.name}`);
      if (nestedItems.length > 0) {
        items.push({
          text: entry.name,
          collapsed: false,
          items: nestedItems
        });
      }
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const label = extractLabel(fullChildPath, entry.name);
      const fileSlug = entry.name.replace(/\.md$/, '');
      items.push({
        text: label,
        link: `${urlPrefix}/${fileSlug}`
      });
    }
  }

  return items;
}

/**
 * Menghitung total file markdown dalam kumpulan items (termasuk di dalam sub-grup)
 */
function countDocItems(items) {
  let count = 0;
  for (const item of items) {
    if (item.items) {
      count += countDocItems(item.items);
    } else if (item.link) {
      count += 1;
    }
  }
  return count;
}

/**
 * Membaca kategori dokumen utama (Components, Composables, Layouts, Pages)
 */
function getCategoryGroup(folderName, titlePrefix, defaultCollapsed = false) {
  const resolved = findCaseInsensitivePath(docRoot, folderName);
  if (!resolved) return null;

  const items = scanDirectory(resolved.fullPath, `/${resolved.actualName}`);
  const total = countDocItems(items);

  if (total === 0) return null;

  return {
    text: `${titlePrefix} (${total})`,
    collapsed: defaultCollapsed,
    items: items
  };
}

// Inisialisasi Kategori (Updated 1790990226799)
const componentGroup = getCategoryGroup('components', 'Komponen UI', false);
const composableGroup = getCategoryGroup('composables', 'Composables', true);
const layoutGroup = getCategoryGroup('layouts', 'Layouts', true);
const pageGroup = getCategoryGroup('pages', 'Pages', true);

export default defineConfig({
  title: 'Laravel Pack UI',
  description: 'Enterprise UI Components & Composables for Laravel + Inertia.js + Vue 3',
  lang: 'id-ID',
  base: '/',
  cleanUrls: true,
  ignoreDeadLinks: true,
  outDir: path.resolve(__dirname, '../../../../public'),

  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap' }],
  ],

  markdown: {
    config(md) {
      const defaultFence = md.renderer.rules.fence;
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        if (token.info.trim() === 'mermaid') {
          const base64 = Buffer.from(token.content, 'utf-8').toString('base64');
          return `<ClientOnly><Mermaid graph="${base64}" /></ClientOnly>`;
        }
        return defaultFence(tokens, idx, options, env, self);
      };
    }
  },

  vite: {
    build: {
      emptyOutDir: false,
    },
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../../resources/js'),
      },
    },
  },

  themeConfig: {
    siteTitle: 'Laravel Pack UI',

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: 'Cari dokumentasi...',
                buttonAriaLabel: 'Cari'
              },
              modal: {
                noResultsText: 'Tidak ada hasil untuk',
                resetButtonTitle: 'Reset pencarian',
                footer: {
                  selectText: 'untuk memilih',
                  navigateText: 'untuk navigasi',
                  closeText: 'untuk menutup'
                }
              }
            }
          }
        }
      }
    },

    nav: [
      { text: 'Panduan Setup', link: '/setup' },
      { text: 'Komponen Preview', link: 'http://localhost:8000/preview/alert', target: '_self' },
    ],

    sidebar: {
      '/': [
        {
          text: 'Memulai',
          items: [
            { text: 'Pengenalan', link: '/' },
            { text: 'Panduan & Setup', link: '/setup' },
            { text: 'InstallPackCommand', link: '/install-pack-command' },
            { text: 'PackUiServiceProvider', link: '/pack-ui-service-provider' },
          ]
        },
        ...(componentGroup ? [componentGroup] : []),
        ...(composableGroup ? [composableGroup] : []),
        ...(layoutGroup ? [layoutGroup] : []),
        ...(pageGroup ? [pageGroup] : [])
      ]
    },

    footer: {
      message: 'Dirilis di bawah Lisensi MIT.',
      copyright: 'Copyright © 2026 Chandra Tri Antomo'
    }
  }
});
