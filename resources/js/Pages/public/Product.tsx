import { lazy, useEffect, useRef, useState, type ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import WebLayout from '@/Layouts/WebLayout'
import { useProductTracker } from '@/lib/useProductTracker'
import Gallery, { type ImagenProducto } from '@/Components/public/product/gallery'
import Info from '@/Components/public/product/info'
import StickyBar from '@/Components/public/product/sticky-bar'
import ResenasVivas from '@/Components/public/product/resenas-vivas'
import LazyOnVisible from '@/Components/public/LazyOnVisible'
import { trackFb } from '@/lib/usePixel'
import { usePage } from '@inertiajs/react'

// Hooks below-the-fold — se montan vía IntersectionObserver cuando el bloque
// se acerca al viewport. Vite genera 1 chunk separado por componente.
const GanchoPromesa             = lazy(() => import('@/Components/public/product/gancho-promesa'))
const SliderImagenes            = lazy(() => import('@/Components/public/product/slider-imagenes'))
const QueIncluye                = lazy(() => import('@/Components/public/product/que-incluye'))
const TablaComparativa          = lazy(() => import('@/Components/public/product/tabla-comparativa'))
const AntesDespues              = lazy(() => import('@/Components/public/product/antes-despues'))
const FichaTecnica              = lazy(() => import('@/Components/public/product/ficha-tecnica'))
const CaracteristicasDestacadas = lazy(() => import('@/Components/public/product/caracteristicas-destacadas'))
const ComoFunciona              = lazy(() => import('@/Components/public/product/como-funciona'))
const ResenasClientes           = lazy(() => import('@/Components/public/product/resenas-clientes'))
const GaleriaResultados         = lazy(() => import('@/Components/public/product/galeria-resultados'))
const Garantia                  = lazy(() => import('@/Components/public/product/garantia'))
const FaqProducto               = lazy(() => import('@/Components/public/product/faq'))
const SellosConfianza           = lazy(() => import('@/Components/public/product/sellos-confianza'))

// Alturas estimadas por hook — reservan espacio para evitar CLS mientras el
// componente real termina de cargar. Si alguno salta visiblemente, ajustar el
// valor puntual sin tocar el componente.
const MIN_H: Record<string, string> = {
    gancho_promesa:             '280px',
    slider_imagenes:            '380px',
    que_incluye:                '320px',
    tabla_comparativa:          '520px',
    comparacion_visual:         '480px',
    ficha_tecnica:              '360px',
    caracteristicas_destacadas: '400px',
    como_funciona:              '440px',
    resenas_clientes:           '480px',
    galeria_resultados:         '380px',
    garantia:                   '280px',
    preguntas_frecuentes:       '360px',
    sellos_confianza:           '180px',
}

export interface HookEntry {
    key:    string
    config: Record<string, unknown>
}

interface CantidadPublica {
    cantidad:      number
    precio_bundle: number
    badge_texto:   string | null
    destacado:     boolean
    imagen:        string | null
}

export interface VariableItem {
    id:            number
    nombre:        string
    valor:         string | null
    url:           string | null
    precio_ajuste: number | null
}

export interface VariableGrupo {
    id:     number
    nombre: string
    tipo:   'color' | 'imagen' | 'texto'
    items:  VariableItem[]
}

const ORDEN_DEFAULT = [
    'gancho_promesa',
    'slider_imagenes',
    'que_incluye',
    'tabla_comparativa',
    'comparacion_visual',
    'ficha_tecnica',
    'caracteristicas_destacadas',
    'como_funciona',
    'resenas_clientes',
    'galeria_resultados',
    'garantia',
    'preguntas_frecuentes',
    'sellos_confianza',
]

interface Props {
    producto_id:      number | null
    nombre:           string | null
    slug:             string | null
    sku:              string | null
    descripcion:      string | null
    unidad:           string | null
    hooks:            HookEntry[]
    layout_orden:     string[] | null
    precio_base:      number | null
    imagen_principal: string | null
    imagenes:         ImagenProducto[]
    grupos:           VariableGrupo[]
    cantidades:       CantidadPublica[]
}

function Product({ producto_id = null, nombre = null, slug = null, sku = null, descripcion = null, unidad = null, hooks = [], layout_orden = null, precio_base = null, imagen_principal = null, imagenes = [], grupos = [], cantidades = [] }: Props) {
    const [precioActivo, setPrecioActivo] = useState<number>(precio_base ?? 0)
    const ctaRef      = useRef<HTMLButtonElement>(null)
    const selectorRef = useRef<HTMLDivElement>(null)
    const { build } = usePage<{ build?: { fomo_enabled?: boolean; nombre_tienda?: string } }>().props
    const nombreTienda = build?.nombre_tienda || 'Mi tienda'

    useProductTracker(producto_id)

    useEffect(() => {
        // Diferimos tracking y FOMO al idle del navegador para no competir
        // con el LCP. requestIdleCallback no existe en Safari → fallback a setTimeout.
        const ric: (cb: () => void) => number =
            (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback
            ?? ((cb) => window.setTimeout(cb, 1500))

        ric(() => {
            trackFb('ViewContent', {
                content_ids:  [producto_id ?? 0],
                content_name: nombre ?? '',
                content_type: 'product',
                value:        precio_base ?? 0,
                currency:     'COP',
            })

            if (build?.fomo_enabled && producto_id) {
                const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? ''
                fetch('/api/fomo-view', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
                    body:    JSON.stringify({ producto_id }),
                }).catch(() => {})
            }
        })
    }, [producto_id])

    // Los bloques de hook se renderizan con data-hook="{key}". El hook
    // useVisitante en WebLayout detecta automaticamente cual esta en el
    // centro del viewport via scroll listener y lo reporta al backend.

    function hook(key: string) {
        return hooks.find(h => h.key === key)
    }

    const resenasClientes = hook('resenas_clientes')

    // ── SEO: meta tags + JSON-LD schema.org/Product ──────────────────────────
    const tituloPagina   = nombre ? `${nombre} | ${nombreTienda}` : nombreTienda
    // La descripción ahora puede ser HTML; para meta tags se necesita texto plano.
    const descripcionPlano = (descripcion || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const descripcionSeo   = descripcionPlano.slice(0, 160)

    const aggregateRating = (() => {
        const items = (resenasClientes?.config as { items?: { estrellas?: number }[] } | undefined)?.items
        if (!items?.length) return null
        const validos  = items.filter(i => typeof i.estrellas === 'number')
        if (!validos.length) return null
        const promedio = validos.reduce((sum, i) => sum + (i.estrellas ?? 0), 0) / validos.length
        return { ratingValue: promedio.toFixed(1), reviewCount: validos.length }
    })()

    const jsonLd: Record<string, unknown> = {
        '@context':    'https://schema.org/',
        '@type':       'Product',
        name:          nombre,
        description:   descripcionPlano || null,
        sku,
        brand:         { '@type': 'Brand', name: nombreTienda },
        ...(imagen_principal ? { image: imagen_principal } : {}),
        ...(precio_base ? {
            offers: {
                '@type':         'Offer',
                price:           precio_base,
                priceCurrency:   'COP',
                availability:    'https://schema.org/InStock',
                ...(slug ? { url: `${typeof window !== 'undefined' ? window.location.origin : ''}/productos/${slug}` } : {}),
            },
        } : {}),
        ...(aggregateRating ? {
            aggregateRating: {
                '@type':       'AggregateRating',
                ratingValue:   aggregateRating.ratingValue,
                reviewCount:   aggregateRating.reviewCount,
            },
        } : {}),
    }

    const orden = layout_orden
        ? [...layout_orden.filter(k => ORDEN_DEFAULT.includes(k)), ...ORDEN_DEFAULT.filter(k => !layout_orden.includes(k))]
        : ORDEN_DEFAULT

    function BloqueProducto({ children, padY = 'py-6 md:py-10', padX = 'px-0' }: { children: React.ReactNode; padY?: string; padX?: string }) {
        return <div className={`${padX} md:px-10 ${padY} bg-slate-50`}>{children}</div>
    }

    function renderBloque(key: string) {
        const h = hook(key)
        if (!h) return null
        const minH = MIN_H[key] ?? '300px'
        switch (key) {
            case 'gancho_promesa':
                return <LazyOnVisible key={key} minHeight={minH}><GanchoPromesa config={h.config} /></LazyOnVisible>
            case 'slider_imagenes':
                return <LazyOnVisible key={key} minHeight={minH}><SliderImagenes config={h.config} /></LazyOnVisible>
            case 'tabla_comparativa':
                return <LazyOnVisible key={key} minHeight={minH}><BloqueProducto padX="px-4"><TablaComparativa config={h.config} /></BloqueProducto></LazyOnVisible>
            case 'comparacion_visual':
                return <LazyOnVisible key={key} minHeight={minH}><BloqueProducto><AntesDespues config={h.config} /></BloqueProducto></LazyOnVisible>
            case 'ficha_tecnica':
                return <LazyOnVisible key={key} minHeight={minH}><BloqueProducto><FichaTecnica config={h.config} /></BloqueProducto></LazyOnVisible>
            case 'caracteristicas_destacadas':
                return <LazyOnVisible key={key} minHeight={minH}><BloqueProducto><CaracteristicasDestacadas config={h.config} /></BloqueProducto></LazyOnVisible>
            case 'como_funciona':
                return <LazyOnVisible key={key} minHeight={minH}><BloqueProducto><ComoFunciona config={h.config} /></BloqueProducto></LazyOnVisible>
            case 'resenas_clientes':
                return <LazyOnVisible key={key} minHeight={minH}><BloqueProducto><ResenasClientes config={h.config} /></BloqueProducto></LazyOnVisible>
            case 'galeria_resultados':
                return <LazyOnVisible key={key} minHeight={minH}><BloqueProducto><GaleriaResultados config={h.config} /></BloqueProducto></LazyOnVisible>
            case 'garantia':
                return <LazyOnVisible key={key} minHeight={minH}><BloqueProducto><Garantia config={h.config} /></BloqueProducto></LazyOnVisible>
            case 'preguntas_frecuentes':
                return <LazyOnVisible key={key} minHeight={minH}><BloqueProducto><FaqProducto config={h.config} /></BloqueProducto></LazyOnVisible>
            case 'que_incluye':
                return <LazyOnVisible key={key} minHeight={minH}><BloqueProducto><QueIncluye config={h.config} /></BloqueProducto></LazyOnVisible>
            case 'sellos_confianza':
                return <LazyOnVisible key={key} minHeight={minH}><BloqueProducto><SellosConfianza config={h.config} /></BloqueProducto></LazyOnVisible>
            default:
                return null
        }
    }

    return (
        <>
            <Head>
                <title>{tituloPagina}</title>
                {descripcionSeo && <meta name="description" content={descripcionSeo} />}

                {/* Open Graph */}
                <meta property="og:type"        content="product" />
                <meta property="og:title"       content={tituloPagina} />
                {descripcionSeo && <meta property="og:description" content={descripcionSeo} />}
                {imagen_principal && <meta property="og:image" content={imagen_principal} />}
                <meta property="og:site_name"   content={nombreTienda} />

                {/* Twitter Card */}
                <meta name="twitter:card"  content="summary_large_image" />
                <meta name="twitter:title" content={tituloPagina} />
                {descripcionSeo && <meta name="twitter:description" content={descripcionSeo} />}
                {imagen_principal && <meta name="twitter:image" content={imagen_principal} />}

                {/* JSON-LD schema.org/Product */}
                {producto_id && (
                    <script type="application/ld+json">
                        {JSON.stringify(jsonLd)}
                    </script>
                )}
            </Head>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2">

                    {/* Columna izquierda — galería sticky (data-hook para Vista en Vivo) */}
                    <div data-hook="galeria" className="py-2 md:py-10 md:pr-10 lg:pr-10 md:sticky md:top-12 md:self-start">
                        <Gallery imagenes={imagenes} />
                    </div>

                    {/* Columna derecha */}
                    <div className="md:border-l md:border-slate-100">

                        <div data-hook="detalle_compra" className="py-2 md:py-10 md:pl-10">
                            {hook('resenas_en_vivo') && (
                                <div className="mb-2">
                                    <ResenasVivas
                                        config={hook('resenas_en_vivo')!.config}
                                        resenasConfig={resenasClientes?.config ?? null}
                                    />
                                </div>
                            )}
                            <Info
                                ctaRef={ctaRef}
                                selectorRef={selectorRef}
                                onPrecio={setPrecioActivo}
                                productoId={producto_id ?? undefined}
                                nombre={nombre ?? ''}
                                descripcion={descripcion}
                                precioBase={precio_base}
                                imagenPrincipal={imagen_principal}
                                grupos={grupos}
                                cantidades={cantidades}
                                unidad={unidad ?? 'Unidad'}
                                urgenciaStockConfig={hook('urgencia_stock')?.config ?? null}
                                botonCompraConfig={hook('boton_compra')?.config ?? null}
                                botonCompraActivo={!!hook('boton_compra')}
                            />
                        </div>

                        {orden.map(key => {
                            const b = renderBloque(key)
                            return b ? <div key={key} data-hook={key}>{b}</div> : null
                        })}

                    </div>
                </div>
            </div>

            <StickyBar
                ctaRef={ctaRef}
                triggerRef={selectorRef}
                precio={precioActivo}
                botonCompraConfig={hook('boton_compra')?.config ?? null}
                botonCompraActivo={!!hook('boton_compra')}
            />
        </>
    )
}

Product.layout = (page: ReactNode) => <WebLayout>{page}</WebLayout>

export default Product
