# notify-orders.md — Plantillas de notificación de órdenes

Textos y estructura de todos los correos y mensajes de WhatsApp relacionados con el ciclo de vida de una orden.

---

## Estándar visual de correos (Blade)

Todas las plantillas extienden `resources/views/emails/layouts/base.blade.php`.

| Elemento | Estilo inline |
|---|---|
| H1 | `font-size:22px; font-weight:700; color:#0F172B; margin:0 0 12px 0` |
| Texto cuerpo | `font-size:16px; color:#45556C; line-height:1.6` |
| Texto secundario | `font-size:13px; color:#90A1B9; line-height:1.6` |
| Botón CTA | `background-color:#45556C; color:#FFFFFF; border-radius:8px; padding:12px 28px; font-size:15px; font-weight:600` |
| Bloque destacado | `background-color:#F1F5F9; border-radius:12px; padding:24px; text-align:center` |
| Valor monospace grande | `font-size:22px; font-weight:800; color:#0F172B; letter-spacing:4px; font-family:monospace` |

---

## Correos

### 1. `orden-confirmada` — Al crear la orden

- **Archivo:** `resources/views/emails/orden-confirmada.blade.php`
- **Clase:** `App\Mail\OrdenConfirmadaMail`
- **Asunto:** `Pedido recibido #LNK-XXXXX`
- **From:** `no-reply@linkiu.bio`
- **Variables Blade:** `$orden` (con `items` cargados), `$urlSeguimiento`

```
¡Recibimos tu pedido, {nombre}!

Código: LNK-XXXXX
"Te notificaremos cada vez que haya un cambio en tu pedido."

[Tabla de items]
  Producto · label          x2    $89.900
  ─────────────────────────────────────────
  Subtotal                        $89.900
  Envío                           $10.000   ← solo si costo_envio > 0
  Recargo contraentrega           $5.000    ← solo si recargo > 0
  Total                           $104.900

[Botón] Ver estado de mi pedido

Entrega en: Medellín, Antioquia
Calle 80 # 45-12 · Apto 301
```

---

### 2. `orden-estado-cambiado` — Al cambiar estado desde el admin

- **Archivo:** `resources/views/emails/orden-estado-cambiado.blade.php`
- **Clase:** `App\Mail\OrdenEstadoCambiadoMail`
- **From:** `no-reply@linkiu.bio`
- **Variables Blade:** `$orden`, `$urlSeguimiento`

**Asuntos y mensajes por estado:**

| Estado | Asunto | H1 | Mensaje cuerpo |
|---|---|---|---|
| `confirmado` | `¡Tu pedido fue confirmado! #LNK-XXXXX` | ¡Tu pedido fue confirmado! | Hemos confirmado tu pedido y pronto comenzaremos a prepararlo. |
| `preparando` | `Estamos preparando tu pedido #LNK-XXXXX` | Estamos preparando tu pedido | Tu pedido está siendo alistado con mucho cuidado. |
| `enviado` | `Tu pedido va en camino #LNK-XXXXX` | Tu pedido va en camino | Tu pedido fue despachado y está en camino hacia ti. |
| `entregado` | `¡Tu pedido fue entregado! #LNK-XXXXX` | ¡Tu pedido fue entregado! | Tu pedido llegó a su destino. ¡Esperamos que lo disfrutes! |
| `cancelado` | `Tu pedido fue cancelado #LNK-XXXXX` | Tu pedido fue cancelado | Tu pedido ha sido cancelado. Si tienes alguna duda, escríbenos. |

**Bloque especial — estado `enviado` con número de guía:**
```
┌─────────────────────────────┐
│ Número de guía              │
│                             │
│   1 2 3 4 5 6 7 8 9 0       │  ← monospace, letra grande
│                             │
│ Usa este número para        │
│ rastrear tu envío con la    │
│ transportadora.             │
└─────────────────────────────┘
```
Solo se muestra si `$orden->numero_guia` tiene valor.

**Cierre común a todos los estados:**
```
[Botón] Ver estado de mi pedido

"Si tienes preguntas, escríbenos por nuestra línea de WhatsApp."
```

---

## WhatsApp (SendPulse / Meta Business API)

### Nomenclatura de plantillas

- Solo `lowercase`, números y guiones bajos — sin mayúsculas, espacios ni caracteres especiales
- Máximo 512 caracteres
- Un nombre eliminado no se puede reusar por 30 días
- **Usar inglés aunque el contenido sea en español** — los revisores de Meta suelen ser angloparlantes y un nombre descriptivo en inglés (ej: `order_received`) acelera la aprobación

---

### Reglas críticas — investigadas contra la documentación oficial de Meta

**Errores que causan rechazo inmediato:**

| Error | Ejemplo incorrecto | Correcto |
|---|---|---|
| Carácter especial pegado a variable | `${{3}}` | `{{3}} COP` o incluir `$` dentro del valor |
| Variable al inicio sin texto antes | `{{1}}, recibimos…` | `Hola {{1}}, recibimos…` |
| Variable al final sin texto después | `…aquí: {{4}}` | Terminar con texto fijo después de la URL |
| Saltar numeración | `{{1}}, {{3}}` sin `{{2}}` | Siempre secuencial |
| URLs acortadas | `bit.ly/xxx` | URL completa del dominio real |
| Lenguaje promocional en UTILITY | "¡Aprovecha!", "descuento" | Texto informativo/transaccional |
| Idioma `es_CO` no reconocido | `es_CO` | Usar `es` (español genérico) |

> **URL en el body:** Se incluye como variable `{{n}}` con la URL completa del dominio real. Meta la acepta siempre que no sea acortada y el dominio sea verificable. La variable **no puede ser la última línea** — debe ir seguida de texto fijo.

**Estructura válida de una plantilla:**
```
[HEADER]  — texto fijo opcional, máx 60 chars, SIN variables
[BODY]    — texto del mensaje, máx 1024 chars, CON variables {{n}}
[FOOTER]  — texto fijo opcional, máx 60 chars, SIN variables
[BUTTON]  — opcional, no requerido cuando la URL va en el body
```

---

### Plantilla 1 — `order_received_v1`
**Categoría:** UTILITY | **Idioma:** es | **Prioridad:** Alta | **Estado:** ✅ Aprobada

```
HEADER (texto): Pedido recibido

BODY:
Hola {{1}}, recibimos tu pedido *{{2}}* por un valor de {{3}} COP.

Pronto comenzaremos a prepararlo. Sigue el estado aquí:
{{4}}

¿Tienes preguntas? Comunícate con la tienda al {{5}} para cualquier consulta.

FOOTER: Tu tienda · Powered by Linkiu
```

| Variable | Valor |
|---|---|
| `{{1}}` | Nombre del cliente |
| `{{2}}` | Código (LNK-XXXXX) |
| `{{3}}` | Total formateado — incluir el `$` dentro del valor (ej: `$89.900`) |
| `{{4}}` | URL completa (ej: `https://tienda.com/orden/LNK-12345`) |
| `{{5}}` | Número de WhatsApp del negocio (ej: `+57 300 123 4567`) |

---

### Plantilla 2 — `order_confirmed`
**Categoría:** UTILITY | **Idioma:** es | **Estado:** ✅ Aprobada

```
HEADER (texto): Pedido confirmado

BODY:
Hola {{1}}, tu pedido *{{2}}* fue confirmado. Estamos listos para comenzar a prepararlo.

Sigue el estado aquí:
{{3}}

¿Tienes preguntas? Comunícate con la tienda al {{4}} para cualquier consulta.

FOOTER: Tu tienda · Powered by Linkiu
```

| Variable | Valor |
|---|---|
| `{{1}}` | Nombre | `{{2}}` | Código | `{{3}}` | URL completa | `{{4}}` | WhatsApp del negocio |

---

### Plantilla 3 — `order_preparing`
**Categoría:** UTILITY | **Idioma:** es | **Estado:** ✅ Aprobada

```
HEADER (texto): Pedido en preparación

BODY:
Hola {{1}}, tu pedido *{{2}}* está siendo preparado. En cuanto esté listo para envío, te avisamos.

Sigue el estado aquí:
{{3}}

¿Tienes preguntas? Comunícate con la tienda al {{4}} para cualquier consulta.

FOOTER: Tu tienda · Powered by Linkiu
```

| Variable | Valor |
|---|---|
| `{{1}}` | Nombre | `{{2}}` | Código | `{{3}}` | URL completa | `{{4}}` | WhatsApp del negocio |

---

### Plantilla 4a — `order_shipped` _(con número de guía)_
**Categoría:** UTILITY | **Idioma:** es | **Prioridad:** Alta | **Estado:** ✅ Aprobada

```
HEADER (texto): Pedido despachado

BODY:
Hola {{1}}, tu pedido *{{2}}* fue despachado hacia {{3}}.

Número de guía: *{{4}}*
Transportadora: {{5}}

Sigue el estado aquí:
{{6}}

¿Tienes preguntas? Comunícate con la tienda al {{7}} para cualquier consulta.

FOOTER: Tu tienda · Powered by Linkiu
```

| Variable | Valor |
|---|---|
| `{{1}}` | Nombre |
| `{{2}}` | Código |
| `{{3}}` | Ciudad de entrega |
| `{{4}}` | Número de guía |
| `{{5}}` | Nombre de la transportadora (ej: `Servientrega`) |
| `{{6}}` | URL completa |
| `{{7}}` | WhatsApp del negocio |

---

### Plantilla 4b — `order_shipped_no_tracking` _(sin número de guía)_
**Categoría:** UTILITY | **Idioma:** es | **Prioridad:** Alta | **Estado:** ✅ Aprobada

```
HEADER (texto): Pedido despachado

BODY:
Hola {{1}}, tu pedido *{{2}}* fue despachado hacia {{3}}.

El número de guía estará disponible pronto. Sigue el estado aquí:
{{4}}

¿Tienes preguntas? Comunícate con la tienda al {{5}} para cualquier consulta.

FOOTER: Tu tienda · Powered by Linkiu
```

| Variable | Valor |
|---|---|
| `{{1}}` | Nombre | `{{2}}` | Código | `{{3}}` | Ciudad | `{{4}}` | URL completa | `{{5}}` | WhatsApp del negocio |

---

### Plantilla 5 — `order_delivered`
**Categoría:** UTILITY | **Idioma:** es | **Estado:** ✅ Aprobada

```
HEADER (texto): Pedido entregado

BODY:
Hola {{1}}, tu pedido *{{2}}* fue entregado exitosamente.

¿Tienes alguna novedad? Comunícate con la tienda al {{3}} para cualquier consulta.

FOOTER: Tu tienda · Powered by Linkiu
```

| Variable | Valor |
|---|---|
| `{{1}}` | Nombre | `{{2}}` | Código | `{{3}}` | WhatsApp del negocio |

---

### Plantilla 6 — `order_cancelled`
**Categoría:** UTILITY | **Idioma:** es | **Estado:** ✅ Aprobada

```
HEADER (texto): Pedido cancelado

BODY:
Hola {{1}}, tu pedido *{{2}}* fue cancelado.

¿Tienes preguntas? Comunícate con la tienda al {{3}} para cualquier consulta.

FOOTER: Tu tienda · Powered by Linkiu
```

| Variable | Valor |
|---|---|
| `{{1}}` | Nombre | `{{2}}` | Código | `{{3}}` | WhatsApp del negocio |

---

## Notas de implementación

- Registrar plantillas en **SendPulse → WhatsApp Business → Plantillas** antes del primer uso.
- Meta puede tardar entre 1h y 24h en aprobar. Registrar con anticipación.
- **Prioridad de registro:** `orden_recibida` → `orden_enviada` / `orden_enviada_sin_guia` → resto.
- Reemplazar `[dominio]` en los botones con la URL real de la tienda al registrar.
- El `SendPulseService` actual usa mensajes de texto libre (`type: text`) — solo funciona dentro de una **ventana de conversación activa** (24h desde el último mensaje del cliente).
- Para notificaciones proactivas se deben usar las plantillas aprobadas (`type: template`). Actualizar `SendPulseService` cuando estén aprobadas.
- El campo `numero_guia` se guarda en `orders.numero_guia`. Se ingresa desde el admin al cambiar el estado a "enviado".
