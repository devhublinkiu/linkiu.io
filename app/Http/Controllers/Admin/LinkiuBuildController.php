<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Build\DeleteAnnouncement;
use App\Actions\Build\EliminarImagenBuild;
use App\Actions\Build\StoreAnnouncement;
use App\Actions\Build\SubirImagenWebp;
use App\Actions\Build\UpdateAnnouncement;
use App\Actions\Build\UpdateBotones;
use App\Actions\Build\UpdateColores;
use App\Actions\Build\UpdateLogos;
use App\Actions\Build\UpdateNav;
use App\Actions\Build\UpdateSeo;
use App\Actions\Build\UpdateTicker;
use App\Actions\Build\UpdateWidgets;
use App\Http\Controllers\Controller;
use App\Models\BuildAnnouncement;
use App\Models\BuildConfig;
use App\Models\BuildImageUpload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LinkiuBuildController extends Controller
{
    public function theme(): Response
    {
        abort_if(! auth()->user()->can('linkiubuild.ver'), 403);

        return Inertia::render('admin/build/Theme', [
            'colores' => [
                'primario'   => BuildConfig::get('build_color_primario',   '#314158'),
                'secundario' => BuildConfig::get('build_color_secundario', '#62748E'),
                'acento'     => BuildConfig::get('build_color_acento',     '#FB2C36'),
            ],
            'botones' => [
                'bg'   => BuildConfig::get('build_btn_bg',   'primario'),
                'text' => BuildConfig::get('build_btn_text', 'blanco'),
            ],
            'logos' => [
                'tienda' => BuildConfig::asset('build_logo_tienda'),
                'admin'  => BuildConfig::asset('build_logo_admin'),
            ],
            'seo' => [
                'nombre_tienda'   => BuildConfig::get('build_seo_nombre_tienda', 'Mi tienda'),
                'telefono_tienda' => BuildConfig::get('build_seo_telefono_tienda', ''),
            ],
        ]);
    }

    public function updateSeo(Request $request, UpdateSeo $action): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'nombre_tienda'   => ['required', 'string', 'max:60'],
            'telefono_tienda' => ['nullable', 'string', 'max:30'],
        ]);

        $action->handle($data);

        return back()->with('status', 'Datos de tienda guardados.');
    }

    public function updateColores(Request $request, UpdateColores $action): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'primario'   => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'secundario' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'acento'     => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $action->handle($data);

        return back()->with('status', 'Colores guardados correctamente.');
    }

    public function updateBotones(Request $request, UpdateBotones $action): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'bg'   => ['required', 'string', 'in:primario,secundario,acento'],
            'text' => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
        ]);

        $action->handle($data);

        return back()->with('status', 'Botones guardados correctamente.');
    }

    public function updateLogos(Request $request, UpdateLogos $action): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $request->validate([
            'logo_tienda' => 'nullable|image|mimes:png,svg,jpg,webp|max:2048',
            'logo_admin'  => 'nullable|image|mimes:png,svg,jpg,webp|max:2048',
        ]);

        $action->handle([
            'logo_tienda'     => $request->file('logo_tienda'),
            'logo_admin'      => $request->file('logo_admin'),
            'eliminar_tienda' => $request->boolean('eliminar_tienda'),
            'eliminar_admin'  => $request->boolean('eliminar_admin'),
        ]);

        return back()->with('status', 'Logotipos guardados correctamente.');
    }

    public function menu(): Response
    {
        abort_if(! auth()->user()->can('linkiubuild.ver'), 403);

        return Inertia::render('admin/build/Menu', [
            'anuncios' => BuildAnnouncement::orderBy('orden')->get()->map(fn ($a) => [
                'id'         => $a->id,
                'texto'      => $a->texto,
                'emoji'      => $a->emoji,
                'btn_texto'  => $a->btn_texto,
                'btn_link'   => $a->btn_link,
                'fin_timer'  => $a->fin_timer?->toIso8601String(),
                'activo'     => $a->activo,
                'orden'      => $a->orden,
                'updated_at' => $a->updated_at?->toIso8601String(),
            ]),
            'ticker' => [
                'color_bg'   => BuildConfig::get('build_ticker_color_bg',   'primario'),
                'color_text' => BuildConfig::get('build_ticker_color_text',  'blanco'),
                'interval'   => (int) BuildConfig::get('build_ticker_interval', '10'),
            ],
            'nav' => [
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
            'colores' => [
                'primario'   => BuildConfig::get('build_color_primario',   '#314158'),
                'secundario' => BuildConfig::get('build_color_secundario', '#62748E'),
                'acento'     => BuildConfig::get('build_color_acento',     '#FB2C36'),
            ],
        ]);
    }

    public function updateTicker(Request $request, UpdateTicker $action): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'color_bg'   => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'color_text' => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'interval'   => ['required', 'integer', 'in:5,10,20,30,40,50'],
        ]);

        $action->handle($data);

        return back()->with('status', 'Ticker guardado correctamente.');
    }

    public function storeAnnouncement(Request $request, StoreAnnouncement $action): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'texto'     => ['required', 'string', 'max:200'],
            'emoji'     => ['nullable', 'string', 'max:10'],
            'btn_texto' => ['nullable', 'string', 'max:50'],
            'btn_link'  => ['nullable', 'string', 'url', 'max:500'],
            'fin_timer' => ['nullable', 'date', Rule::when(
                fn () => $request->boolean('activo'),
                ['after:now'],
            )],
            'activo'    => ['boolean'],
        ]);

        $action->handle($data);

        return back()->with('status', 'Anuncio creado correctamente.');
    }

    public function updateAnnouncement(
        Request $request,
        BuildAnnouncement $announcement,
        UpdateAnnouncement $action
    ): RedirectResponse {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'texto'     => ['required', 'string', 'max:200'],
            'emoji'     => ['nullable', 'string', 'max:10'],
            'btn_texto' => ['nullable', 'string', 'max:50'],
            'btn_link'  => ['nullable', 'string', 'url', 'max:500'],
            'fin_timer' => ['nullable', 'date', Rule::when(
                fn () => $request->boolean('activo'),
                ['after:now'],
            )],
            'activo'    => ['boolean'],
        ]);

        $action->handle($announcement, $data);

        return back()->with('status', 'Anuncio actualizado correctamente.');
    }

    public function toggleAnnouncement(
        Request $request,
        BuildAnnouncement $announcement
    ): RedirectResponse {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate(['activo' => ['required', 'boolean']]);

        $announcement->update(['activo' => $data['activo']]);

        return back()->with('status', $data['activo'] ? 'Anuncio activado.' : 'Anuncio desactivado.');
    }

    public function deleteAnnouncement(
        BuildAnnouncement $announcement,
        DeleteAnnouncement $action
    ): RedirectResponse {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $action->handle($announcement);

        return back()->with('status', 'Anuncio eliminado.');
    }

    public function updateNav(Request $request, UpdateNav $action): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'productos_label'  => ['required', 'string', 'max:30'],
            'quienes_label'    => ['required', 'string', 'max:30'],
            'blog_label'       => ['required', 'string', 'max:30'],
            'contacto_label'   => ['required', 'string', 'max:30'],
            'quienes_visible'  => ['boolean'],
            'blog_visible'     => ['boolean'],
            'contacto_visible' => ['boolean'],
            'buscador_visible' => ['boolean'],
            'color_bg'         => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'color_text'       => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'sticky'           => ['boolean'],
        ]);

        $action->handle($data);

        return back()->with('status', 'Navegación guardada correctamente.');
    }

    public function inicio(): Response
    {
        abort_if(! auth()->user()->can('linkiubuild.ver'), 403);

        $keys = ['hero', 'tickers', 'beneficios', 'banners', 'oferta_relampago', 'como_funciona', 'carrusel', 'productos_destacados', 'resenas', 'faq', 'cta'];

        $secciones = [];
        foreach ($keys as $key) {
            $secciones[$key] = (bool)(int) BuildConfig::get("build_inicio_{$key}_activo", '1');
        }

        $heroRaw    = BuildConfig::get('build_inicio_hero_config');
        $heroConfig = $heroRaw ? json_decode($heroRaw, true) : null;

        $resenasRaw    = BuildConfig::get('build_inicio_resenas_config');
        $resenasConfig = $resenasRaw ? json_decode($resenasRaw, true) : null;

        $tickerRaw    = BuildConfig::get('build_inicio_ticker_config');
        $tickerConfig = $tickerRaw ? json_decode($tickerRaw, true) : null;

        $beneficiosRaw    = BuildConfig::get('build_inicio_beneficios_config');
        $beneficiosConfig = $beneficiosRaw ? json_decode($beneficiosRaw, true) : null;

        $bannersRaw    = BuildConfig::get('build_inicio_banners_config');
        $bannersConfig = $bannersRaw ? json_decode($bannersRaw, true) : null;

        $comoFuncionaRaw    = BuildConfig::get('build_inicio_como_funciona_config');
        $comoFuncionaConfig = $comoFuncionaRaw ? json_decode($comoFuncionaRaw, true) : null;

        $carruselRaw    = BuildConfig::get('build_inicio_carrusel_config');
        $carruselConfig = $carruselRaw ? json_decode($carruselRaw, true) : null;

        $faqRaw    = BuildConfig::get('build_inicio_faq_config');
        $faqConfig = $faqRaw ? json_decode($faqRaw, true) : null;

        $ctaRaw    = BuildConfig::get('build_inicio_cta_config');
        $ctaConfig = $ctaRaw ? json_decode($ctaRaw, true) : null;

        $colores = [
            'primario'   => BuildConfig::get('build_color_primario',   '#314158'),
            'secundario' => BuildConfig::get('build_color_secundario', '#62748E'),
            'acento'     => BuildConfig::get('build_color_acento',     '#FB2C36'),
        ];

        return Inertia::render('admin/build/Inicio', compact('secciones', 'heroConfig', 'resenasConfig', 'tickerConfig', 'beneficiosConfig', 'bannersConfig', 'comoFuncionaConfig', 'carruselConfig', 'faqConfig', 'ctaConfig', 'colores'));
    }

    public function saveCtaConfig(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'color_fondo'          => ['required', 'string', 'in:primario,secundario,acento,negro'],
            'color_acento'         => ['required', 'string', 'in:primario,secundario,acento,blanco'],
            'color_texto'          => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'titulo_linea1'        => ['nullable', 'string', 'max:80'],
            'titulo_acento'        => ['nullable', 'string', 'max:80'],
            'descripcion'          => ['nullable', 'string', 'max:300'],
            'descripcion_acento'   => ['nullable', 'string', 'max:100'],
            'btn_primario_texto'   => ['nullable', 'string', 'max:50'],
            'btn_primario_link'    => ['nullable', 'string', 'max:500'],
            'btn_secundario_texto' => ['nullable', 'string', 'max:50'],
            'btn_secundario_link'  => ['nullable', 'string', 'max:500'],
            'stats'                => ['array', 'size:3'],
            'stats.*.valor'        => ['required', 'string', 'max:20'],
            'stats.*.etiqueta'     => ['required', 'string', 'max:40'],
        ]);

        BuildConfig::set('build_inicio_cta_config', json_encode($data));

        return back()->with('status', 'CTA guardada.');
    }

    public function saveFaqConfig(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'titulo'                     => ['nullable', 'string', 'max:100'],
            'descripcion'                => ['nullable', 'string', 'max:200'],
            'items'                      => ['array', 'max:12'],
            'items.*.pregunta'           => ['required', 'string', 'max:150'],
            'items.*.respuesta'          => ['required', 'string', 'max:600'],
            'items.*.visible_contacto'   => ['boolean'],
            'items.*.visible_quienes'    => ['boolean'],
        ]);

        BuildConfig::set('build_inicio_faq_config', json_encode($data));

        return back()->with('status', 'FAQ guardada.');
    }

    public function saveCarruselConfig(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'titulo'       => ['nullable', 'string', 'max:100'],
            'descripcion'  => ['nullable', 'string', 'max:200'],
            'items'        => ['array', 'max:10'],
            'items.*.url'  => ['required', 'string'],
            'items.*.ruta' => ['required', 'string', 'starts_with:carrusel/', 'regex:/^[a-z]+\/[a-f0-9\-]+\.webp$/i'],
            'items.*.link' => ['nullable', 'string', 'max:500'],
        ]);

        BuildConfig::set('build_inicio_carrusel_config', json_encode($data));
        BuildImageUpload::attachOnly('carrusel', array_column($data['items'] ?? [], 'ruta'));

        return back()->with('status', 'Carrusel guardado.');
    }

    public function storeCarruselImagen(Request $request, SubirImagenWebp $action): JsonResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $request->validate(['imagen' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120']]);

        return response()->json($action->execute($request->file('imagen'), 'carrusel', 800));
    }

    public function destroyCarruselImagen(Request $request, EliminarImagenBuild $action): JsonResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $request->validate([
            'ruta' => ['required', 'string', 'starts_with:carrusel/', 'regex:/^[a-z]+\/[a-f0-9\-]+\.webp$/i'],
        ]);

        $action->execute($request->string('ruta'), 'carrusel');

        return response()->json(['ok' => true]);
    }

    public function saveComoFuncionaConfig(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'titulo'              => ['nullable', 'string', 'max:100'],
            'descripcion'         => ['nullable', 'string', 'max:200'],
            'color_acento'        => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'items'               => ['array', 'max:5'],
            'items.*.titulo'      => ['required', 'string', 'max:60'],
            'items.*.descripcion' => ['nullable', 'string', 'max:200'],
            'items.*.badge'       => ['nullable', 'string', 'max:60'],
        ]);

        BuildConfig::set('build_inicio_como_funciona_config', json_encode($data));

        return back()->with('status', 'Sección «Cómo funciona» guardada.');
    }

    public function saveBannersConfig(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'velocidad'        => ['required', 'string', 'in:lento,normal,rapido'],
            'items'            => ['array', 'max:6'],
            'items.*.url'      => ['required', 'string'],
            'items.*.ruta'     => ['required', 'string', 'starts_with:banners/', 'regex:/^[a-z]+\/[a-f0-9\-]+\.webp$/i'],
            'items.*.link'     => ['nullable', 'string', 'max:500'],
        ]);

        BuildConfig::set('build_inicio_banners_config', json_encode($data));
        BuildImageUpload::attachOnly('banners', array_column($data['items'] ?? [], 'ruta'));

        return back()->with('status', 'Banners guardados.');
    }

    public function storeBannerImagen(Request $request, SubirImagenWebp $action): JsonResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $request->validate(['imagen' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:10240']]);

        return response()->json($action->execute($request->file('imagen'), 'banners', 2400));
    }

    public function destroyBannerImagen(Request $request, EliminarImagenBuild $action): JsonResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $request->validate([
            'ruta' => ['required', 'string', 'starts_with:banners/', 'regex:/^[a-z]+\/[a-f0-9\-]+\.webp$/i'],
        ]);

        $action->execute($request->string('ruta'), 'banners');

        return response()->json(['ok' => true]);
    }

    public function saveBeneficiosConfig(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'titulo'           => ['nullable', 'string', 'max:100'],
            'descripcion'      => ['nullable', 'string', 'max:300'],
            'color_fondo_card' => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'color_texto_card' => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'color_fondo_icon' => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'color_icon'       => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'items'                  => ['array', 'max:9'],
            'items.*.icono'          => ['required', 'string', 'max:50'],
            'items.*.titulo'         => ['required', 'string', 'max:60'],
            'items.*.descripcion'    => ['nullable', 'string', 'max:200'],
        ]);

        BuildConfig::set('build_inicio_beneficios_config', json_encode($data));

        return back()->with('status', 'Beneficios guardados.');
    }

    public function saveTickerConfig(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'color_fondo'     => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'color_texto'     => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'color_separador' => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'velocidad'       => ['required', 'string', 'in:lento,normal,rapido'],
            'items'           => ['array', 'max:20'],
            'items.*.texto'   => ['required', 'string', 'max:80'],
        ]);

        BuildConfig::set('build_inicio_ticker_config', json_encode($data));

        return back()->with('status', 'Ticker guardado.');
    }

    public function saveHeroConfig(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'titulo'               => ['nullable', 'string', 'max:120'],
            'titulo_acento'        => ['nullable', 'string', 'max:60'],
            'descripcion'          => ['nullable', 'string', 'max:400'],
            'btn_primario_texto'   => ['nullable', 'string', 'max:50'],
            'btn_primario_link'    => ['nullable', 'string', 'max:500'],
            'btn_secundario_texto' => ['nullable', 'string', 'max:50'],
            'btn_secundario_link'  => ['nullable', 'string', 'max:500'],
            'resenas_activo'       => ['boolean'],
            'resenas_rating'       => ['numeric', 'min:0', 'max:5'],
            'resenas_cantidad'     => ['integer', 'min:0'],
            'color_texto'          => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'color_acento_titulo'  => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'color_btn_bg'         => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'color_btn_text'       => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'imagenes'             => ['array', 'max:10'],
            'imagenes.*.url'       => ['required', 'string'],
            'imagenes.*.ruta'      => ['required', 'string', 'starts_with:hero/', 'regex:/^[a-z]+\/[a-f0-9\-]+\.webp$/i'],
        ]);

        BuildConfig::set('build_inicio_hero_config', json_encode($data));
        BuildImageUpload::attachOnly('hero', array_column($data['imagenes'] ?? [], 'ruta'));

        return back()->with('status', 'Hero guardado.');
    }

    public function storeHeroImagen(Request $request, SubirImagenWebp $action): JsonResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $request->validate(['imagen' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120']]);

        return response()->json($action->execute($request->file('imagen'), 'hero', 1920));
    }

    public function destroyHeroImagen(Request $request, EliminarImagenBuild $action): JsonResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $request->validate([
            'ruta' => ['required', 'string', 'starts_with:hero/', 'regex:/^[a-z]+\/[a-f0-9\-]+\.webp$/i'],
        ]);

        $action->execute($request->string('ruta'), 'hero');

        return response()->json(['ok' => true]);
    }

    public function saveResenasConfig(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'titulo'             => ['nullable', 'string', 'max:100'],
            'descripcion'        => ['nullable', 'string', 'max:300'],
            'items'              => ['array', 'max:12'],
            'items.*.nombre'     => ['required', 'string', 'max:60'],
            'items.*.ciudad'     => ['required', 'string', 'max:60'],
            'items.*.estrellas'  => ['required', 'integer', 'min:1', 'max:5'],
            'items.*.comentario' => ['required', 'string', 'max:400'],
        ]);

        BuildConfig::set('build_inicio_resenas_config', json_encode($data));

        return back()->with('status', 'Reseñas guardadas.');
    }

    public function toggleSeccionInicio(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'seccion' => ['required', 'string', 'in:hero,tickers,beneficios,banners,oferta_relampago,como_funciona,carrusel,productos_destacados,resenas,faq,cta'],
            'activo'  => ['required', 'boolean'],
        ]);

        BuildConfig::set("build_inicio_{$data['seccion']}_activo", $data['activo'] ? '1' : '0');

        return back()->with('status', $data['activo'] ? 'Sección activada.' : 'Sección desactivada.');
    }

    public function quienesSomos(): Response
    {
        abort_if(! auth()->user()->can('linkiubuild.ver'), 403);

        $keys = ['identidad', 'historia', 'stats', 'mision_vision', 'valores', 'cta', 'faq'];
        $secciones = [];
        foreach ($keys as $key) {
            $secciones[$key] = (bool)(int) BuildConfig::get("build_quienes_{$key}_activo", '1');
        }

        $identidadConfig    = ($r = BuildConfig::get('build_quienes_hero_config'))           ? json_decode($r, true) : null;
        $historiaConfig     = ($r = BuildConfig::get('build_quienes_historia_config'))        ? json_decode($r, true) : null;
        $statsConfig        = ($r = BuildConfig::get('build_quienes_stats_config'))           ? json_decode($r, true) : null;
        $misionVisionConfig = ($r = BuildConfig::get('build_quienes_mision_vision_config'))   ? json_decode($r, true) : null;
        $valoresConfig      = ($r = BuildConfig::get('build_quienes_valores_config'))         ? json_decode($r, true) : null;
        $ctaConfig          = ($r = BuildConfig::get('build_quienes_cta_config'))             ? json_decode($r, true) : null;

        $colores = [
            'primario'   => BuildConfig::get('build_color_primario',   '#314158'),
            'secundario' => BuildConfig::get('build_color_secundario', '#62748E'),
            'acento'     => BuildConfig::get('build_color_acento',     '#FB2C36'),
        ];

        return Inertia::render('admin/build/QuienesSomos', compact(
            'secciones', 'identidadConfig', 'historiaConfig', 'statsConfig',
            'misionVisionConfig', 'valoresConfig', 'ctaConfig', 'colores'
        ));
    }

    public function saveQuienesIdentidadConfig(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'titulo'            => ['nullable', 'string', 'max:100'],
            'color_titulo'      => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'descripcion'       => ['nullable', 'string', 'max:300'],
            'color_descripcion' => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
        ]);

        BuildConfig::set('build_quienes_hero_config', json_encode($data));

        return back()->with('status', 'Identidad guardada.');
    }

    public function saveQuienesHistoriaConfig(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'historia_titulo' => ['nullable', 'string', 'max:120'],
            'historia'        => ['nullable', 'string', 'max:2000'],
            'imagen_url'      => ['nullable', 'string'],
            'imagen_ruta'     => ['nullable', 'string', 'starts_with:quienes/', 'regex:/^[a-z]+\/[a-f0-9\-]+\.webp$/i'],
        ]);

        BuildConfig::set('build_quienes_historia_config', json_encode($data));
        BuildImageUpload::attachOnly('quienes', array_filter([$data['imagen_ruta'] ?? null]));

        return back()->with('status', 'Historia guardada.');
    }

    public function storeQuienesHistoriaImagen(Request $request, SubirImagenWebp $action): JsonResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $request->validate(['imagen' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120']]);

        return response()->json($action->execute($request->file('imagen'), 'quienes', 1200));
    }

    public function destroyQuienesHistoriaImagen(Request $request, EliminarImagenBuild $action): JsonResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $request->validate([
            'ruta' => ['required', 'string', 'starts_with:quienes/', 'regex:/^[a-z]+\/[a-f0-9\-]+\.webp$/i'],
        ]);

        $action->execute($request->string('ruta'), 'quienes');

        return response()->json(['ok' => true]);
    }

    public function saveQuienesStatsConfig(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'items'            => ['array', 'size:4'],
            'items.*.valor'    => ['required', 'string', 'max:20'],
            'items.*.etiqueta' => ['required', 'string', 'max:40'],
        ]);

        BuildConfig::set('build_quienes_stats_config', json_encode($data));

        return back()->with('status', 'Estadísticas guardadas.');
    }

    public function saveQuienesMisionVisionConfig(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'mision'             => ['nullable', 'string', 'max:400'],
            'vision'             => ['nullable', 'string', 'max:400'],
            'color_fondo_mision' => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'color_fondo_vision' => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
        ]);

        BuildConfig::set('build_quienes_mision_vision_config', json_encode($data));

        return back()->with('status', 'Misión y visión guardadas.');
    }

    public function saveQuienesValoresConfig(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'color_fondo_card'    => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'color_texto_card'    => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'color_fondo_icon'    => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'color_icon'          => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'items'               => ['array', 'max:4'],
            'items.*.icono'       => ['required', 'string', 'max:50'],
            'items.*.titulo'      => ['required', 'string', 'max:60'],
            'items.*.descripcion' => ['nullable', 'string', 'max:200'],
        ]);

        BuildConfig::set('build_quienes_valores_config', json_encode($data));

        return back()->with('status', 'Valores guardados.');
    }

    public function toggleSeccionQuienes(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'seccion' => ['required', 'string', 'in:identidad,historia,stats,mision_vision,valores,cta,faq'],
            'activo'  => ['required', 'boolean'],
        ]);

        BuildConfig::set("build_quienes_{$data['seccion']}_activo", $data['activo'] ? '1' : '0');

        return back()->with('status', $data['activo'] ? 'Sección activada.' : 'Sección desactivada.');
    }

    public function saveQuienesCtaConfig(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'titulo'      => ['nullable', 'string', 'max:100'],
            'descripcion' => ['nullable', 'string', 'max:150'],
            'btn_texto'   => ['nullable', 'string', 'max:50'],
            'btn_link'    => ['nullable', 'string', 'max:500'],
        ]);

        BuildConfig::set('build_quienes_cta_config', json_encode($data));

        return back()->with('status', 'CTA guardada.');
    }

    public function contacto(): Response
    {
        abort_if(! auth()->user()->can('linkiubuild.ver'), 403);

        $keys = ['hero', 'cards', 'formulario', 'faq'];
        $secciones = [];
        foreach ($keys as $key) {
            $secciones[$key] = (bool)(int) BuildConfig::get("build_contacto_{$key}_activo", '1');
        }

        $heroConfig  = ($r = BuildConfig::get('build_contacto_hero_config'))  ? json_decode($r, true) : null;
        $cardsConfig = ($r = BuildConfig::get('build_contacto_cards_config')) ? json_decode($r, true) : null;
        $formConfig  = ($r = BuildConfig::get('build_contacto_form_config'))  ? json_decode($r, true) : null;

        $colores = [
            'primario'   => BuildConfig::get('build_color_primario',   '#314158'),
            'secundario' => BuildConfig::get('build_color_secundario', '#62748E'),
            'acento'     => BuildConfig::get('build_color_acento',     '#FB2C36'),
        ];

        return Inertia::render('admin/build/Contacto', compact(
            'secciones', 'heroConfig', 'cardsConfig', 'formConfig', 'colores'
        ));
    }

    public function saveContactoHeroConfig(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'titulo'            => ['nullable', 'string', 'max:100'],
            'color_titulo'      => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'descripcion'       => ['nullable', 'string', 'max:300'],
            'color_descripcion' => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
        ]);

        BuildConfig::set('build_contacto_hero_config', json_encode($data));

        return back()->with('status', 'Hero guardado.');
    }

    public function saveContactoCardsConfig(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'items'                    => ['array', 'max:3'],
            'items.*.color_fondo'      => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'items.*.color_texto'      => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'items.*.color_fondo_icon' => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'items.*.color_icon'       => ['required', 'string', 'in:primario,secundario,acento,blanco,negro'],
            'items.*.icono'            => ['required', 'string', 'max:50'],
            'items.*.tagline'          => ['nullable', 'string', 'max:60'],
            'items.*.titulo'           => ['nullable', 'string', 'max:80'],
            'items.*.subtitulo'        => ['nullable', 'string', 'max:120'],
            'items.*.link'             => ['nullable', 'string', 'max:500'],
        ]);

        BuildConfig::set('build_contacto_cards_config', json_encode($data));

        return back()->with('status', 'Cards de contacto guardadas.');
    }

    public function saveContactoFormConfig(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'correo_destino'     => ['nullable', 'email', 'max:200'],
            'campos'             => ['array', 'size:6'],
            'campos.*.key'       => ['required', 'string', 'in:nombre,correo,asunto,mensaje,celular,empresa'],
            'campos.*.activo'    => ['boolean'],
            'campos.*.requerido' => ['boolean'],
            'campos.*.orden'     => ['required', 'integer', 'min:1', 'max:6'],
        ]);

        BuildConfig::set('build_contacto_form_config', json_encode($data));

        return back()->with('status', 'Formulario de contacto guardado.');
    }

    public function toggleSeccionContacto(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'seccion' => ['required', 'string', 'in:hero,cards,formulario,faq'],
            'activo'  => ['required', 'boolean'],
        ]);

        BuildConfig::set("build_contacto_{$data['seccion']}_activo", $data['activo'] ? '1' : '0');

        return back()->with('status', $data['activo'] ? 'Sección activada.' : 'Sección desactivada.');
    }

    public function widgets(): Response
    {
        abort_if(! auth()->user()->can('linkiubuild.ver'), 403);

        return Inertia::render('admin/build/Widgets', [
            'fomo_enabled' => BuildConfig::get('fomo_enabled', 'false') === 'true',
        ]);
    }

    public function updateWidgets(Request $request, UpdateWidgets $action): RedirectResponse
    {
        abort_if(! auth()->user()->can('linkiubuild.editar'), 403);

        $data = $request->validate([
            'fomo_enabled' => ['required', 'boolean'],
        ]);

        $action->handle($data);

        return back()->with('status', 'Widgets guardados correctamente.');
    }
}
