import { useCurrency } from '../contexts/CurrencyContext'

/**
 * Format a USD amount in the chosen display currency.
 * @param {number} usd - amount in USD
 * @param {string} currency - 'USD' or 'INR'
 * @param {number} usdToInr - current exchange rate
 */
export function formatCurrency(usd, currency, usdToInr) {
  if (usd == null || isNaN(usd)) return ''

  if (currency === 'INR') {
    const inr = usd * usdToInr
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(inr)
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(usd)
}

export function useFormattedCurrency() {
  const { currency, usdToInr } = useCurrency()
  return (usd) => formatCurrency(usd, currency, usdToInr)
}

/**
 * Format a number that is ALREADY in the display currency — no USD conversion.
 * Used when the value has already been multiplied by the exchange rate.
 */
export function formatDisplayAmount(amount, currency) {
  if (amount == null || isNaN(amount)) return ''
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount)
}
