import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const variants = {
    primary:   'bg-primary-800 text-white hover:bg-primary-900 shadow-sm hover:shadow-md focus:ring-primary-700',
    accent:    'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-500',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-400',
    ghost:     'text-slate-600 hover:bg-slate-100 focus:ring-slate-400',
    outline:   'border-2 border-primary-800 text-primary-800 hover:bg-primary-50 focus:ring-primary-700',
    danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    hero:      'bg-white text-primary-800 hover:bg-primary-50 shadow-md focus:ring-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-base rounded-xl gap-2',
    lg: 'px-6 py-3 text-lg rounded-xl gap-2.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:transform active:scale-95 ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
    </button>
  );
};

export default Button;
