'use client'; 

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, FormEvent, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMarketplace = pathname === '/marketplace';

  // 1. Keep track of what the user types in the search box
  const [searchQuery, setSearchQuery] = useState('');

  // 2. If someone shares a link like /marketplace?q=flour, put "flour" in the search box
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // 3. What happens when they click "Search" or press Enter
  const handleSearch = (e: FormEvent) => {
    e.preventDefault(); // Stop the page from reloading
    
    if (searchQuery.trim()) {
      // Add the search query to the URL (this triggers your marketplace page to filter)
      router.push(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      // If it's empty, just show all items
      router.push('/marketplace');
    }
  };

  return (
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
              // 4. Wrap the input and button in a form
              <form onSubmit={handleSearch} className="flex items-center">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..." 
                  className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-brand-secondary text-black sm:w-64 bg-white"
                />
                <button 
                  type="submit"
                  className="px-4 py-2 text-white bg-brand-secondary rounded-r-md hover:bg-brand-tertiary font-medium transition-all border border-brand-secondary hover:border-brand-tertiary"
                >
                  Search
                </button>
              </form>
            )}

            {/* Show Auth Buttons ONLY when NOT on the Marketplace */}
            {!isMarketplace && (
              <>
                <Link 
                  href="/login" 
                  className="px-6 py-2.5 text-sm font-bold text-brand-secondary bg-white rounded-full hover:bg-brand-secondary hover:text-white transition-all shadow-lg"
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