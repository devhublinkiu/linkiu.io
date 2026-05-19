import { Link } from '@inertiajs/react'
import { ArrowRightIcon, StarIcon } from 'lucide-react'

const AVATARES = ['bg-slate-300', 'bg-slate-500', 'bg-slate-700', 'bg-slate-400']

function Estrellas({ valor }: { valor: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                    key={i}
                    className={`w-3.5 h-3.5 ${i <= Math.floor(valor) ? 'text-amber-500' : 'text-slate-200'}`}
                    fill="currentColor"
                />
            ))}
        </div>
    )
}

export default function HeroText() {
    return (
        <div className="flex flex-col items-center text-center">

            {/* Headline */}
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-[1.04] tracking-tight mb-5">
                Transforma tu cabello<br />
                sin{' '}
                <span className="text-emerald-600">comprometerlo</span>.
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-slate-600 leading-relaxed max-w-xl mb-8">
                SAVIA crea productos libres de químicos agresivos para quienes cuidan su cabello sin renunciar a los resultados.
                Más de{' '}
                <strong className="font-semibold text-slate-900">1.200 clientas</strong>
                {' '}ya lo confirman.
            </p>

            {/* CTAs */}
            <div className="flex items-center justify-center gap-3 flex-wrap mb-8">
                <Link
                    href="/productos"
                    className="inline-flex items-center gap-2 bg-slate-800 text-white text-base font-semibold px-7 py-4 rounded-xl hover:bg-slate-950 transition-colors duration-200 ease-in-out"
                >
                    Ver productos
                    <ArrowRightIcon className="w-4 h-4" />
                </Link>
                <Link
                    href="/quienes-somos"
                    className="inline-flex items-center border border-slate-300 text-slate-600 bg-white text-base font-medium px-5 py-4 rounded-xl hover:bg-slate-50 hover:border-slate-800 hover:text-slate-800 transition-colors duration-200 ease-in-out"
                >
                    Nuestra historia
                </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
                <div className="flex">
                    {AVATARES.map((color, i) => (
                        <div
                            key={i}
                            className={`w-9 h-9 rounded-full ${color} border-2 border-white shadow-sm ${i !== 0 ? '-ml-2.5' : ''}`}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-1.5">
                    <Estrellas valor={4.7} />
                    <span className="text-sm font-semibold text-slate-900">4.7</span>
                    <span className="text-sm text-slate-500">· 312 reseñas verificadas</span>
                </div>
            </div>

        </div>
    )
}
