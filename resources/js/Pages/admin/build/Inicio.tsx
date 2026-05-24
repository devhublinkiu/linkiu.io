import { useEffect, useState, type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { Home, Settings2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'
import AdminLayout from '@/Layouts/AdminLayout'
import { Button } from '@/Components/ui/Button'
import { Label } from '@/Components/ui/Label'
import { Switch } from '@/Components/ui/Switch'
import ModalHero,    { type HeroConfig }    from './parts/inicio/ModalHero'
import ModalResenas, { type ResenasConfig } from './parts/inicio/ModalResenas'
import ModalTicker,    { type TickerConfig }    from './parts/inicio/ModalTicker'
import ModalBeneficios, { type BeneficiosConfig } from './parts/inicio/ModalBeneficios'
import ModalBanners,      { type BannersConfig }      from './parts/inicio/ModalBanners'
import ModalComoFunciona, { type ComoFuncionaConfig } from './parts/inicio/ModalComoFunciona'
import ModalCarrusel,    { type CarruselConfig }    from './parts/inicio/ModalCarrusel'
import ModalFaq,         { type FaqConfig }         from './parts/inicio/ModalFaq'
import ModalCta,         { type CtaConfig }         from './parts/inicio/ModalCta'

type SeccionKey =
    | 'hero'
    | 'tickers'
    | 'beneficios'
    | 'banners'
    | 'oferta_relampago'
    | 'como_funciona'
    | 'carrusel'
    | 'productos_destacados'
    | 'resenas'
    | 'faq'
    | 'cta'

interface Colores { primario: string; secundario: string; acento: string }

interface Props {
    secciones:     Record<SeccionKey, boolean>
    heroConfig:    HeroConfig    | null
    resenasConfig: ResenasConfig | null
    tickerConfig:     TickerConfig     | null
    beneficiosConfig: BeneficiosConfig | null
    bannersConfig:       BannersConfig       | null
    comoFuncionaConfig:  ComoFuncionaConfig  | null
    carruselConfig:      CarruselConfig      | null
    faqConfig:           FaqConfig           | null
    ctaConfig:           CtaConfig           | null
    colores:             Colores
}

interface SharedProps {
    auth:  { permissions: string[] }
    flash: { status?: string }
}

const SECCIONES: { key: SeccionKey; label: string; descripcion: string; hasModal: boolean }[] = [
    { key: 'hero',                 label: 'Hero',                 descripcion: 'Banner principal con imagen y llamada a acción.',  hasModal: true  },
    { key: 'tickers',              label: 'Tickers',              descripcion: 'Franja de texto animado bajo el hero.',            hasModal: true  },
    { key: 'beneficios',           label: 'Beneficios',           descripcion: 'Íconos y textos de propuestas de valor.',          hasModal: true  },
    { key: 'banners',              label: 'Banners',              descripcion: 'Imágenes promocionales de ancho completo.',        hasModal: true  },
    { key: 'oferta_relampago',     label: 'Oferta relámpago',     descripcion: 'Producto con precio especial y countdown.',        hasModal: false },
    { key: 'como_funciona',        label: 'Cómo funciona',        descripcion: 'Pasos del proceso de compra.',                    hasModal: true  },
    { key: 'carrusel',             label: 'Carrusel',             descripcion: 'Galería de imágenes deslizable.',                 hasModal: true  },
    { key: 'productos_destacados', label: 'Productos destacados', descripcion: 'Showcase de productos seleccionados.',            hasModal: false },
    { key: 'resenas',              label: 'Reseñas',              descripcion: 'Testimonios y opiniones de clientes.',            hasModal: true  },
    { key: 'faq',                  label: 'FAQ',                  descripcion: 'Preguntas frecuentes.',                           hasModal: true  },
    { key: 'cta',                  label: 'CTA',                  descripcion: 'Bloque de cierre con llamada a acción final.',    hasModal: true  },
]

export default function Inicio({ secciones, heroConfig, resenasConfig, tickerConfig, beneficiosConfig, bannersConfig, comoFuncionaConfig, carruselConfig, faqConfig, ctaConfig, colores }: Props) {
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
        router.post(route('admin.build.inicio.seccion'), { seccion: key, activo: nuevoValor }, {
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
            <Head title="Inicio" />

            <div className="space-y-6">

                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Home className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-slate-900">Inicio</h1>
                        <p className="text-xs text-slate-500">Activa o desactiva las secciones de la página principal.</p>
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

            <ModalHero
                open={activeModal === 'hero'}
                onClose={() => setActiveModal(null)}
                config={heroConfig}
                colores={colores}
                disabled={!puedeEditar}
            />
            <ModalResenas
                open={activeModal === 'resenas'}
                onClose={() => setActiveModal(null)}
                config={resenasConfig}
                disabled={!puedeEditar}
            />
            <ModalTicker
                open={activeModal === 'tickers'}
                onClose={() => setActiveModal(null)}
                config={tickerConfig}
                colores={colores}
                disabled={!puedeEditar}
            />
            <ModalBeneficios
                open={activeModal === 'beneficios'}
                onClose={() => setActiveModal(null)}
                config={beneficiosConfig}
                colores={colores}
                disabled={!puedeEditar}
            />
            <ModalBanners
                open={activeModal === 'banners'}
                onClose={() => setActiveModal(null)}
                config={bannersConfig}
                disabled={!puedeEditar}
            />
            <ModalComoFunciona
                open={activeModal === 'como_funciona'}
                onClose={() => setActiveModal(null)}
                config={comoFuncionaConfig}
                colores={colores}
                disabled={!puedeEditar}
            />
            <ModalCarrusel
                open={activeModal === 'carrusel'}
                onClose={() => setActiveModal(null)}
                config={carruselConfig}
                disabled={!puedeEditar}
            />
            <ModalFaq
                open={activeModal === 'faq'}
                onClose={() => setActiveModal(null)}
                config={faqConfig}
                disabled={!puedeEditar}
            />
            <ModalCta
                open={activeModal === 'cta'}
                onClose={() => setActiveModal(null)}
                config={ctaConfig}
                colores={colores}
                disabled={!puedeEditar}
            />
        </TooltipProvider>
    )
}

Inicio.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={[
        { label: 'Panel', href: route('admin.dashboard') },
        { label: 'LinkiuBuild' },
        { label: 'Inicio' },
    ]}>{page}</AdminLayout>
)
