'use client'

import { useState } from 'react'

type SubscribeStatus = 'idle' | 'loading' | 'success' | 'error'
type SubscribeSource = 'pre-launch' | 'newsletter'

interface UseSubscribeReturn {
  email: string
  setEmail: (email: string) => void
  status: SubscribeStatus
  errorMessage: string
  subscribe: (source: SubscribeSource) => Promise<void>
  reset: () => void
}

export function useSubscribe(): UseSubscribeReturn {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<SubscribeStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const subscribe = async (source: SubscribeSource) => {
    if (!email.trim()) {
      setStatus('error')
      setErrorMessage('Please enter your email address.')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setStatus('error')
        setErrorMessage(data.error || 'Something went wrong. Please try again.')
      } else {
        setStatus('success')
      }
    } catch {
      setStatus('error')
      setErrorMessage('Network error. Please check your connection and try again.')
    }
  }

  const reset = () => {
    setStatus('idle')
    setEmail('')
    setErrorMessage('')
  }

  return { email, setEmail, status, errorMessage, subscribe, reset }
}
