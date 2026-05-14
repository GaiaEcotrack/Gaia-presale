'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  PresaleConfig, 
  PresaleStageConfig, 
  DEFAULT_PRESALE_CONFIG,
  getActiveStage,
  getNextStage,
  updateStageInConfig,
  addStageToConfig,
  removeStageFromConfig,
  validateStageDates,
  isBeforeFirstSale,
  getFirstSaleStartDate,
  getDaysUntilFirstSale,
  formatCountdownDate
} from '@/config/presale-config'

interface PresaleConfigStore {
  // Configuración actual
  config: PresaleConfig
  
  // Acciones
  updateConfig: (updates: Partial<PresaleConfig>) => void
  updateStage: (stageId: number, updates: Partial<PresaleStageConfig>) => void
  addStage: (newStage: Omit<PresaleStageConfig, 'id'>) => void
  removeStage: (stageId: number) => void
  resetToDefault: () => void
  
  // Computed values
  activeStage: PresaleStageConfig | null
  nextStage: PresaleStageConfig | null
  isPresaleActive: boolean
  presaleEndDate: Date | null
  nextStageStartDate: Date | null
  
  // Pre-launch values
  isBeforeFirstSale: boolean
  firstSaleStartDate: Date | null
  daysUntilFirstSale: number
  formattedFirstSaleDate: string | null
}

export const usePresaleConfigStore = create<PresaleConfigStore>()(
  persist(
    (set, get) => ({
      // Configuración inicial
      config: DEFAULT_PRESALE_CONFIG,
      
      // Acciones
      updateConfig: (updates) => set((state) => ({
        config: { ...state.config, ...updates }
      })),
      
      updateStage: (stageId, updates) => set((state) => ({
        config: updateStageInConfig(state.config, stageId, updates)
      })),
      
      addStage: (newStage) => set((state) => ({
        config: addStageToConfig(state.config, newStage)
      })),
      
      removeStage: (stageId) => set((state) => ({
        config: removeStageFromConfig(state.config, stageId)
      })),
      
      resetToDefault: () => set({
        config: DEFAULT_PRESALE_CONFIG
      }),
      
      // Valores computados
      get activeStage() {
        return getActiveStage(get().config)
      },
      
      get nextStage() {
        return getNextStage(get().config)
      },
      
      get isPresaleActive() {
        return getActiveStage(get().config) !== null
      },
      
      get presaleEndDate() {
        const active = getActiveStage(get().config)
        return active ? active.endDate : null
      },
      
      get nextStageStartDate() {
        const next = getNextStage(get().config)
        return next ? next.startDate : null
      },
      
      // Pre-launch computed values
      get isBeforeFirstSale() {
        return isBeforeFirstSale(get().config)
      },
      
      get firstSaleStartDate() {
        return getFirstSaleStartDate(get().config)
      },
      
      get daysUntilFirstSale() {
        return getDaysUntilFirstSale(get().config)
      },
      
      get formattedFirstSaleDate() {
        const date = getFirstSaleStartDate(get().config)
        return formatCountdownDate(date)
      }
    }),
    {
      name: 'presale-config-storage',
      partialize: (state) => ({
        config: state.config
      })
    }
  )
)

// Hook principal para usar la configuración
export function usePresaleConfig() {
  const store = usePresaleConfigStore()
  
  return {
    // Estado
    config: store.config,
    activeStage: store.activeStage,
    nextStage: store.nextStage,
    isPresaleActive: store.isPresaleActive,
    presaleEndDate: store.presaleEndDate,
    nextStageStartDate: store.nextStageStartDate,
    
    // Pre-launch estado
    isBeforeFirstSale: store.isBeforeFirstSale,
    firstSaleStartDate: store.firstSaleStartDate,
    daysUntilFirstSale: store.daysUntilFirstSale,
    formattedFirstSaleDate: store.formattedFirstSaleDate,
    
    // Acciones
    updateConfig: store.updateConfig,
    updateStage: store.updateStage,
    addStage: store.addStage,
    removeStage: store.removeStage,
    resetToDefault: store.resetToDefault,
    
    // Helpers
    validateStageDates,
    
    // Convenience getters
    getStageById: (id: number) => {
      return store.config.stages.find(stage => stage.id === id) || null
    },
    
    getCurrentStage: () => {
      if (store.config.currentStageIndex >= 0 && 
          store.config.currentStageIndex < store.config.stages.length) {
        return store.config.stages[store.config.currentStageIndex]
      }
      return null
    },
    
    setCurrentStage: (stageId: number) => {
      const index = store.config.stages.findIndex(stage => stage.id === stageId)
      if (index !== -1) {
        store.updateConfig({ currentStageIndex: index })
      }
    }
  }
}

// Hook para usar en componentes que necesitan solo lectura
export function usePresaleConfigReadonly() {
  const store = usePresaleConfigStore()
  
  return {
    config: store.config,
    activeStage: store.activeStage,
    nextStage: store.nextStage,
    isPresaleActive: store.isPresaleActive,
    presaleEndDate: store.presaleEndDate,
    nextStageStartDate: store.nextStageStartDate,
    
    // Pre-launch estado
    isBeforeFirstSale: store.isBeforeFirstSale,
    firstSaleStartDate: store.firstSaleStartDate,
    daysUntilFirstSale: store.daysUntilFirstSale,
    formattedFirstSaleDate: store.formattedFirstSaleDate,
    
    getStageById: (id: number) => store.config.stages.find(stage => stage.id === id) || null
  }
}