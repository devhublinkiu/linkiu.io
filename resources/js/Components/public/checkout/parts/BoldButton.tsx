import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { ZapIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackFb } from '@/lib/usePixel'
import type { FormDatos } from './CustomerForm'

interface OrderData {
    form: FormDatos
    departamento: string
    ciudad: string
    subtotal: number
    costoEnvio: number
    recargo: number
    total: number
    items: {
        producto_id?: number
        nombre: string
        imagen: string
        label: string
        cantidad: number
        precio: number
    }[]
}

interface Props {
    orderData: OrderData
    onError: (mensaje: string) => void
    disabled?: boolean
}

interface IniciarResponse {
    order_id:            string
    acceso_token:        string
    amount:              string
    currency:            string
    api_key:             string
    integrity_signature: string
    description:         string
    redirection_url:     string
}

// Global del SDK Bold (cargado vía script tag)
declare global {
    interface Window {
        BoldCheckout?: new (config: Record<string, unknown>) => { open: () => void }
    }
}

const SDK_URL = 'https://checkout.bold.co/library/boldPaymentButton.js'

/**
 * Botón de Bold. Carga el SDK on-demand, pide config al backend con la orden
 * ya creada y abre el modal embebido de Bold. El cliente paga sin salir.
 * Al confirmar/rechazar Bold redirige a redirection_url (la página de gracias);
 * el webhook server-side es lo que realmente cierra la orden.
 */
export default function BoldButton({ orderData, onError, disabled }: Props) {
    const [cargandoSdk,     setCargandoSdk]     = useState(false)
    const [sdkListo,        setSdkListo]        = useState(false)
    const [procesando,      setProcesando]      = useState(false)

    useEffect(() => {
        // Idempotente: si ya está el script, no lo agregamos otra vez.
        if (window.BoldCheckout) {
            setSdkListo(true)
            return
        }
        if (document.getElementById('bold-sdk-script')) return

        setCargandoSdk(true)
        const s = document.createElement('script')
        s.id    = 'bold-sdk-script'
        s.src   = SDK_URL
        s.async = true
        s.onload  = () => { setSdkListo(true); setCargandoSdk(false) }
        s.onerror = () => { setCargandoSdk(false); onError('No se pudo cargar el SDK de Bold.') }
        document.head.appendChild(s)
    }, [onError])

    const pagar = useCallback(async () => {
        if (!window.BoldCheckout) {
            onError('Bold aún no está listo. Espera un instante e intenta de nuevo.')
            return
        }

        setProcesando(true)
        try {
            const { data } = await axios.post<IniciarResponse>('/api/bold/iniciar', {
                order: {
                    nombre:      orderData.form.nombre,
                    apellido:    orderData.form.apellido,
                    email:       orderData.form.email,
                    telefono:    orderData.form.telefono,
                    direccion:   orderData.form.direccion,
                    apartamento: orderData.form.apartamento || null,
                    notas:       orderData.form.notas || null,
                    departamento: orderData.departamento,
                    ciudad:       orderData.ciudad,
                    subtotal:     orderData.subtotal,
                    costo_envio:  orderData.costoEnvio,
                    recargo:      orderData.recargo,
                    total:        orderData.total,
                    items:        orderData.items.map(i => ({
                        producto_id: i.producto_id,
                        nombre:      i.nombre,
                        imagen:      i.imagen,
                        label:       i.label,
                        cantidad:    i.cantidad,
                        precio:      i.precio,
                    })),
                },
            })

            trackFb('AddPaymentInfo', {
                value:        orderData.total,
                currency:     'COP',
                payment_type: 'bold',
                num_items:    orderData.items.reduce((acc, i) => acc + i.cantidad, 0),
            })

            const checkout = new window.BoldCheckout!({
                orderId:            data.order_id,
                currency:           data.currency,
                amount:             data.amount,
                apiKey:             data.api_key,
                integritySignature: data.integrity_signature,
                description:        data.description,
                redirectionUrl:     data.redirection_url,
                renderMode:         'embedded',
                customerData: JSON.stringify({
                    email:     orderData.form.email,
                    fullName:  `${orderData.form.nombre} ${orderData.form.apellido}`.trim(),
                    phone:     orderData.form.telefono,
                }),
            })

            checkout.open()
        } catch (err) {
            const mensaje = (err as { response?: { data?: { error?: string } } }).response?.data?.error
                ?? 'No se pudo iniciar el pago con Bold. Intenta de nuevo.'
            onError(mensaje)
        } finally {
            setProcesando(false)
        }
    }, [orderData, onError])

    return (
        <button
            type="button"
            onClick={pagar}
            disabled={disabled || procesando || cargandoSdk || !sdkListo}
            className={cn(
                'w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-950 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-base font-bold py-4 rounded-lg transition-colors duration-200 ease-in-out',
            )}
        >
            <ZapIcon className="w-5 h-5" />
            {procesando ? 'Iniciando…' : cargandoSdk ? 'Cargando Bold…' : `Pagar con Bold`}
        </button>
    )
}
