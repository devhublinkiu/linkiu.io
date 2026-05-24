// Tipos compartidos por Index.tsx, ZonaDialog.tsx y todos los parts/.
// Mirror del modelo App\Models\ZonaEnvio tal como llega vía Inertia.

export interface Ciudad {
    id: number
    nombre: string
}

export interface DepartamentoSeleccionado {
    id: number
    nombre: string
    ciudades: Ciudad[]
}

export interface ZonaEnvio {
    id: number
    nombre: string
    departamentos: DepartamentoSeleccionado[]
    tipo_costo: 'gratis' | 'costo_fijo' | 'gratis_desde'
    costo: number | null
    umbral_gratis: number | null
    activo: boolean
    orden: number
}

// Shape de la API externa (api-colombia.com) proxyeada por nuestro endpoint
// /admin/envio/colombia-data. Mantenemos camelCase porque así viene del proxy.
export interface DptoApi {
    id: number
    name: string
}

export interface CiudadApi {
    id: number
    name: string
    departmentId: number
}

export type TipoCosto = ZonaEnvio['tipo_costo']
