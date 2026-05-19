import { useEffect } from 'react'
import { useForm } from '@inertiajs/react'
import { toast } from 'sonner'
import { FormEventHandler } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/Dialog'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/Select'
import { Switch } from '@/Components/ui/Switch'
import { Textarea } from '@/Components/ui/Textarea'

interface Categoria {
    id: number
    name: string
    slug: string
    parent_id: number | null
    status: string
    image_url: string | null
    description: string | null
    children_count: number
}

interface Padre {
    id: number
    name: string
}

interface Props {
    open: boolean
    onClose: () => void
    categoria: Categoria | null
    padres: Padre[]
}

function generarSlug(nombre: string): string {
    return nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
}

export default function EditCategoryModal({ open, onClose, categoria, padres }: Props) {
    const { data, setData, post, processing, errors, reset, setDefaults } = useForm<{
        name: string
        slug: string
        parent_id: string
        status: string
        image: File | null
        description: string
    }>({
        name:        '',
        slug:        '',
        parent_id:   '',
        status:      'activo',
        image:       null,
        description: '',
    })

    useEffect(() => {
        if (categoria) {
            setData({
                name:        categoria.name,
                slug:        categoria.slug,
                parent_id:   categoria.parent_id ? String(categoria.parent_id) : '',
                status:      categoria.status,
                image:       null,
                description: categoria.description ?? '',
            })
        }
    }, [categoria])

    const submit: FormEventHandler = (e) => {
        e.preventDefault()
        if (!categoria) return
        post(route('admin.categorias.update', categoria.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => { reset(); onClose() },
            onError:   () => toast.error('Error al guardar los cambios'),
        })
    }

    const handleClose = () => { reset(); onClose() }

    const esPadreConHijos = (categoria?.children_count ?? 0) > 0

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) handleClose() }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar categoría</DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-3">

                    {/* Nombre */}
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-name">Nombre <span className="text-red-500">*</span></Label>
                        <Input
                            id="edit-name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>

                    {/* Slug */}
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-slug">Slug <span className="text-red-500">*</span></Label>
                        <Input
                            id="edit-slug"
                            value={data.slug}
                            onChange={e => setData('slug', e.target.value)}
                        />
                        {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
                    </div>

                    {/* Categoría padre — deshabilitado si tiene hijos */}
                    <div className="space-y-1.5">
                        <Label>Categoría padre</Label>
                        <Select
                            value={data.parent_id || 'ninguna'}
                            onValueChange={v => setData('parent_id', v === 'ninguna' ? '' : v)}
                            disabled={esPadreConHijos}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Ninguna (es categoría raíz)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ninguna">Ninguna (es categoría raíz)</SelectItem>
                                {padres
                                    .filter(p => p.id !== categoria?.id)
                                    .map(p => (
                                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                        {esPadreConHijos && (
                            <p className="text-xs text-slate-400">No se puede cambiar el padre porque esta categoría tiene subcategorías.</p>
                        )}
                        {errors.parent_id && <p className="text-xs text-red-500">{errors.parent_id}</p>}
                    </div>

                    {/* Estado */}
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
                        <Label htmlFor="edit-status" className="cursor-pointer">
                            Estado
                            <span className="ml-2 text-xs text-slate-400">{data.status === 'activo' ? 'Activo' : 'Inactivo'}</span>
                        </Label>
                        <Switch
                            id="edit-status"
                            checked={data.status === 'activo'}
                            onCheckedChange={v => setData('status', v ? 'activo' : 'inactivo')}
                        />
                    </div>

                    {/* Imagen */}
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-image">
                            Imagen <span className="text-xs text-slate-400">(dejar vacío para mantener la actual)</span>
                        </Label>
                        {categoria?.image_url && (
                            <img src={categoria.image_url} alt="Imagen actual" className="h-16 w-16 rounded-lg object-cover border border-slate-200" />
                        )}
                        <Input
                            id="edit-image"
                            type="file"
                            accept="image/*"
                            className="cursor-pointer"
                            onChange={e => setData('image', e.target.files?.[0] ?? null)}
                        />
                        {errors.image && <p className="text-xs text-red-500">{errors.image}</p>}
                    </div>

                    {/* Descripción */}
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-desc">Descripción <span className="text-xs text-slate-400">(opcional, SEO)</span></Label>
                        <Textarea
                            id="edit-desc"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            rows={3}
                        />
                        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
                        <Button type="submit" disabled={processing || !data.name || !data.slug}>
                            {processing ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                    </div>

                </form>
            </DialogContent>
        </Dialog>
    )
}
