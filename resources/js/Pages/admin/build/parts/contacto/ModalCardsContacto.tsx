import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import IconPicker from '@/Components/ui/IconPicker'
import { getIcono } from '@/lib/iconos'
import TokenSelector from '../TokenSelector'

interface Colores { primario: string; secundario: string; acento: string }

function resolverColor(token: string, colores: Colores): string {
    if (token === 'blanco')     return '#FFFFFF'
    if (token === 'negro')      return '#000000'
    if (token === 'primario')   return colores.primario
    if (token === 'secundario') return colores.secundario
    if (token === 'acento')     return colores.acento
    return token
}

export interface CardContactoItem {
    color_fondo:      string
    color_texto:      string
    color_fondo_icon: string
    color_icon:       string
    icono:            string
    tagline:          string | null
    titulo:           string | null
    subtitulo:        string | null
    link:             string | null
}

export interface CardsContactoConfig {
    items: CardContactoItem[]
}

interface Props {
    open:     boolean
    onClose:  () => void
    config:   CardsContactoConfig | null
    colores:  Colores
    disabled: boolean
}

const MAX = 3

const EMPTY_CARD: CardContactoItem = {
    color_fondo: 'blanco', color_texto: 'negro',
    color_fondo_icon: 'primario', color_icon: 'blanco',
    icono: 'mail', tagline: null, titulo: null, subtitulo: null, link: null,
}

export default function ModalCardsContacto({ open, onClose, config, colores, disabled }: Props) {
    const [items,    setItems]    = useState<CardContactoItem[]>([])
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        if (!open) return
        setItems(config?.items ?? [])
    }, [open])

    const tokenOpciones = [
        { label: 'Principal',  value: 'primario',   hex: colores.primario   },
        { label: 'Secundario', value: 'secundario', hex: colores.secundario },
        { label: 'Acento',     value: 'acento',     hex: colores.acento     },
        { label: 'Blanco',     value: 'blanco',     hex: '#FFFFFF'          },
        { label: 'Negro',      value: 'negro',      hex: '#000000'          },
    ]

    function actualizar<K extends keyof CardContactoItem>(i: number, campo: K, valor: CardContactoItem[K]) {
        setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [campo]: valor } : item))
    }

    function guardar() {
        setGuardando(true)
        router.post(route('admin.build.contacto.cards.config'), { items }, {
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
                    <SheetTitle>Cards informativas</SheetTitle>
                    <SheetDescription>Canales o info de contacto destacada (máx. {MAX}).</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-700">
                            Cards <span className="font-normal text-slate-400">({items.length}/{MAX})</span>
                        </p>
                        {items.length < MAX && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={disabled}
                                onClick={() => setItems(prev => [...prev, { ...EMPTY_CARD }])}
                            >
                                <Plus className="w-4 h-4" />
                                Agregar card
                            </Button>
                        )}
                    </div>

                    {items.length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-6">
                            Sin cards. Agrega la primera.
                        </p>
                    )}

                    {items.map((item, i) => {
                        const bgCard  = resolverColor(item.color_fondo,      colores)
                        const bgIcon  = resolverColor(item.color_fondo_icon, colores)
                        const clIcon  = resolverColor(item.color_icon,       colores)
                        const Icono   = getIcono(item.icono)

                        return (
                        <div key={i} className="rounded-lg border border-slate-200 bg-white overflow-hidden">

                            {/* Cabecera card */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                                <span className="text-xs font-semibold text-slate-400 w-5 shrink-0">#{i + 1}</span>

                                {/* Mini preview */}
                                <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-slate-200"
                                    style={{ backgroundColor: bgCard }}
                                >
                                    <div
                                        className="w-5 h-5 rounded-md flex items-center justify-center"
                                        style={{ backgroundColor: bgIcon }}
                                    >
                                        <Icono className="w-3 h-3" style={{ color: clIcon }} />
                                    </div>
                                </div>

                                <div className={`flex-1 ${disabled ? 'pointer-events-none opacity-50' : ''}`}>
                                    <IconPicker
                                        value={item.icono}
                                        onChange={v => actualizar(i, 'icono', v)}
                                    />
                                </div>
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))}
                                    className="text-slate-400 hover:text-red-500 transition-colors duration-200 ease-in-out disabled:cursor-not-allowed"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="px-4 py-3 space-y-4">

                            {/* Colores */}
                            <div className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2.5 space-y-2">
                                <TokenSelector compact label="Fondo card"  value={item.color_fondo}      onChange={v => actualizar(i, 'color_fondo',      v)} opciones={tokenOpciones} disabled={disabled} />
                                <TokenSelector compact label="Texto card"  value={item.color_texto}      onChange={v => actualizar(i, 'color_texto',      v)} opciones={tokenOpciones} disabled={disabled} />
                                <TokenSelector compact label="Fondo icono" value={item.color_fondo_icon} onChange={v => actualizar(i, 'color_fondo_icon', v)} opciones={tokenOpciones} disabled={disabled} />
                                <TokenSelector compact label="Icono"       value={item.color_icon}       onChange={v => actualizar(i, 'color_icon',       v)} opciones={tokenOpciones} disabled={disabled} />
                            </div>

                            <div className="border-t border-slate-100" />

                            {/* Textos */}
                            <div className="space-y-2">
                                <div className="space-y-1">
                                    <Label className="text-xs">Tagline</Label>
                                    <Input
                                        value={item.tagline ?? ''}
                                        maxLength={60}
                                        disabled={disabled}
                                        onChange={e => actualizar(i, 'tagline', e.target.value || null)}
                                        placeholder="WhatsApp"
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Título</Label>
                                    <Input
                                        value={item.titulo ?? ''}
                                        maxLength={80}
                                        disabled={disabled}
                                        onChange={e => actualizar(i, 'titulo', e.target.value || null)}
                                        placeholder="+57 300 000 0000"
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Subtítulo</Label>
                                    <Input
                                        value={item.subtitulo ?? ''}
                                        maxLength={120}
                                        disabled={disabled}
                                        onChange={e => actualizar(i, 'subtitulo', e.target.value || null)}
                                        placeholder="Respuesta en menos de 2 horas"
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Link <span className="text-slate-400">(hace la card clicable)</span></Label>
                                    <Input
                                        value={item.link ?? ''}
                                        maxLength={500}
                                        disabled={disabled}
                                        onChange={e => actualizar(i, 'link', e.target.value || null)}
                                        placeholder="https://wa.me/573000000000"
                                        className="bg-white"
                                    />
                                </div>
                            </div>

                            </div>{/* /px-4 py-3 */}
                        </div>
                        )
                    })}

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
