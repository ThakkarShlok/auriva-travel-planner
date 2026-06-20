import React, { useState, useEffect } from 'react'
import { useCurrency } from '../../contexts/CurrencyContext'
import { formatCurrency, formatDisplayAmount } from '../../utils/currency'

/**
 * All internal costs are stored in USD. This component:
 * - Displays input in the user's current currency (₹ or $)
 * - Converts entered value back to USD before calling onSave
 * - Re-syncs display when the user toggles currency
 * - Computes delta in display currency so comparison is always apples-to-apples
 */
const ActualCostInput = ({ estimatedCost, actualCost, onSave }) => {
  const { currency, usdToInr } = useCurrency()

  const toDisplay = (usd) => {
    if (usd == null || isNaN(usd)) return ''
    const val = currency === 'INR' ? Math.round(usd * usdToInr) : parseFloat(usd.toFixed(2))
    return String(val)
  }

  const toUsd = (displayStr) => {
    const num = Number(displayStr)
    if (displayStr === '' || isNaN(num) || num < 0) return null
    return currency === 'INR' ? num / usdToInr : num
  }

  const [value, setValue] = useState(() => toDisplay(actualCost))

  // Re-sync display value when user toggles INR ↔ USD
  useEffect(() => {
    setValue(toDisplay(actualCost))
  }, [currency, usdToInr]) // eslint-disable-line react-hooks/exhaustive-deps

  const displayActual = value === '' ? null : Number(value)
  const hasActual = displayActual != null && !isNaN(displayActual)

  // Estimate in display currency — same unit as what the user typed
  const estimatedInDisplay = estimatedCost != null
    ? (currency === 'INR' ? estimatedCost * usdToInr : estimatedCost)
    : null

  const delta = hasActual && estimatedInDisplay != null ? displayActual - estimatedInDisplay : null
  const deltaMeaningful = delta !== null && Math.abs(delta) > (currency === 'INR' ? 5 : 0.05)

  const handleBlur = () => {
    onSave?.(toUsd(value))
  }

  const symbol = currency === 'INR' ? '₹' : '$'
  const step = currency === 'INR' ? '1' : '0.01'

  return (
    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
      {/* Row: label + input + est reference */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Actual spent</span>

        <div className="flex items-center bg-white border border-slate-300 rounded-lg px-3 py-1.5 gap-1 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400 transition">
          <span className="text-sm font-bold text-slate-500 select-none">{symbol}</span>
          <input
            type="number"
            min="0"
            step={step}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            placeholder="0"
            className="w-24 text-sm font-semibold text-slate-800 outline-none bg-transparent"
          />
        </div>

        {estimatedInDisplay != null && (
          <span className="text-xs text-slate-400">
            est.&nbsp;{formatCurrency(estimatedCost, currency, usdToInr)}
          </span>
        )}
      </div>

      {/* Delta badge — delta is already in display currency; use formatDisplayAmount, NOT formatCurrency */}
      {deltaMeaningful && (
        <div className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full
          ${delta > 0
            ? 'bg-red-50 text-red-600 border border-red-200'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          <span>{delta > 0 ? '↑' : '↓'}</span>
          <span>{formatDisplayAmount(Math.abs(delta), currency)}</span>
          <span>{delta > 0 ? 'over budget' : 'under budget'}</span>
        </div>
      )}
      {delta !== null && !deltaMeaningful && (
        <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
          ✓ on budget
        </div>
      )}
    </div>
  )
}

export default ActualCostInput
