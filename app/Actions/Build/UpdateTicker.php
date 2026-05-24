<?php

namespace App\Actions\Build;

use App\Models\BuildConfig;

class UpdateTicker
{
    public function handle(array $data): void
    {
        BuildConfig::set('build_ticker_color_bg',   $data['color_bg']);
        BuildConfig::set('build_ticker_color_text', $data['color_text']);
        BuildConfig::set('build_ticker_interval',   (string) $data['interval']);
    }
}
