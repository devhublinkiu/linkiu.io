import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { GripVertical, PackageOpen, Flame, Images, TableProperties, Columns2, FileText, Star, Workflow, MessageSquare, MessageSquareQuote, ShieldCheck, HelpCircle, Zap, GalleryHorizontal, Package, BadgeCheck, Timer, Sparkles, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/Components/ui/Button'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ProductoData, HookCatalogItem } from '../Edit'

const ICON_MAP: Record<string, React.ElementType> = {
    info:                        PackageOpen,
    gancho_promesa:              Flame,
    slider_imagenes:             Images,
    tabla_comparativa:           TableProperties,
    comparacion_visual:          Columns2,
    ficha_tecnica:               FileText,
    caracteristicas_destacadas:  Star,
    como_funciona:               Workflow,
    transformacion_pasos:        Sparkles,
    imagen_promesa:              ImageIcon,
    imagen_intermedia:           ImageIcon,
    imagen_cierre:               ImageIcon,
    resenas_imagen:              MessageSquareQuote,
    urgencia_stock:              Timer,
    que_incluye:                 Package,
    sellos_confianza:            BadgeCheck,
    resenas_clientes:            MessageSquare,
    galeria_resultados:          GalleryHorizontal,
    garantia:                    ShieldCheck,
    preguntas_frecuentes:        HelpCircle,
}

function normalizeOrden(saved: string[] | null, validKeys: string[]): string[] {
    if (!saved) return validKeys
    const filtered  = saved.filter(k => validKeys.includes(k))
    const faltantes = validKeys.filter(k => !saved.includes(k))
    return [...filtered, ...faltantes]
}

interface Props {
    producto: ProductoData
    catalogo: HookCatalogItem[]
}

export default function TabLayout({ producto, catalogo }: Props) {
    const bloquesHooks = catalogo.filter(h => h.vista === 'individual')
    const keysDefault  = ['info', ...bloquesHooks.map(h => h.key)]

    const bloqueMap: Record<string, { label: string; Icon: React.ElementType }> = {
        info: { label: 'Información del producto', Icon: PackageOpen },
        ...Object.fromEntries(
            bloquesHooks.map(h => [h.key, { label: h.label, Icon: ICON_MAP[h.key] ?? Zap }])
        ),
    }

    const [orden,     setOrden]     = useState<string[]>(normalizeOrden(producto.layout_orden, keysDefault))
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        setOrden(normalizeOrden(producto.layout_orden, keysDefault))
    }, [producto.layout_orden])

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

    function onDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over || active.id === over.id) return
        setOrden(prev => {
            const from = prev.indexOf(active.id as string)
            const to   = prev.indexOf(over.id   as string)
            return arrayMove(prev, from, to)
        })
    }

    function guardar() {
        setGuardando(true)
        router.post(
            route('admin.productos.layout', { producto: producto.id }),
            { orden },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Layout guardado'),
                onError:   () => toast.error('Error al guardar el layout'),
                onFinish:  () => setGuardando(false),
            },
        )
    }

    const hookActivo = (key: string) => producto.hooks.some(h => h.key === key && h.activo)

    return (
        <div className="max-w-md space-y-6">
            <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Orden de secciones</h3>
                <p className="text-xs text-slate-500">Arrastra para reorganizar cómo aparecen las secciones en la página del producto.</p>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={orden} strategy={verticalListSortingStrategy}>
                    <div className="space-y-1.5">
                        {orden.map(key => {
                            const bloque = bloqueMap[key]
                            if (!bloque) return null
                            return (
                                <BloqueItem
                                    key={key}
                                    id={key}
                                    label={bloque.label}
                                    Icon={bloque.Icon}
                                    activo={key === 'info' ? undefined : hookActivo(key)}
                                />
                            )
                        })}
                    </div>
                </SortableContext>
            </DndContext>

            <Button type="button" onClick={guardar} disabled={guardando}>
                {guardando ? 'Guardando…' : 'Guardar orden'}
            </Button>
        </div>
    )
}

interface BloqueItemProps {
    id:      string
    label:   string
    Icon:    React.ElementType
    activo?: boolean
}

function BloqueItem({ id, label, Icon, activo }: BloqueItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

    const style = {
        transform:  CSS.Transform.toString(transform),
        transition,
        opacity:    isDragging ? 0.5 : 1,
        zIndex:     isDragging ? 10 : undefined,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 cursor-default"
        >
            <button
                type="button"
                className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="size-4" />
            </button>
            <Icon className="size-4 text-slate-400 shrink-0" />
            <span className="flex-1 text-sm text-slate-700">{label}</span>
            {activo === undefined ? null :
                activo
                    ? <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">Activo</span>
                    : <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">Inactivo</span>
            }
        </div>
    )
}
