import { useEffect, useRef, useMemo, useCallback } from 'react'
import { Payment, initMercadoPago } from '@mercadopago/sdk-react'
import type { FormDatos } from './CustomerForm'
import type { MetodoPagoPublico } from './PaymentMethods'

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

export interface MpResultado {
    status: 'approved' | 'pending' | 'pending_challenge' | 'rejected'
    status_detail: string
    codigo?: string
    acceso_token?: string
    nombre?: string
    email?: string
    total?: number
    external_resource_url?: string
    three_ds_info?: { external_resource_url: string; creq: string }
    payment_id?: number
    error?: string
}

interface Props {
    total: number
    publicKey: string
    orderData: OrderData
    metodo: MetodoPagoPublico
    onResultado: (resultado: MpResultado) => void
    onError: (msg: string) => void
}

export default function PaymentBrick({ total, publicKey, orderData, onResultado, onError }: Props) {
    const inicializado = useRef(false)

    // Refs para mantener los valores frescos sin cambiar la referencia de los callbacks
    const orderDataRef   = useRef(orderData)
    const onResultadoRef = useRef(onResultado)
    const onErrorRef     = useRef(onError)
    const totalRef       = useRef(total)

    orderDataRef.current   = orderData
    onResultadoRef.current = onResultado
    onErrorRef.current     = onError
    totalRef.current       = total

    useEffect(() => {
        if (inicializado.current || !publicKey) return
        inicializado.current = true
        initMercadoPago(publicKey, { locale: 'es-CO', advancedFraudPrevention: true })
    }, [publicKey])

    // initialization y customization son estables — el Brick no se remonta en cada render del padre
    const initialization = useMemo(() => ({ amount: total }), [total])

    const customization = useMemo(() => ({
        paymentMethods: {
            creditCard:   'all' as const,
            debitCard:    'all' as const,
            prepaidCard:  'all' as const,
            bankTransfer: ['pse'] as string[],
        },
    }), [])

    // Referencia estable — el Brick no detecta cambio de prop en cada render del padre
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onSubmit = useCallback(async ({ formData }: any) => {
        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? ''
        const order     = orderDataRef.current
        const total     = totalRef.current

        const res = await fetch(route('mp.pagar'), {
            method:  'POST',
            headers: {
                'Content-Type':     'application/json',
                'X-CSRF-TOKEN':     csrfToken,
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({
                form_data: {
                    ...formData,
                    transaction_amount: total,
                    payer: {
                        ...(formData.payer as Record<string, unknown> ?? {}),
                        email: order.form.email,
                    },
                },
                order: {
                    nombre:       order.form.nombre,
                    apellido:     order.form.apellido,
                    email:        order.form.email,
                    telefono:     order.form.telefono,
                    departamento: order.departamento,
                    ciudad:       order.ciudad,
                    direccion:    order.form.direccion,
                    apartamento:  order.form.apartamento,
                    notas:        order.form.notas,
                    subtotal:     order.subtotal,
                    costo_envio:  order.costoEnvio,
                    recargo:      order.recargo,
                    total:        order.total,
                    items:        order.items,
                },
            }),
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const json: any = await res.json()

        if (!res.ok) {
            const firstValidation = json.errors
                ? (Object.values(json.errors) as string[][])[0]?.[0]
                : null
            const msg = json.error ?? firstValidation ?? json.message ?? 'Error al procesar el pago'
            onErrorRef.current(msg)
            throw new Error(msg)
        }

        onResultadoRef.current(json as MpResultado)
    }, []) // deps vacías — siempre la misma referencia, valores frescos vía refs

    const onBrickError = useCallback((error: { type: string; message: string }) => {
        if (error.type === 'non_critical') return
        onErrorRef.current('Error al cargar el formulario de pago. Recarga la página.')
    }, [])

    return (
        <Payment
            initialization={initialization}
            customization={customization}
            onSubmit={onSubmit}
            onError={onBrickError}
        />
    )
}
