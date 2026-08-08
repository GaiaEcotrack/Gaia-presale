export interface Project {
  id: number;
  foto: string;
  tipo: string;
  ubicacion: string;
  capacidad: string;
  tecnologia: string;
  inversor: string;
  energiaAnual: string;
  anio: number;
  estado: "tokenizando" | "enConexion" | "proximo";
  descripcion: string;
}

export const PROJECTS_DATA: Project[] = [
  {
    id: 1,
    foto: "/projects/san-jeronimo.jpeg",
    tipo: "Residential",
    ubicacion: "San Jerónimo, Antioquia",
    capacidad: "4.88 kWp",
    tecnologia: "8 JA SOLAR 610W modules",
    inversor: "Growatt MIN 6000TL-X2",
    energiaAnual: "7.3 MWh",
    anio: 2024,
    estado: "tokenizando",
    descripcion:
      "On-grid system connected to the grid with surplus energy sales, RETIE certification and Growatt monitoring. First pilot project with satellite imagery available.",
  },
  {
    id: 2,
    foto: "/projects/dagaz-suite.jpeg",
    tipo: "Commercial",
    ubicacion: "Bucaramanga, Santander",
    capacidad: "60 kW",
    tecnologia: "Bifacial solar modules",
    inversor: "Solis-60K-LV-5G",
    energiaAnual: "90 MWh",
    anio: 2024,
    estado: "tokenizando",
    descripcion:
      "High-capacity commercial installation in urban area with three-phase 60kW inverter and mounting structure designed to maximize solar capture.",
  },
  {
    id: 3,
    foto: "/projects/sachar-apartahotel.jpeg",
    tipo: "Commercial",
    ubicacion: "Bucaramanga, Santander",
    capacidad: "5.38 kWp",
    tecnologia: "12 QCELL 325W + 4 ZNSHINE 375W modules",
    inversor: "3 Apsystem YC1000 microinverters",
    energiaAnual: "8.1 MWh",
    anio: 2019,
    estado: "tokenizando",
    descripcion:
      "Company's first project, installed at an apart-hotel with bidirectional meter and Apsystem monitoring. Over 5 years of continuous operation.",
  },
  {
    id: 4,
    foto: "/projects/barrancabermeja.jpeg",
    tipo: "Residential",
    ubicacion: "Barrancabermeja, Santander",
    capacidad: "4.3 kWp",
    tecnologia: "10 QCELL 430W modules",
    inversor: "3 Hoymiles MI1500 microinverters",
    energiaAnual: "6.5 MWh",
    anio: 2020,
    estado: "tokenizando",
    descripcion:
      "Grid-connected residential system with surplus energy sales, RETIE certification and real-time Hoymiles monitoring.",
  },
  {
    id: 5,
    foto: "/projects/carmen-de-chucuri.jpeg",
    tipo: "Off-Grid Rural",
    ubicacion: "Carmen de Chucurí, Santander",
    capacidad: "1.05 kWp",
    tecnologia: "3 ZNSHINE 335W Polycrystalline modules",
    inversor: "Project Cientif 2000W Pure Sine Wave",
    energiaAnual: "1.6 MWh",
    anio: 2020,
    estado: "tokenizando",
    descripcion:
      "Off-grid autonomous system with KAISE 155AH 24V battery bank and 30A PWM charge controller. Powering rural area without access to the electrical grid.",
  },
  {
    id: 6,
    foto: "/projects/nexans-giron.jpeg",
    tipo: "Industrial",
    ubicacion: "Girón, Santander",
    capacidad: "45.36 kWp",
    tecnologia: "84 JA SOLAR 540W modules",
    inversor: "2 Growatt MAC20 KTL3-X inverters",
    energiaAnual: "68 MWh",
    anio: 2021,
    estado: "enConexion",
    descripcion:
      "Large-scale industrial installation for manufacturing plant with bidirectional meter and full RETIE certification.",
  },
  {
    id: 7,
    foto: "/projects/villa-alicia.jpeg",
    tipo: "Commercial Tourism",
    ubicacion: "Mesa de los Santos, Santander",
    capacidad: "5.3 kWp",
    tecnologia: "10 ZNSHINE 530W modules",
    inversor: "Growatt MIN5000 TL-X",
    energiaAnual: "8 MWh",
    anio: 2021,
    estado: "tokenizando",
    descripcion:
      "Photovoltaic system for tourist complex at Mesa de los Santos, grid-connected with surplus energy sales and remote monitoring.",
  },
  {
    id: 8,
    foto: "/projects/puerto-parra.jpeg",
    tipo: "Agroindustrial",
    ubicacion: "Puerto Parra, Santander",
    capacidad: "12.42 kWp",
    tecnologia: "26 QCELL 425W modules",
    inversor: "Solis 10kW three-phase 4G-LV",
    energiaAnual: "18.6 MWh",
    anio: 2022,
    estado: "tokenizando",
    descripcion:
      "Agroindustrial project with three-phase grid-connected system designed for rural homes with surplus energy delivery and Solis monitoring.",
  },
  {
    id: 9,
    foto: "/projects/upb-floridablanca.jpeg",
    tipo: "Institutional",
    ubicacion: "Floridablanca, Santander",
    capacidad: "44.77 kWp",
    tecnologia: "74 Canadian Solar 605W modules",
    inversor: "Growatt MAC 50",
    energiaAnual: "67.2 MWh",
    anio: 2023,
    estado: "enConexion",
    descripcion:
      "Installation for Universidad Pontificia Bolivariana, the largest institutional project in the portfolio with surplus energy sales to the grid.",
  },
  {
    id: 10,
    foto: "/projects/colegio-regio-amelia.jpeg",
    tipo: "Institutional",
    ubicacion: "Bucaramanga, Santander",
    capacidad: "8.4 kWp",
    tecnologia: "12 Canadian Solar 700W Bifacial modules",
    inversor: "Growatt MID8KTL3-XL2",
    energiaAnual: "12.6 MWh",
    anio: 2024,
    estado: "tokenizando",
    descripcion:
      "System for Colegio Regio Amelia with latest-generation bifacial modules, maximizing energy capture through roof reflectance.",
  },
  {
    id: 11,
    foto: "/projects/edificio-monticello.jpeg",
    tipo: "Hybrid Residential",
    ubicacion: "Floridablanca, Santander",
    capacidad: "3.24 kWp",
    tecnologia: "6 ECO GREEN ENERGY 540W modules",
    inversor: "Growatt SPF 6000T + 3 AXE 5.0L batteries",
    energiaAnual: "4.9 MWh",
    anio: 2022,
    estado: "tokenizando",
    descripcion:
      "Hybrid system with lithium battery storage for penthouse apartment, includes terrace-type structure as habitable space.",
  },
];

// Source: SACHAR SAS ESP photovoltaic presentation (2024)
// 28 total projects documented in docs/Proyects/
// 11 projects selected for the landing page (all with photos)
