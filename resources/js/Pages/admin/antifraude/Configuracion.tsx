import { type ReactNode, useEffect, useState } from 'react'
import { Head, router, useForm, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { Shield, Phone, DollarSign, UserX, Trash2, Plus } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Badge } from '@/Components/ui/Badge'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Switch } from '@/Components/ui/Switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/Table'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/Components/ui/Select'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/AlertDialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/Components/ui/Empty'

interface ReglaConfig {
    clave:      string
    activa:     boolean
    parametros: Record<string, unknown> | null
}

interface EntradaBlacklist {
    id:         number
    tipo:       'telefono' | 'email'
    valor:      string
    motivo:     string | null
    created_at: string
}

interface Props {
    reglas:    Record<string, ReglaConfig>
    blacklist: EntradaBlacklist[]
}

interface SharedProps {
    auth:  { permissions: string[] }
    flash: { status?: string }
}

function Configuracion({ reglas, blacklist }: Props) {
    const { props } = usePage<SharedProps>()
    const puede = (permiso: string) =>
        props.auth.permissions.includes('*') || props.auth.permissions.includes(permiso)
    const puedeEditar = puede('antifraude.editar')

    useEffect(() => {
        if (props.flash?.status) toast.success(props.flash.status)
    }, [props.flash?.status])

    // Reglas locales (controladas) — la persistencia es manual con "Guardar"
    // para evitar muchos requests cada vez que se mueve un slider.
    const [telefono,  setTelefono]  = useState({
        activa:          reglas['telefono_invalido']?.activa  ?? true,
        usar_mastershop: Boolean(reglas['telefono_invalido']?.parametros?.usar_mastershop ?? true),
    })
    const [monto, setMonto] = useState({
        activa: reglas['monto_alto']?.activa  ?? true,
        umbral: Number(reglas['monto_alto']?.parametros?.umbral ?? 400000),
    })
    const [bl, setBl] = useState({
        activa: reglas['cliente_blacklist']?.activa ?? true,
    })

    const [guardandoReglas, setGuardandoReglas] = useState(false)

    function guardarReglas() {
        if (!puedeEditar) return
        setGuardandoReglas(true)
        router.post(
            route('admin.antifraude.reglas.update'),
            {
                reglas: [
                    { clave: 'telefono_invalido', activa: telefono.activa,
                      parametros: { usar_mastershop: telefono.usar_mastershop } },
                    { clave: 'monto_alto',        activa: monto.activa,
                      parametros: { umbral: monto.umbral } },
                    { clave: 'cliente_blacklist', activa: bl.activa, parametros: null },
                ],
            },
            {
                preserveScroll: true,
                onError:  () => toast.error('Error al guardar las reglas'),
                onFinish: () => setGuardandoReglas(false),
            },
        )
    }

    // Form para agregar entradas a la blacklist
    const formBl = useForm<{ tipo: 'telefono' | 'email'; valor: string; motivo: string }>({
        tipo: 'telefono', valor: '', motivo: '',
    })

    function agregarBlacklist(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!puedeEditar) return
        formBl.post(route('admin.antifraude.blacklist.store'), {
            preserveScroll: true,
            onSuccess: () => formBl.reset('valor', 'motivo'),
            onError:   () => toast.error('Error al agregar la entrada'),
        })
    }

    const [aEliminar, setAEliminar] = useState<EntradaBlacklist | null>(null)
    function eliminarBlacklist() {
        if (!aEliminar) return
        router.delete(route('admin.antifraude.blacklist.destroy', aEliminar.id), {
            preserveScroll: true,
            onSuccess: () => setAEliminar(null),
            onError:   () => toast.error('Error al eliminar la entrada'),
        })
    }

    return (
        <>
            <Head title="Antifraude" />

            <TooltipProvider>
                <div className="space-y-6">

                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">Configuración antifraude</h1>
                            <p className="text-xs text-slate-500">
                                Las órdenes que disparen alguna regla activa quedarán bloqueadas hasta tu aprobación manual.
                            </p>
                        </div>
                    </div>

                    {/* Reglas */}
                    <div className="space-y-4">
                        {/* Regla: teléfono inválido */}
                        <ReglaCard
                            icon={Phone}
                            titulo="Teléfono inválido"
                            descripcion="Valida que el teléfono cumpla el formato de Colombia (10 dígitos comenzando por 3)."
                            activa={telefono.activa}
                            onActivaChange={v => setTelefono(t => ({ ...t, activa: v }))}
                            puedeEditar={puedeEditar}
                        >
                            <div className="flex items-center justify-between pt-2">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">Validar también con Mastershop</Label>
                                    <p className="text-xs text-slate-500">
                                        Capa extra que consulta /validate-phone-number cuando la API key está configurada.
                                    </p>
                                </div>
                                <Switch
                                    checked={telefono.usar_mastershop}
                                    onCheckedChange={v => setTelefono(t => ({ ...t, usar_mastershop: v }))}
                                    disabled={!puedeEditar || !telefono.activa}
                                />
                            </div>
                        </ReglaCard>

                        {/* Regla: monto alto */}
                        <ReglaCard
                            icon={DollarSign}
                            titulo="Monto alto"
                            descripcion="Bloquea órdenes cuyo total supere el umbral configurado. Útil para revisar pedidos COD costosos."
                            activa={monto.activa}
                            onActivaChange={v => setMonto(m => ({ ...m, activa: v }))}
                            puedeEditar={puedeEditar}
                        >
                            <div className="space-y-1.5 pt-2 max-w-xs">
                                <Label htmlFor="umbral-monto" className="text-sm">Umbral (COP)</Label>
                                <Input
                                    id="umbral-monto"
                                    type="number"
                                    min={0}
                                    step={10000}
                                    value={monto.umbral}
                                    onChange={e => setMonto(m => ({ ...m, umbral: parseInt(e.target.value) || 0 }))}
                                    disabled={!puedeEditar || !monto.activa}
                                />
                                <p className="text-xs text-slate-500">
                                    Órdenes con total mayor a ${monto.umbral.toLocaleString('es-CO')} pasan a revisión.
                                </p>
                            </div>
                        </ReglaCard>

                        {/* Regla: blacklist */}
                        <ReglaCard
                            icon={UserX}
                            titulo="Cliente en blacklist"
                            descripcion="Bloquea órdenes cuyo teléfono o email coincida con la lista negra de abajo."
                            activa={bl.activa}
                            onActivaChange={v => setBl({ activa: v })}
                            puedeEditar={puedeEditar}
                        />

                        {/* Botón guardar reglas — siempre visible. Disabled + Tooltip cuando no hay permiso. */}
                        <div className="flex justify-end">
                            {puedeEditar ? (
                                <Button onClick={guardarReglas} disabled={guardandoReglas}>
                                    {guardandoReglas ? 'Guardando…' : 'Guardar cambios'}
                                </Button>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span>
                                            <Button disabled>Guardar cambios</Button>
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>No tenés permiso para editar las reglas</TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    </div>

                    {/* Blacklist */}
                    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h2 className="text-lg font-bold text-slate-900">Blacklist</h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {blacklist.length} entrada{blacklist.length !== 1 ? 's' : ''}.
                                Agregá teléfonos o emails de clientes con fraude/devolución documentada.
                            </p>
                        </div>

                        {/* Form para agregar a la blacklist — siempre visible. Inputs y botón
                            disabled + Tooltip cuando no hay permiso (AGENTS.md L83). */}
                        <form onSubmit={agregarBlacklist} className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_1fr_auto] gap-3 items-end">
                                <div className="space-y-1">
                                    <Label htmlFor="tipo-bl" className="text-xs">Tipo</Label>
                                    <Select
                                        value={formBl.data.tipo}
                                        onValueChange={v => formBl.setData('tipo', v as 'telefono' | 'email')}
                                        disabled={!puedeEditar}
                                    >
                                        <SelectTrigger id="tipo-bl" className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="telefono">Teléfono</SelectItem>
                                            <SelectItem value="email">Email</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="valor-bl" className="text-xs">Valor</Label>
                                    <Input
                                        id="valor-bl"
                                        value={formBl.data.valor}
                                        onChange={e => formBl.setData('valor', e.target.value)}
                                        placeholder={formBl.data.tipo === 'telefono' ? '3001234567' : 'cliente@ejemplo.com'}
                                        disabled={!puedeEditar}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="motivo-bl" className="text-xs">Motivo <span className="text-slate-400">(opcional)</span></Label>
                                    <Input
                                        id="motivo-bl"
                                        value={formBl.data.motivo}
                                        onChange={e => formBl.setData('motivo', e.target.value)}
                                        placeholder="Ej: devolución 2 veces"
                                        disabled={!puedeEditar}
                                    />
                                </div>
                                {puedeEditar ? (
                                    <Button type="submit" disabled={formBl.processing || !formBl.data.valor.trim()}>
                                        <Plus className="w-3.5 h-3.5 mr-1" />
                                        Agregar
                                    </Button>
                                ) : (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>
                                                <Button type="button" disabled>
                                                    <Plus className="w-3.5 h-3.5 mr-1" />
                                                    Agregar
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>No tenés permiso para editar la blacklist</TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </form>

                        {blacklist.length === 0 ? (
                            <Empty className="border-0">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon"><UserX /></EmptyMedia>
                                    <EmptyTitle>Sin entradas en la blacklist</EmptyTitle>
                                    <EmptyDescription>
                                        Cuando un cliente confirme un caso de fraude o devolución, agregá su teléfono o email arriba.
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Valor</TableHead>
                                        <TableHead>Motivo</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {blacklist.map(e => (
                                        <TableRow key={e.id}>
                                            <TableCell>
                                                <Badge variant="secondary" className="capitalize">
                                                    {e.tipo}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-slate-900">{e.valor}</TableCell>
                                            <TableCell className="text-sm text-slate-500">{e.motivo ?? '—'}</TableCell>
                                            <TableCell className="text-right">
                                                {puedeEditar ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setAEliminar(e)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                ) : (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span>
                                                                <Button variant="outline" size="sm" disabled>
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>No tenés permiso para eliminar entradas</TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                </div>
            </TooltipProvider>

            <AlertDialog open={!!aEliminar} onOpenChange={v => !v && setAEliminar(null)}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar entrada?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se quitará de la blacklist a <strong className="text-slate-900 font-mono">{aEliminar?.valor}</strong>.
                            Las futuras órdenes con este {aEliminar?.tipo} ya no pasarán automáticamente a revisión.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={eliminarBlacklist}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

interface ReglaCardProps {
    icon:            React.ComponentType<{ className?: string }>
    titulo:          string
    descripcion:     string
    activa:          boolean
    onActivaChange:  (v: boolean) => void
    puedeEditar:     boolean
    children?:       ReactNode
}

function ReglaCard({ icon: Icon, titulo, descripcion, activa, onActivaChange, puedeEditar, children }: ReglaCardProps) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900">{titulo}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{descripcion}</p>
                    </div>
                </div>
                <Switch
                    checked={activa}
                    onCheckedChange={onActivaChange}
                    disabled={!puedeEditar}
                />
            </div>
            {children && <div className="mt-4 pl-12">{children}</div>}
        </div>
    )
}

Configuracion.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={[
        { label: 'Panel', href: route('admin.dashboard') },
        { label: 'Integraciones' },
        { label: 'Mastershop', href: route('admin.integraciones.mastershop') },
        { label: 'Antifraude' },
    ]}>{page}</AdminLayout>
)

export default Configuracion
