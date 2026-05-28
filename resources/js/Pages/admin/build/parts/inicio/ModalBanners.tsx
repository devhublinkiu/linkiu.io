import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { ImageIcon, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/Components/ui/AlertDialog'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { cn } from '@/lib/utils'

interface BannerItem {
    url:  string
    ruta: string
    link: string | null
}

export interface BannersConfig {
    velocidad: 'lento' | 'normal' | 'rapido'
    items:     BannerItem[]
}

interface Props {
    open:     boolean
    onClose:  () => void
    config:   BannersConfig | null
    disabled: boolean
}

const MAX = 6

const VELOCIDADES = [
    { value: 'lento',  label: 'Lento',  desc: '6s' },
    { value: 'normal', label: 'Normal', desc: '4s' },
    { value: 'rapido', label: 'Rápido', desc: '2s' },
] as const

export default function ModalBanners({ open, onClose, config, disabled }: Props) {
    const inputRef = useRef<HTMLInputElement>(null)

    const [velocidad,            setVelocidad]            = useState<'lento' | 'normal' | 'rapido'>('normal')
    const [items,                setItems]                = useState<BannerItem[]>([])
    const [subiendo,             setSubiendo]             = useState(false)
    const [guardando,            setGuardando]            = useState(false)
    const [confirmandoEliminar,  setConfirmandoEliminar]  = useState<BannerItem | null>(null)

    useEffect(() => {
        if (!open) return
        setVelocidad(config?.velocidad ?? 'normal')
        setItems(config?.items         ?? [])
    }, [open])

    async function subirArchivo(file: File) {
        if (items.length >= MAX) return
        setSubiendo(true)
        try {
            const fd = new FormData()
            fd.append('imagen', file)
            const res = await axios.post<BannerItem>(route('admin.build.inicio.banners.imagenes.store'), fd)
            setItems(prev => [...prev, { ...res.data, link: null }])
        } catch {
            toast.error('Error al subir la imagen')
        } finally {
            setSubiendo(false)
        }
    }

    async function eliminarItem(item: BannerItem) {
        setItems(prev => prev.filter(i => i.ruta !== item.ruta))
        await axios.delete(route('admin.build.inicio.banners.imagenes.destroy'), { data: { ruta: item.ruta } })
            .catch(() => toast.error('Error al eliminar la imagen'))
    }

    function actualizarLink(ruta: string, link: string) {
        setItems(prev => prev.map(i => i.ruta === ruta ? { ...i, link: link || null } : i))
    }

    function guardar() {
        setGuardando(true)
        router.post(route('admin.build.inicio.banners.config'), {
            velocidad,
            items,
        }, {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onError:   () => toast.error('Error al guardar'),
            onFinish:  () => setGuardando(false),
        })
    }

    return (
        <>
        <Sheet open={open} onOpenChange={v => { if (!v) onClose() }}>
            <SheetContent className="sm:max-w-lg flex flex-col">
                <SheetHeader>
                    <SheetTitle>Banners</SheetTitle>
                    <SheetDescription>Slider de imágenes promocionales (máx. {MAX}). Medida recomendada: <strong>2400 × 900 px</strong> (formato 8:3). Si subes otra, la imagen se ajusta con padding lateral para no recortar contenido.</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

                    {/* Velocidad */}
                    <div className="space-y-2">
                        <Label>Velocidad del slider</Label>
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

                    {/* Banners */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-700">
                                Imágenes{' '}
                                <span className="font-normal text-slate-400">({items.length}/{MAX})</span>
                            </p>
                        </div>

                        {items.map((item, i) => (
                            <div key={item.ruta} className="rounded-lg border border-slate-200 overflow-hidden">
                                <div className="relative aspect-[3/1] bg-slate-100">
                                    <img src={item.url} alt={`Banner ${i + 1}`} className="size-full object-cover" />
                                    <button
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => setConfirmandoEliminar(item)}
                                        className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-slate-700 hover:bg-red-500 hover:text-white transition-colors duration-200 ease-in-out disabled:cursor-not-allowed"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                                <div className="p-3 space-y-1.5">
                                    <Label htmlFor={`banner-link-${i}`} className="text-xs">Link <span className="text-slate-400 font-normal">(opcional)</span></Label>
                                    <Input
                                        id={`banner-link-${i}`}
                                        value={item.link ?? ''}
                                        maxLength={500}
                                        disabled={disabled}
                                        onChange={e => actualizarLink(item.ruta, e.target.value)}
                                        placeholder="https://... o /productos"
                                    />
                                </div>
                            </div>
                        ))}

                        {items.length < MAX && (
                            <button
                                type="button"
                                disabled={subiendo || disabled}
                                onClick={() => !subiendo && inputRef.current?.click()}
                                className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-400 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {subiendo
                                    ? <div className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                                    : <ImageIcon className="size-5" />
                                }
                                <span className="text-sm">{subiendo ? 'Subiendo…' : 'Agregar banner'}</span>
                                <span className="text-xs text-slate-300">{items.length}/{MAX} · Recomendado 2400 × 900px</span>
                            </button>
                        )}

                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            className="hidden"
                            onChange={e => { const f = e.target.files?.[0]; if (f) subirArchivo(f); e.target.value = '' }}
                        />
                    </div>

                </div>

                <SheetFooter>
                    <Button onClick={guardar} disabled={guardando || disabled || items.length === 0}>
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </Button>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>

        <AlertDialog open={!!confirmandoEliminar} onOpenChange={v => { if (!v) setConfirmandoEliminar(null) }}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogTitle>Eliminar banner</AlertDialogTitle>
                    <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        onClick={() => {
                            const item = confirmandoEliminar!
                            setConfirmandoEliminar(null)
                            eliminarItem(item)
                        }}
                    >
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    )
}
