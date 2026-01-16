import React from 'react';

interface ProgressBarProps {
  min: number;
  max: number;
  current: number;
  className?: string;
}

export default function ProgressBar({ min, max, current, className = '' }: ProgressBarProps) {
  const percentage = Math.min((current / max) * 100, 100);
  const minPercentage = (min / max) * 100;
  
  let barColor = 'bg-[#E53935]'; // Red - below minimum
  if (current >= min && current <= max * 0.9) {
    barColor = 'bg-[#4CAF50]'; // Green - within range
  } else if (current > max * 0.9) {
    barColor = 'bg-[#D4AF37]'; // Yellow/Gold - approaching max
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-xs sm:text-sm text-[#333333] mb-2">
        <span className="truncate">${min.toFixed(2)} min</span>
        <span className="font-semibold mx-2 whitespace-nowrap">${current.toFixed(2)} / ${max.toFixed(2)}</span>
        <span className="truncate text-right">${max.toFixed(2)} max</span>
      </div>
      <div className="relative h-5 sm:h-6 bg-gray-200 rounded-full overflow-hidden">
        {/* Minimum threshold indicator */}
        <div 
          className="absolute h-full w-0.5 bg-[#8B7355] z-10"
          style={{ left: `${minPercentage}%` }}
        />
        {/* Progress bar */}
        <div 
          className={`h-full ${barColor} transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
