import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import axios from 'axios'
import { toast } from 'sonner'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Button } from '@/Components/ui/Button'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/Components/ui/Dialog'
import DptoSelector from './DptoSelector'
import TipoCostoSelector from './TipoCostoSelector'
import type { SugerenciaCotizacion } from './BadgeSugerencia'
import { DANES_CAPITALES } from './danesCapitales'
import type {
    CiudadApi,
    DepartamentoSeleccionado,
    DptoApi,
    TipoCosto,
    ZonaEnvio,
} from './types'

// Re-export para mantener la API pública del componente para Index.tsx.
export type { ZonaEnvio } from './types'

interface Props {
    open:    boolean
    zona:    ZonaEnvio | null
    onClose: () => void
}

export default function ZonaDialog({ open, zona, onClose }: Props) {
    const [nombre,        setNombre]        = useState('')
    const [seleccionados, setSeleccionados] = useState<DepartamentoSeleccionado[]>([])
    const [tipoCosto,     setTipoCosto]     = useState<TipoCosto>('costo_fijo')
    const [costo,         setCosto]         = useState('')
    const [umbral,        setUmbral]        = useState('')
    const [guardando,     setGuardando]     = useState(false)

    const [dptos,    setDptos]    = useState<DptoApi[]>([])
    const [ciudades, setCiudades] = useState<CiudadApi[]>([])
    const [cargando, setCargando] = useState(false)

    // Mapa codigo_dane → cotización sugerida vía Mipaquete. Se carga en
    // paralelo a los departamentos (fire-and-forget); si falla, los badges
    // simplemente no aparecen.
    const [sugerencias, setSugerencias] = useState<Record<string, SugerenciaCotizacion | null>>({})

    useEffect(() => {
        if (!open) return
        if (Object.keys(sugerencias).length > 0) return

        axios.post<{ configurado: boolean; sugerencias: Record<string, SugerenciaCotizacion | null> }>(
            route('admin.envio.mipaquete.sugerencias'),
            { codigos: Object.values(DANES_CAPITALES) },
        )
            .then(res => {
                if (res.data.configurado) setSugerencias(res.data.sugerencias ?? {})
            })
            .catch(() => {/* silencioso — sin badges si falla */})
    }, [open])

    // Carga departamentos y ciudades una sola vez desde nuestro endpoint
    // (proxy cacheado 24h a api-colombia.com). Si el backend devuelve 503,
    // mostramos el error que el backend envía — no exponemos el detalle externo.
    useEffect(() => {
        if (!open) return
        if (dptos.length > 0) return   // ya cargado en esta sesión

        setCargando(true)
        fetch(route('admin.envio.colombia-data'))
            .then(async (r) => {
                if (!r.ok) {
                    const data = await r.json().catch(() => ({ error: 'Error al cargar los datos' }))
                    throw new Error(data.error as string)
                }
                return r.json() as Promise<{ departamentos: DptoApi[]; ciudades: CiudadApi[] }>
            })
            .then(({ departamentos, ciudades }) => {
                setDptos(departamentos.sort((a, b) => a.name.localeCompare(b.name)))
                setCiudades(ciudades)
            })
            .catch((e: Error) => toast.error(e.message))
            .finally(() => setCargando(false))
    }, [open, dptos.length])

    // Resetea el formulario al abrir / cambiar zona
    useEffect(() => {
        if (!open) return
        if (zona) {
            setNombre(zona.nombre)
            setSeleccionados(zona.departamentos)
            setTipoCosto(zona.tipo_costo)
            setCosto(zona.costo != null ? String(zona.costo) : '')
            setUmbral(zona.umbral_gratis != null ? String(zona.umbral_gratis) : '')
        } else {
            setNombre('')
            setSeleccionados([])
            setTipoCosto('costo_fijo')
            setCosto('')
            setUmbral('')
        }
    }, [open, zona])

    function guardar() {
        const payload = {
            nombre,
            departamentos: seleccionados,
            tipo_costo:    tipoCosto,
            costo:         tipoCosto !== 'gratis'       && costo  !== '' ? parseInt(costo)  : null,
            umbral_gratis: tipoCosto === 'gratis_desde' && umbral !== '' ? parseInt(umbral) : null,
        }

        setGuardando(true)
        const routeName = zona ? 'admin.envio.zonas.update' : 'admin.envio.zonas.store'
        const routeArgs = zona ? zona.id : undefined

        // toast.success viene del flash unificado del backend (Zona creada/actualizada).
        // Tipamos el payload con Record<string, unknown> — Inertia acepta cualquier
        // shape serializable, no necesitamos un tipo exacto que reproduzca el FormRequest.
        router.post(route(routeName, routeArgs), payload as unknown as Record<string, unknown>, {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onError:   (errors) => toast.error((errors.zona as string | undefined) ?? 'Error al guardar'),
            onFinish:  () => setGuardando(false),
        })
    }

    const totalCiudades = seleccionados.reduce((acc, d) => acc + d.ciudades.length, 0)
    const canGuardar = nombre.trim() !== '' && seleccionados.length > 0 && totalCiudades > 0

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>{zona ? 'Editar zona' : 'Nueva zona de envío'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-1">
                    <div className="space-y-1.5">
                        <Label>Nombre de la zona</Label>
                        <Input
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            placeholder="Ej. Costa Atlántica"
                            className="text-sm"
                        />
                    </div>

                    <DptoSelector
                        dptos={dptos}
                        ciudades={ciudades}
                        cargando={cargando}
                        seleccionados={seleccionados}
                        onChange={setSeleccionados}
                        sugerencias={sugerencias}
                    />

                    <TipoCostoSelector
                        tipoCosto={tipoCosto}
                        costo={costo}
                        umbral={umbral}
                        onTipoCostoChange={setTipoCosto}
                        onCostoChange={setCosto}
                        onUmbralChange={setUmbral}
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={guardando}>Cancelar</Button>
                    <Button onClick={guardar} disabled={guardando || !canGuardar}>
                        {guardando ? 'Guardando…' : zona ? 'Guardar cambios' : 'Crear zona'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
