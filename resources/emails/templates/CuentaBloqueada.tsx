import { Heading } from '@react-email/heading'
import { Text } from '@react-email/text'
import { Button } from '@react-email/button'
import BaseLayout from '../layouts/BaseLayout'

interface Props {
    nombre?: string
    bloqueadoHasta?: string
}

const e = {
    titulo:  { fontSize: '22px', fontWeight: '700', color: '#0F172B', margin: '0 0 12px 0', lineHeight: '1.3' },
    texto:   { fontSize: '16px', color: '#45556C', lineHeight: '1.6', margin: '0 0 16px 0' },
    tiempo:  { fontSize: '16px', color: '#45556C', lineHeight: '1.6', margin: '0 0 28px 0' },
    boton:   { backgroundColor: '#45556C', color: '#FFFFFF', borderRadius: '8px', padding: '12px 28px', fontSize: '15px', fontWeight: '600', textDecoration: 'none', display: 'inline-block' },
    nota:    { fontSize: '13px', color: '#90A1B9', lineHeight: '1.6', margin: '28px 0 0 0' },
}

export default function CuentaBloqueada({ nombre = 'María', bloqueadoHasta = '14/05/2026 15:30' }: Props) {
    return (
        <BaseLayout preview="Tu cuenta en Linkiu ha sido bloqueada temporalmente">
            <Heading style={e.titulo}>Cuenta bloqueada temporalmente</Heading>
            <Text style={e.texto}>
                Hola, {nombre}. Tu cuenta ha sido bloqueada por múltiples intentos fallidos de acceso.
            </Text>
            <Text style={e.tiempo}>
                Podrás intentar de nuevo a partir del <strong>{bloqueadoHasta}</strong>.
            </Text>
            <Button href="https://wa.me/573104594344" style={e.boton}>
                Contactar soporte
            </Button>
            <Text style={e.nota}>
                Si no fuiste tú quien intentó acceder, te recomendamos cambiar tu contraseña tan pronto como el bloqueo termine.
            </Text>
        </BaseLayout>
    )
}
