// Tipo compartido entre Index.tsx y las cards de parts/.
// Mirror del modelo App\Models\MetodoPago tal como llega vía Inertia.
export interface MetodoPago {
    id:          number
    clave:       string
    nombre:      string
    descripcion: string
    activo:      boolean
    orden:       number
    config:      Record<string, unknown> | null
}
