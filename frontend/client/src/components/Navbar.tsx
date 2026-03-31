'use client'; 

import Image from 'next/image';
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
  
  // State to hold the logged-in user's data
  const [user, setUser] = useState<any>(null);

  // 2. Setup initial state from URL and check localStorage for user data
  useEffect(() => {
    // If someone shares a link like /marketplace?q=flour, put "flour" in the search box
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);

    // Retrieve user session info from localStorage (saved during login)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse user from local storage:', err);
      }
    }
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
    <nav className="sticky top-0 w-full z-50 bg-(--foreground) opacity-100 border-b border-brand-secondary/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo and Brand Name Container */}
          <div className="flex items-center gap-3">
            <Image 
              src="/BrandLogo.png" 
              alt="Brand Logo" 
              width={40} 
              height={40} 
              className="h-10 w-10 rounded-full border-2 border-black object-cover bg-white" 
            />
            <Link 
              href="/" 
              className="text-2xl font-bold text-white hover:opacity-90 transition-opacity shrink-0"
            >
               I Am Barley
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
            
            {/* Show Search and User Info ONLY on Marketplace */}
            {isMarketplace && (
              <>
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

                {/* Logged in User Information */}
                {user && (
                  <div className="flex flex-col items-end text-sm ml-4">
                    <Link href="/profile" className="text-white hover:underline">
                    <span className="font-bold text-white">
                      {user.user_metadata?.username || 'User'}
                    </span>
                    </Link>
                    <span className="text-gray-300 text-xs">
                      {user.email}
                    </span>
                  </div>
                )}
              </>
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