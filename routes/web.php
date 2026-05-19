<?php

use App\Http\Controllers\Client\ClientLoginController;
use App\Http\Controllers\Client\CuentaController;
use App\Http\Controllers\Client\CuentaDireccionesController;
use App\Http\Controllers\MercadoPagoController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductViewsController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('public/Home');
})->name('home');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/checkout', function () {
    $metodos = \App\Models\MetodoPago::where('activo', true)
        ->orderBy('orden')
        ->get()
        ->map(fn ($m) => [
            'clave'       => $m->clave,
            'nombre'      => $m->nombre,
            'descripcion' => $m->descripcion,
            'config'      => $m->config ?? [],
        ]);

    $zonas = \App\Models\ZonaEnvio::where('activo', true)
        ->orderBy('orden')
        ->orderBy('id')
        ->get()
        ->map(fn ($z) => [
            'id'            => $z->id,
            'nombre'        => $z->nombre,
            'departamentos' => $z->departamentos,
            'tipo_costo'    => $z->tipo_costo,
            'costo'         => $z->costo,
            'umbral_gratis' => $z->umbral_gratis,
        ]);

    $direcciones = [];
    if (auth('client')->check()) {
        $direcciones = auth('client')->user()
            ->addresses()
            ->orderByDesc('predeterminada')
            ->orderBy('id')
            ->get()
            ->map(fn ($d) => [
                'id'             => $d->id,
                'etiqueta'       => $d->etiqueta,
                'departamento'   => $d->departamento,
                'ciudad'         => $d->ciudad,
                'direccion'      => $d->direccion,
                'apartamento'    => $d->apartamento,
                'predeterminada' => $d->predeterminada,
            ])
            ->values();
    }

    return Inertia::render('public/Checkout', [
        'metodos'     => $metodos,
        'zonas_envio' => $zonas,
        'direcciones' => $direcciones,
    ]);
})->name('checkout');

Route::get('/api/check-email', function (\Illuminate\Http\Request $request) {
    $request->validate(['email' => 'required|email|max:255']);
    return response()->json([
        'existe' => \App\Models\Client::where('email', $request->email)->exists(),
    ]);
})->name('check-email');

Route::post('/orden', [OrderController::class, 'store'])->name('orden.store');
Route::get('/orden/{codigo}/gracias', [OrderController::class, 'confirmacion'])->name('orden.confirmacion');
Route::get('/orden/{codigo}', [OrderController::class, 'seguimiento'])->name('orden.seguimiento');

Route::post('/track/product-view', [ProductViewsController::class, 'track'])->name('track.product-view');

// MercadoPago
Route::post('/api/mp/pagar',        [MercadoPagoController::class, 'pagar']   )->name('mp.pagar');
Route::get('/mp/resultado',         [MercadoPagoController::class, 'callback'])->name('mp.callback');
Route::post('/webhooks/mercadopago',[MercadoPagoController::class, 'webhook'] )->name('mp.webhook');

Route::get('/productos', function () {
    return Inertia::render('public/Products');
})->name('productos');

Route::get('/productos/savia-cubre-canas', function () {
    $producto = \App\Models\Producto::where('slug', 'savia-cubre-canas')
        ->with(['hooks', 'cantidades', 'imagenes', 'variableGrupos.items'])
        ->first();

    return Inertia::render('public/Product', [
        'producto_id'  => $producto?->id,
        'nombre'       => $producto?->nombre,
        'unidad'       => $producto?->unidad ?? 'Unidad',
        'hooks'        => $producto
            ? $producto->hooks->where('activo', true)->map(fn ($h) => [
                'key'    => $h->hook_key,
                'config' => $h->config ?? [],
            ])->values()->toArray()
            : [],
        'layout_orden'     => $producto?->layout_orden ?? null,
        'precio_base'      => $producto?->precio_base,
        'imagen_principal' => $producto?->imagenes->firstWhere('principal', true)?->url
                           ?? $producto?->imagenes->sortBy('orden')->first()?->url,
        'imagenes'         => $producto
            ? $producto->imagenes->sortBy('orden')->map(fn ($i) => [
                'url'       => $i->url,
                'principal' => (bool) $i->principal,
            ])->values()->toArray()
            : [],
        'grupos'           => $producto
            ? $producto->variableGrupos->sortBy('orden')->map(fn ($g) => [
                'id'    => $g->id,
                'nombre' => $g->nombre,
                'tipo'  => $g->tipo,
                'items' => $g->items->where('activo', true)->sortBy('orden')->map(fn ($i) => [
                    'id'            => $i->id,
                    'nombre'        => $i->nombre,
                    'valor'         => $i->valor,
                    'url'           => $i->url,
                    'precio_ajuste' => $i->precio_ajuste,
                ])->values()->toArray(),
            ])->values()->toArray()
            : [],
        'cantidades'       => $producto
            ? $producto->cantidades->sortBy('orden')->map(fn ($c) => [
                'cantidad'      => $c->cantidad,
                'precio_bundle' => $c->precio_bundle,
                'badge_texto'   => $c->badge_texto,
                'destacado'     => $c->destacado,
                'imagen'        => $c->imagen,
            ])->values()->toArray()
            : [],
    ]);
})->name('producto.savia');

Route::get('/productos/{categoria}', function (string $categoria) {
    return Inertia::render('public/ProductCategory', [
        'categoriaSlug' => $categoria,
    ]);
})->name('productos.categoria');

Route::get('/quienes-somos', function () {
    return Inertia::render('public/About');
})->name('about');

Route::get('/contacto', function () {
    return Inertia::render('public/Contact');
})->name('contact');

Route::get('/components-preview', function () {
    return Inertia::render('public/ComponentsPreview');
})->name('components-preview');

// Cuenta de cliente
Route::prefix('cuenta')->name('cuenta.')->group(function () {
    Route::get('/login',  [ClientLoginController::class, 'mostrar']   )->name('login');
    Route::post('/login', [ClientLoginController::class, 'autenticar'])->name('login.post');
    Route::post('/logout',[ClientLoginController::class, 'logout']    )->name('logout');

    Route::middleware('auth.client')->group(function () {
        Route::get('/pedidos',    [CuentaController::class, 'pedidos']      )->name('pedidos');
        Route::get('/perfil',     [CuentaController::class, 'perfil']       )->name('perfil');
        Route::post('/perfil',    [CuentaController::class, 'updatePerfil'] )->name('perfil.update');
        Route::get('/seguridad',  [CuentaController::class, 'seguridad']    )->name('seguridad');
        Route::post('/seguridad', [CuentaController::class, 'updatePassword'])->name('seguridad.update');

        Route::get('/direcciones',                        [CuentaDireccionesController::class, 'index']            )->name('direcciones');
        Route::post('/direcciones',                       [CuentaDireccionesController::class, 'store']            )->name('direcciones.store');
        Route::post('/direcciones/{address}',             [CuentaDireccionesController::class, 'update']           )->name('direcciones.update');
        Route::delete('/direcciones/{address}',           [CuentaDireccionesController::class, 'destroy']          )->name('direcciones.destroy');
        Route::post('/direcciones/{address}/predeterminada', [CuentaDireccionesController::class, 'setPredeterminada'])->name('direcciones.predeterminada');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
