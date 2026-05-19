import { Heading } from '@react-email/heading'
import { Text } from '@react-email/text'
import { Button } from '@react-email/button'
import BaseLayout from '../layouts/BaseLayout'

interface Props {
    nombre?: string
}

const e = {
    titulo:  { fontSize: '22px', fontWeight: '700', color: '#0F172B', margin: '0 0 12px 0', lineHeight: '1.3' },
    texto:   { fontSize: '16px', color: '#45556C', lineHeight: '1.6', margin: '0 0 28px 0' },
    alerta:  { fontSize: '14px', color: '#45556C', lineHeight: '1.6', margin: '0 0 28px 0' },
    boton:   { backgroundColor: '#45556C', color: '#FFFFFF', borderRadius: '8px', padding: '12px 28px', fontSize: '15px', fontWeight: '600', textDecoration: 'none', display: 'inline-block' },
}

export default function ContrasenaActualizada({ nombre = 'María' }: Props) {
    return (
        <BaseLayout preview="Tu contraseña de Linkiu ha sido actualizada correctamente">
            <Heading style={e.titulo}>Tu contraseña fue actualizada</Heading>
            <Text style={e.texto}>
                Hola, {nombre}. Tu contraseña en Linkiu ha sido cambiada exitosamente.
            </Text>
            <Text style={e.alerta}>
                Si no realizaste este cambio, contacta a nuestro equipo de soporte de inmediato.
            </Text>
            <Button href="https://wa.me/573104594344" style={e.boton}>
                Contactar soporte
            </Button>
        </BaseLayout>
    )
}
