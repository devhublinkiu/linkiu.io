<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Server Side Rendering
    |--------------------------------------------------------------------------
    |
    | Cuando 'enabled' es true, Inertia hace un POST interno al Node SSR
    | corriendo en 'url' para renderizar el componente antes de mandar el HTML
    | al browser. Se cae graciosamente al modo cliente si el Node esta caido.
    |
    | El bundle SSR vive en bootstrap/ssr/ssr.js y se compila con `pnpm build`.
    | El proceso Node se levanta con `node bootstrap/ssr/ssr.js` — en
    | produccion se gestiona via Daemon de Forge (Supervisor por debajo).
    |
    */

    'ssr' => [
        'enabled' => env('INERTIA_SSR_ENABLED', false),
        'url'     => env('INERTIA_SSR_URL', 'http://127.0.0.1:13714'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Testing
    |--------------------------------------------------------------------------
    |
    | Configuracion default de Inertia para Pest/PHPUnit.
    |
    */

    'testing' => [
        'ensure_pages_exist' => true,
        'page_paths' => [
            resource_path('js/Pages'),
        ],
        'page_extensions' => [
            'js',
            'jsx',
            'svelte',
            'ts',
            'tsx',
            'vue',
        ],
    ],

];
