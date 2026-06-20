import React from 'react'
import { Check } from 'lucide-react'

const ActivityCheckbox = ({ checked, disabled, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    disabled={disabled}
    aria-label={checked ? 'Mark incomplete' : 'Mark complete'}
    className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
      ${checked
        ? 'bg-emerald-500 border-emerald-500 text-white'
        : 'border-slate-300 hover:border-emerald-400 bg-white'}
      ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    {checked && <Check className="w-3 h-3 stroke-[3]" />}
  </button>
)

export default ActivityCheckbox
