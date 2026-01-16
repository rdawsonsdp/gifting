import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'info';
  className?: string;
}

export default function Alert({ children, variant = 'info', className = '' }: AlertProps) {
  const variantStyles = {
    success: 'bg-[#4CAF50]/10 border-[#4CAF50] text-[#2E7D32]',
    error: 'bg-[#E53935]/10 border-[#E53935] text-[#C62828]',
    info: 'bg-[#E6E6FA]/50 border-[#8B7355] text-[#5D4037]'
  };

  return (
    <div
      className={`border-2 rounded-lg p-4 ${variantStyles[variant]} ${className}`}
      role={variant === 'error' ? 'alert' : variant === 'info' ? 'status' : undefined}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      {children}
    </div>
  );
}
