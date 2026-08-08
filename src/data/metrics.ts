export interface PilotMetric {
  key: string;
  value: string;
  label: string;
}

export const PILOT_METRICS: PilotMetric[] = [
  { key: "projects", value: "12", label: "Pilot Projects" },
  { key: "capacity", value: "150", label: "kW Tokenized" },
  { key: "hours", value: "+10,000", label: "Operating Hours" },
  { key: "months", value: "18", label: "Months of Pilot" },
];

export const INVESTOR_BRANDS = [
  "SMA",
  "Huawei",
  "Fronius",
  "SolarEdge",
];

export const INTEGRATORS_COUNT = "3+";
