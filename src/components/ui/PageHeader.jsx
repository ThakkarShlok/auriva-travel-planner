import React from 'react';

const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
  variant = 'default',
}) => {
  if (variant === 'hero') {
    return (
      <div className="hero-gradient">
        <div className="container-custom py-12 md:py-16">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-300 mb-3">
              {eyebrow}
            </p>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
          {description && (
            <p className="mt-3 text-primary-100 text-lg max-w-2xl">{description}</p>
          )}
          {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-slate-100">
      <div className="container-custom py-12 md:py-16">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-700 mb-3">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{title}</h1>
        {description && (
          <p className="mt-3 text-slate-600 text-lg max-w-2xl">{description}</p>
        )}
        {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
