import { Link } from '@inertiajs/react'
import { Toaster } from '@/Components/ui/Sonner'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
            <Link href="/" className="mb-8 block">
                <img
                    src="/assets/auth_resources/logotipo_Linkiu.png"
                    alt="Linkiu"
                    className="h-8 w-auto"
                />
            </Link>
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg p-8">
                {children}
            </div>
            <Toaster />
        </div>
    )
}
