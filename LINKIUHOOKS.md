# LINKIUHOOKS.md — Catálogo de Hooks

Los LinkiuHooks son elementos que acompañan a un producto en su vista individual o general.
Cada hook puede ser **simple** (solo activar/desactivar) o **configurable** (requiere datos al activarse).

---

## Reseñas en vivo

**Tipo:** Simple
**Configuración necesaria:** Ninguna — el contador de reseñas es animado y el rating se genera dinámicamente.
**Integración:** Ninguna por ahora. A futuro puede conectarse a plataformas externas de reseñas (Trustpilot, Google Reviews, etc.).

---

## Qué incluye

**Tipo:** Configurable
**Configuración necesaria:** Título de la sección + lista de ítems (ícono Lucide + texto). Máximo 8 ítems.
**Integración:** Ninguna.

---

## Urgencia de stock

**Tipo:** Simple — barra animada de stock con countdown regresivo. Pantalla de urgencia psicológica, no inventario real.
**Configuración necesaria:** Ninguna.
**Integración:** Ninguna.

---

## Sellos de confianza

**Tipo:** Configurable
**Configuración necesaria:** Lista de sellos (ícono Lucide + título + subtítulo). Máximo 3 sellos.
**Integración:** Ninguna.

---

## Gancho de promesa

**Tipo:** Configurable
**Configuración necesaria:** Texto del dolor (cita), titular de la promesa, descripción corta, hasta 3 stats (ícono Lucide + valor + subtítulo).
**Integración:** Ninguna.

---

## Slider de imágenes

**Tipo:** Configurable
**Configuración necesaria:** Lista de imágenes subidas independientemente (no usa la galería del producto). Sin caption ni color de fondo.
**Integración:** Ninguna.

---

## Tabla comparativa

**Tipo:** Configurable
**Configuración necesaria:** Título + subtítulo, nombre de columna producto + nombre de columna rival, filas con ícono Lucide + característica + valor producto + valor rival (cada valor puede ser texto o booleano ✓/✗). Máximo 6 filas.
**Integración:** Ninguna.

---

## Comparación visual

**Tipo:** Configurable
**Configuración necesaria:** Título + subtítulo, imagen "Antes" (upload S3), imagen "Después" (upload S3). La interacción del handle es dinámica.
**Integración:** Ninguna.

---

## Ficha técnica

**Tipo:** Configurable
**Configuración necesaria:** Título + subtítulo, componentes principales (nombre + descripción, máx. 6), libre de / no contiene (lista de textos/chips, máx. 6).
**Integración:** Ninguna.

---

## Características destacadas

**Tipo:** Configurable
**Configuración necesaria:** Título + subtítulo, cards con ícono Lucide + nombre + descripción + tags (máx. 3 por card) + color de paleta predefinida (emerald, amber, blue, rose, violet, slate). Máximo 4 cards.
**Integración:** Ninguna.

---

## Cómo funciona

**Tipo:** Configurable
**Configuración necesaria:** Título + subtítulo, pasos con ícono Lucide + título + descripción + nota (badge) + color de paleta predefinida. Máximo 4 pasos.
**Integración:** Ninguna.

---

## Reseñas de clientes

**Tipo:** Configurable
**Configuración necesaria:** Título, reseñas con nombre + ciudad + estrellas (1–5) + texto. Máximo 15 reseñas. Rating promedio, distribución y total se calculan automáticamente. Color del avatar se asigna en ciclo automáticamente.
**Integración:** Fase 1 manual. Fase 2 (futuro): integración con módulo de órdenes para reseñas reales de clientes.

---

## Garantía

**Tipo:** Configurable
**Configuración necesaria:** Título, descripción, texto del botón.
**Integración:** Ninguna.

---

## Preguntas frecuentes

**Tipo:** Configurable
**Configuración necesaria:** Título, preguntas con pregunta + respuesta. Máximo 10 preguntas.
**Integración:** Ninguna.

---

## Oferta relámpago

**Tipo:** Simple — strip naranja con countdown dinámico en la card del producto. Solo activar/desactivar.
**Configuración necesaria:** Ninguna.
**Integración:** Ninguna.

---

## Badge de producto

**Tipo:** Configurable
**Configuración necesaria:** Texto del badge (ej. "Más vendido", "Nuevo", "Más popular").
**Integración:** Ninguna.

---

## Ratings en card

**Tipo:** Simple — muestra estrellas y conteo tomados automáticamente del hook "Reseñas de clientes". Si no hay reseñas configuradas, no se muestra.
**Configuración necesaria:** Ninguna.
**Integración:** Depende del hook "Reseñas de clientes".

---

## Galería de resultados

**Tipo:** Configurable
**Configuración necesaria:** Lista de imágenes en formato 9:16 (1080×1920) — screenshots de chats, resultados reales, testimonios visuales. Cada imagen puede tener nombre y ciudad opcionales. Frame de teléfono como overlay opcional por imagen.
**Vista:** Individual — columna de info del producto.
**Integración:** Imágenes subidas a **Cloudinary**. Auto-convierte a WebP y optimiza en entrega. Free tier: 25GB storage + 25GB bandwidth/mes.
**Estado:** Implementado. Pendiente: integrar upload real desde el modal (actualmente acepta URL manual).

---

## Video demostración

**Tipo:** Configurable
**Configuración necesaria:** URL de embed del video (YouTube, Vimeo, Bunny Stream o Cloudflare Stream). El admin pega la URL, el componente hace el embed. Título y descripción opcionales.
**Vista:** Individual — sección de detalle del producto.
**Integración:** **Bunny Stream** como servicio principal de hosting de video (streaming HLS adaptativo, bajo costo). **Cloudflare Stream** como alternativa si ya se usa el ecosistema CF. YouTube/Vimeo como fallback. No se maneja upload en el admin — solo URL de embed.
**Estado:** Pendiente de implementar.

---

## Sincronización de imágenes del producto

**Tipo:** Tarea de infraestructura (no es un hook).
**Descripción:** Actualmente `Product.tsx` tiene el array `TONOS` hardcodeado con rutas de imágenes estáticas y el nombre del producto fijo. Se debe refactorizar para que las imágenes del producto (galería, imagen principal, variantes de tono/color) vengan del backend como parte de los props de la página, sincronizadas con lo que el admin configura.
**Alcance:** `routes/web.php` → pasar imágenes desde DB. `Product.tsx` → eliminar `TONOS` hardcodeado. `Gallery` e `Info` → recibir tonos/variantes dinámicamente.
**Estado:** Pendiente. Bloquea que la galería de resultados pueda usar imágenes del producto como referencia.

---

## GIFs / Video loop

**Tipo:** Configurable
**Configuración necesaria:** URL de video corto (.mp4 o .webm) para autoplay muted loop — mismo efecto visual que GIF pero 10× más liviano. Título y descripción opcionales.
**Vista:** Individual — sección de detalle del producto.
**Integración:** Archivos alojados en **Cloudflare R2** (egress gratis, S3-compatible) o **Bunny CDN** ($0.01/GB). Cloudinary como alternativa si ya se usa para imágenes (auto-convierte GIF a WebP animado en entrega).
**Nota técnica:** Nunca servir GIF directo. Siempre MP4/WebM en `<video autoPlay muted loop playsInline>`.
**Estado:** Pendiente de implementar.

---
