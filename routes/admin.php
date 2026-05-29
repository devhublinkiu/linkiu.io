<?php

use App\Http\Controllers\Admin\Auth\LoginController;
use App\Http\Controllers\Admin\Auth\ForgotPasswordController;
use App\Http\Controllers\Admin\Auth\OTPController;
use App\Http\Controllers\Admin\Auth\ResetPasswordController;
use App\Http\Controllers\Admin\Auth\InvitationController;
use App\Http\Controllers\Admin\AdminUsersController;
use App\Http\Controllers\Admin\BlogPostsController;
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
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrdersController;
use App\Http\Controllers\Admin\LinkiuBuildController;
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

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Perfil
    Route::get('/perfil',          [PerfilController::class, 'show']           )->name('perfil')          ->middleware('can:perfil.ver');
    Route::post('/perfil/personal',[PerfilController::class, 'updatePersonal'] )->name('perfil.personal') ->middleware(['can:perfil.editar', 'throttle:perfil-update']);

    Route::post('/logout', [LoginController::class, 'cerrarSesion'])->name('logout');

    // Usuarios
    Route::get('/usuarios',                         [AdminUsersController::class, 'index'])->name('usuarios.index')->middleware('can:usuarios.ver');
    Route::post('/usuarios',                        [AdminUsersController::class, 'store'])->name('usuarios.store')->middleware(['can:usuarios.crear', 'throttle:admin-crear-usuario']);
    Route::post('/usuarios/{user}/reenviar',        [AdminUsersController::class, 'reenviar'])->name('usuarios.reenviar')->middleware(['can:usuarios.crear', 'throttle:admin-crear-usuario']);
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
    Route::get('/envio',                  [ConfiguracionEnvioController::class, 'index']        )->name('envio.index')         ->middleware('can:envio.ver');
    Route::get('/envio/colombia-data',    [ConfiguracionEnvioController::class, 'colombiaData'] )->name('envio.colombia-data') ->middleware('can:envio.editar');
    Route::post('/envio/zonas',           [ConfiguracionEnvioController::class, 'storeZona']    )->name('envio.zonas.store')   ->middleware('can:envio.editar');
    Route::post('/envio/zonas/{zona}',    [ConfiguracionEnvioController::class, 'updateZona']   )->name('envio.zonas.update')  ->middleware('can:envio.editar');
    Route::delete('/envio/zonas/{zona}',  [ConfiguracionEnvioController::class, 'destroyZona']  )->name('envio.zonas.destroy') ->middleware('can:envio.editar');

    // Mipaquete — config + sugerencias para los badges de "Nueva zona".
    Route::get( '/envio/mipaquete/config',      [\App\Http\Controllers\Admin\EnvioSugerenciasController::class, 'config']        )->name('envio.mipaquete.config');
    Route::post('/envio/mipaquete/config',      [\App\Http\Controllers\Admin\EnvioSugerenciasController::class, 'guardarConfig'] )->name('envio.mipaquete.config.save')->middleware('can:envio.editar');
    Route::post('/envio/mipaquete/sugerencias', [\App\Http\Controllers\Admin\EnvioSugerenciasController::class, 'sugerencias']   )->name('envio.mipaquete.sugerencias')->middleware('can:envio.ver');

    // Integraciones
    Route::get('/integraciones/pixeles',    [IntegracionPixelesController::class,   'show'])  ->name('integraciones.pixeles')         ->middleware('can:integraciones.ver');
    Route::post('/integraciones/pixeles',   [IntegracionPixelesController::class,   'update'])->name('integraciones.pixeles.update')  ->middleware('can:integraciones.editar');
    Route::get('/integraciones/pasarelas',  [IntegracionPasarelasController::class, 'show'])  ->name('integraciones.pasarelas')        ->middleware('can:integraciones.ver');
    Route::post('/integraciones/pasarelas', [IntegracionPasarelasController::class, 'update'])->name('integraciones.pasarelas.update') ->middleware('can:integraciones.editar');

    // Antifraude (Capa 2) — sin item de sidebar; entry desde Mastershop
    Route::get(   '/antifraude',                       [\App\Http\Controllers\Admin\AntifraudeController::class, 'show']            )->name('antifraude.configuracion') ->middleware('can:antifraude.ver');
    Route::post(  '/antifraude/reglas',                [\App\Http\Controllers\Admin\AntifraudeController::class, 'updateReglas']    )->name('antifraude.reglas.update') ->middleware('can:antifraude.editar');
    Route::post(  '/antifraude/blacklist',             [\App\Http\Controllers\Admin\AntifraudeController::class, 'storeBlacklist'] )->name('antifraude.blacklist.store') ->middleware('can:antifraude.editar');
    Route::delete('/antifraude/blacklist/{entry}',     [\App\Http\Controllers\Admin\AntifraudeController::class, 'destroyBlacklist'])->name('antifraude.blacklist.destroy')->middleware('can:antifraude.editar')->where('entry', '[0-9]+');

    // Mastershop — config + enrolamiento de productos (Capa 1)
    Route::get( '/integraciones/mastershop',                       [\App\Http\Controllers\Admin\IntegracionMastershopController::class, 'show']       )->name('integraciones.mastershop')             ->middleware('can:integraciones.ver');
    Route::post('/integraciones/mastershop',                       [\App\Http\Controllers\Admin\IntegracionMastershopController::class, 'update']     )->name('integraciones.mastershop.update')      ->middleware('can:integraciones.editar');
    Route::post('/integraciones/mastershop/probar',                [\App\Http\Controllers\Admin\IntegracionMastershopController::class, 'probar']     )->name('integraciones.mastershop.probar')      ->middleware('can:integraciones.editar');
    Route::get( '/integraciones/mastershop/buscar',                [\App\Http\Controllers\Admin\IntegracionMastershopController::class, 'buscar']     )->name('integraciones.mastershop.buscar')      ->middleware('can:integraciones.editar');
    Route::get( '/integraciones/mastershop/producto/{idProduct}',  [\App\Http\Controllers\Admin\IntegracionMastershopController::class, 'producto']   )->name('integraciones.mastershop.producto')    ->middleware('can:integraciones.editar')->where('idProduct', '[0-9]+');
    Route::post('/integraciones/mastershop/vincular/{producto}',   [\App\Http\Controllers\Admin\IntegracionMastershopController::class, 'vincular']  )->name('integraciones.mastershop.vincular')    ->middleware('can:productos.editar')   ->where('producto',  '[0-9]+');
    Route::delete('/integraciones/mastershop/vincular/{producto}', [\App\Http\Controllers\Admin\IntegracionMastershopController::class, 'desvincular'])->name('integraciones.mastershop.desvincular')->middleware('can:productos.editar')   ->where('producto',  '[0-9]+');

    // Categorías
    // Nota: `categorias.update` usa POST (no PUT/PATCH) porque el frontend
    // envía multipart/form-data con `forceFormData: true` para soportar la
    // subida opcional de imagen. PHP no parsea multipart en métodos distintos
    // de POST. Spoofing con _method tampoco resuelve bien con archivos.
    // Blog (admin CRUD). El frontend público se monta en routes/web.php.
    // Nota: `update` y `store` usan POST (no PUT/PATCH) por multipart con
    // imagen destacada — PHP solo parsea form-data en POST.
    Route::get('/blogs',                    [BlogPostsController::class, 'index']  )->name('blogs.index')   ->middleware('can:blogs.ver');
    Route::get('/blogs/create',             [BlogPostsController::class, 'create'] )->name('blogs.create')  ->middleware('can:blogs.crear');
    Route::post('/blogs',                   [BlogPostsController::class, 'store']  )->name('blogs.store')   ->middleware('can:blogs.crear');
    Route::get('/blogs/{post}/edit',        [BlogPostsController::class, 'edit']   )->name('blogs.edit')    ->middleware('can:blogs.editar');
    Route::post('/blogs/{post}',            [BlogPostsController::class, 'update'] )->name('blogs.update')  ->middleware('can:blogs.editar');
    Route::delete('/blogs/{post}',          [BlogPostsController::class, 'destroy'])->name('blogs.destroy') ->middleware('can:blogs.eliminar');

    Route::get('/categorias',                  [CategoriesController::class, 'index'])->name('categorias.index')->middleware('can:categorias.ver');
    Route::post('/categorias',                 [CategoriesController::class, 'store'])->name('categorias.store')->middleware('can:categorias.crear');
    Route::post('/categorias/{category}',      [CategoriesController::class, 'update'])->name('categorias.update')->middleware('can:categorias.editar');
    Route::delete('/categorias/{category}',    [CategoriesController::class, 'destroy'])->name('categorias.destroy')->middleware('can:categorias.eliminar');

    // Órdenes
    Route::get('/ordenes',                          [OrdersController::class, 'index']             )->name('ordenes.index')          ->middleware('can:ordenes.ver');
    Route::get('/ordenes/export',                   [OrdersController::class, 'export']            )->name('ordenes.export')         ->middleware('can:ordenes.ver');
    Route::get('/ordenes/{order}',                  [OrdersController::class, 'show']              )->name('ordenes.show')           ->middleware('can:ordenes.ver');
    Route::post('/ordenes/{order}/estado',          [OrdersController::class, 'updateEstado']      )->name('ordenes.estado')         ->middleware('can:ordenes.editar');
    Route::post('/ordenes/{order}/notas-internas',  [OrdersController::class, 'updateNotasInternas'])->name('ordenes.notas-internas')->middleware('can:ordenes.editar');
    Route::post('/ordenes/{order}/revision/aprobar',  [OrdersController::class, 'aprobarRevision'] )->name('ordenes.revision.aprobar') ->middleware('can:ordenes.editar');
    Route::post('/ordenes/{order}/revision/rechazar', [OrdersController::class, 'rechazarRevision'])->name('ordenes.revision.rechazar')->middleware('can:ordenes.editar');
    Route::post('/ordenes/{order}/confirmacion/reenviar', [OrdersController::class, 'reenviarConfirmacion'])->name('ordenes.confirmacion.reenviar')->middleware('can:ordenes.editar');

    // Clientes
    Route::get('/clientes',                 [ClientsController::class, 'index']    )->name('clientes.index') ->middleware('can:clientes.ver');
    Route::get('/clientes/export',          [ClientsController::class, 'export']   )->name('clientes.export')->middleware('can:clientes.ver');
    Route::get('/clientes/{client}',        [ClientsController::class, 'show']     )->name('clientes.show')  ->middleware('can:clientes.ver');
    Route::post('/clientes/{client}',       [ClientsController::class, 'update']   )->name('clientes.update')->middleware('can:clientes.editar');
    Route::post('/clientes/{client}/email', [ClientsController::class, 'sendEmail'])->name('clientes.email') ->middleware('can:clientes.editar');

    // LinkiuBuild
    Route::prefix('build')->name('build.')->group(function () {
        Route::get('/theme',                [LinkiuBuildController::class, 'theme']        )->name('theme')          ->middleware('can:linkiubuild.ver');
        Route::post('/theme/colores',       [LinkiuBuildController::class, 'updateColores'])->name('theme.colores')  ->middleware('can:linkiubuild.editar');
        Route::post('/theme/botones',       [LinkiuBuildController::class, 'updateBotones'])->name('theme.botones')  ->middleware('can:linkiubuild.editar');
        Route::post('/theme/logos',         [LinkiuBuildController::class, 'updateLogos']  )->name('theme.logos')    ->middleware('can:linkiubuild.editar');
        Route::post('/theme/seo',           [LinkiuBuildController::class, 'updateSeo']    )->name('theme.seo')      ->middleware('can:linkiubuild.editar');
        Route::get('/menu',                              [LinkiuBuildController::class, 'menu']              )->name('menu')                ->middleware('can:linkiubuild.ver');
        Route::post('/menu/ticker',                      [LinkiuBuildController::class, 'updateTicker']       )->name('menu.ticker')          ->middleware('can:linkiubuild.editar');
        Route::post('/menu/anuncios',                    [LinkiuBuildController::class, 'storeAnnouncement']   )->name('menu.anuncios.store')   ->middleware('can:linkiubuild.editar');
        Route::post('/menu/anuncios/{announcement}',         [LinkiuBuildController::class, 'updateAnnouncement'] )->name('menu.anuncios.update')  ->middleware('can:linkiubuild.editar');
        Route::patch('/menu/anuncios/{announcement}/activo', [LinkiuBuildController::class, 'toggleAnnouncement'] )->name('menu.anuncios.toggle')  ->middleware('can:linkiubuild.editar');
        Route::delete('/menu/anuncios/{announcement}',       [LinkiuBuildController::class, 'deleteAnnouncement'] )->name('menu.anuncios.destroy') ->middleware('can:linkiubuild.editar');
        Route::post('/menu/nav',                         [LinkiuBuildController::class, 'updateNav']           )->name('menu.nav')             ->middleware('can:linkiubuild.editar');
        Route::get('/inicio',                  [LinkiuBuildController::class, 'inicio']              )->name('inicio')                      ->middleware('can:linkiubuild.ver');
        Route::post('/inicio/seccion',         [LinkiuBuildController::class, 'toggleSeccionInicio'])->name('inicio.seccion')              ->middleware('can:linkiubuild.editar');
        Route::post('/inicio/ticker/config',     [LinkiuBuildController::class, 'saveTickerConfig']     )->name('inicio.ticker.config')      ->middleware('can:linkiubuild.editar');
        Route::post('/inicio/beneficios/config',   [LinkiuBuildController::class, 'saveBeneficiosConfig'] )->name('inicio.beneficios.config')      ->middleware('can:linkiubuild.editar');
        Route::post('/inicio/como-funciona/config', [LinkiuBuildController::class, 'saveComoFuncionaConfig'])->name('inicio.como_funciona.config')->middleware('can:linkiubuild.editar');
        Route::post('/inicio/banners/config',      [LinkiuBuildController::class, 'saveBannersConfig']    )->name('inicio.banners.config')         ->middleware('can:linkiubuild.editar');
        Route::post('/inicio/banners/imagenes',    [LinkiuBuildController::class, 'storeBannerImagen']    )->name('inicio.banners.imagenes.store')  ->middleware('can:linkiubuild.editar');
        Route::delete('/inicio/banners/imagenes',  [LinkiuBuildController::class, 'destroyBannerImagen']  )->name('inicio.banners.imagenes.destroy')->middleware('can:linkiubuild.editar');
        Route::post('/inicio/cta/config',        [LinkiuBuildController::class, 'saveCtaConfig']        )->name('inicio.cta.config')              ->middleware('can:linkiubuild.editar');
        Route::post('/inicio/faq/config',        [LinkiuBuildController::class, 'saveFaqConfig']        )->name('inicio.faq.config')              ->middleware('can:linkiubuild.editar');
        Route::post('/inicio/carrusel/config',     [LinkiuBuildController::class, 'saveCarruselConfig']    )->name('inicio.carrusel.config')          ->middleware('can:linkiubuild.editar');
        Route::post('/inicio/carrusel/imagenes',   [LinkiuBuildController::class, 'storeCarruselImagen']  )->name('inicio.carrusel.imagenes.store')  ->middleware('can:linkiubuild.editar');
        Route::delete('/inicio/carrusel/imagenes', [LinkiuBuildController::class, 'destroyCarruselImagen'])->name('inicio.carrusel.imagenes.destroy')->middleware('can:linkiubuild.editar');
        Route::post('/inicio/hero/config',     [LinkiuBuildController::class, 'saveHeroConfig']      )->name('inicio.hero.config')          ->middleware('can:linkiubuild.editar');
        Route::post('/inicio/resenas/config',  [LinkiuBuildController::class, 'saveResenasConfig']   )->name('inicio.resenas.config')       ->middleware('can:linkiubuild.editar');
        Route::post('/inicio/hero/imagenes',   [LinkiuBuildController::class, 'storeHeroImagen']     )->name('inicio.hero.imagenes.store')  ->middleware('can:linkiubuild.editar');
        Route::delete('/inicio/hero/imagenes', [LinkiuBuildController::class, 'destroyHeroImagen']   )->name('inicio.hero.imagenes.destroy')->middleware('can:linkiubuild.editar');
        Route::get('/quienes-somos',                         [LinkiuBuildController::class, 'quienesSomos']                  )->name('quienes-somos')                              ->middleware('can:linkiubuild.ver');
        Route::post('/quienes-somos/identidad',              [LinkiuBuildController::class, 'saveQuienesIdentidadConfig']    )->name('quienes-somos.identidad.config')             ->middleware('can:linkiubuild.editar');
        Route::post('/quienes-somos/historia',               [LinkiuBuildController::class, 'saveQuienesHistoriaConfig']     )->name('quienes-somos.historia.config')              ->middleware('can:linkiubuild.editar');
        Route::post('/quienes-somos/historia/imagen',        [LinkiuBuildController::class, 'storeQuienesHistoriaImagen']    )->name('quienes-somos.historia.imagen.store')        ->middleware('can:linkiubuild.editar');
        Route::delete('/quienes-somos/historia/imagen',      [LinkiuBuildController::class, 'destroyQuienesHistoriaImagen']  )->name('quienes-somos.historia.imagen.destroy')      ->middleware('can:linkiubuild.editar');
        Route::post('/quienes-somos/stats',                  [LinkiuBuildController::class, 'saveQuienesStatsConfig']        )->name('quienes-somos.stats.config')                 ->middleware('can:linkiubuild.editar');
        Route::post('/quienes-somos/mision-vision',          [LinkiuBuildController::class, 'saveQuienesMisionVisionConfig'] )->name('quienes-somos.mision-vision.config')         ->middleware('can:linkiubuild.editar');
        Route::post('/quienes-somos/valores',                [LinkiuBuildController::class, 'saveQuienesValoresConfig']      )->name('quienes-somos.valores.config')               ->middleware('can:linkiubuild.editar');
        Route::post('/quienes-somos/seccion',              [LinkiuBuildController::class, 'toggleSeccionQuienes']         )->name('quienes-somos.seccion')                      ->middleware('can:linkiubuild.editar');
        Route::post('/quienes-somos/cta',                  [LinkiuBuildController::class, 'saveQuienesCtaConfig']         )->name('quienes-somos.cta.config')                   ->middleware('can:linkiubuild.editar');
        Route::get('/contacto',                            [LinkiuBuildController::class, 'contacto']                    )->name('contacto')                                   ->middleware('can:linkiubuild.ver');
        Route::post('/contacto/hero',                      [LinkiuBuildController::class, 'saveContactoHeroConfig']       )->name('contacto.hero.config')                       ->middleware('can:linkiubuild.editar');
        Route::post('/contacto/cards',                     [LinkiuBuildController::class, 'saveContactoCardsConfig']      )->name('contacto.cards.config')                      ->middleware('can:linkiubuild.editar');
        Route::post('/contacto/form',                      [LinkiuBuildController::class, 'saveContactoFormConfig']       )->name('contacto.form.config')                       ->middleware('can:linkiubuild.editar');
        Route::post('/contacto/seccion',                   [LinkiuBuildController::class, 'toggleSeccionContacto']        )->name('contacto.seccion')                           ->middleware('can:linkiubuild.editar');
        Route::get('/widgets',  [LinkiuBuildController::class, 'widgets']      )->name('widgets')        ->middleware('can:linkiubuild.ver');
        Route::post('/widgets', [LinkiuBuildController::class, 'updateWidgets'])->name('widgets.update') ->middleware('can:linkiubuild.editar');
    });

    // Roles y permisos
    Route::get('/roles',                            [RolesController::class, 'index'])->name('roles.index')->middleware('can:roles.ver');
    Route::post('/roles',                           [RolesController::class, 'store'])->name('roles.store')->middleware('can:roles.crear');
    Route::post('/roles/{role}/permissions/toggle', [RolesController::class, 'togglePermission'])->name('roles.toggle-permission')->middleware('can:roles.editar');
    Route::delete('/roles/{role}',                  [RolesController::class, 'destroy'])->name('roles.destroy')->middleware('can:roles.eliminar');

});
