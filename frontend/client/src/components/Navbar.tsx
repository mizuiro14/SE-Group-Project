'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/Button';

export default function Navbar() {
  const pathname = usePathname();

  // Define which pages are part of the internal authenticated "dashboard"
  const isDashboardPage =
    pathname === '/marketplace' ||
    pathname === '/profile' ||
    pathname === '/stock' ||
    pathname === '/delivery' ||
    pathname === '/bestsellers' ||
    pathname === '/members';

  // Hide this global public navbar entirely on dashboard pages 
  // (because they have their own custom header and Sidebar built into the page)
  if (isDashboardPage) return null;

  return (
    <nav className="sticky top-0 w-full z-50 bg-foreground opacity-100 border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo and Brand Name Container */}
          <div className="flex items-center gap-3">
            <Image
              src="/BrandLogo.png"
              alt="Brand Logo"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full border-2 border-white object-cover bg-white shadow-sm"
            />
            <Link
              href="/"
              className="text-2xl font-bold text-white hover:opacity-90 transition-opacity shrink-0"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              I Am Barley
            </Link>
          </div>

          {/* Public Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="outline"
                className="rounded-full px-6 font-bold shadow-sm border-white text-white hover:bg-white hover:text-gray-900 transition-all"
              >
                Log in
              </Button>
            </Link>

            <Link href="/signup">
              <Button
                variant="outline"
                className="rounded-full px-6 font-bold shadow-sm border-white text-white hover:bg-white hover:text-gray-900 transition-all"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}