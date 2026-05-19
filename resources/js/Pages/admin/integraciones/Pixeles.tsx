import { useState, type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { Crosshair, ExternalLink, FlaskConical, Bug, Copy, Check } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'

interface Pixeles {
    fb_pixel_id:        string | null
    fb_test_event_code: string | null
    google_ads_id:      string | null
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

export default function PixelesADS({ pixeles, probar_url }: Props) {
    const { props } = usePage<{ auth: { permissions: string[] } }>()
    const puede = (permiso: string) =>
        props.auth.permissions.includes('*') || props.auth.permissions.includes(permiso)
    const puedeEditar = puede('integraciones.editar')

    const [form, setForm] = useState({
        fb_pixel_id:        pixeles.fb_pixel_id        ?? '',
        fb_test_event_code: pixeles.fb_test_event_code ?? '',
        google_ads_id:      pixeles.google_ads_id      ?? '',
    })
    const [guardando, setGuardando] = useState(false)

    function guardar() {
        setGuardando(true)
        router.post(route('admin.integraciones.pixeles.update'), form, {
            preserveScroll: true,
            onSuccess: () => toast.success('Pixeles guardados correctamente'),
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

                    <div className="grid grid-cols-2 gap-4">

                    {/* Meta Pixel */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1877F2]">
                                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">Meta Pixel (Facebook)</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Rastrea visitas, añadir al carrito y compras desde Facebook e Instagram Ads.</p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="fb_pixel_id" className="text-xs font-medium text-slate-700">Pixel ID</label>
                            <Input
                                id="fb_pixel_id"
                                value={form.fb_pixel_id}
                                onChange={e => setForm(f => ({ ...f, fb_pixel_id: e.target.value }))}
                                placeholder="Ej: 1234567890123456"
                                disabled={!puedeEditar}
                                className="font-mono text-sm"
                            />
                            <p className="text-[11px] text-slate-400">Solo números. Encuéntralo en Meta Events Manager.</p>
                        </div>

                        <div className="space-y-1.5 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2 mb-2">
                                <FlaskConical className="w-3.5 h-3.5 text-amber-500" />
                                <label htmlFor="fb_test_event_code" className="text-xs font-medium text-slate-700">
                                    Código de prueba <span className="text-slate-400 font-normal">(Test Events)</span>
                                </label>
                            </div>
                            <Input
                                id="fb_test_event_code"
                                value={form.fb_test_event_code}
                                onChange={e => setForm(f => ({ ...f, fb_test_event_code: e.target.value }))}
                                placeholder="TEST12345"
                                disabled={!puedeEditar}
                                className="font-mono text-sm"
                            />
                            <p className="text-[11px] text-slate-400">
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
                    <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                <svg viewBox="0 0 24 24" className="w-5 h-5">
                                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">Google Ads</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Mide conversiones y optimiza tus campañas de Google Ads.</p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="google_ads_id" className="text-xs font-medium text-slate-700">ID de conversión</label>
                            <Input
                                id="google_ads_id"
                                value={form.google_ads_id}
                                onChange={e => setForm(f => ({ ...f, google_ads_id: e.target.value }))}
                                placeholder="AW-XXXXXXXXX"
                                disabled={!puedeEditar}
                                className="font-mono text-sm"
                            />
                            <p className="text-[11px] text-slate-400">Encuéntralo en Google Ads → Herramientas → Conversiones.</p>
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
                    <div className="rounded-xl border border-slate-200 bg-white p-6">
                        <div className="flex items-start gap-4 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                <Bug className="w-4.5 h-4.5 text-slate-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">Debug Panel</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Panel flotante en la vista de producto que muestra los eventos en tiempo real directamente en la página.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs text-slate-600">Agrega este parámetro a la URL del producto para activarlo:</p>
                            <CopyChip texto="?debug_pixel=1" />

                            <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-[11px] text-slate-500 leading-relaxed">
                                <p><span className="font-semibold text-slate-700">Cómo usarlo:</span></p>
                                <ol className="list-decimal list-inside space-y-1">
                                    <li>Copia el parámetro de arriba.</li>
                                    <li>Abre el producto y pégalo al final de la URL.</li>
                                    <li>Aparecerá un panel flotante en la esquina inferior derecha.</li>
                                    <li>Cada evento que se dispare (ViewContent, AddToCart…) aparecerá ahí con su payload.</li>
                                </ol>
                                <p className="pt-1 text-slate-400">Solo visible con el parámetro activo — los clientes nunca lo verán.</p>
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
