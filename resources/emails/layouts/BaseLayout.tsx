import { Html } from '@react-email/html'
import { Head } from '@react-email/head'
import { Body } from '@react-email/body'
import { Container } from '@react-email/container'
import { Section } from '@react-email/section'
import { Row } from '@react-email/row'
import { Column } from '@react-email/column'
import { Img } from '@react-email/img'
import { Text } from '@react-email/text'
import { Hr } from '@react-email/hr'
import { Link } from '@react-email/link'
import { Preview } from '@react-email/preview'

const BASE_URL    = 'https://linkiu.bio'
const ASSETS_URL  = `${BASE_URL}/assets/email_resources`
const WA_LINK     = 'https://wa.me/573104594344'

const REDES = [
    { nombre: 'Facebook',  icono: 'icon_facebook.png',  href: 'https://www.facebook.com/linkiu.bio' },
    { nombre: 'X',         icono: 'icon_x.png',         href: 'https://x.com/Linkiubio' },
    { nombre: 'LinkedIn',  icono: 'icon_linkeind.png',  href: 'https://www.linkedin.com/company/linkiu-bio' },
    { nombre: 'Instagram', icono: 'icon_instagram.png', href: 'https://www.instagram.com/linkiu.bio/' },
    { nombre: 'YouTube',   icono: 'icon_youtube.png',   href: 'https://www.youtube.com/@Linkiubio' },
    { nombre: 'WhatsApp',  icono: 'icon_whatsapp.png',  href: WA_LINK },
]

interface Props {
    children: React.ReactNode
    preview?: string
}

const e = {
    body: {
        backgroundColor: '#F9FAFB',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
        margin: '0',
        padding: '32px 0',
    },
    container: {
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
    },
    header: {
        padding: '20px 32px',
        borderBottom: '1px solid #E2E8F0',
        textAlign: 'center' as const,
    },
    content: {
        padding: '40px 32px',
    },
    footer: {
        padding: '28px 24px 24px',
        textAlign: 'center' as const,
    },
    redesTitulo: {
        fontSize: '13px',
        color: '#62748E',
        margin: '0 0 14px 0',
        textAlign: 'center' as const,
    },
    poweredBy: {
        fontSize: '12px',
        color: '#90A1B9',
        margin: '0',
        textAlign: 'center' as const,
        lineHeight: '1.8',
    },
    disclaimer: {
        fontSize: '11px',
        color: '#90A1B9',
        margin: '0',
        textAlign: 'center' as const,
        lineHeight: '1.7',
    },
    legalLinks: {
        fontSize: '12px',
        color: '#90A1B9',
        margin: '0',
        textAlign: 'center' as const,
    },
    link: {
        color: '#62748E',
        textDecoration: 'none',
        fontSize: '12px',
    },
    disclaimerLink: {
        color: '#90A1B9',
        textDecoration: 'underline',
        fontSize: '11px',
    },
    sep: {
        color: '#CBD5E2',
        margin: '0 6px',
    },
    hr: {
        borderColor: '#E2E8F0',
        margin: '20px 0',
    },
    copyright: {
        fontSize: '11px',
        color: '#CBD5E2',
        margin: '14px 0 0 0',
        textAlign: 'center' as const,
        lineHeight: '1.6',
    },
}

export default function BaseLayout({ children, preview }: Props) {
    return (
        <Html lang="es">
            <Head />
            {preview && <Preview>{preview}</Preview>}
            <Body style={e.body}>
                <Container style={e.container}>

                    {/* ── Header ── */}
                    <Section style={e.header}>
                        <Link href={BASE_URL}>
                            <Img
                                src={`${ASSETS_URL}/logotipo_Linkiu.png`}
                                alt="Linkiu"
                                height={30}
                                style={{ margin: '0 auto' }}
                            />
                        </Link>
                    </Section>

                    {/* ── Contenido dinámico ── */}
                    <Section style={e.content}>
                        {children}
                    </Section>

                    {/* ── Footer ── */}
                    <Section style={e.footer}>

                        <Hr style={e.hr} />

                        {/* Redes sociales */}
                        <Text style={e.redesTitulo}>
                            ¿Ya nos sigues en redes? ¡Siempre tenemos cosas nuevas!
                        </Text>
                        <Row>
                            <Column align="center">
                                {REDES.map(({ nombre, icono, href }) => (
                                    <Link key={nombre} href={href} style={{ display: 'inline-block', margin: '0 6px' }}>
                                        <Img
                                            src={`${ASSETS_URL}/${icono}`}
                                            alt={nombre}
                                            width={24}
                                            height={24}
                                        />
                                    </Link>
                                ))}
                            </Column>
                        </Row>

                        <Hr style={e.hr} />

                        {/* Powered by */}
                        <Text style={e.poweredBy}>
                            Powered by:
                            <br />
                            <span style={{ color: '#62748E', fontWeight: '600' }}>Linkiu</span>
                            <span style={e.sep}>·</span>
                            <span style={{ color: '#62748E' }}>Linkiu.bio</span>
                            <span style={e.sep}>·</span>
                            <span style={{ color: '#62748E' }}>Linkiu.io</span>
                        </Text>

                        <Hr style={e.hr} />

                        {/* Disclaimer legal */}
                        <Text style={e.disclaimer}>
                            No respondas este mensaje. Esta dirección no acepta correos entrantes,
                            por lo que no recibirás respuesta. Como parte de nuestro servicio,
                            enviamos este correo con información esencial relacionada con tu cuenta,
                            compra, reserva o suscripción. En Linkiu respetamos y protegemos
                            tu privacidad de acuerdo con nuestra{' '}
                            <Link href="https://linkiu.bio/politics-privacy" style={e.disclaimerLink}>
                                Política de privacidad
                            </Link>
                            . Si tienes preguntas, escríbenos por nuestra{' '}
                            <Link href={WA_LINK} style={e.disclaimerLink}>
                                línea de WhatsApp
                            </Link>
                            .
                        </Text>

                        {/* Links legales */}
                        <Text style={{ ...e.legalLinks, marginTop: '14px' }}>
                            <Link href="https://linkiu.bio/terms" style={e.link}>Terms</Link>
                            <span style={e.sep}>·</span>
                            <Link href="https://linkiu.bio/politics-privacy" style={e.link}>Privacy</Link>
                            <span style={e.sep}>·</span>
                            <Link href="https://linkiu.bio/cookies" style={e.link}>Cookies</Link>
                            <span style={e.sep}>·</span>
                            <Link href="mailto:soporte@linkiu.bio" style={e.link}>Soporte</Link>
                        </Text>

                        {/* Copyright */}
                        <Text style={e.copyright}>
                            ©2026 Desde Magangué para el mundo — Hecho con el ❤️
                            <br />
                            Recibes este correo porque contiene información importante
                            relacionada con tu actividad en Linkiu.
                        </Text>

                    </Section>

                </Container>
            </Body>
        </Html>
    )
}
