import { type ReactNode } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import WebLayout from '@/Layouts/WebLayout'
import PlaceholderImage from '@/Components/public/PlaceholderImage'

interface Post {
    id:                   number
    titulo:               string
    slug:                 string
    resumen:              string | null
    imagen_destacada_url: string | null
    published_at:         string | null
}

interface Paginado<T> {
    data:         T[]
    current_page: number
    last_page:    number
    total:        number
    from:         number | null
    to:           number | null
}

interface Props { posts: Paginado<Post> }

function formatearFecha(iso: string | null): string {
    if (!iso) return ''
    return format(new Date(iso), "d 'de' MMMM, yyyy", { locale: es })
}

function PostCard({ post }: { post: Post }) {
    return (
        <Link
            href={route('blog.show', post.slug)}
            className="group flex flex-col gap-4 bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors duration-200"
        >
            <div className="aspect-[16/10] overflow-hidden bg-slate-50">
                {post.imagen_destacada_url ? (
                    <img
                        src={post.imagen_destacada_url}
                        alt={post.titulo}
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <PlaceholderImage label="Imagen del post" iconSize="md" className="size-full rounded-none border-0" />
                )}
            </div>
            <div className="flex flex-col gap-2 p-5 pt-0">
                {post.published_at && (
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                        {formatearFecha(post.published_at)}
                    </p>
                )}
                <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-slate-700 transition-colors duration-200">
                    {post.titulo}
                </h3>
                {post.resumen && (
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                        {post.resumen}
                    </p>
                )}
                <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-900 mt-1">
                    Leer más
                    <ArrowRightIcon className="size-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                </span>
            </div>
        </Link>
    )
}

export default function Blog({ posts }: Props) {
    function irAPagina(page: number) {
        router.get(route('blog.index'), { page }, {
            preserveState: false,
            onSuccess: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
        })
    }

    return (
        <>
            <Head>
                <title>Blog</title>
                <meta name="description" content="Últimas novedades, guías y noticias de nuestro equipo." />
            </Head>

            <section className="bg-white border-b border-slate-100 py-14">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-3">
                        Blog
                    </h1>
                    <p className="text-lg text-slate-500 max-w-xl mx-auto">
                        Últimas novedades, guías y noticias de nuestro equipo.
                    </p>
                </div>
            </section>

            <section className="bg-slate-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">

                    {posts.data.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-20 text-center">
                            <p className="text-base font-medium text-slate-700">Aún no hay publicaciones.</p>
                            <p className="text-sm text-slate-500 mt-1">Vuelve pronto — estamos preparando contenido para ti.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.data.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    )}

                    {/* Paginación */}
                    {posts.last_page > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-12">
                            <button
                                type="button"
                                disabled={posts.current_page === 1}
                                onClick={() => irAPagina(posts.current_page - 1)}
                                className="flex items-center justify-center size-9 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeftIcon className="size-4" />
                            </button>
                            <span className="text-sm text-slate-600 px-2">
                                Página {posts.current_page} de {posts.last_page}
                            </span>
                            <button
                                type="button"
                                disabled={posts.current_page === posts.last_page}
                                onClick={() => irAPagina(posts.current_page + 1)}
                                className="flex items-center justify-center size-9 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronRightIcon className="size-4" />
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}

Blog.layout = (page: ReactNode) => <WebLayout>{page}</WebLayout>
