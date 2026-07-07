import React from 'react';

const Textarea = ({ 
  label, 
  id, 
  value, 
  onChange, 
  placeholder, 
  rows = 4, 
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
        {Icon && <Icon className="absolute left-4 top-4 text-gray-400 w-5 h-5" />}
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3 border ${error ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Textarea;