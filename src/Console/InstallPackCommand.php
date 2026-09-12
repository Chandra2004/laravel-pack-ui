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
    protected $description = 'Pasang komponen Pack UI, composables, serta deteksi dan pasang Vue, Inertia, Tailwind & Material Symbols';

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
                          !$status['vue'] || 
                          !$status['inertia_vue'] || 
                          !$status['tailwind'] || 
                          !$status['material_symbols'] ||
                          !$status['css_configured'] ||
                          !$status['vite_configured'];

        if ($hasMissingDeps) {
            $shouldProceed = $autoAll || $this->confirm('Apakah Anda ingin otomatis memasang dan mengonfigurasi dependensi yang belum ada?', true);

            if ($shouldProceed) {
                // A. Inertia.js Backend (PHP)
                if (!$status['inertia_php']) {
                    $this->installInertiaPhp();
                }

                // B. Node Dependencies (Vue, Inertia Vue3, Tailwind CSS v4, Material Symbols)
                $needsNpmInstall = $this->configureNodeDependencies($status);

                // C. CSS Styling (app.css)
                if (!$status['css_configured']) {
                    $this->configureAppCss();
                }

                // D. Vite Configuration (vite.config.js)
                if (!$status['vite_configured']) {
                    $this->configureVite();
                }
            } else {
                $this->warn('⚠️ Pemasangan dependensi dilewati. Pastikan Anda memasangnya secara manual.');
            }
        } else {
            $this->info('✨ Seluruh dependensi prasyarat (Vue, Inertia, Tailwind v4, Material Symbols) sudah terdeteksi lengkap!');
        }

        // 3. Publish Komponen Pack UI & Composables
        $this->newLine();
        $this->info('📦 Memasang Komponen Pack UI & Composables ke resources/js...');

        $this->call('vendor:publish', [
            '--tag' => 'pack-ui',
            '--force' => $force,
        ]);

        // 4. Jalankan atau Anjurkan NPM Install
        if ($needsNpmInstall) {
            $this->newLine();
            if ($autoAll || $this->confirm('Jalankan "npm install" sekarang untuk memasang dependensi baru?', true)) {
                $this->runNpmInstall();
            } else {
                $this->warn('ℹ️ Silakan jalankan: npm install && npm run build');
            }
        }

        $this->newLine();
        $this->info('🎉 Instalasi selesai! Pack UI siap digunakan.');
        $this->line('  📁 Komponen UI : <comment>resources/js/Components/Pack</comment>');
        $this->line('  📁 Composables : <comment>resources/js/Composables/Pack</comment>');
        $this->newLine();
        $this->comment('Contoh Pemakaian di Halaman Vue:');
        $this->line('  <info>import InputField from "@/Components/Pack/InputField.vue";</info>');
        $this->line('  <info>import ButtonSubmit from "@/Components/Pack/ButtonSubmit.vue";</info>');
        $this->line('  <info>import { useNotification } from "@/Composables/Pack/useNotification.js";</info>');
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

        $status = [
            'inertia_php' => isset($composerJson['require']['inertiajs/inertia-laravel']),
            'vue' => isset($packageJson['dependencies']['vue']) || isset($packageJson['devDependencies']['vue']),
            'inertia_vue' => isset($packageJson['dependencies']['@inertiajs/vue3']) || isset($packageJson['devDependencies']['@inertiajs/vue3']),
            'tailwind' => isset($packageJson['devDependencies']['tailwindcss']) || isset($packageJson['dependencies']['tailwindcss']) || isset($packageJson['devDependencies']['@tailwindcss/vite']),
            'material_symbols' => isset($packageJson['dependencies']['material-symbols']) || isset($packageJson['devDependencies']['material-symbols']),
            'css_configured' => str_contains($appCss, 'tailwindcss') && str_contains($appCss, 'material-symbols'),
            'vite_configured' => str_contains($viteConfig, '@tailwindcss/vite') && str_contains($viteConfig, '@vitejs/plugin-vue'),
        ];

        $rows = [
            ['Inertia.js (Laravel Backend)', $status['inertia_php'] ? '<info>Terpasang ✓</info>' : '<comment>Belum Ada</comment>'],
            ['Vue 3 & Plugin Vite', $status['vue'] ? '<info>Terpasang ✓</info>' : '<comment>Belum Ada</comment>'],
            ['Inertia.js (Vue 3 Client)', $status['inertia_vue'] ? '<info>Terpasang ✓</info>' : '<comment>Belum Ada</comment>'],
            ['Tailwind CSS v4 Engine', $status['tailwind'] ? '<info>Terpasang ✓</info>' : '<comment>Belum Ada</comment>'],
            ['Google Material Symbols', $status['material_symbols'] ? '<info>Terpasang ✓</info>' : '<comment>Belum Ada</comment>'],
            ['Styling Import (app.css)', $status['css_configured'] ? '<info>Terkonfigurasi ✓</info>' : '<comment>Belum Dikonfigurasi</comment>'],
            ['Vite Config (vite.config.js)', $status['vite_configured'] ? '<info>Terkonfigurasi ✓</info>' : '<comment>Belum Dikonfigurasi</comment>'],
        ];

        $this->table(['Dependensi / Fitur', 'Status'], $rows);
        $this->newLine();

        return $status;
    }

    /**
     * Memasang inertiajs/inertia-laravel via Composer jika belum ada.
     */
    protected function installInertiaPhp(): void
    {
        $this->line('⏳ Memasang <info>inertiajs/inertia-laravel</info> via Composer...');

        $composerPath = $this->findComposerBinary();
        $process = new Process([$composerPath, 'require', 'inertiajs/inertia-laravel', '--no-interaction']);
        $process->setTimeout(300);
        $process->run(function ($type, $buffer) {
            $this->output->write($buffer);
        });

        if ($process->isSuccessful()) {
            $this->info('  ✓ inertiajs/inertia-laravel berhasil dipasang.');
        } else {
            $this->warn('  ⚠️ Gagal menjalankan composer require secara otomatis. Silakan jalankan: composer require inertiajs/inertia-laravel');
        }
    }

    /**
     * Menambahkan dependensi Vue, Inertia, Tailwind v4, dan Material Symbols ke package.json.
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

        // Dependencies
        if (!$status['vue']) {
            $packageJson['dependencies']['vue'] = '^3.5.0';
            $packageJson['dependencies']['@vitejs/plugin-vue'] = '^5.0.0';
            $modified = true;
        }

        if (!$status['inertia_vue']) {
            $packageJson['dependencies']['@inertiajs/vue3'] = '^2.0.0';
            $modified = true;
        }

        if (!$status['material_symbols']) {
            $packageJson['dependencies']['material-symbols'] = '^0.47.0';
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
     * Memastikan vite.config.js mengaktifkan plugin vue dan tailwindcss.
     */
    protected function configureVite(): void
    {
        $this->line('⚡ Memeriksa & Mengonfigurasi <info>vite.config.js</info>...');

        $vitePath = base_path('vite.config.js');
        if (!File::exists($vitePath)) {
            // Buat vite.config.js standar jika belum ada
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
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
});
JS;
            File::put($vitePath, $template . PHP_EOL);
            $this->info('  ✓ vite.config.js berhasil dibuat dengan dukungan Vue & Tailwind v4.');
            return;
        }

        $content = File::get($vitePath);
        $modified = false;

        // Tambahkan import vue jika belum ada
        if (!str_contains($content, '@vitejs/plugin-vue')) {
            $content = "import vue from '@vitejs/plugin-vue';\n" . $content;
            $modified = true;
        }

        // Tambahkan import tailwindcss jika belum ada
        if (!str_contains($content, '@tailwindcss/vite')) {
            $content = "import tailwindcss from '@tailwindcss/vite';\n" . $content;
            $modified = true;
        }

        // Tambahkan alias @ jika belum ada
        if (!str_contains($content, "'@':") && !str_contains($content, '"@":')) {
            $aliasSnippet = "    resolve: {\n        alias: {\n            '@': path.resolve(__dirname, './resources/js'),\n        },\n    },\n";
            if (!str_contains($content, "import path from 'path';") && !str_contains($content, 'import path from "path";')) {
                $content = "import path from 'path';\n" . $content;
            }
            // Sisipkan sebelum closing export default defineConfig
            $pos = strrpos($content, '});');
            if ($pos !== false) {
                $content = substr_replace($content, $aliasSnippet . "});\n", $pos, 3);
                $modified = true;
            }
        }

        if ($modified) {
            File::put($vitePath, $content);
            $this->info('  ✓ vite.config.js berhasil diperbarui.');
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
}
