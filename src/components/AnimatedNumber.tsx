import React from 'react';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  prefix = '₹',
  suffix = '',
  decimals = 0,
  className = '',
}) => {
  const numVal = isNaN(value) || !isFinite(value) ? 0 : value;
  const formatted =
    decimals > 0
      ? numVal.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : Math.round(numVal).toLocaleString('en-IN');

  return (
    <span className={`inline-block ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

