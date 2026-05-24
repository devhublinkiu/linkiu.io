import { useEffect, useState, type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { Info, Settings2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'
import AdminLayout from '@/Layouts/AdminLayout'
import { Button } from '@/Components/ui/Button'
import { Label } from '@/Components/ui/Label'
import { Switch } from '@/Components/ui/Switch'
import ModalIdentidad,    { type IdentidadConfig }    from './parts/quienes/ModalIdentidad'
import ModalHistoria,     { type HistoriaConfig }     from './parts/quienes/ModalHistoria'
import ModalStats,        { type StatsConfig }        from './parts/quienes/ModalStats'
import ModalMisionVision, { type MisionVisionConfig } from './parts/quienes/ModalMisionVision'
import ModalValores,      { type ValoresConfig }      from './parts/quienes/ModalValores'
import ModalCtaQuienes,   { type CtaQuienesConfig }   from './parts/quienes/ModalCtaQuienes'

type SeccionKey = 'identidad' | 'historia' | 'stats' | 'mision_vision' | 'valores' | 'cta' | 'faq'

interface Colores { primario: string; secundario: string; acento: string }

interface Props {
    secciones:          Record<SeccionKey, boolean>
    identidadConfig:    IdentidadConfig    | null
    historiaConfig:     HistoriaConfig     | null
    statsConfig:        StatsConfig        | null
    misionVisionConfig: MisionVisionConfig | null
    valoresConfig:      ValoresConfig      | null
    ctaConfig:          CtaQuienesConfig   | null
    colores:            Colores
}

interface SharedProps {
    auth:  { permissions: string[] }
    flash: { status?: string }
}

const SECCIONES: { key: SeccionKey; label: string; descripcion: string; hasModal: boolean }[] = [
    { key: 'identidad',    label: 'Identidad',      descripcion: 'Título y descripción del hero.',                  hasModal: true  },
    { key: 'historia',     label: 'Historia',        descripcion: 'Imagen, título y texto de la historia.',          hasModal: true  },
    { key: 'stats',        label: 'Estadísticas',    descripcion: '4 cifras destacadas de la marca.',                hasModal: true  },
    { key: 'mision_vision',label: 'Misión y visión', descripcion: 'Propósito y proyección de la marca.',             hasModal: true  },
    { key: 'valores',      label: 'Valores',         descripcion: 'Los principios que definen a la marca.',          hasModal: true  },
    { key: 'cta',          label: 'CTA',             descripcion: 'Llamada a acción al pie de la página.',           hasModal: true  },
    { key: 'faq',          label: 'FAQ',             descripcion: 'Se gestiona desde Inicio → FAQ (visible_quienes).', hasModal: false },
]

export default function QuienesSomos({ secciones, identidadConfig, historiaConfig, statsConfig, misionVisionConfig, valoresConfig, ctaConfig, colores }: Props) {
    const { props } = usePage<SharedProps>()
    const puedeEditar = props.auth.permissions.includes('*') || props.auth.permissions.includes('linkiubuild.editar')

    useEffect(() => {
        if (props.flash?.status) toast.success(props.flash.status)
    }, [props.flash?.status])

    const [activos,     setActivos]     = useState<Record<SeccionKey, boolean>>(secciones)
    const [guardando,   setGuardando]   = useState<Partial<Record<SeccionKey, boolean>>>({})
    const [activeModal, setActiveModal] = useState<SeccionKey | null>(null)

    function toggleSeccion(key: SeccionKey, nuevoValor: boolean) {
        setActivos(prev => ({ ...prev, [key]: nuevoValor }))
        setGuardando(prev => ({ ...prev, [key]: true }))
        router.post(route('admin.build.quienes-somos.seccion'), { seccion: key, activo: nuevoValor }, {
            preserveScroll: true,
            onError:   () => {
                setActivos(prev => ({ ...prev, [key]: !nuevoValor }))
                toast.error('Error al actualizar la sección')
            },
            onFinish:  () => setGuardando(prev => ({ ...prev, [key]: false })),
        })
    }

    return (
        <TooltipProvider>
            <Head title="Quiénes somos" />

            <div className="space-y-6">

                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Info className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-slate-900">Quiénes somos</h1>
                        <p className="text-xs text-slate-500">Activa o desactiva las secciones de la página.</p>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {SECCIONES.map((s, i) => (
                            <div key={s.key} className="flex items-center gap-4 px-4 py-3.5">
                                <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500 shrink-0">
                                    {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700">{s.label}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{s.descripcion}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    {s.hasModal && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={!puedeEditar}
                                                        onClick={() => setActiveModal(s.key)}
                                                    >
                                                        <Settings2 className="w-4 h-4" />
                                                        Configurar
                                                    </Button>
                                                </span>
                                            </TooltipTrigger>
                                            {!puedeEditar && <TooltipContent>No tienes permiso para editar</TooltipContent>}
                                        </Tooltip>
                                    )}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>
                                                <Switch
                                                    id={`seccion-${s.key}`}
                                                    checked={activos[s.key]}
                                                    onCheckedChange={v => toggleSeccion(s.key, v)}
                                                    disabled={!puedeEditar || !!guardando[s.key]}
                                                />
                                            </span>
                                        </TooltipTrigger>
                                        {!puedeEditar && <TooltipContent>No tienes permiso para editar</TooltipContent>}
                                    </Tooltip>
                                    <Label htmlFor={`seccion-${s.key}`} className="text-sm text-slate-500 cursor-pointer w-14">
                                        {activos[s.key] ? 'Visible' : 'Oculta'}
                                    </Label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <ModalIdentidad
                open={activeModal === 'identidad'}
                onClose={() => setActiveModal(null)}
                config={identidadConfig}
                colores={colores}
                disabled={!puedeEditar}
            />
            <ModalHistoria
                open={activeModal === 'historia'}
                onClose={() => setActiveModal(null)}
                config={historiaConfig}
                disabled={!puedeEditar}
            />
            <ModalStats
                open={activeModal === 'stats'}
                onClose={() => setActiveModal(null)}
                config={statsConfig}
                disabled={!puedeEditar}
            />
            <ModalMisionVision
                open={activeModal === 'mision_vision'}
                onClose={() => setActiveModal(null)}
                config={misionVisionConfig}
                colores={colores}
                disabled={!puedeEditar}
            />
            <ModalValores
                open={activeModal === 'valores'}
                onClose={() => setActiveModal(null)}
                config={valoresConfig}
                colores={colores}
                disabled={!puedeEditar}
            />
            <ModalCtaQuienes
                open={activeModal === 'cta'}
                onClose={() => setActiveModal(null)}
                config={ctaConfig}
                disabled={!puedeEditar}
            />
        </TooltipProvider>
    )
}

QuienesSomos.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={[
        { label: 'Panel', href: route('admin.dashboard') },
        { label: 'LinkiuBuild' },
        { label: 'Quiénes somos' },
    ]}>{page}</AdminLayout>
)
