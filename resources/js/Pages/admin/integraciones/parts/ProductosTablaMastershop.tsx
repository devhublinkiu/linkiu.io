import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Link, Unlink, Package } from 'lucide-react'
import { Button } from '@/Components/ui/Button'
import { Empty } from '@/Components/ui/Empty'

export interface GrupoVariante {
    id:     number
    nombre: string
    items:  Array<{
        id:                     number
        nombre:                 string
        mastershop_id_variant:  number | null
    }>
}

export interface ProductoMastershop {
    id:                     number
    nombre:                 string
    sku:                    string | null
    slug:                   string | null
    status:                 string
    mastershop_id_product:  number | null
    mastershop_id_variant:  number | null
    tiene_variantes:        boolean
    variantes_vinculadas:   number
    variantes_total:        number
    grupos_variantes:       GrupoVariante[]
}

interface Props {
    productos:         ProductoMastershop[]
    apiKeyConfigurada: boolean
    puedeVincular:     boolean
    onVincular:        (p: ProductoMastershop) => void
}

export default function ProductosTablaMastershop({ productos, apiKeyConfigurada, puedeVincular, onVincular }: Props) {

    function desvincular(p: ProductoMastershop) {
        if (! confirm(`¿Desvincular "${p.nombre}" de Mastershop?\n\nSe perderán también los mapeos de variantes.`)) return
        router.delete(route('admin.integraciones.mastershop.desvincular', p.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Vinculación eliminada'),
            onError:   () => toast.error('Error al desvincular'),
        })
    }

    if (productos.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-12">
                <Empty
                    icon={Package}
                    title="No hay productos creados todavía"
                    description="Creá productos primero para poder vincularlos con Mastershop."
                />
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">

            <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-sm font-bold text-slate-900">Productos Linkiu</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    {productos.filter(p => p.mastershop_id_product !== null).length} de {productos.length} vinculados
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="text-left px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Producto</th>
                            <th className="text-left px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">SKU</th>
                            <th className="text-left px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Estado</th>
                            <th className="text-right px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.map(p => (
                            <FilaProducto
                                key={p.id}
                                producto={p}
                                puedeVincular={puedeVincular}
                                apiKeyConfigurada={apiKeyConfigurada}
                                onVincular={() => onVincular(p)}
                                onDesvincular={() => desvincular(p)}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    )
}

function FilaProducto({
    producto, puedeVincular, apiKeyConfigurada, onVincular, onDesvincular,
}: {
    producto:          ProductoMastershop
    puedeVincular:     boolean
    apiKeyConfigurada: boolean
    onVincular:        () => void
    onDesvincular:     () => void
}) {
    const vinculado = producto.mastershop_id_product !== null
    const variantesIncompletas = producto.tiene_variantes
        && producto.variantes_vinculadas < producto.variantes_total

    return (
        <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors duration-200">
            <td className="px-6 py-3.5">
                <p className="font-medium text-slate-900">{producto.nombre}</p>
                {producto.tiene_variantes && (
                    <p className="text-xs text-slate-500 mt-0.5">
                        {producto.variantes_total} variante{producto.variantes_total !== 1 ? 's' : ''}
                    </p>
                )}
            </td>
            <td className="px-6 py-3.5">
                <span className="text-xs text-slate-500 font-mono">{producto.sku ?? '—'}</span>
            </td>
            <td className="px-6 py-3.5">
                {!vinculado && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5">
                        Sin vincular
                    </span>
                )}
                {vinculado && variantesIncompletas && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                        Vinculado · {producto.variantes_vinculadas}/{producto.variantes_total} variantes
                    </span>
                )}
                {vinculado && !variantesIncompletas && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                        Vinculado
                    </span>
                )}
            </td>
            <td className="px-6 py-3.5 text-right">
                {puedeVincular && (
                    <div className="inline-flex items-center gap-1.5">
                        <Button variant="outline" size="sm" onClick={onVincular}>
                            <Link className="w-3.5 h-3.5 mr-1" />
                            {vinculado ? 'Editar' : 'Vincular'}
                        </Button>
                        {vinculado && (
                            <Button variant="outline" size="sm" onClick={onDesvincular} className="text-red-600 hover:text-red-700">
                                <Unlink className="w-3.5 h-3.5" />
                            </Button>
                        )}
                    </div>
                )}
                {!apiKeyConfigurada && !vinculado && (
                    <span className="text-xs text-slate-400">Configurá la API primero</span>
                )}
            </td>
        </tr>
    )
}
