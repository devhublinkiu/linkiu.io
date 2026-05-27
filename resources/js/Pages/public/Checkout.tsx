import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { Link } from '@inertiajs/react'
import { router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import WebLayout from '@/Layouts/WebLayout'
import LoginOption from '@/Components/public/checkout/parts/LoginOption'
import CustomerForm, { type FormDatos, type DireccionGuardada } from '@/Components/public/checkout/parts/CustomerForm'
import PaymentMethods, { type MetodoPagoPublico } from '@/Components/public/checkout/parts/PaymentMethods'
import OrderSummary from '@/Components/public/checkout/parts/OrderSummary'
import PaymentBrick, { type MpResultado } from '@/Components/public/checkout/parts/PaymentBrick'
import BoldButton from '@/Components/public/checkout/parts/BoldButton'
import { useCart } from '@/contexts/CartContext'
import { trackFb } from '@/lib/usePixel'

interface ZonaEnvio {
    id: number
    nombre: string
    departamentos: { id: number; nombre: string; ciudades: { id: number; nombre: string }[] }[]
    tipo_costo: 'gratis' | 'costo_fijo' | 'gratis_desde'
    costo: number | null
    umbral_gratis: number | null
}

const PASOS = ['Carrito', 'Datos', 'Pago', 'Confirmación']

function calcularEnvio(zonas: ZonaEnvio[], ciudad: string, subtotal: number): number {
    if (!ciudad) return 0
    const zona = zonas.find(z =>
        z.departamentos.some(d => d.ciudades.some(c => c.nombre.toLowerCase() === ciudad.toLowerCase()))
    )
    if (!zona) return 0
    if (zona.tipo_costo === 'gratis') return 0
    if (zona.tipo_costo === 'gratis_desde') {
        if (zona.umbral_gratis && subtotal >= zona.umbral_gratis) return 0
        return zona.costo ?? 0
    }
    return zona.costo ?? 0
}

interface ClienteAuth {
    id: number
    nombre: string
    apellido: string
    email: string
    telefono: string
}

function Checkout() {
    const { metodos, zonas_envio, auth, direcciones: direccionesGuardadas = [], mp_public_key } = usePage<{
        metodos:          MetodoPagoPublico[]
        zonas_envio:      ZonaEnvio[]
        auth:             { client: ClienteAuth | null }
        direcciones:      DireccionGuardada[]
        mp_public_key:    string | null
    }>().props

    const clienteLogueado = !!auth?.client
    const predeterminada  = direccionesGuardadas.find(d => d.predeterminada) ?? null

    const { items, total, clearCart } = useCart()

    useEffect(() => {
        if (items.length === 0) return
        // Idempotencia por sesión: si ya disparamos InitiateCheckout esta sesión,
        // no lo repetimos en refreshes ni segundas visitas al checkout. Se limpia
        // al completar la compra (limpiarFormPersistido también limpia este flag).
        if (typeof window !== 'undefined' && sessionStorage.getItem('ic_dispatched')) return

        trackFb('InitiateCheckout', {
            content_ids: items.map(i => i.id),
            num_items:   items.reduce((acc, i) => acc + i.cantidad, 0),
            value:       total,
            currency:    'COP',
        })
        if (typeof window !== 'undefined') sessionStorage.setItem('ic_dispatched', '1')
    }, [])

    const [form, setForm] = useState<FormDatos>({
        nombre:     auth?.client?.nombre    ?? '',
        apellido:   auth?.client?.apellido  ?? '',
        email:      auth?.client?.email     ?? '',
        telefono:   auth?.client?.telefono  ?? '',
        direccion:  predeterminada?.direccion   ?? '',
        apartamento: predeterminada?.apartamento ?? '',
        notas: '',
    })
    const [direccionSeleccionadaId, setDireccionSeleccionadaId] = useState<number | 'nueva'>(
        predeterminada ? predeterminada.id : 'nueva'
    )
    const [crearCuenta,          setCrearCuenta]          = useState(false)
    const [metodoPago,           setMetodoPago]           = useState<string>(() => metodos[0]?.clave ?? '')
    const [comprobante,          setComprobante]          = useState<File | null>(null)
    const [departamento,         setDepartamento]         = useState(predeterminada?.departamento ?? '')
    const [ciudad,               setCiudad]               = useState(predeterminada?.ciudad       ?? '')
    const [contrasena,           setContrasena]           = useState('')
    const [confirmarContrasena,  setConfirmarContrasena]  = useState('')
    const [enviando,             setEnviando]             = useState(false)
    const [intentoEnviar,        setIntentoEnviar]        = useState(false)
    const [mpPendiente,          setMpPendiente]          = useState(false)

    // ── Persistencia en localStorage ─────────────────────────────────────────
    // Restauramos el formulario al montar (sobrevive a F5 / cierre de pestaña).
    // NO persistimos comprobante (File no serializable) ni contraseñas (seguridad).
    // El flag `formHidratado` evita que el writer borre el storage en SSR/hydration
    // antes de que el reader lo haya leído.
    const [formHidratado, setFormHidratado] = useState(false)

    useEffect(() => {
        const raw = typeof window === 'undefined' ? null : localStorage.getItem('checkout_form_v1')
        if (!raw) { setFormHidratado(true); return }
        try {
            const saved = JSON.parse(raw)
            if (typeof saved !== 'object' || saved === null) { setFormHidratado(true); return }

            setForm(prev => ({
                nombre:      typeof saved.nombre      === 'string' ? saved.nombre      : prev.nombre,
                apellido:    typeof saved.apellido    === 'string' ? saved.apellido    : prev.apellido,
                email:       typeof saved.email       === 'string' ? saved.email       : prev.email,
                telefono:    typeof saved.telefono    === 'string' ? saved.telefono    : prev.telefono,
                direccion:   typeof saved.direccion   === 'string' ? saved.direccion   : prev.direccion,
                apartamento: typeof saved.apartamento === 'string' ? saved.apartamento : prev.apartamento,
                notas:       typeof saved.notas       === 'string' ? saved.notas       : prev.notas,
            }))
            if (typeof saved.departamento === 'string') setDepartamento(saved.departamento)
            if (typeof saved.ciudad       === 'string') setCiudad(saved.ciudad)
            if (typeof saved.metodoPago   === 'string' && metodos.some(m => m.clave === saved.metodoPago)) {
                setMetodoPago(saved.metodoPago)
            }
            if (typeof saved.crearCuenta === 'boolean') setCrearCuenta(saved.crearCuenta)
        } catch {
            localStorage.removeItem('checkout_form_v1')
        } finally {
            setFormHidratado(true)
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Guarda en cada cambio relevante. Excluye contraseñas y comprobante.
    useEffect(() => {
        if (!formHidratado || typeof window === 'undefined') return
        localStorage.setItem('checkout_form_v1', JSON.stringify({
            nombre:      form.nombre,
            apellido:    form.apellido,
            email:       form.email,
            telefono:    form.telefono,
            direccion:   form.direccion,
            apartamento: form.apartamento,
            notas:       form.notas,
            departamento,
            ciudad,
            metodoPago,
            crearCuenta,
        }))
    }, [form, departamento, ciudad, metodoPago, crearCuenta, formHidratado])

    function limpiarFormPersistido() {
        if (typeof window === 'undefined') return
        localStorage.removeItem('checkout_form_v1')
        // También liberamos el flag de InitiateCheckout para que un nuevo
        // carrito en esta misma pestaña vuelva a disparar el evento.
        sessionStorage.removeItem('ic_dispatched')
    }

    // Cuando el cliente hace login desde el checkout, sync form + dirección predeterminada
    useEffect(() => {
        if (!auth?.client) return
        setForm(prev => ({
            ...prev,
            nombre:   auth.client!.nombre    || prev.nombre,
            apellido: auth.client!.apellido  || prev.apellido,
            email:    auth.client!.email     || prev.email,
            telefono: auth.client!.telefono  || prev.telefono,
        }))

        const pred = (direccionesGuardadas ?? []).find(d => d.predeterminada) ?? null
        if (pred) {
            setDireccionSeleccionadaId(pred.id)
            setDepartamento(pred.departamento)
            setCiudad(pred.ciudad)
            setForm(prev => ({ ...prev, direccion: pred.direccion, apartamento: pred.apartamento ?? '' }))
        }
    }, [auth?.client?.id]) // eslint-disable-line react-hooks/exhaustive-deps

    function handleForm(key: keyof FormDatos, value: string) {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    function cerrarSesion() {
        router.post(route('cuenta.logout'), {}, { onSuccess: () => router.reload() })
    }

    function manejarResultadoMp(resultado: MpResultado) {
        clearCart()
        limpiarFormPersistido()

        if (resultado.status === 'approved') {
            router.visit(route('orden.confirmacion', { order: resultado.acceso_token }))
            return
        }

        if (resultado.status === 'pending_challenge' && resultado.three_ds_info) {
            // 3DS: redirigir al banco para el challenge
            window.location.href = resultado.three_ds_info.external_resource_url
            return
        }

        if (resultado.status === 'pending' && resultado.external_resource_url) {
            // PSE / Efecty: redirigir a la URL del banco o voucher
            setMpPendiente(true)
            window.location.href = resultado.external_resource_url
            return
        }

        // pending sin redirect → mismo flujo que contraentrega
        if (resultado.status === 'pending') {
            router.visit(route('orden.confirmacion', { order: resultado.acceso_token }))
        }
    }

    function seleccionarDireccion(d: DireccionGuardada | null) {
        if (d) {
            setDireccionSeleccionadaId(d.id)
            setDepartamento(d.departamento)
            setCiudad(d.ciudad)
            setForm(prev => ({ ...prev, direccion: d.direccion, apartamento: d.apartamento ?? '' }))
        } else {
            setDireccionSeleccionadaId('nueva')
            setDepartamento('')
            setCiudad('')
            setForm(prev => ({ ...prev, direccion: '', apartamento: '' }))
        }
    }

    const recargo = metodoPago === 'contraentrega'
        ? Number(metodos.find(m => m.clave === 'contraentrega')?.config?.recargo ?? 0)
        : 0

    const costoEnvio = calcularEnvio(zonas_envio, ciudad, total)

    const departamentosDisponibles = useMemo(() => {
        const map = new Map<number, { id: number; nombre: string; ciudades: { id: number; nombre: string }[] }>()
        zonas_envio.forEach(zona => {
            zona.departamentos.forEach(d => {
                if (!map.has(d.id)) {
                    map.set(d.id, { id: d.id, nombre: d.nombre, ciudades: [] })
                }
                const existing = map.get(d.id)!
                d.ciudades.forEach(c => {
                    if (!existing.ciudades.some(ec => ec.id === c.id)) {
                        existing.ciudades.push(c)
                    }
                })
            })
        })
        return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
    }, [zonas_envio])

    function handleDepartamento(v: string) {
        setDepartamento(v)
        setCiudad('')
    }

    function confirmar() {
        setIntentoEnviar(true)
        if (items.length === 0) return
        if (!form.nombre || !form.apellido || !form.email || !form.telefono) {
            toast.error('Completa tu información personal')
            return
        }
        if (!form.direccion || !departamento || !ciudad) {
            toast.error('Completa tu dirección de envío')
            return
        }
        if (crearCuenta && (!contrasena || contrasena !== confirmarContrasena || contrasena.length < 8)) {
            toast.error('Verifica las contraseñas antes de continuar')
            return
        }

        setEnviando(true)

        const totalFinal = total + costoEnvio + recargo

        const payload = new FormData()
        payload.append('nombre',       form.nombre)
        payload.append('apellido',     form.apellido)
        payload.append('email',        form.email)
        payload.append('telefono',     form.telefono)
        payload.append('direccion',    form.direccion)
        payload.append('apartamento',  form.apartamento)
        payload.append('notas',        form.notas)
        payload.append('departamento', departamento)
        payload.append('ciudad',       ciudad)
        payload.append('metodo_pago',  metodoPago)
        payload.append('subtotal',     String(Math.round(total)))
        payload.append('costo_envio',  String(Math.round(costoEnvio)))
        payload.append('recargo',      String(Math.round(recargo)))
        payload.append('total',        String(Math.round(totalFinal)))
        payload.append('crear_cuenta', crearCuenta ? '1' : '0')
        if (crearCuenta && contrasena) payload.append('contrasena', contrasena)
        if (comprobante) payload.append('comprobante', comprobante)

        items.forEach((item, i) => {
            if (item.productoId) payload.append(`items[${i}][producto_id]`, String(item.productoId))
            payload.append(`items[${i}][nombre]`,   item.nombre)
            payload.append(`items[${i}][imagen]`,   item.imagen ?? '')
            payload.append(`items[${i}][label]`,    item.label ?? '')
            payload.append(`items[${i}][cantidad]`, String(Math.round(item.cantidad)))
            payload.append(`items[${i}][precio]`,   String(Math.round(item.precio)))
        })

        router.post(route('orden.store'), payload, {
            onSuccess: () => { clearCart(); limpiarFormPersistido() },
            onError:   (errors) => {
                const primer = Object.values(errors)[0]
                toast.error(primer ?? 'Error al procesar el pedido')
            },
            onFinish:  () => setEnviando(false),
        })
    }

    return (
        <>
            {/* Header */}
            <section className="bg-white border-b border-slate-100 py-6">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                        <Link href="/" className="hover:text-slate-600 transition-colors duration-200">Inicio</Link>
                        <span>/</span>
                        <Link href="/productos" className="hover:text-slate-600 transition-colors duration-200">Productos</Link>
                        <span>/</span>
                        <span className="text-slate-600 font-medium">Checkout</span>
                    </div>

                    <div className="flex items-center gap-0">
                        {PASOS.map((paso, i) => (
                            <div key={paso} className="flex items-center">
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                        i <= 2 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {i + 1}
                                    </div>
                                    <span className={`text-xs font-medium hidden sm:block ${i <= 2 ? 'text-slate-900' : 'text-slate-500'}`}>
                                        {paso}
                                    </span>
                                </div>
                                {i < PASOS.length - 1 && (
                                    <div className={`h-px w-8 sm:w-12 mx-2 ${i < 2 ? 'bg-slate-900' : 'bg-slate-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contenido */}
            <section className="bg-slate-50 py-10 min-h-[70vh] overflow-x-hidden">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

                        <div className="flex flex-col gap-6 min-w-0">
                            {!clienteLogueado && <LoginOption />}

                            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                                <CustomerForm
                                    form={form}
                                    onForm={handleForm}
                                    crearCuenta={crearCuenta}
                                    onCrearCuenta={setCrearCuenta}
                                    contrasena={contrasena}
                                    onContrasena={setContrasena}
                                    confirmarContrasena={confirmarContrasena}
                                    onConfirmarContrasena={setConfirmarContrasena}
                                    departamento={departamento}
                                    onDepartamento={handleDepartamento}
                                    ciudad={ciudad}
                                    onCiudad={setCiudad}
                                    departamentosDisponibles={departamentosDisponibles}
                                    intentoEnviar={intentoEnviar}
                                    clienteLogueado={clienteLogueado}
                                    onCerrarSesion={cerrarSesion}
                                    direccionesGuardadas={direccionesGuardadas}
                                    direccionSeleccionadaId={direccionSeleccionadaId}
                                    onSeleccionarDireccion={seleccionarDireccion}
                                />
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                                <PaymentMethods
                                    metodos={metodos}
                                    metodoPago={metodoPago}
                                    onMetodoPago={v => { setMetodoPago(v); setMpPendiente(false) }}
                                    comprobante={comprobante}
                                    onComprobante={setComprobante}
                                />
                            </div>

                            {/* Payment Brick — solo cuando se selecciona MercadoPago */}
                            {metodoPago === 'mercadopago' && !mpPendiente && (
                                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                                    {mp_public_key ? (
                                        <PaymentBrick
                                            total={Math.round(total + costoEnvio + recargo)}
                                            publicKey={mp_public_key}
                                            orderData={{
                                                form:        form,
                                                departamento,
                                                ciudad,
                                                subtotal:    Math.round(total),
                                                costoEnvio:  Math.round(costoEnvio),
                                                recargo:     Math.round(recargo),
                                                total:       Math.round(total + costoEnvio + recargo),
                                                items:       items.map(i => ({
                                                    producto_id: i.productoId,
                                                    nombre:      i.nombre,
                                                    imagen:      i.imagen ?? '',
                                                    label:       i.label ?? '',
                                                    cantidad:    Math.round(Number(i.cantidad)),
                                                    precio:      Math.round(Number(i.precio)),
                                                })),
                                            }}
                                            metodo={metodos.find(m => m.clave === 'mercadopago')!}
                                            onResultado={manejarResultadoMp}
                                            onError={msg => toast.error(msg)}
                                        />
                                    ) : (
                                        <p className="text-sm text-slate-500 text-center py-4">
                                            MercadoPago no está configurado. Configura las credenciales en el panel de administración.
                                        </p>
                                    )}
                                </div>
                            )}

                            {mpPendiente && (
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
                                    Tu orden fue registrada. Completa el pago para confirmarla.
                                </div>
                            )}

                            {/* Botón Bold — abre el modal embebido del SDK al click */}
                            {metodoPago === 'bold' && (
                                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                                    <BoldButton
                                        orderData={{
                                            form,
                                            departamento,
                                            ciudad,
                                            subtotal:    Math.round(total),
                                            costoEnvio:  Math.round(costoEnvio),
                                            recargo:     Math.round(recargo),
                                            total:       Math.round(total + costoEnvio + recargo),
                                            items:       items.map(i => ({
                                                producto_id: i.productoId,
                                                nombre:      i.nombre,
                                                imagen:      i.imagen ?? '',
                                                label:       i.label ?? '',
                                                cantidad:    Math.round(Number(i.cantidad)),
                                                precio:      Math.round(Number(i.precio)),
                                            })),
                                        }}
                                        onError={msg => toast.error(msg)}
                                    />
                                </div>
                            )}
                        </div>

                        <OrderSummary
                            onConfirmar={confirmar}
                            enviando={enviando}
                            recargo={recargo}
                            zonasEnvio={zonas_envio}
                            ciudad={ciudad}
                            metodoPago={metodoPago}
                            metodos={metodos}
                            ocultarBoton={metodoPago === 'mercadopago' || metodoPago === 'bold'}
                        />

                    </div>
                </div>
            </section>
        </>
    )
}

Checkout.layout = (page: ReactNode) => <WebLayout>{page}</WebLayout>

export default Checkout
