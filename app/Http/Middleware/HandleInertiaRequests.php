<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\Integracion;
use App\Models\Producto;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
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
            'fb_pixel_id'        => fn () => $request->routeIs('admin.*') ? null : Integracion::get('fb_pixel_id'),
            'fb_test_event_code' => fn () => $request->routeIs('admin.*') ? null : Integracion::get('fb_test_event_code'),
            'mp_public_key'      => function () use ($request) {
                if ($request->routeIs('admin.*')) return null;
                $sandbox = Integracion::get('mp_sandbox', '1') === '1';
                return $sandbox
                    ? Integracion::get('mp_public_key_sandbox')
                    : Integracion::get('mp_public_key_prod');
            },
            'nav_categorias' => fn () => Category::where('status', 'activo')
                ->whereNull('parent_id')
                ->orderBy('name')
                ->get(['id', 'name', 'slug']),
            'nav_productos' => fn () => $request->routeIs('admin.*') ? [] : Producto::where('status', 'activo')
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
                ]),
        ];
    }
}
