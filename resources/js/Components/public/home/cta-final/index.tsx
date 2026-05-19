import { Link } from '@inertiajs/react'
import { ArrowRightIcon } from 'lucide-react'

export default function CtaFinal() {
    return (
        <section className="bg-slate-900 py-24">
            <div className="max-w-4xl mx-auto px-6 text-center">

                <h2 className="text-4xl font-bold text-white tracking-tight leading-tight mb-5">
                    El cuidado que buscabas<br />
                    <span className="text-emerald-500">está a un clic de distancia.</span>
                </h2>

                <p className="text-xl text-slate-400 max-w-xl mx-auto mb-10">
                    Más de 1.200 clientas en todo el país ya confían en SAVIA. Únete y descubre la diferencia.
                    <span className="block mt-2 text-emerald-500 font-medium">Envío gratis a todo el país.</span>
                </p>

                <div className="flex items-center justify-center gap-4 flex-wrap">
                    <Link
                        href="/productos"
                        className="inline-flex items-center gap-2 bg-white text-slate-900 text-base font-semibold px-8 py-4 rounded-lg hover:bg-slate-100 transition-colors duration-200 ease-in-out shadow-lg"
                    >
                        Ver productos
                        <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/quienes-somos"
                        className="inline-flex items-center border border-slate-700 text-slate-300 bg-transparent text-base font-medium px-6 py-4 rounded-lg hover:bg-slate-800 hover:border-slate-600 hover:text-white transition-colors duration-200 ease-in-out"
                    >
                        Nuestra historia
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mt-16 pt-10 border-t border-slate-800">
                    {[
                        { valor: '1.200+', etiqueta: 'clientas satisfechas' },
                        { valor: '4.7★', etiqueta: 'calificación promedio' },
                        { valor: '100%', etiqueta: 'satisfacción garantizada' },
                    ].map(({ valor, etiqueta }) => (
                        <div key={etiqueta} className="flex flex-col items-center gap-1">
                            <span className="text-3xl font-bold text-white">{valor}</span>
                            <span className="text-sm text-slate-400">{etiqueta}</span>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}
