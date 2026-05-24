# Lineamientos del Proyecto - Linkiu.io

## Propósito

Linkiu.io es una plataforma para emprendedores de dropshipping y ecommerce que ofrece control total del cliente, desde que llega a la tienda a través de una campaña publicitaria. Permite montar productos, personalizar cada página, y proporciona herramientas de análisis para optimizar la experiencia del usuario.

### Módulos

**Dashboard:** Panel de control principal con métricas y actividad reciente.

**Productos:** Montar productos con nombre, precio, descripciones, imágenes, precios rebajados, variables y más. Incluye selección de LinkiuHooks por producto.

**LinkiuHooks:** Hooks creativos con tipos fijos definidos en el sistema (no configurables por el admin). Se activan y personalizan dentro de la pantalla de creación/edición de cada producto.

**Categorías:** Crear, ver, editar y eliminar categorías a las que se asocian los productos.

**Órdenes:** Central de pedidos — ver, cambiar estados, búsqueda, filtros, exportar. Notificaciones al cliente por WhatsApp o correo.

**Clientes:** Listado de clientes registrados y no registrados, datos, pedidos realizados, segmentación e historial completo.

**Cupones:** Descuentos con límite de uso, restricción por cliente y validez por fecha.

**LinkiuBuild:** Personalización del sitio web — home, secciones, colores, logos, menú. El logo del panel admin también se configura aquí.

**Webhooks:** Notificaciones de eventos externos a otros sistemas.

**Blogs:** Crear y gestionar publicaciones tipo blog para enriquecer el sitio web.

**Roles y permisos:** Crear, ver, editar y eliminar roles y usuarios del panel admin.

**Analytics:** Herramientas de análisis de comportamiento del usuario (menú expandible en sidebar).
- **Firemaps:** Overlay de calor que muestra dónde hacen clic los usuarios en las páginas.
- **Scrollink:** Tracking de hasta dónde llega la gente en cada página.
- **RecordLink:** Grabaciones de sesiones para entender el comportamiento del usuario.

**Integraciones:** Conexiones con servicios externos (menú expandible en sidebar).
- MercadoPago, Meta ADS, Google Analytics, Wompi, IA API.

**Traducciones:** Soporte para múltiples idiomas según el mercado.

## Ramas

- **`apolo`**: Rama principal/producción. Todo el desarrollo se hace en local y se prueba ahí antes de subir.

## Flujo de Trabajo

1. **Debate e investigación:** Se debate una idea presentada por el dev. Se investiga para encontrar la mejor opción a nivel de seguridad, optimización, accesibilidad y flujo.

2. **Plan:** Se presenta un plan de trabajo acorde al debate o investigación final acordado, sin cambiar nada del mismo.

3. **Desarrollo local:** Una vez recibido el GO por parte del devs, se desarrolla en local y se verifican los cambios ahí.

4. **Subir a producción:** Cuando el devs lo indique, se sube a `apolo`.

## Reglas de Código

- **Siempre respetar DESIGN.md** — Ningún componente, color, tamaño, espaciado o estilo puede implementarse fuera de lo definido ahí. Si hay duda, consultar antes de implementar.
- **Buscar siempre lo mejor para el proyecto** — En seguridad, fiabilidad y estabilidad. Si existe una opción superior (librería, patrón, práctica), proponerla aunque implique esfuerzo adicional.
- **Todo módulo nuevo debe registrar sus permisos** — Cada vez que se agrega un módulo al proyecto, se deben definir sus acciones en `config/permissions.php` y correr el `PermissionsSeeder`. Sin esto, el módulo no aparece en la matriz de roles y los accesos quedan sin control.
- **Control de visibilidad por permisos** — Todo módulo debe respetar estas reglas:
  - **Sin permiso `ver`:** El ítem del sidebar se oculta completamente. Si el usuario accede por URL directa, el backend lanza `abort(403)` → renderiza `resources/views/errors/403.blade.php`.
  - **Sin permiso `crear` / `editar` / `eliminar`:** El botón correspondiente se muestra **disabled** con Tooltip `"No tienes permiso para [acción]"`. Nunca ocultar — el usuario debe saber que existe y poder pedirle acceso al admin.
  - **Super-admin:** Bypasa todos los permisos vía `Gate::before` en `AppServiceProvider`. En el frontend recibe `auth.permissions = ['*']`.
  - **Implementación al crear un módulo nuevo:**
    1. Registrar permisos en `config/permissions.php` y correr `php artisan db:seed --class=PermissionsSeeder`
    2. Agregar `permiso: '[modulo].ver'` al ítem en el NAV de `sidebar/index.tsx`
    3. Proteger rutas con `->middleware('can:[modulo].[accion]')` en `routes/admin.php`
    4. En la página, usar `usePage().props.auth.permissions` para deshabilitar botones de acción
- **No crear componentes nuevos sin antes verificar** — Antes de crear cualquier componente, revisar si ya existe en `Components/ui/` o si alguna variante del existente cubre el caso. Consultar `ComponentsPreview.tsx` para ver todas las variantes disponibles. Nunca deformar un componente existente añadiéndole variantes para un uso puntual — si una variante nueva aplica globalmente, agregarla correctamente al componente; si es un uso único, resolverlo con `className`.
- **Usar siempre componentes UI para elementos de formulario** — Todo `<input>`, `<button>`, `<textarea>` o `<select>` debe ser reemplazado por `Input`, `Button`, `Textarea` o `Select` de `@/Components/ui/`. Excepciones permitidas: `type="color"` nativo oculto (picker), `type="file"` oculto, y botones de icono ultra-compactos en tablas que ya siguen el patrón establecido en el resto de módulos. Nunca escribir `className="h-9 rounded-md bg-slate-900 px-4..."` en un botón cuando `<Button>` ya tiene ese estilo.
- **`ring` solo en Input y Textarea** — `focus-visible:ring-*` está prohibido en cualquier otro elemento (`Select`, botones, cards, etc.). Los `Select` usan únicamente cambio de borde en focus (`border-slate-400`), sin ring.
- **Tooltips — nunca usar `title=""`** — El atributo `title` nativo está prohibido. Siempre usar el componente `Tooltip` / `TooltipContent` de `@/Components/ui/Tooltip`. Si el elemento ya está dentro de un `<TooltipProvider>`, solo hace falta envolver con `<Tooltip>` + `<TooltipTrigger>` + `<TooltipContent>`.
- **Toast obligatorio en toda acción CRU/D** — Toda operación de crear, actualizar o eliminar debe mostrar un toast de confirmación visual al usuario. Reglas específicas:
  - **Patrón flash (navegación Inertia):** El backend envía `back()->with('status', '...')` y el frontend lo captura con `useEffect(() => { if (props.flash?.status) toast.success(props.flash.status) }, [props.flash?.status])`. Usar para `post()`/`put()` en modales y formularios que navegan.
  - **Patrón directo (sin navegación):** `router.delete/post` con `preserveScroll: true` debe tener `onSuccess: () => toast.success(...)` y `onError: () => toast.error(...)` explícitos en el callback — no depender del flash.
  - **`onError` siempre obligatorio** — Todo `router.*`, `useForm.post/put/delete` y `axios.*` debe tener `onError: () => toast.error('...')`. Los errores de validación se muestran inline pero los errores de red/servidor deben surfacear con toast.
  - **No mezclar mecanismos en la misma acción** — Si una página usa flash para crear/editar (vía modal), y `router.delete` con `preserveScroll` para eliminar, el delete NO debe tener `onSuccess: toast.success` porque el flash del backend ya dispararía el `useEffect` → doble toast. Usar un solo mecanismo por acción.
- **Confirmación antes de acciones destructivas** — Toda acción de eliminar (o cualquier acción irreversible) debe mostrar un `AlertDialog` de confirmación antes de ejecutarse. Nunca ejecutar un `DELETE` directo al hacer clic. Reglas de implementación:
  - Usar `AlertDialog` de `@/Components/ui/AlertDialog`
  - `<AlertDialogContent size="sm">` — siempre con `size="sm"`
  - `<AlertDialogAction variant="destructive">` — nunca con `className` de color hardcodeado
  - El estado del dialog se maneja con `useState<Entidad | null>(null)` — el propio objeto, no solo el ID, para poder mostrar el nombre en la descripción
- **Permisos — patrón estándar en páginas index** — Toda página index debe tener la función helper `puede()` que lee `props.auth.permissions`. Todo botón deshabilitado (por falta de permiso O por límite del sistema) debe tener un `<Tooltip>` explicando el motivo. Nunca ocultar un botón — siempre mostrar disabled + tooltip.
- **Patrón canonical de Index admin** — Toda página `Pages/admin/[modulo]/Index.tsx` debe seguir esta estructura para garantizar consistencia visual entre módulos:
  - **Header del módulo:** icono cuadrado `w-9 h-9 rounded-lg bg-slate-100` con icono del módulo `w-4 h-4 text-slate-600`, al lado `h1.text-lg.font-bold.text-slate-900` + subtitle `text-xs text-slate-500` con un stat informativo (ej. "N en total"). A la derecha: search (si aplica) + export (si aplica) + botón principal `<Button size="sm">`.
  - **Filtros (opcional):** tabs underline con `border-b border-slate-200` + tab activa `border-b-2 border-slate-900 text-slate-900` + inactiva `border-transparent text-slate-500 hover:text-slate-700`.
  - **Tabla:** usar componentes `<Table>` / `<TableHeader>` / `<TableBody>` / `<TableRow>` / `<TableHead>` / `<TableCell>` de `@/Components/ui/Table` — **prohibido `<table>` HTML crudo**. Wrapper externo `bg-white border border-slate-200 rounded-xl overflow-hidden`.
  - **Empty state:** usar componentes `<Empty>` con `className="border border-dashed border-slate-200 bg-white"` + `<EmptyHeader>` + `<EmptyMedia variant="icon">` + `<EmptyTitle>` + `<EmptyDescription>` + opcional `<EmptyContent>` con CTA. Importar de `@/Components/ui/Empty`.
  - **Paginación:** usar `<Pagination>` / `<PaginationContent>` / `<PaginationItem>` / `<PaginationEllipsis>` de `@/Components/ui/Pagination`. Patrón: prev (ghost icon) + números (`variant="outline"` cuando activa, `"ghost"` cuando no) + next. Truncar con `<PaginationEllipsis>` si hay más de 7 páginas, mostrando: `[1, ..., current-1, current, current+1, ..., last]`.
  - **Iconos de acción en celdas:** `<button className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-200">` con `size-3.5` para el icono. Para acción destructiva: `hover:bg-red-50 hover:text-red-600`.
  - **Row clickeable (opcional):** agregar `cursor-pointer` y `onClick` que navega a edit/show. Las celdas con interacción interna (modales, tooltips activos) deben tener `onClick={e => e.stopPropagation()}`.
  - **Referencia viva:** `Pages/admin/ordenes/Index.tsx` y `Pages/admin/clientes/Index.tsx` son la referencia canonical más completa. `Pages/admin/categorias/Index.tsx`, `Pages/admin/blog/Index.tsx` y `Pages/admin/productos/Index.tsx` son ejemplos del patrón aplicado.
- **Storage: dos buckets S3** — El proyecto usa dos buckets separados:
  - `linkiu-assets`: recursos estáticos de Linkiu (imágenes de correos, logos del sistema). Público. La URL base se configura con `LINKIU_ASSETS_URL` en el `.env`. No varía entre instalaciones.
  - `linkiu-clients`: archivos subidos por clientes (imágenes de productos, logos, hero, banners, blog, comprobantes de pago, etc.). Se configura con `AWS_BUCKET=linkiu-clients` y `AWS_ROOT=[nombre-cliente]` para aislar cada instalación en su propia carpeta.
  - **Bucket policy del cliente — híbrido**: la carpeta del cliente (`linkiu-clients/{AWS_ROOT}/*`) es **pública para lectura** (sirve assets visibles en la tienda: logos, productos, hero, banners, carrusel, categorías, blog, quienes-somos, contacto). La subcarpeta `ordenes/*` queda **denegada explícitamente** porque guarda comprobantes de pago de clientes (datos sensibles). Acceso a comprobantes solo vía signed URL (`Storage::disk('s3')->temporaryUrl()`) desde el admin.
  - **Bucket policy ejemplo** (reemplazar `{AWS_ROOT}` por el valor configurado):
    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        { "Effect": "Allow", "Principal": "*", "Action": "s3:GetObject",
          "Resource": "arn:aws:s3:::linkiu-clients/{AWS_ROOT}/*" },
        { "Effect": "Deny",  "Principal": "*", "Action": "s3:GetObject",
          "Resource": "arn:aws:s3:::linkiu-clients/{AWS_ROOT}/ordenes/*" }
      ]
    }
    ```
  - **Si una imagen se ve rota en el admin/tienda**: primer sospechoso es la policy del bucket — verificar que la carpeta donde se subió la imagen esté incluida en el Allow. Los componentes con `<img src={url} onError={...}>` esconden 403 silenciosamente, generando la sensación de "no se guarda" cuando en realidad sí se guarda en BD.
  - En las plantillas Blade de correo usar `{{ env('LINKIU_ASSETS_URL') }}` para los recursos del bucket `linkiu-assets`. Si hay cache de config activo, correr `php artisan config:clear`.
  - **Regla general de dónde va cada asset:** Si el archivo lo consume un servidor externo (correo, webhook, integración de terceros) → S3. Si lo consume el navegador del usuario a través de la propia app → `public/`. Nunca poner en S3 assets de error pages ni recursos del sistema que deban funcionar aunque S3 esté caído.
- **Queue: `sync` en dev, `database` con worker en prod** — Toda Action que despacha jobs (notificaciones, emails, WhatsApp, Ably push, etc.) usa `dispatch()`. El `QUEUE_CONNECTION` define qué pasa con esos jobs:
  - **Dev local (`.env`):** `QUEUE_CONNECTION=sync` — los jobs corren inmediato bloqueando el response. Sin worker. Si dejás `database` en dev sin levantar `php artisan queue:work`, los jobs se acumulan en la tabla `jobs` y nunca se ejecutan (síntomas: emails no llegan, real-time Ably no actualiza, WhatsApp no se dispara, notif al admin no llega — todos a la vez).
  - **Producción (`.env.production` en Forge):** `QUEUE_CONNECTION=database` + worker registrado en Forge → Site → Queue Workers (`php artisan queue:work --tries=3 --timeout=90`). Sin el worker, prod queda con el mismo problema que dev.
  - Si una notificación "no llega" y el resto funciona, ANTES de tocar el código del job verificar dos cosas: 1) `SELECT COUNT(*) FROM jobs` (¿hay jobs acumulados?), 2) ¿está corriendo el worker?
- **Componentes shadcn/Radix — `forwardRef` obligatorio en wrappers de primitives** — Todo wrapper de un primitive de Radix UI (Overlay, Content, Trigger, Item, Thumb, Indicator, ScrollUpButton, etc.) debe usar `React.forwardRef`. Radix UI pasa refs internamente para focus management, positioning y portales — en React 18, function components sin forwardRef pierden el ref y disparan el warning `Function components cannot be given refs` + bugs sutiles de UX (focus trap roto, tooltips mal posicionados). Patrón canonical en `Components/ui/Dialog.tsx:32` (DialogOverlay). Wrappers que solo renderan `<div>`, `<li>`, `<ul>`, `<thead>` (HTML nativo) NO necesitan forwardRef.
- Comentarios en español
- Nombres descriptivos en español
- Seguir convenciones del lenguaje/framework utilizado

### Convenciones Git

- Ramas: `feature/nombre`, `fix/nombre`, `hotfix/nombre`
- Commits descriptivos, en español o inglés consistente

### Seguridad

- Nunca hardcodear secrets en el código
- Usar variables de entorno
- Validar inputs en frontend y backend
- Prohibido borrar o limpiar la base de datos sin autorización del devs

### Frontend (React)

- Usar ESLint + Prettier
- Componentes en PascalCase
- Funciones descriptivas en camelCase (inglés)

### Backend (Laravel)

- Usar Pest/PHPUnit para tests
- Migraciones para cambios de BD
- Policy gates para autorización
- **`Inertia::render` — casing exacto** — El path pasado a `Inertia::render()` debe coincidir exactamente con la estructura de carpetas en `resources/js/Pages/`, que usa **lowercase**. Ejemplo correcto: `Inertia::render('auth/Login')`. Incorrecto: `'Auth/Login'`. En Windows el sistema de archivos es case-insensitive pero Vite resuelve los glob con el casing exacto registrado.

### API REST

- Endpoints en plural (ej: `/orders`, `/products`)
- Usar métodos HTTP correctos (GET, POST, PUT, DELETE)
- Respuestas consistentes con códigos de estado

### Manejo de Errores

- No mostrar errores técnicos al usuario
- Loguear errores con contexto (user_id, request_id)
- Usar exception handler global en Laravel

### Estructura de Proyecto

- Mantener lógica de negocio fuera de controllers — usar **Actions**
- Separar concerns (requests, resources, policies)
- Una Action = una operación (crear, actualizar, eliminar, etc.)
- Controllers solo orquestan: validan request → llaman Action → retornan respuesta

### Commits

- Usar conventional commits (feat:, fix:, chore:, docs:)
- Commits atómicos (un cambio por commit)

### General

- SOLID principles donde sea práctico
- DRY (Don't Repeat Yourself)
- Documentar decisiones técnicas

### Code Review

- El que desarrolla no fusiona su propio código a apolo
- Revisar el código antes de subir a apolo

## Estructura de Carpetas (React)

### resources/js/components/

```
components/
├── ui/                          # Componentes shadcn (buttons, inputs, dialogs, etc.)
├── admin/                       # Componentes del panel admin
│   ├── sidebar/
│   │   ├── index.tsx
│   │   └── parts/
│   └── [modulo]/               # Cada módulo sigue este patrón
│       ├── index.tsx
│       └── parts/
├── public/                      # Componentes públicos (landing, tienda)
└── clients/                     # Componentes del dashboard del cliente final
```

### resources/js/Pages/

```
Pages/
├── auth/                        # Login, Register, ForgotPassword, etc.
├── Dashboard.tsx
├── admin/                       # Módulos del admin
│   ├── products/
│   │   ├── index.tsx
│   │   └── parts/
│   ├── linkiuhooks/
│   │   ├── index.tsx
│   │   └── parts/
│   ├── integrations/
│   ├── analytics/               # User Analytics
│   │   ├── firemaps/
│   │   ├── scrollink/
│   │   └── recordlink/
│   ├── orders/
│   ├── blogs/
│   ├── categories/
│   ├── linkiubuild/
│   ├── clients/
│   ├── coupons/
│   ├── webhooks/
│   ├── translations/
│   ├── profile/
│   ├── settings/
│   └── roles/
├── clients/                     # Dashboard cliente final
└── public/                      # Tienda pública
```

### resources/js/layouts/

```
layouts/
├── AdminLayout.tsx              # Layout para dashboard admin
├── ClientLayout.tsx             # Layout para dashboard cliente final
├── PublicLayout.tsx             # Layout para páginas de autenticación (login, register, etc.)
└── WebLayout.tsx                # Layout para web pública (landing, tienda, producto)
```

### Reglas de componentes

- Carpetas en **lowercase** (ej: `linkiuhooks/`, `firemaps/`)
- Archivos de componentes en **PascalCase** (ej: `index.tsx`, `ProductCard.tsx`)
- Componentes grandes van en subcarpeta con `index.tsx` + `parts/`
- `parts/` contiene partes pequeñas del componente
- Si un componente tiene más de 100 líneas, considerar dividirlo en parts
- shadcn se instala manualmente cuando el devs lo indique
- **Todos los archivos React deben usar extensión `.tsx`** — No usar `.jsx` en ningún archivo del proyecto.

## Estructura de Carpetas (Laravel)

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Admin/               # Un controller por módulo
│   │   └── Client/
│   ├── Requests/
│   │   └── [Modulo]/            # StoreProductRequest, UpdateProductRequest, etc.
│   └── Resources/
│       └── [Modulo]/            # ProductResource, ProductCollection, etc.
├── Actions/
│   └── [Modulo]/                # Una clase por operación
│       ├── Create[Modulo].php
│       ├── Update[Modulo].php
│       └── Delete[Modulo].php
├── Models/
└── Policies/                    # Una Policy por modelo
```

### Reglas de Actions

- Nombre en formato `Verbo + Modelo` — ej: `CreateProduct`, `UpdateOrder`
- Reciben datos ya validados (nunca la Request directamente)
- Sin dependencia del contexto HTTP — reutilizables desde jobs, comandos, webhooks
- Métodos: `handle()` o `execute()` como entry point

### Plantilla para solicitar una función

Usar esta estructura en cada `#GO` que implique lógica backend:

```
#GO — [Nombre de la función]

Módulo: products / orders / clients / etc.
Acción: Crear / Leer / Actualizar / Eliminar / Otra

¿Qué hace?
[Descripción en 1-2 líneas]

Datos de entrada:
- campo: tipo — descripción

Datos de salida:
- campos visibles al frontend

Reglas de negocio:
- validaciones, restricciones, condiciones especiales

¿Quién puede hacerlo?
- admin / cliente / público / todos
```

---

## Tipos de Requerimiento

Cada mensaje debe llevar un prefijo para identificar el tipo de acción requerida:

- **#Debate:** Solo debatir un tema, sin actuar sobre el código
- **#Investigación:** Investigar y dar respuesta que beneficie al proyecto (seguridad, optimización, accesibilidad)
- **#Plan:** Presentar un plan de trabajo detallado con base a lo debatido o investigado. Obligatorio antes de un GO.
- **#GO:** Palabra que permite actuar e intervenir en el código
- **#Push:** Subir cambios a `apolo`
- **#Question:** Solo preguntar sobre un tema, sin actuar
- **#Errors:** Error o bug encontrado. Alta prioridad. Debe incluirse: descripción detallada, ruta o fragmento del código afectado. El agente diagnostica y propone solución, pero no toca código sin un #GO posterior.
- **#Rollback:** Revertir el último cambio subido a `apolo`. El agente indica los pasos pero no ejecuta sin confirmación explícita.
- **#Review:** Auditar código existente. El agente analiza y reporta hallazgos pero no modifica nada.

## Tecnologías

- **Backend:** Laravel + Inertia
- **Frontend:** React + Shadcn
- **Base de datos:** MySQL
- **Caché/Colas:** Redis
- **Autenticación:** Laravel Sanctum + Fortify
- **Tiempo real:** Ably
- **WhatsApp:** Infobip
- **Email:** Resend
- **Storage:** Amazon S3
- **Monitoreo de errores:** Sentry
- **Despliegue:** Laravel Forge + DigitalOcean

## Contacto

Para dudas o sugerencias, contactar al equipo de desarrollo.