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
  contractAddress: "5aXDAUUjG8HbZ8YXmrPx5kA9U1usqiyKSFhL4eY3bwLS",
  network: "Solana",
};

// Presale stages - Moved to src/config/presale-config.ts
// Import from: import { DEFAULT_PRESALE_STAGES } from '@/config/presale-config'

// Tokenomics allocation — Colors: PDF §2.9.3
export const TOKENOMICS = {
  ecosystem: { percentage: 25, label: "Treasury / Ecosystem", color: "#737373" },
  team: { percentage: 20, label: "Team & Founders", color: "#00468C" },
  presale: { percentage: 20, label: "Public Presale", color: "#FF8C00" },
  liquidity: { percentage: 15, label: "DEX Liquidity", color: "#7C3AED" },
  staking: { percentage: 10, label: "Staking & Rewards", color: "#EAB308" },
  seed: { percentage: 10, label: "Seed Investors", color: "#007820" },
};

// Roadmap phases — Source: PDF §2.10.3 Cuadro 2.12
export { ROADMAP_DATA as ROADMAP_PHASES } from '@/data/roadmap';

// Team members — Source: PDF §2.11.3 Cuadro 2.14
export const TEAM_MEMBERS = [
  {
    id: 1,
    name: "Ilich Blanco",
    role: "CEO & Founder",
    bio: "Project Manager and technical orchestrator with over a decade of experience structuring technological business models. Specialist in team leadership and Web3 solution architecture.",
    photo: "/team/ilich-blanco.jpg",
    linkedin: "https://www.linkedin.com/in/ilichblanco",
    twitter: null,
  },
  {
    id: 2,
    name: "Diego Rosas",
    role: "CTO",
    bio: "Blockchain Development (Rust, Solana), IoT Architecture.",
    photo: "/team/diego-rosas.jpeg",
    linkedin: null,
    twitter: null,
  },
  {
    id: 3,
    name: "Julián Vélez",
    role: "CGO",
    bio: "Believes firmly in energy democratization. Mission: act as the great nexus — connecting technology with renewable energy generation clients, weaving alliances with public entities and participating in technology and energy sector forums.",
    photo: "/team/julian-velez.jpeg",
    linkedin: "https://www.linkedin.com/in/jvgaiaecotrack890130",
    twitter: null,
  },
  {
    id: 4,
    name: "José Nicolás Villagra",
    role: "Team Lead",
    bio: "Full Stack Developer and Blockchain Engineer specialized in Solana, Rust, Anchor, TypeScript. Leads technical definition and ecosystem development, coordinating smart contract implementation, tokenomics, presale, security and platform architecture.",
    photo: "/team/nicolas-villagra.jpeg",
    linkedin: "https://www.linkedin.com/in/jose-nicolas-villagra",
    twitter: null,
  },
];

// Advisors — No confirmed data in PDF
export const ADVISORS: Array<{
  id: number;
  name: string;
  role: string;
  bio: string;
  linkedin: string | null;
}> = [];

// FAQ data — Source: PDF §2.12.2 Cuadro 2.15
export { FAQ_DATA } from '@/data/faq';

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
import { getSolscanAddressUrl } from "@/lib/solana/explorer";

export const NETWORK_CONFIG = {
  chainId: 0,
  name: "Solana Devnet",
  currency: "SOL",
  rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC ?? "https://api.devnet.solana.com",
  // Explorer links are centralized in src/lib/solana/explorer.ts (Solscan
  // primary, cluster-driven). This base is derived through the same helper.
  blockExplorerBase: (() => {
    const url = getSolscanAddressUrl("0");
    return url.replace(/\/account\/0.*$/, "");
  })(),
  targetNetwork: "Solana",
};

// Security badges — Verifiable or removed per PDF §1.3.2
export const SECURITY_BADGES = [
  { name: "Audit in Progress", icon: "shield-check" },
  { name: "Verified Team", icon: "user-check" },
  { name: "Built on Solana", icon: "file-check" },
  { name: "Renewable Energy", icon: "leaf" },
];

// Supported wallets — Solana wallets
export const SUPPORTED_WALLETS = [
  { name: "Phantom", icon: "/wallets/phantom.svg" },
  { name: "Solflare", icon: "/wallets/solflare.svg" },
  { name: "Backpack", icon: "/wallets/backpack.svg" },
];

// Gaia specific features
export const GAIA_FEATURES = {
  energySources: ["Solar", "Wind", "Hydro", "Biomass"],
  supportedRegions: ["Latin America", "Europe", "North America"],
  carbonCredits: true,
  p2pMarketplace: true,
  mobileApp: true,
};
