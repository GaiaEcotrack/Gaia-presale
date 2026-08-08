export interface RoadmapPhase {
  id: number;
  phase: string;
  title: string;
  description: string;
  milestones: string[];
  completed: boolean;
  current: boolean;
}

export const ROADMAP_DATA: RoadmapPhase[] = [
  {
    id: 1,
    phase: "2024–2026",
    title: "Phase 0 — Pilot & Validation",
    description:
      "18-month pilot with 12 projects, 150 kW tokenized. Business model validation with SMA, Huawei, Fronius and SolarEdge inverters.",
    milestones: [
      "12 pilot projects (150 kW)",
      "18 months of continuous operation",
      "+10,000 hours of verified energy",
      "Brands: SMA, Huawei, Fronius, SolarEdge",
    ],
    completed: true,
    current: false,
  },
  {
    id: 2,
    phase: "Q4 2026 – Q1 2027",
    title: "Phase 1 — TGE & Launch",
    description:
      "Token Generation Event (September 2026). Listing on Solana DEXs (Orca, Raydium). Launch of community governance.",
    milestones: [
      "TGE — September 2026",
      "DEX Listing (Orca, Raydium) — October 2026",
      "Governance Launch — November 2026",
      "Platform 2.0 in production",
    ],
    completed: false,
    current: true,
  },
  {
    id: 3,
    phase: "2027–2028",
    title: "Phase 2 — Regional Expansion",
    description:
      "First Mini Solar Farm (1 MW). Target of 200 MW tokenized. Integration with energy distributors and I-REC module.",
    milestones: [
      "First Mini Solar Farm (1 MW)",
      "Target 200 MW tokenized",
      "Distributor integration",
      "I-REC certificate module",
    ],
    completed: false,
    current: false,
  },
  {
    id: 4,
    phase: "2028–2030",
    title: "Phase 3 — LATAM",
    description:
      "Regional expansion with presence in Chile, Mexico, Brazil and Peru. Platform operating in multiple countries.",
    milestones: [
      "Chile — 350 MW",
      "Mexico — 350 MW",
      "Brazil — 350 MW",
      "Peru — 150 MW",
    ],
    completed: false,
    current: false,
  },
  {
    id: 5,
    phase: "2030–2035",
    title: "Phase 4 — Global & DAO",
    description:
      "Expansion to South Africa, Indonesia and Europe. Full DAO activation. 5,000 self-generators on the platform.",
    milestones: [
      "South Africa — 200 MW",
      "Indonesia — 250 MW",
      "Europe — 150 MW",
      "DAO Activation",
      "5,000 self-generators",
    ],
    completed: false,
    current: false,
  },
];
