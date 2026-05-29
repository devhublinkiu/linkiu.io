import { useState } from 'react'
import { router } from '@inertiajs/react'
import axios from 'axios'
import { toast } from 'sonner'
import { CheckCircle2, AlertCircle, KeyRound, Loader2, ExternalLink } from 'lucide-react'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Button } from '@/Components/ui/Button'

interface Props {
    configurada: boolean
    puedeEditar: boolean
}

const TOKEN_NO_CAMBIAR = '***'

export default function ConfigCardMastershop({ configurada, puedeEditar }: Props) {
    const [apiKey, setApiKey]       = useState(configurada ? TOKEN_NO_CAMBIAR : '')
    const [guardando, setGuardando] = useState(false)
    const [probando, setProbando]   = useState(false)

    function guardar() {
        if (!puedeEditar) return
        setGuardando(true)
        router.post(route('admin.integraciones.mastershop.update'),
            { mastershop_api_key: apiKey },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('API key guardada correctamente')
                    if (apiKey !== TOKEN_NO_CAMBIAR && apiKey !== '') {
                        setApiKey(TOKEN_NO_CAMBIAR)
                    }
                },
                onError:   () => toast.error('Error al guardar la API key'),
                onFinish:  () => setGuardando(false),
            },
        )
    }

    async function probar() {
        setProbando(true)
        try {
            const res = await axios.post<{ ok: boolean; mensaje: string }>(
                route('admin.integraciones.mastershop.probar'),
                { api_key: apiKey || null },
            )
            if (res.data.ok) toast.success(res.data.mensaje)
            else             toast.error(res.data.mensaje)
        } catch {
            toast.error('Error al probar la conexión')
        } finally {
            setProbando(false)
        }
    }

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-6">

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-slate-500" />
                    <h2 className="text-lg font-bold text-slate-900">Configuración API</h2>
                </div>
                {configurada ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Conectada
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                        <AlertCircle className="w-3 h-3" />
                        Sin configurar
                    </span>
                )}
            </div>

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="ms-api-key">API key</Label>
                    <Input
                        id="ms-api-key"
                        type="password"
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        placeholder="Pegá tu ms-api-key acá"
                        disabled={!puedeEditar}
                        className="text-sm"
                    />
                    <p className="text-xs text-slate-500">
                        Se almacena cifrada con AES-256. Encontrala en tu panel Mastershop →
                        Configuración → API.
                    </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                    {puedeEditar && (
                        <Button onClick={guardar} disabled={guardando || apiKey === ''}>
                            {guardando && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                            Guardar
                        </Button>
                    )}
                    <Button variant="outline" onClick={probar} disabled={probando || (apiKey === '' && !configurada)}>
                        {probando && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                        Probar conexión
                    </Button>
                    <a
                        href="https://ayuda.mastershop.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-xs text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 transition-colors duration-200"
                    >
                        Documentación
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>

        </div>
    )
}
