import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = true }: CardProps) {
  const hoverStyles = hover ? 'hover:shadow-xl transition-all duration-300' : '';
  
  return (
    <div className={`glass-card rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 border border-light-brown/20 ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}
