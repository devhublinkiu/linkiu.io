import { useEffect } from 'react'
import { toast } from 'sonner'

const COLORES_AVATAR = [
    'bg-emerald-500',
    'bg-slate-500',
    'bg-amber-500',
    'bg-blue-500',
    'bg-rose-500',
    'bg-violet-500',
    'bg-teal-500',
    'bg-orange-500',
]

const COMPRAS = [
    { nombre: 'María G.',     ciudad: 'Bogotá',       hace: 'hace 2 min' },
    { nombre: 'Valentina R.', ciudad: 'Medellín',     hace: 'hace 5 min' },
    { nombre: 'Camila T.',    ciudad: 'Cali',         hace: 'hace 8 min' },
    { nombre: 'Daniela M.',   ciudad: 'Barranquilla', hace: 'hace 11 min' },
    { nombre: 'Luisa F.',     ciudad: 'Cartagena',    hace: 'hace 15 min' },
    { nombre: 'Paola S.',     ciudad: 'Bucaramanga',  hace: 'hace 18 min' },
    { nombre: 'Andrea C.',    ciudad: 'Manizales',    hace: 'hace 22 min' },
    { nombre: 'Carolina V.',  ciudad: 'Pereira',      hace: 'hace 25 min' },
]

function iniciales(nombre: string) {
    return nombre
        .split(' ')
        .slice(0, 2)
        .map(p => p[0])
        .join('')
        .toUpperCase()
}

function aleatorio(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export function useNotificacionesCompra() {
    useEffect(() => {
        let indice = aleatorio(0, COMPRAS.length - 1)
        let timeoutId: ReturnType<typeof setTimeout>

        function mostrarSiguiente() {
            const compra = COMPRAS[indice % COMPRAS.length]
            const color = COLORES_AVATAR[indice % COLORES_AVATAR.length]
            indice++

            toast.custom(() => (
                <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-md w-[22rem] max-w-full">
                    <div className={`${color} w-12 h-12 rounded-full flex items-center justify-center shrink-0`}>
                        <span className="text-white text-sm font-bold leading-none">
                            {iniciales(compra.nombre)}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                            {compra.nombre} acaba de comprar
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                            SAVIA Cubre Canas 300ml · {compra.ciudad}
                        </p>
                        <p className="text-xs text-slate-400">{compra.hace}</p>
                    </div>
                </div>
            ), { duration: 5000 })

            timeoutId = setTimeout(mostrarSiguiente, aleatorio(18000, 28000))
        }

        timeoutId = setTimeout(mostrarSiguiente, 6000)

        return () => clearTimeout(timeoutId)
    }, [])
}
