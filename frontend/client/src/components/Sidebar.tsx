'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // <-- Import usePathname
import { Home, Star, Package, Truck, Users, User, ChevronDown } from 'lucide-react';

export default function Sidebar() {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname(); // <-- Get current route

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    
    fetchUser();
  }, []);

  // Helper function to figure out if a link is active
  const isActive = (path: string) => pathname === path;

  // Reusable active/inactive classes
  const activeClass = "flex items-center gap-3 bg-[#2C3E2D]/10 text-[#2C3E2D] px-3 py-2.5 rounded-lg border-l-4 border-[#2C3E2D]";
  const inactiveClass = "flex items-center gap-3 px-3 py-2.5 hover:bg-[#F5F3EF] text-stone-600 rounded-lg transition-colors border-l-4 border-transparent";

  return (
    <aside className="w-64 bg-white border-r border-[#EAE7E0] flex flex-col justify-between shrink-0">
      <div>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <Image 
            src="/BrandLogo.png" 
            alt="Brand Logo" 
            width={40} 
            height={40} 
            className="h-10 w-10 rounded-full border border-[#EAE7E0] object-cover bg-white" 
          />
          <Link href="/" className="text-xl font-bold text-stone-900 tracking-tight whitespace-nowrap truncate hover:opacity-80">
            I Am Barley
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="px-4 space-y-8 text-sm font-medium">
          <div>
            <h3 className="text-xs font-semibold text-stone-400 mb-2 uppercase tracking-wider pl-2">Main Menu</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/marketplace" className={isActive('/marketplace') ? activeClass : inactiveClass}>
                  <Home className={`w-5 h-5 ${isActive('/marketplace') ? 'text-[#2C3E2D]' : 'text-stone-500'}`} />
                  Home/Marketplace
                </Link>
              </li>
              <li>
                <a href="#" className={inactiveClass}>
                  <Star className="w-5 h-5 text-stone-500" />
                  Best Sellers
                </a>
              </li>
              <li>
                <Link href="/stock" className={isActive('/stock') ? activeClass : inactiveClass}>
                  <Package className={`w-5 h-5 ${isActive('/stock') ? 'text-[#2C3E2D]' : 'text-stone-500'}`} />
                  Stock Page
                </Link>
              </li>
              <li>
                <a href="#" className={inactiveClass}>
                  <Truck className="w-5 h-5 text-stone-500" />
                  Delivery Page
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-stone-400 mb-2 uppercase tracking-wider pl-2">Management</h3>
            <ul className="space-y-1">
              <li>
                <a href="#" className={inactiveClass}>
                  <Users className="w-5 h-5 text-stone-500" />
                  Member Management
                </a>
              </li>
              <li>
                <Link href="/profile" className={isActive('/profile') ? activeClass : inactiveClass}>
                  <User className={`w-5 h-5 ${isActive('/profile') ? 'text-[#2C3E2D]' : 'text-stone-500'}`} />
                  Profile
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* User Dropdown / Bottom Section */}
      <div className="p-4 border-t border-[#EAE7E0]">
        <button className="flex items-center justify-between w-full p-2 hover:bg-[#F5F3EF] rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden">
              {user?.avatarUrl ? (
                <Image src={user.avatarUrl} alt="User avatar" width={32} height={32} />
              ) : (
                <User className="w-5 h-5 text-stone-500" />
              )}
            </div>
            <div className="text-left flex flex-col items-start leading-tight">
              <span className="text-sm font-semibold text-stone-900 line-clamp-1">
                {user ? user.first_name || user.email : "Loading..."}
              </span>
              <span className="text-xs text-stone-500 line-clamp-1">
                {user?.role || "Member"}
              </span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-stone-400" />
        </button>
      </div>
    </aside>
  );
}