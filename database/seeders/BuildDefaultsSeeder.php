<?php

namespace Database\Seeders;

use App\Models\BuildConfig;
use Illuminate\Database\Seeder;

/**
 * Inicializa BuildConfig con los defaults globales del módulo LinkiuBuild.
 *
 * Solo crea las keys que no existan; usa updateOrCreate vía BuildConfig::set,
 * por lo que correrlo varias veces es seguro pero sobrescribe valores existentes.
 * Para evitar pisar configuración del cliente, salta keys que ya tienen valor.
 */
class BuildDefaultsSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            // Theme — colores
            'build_color_primario'   => '#314158',
            'build_color_secundario' => '#62748E',
            'build_color_acento'     => '#FB2C36',

            // Theme — botones globales (Theme→Botones, usados por la tienda)
            'build_btn_bg'   => 'primario',
            'build_btn_text' => 'blanco',

            // Menú — ticker (bar de anuncios)
            'build_ticker_color_bg'   => 'primario',
            'build_ticker_color_text' => 'blanco',
            'build_ticker_interval'   => '10',

            // Menú — navegación
            'build_nav_productos_label'  => 'Productos',
            'build_nav_quienes_label'    => 'Quiénes somos',
            'build_nav_blog_label'       => 'Blog',
            'build_nav_contacto_label'   => 'Contacto',
            'build_nav_quienes_visible'  => '1',
            'build_nav_blog_visible'     => '1',
            'build_nav_contacto_visible' => '1',
            'build_nav_buscador_visible' => '1',
            'build_nav_color_bg'         => 'blanco',
            'build_nav_color_text'       => 'primario',
            'build_nav_sticky'           => '1',

            // Inicio — secciones (todas activas por defecto)
            'build_inicio_hero_activo'                 => '1',
            'build_inicio_tickers_activo'              => '1',
            'build_inicio_beneficios_activo'           => '1',
            'build_inicio_banners_activo'              => '1',
            'build_inicio_oferta_relampago_activo'     => '1',
            'build_inicio_como_funciona_activo'        => '1',
            'build_inicio_carrusel_activo'             => '1',
            'build_inicio_productos_destacados_activo' => '1',
            'build_inicio_resenas_activo'              => '1',
            'build_inicio_faq_activo'                  => '1',
            'build_inicio_cta_activo'                  => '1',

            // Quiénes Somos — secciones
            'build_quienes_identidad_activo'      => '1',
            'build_quienes_historia_activo'       => '1',
            'build_quienes_stats_activo'          => '1',
            'build_quienes_mision_vision_activo'  => '1',
            'build_quienes_valores_activo'        => '1',
            'build_quienes_cta_activo'            => '1',
            'build_quienes_faq_activo'            => '1',

            // Contacto — secciones
            'build_contacto_hero_activo'       => '1',
            'build_contacto_cards_activo'      => '1',
            'build_contacto_formulario_activo' => '1',
            'build_contacto_faq_activo'        => '1',

            // Widgets
            'fomo_enabled' => 'false',

            // SEO + datos de tienda
            'build_seo_nombre_tienda'   => 'Mi tienda',
            'build_seo_telefono_tienda' => '',
        ];

        foreach ($defaults as $key => $value) {
            if (BuildConfig::get($key) === null) {
                BuildConfig::set($key, $value);
            }
        }
    }
}
