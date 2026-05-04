'use client';

import React from 'react';
import { Search, Bell, ShoppingCart } from 'lucide-react';
import { useTheme } from '@/theme/ThemeContext';

interface DashboardHeaderProps {
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  cartCount?: number;          
  onCartClick?: () => void;    
}

export default function DashboardHeader({ 
  searchPlaceholder = "Search...", 
  onSearchChange,
  cartCount = 0,
  onCartClick 
}: DashboardHeaderProps) {
  
  const { theme } = useTheme();

  return (
    <header className={`h-16 ${theme.surface} border-b ${theme.border} flex items-center justify-between px-6 shrink-0 shadow-sm transition-colors duration-300`}>
      
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl relative">
        <Search className={`w-4 h-4 ${theme.textSecondary} absolute left-3 top-1/2 -translate-y-1/2`} />
        <input 
          type="text" 
          placeholder={searchPlaceholder}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className={`w-full ${theme.background} border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-green-700 outline-none ${theme.textPrimary} placeholder-gray-400 transition-colors duration-300`}
        />
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-4 ml-4">
        
        {/* Notifications */}
        <button className={`relative p-2 ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}>
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 border border-white rounded-full"></span>
        </button>

        {/* Shopping Cart */}
        <button className={`relative p-2 ${theme.background} rounded-full ${theme.textSecondary} hover:${theme.surfaceHover} transition-colors`} onClick={onCartClick}>
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && ( // <--- Add this conditional wrapper
            <span className="absolute -top-1 -right-1 bg-green-800 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
              {cartCount}
            </span>
          )}
        </button>

      </div>
    </header>
  );
}