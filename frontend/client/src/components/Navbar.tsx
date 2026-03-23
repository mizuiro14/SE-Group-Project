'use client'; 

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              BrandName
            </Link>
          </div>
          
          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-primary rounded-full hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}