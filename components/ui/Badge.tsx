import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'default';
  className?: string;
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantStyles = {
    bronze: 'bg-[#CD7F32] text-white',
    silver: 'bg-gray-400 text-white',
    gold: 'bg-[#D4AF37] text-[#E98D3D]',
    platinum: 'bg-[#E5E4E2] text-[#E98D3D]',
    default: 'bg-[#E98D3D] text-white'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
