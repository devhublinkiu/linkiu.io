<?php

namespace App\Support\Productos;

use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

/**
 * Validador centralizado de configs por hook_key.
 *
 * Cada hook tiene su array de reglas Laravel + opcionalmente un callback
 * post-validación para chequeos de coherencia entre campos (ej. en
 * urgencia_stock que stock_restante no supere stock_total).
 *
 * Hooks "simples" (resenas_en_vivo, oferta_relampago, ratings_card) no
 * aceptan config — retornan [] sin error.
 *
 * Lanza `ValidationException` ante datos inválidos → Laravel devuelve 422
 * con errores estructurados consumibles por Inertia.
 */
class HookConfigValidator
{
    // ─────────────────────────────────────────────────────────────────
    // Límites — fuente única de verdad para frontend y backend
    // ─────────────────────────────────────────────────────────────────
    public const MAX_QUE_INCLUYE_ITEMS      = 8;
    public const MAX_SELLOS_CONFIANZA       = 3;
    public const MAX_GANCHO_STATS           = 3;
    public const MAX_SLIDER_IMAGENES        = 8;
    public const MAX_TABLA_FILAS            = 6;
    public const MAX_TABLA_COLUMNAS         = 4;
    public const MAX_CARACTERISTICAS        = 4;
    public const MAX_COMO_FUNCIONA_PASOS    = 4;
    public const MAX_RESENAS                = 15;
    public const MAX_GALERIA_IMAGENES       = 10;
    public const MAX_FAQ                    = 10;
    public const MAX_FICHA_SPECS            = 20;
    public const MAX_FICHA_SIN_LISTA        = 20;

    public const MAX_STOCK_TOTAL            = 99999;
    public const MAX_DURACION_HORAS         = 72;

    public const MAX_ICONO_LENGTH           = 50;
    public const MAX_TITULO_CORTO           = 80;
    public const MAX_TEXTO_MEDIANO          = 200;
    public const MAX_TEXTO_LARGO            = 500;
    public const MAX_RUTA_LENGTH            = 300;

    // ─────────────────────────────────────────────────────────────────
    // Reglas Laravel por hook
    // ─────────────────────────────────────────────────────────────────
    private const REGLAS = [
        'que_incluye' => [
            'titulo'         => 'nullable|string|max:80',
            'items'          => 'array|max:'.self::MAX_QUE_INCLUYE_ITEMS,
            'items.*.icono'  => 'required|string|max:'.self::MAX_ICONO_LENGTH,
            'items.*.texto'  => 'required|string|max:120',
        ],
        'sellos_confianza' => [
            'sellos'           => 'array|max:'.self::MAX_SELLOS_CONFIANZA,
            'sellos.*.icono'   => 'required|string|max:'.self::MAX_ICONO_LENGTH,
            'sellos.*.titulo'  => 'required|string|max:'.self::MAX_TITULO_CORTO,
            'sellos.*.sub'     => 'nullable|string|max:'.self::MAX_TITULO_CORTO,
        ],
        'gancho_promesa' => [
            'dolor'            => 'nullable|string|max:'.self::MAX_TEXTO_MEDIANO,
            'promesa'          => 'required|string|max:'.self::MAX_TEXTO_MEDIANO,
            'descripcion'      => 'nullable|string|max:'.self::MAX_TEXTO_LARGO,
            'stats'            => 'array|max:'.self::MAX_GANCHO_STATS,
            'stats.*.icono'    => 'required|string|max:'.self::MAX_ICONO_LENGTH,
            'stats.*.valor'    => 'required|string|max:30',
            'stats.*.sub'      => 'nullable|string|max:'.self::MAX_TITULO_CORTO,
        ],
        'slider_imagenes' => [
            'imagenes'         => 'array|max:'.self::MAX_SLIDER_IMAGENES,
            'imagenes.*.url'   => 'required|string|max:'.self::MAX_RUTA_LENGTH,
            'imagenes.*.ruta'  => 'required|string|max:'.self::MAX_RUTA_LENGTH,
        ],
        'tabla_comparativa' => [
            'titulo'                 => 'required|string|max:'.self::MAX_TITULO_CORTO,
            'subtitulo'              => 'nullable|string|max:'.self::MAX_TEXTO_MEDIANO,
            'columnas'               => 'array|min:2|max:'.self::MAX_TABLA_COLUMNAS,
            'columnas.*'             => 'required|string|max:'.self::MAX_TITULO_CORTO,
            'filas'                  => 'array|max:'.self::MAX_TABLA_FILAS,
            'filas.*.caracteristica' => 'required|string|max:'.self::MAX_TITULO_CORTO,
            'filas.*.valores'        => 'array',
            // valores puede ser string o boolean — se acepta cualquier tipo escalar
        ],
        'comparacion_visual' => [
            'titulo'                => 'nullable|string|max:'.self::MAX_TITULO_CORTO,
            'imagen_antes'          => 'required|array',
            'imagen_antes.url'      => 'required|string|max:'.self::MAX_RUTA_LENGTH,
            'imagen_antes.ruta'     => 'required|string|max:'.self::MAX_RUTA_LENGTH,
            'imagen_despues'        => 'required|array',
            'imagen_despues.url'    => 'required|string|max:'.self::MAX_RUTA_LENGTH,
            'imagen_despues.ruta'   => 'required|string|max:'.self::MAX_RUTA_LENGTH,
        ],
        'ficha_tecnica' => [
            'titulo'            => 'required|string|max:'.self::MAX_TITULO_CORTO,
            'descripcion'       => 'nullable|string|max:'.self::MAX_TEXTO_MEDIANO,
            'specs'             => 'array|max:'.self::MAX_FICHA_SPECS,
            'specs.*.nombre'    => 'required|string|max:'.self::MAX_TITULO_CORTO,
            'specs.*.valor'     => 'required|string|max:'.self::MAX_TEXTO_MEDIANO,
            'sin_lista'         => 'array|max:'.self::MAX_FICHA_SIN_LISTA,
            'sin_lista.*'       => 'required|string|max:'.self::MAX_TITULO_CORTO,
        ],
        'caracteristicas_destacadas' => [
            'titulo'                => 'required|string|max:'.self::MAX_TITULO_CORTO,
            'descripcion'           => 'nullable|string|max:'.self::MAX_TEXTO_MEDIANO,
            'items'                 => 'array|max:'.self::MAX_CARACTERISTICAS,
            'items.*.icono'         => 'required|string|max:'.self::MAX_ICONO_LENGTH,
            'items.*.titulo'        => 'required|string|max:'.self::MAX_TITULO_CORTO,
            'items.*.descripcion'   => 'nullable|string|max:'.self::MAX_TEXTO_MEDIANO,
        ],
        'como_funciona' => [
            'titulo'                => 'required|string|max:'.self::MAX_TITULO_CORTO,
            'descripcion'           => 'nullable|string|max:'.self::MAX_TEXTO_MEDIANO,
            'pasos'                 => 'array|max:'.self::MAX_COMO_FUNCIONA_PASOS,
            'pasos.*.titulo'        => 'required|string|max:'.self::MAX_TITULO_CORTO,
            'pasos.*.descripcion'   => 'nullable|string|max:'.self::MAX_TEXTO_MEDIANO,
        ],
        'resenas_clientes' => [
            'titulo'                => 'nullable|string|max:'.self::MAX_TITULO_CORTO,
            'resenas'               => 'array|max:'.self::MAX_RESENAS,
            'resenas.*.nombre'      => 'required|string|max:80',
            'resenas.*.ciudad'      => 'nullable|string|max:50',
            'resenas.*.estrellas'   => 'required|integer|min:1|max:5',
            'resenas.*.comentario'  => 'required|string|max:'.self::MAX_TEXTO_LARGO,
            'resenas.*.foto_url'    => 'nullable|string|max:'.self::MAX_RUTA_LENGTH,
            'resenas.*.foto_ruta'   => 'nullable|string|max:'.self::MAX_RUTA_LENGTH,
        ],
        'galeria_resultados' => [
            'titulo'           => 'nullable|string|max:'.self::MAX_TITULO_CORTO,
            'imagenes'         => 'array|max:'.self::MAX_GALERIA_IMAGENES,
            'imagenes.*.url'   => 'required|string|max:'.self::MAX_RUTA_LENGTH,
            'imagenes.*.ruta'  => 'required|string|max:'.self::MAX_RUTA_LENGTH,
        ],
        'garantia' => [
            'icono'        => 'required|string|max:'.self::MAX_ICONO_LENGTH,
            'titulo'       => 'required|string|max:'.self::MAX_TEXTO_MEDIANO,
            'descripcion'  => 'required|string|max:'.self::MAX_TEXTO_LARGO,
        ],
        'preguntas_frecuentes' => [
            'titulo'             => 'nullable|string|max:'.self::MAX_TITULO_CORTO,
            'faqs'               => 'array|max:'.self::MAX_FAQ,
            'faqs.*.pregunta'    => 'required|string|max:'.self::MAX_TEXTO_MEDIANO,
            'faqs.*.respuesta'   => 'required|string|max:'.self::MAX_TEXTO_LARGO,
        ],
        'badge_producto' => [
            'texto'  => 'required|string|max:30',
            'color'  => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ],
        'urgencia_stock' => [
            'stock_total'    => 'required|integer|min:1|max:'.self::MAX_STOCK_TOTAL,
            'stock_restante' => 'required|integer|min:1|max:'.self::MAX_STOCK_TOTAL,
            'duracion_horas' => 'required|integer|min:1|max:'.self::MAX_DURACION_HORAS,
        ],
    ];

    /**
     * Mensajes personalizados en español para errores comunes.
     */
    private const MENSAJES = [
        '*.required'   => 'Este campo es obligatorio.',
        '*.string'     => 'Debe ser un texto.',
        '*.array'      => 'Debe ser una lista.',
        '*.integer'    => 'Debe ser un número entero.',
        '*.max'        => 'Excede el tamaño máximo permitido.',
        '*.min'        => 'No alcanza el mínimo requerido.',
        'color.regex'  => 'El color debe ser un código hex válido (ej. #10B981).',
    ];

    /**
     * Hooks "simples" sin configuración — no validar nada.
     */
    private const SIMPLES = ['resenas_en_vivo', 'oferta_relampago', 'ratings_card'];

    /**
     * Valida el config de un hook. Retorna el array sanitizado (solo
     * campos definidos en las reglas). Lanza ValidationException si falla.
     *
     * @throws ValidationException
     */
    public function validar(string $hookKey, array $config): array
    {
        if (in_array($hookKey, self::SIMPLES, true)) {
            return [];
        }

        $reglas = self::REGLAS[$hookKey] ?? null;

        if ($reglas === null) {
            // Hook desconocido — el controller ya hace abort_unless del enum,
            // pero defense in depth: rechazamos cualquier config con error.
            throw ValidationException::withMessages([
                'config' => "Hook desconocido: {$hookKey}",
            ]);
        }

        $validador = Validator::make($config, $reglas, self::MENSAJES);

        // Reglas custom de coherencia entre campos (after-validation hooks).
        $this->aplicarReglasCoherencia($hookKey, $validador);

        return $validador->validate();
    }

    /**
     * Reglas que dependen de varios campos a la vez. Se ejecutan después
     * de que las reglas individuales pasaron.
     */
    private function aplicarReglasCoherencia(string $hookKey, $validador): void
    {
        if ($hookKey === 'urgencia_stock') {
            $validador->after(function ($v) {
                $data = $v->getData();
                $total    = (int) ($data['stock_total'] ?? 0);
                $restante = (int) ($data['stock_restante'] ?? 0);

                if ($restante > $total) {
                    $v->errors()->add(
                        'stock_restante',
                        'El stock restante no puede ser mayor al stock total.',
                    );
                }
            });
        }
    }
}
