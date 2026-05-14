import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_PRESALE_CONFIG, getActiveStage } from '@/config/presale-config'

interface PresaleState {
  // Stats
  totalRaised: number
  investors: number
  tokensSold: number
  
  // Configuración derivada de presale-config
  get currentStage(): number
  get currentPrice(): number
  get presaleEndDate(): Date
  get minPurchase(): number
  get maxPurchase(): number
  get isPresaleActive(): boolean
  
  // Actions
  updateStats: (stats: Partial<Pick<PresaleState, 'totalRaised' | 'investors' | 'tokensSold'>>) => void
  setStage: (stage: number) => void
  addInvestment: (amount: number, tokens: number) => void
}

export const usePresaleStore = create<PresaleState>()(
  persist(
    (set, get) => ({
      // Initial stats (mock data)
      totalRaised: 2847592,
      investors: 12847,
      tokensSold: 284759200,
      
      // Getters derivados de la configuración
      get currentStage() {
        // Usar el stage activo actual de la configuración por defecto
        const activeStage = getActiveStage(DEFAULT_PRESALE_CONFIG)
        return activeStage ? activeStage.id : DEFAULT_PRESALE_CONFIG.stages[0].id
      },
      
      get currentPrice() {
        const activeStage = getActiveStage(DEFAULT_PRESALE_CONFIG)
        return activeStage ? activeStage.price : DEFAULT_PRESALE_CONFIG.stages[0].price
      },
      
      get presaleEndDate() {
        const activeStage = getActiveStage(DEFAULT_PRESALE_CONFIG)
        return activeStage ? activeStage.endDate : DEFAULT_PRESALE_CONFIG.stages[0].endDate
      },
      
      get minPurchase() {
        const activeStage = getActiveStage(DEFAULT_PRESALE_CONFIG)
        return activeStage ? activeStage.minPurchase : DEFAULT_PRESALE_CONFIG.stages[0].minPurchase
      },
      
      get maxPurchase() {
        // Valor fijo por ahora, podría venir de configuración
        return 100
      },
      
      get isPresaleActive() {
        return getActiveStage(DEFAULT_PRESALE_CONFIG) !== null
      },
      
      // Actions
      updateStats: (stats) => set((state) => ({ ...state, ...stats })),
      
      setStage: (stage) => {
        // Esta acción ahora sería manejada por usePresaleConfig
        console.log('setStage deprecado - usar usePresaleConfig en su lugar')
      },
      
      addInvestment: (amount, tokens) => set((state) => ({
        totalRaised: state.totalRaised + (amount * get().currentPrice * 1000),
        investors: state.investors + 1,
        tokensSold: state.tokensSold + tokens,
      })),
    }),
    {
      name: 'presale-storage',
      partialize: (state) => ({
        totalRaised: state.totalRaised,
        investors: state.investors,
        tokensSold: state.tokensSold,
      }),
    }
  )
)

// Admin store for managing presale settings
interface AdminState {
  isAuthenticated: boolean
  
  // Configuración básica (mantenida por compatibilidad)
  tokenPrice: number
  stageName: string
  stageEndDate: Date
  stageActive: boolean
  
  // Acciones básicas
  login: (password: string) => boolean
  logout: () => void
  updateTokenPrice: (price: number) => void
  updateStage: (name: string, endDate: Date, active: boolean) => void
  
  // Nueva funcionalidad para gestión completa
  isEditingStage: boolean
  editingStageId: number | null
  startEditingStage: (stageId: number | null) => void
  cancelEditing: () => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      
      // Configuración básica (mantenida por compatibilidad)
      tokenPrice: 0.012,
      stageName: 'Pre-Sale Stage 1',
      stageEndDate: new Date('2025-02-28'),
      stageActive: true,
      
      // Nueva funcionalidad
      isEditingStage: false,
      editingStageId: null,
      
      login: (password: string) => {
        if (password === 'admin123') {
          set({ isAuthenticated: true })
          return true
        }
        return false
      },
      
      logout: () => set({ 
        isAuthenticated: false,
        isEditingStage: false,
        editingStageId: null 
      }),
      
      updateTokenPrice: (price) => set({ tokenPrice: price }),
      
      updateStage: (name, endDate, active) => set({
        stageName: name,
        stageEndDate: endDate,
        stageActive: active,
      }),
      
      startEditingStage: (stageId) => set({
        isEditingStage: true,
        editingStageId: stageId
      }),
      
      cancelEditing: () => set({
        isEditingStage: false,
        editingStageId: null
      }),
    }),
    {
      name: 'admin-storage',
    }
  )
)

// Referral store
interface ReferralState {
  referralCode: string
  bonusPercentage: number
  setReferralCode: (code: string) => void
  getReferralBonus: (amount: number) => number
}

export const useReferralStore = create<ReferralState>()(
  persist(
    (set, get) => ({
      referralCode: '',
      bonusPercentage: 5,
      
      setReferralCode: (code) => set({ referralCode: code }),
      
      getReferralBonus: (amount) => {
        return amount * (get().bonusPercentage / 100)
      },
    }),
    {
      name: 'referral-storage',
    }
  )
)
