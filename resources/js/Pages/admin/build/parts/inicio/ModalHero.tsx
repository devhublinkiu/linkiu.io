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
import { Switch } from '@/Components/ui/Switch'
import { Textarea } from '@/Components/ui/Textarea'
import TokenSelector from '../TokenSelector'

interface ImagenItem { url: string; ruta: string }
interface Colores { primario: string; secundario: string; acento: string }

export interface HeroConfig {
    titulo:               string
    titulo_acento:        string | null
    descripcion:          string
    btn_primario_texto:   string | null
    btn_primario_link:    string | null
    btn_secundario_texto: string | null
    btn_secundario_link:  string | null
    resenas_activo:       boolean
    resenas_rating:       number
    resenas_cantidad:     number
    color_texto:          string
    color_acento_titulo:  string
    color_btn_bg:         string
    color_btn_text:       string
    imagenes:             ImagenItem[]
}

interface Props {
    open:     boolean
    onClose:  () => void
    config:   HeroConfig | null
    colores:  Colores
    disabled: boolean
}

const MAX_IMAGENES = 10

export default function ModalHero({ open, onClose, config, colores, disabled }: Props) {
    const inputRef = useRef<HTMLInputElement>(null)

    const [form, setForm] = useState({
        titulo:               '',
        titulo_acento:        '',
        descripcion:          '',
        btn_primario_texto:   '',
        btn_primario_link:    '',
        tieneSecundario:      false,
        btn_secundario_texto: '',
        btn_secundario_link:  '',
        resenas_activo:       true,
        resenas_rating:       4.7,
        resenas_cantidad:     312,
        color_texto:          'primario',
        color_acento_titulo:  'acento',
        color_btn_bg:         'primario',
        color_btn_text:       'blanco',
    })
    const [imagenes,             setImagenes]             = useState<ImagenItem[]>([])
    const [subiendo,             setSubiendo]             = useState(false)
    const [guardando,            setGuardando]            = useState(false)
    const [confirmandoEliminar,  setConfirmandoEliminar]  = useState<ImagenItem | null>(null)

    useEffect(() => {
        if (!open) return
        setForm({
            titulo:               config?.titulo               ?? '',
            titulo_acento:        config?.titulo_acento        ?? '',
            descripcion:          config?.descripcion          ?? '',
            btn_primario_texto:   config?.btn_primario_texto   ?? '',
            btn_primario_link:    config?.btn_primario_link    ?? '',
            tieneSecundario:      !!config?.btn_secundario_texto,
            btn_secundario_texto: config?.btn_secundario_texto ?? '',
            btn_secundario_link:  config?.btn_secundario_link  ?? '',
            resenas_activo:       config?.resenas_activo       ?? true,
            resenas_rating:       config?.resenas_rating       ?? 4.7,
            resenas_cantidad:     config?.resenas_cantidad     ?? 312,
            color_texto:          config?.color_texto          ?? 'primario',
            color_acento_titulo:  config?.color_acento_titulo  ?? 'acento',
            color_btn_bg:         config?.color_btn_bg         ?? 'primario',
            color_btn_text:       config?.color_btn_text       ?? 'blanco',
        })
        setImagenes(config?.imagenes ?? [])
    }, [open])

    async function subirArchivo(file: File) {
        if (imagenes.length >= MAX_IMAGENES) return
        setSubiendo(true)
        try {
            const fd = new FormData()
            fd.append('imagen', file)
            const res = await axios.post<ImagenItem>(route('admin.build.inicio.hero.imagenes.store'), fd)
            setImagenes(prev => [...prev, res.data])
        } catch {
            toast.error('Error al subir la imagen')
        } finally {
            setSubiendo(false)
        }
    }

    async function eliminarImagen(item: ImagenItem) {
        setImagenes(prev => prev.filter(i => i.ruta !== item.ruta))
        await axios.delete(route('admin.build.inicio.hero.imagenes.destroy'), { data: { ruta: item.ruta } })
            .catch(() => toast.error('Error al eliminar la imagen'))
    }

    function guardar() {
        setGuardando(true)
        router.post(route('admin.build.inicio.hero.config'), {
            titulo:               form.titulo               || null,
            titulo_acento:        form.titulo_acento        || null,
            descripcion:          form.descripcion          || null,
            btn_primario_texto:   form.btn_primario_texto   || null,
            btn_primario_link:    form.btn_primario_link    || null,
            btn_secundario_texto: form.tieneSecundario ? (form.btn_secundario_texto || null) : null,
            btn_secundario_link:  form.tieneSecundario ? (form.btn_secundario_link  || null) : null,
            resenas_activo:       form.resenas_activo,
            resenas_rating:       form.resenas_rating,
            resenas_cantidad:     form.resenas_cantidad,
            color_texto:          form.color_texto,
            color_acento_titulo:  form.color_acento_titulo,
            color_btn_bg:         form.color_btn_bg,
            color_btn_text:       form.color_btn_text,
            imagenes,
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
                        <SheetTitle>Hero</SheetTitle>
                        <SheetDescription>Portada principal de la tienda.</SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

                        <TokenSelector
                            label="Color de texto"
                            value={form.color_texto}
                            onChange={v => setForm(f => ({ ...f, color_texto: v }))}
                            opciones={[
                                { label: 'Principal',  value: 'primario',   hex: colores.primario   },
                                { label: 'Secundario', value: 'secundario', hex: colores.secundario },
                                { label: 'Acento',     value: 'acento',     hex: colores.acento     },
                                { label: 'Blanco',     value: 'blanco',     hex: '#FFFFFF'          },
                                { label: 'Negro',      value: 'negro',      hex: '#000000'          },
                            ]}
                            disabled={disabled}
                        />

                        <div className="border-t border-slate-100" />

                        <div className="space-y-2">
                            <Label htmlFor="hero-titulo">Título principal</Label>
                            <Input
                                id="hero-titulo"
                                value={form.titulo}
                                maxLength={120}
                                disabled={disabled}
                                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                                placeholder="Transforma tu cabello sin"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hero-titulo-acento">
                                Palabra acentuada{' '}
                                <span className="text-slate-500 font-normal">(opcional)</span>
                            </Label>
                            <Input
                                id="hero-titulo-acento"
                                value={form.titulo_acento}
                                maxLength={60}
                                disabled={disabled}
                                onChange={e => setForm(f => ({ ...f, titulo_acento: e.target.value }))}
                                placeholder="comprometerlo"
                            />
                            <p className="text-xs text-slate-500">Se renderiza al final del título con el color de acento.</p>
                        </div>

                        <TokenSelector
                            label="Color del acento del título"
                            value={form.color_acento_titulo}
                            onChange={v => setForm(f => ({ ...f, color_acento_titulo: v }))}
                            opciones={[
                                { label: 'Principal',  value: 'primario',   hex: colores.primario   },
                                { label: 'Secundario', value: 'secundario', hex: colores.secundario },
                                { label: 'Acento',     value: 'acento',     hex: colores.acento     },
                                { label: 'Blanco',     value: 'blanco',     hex: '#FFFFFF'          },
                                { label: 'Negro',      value: 'negro',      hex: '#000000'          },
                            ]}
                            disabled={disabled}
                        />

                        <div className="space-y-2">
                            <Label htmlFor="hero-descripcion">Descripción</Label>
                            <Textarea
                                id="hero-descripcion"
                                value={form.descripcion}
                                maxLength={400}
                                disabled={disabled}
                                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                                placeholder="Productos libres de químicos agresivos para quienes cuidan su cabello…"
                                rows={3}
                            />
                        </div>

                        <div className="border-t border-slate-100" />

                        {/* Colores de los botones */}
                        <div className="space-y-5">
                            <p className="text-sm font-medium text-slate-700">Estilo de los botones</p>
                            <TokenSelector
                                label="Color de fondo"
                                value={form.color_btn_bg}
                                onChange={v => setForm(f => ({ ...f, color_btn_bg: v }))}
                                opciones={[
                                    { label: 'Principal',  value: 'primario',   hex: colores.primario   },
                                    { label: 'Secundario', value: 'secundario', hex: colores.secundario },
                                    { label: 'Acento',     value: 'acento',     hex: colores.acento     },
                                    { label: 'Blanco',     value: 'blanco',     hex: '#FFFFFF'          },
                                    { label: 'Negro',      value: 'negro',      hex: '#000000'          },
                                ]}
                                disabled={disabled}
                            />
                            <TokenSelector
                                label="Color de texto"
                                value={form.color_btn_text}
                                onChange={v => setForm(f => ({ ...f, color_btn_text: v }))}
                                opciones={[
                                    { label: 'Principal',  value: 'primario',   hex: colores.primario   },
                                    { label: 'Secundario', value: 'secundario', hex: colores.secundario },
                                    { label: 'Acento',     value: 'acento',     hex: colores.acento     },
                                    { label: 'Blanco',     value: 'blanco',     hex: '#FFFFFF'          },
                                    { label: 'Negro',      value: 'negro',      hex: '#000000'          },
                                ]}
                                disabled={disabled}
                            />
                        </div>

                        <div className="border-t border-slate-100" />

                        {/* Botón primario */}
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-slate-700">Botón primario</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="hero-btn1-texto">Texto</Label>
                                    <Input
                                        id="hero-btn1-texto"
                                        value={form.btn_primario_texto}
                                        maxLength={50}
                                        disabled={disabled}
                                        onChange={e => setForm(f => ({ ...f, btn_primario_texto: e.target.value }))}
                                        placeholder="Ver productos"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="hero-btn1-link">Link</Label>
                                    <Input
                                        id="hero-btn1-link"
                                        value={form.btn_primario_link}
                                        maxLength={500}
                                        disabled={disabled || !form.btn_primario_texto}
                                        onChange={e => setForm(f => ({ ...f, btn_primario_link: e.target.value }))}
                                        placeholder="/productos"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botón secundario */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Switch
                                    id="hero-tiene-secundario"
                                    checked={form.tieneSecundario}
                                    onCheckedChange={v => setForm(f => ({ ...f, tieneSecundario: v }))}
                                    disabled={disabled}
                                />
                                <Label htmlFor="hero-tiene-secundario" className="text-sm font-medium text-slate-700 cursor-pointer">
                                    Botón secundario
                                </Label>
                            </div>
                            {form.tieneSecundario && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="hero-btn2-texto">Texto</Label>
                                        <Input
                                            id="hero-btn2-texto"
                                            value={form.btn_secundario_texto}
                                            maxLength={50}
                                            disabled={disabled}
                                            onChange={e => setForm(f => ({ ...f, btn_secundario_texto: e.target.value }))}
                                            placeholder="Nuestra historia"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="hero-btn2-link">Link</Label>
                                        <Input
                                            id="hero-btn2-link"
                                            value={form.btn_secundario_link}
                                            maxLength={500}
                                            disabled={disabled || !form.btn_secundario_texto}
                                            onChange={e => setForm(f => ({ ...f, btn_secundario_link: e.target.value }))}
                                            placeholder="/quienes-somos"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-100" />

                        {/* Reseñas verificadas */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Switch
                                    id="hero-resenas"
                                    checked={form.resenas_activo}
                                    onCheckedChange={v => setForm(f => ({ ...f, resenas_activo: v }))}
                                    disabled={disabled}
                                />
                                <Label htmlFor="hero-resenas" className="text-sm font-medium text-slate-700 cursor-pointer">
                                    Reseñas verificadas
                                </Label>
                            </div>
                            {form.resenas_activo && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="hero-rating">Calificación</Label>
                                        <Input
                                            id="hero-rating"
                                            type="number"
                                            min={0}
                                            max={5}
                                            step={0.1}
                                            value={form.resenas_rating}
                                            disabled={disabled}
                                            onChange={e => setForm(f => ({ ...f, resenas_rating: parseFloat(e.target.value) || 0 }))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="hero-cantidad">Cantidad</Label>
                                        <Input
                                            id="hero-cantidad"
                                            type="number"
                                            min={0}
                                            value={form.resenas_cantidad}
                                            disabled={disabled}
                                            onChange={e => setForm(f => ({ ...f, resenas_cantidad: parseInt(e.target.value) || 0 }))}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-100" />

                        {/* Imágenes del slider */}
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-slate-700">
                                Imágenes del slider{' '}
                                <span className="font-normal text-slate-400">(máx. {MAX_IMAGENES})</span>
                            </p>

                            {imagenes.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {imagenes.map((img, i) => (
                                        <div key={i} className="group relative aspect-square rounded-lg border border-slate-200 overflow-hidden">
                                            <img src={img.url} alt="" className="size-full object-cover" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button
                                                    type="button"
                                                    disabled={disabled}
                                                    onClick={() => setConfirmandoEliminar(img)}
                                                    className="rounded-full bg-white/90 p-1.5 text-slate-700 hover:bg-red-500 hover:text-white transition-colors duration-200 ease-in-out"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {imagenes.length < MAX_IMAGENES && (
                                <button
                                    type="button"
                                    disabled={subiendo || disabled}
                                    onClick={() => !subiendo && inputRef.current?.click()}
                                    className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-400 transition-colors duration-200 ease-in-out hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {subiendo
                                        ? <div className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                                        : <ImageIcon className="size-5" />
                                    }
                                    <span className="text-sm">{subiendo ? 'Subiendo…' : 'Agregar imagen'}</span>
                                    <span className="text-xs text-slate-300">{imagenes.length}/{MAX_IMAGENES}</span>
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
                        <Button onClick={guardar} disabled={guardando || disabled}>
                            {guardando ? 'Guardando…' : 'Guardar'}
                        </Button>
                        <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <AlertDialog open={!!confirmandoEliminar} onOpenChange={v => { if (!v) setConfirmandoEliminar(null) }}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar imagen</AlertDialogTitle>
                        <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={() => {
                                const item = confirmandoEliminar!
                                setConfirmandoEliminar(null)
                                eliminarImagen(item)
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
