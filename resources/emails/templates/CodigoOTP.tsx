import { Heading } from '@react-email/heading'
import { Text } from '@react-email/text'
import { Section } from '@react-email/section'
import BaseLayout from '../layouts/BaseLayout'

interface Props {
    nombre?: string
    codigo?: string
}

const e = {
    titulo:     { fontSize: '22px', fontWeight: '700', color: '#0F172B', margin: '0 0 12px 0', lineHeight: '1.3' },
    texto:      { fontSize: '16px', color: '#45556C', lineHeight: '1.6', margin: '0 0 28px 0' },
    codigoCaja: { backgroundColor: '#F1F5F9', borderRadius: '12px', padding: '24px', textAlign: 'center' as const, margin: '0 0 28px 0' },
    codigoNum:  { fontSize: '40px', fontWeight: '800', color: '#0F172B', letterSpacing: '10px', margin: '0', fontFamily: 'monospace' },
    expira:     { fontSize: '13px', color: '#90A1B9', margin: '8px 0 0 0', textAlign: 'center' as const },
    nota:       { fontSize: '13px', color: '#90A1B9', lineHeight: '1.6', margin: '0' },
}

export default function CodigoOTP({ nombre = 'María', codigo = '123456' }: Props) {
    return (
        <BaseLayout preview={`Tu código de verificación es: ${codigo}`}>
            <Heading style={e.titulo}>Tu código de verificación</Heading>
            <Text style={e.texto}>
                Hola, {nombre}. Usa el siguiente código para restablecer tu contraseña.
            </Text>
            <Section style={e.codigoCaja}>
                <Text style={e.codigoNum}>{codigo}</Text>
                <Text style={e.expira}>Expira en 10 minutos</Text>
            </Section>
            <Text style={e.nota}>
                Si no solicitaste este código, alguien puede estar intentando acceder a tu cuenta.
                Escríbenos por nuestra{' '}
                <a href="https://wa.me/573104594344" style={{ color: '#45556C' }}>línea de WhatsApp</a>.
            </Text>
        </BaseLayout>
    )
}
