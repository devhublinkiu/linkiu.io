import { Heading } from '@react-email/heading'
import { Text } from '@react-email/text'
import { Button } from '@react-email/button'
import BaseLayout from '../layouts/BaseLayout'

interface Props {
    nombre?: string
    urlDashboard?: string
}

const e = {
    titulo:   { fontSize: '22px', fontWeight: '700', color: '#0F172B', margin: '0 0 12px 0', lineHeight: '1.3' },
    texto:    { fontSize: '16px', color: '#45556C', lineHeight: '1.6', margin: '0 0 28px 0' },
    boton:    { backgroundColor: '#45556C', color: '#FFFFFF', borderRadius: '8px', padding: '12px 28px', fontSize: '15px', fontWeight: '600', textDecoration: 'none', display: 'inline-block' },
    nota:     { fontSize: '13px', color: '#90A1B9', lineHeight: '1.6', margin: '28px 0 0 0' },
}

export default function BienvenidoEquipo({ nombre = 'Carlos', urlDashboard = '#' }: Props) {
    return (
        <BaseLayout preview="¡Bienvenido al equipo de Linkiu! Tu cuenta está activa">
            <Heading style={e.titulo}>¡Bienvenido al equipo, {nombre}!</Heading>
            <Text style={e.texto}>
                Tu cuenta en Linkiu ha sido activada exitosamente. Ya puedes acceder al panel de administración
                y comenzar a trabajar.
            </Text>
            <Button href={urlDashboard} style={e.boton}>
                Ir al panel de administración
            </Button>
            <Text style={e.nota}>
                Si tienes preguntas, escríbenos por nuestra{' '}
                <a href="https://wa.me/573104594344" style={{ color: '#45556C' }}>línea de WhatsApp</a>.
            </Text>
        </BaseLayout>
    )
}
