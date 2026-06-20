import React, { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'auriva_currency'
const DEFAULT_CURRENCY = 'INR'
const FALLBACK_RATE = 83.5

const CurrencyContext = createContext({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  usdToInr: FALLBACK_RATE,
  isLoaded: false,
})

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_CURRENCY
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_CURRENCY
  })
  const [usdToInr, setUsdToInr] = useState(FALLBACK_RATE)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/rates')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled || !data?.rates?.INR) return
        setUsdToInr(data.rates.INR)
      })
      .catch(() => { /* keep fallback rate */ })
      .finally(() => { if (!cancelled) setIsLoaded(true) })
    return () => { cancelled = true }
  }, [])

  const setCurrency = (next) => {
    setCurrencyState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, usdToInr, isLoaded }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
