import { useState } from 'react'
import Sidebar from '@/Components/admin/sidebar'
import Navbar, { Breadcrumb } from '@/Components/admin/navbar'
import { Toaster } from '@/Components/ui/Sonner'

interface Props {
    children: React.ReactNode
    titulo?: string
    breadcrumbs?: Breadcrumb[]
    logoUrl?: string | null
}

export default function AdminLayout({ children, titulo, breadcrumbs, logoUrl }: Props) {
    const [collapsed, setCollapsed]   = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <>
        <div className="flex h-screen bg-gray-50 font-sans">

            {/* Sidebar desktop */}
            <aside className={`hidden flex-col border-r border-slate-200 bg-white transition-all duration-200 lg:flex ${collapsed ? 'w-16' : 'w-56'}`}>
                <Sidebar
                    collapsed={collapsed}
                    onToggleCollapse={() => setCollapsed(v => !v)}
                    logoUrl={logoUrl}
                />
            </aside>

            {/* Sidebar mobile (overlay) */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-slate-900/40"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="absolute left-0 top-0 flex h-full w-56 flex-col border-r border-slate-200 bg-white">
                        <Sidebar
                            collapsed={false}
                            onToggleCollapse={() => setMobileOpen(false)}
                            logoUrl={logoUrl}
                        />
                    </aside>
                </div>
            )}

            {/* Contenido principal */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <Navbar
                    titulo={titulo}
                    breadcrumbs={breadcrumbs}
                    onMobileMenuOpen={() => setMobileOpen(true)}
                />
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>

        </div>
        <Toaster />
        </>
    )
}
