import React from 'react';

export const LoadingSpinner = ({
  size = 'md',
  color = 'text-blue-600',
  label = 'Loading...',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <div
        className={`${sizeClasses[size] || sizeClasses.md} ${color} border-current border-t-transparent rounded-full animate-spin`}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default LoadingSpinner;
