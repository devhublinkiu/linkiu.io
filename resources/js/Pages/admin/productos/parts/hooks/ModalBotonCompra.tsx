import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Smile, X } from 'lucide-react'
import { postHookConfig } from '@/lib/hooks'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/Popover'
import { Switch } from '@/Components/ui/Switch'

const EMOJIS = [
    '🛒', '🛍️', '💳', '📦', '🔥', '⚡', '⏰', '🎉',
    '🎊', '🎁', '🏷️', '💰', '💎', '🏆', '👑', '🚀',
    '💥', '🎯', '📢', '✨', '💫', '🌟', '⭐', '❤️',
    '💕', '😍', '🤩', '👍', '🙌', '💪', '🌈', '🎈',
]

const DEFAULTS = {
    texto:            'Comprar ahora',
    emoji:            '🛒',
    mostrar_total:    true,
    estilo_fondo:     'gradiente' as 'solido' | 'gradiente',
    color_fondo:      '#F59E0B',
    color_fondo_2:    '#F97316',
    color_texto:      '#FFFFFF',
    aplicar_a_sticky: true,
}

interface Props {
    open:       boolean
    onClose:    () => void
    productoId: number
    config:     Record<string, unknown> | null
}

function CampoColor({ label, value, onChange, id }: { label: string; value: string; onChange: (v: string) => void; id: string }) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>{label}</Label>
            <div className="flex gap-2">
                <div className="relative size-9 shrink-0 rounded-md border border-slate-200 overflow-hidden">
                    <input
                        type="color"
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                    />
                    <div className="size-full rounded-md" style={{ backgroundColor: value }} />
                </div>
                <Input
                    id={id}
                    type="text"
                    value={value}
                    maxLength={7}
                    onChange={e => onChange(e.target.value)}
                    className="font-mono text-xs uppercase"
                    placeholder="#FFFFFF"
                />
            </div>
        </div>
    )
}

export default function ModalBotonCompra({ open, onClose, productoId, config }: Props) {
    const [texto,           setTexto]           = useState(DEFAULTS.texto)
    const [emoji,           setEmoji]           = useState<string | null>(DEFAULTS.emoji)
    const [mostrarTotal,    setMostrarTotal]    = useState(DEFAULTS.mostrar_total)
    const [estiloFondo,     setEstiloFondo]     = useState<'solido' | 'gradiente'>(DEFAULTS.estilo_fondo)
    const [colorFondo,      setColorFondo]      = useState(DEFAULTS.color_fondo)
    const [colorFondo2,     setColorFondo2]     = useState(DEFAULTS.color_fondo_2)
    const [colorTexto,      setColorTexto]      = useState(DEFAULTS.color_texto)
    const [aplicarSticky,   setAplicarSticky]   = useState(DEFAULTS.aplicar_a_sticky)
    const [emojiOpen,       setEmojiOpen]       = useState(false)
    const [guardando,       setGuardando]       = useState(false)

    useEffect(() => {
        if (!open) return
        setTexto         ((config?.texto            as string)          ?? DEFAULTS.texto)
        setEmoji         (((config?.emoji           as string) ?? DEFAULTS.emoji) || null)
        setMostrarTotal  ((config?.mostrar_total    as boolean)         ?? DEFAULTS.mostrar_total)
        setEstiloFondo   (((config?.estilo_fondo    as 'solido' | 'gradiente') ?? DEFAULTS.estilo_fondo))
        setColorFondo    ((config?.color_fondo      as string)          ?? DEFAULTS.color_fondo)
        setColorFondo2   ((config?.color_fondo_2    as string)          ?? DEFAULTS.color_fondo_2)
        setColorTexto    ((config?.color_texto      as string)          ?? DEFAULTS.color_texto)
        setAplicarSticky ((config?.aplicar_a_sticky as boolean)         ?? DEFAULTS.aplicar_a_sticky)
    }, [open])

    function handleOpen(v: boolean) {
        if (!v) onClose()
    }

    function guardar() {
        setGuardando(true)
        postHookConfig({
            productoId,
            hookKey: 'boton_compra',
            config: {
                texto:            texto.trim() || DEFAULTS.texto,
                emoji:            emoji ?? null,
                mostrar_total:    mostrarTotal,
                estilo_fondo:     estiloFondo,
                color_fondo:      colorFondo,
                color_fondo_2:    estiloFondo === 'gradiente' ? colorFondo2 : null,
                color_texto:      colorTexto,
                aplicar_a_sticky: aplicarSticky,
            },
            onSuccess: () => onClose(),
            onError:   () => toast.error('Error al guardar'),
            onFinish:  () => setGuardando(false),
        })
    }

    const previewFondo = estiloFondo === 'gradiente'
        ? `linear-gradient(to right, ${colorFondo}, ${colorFondo2})`
        : colorFondo

    return (
        <Sheet open={open} onOpenChange={handleOpen}>
            <SheetContent className="sm:max-w-lg flex flex-col">
                <SheetHeader>
                    <SheetTitle>Botón de compra</SheetTitle>
                    <SheetDescription>Personaliza el texto, emoji y colores del CTA principal.</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

                    {/* Preview */}
                    <div className="space-y-1.5">
                        <Label>Vista previa</Label>
                        <div
                            className="w-full text-base font-bold py-4 rounded-lg text-center"
                            style={{ background: previewFondo, color: colorTexto }}
                        >
                            {emoji && <span className="mr-1.5">{emoji}</span>}
                            {texto || DEFAULTS.texto}
                            {mostrarTotal && <span> — $149.900</span>}
                        </div>
                    </div>

                    {/* Texto + emoji */}
                    <div className="space-y-1.5">
                        <Label htmlFor="bc-texto">Texto del botón</Label>
                        <div className="flex gap-1.5">
                            <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                                <PopoverTrigger asChild>
                                    <Button type="button" variant="outline" size="sm" className="shrink-0 px-2.5 h-9">
                                        {emoji ? <span className="text-base">{emoji}</span> : <Smile className="w-4 h-4 text-slate-500" />}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-60 p-2" align="start">
                                    <div className="grid grid-cols-8 gap-0.5">
                                        <button
                                            type="button"
                                            onClick={() => { setEmoji(null); setEmojiOpen(false) }}
                                            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors duration-200 ease-in-out"
                                            title="Sin emoji"
                                        >
                                            <X className="w-3.5 h-3.5 text-slate-400" />
                                        </button>
                                        {EMOJIS.map(e => (
                                            <button
                                                key={e}
                                                type="button"
                                                onClick={() => { setEmoji(e); setEmojiOpen(false) }}
                                                className="h-7 w-7 flex items-center justify-center rounded-md text-base hover:bg-slate-100 transition-colors duration-200 ease-in-out"
                                            >
                                                {e}
                                            </button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <Input
                                id="bc-texto"
                                type="text"
                                value={texto}
                                maxLength={30}
                                onChange={e => setTexto(e.target.value)}
                                placeholder="Comprar ahora"
                                className="flex-1"
                            />
                        </div>
                    </div>

                    {/* Switches */}
                    <div className="space-y-3 border-t border-slate-100 pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-sm">Mostrar total al final</Label>
                                <p className="text-xs text-slate-500">Ej: "Comprar ahora — $149.900"</p>
                            </div>
                            <Switch checked={mostrarTotal} onCheckedChange={setMostrarTotal} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-sm">Aplicar al botón sticky</Label>
                                <p className="text-xs text-slate-500">El botón flotante al hacer scroll</p>
                            </div>
                            <Switch checked={aplicarSticky} onCheckedChange={setAplicarSticky} />
                        </div>
                    </div>

                    {/* Estilo de fondo */}
                    <div className="space-y-1.5 border-t border-slate-100 pt-4">
                        <Label>Estilo de fondo</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setEstiloFondo('solido')}
                                className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors duration-200 ${
                                    estiloFondo === 'solido'
                                        ? 'border-slate-900 bg-slate-50 text-slate-900'
                                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                }`}
                            >
                                Sólido
                            </button>
                            <button
                                type="button"
                                onClick={() => setEstiloFondo('gradiente')}
                                className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors duration-200 ${
                                    estiloFondo === 'gradiente'
                                        ? 'border-slate-900 bg-slate-50 text-slate-900'
                                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                }`}
                            >
                                Gradiente
                            </button>
                        </div>
                    </div>

                    {/* Colores */}
                    <div className="grid grid-cols-2 gap-3">
                        <CampoColor
                            id="bc-color-fondo"
                            label={estiloFondo === 'gradiente' ? 'Color inicio' : 'Color de fondo'}
                            value={colorFondo}
                            onChange={setColorFondo}
                        />
                        {estiloFondo === 'gradiente' && (
                            <CampoColor
                                id="bc-color-fondo-2"
                                label="Color fin"
                                value={colorFondo2}
                                onChange={setColorFondo2}
                            />
                        )}
                        <CampoColor
                            id="bc-color-texto"
                            label="Color del texto"
                            value={colorTexto}
                            onChange={setColorTexto}
                        />
                    </div>

                </div>

                <SheetFooter>
                    <Button onClick={guardar} disabled={guardando}>
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </Button>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
