<?php

namespace App\Http\Middleware;

use App\Models\BuildAnnouncement;
use App\Models\BuildConfig;
use App\Models\Category;
use App\Models\Integracion;
use App\Models\Producto;
use App\Support\MenuCache;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    private function buildProps(Request $request): array
    {
        if ($request->routeIs('admin.*')) {
            return [
                'logo_admin'   => BuildConfig::asset('build_logo_admin'),
                'logo_admin_w' => (int) BuildConfig::get('build_logo_admin_w', '0') ?: null,
                'logo_admin_h' => (int) BuildConfig::get('build_logo_admin_h', '0') ?: null,
            ];
        }

        $colores = [
            'primario'   => BuildConfig::get('build_color_primario',   '#314158'),
            'secundario' => BuildConfig::get('build_color_secundario', '#62748E'),
            'acento'     => BuildConfig::get('build_color_acento',     '#FB2C36'),
        ];

        return [
            'logo_tienda'   => BuildConfig::asset('build_logo_tienda'),
            'logo_tienda_w' => (int) BuildConfig::get('build_logo_tienda_w', '0') ?: null,
            'logo_tienda_h' => (int) BuildConfig::get('build_logo_tienda_h', '0') ?: null,
            'nombre_tienda' => BuildConfig::get('build_seo_nombre_tienda', 'Mi tienda'),
            'colores'       => $colores,
            'ticker'      => [
                'color_bg'   => BuildConfig::get('build_ticker_color_bg',   'primario'),
                'color_text' => BuildConfig::get('build_ticker_color_text', 'blanco'),
                'interval'   => (int) BuildConfig::get('build_ticker_interval', '10'),
            ],
            'nav'         => [
                'productos_label'  => BuildConfig::get('build_nav_productos_label',  'Productos'),
                'quienes_label'    => BuildConfig::get('build_nav_quienes_label',    'Quiénes somos'),
                'blog_label'       => BuildConfig::get('build_nav_blog_label',       'Blog'),
                'contacto_label'   => BuildConfig::get('build_nav_contacto_label',   'Contacto'),
                'quienes_visible'  => (bool)(int) BuildConfig::get('build_nav_quienes_visible',  '1'),
                'blog_visible'     => (bool)(int) BuildConfig::get('build_nav_blog_visible',     '1'),
                'contacto_visible' => (bool)(int) BuildConfig::get('build_nav_contacto_visible', '1'),
                'buscador_visible' => (bool)(int) BuildConfig::get('build_nav_buscador_visible', '1'),
                'color_bg'         => BuildConfig::get('build_nav_color_bg',   'blanco'),
                'color_text'       => BuildConfig::get('build_nav_color_text', 'primario'),
                'sticky'           => (bool)(int) BuildConfig::get('build_nav_sticky', '1'),
            ],
            'resenas'       => (function () {
                $raw = BuildConfig::get('build_inicio_resenas_config');
                return $raw ? json_decode($raw, true) : null;
            })(),
            'ticker_inicio' => (function () {
                $raw = BuildConfig::get('build_inicio_ticker_config');
                return $raw ? json_decode($raw, true) : null;
            })(),
            'beneficios'    => (function () {
                $raw = BuildConfig::get('build_inicio_beneficios_config');
                return $raw ? json_decode($raw, true) : null;
            })(),
            'banners'        => (function () {
                $raw = BuildConfig::get('build_inicio_banners_config');
                return $raw ? json_decode($raw, true) : null;
            })(),
            'como_funciona'  => (function () {
                $raw = BuildConfig::get('build_inicio_como_funciona_config');
                return $raw ? json_decode($raw, true) : null;
            })(),
            'cta'            => (function () {
                $raw = BuildConfig::get('build_inicio_cta_config');
                return $raw ? json_decode($raw, true) : null;
            })(),
            'faq'            => (function () {
                $raw = BuildConfig::get('build_inicio_faq_config');
                return $raw ? json_decode($raw, true) : null;
            })(),
            'carrusel'       => (function () {
                $raw = BuildConfig::get('build_inicio_carrusel_config');
                return $raw ? json_decode($raw, true) : null;
            })(),
            'quienes_hero'          => (function () {
                $raw = BuildConfig::get('build_quienes_hero_config');
                return $raw ? json_decode($raw, true) : null;
            })(),
            'quienes_historia'      => (function () {
                $raw = BuildConfig::get('build_quienes_historia_config');
                return $raw ? json_decode($raw, true) : null;
            })(),
            'quienes_stats'         => (function () {
                $raw = BuildConfig::get('build_quienes_stats_config');
                return $raw ? json_decode($raw, true) : null;
            })(),
            'quienes_mision_vision' => (function () {
                $raw = BuildConfig::get('build_quienes_mision_vision_config');
                return $raw ? json_decode($raw, true) : null;
            })(),
            'quienes_valores'       => (function () {
                $raw = BuildConfig::get('build_quienes_valores_config');
                return $raw ? json_decode($raw, true) : null;
            })(),
            'quienes_cta'           => (function () {
                $raw = BuildConfig::get('build_quienes_cta_config');
                return $raw ? json_decode($raw, true) : null;
            })(),
            'quienes_secciones'     => (function () {
                $keys = ['identidad', 'historia', 'stats', 'mision_vision', 'valores', 'cta', 'faq'];
                $result = [];
                foreach ($keys as $key) {
                    $result[$key] = (bool)(int) BuildConfig::get("build_quienes_{$key}_activo", '1');
                }
                return $result;
            })(),
            'faq_quienes'           => (function () {
                $raw = BuildConfig::get('build_inicio_faq_config');
                if (!$raw) return null;
                $config = json_decode($raw, true);
                $items = array_values(array_filter($config['items'] ?? [], fn ($i) => !empty($i['visible_quienes'])));
                return count($items) ? ['titulo' => $config['titulo'] ?? null, 'items' => $items] : null;
            })(),
            'faq_contacto'          => (function () {
                $raw = BuildConfig::get('build_inicio_faq_config');
                if (!$raw) return null;
                $config = json_decode($raw, true);
                $items = array_values(array_filter($config['items'] ?? [], fn ($i) => !empty($i['visible_contacto'])));
                return count($items) ? ['titulo' => $config['titulo'] ?? null, 'items' => $items] : null;
            })(),
            'contacto_hero'         => (function () {
                $raw = BuildConfig::get('build_contacto_hero_config');
                return $raw ? json_decode($raw, true) : null;
            })(),
            'contacto_cards'        => (function () {
                $raw = BuildConfig::get('build_contacto_cards_config');
                return $raw ? json_decode($raw, true) : null;
            })(),
            'contacto_form'         => (function () {
                $raw = BuildConfig::get('build_contacto_form_config');
                return $raw ? json_decode($raw, true) : null;
            })(),
            'contacto_secciones'    => (function () {
                $keys = ['hero', 'cards', 'formulario', 'faq'];
                $result = [];
                foreach ($keys as $key) {
                    $result[$key] = (bool)(int) BuildConfig::get("build_contacto_{$key}_activo", '1');
                }
                return $result;
            })(),
            'secciones'     => (function () {
                $keys = ['hero', 'tickers', 'beneficios', 'banners', 'oferta_relampago', 'como_funciona', 'carrusel', 'productos_destacados', 'resenas', 'faq', 'cta'];
                $result = [];
                foreach ($keys as $key) {
                    $result[$key] = (bool)(int) BuildConfig::get("build_inicio_{$key}_activo", '1');
                }
                return $result;
            })(),
            'hero'        => (function () {
                $raw = BuildConfig::get('build_inicio_hero_config');
                return $raw ? json_decode($raw, true) : null;
            })(),
            'fomo_enabled' => BuildConfig::get('fomo_enabled', 'false') === 'true',
            'anuncios'    => MenuCache::anuncios(fn () => BuildAnnouncement::activos()
                ->map(fn ($a) => [
                    'id'        => $a->id,
                    'texto'     => $a->texto,
                    'btn_texto' => $a->btn_texto,
                    'btn_link'  => $a->btn_link,
                    'fin_timer' => $a->fin_timer?->toIso8601String(),
                ])
                ->values()
                ->toArray()),
        ];
    }

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user'        => $request->user(),
                'client'      => $request->user('client') ? [
                    'id'       => $request->user('client')->id,
                    'nombre'   => $request->user('client')->nombre,
                    'apellido' => $request->user('client')->apellido,
                    'email'    => $request->user('client')->email,
                    'telefono' => $request->user('client')->telefono,
                ] : null,
                'permissions' => $request->user()?->hasRole('super-admin')
                    ? ['*']
                    : ($request->user()?->getAllPermissions()->pluck('name')->toArray() ?? []),
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'flash' => [
                'bloqueado_hasta' => $request->session()->get('bloqueado_hasta'),
                'status'          => $request->session()->get('status'),
            ],
            'fb_pixel_id'               => fn () => $request->routeIs('admin.*') ? null : Integracion::get('fb_pixel_id'),
            'fb_test_event_code'        => fn () => $request->routeIs('admin.*') ? null : Integracion::get('fb_test_event_code'),
            'google_ads_id'             => fn () => $request->routeIs('admin.*') ? null : Integracion::get('google_ads_id'),
            'google_ads_purchase_label' => fn () => $request->routeIs('admin.*') ? null : Integracion::get('google_ads_purchase_label'),
            'mp_public_key'      => function () use ($request) {
                if ($request->routeIs('admin.*')) return null;
                $sandbox = Integracion::get('mp_sandbox', '1') === '1';
                return $sandbox
                    ? Integracion::get('mp_public_key_sandbox')
                    : Integracion::get('mp_public_key_prod');
            },
            'build'          => fn () => $this->buildProps($request),
            'nav_categorias' => fn () => MenuCache::categorias(fn () => Category::where('status', 'activo')
                ->whereNull('parent_id')
                ->orderBy('name')
                ->get(['id', 'name', 'slug'])
                ->toArray()),
            'nav_productos' => fn () => $request->routeIs('admin.*') ? [] : MenuCache::productos(fn () => Producto::where('status', 'activo')
                ->with([
                    'imagenPrincipal',
                    'cantidades',
                    'hooks' => fn ($q) => $q->where('activo', true)
                        ->whereIn('hook_key', ['oferta_relampago', 'badge_producto']),
                ])
                ->latest()
                ->limit(4)
                ->get()
                ->map(fn ($p) => [
                    'id'                 => $p->id,
                    'nombre'             => $p->nombre,
                    'slug'               => $p->slug,
                    'precio_base'        => $p->precio_base,
                    'precio_comparacion' => $p->precio_comparacion,
                    'descripcion'        => $p->descripcion,
                    'imagen'             => $p->imagenPrincipal?->url,
                    'oferta_relampago'   => $p->hooks->contains('hook_key', 'oferta_relampago'),
                    'badge'              => $p->hooks->firstWhere('hook_key', 'badge_producto')?->config['texto'] ?? null,
                    'cantidades'         => $p->cantidades->map(fn ($c) => [
                        'cantidad'      => $c->cantidad,
                        'precio_bundle' => $c->precio_bundle,
                        'badge_texto'   => $c->badge_texto,
                        'destacado'     => $c->destacado,
                    ])->values()->toArray(),
                ])
                ->toArray()),
        ];
    }
}
