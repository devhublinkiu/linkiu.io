<?php

namespace App\Actions\Build;

use App\Models\BuildConfig;

class UpdateColores
{
    public function handle(array $data): void
    {
        BuildConfig::set('build_color_primario',   $data['primario']);
        BuildConfig::set('build_color_secundario', $data['secundario']);
        BuildConfig::set('build_color_acento',     $data['acento']);
    }
}
