interface Props {
    config: Record<string, unknown>
}

/**
 * Imagen estática reusable. Renderiza la misma estructura para los 3 hook_key
 * `imagen_promesa` / `imagen_intermedia` / `imagen_cierre` — la diferencia entre
 * ellos vive en el orden del layout, no en el componente.
 *
 * Si hay `link_url`, envuelve la imagen en `<a target="_blank">` (links externos).
 */
export default function ImagenEstatica({ config }: Props) {
    const url       = config.url       as string  | undefined
    const alt       = config.alt       as string  | undefined
    const linkUrl   = config.link_url  as string  | undefined
    const anchoMax  = config.ancho_max as number  | undefined

    if (!url) return null

    const max = anchoMax && anchoMax > 0 ? anchoMax : 720

    const img = (
        <img
            src={url}
            alt={alt ?? ''}
            loading="lazy"
            decoding="async"
            className="w-full h-auto object-contain mx-auto"
            style={{ maxWidth: `${max}px` }}
        />
    )

    return (
        <div className="flex justify-center">
            {linkUrl
                ? <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full">{img}</a>
                : img}
        </div>
    )
}
