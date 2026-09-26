import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  description?: string;
  isError?: boolean;
  isSuccess?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  id, 
  icon, 
  rightElement,
  description, 
  isError = false,
  isSuccess = false,
  className = '', 
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-black uppercase tracking-[0.15em] text-white/90 mb-2.5 group-focus-within:text-orange-400 transition-colors">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`w-full bg-black/60 rounded-xl py-3 ${icon ? 'pl-11' : 'px-4'} ${rightElement ? 'pr-11' : 'pr-4'} text-white placeholder-gray-700 focus:outline-none transition-all duration-200 font-medium text-sm sm:text-base ${
            isError
              ? 'border-2 border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
              : isSuccess
              ? 'border-2 border-emerald-500/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30'
              : 'border border-gray-800 focus:ring-1 focus:ring-orange-500/40 focus:border-orange-500'
          } ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
            {rightElement}
          </div>
        )}
      </div>
      {description && (
        <p className="mt-1.5 text-[9px] font-bold text-gray-500 uppercase tracking-widest pl-1">
          {description}
        </p>
      )}
    </div>
  );
};

export default Input;