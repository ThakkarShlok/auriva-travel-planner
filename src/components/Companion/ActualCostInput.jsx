import React, { useState, useEffect } from 'react'
import { useCurrency } from '../../contexts/CurrencyContext'
import { formatCurrency, formatDisplayAmount } from '../../utils/currency'

/**
 * Actual cost input with captured-rate support.
 *
 * Display uses the captured rate (actualCostUsdRate) when available — historical accuracy.
 * On save, re-captures the CURRENT live rate so editing always records the rate at that moment.
 * onSave receives { usdValue, capturedRate, capturedAt }.
 *
 * Currency toggle re-syncs the display value automatically.
 */
const ActualCostInput = ({ estimatedCost, actualCost, actualCostUsdRate, onSave }) => {
  const { currency, usdToInr, getRateAt } = useCurrency()

  // For display/init: prefer the historical captured rate, fall back to live rate
  const effectiveRate = actualCostUsdRate ?? usdToInr

  const toDisplay = (usd) => {
    if (usd == null || isNaN(usd)) return ''
    const val = currency === 'INR'
      ? Math.round(usd * (actualCostUsdRate ?? usdToInr))
      : parseFloat(Number(usd).toFixed(2))
    return String(val)
  }

  const [value, setValue] = useState(() => toDisplay(actualCost))

  // Re-sync when currency toggles OR live rate refreshes OR parent provides new captured rate
  useEffect(() => {
    setValue(toDisplay(actualCost))
  }, [currency, usdToInr, actualCostUsdRate]) // eslint-disable-line react-hooks/exhaustive-deps

  const displayActual = value === '' ? null : Number(value)
  const hasActual = displayActual != null && !isNaN(displayActual)

  // Delta: both sides in display currency using the same effective rate
  const estimatedInDisplay = estimatedCost != null
    ? (currency === 'INR' ? estimatedCost * effectiveRate : estimatedCost)
    : null

  const delta = hasActual && estimatedInDisplay != null ? displayActual - estimatedInDisplay : null
  const deltaMeaningful = delta !== null && Math.abs(delta) > (currency === 'INR' ? 5 : 0.05)

  const handleBlur = () => {
    const num = Number(value)
    if (value === '' || isNaN(num) || num < 0) {
      onSave?.({ usdValue: null, capturedRate: null, capturedAt: null })
      return
    }
    const usdValue = currency === 'INR' ? num / usdToInr : num
    const { rate } = getRateAt()
    const capturedRate = currency === 'INR' ? rate : null
    const capturedAt = new Date().toISOString()
    onSave?.({ usdValue, capturedRate, capturedAt })
  }

  const symbol = currency === 'INR' ? '₹' : '$'
  const step = currency === 'INR' ? '1' : '0.01'

  // Show historical rate indicator when displaying a captured entry
  const isHistorical = actualCostUsdRate != null && Math.abs(actualCostUsdRate - usdToInr) > 0.01

  return (
    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
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

        {isHistorical && (
          <span
            className="text-[10px] text-slate-300 cursor-default"
            title={`Recorded at rate ₹${actualCostUsdRate?.toFixed(2)}/USD. Current rate is ₹${usdToInr?.toFixed(2)}/USD.`}
          >
            hist.
          </span>
        )}
      </div>

      {/* Delta — delta is in display currency; use formatDisplayAmount (no double-conversion) */}
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
