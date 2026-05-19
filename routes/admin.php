<?php

use App\Http\Controllers\Admin\Auth\LoginController;
use App\Http\Controllers\Admin\Auth\ForgotPasswordController;
use App\Http\Controllers\Admin\Auth\OTPController;
use App\Http\Controllers\Admin\Auth\ResetPasswordController;
use App\Http\Controllers\Admin\Auth\InvitationController;
use App\Http\Controllers\Admin\AdminUsersController;
use App\Http\Controllers\Admin\CategoriesController;
use App\Http\Controllers\Admin\ProductoImagenesController;
use App\Http\Controllers\Admin\ProductosController;
use App\Http\Controllers\Admin\ProductoHookImagenesController;
use App\Http\Controllers\Admin\ProductoHooksController;
use App\Http\Controllers\Admin\ProductoLayoutController;
use App\Http\Controllers\Admin\VariableGruposController;
use App\Http\Controllers\Admin\VariableItemsController;
use App\Http\Controllers\Admin\IntegracionPixelesController;
use App\Http\Controllers\Admin\IntegracionPasarelasController;
use App\Http\Controllers\Admin\MetodosPagoController;
use App\Http\Controllers\Admin\ConfiguracionEnvioController;
use App\Http\Controllers\Admin\ClientsController;
use App\Http\Controllers\Admin\OrdersController;
use App\Http\Controllers\Admin\PerfilController;
use App\Http\Controllers\Admin\RolesController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ── Redirección raíz ──────────────────────────────────────────────────────────

Route::get('/admin', fn () => redirect()->route('admin.login'));

// ── Rutas públicas de auth (sin middleware admin) ──────────────────────────────

Route::prefix('admin')->name('admin.')->group(function () {

    // Login
    Route::get('/login',  [LoginController::class, 'mostrar'])->name('login');
    Route::post('/login', [LoginController::class, 'autenticar'])->name('login.post');

    // Cuenta bloqueada
    Route::get('/blocked', fn () => Inertia::render('auth/AccountBlocked'))->name('blocked');

    // Forgot password
    Route::get('/forgot-password',  [ForgotPasswordController::class, 'mostrar'])->name('forgot-password');
    Route::post('/forgot-password', [ForgotPasswordController::class, 'enviar'])->name('forgot-password.post');

    // Elegir método OTP
    Route::get('/choose-otp-method',  [OTPController::class, 'mostrarMetodo'])->name('choose-otp-method');
    Route::post('/choose-otp-method', [OTPController::class, 'enviarOTP'])->name('choose-otp-method.post');

    // Verificar OTP
    Route::post('/verify-otp', [OTPController::class, 'verificar'])->name('verify-otp');

    // Reset password
    Route::get('/reset-password',  [ResetPasswordController::class, 'mostrar'])->name('reset-password');
    Route::post('/reset-password', [ResetPasswordController::class, 'actualizar'])->name('reset-password.post');

    // Verificación de email
    Route::get('/verify-email', fn () => Inertia::render('auth/VerifyEmail'))->name('verify-email');
    Route::post('/verify-email/resend', [LoginController::class, 'reenviarVerificacion'])->name('verify-email.resend');

    // Invitación de sub-usuario
    Route::get('/invitation/{token}',  [InvitationController::class, 'mostrar'])->name('invitation');
    Route::post('/invitation/{token}', [InvitationController::class, 'activar'])->name('invitation.post');

});

// ── Rutas protegidas del admin ─────────────────────────────────────────────────

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {

    Route::get('/dashboard', fn () => Inertia::render('admin/Dashboard'))->name('dashboard');

    // Perfil
    Route::get('/perfil',          [PerfilController::class, 'show']           )->name('perfil')          ->middleware('can:perfil.ver');
    Route::post('/perfil/personal',[PerfilController::class, 'updatePersonal'] )->name('perfil.personal') ->middleware('can:perfil.editar');
    Route::post('/perfil/tienda',  [PerfilController::class, 'updateTienda']   )->name('perfil.tienda')   ->middleware('can:perfil.editar-tienda');

    Route::post('/logout', [LoginController::class, 'cerrarSesion'])->name('logout');

    // Usuarios
    Route::get('/usuarios',                         [AdminUsersController::class, 'index'])->name('usuarios.index')->middleware('can:usuarios.ver');
    Route::post('/usuarios',                        [AdminUsersController::class, 'store'])->name('usuarios.store')->middleware('can:usuarios.crear');
    Route::post('/usuarios/{user}/reenviar',        [AdminUsersController::class, 'reenviar'])->name('usuarios.reenviar')->middleware('can:usuarios.crear');
    Route::delete('/usuarios/{user}',               [AdminUsersController::class, 'destroy'])->name('usuarios.destroy')->middleware('can:usuarios.eliminar');

    // Productos
    Route::get('/productos',                       [ProductosController::class, 'index'])->name('productos.index')->middleware('can:productos.ver');
    Route::get('/productos/create',                [ProductosController::class, 'create'])->name('productos.create')->middleware('can:productos.crear');
    Route::post('/productos',                      [ProductosController::class, 'store'])->name('productos.store')->middleware('can:productos.crear');
    Route::get('/productos/{producto}/edit',       [ProductosController::class, 'edit'])->name('productos.edit')->middleware('can:productos.editar');
    Route::delete('/productos/{producto}',          [ProductosController::class, 'destroy'])->name('productos.destroy')->middleware('can:productos.eliminar');
    Route::post('/productos/{producto}/info',      [ProductosController::class, 'updateInfo'])->name('productos.update-info')->middleware('can:productos.editar');
    Route::post('/productos/{producto}/precio',                        [ProductosController::class,        'updatePrecio']  )->name('productos.update-precio')             ->middleware('can:productos.editar');
    Route::post('/productos/{producto}/imagenes',                      [ProductoImagenesController::class, 'store']         )->name('productos.imagenes.store')            ->middleware('can:productos.editar');
    Route::delete('/productos/{producto}/imagenes/{imagen}',           [ProductoImagenesController::class, 'destroy']       )->name('productos.imagenes.destroy')          ->middleware('can:productos.editar');
    Route::post('/productos/{producto}/imagenes/{imagen}/principal',   [ProductoImagenesController::class, 'setPrincipal']  )->name('productos.imagenes.principal')        ->middleware('can:productos.editar');

    Route::post('/productos/{producto}/layout',            [ProductoLayoutController::class,      'store']      )->name('productos.layout')                ->middleware('can:productos.editar');

    Route::post('/productos/{producto}/hooks/{hook}/toggle',     [ProductoHooksController::class,          'toggle']    )->name('productos.hooks.toggle')          ->middleware('can:productos.editar');
    Route::post('/productos/{producto}/hooks/{hook}/config',     [ProductoHooksController::class,          'saveConfig'] )->name('productos.hooks.config')           ->middleware('can:productos.editar');
    Route::post('/productos/{producto}/hooks/{hook}/imagenes',   [ProductoHookImagenesController::class,   'store']      )->name('productos.hooks.imagenes.store')  ->middleware('can:productos.editar');
    Route::delete('/productos/{producto}/hooks/{hook}/imagenes', [ProductoHookImagenesController::class,   'destroy']    )->name('productos.hooks.imagenes.destroy')->middleware('can:productos.editar');

    Route::post('/productos/{producto}/variables/grupos',                                        [VariableGruposController::class, 'store']  )->name('productos.variables.grupos.store')  ->middleware('can:productos.editar');
    Route::post('/productos/{producto}/variables/grupos/{grupo}',                                [VariableGruposController::class, 'update'] )->name('productos.variables.grupos.update') ->middleware('can:productos.editar');
    Route::delete('/productos/{producto}/variables/grupos/{grupo}',                              [VariableGruposController::class, 'destroy'])->name('productos.variables.grupos.destroy')->middleware('can:productos.editar');
    Route::post('/productos/{producto}/variables/grupos/{grupo}/items',                          [VariableItemsController::class, 'store']   )->name('productos.variables.items.store')   ->middleware('can:productos.editar');
    Route::post('/productos/{producto}/variables/grupos/{grupo}/items/{item}',                   [VariableItemsController::class, 'update']  )->name('productos.variables.items.update')  ->middleware('can:productos.editar');
    Route::post('/productos/{producto}/variables/grupos/{grupo}/items/{item}/toggle',            [VariableItemsController::class, 'toggle']  )->name('productos.variables.items.toggle')  ->middleware('can:productos.editar');
    Route::delete('/productos/{producto}/variables/grupos/{grupo}/items/{item}',                 [VariableItemsController::class, 'destroy'] )->name('productos.variables.items.destroy') ->middleware('can:productos.editar');

    // Métodos de pago
    Route::get('/metodos-pago',                      [MetodosPagoController::class, 'index']       )->name('metodos-pago.index')  ->middleware('can:metodos-pago.ver');
    Route::post('/metodos-pago/{metodo}/toggle',     [MetodosPagoController::class, 'toggle']      )->name('metodos-pago.toggle') ->middleware('can:metodos-pago.editar');
    Route::post('/metodos-pago/{metodo}/config',     [MetodosPagoController::class, 'updateConfig'])->name('metodos-pago.config') ->middleware('can:metodos-pago.editar');

    // Configuración de envío
    Route::get('/envio',                  [ConfiguracionEnvioController::class, 'index']      )->name('envio.index')         ->middleware('can:envio.ver');
    Route::post('/envio/zonas',           [ConfiguracionEnvioController::class, 'storeZona']  )->name('envio.zonas.store')   ->middleware('can:envio.editar');
    Route::post('/envio/zonas/{zona}',    [ConfiguracionEnvioController::class, 'updateZona'] )->name('envio.zonas.update')  ->middleware('can:envio.editar');
    Route::delete('/envio/zonas/{zona}',  [ConfiguracionEnvioController::class, 'destroyZona'])->name('envio.zonas.destroy') ->middleware('can:envio.editar');

    // Integraciones
    Route::get('/integraciones/pixeles',    [IntegracionPixelesController::class,   'show'])  ->name('integraciones.pixeles')         ->middleware('can:integraciones.ver');
    Route::post('/integraciones/pixeles',   [IntegracionPixelesController::class,   'update'])->name('integraciones.pixeles.update')  ->middleware('can:integraciones.editar');
    Route::get('/integraciones/pasarelas',  [IntegracionPasarelasController::class, 'show'])  ->name('integraciones.pasarelas')        ->middleware('can:integraciones.ver');
    Route::post('/integraciones/pasarelas', [IntegracionPasarelasController::class, 'update'])->name('integraciones.pasarelas.update') ->middleware('can:integraciones.editar');

    // Categorías
    Route::get('/categorias',                  [CategoriesController::class, 'index'])->name('categorias.index')->middleware('can:categorias.ver');
    Route::post('/categorias',                 [CategoriesController::class, 'store'])->name('categorias.store')->middleware('can:categorias.crear');
    Route::post('/categorias/{category}',      [CategoriesController::class, 'update'])->name('categorias.update')->middleware('can:categorias.editar');
    Route::delete('/categorias/{category}',    [CategoriesController::class, 'destroy'])->name('categorias.destroy')->middleware('can:categorias.eliminar');

    // Órdenes
    Route::get('/ordenes',                          [OrdersController::class, 'index']             )->name('ordenes.index')          ->middleware('can:ordenes.ver');
    Route::get('/ordenes/{order}',                  [OrdersController::class, 'show']              )->name('ordenes.show')           ->middleware('can:ordenes.ver');
    Route::post('/ordenes/{order}/estado',          [OrdersController::class, 'updateEstado']      )->name('ordenes.estado')         ->middleware('can:ordenes.editar');
    Route::post('/ordenes/{order}/notas-internas',  [OrdersController::class, 'updateNotasInternas'])->name('ordenes.notas-internas')->middleware('can:ordenes.editar');

    // Clientes
    Route::get('/clientes',                 [ClientsController::class, 'index']    )->name('clientes.index') ->middleware('can:clientes.ver');
    Route::get('/clientes/export',          [ClientsController::class, 'export']   )->name('clientes.export')->middleware('can:clientes.ver');
    Route::get('/clientes/{client}',        [ClientsController::class, 'show']     )->name('clientes.show')  ->middleware('can:clientes.ver');
    Route::post('/clientes/{client}',       [ClientsController::class, 'update']   )->name('clientes.update')->middleware('can:clientes.editar');
    Route::post('/clientes/{client}/email', [ClientsController::class, 'sendEmail'])->name('clientes.email') ->middleware('can:clientes.editar');

    // Roles y permisos
    Route::get('/roles',                            [RolesController::class, 'index'])->name('roles.index')->middleware('can:roles.ver');
    Route::post('/roles',                           [RolesController::class, 'store'])->name('roles.store')->middleware('can:roles.crear');
    Route::post('/roles/{role}/permissions/toggle', [RolesController::class, 'togglePermission'])->name('roles.toggle-permission')->middleware('can:roles.editar');
    Route::delete('/roles/{role}',                  [RolesController::class, 'destroy'])->name('roles.destroy')->middleware('can:roles.eliminar');

});
