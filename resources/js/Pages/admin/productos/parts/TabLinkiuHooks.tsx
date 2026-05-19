import { useMemo, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import HookCard           from './hooks/HookCard'
import ModalQueIncluye    from './hooks/ModalQueIncluye'
import ModalSellosConfianza   from './hooks/ModalSellosConfianza'
import ModalGanchoPromesa     from './hooks/ModalGanchoPromesa'
import ModalSliderImagenes    from './hooks/ModalSliderImagenes'
import ModalTablaComparativa  from './hooks/ModalTablaComparativa'
import ModalComparacionVisual from './hooks/ModalComparacionVisual'
import ModalFichaTecnica      from './hooks/ModalFichaTecnica'
import ModalCaracteristicas   from './hooks/ModalCaracteristicas'
import ModalComoFunciona      from './hooks/ModalComoFunciona'
import ModalResenasClientes   from './hooks/ModalResenasClientes'
import ModalGaleriaResultados from './hooks/ModalGaleriaResultados'
import ModalGarantia          from './hooks/ModalGarantia'
import ModalFaq               from './hooks/ModalFaq'
import ModalBadgeProducto     from './hooks/ModalBadgeProducto'
import ModalUrgenciaStock     from './hooks/ModalUrgenciaStock'
import type { ProductoData, HookCatalogItem, HookData } from '../edit'

interface Props {
    producto: ProductoData
    catalogo: HookCatalogItem[]
}

const SECCIONES = [
    {
        vista:  'individual' as const,
        label:  'Vista individual',
        desc:   'Se muestran en la página de detalle del producto',
    },
    {
        vista:  'card' as const,
        label:  'Vista card',
        desc:   'Se muestran en las tarjetas de listado de productos',
    },
]

export default function TabLinkiuHooks({ producto, catalogo }: Props) {
    const [toggling,    setToggling]    = useState<Set<string>>(new Set())
    const [activeModal, setActiveModal] = useState<string | null>(null)

    const hookState = useMemo(() => {
        const map: Record<string, HookData> = {}
        for (const h of producto.hooks) map[h.key] = h
        return map
    }, [producto.hooks])

    const toggle = (hookKey: string) => {
        const estaActivo = hookState[hookKey]?.activo ?? false
        setToggling(prev => new Set(prev).add(hookKey))
        router.post(
            route('admin.productos.hooks.toggle', { producto: producto.id, hook: hookKey }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success(estaActivo ? 'Hook desactivado' : 'Hook activado'),
                onError:   () => toast.error('Error al cambiar el estado'),
                onFinish: () => setToggling(prev => {
                    const next = new Set(prev)
                    next.delete(hookKey)
                    return next
                }),
            },
        )
    }

    const activeConfig = activeModal ? (hookState[activeModal]?.config ?? null) : null

    return (
        <div className="space-y-8">
            {SECCIONES.map(sec => {
                const items = catalogo.filter(h => h.vista === sec.vista)
                if (items.length === 0) return null
                return (
                    <div key={sec.vista}>
                        <div className="mb-3">
                            <h3 className="text-sm font-medium text-slate-700">{sec.label}</h3>
                            <p className="text-xs text-slate-400">{sec.desc}</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map(item => (
                                <HookCard
                                    key={item.key}
                                    item={item}
                                    activo={hookState[item.key]?.activo ?? false}
                                    toggling={toggling.has(item.key)}
                                    onToggle={() => toggle(item.key)}
                                    onConfigure={
                                        item.tipo === 'configurable'
                                            ? () => setActiveModal(item.key)
                                            : undefined
                                    }
                                />
                            ))}
                        </div>
                    </div>
                )
            })}

            {/* ── Modales ─────────────────────────────────────────────────────── */}
            <ModalQueIncluye
                open={activeModal === 'que_incluye'}
                onClose={() => setActiveModal(null)}
                productoId={producto.id}
                config={activeConfig}
            />
            <ModalSellosConfianza
                open={activeModal === 'sellos_confianza'}
                onClose={() => setActiveModal(null)}
                productoId={producto.id}
                config={activeConfig}
            />
            <ModalGanchoPromesa
                open={activeModal === 'gancho_promesa'}
                onClose={() => setActiveModal(null)}
                productoId={producto.id}
                config={activeConfig}
            />
            <ModalSliderImagenes
                open={activeModal === 'slider_imagenes'}
                onClose={() => setActiveModal(null)}
                productoId={producto.id}
                config={activeConfig}
            />
            <ModalTablaComparativa
                open={activeModal === 'tabla_comparativa'}
                onClose={() => setActiveModal(null)}
                productoId={producto.id}
                config={activeConfig}
            />
            <ModalComparacionVisual
                open={activeModal === 'comparacion_visual'}
                onClose={() => setActiveModal(null)}
                productoId={producto.id}
                config={activeConfig}
            />
            <ModalFichaTecnica
                open={activeModal === 'ficha_tecnica'}
                onClose={() => setActiveModal(null)}
                productoId={producto.id}
                config={activeConfig}
            />
            <ModalCaracteristicas
                open={activeModal === 'caracteristicas_destacadas'}
                onClose={() => setActiveModal(null)}
                productoId={producto.id}
                config={activeConfig}
            />
            <ModalComoFunciona
                open={activeModal === 'como_funciona'}
                onClose={() => setActiveModal(null)}
                productoId={producto.id}
                config={activeConfig}
            />
            <ModalResenasClientes
                open={activeModal === 'resenas_clientes'}
                onClose={() => setActiveModal(null)}
                productoId={producto.id}
                config={activeConfig}
            />
            <ModalGaleriaResultados
                open={activeModal === 'galeria_resultados'}
                onClose={() => setActiveModal(null)}
                productoId={producto.id}
                config={activeConfig}
            />
            <ModalGarantia
                open={activeModal === 'garantia'}
                onClose={() => setActiveModal(null)}
                productoId={producto.id}
                config={activeConfig}
            />
            <ModalFaq
                open={activeModal === 'preguntas_frecuentes'}
                onClose={() => setActiveModal(null)}
                productoId={producto.id}
                config={activeConfig}
            />
            <ModalBadgeProducto
                open={activeModal === 'badge_producto'}
                onClose={() => setActiveModal(null)}
                productoId={producto.id}
                config={activeConfig}
            />
            <ModalUrgenciaStock
                open={activeModal === 'urgencia_stock'}
                onClose={() => setActiveModal(null)}
                productoId={producto.id}
                config={activeConfig}
            />
        </div>
    )
}
