import { useEffect, useState, type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { AlertTriangle, Crosshair, ExternalLink, FlaskConical, Bug, Copy, Check } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/Alert'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'
import MetaLogo from '@/Components/icons/MetaLogo'
import GoogleLogo from '@/Components/icons/GoogleLogo'

interface Pixeles {
    fb_pixel_id:               string | null
    fb_test_event_code:        string | null
    google_ads_id:             string | null
    google_ads_purchase_label: string | null
}

interface Props {
    pixeles:    Pixeles
    probar_url: string | null
}

function CopyChip({ texto }: { texto: string }) {
    const [copiado, setCopiado] = useState(false)

    function copiar() {
        navigator.clipboard.writeText(texto)
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2000)
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={copiar}
            className="font-mono bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
            <span>{texto}</span>
            {copiado
                ? <Check className="w-3 h-3 text-emerald-500" />
                : <Copy className="w-3 h-3 text-slate-400" />
            }
        </Button>
    )
}

interface SharedProps {
    auth:  { permissions: string[] }
    flash: { status?: string }
}

export default function PixelesADS({ pixeles, probar_url }: Props) {
    const { props } = usePage<SharedProps>()
    const puede = (permiso: string) =>
        props.auth.permissions.includes('*') || props.auth.permissions.includes(permiso)
    const puedeEditar = puede('integraciones.editar')

    useEffect(() => {
        if (props.flash?.status) toast.success(props.flash.status)
    }, [props.flash?.status])

    const [form, setForm] = useState({
        fb_pixel_id:               pixeles.fb_pixel_id               ?? '',
        fb_test_event_code:        pixeles.fb_test_event_code        ?? '',
        google_ads_id:             pixeles.google_ads_id             ?? '',
        google_ads_purchase_label: pixeles.google_ads_purchase_label ?? '',
    })
    const [guardando, setGuardando] = useState(false)

    // Modo prueba activo: bloquea silenciosamente las conversiones en producción.
    const modoPruebaActivo = !!form.fb_test_event_code.trim()

    function guardar() {
        setGuardando(true)
        router.post(route('admin.integraciones.pixeles.update'), form, {
            preserveScroll: true,
            onError:   () => toast.error('Error al guardar los pixeles'),
            onFinish:  () => setGuardando(false),
        })
    }

    return (
        <>
            <Head title="Pixeles ADS" />

            <TooltipProvider>
                <div className="space-y-6">

                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Crosshair className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-900">Pixeles ADS</h1>
                            <p className="text-xs text-slate-500">Conecta tus plataformas de publicidad para trackear conversiones.</p>
                        </div>
                    </div>

                    {modoPruebaActivo && (
                        <Alert variant="warning">
                            <AlertTriangle />
                            <AlertTitle>Modo de prueba activo</AlertTitle>
                            <AlertDescription>
                                Los eventos van marcados como TEST y <strong>no se registran en Meta Ads Manager</strong>. Vacía el campo "Código de prueba" antes de salir a producción.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-2 gap-4">

                    {/* Meta Pixel */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-5">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                <MetaLogo className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">Meta Pixel (Facebook)</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Rastrea visitas, añadir al carrito y compras desde Facebook e Instagram Ads.</p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="fb_pixel_id">Pixel ID</Label>
                            <Input
                                id="fb_pixel_id"
                                value={form.fb_pixel_id}
                                onChange={e => setForm(f => ({ ...f, fb_pixel_id: e.target.value }))}
                                placeholder="Ej: 1234567890123456"
                                disabled={!puedeEditar}
                                className="font-mono text-sm"
                            />
                            <p className="text-[11px] text-slate-500">Solo números. Encuéntralo en Meta Events Manager.</p>
                        </div>

                        <div className="space-y-1.5 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2 mb-2">
                                <FlaskConical className="w-3.5 h-3.5 text-amber-500" />
                                <Label htmlFor="fb_test_event_code">
                                    Código de prueba <span className="text-slate-500 font-normal">(Test Events)</span>
                                </Label>
                            </div>
                            <Input
                                id="fb_test_event_code"
                                value={form.fb_test_event_code}
                                onChange={e => setForm(f => ({ ...f, fb_test_event_code: e.target.value }))}
                                placeholder="TEST12345"
                                disabled={!puedeEditar}
                                className="font-mono text-sm"
                            />
                            <p className="text-[11px] text-slate-500">
                                Permite ver eventos en tiempo real en Meta sin contaminar datos reales. Déjalo vacío en producción.
                            </p>
                        </div>

                        <a
                            href="https://www.facebook.com/events/manager"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors duration-200"
                        >
                            Ir a Meta Events Manager
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    {/* Google Ads */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-5">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                <GoogleLogo className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">Google Ads</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Mide conversiones y optimiza tus campañas de Google Ads.</p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="google_ads_id">ID de conversión</Label>
                            <Input
                                id="google_ads_id"
                                value={form.google_ads_id}
                                onChange={e => setForm(f => ({ ...f, google_ads_id: e.target.value }))}
                                placeholder="AW-XXXXXXXXX"
                                disabled={!puedeEditar}
                                className="font-mono text-sm"
                            />
                            <p className="text-[11px] text-slate-500">Encuéntralo en Google Ads → Herramientas → Conversiones.</p>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="google_ads_purchase_label">Conversion label (Purchase)</Label>
                            <Input
                                id="google_ads_purchase_label"
                                value={form.google_ads_purchase_label}
                                onChange={e => setForm(f => ({ ...f, google_ads_purchase_label: e.target.value }))}
                                placeholder="abcDEF123_xY"
                                disabled={!puedeEditar}
                                className="font-mono text-sm"
                            />
                            <p className="text-[11px] text-slate-500">
                                Label específico de la acción de conversión "Purchase". Lo encuentras en el snippet que Google te muestra al crear la conversión, después del `/` del send_to.
                            </p>
                        </div>

                        <a
                            href="https://ads.google.com/aw/conversions"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors duration-200"
                        >
                            Ir a Google Ads Conversiones
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    </div>{/* fin grid Meta + Google */}

                    {/* Debug Panel */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6">
                        <div className="flex items-start gap-4 mb-5">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                <Bug className="size-4 text-slate-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">Debug Panel</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Panel flotante que muestra los eventos Meta y Google Ads en tiempo real en cualquier página de la tienda.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs text-slate-600">Agrega este parámetro a la URL de cualquier página pública para activarlo:</p>
                            <CopyChip texto="?debug_pixel=1" />

                            <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-[11px] text-slate-500 leading-relaxed">
                                <p><span className="font-semibold text-slate-700">Cómo usarlo:</span></p>
                                <ol className="list-decimal list-inside space-y-1">
                                    <li>Copia el parámetro de arriba.</li>
                                    <li>Abre cualquier página de la tienda (home, productos, detalle, checkout, confirmación) y pégalo al final de la URL.</li>
                                    <li>Aparecerá un panel flotante en la esquina inferior derecha.</li>
                                    <li>Cada evento que se dispare (PageView, ViewContent, Purchase…) aparecerá con un badge Meta o Google y su payload.</li>
                                </ol>
                                <p className="pt-1 text-slate-500">Solo visible con el parámetro activo — los clientes nunca lo verán.</p>
                            </div>

                            {probar_url && (
                                <a
                                    href={probar_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200"
                                >
                                    <FlaskConical className="w-3.5 h-3.5" />
                                    Abrir producto con debug activado
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button onClick={guardar} disabled={guardando || !puedeEditar}>
                                        {guardando ? 'Guardando…' : 'Guardar cambios'}
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            {!puedeEditar && <TooltipContent>No tienes permiso para editar</TooltipContent>}
                        </Tooltip>
                    </div>

                </div>
            </TooltipProvider>
        </>
    )
}

PixelesADS.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={[
        { label: 'Panel', href: route('admin.dashboard') },
        { label: 'Integraciones' },
    ]}>{page}</AdminLayout>
)
