// Token configuration - Gaia Ecotrack
export const TOKEN_CONFIG = {
  name: "Gaia Ecotrack",
  symbol: "GAIA",
  totalSupply: 1_000_000_000,
  decimals: 18,
  presaleAllocated: 400_000_000, // 40%
  softCap: 500_000, // $500K
  hardCap: 2_500_000, // $2.5M
  minPurchase: 0.01, // ETH
  maxPurchase: 50, // ETH
  contractAddress: "0xGaiaEcotrack123456789abcdef123456789" as `0x${string}`,
  network: "Vara Network",
};

// Presale stages - Movido a src/config/presale-config.ts
// Importar desde: import { DEFAULT_PRESALE_STAGES } from '@/config/presale-config'

// Tokenomics allocation
export const TOKENOMICS = {
  presale: { percentage: 40, label: "Presale", color: "#171717" },
  liquidity: { percentage: 15, label: "Liquidity Pool", color: "#404040" },
  team: { percentage: 12, label: "Team & Advisors", color: "#737373" },
  ecosystem: { percentage: 15, label: "Ecosystem Development", color: "#525252" },
  marketing: { percentage: 8, label: "Marketing", color: "#a3a3a3" },
  reserve: { percentage: 5, label: "Reserve", color: "#d4d4d4" },
  airdrop: { percentage: 5, label: "Community Rewards", color: "#e5e5e5" },
};

// Roadmap phases
export const ROADMAP_PHASES = [
  {
    id: 1,
    phase: "Q3 2024",
    title: "Foundation & Development",
    description: "Project conception, team formation, and initial smart contract development on Vara Network.",
    milestones: [
      "Project Ideation",
      "Team Assembly",
      "Vara Network Integration",
      "Smart Contract Development",
    ],
    completed: true,
  },
  {
    id: 2,
    phase: "Q4 2024",
    title: "Platform Alpha",
    description: "Alpha platform launch, energy tokenization system, and initial testing with pilot users.",
    milestones: [
      "Alpha Platform Launch",
      "Energy Tokenization System",
      "Pilot User Testing",
      "Security Audits",
    ],
    completed: true,
  },
  {
    id: 3,
    phase: "Q1 2025",
    title: "Token Presale",
    description: "GAIA token presale launch, community building, and strategic partnerships with solar energy providers.",
    milestones: [
      "Token Presale Launch",
      "Community Building",
      "Solar Provider Partnerships",
      "Beta Platform Release",
    ],
    completed: false,
    current: true,
  },
  {
    id: 4,
    phase: "Q2 2025",
    title: "Platform Launch",
    description: "Full platform launch with P2P energy marketplace, carbon credit integration, and mobile app.",
    milestones: [
      "Full Platform Launch",
      "P2P Energy Marketplace",
      "Carbon Credit System",
      "Mobile App Release",
    ],
    completed: false,
  },
  {
    id: 5,
    phase: "Q3-Q4 2025",
    title: "Global Expansion",
    description: "International expansion, integration with more renewable energy sources, and DAO governance.",
    milestones: [
      "Multi-region Launch",
      "Wind & Hydro Integration",
      "DAO Governance",
      "CEX Listings",
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
    bio: "Blockchain architect specialized in Rust and Gear Protocol. Former tech lead at major energy companies.",
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
    bio: "Full-stack developer with expertise in smart contracts and DeFi protocols on Vara Network.",
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
    bio: "Core contributor to Vara Network and Gear Protocol. Blockchain infrastructure expert.",
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
    answer: "Through smart contracts on Vara Network, Gaia Ecotrack verifies energy production from connected renewable sources (solar panels, wind turbines, etc.) and mints GAIA tokens for each verified kWh. This creates a transparent and traceable record of clean energy generation.",
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
    question: "Why is Gaia built on Vara Network?",
    answer: "Vara Network provides the ideal infrastructure for Gaia with its high throughput, low fees, and energy-efficient consensus mechanism. This aligns perfectly with our mission of promoting sustainable blockchain solutions.",
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
  chainId: 1, // Ethereum for presale
  name: "Ethereum",
  currency: "ETH",
  rpcUrl: "https://eth.llamarpc.com",
  blockExplorer: "https://etherscan.io",
  targetNetwork: "Vara Network",
};

// Security badges
export const SECURITY_BADGES = [
  { name: "Audited by CertiK", icon: "shield-check" },
  { name: "KYC Verified", icon: "user-check" },
  { name: "Vara Network Partner", icon: "file-check" },
  { name: "Carbon Neutral", icon: "leaf" },
];

// Supported wallets
export const SUPPORTED_WALLETS = [
  { name: "MetaMask", icon: "/wallets/metamask.svg" },
  { name: "WalletConnect", icon: "/wallets/walletconnect.svg" },
  { name: "Trust Wallet", icon: "/wallets/trust.svg" },
  { name: "Coinbase Wallet", icon: "/wallets/coinbase.svg" },
];

// Gaia specific features
export const GAIA_FEATURES = {
  energySources: ["Solar", "Wind", "Hydro", "Biomass"],
  supportedRegions: ["Latin America", "Europe", "North America"],
  carbonCredits: true,
  p2pMarketplace: true,
  mobileApp: true,
};
