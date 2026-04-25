'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Star, Package, Truck, Users, User } from 'lucide-react';
import { useTheme } from '@/theme/ThemeContext'; // <-- Import the hook
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const { user, isSeller } = useAuth();
  const pathname = usePathname();
  const { theme } = useTheme(); // <-- Get the global theme

  const isActive = (path: string) => pathname === path;

  // Use dynamic text and hover classes based on theme
  const activeClass = `flex items-center gap-3 ${theme.accentBackground}/10 ${theme.textPrimary} px-3 py-2.5 rounded-lg border-l-4 border-green-700`;
  const inactiveClass = `flex items-center gap-3 px-3 py-2.5 ${theme.surfaceHover} ${theme.textSecondary} rounded-lg transition-colors border-l-4 border-transparent`;

  return (
    <aside className={`w-64 ${theme.surface} border-r ${theme.border} flex flex-col justify-between shrink-0 transition-colors duration-300`}>
      <div>
        <div className="p-6 flex items-center gap-3">
          <Image 
            src="/BrandLogo.png" 
            alt="Brand Logo" 
            width={40} 
            height={40} 
            className={`h-10 w-10 rounded-full border ${theme.border} object-cover bg-white`}
          />
          <Link href="/" className={`text-xl font-bold tracking-tight whitespace-nowrap truncate hover:opacity-80 ${theme.textPrimary}`}>
            I Am Barley
          </Link>
        </div>

        <nav className="px-4 space-y-8 text-sm font-medium">
          <div>
            <h3 className={`text-xs font-semibold ${theme.textSecondary} mb-2 uppercase tracking-wider pl-2`}>Main Menu</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/marketplace" className={isActive('/marketplace') ? activeClass : inactiveClass}>
                  <Home className={`w-5 h-5 ${isActive('/marketplace') ? 'text-green-700' : theme.textSecondary}`} />
                  Home/Marketplace
                </Link>
              </li>
              <li>
                <Link href="/bestsellers" className={isActive('/bestsellers') ? activeClass : inactiveClass}>
                  <Star className={`w-5 h-5 ${isActive('/bestsellers') ? 'text-green-700' : theme.textSecondary}`} />
                  Best Sellers
                </Link>
              </li>
              {isSeller && (
                <li>
                  <Link href="/stock" className={isActive('/stock') ? activeClass : inactiveClass}>
                    <Package className={`w-5 h-5 ${isActive('/stock') ? 'text-green-700' : theme.textSecondary}`} />
                    Stock Page
                  </Link>
                </li>
              )}
              <li>
                <Link href="/delivery" className={isActive('/delivery') ? activeClass : inactiveClass}>
                  <Truck className={`w-5 h-5 ${isActive('/delivery') ? 'text-green-700' : theme.textSecondary}`} />
                  Delivery Page
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className={`text-xs font-semibold ${theme.textSecondary} mb-2 uppercase tracking-wider pl-2`}>Management</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/profile" className={isActive('/profile') ? activeClass : inactiveClass}>
                  <User className={`w-5 h-5 ${isActive('/profile') ? 'text-green-700' : theme.textSecondary}`} />
                  Profile
                </Link>
              </li>
              <li>
                <Link href="/members" className={isActive('/members') ? activeClass : inactiveClass}>
                  <Users className={`w-5 h-5 ${isActive('/members') ? 'text-green-700' : theme.textSecondary}`} />
                  Member Management
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
      
      {user && (
        <div className={`p-4 border-t ${theme.border}`}>
          <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${theme.surfaceHover} cursor-pointer transition-colors max-w-full overflow-hidden`}>
             <div className="flex flex-col min-w-0">
              <span className={`text-sm font-semibold truncate ${theme.textPrimary}`}>
                {user?.user_metadata?.username || user?.username || 'User'}
              </span>
              <span className={`text-xs truncate ${theme.textSecondary}`}>Premium Member</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}