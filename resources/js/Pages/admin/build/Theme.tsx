import { useState, useEffect, useRef, type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { Palette, Check, Upload, X } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/Tabs'
import { Label } from '@/Components/ui/Label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/AlertDialog'
import TokenSelector from './parts/TokenSelector'
import { cn } from '@/lib/utils'

// ── Tipos ────────────────────────────────────────────────────────────────────

interface Colores {
    primario:   string
    secundario: string
    acento:     string
}

interface Botones {
    bg:   string
    text: string
}

interface Logos {
    tienda: string | null
    admin:  string | null
}

interface Seo {
    nombre_tienda:   string
    telefono_tienda: string
}

interface Props {
    colores: Colores
    botones: Botones
    logos:   Logos
    seo:     Seo
}

interface SharedProps {
    auth:  { permissions: string[] }
    flash: { status?: string }
}

// ── Paleta predefinida ────────────────────────────────────────────────────────

const PALETA = [
    { nombre: 'Slate',  hex: '#314158' },
    { nombre: 'Blue',   hex: '#155DFC' },
    { nombre: 'Violet', hex: '#7C3AED' },
    { nombre: 'Pink',   hex: '#DB2777' },
    { nombre: 'Red',    hex: '#DC2626' },
    { nombre: 'Orange', hex: '#EA580C' },
    { nombre: 'Amber',  hex: '#D97706' },
    { nombre: 'Green',  hex: '#16A34A' },
    { nombre: 'Cyan',   hex: '#0891B2' },
    { nombre: 'Black',  hex: '#000000' },
]

const TOKENS_TEXTO = [
    { label: 'Blanco', value: 'blanco', hex: '#FFFFFF' },
    { label: 'Negro',  value: 'negro',  hex: '#000000' },
]

// ── Sub-componente: selector de color ────────────────────────────────────────

function ColorPicker({
    label,
    descripcion,
    value,
    onChange,
    disabled,
}: {
    label:       string
    descripcion: string
    value:       string
    onChange:    (hex: string) => void
    disabled:    boolean
}) {
    const hexInput = useRef<HTMLInputElement>(null)

    const esPaletaSeleccionada = (hex: string) =>
        PALETA.some(c => c.hex.toLowerCase() === hex.toLowerCase())

    return (
        <div className="space-y-3">
            <div>
                <Label>{label}</Label>
                <p className="text-xs text-slate-500 mt-0.5">{descripcion}</p>
            </div>

            {/* Paleta */}
            <div className="flex flex-wrap gap-2">
                {PALETA.map(color => (
                    <Tooltip key={color.hex}>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                disabled={disabled}
                                onClick={() => onChange(color.hex)}
                                className={cn(
                                    'w-7 h-7 rounded-lg border-2 transition-colors duration-200 ease-in-out flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50',
                                    value.toLowerCase() === color.hex.toLowerCase()
                                        ? 'border-slate-900'
                                        : 'border-transparent hover:border-slate-400'
                                )}
                                style={{ backgroundColor: color.hex }}
                            >
                                {value.toLowerCase() === color.hex.toLowerCase() && (
                                    <Check className="w-3 h-3 text-white" />
                                )}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>{color.nombre}</TooltipContent>
                    </Tooltip>
                ))}
            </div>

            {/* Hex libre */}
            <div className="flex items-center gap-2.5">
                <button
                    type="button"
                    disabled={disabled}
                    className="w-8 h-8 rounded-lg border border-slate-200 shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundColor: value }}
                    onClick={() => hexInput.current?.click()}
                />
                <input
                    ref={hexInput}
                    type="color"
                    value={value}
                    disabled={disabled}
                    onChange={e => onChange(e.target.value)}
                    className="sr-only"
                />
                <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 h-8">
                    <span className="text-xs text-slate-500 font-mono select-none">#</span>
                    <Input
                        type="text"
                        value={value.replace('#', '')}
                        disabled={disabled}
                        maxLength={6}
                        onChange={e => {
                            const v = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6)
                            if (v.length === 6) onChange(`#${v}`)
                        }}
                        className="w-16 text-xs font-mono bg-transparent border-0 p-0 h-auto shadow-none focus-visible:ring-0"
                        placeholder="314158"
                    />
                </div>
                {!esPaletaSeleccionada(value) && (
                    <span className="text-xs text-slate-500">Color personalizado</span>
                )}
            </div>
        </div>
    )
}

// ── Sub-componente: slot de logo ──────────────────────────────────────────────

function LogoSlot({
    label,
    descripcion,
    urlActual,
    onFile,
    onEliminar,
    disabled,
}: {
    label:       string
    descripcion: string
    urlActual:   string | null
    onFile:      (file: File) => void
    onEliminar:  () => void
    disabled:    boolean
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [preview, setPreview]               = useState<string | null>(urlActual)
    const [confirmarEliminar, setConfirmar]   = useState(false)

    useEffect(() => { setPreview(urlActual) }, [urlActual])

    function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setPreview(URL.createObjectURL(file))
        onFile(file)
    }

    function handleEliminar() {
        setPreview(null)
        onEliminar()
        if (inputRef.current) inputRef.current.value = ''
    }

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
            <div>
                <p className="text-sm font-medium text-slate-700">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{descripcion}</p>
            </div>

            <div className="flex items-center gap-3">
                <div className="w-24 h-12 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    {preview
                        ? <img src={preview} alt={label} className="w-full h-full object-contain p-1" onError={() => setPreview(null)} />
                        : <span className="text-xs text-slate-500">Sin logo</span>
                    }
                </div>

                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/png,image/svg+xml,image/jpeg,image/webp"
                        disabled={disabled}
                        onChange={handleFile}
                        className="sr-only"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={disabled}
                        onClick={() => inputRef.current?.click()}
                    >
                        <Upload className="w-3.5 h-3.5" />
                        {preview ? 'Cambiar' : 'Subir'}
                    </Button>
                    {preview && (
                        <>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={disabled}
                                onClick={() => setConfirmar(true)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                                <X className="w-3.5 h-3.5" />
                            </Button>
                            <AlertDialog open={confirmarEliminar} onOpenChange={setConfirmar}>
                                <AlertDialogContent size="sm">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Eliminar logo?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Se eliminará el logo de "{label}" al guardar. Esta acción no se puede deshacer.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction variant="destructive" onClick={handleEliminar}>
                                            Eliminar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                </div>
            </div>

            <p className="text-xs text-slate-500">PNG, SVG, JPG o WebP · máx. 2 MB</p>
        </div>
    )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function Theme({ colores, botones, logos, seo }: Props) {
    const { props } = usePage<SharedProps>()
    const puede = (p: string) =>
        props.auth.permissions.includes('*') || props.auth.permissions.includes(p)
    const puedeEditar = puede('linkiubuild.editar')

    useEffect(() => {
        if (props.flash?.status) toast.success(props.flash.status)
    }, [props.flash?.status])

    // ── Estado colores ────────────────────────────────────────────────────────
    const [formColores, setFormColores] = useState<Colores>(colores)
    const [guardandoColores, setGuardandoColores] = useState(false)

    function guardarColores() {
        setGuardandoColores(true)
        router.post(route('admin.build.theme.colores'), formColores, {
            preserveScroll: true,
            onError:  () => toast.error('Error al guardar los colores'),
            onFinish: () => setGuardandoColores(false),
        })
    }

    // ── Estado botones ────────────────────────────────────────────────────────
    const [formBotones, setFormBotones] = useState<Botones>(botones)
    const [guardandoBotones, setGuardandoBotones] = useState(false)

    function guardarBotones() {
        setGuardandoBotones(true)
        router.post(route('admin.build.theme.botones'), formBotones, {
            preserveScroll: true,
            onError:  () => toast.error('Error al guardar los botones'),
            onFinish: () => setGuardandoBotones(false),
        })
    }

    // ── Estado SEO ────────────────────────────────────────────────────────────
    const [formSeo, setFormSeo] = useState<Seo>(seo)
    const [guardandoSeo, setGuardandoSeo] = useState(false)

    function guardarSeo() {
        setGuardandoSeo(true)
        router.post(route('admin.build.theme.seo'), formSeo, {
            preserveScroll: true,
            onError:  () => toast.error('Error al guardar SEO'),
            onFinish: () => setGuardandoSeo(false),
        })
    }

    // ── Estado logos ──────────────────────────────────────────────────────────
    const [logoTiendaFile, setLogoTiendaFile] = useState<File | null>(null)
    const [logoAdminFile,  setLogoAdminFile]  = useState<File | null>(null)
    const [eliminarTienda, setEliminarTienda] = useState(false)
    const [eliminarAdmin,  setEliminarAdmin]  = useState(false)
    const [guardandoLogos, setGuardandoLogos] = useState(false)

    function guardarLogos() {
        setGuardandoLogos(true)
        const data = new FormData()
        if (logoTiendaFile) data.append('logo_tienda', logoTiendaFile)
        if (logoAdminFile)  data.append('logo_admin',  logoAdminFile)
        if (eliminarTienda) data.append('eliminar_tienda', '1')
        if (eliminarAdmin)  data.append('eliminar_admin',  '1')

        router.post(route('admin.build.theme.logos'), data, {
            preserveScroll: true,
            forceFormData:  true,
            onError:  () => toast.error('Error al guardar los logotipos'),
            onFinish: () => {
                setGuardandoLogos(false)
                setLogoTiendaFile(null)
                setLogoAdminFile(null)
                setEliminarTienda(false)
                setEliminarAdmin(false)
            },
        })
    }

    // ── Tokens resueltos para el selector de botones ──────────────────────────
    const tokensColor = [
        { label: 'Principal',  value: 'primario',   hex: formColores.primario   },
        { label: 'Secundario', value: 'secundario', hex: formColores.secundario },
        { label: 'Acento',     value: 'acento',     hex: formColores.acento     },
    ]

    const tokensTexto = [
        ...tokensColor,
        ...TOKENS_TEXTO,
    ]

    // ── Color hex resuelto para preview del botón ─────────────────────────────
    function resolverHex(token: string): string {
        if (token === 'primario')   return formColores.primario
        if (token === 'secundario') return formColores.secundario
        if (token === 'acento')     return formColores.acento
        if (token === 'blanco')     return '#FFFFFF'
        return '#000000'
    }

    return (
        <>
            <Head title="Theme" />

            <TooltipProvider>
                <div className="space-y-6">

                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Palette className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-900">Theme</h1>
                            <p className="text-xs text-slate-500">Personaliza la identidad visual de tu tienda.</p>
                        </div>
                    </div>

                    <Tabs defaultValue="colores" orientation="vertical" className="flex gap-6 items-start">
                        <TabsList className="w-44 shrink-0">
                            <TabsTrigger value="colores">Colores</TabsTrigger>
                            <TabsTrigger value="logotipos">Logotipos</TabsTrigger>
                            <TabsTrigger value="botones">Botones</TabsTrigger>
                            <TabsTrigger value="seo">SEO</TabsTrigger>
                        </TabsList>

                        <div className="flex-1 min-w-0 space-y-6">

                            {/* ── Colores ──────────────────────────────────── */}
                            <TabsContent value="colores">
                                <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-6">
                                    <ColorPicker
                                        label="Color principal"
                                        descripcion="Usado en CTAs, links y elementos de acción primarios."
                                        value={formColores.primario}
                                        onChange={v => setFormColores(f => ({ ...f, primario: v }))}
                                        disabled={!puedeEditar}
                                    />
                                    <div className="border-t border-slate-100" />
                                    <ColorPicker
                                        label="Color secundario"
                                        descripcion="Fondos de secciones y elementos de apoyo."
                                        value={formColores.secundario}
                                        onChange={v => setFormColores(f => ({ ...f, secundario: v }))}
                                        disabled={!puedeEditar}
                                    />
                                    <div className="border-t border-slate-100" />
                                    <ColorPicker
                                        label="Color de acento"
                                        descripcion="Badges de oferta, precios rebajados y elementos de urgencia."
                                        value={formColores.acento}
                                        onChange={v => setFormColores(f => ({ ...f, acento: v }))}
                                        disabled={!puedeEditar}
                                    />
                                </div>

                                <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>
                                                <Button
                                                    onClick={guardarColores}
                                                    disabled={guardandoColores || !puedeEditar}
                                                >
                                                    {guardandoColores ? 'Guardando…' : 'Guardar colores'}
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        {!puedeEditar && <TooltipContent>No tienes permiso para editar</TooltipContent>}
                                    </Tooltip>
                                </div>
                            </TabsContent>

                            {/* ── Logotipos ─────────────────────────────────── */}
                            <TabsContent value="logotipos">
                                <div className="space-y-4">
                                    <LogoSlot
                                        label="Logo tienda pública"
                                        descripcion="Aparece en el header de la tienda web."
                                        urlActual={logos.tienda}
                                        onFile={f => { setLogoTiendaFile(f); setEliminarTienda(false) }}
                                        onEliminar={() => { setLogoTiendaFile(null); setEliminarTienda(true) }}
                                        disabled={!puedeEditar}
                                    />
                                    <LogoSlot
                                        label="Logo panel admin"
                                        descripcion="Aparece en el sidebar del panel de administración."
                                        urlActual={logos.admin}
                                        onFile={f => { setLogoAdminFile(f); setEliminarAdmin(false) }}
                                        onEliminar={() => { setLogoAdminFile(null); setEliminarAdmin(true) }}
                                        disabled={!puedeEditar}
                                    />
                                </div>

                                <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>
                                                <Button
                                                    onClick={guardarLogos}
                                                    disabled={guardandoLogos || !puedeEditar || (!logoTiendaFile && !logoAdminFile && !eliminarTienda && !eliminarAdmin)}
                                                >
                                                    {guardandoLogos ? 'Guardando…' : 'Guardar logotipos'}
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        {!puedeEditar && <TooltipContent>No tienes permiso para editar</TooltipContent>}
                                    </Tooltip>
                                </div>
                            </TabsContent>

                            {/* ── Botones ───────────────────────────────────── */}
                            <TabsContent value="botones">
                                <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-6">

                                    <TokenSelector
                                        label="Color de fondo"
                                        value={formBotones.bg}
                                        onChange={v => setFormBotones(f => ({ ...f, bg: v }))}
                                        opciones={tokensColor}
                                        disabled={!puedeEditar}
                                    />

                                    <div className="border-t border-slate-100" />

                                    <TokenSelector
                                        label="Color de texto"
                                        value={formBotones.text}
                                        onChange={v => setFormBotones(f => ({ ...f, text: v }))}
                                        opciones={tokensTexto}
                                        disabled={!puedeEditar}
                                    />

                                    <div className="border-t border-slate-100" />

                                    {/* Preview */}
                                    <div className="space-y-2">
                                        <Label>Vista previa</Label>
                                        <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
                                            <button
                                                type="button"
                                                className="px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ease-in-out"
                                                style={{
                                                    backgroundColor: resolverHex(formBotones.bg),
                                                    color:           resolverHex(formBotones.text),
                                                }}
                                            >
                                                Agregar al carrito
                                            </button>
                                            <button
                                                type="button"
                                                className="px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ease-in-out"
                                                style={{
                                                    backgroundColor: resolverHex(formBotones.bg),
                                                    color:           resolverHex(formBotones.text),
                                                }}
                                            >
                                                Comprar ahora
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>
                                                <Button
                                                    onClick={guardarBotones}
                                                    disabled={guardandoBotones || !puedeEditar}
                                                >
                                                    {guardandoBotones ? 'Guardando…' : 'Guardar botones'}
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        {!puedeEditar && <TooltipContent>No tienes permiso para editar</TooltipContent>}
                                    </Tooltip>
                                </div>
                            </TabsContent>

                            {/* ── SEO ───────────────────────────────────────── */}
                            <TabsContent value="seo">
                                <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="seo-nombre-tienda">Nombre de la tienda</Label>
                                        <Input
                                            id="seo-nombre-tienda"
                                            value={formSeo.nombre_tienda}
                                            maxLength={60}
                                            disabled={!puedeEditar}
                                            onChange={e => setFormSeo(f => ({ ...f, nombre_tienda: e.target.value }))}
                                            placeholder="Mi tienda"
                                        />
                                        <p className="text-xs text-slate-500">
                                            Aparece en el título de las pestañas del navegador y en los resultados de búsqueda de Google.
                                        </p>
                                    </div>

                                    <div className="border-t border-slate-100" />

                                    <div className="space-y-2">
                                        <Label htmlFor="seo-telefono-tienda">
                                            Teléfono de contacto <span className="text-slate-500 font-normal">(opcional)</span>
                                        </Label>
                                        <Input
                                            id="seo-telefono-tienda"
                                            value={formSeo.telefono_tienda}
                                            maxLength={30}
                                            disabled={!puedeEditar}
                                            onChange={e => setFormSeo(f => ({ ...f, telefono_tienda: e.target.value }))}
                                            placeholder="3001234567"
                                        />
                                        <p className="text-xs text-slate-500">
                                            Se incluye en las notificaciones por WhatsApp al cliente como número de contacto de la tienda.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>
                                                <Button
                                                    onClick={guardarSeo}
                                                    disabled={guardandoSeo || !puedeEditar || !formSeo.nombre_tienda.trim()}
                                                >
                                                    {guardandoSeo ? 'Guardando…' : 'Guardar datos de tienda'}
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        {!puedeEditar && <TooltipContent>No tienes permiso para editar</TooltipContent>}
                                    </Tooltip>
                                </div>
                            </TabsContent>

                        </div>
                    </Tabs>

                </div>
            </TooltipProvider>
        </>
    )
}

Theme.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={[
        { label: 'Panel', href: route('admin.dashboard') },
        { label: 'LinkiuBuild' },
        { label: 'Theme' },
    ]}>{page}</AdminLayout>
)
