/**
 * Tipos compartidos por los 4 componentes de performance.
 * Espejo TypeScript de los DTOs PHP en App\Support\Producto.
 */

export type SenalKey =
    | 'zombie'
    | 'pitch_flojo'
    | 'sin_trafico'
    | 'lanzamiento'
    | 'trending'
    | 'caballo'

export interface Senal {
    key:         SenalKey
    emoji:       string
    label:       string
    descripcion: string
}

export interface Tendencia {
    direccion: 'up' | 'down' | 'neutral'
    pct:       number
}

export interface PerformanceDebug {
    ventas_7d:        number
    vistas_7d:        number
    vistas_30d:       number
    ventas_total:     number
    scroll_promedio:  number
    conversion_rate:  number
    revenue_7d:       number
    p75_ventas_7d:    number
    p75_vistas_7d:    number
    dias_creacion:    number
    catalogo_pequeno: boolean
}
