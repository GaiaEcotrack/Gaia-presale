// Token configuration - Gaia Ecotrack
export const TOKEN_CONFIG = {
  name: "Gaia Ecotrack",
  symbol: "GAIA",
  totalSupply: 1_000_000_000,
  decimals: 6,
  presaleAllocated: 200_000_000, // 20%
  softCap: 500_000, // $500K
  hardCap: 2_500_000, // $2.5M
  minPurchase: 10, // USDC
  maxPurchase: 100_000, // USDC
  contractAddress: "6Pez7dr7vaZdxtgbsboLT3FmVDaS4JgqJE7AquoXmF24",
  network: "Solana",
};

// Presale stages - Movido a src/config/presale-config.ts
// Importar desde: import { DEFAULT_PRESALE_STAGES } from '@/config/presale-config'

// Tokenomics allocation
export const TOKENOMICS = {
  ecosystem: { percentage: 25, label: "Ecosystem Treasury", color: "#525252" },
  team: { percentage: 20, label: "Team & Founders", color: "#737373" },
  presale: { percentage: 20, label: "Public Presale", color: "#171717" },
  liquidity: { percentage: 15, label: "DEX Liquidity", color: "#404040" },
  staking: { percentage: 10, label: "Staking Rewards", color: "#a3a3a3" },
  seed: { percentage: 10, label: "Seed Investors", color: "#d4d4d4" },
};

// Roadmap phases
export const ROADMAP_PHASES = [
  {
    id: 1,
    phase: "2023–2026",
    title: "Phase 0 — Validation & Legal Shield",
    description: "12-project pilot (150 kW); Solana migration; 6+ MW in onboarding; legal opinions from SFC, CREG and DIAN; MoU with authorized trader and carbon operator.",
    milestones: [
      "12-project pilot (150 kW)",
      "Solana migration",
      "6+ MW in onboarding",
      "Legal opinions from SFC, CREG and DIAN",
      "MoU with authorized trader and carbon operator",
    ],
    completed: true,
  },
  {
    id: 2,
    phase: "2026–2027",
    title: "Phase 1 — Launch & Consolidation",
    description: "Token Launch (GAIA & GAIA-E) — September 2026. Commercial launch of platform 2.0. Distributor integration. I-REC module. First proprietary mini solar farm (1 MW).",
    milestones: [
      "Token Launch (GAIA & GAIA-E) — September 2026",
      "Commercial launch of platform 2.0",
      "Distributor integration",
      "I-REC module",
      "First proprietary mini solar farm (1 MW)",
    ],
    completed: false,
    current: true,
  },
  {
    id: 3,
    phase: "2028–2030",
    title: "Phase 2 — LATAM Expansion",
    description: "Regional expansion with presence in Chile (350 MW), Mexico (350 MW), Brazil (350 MW) and Peru (150 MW).",
    milestones: [
      "Chile (350 MW)",
      "Mexico (350 MW)",
      "Brazil (350 MW)",
      "Peru (150 MW)",
    ],
    completed: false,
  },
  {
    id: 4,
    phase: "2030–2035",
    title: "Phase 3 — Global Expansion & DAO",
    description: "Expansion to Southeast Asia (250 MW), Africa (200 MW) and Europe (150 MW). DAO activation (mid-2030).",
    milestones: [
      "Southeast Asia (250 MW)",
      "Africa (200 MW)",
      "Europe (150 MW)",
      "DAO activation (mid-2030)",
    ],
    completed: false,
  },
  {
    id: 5,
    phase: "2035",
    title: "Global Target",
    description: "2,000 MW tokenized. 100,000 self-generators. 9 operational countries. $18M USD annual revenue.",
    milestones: [
      "2,000 MW tokenized",
      "100,000 self-generators",
      "9 operational countries",
      "$18M USD annual revenue",
    ],
    completed: false,
  },
];

// Team members
export const TEAM_MEMBERS = [
  {
    id: 1,
    name: "María García",
    role: "CEO & Co-Founder",
    bio: "Environmental engineer with 10+ years in renewable energy projects and sustainable development.",
    linkedin: "#",
    twitter: "#",
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    role: "CTO & Co-Founder",
    bio: "Blockchain architect specialized in Rust and Solana program development. Former tech lead at major energy companies.",
    linkedin: "#",
    twitter: "#",
  },
  {
    id: 3,
    name: "Ana Martínez",
    role: "Head of Sustainability",
    bio: "Climate scientist and carbon markets expert with experience in UN environmental programs.",
    linkedin: "#",
    twitter: "#",
  },
  {
    id: 4,
    name: "Diego López",
    role: "Lead Developer",
    bio: "Full-stack developer with expertise in smart contracts and DeFi protocols on Solana.",
    linkedin: "#",
    twitter: "#",
  },
  {
    id: 5,
    name: "Laura Sánchez",
    role: "CMO",
    bio: "Marketing specialist with successful launches of sustainable tech projects and green initiatives.",
    linkedin: "#",
    twitter: "#",
  },
  {
    id: 6,
    name: "Pablo Fernández",
    role: "Community Manager",
    bio: "Web3 community builder with experience managing crypto communities across Latin America.",
    linkedin: "#",
    twitter: "#",
  },
];

// Advisors
export const ADVISORS = [
  {
    id: 1,
    name: "Roberto Chen",
    role: "Strategic Advisor",
    bio: "Former Director of Renewable Energy at World Bank. Expert in sustainable finance.",
    linkedin: "#",
  },
  {
    id: 2,
    name: "Elena Torres",
    role: "Technical Advisor",
    bio: "Core contributor to Solana ecosystem. Blockchain infrastructure expert.",
    linkedin: "#",
  },
  {
    id: 3,
    name: "Andrés Molina",
    role: "Business Advisor",
    bio: "Serial entrepreneur in clean tech. Founded multiple successful green energy startups.",
    linkedin: "#",
  },
];

// FAQ data
export const FAQ_DATA = [
  {
    id: 1,
    question: "What is Gaia Ecotrack?",
    answer: "Gaia Ecotrack is a pioneering platform that tokenizes renewable energy. We enable users with solar panels or other renewable energy systems to convert each kilowatt-hour produced into GAIA tokens that can be exchanged, sold in P2P markets, or used to obtain carbon credits.",
    category: "general",
  },
  {
    id: 2,
    question: "How does energy tokenization work?",
    answer: "Through smart contracts on Solana, Gaia Ecotrack verifies energy production from connected renewable sources (solar panels, wind turbines, etc.) and mints GAIA tokens for each verified kWh. This creates a transparent and traceable record of clean energy generation.",
    category: "technical",
  },
  {
    id: 3,
    question: "What can I do with GAIA tokens?",
    answer: "GAIA tokens can be traded on secondary markets, used to purchase carbon credits, exchanged for other cryptocurrencies, or held for potential appreciation. They represent proof of renewable energy generation and support the green economy.",
    category: "tokens",
  },
  {
    id: 4,
    question: "Why is Gaia built on Solana?",
    answer: "Solana provides the ideal infrastructure for Gaia with its high throughput, low fees, and energy-efficient consensus mechanism. This aligns perfectly with our mission of promoting sustainable blockchain solutions.",
    category: "technical",
  },
  {
    id: 5,
    question: "How do I participate in the presale?",
    answer: "Simply connect your Web3 wallet, enter the amount you wish to invest, and confirm the transaction. After the presale, you'll be able to claim your GAIA tokens. Make sure to have ETH or USDT in your wallet.",
    category: "presale",
  },
  {
    id: 6,
    question: "What is the minimum investment?",
    answer: "The minimum investment varies by stage. Currently, the minimum is 0.5 ETH for the Private Sale stage. Check the presale widget for the most current requirements.",
    category: "investment",
  },
  {
    id: 7,
    question: "When will I receive my tokens?",
    answer: "Tokens will be distributed within 48 hours after each presale stage concludes. A portion will be unlocked immediately (25% at TGE), with the rest following a 6-month vesting schedule.",
    category: "tokens",
  },
  {
    id: 8,
    question: "Is there a referral program?",
    answer: "Yes! We offer a 5% bonus in GAIA tokens for both referrer and referee. Share your unique referral link after connecting your wallet to participate.",
    category: "bonus",
  },
];

// Social links
export const SOCIAL_LINKS = {
  telegram: "https://t.me/gaiaecotrack",
  twitter: "https://twitter.com/Gaia_Ecotrack",
  discord: "https://discord.gg/gaiaecotrack",
  medium: "https://medium.com/@gaiaecotrack",
  linkedin: "https://linkedin.com/company/gaia-ecotrack",
  instagram: "https://instagram.com/gaiaecotrack",
  github: "https://github.com/gaiaecotrack",
};

// Stats
export const MOCK_STATS = {
  totalRaised: 1247592,
  investors: 4872,
  tokensSold: 124759200,
  currentPrice: 0.012,
  targetRaise: 2500000,
  energyTokenized: 5000000, // kWh
};

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 0,
  name: "Solana Devnet",
  currency: "SOL",
  rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC ?? "https://api.devnet.solana.com",
  blockExplorer: "https://explorer.solana.com",
  targetNetwork: "Solana",
};

// Security badges
export const SECURITY_BADGES = [
  { name: "Audited by CertiK", icon: "shield-check" },
  { name: "KYC Verified", icon: "user-check" },
  { name: "Solana Partner", icon: "file-check" },
  { name: "Carbon Neutral", icon: "leaf" },
];

// Supported wallets
export const SUPPORTED_WALLETS = [
  { name: "Phantom", icon: "/wallets/phantom.svg" },
  { name: "Solflare", icon: "/wallets/solflare.svg" },
];

// Gaia specific features
export const GAIA_FEATURES = {
  energySources: ["Solar", "Wind", "Hydro", "Biomass"],
  supportedRegions: ["Latin America", "Europe", "North America"],
  carbonCredits: true,
  p2pMarketplace: true,
  mobileApp: true,
};
