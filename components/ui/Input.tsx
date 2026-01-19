import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, className = '', ...props }, ref) => {
    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs sm:text-sm font-semibold text-[#333333] mb-1.5 sm:mb-2">
            {label}
            {required && <span className="text-[#E53935] ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border-2 text-sm sm:text-base
            ${error 
              ? 'border-[#E53935] focus:border-[#E53935] focus:ring-[#E53935]' 
              : 'border-[#8B7355]/30 focus:border-[#E98D3D] focus:ring-[#E98D3D]'
            }
            bg-white text-[#333333]
            focus:outline-none focus:ring-2 focus:ring-offset-1
            transition-all duration-200
            min-h-[44px]
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs sm:text-sm text-[#E53935]" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
