<?php

namespace Chandra2004\LaravelPackUi\Console;

use Illuminate\Console\Command;

class InstallPackCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pack:install {--force : Timpa berkas komponen dan composable jika sudah ada}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Pasang komponen Pack UI dan composable ke dalam resources/js';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->newLine();
        $this->info('🚀 Memasang Pack UI Components & Composables ke dalam project...');
        $this->newLine();

        $force = $this->option('force');

        $this->call('vendor:publish', [
            '--tag' => 'pack-ui',
            '--force' => $force,
        ]);

        $this->newLine();
        $this->info('✅ Berhasil! Pack UI Components & Composables telah terpasang.');
        $this->line('  📁 Komponen  : <comment>resources/js/Components/Pack</comment>');
        $this->line('  📁 Composable: <comment>resources/js/Composables/Pack</comment>');
        $this->newLine();
        $this->comment('💡 Catatan Penggunaan:');
        $this->line('  1. Pastikan Tailwind CSS sudah aktif di project Anda.');
        $this->line('  2. Pastikan Google Material Symbols font sudah di-import di app.css.');
        $this->line('  3. Anda dapat langsung meng-import komponen: <info>import InputField from "@/Components/Pack/InputField.vue";</info>');
        $this->newLine();

        return self::SUCCESS;
    }
}

