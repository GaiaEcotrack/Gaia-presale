# GAIA ECOTRACK — PLAN DE IMPLEMENTACIÓN

> **Versión revisada** — Corregido contra PDF original (pdftotext) + verificación de código fuente.
> Se marcan con `⚠️ REQUIRES CONFIRMATION` los datos que el PDF no permite verificar contra el estado real del proyecto.

---

## Cambios Respecto a la Versión Anterior

| Aspecto | Versión anterior | Versión corregida |
|---|---|---|
| **Scope** | Incluía admin panel, presale-store, admin password, cambios a lógica blockchain | **Eliminado** — solo UI/landing |
| **Tokenomics vesting** | Todos los vesting presentados como verificados | **3 rubros marcados REQUIRES CONFIRMATION** (Liquidez DEX, Tesorería, Staking) |
| **Fechas** | Afirmaba que fechas estaban alineadas | **Marcadas como REQUIRES CONFIRMATION** la relación Seed Sale vs TGE |
| **Decimals** | Solo mencionaba inconsistencia en tokenomics | **Corregido**: Añadido `buy/page.tsx` (9→6) a correcciones |
| **Colores tokenomics** | No mencionado | **Añadido**: El código usa grises genéricos, el PDF especifica colores por rubro |
| **Contrato vesting** | No analizado | **Añadido**: El contrato solo soporta lineal, no escalonado (25% mensual) |
| **Max Supply** | No mencionado | **Añadido REQUIRES CONFIRMATION** |
| **USDC Mint** | Mencionado como issue | **Añadido REQUIRES CONFIRMATION** para producción |
| **Dependencia vesting** | No existía | **Añadida**: Fase 4 requiere confirmación de vesting antes de implementar |

---

## 1. Resumen Ejecutivo

El proyecto es una **landing page de preventa** para el token GAIA de Gaia Ecotrack, construida con **Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion** e integra **Solana** vía `@solana/wallet-adapter` y `@coral-xyz/anchor`.

El PDF "Guía de Lanzamiento — Versión 2.0 (Migración a Solana)" establece la landing como herramienta crítica de conversión. El código actual presenta **contradicciones graves**:

- **33+ referencias a Ethereum/MetaMask/ETH** en un proyecto 100% Solana
- **Badges de confianza no verificables** (CertiK sin enlace, KYC sin equipo visible, "Solana Partner" sin verificación)
- **Testimonios completamente anónimos**
- **Contadores con datos mock** (inconsistentes entre `constants.ts` y `presale-store.ts`)
- **No existen secciones clave** del PDF: Proyectos Reales, Ciclo del Token, Valor del Token, Mini-Granjas Solares
- **FAQ con errores** (menciona ETH como moneda de pago)
- **How to Buy** describe MetaMask/ETH cuando el sistema usa Phantom/USDC

**Scope de este plan**: Modificaciones de UI/contenido de la landing. **NO incluye** cambios a lógica blockchain, contratos, admin panel, seguridad ni configuración de presale.

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
    page.tsx              ← Landing principal (20 secciones)
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

### Tokenomics (del PDF — verificado con pdftotext)

**⚠️ NOTA**: La extracción del PDF tiene problemas de formato en la tabla de vesting. Las filas de Liquidez DEX, Tesorería/Ecosistema y Staking & Rewards tienen información parcialmente superpuesta. Los valores marcados con `⚠️ REQUIRES CONFIRMATION` necesitan verificación contra el PDF original en formato nativo.

| Categoría | % | Vesting (PDF) | Estado |
|---|---|---|---|
| Equipo y Fundadores | 20% | 4 años, cliff 12 meses, 5% anual a partir del mes 13 | ✅ Verificado |
| Inversores Semilla | 10% | 2 años (sin cliff especificado en el PDF) | ✅ Verificado |
| Pre-venta Pública | 20% | 2 años, cliff 6 meses, liberación lineal | ✅ Verificado |
| Liquidez DEX | 15% | 6 meses lock ⚠️ + liberación posterior no completamente clara en PDF | ⚠️ REQUIRES CONFIRMATION |
| Tesorería / Ecosistema | 25% | Lock 24 meses en Streamflow ⚠️ + posible liberación lineal 4 años | ⚠️ REQUIRES CONFIRMATION |
| Staking & Rewards | 10% | Emisión programada 5 años ⚠️ + posible lock 24 meses Streamflow | ⚠️ REQUIRES CONFIRMATION |

**Nota sobre Liquidez DEX**: El contrato on-chain (`vesting.ts`) solo soporta vesting lineal (cliff + duración lineal). La descripción del PDF ("25% mensual desde mes 7") sugiere un vesting escalonado, que el contrato actual NO implementa. **Requiere decisión**: ¿Cambiar el vesting en el contrato, o simplificar la descripción en la landing?

**Parámetros verificados**:

| Parámetro | PDF | Código (`constants.ts`) | Coincide |
|---|---|---|---|
| Supply Total | 1,000,000,000 GAIA | `totalSupply: 1_000_000_000` | ✅ |
| Decimals | 6 (SPL Token-2022 en Solana) | `decimals: 6` | ✅ |
| Transfer Fee | 1.5% (0.75% Treasury, 0.75% Pool Staking) | `transfer-fee.tsx: 1.5%` | ✅ |
| Max Supply | Fijo, no hay mint adicional | N/A en frontend | ⚠️ REQUIRES CONFIRMATION (verificar en contrato) |
| Presale Allocation | 20% | `presaleAllocated: 200_000_000` (20%) | ✅ |

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

### Fechas (del PDF)

| Fecha | Evento | Fuente PDF |
|---|---|---|
| 2024–2026 | Piloto de 18 meses (12 proyectos, 150 kW) | §2.10.3 — Completado |
| Q4 2026 – Q1 2027 | Migración a Solana (Devnet), marco regulatorio | §2.10.3 — En Curso |
| Septiembre 2026 | TGE (Token Generation Event) y Preventa Pública | §2.10.3 + §1.4.2 |
| Octubre 2026 | Listado en DEX (Orca, Raydium) | §1.4.2 |
| Noviembre 2026 | Inicio de gobernanza (primeras votaciones) | §1.4.2 |
| 2027–2028 | Lanzamiento del Token, Preventa Pública, Listado DEX | §2.10.3 |
| 2028–2030 | Primera Mini-Granja Solar, meta 200 MW tokenizados | §2.10.3 |
| 2030–2035 | Expansión global, DAO, 5,000 autogeneradores | §2.10.3 |

**⚠️ REQUIRES CONFIRMATION**: El PDF dice "TGE Septiembre 2026" pero el `presale-config.ts` tiene Seed Sale empezando en 2025-09-09. Esto puede ser intencional (Seed Sale como piloto previo al TGE). Requiere confirmación del equipo.

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
| Tokenomics con distribución del PDF | 🟡 Existe pero sin tabla de vesting detallada | Modificar | `tokenomics-preview.tsx`, `token-allocation.tsx` | P1 |
| Vesting table | 🔴 No existe tabla detallada | Crear | Nuevo componente | P1 |
| Roadmap con timeline del PDF | 🟡 Existe pero con fechas/datos diferentes al PDF | Modificar | `roadmap-preview.tsx`, `constants.ts` | P1 |
| Sección Equipo real (fotos, LinkedIn) | 🟡 Existe `/team` pero con datos ficticios | Reemplazar contenido | `team/page.tsx`, `constants.ts` | P1 |
| FAQ corregida (sin ETH, con respuestas del PDF) | 🔴 Existe FAQ pero con errores (menciona ETH, 0.5 ETH mínimo) | Reemplazar contenido | `faq/page.tsx`, `constants.ts` | P0 |
| Footer con descargos legales del PDF | 🟡 Existe pero descargo genérico | Modificar | `footer.tsx` | P1 |
| Eliminar referencias Ethereum/MetaMask/ETH | ⚠️ 33+ referencias en código | Eliminar/Corregir | Múltiples archivos | **P0** |
| Eliminar badges no verificables | ⚠️ CertiK sin enlace, KYC sin equipo, "Solana Partner" sin verificación | Modificar/Eliminar | `trust-badges.tsx`, `constants.ts` | **P0** |
| Eliminar testimonios anónimos | ⚠️ 3 testimonios completamente anónimos | Eliminar/Reemplazar | `social-proof.tsx` | **P0** |
| Corregir contadores (datos mock inconsistentes) | ⚠️ `constants.ts` dice $1.2M, store dice $2.8M, hero dice 5M kWh hardcodeado | Conectar a datos reales o mostrar objetivos | `hero-section.tsx`, `constants.ts` | **P0** |
| How to Buy: Phantom/Solflare/Backpack + USDC | 🔴 Describe MetaMask + ETH completamente | Reescribir | `how-to-buy-preview.tsx`, `how-to-buy/page.tsx` | **P0** |
| Live purchases: direcciones Solana + USDC | ⚠️ Muestra direcciones 0x + ETH | Corregir o eliminar | `live-purchases.tsx` | P1 |
| Paleta de colores del PDF | 🟡 Usa colores de Tailwind/genéricos | Adaptar theme | `tailwind.config.ts`, CSS | P1 |
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

### Datos Hardcodeados Críticos

| Dato | Ubicación | Inconsistencia |
|---|---|---|
| Total Raised | `constants.ts:243` = $1.2M, `presale-store.ts:29` = $2.8M | Valores diferentes |
| Investors | `constants.ts:244` = 4,872, `presale-store.ts:30` = 12,847 | Valores diferentes |
| kWh Tokenized | `hero-section.tsx:257` = 5M+ hardcodeado | No existe fuente |
| Decimals (tokenomics) | `tokenomics/page.tsx:73` = **18** | Debería ser **6** |
| Decimals (buy) | `buy/page.tsx:103` = **9** | Debería ser **6** |
| USDC Mint | `use-wallet.ts:12` = dirección devnet | ⚠️ REQUIRES CONFIRMATION para producción |

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
    countdown-timer.tsx             ← MANTENER
    countdown-to-start.tsx          ← MANTENER
    presale-widget.tsx              ← MANTENER
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
| `src/app/page.tsx` | Reordenar secciones según PDF | P0 |
| `src/components/home/hero-section.tsx` | Nuevo H1, subtítulo, métricas reales, CTA "Únete a la Preventa" | P0 |
| `src/components/home/trust-badges.tsx` | Eliminar badges no verificables, corregir wallets a Phantom/Solflare/Backpack | P0 |
| `src/components/home/social-proof.tsx` | Eliminar testimonios anónimos | P0 |
| `src/components/home/how-to-buy-preview.tsx` | Reescribir: Phantom → USDC → Conectar → Comprar → Claim | P0 |
| `src/components/home/live-purchases.tsx` | Cambiar direcciones 0x a formato Solana + USDC, o eliminar componente | P1 |
| `src/components/home/about-section.tsx` | Integrar datos UPME 2026 del PDF | P1 |
| `src/components/home/tokenomics-preview.tsx` | Actualizar distribución según PDF, agregar vesting table | P1 |
| `src/components/home/token-allocation.tsx` | Sincronizar con datos del PDF | P1 |
| `src/components/home/roadmap-preview.tsx` | Actualizar timeline según PDF | P1 |
| `src/components/shared/footer.tsx` | Agregar descargos del PDF, corregir enlaces | P1 |
| `src/lib/constants.ts` | Corregir TOKENOMICS (colores), FAQ_DATA, TEAM_MEMBERS, MOCK_STATS, SECURITY_BADGES, SUPPORTED_WALLETS | P0 |
| `src/app/faq/page.tsx` | Reemplazar FAQ_DATA con preguntas del PDF | P0 |
| `src/app/team/page.tsx` | Reemplazar con datos reales del equipo | P1 |
| `src/app/how-to-buy/page.tsx` | Reescribir completamente: guía Solana/USDC | P0 |
| `src/app/tokenomics/page.tsx` | Corregir decimals (18→6), actualizar distribución | P0 |
| `src/app/buy/page.tsx` | Corregir decimals (9→6) | P0 |
| `src/app/terms/page.tsx` | Cambiar "Ethereum blockchain" por "Solana blockchain" | P0 |
| `src/app/privacy/page.tsx` | Cambiar "Ethereum wallet address" por "Solana wallet address" | P0 |
| `src/components/home/presale-starting-content.tsx` | Corregir referencias ETH a USDC | P0 |
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
| `src/lib/anchor/vesting.ts` | Lógica de vesting on-chain |
| `src/hooks/use-wallet.ts` | Conexión wallet |
| `src/components/shared/solana-provider.tsx` | Provider de wallet adapter |
| `src/components/shared/presale-widget.tsx` | Widget de compra (lógica) |
| `src/components/shared/claim-widget.tsx` | Widget de claim (lógica) |
| `src/hooks/use-presale-config.ts` | Lectura de configuración on-chain |
| `src/hooks/use-countdown.ts` | Lógica de countdown |
| `src/hooks/use-animations.ts` | Utilidades de animación |
| `src/config/presale-config.ts` | Configuración de stages |
| `src/store/presale-store.ts` | Estado de presale |
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
- `src/lib/constants.ts` (solo datos de contenido: TOKENOMICS, FAQ_DATA, TEAM_MEMBERS, SECURITY_BADGES, SUPPORTED_WALLETS — **NO** tocar TOKEN_CONFIG ni NETWORK_CONFIG)
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
| `privacy/page.tsx` | 44,77 | "Ethereum wallet address", "Ethereum blockchain" | Cambiar a Solana |
| `terms/page.tsx` | 52 | "Ethereum blockchain" | Cambiar a Solana |

### 10.2 Badges de Confianza

| Badge Actual | Problema | Acción PDF | Solución |
|---|---|---|---|
| "Audited by CertiK" | Sin enlace al informe | Enlace al reporte público | Agregar href o eliminar |
| "KYC Verified" | Sin fotos del equipo | "Auditoría en Progreso" o eliminar | Cambiar texto o eliminar |
| "Solana Partner" | Sin verificación oficial | Verificar o "Construido sobre Solana" | Cambiar label |
| "Carbon Neutral" | No mencionado en PDF | No especificado | Evaluar si mantener |

### 10.3 Testimonios Anónimos

Los 3 testimonios son completamente anónimos: "UPME Data", "Industry Observer", "Legal Analyst". **PDF dice**: eliminar o reemplazar por reales con nombre, foto, cargo.

### 10.4 Contadores y Datos Mock

| Dato | `constants.ts` | `presale-store.ts` | `hero-section.tsx` |
|---|---|---|---|
| Total Raised | $1,247,592 | $2,847,592 | Del store |
| Investors | 4,872 | 12,847 | Del store |
| kWh Tokenized | 5,000,000 | — | 5M+ hardcodeado |

**Solución**: Usar métricas reales del piloto (12 proyectos, 150 kW, +10,000 horas).

### 10.5 Fechas Inconsistentes

| Fuente | Fecha | Evento |
|---|---|---|
| `presale-config.ts` | 2025-09-09 | Seed Sale start |
| `presale-config.ts` | 2026-10-10 | Private Sale start |
| PDF §1.4.2 | Septiembre 2026 | TGE y Preventa Pública |
| PDF §1.4.2 | Octubre 2026 | Listado en DEX |
| PDF §2.10.3 | Q4 2026 – Q1 2027 | Migración a Solana (Devnet) |

**⚠️ REQUIRES CONFIRMATION**: La relación entre Seed Sale (2025) y TGE (Sept 2026) no está clara en el PDF.

### 10.6 Decimals Inconsistentes

| Ubicación | Valor | Correcto |
|---|---|---|
| `constants.ts:6` | `decimals: 6` | ✅ Correcto |
| `tokenomics/page.tsx:73` | `decimals: 18` | ❌ Debería ser 6 |
| `buy/page.tsx:103` | `decimals: 9` | ❌ Debería ser 6 |

### 10.7 Tokenomics — Discrepancias con el Código Actual

Los porcentajes en `constants.ts` coinciden con el PDF (20/10/20/15/25/10). Las discrepancias están en:
- **Detalles de vesting** (3 rubros no verificables)
- **Colores** (código usa grises genéricos, PDF especifica colores por rubro)

---

## 11. Plan de Implementación por Fases

### Fase 0 — Preparación

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

### Fase 1 — Correcciones Críticas (P0)

| # | Acción | Archivos | Detalle |
|---|---|---|---|
| 1.1 | Reescribir FAQ | `constants.ts`, `faq/page.tsx` | Preguntas del PDF §2.12.2 |
| 1.2 | Reescribir How to Buy Preview | `how-to-buy-preview.tsx` | 3 pasos: Wallet → Fondear → Comprar |
| 1.3 | Reescribir How to Buy Page | `how-to-buy/page.tsx` | Guía Solana/USDC |
| 1.4 | Corregir Trust Badges | `trust-badges.tsx`, `constants.ts` | Badges verificables |
| 1.5 | Eliminar Social Proof | `social-proof.tsx` | Testimonios anónimos |
| 1.6 | Corregir Live Purchases | `live-purchases.tsx` | Formato Solana + USDC |
| 1.7 | Corregir presale-starting-content | `presale-starting-content.tsx` | ETH→USDC |
| 1.8 | Corregir Terms | `terms/page.tsx` | Solana, no Ethereum |
| 1.9 | Corregir Privacy | `privacy/page.tsx` | Solana, no Ethereum |
| 1.10 | Corregir decimals | `tokenomics/page.tsx`, `buy/page.tsx` | Unificar a 6 |
| 1.11 | Corregir comentario ETH | `presale-config.ts` | "ETH minimo" → "USDC minimo" |

### Fase 2 — Header + Hero Rediseñados (P0)

| # | Acción | Archivos | Detalle |
|---|---|---|---|
| 2.1 | Reescribir Header | `header.tsx` | Nav del PDF + CTA |
| 2.2 | Reescribir Hero | `hero-section.tsx` | H1, subtítulo, métricas |
| 2.3 | Actualizar métricas | `hero-section.tsx` | 12+, 150kW, 5+, +10,000 |
| 2.4 | Cambiar CTA | `hero-section.tsx` | "Únete a la Preventa" |

### Fase 3 — Nuevas Secciones Core (P0)

| # | Acción | Archivos | Detalle |
|---|---|---|---|
| 3.1 | Problema/Oportunidad | `problem-section.tsx` | Datos UPME 2026 |
| 3.2 | Proyectos Reales | `projects-section.tsx`, `project-card.tsx` | Galería de proyectos |
| 3.3 | Ciclo del Token | `token-cycle-section.tsx` | Infografía 5 pasos |
| 3.4 | Valor del Token | `token-value-section.tsx` | 4 pilares |
| 3.5 | Mini-Granjas | `solar-farms-section.tsx` | Diagrama ciclo valor |
| 3.6 | Reordenar page.tsx | `page.tsx` | Orden del PDF |

### Fase 4 — Tokenomics / Roadmap / Team / FAQ (P1)

| # | Acción | Archivos | Detalle |
|---|---|---|---|
| 4.1 | Actualizar Tokenomics | `tokenomics-preview.tsx`, `token-allocation.tsx` | Colores del PDF |
| 4.2 | Crear Vesting Table | `vesting-table.tsx` | **Verificar vesting con equipo** |
| 4.3 | Actualizar Roadmap | `roadmap-preview.tsx`, `constants.ts` | Timeline del PDF |
| 4.4 | Actualizar Team | `team/page.tsx`, `constants.ts` | Datos reales |
| 4.5 | Actualizar Footer | `footer.tsx` | Descargos del PDF |
| 4.6 | Actualizar Tokenomics page | `tokenomics/page.tsx` | Datos completos |
| 4.7 | Actualizar Roadmap page | `roadmap/page.tsx` | Datos completos |

### Fase 5 — Diseño y Responsive (P2)

| # | Acción | Detalle |
|---|---|---|
| 5.1 | Paleta de colores | Tailwind + CSS globals |
| 5.2 | Tipografía | H1/H2/H3 según PDF |
| 5.3 | Responsive | Desktop/tablet/mobile |

### Fase 6 — QA Funcional (Presale)

Solo verificación, sin modificar lógica:
- Flujo de compra end-to-end
- Wallet connection (Phantom, Solflare)
- Claim flow
- Countdown

### Fase 7 — QA Contenido

Verificar todos los ítems del checklist §15.

### Fase 8 — Performance

- Optimizar imágenes (WebP/AVIF)
- Lazy loading
- Lighthouse ≥ 90

### Fase 9 — Revisión Final

- Review marketing, técnico, legal
- Deploy staging
- Prueba end-to-end

---

## 12. Priorización P0/P1/P2/P3

### P0 — Crítica

| # | Tarea | Archivos |
|---|---|---|
| 1 | Eliminar referencias Ethereum/MetaMask/ETH | 11+ archivos |
| 2 | Reescribir How to Buy (Solana/USDC) | `how-to-buy-preview.tsx`, `how-to-buy/page.tsx` |
| 3 | Reescribir FAQ (sin ETH) | `constants.ts`, `faq/page.tsx` |
| 4 | Corregir Trust Badges | `trust-badges.tsx`, `constants.ts` |
| 5 | Eliminar testimonios anónimos | `social-proof.tsx` |
| 6 | Corregir contadores mock | `hero-section.tsx`, `constants.ts` |
| 7 | Crear Sección Proyectos Reales | Nuevo componente |
| 8 | Reescribir Hero | `hero-section.tsx` |
| 9 | Corregir Terms y Privacy | `terms/page.tsx`, `privacy/page.tsx` |
| 10 | Corregir decimals | `tokenomics/page.tsx`, `buy/page.tsx` |

### P1 — Alta

| # | Tarea | Archivos |
|---|---|---|
| 11 | Reescribir Header | `header.tsx` |
| 12 | Crear Problema/Oportunidad | Nuevo componente |
| 13 | Crear Ciclo del Token | Nuevo componente |
| 14 | Crear Valor del Token | Nuevo componente |
| 15 | Crear Mini-Granjas | Nuevo componente |
| 16 | Actualizar Tokenomics | `tokenomics-preview.tsx`, `constants.ts` |
| 17 | Actualizar Roadmap | `roadmap-preview.tsx`, `constants.ts` |
| 18 | Actualizar Team | `team/page.tsx`, `constants.ts` |
| 19 | Actualizar Footer | `footer.tsx` |
| 20 | Corregir Live Purchases | `live-purchases.tsx` |
| 21 | Reordenar page.tsx | `page.tsx` |
| 22 | Actualizar paleta colores | `tailwind.config.ts`, CSS |
| 23 | Crear archivos data/ | `src/data/*.ts` |

### P2 — Media

| # | Tarea | Archivos |
|---|---|---|
| 24 | Crear Vesting Table | Nuevo componente |
| 25 | Verificar responsive | Todos los componentes |
| 26 | Optimizar imágenes | `public/projects/` |

### P3 — Baja

| # | Tarea | Archivos |
|---|---|---|
| 27 | Agregar Ledger wallets | `solana-provider.tsx` |
| 28 | Contadores on-chain real-time | `hero-section.tsx` |
| 29 | Eliminar dependencias no usadas | `package.json` |
| 30 | Testimonios reales (futuro) | `social-proof.tsx` |
| 31 | Internacionalización ES/EN | Múltiples |

---

## 13. Riesgos y Dependencias

### Riesgos Funcionales

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Romper flujo de compra | **Crítico** | NO modificar `presale-widget.tsx`, `anchor/*`, `use-wallet.ts` |
| Romper conexión wallet | **Crítico** | NO modificar `solana-provider.tsx` |
| Modificar contratos | **Crítico** | NO tocar `smart-contract/` |
| Romper routing | Alto | Verificar links tras reordenar `page.tsx` |

### Riesgos de Contenido

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Fotos proyectos no disponibles | **Bloqueante** | `CONTENT REQUIRED FROM MARKETING` |
| Datos equipo no disponibles | Alto | Placeholders temporales |
| CertiK no disponible | Alto | No mostrar badge |
| Vesting no verificable (3 rubros) | Alto | Confirmar con equipo |
| Fechas inconsistentes | Alto | Confirmar relación Seed Sale vs TGE |

### Dependencias

| Dependencia | Estado | Impacto |
|---|---|---|
| Fotos 12 proyectos | **Pendiente** | Bloquea Fase 3 |
| Datos equipo | **Pendiente** | Bloquea Fase 4 |
| Enlace CertiK | **Pendiente** | Afecta Fase 1 |
| Fechas oficiales | **Pendiente** | Afecta Fase 1 |
| Vesting 3 rubros | **Pendiente** | Afecta Fase 4 |

---

## 14. Información que Falta

### CONTENT REQUIRED FROM MARKETING

| # | Información | Urgencia |
|---|---|---|
| 1 | Fotos reales de 12 proyectos | **Crítica** |
| 2 | Datos de cada proyecto (tipo, ubicación, capacidad, inversor, MWh, estado) | **Crítica** |
| 3 | Enlace informe CertiK | **Crítica** |
| 4 | Confirmación "Solana Partner" | Alta |
| 5 | Texto sección Problema (datos UPME) | Alta |
| 6 | Testimonios reales o eliminar sección | Media |
| 7 | Logo alta resolución (SVG) | Media |
| 8 | Enlace Whitepaper | Media |
| 9 | URLs redes sociales | Media |
| 10 | Decisión badges sin evidencia | Alta |

### CONTENT REQUIRED FROM TEAM

| # | Información | Urgencia |
|---|---|---|
| 11 | Fotos profesionales del equipo | Alta |
| 12 | Nombres y cargos reales (Ilich Blanco CEO, Diego Rosas CTO) | **Crítica** |
| 13 | Biografías con experiencia | Alta |
| 14 | URLs LinkedIn reales | Alta |
| 15 | Decisión sobre asesores | Media |

### ⚠️ REQUIRES CONFIRMATION

| # | Información | Por qué no es verificable |
|---|---|---|
| 16 | Vesting Liquidez DEX (6 meses lock + liberación posterior) | PDF con formato corrupto. Contrato solo soporta lineal. |
| 17 | Vesting Tesorería/Ecosistema (¿Lock 24 meses + lineal 4 años?) | Información superpuesta en extracción PDF |
| 18 | Vesting Staking & Rewards (¿Lock 24 meses + emisión 5 años?) | Información superpuesta en extracción PDF |
| 19 | Relación Seed Sale (2025) vs TGE (Sept 2026) | PDF no explica explícitamente |
| 20 | Max Supply fijo (no mint adicional) | PDF lo menciona, no verificable en frontend |
| 21 | USDC Mint para producción | Actualmente dirección devnet |

---

## 15. Criterios de Aceptación

### Correcciones Críticas (P0)

- [ ] Sin referencias incorrectas a Ethereum como moneda de pago
- [ ] Sin referencias a MetaMask como wallet recomendada
- [ ] Sin direcciones 0x en UI pública
- [ ] Compra utiliza USDC en Solana
- [ ] Wallets mostradas: Phantom, Solflare, Backpack
- [ ] FAQ sin mencionar ETH
- [ ] Decimals unificados a 6
- [ ] Terms: "Solana blockchain"
- [ ] Privacy: "Solana wallet address"

### Contenido de Landing (P1)

- [ ] Header: Logo, Proyectos, Tokenomics, Roadmap, Equipo, Whitepaper, CTA "Únete a la Preventa"
- [ ] Hero H1: "Tokeniza el Futuro de la Energía Limpia"
- [ ] Hero subtítulo sobre Colombia
- [ ] Hero 4 métricas: 12+, 150kW, 5+, +10,000
- [ ] Hero badge "Built on Solana"
- [ ] Sección Problema/Oportunidad con datos UPME 2026
- [ ] Sección Proyectos Reales
- [ ] Sección Ciclo del Token (5 pasos)
- [ ] Sección Valor del Token (4 pilares)
- [ ] Sección Mini-Granjas Solares
- [ ] Tokenomics: 6 rubros con % correctos
- [ ] Tokenomics: tabla de vesting detallada
- [ ] Tokenomics: Supply 1B, Transfer Fee 1.5%, Max Supply Fijo
- [ ] Roadmap: 5 fases del PDF
- [ ] Roadmap: 2024-2026, Q4 2026-Q1 2027, 2027-2028, 2028-2030, 2030-2035
- [ ] Equipo: fotos, nombres, cargos, LinkedIn
- [ ] FAQ: 8 preguntas del PDF
- [ ] Footer: Logo, Enlaces, Social, Legal, Contacto
- [ ] Footer: descargos del PDF

### Badges y Confianza (P0)

- [ ] CertiK con enlace (o eliminado)
- [ ] KYC eliminado o "Auditoría en Progreso"
- [ ] "Solana Partner" verificado o "Construido sobre Solana"
- [ ] Sin testimonios anónimos
- [ ] Contadores con datos reales del piloto

### Responsive (P2)

- [ ] Desktop (1440px): 3 columnas
- [ ] Tablet (768px): 2 columnas
- [ ] Mobile (375px): 1 columna, touch-friendly

### Performance (P2)

- [ ] Lighthouse ≥ 90
- [ ] FCP < 1.5s
- [ ] LCP < 2.5s

### Funcionalidad (P0)

- [ ] Compra end-to-end funciona
- [ ] Phantom conecta
- [ ] Solflare conecta
- [ ] Countdown correcto
- [ ] Claim funciona
- [ ] Routing interno OK

---

## 16. Orden Recomendado

```
Fase 0 → Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6 → Fase 7 → Fase 8 → Fase 9
```

**Dependencias clave**:
- Fase 3 requiere fotos/datos de proyectos (Marketing)
- Fase 4 requiere datos del equipo + confirmación de vesting
- Fase 6 es solo verificación — sin cambios de lógica
- Fase 1 es independiente
