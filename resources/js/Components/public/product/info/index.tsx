import { useEffect, useMemo, useRef, useState } from 'react'
import { router } from '@inertiajs/react'
import { Flame } from 'lucide-react'
import type { VariableGrupo, VariableItem } from '@/Pages/public/Product'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import { trackFb } from '@/lib/usePixel'
import SelectorVariables from './parts/SelectorVariables'
import SelectorVariablesPorUnidad from './parts/SelectorVariablesPorUnidad'
import SelectorCantidades, { type CantidadPublica, type OpcionCantidad } from './parts/SelectorCantidades'
import UrgenciaStock from '@/Components/public/product/urgencia-stock'
import BotonCompra, { type BotonCompraConfig } from '@/Components/public/product/boton-compra'

type Props = {
    ctaRef:               React.RefObject<HTMLButtonElement | null>
    selectorRef?:         React.RefObject<HTMLDivElement | null>  // marca el final de las ofertas (StickyBar lo observa)
    onPrecio:             (precio: number) => void
    productoId?:          number
    nombre:               string
    descripcion?:         string | null
    precioBase:           number | null
    imagenPrincipal:      string | null
    grupos:               VariableGrupo[]
    cantidades:           CantidadPublica[]
    unidad:               string
    urgenciaStockConfig?: Record<string, unknown> | null
    botonCompraConfig?:   BotonCompraConfig | null
    botonCompraActivo?:   boolean
}

// Contador ficticio de "personas compraron hoy" — empieza en 8 y crece con
// incrementos pequeños (+1 / +2 / +3) cada 10-15s. Hook de incentivo visual,
// no metrica real. El badge "+N" se mantiene 2.5s para que el visitante lo vea.
function usePersonasHoy() {
    const [count, setCount] = useState(8)
    const [bump, setBump]   = useState(false)
    const [ultimo, setUlt]  = useState(0)

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>
        function programarSiguiente() {
            timeout = setTimeout(() => {
                const inc = Math.floor(Math.random() * 3) + 1  // 1-3
                setUlt(inc)
                setCount(c => c + inc)
                setBump(true)
                setTimeout(() => setBump(false), 2500)
                programarSiguiente()
            }, Math.random() * 5000 + 10000)  // 10-15s
        }
        programarSiguiente()
        return () => clearTimeout(timeout)
    }, [])

    return { count, bump, ultimo }
}

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

function pluralizar(palabra: string): string {
    return /[aeiouáéíóú]$/i.test(palabra) ? `${palabra}s` : `${palabra}es`
}

export default function Info({ ctaRef, selectorRef, onPrecio, productoId, nombre, descripcion = null, precioBase, imagenPrincipal, grupos, cantidades, unidad, urgenciaStockConfig = null, botonCompraConfig = null, botonCompraActivo = false }: Props) {
    const personas = usePersonasHoy()
    const { items, addItem, replaceItem } = useCart()

    const tieneBundles = cantidades.length > 0

    const cantidadesBase: CantidadPublica[] = tieneBundles
        ? cantidades
        : precioBase ? [{ cantidad: 1, precio_bundle: precioBase, badge_texto: null, destacado: false, imagen: null }] : []

    const opciones: OpcionCantidad[] = cantidadesBase.map(c => {
        const precioTachado  = precioBase && c.cantidad > 1 ? precioBase * c.cantidad : null
        const ahorroMonto    = precioTachado ? precioTachado - c.precio_bundle : null
        const ahorrosPct     = ahorroMonto && precioTachado ? Math.round((ahorroMonto / precioTachado) * 100) : null
        return {
            ...c,
            label:           c.cantidad === 1 ? `1 ${unidad}` : `${c.cantidad} ${pluralizar(unidad)}`,
            precioTachado,
            precioPorFrasco: Math.round(c.precio_bundle / c.cantidad),
            ahorroMonto,
            ahorrosPct,
        }
    })

    const defaultSeleccion: Record<number, VariableItem> = {}

    // Opción inicial: la destacada si existe, si no la primera. Aplica también
    // al length inicial de `seleccionados` para que rendericen tantos selectores
    // como unidades tenga el bundle destacado.
    const cantidadInicial = opciones.find(o => o.destacado) ?? opciones[0] ?? null

    const [seleccionados, setSeleccionados]   = useState<Record<number, VariableItem>[]>(
        () => Array.from({ length: Math.max(1, cantidadInicial?.cantidad ?? 1) }, () => ({ ...defaultSeleccion }))
    )
    const [cantidadActiva, setCantidadActiva] = useState<OpcionCantidad | null>(() => cantidadInicial)
    const [cartBump, setCartBump]             = useState(false)
    const [interactuado, setInteractuado]     = useState(false)
    const [shake, setShake]                   = useState(false)
    const variablesRef                        = useRef<HTMLDivElement>(null)

    // Sincroniza el precio del sticky bar / página con la cantidad activa.
    // Crítico al mount: si la cantidad inicial es la destacada (ej. 2x), el padre
    // debe arrancar mostrando ese precio bundle y no el precio_base.
    useEffect(() => {
        if (cantidadActiva) onPrecio(cantidadActiva.precio_bundle)
    }, [cantidadActiva, onPrecio])

    const imagenVariable = useMemo(() => {
        const grupoImagen = grupos.find(g => g.tipo === 'imagen')
        return grupoImagen ? (seleccionados[0]?.[grupoImagen.id]?.url ?? null) : null
    }, [grupos, seleccionados])

    const labelVariable = useMemo(() => {
        const porUnidad = (sel: Record<number, VariableItem>) =>
            grupos.map(g => sel[g.id]?.nombre).filter(Boolean).join(' · ')
        const n = cantidadActiva?.cantidad ?? 1
        if (!tieneBundles || n <= 1) return porUnidad(seleccionados[0] ?? {})
        // filter(Boolean) ANTES del join — si los porUnidad son strings vacios
        // (variables opcionales sin elegir) NO queremos generar " + " residual
        // que se persistia en el label de la orden.
        return seleccionados.slice(0, n).map(porUnidad).filter(Boolean).join(' + ')
    }, [grupos, seleccionados, cantidadActiva, tieneBundles])

    function seleccionarCantidad(opcion: OpcionCantidad) {
        setCantidadActiva(opcion)
        onPrecio(opcion.precio_bundle)
        setSeleccionados(prev => {
            const n = opcion.cantidad
            if (n > prev.length) return [...prev, ...Array.from({ length: n - prev.length }, () => ({ ...prev[0] }))]
            return prev.slice(0, n)
        })
    }

    function cambiarVariableUnidad(unitIndex: number, grupoId: number, item: VariableItem) {
        setInteractuado(true)
        setSeleccionados(prev => prev.map((sel, i) => i === unitIndex ? { ...sel, [grupoId]: item } : sel))
    }

    function onVariableGlobalChange(grupoId: number, item: VariableItem) {
        setInteractuado(true)
        setSeleccionados([{ ...(seleccionados[0] ?? {}), [grupoId]: item }])
    }

    function disparar() {
        if (grupos.length > 0 && !interactuado) {
            const nombreGrupo = grupos[0]?.nombre?.toLowerCase() ?? 'una opción'
            toast.error(`Selecciona ${nombreGrupo} antes de continuar`)
            variablesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            setShake(true)
            setTimeout(() => setShake(false), 400)
            return false
        }
        return true
    }

    function agregarAlCarrito(iniciarCompra = false) {
        if (!disparar()) return

        setCartBump(true)
        setTimeout(() => setCartBump(false), 400)

        const nuevoItem = {
            productoId,
            nombre,
            imagen:   imagenVariable ?? cantidadActiva?.imagen ?? imagenPrincipal ?? '',
            // Label completo: SIEMPRE incluye el label del bundle ("2 Unidades")
            // y, si hay, las variables. Antes era one-or-the-other y se perdía
            // la info del bundle cuando había variables — el admin no podía saber
            // que el cliente compró el pack de 2 unidades con sabor X.
            label:    [cantidadActiva?.label, labelVariable].filter(Boolean).join(' · '),
            cantidad: 1,
            precio:   cantidadActiva?.precio_bundle ?? 0,
            opciones: opciones.map(o => ({
                cantidad:    o.cantidad,
                precio:      o.precio_bundle,
                label:       o.label,
                badge:       o.badge_texto,
                ahorroMonto: o.ahorroMonto,
            })),
        }

        trackFb('AddToCart', {
            content_type: 'product',
            value:        cantidadActiva?.precio_bundle ?? 0,
            currency:     'COP',
        })

        if (iniciarCompra) {
            const existente = items.find(i => i.nombre === nuevoItem.nombre)
            if (existente) replaceItem(existente.id, nuevoItem)
            else addItem(nuevoItem)

            // InitiateCheckout se dispara en /checkout, no aquí — evita duplicados.
            router.visit('/checkout')
            return
        }

        addItem(nuevoItem)

        toast.custom(() => (
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 w-80">
                {(cantidadActiva?.imagen ?? imagenPrincipal) && (
                    <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 shrink-0 overflow-hidden">
                        <img src={cantidadActiva?.imagen ?? imagenPrincipal!} alt="" className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">¡Agregado al carrito!</p>
                    <p className="text-xs text-slate-500 truncate">{labelVariable || cantidadActiva?.label}</p>
                </div>
                <p className="text-sm font-bold text-slate-900 shrink-0">{formatPrecio(cantidadActiva?.precio_bundle ?? 0)}</p>
            </div>
        ), { duration: 3500 })
    }

    return (
        <div className="flex flex-col gap-6">

            <div className="space-y-3">
                <h1 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                    {nombre}
                </h1>

                {/* Hook de incentivo: contador ficticio que sube +1/+2/+3 cada 10-15s. */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Flame className="size-3.5 text-orange-500 shrink-0" />
                    <span>
                        <span className={cn('font-semibold text-slate-900 tabular-nums', personas.bump && 'animate-cart-bump inline-block')}>
                            {personas.count} personas
                        </span>
                        {' '}compraron este producto hoy
                    </span>
                    {personas.bump && personas.ultimo > 0 && (
                        <span className="text-[11px] font-semibold text-orange-600 animate-fade-slide-up leading-none">
                            +{personas.ultimo}
                        </span>
                    )}
                </div>

                {descripcion && (
                    <div
                        className="prose prose-sm max-w-none text-slate-600 prose-headings:text-slate-900 prose-headings:font-bold prose-p:leading-relaxed prose-ul:my-2 prose-li:my-0"
                        dangerouslySetInnerHTML={{ __html: descripcion }}
                    />
                )}
            </div>

            {/* Sin bundles: selector global encima de cantidades */}
            {!tieneBundles && grupos.length > 0 && (
                <div ref={variablesRef} className={cn(shake && 'animate-shake')}>
                    <SelectorVariables
                        grupos={grupos}
                        seleccionados={seleccionados[0] ?? {}}
                        onChange={onVariableGlobalChange}
                    />
                </div>
            )}

            <div ref={selectorRef}>
                <SelectorCantidades
                    opciones={opciones}
                    cantidadActiva={cantidadActiva}
                    imagenPrincipal={imagenPrincipal}
                    onSeleccionar={seleccionarCantidad}
                />
            </div>

            {urgenciaStockConfig && (
                <UrgenciaStock config={urgenciaStockConfig} />
            )}

            {/* Con bundles: selector por unidad debajo de cantidades */}
            {tieneBundles && grupos.length > 0 && (
                <div ref={variablesRef} className={cn(shake && 'animate-shake')}>
                    <SelectorVariablesPorUnidad
                        grupos={grupos}
                        cantidad={cantidadActiva?.cantidad ?? 1}
                        seleccionados={seleccionados}
                        onChange={cambiarVariableUnidad}
                        unidad={unidad}
                    />
                </div>
            )}

            <div className="flex flex-col gap-3">
                <BotonCompra
                    ref={ctaRef}
                    config={botonCompraConfig}
                    activo={botonCompraActivo}
                    precio={cantidadActiva?.precio_bundle ?? null}
                    formatPrecio={formatPrecio}
                    onClick={() => agregarAlCarrito(true)}
                />
                <button
                    onClick={() => agregarAlCarrito()}
                    className={cn(
                        'w-full border border-slate-300 text-slate-600 bg-white text-base font-medium py-3.5 rounded-lg hover:bg-slate-50 hover:border-slate-900 hover:text-slate-900 transition-colors duration-200 ease-in-out',
                        cartBump && 'animate-cart-bump'
                    )}
                >
                    Agregar al carrito
                </button>
            </div>

        </div>
    )
}
