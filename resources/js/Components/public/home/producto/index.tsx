import { useState } from 'react'
import { Link } from '@inertiajs/react'
import { ArrowRightIcon, CheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const TONOS = [
    {
        id: 'verde',
        nombre: 'Castaño Natural',
        descripcion: 'El tono más vendido. Cubre canas con un castaño profundo y luminoso, ideal para cabello oscuro.',
        imagen: '/assets/products/savia-verde.png',
        color: 'bg-amber-900',
        etiqueta: 'Más vendido',
    },
    {
        id: 'blanco',
        nombre: 'Negro Intenso',
        descripcion: 'Para quienes prefieren un negro uniforme y de larga duración. Cobertura total desde la primera aplicación.',
        imagen: '/assets/products/savia-blanco.png',
        color: 'bg-slate-900',
        etiqueta: null,
    },
]

const INCLUIDOS = [
    'Coloración SAVIA 300ml',
    'Activador de color',
    'Acondicionador post-color',
    'Guantes de aplicación',
    'Instructivo paso a paso',
]

export default function Producto() {
    const [tonoActivo, setTonoActivo] = useState(TONOS[0])

    return (
        <section className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-6">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* Imagen */}
                    <div className="flex items-center justify-center bg-gray-50 rounded-lg py-12 px-8 border border-slate-200 min-h-[400px]">
                        <img
                            key={tonoActivo.id}
                            src={tonoActivo.imagen}
                            alt={`SAVIA ${tonoActivo.nombre}`}
                            className="max-h-[380px] w-auto object-contain animate-bottle-float"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-6">

                        {/* Nombre + precio */}
                        <div>
                            <h3 className="text-3xl font-bold text-slate-900">{tonoActivo.nombre}</h3>
                            <p className="text-slate-500 mt-2 text-base leading-relaxed">{tonoActivo.descripcion}</p>
                        </div>

                        {/* Precio */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-bold text-slate-900">$89.900</span>
                            <span className="text-base text-slate-400 line-through">$119.900</span>
                            <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                                25% off
                            </span>
                        </div>

                        {/* Selector de tonos */}
                        <div>
                            <p className="text-sm font-medium text-slate-700 mb-3">Elige tu tono</p>
                            <div className="flex gap-3">
                                {TONOS.map(tono => (
                                    <button
                                        key={tono.id}
                                        onClick={() => setTonoActivo(tono)}
                                        className={cn(
                                            'relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 ease-in-out w-24',
                                            tonoActivo.id === tono.id
                                                ? 'border-slate-900 bg-slate-50'
                                                : 'border-slate-200 hover:border-slate-400'
                                        )}
                                    >
                                        {tono.etiqueta && (
                                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-emerald-500 rounded-full px-2 py-0.5 whitespace-nowrap">
                                                {tono.etiqueta}
                                            </span>
                                        )}
                                        <span className={`w-8 h-8 rounded-full ${tono.color} border border-slate-200`} />
                                        <span className="text-xs font-medium text-slate-700 text-center leading-tight">{tono.nombre}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Incluye */}
                        <div>
                            <p className="text-sm font-medium text-slate-700 mb-3">Kit completo incluye</p>
                            <ul className="flex flex-col gap-2">
                                {INCLUIDOS.map(item => (
                                    <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                                        <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* CTAs */}
                        <div className="flex gap-3 flex-wrap pt-2">
                            <Link
                                href="/productos"
                                className="inline-flex items-center gap-2 bg-slate-600 text-white text-base font-semibold px-7 py-4 rounded-lg hover:bg-slate-950 transition-colors duration-200 ease-in-out"
                            >
                                Comprar ahora
                                <ArrowRightIcon className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/productos"
                                className="inline-flex items-center border border-slate-300 text-slate-600 bg-white text-base font-medium px-5 py-4 rounded-lg hover:bg-slate-50 hover:border-slate-950 hover:text-slate-950 transition-colors duration-200 ease-in-out"
                            >
                                Ver detalles
                            </Link>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    )
}
