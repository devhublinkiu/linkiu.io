<?php

use App\Http\Controllers\Client\Auth\ForgotPasswordController as ClientForgotPasswordController;
use App\Http\Controllers\Client\Auth\OTPController as ClientOTPController;
use App\Http\Controllers\Client\Auth\ResetPasswordController as ClientResetPasswordController;
use App\Http\Controllers\Client\ClientLoginController;
use App\Http\Controllers\Client\CuentaController;
use App\Http\Controllers\Client\CuentaDireccionesController;
use App\Http\Controllers\MercadoPagoController;
use App\Http\Controllers\ProductViewsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Public\BlogController;
use App\Http\Controllers\Public\FomoController;
use App\Http\Controllers\Public\OrderController;
use App\Http\Controllers\Public\ProductosController as PublicProductosController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('public/Home');
})->name('home');

// Compatibilidad con controllers Auth de Breeze (login estándar, verificación
// de email, confirm password) que redirigen vía route('dashboard'). El render
// del scaffold "You're logged in!" se eliminó — todo admin debe aterrizar en
// /admin/dashboard, que es el dashboard real del proyecto.
Route::get('/dashboard', fn () => redirect()->route('admin.dashboard'))
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

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

// Blog público
Route::get('/blog',          [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{slug}',   [BlogController::class, 'show'] )->name('blog.show');

Route::post('/orden', [OrderController::class, 'store'])->name('orden.store');
Route::get('/orden/{order:acceso_token}/gracias', [OrderController::class, 'confirmacion'])->name('orden.confirmacion');
Route::get('/orden/{order:acceso_token}',         [OrderController::class, 'seguimiento'] )->name('orden.seguimiento');

Route::post('/track/product-view', [ProductViewsController::class, 'track'])->name('track.product-view');

Route::post('/api/heartbeat', [\App\Http\Controllers\Public\HeartbeatController::class, 'tick'])
    ->middleware('throttle:60,1')
    ->name('heartbeat');
Route::post('/api/heartbeat/disconnect', [\App\Http\Controllers\Public\HeartbeatController::class, 'disconnect'])
    ->middleware('throttle:30,1')
    ->name('heartbeat.disconnect');

Route::get('/api/fomo',  [FomoController::class, 'index']  )->name('fomo.index');
Route::post('/api/fomo-view', [FomoController::class, 'logView'])->name('fomo.log-view');

// Meta Conversions API — bridge browser → server
Route::post('/api/meta/event', [\App\Http\Controllers\Api\MetaEventsController::class, 'dispatch'])
    ->middleware('throttle:120,1')
    ->name('meta.event');
Route::post('/api/meta/probar-conexion', [\App\Http\Controllers\Api\MetaEventsController::class, 'probarConexion'])
    ->middleware(['auth', 'throttle:10,1'])
    ->name('meta.probar');

// MercadoPago
Route::post('/api/mp/pagar',        [MercadoPagoController::class, 'pagar']   )->name('mp.pagar')->middleware('throttle:mp-pagar');
Route::get('/mp/resultado',         [MercadoPagoController::class, 'callback'])->name('mp.callback');
Route::post('/webhooks/mercadopago',[MercadoPagoController::class, 'webhook'] )->name('mp.webhook');

// Bold (Colombia) — checkout embebido
Route::post('/api/bold/iniciar', [\App\Http\Controllers\BoldController::class, 'iniciar'])
    ->middleware('throttle:30,1')
    ->name('bold.iniciar');
Route::post('/webhooks/bold', [\App\Http\Controllers\BoldController::class, 'webhook'])
    ->name('bold.webhook');

// Capa 3 — Webhook SendPulse para botones Quick Reply de la plantilla
// order_received_cod_v1 (confirmación COD por el cliente).
Route::post('/webhooks/sendpulse', [\App\Http\Controllers\SendPulseWebhookController::class, 'handle'])
    ->name('sendpulse.webhook');

Route::get('/productos',                   [PublicProductosController::class, 'index'])    ->name('productos');
Route::get('/productos/categoria/{slug}',  [PublicProductosController::class, 'categoria'])->name('productos.categoria');
Route::get('/productos/{slug}',            [PublicProductosController::class, 'show'])     ->name('producto.show');

Route::get('/quienes-somos', function () {
    return Inertia::render('public/About');
})->name('about');

Route::get('/contacto', function () {
    return Inertia::render('public/Contact');
})->name('contact');

Route::post('/contacto/enviar', [\App\Http\Controllers\ContactoFormController::class, 'enviar'])->name('contacto.enviar');

Route::get('/components-preview', function () {
    return Inertia::render('public/ComponentsPreview');
})->name('components-preview');

// Cuenta de cliente
Route::prefix('cuenta')->name('cuenta.')->group(function () {
    Route::get('/login',  [ClientLoginController::class, 'mostrar']   )->name('login');
    Route::post('/login', [ClientLoginController::class, 'autenticar'])->name('login.post')->middleware('throttle:client-login');
    Route::post('/logout',[ClientLoginController::class, 'logout']    )->name('logout');

    // Recuperación de contraseña (flujo OTP — comparte Actions con admin vía guard 'client')
    Route::get('/blocked', fn () => Inertia::render('clients/auth/AccountBlocked'))->name('blocked');

    Route::get('/forgot-password',  [ClientForgotPasswordController::class, 'mostrar'])->name('forgot-password');
    Route::post('/forgot-password', [ClientForgotPasswordController::class, 'enviar'])->name('forgot-password.post')->middleware('throttle:5,1');

    Route::get('/choose-otp-method',  [ClientOTPController::class, 'mostrarMetodo'])->name('choose-otp-method');
    Route::post('/choose-otp-method', [ClientOTPController::class, 'enviarOTP'])->name('choose-otp-method.post')->middleware('throttle:5,1');

    Route::post('/verify-otp', [ClientOTPController::class, 'verificar'])->name('verify-otp')->middleware('throttle:10,1');

    Route::get('/reset-password',  [ClientResetPasswordController::class, 'mostrar'])->name('reset-password');
    Route::post('/reset-password', [ClientResetPasswordController::class, 'actualizar'])->name('reset-password.post');

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
