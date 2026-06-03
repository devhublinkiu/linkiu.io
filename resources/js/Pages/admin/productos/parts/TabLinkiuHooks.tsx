import { ComponentType, useEffect, useMemo, useState } from 'react'
import { router, usePage } from '@inertiajs/react'
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
import ModalTransformacionPasos from './hooks/ModalTransformacionPasos'
import { ModalImagenPromesa, ModalImagenIntermedia, ModalImagenCierre } from './hooks/ModalImagenEstatica'
import ModalResenasImagen     from './hooks/ModalResenasImagen'
import ModalResenasClientes   from './hooks/ModalResenasClientes'
import ModalGaleriaResultados from './hooks/ModalGaleriaResultados'
import ModalGarantia          from './hooks/ModalGarantia'
import ModalFaq               from './hooks/ModalFaq'
import ModalBadgeProducto     from './hooks/ModalBadgeProducto'
import ModalUrgenciaStock     from './hooks/ModalUrgenciaStock'
import ModalBotonCompra       from './hooks/ModalBotonCompra'
import type { ProductoData, HookCatalogItem, HookData } from '../Edit'

interface HookModalProps {
    open:       boolean
    onClose:    () => void
    productoId: number
    config:     Record<string, unknown> | null
}

/**
 * Mapping centralizado hook_key → componente modal. Agregar un hook
 * nuevo configurable solo requiere: (1) crear el archivo en
 * `parts/hooks/` y (2) registrarlo aquí. El render de los modales se
 * deriva de este mapa.
 */
const MODAL_MAP: Partial<Record<string, ComponentType<HookModalProps>>> = {
    que_incluye:                ModalQueIncluye,
    sellos_confianza:           ModalSellosConfianza,
    gancho_promesa:             ModalGanchoPromesa,
    slider_imagenes:            ModalSliderImagenes,
    tabla_comparativa:          ModalTablaComparativa,
    comparacion_visual:         ModalComparacionVisual,
    ficha_tecnica:              ModalFichaTecnica,
    caracteristicas_destacadas: ModalCaracteristicas,
    como_funciona:              ModalComoFunciona,
    transformacion_pasos:       ModalTransformacionPasos,
    imagen_promesa:             ModalImagenPromesa,
    imagen_intermedia:          ModalImagenIntermedia,
    imagen_cierre:              ModalImagenCierre,
    resenas_imagen:             ModalResenasImagen,
    resenas_clientes:           ModalResenasClientes,
    galeria_resultados:         ModalGaleriaResultados,
    garantia:                   ModalGarantia,
    preguntas_frecuentes:       ModalFaq,
    badge_producto:             ModalBadgeProducto,
    urgencia_stock:             ModalUrgenciaStock,
    boton_compra:               ModalBotonCompra,
}

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

    // Flash unificado: el mensaje de éxito (Hook configurado, activado, etc.)
    // viene del backend. Una sola fuente de verdad — evita toast.success
    // hardcoded en cada modal.
    const flash = usePage<{ flash?: { status?: string } }>().props.flash

    useEffect(() => {
        if (flash?.status) toast.success(flash.status)
    }, [flash?.status])

    const hookState = useMemo(() => {
        const map: Record<string, HookData> = {}
        for (const h of producto.hooks) map[h.key] = h
        return map
    }, [producto.hooks])

    const toggle = (hookKey: string) => {
        setToggling(prev => new Set(prev).add(hookKey))
        router.post(
            route('admin.productos.hooks.toggle', { producto: producto.id, hook: hookKey }),
            {},
            {
                preserveScroll: true,
                onError: () => toast.error('Error al cambiar el estado'),
                onFinish: () => setToggling(prev => {
                    const next = new Set(prev)
                    next.delete(hookKey)
                    return next
                }),
            },
        )
    }

    return (
        <div className="space-y-8">
            {SECCIONES.map(sec => {
                const items = catalogo.filter(h => h.vista === sec.vista)
                if (items.length === 0) return null
                return (
                    <div key={sec.vista}>
                        <div className="mb-3">
                            <h3 className="text-sm font-medium text-slate-700">{sec.label}</h3>
                            <p className="text-xs text-slate-500">{sec.desc}</p>
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

            {/* Modales — un mount por hook configurable; visibilidad controlada
                por `open`. Mantener todos montados permite que Sheet anime el
                close cuando activeModal cambia a null. */}
            {(Object.keys(MODAL_MAP) as Array<keyof typeof MODAL_MAP>).map(key => {
                const Modal = MODAL_MAP[key]!
                return (
                    <Modal
                        key={key}
                        open={activeModal === key}
                        onClose={() => setActiveModal(null)}
                        productoId={producto.id}
                        config={hookState[key]?.config ?? null}
                    />
                )
            })}
        </div>
    )
}
