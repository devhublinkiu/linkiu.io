import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { ImageIcon, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { postHookConfig } from '@/lib/hooks'

interface ImagenItem { url: string; ruta: string }

interface BaseProps {
    open:       boolean
    onClose:    () => void
    productoId: number
    config:     Record<string, unknown> | null
}

interface Props extends BaseProps {
    hookKey: 'imagen_promesa' | 'imagen_intermedia' | 'imagen_cierre'
    titulo:  string
}

const ANCHO_DEFAULT = 720

/**
 * Modal reusable para los 3 hooks de imagen estática. Recibe `hookKey` y `titulo`
 * por prop para no duplicar el archivo 3 veces. Cada hookKey persiste por separado
 * en la tabla `hooks` igual que cualquier otro.
 *
 * Las 3 wrappers exportadas abajo (`ModalImagenPromesa`, etc.) son lo que se
 * registra en el MODAL_MAP de TabLinkiuHooks — el resolver del map exige
 * `ComponentType<HookModalProps>` y no permite props extra al instanciar.
 */
export function ModalImagenEstatica({ open, onClose, productoId, config, hookKey, titulo }: Props) {
    const [imagen,    setImagen]    = useState<ImagenItem | null>(() => extraerImagen(config))
    const [alt,       setAlt]       = useState((config?.alt       as string) ?? '')
    const [linkUrl,   setLinkUrl]   = useState((config?.link_url  as string) ?? '')
    const [anchoMax,  setAnchoMax]  = useState((config?.ancho_max as number) ?? ANCHO_DEFAULT)
    const [subiendo,  setSubiendo]  = useState(false)
    const [guardando, setGuardando] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!open) return
        setImagen(extraerImagen(config))
        setAlt((config?.alt       as string) ?? '')
        setLinkUrl((config?.link_url  as string) ?? '')
        setAnchoMax((config?.ancho_max as number) ?? ANCHO_DEFAULT)
    }, [open])

    function handleOpen(v: boolean) {
        if (!v) onClose()
    }

    async function subirArchivo(file: File) {
        setSubiendo(true)
        try {
            const form = new FormData()
            form.append('imagen', file)
            const res = await axios.post<ImagenItem>(
                route('admin.productos.hooks.imagenes.store', { producto: productoId, hook: hookKey }),
                form,
            )

            // Si había imagen previa, la borramos en S3. UI optimista: nueva ya seteada.
            if (imagen) {
                axios.delete(
                    route('admin.productos.hooks.imagenes.destroy', { producto: productoId, hook: hookKey }),
                    { data: { ruta: imagen.ruta } },
                ).catch(() => { /* el cron limpia huérfanas en 24h */ })
            }

            setImagen(res.data)
        } catch {
            toast.error('Error al subir la imagen')
        } finally {
            setSubiendo(false)
        }
    }

    async function eliminar() {
        if (!imagen) return
        const snapshot = imagen
        setImagen(null)
        try {
            await axios.delete(
                route('admin.productos.hooks.imagenes.destroy', { producto: productoId, hook: hookKey }),
                { data: { ruta: snapshot.ruta } },
            )
        } catch {
            setImagen(snapshot)
            toast.error('Error al eliminar la imagen')
        }
    }

    function onChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) subirArchivo(file)
        e.target.value = ''
    }

    function guardar() {
        if (!imagen) return
        setGuardando(true)
        postHookConfig({
            productoId,
            hookKey,
            config: {
                url:       imagen.url,
                ruta:      imagen.ruta,
                alt:       alt.trim() || undefined,
                link_url:  linkUrl.trim() || undefined,
                ancho_max: anchoMax,
            },
            onSuccess: () => onClose(),
            onError:   () => toast.error('Error al guardar'),
            onFinish:  () => setGuardando(false),
        })
    }

    return (
        <Sheet open={open} onOpenChange={handleOpen}>
            <SheetContent className="sm:max-w-md flex flex-col">
                <SheetHeader>
                    <SheetTitle>{titulo}</SheetTitle>
                    <SheetDescription>Imagen estática con link opcional. Aparece como un bloque arrastrable en el layout.</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    {imagen ? (
                        <div className="group relative rounded-lg border border-slate-200 overflow-hidden">
                            <img src={imagen.url} alt="" className="w-full h-auto" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                    type="button"
                                    onClick={eliminar}
                                    className="rounded-full bg-white/90 p-2 text-slate-700 hover:bg-red-500 hover:text-white transition-colors duration-200"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            disabled={subiendo}
                            onClick={() => !subiendo && inputRef.current?.click()}
                            className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-500 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {subiendo
                                ? <div className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                                : <ImageIcon className="size-5" />
                            }
                            <span className="text-sm">{subiendo ? 'Subiendo…' : 'Subir imagen'}</span>
                        </button>
                    )}

                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={onChangeInput}
                    />

                    <div className="border-t border-slate-100 pt-4 space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                                Texto alternativo <span className="text-slate-500">(SEO)</span>
                            </label>
                            <input
                                type="text"
                                value={alt}
                                onChange={e => setAlt(e.target.value)}
                                placeholder="Descripción breve de la imagen"
                                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-400 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                                Link <span className="text-slate-500">(opcional)</span>
                            </label>
                            <input
                                type="url"
                                value={linkUrl}
                                onChange={e => setLinkUrl(e.target.value)}
                                placeholder="https://…"
                                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-400 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                                Ancho máximo: <span className="text-slate-900">{anchoMax}px</span>
                            </label>
                            <input
                                type="range"
                                min={320}
                                max={1200}
                                step={20}
                                value={anchoMax}
                                onChange={e => setAnchoMax(parseInt(e.target.value, 10))}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                <SheetFooter>
                    <Button onClick={guardar} disabled={guardando || !imagen}>
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </Button>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

function extraerImagen(config: Record<string, unknown> | null): ImagenItem | null {
    if (! config || typeof config.url !== 'string' || typeof config.ruta !== 'string') return null
    return { url: config.url, ruta: config.ruta }
}

// ─────────────────────────────────────────────────────────────────────────
// Wrappers para registrar en MODAL_MAP — cada uno fija su hookKey + título.
// ─────────────────────────────────────────────────────────────────────────
export function ModalImagenPromesa(props: BaseProps) {
    return <ModalImagenEstatica {...props} hookKey="imagen_promesa" titulo="Imagen — promesa" />
}

export function ModalImagenIntermedia(props: BaseProps) {
    return <ModalImagenEstatica {...props} hookKey="imagen_intermedia" titulo="Imagen — intermedia" />
}

export function ModalImagenCierre(props: BaseProps) {
    return <ModalImagenEstatica {...props} hookKey="imagen_cierre" titulo="Imagen — cierre" />
}
