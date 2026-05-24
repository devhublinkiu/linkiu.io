import { type ReactNode } from 'react'
import { Head, Link } from '@inertiajs/react'
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import WebLayout from '@/Layouts/WebLayout'
import PlaceholderImage from '@/Components/public/PlaceholderImage'

interface Post {
    id:                   number
    titulo:               string
    slug:                 string
    resumen:              string | null
    contenido:            string
    imagen_destacada_url: string | null
    published_at:         string | null
}

interface Relacionado {
    titulo:               string
    slug:                 string
    imagen_destacada_url: string | null
    published_at:         string | null
}

interface Props {
    post:         Post
    relacionados: Relacionado[]
}

function formatearFecha(iso: string | null): string {
    if (!iso) return ''
    return format(new Date(iso), "d 'de' MMMM, yyyy", { locale: es })
}

export default function BlogPostPage({ post, relacionados }: Props) {
    // Meta de SEO: si hay imagen destacada, va como og:image.
    // El resumen (o el título si no hay resumen) va como description.
    const descripcion = post.resumen ?? post.titulo

    return (
        <>
            <Head>
                <title>{post.titulo}</title>
                <meta name="description" content={descripcion} />

                {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
                <meta property="og:type"        content="article" />
                <meta property="og:title"       content={post.titulo} />
                <meta property="og:description" content={descripcion} />
                {post.imagen_destacada_url && (
                    <meta property="og:image" content={post.imagen_destacada_url} />
                )}

                {/* Twitter Card */}
                <meta name="twitter:card"        content={post.imagen_destacada_url ? 'summary_large_image' : 'summary'} />
                <meta name="twitter:title"       content={post.titulo} />
                <meta name="twitter:description" content={descripcion} />
                {post.imagen_destacada_url && (
                    <meta name="twitter:image" content={post.imagen_destacada_url} />
                )}
            </Head>

            <article className="bg-white">

                {/* Hero */}
                <header className="border-b border-slate-100">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                        <Link
                            href={route('blog.index')}
                            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors duration-200 mb-8"
                        >
                            <ArrowLeftIcon className="size-3.5" />
                            Volver al blog
                        </Link>

                        {post.published_at && (
                            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500 font-medium mb-3">
                                <CalendarIcon className="size-3.5" />
                                {formatearFecha(post.published_at)}
                            </p>
                        )}
                        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                            {post.titulo}
                        </h1>
                        {post.resumen && (
                            <p className="text-xl text-slate-500 leading-relaxed mt-5 max-w-3xl">
                                {post.resumen}
                            </p>
                        )}
                    </div>
                </header>

                {/* Imagen destacada */}
                <div className="bg-slate-50 py-8 border-b border-slate-100">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6">
                        <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-white">
                            {post.imagen_destacada_url ? (
                                <img
                                    src={post.imagen_destacada_url}
                                    alt={post.titulo}
                                    className="size-full object-cover"
                                />
                            ) : (
                                <PlaceholderImage label="Imagen del post" iconSize="lg" className="size-full" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Contenido — render del HTML sanitizado (Purifier en backend) */}
                <div className="py-14">
                    <div
                        className="max-w-3xl mx-auto px-4 sm:px-6 prose prose-slate prose-lg
                            prose-headings:tracking-tight prose-headings:font-bold
                            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                            prose-h3:text-xl  prose-h3:mt-8  prose-h3:mb-3
                            prose-p:text-slate-700 prose-p:leading-relaxed
                            prose-a:text-slate-900 prose-a:underline-offset-2
                            prose-strong:text-slate-900
                            prose-blockquote:border-l-slate-300 prose-blockquote:text-slate-600 prose-blockquote:italic
                            prose-ul:my-4 prose-ol:my-4
                            max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.contenido }}
                    />
                </div>

            </article>

            {/* Posts relacionados */}
            {relacionados.length > 0 && (
                <section className="bg-slate-50 py-14 border-t border-slate-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="flex items-baseline justify-between mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sigue leyendo</h2>
                            <Link
                                href={route('blog.index')}
                                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors duration-200 inline-flex items-center gap-1"
                            >
                                Ver todos
                                <ArrowRightIcon className="size-3.5" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {relacionados.map(rel => (
                                <Link
                                    key={rel.slug}
                                    href={route('blog.show', rel.slug)}
                                    className="group flex flex-col gap-3 bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors duration-200"
                                >
                                    <div className="aspect-[16/10] overflow-hidden bg-slate-50">
                                        {rel.imagen_destacada_url ? (
                                            <img
                                                src={rel.imagen_destacada_url}
                                                alt={rel.titulo}
                                                className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <PlaceholderImage label="Imagen" iconSize="sm" className="size-full rounded-none border-0" />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1.5 p-4 pt-0">
                                        {rel.published_at && (
                                            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                                                {formatearFecha(rel.published_at)}
                                            </p>
                                        )}
                                        <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-slate-700 transition-colors duration-200">
                                            {rel.titulo}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    )
}

BlogPostPage.layout = (page: ReactNode) => <WebLayout>{page}</WebLayout>
