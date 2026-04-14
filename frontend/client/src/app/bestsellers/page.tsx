'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import { useTheme } from '@/theme/ThemeContext';
import { Search, Bell, ShoppingCart, Star, TrendingUp, ChevronDown } from 'lucide-react';
import Image from 'next/image';

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Raw Wildflower Honey',
    category: 'Pantry',
    subCategory: 'Trending #1',
    rating: 4.9,
    reviews: '2.4k',
    price: 14.00,
    status: 'In Stock',
  },
  {
    id: 2,
    name: 'Dark Roast Coffee Beans',
    category: 'Beverages',
    subCategory: 'Beverages',
    rating: 4.8,
    reviews: '1.8k',
    price: 18.50,
    status: 'Limited',
  },
  {
    id: 3,
    name: 'Rustic Sourdough Loaf',
    category: 'Bakery',
    subCategory: 'Bakery',
    rating: 4.9,
    reviews: '945',
    price: 8.50,
    status: 'In Stock',
  },
  {
    id: 4,
    name: 'Ceremonial Matcha Tin',
    category: 'Beverages',
    subCategory: '',
    rating: 4.7,
    reviews: '',
    price: 32.00,
    status: 'Out of Stock',
  },
];

export default function BestSellersPage() {
  const { theme, isDarkMode } = useTheme();
  
  const topPick = MOCK_PRODUCTS[0];
  const runnerUp = MOCK_PRODUCTS[1];

  return (
    <div className={`flex h-screen ${theme.background} ${theme.textPrimary} font-sans transition-colors duration-300`}>
      {/* 1. Sidebar Navigation */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header (Search & Icons) */}
        <header className={`h-16 px-8 flex items-center justify-between ${theme.surface} border-b ${theme.border} transition-colors duration-300`}>
          <div className={`flex items-center w-full max-w-2xl ${theme.background} rounded-full px-4 py-2 border ${theme.border} relative transition-colors duration-300`}>
            <Search className={`w-4 h-4 ${theme.textSecondary} absolute left-4`} />
            <input 
              type="text" 
              placeholder="Search marketplace products..." 
              className={`w-full pl-8 bg-transparent border-none outline-none text-sm ${theme.textPrimary} placeholder-gray-400`} 
            />
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button className={`relative p-2 rounded-full hover:${theme.surfaceHover} transition-colors`}><Bell className={`w-5 h-5 ${theme.textSecondary}`} /></button>
            <button className={`relative p-2 rounded-full hover:${theme.surfaceHover} transition-colors`}><ShoppingCart className={`w-5 h-5 ${theme.textSecondary}`} /></button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold mb-2 font-serif ${theme.textPrimary}`}>Best Sellers Leaderboard</h1>
            <p className={`${theme.textSecondary}`}>Top rated products curated for our members.</p>
          </div>

          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <div className={`${theme.surface} p-6 rounded-xl border ${theme.border} transition-colors duration-300`}>
               <div className={`${theme.textSecondary} text-sm mb-2`}>Trending Now</div>
               <div className={`text-2xl font-bold ${theme.textPrimary} flex items-center gap-2`}>
                 124 Items 
                 <span className={`text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${isDarkMode ? 'text-green-400 bg-green-900/30' : 'text-green-700 bg-green-100'}`}>
                   <TrendingUp className="w-3 h-3"/> 12.5%
                 </span>
               </div>
             </div>
             <div className={`${theme.surface} p-6 rounded-xl border ${theme.border} transition-colors duration-300`}>
               <div className={`${theme.textSecondary} text-sm mb-2`}>Top Rated</div>
               <div className={`text-2xl font-bold ${theme.textPrimary} flex items-center gap-2`}>
                 4.9 Avg 
                 <span className={`text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${isDarkMode ? 'text-green-400 bg-green-900/30' : 'text-green-700 bg-green-100'}`}>
                   <TrendingUp className="w-3 h-3"/> 0.2%
                 </span>
               </div>
             </div>
             <div className={`${theme.surface} p-6 rounded-xl border ${theme.border} transition-colors duration-300`}>
               <div className={`${theme.textSecondary} text-sm mb-2`}>Limited Stock</div>
               <div className={`text-2xl font-bold ${theme.textPrimary}`}>18 Items</div>
             </div>
          </div>

          {/* Bottom Grid for Leaderboard & Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
            {/* Left side: Ranking List */}
            <div className={`lg:col-span-3 ${theme.surface} rounded-xl border ${theme.border} p-6 transition-colors duration-300`}>
              <div className={`flex items-center gap-6 mb-4 border-b ${theme.border} pb-4 text-sm font-semibold ${theme.textSecondary}`}>
                <button className={`px-4 py-2 rounded-full font-medium ${isDarkMode ? 'bg-green-800 text-white' : 'bg-gray-100 text-gray-900'}`}>All Top 100</button>
                <button className={`hover:${theme.textPrimary}`}>Trending</button>
                <button className={`hover:${theme.textPrimary}`}>New Arrivals</button>
              </div>

              {/* Table Header */}
              <div className={`grid grid-cols-[50px_2fr_1fr_1fr_1fr_1fr_100px] gap-4 py-3 text-xs font-semibold ${theme.textSecondary} uppercase tracking-wider border-b ${theme.border}`}>
                <div>Rank</div>
                <div>Product</div>
                <div>Category</div>
                <div>Rating</div>
                <div>Price</div>
                <div>Status</div>
                <div className="text-right">Action</div>
              </div>

              {/* Table Rows */}
              <div className={`divide-y ${theme.border}`}>
                {MOCK_PRODUCTS.map((product) => (
                  <div key={product.id} className={`grid grid-cols-[50px_2fr_1fr_1fr_1fr_1fr_100px] gap-4 py-5 items-center hover:${theme.surfaceHover} transition-colors -mx-2 px-2 rounded-lg`}>
                    <div className={`font-bold text-lg w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-300'}`}>
                      {product.id}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 ${theme.background} rounded flex items-center justify-center shrink-0 ${theme.textSecondary}`}>
                         📦
                      </div>
                      <div>
                        <div className={`font-semibold ${theme.textPrimary}`}>{product.name}</div>
                        {product.subCategory && (
                          <div className={`text-xs mt-0.5 ${product.subCategory.includes('Trending') ? 'text-green-600 font-medium' : theme.textSecondary}`}>
                            {product.subCategory.includes('Trending') && <TrendingUp className="w-3 h-3 inline mr-1" />}
                            {product.subCategory}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`text-sm ${theme.textSecondary}`}>{product.category}</div>
                    <div className={`text-sm font-medium flex items-center gap-1 ${theme.textPrimary}`}>
                      <Star className="w-4 h-4 text-red-500 fill-red-500" />
                      {product.rating} <span className={`${theme.textSecondary} font-normal`}>({product.reviews})</span>
                    </div>
                    <div className={`text-sm font-bold ${theme.textPrimary}`}>${product.price.toFixed(2)}</div>
                    <div>
                      <span className={`text-xs px-2 py-1 rounded inline-block whitespace-nowrap border ${
                        product.status === 'In Stock' ? (isDarkMode ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-green-50 text-green-600 border-green-100') :
                        product.status === 'Limited' ? (isDarkMode ? 'bg-orange-900/30 text-orange-400 border-orange-800' : 'bg-orange-50 text-orange-600 border-orange-100') :
                        (isDarkMode ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-red-50 text-red-600 border-red-100')
                      }`}>
                        {product.status}
                      </span>
                    </div>
                    <div className="text-right">
                       <button className={`text-xs px-4 py-2 border rounded font-medium transition-colors ${
                         product.status === 'Out of Stock' 
                          ? (isDarkMode ? 'bg-gray-800 text-gray-500 border-gray-700' : 'bg-gray-50 text-gray-400 border-gray-200')
                          : product.id === 1 ? (isDarkMode ? 'bg-green-800 text-white border-transparent' : 'bg-[#2E4035] text-white border-transparent') : `bg-transparent ${theme.textPrimary} hover:${theme.surfaceHover} border-${isDarkMode ? 'gray-600' : 'gray-300'}`
                       }`}>
                         {product.status === 'Out of Stock' ? 'Notify Me' : 'Quick Add'}
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: Filters Sidebar */}
            <div className={`lg:col-span-1 ${theme.surface} rounded-xl border ${theme.border} p-6 transition-colors duration-300`}>
              <div className={`flex items-center justify-between mb-6 pb-4 border-b ${theme.border}`}>
                <h3 className={`font-bold ${theme.textPrimary}`}>Filters</h3>
                <button className={`text-xs font-medium ${theme.textSecondary} hover:${theme.textPrimary}`}>Reset All</button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3 cursor-pointer group">
                  <h4 className={`font-semibold text-sm ${theme.textPrimary}`}>Category</h4>
                  <ChevronDown className={`w-4 h-4 ${theme.textSecondary}`} />
                </div>
                <div className="space-y-2.5">
                  {[
                    { id: 'cat-all', label: 'All Categories', default: true },
                    { id: 'cat-pantry', label: 'Pantry Staples', default: false },
                    { id: 'cat-bakery', label: 'Fresh Bakery', default: false },
                    { id: 'cat-bev', label: 'Beverages', default: false }
                  ].map(filter => (
                    <label key={filter.id} className="flex items-center gap-3 text-sm cursor-pointer">
                      <input type="checkbox" defaultChecked={filter.default} className={`w-4 h-4 rounded border-gray-400 text-green-700 focus:ring-green-700 ${theme.background}`} />
                      <span className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}>{filter.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
               <div className="mb-6">
                <div className="flex items-center justify-between mb-3 cursor-pointer group">
                  <h4 className={`font-semibold text-sm ${theme.textPrimary}`}>Availability</h4>
                  <ChevronDown className={`w-4 h-4 ${theme.textSecondary}`} />
                </div>
                <div className="space-y-2.5">
                  {[
                    { id: 'avail-in', label: 'In Stock', default: true },
                    { id: 'avail-lim', label: 'Limited Stock', default: true },
                    { id: 'avail-out', label: 'Out of Stock', default: false }
                  ].map(filter => (
                    <label key={filter.id} className="flex items-center gap-3 text-sm cursor-pointer">
                      <input type="checkbox" defaultChecked={filter.default} className={`w-4 h-4 rounded border-gray-400 text-green-700 focus:ring-green-700 ${theme.background}`} />
                      <span className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}>{filter.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button className="w-full bg-green-800 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-green-900 transition-colors mt-4 shadow-sm">
                Apply Filters
              </button>
            </div>
          </div>

          {/* Spotlight Comparison Section */}
          <div>
            <h2 className={`text-xl font-bold mb-6 ${theme.textPrimary}`}>Spotlight Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Product 1 Card */}
              <div className={`${theme.surface} rounded-xl border ${theme.border} p-6 relative transition-colors duration-300 shadow-sm`}>
                <div className={`absolute top-4 right-4 ${isDarkMode ? 'bg-green-800' : 'bg-[#8EAD45]'} text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider`}>
                  Top Pick
                </div>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className={`w-32 h-32 ${theme.background} flex items-center justify-center rounded-lg border ${theme.border}`}>
                    <span className="text-4xl">🍯</span>
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className={`text-lg font-bold ${theme.textPrimary} mb-1`}>{topPick.name}</h3>
                    <p className={`text-sm ${theme.textSecondary} mb-4 line-clamp-2`}>Premium unpasteurized honey sourced locally.</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className={`flex justify-between border-b ${theme.border} pb-1`}>
                        <span className={theme.textSecondary}>Price</span>
                        <span className={`font-semibold ${theme.textPrimary}`}>${topPick.price.toFixed(2)}</span>
                      </div>
                      <div className={`flex justify-between border-b ${theme.border} pb-1`}>
                        <span className={theme.textSecondary}>Rating</span>
                        <span className={`font-semibold ${theme.textPrimary} flex items-center`}><Star className="w-3 h-3 text-red-500 fill-red-500 mr-1"/>{topPick.rating}</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className={theme.textSecondary}>Origin</span>
                        <span className={`font-semibold ${theme.textPrimary}`}>Local Farm</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className={`w-full mt-6 py-2.5 border ${theme.border} rounded font-semibold ${theme.textSecondary} hover:${theme.textPrimary} hover:${theme.surfaceHover} transition-colors`}>
                  View Details
                </button>
              </div>

              {/* Product 2 Card */}
              <div className={`${theme.surface} rounded-xl border ${theme.border} p-6 transition-colors duration-300 shadow-sm`}>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className={`w-32 h-32 ${theme.background} flex items-center justify-center rounded-lg border ${theme.border}`}>
                    <span className="text-4xl">☕</span>
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className={`text-lg font-bold ${theme.textPrimary} mb-1`}>{runnerUp.name}</h3>
                    <p className={`text-sm ${theme.textSecondary} mb-4 line-clamp-2`}>Rich, bold flavor profile for the perfect morning.</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className={`flex justify-between border-b ${theme.border} pb-1`}>
                        <span className={theme.textSecondary}>Price</span>
                        <span className={`font-semibold ${theme.textPrimary}`}>${runnerUp.price.toFixed(2)}</span>
                      </div>
                      <div className={`flex justify-between border-b ${theme.border} pb-1`}>
                        <span className={theme.textSecondary}>Rating</span>
                        <span className={`font-semibold ${theme.textPrimary} flex items-center`}><Star className="w-3 h-3 text-red-500 fill-red-500 mr-1"/>{runnerUp.rating}</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className={theme.textSecondary}>Origin</span>
                        <span className={`font-semibold ${theme.textPrimary}`}>Colombia</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className={`w-full mt-6 py-2.5 border ${theme.border} rounded font-semibold ${theme.textSecondary} hover:${theme.textPrimary} hover:${theme.surfaceHover} transition-colors`}>
                  View Details
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}