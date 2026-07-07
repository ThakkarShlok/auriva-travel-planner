import React from 'react';
import { Link } from 'react-router-dom';

const GradientCTA = ({ title, description, primaryAction, secondaryAction }) => {
  const renderAction = (action, isPrimary) => {
    if (!action) return null;

    const baseClass = isPrimary
      ? 'inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all bg-white text-primary-800 hover:shadow-lg hover:scale-105'
      : 'inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all text-white border border-white/30 hover:bg-white/10';

    if (action.to) {
      return (
        <Link to={action.to} className={baseClass}>
          {action.label}
        </Link>
      );
    }
    return (
      <button onClick={action.onClick} className={baseClass}>
        {action.label}
      </button>
    );
  };

  return (
    <div className="container-custom my-16">
      <div className="hero-gradient rounded-3xl p-10 md:p-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        {description && (
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto text-lg">{description}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {renderAction(primaryAction, true)}
          {renderAction(secondaryAction, false)}
        </div>
      </div>
    </div>
  );
};

export default GradientCTA;
