<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\Producto;
use App\Models\ProductoCantidad;
use App\Models\ProductoHook;
use App\Models\ProductoImagen;
use App\Models\VariableGrupo;
use App\Models\VariableItem;
use App\Observers\ProductosCacheObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Super-admin bypasa todos los gates de permisos
        Gate::before(function ($user, $ability) {
            if ($user->hasRole('super-admin')) {
                return true;
            }
        });

        // Rate limit del login cliente: 5 intentos por minuto por email+IP.
        // Frena password spraying sin afectar admin (que tiene su propio lockout
        // basado en columnas login_attempts/blocked_until vía LoginAdmin Action).
        RateLimiter::for('client-login', function (Request $request) {
            $email = strtolower((string) $request->input('email'));

            return Limit::perMinute(5)->by($email . '|' . $request->ip());
        });

        // Rate limit del checkout MercadoPago: 10 intentos por minuto por
        // email+IP. Frena spam de pagos con tarjetas inválidas (que
        // dejarían cientos de rows basura con mp_status='rejected') sin
        // afectar clientes legítimos que reintenten 2-3 veces.
        RateLimiter::for('mp-pagar', function (Request $request) {
            $email = strtolower((string) $request->input('order.email', ''));

            return Limit::perMinute(10)->by($email . '|' . $request->ip());
        });

        // Rate limit de creación/reenvío de invitaciones admin: 10/min
        // por user admin actual. Frena spam de creación de cuentas o
        // flood de Resend si un admin malicioso (o comprometido) abusa.
        RateLimiter::for('admin-crear-usuario', function (Request $request) {
            return Limit::perMinute(10)->by((string) auth()->id() . '|' . $request->ip());
        });

        // Rate limit de actualización de perfil personal: 10/min por user_id.
        // Defensa contra bruteforce de password_actual desde sesión robada —
        // sin esto, un atacante con cookie válida podría tirar miles de
        // intentos contra current_password (Hash::check es lento pero no
        // suficiente sin throttle). Combinado con logoutOtherDevices en la
        // Action, cierra el vector de escalada a takeover.
        RateLimiter::for('perfil-update', function (Request $request) {
            return Limit::perMinute(10)->by((string) auth()->id() . '|' . $request->ip());
        });

        // Invalidación de cache público de productos en cualquier cambio
        // del agregado producto, sus relaciones o categorías.
        foreach ([
            Producto::class,
            ProductoImagen::class,
            ProductoHook::class,
            ProductoCantidad::class,
            VariableGrupo::class,
            VariableItem::class,
            Category::class,
        ] as $modelo) {
            $modelo::observe(ProductosCacheObserver::class);
        }
    }
}
