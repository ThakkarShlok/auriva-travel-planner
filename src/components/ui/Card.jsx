import React from 'react';

const paddingMap = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

const Card = ({
  children,
  className = '',
  as: Tag = 'div',
  padding = 'md',
  interactive = false,
}) => {
  return (
    <Tag
      className={`bg-white rounded-2xl border border-slate-100 shadow-soft ${paddingMap[padding]} ${
        interactive
          ? 'transition-all hover:shadow-card hover:-translate-y-0.5 cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </Tag>
  );
};

export default Card;
