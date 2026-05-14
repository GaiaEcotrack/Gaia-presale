// Configuración centralizada del presale
// Este archivo contiene toda la configuración de stages, fechas y precios

export interface PresaleStageConfig {
  id: number
  name: string
  price: number // USD por token
  bonus: number // Porcentaje de bonus
  minPurchase: number // ETH mínimo
  startDate: Date
  endDate: Date
  supply: number // Tokens disponibles en este stage
  sold: number // Tokens ya vendidos
  active?: boolean // Si el stage está activo (calculado dinámicamente)
}

export interface PresaleConfig {
  stages: PresaleStageConfig[]
  currentStageIndex: number // Índice del stage activo actualmente
  autoAdvance: boolean // Si avanza automáticamente al siguiente stage
}

// Configuración por defecto - Stages del presale
export const DEFAULT_PRESALE_STAGES: PresaleStageConfig[] = [
  {
    id: 1,
    name: "Seed Sale",
    price: 0.008,
    bonus: 30,
    minPurchase: 1,
    startDate: new Date("2026-09-09T00:00:00"),
    endDate: new Date("2026-10-09T23:59:59"),
    supply: 80_000_000,
    sold: 45_000_000,
  },
  {
    id: 2,
    name: "Private Sale",
    price: 0.012,
    bonus: 20,
    minPurchase: 0.5,
    startDate: new Date("2026-10-10T00:00:00"),
    endDate: new Date("2026-11-09T23:59:59"),
    supply: 120_000_000,
    sold: 35_000_000,
  },
  {
    id: 3,
    name: "Public Sale",
    price: 0.018,
    bonus: 10,
    minPurchase: 0.1,
    startDate: new Date("2026-11-10T00:00:00"),
    endDate: new Date("2026-12-09T23:59:59"),
    supply: 150_000_000,
    sold: 0,
  },
  {
    id: 4,
    name: "Final Sale",
    price: 0.025,
    bonus: 0,
    minPurchase: 0.01,
    startDate: new Date("2026-12-10T00:00:00"),
    endDate: new Date("2027-01-09T23:59:59"),
    supply: 50_000_000,
    sold: 0,
  },
]

// Configuración por defecto completa
export const DEFAULT_PRESALE_CONFIG: PresaleConfig = {
  stages: DEFAULT_PRESALE_STAGES,
  currentStageIndex: 0, // Seed Sale (índice 0, id: 1)
  autoAdvance: true,
}

// Helper functions
export function getActiveStage(config: PresaleConfig): PresaleStageConfig | null {
  const now = new Date()
  
  for (let i = 0; i < config.stages.length; i++) {
    const stage = config.stages[i]
    if (now >= stage.startDate && now <= stage.endDate) {
      return stage
    }
  }
  
  return null
}

export function getNextStage(config: PresaleConfig): PresaleStageConfig | null {
  const now = new Date()
  
  for (let i = 0; i < config.stages.length; i++) {
    const stage = config.stages[i]
    if (now < stage.startDate) {
      return stage
    }
  }
  
  return null
}

export function getStageById(config: PresaleConfig, id: number): PresaleStageConfig | null {
  return config.stages.find(stage => stage.id === id) || null
}

export function updateStageInConfig(
  config: PresaleConfig, 
  stageId: number, 
  updates: Partial<PresaleStageConfig>
): PresaleConfig {
  return {
    ...config,
    stages: config.stages.map(stage => 
      stage.id === stageId ? { ...stage, ...updates } : stage
    )
  }
}

export function addStageToConfig(
  config: PresaleConfig,
  newStage: Omit<PresaleStageConfig, 'id'>
): PresaleConfig {
  const maxId = Math.max(...config.stages.map(s => s.id), 0)
  const stageWithId: PresaleStageConfig = {
    ...newStage,
    id: maxId + 1
  }
  
  return {
    ...config,
    stages: [...config.stages, stageWithId].sort((a, b) => 
      a.startDate.getTime() - b.startDate.getTime()
    )
  }
}

export function removeStageFromConfig(
  config: PresaleConfig,
  stageId: number
): PresaleConfig {
  return {
    ...config,
    stages: config.stages.filter(stage => stage.id !== stageId)
  }
}

// Validación de fechas
export function validateStageDates(stage: PresaleStageConfig): string[] {
  const errors: string[] = []
  
  if (stage.startDate >= stage.endDate) {
    errors.push("La fecha de inicio debe ser anterior a la fecha de fin")
  }
  
  if (stage.supply <= 0) {
    errors.push("El supply debe ser mayor a 0")
  }
  
  if (stage.sold < 0) {
    errors.push("Los tokens vendidos no pueden ser negativos")
  }
  
  if (stage.sold > stage.supply) {
    errors.push("Los tokens vendidos no pueden superar el supply")
  }
  
  if (stage.price <= 0) {
    errors.push("El precio debe ser mayor a 0")
  }
  
  if (stage.bonus < 0 || stage.bonus > 100) {
    errors.push("El bonus debe estar entre 0 y 100")
  }
  
  return errors
}

// Formateo para UI
export function formatStageDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Funciones para pre-lanzamiento
export function isBeforeFirstSale(config: PresaleConfig): boolean {
  const now = new Date()
  const firstStage = config.stages[0] // Primer stage (Seed Sale)
  return now < firstStage.startDate
}

export function getFirstSaleStartDate(config: PresaleConfig): Date {
  return config.stages[0].startDate
}

export function getDaysUntilFirstSale(config: PresaleConfig): number {
  const now = new Date()
  const firstSaleDate = getFirstSaleStartDate(config)
  const diffTime = firstSaleDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function formatCountdownDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  })
}