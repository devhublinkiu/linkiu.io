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
import { generarSlug } from '@/lib/utils'

interface Padre {
    id: number
    name: string
}

interface Props {
    open: boolean
    onClose: () => void
    padres: Padre[]
}

export default function AddCategoryModal({ open, onClose, padres }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<{
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
        if (data.name) setData('slug', generarSlug(data.name))
    }, [data.name])

    const submit: FormEventHandler = (e) => {
        e.preventDefault()
        post(route('admin.categorias.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => { reset(); onClose() },
            onError:   (errs) => toast.error((errs.general as string | undefined) ?? 'Error al crear la categoría'),
        })
    }

    const handleClose = () => { reset(); onClose() }

    const puedeGuardar = !!data.name && !!data.slug

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) handleClose() }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Agregar categoría</DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-3">

                    {/* Nombre */}
                    <div className="space-y-1.5">
                        <Label htmlFor="cat-name">Nombre <span className="text-red-500">*</span></Label>
                        <Input
                            id="cat-name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="Ropa deportiva"
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>

                    {/* Slug */}
                    <div className="space-y-1.5">
                        <Label htmlFor="cat-slug">Slug <span className="text-red-500">*</span></Label>
                        <Input
                            id="cat-slug"
                            value={data.slug}
                            onChange={e => setData('slug', e.target.value)}
                            placeholder="ropa-deportiva"
                        />
                        {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
                    </div>

                    {/* Categoría padre */}
                    <div className="space-y-1.5">
                        <Label>Categoría padre</Label>
                        <Select value={data.parent_id} onValueChange={v => setData('parent_id', v === 'ninguna' ? '' : v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Ninguna (es categoría raíz)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ninguna">Ninguna (es categoría raíz)</SelectItem>
                                {padres.map(p => (
                                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.parent_id && <p className="text-xs text-red-500">{errors.parent_id}</p>}
                    </div>

                    {/* Estado */}
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
                        <Label htmlFor="cat-status" className="cursor-pointer">
                            Estado
                            <span className="ml-2 text-xs text-slate-400">{data.status === 'activo' ? 'Activo' : 'Inactivo'}</span>
                        </Label>
                        <Switch
                            id="cat-status"
                            checked={data.status === 'activo'}
                            onCheckedChange={v => setData('status', v ? 'activo' : 'inactivo')}
                        />
                    </div>

                    {/* Imagen */}
                    <div className="space-y-1.5">
                        <Label htmlFor="cat-image">Imagen <span className="text-xs text-slate-400">(opcional)</span></Label>
                        <Input
                            id="cat-image"
                            type="file"
                            accept="image/*"
                            className="cursor-pointer"
                            onChange={e => setData('image', e.target.files?.[0] ?? null)}
                        />
                        {errors.image && <p className="text-xs text-red-500">{errors.image}</p>}
                    </div>

                    {/* Descripción */}
                    <div className="space-y-1.5">
                        <Label htmlFor="cat-desc">Descripción <span className="text-xs text-slate-400">(opcional, SEO)</span></Label>
                        <Textarea
                            id="cat-desc"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            placeholder="Describe esta categoría para mejorar el SEO..."
                            rows={3}
                        />
                        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
                        <Button type="submit" disabled={processing || !puedeGuardar}>
                            {processing ? 'Guardando...' : 'Crear categoría'}
                        </Button>
                    </div>

                </form>
            </DialogContent>
        </Dialog>
    )
}
