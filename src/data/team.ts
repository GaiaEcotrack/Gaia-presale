export interface TeamMember {
  id: number;
  name: string;
  role: string;
  specialty: string;
  experience: string | null;
  photo: string | null;
  linkedin: string | null;
}

export const TEAM_DATA: TeamMember[] = [
  {
    id: 1,
    name: "Ilich Blanco",
    role: "CEO & Founder",
    specialty: "Strategy, Renewable Energy, Tokenization",
    experience: "Project Manager and technical orchestrator with over a decade of experience structuring technological business models. Specialist in team leadership and Web3 solution architecture, leading Gaia Ecotrack's comprehensive execution to ensure perfect integration between physical solar infrastructure and the blockchain ecosystem.",
    photo: "/team/ilich-blanco.jpg",
    linkedin: "https://www.linkedin.com/in/ilichblanco",
  },
  {
    id: 2,
    name: "Diego Rosas",
    role: "CTO",
    specialty: "Blockchain Development (Rust, Solana), IoT Architecture",
    experience: null,
    photo: null,
    linkedin: null,
  },
  {
    id: 3,
    name: "Julián Vélez",
    role: "CGO",
    specialty: "Business Development, Partnerships, Energy Sector",
    experience: "CGO of Gaia Ecotrack. Believes firmly in energy democratization and that technological innovation has the power to change the world. Mission: act as the great nexus — connecting technology with renewable energy generation clients, weaving alliances with public entities, associations, reference groups, ambassadors, and actively participating in technology and energy sector forums and events.",
    photo: "/team/julian-velez.jpeg",
    linkedin: "https://www.linkedin.com/in/jvgaiaecotrack890130",
  },
  {
    id: 4,
    name: "José Nicolás Villagra",
    role: "Team Lead",
    specialty: "Full Stack Development, Blockchain Engineering (Solana, Rust, Anchor)",
    experience: "Full Stack Developer and Blockchain Engineer with experience in Web3 solution development, specialized in Solana, Rust, Anchor, TypeScript and backend/frontend architectures. As Team Lead of Gaia Ecotrack, leads technical definition and ecosystem development, coordinating smart contract implementation, tokenomics, presale, security and platform architecture.",
    photo: "/team/nicolas-villagra.jpeg",
    linkedin: "https://www.linkedin.com/in/jose-nicolas-villagra",
  },
];
