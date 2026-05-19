import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const IMAGENES = [
    '/assets/hero/img_slider_hero_01.png',
    '/assets/hero/img_slider_hero_02.png',
    '/assets/hero/img_slider_hero_03.png',
    '/assets/hero/img_slider_hero_04.png',
]

const TOTAL = IMAGENES.length

// offset: -1 (izq), 0 (centro), 1 (der), resto (oculto)
function estiloCard(offset: number): React.CSSProperties {
    switch (offset) {
        case 0:
            return {
                transform: 'translateX(0%) rotateZ(0deg) scale(1)',
                opacity: 1,
                zIndex: 20,
                filter: 'brightness(1)',
            }
        case 1:
            return {
                transform: 'translateX(65%) rotateZ(-11deg) scale(0.88)',
                opacity: 0.82,
                zIndex: 10,
                filter: 'brightness(0.86)',
            }
        case -1:
            return {
                transform: 'translateX(-65%) rotateZ(11deg) scale(0.88)',
                opacity: 0.82,
                zIndex: 10,
                filter: 'brightness(0.86)',
            }
        default:
            return {
                transform: 'translateX(0%) rotateZ(0deg) scale(0.6)',
                opacity: 0,
                zIndex: 0,
            }
    }
}

function offsetNormalizado(i: number, activo: number): number {
    let off = (i - activo + TOTAL) % TOTAL
    if (off > TOTAL / 2) off -= TOTAL
    return off
}

export default function HeroBottle() {
    const [activo, setActivo] = useState(0)

    useEffect(() => {
        const t = setInterval(() => setActivo(p => (p + 1) % TOTAL), 3800)
        return () => clearInterval(t)
    }, [])

    return (
        <div className="flex flex-col items-center gap-8 select-none w-full">

            {/* Área del carrusel — overflow visible para que las cards laterales asomen */}
            <div className="relative w-full flex items-center justify-center" style={{ height: '500px' }}>
                {/* Track */}
                <div className="relative" style={{ width: '300px', height: '440px' }}>
                    {IMAGENES.map((src, i) => {
                        const off = offsetNormalizado(i, activo)
                        return (
                            <div
                                key={i}
                                onClick={() => setActivo(i)}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease, filter 0.7s ease',
                                    cursor: off !== 0 ? 'pointer' : 'default',
                                    ...estiloCard(off),
                                }}
                                className="rounded-2xl overflow-hidden shadow-xl"
                            >
                                <img
                                    src={src}
                                    alt={`SAVIA ${i + 1}`}
                                    className="w-full h-full object-cover"
                                    draggable={false}
                                />
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
                {IMAGENES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setActivo(i)}
                        className={cn(
                            'rounded-full transition-all duration-300',
                            i === activo
                                ? 'w-5 h-1.5 bg-slate-800'
                                : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                        )}
                    />
                ))}
            </div>

        </div>
    )
}
