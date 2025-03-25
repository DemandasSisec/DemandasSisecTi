import React, { createContext, useContext, useState } from 'react'
import Lottie from 'lottie-react'
import loadingAnimation from '../assets/Animation_cubo.json'

interface SmallLoadingContextType {
  smallLoading: boolean
  setSmallLoading: (loading: boolean) => void
}

const SmallLoadingContext = createContext<SmallLoadingContextType | null>(null)

export function SmallLoadingProvider({ children }: { children: React.ReactNode }) {
  const [smallLoading, setSmallLoading] = useState(false)

  const setLoadingWithTimeout = (value: boolean) => {
    if (value) {
      setSmallLoading(true)
      setTimeout(() => {
        setSmallLoading(false)
      }, 7000) // Tempo menor para operações pequenas
    } else {
      setSmallLoading(false)
    }
  }

  return (
    <SmallLoadingContext.Provider value={{ smallLoading, setSmallLoading }}>
      {children}
      {smallLoading && (
        <div className="fixed inset-0 z-[9999]">
          <div 
            className="absolute inset-0 bg-white/30" // Fundo branco transparente
          />
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="w-64 h-64"> {/* Aumentei o tamanho para 256px */}
              <Lottie
                animationData={loadingAnimation}
                loop={true}
                autoplay={true}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>
      )}
    </SmallLoadingContext.Provider>
  )
}

export function useSmallLoading() {
  const context = useContext(SmallLoadingContext)
  if (!context) {
    throw new Error('useSmallLoading must be used within a SmallLoadingProvider')
  }
  return context
} 