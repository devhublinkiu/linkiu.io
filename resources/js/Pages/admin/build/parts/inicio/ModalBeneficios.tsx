import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Textarea } from '@/Components/ui/Textarea'
import IconPicker from '@/Components/ui/IconPicker'
import TokenSelector from '../TokenSelector'

export interface BeneficioItem {
    icono:       string
    titulo:      string
    descripcion: string
}

export interface BeneficiosConfig {
    titulo:           string | null
    descripcion:      string | null
    color_fondo_card: string
    color_texto_card: string
    color_fondo_icon: string
    color_icon:       string
    items:            BeneficioItem[]
}

interface Colores { primario: string; secundario: string; acento: string }

interface Props {
    open:     boolean
    onClose:  () => void
    config:   BeneficiosConfig | null
    colores:  Colores
    disabled: boolean
}

const MAX = 9

export default function ModalBeneficios({ open, onClose, config, colores, disabled }: Props) {
    const [titulo,         setTitulo]         = useState('')
    const [descripcion,    setDescripcion]    = useState('')
    const [colorFondoCard, setColorFondoCard] = useState('blanco')
    const [colorTextoCard, setColorTextoCard] = useState('primario')
    const [colorFondoIcon, setColorFondoIcon] = useState('acento')
    const [colorIcon,      setColorIcon]      = useState('blanco')
    const [items,          setItems]          = useState<BeneficioItem[]>([])
    const [guardando,      setGuardando]      = useState(false)

    useEffect(() => {
        if (!open) return
        setTitulo(config?.titulo               ?? '')
        setDescripcion(config?.descripcion     ?? '')
        setColorFondoCard(config?.color_fondo_card ?? 'blanco')
        setColorTextoCard(config?.color_texto_card ?? 'primario')
        setColorFondoIcon(config?.color_fondo_icon ?? 'acento')
        setColorIcon(config?.color_icon            ?? 'blanco')
        setItems(config?.items                     ?? [])
    }, [open])

    function actualizar(i: number, campo: keyof BeneficioItem, valor: string) {
        setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [campo]: valor } : it))
    }

    function guardar() {
        const validos = items.filter(it => it.titulo.trim())
        setGuardando(true)
        router.post(route('admin.build.inicio.beneficios.config'), {
            titulo:           titulo      || null,
            descripcion:      descripcion || null,
            color_fondo_card: colorFondoCard,
            color_texto_card: colorTextoCard,
            color_fondo_icon: colorFondoIcon,
            color_icon:       colorIcon,
            items:            validos,
        }, {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onError:   () => toast.error('Error al guardar'),
            onFinish:  () => setGuardando(false),
        })
    }

    const tokenOpciones = [
        { label: 'Principal',  value: 'primario',   hex: colores.primario   },
        { label: 'Secundario', value: 'secundario', hex: colores.secundario },
        { label: 'Acento',     value: 'acento',     hex: colores.acento     },
        { label: 'Blanco',     value: 'blanco',     hex: '#FFFFFF'          },
        { label: 'Negro',      value: 'negro',      hex: '#000000'          },
    ]

    return (
        <Sheet open={open} onOpenChange={v => { if (!v) onClose() }}>
            <SheetContent className="sm:max-w-lg flex flex-col">
                <SheetHeader>
                    <SheetTitle>Beneficios</SheetTitle>
                    <SheetDescription>Propuestas de valor de la marca.</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

                    {/* Textos de la sección */}
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="ben-titulo">Título</Label>
                            <Input
                                id="ben-titulo"
                                value={titulo}
                                maxLength={100}
                                disabled={disabled}
                                onChange={e => setTitulo(e.target.value)}
                                placeholder="Una marca que se preocupa por ti"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="ben-desc">Descripción</Label>
                            <Textarea
                                id="ben-desc"
                                value={descripcion}
                                maxLength={300}
                                disabled={disabled}
                                onChange={e => setDescripcion(e.target.value)}
                                placeholder="Detrás de cada producto hay un compromiso real…"
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100" />

                    {/* Colores */}
                    <div className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2.5 space-y-2">
                        <p className="text-xs font-medium text-slate-500 pb-1">Colores de cards</p>
                        <TokenSelector compact label="Fondo card"  value={colorFondoCard} onChange={setColorFondoCard} opciones={tokenOpciones} disabled={disabled} />
                        <TokenSelector compact label="Texto card"  value={colorTextoCard} onChange={setColorTextoCard} opciones={tokenOpciones} disabled={disabled} />
                        <TokenSelector compact label="Fondo icono" value={colorFondoIcon} onChange={setColorFondoIcon} opciones={tokenOpciones} disabled={disabled} />
                        <TokenSelector compact label="Icono"       value={colorIcon}      onChange={setColorIcon}      opciones={tokenOpciones} disabled={disabled} />
                    </div>

                    <div className="border-t border-slate-100" />

                    {/* Items */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-700">
                                Beneficios{' '}
                                <span className="font-normal text-slate-400">({items.length}/{MAX})</span>
                            </p>
                            {items.length < MAX && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={disabled}
                                    onClick={() => setItems(prev => [...prev, { icono: 'star', titulo: '', descripcion: '' }])}
                                >
                                    <Plus className="w-4 h-4" />
                                    Agregar beneficio
                                </Button>
                            )}
                        </div>

                        {items.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-6">
                                Sin beneficios. Agrega el primero.
                            </p>
                        )}

                        {items.map((item, i) => (
                            <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className={disabled ? 'pointer-events-none opacity-50' : ''}>
                                        <IconPicker
                                            value={item.icono}
                                            onChange={v => actualizar(i, 'icono', v)}
                                        />
                                    </div>
                                    <Input
                                        value={item.titulo}
                                        maxLength={60}
                                        disabled={disabled}
                                        onChange={e => actualizar(i, 'titulo', e.target.value)}
                                        placeholder="Título del beneficio"
                                        className="flex-1 bg-white"
                                    />
                                    <button
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))}
                                        className="text-slate-400 hover:text-red-500 transition-colors duration-200 ease-in-out disabled:cursor-not-allowed shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <Textarea
                                    value={item.descripcion}
                                    maxLength={200}
                                    disabled={disabled}
                                    onChange={e => actualizar(i, 'descripcion', e.target.value)}
                                    placeholder="Descripción del beneficio…"
                                    rows={2}
                                    className="bg-white"
                                />
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
