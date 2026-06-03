import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Copy, Sparkles } from 'lucide-react'
import { Input } from '@/Components/ui/Input'
import { Button } from '@/Components/ui/Button'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/Components/ui/Select'
import { Switch } from '@/Components/ui/Switch'

interface Producto {
    id:     number
    nombre: string
    slug:   string
}

interface PaginaFija {
    valor:  string
    nombre: string
}

interface Props {
    productos?:       Producto[]
    paginas_fijas?:   PaginaFija[]
    base_url?:        string
    paginaPreseleccionada?: string  // ej. '/productos/melatonina' cuando se abre desde un producto
    paginaFijaNombre?:      string  // si viene, el selector se oculta y se muestra readonly (caso modal contextual)
}

type Origen = 'facebook' | 'instagram' | 'google' | 'tiktok' | 'email' | 'direct' | 'otros'
type Tipo   = 'paid' | 'organic' | 'email' | 'social'

const ORIGENES: { valor: Origen; label: string }[] = [
    { valor: 'facebook',  label: 'Facebook'  },
    { valor: 'instagram', label: 'Instagram' },
    { valor: 'google',    label: 'Google'    },
    { valor: 'tiktok',    label: 'TikTok'    },
    { valor: 'email',     label: 'Email'     },
    { valor: 'direct',    label: 'Directo'   },
    { valor: 'otros',     label: 'Otros'     },
]

const TIPOS: { valor: Tipo; label: string }[] = [
    { valor: 'paid',    label: 'Anuncio pagado' },
    { valor: 'organic', label: 'Orgánico'       },
    { valor: 'email',   label: 'Email'          },
    { valor: 'social',  label: 'Social'         },
]

/**
 * Sanitiza un texto para uso en URL: minusculas, espacios->guion, sin
 * caracteres especiales. Lo usamos en utm_campaign / utm_content / utm_term.
 */
function slugify(s: string): string {
    return s.toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

/**
 * Formulario reutilizable que arma URLs UTM. Usado tanto en el modulo
 * standalone como en el modal contextual del producto.
 */
export function FormularioUTM({
    productos             = [],
    paginas_fijas         = [],
    base_url,
    paginaPreseleccionada,
    paginaFijaNombre,
}: Props) {
    const [pagina,    setPagina]    = useState<string>(paginaPreseleccionada ?? '/')
    const [origen,    setOrigen]    = useState<Origen>('facebook')
    const [tipo,      setTipo]      = useState<Tipo>('paid')
    const [campana,   setCampana]   = useState('')
    const [variante,  setVariante]  = useState('')
    const [modoMeta,  setModoMeta]  = useState(false)

    // Si no recibimos base_url (caso del modal contextual), usamos el origen
    // del navegador. Equivalente al base_url que mandaria el backend.
    const baseUrlEfectiva = base_url ?? (typeof window !== 'undefined' ? window.location.origin : '')

    const urlGenerada = useMemo(() => {
        const base = baseUrlEfectiva.replace(/\/$/, '') + pagina
        const params: string[] = []

        // utm_source: en modo Meta, usar {{site_source_name}} para que se
        // ajuste automaticamente segun donde se muestre el anuncio (FB, IG, etc.).
        if (modoMeta && (origen === 'facebook' || origen === 'instagram')) {
            params.push('utm_source={{site_source_name}}')
        } else {
            params.push(`utm_source=${origen}`)
        }

        params.push(`utm_medium=${tipo}`)

        // utm_campaign: en modo Meta, usar {{campaign.name}}. Sino, el nombre
        // que escribio el admin (slugified).
        if (modoMeta && (origen === 'facebook' || origen === 'instagram')) {
            params.push('utm_campaign={{campaign.name}}')
            params.push('utm_content={{ad.name}}')
            params.push('utm_term={{adset.name}}')
        } else {
            if (campana.trim()) {
                params.push(`utm_campaign=${slugify(campana)}`)
            }
            if (variante.trim()) {
                params.push(`utm_content=${slugify(variante)}`)
            }
        }

        return `${base}?${params.join('&')}`
    }, [pagina, origen, tipo, campana, variante, modoMeta, baseUrlEfectiva])

    async function copiar() {
        try {
            await navigator.clipboard.writeText(urlGenerada)
            toast.success('Enlace copiado al portapapeles')
        } catch {
            toast.error('No se pudo copiar — intentá manualmente')
        }
    }

    const esMeta = origen === 'facebook' || origen === 'instagram'

    return (
        <div className="space-y-4">
            {/* Página destino: selector cuando hay opciones, readonly cuando viene fija (modal). */}
            {paginaFijaNombre ? (
                <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">Página destino</label>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        {paginaFijaNombre}
                    </div>
                </div>
            ) : (
                <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">Página destino</label>
                    <Select value={pagina} onValueChange={setPagina}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {paginas_fijas.map(p => (
                                <SelectItem key={p.valor} value={p.valor}>{p.nombre}</SelectItem>
                            ))}
                            {productos.length > 0 && (
                                <>
                                    <SelectItem value="__separator__" disabled>— Productos —</SelectItem>
                                    {productos.map(p => (
                                        <SelectItem key={p.id} value={`/productos/${p.slug}`}>
                                            Producto: {p.nombre}
                                        </SelectItem>
                                    ))}
                                </>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Origen + Tipo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">¿De dónde viene?</label>
                    <Select value={origen} onValueChange={v => setOrigen(v as Origen)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {ORIGENES.map(o => (
                                <SelectItem key={o.valor} value={o.valor}>{o.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">Tipo de tráfico</label>
                    <Select value={tipo} onValueChange={v => setTipo(v as Tipo)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {TIPOS.map(t => (
                                <SelectItem key={t.valor} value={t.valor}>{t.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Nombre campaña + Variante */}
            <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">
                    Nombre de la campaña
                    {modoMeta && esMeta && <span className="ml-2 text-slate-400 normal-case font-normal">(Meta lo asigna automático)</span>}
                </label>
                <Input
                    value={campana}
                    onChange={e => setCampana(e.target.value)}
                    placeholder="Ej: Black Friday Melatonina"
                    disabled={modoMeta && esMeta}
                />
            </div>

            <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">
                    Variante <span className="normal-case font-normal text-slate-400">(opcional)</span>
                </label>
                <Input
                    value={variante}
                    onChange={e => setVariante(e.target.value)}
                    placeholder="Ej: Video 30 segundos"
                    disabled={modoMeta && esMeta}
                />
            </div>

            {/* Modo avanzado Meta */}
            {esMeta && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <Sparkles className="size-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-blue-900">Modo avanzado Meta</span>
                            <Switch checked={modoMeta} onCheckedChange={setModoMeta} />
                        </div>
                        <p className="text-xs text-blue-700 mt-1">
                            Genera el enlace con placeholders dinámicos (<code className="bg-white px-1 rounded">{`{{campaign.name}}`}</code>,
                            <code className="bg-white px-1 rounded ml-1">{`{{ad.name}}`}</code>). Pegalo una vez en el campo
                            <strong> "Parámetros de URL"</strong> de Meta Ads Manager — se rellena automático en cada anuncio.
                        </p>
                    </div>
                </div>
            )}

            {/* URL generada */}
            <div className="border-t border-slate-200 pt-4">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">Enlace generado</label>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700 break-all">
                    {urlGenerada}
                </div>
                <Button onClick={copiar} className="mt-3 w-full gap-2">
                    <Copy className="size-4" />
                    Copiar enlace
                </Button>
            </div>
        </div>
    )
}
