'use client'; 

import Link from 'next/link';

export default function Navbar() {
  return (
    // Changed bg-white/90 to bg-[var(--foreground)]
    <nav className="fixed top-0 w-full z-50 bg-[var(--foreground)] backdrop-blur-md border-b border-brand-secondary/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="shrink-0">
            {/* Changed text to white for contrast against green header */}
            <Link 
              href="/" 
              className="text-2xl font-bold text-white hover:opacity-90 transition-opacity"
            >
              BrandName
            </Link>
          </div>
          
          {/* Auth Buttons */}
          <div className="flex items-center gap-6">
            {/* Changed to White text */}
            <Link 
              href="/login" 
              className="text-white hover:text-brand-secondary font-bold transition-colors"
            >
              Log in
            </Link>
            
            {/* Updated button: White background with Green text */}
            <Link 
              href="/signup" 
              className="px-6 py-2.5 text-sm font-bold text-brand-secondary bg-white rounded-full hover:bg-brand-secondary hover:text-white transition-all shadow-lg"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}