# DESIGN.md — Linkiu.io

Sistema de diseño basado en Tailwind CSS. Este documento define los únicos valores permitidos para mantener consistencia visual en toda la plataforma. El agente no debe usar valores fuera de los aquí definidos sin autorización explícita.

---

## Modo

- Solo **light mode**. No implementar dark mode hasta nueva indicación.

---

## Tipografía

### Fuentes

| Contexto | Fuente | Uso |
|----------|--------|-----|
| Web pública (landing, tienda) | `Plus Jakarta Sans` | Headings, marketing, CTAs |
| Plataforma / Dashboard | `Inter` | UI, labels, datos, formularios |

### Escala permitida

**Web (Plus Jakarta Sans)**

| Rol | Clase | Tamaño |
|-----|-------|--------|
| Hero / título máximo | `text-5xl` | 48px |
| Título de sección | `text-4xl` | 36px |
| Subtítulo | `text-3xl` | 30px |
| Texto destacado | `text-xl` | 20px |
| Body | `text-base` | 16px |
| Caption / legal (mínimo) | `text-sm` | 14px |

**Plataforma / Dashboard (Inter)**

| Rol | Clase | Tamaño |
|-----|-------|--------|
| Título de página (máximo) | `text-2xl` | 24px |
| Título de sección | `text-xl` | 20px |
| Subtítulo / card title | `text-lg` | 18px |
| Body estándar | `text-base` | 16px |
| Labels / secondary text | `text-sm` | 14px |
| Metadata / badges (mínimo) | `text-xs` | 12px |

### Excepciones tipográficas documentadas

Tamaños fuera de la escala estándar, autorizados solo en casos puntuales por necesidad funcional:

| Clase | Tamaño | Uso permitido |
|-------|--------|---------------|
| `text-[10px]` | 10px | Dígitos de countdown en `AnnouncementBar` (barra superior con timer compacto); timestamps, badges de plataforma y key/value de eventos en `PixelDebug` (overlay de debugging) |
| `text-[9px]`  | 9px  | Dígitos y separadores de countdown del strip "Oferta relámpago" en `ProductCard` y micro-labels del mismo strip ("Oferta Relámpago") |
| `text-[11px]` | 11px | Hints técnicos secundarios bajo inputs del admin de integraciones (Pixel ID, IDs externos, etc.) donde un `text-xs` competiría visualmente con el label principal |
| `text-2xl` | 24px | Título del producto (h1 en `Components/public/product/info`) **en móvil únicamente**. En `≥md` escala a `text-4xl` (36px). Compromiso autorizado por el devs entre `text-xl` (20px, queda chico para un título de producto) y `text-3xl` (30px, queda demasiado grande en pantallas pequeñas) |

**Regla:** estos tamaños son **excepción**, no patrón. Solo aplican en:
- Countdowns/timers visualmente compactos donde subir a `text-xs` rompería el layout
- Debug overlays / herramientas internas (PixelDebug) donde la densidad de info es la prioridad
- Hints técnicos del admin donde el contenido es de referencia, no de lectura primaria

Cualquier nuevo uso debe quedar documentado aquí.

### Pesos permitidos

- `font-normal` — body, descripciones
- `font-medium` — labels, subtítulos
- `font-semibold` — títulos, botones
- `font-bold` — headings principales, CTAs

---

## Breakpoints Responsive

| Breakpoint | Valor |
|------------|-------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |

---

## Paleta de Colores

### Roles semánticos

| Color | Rol |
|-------|-----|
| `slate` | Acciones primarias, UI principal |
| `gray` | Fondos secundarios, textos suaves |
| `red` | Errores, acciones destructivas |
| `emerald` | Éxito, confirmaciones |
| `blue` | Información, notificaciones |
| `amber` | Advertencias |
| `orange` | Advertencias fuertes, alertas críticas |

### Valores permitidos por color

**Slate — Primario**
- `slate-50` `#F8FAFC` — fondos muy suaves
- `slate-100` `#F1F5F9` — fondos secundarios
- `slate-200` `#E2E8F0` — bordes, divisores
- `slate-300` `#CBD5E2` — bordes activos, placeholders
- `slate-400` `#90A1B9` — texto deshabilitado
- `slate-500` `#62748E` — texto secundario
- `slate-600` `#45556C` — botón primario default
- `slate-700` `#314158` — texto primario
- `slate-800` `#1D293D` — botón active/pressed
- `slate-900` `#0F172B` — texto principal oscuro
- `slate-950` `#020618` — botón primario hover

**Gray — Fondos y textos suaves**
- `gray-50` `#F9FAFB` — fondo general de plataforma
- `gray-100` `#F3F4F6` — fondo de cards
- `gray-200` `#E5E7EB` — bordes suaves
- `gray-400` `#99A1AF` — texto placeholder
- `gray-500` `#6A7282` — texto secundario
- `gray-700` `#364153` — texto cuerpo

**Red — Errores y destructivos**
- `red-50` `#FEF2F2` — fondo de alerta error
- `red-100` `#FFE2E2` — badge error suave
- `red-300` `#FFA2A2` — texto error disabled
- `red-500` `#FB2C36` — botón destructivo default
- `red-700` `#C10007` — botón destructivo hover
- `red-800` `#9F0712` — botón destructivo active

**Emerald — Éxito**
- `emerald-50` `#ECFDF5` — fondo éxito
- `emerald-100` `#D0FAE5` — badge éxito suave
- `emerald-500` `#00BC7D` — ícono / texto éxito
- `emerald-600` `#009966` — badge éxito

**Blue — Información**
- `blue-50` `#EFF6FF` — fondo info
- `blue-100` `#DBEAFE` — badge info suave
- `blue-500` `#2B7FFF` — ícono / texto info
- `blue-600` `#155DFC` — badge info

**Amber — Advertencias**
- `amber-50` `#FFFBEB` — fondo advertencia
- `amber-100` `#FEF3C6` — badge advertencia suave
- `amber-500` `#FE9A00` — ícono / texto advertencia
- `amber-600` `#E17100` — badge advertencia

**Orange — Alertas críticas**
- `orange-50` `#FFF7ED` — fondo alerta crítica
- `orange-500` `#FF6900` — ícono / texto alerta
- `orange-600` `#F54900` — badge alerta crítica

### Excepción: logos oficiales de plataformas externas

Los logos de marcas externas (Meta, Google, MercadoPago, etc.) **conservan sus colores de marca oficiales** aunque estén fuera de la paleta del proyecto. Reconocibilidad > consistencia.

| Marca | Color | Componente |
|-------|-------|------------|
| Meta (Facebook) | `#1877F2` | `Components/icons/MetaLogo.tsx` |
| Google | `#4285F4` | `Components/icons/GoogleLogo.tsx` |

**Regla:** estos colores SOLO aparecen dentro de los componentes de logo de su marca correspondiente. No usar `#1877F2` o `#4285F4` para otros elementos del UI (botones, fondos, badges, etc.).

---

## Z-Index

| Elemento | Clase |
|----------|-------|
| Dropdowns | `z-50` |
| Modales | `z-50` |
| Tooltips | `z-50` |
| Navbar (si aplica) | `z-40` |

---

## Legibilidad y Contraste

Reglas obligatorias para texto sobre fondo:

| Fondo | Texto permitido |
|-------|----------------|
| `bg-white` / `bg-gray-50` | `text-slate-600`, `text-slate-950`, `text-gray-700` |
| `bg-gray-100` | `text-slate-700`, `text-slate-900` |
| `bg-slate-100` | `text-slate-700`, `text-slate-900` |
| `bg-slate-600` (botón) | `text-white` |
| `bg-slate-950` (botón hover) | `text-white` |
| `bg-red-50` | `text-red-700`, `text-red-800` |
| `bg-emerald-50` | `text-emerald-700` |
| `bg-blue-50` | `text-blue-700` |
| `bg-amber-50` | `text-amber-700` |
| `bg-orange-50` | `text-orange-700` |

**Prohibido:** usar `text-slate-400` o más claro sobre fondos `slate-100` o más claros. Siempre garantizar contraste legible.

---

## Componentes — Estados

### Botón Primario

| Estado | Clases |
|--------|--------|
| Default | `bg-slate-600 text-white` |
| Hover | `bg-slate-950 text-white` |
| Active | `bg-slate-800 text-white` |
| Disabled | `bg-slate-200 text-slate-400 cursor-not-allowed` |

### Botón Destructivo

| Estado | Clases |
|--------|--------|
| Default | `bg-red-500 text-white` |
| Hover | `bg-red-700 text-white` |
| Active | `bg-red-800 text-white` |
| Disabled | `bg-red-100 text-red-300 cursor-not-allowed` |

### Botón Secundario / Outline

| Estado | Clases |
|--------|--------|
| Default | `border border-slate-300 text-slate-600 bg-white` |
| Hover | `border-slate-950 text-slate-950 bg-slate-50` |
| Active | `border-slate-800 text-slate-800 bg-slate-100` |
| Disabled | `border-slate-200 text-slate-300 cursor-not-allowed` |

### Input / Textarea

| Estado | Clases |
|--------|--------|
| Default | `border border-slate-200 bg-white text-slate-700` |
| Focus | `border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300` |
| Error | `border-red-400 focus-visible:ring-red-200` |
| Disabled | `bg-gray-100 text-slate-400 cursor-not-allowed` |

### Select

| Estado | Clases |
|--------|--------|
| Default | `border border-slate-200 bg-white text-slate-700` |
| Focus | `border-slate-400 focus-visible:outline-none` |
| Error | `border-red-400` |
| Disabled | `bg-gray-100 text-slate-400 cursor-not-allowed` |

> **Regla de oro:** `ring` y `focus-visible:ring-*` son exclusivos de `Input` y `Textarea`. Los `Select` solo usan cambio de borde en focus — nunca ring.

---

## Bordes y Radios

| Elemento | Clase |
|----------|-------|
| Cards / Modales | `rounded-lg` |
| Inputs / Botones / Selects | `rounded-lg` |
| Badges / Tags / Pills | `rounded-full` |
| Tooltips / Dropdowns | `rounded-md` |
| Imágenes de producto | `rounded-lg` |

### Bordes estándar

| Uso | Clase |
|-----|-------|
| Borde estándar | `border border-slate-200` |
| Divisores | `divide-y divide-slate-100` |
| Separadores horizontales | `border-t border-slate-100` |

### Focus (accesibilidad discreta)

**Exclusivo de `Input` y `Textarea`:**
```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300
```
`ring` está **prohibido** en cualquier otro elemento (botones, selects, checkboxes, tabs, etc.).
Usar `focus-visible` — nunca `focus` solo — para que no aparezca al hacer clic con mouse.

---

## Espaciado

### Plataforma / Dashboard

| Rol | Clase | Valor |
|-----|-------|-------|
| Separación entre secciones (máximo) | `p-8` / `gap-8` | 32px |
| Padding de cards | `p-6` | 24px |
| Padding interno estándar | `p-4` | 16px |
| Gaps entre elementos | `gap-4` | 16px |
| Espacios tight (mínimo) | `p-1` / `gap-1` | 4px |

### Web pública

| Rol | Clase | Valor |
|-----|-------|-------|
| Separación entre secciones (máximo) | `py-24` | 96px |
| Padding de sección estándar | `py-16` | 64px |
| Padding de card / bloque | `p-8` | 32px |
| Spacing interno (mínimo) | `p-2` / `gap-2` | 8px |

---

## Sombras

- **Plataforma:** Sin sombras. Solo bordes (`border border-slate-200`) para definir profundidad.
- **Web pública:**
  - Cards destacadas: `shadow-md`
  - Modales / elementos flotantes: `shadow-lg`
  - CTAs hero: `shadow-lg`

---

## Iconografía

- Librería: **Lucide React** (ya incluida en Shadcn)
- Tamaños estándar:

| Uso | Clase |
|-----|-------|
| Ícono inline en texto | `w-4 h-4` |
| Ícono en botones / labels | `w-5 h-5` |
| Ícono de acción en tablas | `w-5 h-5` |
| Ícono decorativo / sección | `w-6 h-6` |
| Ícono hero / ilustrativo | `w-8 h-8` |

---

## Imágenes y Avatares

| Elemento | Clases |
|----------|--------|
| Avatar pequeño (tablas) | `w-8 h-8 rounded-full object-cover` |
| Avatar mediano (navbar) | `w-10 h-10 rounded-full object-cover` |
| Avatar grande (perfil) | `w-16 h-16 rounded-full object-cover` |
| Imagen producto (thumbnail) | `w-12 h-12 rounded-lg object-cover` |
| Imagen producto (card) | `w-full aspect-square rounded-lg object-cover` |
| Imagen producto (hero) | `w-full aspect-video rounded-lg object-cover` |

---

## Transiciones

Aplicar en todos los elementos interactivos (botones, links, inputs, iconos):

```
transition-colors duration-200 ease-in-out
```

Para elementos que cambian tamaño, posición o visibilidad:

```
transition-all duration-200 ease-in-out
```

**Regla:** Todas las transiciones deben ser suaves y rápidas. No usar `duration-500` o más — se siente lento.

---

## Reglas Generales

- El agente **no debe inventar** valores de color, tamaño o espaciado fuera de los definidos aquí.
- Si un caso de uso no está cubierto, debe **consultar antes de implementar**.
- Todos los componentes interactivos deben incluir estados: default, hover, active y disabled.
- La tipografía de web y plataforma **no se mezclan** — cada una en su contexto.
- Sin dark mode hasta nueva indicación.
- Sin sombras en plataforma hasta nueva indicación.