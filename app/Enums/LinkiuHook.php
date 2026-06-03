<?php

namespace App\Enums;

enum LinkiuHook: string
{
    // Vista individual
    case ResenasEnVivo       = 'resenas_en_vivo';
    case QueIncluye          = 'que_incluye';
    case UrgenciaStock       = 'urgencia_stock';
    case SellosConfianza     = 'sellos_confianza';
    case GanchoPromesa       = 'gancho_promesa';
    case SliderImagenes      = 'slider_imagenes';
    case TablaComparativa    = 'tabla_comparativa';
    case ComparacionVisual   = 'comparacion_visual';
    case FichaTecnica        = 'ficha_tecnica';
    case CaracteristicasDestacadas = 'caracteristicas_destacadas';
    case ComoFunciona        = 'como_funciona';
    case TransformacionPasos = 'transformacion_pasos';
    case ImagenPromesa       = 'imagen_promesa';
    case ImagenIntermedia    = 'imagen_intermedia';
    case ImagenCierre        = 'imagen_cierre';
    case ResenasImagen       = 'resenas_imagen';
    case ResenasClientes     = 'resenas_clientes';
    case GaleriaResultados   = 'galeria_resultados';
    case Garantia            = 'garantia';
    case PreguntasFrecuentes = 'preguntas_frecuentes';
    case BotonCompra         = 'boton_compra';

    // Vista card
    case OfertaRelampago     = 'oferta_relampago';
    case BadgeProducto       = 'badge_producto';
    case RatingsCard         = 'ratings_card';

    public function label(): string
    {
        return match($this) {
            self::ResenasEnVivo            => 'Reseñas en vivo',
            self::QueIncluye               => 'Qué incluye',
            self::UrgenciaStock            => 'Urgencia de stock',
            self::SellosConfianza          => 'Sellos de confianza',
            self::GanchoPromesa            => 'Gancho de promesa',
            self::SliderImagenes           => 'Slider de imágenes',
            self::TablaComparativa         => 'Tabla comparativa',
            self::ComparacionVisual        => 'Comparación visual',
            self::FichaTecnica             => 'Ficha técnica',
            self::CaracteristicasDestacadas => 'Características destacadas',
            self::ComoFunciona             => 'Cómo funciona',
            self::TransformacionPasos      => 'Transformación en pasos',
            self::ImagenPromesa            => 'Imagen — promesa',
            self::ImagenIntermedia         => 'Imagen — intermedia',
            self::ImagenCierre             => 'Imagen — cierre',
            self::ResenasImagen            => 'Reseñas por imagen',
            self::ResenasClientes          => 'Reseñas de clientes',
            self::GaleriaResultados        => 'Galería de resultados',
            self::Garantia                 => 'Garantía',
            self::PreguntasFrecuentes      => 'Preguntas frecuentes',
            self::BotonCompra              => 'Botón de compra',
            self::OfertaRelampago          => 'Oferta relámpago',
            self::BadgeProducto            => 'Badge de producto',
            self::RatingsCard              => 'Ratings en card',
        };
    }

    public function tipo(): string
    {
        return match($this) {
            self::ResenasEnVivo,
            self::OfertaRelampago,
            self::RatingsCard    => 'simple',
            default              => 'configurable',
        };
    }

    public function descripcion(): string
    {
        return match($this) {
            self::ResenasEnVivo            => 'Contador animado de reseñas antes del nombre del producto.',
            self::QueIncluye               => 'Lista de ítems incluidos con íconos. Máx. 8.',
            self::UrgenciaStock            => 'Barra de stock animada con countdown. Genera urgencia psicológica.',
            self::SellosConfianza          => 'Sellos de confianza con ícono, título y subtítulo. Máx. 3.',
            self::GanchoPromesa            => 'Bloque de dolor + promesa + stats. Sección oscura de conversión.',
            self::SliderImagenes           => 'Carrusel de imágenes propias del producto.',
            self::TablaComparativa         => 'Tabla producto vs. rival con filas texto o booleano. Máx. 6 filas.',
            self::ComparacionVisual        => 'Slider arrastrable antes/después con dos imágenes.',
            self::FichaTecnica             => 'Componentes principales + lista de lo que no contiene.',
            self::CaracteristicasDestacadas => 'Cards con ícono, descripción y tags por característica. Máx. 4.',
            self::ComoFunciona             => 'Timeline de pasos con ícono, descripción y nota. Máx. 4.',
            self::TransformacionPasos      => 'Grid de tarjetas con pasos numerados. Variante visual de Cómo funciona. Máx. 4.',
            self::ImagenPromesa            => 'Imagen estática con link opcional. Ideal para banner de promesa.',
            self::ImagenIntermedia         => 'Imagen estática con link opcional. Ideal entre bloques densos.',
            self::ImagenCierre             => 'Imagen estática con link opcional. Ideal antes del CTA final.',
            self::ResenasImagen            => 'Slider de capturas de reseñas. Alto adaptable a cada imagen. Máx. 10.',
            self::ResenasClientes          => 'Slider de reseñas con rating automático calculado. Máx. 15.',
            self::GaleriaResultados        => 'Slider 9:16 de fotos de resultados reales, chats y testimonios visuales.',
            self::Garantia                 => 'Bloque de garantía con título, descripción y botón.',
            self::PreguntasFrecuentes      => 'Acordeón de preguntas y respuestas. Máx. 10.',
            self::BotonCompra              => 'Personaliza el botón principal: texto, emoji, colores sólido o gradiente, mostrar total.',
            self::OfertaRelampago          => 'Strip naranja con countdown en la card del producto.',
            self::BadgeProducto            => 'Chip de texto sobre la imagen de la card.',
            self::RatingsCard              => 'Estrellas y conteo en la card, tomado de Reseñas de clientes.',
        };
    }

    public function vista(): string
    {
        return match($this) {
            self::OfertaRelampago,
            self::BadgeProducto,
            self::RatingsCard => 'card',
            default           => 'individual',
        };
    }

    public static function catalogo(): array
    {
        return array_map(fn ($hook) => [
            'key'         => $hook->value,
            'label'       => $hook->label(),
            'tipo'        => $hook->tipo(),
            'descripcion' => $hook->descripcion(),
            'vista'       => $hook->vista(),
        ], self::cases());
    }
}
