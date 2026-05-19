# EMAILS.md — Linkiu.io
Arquitectura de correos electrónicos. Define subdominios, direcciones y reglas de uso.
Ninguna dirección debe implementarse sin estar registrada aquí primero.

---

## Subdominios

| Subdominio | Propósito | Estado |
|-----------|-----------|--------|
| `accounts.linkiu.bio` | Correos transaccionales de cuenta (verificación, reset, invitaciones de equipo) | Por verificar en Resend |
| `notificaciones.linkiu.bio` | Alertas operativas (órdenes, envíos, pagos) | Por verificar en Resend |
| `marketing.linkiu.bio` | Campañas, triggered y recuperación de clientes | Por verificar en Resend |

> **Regla de oro:** Los subdominios transaccionales y de marketing NUNCA deben compartirse.
> Una baja reputación en marketing no debe contaminar la entrega de correos de cuenta.

---

## Direcciones por sección

### Cuenta (`accounts.linkiu.bio`)
| Dirección | Uso | Respuesta |
|-----------|-----|-----------|
| `no-reply@accounts.linkiu.bio` | Verificación de email, reset de password | No |
| `invitaciones@accounts.linkiu.bio` | Invitación de sub-usuarios al admin | No |

### Notificaciones (`notificaciones.linkiu.bio`)
| Dirección | Uso | Respuesta |
|-----------|-----|-----------|
| `ordenes@notificaciones.linkiu.bio` | Confirmación de orden, cambio de estado, guía de envío | No |

### Soporte
| Dirección | Uso | Respuesta | Plataforma |
|-----------|-----|-----------|------------|
| `soporte@linkiu.bio` | Recepción de respuestas del cliente final | Sí | Zoho (ya activo) |

> Los correos salientes que esperen respuesta llevan `reply-to: soporte@linkiu.bio`.
> No se necesita subdominio propio — el dominio principal en Zoho cubre esta función.

### Marketing (`marketing.linkiu.bio`)
| Dirección | Uso | Tipo | Respuesta |
|-----------|-----|------|-----------|
| `noticias@marketing.linkiu.bio` | Newsletter, promociones, lanzamientos | Campaña | No |
| `recuperar@marketing.linkiu.bio` | Carrito abandonado | Triggered | No |
| `vuelve@marketing.linkiu.bio` | Win-back — clientes inactivos por X días | Triggered | No |
| `gracias@marketing.linkiu.bio` | Post-compra — seguimiento y solicitud de reseña | Triggered | No |

---

## FROM_NAME (multi-tenant)

- **FROM_ADDRESS** — siempre fijo desde el subdominio correspondiente de Linkiu
- **FROM_NAME** — dinámico por merchant (ej: "SAVIA"), tomado de configuración de la tienda
- El módulo que expondrá esta configuración al merchant está **por definir**

> El cliente final verá: `"SAVIA <ordenes@notificaciones.linkiu.bio>"` sin necesidad de DNS custom.

---

## Configuración técnica (Laravel + Resend)

```env
RESEND_API_KEY=re_xxxxxxxxxxxx

# Default — correos de cuenta (plataforma)
MAIL_FROM_ADDRESS=no-reply@accounts.linkiu.bio
MAIL_FROM_NAME="Linkiu"
```

> Cada subdominio requiere SPF, DKIM y DMARC configurados en Resend antes del primer envío.

---

## Reglas generales

- Cada subdominio tiene un único propósito — nunca mezclar flujos entre ellos.
- Las direcciones `no-reply` no aceptan respuestas — usar `reply-to: soporte@linkiu.bio` cuando se espere respuesta del usuario.
- `soporte@linkiu.bio` (Zoho) es el único punto de entrada de respuestas — no envía campañas.
- Toda nueva dirección debe agregarse aquí antes de implementarse.
- El dominio principal `linkiu.bio` está en Zoho y no se usa para envío desde Resend.

Ver `notify-orders.md` para las plantillas de correo y WhatsApp de órdenes.
