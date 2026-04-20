import React from 'react';

// Define what props our button can accept
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '', 
  ...props 
}: ButtonProps) {
  
  // Base styles applied to all buttons
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-transform transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  
  // Dynamic styles based on the 'variant' prop
  const variants = {
    primary: "bg-[#1B3625] hover:bg-[#132A1B] text-white focus:ring-[#1B3625]",
    secondary: "bg-foreground text-white hover:bg-foreground/90 focus:ring-foreground",
    outline: "border-2 border-slate-200 hover:border-slate-300 text-slate-900 bg-transparent",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
  };

  // Dynamic styles based on the 'size' prop
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}