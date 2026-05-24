<?php

namespace App\Enums;

/**
 * Señal cualitativa de performance de un producto.
 *
 * Cada caso representa un patrón detectable que sugiere una acción
 * concreta al admin. El service `ProductoPerformance::detectarSenal`
 * evalúa los casos en orden de prioridad (orden de declaración) y
 * retorna el primero que matchee — al ser exclusivos en presentación.
 */
enum ProductoSenal: string
{
    case Zombie      = 'zombie';
    case PitchFlojo  = 'pitch_flojo';
    case SinTrafico  = 'sin_trafico';
    case Lanzamiento = 'lanzamiento';
    case Trending    = 'trending';
    case Caballo     = 'caballo';

    public function emoji(): string
    {
        return match ($this) {
            self::Zombie      => '💤',
            self::PitchFlojo  => '📉',
            self::SinTrafico  => '🚨',
            self::Lanzamiento => '🚀',
            self::Trending    => '🔥',
            self::Caballo     => '💎',
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Zombie      => 'Zombie',
            self::PitchFlojo  => 'Pitch flojo',
            self::SinTrafico  => 'Sin tráfico',
            self::Lanzamiento => 'Lanzamiento',
            self::Trending    => 'Trending',
            self::Caballo     => 'Caballo',
        };
    }

    public function descripcion(): string
    {
        return match ($this) {
            self::Zombie      => 'Sin ventas hace más de 60 días y casi sin visitas. Considerar archivar o relanzar con cambios.',
            self::PitchFlojo  => 'Recibe muchas visitas pero casi nadie compra. Revisar título, precio, fotos o copy.',
            self::SinTrafico  => 'Casi nadie ve este producto. Falta exposición — categoría, SEO o marketing.',
            self::Lanzamiento => 'Producto nuevo que ya está convirtiendo. Subirlo a destacado para escalar.',
            self::Trending    => 'Ventas creciendo de forma significativa. Asegurar stock y escalar pauta.',
            self::Caballo     => 'Top performer estable del catálogo. No tocar lo que funciona.',
        };
    }

    public function toArray(): array
    {
        return [
            'key'         => $this->value,
            'emoji'       => $this->emoji(),
            'label'       => $this->label(),
            'descripcion' => $this->descripcion(),
        ];
    }
}
