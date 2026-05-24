<?php

namespace Tests\Unit\Support\Productos;

use App\Support\Productos\HookConfigValidator;
use Illuminate\Validation\ValidationException;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class HookConfigValidatorTest extends TestCase
{
    private HookConfigValidator $validador;

    protected function setUp(): void
    {
        parent::setUp();
        $this->validador = new HookConfigValidator;
    }

    // ─────────────────────────────────────────────────────────────────
    // HOOKS SIMPLES (sin config)
    // ─────────────────────────────────────────────────────────────────

    #[DataProvider('hooksSimples')]
    public function test_hooks_simples_no_validan_nada(string $hookKey): void
    {
        // Aunque pasen config basura, retorna [] sin error.
        $resultado = $this->validador->validar($hookKey, ['cualquier_cosa' => 'aqui']);
        $this->assertSame([], $resultado);
    }

    public static function hooksSimples(): array
    {
        return [
            'resenas_en_vivo'   => ['resenas_en_vivo'],
            'oferta_relampago'  => ['oferta_relampago'],
            'ratings_card'      => ['ratings_card'],
        ];
    }

    public function test_hook_desconocido_lanza_validation_exception(): void
    {
        $this->expectException(ValidationException::class);
        $this->validador->validar('hook_inexistente', []);
    }

    // ─────────────────────────────────────────────────────────────────
    // QUE_INCLUYE
    // ─────────────────────────────────────────────────────────────────

    public function test_que_incluye_acepta_config_valida(): void
    {
        $config = [
            'titulo' => 'Kit completo',
            'items'  => [
                ['icono' => 'check', 'texto' => 'Producto 100ml'],
                ['icono' => 'check', 'texto' => 'Manual de uso'],
            ],
        ];
        $this->assertSame($config, $this->validador->validar('que_incluye', $config));
    }

    public function test_que_incluye_rechaza_mas_de_8_items(): void
    {
        $this->expectException(ValidationException::class);
        $items = array_fill(0, 9, ['icono' => 'check', 'texto' => 'x']);
        $this->validador->validar('que_incluye', ['items' => $items]);
    }

    public function test_que_incluye_rechaza_item_sin_texto(): void
    {
        $this->expectException(ValidationException::class);
        $this->validador->validar('que_incluye', [
            'items' => [['icono' => 'check', 'texto' => '']],
        ]);
    }

    // ─────────────────────────────────────────────────────────────────
    // SELLOS_CONFIANZA
    // ─────────────────────────────────────────────────────────────────

    public function test_sellos_confianza_acepta_valido(): void
    {
        $config = [
            'sellos' => [
                ['icono' => 'shield-check', 'titulo' => 'Envío gratis', 'sub' => 'A todo el país'],
            ],
        ];
        $this->assertSame($config, $this->validador->validar('sellos_confianza', $config));
    }

    public function test_sellos_confianza_rechaza_mas_de_3(): void
    {
        $this->expectException(ValidationException::class);
        $sellos = array_fill(0, 4, ['icono' => 'shield-check', 'titulo' => 'x']);
        $this->validador->validar('sellos_confianza', ['sellos' => $sellos]);
    }

    // ─────────────────────────────────────────────────────────────────
    // GANCHO_PROMESA
    // ─────────────────────────────────────────────────────────────────

    public function test_gancho_promesa_requiere_promesa(): void
    {
        $this->expectException(ValidationException::class);
        $this->validador->validar('gancho_promesa', [
            'promesa' => '',
            'stats'   => [],
        ]);
    }

    public function test_gancho_promesa_acepta_valido(): void
    {
        $config = [
            'dolor'       => 'Cansado de gastar mucho',
            'promesa'     => 'Lo resuelve en casa',
            'descripcion' => 'En 1 hora.',
            'stats'       => [['icono' => 'star', 'valor' => '+10k', 'sub' => 'clientes']],
        ];
        $this->assertSame($config, $this->validador->validar('gancho_promesa', $config));
    }

    // ─────────────────────────────────────────────────────────────────
    // BADGE_PRODUCTO (color regex)
    // ─────────────────────────────────────────────────────────────────

    public function test_badge_producto_acepta_hex_valido(): void
    {
        $config = ['texto' => 'Nuevo', 'color' => '#10b981'];
        $this->assertSame($config, $this->validador->validar('badge_producto', $config));
    }

    public function test_badge_producto_rechaza_color_basura(): void
    {
        $this->expectException(ValidationException::class);
        $this->validador->validar('badge_producto', [
            'texto' => 'Nuevo',
            'color' => 'red; injection',
        ]);
    }

    public function test_badge_producto_rechaza_color_sin_hash(): void
    {
        $this->expectException(ValidationException::class);
        $this->validador->validar('badge_producto', [
            'texto' => 'Nuevo',
            'color' => '10b981',
        ]);
    }

    public function test_badge_producto_rechaza_texto_largo(): void
    {
        $this->expectException(ValidationException::class);
        $this->validador->validar('badge_producto', [
            'texto' => str_repeat('A', 31),
            'color' => '#10b981',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────
    // URGENCIA_STOCK (coherencia stock_restante <= stock_total)
    // ─────────────────────────────────────────────────────────────────

    public function test_urgencia_stock_acepta_coherente(): void
    {
        $config = ['stock_total' => 50, 'stock_restante' => 12, 'duracion_horas' => 8];
        $this->assertSame($config, $this->validador->validar('urgencia_stock', $config));
    }

    public function test_urgencia_stock_rechaza_restante_mayor_que_total(): void
    {
        $this->expectException(ValidationException::class);
        try {
            $this->validador->validar('urgencia_stock', [
                'stock_total'    => 10,
                'stock_restante' => 50,
                'duracion_horas' => 8,
            ]);
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('stock_restante', $e->errors());
            $this->assertStringContainsString('mayor', $e->errors()['stock_restante'][0]);
            throw $e;
        }
    }

    public function test_urgencia_stock_rechaza_duracion_excesiva(): void
    {
        $this->expectException(ValidationException::class);
        $this->validador->validar('urgencia_stock', [
            'stock_total'    => 50,
            'stock_restante' => 12,
            'duracion_horas' => 200,  // > 72
        ]);
    }

    // ─────────────────────────────────────────────────────────────────
    // SLIDER_IMAGENES y GALERIA_RESULTADOS (mismo shape)
    // ─────────────────────────────────────────────────────────────────

    public function test_slider_imagenes_acepta_valido(): void
    {
        $config = [
            'imagenes' => [
                ['url' => 'https://s3/x.webp', 'ruta' => 'productos/1/hooks/slider_imagenes/x.webp'],
            ],
        ];
        $this->assertSame($config, $this->validador->validar('slider_imagenes', $config));
    }

    public function test_slider_imagenes_rechaza_mas_de_8(): void
    {
        $this->expectException(ValidationException::class);
        $imagenes = array_fill(0, 9, ['url' => 'x', 'ruta' => 'x']);
        $this->validador->validar('slider_imagenes', ['imagenes' => $imagenes]);
    }

    // ─────────────────────────────────────────────────────────────────
    // COMPARACION_VISUAL (ambas imágenes requeridas)
    // ─────────────────────────────────────────────────────────────────

    public function test_comparacion_visual_acepta_valido(): void
    {
        $config = [
            'titulo'         => 'Antes y después',
            'imagen_antes'   => ['url' => 'a', 'ruta' => 'a'],
            'imagen_despues' => ['url' => 'b', 'ruta' => 'b'],
        ];
        $this->assertSame($config, $this->validador->validar('comparacion_visual', $config));
    }

    public function test_comparacion_visual_rechaza_falta_imagen(): void
    {
        $this->expectException(ValidationException::class);
        $this->validador->validar('comparacion_visual', [
            'imagen_antes' => ['url' => 'a', 'ruta' => 'a'],
        ]);
    }

    // ─────────────────────────────────────────────────────────────────
    // RESENAS_CLIENTES (rating 1-5)
    // ─────────────────────────────────────────────────────────────────

    public function test_resenas_clientes_acepta_valido(): void
    {
        $config = [
            'titulo'  => 'Lo que dicen',
            'resenas' => [
                ['nombre' => 'María', 'ciudad' => 'Bogotá', 'estrellas' => 5, 'comentario' => 'Excelente'],
            ],
        ];
        $this->assertSame($config, $this->validador->validar('resenas_clientes', $config));
    }

    public function test_resenas_clientes_rechaza_rating_invalido(): void
    {
        $this->expectException(ValidationException::class);
        $this->validador->validar('resenas_clientes', [
            'resenas' => [
                ['nombre' => 'María', 'estrellas' => 7, 'comentario' => 'x'],
            ],
        ]);
    }

    public function test_resenas_clientes_rechaza_mas_de_15(): void
    {
        $this->expectException(ValidationException::class);
        $resenas = array_fill(0, 16, ['nombre' => 'x', 'estrellas' => 5, 'comentario' => 'x']);
        $this->validador->validar('resenas_clientes', ['resenas' => $resenas]);
    }

    // ─────────────────────────────────────────────────────────────────
    // FAQ
    // ─────────────────────────────────────────────────────────────────

    public function test_faq_acepta_valido(): void
    {
        $config = [
            'faqs' => [
                ['pregunta' => '¿Es seguro?', 'respuesta' => 'Sí, completamente.'],
            ],
        ];
        $this->assertSame($config, $this->validador->validar('preguntas_frecuentes', $config));
    }

    public function test_faq_rechaza_mas_de_10(): void
    {
        $this->expectException(ValidationException::class);
        $faqs = array_fill(0, 11, ['pregunta' => 'q', 'respuesta' => 'a']);
        $this->validador->validar('preguntas_frecuentes', ['faqs' => $faqs]);
    }

    // ─────────────────────────────────────────────────────────────────
    // SANITIZACIÓN: campos no definidos se eliminan
    // ─────────────────────────────────────────────────────────────────

    public function test_validar_descarta_campos_no_definidos(): void
    {
        $config = [
            'texto'           => 'Nuevo',
            'color'           => '#10b981',
            'campo_inyectado' => '<script>alert(1)</script>',
        ];
        $sanitizado = $this->validador->validar('badge_producto', $config);

        $this->assertArrayHasKey('texto', $sanitizado);
        $this->assertArrayHasKey('color', $sanitizado);
        $this->assertArrayNotHasKey('campo_inyectado', $sanitizado);
    }

    // ─────────────────────────────────────────────────────────────────
    // HOOKS RESTANTES: smoke test que aceptan config mínima válida
    // ─────────────────────────────────────────────────────────────────

    public function test_tabla_comparativa_acepta_valido(): void
    {
        $config = [
            'titulo'    => 'Comparativa',
            'columnas'  => ['Nuestro', 'Rival'],
            'filas'     => [
                ['caracteristica' => 'Precio', 'valores' => ['$50', '$80']],
            ],
        ];
        $this->assertSame($config, $this->validador->validar('tabla_comparativa', $config));
    }

    public function test_ficha_tecnica_acepta_valido(): void
    {
        $config = [
            'titulo'    => 'Ficha técnica',
            'specs'     => [['nombre' => 'Peso', 'valor' => '100g']],
            'sin_lista' => ['Amoníaco', 'Parabenos'],
        ];
        $this->assertSame($config, $this->validador->validar('ficha_tecnica', $config));
    }

    public function test_caracteristicas_destacadas_acepta_valido(): void
    {
        $config = [
            'titulo' => 'Por qué este producto',
            'items'  => [['icono' => 'star', 'titulo' => 'Natural', 'descripcion' => '100%']],
        ];
        $this->assertSame($config, $this->validador->validar('caracteristicas_destacadas', $config));
    }

    public function test_como_funciona_acepta_valido(): void
    {
        $config = [
            'titulo' => 'Cómo funciona',
            'pasos'  => [['titulo' => 'Aplica', 'descripcion' => 'Sobre el cabello']],
        ];
        $this->assertSame($config, $this->validador->validar('como_funciona', $config));
    }

    public function test_garantia_acepta_valido(): void
    {
        $config = [
            'icono'       => 'shield-check',
            'titulo'      => 'Garantía 15 días',
            'descripcion' => 'Si no quedas satisfecho, te devolvemos tu dinero.',
        ];
        $this->assertSame($config, $this->validador->validar('garantia', $config));
    }
}
