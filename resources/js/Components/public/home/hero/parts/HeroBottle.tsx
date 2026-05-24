import { useEffect, useState } from 'react'
import { usePage } from '@inertiajs/react'
import PlaceholderImage from '@/Components/public/PlaceholderImage'

interface ImagenItem { url: string; ruta: string }

interface Colores { primario: string; secundario: string; acento: string }

// Cuando no hay imágenes configuradas, mostramos 3 slots placeholder con el
// mismo estilo wireframe del logo del navbar. El admin las reemplaza desde
// LinkiuBuild → Inicio → Hero.
const SLOTS_PLACEHOLDER = 3

function resolverColor(token: string, colores: Colores): string {
    if (token === 'primario')   return colores.primario
    if (token === 'secundario') return colores.secundario
    if (token === 'acento')     return colores.acento
    if (token === 'blanco')     return '#FFFFFF'
    return '#000000'
}

function estiloCard(offset: number): React.CSSProperties {
    switch (offset) {
        case 0:  return { transform: 'translateX(0%) rotateZ(0deg) scale(1)',         opacity: 1,    zIndex: 20, filter: 'brightness(1)'    }
        case 1:  return { transform: 'translateX(65%) rotateZ(-11deg) scale(0.88)',   opacity: 0.82, zIndex: 10, filter: 'brightness(0.86)' }
        case -1: return { transform: 'translateX(-65%) rotateZ(11deg) scale(0.88)',   opacity: 0.82, zIndex: 10, filter: 'brightness(0.86)' }
        default: return { transform: 'translateX(0%) rotateZ(0deg) scale(0.6)',       opacity: 0,    zIndex: 0                              }
    }
}

function offsetNormalizado(i: number, activo: number, total: number): number {
    let off = (i - activo + total) % total
    if (off > total / 2) off -= total
    return off
}

export default function HeroBottle() {
    const { build } = usePage<{
        build?: {
            hero?:    { imagenes?: ImagenItem[]; color_texto?: string }
            colores?: Colores
        }
    }>().props

    const configImagenes = build?.hero?.imagenes ?? []
    const srcs = configImagenes.map(i => i.url)
    const usarPlaceholder = srcs.length === 0

    const colores  = build?.colores ?? { primario: '#314158', secundario: '#62748E', acento: '#FB2C36' }
    const dotColor = resolverColor(build?.hero?.color_texto ?? 'primario', colores)

    const total = usarPlaceholder ? SLOTS_PLACEHOLDER : srcs.length
    const [activo, setActivo] = useState(0)

    useEffect(() => {
        setActivo(0)
    }, [total])

    useEffect(() => {
        const t = setInterval(() => setActivo(p => (p + 1) % total), 3800)
        return () => clearInterval(t)
    }, [total])

    return (
        <div className="flex flex-col items-center gap-8 select-none w-full">

            <div className="relative w-full flex items-center justify-center" style={{ height: '500px' }}>
                <div className="relative" style={{ width: '300px', height: '440px' }}>
                    {Array.from({ length: total }).map((_, i) => {
                        const off = offsetNormalizado(i, activo, total)
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
                                {usarPlaceholder ? (
                                    <PlaceholderImage label="Imagen del hero" iconSize="lg" className="rounded-2xl" />
                                ) : (
                                    <img
                                        src={srcs[i]}
                                        alt={`Imagen ${i + 1}`}
                                        className="w-full h-full object-cover"
                                        draggable={false}
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="flex items-center gap-1.5">
                {Array.from({ length: total }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setActivo(i)}
                        className="rounded-full transition-all duration-300"
                        style={{
                            backgroundColor: dotColor,
                            opacity:         i === activo ? 1 : 0.3,
                            width:           i === activo ? '20px' : '6px',
                            height:          '6px',
                        }}
                    />
                ))}
            </div>

        </div>
    )
}
