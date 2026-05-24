import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { GripVertical } from 'lucide-react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Switch } from '@/Components/ui/Switch'

export interface CampoFormItem {
    key:       string
    activo:    boolean
    requerido: boolean
    orden:     number
}

export interface FormContactoConfig {
    correo_destino: string | null
    campos:         CampoFormItem[]
}

interface Props {
    open:     boolean
    onClose:  () => void
    config:   FormContactoConfig | null
    disabled: boolean
}

const LABELS: Record<string, string> = {
    nombre:  'Nombre',
    correo:  'Correo electrónico',
    asunto:  'Asunto',
    mensaje: 'Mensaje',
    celular: 'Celular',
    empresa: 'Empresa',
}

const CAMPOS_DEFAULT: CampoFormItem[] = [
    { key: 'nombre',  activo: true,  requerido: true,  orden: 1 },
    { key: 'correo',  activo: true,  requerido: true,  orden: 2 },
    { key: 'asunto',  activo: true,  requerido: false, orden: 3 },
    { key: 'mensaje', activo: true,  requerido: true,  orden: 4 },
    { key: 'celular', activo: false, requerido: false, orden: 5 },
    { key: 'empresa', activo: false, requerido: false, orden: 6 },
]

function normalizar(saved: CampoFormItem[] | null): CampoFormItem[] {
    if (!saved || saved.length === 0) return CAMPOS_DEFAULT.map(c => ({ ...c }))
    const keys  = CAMPOS_DEFAULT.map(c => c.key)
    const saved_ = [...saved].sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99))
    const filt   = saved_.filter(c => keys.includes(c.key))
    const found  = filt.map(c => c.key)
    const extra  = CAMPOS_DEFAULT.filter(c => !found.includes(c.key))
    return [...filt, ...extra]
}

export default function ModalFormContacto({ open, onClose, config, disabled }: Props) {
    const [correoDestino, setCorreoDestino] = useState('')
    const [campos,        setCampos]        = useState<CampoFormItem[]>([])
    const [guardando,     setGuardando]     = useState(false)

    useEffect(() => {
        if (!open) return
        setCorreoDestino(config?.correo_destino ?? '')
        setCampos(normalizar(config?.campos ?? null))
    }, [open])

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

    function onDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over || active.id === over.id) return
        setCampos(prev => {
            const from = prev.findIndex(c => c.key === active.id)
            const to   = prev.findIndex(c => c.key === over.id)
            return arrayMove(prev, from, to)
        })
    }

    function toggleActivo(key: string) {
        setCampos(prev => prev.map(c =>
            c.key === key
                ? { ...c, activo: !c.activo, requerido: !c.activo ? c.requerido : false }
                : c
        ))
    }

    function toggleRequerido(key: string) {
        setCampos(prev => prev.map(c =>
            c.key === key ? { ...c, requerido: !c.requerido } : c
        ))
    }

    function guardar() {
        setGuardando(true)
        router.post(route('admin.build.contacto.form.config'), {
            correo_destino: correoDestino || null,
            campos: campos.map((c, i) => ({ ...c, orden: i + 1 })),
        }, {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onError:   () => toast.error('Error al guardar'),
            onFinish:  () => setGuardando(false),
        })
    }

    return (
        <Sheet open={open} onOpenChange={v => { if (!v) onClose() }}>
            <SheetContent className="sm:max-w-lg flex flex-col">
                <SheetHeader>
                    <SheetTitle>Formulario de contacto</SheetTitle>
                    <SheetDescription>Configura los campos y el correo destino.</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">

                    {/* Correo destino */}
                    <div className="space-y-1.5">
                        <Label htmlFor="correo-destino">Correo de destino</Label>
                        <Input
                            id="correo-destino"
                            type="email"
                            value={correoDestino}
                            maxLength={200}
                            disabled={disabled}
                            onChange={e => setCorreoDestino(e.target.value)}
                            placeholder="hola@tuempresa.com"
                        />
                        <p className="text-xs text-slate-400">Los mensajes del formulario se enviarán a este correo.</p>
                    </div>

                    <div className="border-t border-slate-100" />

                    {/* Campos */}
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-slate-700">Campos</p>
                            <p className="text-xs text-slate-400 mt-0.5">Arrastra para reordenar. Activa los campos que quieres mostrar.</p>
                        </div>

                        {/* Cabecera columnas */}
                        <div className="grid grid-cols-[1.5rem_1fr_4rem_5rem] gap-2 px-1">
                            <span />
                            <span className="text-xs text-slate-400 font-medium">Campo</span>
                            <span className="text-xs text-slate-400 font-medium text-center">Activo</span>
                            <span className="text-xs text-slate-400 font-medium text-center">Requerido</span>
                        </div>

                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                            <SortableContext items={campos.map(c => c.key)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-1">
                                    {campos.map(campo => (
                                        <CampoRow
                                            key={campo.key}
                                            campo={campo}
                                            label={LABELS[campo.key] ?? campo.key}
                                            disabled={disabled}
                                            onToggleActivo={() => toggleActivo(campo.key)}
                                            onToggleRequerido={() => toggleRequerido(campo.key)}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>

                </div>

                <SheetFooter>
                    <Button onClick={guardar} disabled={guardando || disabled}>
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </Button>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

interface CampoRowProps {
    campo:             CampoFormItem
    label:             string
    disabled:          boolean
    onToggleActivo:    () => void
    onToggleRequerido: () => void
}

function CampoRow({ campo, label, disabled, onToggleActivo, onToggleRequerido }: CampoRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: campo.key })

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
            className="grid grid-cols-[1.5rem_1fr_4rem_5rem] gap-2 items-center rounded-md border border-slate-200 bg-white px-2 py-2.5"
        >
            <button
                type="button"
                className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing disabled:cursor-not-allowed transition-colors duration-200 ease-in-out"
                disabled={disabled}
                {...attributes}
                {...listeners}
            >
                <GripVertical className="w-4 h-4" />
            </button>

            <span className={`text-sm ${campo.activo ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                {label}
            </span>

            <div className="flex justify-center">
                <Switch
                    size="sm"
                    checked={campo.activo}
                    disabled={disabled}
                    onCheckedChange={onToggleActivo}
                />
            </div>

            <div className="flex justify-center">
                <Switch
                    size="sm"
                    checked={campo.requerido}
                    disabled={disabled || !campo.activo}
                    onCheckedChange={onToggleRequerido}
                />
            </div>
        </div>
    )
}
