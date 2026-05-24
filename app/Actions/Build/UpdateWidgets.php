<?php

namespace App\Actions\Build;

use App\Models\BuildConfig;

class UpdateWidgets
{
    public function handle(array $data): void
    {
        BuildConfig::set('fomo_enabled', $data['fomo_enabled'] ? 'true' : 'false');
    }
}
