<?php

namespace App\Actions\Build;

use App\Models\BuildConfig;

class UpdateBotones
{
    public function handle(array $data): void
    {
        BuildConfig::set('build_btn_bg',   $data['bg']);
        BuildConfig::set('build_btn_text', $data['text']);
    }
}
