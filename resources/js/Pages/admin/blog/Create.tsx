import { type ReactNode, useEffect } from 'react'
import { Head, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import AdminLayout from '@/Layouts/AdminLayout'
import BlogPostForm from './parts/BlogPostForm'

export default function BlogCreate() {
    const { props } = usePage<{ flash?: { status?: string } }>()

    useEffect(() => {
        if (props.flash?.status) toast.success(props.flash.status)
    }, [props.flash?.status])

    return (
        <>
            <Head title="Nuevo post" />
            <BlogPostForm post={null} modo="create" />
        </>
    )
}

BlogCreate.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={[
        { label: 'Panel', href: route('admin.dashboard') },
        { label: 'Blog',  href: route('admin.blogs.index') },
        { label: 'Nuevo post' },
    ]}>{page}</AdminLayout>
)
