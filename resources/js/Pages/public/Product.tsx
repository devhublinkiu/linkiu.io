import { useEffect, useRef, useState, type ReactNode } from 'react'
import WebLayout from '@/Layouts/WebLayout'
import { useProductTracker } from '@/lib/useProductTracker'
import Gallery, { type ImagenProducto } from '@/Components/public/product/gallery'
import Info from '@/Components/public/product/info'
import GanchoPromesa from '@/Components/public/product/gancho-promesa'
import TablaComparativa from '@/Components/public/product/tabla-comparativa'
import AntesDespues from '@/Components/public/product/antes-despues'
import FichaTecnica from '@/Components/public/product/ficha-tecnica'
import CaracteristicasDestacadas from '@/Components/public/product/caracteristicas-destacadas'
import ComoFunciona from '@/Components/public/product/como-funciona'
import ResenasClientes from '@/Components/public/product/resenas-clientes'
import GaleriaResultados from '@/Components/public/product/galeria-resultados'
import Garantia from '@/Components/public/product/garantia'
import FaqProducto from '@/Components/public/product/faq'
import SliderImagenes from '@/Components/public/product/slider-imagenes'
import QueIncluye from '@/Components/public/product/que-incluye'
import SellosConfianza from '@/Components/public/product/sellos-confianza'
import UrgenciaStock from '@/Components/public/product/urgencia-stock'
import StickyBar from '@/Components/public/product/sticky-bar'
import ResenasVivas from '@/Components/public/product/resenas-vivas'
import PixelDebug from '@/Components/public/product/pixel-debug'
import { trackFb } from '@/lib/usePixel'

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
    'urgencia_stock',
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
    unidad:           string | null
    hooks:            HookEntry[]
    layout_orden:     string[] | null
    precio_base:      number | null
    imagen_principal: string | null
    imagenes:         ImagenProducto[]
    grupos:           VariableGrupo[]
    cantidades:       CantidadPublica[]
}

function Product({ producto_id = null, nombre = null, unidad = null, hooks = [], layout_orden = null, precio_base = null, imagen_principal = null, imagenes = [], grupos = [], cantidades = [] }: Props) {
    const [precioActivo, setPrecioActivo] = useState(89900)
    const ctaRef = useRef<HTMLButtonElement>(null)

    useProductTracker(producto_id)

    useEffect(() => {
        trackFb('ViewContent', {
            content_ids:  [producto_id ?? 0],
            content_name: nombre ?? '',
            content_type: 'product',
            value:        precio_base ?? 0,
            currency:     'COP',
        })
    }, [])

    function hook(key: string) {
        return hooks.find(h => h.key === key)
    }

    const resenasClientes = hook('resenas_clientes')

    const orden = layout_orden
        ? [...layout_orden.filter(k => ORDEN_DEFAULT.includes(k)), ...ORDEN_DEFAULT.filter(k => !layout_orden.includes(k))]
        : ORDEN_DEFAULT

    function renderBloque(key: string) {
        const h = hook(key)
        if (!h) return null
        switch (key) {
            case 'gancho_promesa':
                return <GanchoPromesa key={key} config={h.config} />
            case 'slider_imagenes':
                return <SliderImagenes key={key} config={h.config} />
            case 'tabla_comparativa':
                return <div key={key} className="px-4 md:px-10 py-10 bg-slate-50"><TablaComparativa config={h.config} /></div>
            case 'comparacion_visual':
                return <div key={key} className="px-0 md:px-10 py-10 bg-slate-50"><AntesDespues config={h.config} /></div>
            case 'ficha_tecnica':
                return <div key={key} className="px-0 md:px-10 py-10 bg-slate-50"><FichaTecnica config={h.config} /></div>
            case 'caracteristicas_destacadas':
                return <div key={key} className="px-0 md:px-10 py-10 bg-slate-50"><CaracteristicasDestacadas config={h.config} /></div>
            case 'como_funciona':
                return <div key={key} className="px-0 md:px-10 py-10 bg-slate-50"><ComoFunciona config={h.config} /></div>
            case 'resenas_clientes':
                return <div key={key} className="px-0 md:px-10 py-10 bg-slate-50"><ResenasClientes config={h.config} /></div>
            case 'galeria_resultados':
                return <div key={key} className="px-0 md:px-10 py-10 bg-slate-50"><GaleriaResultados config={h.config} /></div>
            case 'garantia':
                return <div key={key} className="px-0 md:px-10 py-10 bg-slate-50"><Garantia config={h.config} /></div>
            case 'preguntas_frecuentes':
                return <div key={key} className="px-0 md:px-10 py-10 bg-slate-50"><FaqProducto config={h.config} /></div>
            case 'urgencia_stock':
                return <div key={key} className="px-0 md:px-10 py-6 bg-slate-50"><UrgenciaStock config={h.config} /></div>
            case 'que_incluye':
                return <div key={key} className="px-0 md:px-10 py-10 bg-slate-50"><QueIncluye config={h.config} /></div>
            case 'sellos_confianza':
                return <div key={key} className="px-0 md:px-10 py-10 bg-slate-50"><SellosConfianza config={h.config} /></div>
            default:
                return null
        }
    }

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2">

                    {/* Columna izquierda — galería sticky */}
                    <div className="py-10 md:pr-10 lg:pr-10 md:sticky md:top-12 md:self-start">
                        <Gallery imagenes={imagenes} />
                    </div>

                    {/* Columna derecha */}
                    <div className="md:border-l md:border-slate-100">

                        <div className="py-10 md:pl-10">
                            {hook('resenas_en_vivo') && (
                                <div className="mb-6">
                                    <ResenasVivas
                                        config={hook('resenas_en_vivo')!.config}
                                        resenasConfig={resenasClientes?.config ?? null}
                                    />
                                </div>
                            )}
                            <Info
                                ctaRef={ctaRef}
                                onPrecio={setPrecioActivo}
                                productoId={producto_id ?? undefined}
                                nombre={nombre ?? ''}
                                precioBase={precio_base}
                                imagenPrincipal={imagen_principal}
                                grupos={grupos}
                                cantidades={cantidades}
                                unidad={unidad ?? 'Unidad'}
                            />
                        </div>

                        {orden.map(key => renderBloque(key))}

                    </div>
                </div>
            </div>

            <StickyBar ctaRef={ctaRef} precio={precioActivo} />
            <PixelDebug />
        </>
    )
}

Product.layout = (page: ReactNode) => <WebLayout>{page}</WebLayout>

export default Product
