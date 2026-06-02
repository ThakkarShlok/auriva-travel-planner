import React from 'react';

const Select = ({ 
  label, 
  id, 
  value, 
  onChange, 
  options = [], 
  error, 
  required = false,
  icon: Icon,
  className = '',
  ...props 
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />}
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3 border ${error ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-transparent appearance-none bg-white ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Select;