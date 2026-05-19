import { Heading } from '@react-email/heading'
import { Text } from '@react-email/text'
import { Button } from '@react-email/button'
import BaseLayout from '../layouts/BaseLayout'

interface Props {
    nombre?: string
    urlVerificacion?: string
}

const e = {
    titulo:    { fontSize: '22px', fontWeight: '700', color: '#0F172B', margin: '0 0 12px 0', lineHeight: '1.3' },
    texto:     { fontSize: '16px', color: '#45556C', lineHeight: '1.6', margin: '0 0 28px 0' },
    boton:     { backgroundColor: '#45556C', color: '#FFFFFF', borderRadius: '8px', padding: '12px 28px', fontSize: '15px', fontWeight: '600', textDecoration: 'none', display: 'inline-block' },
    nota:      { fontSize: '13px', color: '#90A1B9', lineHeight: '1.6', margin: '28px 0 0 0' },
}

export default function VerificarCuenta({ nombre = 'María', urlVerificacion = '#' }: Props) {
    return (
        <BaseLayout preview="Verifica tu correo electrónico para activar tu cuenta en Linkiu">
            <Heading style={e.titulo}>Verifica tu correo electrónico</Heading>
            <Text style={e.texto}>
                Hola, {nombre}. Para activar tu cuenta en Linkiu haz clic en el botón a continuación.
            </Text>
            <Button href={urlVerificacion} style={e.boton}>
                Verificar correo
            </Button>
            <Text style={e.nota}>
                Este enlace expira en 48 horas. Si no creaste esta cuenta, puedes ignorar este mensaje.
            </Text>
        </BaseLayout>
    )
}
