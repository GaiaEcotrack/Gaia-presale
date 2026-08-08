# GAIA ECOTRACK — PLAN DE IMPLEMENTACIÓN

## 1. Resumen Ejecutivo

El proyecto es una **landing page de preventa** para el token GAIA de Gaia Ecotrack, construida con **Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion** e integra **Solana** vía `@solana/wallet-adapter` y `@coral-xyz/anchor`.

El PDF "Guía de Lanzamiento — Versión 2.0 (Migración a Solana)" establece la landing como herramienta crítica de conversión. Sin embargo, el código actual presenta **contradicciones graves** con el documento:

- **33+ referencias a Ethereum/MetaMask/ETH** en un proyecto 100% Solana
- **Badges de confianza no verificables** (CertiK sin enlace, KYC sin equipo visible, "Solana Partner" sin verificación)
- **Testimonios completamente anónimos**
- **Contadores con datos mock** (inconsistentes entre sí)
- **No existen secciones clave** del PDF: Proyectos Reales, Ciclo del Token, Valor del Token, Mini-Granjas Solares, Equipo real
- **FAQ con errores** (menciona ETH como moneda de pago)
- **How to Buy** describe MetaMask/ETH cuando el sistema usa Phantom/USDC

El plan propone **9 fases** para transformar la landing de su estado actual a la versión especificada en el PDF, priorizando correcciones críticas primero, luego nuevas secciones, y finalmente QA y performance.

---

## 2. Estado Actual del Proyecto

### Stack Técnico

| Componente | Versión/Tecnología |
|---|---|
| Framework | Next.js ^16.1.1 (App Router) |
| React | ^19.0.0 |
| TypeScript | ^5 |
| Styling | Tailwind CSS ^4 + tailwindcss-animate |
| UI Components | shadcn/ui (Radix UI) |
| Animations | Framer Motion ^12.23.2 |
| Charts | Recharts ^2.15.4 |
| State | Zustand ^5.0.6 |
| Blockchain | @coral-xyz/anchor 0.32.1, @solana/web3.js ^1.95.0 |
| Wallet Adapter | @solana/wallet-adapter-react + Phantom + Solflare |
| Database | Prisma ^6.11.1 |
| Build | Bun (lockfile: bun.lock) |

### Estructura de Archivos Clave

```
src/
  app/
    page.tsx              ← Landing principal (21 secciones)
    layout.tsx            ← Layout raíz (Server Component)
    buy/page.tsx          ← Página de compra
    claim/page.tsx        ← Página de claim
    tokenomics/page.tsx   ← Página completa de tokenomics
    roadmap/page.tsx      ← Página completa de roadmap
    team/page.tsx         ← Página de equipo
    faq/page.tsx          ← Página de FAQ
    how-to-buy/page.tsx   ← Guía completa de compra
    whitepaper/page.tsx   ← Whitepaper
    terms/page.tsx        ← Términos y condiciones
    privacy/page.tsx      ← Política de privacidad
    admin/                ← Panel admin
  components/
    home/                 ← Secciones de la landing
    shared/               ← Componentes reutilizables (header, footer, presale-widget, countdowns)
    ui/                   ← shadcn/ui primitives
  hooks/                  ← useWallet, useCountdown, useInView, etc.
  store/                  ← Zustand stores (presale-store)
  lib/                    ← constants.ts, anchor/, presale-utils
  config/                 ← presale-config.ts (stages)
```

### Orden Actual de Secciones en `page.tsx`

1. HeroSection
2. TrustBadges
3. TwoTokenEcosystem
4. RealWorldBacking
5. GaiaScarcity
6. TokenAllocation
7. ServiceStaking
8. TransferFee
9. DeflationaryFlywheel
10. LegalFoundation
11. InvestmentCase
12. SocialProof
13. KeyDifferentiators
14. PresaleWidget (inline)
15. AboutSection
16. TokenomicsPreview
17. RoadmapPreview
18. HowToBuyPreview
19. CtaFinal
20. NewsletterSection

---

## 3. Requisitos Extraídos del PDF

### Secciones Requeridas (11 secciones)

| # | Sección | Descripción |
|---|---|---|
| 1 | **Header** | Logo + Nav (Proyectos, Tokenomics, Roadmap, Equipo, Whitepaper) + CTA "Unirse a la Preventa" + badge "Built on Solana" |
| 2 | **Problema y Oportunidad** | Texto sobre transición energética en Colombia, datos UPME 2026 |
| 3 | **Proyectos Reales** | Galería de 12+ proyectos reales con fotos, tipos, ubicaciones, capacidad, tecnología, estado |
| 4 | **Ciclo del Token** | Infografía de 5 pasos: Generación → Medición → Validación → Tokenización → Impacto |
| 5 | **Valor del Token GAIA** | 4 pilares: Pago de Servicios, Escasez Programática, Gobernanza, Staking por Servicio |
| 6 | **Mini-Granjas Solares** | Diagrama del ciclo de valor + impacto proyectado ($500K inversión, 1MW, $125K ingreso anual) |
| 7 | **Tokenomics** | Gráfico de distribución + tabla de vesting completa + datos clave (supply, transfer fee, auditoría) |
| 8 | **Roadmap** | Timeline visual desde 2024 hasta 2035 con hitos verificables |
| 9 | **Equipo** | Fotos reales, nombres, cargos, experiencia, LinkedIn |
| 10 | **FAQ** | Preguntas y respuestas sobre GAIA-E, Solana, verificación, exchanges, auditoría, regulatorio |
| 11 | **Footer** | Logo, enlaces rápidos, redes sociales, legal, descargos de responsabilidad |

### Correcciones Críticas (Capítulo 1 del PDF)

1. **Ethereum → Solana**: Eliminar toda referencia a MetaMask, ETH, ERC-20, Ethereum mainnet
2. **Wallets**: Cambiar a Phantom, Solflare, Backpack (+ Ledger próximamente)
3. **Moneda de pago**: USDC en Solana (no ETH)
4. **Badges de confianza**: Enlazar CertiK al informe real, eliminar "KYC Verified" si no hay equipo visible, verificar "Solana Partner"
5. **Testimonios**: Eliminar anónimos, reemplazar por reales con nombre, foto, cargo
6. **Fechas**: Alinear countdown con roadmap (TGE Sept 2026, DEX Oct 2026)
7. **Contadores**: Conectar a datos reales del contrato o mostrar objetivos/métricas del piloto

### Datos Reales del Piloto (del PDF)

| Métrica | Valor |
|---|---|
| Proyectos Piloto | 12 |
| Potencia Tokenizada | 150 kW |
| Horas de Operación | +10,000 horas |
| Meses de Piloto | 18 meses |
| Marcas de Inversores | SMA, Huawei, Fronius, SolarEdge |
| Empresas Integradoras | 3+ |

### Tokenomics (del PDF)

| Categoría | % | Vesting |
|---|---|---|
| Equipo y Fundadores | 20% | 4 años, cliff 12 meses |
| Inversores Semilla | 10% | 2 años |
| Pre-venta Pública | 20% | 2 años, cliff 6 meses, liberación lineal |
| Liquidez DEX | 15% | 6 meses lock, 25% mensual desde mes 7 |
| Tesorería / Ecosistema | 25% | Lock 24 meses Streamflow |
| Staking & Rewards | 10% | Emisión programada 5 años |

**Parámetros**: Supply Total: 1,000,000,000 GAIA | Transfer Fee: 1.5% (0.75% Treasury, 0.75% Pool Staking)

### Diseño (Apéndice A del PDF)

| Elemento | Especificación |
|---|---|
| Dark Blue | #002850 — Títulos principales |
| Blue | #00468C — Subtítulos, enlaces |
| Light Blue | #E6F0FA — Fondos de sección |
| Green | #007820 — Indicadores activos |
| Orange | #FF8C00 — Indicadores "En Proceso" |
| Red | #B40000 — Errores |
| H1 | Sans-serif, 32-36pt, bold, Dark Blue |
| H2 | Sans-serif, 24-28pt, semibold, Blue |
| H3 | Sans-serif, 18-20pt, bold, Black 70% |
| Cuerpo | Sans-serif, 14-16pt, regular, Black 90% |
| Iconos | SVG, 24-32px sección, 16-20px inline |
| Fotos | Solo reales, mínimo 1200px, JPG/PNG |
| Responsive | Desktop, tablet, mobile |

---

## 4. GAP Analysis

| Requisito PDF | Estado Actual | Acción | Archivos Afectados | Prioridad |
|---|---|---|---|---|
| Header con nav: Proyectos, Tokenomics, Roadmap, Equipo, Whitepaper, CTA | 🟡 Existe pero con links incorrectos (Buy Tokens, Claim Tokens, Admin) | Modificar | `header.tsx` | P0 |
| Título H1: "Tokeniza el Futuro de la Energía Limpia" | 🟡 Existe: "The Token That Transforms Sunlight into Value" | Reemplazar | `hero-section.tsx` | P0 |
| Subtítulo: "Plataforma de tokenizaci... Colombia" | 🟡 Existe pero en inglés, menos específico | Reemplazar | `hero-section.tsx` | P0 |
| Métricas clave: Proyectos 12+, Potencia 150kW, Empresas 5+, Horas +10,000 | 🔴 No existen en hero | Crear | `hero-section.tsx` | P0 |
| CTA: "Únete a la Preventa" | 🟡 Existe como "Buy GAIA Tokens" | Renombrar | `hero-section.tsx` | P1 |
| Badge "Built on Solana" | ✅ Ya existe | Mantener | `hero-section.tsx` | — |
| Sección Problema/Oportunidad | 🟡 Existe en `about-section.tsx` pero sin datos UPME 2026 | Modificar | `about-section.tsx` | P1 |
| **Sección Proyectos Reales** | 🔴 **No existe** | **Crear** | Nuevo componente | **P0** |
| **Sección Ciclo del Token (5 pasos)** | 🔴 No existe | **Crear** | Nuevo componente | P1 |
| **Sección Valor del Token GAIA (4 pilares)** | 🔴 No existe | **Crear** | Nuevo componente | P1 |
| **Sección Mini-Granjas Solares** | 🔴 No existe | **Crear** | Nuevo componente | P1 |
| Tokenomics con distribución del PDF | 🟡 Existe pero con datos correctos y sin tabla de vesting detallada | Modificar | `tokenomics-preview.tsx`, `token-allocation.tsx` | P1 |
| Vesting table (4 años equipo, 2 años presale, etc.) | 🔴 No existe tabla detallada | Crear | Nuevo en `tokenomics-preview.tsx` o página dedicada | P1 |
| Roadmap con timeline del PDF | 🟡 Existe pero con fechas/datos diferentes al PDF | Modificar | `roadmap-preview.tsx`, `constants.ts` | P1 |
| Sección Equipo real (fotos, LinkedIn) | 🟡 Existe `/team` pero con datos ficticios | Reemplazar contenido | `team/page.tsx`, `constants.ts` | P1 |
| FAQ corregida (sin ETH, con respuestas del PDF) | 🔴 Existe FAQ pero con errores (menciona ETH, 0.5 ETH mínimo) | Reemplazar contenido | `faq/page.tsx`, `constants.ts` | P0 |
| Footer con descargos legales del PDF | 🟡 Existe pero descargo genérico | Modificar | `footer.tsx` | P1 |
| Eliminar referencias Ethereum/MetaMask/ETH | ⚠️ 33+ referencias en código | Eliminar/Corregir | Múltiples archivos | **P0** |
| Eliminar badges no verificables | ⚠️ CertiK sin enlace, KYC sin equipo, "Solana Partner" sin verificación | Modificar/Eliminar | `trust-badges.tsx`, `constants.ts` | **P0** |
| Eliminar testimonios anónimos | ⚠️ 3 testimonios completamente anónimos | Eliminar/Reemplazar | `social-proof.tsx` | **P0** |
| Corregir contadores (datos mock inconsistentes) | ⚠️ `constants.ts` dice $1.2M, store dice $2.8M, hero dice 5M kWh hardcodeado | Conectar a datos reales o mostrar objetivos | `hero-section.tsx`, `constants.ts`, `presale-store.ts` | **P0** |
| How to Buy: Phantom/Solflare/Backpack + USDC | 🔴 Describe MetaMask + ETH completamente | Reescribir | `how-to-buy-preview.tsx`, `how-to-buy/page.tsx` | **P0** |
| Live purchases: direcciones Solana + USDC | ⚠️ Muestra direcciones 0x + ETH | Corregir | `live-purchases.tsx` | P1 |
| Paleta de colores del PDF (#002850, #00468C, etc.) | 🟡 Usa colores de Tailwind/genéricos | Adaptar theme | `tailwind.config.ts`, globals CSS | P1 |
| Fotos reales de proyectos | 🔴 No existen | **CONTENT REQUIRED FROM MARKETING** | Imágenes en `public/` | P0 |
| Fotos reales del equipo | 🔴 No existen (usa iniciales) | **CONTENT REQUIRED FROM TEAM** | Imágenes en `public/` | P1 |
| Enlace a informe CertiK | 🔴 No existe | **CONTENT REQUIRED FROM MARKETING** | URL del reporte | P0 |
| Datos de proyectos (12 proyectos) | 🔴 No existen datos específicos | **CONTENT REQUIRED FROM MARKETING** | Data de proyectos | P0 |

---

## 5. Arquitectura Actual

### Flujo de Datos Crítico

```
presale-config.ts (stages con fechas y precios)
       ↓
usePresaleConfigReadonly() ←→ Anchor Program (on-chain)
       ↓
presale-widget.tsx ←→ executeBuy() ←→ Solana Transaction
       ↓
presale-store.ts (Zustand persist) ←→ totalRaised, investors, tokensSold
       ↓
hero-section.tsx (muestra estadísticas)
```

### Componentes que Mezclan UI + Lógica de Negocio

| Componente | Problema |
|---|---|
| `hero-section.tsx` | Determina estado de presale, gestiona partículas, lógica de countdown, lógica de conexión |
| `presale-widget.tsx` | Lógica de compra on-chain mezclada con UI |
| `presale-store.ts` | Almacén de estado con datos mock hardcodeados + lógica admin |
| `live-purchases.tsx` | Mock data presentado como datos reales |

### Datos Hardcodeados Críticos

| Dato | Ubicación | Inconsistencia |
|---|---|---|
| Total Raised | `constants.ts:243` = $1.2M, `presale-store.ts:29` = $2.8M | Valores diferentes |
| Investors | `constants.ts:244` = 4,872, `presale-store.ts:30` = 12,847 | Valores diferentes |
| kWh Tokenized | `hero-section.tsx:257` = 5M+ hardcodeado | No existe fuente |
| Decimals | `constants.ts:6` = 6, `tokenomics/page.tsx:73` = 18, `buy/page.tsx:103` = 9 | Tres valores diferentes |
| Admin password | `presale-store.ts:128` = "admin123" | Seguridad |
| USDC Mint | `use-wallet.ts:12` = dirección devnet | Red incorrecta para producción |

---

## 6. Arquitectura Propuesta

### Nueva Estructura de Componentes

```
components/
  landing/
    Header/
      header.tsx                    ← Reescrito: nav según PDF
    Hero/
      hero-section.tsx              ← Reescrito: título, subtítulo, métricas reales
    Problem/
      problem-section.tsx           ← Nuevo: problema y oportunidad con datos UPME
    Projects/
      projects-section.tsx          ← Nuevo: galería de proyectos reales
      project-card.tsx              ← Nuevo: tarjeta individual de proyecto
    TokenCycle/
      token-cycle-section.tsx       ← Nuevo: infografía de 5 pasos
    TokenValue/
      token-value-section.tsx       ← Nuevo: 4 pilares de valor
    SolarFarms/
      solar-farms-section.tsx       ← Nuevo: mini-granjas y ciclo de valor
    Tokenomics/
      tokenomics-section.tsx        ← Rediseñado: gráfico + tabla vesting
      vesting-table.tsx             ← Nuevo: tabla detallada de vesting
    Roadmap/
      roadmap-section.tsx           ← Rediseñado: timeline visual
    Team/
      team-section.tsx              ← Rediseñado: fotos reales, datos reales
    FAQ/
      faq-section.tsx               ← Reescrito: preguntas del PDF
    Footer/
      footer.tsx                    ← Modificado: descargos del PDF + enlaces correctos
  shared/
    header.tsx                      ← ELIMINAR (reemplazado por landing/Header)
    footer.tsx                      ← ELIMINAR (reemplazado por landing/Footer)
    trust-badges.tsx                ← Reescrito o eliminado
    countdown-timer.tsx             ← MANTENER (lógica correcta)
    countdown-to-start.tsx          ← MANTENER
    presale-widget.tsx              ← MANTENER (lógica de compra)
    animated-counter.tsx            ← MANTENER
    solana-provider.tsx             ← MANTENER
    particle-explosion.tsx          ← MANTENER
  home/
    (componentes actuales a evaluar uno por uno)
```

### Separación de Datos

```
data/
  projects.ts          ← Datos de proyectos reales (CONTENT REQUIRED)
  tokenomics.ts        ← Distribución y vesting del PDF
  roadmap.ts           ← Timeline del PDF
  team.ts              ← Equipo real (CONTENT REQUIRED)
  faq.ts               ← Preguntas del PDF
  metrics.ts           ← Métricas del piloto
  design-tokens.ts     ← Paleta de colores del PDF
```

### Componentes: Server vs Client

| Componente | Tipo | Justificación |
|---|---|---|
| Header | Client | Interacción con wallet, menú móvil |
| Hero | Client | Countdown dinámico, wallet connect, animaciones |
| Problem | **Server** | Contenido estático, mejor SEO |
| Projects | **Server** | Datos estáticos de proyectos |
| Project Card | **Server** | Renderizado estático |
| Token Cycle | **Server** | Infografía estática |
| Token Value | **Server** | Contenido estático |
| Solar Farms | **Server** | Diagrama estático |
| Tokenomics | **Server** | Datos estáticos |
| Vesting Table | **Server** | Datos estáticos |
| Roadmap | **Server** | Timeline estático |
| Team | **Server** | Datos estáticos |
| FAQ | **Server** | Datos estáticos |
| Footer | **Server** | Links estáticos |
| PresaleWidget | Client | Intercacción on-chain |

---

## 7. Archivos a Modificar

| Archivo | Cambios | Prioridad |
|---|---|---|
| `src/app/page.tsx` | Reordenar secciones según PDF, eliminar secciones que se reemplazan | P0 |
| `src/components/home/hero-section.tsx` | Nuevo H1, subtítulo, métricas reales, CTA "Únete a la Preventa" | P0 |
| `src/components/home/trust-badges.tsx` | Eliminar badges no verificables, corregir wallets a Phantom/Solflare/Backpack | P0 |
| `src/components/home/social-proof.tsx` | Eliminar testimonios anónimos (reemplazar por sección de equipo real) | P0 |
| `src/components/home/how-to-buy-preview.tsx` | Reescribir: Phantom → USDC → Conectar → Comprar → Claim | P0 |
| `src/components/home/live-purchases.tsx` | Cambiar direcciones 0x a formato Solana, ETH a USDC, o eliminar componente | P1 |
| `src/components/home/about-section.tsx` | Integrar datos UPME 2026 del PDF | P1 |
| `src/components/home/tokenomics-preview.tsx` | Actualizar distribución según PDF, agregar vesting table | P1 |
| `src/components/home/token-allocation.tsx` | Sincronizar con datos del PDF | P1 |
| `src/components/home/roadmap-preview.tsx` | Actualizar timeline según PDF | P1 |
| `src/components/shared/footer.tsx` | Agregar descargos del PDF, corregir enlaces | P1 |
| `src/lib/constants.ts` | Corregir TOKENOMICS, FAQ_DATA, TEAM_MEMBERS, MOCK_STATS, SECURITY_BADGES, SUPPORTED_WALLETS | P0 |
| `src/config/presale-config.ts` | Verificar fechas (Seed Sale 2025-09-09 parece correcto para piloto) | P1 |
| `src/app/faq/page.tsx` | Reemplazar FAQ_DATA con preguntas del PDF | P0 |
| `src/app/team/page.tsx` | Reemplazar con datos reales del equipo | P1 |
| `src/app/how-to-buy/page.tsx` | Reescribir completamente: guía Solana/USDC | P0 |
| `src/app/tokenomics/page.tsx` | Corregir decimals (18→6), actualizar distribución | P1 |
| `src/app/terms/page.tsx` | Cambiar "Ethereum blockchain" por "Solana blockchain" | P0 |
| `src/app/privacy/page.tsx` | Cambiar "Ethereum wallet address" por "Solana wallet address" | P0 |
| `src/components/home/presale-starting-content.tsx` | Corregir referencias ETH a USDC | P0 |
| `src/store/presale-store.ts` | Revisar datos mock iniciales, corregir admin password | P1 |
| `tailwind.config.ts` | Agregar paleta de colores del PDF | P1 |

---

## 8. Archivos a Crear

| Archivo | Propósito | Dependencias |
|---|---|---|
| `src/components/landing/problem-section.tsx` | Sección Problema/Oportunidad | Datos UPME del PDF |
| `src/components/landing/projects-section.tsx` | Galería de proyectos reales | Datos de `data/projects.ts` |
| `src/components/landing/project-card.tsx` | Tarjeta individual de proyecto | Fotos en `public/projects/` |
| `src/components/landing/token-cycle-section.tsx` | Infografía de 5 pasos del ciclo del token | Iconos SVG |
| `src/components/landing/token-value-section.tsx` | 4 pilares del valor de GAIA | Iconos lucide-react |
| `src/components/landing/solar-farms-section.tsx` | Diagrama mini-granjas solares | Diagrama SVG |
| `src/components/landing/vesting-table.tsx` | Tabla de vesting detallada | Datos de `data/tokenomics.ts` |
| `src/data/projects.ts` | Datos de proyectos reales | **CONTENT REQUIRED FROM MARKETING** |
| `src/data/tokenomics.ts` | Distribución y vesting | Datos del PDF |
| `src/data/roadmap.ts` | Timeline de hitos | Datos del PDF |
| `src/data/team.ts` | Datos del equipo real | **CONTENT REQUIRED FROM TEAM** |
| `src/data/faq.ts` | Preguntas y respuestas | Datos del PDF |
| `src/data/metrics.ts` | Métricas del piloto | Datos del PDF |
| `src/data/design-tokens.ts` | Paleta de colores del PDF | Datos del PDF |

---

## 9. Archivos que NO Deberían Modificarse

### Lógica Crítica de Blockchain (NO TOCAR)

| Archivo | Razón |
|---|---|
| `src/lib/anchor/config.ts` | Configuración del programa Anchor |
| `src/lib/anchor/instructions/buy.ts` | Lógica de compra on-chain |
| `src/lib/anchor/instructions/claim.ts` | Lógica de claim |
| `src/lib/anchor/instructions/admin.ts` | Funciones admin del contrato |
| `src/hooks/use-wallet.ts` | Conexión wallet (excepto mock USDC mint) |
| `src/components/shared/solana-provider.tsx` | Provider de wallet adapter |
| `src/components/shared/presale-widget.tsx` | Widget de compra (UI puede cambiar, lógica no) |
| `src/hooks/use-presale-config.ts` | Lectura de configuración on-chain |
| `src/hooks/use-countdown.ts` | Lógica de countdown |
| `src/hooks/use-animations.ts` | Utilidades de animación |
| `src/config/presale-config.ts` | Configuración de stages (verificar fechas, no reestructurar) |
| `prisma/` | Schema de base de datos |
| `smart-contract/` | Código del programa Solana |

### Componentes UI Genéricos (NO TOCAR)

| Archivo | Razón |
|---|---|
| `src/components/ui/*` | Primitivas shadcn/ui |
| `src/components/shared/animated-counter.tsx` | Componente reutilizable |
| `src/components/shared/countdown-timer.tsx` | Componente reutilizable |
| `src/components/shared/countdown-to-start.tsx` | Componente reutilizable |
| `src/components/shared/particle-explosion.tsx` | Efecto visual |

### Lo que SÍ se puede tocar (UI/Landing)

- `src/app/page.tsx` (reordenar secciones)
- `src/components/home/*` (modificar contenido)
- `src/components/shared/header.tsx` (navegación)
- `src/components/shared/footer.tsx` (contenido)
- `src/lib/constants.ts` (datos de contenido)
- `src/app/*/page.tsx` (contenido de páginas)

---

## 10. Correcciones Críticas

### 10.1 Referencias Ethereum → Solana (33+ ubicaciones)

| Archivo | Línea(s) | Problema | Solución |
|---|---|---|---|
| `constants.ts` | 207, 213 | FAQ menciona "ETH or USDT", "0.5 ETH" | Cambiar a "USDC on Solana" |
| `presale-config.ts` | 9 | Comentario "ETH minimo" | Cambiar a "USDC minimo" |
| `trust-badges.tsx` | 60 | Lista MetaMask, WalletConnect, Trust Wallet, Coinbase | Cambiar a Phantom, Solflare, Backpack |
| `how-to-buy/page.tsx` | 14,26,30,31,41,43,50,52,171 | Guía completa de MetaMask+ETH | Reescribir para Solana+USDC |
| `how-to-buy-preview.tsx` | 14,20,32 | "MetaMask", "ETH" | Reescribir para Phantom/USDC |
| `presale-starting-content.tsx` | 32,96,169 | "ETH/USDT", "ETH gas fees" | Cambiar a USDC, SOL fees |
| `live-purchases.tsx` | 10-14 | Direcciones 0x + montos ETH | Cambiar a formato Solana + USDC |
| `admin/page.tsx` | 346-348 | Mock data con "ETH" | Cambiar a USDC |
| `privacy/page.tsx` | 44,77 | "Ethereum wallet address", "Ethereum blockchain" | Cambiar a Solana |
| `terms/page.tsx` | 52 | "Ethereum blockchain" | Cambiar a Solana |
| `admin/components/*` | 216,199 | "ETH" para min purchase | Cambiar a USDC |

### 10.2 Badges de Confianza

**Archivo**: `src/components/home/trust-badges.tsx`

| Badge Actual | Problema | Acción PDF | Solución |
|---|---|---|---|
| "Audited by CertiK" | Sin enlace al informe | Enlace al reporte público | Agregar href al badge o eliminar si no existe |
| "KYC Verified" | Sin fotos del equipo | "Auditoría en Progreso" o eliminar | Cambiar texto o eliminar badge |
| "Solana Partner" | Sin verificación oficial | Verificar o cambiar a "Construido sobre Solana" | Cambiar label |
| "Carbon Neutral" | No mencionado en PDF | No especificado | Evaluar si mantener |

**Solución propuesta**: Reemplazar con badges verificables o eliminar hasta tener evidencia.

### 10.3 Testimonios Anónimos

**Archivo**: `src/components/home/social-proof.tsx`

Los 3 testimonios son completamente anónimos:
1. "UPME Data" — no es un testimonio, es un dato
2. "Industry Observer" — anónimo
3. "Legal Analyst" — anónimo

**PDF dice**: "Eliminar o reemplazar por testimonios reales con nombre, foto, cargo y empresa."

**Solución**: Eliminar esta sección y reemplazarla por la sección de Equipo real, o esperar testimonios reales del equipo de marketing.

### 10.4 Contadores y Datos Mock

**Inconsistencias encontradas**:

| Dato | `constants.ts` | `presale-store.ts` | `hero-section.tsx` |
|---|---|---|---|
| Total Raised | $1,247,592 | $2,847,592 | Del store |
| Investors | 4,872 | 12,847 | Del store |
| kWh Tokenized | 5,000,000 | — | 5M+ hardcodeado |

**PDF dice**: Conectar a datos reales del contrato O mostrar objetivos/métricas del piloto.

**Solución propuesta**: Usar métricas reales del piloto (12 proyectos, 150 kW, +10,000 horas) que sí están verificadas.

### 10.5 Fechas Inconsistentes

| Fuente | Fecha | Evento |
|---|---|---|
| `presale-config.ts` | 2025-09-09 | Seed Sale start |
| `presale-config.ts` | 2026-10-10 | Private Sale start |
| `constants.ts` (roadmap) | Sept 2026 | Token Launch |
| PDF | Septiembre 2026 | TGE y Preventa Pública |
| PDF | Octubre 2026 | Listado en DEX |

**Análisis**: Las fechas de `presale-config.ts` parecen alineadas con el PDF (Seed Sale como piloto en 2025, Private Sale en Oct 2026). El countdown del hero cuenta hacia `activeStage.endDate` que es dinámico. **Requiere confirmación del equipo sobre fechas oficiales.**

### 10.6 Decimals Inconsistentes

| Ubicación | Valor |
|---|---|
| `constants.ts:6` | `decimals: 6` |
| `tokenomics/page.tsx:73` | `decimals: 18` |
| `buy/page.tsx:103` | `decimals: 9` |

**El correcto es `6`** (USDC en Solana usa 6 decimales). Los otros dos están mal.

---

## 11. Plan de Implementación por Fases

### Fase 0 — Preparación

**Objetivo**: Preparar el entorno y estructura de datos.

| Acción | Archivos | Detalle |
|---|---|---|
| Crear carpeta `src/data/` | Nuevo directorio | Centralizar datos de contenido |
| Crear `src/data/tokenomics.ts` | Nuevo | Distribución y vesting del PDF |
| Crear `src/data/roadmap.ts` | Nuevo | Timeline del PDF |
| Crear `src/data/faq.ts` | Nuevo | Preguntas del PDF |
| Crear `src/data/metrics.ts` | Nuevo | Métricas del piloto |
| Crear `src/data/design-tokens.ts` | Nuevo | Paleta de colores del PDF |
| Crear `src/data/team.ts` | Nuevo | **Placeholder con CONTENT REQUIRED** |
| Crear `src/data/projects.ts` | Nuevo | **Placeholder con CONTENT REQUIRED** |

**Dependencias**: Ninguna
**Riesgos**: Ninguno
**Criterio de terminación**: Carpeta `data/` creada con todos los archivos de datos del PDF.

---

### Fase 1 — Correcciones Críticas (P0)

**Objetivo**: Eliminar las contradicciones Ethereum/Solana y los badges falsos.

| # | Acción | Archivos | Detalle |
|---|---|---|---|
| 1.1 | Reescribir FAQ | `constants.ts` (FAQ_DATA), `faq/page.tsx` | Usar preguntas y respuestas del PDF §2.12.2 |
| 1.2 | Reescribir How to Buy Preview | `how-to-buy-preview.tsx` | 3 pasos: Configurar wallet Solana → Fondear (SOL + USDC) → Conectar y Comprar |
| 1.3 | Reescribir How to Buy Page | `how-to-buy/page.tsx` | Guía completa Solana/USDC/Phantom/Solflare/Backpack |
| 1.4 | Corregir Trust Badges | `trust-badges.tsx`, `constants.ts` | Eliminar badges no verificables o hacerlos verificables |
| 1.5 | Eliminar/Reemplazar Social Proof | `social-proof.tsx` | Eliminar testimonios anónimos |
| 1.6 | Corregir Live Purchases | `live-purchases.tsx` | Cambiar 0x→Solana addresses, ETH→USDC, o eliminar componente |
| 1.7 | Corregir referencias ETH en presale-starting-content | `presale-starting-content.tsx` | ETH→USDC, gas fees→SOL |
| 1.8 | Corregir Terms | `terms/page.tsx` | "Ethereum blockchain" → "Solana blockchain" |
| 1.9 | Corregir Privacy | `privacy/page.tsx` | "Ethereum wallet" → "Solana wallet" |
| 1.10 | Corregir decimals | `tokenomics/page.tsx` (18→6), `buy/page.tsx` (9→6) | Unificar a 6 |
| 1.11 | Corregir Admin Mock Data | `admin/page.tsx`, `admin/components/*` | ETH→USDC |

**Dependencias**: Fase 0 (data/ creado)
**Riesgos**: Bajo — solo cambios de contenido/texto
**Criterio de terminación**: Búsqueda `grep -i "metamask\|ethereum\|0x[0-9a-f]"` en `src/` retorna solo comparaciones legítimas (ej: "a diferencia de Ethereum"). Sin referencias a ETH como moneda de pago.

---

### Fase 2 — Header + Hero Rediseñados

**Objetivo**: Header y Hero según especificación del PDF.

| # | Acción | Archivos | Detalle |
|---|---|---|---|
| 2.1 | Reescribir Header | `header.tsx` | Nav: Proyectos, Tokenomics, Roadmap, Equipo, Whitepaper + CTA "Únete a la Preventa" |
| 2.2 | Reescribir Hero | `hero-section.tsx` | H1: "Tokeniza el Futuro de la Energía Limpia", subtítulo Colombia, métricas reales |
| 2.3 | Actualizar métricas Hero | `hero-section.tsx` | Proyectos en Operación: 12+, Potencia Tokenizada: 150 kW, Empresas Aliadas: 5+, Horas de Operación: +10,000 |
| 2.4 | Cambiar CTA | `hero-section.tsx` | "Buy GAIA Tokens" → "Únete a la Preventa" |
| 2.5 | Actualizar badge hero | `hero-section.tsx` | Mantener "Built on Solana" |

**Dependencias**: Fase 0
**Riesgos**: Medio — el hero es la pieza más visible. Verificar responsive.
**Criterio de terminación**: Hero muestra las 4 métricas reales del piloto. Header tiene los 5 links del PDF. CTA dice "Únete a la Preventa".

---

### Fase 3 — Nuevas Secciones Core

**Objetivo**: Crear las 4 secciones nuevas que no existen en el código actual.

| # | Acción | Archivos | Detalle |
|---|---|---|---|
| 3.1 | Crear Sección Problema/Oportunidad | `problem-section.tsx` | Datos UPME 2026, texto del PDF §2.4 |
| 3.2 | Crear Sección Proyectos Reales | `projects-section.tsx`, `project-card.tsx` | Galería de proyectos, tarjetas con fotos, tipo, ubicación, capacidad, tecnología, estado |
| 3.3 | Crear Sección Ciclo del Token | `token-cycle-section.tsx` | Infografía 5 pasos del PDF §2.6 |
| 3.4 | Crear Sección Valor del Token | `token-value-section.tsx` | 4 pilares del PDF §2.7 |
| 3.5 | Crear Sección Mini-Granjas | `solar-farms-section.tsx` | Diagrama ciclo de valor + impacto proyectado §2.8 |
| 3.6 | Actualizar page.tsx | `page.tsx` | Reordenar: Header→Hero→Problem→Projects→TokenCycle→TokenValue→SolarFarms→Tokenomics→Roadmap→Team→FAQ→Footer |

**Dependencias**: Fase 0 (data/ files), Fase 2 (header/hero actualizados)
**Riesgos**: Medio — componentes nuevos. Requieren contenido de marketing para proyectos.
**Criterio de terminación**: Las 5 nuevas secciones existen y son navegables. `page.tsx` refleja el orden del PDF.

**CONTENT REQUIRED**:
- `data/projects.ts`: Fotos y datos de 12 proyectos reales (tipo, ubicación, capacidad, tecnología, MWh anuales, estado, descripción)
- Las 4 secciones restantes pueden funcionar con datos del PDF

---

### Fase 4 — Tokenomics / Roadmap / Team / FAQ

**Objetivo**: Actualizar las secciones existentes con datos correctos del PDF.

| # | Acción | Archivos | Detalle |
|---|---|---|---|
| 4.1 | Actualizar Tokenomics | `tokenomics-preview.tsx`, `token-allocation.tsx` | Distribución del PDF §2.9.3, colores del PDF |
| 4.2 | Crear Vesting Table | `vesting-table.tsx` | Tabla detallada del PDF §2.9.4 |
| 4.3 | Actualizar Roadmap | `roadmap-preview.tsx`, `constants.ts` (ROADMAP_PHASES) | Timeline del PDF §2.10.3 |
| 4.4 | Actualizar Team | `team/page.tsx`, `constants.ts` (TEAM_MEMBERS, ADVISORS) | Datos reales del PDF §2.11 |
| 4.5 | Actualizar Footer | `footer.tsx` | Enlaces del PDF §2.13.1 + descargos §2.13.2 |
| 4.6 | Actualizar Página Tokenomics | `tokenomics/page.tsx` | Datos completos del PDF |
| 4.7 | Actualizar Página Roadmap | `roadmap/page.tsx` | Datos completos del PDF |

**Dependencias**: Fase 0 (data/ files), Fase 3 (page.tsx reordenado)
**Riesgos**: Bajo — cambios de contenido en secciones existentes.
**Criterio de terminación**: Tokenomics muestra los 6 rubros con % y vesting correctos. Roadmap muestra las 5 fases del PDF. Team muestra miembros reales. Footer tiene descargos legales del PDF.

**CONTENT REQUIRED**:
- `data/team.ts`: Fotos, nombres, cargos, experiencias, LinkedIn del equipo real
- `data/projects.ts`: Si no se completó en Fase 3

---

### Fase 5 — Diseño y Responsive

**Objetivo**: Aplicar paleta de colores del PDF y asegurar responsive.

| # | Acción | Archivos | Detalle |
|---|---|---|---|
| 5.1 | Actualizar paleta de colores | `tailwind.config.ts`, CSS globals | Dark Blue #002850, Blue #00468C, Light Blue #E6F0FA, Green #007820, Orange #FF8C00, Red #B40000 |
| 5.2 | Verificar tipografía | CSS globals | H1: 32-36pt bold, H2: 24-28pt semibold, H3: 18-20pt bold |
| 5.3 | Verificar iconografía | Componentes | SVG uniforme, 24-32px sección, 16-20px inline |
| 5.4 | Verificar responsive desktop | Todos los componentes | Grid 3 columnas en desktop |
| 5.5 | Verificar responsive tablet | Todos los componentes | 2 columnas donde aplique |
| 5.6 | Verificar responsive mobile | Todos los componentes | 1 columna, touch-friendly |
| 5.7 | Verificar CTAs | Múltiples | Botones contrastantes en cada sección |

**Dependencias**: Fase 3, Fase 4
**Riesgos**: Bajo — cambios visuales.
**Criterio de terminación**: Paleta del PDF aplicada. Landing funciona correctamente en desktop (1440px), tablet (768px), mobile (375px).

---

### Fase 6 — Integración con Presale

**Objetivo**: Asegurar que los cambios de UI no rompan la funcionalidad de compra.

| # | Acción | Archivos | Detalle |
|---|---|---|---|
| 6.1 | Verificar flujo de compra completo | `presale-widget.tsx`, `buy/page.tsx` | Conectar wallet → Seleccionar USDC → Ingresar monto → Comprar → Verificar en Explorer |
| 6.2 | Verificar wallet connection | `solana-provider.tsx`, `use-wallet.ts` | Phantom y Solflare conectan correctamente |
| 6.3 | Verificar claim flow | `claim/page.tsx` | Claim funciona post-presale |
| 6.4 | Verificar countdown | `countdown-timer.tsx`, `countdown-to-start.tsx` | Countdown muestra fechas correctas |
| 6.5 | Verificar admin panel | `admin/page.tsx` | Admin funcional (corregir mock data ETH→USDC) |

**Dependencias**: Fase 1 (correcciones críticas), Fase 2 (header/hero)
**Riesgos**: **ALTO** — cualquier cambio en presale-widget o hooks puede romper la compra. **NO MODIFICAR** la lógica on-chain.
**Criterio de terminación**: Flujo de compra end-to-end funciona sin errores en devnet. Wallet conecta. Transacción se ejecuta. Explorer muestra la transacción.

---

### Fase 7 — QA

**Objetivo**: Verificación exhaustiva de todos los requisitos del PDF.

| # | Acción | Detalle |
|---|---|---|
| 7.1 | Prueba de los 5 segundos | Abrir landing → 5 segundos → cerrar ojos → ¿recuerdas: nombre, propósito, proyectos reales, acción? |
| 7.2 | Verificar sin ETH/MetaMask | Búsqueda exhaustiva en todo el código |
| 7.3 | Verificar wallets correctas | Phantom, Solflare, Backpack (Ledger próximamente) |
| 7.4 | Verificar moneda de pago | USDC en todas partes |
| 7.5 | Verificar badges | Solo badges verificables o eliminados |
| 7.6 | Verificar fechas | Countdown alineado con roadmap |
| 7.7 | Verificar métricas | Datos reales del piloto, no mock |
| 7.8 | Verificar tokenomics | 6 rubros, % correctos, vesting detallado |
| 7.9 | Verificar roadmap | 5 fases del PDF con hitos correctos |
| 7.10 | Verificar equipo | Fotos reales, LinkedIn reales |
| 7.11 | Verificar FAQ | Preguntas del PDF, sin referencias ETH |
| 7.12 | Verificar footer | Descargos del PDF, enlaces correctos |
| 7.13 | Verificar responsive | Desktop, tablet, mobile |
| 7.14 | Verificar performance | Lighthouse score > 90 |
| 7.15 | Verificar SEO | Meta tags, OG tags, estructura semántica |

**Dependencias**: Fase 5, Fase 6
**Riesgos**: Bajo — solo lectura y verificación.
**Criterio de terminación**: Todos los ítems del checklist §15 pasan.

---

### Fase 8 — Performance

**Objetivo**: Optimizar velocidad de carga.

| # | Acción | Detalle |
|---|---|---|
| 8.1 | Optimizar imágenes | Proyectos: WebP/AVIF, lazy loading, srcset |
| 8.2 | Optimizar bundle | Eliminar dependencias no usadas (next-auth, next-intl, next-themes, z-ai-web-dev-sdk) |
| 8.3 | Lazy loading de secciones | Componentes below-the-fold con dynamic import |
| 8.4 | Optimizar animaciones | Reducir framer-motion en mobile |
| 8.5 | Verificar Lighthouse | Performance > 90, Accessibility > 90 |

**Dependencias**: Fase 7
**Riesgos**: Bajo.
**Criterio de terminación**: Lighthouse Performance ≥ 90. First Contentful Paint < 1.5s.

---

### Fase 9 — Revisión Final

**Objetivo**: Aprobación del equipo antes de deploy.

| # | Acción | Detalle |
|---|---|---|
| 9.1 | Review con equipo de marketing | Verificar contenido, fotos, datos |
| 9.2 | Review con equipo técnico | Verificar que no se rompió nada |
| 9.3 | Review legal | Verificar descargos de responsabilidad |
| 9.4 | Deploy a staging | Probar en entorno de staging |
| 9.5 | Prueba final end-to-end | Flujo completo de compra |

**Dependencias**: Fase 8
**Riesgos**: Bajo.
**Criterio de terminación**: Aprobación de todos los stakeholders. Deploy a producción.

---

## 12. Priorización P0/P1/P2/P3

### P0 — Crítica (Debe hacerse antes del lanzamiento)

| # | Tarea | Archivos |
|---|---|---|
| 1 | Eliminar todas las referencias a Ethereum/MetaMask/ETH | 11+ archivos |
| 2 | Reescribir How to Buy (Solana/USDC) | `how-to-buy-preview.tsx`, `how-to-buy/page.tsx` |
| 3 | Reescribir FAQ (sin ETH) | `constants.ts`, `faq/page.tsx` |
| 4 | Corregir Trust Badges (verificables) | `trust-badges.tsx`, `constants.ts` |
| 5 | Eliminar testimonios anónimos | `social-proof.tsx` |
| 6 | Corregir contadores mock (datos reales del piloto) | `hero-section.tsx`, `constants.ts` |
| 7 | Crear Sección Proyectos Reales | Nuevo componente |
| 8 | Reescribir Hero (título, subtítulo, métricas del PDF) | `hero-section.tsx` |
| 9 | Corregir Terms y Privacy (Solana, no Ethereum) | `terms/page.tsx`, `privacy/page.tsx` |
| 10 | Corregir decimals (unificar a 6) | `tokenomics/page.tsx`, `buy/page.tsx` |

### P1 — Alta (Importante para la nueva landing)

| # | Tarea | Archivos |
|---|---|---|
| 11 | Reescribir Header (nav del PDF) | `header.tsx` |
| 12 | Crear Sección Problema/Oportunidad | Nuevo componente |
| 13 | Crear Sección Ciclo del Token | Nuevo componente |
| 14 | Crear Sección Valor del Token | Nuevo componente |
| 15 | Crear Sección Mini-Granjas Solares | Nuevo componente |
| 16 | Actualizar Tokenomics (distribución + vesting del PDF) | `tokenomics-preview.tsx`, `constants.ts` |
| 17 | Actualizar Roadmap (timeline del PDF) | `roadmap-preview.tsx`, `constants.ts` |
| 18 | Actualizar Team (datos reales) | `team/page.tsx`, `constants.ts` |
| 19 | Actualizar Footer (descargos del PDF) | `footer.tsx` |
| 20 | Corregir Live Purchases (formato Solana) | `live-purchases.tsx` |
| 21 | Reordenar secciones en page.tsx | `page.tsx` |
| 22 | Actualizar paleta de colores | `tailwind.config.ts`, CSS |
| 23 | Crear archivos data/ | `src/data/*.ts` |

### P2 — Media (Mejora importante pero no bloqueante)

| # | Tarea | Archivos |
|---|---|---|
| 24 | Crear Vesting Table detallada | Nuevo componente |
| 25 | Agregar CTA "Únete a la Preventa" en Hero | `hero-section.tsx` |
| 26 | Verificar responsive en todos los breakpoints | Todos los componentes |
| 27 | Optimizar imágenes de proyectos | `public/projects/` |
| 28 | Corregir admin mock data | `admin/` |
| 29 | Agregar "Built on Solana" badge verificable | `trust-badges.tsx` |

### P3 — Baja (Mejora futura)

| # | Tarea | Archivos |
|---|---|---|
| 30 | Agregar Ledger a wallets soportadas | `solana-provider.tsx` |
| 31 | Conectar contadores a datos on-chain en tiempo real | `hero-section.tsx` |
| 32 | Eliminar dependencias no usadas | `package.json` |
| 33 | Agregar testimonios reales (cuando existan) | `social-proof.tsx` |
| 34 | Internacionalización (ES/EN) | Múltiples |

---

## 13. Riesgos y Dependencias

### Riesgos Funcionales

| Riesgo | Impacto | Probabilidad | Mitigación |
|---|---|---|---|
| Romper flujo de compra | **Crítico** | Media | NO modificar `presale-widget.tsx`, `anchor/*`, `use-wallet.ts` lógica |
| Romper conexión de wallet | **Crítico** | Baja | NO modificar `solana-provider.tsx` |
| Modificar contratos | **Crítico** | Baja | NO tocar `smart-contract/` |
| Romper routing | Alto | Baja | Verificar links internos después de reordenar `page.tsx` |
| Contadores con datos incorrectos | Alto | Alta | Usar métricas verificadas del piloto |

### Riesgos de Arquitectura

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Duplicación de componentes (header viejo vs nuevo) | Medio | Eliminar componentes obsoletos después de crear los nuevos |
| Componentes demasiado grandes | Medio | Separar en sub-componentes (project-card, vesting-table) |
| Datos hardcodeados en JSX | Bajo | Mover a `src/data/` |
| Mezcla UI + lógica | Bajo | Separar en componentes Client/Server apropiados |

### Riesgos de Contenido

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Fotos de proyectos no disponibles | **Bloqueante** | Marcar como `CONTENT REQUIRED FROM MARKETING` |
| Datos del equipo no disponibles | Alto | Usar placeholders hasta que el equipo provea datos |
| Enlace de auditoría CertiK no disponible | Alto | No mostrar badge si no hay enlace verificable |
| Fechas de presale incorrectas | Alto | Confirmar con equipo antes de implementar |

### Dependencias

| Dependencia | Estado | Impacto |
|---|---|---|
| Fotos de 12 proyectos reales | **Pendiente** | Bloquea Fase 3 (Proyectos Reales) |
| Datos del equipo (fotos, LinkedIn) | **Pendiente** | Bloquea Fase 4 (Team) |
| Enlace a informe CertiK | **Pendiente** | Afecta Fase 1 (Trust Badges) |
| Confirmación de fechas oficiales | **Pendiente** | Afecta Fase 1 (Fechas) |
| Decisiones sobre badges | **Pendiente** | Afecta Fase 1 (Trust Badges) |

---

## 14. Información que Falta Proporcionar

### CONTENT REQUIRED FROM MARKETING

| # | Información | Urgencia | Sección Afectada |
|---|---|---|---|
| 1 | Fotos reales de los 12 proyectos (paneles solares, inversores, instalaciones). Mínimo 1200px, JPG/PNG. | **Crítica** | Proyectos Reales |
| 2 | Datos de cada proyecto: tipo, ubicación (ciudad, país), capacidad kW/MW, marca de inversor, MWh anuales, estado (Tokenizando/En Conexión/Próximo) | **Crítica** | Proyectos Reales |
| 3 | Enlace público al informe de auditoría de CertiK | **Crítica** | Trust Badges |
| 4 | Confirmación del estatus de "Solana Partner" o cambiar texto a "Construido sobre Solana" | Alta | Trust Badges |
| 5 | Texto para sección Problema/Oportunidad (verificar datos UPME 2026) | Alta | Problem Section |
| 6 | Testimonios reales (nombre, foto, cargo, empresa) o decisión de eliminar la sección | Media | Social Proof |
| 7 | Logo de Gaia Ecotrack en alta resolución (SVG preferido) | Media | Header, Footer |
| 8 | Enlace al Whitepaper PDF | Media | Header, Footer |
| 9 | URLs de redes sociales verificadas | Media | Footer |
| 10 | Decisión sobre qué hacer con badges de confianza si no hay evidencia | Alta | Trust Badges |

### CONTENT REQUIRED FROM TEAM

| # | Información | Urgencia | Sección Afectada |
|---|---|---|---|
| 11 | Fotos profesionales de cada miembro del equipo | Alta | Team Section |
| 12 | Nombres reales y cargos correctos (PDF menciona: Ilich Blanco CEO, Diego Rosas CTO) | **Crítica** | Team Section |
| 13 | Biografías reales con experiencia específica | Alta | Team Section |
| 14 | URLs reales de LinkedIn de cada miembro | Alta | Team Section |
| 15 | Decisión sobre qué hacer con asesores (¿incluir o eliminar?) | Media | Team Section |

---

## 15. Criterios de Aceptación

### Correcciones Críticas (P0)

- [ ] No existen referencias incorrectas a Ethereum como moneda de pago
- [ ] No existen referencias a MetaMask como wallet recomendada
- [ ] No existen direcciones de formato 0x en la UI pública
- [ ] La experiencia de compra utiliza USDC en Solana
- [ ] Las wallets mostradas corresponden a Solana: Phantom, Solflare, Backpack
- [ ] El FAQ no menciona ETH como moneda de inversión
- [ ] Los decimals están unificados a 6 en todo el proyecto
- [ ] Terms & Conditions menciona "Solana blockchain", no "Ethereum"
- [ ] Privacy Policy menciona "Solana wallet address", no "Ethereum"

### Contenido de Landing (P1)

- [ ] Header contiene: Logo, Proyectos, Tokenomics, Roadmap, Equipo, Whitepaper, CTA "Únete a la Preventa"
- [ ] Hero muestra H1: "Tokeniza el Futuro de la Energía Limpia"
- [ ] Hero muestra subtítulo sobre tokenización de energía renovable en Colombia
- [ ] Hero muestra 4 métricas reales: Proyectos 12+, Potencia 150 kW, Empresas 5+, Horas +10,000
- [ ] Hero tiene badge "Built on Solana"
- [ ] Existe sección Problema/Oportunidad con datos UPME 2026
- [ ] Existe sección Proyectos Reales con galería de proyectos
- [ ] Existe sección Ciclo del Token (5 pasos)
- [ ] Existe sección Valor del Token GAIA (4 pilares)
- [ ] Existe sección Mini-Granjas Solares
- [ ] Tokenomics muestra los 6 rubros con % correctos
- [ ] Tokenomics incluye tabla de vesting detallada
- [ ] Tokenomics muestra: Supply Total 1B, Transfer Fee 1.5%, Max Supply Fijo
- [ ] Roadmap muestra las 5 fases del PDF con hitos correctos
- [ ] Roadmap incluye: 2024-2026 (Completado), Q4 2026-Q1 2027 (En Curso), 2027-2028, 2028-2030, 2030-2035
- [ ] Equipo muestra miembros reales con fotos, nombres, cargos, LinkedIn
- [ ] FAQ contiene las 8 preguntas del PDF con respuestas correctas
- [ ] Footer contiene: Logo, Enlaces Rápidos, Redes Sociales, Legal, Contacto
- [ ] Footer contiene descargos de responsabilidad del PDF

### Badges y Confianza (P0)

- [ ] Badge "Audited by CertiK" tiene enlace al informe público (o se eliminó)
- [ ] Badge "KYC Verified" se eliminó o cambió a "Auditoría en Progreso"
- [ ] Badge "Solana Partner" se verificó o cambió a "Construido sobre Solana"
- [ ] No existen testimonios anónimos
- [ ] Los contadores muestran datos reales del piloto (no mock)

### Diseño y Responsive (P2)

- [ ] Paleta de colores: Dark Blue #002850, Blue #00468C, Light Blue #E6F0FA, Green #007820, Orange #FF8C00
- [ ] Tipografía: H1 32-36pt bold, H2 24-28pt semibold, H3 18-20pt bold
- [ ] Responsive desktop (1440px): Grid 3 columnas en proyectos, layouts amplios
- [ ] Responsive tablet (768px): Adaptación correcta, 2 columnas donde aplique
- [ ] Responsive mobile (375px): 1 columna, CTAs touch-friendly, menú hamburguesa funcional
- [ ] CTAs destacados con colores contrastantes en cada sección

### Performance (P2)

- [ ] Lighthouse Performance ≥ 90
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Imágenes optimizadas (WebP/AVIF, lazy loading)

### Funcionalidad (P0)

- [ ] Flujo de compra end-to-end funciona: Conectar → Seleccionar USDC → Comprar → Verificar
- [ ] Wallet Phantom conecta correctamente
- [ ] Wallet Solflare conecta correctamente
- [ ] Countdown muestra fechas correctas
- [ ] Claim funciona después del presale
- [ ] Admin panel funciona (con datos corregidos)
- [ ] No se rompió el routing interno

---

## 16. Orden Recomendado de Implementación

```
Fase 0: Preparación (data/)
    │
    ├──→ Fase 1: Correcciones Críticas (P0)
    │       │
    │       ├──→ Fase 2: Header + Hero (P0)
    │       │       │
    │       │       ├──→ Fase 3: Nuevas Secciones Core (P0)
    │       │       │       │
    │       │       │       ├──→ Fase 4: Tokenomics/Roadmap/Team/FAQ (P1)
    │       │       │       │       │
    │       │       │       │       ├──→ Fase 5: Diseño y Responsive (P2)
    │       │       │       │       │       │
    │       │       │       │       │       ├──→ Fase 6: Integración Presale (P0)
    │       │       │       │       │       │       │
    │       │       │       │       │       │       ├──→ Fase 7: QA
    │       │       │       │       │       │       │       │
    │       │       │       │       │       │       │       ├──→ Fase 8: Performance
    │       │       │       │       │       │       │       │       │
    │       │       │       │       │       │       │       │       └──→ Fase 9: Revisión Final
```

**Dependencias clave**:
- La **Fase 3** (Proyectos Reales) depende de que Marketing provea fotos y datos
- La **Fase 4** (Team) depende de que el equipo provea fotos y perfiles
- La **Fase 6** (Integración Presale) debe hacerse CON CUIDADO — no tocar lógica on-chain
- La **Fase 1** puede hacerse independientemente de todo lo demás
