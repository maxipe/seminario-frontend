# MiniMax — Frontend

Marketplace B2B de compras grupales. Pequeños retailers se unen para alcanzar volúmenes mínimos mayoristas y acceder a precios de fábrica.

## Tech Stack

| Capa | Tecnología |
|---|---|
| UI | React 19 |
| Tipado | TypeScript 6 |
| Bundler | Vite 8 |
| Estilos | Tailwind CSS v4 |
| Routing | React Router v6 |
| HTTP | Axios |
| Fuentes | Plus Jakarta Sans (display) · DM Sans (body) |

## Estructura del proyecto

```
src/
├── types/index.ts          # Tipos globales: Group, Supplier, UserCommitment, User
├── lib/
│   ├── apiClient.ts        # Instancia Axios con interceptors + USE_MOCKS
│   └── mocks/
│       ├── groups.mock.ts       # 6 grupos mock (distintos estados y categorías LATAM)
│       └── commitments.mock.ts  # 3 compromisos mock (confirmed/pending/cancelled)
├── hooks/
│   ├── useCountdown.ts     # Countdown hasta expiresAt, actualizado cada segundo
│   ├── useDebounce.ts      # Debounce genérico, 400 ms por defecto
│   └── usePageTitle.ts     # Setea document.title en formato "Página | MiniMax"
├── utils/
│   └── formatCurrency.ts   # formatCurrency · formatCurrencyWithDecimals — Intl.NumberFormat es-AR
├── components/
│   ├── ui/
│   │   ├── Button.tsx         # variant: primary|secondary|ghost · size: sm|md|lg
│   │   ├── Badge.tsx          # Pill semántico: open|urgent|confirmed|cancelled|default
│   │   ├── ProgressBar.tsx    # Color cambia a urgent ≥90%, confirmed ≥100%
│   │   ├── CountdownTimer.tsx # Usa useCountdown, formato DD:HH:MM:SS
│   │   ├── Card.tsx           # Wrapper con shadow, hoverable opcional
│   │   ├── Avatar.tsx         # Imagen o iniciales sobre bg brand-purple
│   │   ├── AvatarGroup.tsx    # Avatares superpuestos con contador +N
│   │   ├── Spinner.tsx        # SVG animado, size sm|md|lg, color brand-teal
│   │   ├── Input.tsx          # Input estilizado, soporte ícono izquierdo
│   │   ├── Select.tsx         # Select nativo estilizado con chevron custom
│   │   ├── Modal.tsx          # Modal accesible con portal, cierre por Escape/overlay
│   │   ├── ErrorState.tsx     # Estado de error con ícono, mensaje y retry opcional
│   │   └── EmptyState.tsx     # Estado vacío con ícono slot, título, acción
│   └── layout/
│       ├── Navbar.tsx       # Logo + links + CTA · mobile drawer
│       ├── Footer.tsx       # Fondo brand-purple, links institucionales
│       ├── PageWrapper.tsx  # Navbar + <main> + Footer
│       ├── ScrollToTop.tsx  # Scroll al top en cada cambio de ruta
│       └── CTASection.tsx   # Sección CTA reutilizable con título, subtítulo y botones
├── features/
│   ├── groups/
│   │   ├── types.ts                    # Re-exporta Group y Supplier desde src/types
│   │   ├── services.ts                 # getGroups(filters?) · getGroupById(id)
│   │   ├── hooks/
│   │   │   ├── useGroups.ts            # Hook: groups, loading, error, refetch
│   │   │   └── useGroupDetail.ts       # Hook: group|null, loading, error, notFound
│   │   └── components/
│   │       └── GroupCard.tsx           # Card de grupo con imagen, badge, precios, progreso, CTA
│   ├── auth/
│   │   ├── types.ts                    # LoginCredentials · RegisterData · AuthResponse
│   │   ├── services.ts                 # login() · register() · logout()
│   │   └── components/
│   │       ├── AuthModal.tsx           # Modal con tabs Login/Registro
│   │       └── ProtectedRoute.tsx      # Guard de rutas autenticadas
│   └── checkout/
│       ├── components/
│       │   └── JoinGroupModal.tsx      # Wizard 3 pasos: seleccionar cantidad · confirmar · éxito
│       └── hooks/
│           └── useUserCommitments.ts   # Hook: commitments enriquecidos con Group
├── context/
│   └── AuthContext.tsx                 # AuthProvider + useAuth() — persiste sesión en localStorage
├── pages/
│   ├── HomePage.tsx           # Landing completa: Hero · Cómo Funciona · Grupos · Testimonios · CTA
│   ├── ExplorePage.tsx        # Catálogo: búsqueda + filtros + grilla de GroupCards
│   ├── GroupDetailPage.tsx    # Página de decisión: two-column · sticky panel · CTA fijo mobile
│   ├── HowItWorksPage.tsx     # Guía explicativa: Hero · Pasos alternados · FAQ acordeón · CTA
│   ├── SuppliersPage.tsx      # Landing B2B para mayoristas: Hero · Beneficios · Timeline · Form
│   ├── MyAccountPage.tsx      # Perfil + Mis Compras Grupales + Resumen de Ahorro
│   └── NotFoundPage.tsx       # Página 404 standalone sin layout
└── router/index.tsx           # createBrowserRouter, layout route con PageWrapper
```

## Variables de entorno

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `VITE_API_BASE_URL` | URL base de la API REST del backend | `http://localhost:3000/api` |
| `VITE_USE_MOCKS` | Si es `true`, los servicios usan datos mock en lugar de llamadas HTTP | `true` |

Crear un archivo `.env.local` en la raíz con estas variables antes de correr el proyecto.

## Modo mock vs API real

El flag `VITE_USE_MOCKS=true` hace que todos los servicios devuelvan datos estáticos de `src/lib/mocks/` en lugar de llamar a la API. Los mocks simulan delays realistas para testear estados de carga.

Para conectar a la API real:
1. Setear `VITE_USE_MOCKS=false` en `.env.local`
2. Setear `VITE_API_BASE_URL` con la URL del backend
3. Verificar que los endpoints en `src/features/*/services.ts` coincidan con las rutas del backend

## Scripts

```bash
npm run dev      # Servidor de desarrollo con HMR
npm run build    # Build de producción (TypeScript + Vite)
npm run preview  # Preview del build de producción
npm run lint     # ESLint sobre todo el proyecto
```

## Convenciones

**Naming**
- Componentes: PascalCase (`GroupCard.tsx`)
- Hooks: camelCase con prefijo `use` (`useGroups.ts`)
- Servicios: camelCase (`services.ts` dentro de la feature)
- Tipos: PascalCase con sufijo descriptivo (`LoginCredentials`, `AuthResponse`)

**Estructura de features**
- Cada feature vive en `src/features/<nombre>/`
- Tiene sus propios `types.ts`, `services.ts`, `hooks/`, `components/`
- Solo se importa desde afuera a través del barrel de la feature (o directamente si es claro)

**Estilos**
- Tailwind CSS v4 con tokens custom en `@theme` de `index.css`
- Usar siempre los tokens de diseño (`brand-purple`, `brand-teal`, `surface`, `ink`) — no hardcodear colores
- `formatCurrency` de `src/utils/formatCurrency.ts` para todos los precios — nunca formatear manualmente

**Autenticación**
- `useAuth()` para acceder al estado de sesión en cualquier componente
- `ProtectedRoute` para proteger páginas que requieren sesión

## Próximos pasos (post-MVP)

- Integración de pagos real (MercadoPago / Stripe)
- Panel de proveedor con dashboard de pedidos
- Notificaciones en tiempo real (WebSocket o SSE)
- Query params en ExplorePage para compartir filtros por URL
- Tests unitarios de hooks y utils
- Paginación en ExplorePage para catálogos grandes
