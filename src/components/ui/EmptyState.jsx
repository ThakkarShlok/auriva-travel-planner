import React from 'react';

const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      {Icon && (
        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-primary-600" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="text-slate-600 mt-2 max-w-md">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
