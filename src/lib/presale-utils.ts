import { DEFAULT_PRESALE_STAGES } from '@/config/presale-config'

export interface PresaleStatus {
  currentStage: number | null
  nextStage: number | null
  isPresaleActive: boolean
  timeToNextStart: number | null // milliseconds until next stage starts
  timeToCurrentEnd: number | null // milliseconds until current stage ends
}

export function getPresaleStatus(): PresaleStatus {
  const now = new Date()
  let currentStage: number | null = null
  let nextStage: number | null = null
  let isPresaleActive = false
  
  // Find current stage
  for (let i = 0; i < DEFAULT_PRESALE_STAGES.length; i++) {
    const stage = DEFAULT_PRESALE_STAGES[i]
    if (now >= stage.startDate && now <= stage.endDate) {
      currentStage = i
      isPresaleActive = true
      break
    }
  }
  
  // Find next stage (if any)
  if (currentStage !== null && currentStage < DEFAULT_PRESALE_STAGES.length - 1) {
    nextStage = currentStage + 1
  } else if (currentStage === null) {
    // No current stage, find the next upcoming stage
    for (let i = 0; i < DEFAULT_PRESALE_STAGES.length; i++) {
      if (now < DEFAULT_PRESALE_STAGES[i].startDate) {
        nextStage = i
        break
      }
    }
  }
  
  // Calculate times
  let timeToNextStart: number | null = null
  let timeToCurrentEnd: number | null = null
  
  if (nextStage !== null) {
    const nextStageData = DEFAULT_PRESALE_STAGES[nextStage]
    timeToNextStart = nextStageData.startDate.getTime() - now.getTime()
  }
  
  if (currentStage !== null) {
    const currentStageData = DEFAULT_PRESALE_STAGES[currentStage]
    timeToCurrentEnd = currentStageData.endDate.getTime() - now.getTime()
  }
  
  return {
    currentStage,
    nextStage,
    isPresaleActive,
    timeToNextStart,
    timeToCurrentEnd
  }
}

export function getNextStageStartDate(): Date | null {
  const status = getPresaleStatus()
  if (status.nextStage !== null) {
    return DEFAULT_PRESALE_STAGES[status.nextStage].startDate
  }
  return null
}

export function getCurrentStageEndDate(): Date | null {
  const status = getPresaleStatus()
  if (status.currentStage !== null) {
    return DEFAULT_PRESALE_STAGES[status.currentStage].endDate
  }
  return null
}

export function getStageName(stageIndex: number | null): string {
  if (stageIndex === null) return 'Unknown'
  return DEFAULT_PRESALE_STAGES[stageIndex]?.name || 'Unknown'
}