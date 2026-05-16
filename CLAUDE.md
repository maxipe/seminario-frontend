## Documentation Rules

These rules apply to every task — documentation is not optional and is not done "at the end".

- **CLAUDE.md updates**: After every relevant change (new component, new service function, new hook, new type, new page, new utility), update the corresponding section in CLAUDE.md to reflect what was added and why.
- **File-level comments**: Every new file must have a JSDoc/TSDoc comment at the top explaining what it does, what domain concept it represents, and any important decisions made.
- **Function comments**: Every non-obvious function must have a TSDoc comment with `@param` and `@returns`.
- **ADRs**: If an architectural decision is made (why we chose X over Y), add it to `docs/adr/` as a short ADR file.
- **CONTEXT.md**: Must stay up to date with any new domain terms introduced.
- **TODOs**: Never leave a TODO without a comment explaining what needs to be done and why it was deferred.

## Project: MiniMax

Marketplace B2B de compras grupales. Pequeños retailers se unen para alcanzar volúmenes mínimos mayoristas y acceder a precios de fábrica.

**Stack**: React 19 + TypeScript 6 + Vite 8 + Tailwind CSS v4 + React Router v6 + Axios.

**Fuentes**: Plus Jakarta Sans (display) · DM Sans (body) — importadas desde Google Fonts en `src/index.css`.

**Variables de entorno**: `VITE_API_BASE_URL`, `VITE_USE_MOCKS`. Ver `.env.example`.

**Persistencia**: Todo vive en localStorage (sin backend). La capa `src/lib/localStorage.ts` es el único punto de acceso — nunca llamar a `localStorage` directamente desde servicios o componentes. `initializeStorage()` en `main.tsx` siembra los grupos mock si el storage está vacío.

---

## Estructura del proyecto

```
src/
├── types/index.ts          # Tipos globales: UserRole · Group (+ supplierEmail) · UserCommitment (+ id/userEmail/createdAt/cancellationReason) · User (+ role/password/companyName/createdAt)
├── lib/
│   ├── apiClient.ts        # Instancia Axios con interceptors (legacy, ya no usada por auth ni groups)
│   ├── localStorage.ts     # ÚNICA capa de acceso a localStorage: getUsers/saveUser/findUserByEmail · getCurrentUser/setCurrentUser/clearCurrentUser · getCommitments/saveCommitment/updateCommitment · getGroups/saveGroup/updateGroup/findGroupById · initializeStorage()
│   └── mocks/
│       ├── groups.mock.ts       # 6 grupos mock — sembrados por initializeStorage() si el storage está vacío
│       └── commitments.mock.ts  # Legacy, ya no se usa en producción
├── hooks/
│   ├── useCountdown.ts     # Countdown hasta expiresAt, actualizado cada segundo
│   ├── useDebounce.ts      # Debounce genérico, 400 ms por defecto — evita llamadas en cada tecla
│   ├── usePageTitle.ts     # Setea document.title: "Página | MiniMax" — usar en todas las páginas
│   └── useToast.ts         # Toast temporal: showToast(message, type) · se cierra automáticamente en 3s
├── utils/
│   └── formatCurrency.ts   # formatCurrency · formatCurrencyWithDecimals — Intl.NumberFormat es-AR, usar SIEMPRE para precios
├── components/
│   ├── ui/
│   │   ├── Button.tsx         # variant: primary|secondary|ghost · size: sm|md|lg · loading spinner
│   │   ├── Badge.tsx          # Pill semántico: open|urgent|confirmed|cancelled|default
│   │   ├── ProgressBar.tsx    # Color cambia a urgent ≥90%, confirmed ≥100%
│   │   ├── CountdownTimer.tsx # Usa useCountdown, formato DD:HH:MM:SS
│   │   ├── Card.tsx           # Wrapper con shadow, hoverable opcional
│   │   ├── Avatar.tsx         # Imagen o iniciales sobre bg brand-purple
│   │   ├── AvatarGroup.tsx    # Avatares superpuestos con contador +N
│   │   ├── Spinner.tsx        # SVG animado, size sm|md|lg, color brand-teal
│   │   ├── Input.tsx          # Input estilizado, soporte ícono izquierdo, focus ring brand-teal
│   │   ├── Select.tsx         # Select nativo estilizado con chevron custom, sin dependencias externas
│   │   ├── Modal.tsx          # Modal accesible con portal, cierre por Escape/overlay, animación fade+scale
│   │   ├── Toast.tsx          # Notificación temporal fixed bottom-right, tipo success|error|info
│   │   ├── Dropdown.tsx       # Dropdown accesible: trigger + children + align · cierre por click-afuera/Escape · exports DropdownItem + DropdownDivider
│   │   ├── ErrorState.tsx     # Estado de error reutilizable: ícono, título, mensaje, retry opcional
│   │   └── EmptyState.tsx     # Estado vacío reutilizable: ícono slot, título, descripción, acción
│   └── layout/
│       ├── Navbar.tsx       # Tres configuraciones por rol: Invitado (links públicos + auth) · Buyer (Explorar/CómoFunciona/MisCompras + avatar dropdown) · Supplier (Dashboard/Explorar/CómoFunciona + avatar dropdown) — mobile drawer replica los mismos links
│       ├── BuyerRoute.tsx   # Guard solo-buyer: spinner → AuthModal si no auth → Navigate /proveedor/dashboard si supplier → children
│       ├── SupplierRoute.tsx# Guard solo-supplier: spinner → AuthModal si no auth → Navigate /mi-cuenta si buyer → children
│       ├── Footer.tsx       # Fondo brand-purple, links institucionales
│       ├── PageWrapper.tsx  # Navbar + <main> + Footer
│       ├── ScrollToTop.tsx  # Scroll al top en cada cambio de ruta — incluido en el Layout del router
│       └── CTASection.tsx   # Sección CTA reutilizable: title, subtitle, primaryHref, secondaryHref
├── features/
│   ├── groups/
│   │   ├── types.ts                    # Re-exporta Group y Supplier desde src/types (feature autocontenida)
│   │   ├── services.ts                 # getGroups(filters?) · getGroupById(id) — lee de localStorage
│   │   ├── hooks/
│   │   │   ├── useGroups.ts            # Hook: groups, loading, error, refetch — re-fetches cuando cambian los filtros
│   │   │   └── useGroupDetail.ts       # Hook: group|null, loading, error, notFound — diferencia 404 de error genérico
│   │   └── components/
│   │       └── GroupCard.tsx           # Card de grupo: imagen, badge de categoría, precios, progreso, CTA
│   ├── auth/
│   │   ├── types.ts                    # LoginCredentials · RegisterData (+ role/companyName) · AuthResponse
│   │   ├── services.ts                 # login() · register() · logout() — opera sobre localStorage, delays artificiales
│   │   └── components/
│   │       ├── AuthModal.tsx           # Modal con tabs Login/Registro · selector de rol Comprador/Proveedor con cards · validaciones por campo
│   │       └── ProtectedRoute.tsx      # Guard: spinner si isLoading, AuthModal si no autenticado, redirige a / al cerrar
│   └── checkout/
│       ├── services.ts                 # joinGroup(userEmail, groupId, quantity) — persiste commitment, actualiza grupo, confirma si alcanza mínimo · cancelCommitment(id) — cancela pending, devuelve unidades al grupo
│       ├── components/
│       │   └── JoinGroupModal.tsx      # Wizard 3 pasos: seleccionar cantidad · confirmar (llama joinGroup real) · éxito
│       └── hooks/
│           └── useUserCommitments.ts   # Hook: commitments del usuario autenticado enriquecidos con Group, lee de localStorage · cancelCommitment(id) + cancelling state para loading por item
├── context/
│   └── AuthContext.tsx                 # AuthProvider + useAuth() — restaura sesión vía getCurrentUser() al montar
├── pages/
│   ├── HomePage.tsx              # Landing completa: Hero · Cómo Funciona · Grupos · Testimonios · CTASection
│   ├── ExplorePage.tsx           # Catálogo principal: búsqueda + filtros (categoría, estado) + grilla de GroupCards
│   ├── GroupDetailPage.tsx       # Página de decisión: two-column layout · sticky panel · CTA fijo mobile · lógica de rol: supplier→sin CTA, invitado→AuthModal, buyer-ya-unido→AlreadyJoined, buyer→JoinGroupModal
│   ├── HowItWorksPage.tsx        # Guía explicativa: Hero · 3 pasos alternados (GroupCard real + mockups) · FAQ acordeón · CTASection
│   ├── SuppliersPage.tsx         # Landing B2B para mayoristas: Hero · Beneficios · Timeline · Formulario de contacto
│   ├── MyAccountPage.tsx         # Buyer: Perfil + Mis Compras + Ahorro. Redirige suppliers a /proveedor/dashboard
│   ├── SupplierDashboardPage.tsx # Supplier: stats (publicados/completados/unidades) · lista de sus grupos · form para publicar nuevo grupo · Toast
│   └── NotFoundPage.tsx          # Página 404 standalone, sin PageWrapper (logo propio + botón volver)
└── router/index.tsx              # createBrowserRouter · /mi-cuenta protegida con BuyerRoute · /proveedor/dashboard protegida con SupplierRoute
```

## Tokens de diseño (Tailwind v4 — `@theme` en index.css)

| Token | Valor |
|---|---|
| `brand-purple` | `#3B1F6A` |
| `brand-teal` | `#00C9A7` |
| `surface` | `#F8F7FA` |
| `ink` | `#1A1A2E` |
| `status-open/urgent/confirmed/cancelled` | teal/amber/emerald/red |

---

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues for this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the default triage label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
