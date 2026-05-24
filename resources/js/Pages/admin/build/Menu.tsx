import { useEffect, useState, type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { AlignJustify, Plus } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Badge } from '@/Components/ui/Badge'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Switch } from '@/Components/ui/Switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/Tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/Select'
import AnnouncementRow, { type Announcement } from './parts/AnnouncementRow'
import TokenSelector from './parts/TokenSelector'
import { cn } from '@/lib/utils'

// ── Tipos ────────────────────────────────────────────────────────────────────

interface TickerConfig {
    color_bg:   string
    color_text: string
    interval:   number
}

interface NavConfig {
    productos_label:  string
    quienes_label:    string
    blog_label:       string
    contacto_label:   string
    quienes_visible:  boolean
    blog_visible:     boolean
    contacto_visible: boolean
    buscador_visible: boolean
    color_bg:         string
    color_text:       string
    sticky:           boolean
}

interface Colores {
    primario:   string
    secundario: string
    acento:     string
}

interface Props {
    anuncios: Announcement[]
    ticker:   TickerConfig
    nav:      NavConfig
    colores:  Colores
}

interface SharedProps {
    auth:  { permissions: string[] }
    flash: { status?: string }
}

// ── Items del nav (configuración estática) ───────────────────────────────────

const NAV_ITEMS = [
    { key: 'inicio',    nombre: 'Inicio',        toggleKey: null,               labelKey: null               },
    { key: 'productos', nombre: 'Productos',      toggleKey: null,               labelKey: 'productos_label'  },
    { key: 'quienes',   nombre: 'Quiénes somos',  toggleKey: 'quienes_visible',  labelKey: 'quienes_label'    },
    { key: 'blog',      nombre: 'Blog',           toggleKey: 'blog_visible',     labelKey: 'blog_label'       },
    { key: 'contacto',  nombre: 'Contacto',       toggleKey: 'contacto_visible', labelKey: 'contacto_label'   },
    { key: 'buscador',  nombre: 'Buscador',       toggleKey: 'buscador_visible', labelKey: null               },
    { key: 'micuenta',  nombre: 'Mi cuenta',      toggleKey: null,               labelKey: null               },
    { key: 'carrito',   nombre: 'Carrito',        toggleKey: null,               labelKey: null               },
] as const

// ── Página principal ──────────────────────────────────────────────────────────

export default function Menu({ anuncios, ticker, nav, colores }: Props) {
    const { props } = usePage<SharedProps>()
    const puede = (p: string) =>
        props.auth.permissions.includes('*') || props.auth.permissions.includes(p)
    const puedeEditar = puede('linkiubuild.editar')

    useEffect(() => {
        if (props.flash?.status) toast.success(props.flash.status)
    }, [props.flash?.status])

    // ── Tokens de color ───────────────────────────────────────────────────────
    const tokensPrimarios = [
        { label: 'Principal',  value: 'primario',   hex: colores.primario   },
        { label: 'Secundario', value: 'secundario', hex: colores.secundario },
        { label: 'Acento',     value: 'acento',     hex: colores.acento     },
    ]

    const tokensFijos = [
        { label: 'Blanco', value: 'blanco', hex: '#FFFFFF' },
        { label: 'Negro',  value: 'negro',  hex: '#000000' },
    ]

    const tokensBg    = [...tokensPrimarios, ...tokensFijos]
    const tokensTexto = [...tokensPrimarios, ...tokensFijos]

    // ── Estado ticker ─────────────────────────────────────────────────────────
    const [formTicker,      setFormTicker]      = useState<TickerConfig>(ticker)
    const [guardandoTicker, setGuardandoTicker] = useState(false)

    function guardarTicker() {
        setGuardandoTicker(true)
        router.post(route('admin.build.menu.ticker'), formTicker, {
            preserveScroll: true,
            onError:   () => toast.error('Error al guardar el ticker'),
            onFinish:  () => setGuardandoTicker(false),
        })
    }

    // ── Estado anuncios ───────────────────────────────────────────────────────
    const [nuevoAnuncio, setNuevoAnuncio] = useState(false)

    // ── Estado nav ────────────────────────────────────────────────────────────
    const [formNav,      setFormNav]      = useState<NavConfig>(nav)
    const [guardandoNav, setGuardandoNav] = useState(false)

    function guardarNav() {
        setGuardandoNav(true)
        router.post(route('admin.build.menu.nav'), formNav, {
            preserveScroll: true,
            onError:   () => toast.error('Error al guardar la navegación'),
            onFinish:  () => setGuardandoNav(false),
        })
    }

    return (
        <>
            <Head title="Menú" />

            <TooltipProvider>
                <div className="space-y-6">

                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                            <AlignJustify className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-900">Menú</h1>
                            <p className="text-xs text-slate-500">Configura la barra de anuncios y la navegación de tu tienda.</p>
                        </div>
                    </div>

                    <Tabs defaultValue="anuncios" orientation="vertical" className="flex gap-6 items-start">
                        <TabsList className="w-44 shrink-0">
                            <TabsTrigger value="anuncios">Anuncios</TabsTrigger>
                            <TabsTrigger value="navegacion">Navegación</TabsTrigger>
                        </TabsList>

                        <div className="flex-1 min-w-0 space-y-4">

                            {/* ── Tab Anuncios ─────────────────────────────── */}
                            <TabsContent value="anuncios" className="space-y-4">

                                {/* Config global del ticker */}
                                <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-5">
                                    <TokenSelector
                                        label="Color de fondo"
                                        value={formTicker.color_bg}
                                        onChange={v => setFormTicker(f => ({ ...f, color_bg: v }))}
                                        opciones={tokensBg}
                                        disabled={!puedeEditar}
                                    />

                                    <div className="border-t border-slate-100" />

                                    <TokenSelector
                                        label="Color de texto"
                                        value={formTicker.color_text}
                                        onChange={v => setFormTicker(f => ({ ...f, color_text: v }))}
                                        opciones={tokensTexto}
                                        disabled={!puedeEditar}
                                    />

                                    <div className="border-t border-slate-100" />

                                    <div className="space-y-2">
                                        <Label>Tiempo entre anuncios</Label>
                                        <Select
                                            value={String(formTicker.interval)}
                                            onValueChange={v => setFormTicker(f => ({ ...f, interval: Number(v) }))}
                                            disabled={!puedeEditar}
                                        >
                                            <SelectTrigger className="w-48">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[5, 10, 20, 30, 40, 50].map(s => (
                                                    <SelectItem key={s} value={String(s)}>{s} segundos</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex justify-end border-t border-slate-100 pt-4">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>
                                                <Button
                                                    onClick={guardarTicker}
                                                    disabled={guardandoTicker || !puedeEditar}
                                                >
                                                    {guardandoTicker ? 'Guardando…' : 'Guardar ticker'}
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        {!puedeEditar && <TooltipContent>No tienes permiso para editar</TooltipContent>}
                                    </Tooltip>
                                </div>

                                {/* Lista de anuncios en card */}
                                <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                                        <p className="text-sm font-medium text-slate-700">
                                            {anuncios.length === 0
                                                ? 'Sin anuncios'
                                                : anuncios.length === 1
                                                ? '1 anuncio'
                                                : `${anuncios.length} anuncios`}
                                        </p>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={!puedeEditar || nuevoAnuncio}
                                                        onClick={() => setNuevoAnuncio(true)}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Agregar
                                                    </Button>
                                                </span>
                                            </TooltipTrigger>
                                            {!puedeEditar && <TooltipContent>No tienes permiso para editar</TooltipContent>}
                                        </Tooltip>
                                    </div>

                                    <div className="p-4 space-y-2">
                                        {anuncios.length === 0 && !nuevoAnuncio && (
                                            <p className="text-sm text-slate-500 text-center py-6">
                                                No hay anuncios configurados. Agrega uno para activar el ticker.
                                            </p>
                                        )}
                                        {anuncios.map(ann => (
                                            <AnnouncementRow
                                                key={ann.id}
                                                ann={ann}
                                                puedeEditar={puedeEditar}
                                            />
                                        ))}
                                        {nuevoAnuncio && (
                                            <AnnouncementRow
                                                ann={null}
                                                puedeEditar={puedeEditar}
                                                onCancelar={() => setNuevoAnuncio(false)}
                                            />
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* ── Tab Navegación ───────────────────────────── */}
                            <TabsContent value="navegacion" className="space-y-4">

                                {/* Estilo */}
                                <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-5">
                                    <p className="text-sm font-medium text-slate-700">Estilo</p>

                                    <TokenSelector
                                        label="Color de fondo"
                                        value={formNav.color_bg}
                                        onChange={v => setFormNav(f => ({ ...f, color_bg: v }))}
                                        opciones={tokensBg}
                                        disabled={!puedeEditar}
                                    />

                                    <div className="border-t border-slate-100" />

                                    <TokenSelector
                                        label="Color de texto e iconos"
                                        value={formNav.color_text}
                                        onChange={v => setFormNav(f => ({ ...f, color_text: v }))}
                                        opciones={tokensTexto}
                                        disabled={!puedeEditar}
                                    />

                                    <div className="border-t border-slate-100" />

                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <Label htmlFor="nav-sticky">Sticky</Label>
                                            <p className="text-xs text-slate-500 mt-0.5">El nav permanece fijo al hacer scroll.</p>
                                        </div>
                                        <Switch
                                            id="nav-sticky"
                                            checked={formNav.sticky}
                                            onCheckedChange={v => setFormNav(f => ({ ...f, sticky: v }))}
                                            disabled={!puedeEditar}
                                        />
                                    </div>
                                </div>

                                {/* Items del nav + save en footer */}
                                <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                                    <div className="divide-y divide-slate-100">
                                        {NAV_ITEMS.map(item => {
                                            const visible  = item.toggleKey
                                                ? (formNav as Record<string, unknown>)[item.toggleKey] as boolean
                                                : true
                                            const labelVal = item.labelKey
                                                ? (formNav as Record<string, unknown>)[item.labelKey] as string
                                                : ''

                                            return (
                                                <div key={item.key} className="flex items-center gap-4 px-4 py-3">
                                                    <span className="w-32 shrink-0 text-sm text-slate-700">{item.nombre}</span>

                                                    {item.labelKey ? (
                                                        <Input
                                                            type="text"
                                                            value={labelVal}
                                                            maxLength={30}
                                                            disabled={!puedeEditar || (item.toggleKey ? !visible : false)}
                                                            onChange={e => setFormNav(f => ({ ...f, [item.labelKey!]: e.target.value }))}
                                                            placeholder={item.nombre}
                                                            className="max-w-[180px]"
                                                        />
                                                    ) : (
                                                        <span className="flex-1" />
                                                    )}

                                                    <div className="ml-auto flex items-center gap-2">
                                                        {item.toggleKey ? (
                                                            <>
                                                                <Switch
                                                                    id={`nav-${item.key}`}
                                                                    checked={visible}
                                                                    onCheckedChange={v => setFormNav(f => ({ ...f, [item.toggleKey!]: v }))}
                                                                    disabled={!puedeEditar}
                                                                />
                                                                <Label htmlFor={`nav-${item.key}`} className="text-sm text-slate-500 cursor-pointer w-14">
                                                                    {visible ? 'Visible' : 'Oculto'}
                                                                </Label>
                                                            </>
                                                        ) : (
                                                            <Badge variant="secondary">Siempre visible</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="flex justify-end px-4 py-3 border-t border-slate-100 bg-slate-50">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span>
                                                    <Button
                                                        onClick={guardarNav}
                                                        disabled={guardandoNav || !puedeEditar}
                                                    >
                                                        {guardandoNav ? 'Guardando…' : 'Guardar navegación'}
                                                    </Button>
                                                </span>
                                            </TooltipTrigger>
                                            {!puedeEditar && <TooltipContent>No tienes permiso para editar</TooltipContent>}
                                        </Tooltip>
                                    </div>
                                </div>

                            </TabsContent>

                        </div>
                    </Tabs>

                </div>
            </TooltipProvider>
        </>
    )
}

Menu.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={[
        { label: 'Panel', href: route('admin.dashboard') },
        { label: 'LinkiuBuild' },
        { label: 'Menú' },
    ]}>{page}</AdminLayout>
)
