<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        {{-- La fuente real (Plus Jakarta Sans) se sirve autohostada vía Vite
             con font-display: swap. No cargamos Figtree de bunny.net porque no
             se usa en el proyecto — ahorra un roundtrip externo de ~200ms. --}}

        {{-- Preload de la imagen LCP en páginas de producto. El <Head> de Inertia
             no emite <link as="image"> al HTML inicial; emitirlo desde Blade
             garantiza que el navegador descubra la imagen antes de montar React. --}}
        @php
            $lcpImage = data_get($page, 'props.imagen_principal');
        @endphp
        @if ($lcpImage)
            <link rel="preload" as="image" href="{{ $lcpImage }}" fetchpriority="high">
        @endif

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
