import { useEffect, type FormEventHandler } from 'react'
import { useForm } from '@inertiajs/react'
import { toast } from 'sonner'
import { ImageIcon } from 'lucide-react'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Button } from '@/Components/ui/Button'
import { Textarea } from '@/Components/ui/Textarea'
import { Switch } from '@/Components/ui/Switch'
import RichTextEditor from '@/Components/ui/RichTextEditor'
import { generarSlug } from '@/lib/utils'

interface PostInicial {
    id?:                   number
    titulo:                string
    slug:                  string
    resumen:               string | null
    contenido:             string
    estado:                string
    imagen_destacada_url:  string | null
}

interface Props {
    /** Si null, modo Create. Si tiene datos, modo Edit. */
    post:    PostInicial | null
    /** Modo: 'create' usa route('admin.blogs.store'); 'edit' usa route('admin.blogs.update', post.id) */
    modo:    'create' | 'edit'
}

export default function BlogPostForm({ post, modo }: Props) {
    const inicial = {
        titulo:    post?.titulo    ?? '',
        slug:      post?.slug      ?? '',
        resumen:   post?.resumen   ?? '',
        contenido: post?.contenido ?? '',
        estado:    post?.estado    ?? 'borrador',
        imagen:    null as File | null,
    }

    const { data, setData, post: submit, processing, errors, reset } = useForm(inicial)

    // Autocompleta el slug solo en modo Create (no machacar el slug existente al editar).
    useEffect(() => {
        if (modo === 'create' && data.titulo) {
            setData('slug', generarSlug(data.titulo))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.titulo])

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault()

        const url = modo === 'create'
            ? route('admin.blogs.store')
            : route('admin.blogs.update', post!.id!)

        submit(url, {
            forceFormData: true,  // necesario por la imagen (multipart)
            preserveScroll: true,
            onSuccess: () => {
                if (modo === 'create') reset()
            },
            onError: (errs) => toast.error((errs.general as string | undefined) ?? 'Error al guardar el post'),
        })
    }

    const puedeGuardar = data.titulo.trim() !== '' && data.slug.trim() !== '' && data.contenido.trim() !== ''

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">

            {/* Título */}
            <div className="space-y-1.5">
                <Label htmlFor="titulo">
                    Título <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="titulo"
                    value={data.titulo}
                    onChange={e => setData('titulo', e.target.value)}
                    placeholder="Ej. Cómo elegir el mejor producto para ti"
                    className="text-lg"
                    autoFocus
                />
                {errors.titulo && <p className="text-xs text-red-500">{errors.titulo}</p>}
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
                <Label htmlFor="slug">
                    Slug (URL) <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="slug"
                    value={data.slug}
                    onChange={e => setData('slug', e.target.value)}
                    placeholder="como-elegir-el-mejor-producto"
                    className="font-mono text-sm"
                />
                <p className="text-xs text-slate-500">
                    Se autocompleta desde el título al crear. Editable manualmente. La URL final será <span className="font-mono">/blog/{data.slug || 'tu-slug'}</span>
                </p>
                {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
            </div>

            {/* Resumen */}
            <div className="space-y-1.5">
                <Label htmlFor="resumen">
                    Resumen <span className="text-xs text-slate-500 font-normal">(opcional, ~150-300 caracteres)</span>
                </Label>
                <Textarea
                    id="resumen"
                    value={data.resumen}
                    onChange={e => setData('resumen', e.target.value)}
                    rows={2}
                    maxLength={300}
                    placeholder="Frase corta que aparece en el listado y en redes sociales al compartir."
                />
                {errors.resumen && <p className="text-xs text-red-500">{errors.resumen}</p>}
            </div>

            {/* Imagen destacada */}
            <div className="space-y-1.5">
                <Label htmlFor="imagen">
                    Imagen destacada <span className="text-xs text-slate-500 font-normal">(opcional)</span>
                </Label>
                {post?.imagen_destacada_url && !data.imagen && (
                    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <img
                            src={post.imagen_destacada_url}
                            alt="Imagen destacada actual"
                            className="size-16 rounded object-cover"
                        />
                        <span className="text-xs text-slate-500">Imagen actual. Sube otra para reemplazarla.</span>
                    </div>
                )}
                <Input
                    id="imagen"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={e => setData('imagen', e.target.files?.[0] ?? null)}
                    className="cursor-pointer"
                />
                {data.imagen && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <ImageIcon className="size-3.5" />
                        Nueva imagen: {data.imagen.name}
                    </p>
                )}
                {errors.imagen && <p className="text-xs text-red-500">{errors.imagen}</p>}
            </div>

            {/* Contenido (editor) */}
            <div className="space-y-1.5">
                <Label>
                    Contenido <span className="text-red-500">*</span>
                </Label>
                <RichTextEditor
                    value={data.contenido}
                    onChange={(html) => setData('contenido', html)}
                    placeholder="Escribe el contenido del post…"
                />
                {errors.contenido && <p className="text-xs text-red-500">{errors.contenido}</p>}
            </div>

            {/* Estado */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                <div>
                    <Label htmlFor="estado" className="cursor-pointer text-sm font-medium">
                        {data.estado === 'publicado' ? 'Publicado' : 'Borrador'}
                    </Label>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {data.estado === 'publicado'
                            ? 'Visible en /blog para todos los visitantes.'
                            : 'Solo visible para el equipo del admin.'}
                    </p>
                </div>
                <Switch
                    id="estado"
                    checked={data.estado === 'publicado'}
                    onCheckedChange={v => setData('estado', v ? 'publicado' : 'borrador')}
                />
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <Button type="submit" disabled={processing || !puedeGuardar}>
                    {processing
                        ? 'Guardando…'
                        : modo === 'create' ? 'Crear post' : 'Guardar cambios'}
                </Button>
            </div>

        </form>
    )
}
