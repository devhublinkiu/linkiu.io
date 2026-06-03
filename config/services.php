<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'mercadopago' => [
        'public_key'     => env('VITE_MP_PUBLIC_KEY'),
        'access_token'   => env('MP_ACCESS_TOKEN'),
        'webhook_secret' => env('MP_WEBHOOK_SECRET'),
    ],

    'maxmind' => [
        'license_key' => env('MAXMIND_LICENSE_KEY'),
    ],

    'mipaquete' => [
        'base_url'        => env('MIPAQUETE_BASE_URL', 'https://api-v2.mpr.mipaquete.com'),
        // El session-tracker es público y aparece literal en la documentación
        // Postman de Mipaquete. Aceptado por la API mientras el JWT (apikey)
        // sea válido. Si Mipaquete cambia esta política, sobreescribir vía env.
        'session_tracker' => env('MIPAQUETE_SESSION_TRACKER', 'a0c96ea6-b22d-4fb7-a278-850678d5429c'),
        'timeout'         => (int) env('MIPAQUETE_TIMEOUT', 15),
        'cache_ttl'       => (int) env('MIPAQUETE_CACHE_TTL', 86400),

        // Presets de paquete promedio para cotizar — el admin elige uno como
        // referencia para los rangos sugeridos en el modal de zonas.
        'presets'         => [
            'sobre' => [
                'label'         => 'Sobre / Documentos',
                'weight'        => 1,        // Mipaquete cobra mínimo 1 kg
                'height'        => 2,
                'width'         => 20,
                'length'        => 25,
                'declaredValue' => 30000,
            ],
            'pequeno' => [
                'label'         => 'Paquete pequeño',
                'weight'        => 1,
                'height'        => 10,
                'width'         => 20,
                'length'        => 30,
                'declaredValue' => 50000,
            ],
            'mediano' => [
                'label'         => 'Paquete mediano',
                'weight'        => 3,
                'height'        => 20,
                'width'         => 30,
                'length'        => 40,
                'declaredValue' => 80000,
            ],
            'grande' => [
                'label'         => 'Paquete grande',
                'weight'        => 8,
                'height'        => 30,
                'width'         => 40,
                'length'        => 60,
                'declaredValue' => 150000,
            ],
            'xl' => [
                'label'         => 'Paquete XL',
                'weight'        => 15,
                'height'        => 40,
                'width'         => 60,
                'length'        => 80,
                'declaredValue' => 300000,
            ],
        ],
    ],

];
