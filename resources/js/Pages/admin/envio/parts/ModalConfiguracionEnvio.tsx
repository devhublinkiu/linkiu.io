import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { Truck, Phone, ExternalLink } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/Select'
import { DANES_CAPITALES } from './danesCapitales'

interface Preset {
    key:    string
    label:  string
    weight: number
    height: number
    width:  number
    length: number
    declaredValue: number
}

interface ConfigData {
    configurado:           boolean
    tiene_api_key:         boolean
    bodega_dane_code:      string | null
    paquete_preset:        string
    presets_disponibles:   Preset[]
}

interface Props {
    open:    boolean
    onClose: () => void
}

const TOKEN_NO_CAMBIAR = '***'
const SOPORTE_WHATSAPP = '573104594344' // Linkiu

export default function ModalConfiguracionEnvio({ open, onClose }: Props) {
    const [cargando,  setCargando]  = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [config,    setConfig]    = useState<ConfigData | null>(null)
    const [apiKey,    setApiKey]    = useState('')
    const [bodega,    setBodega]    = useState('')
    const [preset,    setPreset]    = useState('pequeno')

    useEffect(() => {
        if (!open) return
        setCargando(true)
        axios.get<ConfigData>(route('admin.envio.mipaquete.config'))
            .then(res => {
                setConfig(res.data)
                setApiKey(res.data.tiene_api_key ? TOKEN_NO_CAMBIAR : '')
                setBodega(res.data.bodega_dane_code ?? '')
                setPreset(res.data.paquete_preset)
            })
            .catch(() => toast.error('No se pudo cargar la configuración'))
            .finally(() => setCargando(false))
    }, [open])

    function guardar() {
        setGuardando(true)
        axios.post(route('admin.envio.mipaquete.config.save'), {
            mipaquete_api_key: apiKey,
            bodega_dane_code:  bodega,
            paquete_preset:    preset,
        })
            .then(() => {
                toast.success('Configuración guardada')
                onClose()
            })
            .catch(err => {
                const msg = err?.response?.data?.errors?.bodega_dane_code?.[0]
                    ?? 'Error al guardar'
                toast.error(msg)
            })
            .finally(() => setGuardando(false))
    }

    return (
        <Sheet open={open} onOpenChange={v => !v && onClose()}>
            <SheetContent className="sm:max-w-md flex flex-col">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Truck className="size-4 text-slate-600" />
                        Configuración de envíos
                    </SheetTitle>
                    <SheetDescription>
                        Conecta Mipaquete para sugerir costos por departamento al crear zonas.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

                    {/* Banner — cómo obtener API key */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 flex items-start gap-2.5">
                        <Phone className="size-4 text-blue-600 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-blue-900">¿Cómo obtengo la API key?</p>
                            <p className="text-[11px] text-blue-700 mt-0.5">
                                Solicítala al equipo de Linkiu por WhatsApp.
                            </p>
                            <a
                                href={`https://wa.me/${SOPORTE_WHATSAPP}?text=Hola%20Linkiu%2C%20necesito%20mi%20API%20key%20de%20Mipaquete`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 mt-1.5"
                            >
                                Solicitar por WhatsApp
                                <ExternalLink className="size-2.5" />
                            </a>
                        </div>
                    </div>

                    {cargando ? (
                        <p className="text-sm text-slate-400 text-center py-8">Cargando…</p>
                    ) : (
                        <>
                            {/* API Key */}
                            <div className="space-y-1.5">
                                <Label htmlFor="mp-apikey">API Key de Mipaquete</Label>
                                <Input
                                    id="mp-apikey"
                                    type="password"
                                    value={apiKey}
                                    onChange={e => setApiKey(e.target.value)}
                                    onFocus={e => { if (e.target.value === TOKEN_NO_CAMBIAR) setApiKey('') }}
                                    onBlur={e => { if (e.target.value === '' && config?.tiene_api_key) setApiKey(TOKEN_NO_CAMBIAR) }}
                                    placeholder={config?.tiene_api_key ? '••• guardada' : 'Pega aquí tu API key'}
                                    className="font-mono text-xs"
                                />
                                <p className="text-[11px] text-slate-500">Se guarda cifrada en la base de datos.</p>
                            </div>

                            {/* Bodega */}
                            <div className="space-y-1.5">
                                <Label>Bodega de origen</Label>
                                <Select value={bodega} onValueChange={setBodega}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona el departamento de tu bodega" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(DANES_CAPITALES).map(([nombre, code]) => (
                                            <SelectItem key={code} value={code}>{nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[11px] text-slate-500">Capital del departamento donde está tu bodega — define el punto de origen de las cotizaciones.</p>
                            </div>

                            {/* Paquete promedio */}
                            <div className="space-y-1.5">
                                <Label>Paquete promedio</Label>
                                <Select value={preset} onValueChange={setPreset}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tipo de paquete" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {config?.presets_disponibles?.map(p => (
                                            <SelectItem key={p.key} value={p.key}>
                                                {p.label} · {p.weight} kg
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {(() => {
                                    const p = config?.presets_disponibles?.find(x => x.key === preset)
                                    if (!p) return null
                                    return (
                                        <p className="text-[11px] text-slate-500">
                                            {p.weight} kg · {p.length}×{p.width}×{p.height} cm · valor declarado ${p.declaredValue.toLocaleString('es-CO')}
                                        </p>
                                    )
                                })()}
                            </div>
                        </>
                    )}

                </div>

                <SheetFooter>
                    <Button onClick={guardar} disabled={guardando || cargando}>
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </Button>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
