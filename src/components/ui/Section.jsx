import React from 'react';

const bgMap = {
  white: 'bg-white',
  slate: 'bg-slate-50',
  none:  '',
};

const Section = ({
  children,
  className = '',
  containerClassName = '',
  bg = 'none',
}) => {
  return (
    <section className={`section-padding ${bgMap[bg]} ${className}`}>
      <div className={`container-custom ${containerClassName}`}>
        {children}
      </div>
    </section>
  );
};

export default Section;
