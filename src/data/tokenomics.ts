export interface TokenomicsCategory {
  key: string;
  percentage: number;
  label: string;
  color: string;
  vesting: string;
}

export const TOKENOMICS_DATA: TokenomicsCategory[] = [
  {
    key: "ecosystem",
    percentage: 25,
    label: "Treasury / Ecosystem",
    color: "#737373",
    vesting: "Linear release 4 years, managed by DAO",
  },
  {
    key: "team",
    percentage: 20,
    label: "Team & Founders",
    color: "#00468C",
    vesting: "4 years, 12-month cliff, 5% annual from month 13",
  },
  {
    key: "presale",
    percentage: 20,
    label: "Public Presale",
    color: "#FF8C00",
    vesting: "6-month lock, 25% monthly release from month 7",
  },
  {
    key: "liquidity",
    percentage: 15,
    label: "DEX Liquidity",
    color: "#7C3AED",
    vesting: "24-month lock on Streamflow",
  },
  {
    key: "staking",
    percentage: 10,
    label: "Staking & Rewards",
    color: "#EAB308",
    vesting: "Programmed emission 5 years",
  },
  {
    key: "seed",
    percentage: 10,
    label: "Seed Investors",
    color: "#007820",
    vesting: "2 years, 6-month cliff, linear release",
  },
];

export const TOKENOMICS_PARAMS = {
  supplyTotal: 1_000_000_000,
  decimals: 6,
  transferFee: 1.5,
  transferFeeTreasury: 0.75,
  transferFeeStaking: 0.75,
  maxSupply: "Fixed — No additional minting",
};
