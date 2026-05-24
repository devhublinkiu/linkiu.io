import { usePage } from '@inertiajs/react'

interface TickerItem { texto: string }

interface TickerConfig {
    color_fondo:     string
    color_texto:     string
    color_separador: string
    velocidad:       'lento' | 'normal' | 'rapido'
    items:           TickerItem[]
}

interface Colores { primario: string; secundario: string; acento: string }

// Items genéricos para cualquier vertical — el admin los reemplaza desde
// LinkiuBuild → Inicio → Tickers cuando quiera mensajes propios.
const FALLBACK: TickerItem[] = [
    { texto: 'Envío a todo el país' },
    { texto: 'Pago 100% seguro' },
    { texto: 'Calidad garantizada' },
    { texto: 'Atención personalizada' },
    { texto: 'Devoluciones fáciles' },
    { texto: 'Soporte al cliente' },
]

const DURACION: Record<string, string> = {
    lento:  '40s',
    normal: '20s',
    rapido: '10s',
}

function resolverColor(token: string, colores: Colores): string {
    if (token === 'primario')   return colores.primario
    if (token === 'secundario') return colores.secundario
    if (token === 'acento')     return colores.acento
    if (token === 'blanco')     return '#FFFFFF'
    if (token === 'negro')      return '#000000'
    return token
}

export default function Ticker() {
    const { build } = usePage<{
        build?: { ticker_inicio?: TickerConfig; colores?: Colores }
    }>().props

    const cfg      = build?.ticker_inicio
    const colores  = build?.colores ?? { primario: '#314158', secundario: '#62748E', acento: '#FB2C36' }
    const items    = cfg?.items?.length ? cfg.items : FALLBACK
    const bgColor  = resolverColor(cfg?.color_fondo     ?? 'negro',  colores)
    const txtColor = resolverColor(cfg?.color_texto      ?? 'blanco', colores)
    const sepColor = resolverColor(cfg?.color_separador  ?? 'acento', colores)
    const duration = DURACION[cfg?.velocidad            ?? 'normal']

    function Contenido() {
        return (
            <>
                {items.map((item, i) => (
                    <span key={i} className="flex items-center gap-4 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sepColor }} />
                        <span className="text-sm font-medium whitespace-nowrap">{item.texto}</span>
                    </span>
                ))}
            </>
        )
    }

    return (
        <div className="py-3 overflow-hidden" style={{ backgroundColor: bgColor, color: txtColor }}>
            <div className="flex animate-marquee gap-8" style={{ animationDuration: duration }}>
                <Contenido />
                <Contenido />
            </div>
        </div>
    )
}
