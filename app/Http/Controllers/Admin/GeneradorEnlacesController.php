<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Generador de enlaces UTM in-app. Permite a los admins armar URLs
 * con utm_source/medium/campaign/content/term sin tener que conocer
 * el formato. Soporta tambien "modo avanzado Meta" con placeholders
 * dinamicos ({{site_source_name}}, {{campaign.name}}, etc.).
 */
class GeneradorEnlacesController extends Controller
{
    public function index(): Response
    {
        abort_if(! auth()->user()->can('generador_enlaces.ver'), 403);

        return Inertia::render('admin/analytics/generador-enlaces/Index', [
            'productos' => Producto::query()
                ->where('status', 'activo')
                ->orderBy('nombre')
                ->get(['id', 'nombre', 'slug'])
                ->map(fn ($p) => ['id' => $p->id, 'nombre' => $p->nombre, 'slug' => $p->slug])
                ->toArray(),
            'paginas_fijas' => [
                ['valor' => '/',              'nombre' => 'Inicio'],
                ['valor' => '/productos',     'nombre' => 'Catálogo de productos'],
                ['valor' => '/quienes-somos', 'nombre' => 'Quiénes somos'],
                ['valor' => '/contacto',      'nombre' => 'Contacto'],
                ['valor' => '/blog',          'nombre' => 'Blog'],
            ],
            'base_url' => url('/'),
        ]);
    }
}
