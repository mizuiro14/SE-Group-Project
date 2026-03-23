'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const isMarketplace = pathname === '/marketplace';

  return (
    // Changed "fixed" to "sticky" so it doesn't overlap page content.
    <nav className="sticky top-0 w-full z-50 bg-[var(--foreground)] opacity-100 border-b border-brand-secondary/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="shrink-0">
            <Link 
              href="/" 
              className="text-2xl font-bold text-white hover:opacity-90 transition-opacity"
            >
              BrandName
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
            
            {/* Show Search ONLY on Marketplace */}
            {isMarketplace && (
              <div className="flex items-center">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-brand-secondary text-black sm:w-64 bg-white"
                />
                <button className="px-4 py-2 text-white bg-brand-secondary rounded-r-md hover:bg-opacity-90 font-medium transition-all border border-brand-secondary">
                  Search
                </button>
              </div>
            )}

            {/* Show Auth Buttons ONLY when NOT on the Marketplace */}
            {!isMarketplace && (
              <>
                <Link 
                  href="/login" 
                  className="text-white hover:text-brand-secondary font-bold transition-colors"
                >
                  Log in
                </Link>
                
                <Link 
                  href="/signup" 
                  className="px-6 py-2.5 text-sm font-bold text-brand-secondary bg-white rounded-full hover:bg-brand-secondary hover:text-white transition-all shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}