export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export const FAQ_DATA: FaqItem[] = [
  {
    id: 1,
    question: "What is GAIA-E?",
    answer: "GAIA-E is a standard SPL Token representing 1 kWh of verified renewable energy.",
    category: "general",
  },
  {
    id: 2,
    question: "Why Solana?",
    answer: "Low costs ($0.0005/tx) and high transaction speed.",
    category: "technical",
  },
  {
    id: 3,
    question: "How is energy verified?",
    answer: "Through an IoT Oracle that connects to inverters and measures production every 15 minutes.",
    category: "technical",
  },
  {
    id: 4,
    question: "When will it be on exchanges?",
    answer: "GAIA will be listed on Solana DEXs (Orca, Raydium) in October 2026.",
    category: "tokens",
  },
  {
    id: 5,
    question: "What happens if a project stops producing?",
    answer: "The system is mint-and-burn. If a project stops producing, new tokens are simply not minted.",
    category: "technical",
  },
  {
    id: 6,
    question: "Where is the audit?",
    answer: "Audit in progress with CertiK. The public report will be available before the TGE.",
    category: "security",
  },
  {
    id: 7,
    question: "Who buys GAIA-E?",
    answer: "Companies that need to demonstrate renewable energy consumption to comply with environmental regulations.",
    category: "tokens",
  },
  {
    id: 8,
    question: "How does the regulatory framework affect it?",
    answer: "Gaia operates within the Colombian framework. It is not an energy retailer, but a platform for tokenizing environmental attributes.",
    category: "regulatory",
  },
];
