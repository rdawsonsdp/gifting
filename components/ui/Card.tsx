import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = true }: CardProps) {
  const hoverStyles = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';
  
  return (
    <div className={`bg-[#FFF8E7] rounded-lg shadow-md p-4 sm:p-6 border border-[#8B7355]/20 ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}
