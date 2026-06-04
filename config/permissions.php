<?php

/**
 * Definición de permisos por módulo.
 *
 * Regla: todo módulo nuevo debe registrarse aquí con sus acciones antes de salir a producción.
 * Después de agregar un módulo, correr: php artisan db:seed --class=PermissionsSeeder
 */
return [

    'categorias' => [
        'label'   => 'Categorías',
        'actions' => [
            'ver'      => 'Ver',
            'crear'    => 'Crear',
            'editar'   => 'Editar',
            'eliminar' => 'Eliminar',
        ],
    ],

    'productos' => [
        'label'   => 'Productos',
        'actions' => [
            'ver'      => 'Ver',
            'crear'    => 'Crear',
            'editar'   => 'Editar',
            'eliminar' => 'Eliminar',
        ],
    ],

    'vista_en_vivo' => [
        'label'   => 'Vista en vivo',
        'actions' => [
            'ver' => 'Ver',
        ],
    ],

    'funelinks' => [
        'label'   => 'Funelinks',
        'actions' => [
            'ver' => 'Ver',
        ],
    ],

    'generador_enlaces' => [
        'label'   => 'Generador de enlaces',
        'actions' => [
            'ver' => 'Ver',
        ],
    ],

    'usuarios' => [
        'label'   => 'Usuarios',
        'actions' => [
            'ver'      => 'Ver',
            'crear'    => 'Crear',
            'eliminar' => 'Eliminar',
        ],
    ],

    'roles' => [
        'label'   => 'Roles y permisos',
        'actions' => [
            'ver'      => 'Ver',
            'crear'    => 'Crear',
            'editar'   => 'Editar',
            'eliminar' => 'Eliminar',
        ],
    ],

    'metodos-pago' => [
        'label'   => 'Métodos de pago',
        'actions' => [
            'ver'    => 'Ver',
            'editar' => 'Editar',
        ],
    ],

    'integraciones' => [
        'label'   => 'Integraciones',
        'actions' => [
            'ver'    => 'Ver',
            'editar' => 'Editar',
        ],
    ],

    'envio' => [
        'label'   => 'Métodos de envío',
        'actions' => [
            'ver'    => 'Ver',
            'editar' => 'Editar',
        ],
    ],

    'ordenes' => [
        'label'   => 'Órdenes',
        'actions' => [
            'ver'    => 'Ver',
            'editar' => 'Editar',
        ],
    ],

    'clientes' => [
        'label'   => 'Clientes',
        'actions' => [
            'ver'    => 'Ver',
            'editar' => 'Editar',
        ],
    ],

    'perfil' => [
        'label'   => 'Perfil',
        'actions' => [
            'ver'    => 'Ver',
            'editar' => 'Editar datos personales',
        ],
    ],

    'linkiubuild' => [
        'label'   => 'LinkiuBuild',
        'actions' => [
            'ver'    => 'Ver',
            'editar' => 'Editar',
        ],
    ],

    'blogs' => [
        'label'   => 'Blog',
        'actions' => [
            'ver'      => 'Ver',
            'crear'    => 'Crear',
            'editar'   => 'Editar',
            'eliminar' => 'Eliminar',
        ],
    ],

    'antifraude' => [
        'label'   => 'Antifraude',
        'actions' => [
            'ver'    => 'Ver',
            'editar' => 'Editar reglas y blacklist',
        ],
    ],

    'superadmin' => [
        'label'   => 'Super-admin',
        'actions' => [
            'reset' => 'Resetear datos de campaña y eliminar órdenes',
        ],
    ],

];
