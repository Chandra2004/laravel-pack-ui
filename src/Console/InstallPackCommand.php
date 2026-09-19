<?php

namespace Chandra2004\LaravelPackUi\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;

class InstallPackCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pack:install
                            {--force : Timpa berkas komponen dan konfigurasi yang sudah ada}
                            {--all : Otomatis pasang seluruh dependensi prasyarat tanpa konfirmasi}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Pasang komponen Pack UI, composables, serta deteksi dan pasang Vue 3, Inertia.js, Ziggy Router, Tailwind CSS v4 & Material Symbols';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->newLine();
        $this->info('╔════════════════════════════════════════════════════════════╗');
        $this->info('║             🚀 Laravel Pack UI - Smart Installer           ║');
        $this->info('╚════════════════════════════════════════════════════════════╝');
        $this->newLine();

        $force = $this->option('force');
        $autoAll = $this->option('all');

        // 1. Audit Environment Prasyarat
        $status = $this->auditEnvironment();

        // 2. Setup Prasyarat yang Hilang
        $needsNpmInstall = false;

        $hasMissingDeps = !$status['inertia_php'] ||
                          !$status['ziggy_php'] ||
                          !$status['vue'] ||
                          !$status['inertia_vue'] ||
                          !$status['ziggy_js'] ||
                          !$status['tailwind'] ||
                          !$status['material_symbols'] ||
                          !$status['tiptap'] ||
                          !$status['blade_configured'] ||
                          !$status['app_js_configured'] ||
                          !$status['css_configured'] ||
                          !$status['vite_configured'] ||
                          !$status['inertia_flash_configured'];

        if ($hasMissingDeps) {
            $shouldProceed = $autoAll || $this->confirm('Apakah Anda ingin otomatis memasang dan mengonfigurasi dependensi yang belum ada?', true);

            if ($shouldProceed) {
                // A. Composer Backend Packages (Inertia Laravel & Tighten Ziggy)
                $missingComposer = [];
                if (!$status['inertia_php']) {
                    $missingComposer[] = 'inertiajs/inertia-laravel';
                }
                if (!$status['ziggy_php']) {
                    $missingComposer[] = 'tightenco/ziggy';
                }
                if (!empty($missingComposer)) {
                    $this->installComposerPackages($missingComposer);
                }

                // B. Node Dependencies (Vue, Inertia Vue3, Ziggy-JS, Tailwind CSS v4, Material Symbols)
                $needsNpmInstall = $this->configureNodeDependencies($status);

                // C. Blade Root Template (resources/views/app.blade.php dengan @routes & @inertia)
                if (!$status['blade_configured']) {
                    $this->configureAppBlade();
                }

                // D. Inertia & Ziggy Entrypoint (resources/js/app.js)
                if (!$status['app_js_configured']) {
                    $this->configureAppJs();
                }

                // E. CSS Styling (app.css)
                if (!$status['css_configured']) {
                    $this->configureAppCss();
                }

                // F. Vite Configuration (vite.config.js dengan alias ziggy-js & @)
                if (!$status['vite_configured']) {
                    $this->configureVite();
                }

                // G. HandleInertiaRequests Flash Props (Auto-Sync Toast Notification)
                if (!$status['inertia_flash_configured']) {
                    $this->configureHandleInertiaRequests();
                }
            } else {
                $this->warn('⚠️ Pemasangan dependensi dilewati. Pastikan Anda memasangnya secara manual.');
            }
        } else {
            $this->info('✨ Seluruh dependensi prasyarat (Vue 3, Inertia.js, Ziggy, Tailwind v4, Material Symbols) sudah lengkap!');
        }

        // 3. Publish Komponen Pack UI & Composables
        $this->newLine();
        $this->info('📦 Memasang Komponen Pack UI & Composables ke resources/js...');

        $this->call('vendor:publish', [
            '--tag' => 'pack-ui',
            '--force' => $force,
        ]);

        // 4. Jalankan atau Anjurkan NPM Install
        $nodeModulesMissing = !File::isDirectory(base_path('node_modules/@vitejs/plugin-vue')) ||
                              !File::isDirectory(base_path('node_modules/vue')) ||
                              !File::isDirectory(base_path('node_modules/@inertiajs/vue3'));

        if ($needsNpmInstall || $nodeModulesMissing) {
            $this->newLine();
            if ($autoAll || $this->confirm('Jalankan "npm install" sekarang untuk memasang/memastikan seluruh paket Node.js terpasang?', true)) {
                $this->runNpmInstall();
            } else {
                $this->warn('ℹ️ Silakan jalankan di terminal: npm install && npm run build');
            }
        }

        $this->newLine();
        $this->info('🎉 Instalasi selesai! Pack UI siap digunakan.');
        $this->line('  📁 Komponen UI : <comment>resources/js/Components/Pack</comment>');
        $this->line('  📁 Composables : <comment>resources/js/Composables/Pack</comment>');
        $this->line('  📁 Layouts     : <comment>resources/js/Layouts</comment>');
        $this->newLine();
        $this->comment('Contoh Pemakaian di Halaman Vue:');
        $this->line('  <info>import InputField from "@/Components/Pack/InputField.vue";</info>');
        $this->line('  <info>import DashboardLayout from "@/Layouts/DashboardLayout.vue";</info>');
        $this->line('  <info>import { useNotification } from "@/Composables/Pack/useNotification.js";</info>');
        $this->line('  <info>// Routing Ziggy: route("dashboard.index")</info>');
        $this->newLine();

        return self::SUCCESS;
    }

    /**
     * Audit kelengkapan environment project.
     */
    protected function auditEnvironment(): array
    {
        $this->line('🔍 Memeriksa environment project Anda...');

        $composerJson = $this->getComposerJson();
        $packageJson = $this->getPackageJson();
        $appCss = $this->getAppCssContent();
        $viteConfig = $this->getViteConfigContent();
        $appBlade = $this->getAppBladeContent();
        $appJs = $this->getAppJsContent();
        $middlewarePath = $this->getInertiaMiddlewarePath();
        $middlewareContent = $this->getInertiaMiddlewareContent();

        $hasVue = isset($packageJson['dependencies']['vue']) || isset($packageJson['devDependencies']['vue']);
        $hasPluginVue = isset($packageJson['dependencies']['@vitejs/plugin-vue']) || isset($packageJson['devDependencies']['@vitejs/plugin-vue']);
        $viteVersion = $packageJson['devDependencies']['vite'] ?? $packageJson['dependencies']['vite'] ?? '';
        $isVite7Plus = str_contains($viteVersion, '7') || str_contains($viteVersion, '8') || preg_match('/[~^]?[78]\./', $viteVersion);
        $pluginVueVersion = $packageJson['dependencies']['@vitejs/plugin-vue'] ?? $packageJson['devDependencies']['@vitejs/plugin-vue'] ?? '';
        $isPluginVueIncompatible = $isVite7Plus && $pluginVueVersion && str_starts_with(ltrim($pluginVueVersion, '^~'), '5');

        $isTailwindV4 = str_contains($viteConfig, '@tailwindcss/vite') || isset($packageJson['devDependencies']['@tailwindcss/vite']) || !isset($packageJson['devDependencies']['tailwindcss']);
        $tailwindViteOk = !$isTailwindV4 || (str_contains($viteConfig, '@tailwindcss/vite') && (bool) preg_match('/tailwindcss\s*\(/', $viteConfig));

        $status = [
            'inertia_php' => isset($composerJson['require']['inertiajs/inertia-laravel']),
            'ziggy_php' => isset($composerJson['require']['tightenco/ziggy']),
            'vue' => $hasVue && $hasPluginVue && !$isPluginVueIncompatible,
            'inertia_vue' => isset($packageJson['dependencies']['@inertiajs/vue3']) || isset($packageJson['devDependencies']['@inertiajs/vue3']),
            'ziggy_js' => isset($packageJson['dependencies']['ziggy-js']) || isset($packageJson['devDependencies']['ziggy-js']),
            'tailwind' => isset($packageJson['devDependencies']['tailwindcss']) || isset($packageJson['dependencies']['tailwindcss']) || isset($packageJson['devDependencies']['@tailwindcss/vite']),
            'material_symbols' => isset($packageJson['dependencies']['material-symbols']) || isset($packageJson['devDependencies']['material-symbols']),
            'tiptap' => isset($packageJson['dependencies']['@tiptap/vue-3']) || isset($packageJson['devDependencies']['@tiptap/vue-3']),
            'leaflet' => isset($packageJson['dependencies']['leaflet']) || isset($packageJson['devDependencies']['leaflet']),
            'blade_configured' => str_contains($appBlade, '@routes') && str_contains($appBlade, '@inertia'),
            'app_js_configured' => str_contains($appJs, 'createInertiaApp') && str_contains($appJs, 'ZiggyVue'),
            'css_configured' => str_contains($appCss, 'tailwindcss') && str_contains($appCss, 'material-symbols'),
            'vite_configured' => str_contains($viteConfig, '@vitejs/plugin-vue')
                && (bool) preg_match('/vue\s*\(/', $viteConfig)
                && (str_contains($viteConfig, "'ziggy-js'") || str_contains($viteConfig, '"ziggy-js"'))
                && (str_contains($viteConfig, "'@'") || str_contains($viteConfig, '"@"'))
                && $tailwindViteOk,
            'inertia_flash_configured' => File::exists($middlewarePath) && str_contains($middlewareContent, "'flash'") && str_contains($middlewareContent, "'success'"),
        ];

        $vueStatusLabel = '<comment>Belum Ada</comment>';
        if ($isPluginVueIncompatible) {
            $vueStatusLabel = '<comment>Perlu Upgrade Plugin Vue (^6.0 untuk Vite 7)</comment>';
        } elseif ($status['vue']) {
            $vueStatusLabel = '<info>Terpasang ✓</info>';
        }

        $rows = [
            ['Inertia.js (Laravel Backend)', $status['inertia_php'] ? '<info>Terpasang ✓</info>' : '<comment>Belum Ada</comment>'],
            ['Tighten Ziggy (Laravel Backend)', $status['ziggy_php'] ? '<info>Terpasang ✓</info>' : '<comment>Belum Ada</comment>'],
            ['Vue 3 & Vite Plugin', $vueStatusLabel],
            ['Inertia.js (Vue 3 Client)', $status['inertia_vue'] ? '<info>Terpasang ✓</info>' : '<comment>Belum Ada</comment>'],
            ['Ziggy JS Client (route() helper)', $status['ziggy_js'] ? '<info>Terpasang ✓</info>' : '<comment>Belum Ada</comment>'],
            ['Tailwind CSS v4 Engine', $status['tailwind'] ? '<info>Terpasang ✓</info>' : '<comment>Belum Ada</comment>'],
            ['Google Material Symbols Font', $status['material_symbols'] ? '<info>Terpasang ✓</info>' : '<comment>Belum Ada</comment>'],
            ['Tiptap Rich Text Editor Engine', $status['tiptap'] ? '<info>Terpasang ✓</info>' : '<comment>Belum Ada</comment>'],
            ['Leaflet OpenStreetMap Map Engine', ($status['leaflet'] ?? false) ? '<info>Terpasang ✓</info>' : '<comment>Belum Ada</comment>'],
            ['Root Layout (app.blade.php)', $status['blade_configured'] ? '<info>Terkonfigurasi ✓</info>' : '<comment>Belum Ada / Kurang @routes</comment>'],
            ['Vue Entrypoint (app.js)', $status['app_js_configured'] ? '<info>Terkonfigurasi ✓</info>' : '<comment>Belum Ada / Kurang ZiggyVue</comment>'],
            ['Styling Import (app.css)', $status['css_configured'] ? '<info>Terkonfigurasi ✓</info>' : '<comment>Belum Dikonfigurasi</comment>'],
            ['Vite Config (vite.config.js)', $status['vite_configured'] ? '<info>Terkonfigurasi ✓</info>' : '<comment>Belum Ada / Kurang Plugin Vue</comment>'],
            ['Inertia Flash Props (HandleInertiaRequests)', $status['inertia_flash_configured'] ? '<info>Terkonfigurasi ✓</info>' : '<comment>Belum Ada / Kurang Session Flash</comment>'],
        ];

        $this->table(['Dependensi / Fitur', 'Status'], $rows);
        $this->newLine();

        return $status;
    }

    /**
     * Memasang paket Composer (Inertia dan/atau Ziggy).
     */
    protected function installComposerPackages(array $packages): void
    {
        $packageList = implode(' ', $packages);
        $this->line("⏳ Memasang paket Composer: <info>{$packageList}</info>...");

        $composerPath = $this->findComposerBinary();
        $process = new Process(array_merge([$composerPath, 'require', '--no-interaction'], $packages));
        $process->setTimeout(300);
        $process->run(function ($type, $buffer) {
            $this->output->write($buffer);
        });

        if ($process->isSuccessful()) {
            $this->info("  ✓ Paket Composer ({$packageList}) berhasil dipasang.");
        } else {
            $this->warn("  ⚠️ Gagal menjalankan composer require secara otomatis. Silakan jalankan manual: composer require {$packageList}");
        }
    }

    /**
     * Menambahkan dependensi Vue, Inertia, Ziggy, Tailwind v4, dan Material Symbols ke package.json.
     */
    protected function configureNodeDependencies(array $status): bool
    {
        $this->line('📝 Memperbarui dependensi di <info>package.json</info>...');

        $packageJsonPath = base_path('package.json');
        if (!File::exists($packageJsonPath)) {
            $packageJson = [
                'private' => true,
                'type' => 'module',
                'scripts' => ['dev' => 'vite', 'build' => 'vite build'],
                'devDependencies' => [],
                'dependencies' => [],
            ];
        } else {
            $packageJson = json_decode(File::get($packageJsonPath), true) ?: [];
        }

        $modified = false;

        $viteVersion = $packageJson['devDependencies']['vite'] ?? $packageJson['dependencies']['vite'] ?? '';
        $isVite7Plus = str_contains($viteVersion, '7') || str_contains($viteVersion, '8') || preg_match('/[~^]?[78]\./', $viteVersion);

        // DevDependencies (Vue Vite Plugin)
        if (!$status['vue']) {
            $packageJson['dependencies']['vue'] = '^3.5.0';
            $packageJson['devDependencies']['@vitejs/plugin-vue'] = '^6.0.0';
            $modified = true;
        } else {
            if (!isset($packageJson['dependencies']['@vitejs/plugin-vue']) && !isset($packageJson['devDependencies']['@vitejs/plugin-vue'])) {
                $packageJson['devDependencies']['@vitejs/plugin-vue'] = '^6.0.0';
                $modified = true;
            } elseif ($isVite7Plus) {
                if (isset($packageJson['dependencies']['@vitejs/plugin-vue']) && str_starts_with(ltrim($packageJson['dependencies']['@vitejs/plugin-vue'], '^~'), '5')) {
                    unset($packageJson['dependencies']['@vitejs/plugin-vue']);
                    $packageJson['devDependencies']['@vitejs/plugin-vue'] = '^6.0.0';
                    $modified = true;
                }
                if (isset($packageJson['devDependencies']['@vitejs/plugin-vue']) && str_starts_with(ltrim($packageJson['devDependencies']['@vitejs/plugin-vue'], '^~'), '5')) {
                    $packageJson['devDependencies']['@vitejs/plugin-vue'] = '^6.0.0';
                    $modified = true;
                }
            }
        }

        if (!$status['inertia_vue']) {
            $packageJson['dependencies']['@inertiajs/vue3'] = '^2.0.0';
            $modified = true;
        }

        if (!$status['ziggy_js']) {
            $packageJson['dependencies']['ziggy-js'] = '^2.4.0';
            $modified = true;
        }

        if (!$status['material_symbols']) {
            $packageJson['dependencies']['material-symbols'] = '^0.47.0';
            $modified = true;
        }

        if (!$status['tiptap']) {
            $packageJson['dependencies']['@tiptap/vue-3'] = '^2.11.0';
            $packageJson['dependencies']['@tiptap/starter-kit'] = '^2.11.0';
            $packageJson['dependencies']['@tiptap/extension-link'] = '^2.11.0';
            $packageJson['dependencies']['@tiptap/extension-image'] = '^2.11.0';
            $packageJson['dependencies']['@tiptap/extension-underline'] = '^2.11.0';
            $packageJson['dependencies']['@tiptap/extension-text-align'] = '^2.11.0';
            $packageJson['dependencies']['@tiptap/extension-placeholder'] = '^2.11.0';
            $modified = true;
        }

        if (!($status['leaflet'] ?? false)) {
            $packageJson['dependencies']['leaflet'] = '^1.9.4';
            $modified = true;
        }

        // DevDependencies (Tailwind v4)
        if (!$status['tailwind']) {
            $packageJson['devDependencies']['tailwindcss'] = '^4.0.0';
            $packageJson['devDependencies']['@tailwindcss/vite'] = '^4.0.0';
            $modified = true;
        }

        if ($modified) {
            if (isset($packageJson['dependencies'])) {
                ksort($packageJson['dependencies']);
            }
            if (isset($packageJson['devDependencies'])) {
                ksort($packageJson['devDependencies']);
            }

            File::put($packageJsonPath, json_encode($packageJson, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL);
            $this->info('  ✓ package.json berhasil diperbarui dengan dependensi yang dibutuhkan.');
            return true;
        }

        return false;
    }

    /**
     * Memastikan resources/views/app.blade.php tersedia dengan directive @routes dan @inertia.
     */
    protected function configureAppBlade(): void
    {
        $this->line('📄 Mengonfigurasi <info>resources/views/app.blade.php</info>...');

        $bladePath = resource_path('views/app.blade.php');
        if (!File::exists($bladePath)) {
            $template = <<<'BLADE'
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <title inertia>{{ config('app.name', 'Laravel') }}</title>
    @routes
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @inertiaHead
  </head>
  <body class="h-full antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
    @inertia
  </body>
</html>
BLADE;
            File::ensureDirectoryExists(dirname($bladePath));
            File::put($bladePath, $template . PHP_EOL);
            $this->info('  ✓ resources/views/app.blade.php berhasil dibuat lengkap dengan @routes & @inertia.');
            return;
        }

        $content = File::get($bladePath);
        $modified = false;

        // Sisipkan @routes jika belum ada
        if (!str_contains($content, '@routes')) {
            if (str_contains($content, '@vite')) {
                $content = str_replace('@vite', "@routes\n    @vite", $content);
                $modified = true;
            } elseif (str_contains($content, '</head>')) {
                $content = str_replace('</head>', "    @routes\n  </head>", $content);
                $modified = true;
            }
        }

        // Sisipkan @inertiaHead jika belum ada
        if (!str_contains($content, '@inertiaHead') && str_contains($content, '</head>')) {
            $content = str_replace('</head>', "    @inertiaHead\n  </head>", $content);
            $modified = true;
        }

        // Sisipkan @inertia jika belum ada
        if (!str_contains($content, '@inertia') && str_contains($content, '</body>')) {
            $content = str_replace('</body>', "    @inertia\n  </body>", $content);
            $modified = true;
        }

        if ($modified) {
            File::put($bladePath, $content);
            $this->info('  ✓ resources/views/app.blade.php berhasil diperbarui dengan @routes.');
        }
    }

    /**
     * Memastikan resources/js/app.js mengonfigurasi createInertiaApp dan plugin ZiggyVue.
     */
    protected function configureAppJs(): void
    {
        $this->line('⚡ Mengonfigurasi <info>resources/js/app.js</info>...');

        $appJsPath = resource_path('js/app.js');
        if (!File::exists($appJsPath)) {
            $template = <<<'JS'
import './bootstrap';
import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { ZiggyVue } from 'ziggy-js';

createInertiaApp({
    resolve: name => {
        const pages = import.meta.glob('./Pages/**/*.vue', { eager: true });
        return pages[`./Pages/${name}.vue`];
    },
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(ZiggyVue)
            .mount(el);
    },
    progress: {
        color: '#4B5563',
    },
});
JS;
            File::ensureDirectoryExists(dirname($appJsPath));
            File::put($appJsPath, $template . PHP_EOL);
            $this->info('  ✓ resources/js/app.js berhasil dibuat dengan Inertia & ZiggyVue.');
            return;
        }

        $content = File::get($appJsPath);

        // Jika app.js belum memiliki createInertiaApp (misal fresh Laravel hanya berisi import './bootstrap';)
        if (!str_contains($content, 'createInertiaApp')) {
            $template = <<<'JS'
import './bootstrap';
import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { ZiggyVue } from 'ziggy-js';

createInertiaApp({
    resolve: name => {
        const pages = import.meta.glob('./Pages/**/*.vue', { eager: true });
        return pages[`./Pages/${name}.vue`];
    },
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(ZiggyVue)
            .mount(el);
    },
    progress: {
        color: '#4B5563',
    },
});
JS;
            File::put($appJsPath, $template . PHP_EOL);
            $this->info('  ✓ resources/js/app.js berhasil dikonfigurasi dengan createInertiaApp & ZiggyVue.');
            return;
        }

        $modified = false;

        // Tambahkan import ZiggyVue jika belum ada
        if (!str_contains($content, 'ZiggyVue')) {
            if (!str_contains($content, "import { ZiggyVue } from 'ziggy-js';") && !str_contains($content, 'import { ZiggyVue } from "ziggy-js";')) {
                $content = "import { ZiggyVue } from 'ziggy-js';\n" . $content;
                $modified = true;
            }

            // Sisipkan .use(ZiggyVue) sebelum .mount(el)
            if (str_contains($content, '.mount(el)')) {
                $content = str_replace('.mount(el)', ".use(ZiggyVue)\n            .mount(el)", $content);
                $modified = true;
            }
        }

        if ($modified) {
            File::put($appJsPath, $content);
            $this->info('  ✓ resources/js/app.js berhasil diintegrasikan dengan ZiggyVue.');
        }
    }

    /**
     * Memastikan resources/css/app.css mengimpor tailwindcss dan material-symbols.
     */
    protected function configureAppCss(): void
    {
        $this->line('🎨 Mengonfigurasi <info>resources/css/app.css</info>...');

        $cssPath = resource_path('css/app.css');
        $content = File::exists($cssPath) ? File::get($cssPath) : '';

        $additions = [];

        if (!str_contains($content, "@import 'tailwindcss'") && !str_contains($content, '@import "tailwindcss"')) {
            $additions[] = "@import 'tailwindcss';";
        }

        if (!str_contains($content, "@import 'material-symbols'") && !str_contains($content, '@import "material-symbols"')) {
            $additions[] = "@import 'material-symbols';";
        }

        if (!str_contains($content, '@custom-variant dark')) {
            $additions[] = "";
            $additions[] = "@custom-variant dark (&:where(.dark, .dark *));";
        }

        if (!empty($additions)) {
            $newContent = implode(PHP_EOL, $additions) . PHP_EOL . PHP_EOL . ltrim($content);
            File::ensureDirectoryExists(dirname($cssPath));
            File::put($cssPath, $newContent);
            $this->info('  ✓ resources/css/app.css berhasil dikonfigurasi.');
        }
    }

    /**
     * Memastikan vite.config.js mengaktifkan plugin vue, tailwindcss, dan alias ziggy-js & @.
     */
    protected function configureVite(): void
    {
        $this->line('⚡ Memeriksa & Mengonfigurasi <info>vite.config.js</info>...');

        $vitePath = base_path('vite.config.js');
        if (!File::exists($vitePath)) {
            $template = <<<'JS'
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            'ziggy-js': path.resolve('vendor/tightenco/ziggy'),
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
});
JS;
            File::put($vitePath, $template . PHP_EOL);
            $this->info('  ✓ vite.config.js berhasil dibuat dengan dukungan Vue, Tailwind v4, dan Ziggy.');
            return;
        }

        $content = File::get($vitePath);
        $modified = false;

        // 1. Tambahkan import jika belum ada
        if (!str_contains($content, "import path from 'path';") && !str_contains($content, 'import path from "path";')) {
            $content = "import path from 'path';\n" . $content;
            $modified = true;
        }

        if (!str_contains($content, '@vitejs/plugin-vue')) {
            $content = "import vue from '@vitejs/plugin-vue';\n" . $content;
            $modified = true;
        }

        if (!str_contains($content, '@tailwindcss/vite')) {
            $content = "import tailwindcss from '@tailwindcss/vite';\n" . $content;
            $modified = true;
        }

        // 2. Tambahkan plugin ke dalam plugins: [...]
        $pluginsToInject = [];
        if (!preg_match('/vue\s*\(/', $content)) {
            $pluginsToInject[] = "        vue({\n            template: {\n                transformAssetUrls: {\n                    base: null,\n                    includeAbsolute: false,\n                },\n            },\n        }),";
        }

        if (!preg_match('/tailwindcss\s*\(/', $content)) {
            $pluginsToInject[] = "        tailwindcss(),";
        }

        if (!empty($pluginsToInject)) {
            $injectionStr = implode("\n", $pluginsToInject);

            // Cek apakah laravel(...) ada di dalam konfigurasi
            $posLaravel = strpos($content, 'laravel(');
            if ($posLaravel !== false) {
                // Cari matching closing parenthesis ')' untuk laravel(...)
                $len = strlen($content);
                $parenDepth = 0;
                $endLaravelPos = false;
                for ($i = $posLaravel; $i < $len; $i++) {
                    if ($content[$i] === '(') {
                        $parenDepth++;
                    } elseif ($content[$i] === ')') {
                        $parenDepth--;
                        if ($parenDepth === 0) {
                            $endLaravelPos = $i;
                            break;
                        }
                    }
                }

                if ($endLaravelPos !== false) {
                    $restAfterParen = substr($content, $endLaravelPos + 1);
                    $hasComma = false;
                    $commaOffset = 0;
                    if (preg_match('/^\s*,/', $restAfterParen, $commaMatches)) {
                        $hasComma = true;
                        $commaOffset = strlen($commaMatches[0]);
                    }

                    $insertPoint = $endLaravelPos + 1 + ($hasComma ? $commaOffset : 0);
                    $toInsert = ($hasComma ? "" : ",") . "\n" . $injectionStr;
                    $content = substr_replace($content, $toInsert, $insertPoint, 0);
                    $modified = true;
                }
            } elseif (preg_match('/plugins\s*:\s*\[/', $content, $matches, PREG_OFFSET_CAPTURE)) {
                $insertPoint = $matches[0][1] + strlen($matches[0][0]);
                $toInsert = "\n" . $injectionStr;
                $content = substr_replace($content, $toInsert, $insertPoint, 0);
                $modified = true;
            }
        }

        // 3. Periksa alias @ dan ziggy-js
        $hasZiggyAlias = str_contains($content, "'ziggy-js'") || str_contains($content, '"ziggy-js"');
        $hasAtAlias = str_contains($content, "'@'") || str_contains($content, '"@"');

        if (!$hasZiggyAlias || !$hasAtAlias) {
            if (str_contains($content, 'alias: {')) {
                $aliasLines = [];
                if (!$hasZiggyAlias) {
                    $aliasLines[] = "            'ziggy-js': path.resolve('vendor/tightenco/ziggy'),";
                }
                if (!$hasAtAlias) {
                    $aliasLines[] = "            '@': path.resolve(__dirname, './resources/js'),";
                }
                $content = str_replace("alias: {", "alias: {\n" . implode("\n", $aliasLines), $content);
                $modified = true;
            } elseif (str_contains($content, 'resolve: {')) {
                $aliasSnippet = "        alias: {\n" .
                    (!$hasZiggyAlias ? "            'ziggy-js': path.resolve('vendor/tightenco/ziggy'),\n" : "") .
                    (!$hasAtAlias ? "            '@': path.resolve(__dirname, './resources/js'),\n" : "") .
                    "        },\n";
                $content = str_replace("resolve: {", "resolve: {\n" . $aliasSnippet, $content);
                $modified = true;
            } else {
                $aliasSnippet = "    resolve: {\n        alias: {\n" .
                    (!$hasZiggyAlias ? "            'ziggy-js': path.resolve('vendor/tightenco/ziggy'),\n" : "") .
                    (!$hasAtAlias ? "            '@': path.resolve(__dirname, './resources/js'),\n" : "") .
                    "        },\n    },\n";
                $pos = strrpos($content, '});');
                if ($pos !== false) {
                    $content = substr_replace($content, $aliasSnippet . "});\n", $pos, 3);
                    $modified = true;
                }
            }
        }

        if ($modified) {
            File::put($vitePath, $content);
            $this->info('  ✓ vite.config.js berhasil diperbarui dengan plugin Vue, Tailwind v4, dan alias Ziggy.');
        } else {
            $this->info('  ✓ vite.config.js sudah memiliki konfigurasi yang sesuai.');
        }
    }

    /**
     * Menjalankan perintah npm install.
     */
    protected function runNpmInstall(): void
    {
        $this->line('⏳ Menjalankan <info>npm install</info>...');

        $npmBinary = $this->findNpmBinary();
        $process = new Process([$npmBinary, 'install']);
        $process->setTimeout(300);
        $process->run(function ($type, $buffer) {
            $this->output->write($buffer);
        });

        if ($process->isSuccessful()) {
            $this->info('  ✓ Seluruh paket Node.js berhasil terpasang.');
        } else {
            $this->warn('  ⚠️ Gagal menjalankan npm install secara otomatis. Silakan jalankan secara manual: npm install');
        }
    }

    protected function findComposerBinary(): string
    {
        return 'composer';
    }

    protected function findNpmBinary(): string
    {
        return PHP_OS_FAMILY === 'Windows' ? 'npm.cmd' : 'npm';
    }

    protected function getComposerJson(): array
    {
        $path = base_path('composer.json');
        return File::exists($path) ? (json_decode(File::get($path), true) ?: []) : [];
    }

    protected function getPackageJson(): array
    {
        $path = base_path('package.json');
        return File::exists($path) ? (json_decode(File::get($path), true) ?: []) : [];
    }

    protected function getAppCssContent(): string
    {
        $path = resource_path('css/app.css');
        return File::exists($path) ? File::get($path) : '';
    }

    protected function getViteConfigContent(): string
    {
        $path = base_path('vite.config.js');
        return File::exists($path) ? File::get($path) : '';
    }

    protected function getAppBladeContent(): string
    {
        $path = resource_path('views/app.blade.php');
        return File::exists($path) ? File::get($path) : '';
    }

    protected function getAppJsContent(): string
    {
        $path = resource_path('js/app.js');
        return File::exists($path) ? File::get($path) : '';
    }

    protected function getInertiaMiddlewarePath(): string
    {
        return app_path('Http/Middleware/HandleInertiaRequests.php');
    }

    protected function getInertiaMiddlewareContent(): string
    {
        $path = $this->getInertiaMiddlewarePath();
        return File::exists($path) ? File::get($path) : '';
    }

    /**
     * Mengonfigurasi flash session props pada HandleInertiaRequests.php
     * agar useNotification otomatis memicu toast notification dari redirect backend.
     */
    protected function configureHandleInertiaRequests(): void
    {
        $this->line('📝 Memeriksa dan mengonfigurasi <info>HandleInertiaRequests.php</info>...');

        $middlewarePath = $this->getInertiaMiddlewarePath();
        $flashSnippet = "            'flash' => [\n" .
            "                'info' => fn() => \$request->session()->get('info'),\n" .
            "                'success' => fn() => \$request->session()->get('success'),\n" .
            "                'warning' => fn() => \$request->session()->get('warning'),\n" .
            "                'error' => fn() => \$request->session()->get('error'),\n" .
            "                'message' => fn() => \$request->session()->get('message'),\n" .
            "                'alert' => fn() => \$request->session()->get('alert'),\n" .
            "            ],\n";

        if (!File::exists($middlewarePath)) {
            File::ensureDirectoryExists(dirname($middlewarePath));

            $template = "<?php\n\n" .
                "namespace App\\Http\\Middleware;\n\n" .
                "use Illuminate\\Http\\Request;\n" .
                "use Inertia\\Middleware;\n\n" .
                "class HandleInertiaRequests extends Middleware\n" .
                "{\n" .
                "    /**\n" .
                "     * The root template that's loaded on the first page visit.\n" .
                "     *\n" .
                "     * @see https://inertiajs.com/server-side-setup#root-template\n" .
                "     *\n" .
                "     * @var string\n" .
                "     */\n" .
                "    protected \$rootView = 'app';\n\n" .
                "    /**\n" .
                "     * Determines the current asset version.\n" .
                "     *\n" .
                "     * @see https://inertiajs.com/asset-versioning\n" .
                "     */\n" .
                "    public function version(Request \$request): ?string\n" .
                "    {\n" .
                "        return parent::version(\$request);\n" .
                "    }\n\n" .
                "    /**\n" .
                "     * Define the props that are shared by default.\n" .
                "     *\n" .
                "     * @see https://inertiajs.com/shared-data\n" .
                "     *\n" .
                "     * @return array<string, mixed>\n" .
                "     */\n" .
                "    public function share(Request \$request): array\n" .
                "    {\n" .
                "        return [\n" .
                "            ...parent::share(\$request),\n" .
                $flashSnippet .
                "        ];\n" .
                "    }\n" .
                "}\n";

            File::put($middlewarePath, $template);
            $this->info('  ✓ Berkas HandleInertiaRequests.php berhasil dibuat dengan sharing flash session.');

            $this->registerInertiaMiddlewareInBootstrap();
            return;
        }

        $content = File::get($middlewarePath);

        if (str_contains($content, "'flash'") && str_contains($content, "'success'")) {
            $this->info('  ✓ HandleInertiaRequests.php sudah memiliki konfigurasi flash session.');
            return;
        }

        $modified = false;
        if (str_contains($content, '...parent::share($request),')) {
            $content = str_replace(
                '...parent::share($request),',
                "...parent::share(\$request),\n" . $flashSnippet,
                $content
            );
            $modified = true;
        } elseif (str_contains($content, 'parent::share($request),')) {
            $content = str_replace(
                'parent::share($request),',
                "parent::share(\$request),\n" . $flashSnippet,
                $content
            );
            $modified = true;
        } elseif (preg_match('/(public\s+function\s+share\s*\([^)]*\)\s*:\s*array\s*\{[^}]*return\s*\[)/s', $content, $matches)) {
            $content = str_replace(
                $matches[1],
                $matches[1] . "\n" . $flashSnippet,
                $content
            );
            $modified = true;
        }

        if ($modified) {
            File::put($middlewarePath, $content);
            $this->info('  ✓ Session flash props berhasil disinkronkan ke HandleInertiaRequests.php.');
        } else {
            $this->warn('  ⚠️ Tidak dapat menemukan titik injeksi otomatis pada method share() di HandleInertiaRequests.php.');
            $this->line('     Silakan tambahkan array flash secara manual ke dalam return share():');
            $this->comment("     'flash' => ['success' => fn() => \$request->session()->get('success'), ...]");
        }
    }

    /**
     * Mendaftarkan HandleInertiaRequests di bootstrap/app.php (Laravel 11/12) jika belum terdaftar.
     */
    protected function registerInertiaMiddlewareInBootstrap(): void
    {
        $bootstrapApp = base_path('bootstrap/app.php');
        if (!File::exists($bootstrapApp)) return;

        $content = File::get($bootstrapApp);
        if (str_contains($content, 'HandleInertiaRequests::class')) return;

        if (str_contains($content, '->withMiddleware(function (Middleware $middleware)')) {
            $useStatement = "use App\\Http\\Middleware\\HandleInertiaRequests;\n";
            if (!str_contains($content, 'use App\Http\Middleware\HandleInertiaRequests;')) {
                $content = preg_replace('/(<\?php\s+)/', "$1\n" . $useStatement, $content, 1);
            }

            $appendMiddleware = "\n        \$middleware->web(append: [\n            HandleInertiaRequests::class,\n        ]);\n";
            $content = preg_replace(
                '/(->withMiddleware\(function\s*\(Middleware\s*\$middleware\)\s*(?::\s*void\s*)?\{\s*)/',
                "$1" . $appendMiddleware,
                $content,
                1
            );

            File::put($bootstrapApp, $content);
            $this->info('  ✓ Middleware HandleInertiaRequests berhasil didaftarkan di bootstrap/app.php.');
        }
    }
}
