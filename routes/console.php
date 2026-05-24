<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Limpieza diaria de imágenes del Build que nunca fueron adjuntadas a una config.
Schedule::command('build:limpiar-huerfanas')->dailyAt('03:00');
