import { useEffect, useRef, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Plus, Smile, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/Popover'
import { cn } from '@/lib/utils'
import TokenSelector from '../TokenSelector'

const EMOJIS = [
    '🔥', '⚡', '⏰', '🚨', '🎉', '🎊', '🎁', '🏷️',
    '🛒', '🛍️', '💳', '📦', '💰', '💎', '🏆', '👑',
    '🚀', '💥', '🎯', '📢', '✨', '💫', '🌟', '⭐',
    '❤️', '💕', '😍', '🤩', '👋', '👍', '🙌', '💪',
]

export interface TickerItem {
    texto: string
}

export interface TickerConfig {
    color_fondo:     string
    color_texto:     string
    color_separador: string
    velocidad:       'lento' | 'normal' | 'rapido'
    items:           TickerItem[]
}

interface Colores { primario: string; secundario: string; acento: string }

interface Props {
    open:     boolean
    onClose:  () => void
    config:   TickerConfig | null
    colores:  Colores
    disabled: boolean
}

const MAX = 20

const VELOCIDADES = [
    { value: 'lento',  label: 'Lento',  desc: '40s' },
    { value: 'normal', label: 'Normal', desc: '20s' },
    { value: 'rapido', label: 'Rápido', desc: '10s' },
] as const

export default function ModalTicker({ open, onClose, config, colores, disabled }: Props) {
    const inputRefs = useRef<Map<number, HTMLInputElement>>(new Map())

    const [colorFondo,     setColorFondo]     = useState('negro')
    const [colorTexto,     setColorTexto]     = useState('blanco')
    const [colorSeparador, setColorSeparador] = useState('acento')
    const [velocidad,      setVelocidad]      = useState<'lento' | 'normal' | 'rapido'>('normal')
    const [items,          setItems]          = useState<TickerItem[]>([])
    const [guardando,      setGuardando]      = useState(false)

    useEffect(() => {
        if (!open) return
        setColorFondo(config?.color_fondo      ?? 'negro')
        setColorTexto(config?.color_texto      ?? 'blanco')
        setColorSeparador(config?.color_separador ?? 'acento')
        setVelocidad(config?.velocidad         ?? 'normal')
        setItems(config?.items                 ?? [])
    }, [open])

    function insertarEmoji(i: number, emoji: string) {
        const input = inputRefs.current.get(i)
        const texto = items[i].texto
        const start = input?.selectionStart ?? texto.length
        const end   = input?.selectionEnd   ?? texto.length
        const nuevo = texto.slice(0, start) + emoji + texto.slice(end)
        if (nuevo.length > 80) return
        setItems(prev => prev.map((item, idx) => idx === i ? { ...item, texto: nuevo } : item))
        requestAnimationFrame(() => {
            input?.focus()
            input?.setSelectionRange(start + emoji.length, start + emoji.length)
        })
    }

    function guardar() {
        const validos = items.filter(r => r.texto.trim())
        setGuardando(true)
        router.post(route('admin.build.inicio.ticker.config'), {
            color_fondo:     colorFondo,
            color_texto:     colorTexto,
            color_separador: colorSeparador,
            velocidad,
            items: validos,
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
                    <SheetTitle>Ticker</SheetTitle>
                    <SheetDescription>Franja de texto animado debajo del hero.</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

                    <TokenSelector label="Color de fondo"     value={colorFondo}     onChange={setColorFondo}     opciones={tokenOpciones} disabled={disabled} />
                    <TokenSelector label="Color de texto"     value={colorTexto}     onChange={setColorTexto}     opciones={tokenOpciones} disabled={disabled} />
                    <TokenSelector label="Color de separador" value={colorSeparador} onChange={setColorSeparador} opciones={tokenOpciones} disabled={disabled} />

                    <div className="border-t border-slate-100" />

                    {/* Velocidad */}
                    <div className="space-y-2">
                        <Label>Velocidad</Label>
                        <div className="flex gap-2">
                            {VELOCIDADES.map(v => (
                                <button
                                    key={v.value}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => setVelocidad(v.value)}
                                    className={cn(
                                        'flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-50',
                                        velocidad === v.value
                                            ? 'border-slate-900 bg-slate-900 text-white'
                                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400',
                                    )}
                                >
                                    {v.label}
                                    <span className="block font-normal text-xs opacity-60 mt-0.5">{v.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-slate-100" />

                    {/* Items */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-700">
                                Items{' '}
                                <span className="font-normal text-slate-400">({items.length}/{MAX})</span>
                            </p>
                            {items.length < MAX && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={disabled}
                                    onClick={() => setItems(prev => [...prev, { texto: '' }])}
                                >
                                    <Plus className="w-4 h-4" />
                                    Agregar ticker
                                </Button>
                            )}
                        </div>

                        {items.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-6">
                                Sin items. Agrega el primero.
                            </p>
                        )}

                        {items.map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={disabled}
                                            className="shrink-0 px-2.5"
                                        >
                                            <Smile className="w-4 h-4 text-slate-500" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-60 p-2" align="start">
                                        <div className="grid grid-cols-8 gap-0.5">
                                            {EMOJIS.map(emoji => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() => insertarEmoji(i, emoji)}
                                                    className="h-7 w-7 flex items-center justify-center rounded-md text-base hover:bg-slate-100 transition-colors duration-200 ease-in-out"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <Input
                                    ref={el => { if (el) inputRefs.current.set(i, el); else inputRefs.current.delete(i) }}
                                    value={item.texto}
                                    maxLength={80}
                                    disabled={disabled}
                                    onChange={e => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, texto: e.target.value } : it))}
                                    placeholder="Texto del ticker…"
                                    className="flex-1"
                                />
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))}
                                    className="text-slate-400 hover:text-red-500 transition-colors duration-200 disabled:cursor-not-allowed shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
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
