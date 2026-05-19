const ITEMS = [
    'Hecho en Colombia',
    'Cruelty-free',
    'Fórmulas sin químicos agresivos',
    'Envío gratis a todo el país',
    'Garantía de satisfacción',
    'Más de 1.200 clientas',
    'Pago 100% seguro',
    'Atención personalizada',
]

function Separador() {
    return <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
}

function ContenidoTicker() {
    return (
        <>
            {ITEMS.map((item, i) => (
                <span key={i} className="flex items-center gap-4 shrink-0">
                    <Separador />
                    <span className="text-sm font-medium text-slate-300 whitespace-nowrap">{item}</span>
                </span>
            ))}
        </>
    )
}

export default function Ticker() {
    return (
        <div className="bg-slate-900 border-b border-slate-800 py-3 overflow-hidden">
            <div className="flex animate-marquee gap-8">
                <ContenidoTicker />
                <ContenidoTicker />
            </div>
        </div>
    )
}
