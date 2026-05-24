<?php

namespace App\Actions\Build;

use App\Models\BuildConfig;

class UpdateNav
{
    public function handle(array $data): void
    {
        BuildConfig::set('build_nav_productos_label',  $data['productos_label']);
        BuildConfig::set('build_nav_quienes_label',    $data['quienes_label']);
        BuildConfig::set('build_nav_blog_label',       $data['blog_label']);
        BuildConfig::set('build_nav_contacto_label',   $data['contacto_label']);
        BuildConfig::set('build_nav_quienes_visible',  $data['quienes_visible']  ? '1' : '0');
        BuildConfig::set('build_nav_blog_visible',     $data['blog_visible']     ? '1' : '0');
        BuildConfig::set('build_nav_contacto_visible', $data['contacto_visible'] ? '1' : '0');
        BuildConfig::set('build_nav_buscador_visible', $data['buscador_visible'] ? '1' : '0');
        BuildConfig::set('build_nav_color_bg',         $data['color_bg']);
        BuildConfig::set('build_nav_color_text',       $data['color_text']);
        BuildConfig::set('build_nav_sticky',           $data['sticky'] ? '1' : '0');
    }
}
