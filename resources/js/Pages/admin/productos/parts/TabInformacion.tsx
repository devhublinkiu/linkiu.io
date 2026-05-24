import { useEffect } from 'react'
import { useForm } from '@inertiajs/react'
import { toast } from 'sonner'
import { FormEventHandler } from 'react'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Textarea } from '@/Components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/Select'
import { Switch } from '@/Components/ui/Switch'
import type { ProductoData } from '../Edit'

interface Categoria {
    id: number
    name: string
}

interface Props {
    categorias: Categoria[]
    producto?: ProductoData
}

function generarSlug(texto: string): string {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
}

export default function TabInformacion({ categorias, producto }: Props) {
    const esEdicion = !!producto

    const { data, setData, post, processing, errors } = useForm({
        nombre:      producto?.nombre      ?? '',
        slug:        producto?.slug        ?? '',
        descripcion: producto?.descripcion ?? '',
        category_id: producto?.category_id ? String(producto.category_id) : '',
        sku:         producto?.sku         ?? '',
        status:      producto?.status      ?? 'borrador',
    })

    useEffect(() => {
        if (!esEdicion) setData('slug', generarSlug(data.nombre))
    }, [data.nombre])

    const submit: FormEventHandler = (e) => {
        e.preventDefault()
        if (esEdicion) {
            post(route('admin.productos.update-info', producto.id), {
                preserveScroll: true,
                onError: () => toast.error('Error al guardar la información'),
            })
        } else {
            post(route('admin.productos.store'), {
                onError: () => toast.error('Error al crear el producto'),
            })
        }
    }

    const puedeGuardar = !!data.nombre && !!data.slug && !!data.category_id

    return (
        <form onSubmit={submit}>
            <div className="grid grid-cols-1 gap-x-10 gap-y-5 lg:grid-cols-2">

                {/* Columna izquierda */}
                <div className="space-y-5">

                    {/* Nombre */}
                    <div className="space-y-1.5">
                        <Label htmlFor="prod-nombre">Nombre del producto <span className="text-red-500">*</span></Label>
                        <Input
                            id="prod-nombre"
                            value={data.nombre}
                            onChange={e => setData('nombre', e.target.value)}
                            placeholder="Ej: SAVIA Cubre Canas"
                        />
                        {errors.nombre && <p className="text-xs text-red-500">{errors.nombre}</p>}
                    </div>

                    {/* Slug */}
                    <div className="space-y-1.5">
                        <Label htmlFor="prod-slug">Slug <span className="text-red-500">*</span></Label>
                        <Input
                            id="prod-slug"
                            value={data.slug}
                            onChange={e => setData('slug', e.target.value)}
                            placeholder="savia-cubre-canas"
                        />
                        <p className="text-xs text-slate-500">URL del producto: /productos/{data.slug || '...'}</p>
                        {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
                    </div>

                    {/* Descripción */}
                    <div className="space-y-1.5">
                        <Label htmlFor="prod-desc">
                            Descripción <span className="text-xs text-slate-500">(opcional)</span>
                        </Label>
                        <Textarea
                            id="prod-desc"
                            value={data.descripcion}
                            onChange={e => setData('descripcion', e.target.value)}
                            placeholder="Descripción corta del producto..."
                            rows={5}
                        />
                        <p className="text-xs text-slate-500">{data.descripcion.length}/500</p>
                        {errors.descripcion && <p className="text-xs text-red-500">{errors.descripcion}</p>}
                    </div>

                </div>

                {/* Columna derecha */}
                <div className="space-y-5">

                    {/* Categoría */}
                    <div className="space-y-1.5">
                        <Label>Categoría <span className="text-red-500">*</span></Label>
                        <Select
                            value={data.category_id}
                            onValueChange={v => setData('category_id', v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {categorias.map(cat => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category_id && <p className="text-xs text-red-500">{errors.category_id}</p>}
                    </div>

                    {/* SKU */}
                    <div className="space-y-1.5">
                        <Label htmlFor="prod-sku">
                            SKU / Código externo <span className="text-xs text-slate-500">(opcional)</span>
                        </Label>
                        <Input
                            id="prod-sku"
                            value={data.sku}
                            onChange={e => setData('sku', e.target.value)}
                            placeholder="Se genera automáticamente"
                        />
                        {errors.sku && <p className="text-xs text-red-500">{errors.sku}</p>}
                    </div>

                    {/* Estado */}
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
                        <Label htmlFor="prod-status" className="cursor-pointer">
                            Estado
                            <span className="ml-2 text-xs text-slate-500">
                                {data.status === 'activo' ? 'Activo — visible en la tienda' : 'Borrador — no visible'}
                            </span>
                        </Label>
                        <Switch
                            id="prod-status"
                            checked={data.status === 'activo'}
                            onCheckedChange={v => setData('status', v ? 'activo' : 'borrador')}
                        />
                    </div>

                </div>

            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">
                <Button type="submit" disabled={processing || !puedeGuardar}>
                    {processing ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
                </Button>
            </div>

        </form>
    )
}
