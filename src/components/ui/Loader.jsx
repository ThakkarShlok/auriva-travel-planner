import React from 'react';

const Loader = ({ size = 'md', label = 'Loading...', fullScreen = false }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-slate-200 border-t-primary-500 rounded-full animate-spin`} />
      {label && <p className="text-gray-500 text-sm">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
