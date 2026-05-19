import { usePage, Link } from '@inertiajs/react'
import { ChevronDown, User, HelpCircle, MessageSquare, LogOut } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/DropdownMenu'

interface AuthUser {
    name: string
    email: string
    role: string
}

function initials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase() ?? '')
        .join('')
}

function formatRole(role: string): string {
    return role.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function UserDropdown() {
    const { props } = usePage<{ auth: { user: AuthUser } }>()
    const usuario = props.auth.user

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors duration-200 hover:bg-slate-100 outline-none">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                        {initials(usuario.name)}
                    </div>
                    <div className="hidden text-left lg:block">
                        <p className="text-sm font-medium leading-tight text-slate-800">{usuario.name}</p>
                        <p className="text-xs leading-tight text-slate-400">{formatRole(usuario.role)}</p>
                    </div>
                    <ChevronDown className="size-3.5 shrink-0 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={8} className="w-52">
                <div className="border-b border-slate-100 px-3 py-2.5">
                    <p className="text-sm font-medium text-slate-800">{usuario.name}</p>
                    <p className="truncate text-xs text-slate-400">{usuario.email}</p>
                </div>

                <div className="p-1">
                    <DropdownMenuItem asChild className="gap-2.5">
                        <Link href={route('admin.perfil')}>
                            <User className="size-4" />
                            Mi perfil
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="gap-2.5">
                        <HelpCircle className="size-4" />
                        Ayuda y soporte
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="gap-2.5">
                        <MessageSquare className="size-4" />
                        Enviar comentarios
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild variant="destructive" className="gap-2.5">
                        <Link href={route('admin.logout')} method="post" as="button" className="w-full outline-none">
                            <LogOut className="size-4" />
                            Cerrar sesión
                        </Link>
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
