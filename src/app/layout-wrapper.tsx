'use client'

import { useState, useEffect } from 'react'
import { PreLaunchPage } from '@/components/home/pre-launch-page'
import { usePresaleConfigReadonly } from '@/hooks/use-presale-config'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { isBeforeFirstSale } = usePresaleConfigReadonly()
  const [showPreLaunch, setShowPreLaunch] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  // Check client-side and localStorage
  useEffect(() => {
    const checkPreLaunchStatus = () => {
      setIsClient(true)
      
      // Check if pre-launch transition has already happened
      const hasSeenPreLaunch = localStorage.getItem('prelaunch-transition-complete')
      
      // Only show pre-launch if we're before first sale AND haven't transitioned yet
      if (isBeforeFirstSale && hasSeenPreLaunch !== 'true') {
        setShowPreLaunch(true)
      } else {
        setShowPreLaunch(false)
      }
    }
    
    checkPreLaunchStatus()
  }, [isBeforeFirstSale])
  
  // Handle transition from pre-launch to main content
  const handleTransitionComplete = () => {
    setShowPreLaunch(false)
  }
  
  // Don't render anything during SSR to avoid hydration mismatch
  if (!isClient) {
    return <>{children}</>
  }
  
  return (
    <>
      {/* Pre-launch page (shown before first sale) */}
      {showPreLaunch && (
        <PreLaunchPage onTransitionComplete={handleTransitionComplete} />
      )}
      
      {/* Main content (shown after pre-launch or if not in pre-launch phase) */}
      {!showPreLaunch && children}
    </>
  )
}