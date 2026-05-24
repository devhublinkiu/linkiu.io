<?php

namespace App\Actions\Build;

use App\Models\BuildConfig;

class UpdateSeo
{
    public function handle(array $data): void
    {
        BuildConfig::set('build_seo_nombre_tienda',   $data['nombre_tienda']);
        BuildConfig::set('build_seo_telefono_tienda', $data['telefono_tienda'] ?? '');
    }
}
