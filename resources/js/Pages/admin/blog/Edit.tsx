import { type ReactNode, useEffect } from 'react'
import { Head, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import AdminLayout from '@/Layouts/AdminLayout'
import BlogPostForm from './parts/BlogPostForm'

interface Post {
    id:                   number
    titulo:               string
    slug:                 string
    resumen:              string | null
    contenido:            string
    estado:               string
    imagen_destacada_url: string | null
}

interface Props { post: Post }

export default function BlogEdit({ post }: Props) {
    const { props } = usePage<{ flash?: { status?: string } }>()

    useEffect(() => {
        if (props.flash?.status) toast.success(props.flash.status)
    }, [props.flash?.status])

    return (
        <>
            <Head title={`Editar — ${post.titulo}`} />
            <BlogPostForm post={post} modo="edit" />
        </>
    )
}

BlogEdit.layout = (page: ReactNode) => {
    const { post } = usePage<{ post: Post }>().props
    return (
        <AdminLayout breadcrumbs={[
            { label: 'Panel', href: route('admin.dashboard') },
            { label: 'Blog',  href: route('admin.blogs.index') },
            { label: post.titulo },
        ]}>{page}</AdminLayout>
    )
}
