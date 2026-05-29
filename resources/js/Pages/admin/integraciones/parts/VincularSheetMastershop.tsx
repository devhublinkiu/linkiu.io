import { useEffect, useMemo, useState } from 'react'
import { router } from '@inertiajs/react'
import axios from 'axios'
import { toast } from 'sonner'
import { Search, Loader2, Package, ChevronLeft } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Button } from '@/Components/ui/Button'
import { Empty } from '@/Components/ui/Empty'
import type { ProductoMastershop } from './ProductosTablaMastershop'

interface VariacionMS {
    sku:        string
    name:       string
    price:      number
    stock:      number
    isEnable:   number
    idVariant:  number
    idProduct:  number
    options:    Array<{ nameValue: string; propertyName: string }> | null
}

interface ProductoMS {
    idProduct:        number
    name:             string
    description:      string
    basePrice:        number
    suggestedPrice:   number
    urlImageProduct:  string
    stockTotal:       number
    nameState:        string
    variation:        VariacionMS[]
    productOwner?:    { publicName: string }
}

interface BusquedaResultado {
    idProduct:        number
    name:             string
    basePrice:        number
    urlImageProduct:  string
    stockTotal:       number
    variation:        VariacionMS[]
}

interface Props {
    producto: ProductoMastershop | null
    onClose:  () => void
}

export default function VincularSheetMastershop({ producto, onClose }: Props) {

    const [busqueda, setBusqueda]                       = useState('')
    const [resultados, setResultados]                   = useState<BusquedaResultado[]>([])
    const [cargandoBusqueda, setCargandoBusqueda]       = useState(false)
    const [productoMSSelected, setProductoMSSelected]   = useState<ProductoMS | null>(null)
    const [cargandoDetalle, setCargandoDetalle]         = useState(false)
    const [mapping, setMapping]                         = useState<Record<number, number>>({}) // variable_item_id -> idVariant
    const [defaultVariantId, setDefaultVariantId]       = useState<number | null>(null)
    const [guardando, setGuardando]                     = useState(false)

    // Reset al cambiar de producto
    useEffect(() => {
        if (!producto) return
        setBusqueda('')
        setResultados([])
        setProductoMSSelected(null)
        setMapping(
            Object.fromEntries(
                producto.grupos_variantes
                    .flatMap(g => g.items)
                    .filter(i => i.mastershop_id_variant !== null)
                    .map(i => [i.id, i.mastershop_id_variant!]),
            ),
        )
        setDefaultVariantId(producto.mastershop_id_variant)

        // Si ya tiene vinculación, precargar el producto Mastershop
        if (producto.mastershop_id_product) {
            cargarDetalle(producto.mastershop_id_product)
        }
    }, [producto?.id])

    // Búsqueda con debounce
    useEffect(() => {
        if (!producto) return
        if (busqueda.trim().length < 2) {
            setResultados([])
            return
        }

        const handle = setTimeout(async () => {
            setCargandoBusqueda(true)
            try {
                const res = await axios.get<{ ok: boolean; results: BusquedaResultado[] }>(
                    route('admin.integraciones.mastershop.buscar'),
                    { params: { q: busqueda, limit: 10 } },
                )
                if (res.data.ok) setResultados(res.data.results)
            } catch {
                toast.error('Error al buscar en Mastershop')
            } finally {
                setCargandoBusqueda(false)
            }
        }, 350)

        return () => clearTimeout(handle)
    }, [busqueda, producto?.id])

    async function cargarDetalle(idProduct: number) {
        setCargandoDetalle(true)
        try {
            const res = await axios.get<{ ok: boolean; producto: ProductoMS }>(
                route('admin.integraciones.mastershop.producto', idProduct),
            )
            if (res.data.ok) {
                setProductoMSSelected(res.data.producto)

                // Si producto Linkiu no tiene variantes, auto-seleccionar la Default Variant
                if (!producto?.tiene_variantes) {
                    const def = res.data.producto.variation.find(v => v.name === 'Default Variant')
                                ?? res.data.producto.variation[0]
                    if (def) setDefaultVariantId(def.idVariant)
                }
            }
        } catch {
            toast.error('No se pudo cargar el producto')
        } finally {
            setCargandoDetalle(false)
        }
    }

    function guardar() {
        if (!producto || !productoMSSelected) return
        setGuardando(true)

        const payload = {
            mastershop_id_product: productoMSSelected.idProduct,
            mastershop_id_variant: producto.tiene_variantes ? null : defaultVariantId,
            mapping,
        }

        router.post(route('admin.integraciones.mastershop.vincular', producto.id), payload, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Producto vinculado correctamente')
                onClose()
            },
            onError:   () => toast.error('Error al guardar la vinculación'),
            onFinish:  () => setGuardando(false),
        })
    }

    const variantesSinDefault = useMemo(
        () => productoMSSelected?.variation.filter(v => v.name !== 'Default Variant') ?? [],
        [productoMSSelected],
    )

    const canGuardar = producto?.tiene_variantes
        ? Object.keys(mapping).length === producto.grupos_variantes.flatMap(g => g.items).length
        : defaultVariantId !== null

    if (!producto) return null

    return (
        <Sheet open={!!producto} onOpenChange={v => !v && onClose()}>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">

                <SheetHeader>
                    <SheetTitle>Vincular con Mastershop</SheetTitle>
                    <SheetDescription>
                        Producto Linkiu: <strong className="text-slate-900">{producto.nombre}</strong>
                    </SheetDescription>
                </SheetHeader>

                <div className="px-4 space-y-5 py-4">

                    {/* Paso 1: Buscar producto Mastershop */}
                    {!productoMSSelected && (
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="ms-buscar">Buscar producto en Mastershop</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="ms-buscar"
                                        value={busqueda}
                                        onChange={e => setBusqueda(e.target.value)}
                                        placeholder="Nombre o descripción (mín. 2 caracteres)"
                                        className="pl-9 text-sm"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {cargandoBusqueda && (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                </div>
                            )}

                            {!cargandoBusqueda && busqueda.length >= 2 && resultados.length === 0 && (
                                <Empty
                                    icon={Package}
                                    title="Sin resultados"
                                    description="Probá con otro término de búsqueda."
                                />
                            )}

                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {resultados.map(r => (
                                    <button
                                        key={r.idProduct}
                                        type="button"
                                        onClick={() => cargarDetalle(r.idProduct)}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors duration-200 text-left"
                                    >
                                        <img
                                            src={r.urlImageProduct}
                                            alt={r.name}
                                            className="w-12 h-12 rounded-md object-cover bg-slate-100 shrink-0"
                                            onError={e => { e.currentTarget.style.display = 'none' }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">{r.name}</p>
                                            <p className="text-xs text-slate-500">
                                                ${r.basePrice.toLocaleString('es-CO')} · Stock: {r.stockTotal} · {r.variation.length} variante{r.variation.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Paso 2: Producto seleccionado + mapping */}
                    {cargandoDetalle && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                        </div>
                    )}

                    {productoMSSelected && !cargandoDetalle && (
                        <div className="space-y-5">

                            {/* Card del producto seleccionado */}
                            <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
                                <div className="flex items-start gap-3">
                                    <img
                                        src={productoMSSelected.urlImageProduct}
                                        alt={productoMSSelected.name}
                                        className="w-16 h-16 rounded-md object-cover bg-white border border-slate-200 shrink-0"
                                        onError={e => { e.currentTarget.style.display = 'none' }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900">{productoMSSelected.name}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            ID: {productoMSSelected.idProduct} · Stock: {productoMSSelected.stockTotal}
                                        </p>
                                        {productoMSSelected.productOwner && (
                                            <p className="text-xs text-slate-500">
                                                {productoMSSelected.productOwner.publicName}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setProductoMSSelected(null); setMapping({}); setDefaultVariantId(null) }}
                                    className="mt-3 text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 transition-colors duration-200"
                                >
                                    <ChevronLeft className="w-3 h-3" />
                                    Cambiar producto
                                </button>
                            </div>

                            {/* Mapping de variantes */}
                            {producto.tiene_variantes ? (
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">Mapear variantes</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Asigná a cada variante Linkiu la variante equivalente en Mastershop.
                                        </p>
                                    </div>

                                    {producto.grupos_variantes.map(grupo => (
                                        <div key={grupo.id} className="space-y-2">
                                            <Label className="text-xs uppercase tracking-wide text-slate-500">{grupo.nombre}</Label>
                                            {grupo.items.map(item => (
                                                <div key={item.id} className="flex items-center gap-3">
                                                    <span className="text-sm text-slate-700 w-32 shrink-0">{item.nombre}</span>
                                                    <span className="text-slate-400">→</span>
                                                    <select
                                                        value={mapping[item.id] ?? ''}
                                                        onChange={e => setMapping(prev => ({ ...prev, [item.id]: parseInt(e.target.value) }))}
                                                        className="flex-1 text-sm rounded-md border border-slate-200 px-3 py-2 bg-white"
                                                    >
                                                        <option value="">— Seleccioná variante Mastershop —</option>
                                                        {variantesSinDefault.map(v => (
                                                            <option key={v.idVariant} value={v.idVariant}>
                                                                {v.name} · SKU {v.sku} · Stock {v.stock}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                                    <p className="text-sm text-emerald-700">
                                        ✓ Este producto Linkiu no tiene variantes — se vincula automáticamente con la
                                        <strong> Default Variant</strong> de Mastershop.
                                    </p>
                                </div>
                            )}

                        </div>
                    )}

                </div>

                <SheetFooter className="border-t border-slate-200 px-4 py-4">
                    <Button variant="outline" onClick={onClose} disabled={guardando}>Cancelar</Button>
                    <Button onClick={guardar} disabled={guardando || !canGuardar || !productoMSSelected}>
                        {guardando && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                        Guardar vinculación
                    </Button>
                </SheetFooter>

            </SheetContent>
        </Sheet>
    )
}
