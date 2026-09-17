<?php

namespace Chandra2004\LaravelPackUi;

use Illuminate\Support\ServiceProvider;
use Chandra2004\LaravelPackUi\Console\InstallPackCommand;

class PackUiServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            // Mendaftarkan Artisan Command
            $this->commands([
                InstallPackCommand::class,
            ]);

            // Mendaftarkan Tag Publish untuk Komponen, Composables, dan Layouts
            $this->publishes([
                __DIR__ . '/../resources/js/Components/Pack' => resource_path('js/Components/Pack'),
                __DIR__ . '/../resources/js/Composables/Pack' => resource_path('js/Composables/Pack'),
                __DIR__ . '/../resources/js/Layouts' => resource_path('js/Layouts'),
            ], 'pack-ui');

            // Tag terpisah jika pengguna hanya ingin publish komponen
            $this->publishes([
                __DIR__ . '/../resources/js/Components/Pack' => resource_path('js/Components/Pack'),
            ], 'pack-ui-components');

            // Tag terpisah jika pengguna hanya ingin publish composable
            $this->publishes([
                __DIR__ . '/../resources/js/Composables/Pack' => resource_path('js/Composables/Pack'),
            ], 'pack-ui-composables');

            // Tag terpisah jika pengguna hanya ingin publish layout
            $this->publishes([
                __DIR__ . '/../resources/js/Layouts' => resource_path('js/Layouts'),
            ], 'pack-ui-layouts');
        }
    }
}

