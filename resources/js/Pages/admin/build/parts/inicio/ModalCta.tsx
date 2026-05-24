import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import TokenSelector from '../TokenSelector'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Textarea } from '@/Components/ui/Textarea'

interface StatItem { valor: string; etiqueta: string }

export interface CtaConfig {
    color_fondo:          string
    color_acento:         string
    color_texto:          string
    titulo_linea1:        string | null
    titulo_acento:        string | null
    descripcion:          string | null
    descripcion_acento:   string | null
    btn_primario_texto:   string | null
    btn_primario_link:    string | null
    btn_secundario_texto: string | null
    btn_secundario_link:  string | null
    stats:                StatItem[]
}

interface Colores { primario: string; secundario: string; acento: string }

interface Props {
    open:     boolean
    onClose:  () => void
    config:   CtaConfig | null
    colores:  Colores
    disabled: boolean
}

const DEFAULT_STATS: StatItem[] = [
    { valor: '1.200+', etiqueta: 'clientas satisfechas'    },
    { valor: '4.7★',   etiqueta: 'calificación promedio'   },
    { valor: '100%',   etiqueta: 'satisfacción garantizada' },
]

const EMPTY_STATS: StatItem[] = [
    { valor: '', etiqueta: '' },
    { valor: '', etiqueta: '' },
    { valor: '', etiqueta: '' },
]

export default function ModalCta({ open, onClose, config, colores, disabled }: Props) {
    const [colorFondo,          setColorFondo]          = useState('negro')
    const [colorAcento,         setColorAcento]         = useState('acento')
    const [colorTexto,          setColorTexto]          = useState('blanco')
    const [tituloLinea1,        setTituloLinea1]        = useState('')
    const [tituloAcento,        setTituloAcento]        = useState('')
    const [descripcion,         setDescripcion]         = useState('')
    const [descripcionAcento,   setDescripcionAcento]   = useState('')
    const [btnPrimarioTexto,    setBtnPrimarioTexto]    = useState('')
    const [btnPrimarioLink,     setBtnPrimarioLink]     = useState('')
    const [btnSecundarioTexto,  setBtnSecundarioTexto]  = useState('')
    const [btnSecundarioLink,   setBtnSecundarioLink]   = useState('')
    const [stats,               setStats]               = useState<StatItem[]>(DEFAULT_STATS)
    const [guardando,           setGuardando]           = useState(false)

    useEffect(() => {
        if (!open) return
        setColorFondo(config?.color_fondo               ?? 'negro')
        setColorAcento(config?.color_acento             ?? 'acento')
        setColorTexto(config?.color_texto               ?? 'blanco')
        setTituloLinea1(config?.titulo_linea1           ?? '')
        setTituloAcento(config?.titulo_acento           ?? '')
        setDescripcion(config?.descripcion              ?? '')
        setDescripcionAcento(config?.descripcion_acento ?? '')
        setBtnPrimarioTexto(config?.btn_primario_texto   ?? '')
        setBtnPrimarioLink(config?.btn_primario_link     ?? '')
        setBtnSecundarioTexto(config?.btn_secundario_texto ?? '')
        setBtnSecundarioLink(config?.btn_secundario_link   ?? '')
        setStats(config?.stats?.length === 3 ? config.stats : EMPTY_STATS)
    }, [open])

    const opcionesFondo = [
        { label: 'Principal',  value: 'primario',   hex: colores.primario   },
        { label: 'Secundario', value: 'secundario', hex: colores.secundario },
        { label: 'Acento',     value: 'acento',     hex: colores.acento     },
        { label: 'Negro',      value: 'negro',      hex: '#000000'          },
    ]

    const opcionesAcento = [
        { label: 'Principal',  value: 'primario',   hex: colores.primario   },
        { label: 'Secundario', value: 'secundario', hex: colores.secundario },
        { label: 'Acento',     value: 'acento',     hex: colores.acento     },
        { label: 'Blanco',     value: 'blanco',     hex: '#FFFFFF'          },
    ]

    const opcionesTexto = [
        { label: 'Principal',  value: 'primario',   hex: colores.primario   },
        { label: 'Secundario', value: 'secundario', hex: colores.secundario },
        { label: 'Acento',     value: 'acento',     hex: colores.acento     },
        { label: 'Blanco',     value: 'blanco',     hex: '#FFFFFF'          },
        { label: 'Negro',      value: 'negro',      hex: '#000000'          },
    ]

    function actualizarStat(i: number, campo: keyof StatItem, val: string) {
        setStats(prev => prev.map((s, idx) => idx === i ? { ...s, [campo]: val } : s))
    }

    function guardar() {
        setGuardando(true)
        router.post(route('admin.build.inicio.cta.config'), {
            color_fondo:          colorFondo,
            color_acento:         colorAcento,
            color_texto:          colorTexto,
            titulo_linea1:        tituloLinea1        || null,
            titulo_acento:        tituloAcento        || null,
            descripcion:          descripcion         || null,
            descripcion_acento:   descripcionAcento   || null,
            btn_primario_texto:   btnPrimarioTexto    || null,
            btn_primario_link:    btnPrimarioLink     || null,
            btn_secundario_texto: btnSecundarioTexto  || null,
            btn_secundario_link:  btnSecundarioLink   || null,
            stats,
        }, {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onError:   () => toast.error('Error al guardar'),
            onFinish:  () => setGuardando(false),
        })
    }

    return (
        <Sheet open={open} onOpenChange={v => { if (!v) onClose() }}>
            <SheetContent className="sm:max-w-lg flex flex-col">
                <SheetHeader>
                    <SheetTitle>CTA Final</SheetTitle>
                    <SheetDescription>Bloque de cierre con llamada a acción.</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

                    <TokenSelector label="Color de fondo"  value={colorFondo}  onChange={setColorFondo}  opciones={opcionesFondo}  disabled={disabled} />
                    <TokenSelector label="Color de texto"  value={colorTexto}  onChange={setColorTexto}  opciones={opcionesTexto}  disabled={disabled} />
                    <TokenSelector label="Color de acento" value={colorAcento} onChange={setColorAcento} opciones={opcionesAcento} disabled={disabled} />

                    <div className="border-t border-slate-100" />

                    {/* Título */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-700">Título</p>
                        <div className="space-y-1.5">
                            <Label htmlFor="cta-linea1">Línea principal</Label>
                            <Input
                                id="cta-linea1"
                                value={tituloLinea1}
                                maxLength={80}
                                disabled={disabled}
                                onChange={e => setTituloLinea1(e.target.value)}
                                placeholder="El cuidado que buscabas"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="cta-titulo-acento">Línea acento</Label>
                            <Input
                                id="cta-titulo-acento"
                                value={tituloAcento}
                                maxLength={80}
                                disabled={disabled}
                                onChange={e => setTituloAcento(e.target.value)}
                                placeholder="está a un clic de distancia."
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100" />

                    {/* Descripción */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-700">Descripción</p>
                        <Textarea
                            value={descripcion}
                            maxLength={300}
                            disabled={disabled}
                            onChange={e => setDescripcion(e.target.value)}
                            placeholder="Más de 1.200 clientas en todo el país ya confían en nosotros."
                            rows={3}
                        />
                        <div className="space-y-1.5">
                            <Label htmlFor="cta-desc-acento">Texto acento</Label>
                            <Input
                                id="cta-desc-acento"
                                value={descripcionAcento}
                                maxLength={100}
                                disabled={disabled}
                                onChange={e => setDescripcionAcento(e.target.value)}
                                placeholder="Envío gratis a todo el país."
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100" />

                    {/* Botones */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-700">Botones</p>
                        <div className="space-y-2">
                            <p className="text-xs text-slate-500 font-medium">Primario</p>
                            <Input
                                value={btnPrimarioTexto}
                                maxLength={50}
                                disabled={disabled}
                                onChange={e => setBtnPrimarioTexto(e.target.value)}
                                placeholder="Ver productos"
                            />
                            <Input
                                value={btnPrimarioLink}
                                maxLength={500}
                                disabled={disabled}
                                onChange={e => setBtnPrimarioLink(e.target.value)}
                                placeholder="/productos"
                            />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs text-slate-500 font-medium">Secundario</p>
                            <Input
                                value={btnSecundarioTexto}
                                maxLength={50}
                                disabled={disabled}
                                onChange={e => setBtnSecundarioTexto(e.target.value)}
                                placeholder="Nuestra historia"
                            />
                            <Input
                                value={btnSecundarioLink}
                                maxLength={500}
                                disabled={disabled}
                                onChange={e => setBtnSecundarioLink(e.target.value)}
                                placeholder="/quienes-somos"
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100" />

                    {/* Stats */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-700">Stats</p>
                        {stats.map((stat, i) => (
                            <div key={i} className="rounded-lg border border-slate-200 p-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-400 w-4 shrink-0">{i + 1}</span>
                                    <Input
                                        value={stat.valor}
                                        maxLength={20}
                                        disabled={disabled}
                                        onChange={e => actualizarStat(i, 'valor', e.target.value)}
                                        placeholder="1.200+"
                                        className="w-24 shrink-0"
                                    />
                                    <Input
                                        value={stat.etiqueta}
                                        maxLength={40}
                                        disabled={disabled}
                                        onChange={e => actualizarStat(i, 'etiqueta', e.target.value)}
                                        placeholder="clientas satisfechas"
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

                <SheetFooter>
                    <Button onClick={guardar} disabled={guardando || disabled}>
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </Button>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
