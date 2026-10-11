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

            $componentsPath = __DIR__ . '/../resources/js/Components/Pack';
            $composablesPath = __DIR__ . '/../resources/js/Composables/Pack';
            $layoutsPath = __DIR__ . '/../resources/js/Layouts/Pack';

            // Tag gabungan untuk seluruh aset Pack UI
            $this->publishes([
                $componentsPath => resource_path('js/Components/Pack'),
                $composablesPath => resource_path('js/Composables/Pack'),
                $layoutsPath => resource_path('js/Layouts/Pack'),
            ], 'pack-ui');

            // Tag terpisah untuk publikasi parsial
            $this->publishes([
                $componentsPath => resource_path('js/Components/Pack'),
            ], 'pack-ui-components');

            $this->publishes([
                $composablesPath => resource_path('js/Composables/Pack'),
            ], 'pack-ui-composables');

            $this->publishes([
                $layoutsPath => resource_path('js/Layouts/Pack'),
            ], 'pack-ui-layouts');
        }
    }
}

