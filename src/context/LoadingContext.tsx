import React, { createContext, useContext, useState } from 'react'
import Lottie from 'lottie-react'
import loadingAnimation from '../assets/Animation_loading.json'

interface LoadingContextType {
  setLoading: (loading: boolean) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  const setLoadingWithTimeout = (value: boolean) => {
    if (value) {
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
      }, 4000)
    } else {
      setIsLoading(false)
    }
  }

  return (
    <LoadingContext.Provider value={{ setLoading: setLoadingWithTimeout }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-[9999]">
          <div 
            className="absolute inset-0 bg-white"
          />
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="w-[512px] h-[512px]">
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
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
} 