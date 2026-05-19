import { Heading } from '@react-email/heading'
import { Text } from '@react-email/text'
import { Button } from '@react-email/button'
import BaseLayout from '../layouts/BaseLayout'

interface Props {
    nombre?: string
    urlInvitacion?: string
}

const e = {
    titulo:  { fontSize: '22px', fontWeight: '700', color: '#0F172B', margin: '0 0 12px 0', lineHeight: '1.3' },
    texto:   { fontSize: '16px', color: '#45556C', lineHeight: '1.6', margin: '0 0 28px 0' },
    boton:   { backgroundColor: '#45556C', color: '#FFFFFF', borderRadius: '8px', padding: '12px 28px', fontSize: '15px', fontWeight: '600', textDecoration: 'none', display: 'inline-block' },
    nota:    { fontSize: '13px', color: '#90A1B9', lineHeight: '1.6', margin: '28px 0 0 0' },
}

export default function InvitacionUsuario({ nombre = 'Carlos', urlInvitacion = '#' }: Props) {
    return (
        <BaseLayout preview="Has sido invitado a formar parte del equipo en Linkiu">
            <Heading style={e.titulo}>Te han invitado a Linkiu</Heading>
            <Text style={e.texto}>
                Hola, {nombre}. Has sido invitado a unirte al equipo de administración en Linkiu.
                Haz clic en el botón para activar tu cuenta y establecer tu contraseña.
            </Text>
            <Button href={urlInvitacion} style={e.boton}>
                Activar mi cuenta
            </Button>
            <Text style={e.nota}>
                Este enlace expira en 48 horas. Si no esperabas esta invitación, puedes ignorar este mensaje.
            </Text>
        </BaseLayout>
    )
}
