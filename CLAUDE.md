# CLAUDE.md — Linkiu.io

Lee también: `AGENTS.md` (reglas del proyecto) y `DESIGN.md` (sistema de diseño). Ambos son obligatorios.

---

## Stack

- **Backend:** Laravel 13, PHP 8.3, Inertia.js
- **Frontend:** React 18, TypeScript, Vite 8, **Tailwind CSS v4** (`@tailwindcss/vite`)
- **DB:** SQLite (dev) / MySQL (prod)
- **UI:** Shadcn (instalación manual), Radix UI, Lucide React
- **Auth:** Laravel Sanctum + Fortify

## Flujo de trabajo obligatorio

```
#Debate → #Investigación → #Plan → #GO → #Push
```

- Sin `#Plan` previo no hay `#GO`
- Sin `#GO` no se toca código
- `#Push` sube a rama `apolo`

## Estructura React

```
resources/js/
├── Components/ui/       # Componentes shadcn
├── Components/admin/    # Componentes del panel admin
├── Components/clients/  # Dashboard cliente
├── Components/public/   # Landing / tienda
├── Pages/auth/
├── Pages/admin/         # 19 módulos planificados
├── Pages/clients/
├── Pages/public/
├── Layouts/
│   ├── AdminLayout.tsx
│   ├── ClientLayout.tsx
│   ├── PublicLayout.tsx   # Solo auth (login, register, etc.)
│   └── WebLayout.tsx      # Web pública (landing, tienda, producto)
└── lib/utils.ts         # cn()
```

- Carpetas: `lowercase` — Archivos: `PascalCase.tsx` (siempre `.tsx`, nunca `.jsx`)
- Componentes >100 líneas → dividir en `parts/`

## Tailwind v4 — notas importantes

- Sintaxis `*:` (hijos directos) y `not-last:` son válidas en este proyecto
- Para SVGs usar `[&>svg]:` en lugar de `*:[svg]:` (más confiable)
- `has-[>svg]:`, `group-has-[>svg]/nombre:` funcionan correctamente

## Componentes UI implementados

| Componente | Estado | Notas |
|---|---|---|
| `Alert` | ✅ Listo | Variantes: default, info, success, warning, destructive |
| `Accordion` | ✅ Listo | Single y multiple |
| Buttons, Inputs, Modal, Dropdown... | ✅ Base | Sin revisar aún |

## Convenciones de código

- Comentarios en **español**
- Solo **light mode** — no implementar dark mode
- Respetar **DESIGN.md** estrictamente — sin valores fuera de los definidos
- `font-bold` en títulos de alertas y componentes UI
- Colores en variantes: usar `-600` sobre fondos `-50` para contraste correcto
- Sin sombras en plataforma — solo bordes `border-slate-200`
- Transiciones: `transition-colors duration-200 ease-in-out`

## Página de preview de componentes

Ruta: `/components-preview` → `Pages/public/ComponentsPreview.tsx`

- Sin estilos hardcodeados en los previews — solo el componente en uso real
- Tabs generados desde array `tabs` para evitar duplicación
- Cada variante identificada con `<p className="text-sm">` como label

## Módulos planificados (sin implementar)

products, linkiuhooks, integrations, analytics (firemaps/scrollink/recordlink), orders, blogs, categories, linkiubuild, clients, coupons, webhooks, translations, profile, settings, roles
