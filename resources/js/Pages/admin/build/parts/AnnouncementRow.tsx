import { useState, useEffect, useRef } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Save, Trash2, Clock, Smile } from 'lucide-react'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Switch } from '@/Components/ui/Switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/Popover'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/AlertDialog'
import { cn } from '@/lib/utils'

const EMOJIS = [
    '🔥', '⚡', '⏰', '🚨', '🎉', '🎊', '🎁', '🏷️',
    '🛒', '🛍️', '💳', '📦', '💰', '💎', '🏆', '👑',
    '🚀', '💥', '🎯', '📢', '✨', '💫', '🌟', '⭐',
    '❤️', '💕', '😍', '🤩', '👋', '👍', '🙌', '💪',
]

export interface Announcement {
    id:         number
    texto:      string
    emoji:      string | null
    btn_texto:  string | null
    btn_link:   string | null
    fin_timer:  string | null
    activo:     boolean
    orden:      number
    updated_at: string | null
}

interface Props {
    ann:         Announcement | null
    puedeEditar: boolean
    onCancelar?: () => void
}

function toDatetimeLocal(iso: string | null): string {
    if (!iso) return ''
    return iso.slice(0, 16)
}

export default function AnnouncementRow({ ann, puedeEditar, onCancelar }: Props) {
    const esNuevo = ann === null

    const textoRef = useRef<HTMLInputElement>(null)

    const [form, setForm] = useState({
        texto:      ann?.texto      ?? '',
        btn_texto:  ann?.btn_texto  ?? '',
        btn_link:   ann?.btn_link   ?? '',
        fin_timer:  toDatetimeLocal(ann?.fin_timer ?? null),
        tieneTimer: ann?.fin_timer != null,
        activo:     ann?.activo     ?? true,
    })
    const [guardando,         setGuardando]         = useState(false)
    const [guardandoActivo,   setGuardandoActivo]   = useState(false)
    const [confirmarEliminar, setConfirmarEliminar] = useState(false)
    const [emojiAbierto,      setEmojiAbierto]      = useState(false)

    // Sincroniza el formulario cuando el servidor devuelve datos actualizados
    useEffect(() => {
        if (!ann) return
        setForm({
            texto:      ann.texto,
            btn_texto:  ann.btn_texto  ?? '',
            btn_link:   ann.btn_link   ?? '',
            fin_timer:  toDatetimeLocal(ann.fin_timer),
            tieneTimer: ann.fin_timer != null,
            activo:     ann.activo,
        })
    }, [ann?.updated_at])

    const estaExpirado = form.tieneTimer && !!form.fin_timer && new Date(form.fin_timer) < new Date()

    function insertarEmoji(emoji: string) {
        const input = textoRef.current
        const start = input?.selectionStart ?? form.texto.length
        const end   = input?.selectionEnd   ?? form.texto.length
        const nuevo = form.texto.slice(0, start) + emoji + form.texto.slice(end)
        if (nuevo.length > 200) return
        setForm(f => ({ ...f, texto: nuevo }))
        setEmojiAbierto(false)
        requestAnimationFrame(() => {
            input?.focus()
            input?.setSelectionRange(start + emoji.length, start + emoji.length)
        })
    }

    function guardarActivo(nuevoActivo: boolean) {
        setForm(f => ({ ...f, activo: nuevoActivo }))
        setGuardandoActivo(true)
        router.patch(route('admin.build.menu.anuncios.toggle', ann!.id), { activo: nuevoActivo }, {
            preserveScroll: true,
            onError:   () => {
                setForm(f => ({ ...f, activo: !nuevoActivo }))
                toast.error('Error al actualizar el anuncio')
            },
            onFinish:  () => setGuardandoActivo(false),
        })
    }

    function guardar() {
        setGuardando(true)
        const payload = {
            texto:     form.texto,
            btn_texto: form.btn_texto || null,
            btn_link:  form.btn_texto && form.btn_link ? form.btn_link : null,
            fin_timer: form.tieneTimer && form.fin_timer ? form.fin_timer : null,
            activo:    estaExpirado ? false : form.activo,
        }

        if (esNuevo) {
            router.post(route('admin.build.menu.anuncios.store'), payload, {
                preserveScroll: true,
                onSuccess: () => onCancelar?.(),
                onError:   () => toast.error('Error al crear el anuncio'),
                onFinish:  () => setGuardando(false),
            })
        } else {
            router.post(route('admin.build.menu.anuncios.update', ann!.id), payload, {
                preserveScroll: true,
                onError:   () => toast.error('Error al guardar el anuncio'),
                onFinish:  () => setGuardando(false),
            })
        }
    }

    function eliminar() {
        router.delete(route('admin.build.menu.anuncios.destroy', ann!.id), {
            preserveScroll: true,
            onError: () => toast.error('Error al eliminar el anuncio'),
        })
    }

    const disabled = !puedeEditar || guardando

    return (
        <div className={cn(
            'rounded-lg border bg-white p-4 space-y-3',
            estaExpirado ? 'border-amber-100' : 'border-slate-200',
        )}>

            {/* Fila de controles superiores */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    {esNuevo && (
                        <span className="text-xs font-medium text-slate-500">Nuevo anuncio</span>
                    )}
                    {estaExpirado && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                            <Clock className="w-4 h-4" />
                            Expirado
                        </span>
                    )}
                    {!estaExpirado && (
                        <div className="flex items-center gap-2">
                            <Switch
                                id={`activo-${ann?.id ?? 'new'}`}
                                checked={form.activo}
                                onCheckedChange={esNuevo
                                    ? (v => setForm(f => ({ ...f, activo: v })))
                                    : guardarActivo
                                }
                                disabled={disabled || guardandoActivo}
                            />
                            <Label htmlFor={`activo-${ann?.id ?? 'new'}`} className="text-sm text-slate-600 cursor-pointer">
                                {form.activo ? 'Activo' : 'Inactivo'}
                            </Label>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1.5">
                    <Button
                        type="button"
                        size="sm"
                        disabled={disabled || !form.texto.trim()}
                        onClick={guardar}
                    >
                        <Save className="w-4 h-4" />
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </Button>
                    {!esNuevo ? (
                        <>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={!puedeEditar}
                                onClick={() => setConfirmarEliminar(true)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <AlertDialog open={confirmarEliminar} onOpenChange={setConfirmarEliminar}>
                                <AlertDialogContent size="sm">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Eliminar anuncio?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {`Se eliminará permanentemente "${ann!.texto.slice(0, 50)}${ann!.texto.length > 50 ? '…' : ''}"`}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction variant="destructive" onClick={eliminar}>
                                            Eliminar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    ) : (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onCancelar}
                        >
                            Cancelar
                        </Button>
                    )}
                </div>
            </div>

            {/* Texto del anuncio con selector de emoji inline */}
            <div>
                <Label htmlFor={`texto-${ann?.id ?? 'new'}`}>Texto del anuncio</Label>
                <div className="mt-1 flex gap-1.5">
                    <Popover open={emojiAbierto} onOpenChange={setEmojiAbierto}>
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
                                        className="h-7 w-7 flex items-center justify-center rounded-md text-base hover:bg-slate-100 transition-colors duration-200 ease-in-out"
                                        onClick={() => insertarEmoji(emoji)}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Input
                        ref={textoRef}
                        id={`texto-${ann?.id ?? 'new'}`}
                        type="text"
                        value={form.texto}
                        maxLength={200}
                        disabled={disabled}
                        onChange={e => setForm(f => ({ ...f, texto: e.target.value }))}
                        placeholder="Envío gratis en pedidos mayores a $50 🔥"
                        className="flex-1"
                    />
                </div>
            </div>

            {/* Botón opcional */}
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label htmlFor={`btn-texto-${ann?.id ?? 'new'}`}>
                        Texto del botón{' '}
                        <span className="text-slate-500 font-normal">(opcional)</span>
                    </Label>
                    <Input
                        id={`btn-texto-${ann?.id ?? 'new'}`}
                        type="text"
                        value={form.btn_texto}
                        maxLength={50}
                        disabled={disabled}
                        onChange={e => setForm(f => ({ ...f, btn_texto: e.target.value }))}
                        placeholder="Ver más"
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor={`btn-link-${ann?.id ?? 'new'}`}>
                        Link del botón{' '}
                        <span className="text-slate-500 font-normal">(opcional)</span>
                    </Label>
                    <Input
                        id={`btn-link-${ann?.id ?? 'new'}`}
                        type="url"
                        value={form.btn_link}
                        maxLength={500}
                        disabled={disabled || !form.btn_texto}
                        onChange={e => setForm(f => ({ ...f, btn_link: e.target.value }))}
                        placeholder="https://..."
                        className="mt-1"
                    />
                </div>
            </div>

            {/* Countdown */}
            <div className="flex items-start gap-4">
                <div className="flex items-center gap-2 pt-1">
                    <Switch
                        id={`timer-${ann?.id ?? 'new'}`}
                        checked={form.tieneTimer}
                        onCheckedChange={v => setForm(f => ({ ...f, tieneTimer: v, fin_timer: v ? f.fin_timer : '' }))}
                        disabled={disabled}
                    />
                    <Label htmlFor={`timer-${ann?.id ?? 'new'}`} className="text-sm text-slate-600 cursor-pointer">
                        Countdown
                    </Label>
                </div>
                {form.tieneTimer && (
                    <div className="flex-1">
                        <Label htmlFor={`fin-timer-${ann?.id ?? 'new'}`}>Fecha y hora de fin</Label>
                        <Input
                            id={`fin-timer-${ann?.id ?? 'new'}`}
                            type="datetime-local"
                            value={form.fin_timer}
                            disabled={disabled}
                            onChange={e => setForm(f => ({ ...f, fin_timer: e.target.value }))}
                            className="mt-1"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
