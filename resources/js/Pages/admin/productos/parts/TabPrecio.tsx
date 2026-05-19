import { useMemo, useState } from 'react'
import { useForm } from '@inertiajs/react'
import { toast } from 'sonner'
import { FormEventHandler } from 'react'
import { Plus, Trash2, ImageIcon, Info, Star } from 'lucide-react'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Switch } from '@/Components/ui/Switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/Select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/Popover'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/AlertDialog'
import { Alert, AlertDescription } from '@/Components/ui/Alert'
import { formatearPrecio } from '@/lib/utils'
import type { ProductoData, CantidadData } from '../edit'

interface Props {
    producto?: ProductoData
}

const IVA_OPCIONES = [
    { value: '0',    label: '0% — Exento' },
    { value: '5',    label: '5%' },
    { value: '10.5', label: '10.5%' },
    { value: '16',   label: '16%' },
    { value: '19',   label: '19%' },
    { value: '21',   label: '21%' },
]

const BADGE_SUGERENCIAS = ['Más popular', 'Mejor precio', 'Más vendido', 'Oferta especial']

type FilaCantidad = Omit<CantidadData, 'precio_bundle'> & { precio_bundle: number | string; destacado: boolean }

// Muestra el valor raw (dígitos) como precio formateado para el input
function precioParaInput(val: string | number): string {
    if (val === '' || val === null || val === undefined) return ''
    const n = typeof val === 'number' ? Math.round(val) : parseInt(String(val).replace(/\D/g, ''), 10)
    return isNaN(n) || n === 0 ? '' : formatearPrecio(n)
}

export default function TabPrecio({ producto }: Props) {
    if (!producto) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <p className="text-sm text-slate-500">Primero guarda la información del producto para poder configurar el precio.</p>
            </div>
        )
    }

    const [eliminarIndex, setEliminarIndex] = useState<number | null>(null)

    const { data, setData, post, processing, errors } = useForm<{
        precio_base:         string
        precio_comparacion:  string
        aplica_iva:          boolean
        iva_porcentaje:      string
        cantidades:          FilaCantidad[]
    }>({
        precio_base:         producto.precio_base ? String(Math.round(producto.precio_base)) : '',
        precio_comparacion:  producto.precio_comparacion ? String(Math.round(producto.precio_comparacion)) : '',
        aplica_iva:          producto.aplica_iva ?? false,
        iva_porcentaje:      producto.iva_porcentaje ? String(producto.iva_porcentaje) : '19',
        cantidades:          producto.cantidades.map(c => ({ ...c, precio_bundle: String(Math.round(c.precio_bundle)), destacado: c.destacado ?? false })),
    })

    const precioFinal = useMemo(() => {
        const base = parseFloat(data.precio_base) || 0
        const iva  = data.aplica_iva ? (parseFloat(data.iva_porcentaje) || 0) : 0
        return base + (base * iva / 100)
    }, [data.precio_base, data.aplica_iva, data.iva_porcentaje])

    const agregarFila = () => {
        setData('cantidades', [
            ...data.cantidades,
            { imagen: null, cantidad: 1, precio_bundle: '', badge_texto: '', destacado: false, orden: data.cantidades.length },
        ])
    }

    const marcarDestacado = (index: number) => {
        setData('cantidades', data.cantidades.map((fila, i) => ({
            ...fila,
            destacado: i === index ? !fila.destacado : false,
        })))
    }

    const actualizarFila = (index: number, campo: keyof FilaCantidad, valor: string | number | null) => {
        const nuevas = [...data.cantidades]
        nuevas[index] = { ...nuevas[index], [campo]: valor }
        setData('cantidades', nuevas)
    }

    const eliminarFila = (index: number) => {
        setData('cantidades', data.cantidades.filter((_, i) => i !== index))
        setEliminarIndex(null)
    }

    const calcularPreviewFila = (fila: FilaCantidad) => {
        const base    = parseFloat(data.precio_base) || 0
        const bundle  = parseFloat(String(fila.precio_bundle)) || 0
        const cant    = fila.cantidad || 1
        if (!bundle || !base || !cant) return null

        const porUd  = bundle / cant
        const ahorro = base > 0 ? ((1 - bundle / (base * cant)) * 100) : 0
        return { porUd, ahorro }
    }

    const submit: FormEventHandler = (e) => {
        e.preventDefault()
        post(route('admin.productos.update-precio', producto.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Precio actualizado.'),
            onError:   () => toast.error('Error al guardar el precio'),
        })
    }

    return (
      <TooltipProvider delayDuration={300}>
        <form onSubmit={submit}>

            {/* Sección A — Precio base */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 lg:grid-cols-4">

                {/* Precio base */}
                <div className="space-y-1.5">
                    <Label htmlFor="precio-base">Precio base <span className="text-red-500">*</span></Label>
                    <Input
                        id="precio-base"
                        type="text"
                        inputMode="numeric"
                        value={precioParaInput(data.precio_base)}
                        onChange={e => setData('precio_base', e.target.value.replace(/\D/g, ''))}
                        placeholder="89.900"
                    />
                    {errors.precio_base && <p className="text-xs text-red-500">{errors.precio_base}</p>}
                </div>

                {/* Precio de comparación */}
                <div className="space-y-1.5">
                    <Label htmlFor="precio-comparacion">Precio anterior <span className="text-slate-400 font-normal">(opcional)</span></Label>
                    <Input
                        id="precio-comparacion"
                        type="text"
                        inputMode="numeric"
                        value={precioParaInput(data.precio_comparacion)}
                        onChange={e => setData('precio_comparacion', e.target.value.replace(/\D/g, ''))}
                        placeholder="119.900"
                    />
                    <p className="text-xs text-slate-400">Muestra precio tachado y badge de descuento.</p>
                </div>

                {/* IVA */}
                <div className="space-y-1.5">
                    <Label>IVA</Label>
                    <div className="flex items-center gap-3">
                        <Switch
                            id="aplica-iva"
                            checked={data.aplica_iva}
                            onCheckedChange={v => setData('aplica_iva', v)}
                        />
                        <span className="text-sm text-slate-500">
                            {data.aplica_iva ? 'Aplica IVA' : 'Sin IVA'}
                        </span>
                    </div>
                    {data.aplica_iva && (
                        <Select
                            value={data.iva_porcentaje}
                            onValueChange={v => setData('iva_porcentaje', v)}
                        >
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Selecciona porcentaje" />
                            </SelectTrigger>
                            <SelectContent>
                                {IVA_OPCIONES.map(op => (
                                    <SelectItem key={op.value} value={op.value}>
                                        {op.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                {/* Precio final (read-only) */}
                <div className="space-y-1.5">
                    <Label>Precio final</Label>
                    <div className="flex h-9 items-center rounded-md border border-slate-200 bg-slate-50 px-3">
                        <span className="text-sm font-medium text-slate-700">
                            {precioFinal > 0 ? `$${formatearPrecio(precioFinal)}` : '—'}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400">
                        {data.aplica_iva
                            ? `Precio base + ${data.iva_porcentaje}% IVA`
                            : 'Sin IVA aplicado'}
                    </p>
                </div>

            </div>

            {/* Separador */}
            <div className="my-7 border-t border-slate-100" />

            {/* Sección B — Ofertas por cantidad */}
            <div className="space-y-4">

                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-slate-700">Ofertas por cantidad</h3>
                        <p className="text-xs text-slate-400">Muestra paquetes con precio especial para incentivar compras mayores.</p>
                    </div>
                    {data.cantidades.length > 0 && (
                        <Button type="button" variant="outline" size="sm" onClick={agregarFila}>
                            <Plus />
                            Agregar oferta
                        </Button>
                    )}
                </div>

                {/* Aviso sobre imágenes */}
                {data.cantidades.length > 0 && (
                    <Alert variant="info">
                        <Info />
                        <AlertDescription>
                            Las imágenes de cada oferta se asignan desde el tab <strong>Imágenes</strong>. Completa ese tab primero y luego vuelve aquí para asignarlas.
                        </AlertDescription>
                    </Alert>
                )}

                {data.cantidades.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-200 py-10 text-center">
                        <p className="text-sm text-slate-400">Sin ofertas de cantidad. Agrégalas para mostrar paquetes a tus clientes.</p>
                        <Button type="button" variant="outline" size="sm" onClick={agregarFila}>
                            <Plus />
                            Agregar primera oferta
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">

                        {/* Cabecera de tabla */}
                        <div className="grid grid-cols-[56px_80px_1fr_1fr_32px_32px] items-center gap-3 px-1">
                            <span className="text-xs font-medium text-slate-400">Imagen</span>
                            <span className="text-xs font-medium text-slate-400">Cantidad</span>
                            <span className="text-xs font-medium text-slate-400">Precio del bundle</span>
                            <span className="text-xs font-medium text-slate-400">Badge <span className="font-normal">(opcional)</span></span>
                            <span />
                            <span />
                        </div>

                        {data.cantidades.map((fila, index) => {
                            const preview = calcularPreviewFila(fila)
                            return (
                                <div key={index} className="space-y-1">
                                    {fila.destacado && (
                                        <div className="flex items-center">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                                <Star className="size-3 fill-amber-500 text-amber-500" />
                                                Destacado
                                            </span>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-[56px_80px_1fr_1fr_32px_32px] items-start gap-3 rounded-lg p-1 transition-colors duration-200">

                                        {/* Imagen — selector con Popover si hay imágenes, tooltip si no */}
                                        {producto.imagenes.length > 0 ? (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button type="button" className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50 transition-colors duration-200 hover:border-slate-400">
                                                        {fila.imagen ? (
                                                            <img src={fila.imagen} alt="" className="size-full object-cover" />
                                                        ) : (
                                                            <ImageIcon className="size-4 text-slate-300" />
                                                        )}
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent side="bottom" align="start" className="w-56 p-2">
                                                    <p className="mb-2 text-xs font-medium text-slate-500">Selecciona una imagen</p>
                                                    <div className="grid grid-cols-4 gap-1">
                                                        {fila.imagen && (
                                                            <button
                                                                type="button"
                                                                onClick={() => actualizarFila(index, 'imagen', null)}
                                                                className="col-span-4 rounded border border-dashed border-slate-200 py-1 text-xs text-slate-400 hover:border-slate-400"
                                                            >
                                                                Sin imagen
                                                            </button>
                                                        )}
                                                        {producto.imagenes.map(img => (
                                                            <button
                                                                key={img.id}
                                                                type="button"
                                                                onClick={() => actualizarFila(index, 'imagen', img.url)}
                                                                className={`overflow-hidden rounded border-2 transition-colors duration-200 ${fila.imagen === img.url ? 'border-slate-700' : 'border-transparent hover:border-slate-300'}`}
                                                            >
                                                                <img src={img.url} alt="" className="aspect-square w-full object-cover" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        ) : (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex size-14 shrink-0 cursor-default items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 text-slate-300">
                                                        <ImageIcon className="size-4" />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">
                                                    Sube imágenes en el tab → Imágenes
                                                </TooltipContent>
                                            </Tooltip>
                                        )}

                                        {/* Cantidad */}
                                        <Input
                                            type="number"
                                            min="1"
                                            value={fila.cantidad}
                                            onChange={e => actualizarFila(index, 'cantidad', parseInt(e.target.value) || 1)}
                                            placeholder="1"
                                        />

                                        {/* Precio bundle */}
                                        <div className="space-y-1">
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                value={precioParaInput(fila.precio_bundle)}
                                                onChange={e => actualizarFila(index, 'precio_bundle', e.target.value.replace(/\D/g, ''))}
                                                placeholder="89.900"
                                            />
                                            {preview && (
                                                <p className="text-xs text-slate-400">
                                                    ${formatearPrecio(preview.porUd)}/ud
                                                    {preview.ahorro > 0 && (
                                                        <span className="ml-1.5 font-medium text-emerald-600">
                                                            · Ahorra {Math.round(preview.ahorro)}%
                                                        </span>
                                                    )}
                                                </p>
                                            )}
                                        </div>

                                        {/* Badge */}
                                        <div className="space-y-1.5">
                                            <Input
                                                value={fila.badge_texto ?? ''}
                                                onChange={e => actualizarFila(index, 'badge_texto', e.target.value)}
                                                placeholder="Ej: Más popular"
                                                maxLength={50}
                                            />
                                            <div className="flex flex-wrap gap-1">
                                                {BADGE_SUGERENCIAS.map(s => (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onClick={() => actualizarFila(index, 'badge_texto', s)}
                                                        className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-500 transition-colors duration-200 hover:border-slate-400 hover:text-slate-700"
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Destacado */}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    type="button"
                                                    onClick={() => marcarDestacado(index)}
                                                    className={`mt-1.5 rounded-md p-1.5 transition-colors duration-200 ${
                                                        fila.destacado
                                                            ? 'text-amber-400 hover:text-amber-500'
                                                            : 'text-slate-300 hover:text-amber-400'
                                                    }`}
                                                >
                                                    <Star className={`size-3.5 ${fila.destacado ? 'fill-amber-400' : ''}`} />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                {fila.destacado ? 'Quitar destacado' : 'Marcar como destacado'}
                                            </TooltipContent>
                                        </Tooltip>

                                        {/* Eliminar */}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    type="button"
                                                    onClick={() => setEliminarIndex(index)}
                                                    className="mt-1.5 rounded-md p-1.5 text-slate-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-500"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">Eliminar oferta</TooltipContent>
                                        </Tooltip>

                                    </div>
                                </div>
                            )
                        })}

                    </div>
                )}
            </div>

            {/* Guardar */}
            <div className="mt-7 border-t border-slate-100 pt-5">
                <Button type="submit" disabled={processing || !data.precio_base}>
                    {processing ? 'Guardando...' : 'Guardar precio'}
                </Button>
            </div>

            {/* AlertDialog confirmar eliminar oferta */}
            <AlertDialog open={eliminarIndex !== null} onOpenChange={open => { if (!open) setEliminarIndex(null) }}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar oferta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se eliminará esta oferta de cantidad. Los cambios se aplican al guardar.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={() => eliminarIndex !== null && eliminarFila(eliminarIndex)}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </form>
      </TooltipProvider>
    )
}
