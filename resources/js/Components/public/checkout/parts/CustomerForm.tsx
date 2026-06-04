import { useState, useEffect } from 'react'
import { CheckIcon, LockIcon, UserIcon, MessageCircleIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CampoConfig {
    id: string
    key: string
    label: string
    type?: string
    placeholder: string
    required?: boolean
    opcional?: boolean
    span?: 'full' | 'half'
}

// Nombre completo unificado: el FormDatos sigue teniendo `nombre` y `apellido`
// separados (el backend los persiste así), pero la UI muestra un solo input.
// El split ocurre en `onCambiarNombreCompleto`. Email y nombre quedan en dos
// columnas para que WhatsApp ocupe el ancho completo y resalte la leyenda.
const CAMPOS_PERSONALES: CampoConfig[] = [
    { id: 'nombre_completo', key: 'nombre', label: 'Nombre completo',     placeholder: 'Valentina Rodríguez', required: true, span: 'half' },
    { id: 'email',           key: 'email',  label: 'Correo electrónico',  type: 'email', placeholder: 'tu@correo.com', required: true, span: 'half' },
    { id: 'telefono',        key: 'telefono', label: 'WhatsApp',          type: 'tel',   placeholder: '300 000 0000',  required: true, span: 'full' },
]

const CAMPOS_FIJOS: CampoConfig[] = [
    { id: 'direccion',   key: 'direccion',   label: 'Dirección',                 placeholder: 'Calle 80 # 45-12',           required: true, span: 'full' },
    { id: 'apartamento', key: 'apartamento', label: 'Detalles adicionales dirección', placeholder: 'Apto 301, torre B, etc.', opcional: true, span: 'full' },
]

const SELECT_BASE = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors duration-200 ease-in-out bg-white disabled:opacity-50 disabled:cursor-not-allowed'
const INPUT_BASE  = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors duration-200 ease-in-out bg-white'

interface DepartamentoZona {
    id: number
    nombre: string
    ciudades: { id: number; nombre: string }[]
}

export interface FormDatos {
    nombre: string
    apellido: string
    email: string
    telefono: string
    direccion: string
    apartamento: string
}

export interface DireccionGuardada {
    id: number
    etiqueta: string | null
    departamento: string
    ciudad: string
    direccion: string
    apartamento: string | null
    predeterminada: boolean
}

interface Props {
    form: FormDatos
    onForm: (key: keyof FormDatos, value: string) => void
    crearCuenta: boolean
    onCrearCuenta: (v: boolean) => void
    contrasena: string
    onContrasena: (v: string) => void
    confirmarContrasena: string
    onConfirmarContrasena: (v: string) => void
    departamento: string
    onDepartamento: (v: string) => void
    ciudad: string
    onCiudad: (v: string) => void
    departamentosDisponibles: DepartamentoZona[]
    intentoEnviar?: boolean
    clienteLogueado?: boolean
    onCerrarSesion?: () => void
    direccionesGuardadas?: DireccionGuardada[]
    direccionSeleccionadaId?: number | 'nueva'
    onSeleccionarDireccion?: (d: DireccionGuardada | null) => void
}

export default function CustomerForm({
    form,
    onForm,
    crearCuenta,
    onCrearCuenta,
    contrasena,
    onContrasena,
    confirmarContrasena,
    onConfirmarContrasena,
    departamento,
    onDepartamento,
    ciudad,
    onCiudad,
    departamentosDisponibles,
    intentoEnviar = false,
    clienteLogueado = false,
    onCerrarSesion,
    direccionesGuardadas = [],
    direccionSeleccionadaId,
    onSeleccionarDireccion,
}: Props) {
    const [emailTocado,      setEmailTocado]      = useState(false)
    const [emailExiste,      setEmailExiste]      = useState<boolean | null>(null)
    const [verificandoEmail, setVerificandoEmail] = useState(false)

    // "Nombre completo" tiene su propio state local — no podemos derivarlo de
    // `form.nombre + ' ' + form.apellido` en cada render porque al teclear un
    // espacio el split inmediato lo descartaba (apellido='' y filter(Boolean)
    // eliminaba el espacio final). Con state local respetamos lo que el usuario
    // ve, y separamos a nombre/apellido en cada change.
    const [nombreCompleto, setNombreCompleto] = useState<string>(
        () => [form.nombre, form.apellido].filter(Boolean).join(' ')
    )

    // Si el form cambia por causa externa (selección de dirección guardada,
    // login auto-rellenado, hidratación de localStorage), sincronizamos el
    // state local. Solo cuando el valor reconstruido difiere del actual para
    // no pisar lo que el usuario está tecleando.
    useEffect(() => {
        const reconstruido = [form.nombre, form.apellido].filter(Boolean).join(' ')
        const actualNormalizado = nombreCompleto.trim().replace(/\s+/g, ' ')
        if (reconstruido !== actualNormalizado) {
            setNombreCompleto(reconstruido)
        }
    }, [form.nombre, form.apellido]) // eslint-disable-line react-hooks/exhaustive-deps

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)

    const contrasenaValida   = contrasena.length >= 8
    const contrasenaCoincide = contrasena === confirmarContrasena
    const ciudadesDisponibles = departamentosDisponibles
        .find(d => d.nombre === departamento)
        ?.ciudades ?? []

    async function verificarUnicidad(email: string) {
        setVerificandoEmail(true)
        try {
            const res  = await fetch(`/api/check-email?email=${encodeURIComponent(email)}`)
            const data = await res.json()
            setEmailExiste(data.existe)
        } catch {
            setEmailExiste(null)
        } finally {
            setVerificandoEmail(false)
        }
    }

    function handleEmailBlur() {
        setEmailTocado(true)
        if (crearCuenta && emailValido) {
            verificarUnicidad(form.email)
        }
    }

    // Al activar "Crear cuenta" con email ya válido y tocado, verificar unicidad
    useEffect(() => {
        if (!crearCuenta) { setEmailExiste(null); return }
        if (emailValido && emailTocado) verificarUnicidad(form.email)
    }, [crearCuenta]) // eslint-disable-line react-hooks/exhaustive-deps

    function handleDepartamento(v: string) {
        onDepartamento(v)
        onCiudad('')
    }

    return (
        <div className="flex flex-col gap-8">

            {/* Datos personales */}
            <div>
                <h2 className="text-base font-bold text-slate-900 mb-4">Información personal</h2>

                {/* Banner sesión activa */}
                {clienteLogueado && (
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                <UserIcon className="w-3.5 h-3.5 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-700">Comprando como</p>
                                <p className="text-xs text-slate-500">{form.nombre} {form.apellido} · {form.email}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onCerrarSesion}
                            className="text-[11px] text-slate-400 hover:text-slate-700 transition-colors duration-200 underline underline-offset-2 shrink-0 ml-4"
                        >
                            No soy yo
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {CAMPOS_PERSONALES.map(c => {
                        const esEmail            = c.key === 'email'
                        const esTelefono         = c.key === 'telefono'
                        const esNombre           = c.key === 'nombre'
                        const bloqueado          = esEmail && clienteLogueado
                        const claseSpan          = c.span === 'full' ? 'md:col-span-2' : ''

                        // Para "Nombre completo" usamos el state local `nombreCompleto`
                        // que preserva espacios mientras el usuario teclea. El split a
                        // nombre + apellido se propaga al form padre en cada change.
                        const valor = esNombre
                            ? nombreCompleto
                            : form[c.key as keyof FormDatos]

                        function onChangeCampo(nuevoValor: string) {
                            if (bloqueado) return
                            if (esNombre) {
                                setNombreCompleto(nuevoValor)
                                const limpio = nuevoValor.trimStart()
                                const idxEspacio = limpio.indexOf(' ')
                                if (idxEspacio === -1) {
                                    onForm('nombre',   limpio)
                                    onForm('apellido', '')
                                } else {
                                    onForm('nombre',   limpio.slice(0, idxEspacio))
                                    onForm('apellido', limpio.slice(idxEspacio + 1).trimStart())
                                }
                            } else {
                                onForm(c.key as keyof FormDatos, nuevoValor)
                            }
                            if (esEmail) setEmailExiste(null)
                        }

                        return (
                            <div key={c.id} className={claseSpan}>
                                <label htmlFor={c.id} className="block text-xs font-medium text-slate-600 mb-1.5">
                                    {c.label}
                                </label>
                                <div className={esEmail ? 'relative' : undefined}>
                                    <input
                                        id={c.id}
                                        type={c.type || 'text'}
                                        placeholder={c.placeholder}
                                        value={valor}
                                        readOnly={bloqueado}
                                        onChange={e => onChangeCampo(e.target.value)}
                                        onBlur={esEmail && !bloqueado ? handleEmailBlur : undefined}
                                        className={cn(
                                            INPUT_BASE,
                                            bloqueado && 'bg-slate-50 text-slate-500 cursor-not-allowed pr-9',
                                            !bloqueado && esEmail && emailTocado && form.email.length > 0 && !emailValido && 'border-red-300 focus:border-red-300',
                                            !bloqueado && esEmail && emailTocado && emailValido && 'pr-9',
                                            c.required && intentoEnviar && esNombre  && (!form.nombre || !form.apellido) && 'border-red-300 focus:border-red-300',
                                            c.required && intentoEnviar && !esNombre && !form[c.key as keyof FormDatos] && 'border-red-300 focus:border-red-300',
                                        )}
                                    />
                                    {bloqueado && (
                                        <LockIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    )}
                                    {!bloqueado && esEmail && emailTocado && emailValido && !verificandoEmail && (
                                        <CheckIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                    )}
                                    {!bloqueado && esEmail && verificandoEmail && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
                                    )}
                                </div>

                                {!bloqueado && esEmail && emailTocado && form.email.length > 0 && !emailValido && (
                                    <p className="text-[11px] text-red-500 mt-1">Ingresa un correo válido</p>
                                )}
                                {!bloqueado && esEmail && crearCuenta && emailExiste === true && (
                                    <p className="text-[11px] text-amber-600 mt-1">
                                        Este correo ya tiene una cuenta.{' '}
                                        <a
                                            href={route('cuenta.login')}
                                            className="underline hover:text-amber-800 transition-colors duration-200"
                                        >
                                            Inicia sesión →
                                        </a>
                                    </p>
                                )}

                                {esTelefono && (
                                    <div className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-100 border border-emerald-200 px-3 py-2.5">
                                        <MessageCircleIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        <p className="text-[11px] font-medium text-emerald-600 leading-snug">
                                            Te enviaremos un WhatsApp para confirmar tu pedido. Asegúrate que el número sea correcto.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Dirección de envío */}
            <div>
                <h2 className="text-base font-bold text-slate-900 mb-4">Dirección de envío</h2>

                {/* Selector de direcciones guardadas */}
                {clienteLogueado && direccionesGuardadas.length > 0 && (
                    <div className="flex flex-col gap-2 mb-5">
                        {direccionesGuardadas.map(d => (
                            <button
                                key={d.id}
                                type="button"
                                onClick={() => onSeleccionarDireccion?.(d)}
                                className={cn(
                                    'flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-colors duration-200 ease-in-out',
                                    direccionSeleccionadaId === d.id
                                        ? 'border-slate-900 bg-slate-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                )}
                            >
                                <div className={cn(
                                    'w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center',
                                    direccionSeleccionadaId === d.id ? 'border-slate-900' : 'border-slate-300'
                                )}>
                                    {direccionSeleccionadaId === d.id && (
                                        <div className="w-2 h-2 rounded-full bg-slate-900" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-900">
                                        {d.etiqueta || d.ciudad}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">
                                        {d.direccion}{d.apartamento ? `, ${d.apartamento}` : ''} · {d.ciudad}
                                    </p>
                                </div>
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => onSeleccionarDireccion?.(null)}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors duration-200 ease-in-out',
                                direccionSeleccionadaId === 'nueva'
                                    ? 'border-slate-900 bg-slate-50'
                                    : 'border-slate-200 hover:border-slate-300'
                            )}
                        >
                            <div className={cn(
                                'w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center',
                                direccionSeleccionadaId === 'nueva' ? 'border-slate-900' : 'border-slate-300'
                            )}>
                                {direccionSeleccionadaId === 'nueva' && (
                                    <div className="w-2 h-2 rounded-full bg-slate-900" />
                                )}
                            </div>
                            <p className="text-sm font-medium text-slate-900">Nueva dirección</p>
                        </button>
                    </div>
                )}

                {/* Formulario — se muestra si no hay guardadas o si eligió "nueva" */}
                {(!clienteLogueado || direccionesGuardadas.length === 0 || direccionSeleccionadaId === 'nueva') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                    {CAMPOS_FIJOS.map(c => (
                        <div key={c.id} className={c.span === 'full' ? 'md:col-span-2' : ''}>
                            <label htmlFor={c.id} className="block text-xs font-medium text-slate-600 mb-1.5">
                                {c.label}
                                {c.opcional && <span className="text-slate-400 font-normal ml-1">(opcional)</span>}
                            </label>
                            <input
                                id={c.id}
                                type="text"
                                placeholder={c.placeholder}
                                value={form[c.key as keyof FormDatos]}
                                onChange={e => onForm(c.key as keyof FormDatos, e.target.value)}
                                className={cn(
                                    INPUT_BASE,
                                    c.required && intentoEnviar && !form[c.key as keyof FormDatos] && 'border-red-300 focus:border-red-300',
                                )}
                            />
                        </div>
                    ))}

                    {/* Departamento */}
                    <div>
                        <label htmlFor="departamento" className="block text-xs font-medium text-slate-600 mb-1.5">
                            Departamento
                        </label>
                        <select
                            id="departamento"
                            className={cn(SELECT_BASE, intentoEnviar && !departamento && 'border-red-300 focus:border-red-300')}
                            value={departamento}
                            onChange={e => handleDepartamento(e.target.value)}
                        >
                            <option value="">Selecciona</option>
                            {departamentosDisponibles.map(d => (
                                <option key={d.id} value={d.nombre}>{d.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Ciudad */}
                    <div>
                        <label htmlFor="ciudad" className="block text-xs font-medium text-slate-600 mb-1.5">
                            Ciudad
                        </label>
                        <select
                            id="ciudad"
                            className={cn(SELECT_BASE, intentoEnviar && !ciudad && 'border-red-300 focus:border-red-300')}
                            value={ciudad}
                            onChange={e => onCiudad(e.target.value)}
                            disabled={!departamento}
                        >
                            <option value="">{departamento ? 'Selecciona' : '— elige departamento —'}</option>
                            {ciudadesDisponibles.map(c => (
                                <option key={c.id} value={c.nombre}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>

                </div>
                )}
            </div>

            {/* Crear cuenta — solo si no está logueado */}
            {!clienteLogueado && <div className="flex flex-col gap-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5 shrink-0">
                        <input
                            type="checkbox"
                            checked={crearCuenta}
                            onChange={e => onCrearCuenta(e.target.checked)}
                            className="peer sr-only"
                        />
                        <div className="w-4 h-4 rounded border border-slate-300 peer-checked:bg-slate-900 peer-checked:border-slate-900 transition-colors duration-200 ease-in-out flex items-center justify-center">
                            {crearCuenta && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors duration-200 ease-in-out">
                            Crear cuenta con estos datos
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Guarda tu historial de pedidos y agiliza futuras compras.
                        </p>
                    </div>
                </label>

                {crearCuenta && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-7">
                        <div className="space-y-1.5">
                            <label htmlFor="contrasena" className="block text-xs font-medium text-slate-600">
                                Contraseña
                            </label>
                            <input
                                id="contrasena"
                                type="password"
                                placeholder="Mínimo 8 caracteres"
                                value={contrasena}
                                onChange={e => onContrasena(e.target.value)}
                                className={INPUT_BASE}
                            />
                            {contrasena.length > 0 && !contrasenaValida && (
                                <p className="text-[11px] text-red-500">Mínimo 8 caracteres</p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="confirmar_contrasena" className="block text-xs font-medium text-slate-600">
                                Confirmar contraseña
                            </label>
                            <input
                                id="confirmar_contrasena"
                                type="password"
                                placeholder="Repite la contraseña"
                                value={confirmarContrasena}
                                onChange={e => onConfirmarContrasena(e.target.value)}
                                className={INPUT_BASE}
                            />
                            {confirmarContrasena.length > 0 && !contrasenaCoincide && (
                                <p className="text-[11px] text-red-500">Las contraseñas no coinciden</p>
                            )}
                            {confirmarContrasena.length > 0 && contrasenaCoincide && contrasenaValida && (
                                <p className="text-[11px] text-emerald-600">Contraseñas coinciden</p>
                            )}
                        </div>
                    </div>
                )}
            </div>}

        </div>
    )
}
