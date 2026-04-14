"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import { Search, Bell, ShoppingCart } from "lucide-react";
import { useTheme } from "@/theme/ThemeContext";

export default function StockPage() {
  const { theme, isDarkMode } = useTheme();

  return (
    <div className={`flex h-screen ${theme.background} ${theme.textPrimary} font-sans transition-colors duration-300`}>
      
      {/* 1. Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP NAVBAR (Matching the Design) */}
        <header className={`h-16 ${theme.surface} border-b ${theme.border} flex items-center justify-between px-6 shrink-0 shadow-sm transition-colors duration-300`}>
          <div className="flex-1 max-w-2xl relative">
            <Search className={`w-4 h-4 ${theme.textSecondary} absolute left-3 top-1/2 -translate-y-1/2`} />
            <input 
              type="text" 
              placeholder="Search inventory, SKUs, or suppliers..." 
              className={`w-full ${theme.background} border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-green-700 outline-none ${theme.textPrimary} placeholder-gray-400 transition-colors duration-300`}
            />
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button className={`relative p-2 ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
            </button>
            <button className={`relative p-2 ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}>
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-0 right-0 bg-stone-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-transparent">3</span>
            </button>
          </div>
        </header>

        {/* DASHBOARD CONTENT (Scrollable) */}
        <div className="flex-1 overflow-auto p-8">
          
          {/* Header Section */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className={`text-3xl font-bold ${theme.textPrimary} tracking-tight`} style={{ fontFamily: "serif" }}>Inventory Visibility</h1>
              <p className={`${theme.textSecondary} mt-1`}>Real-time stock insights across all warehouses</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex ${theme.surface} border ${theme.border} rounded-md p-1 shadow-sm transition-colors duration-300`}>
                <button className={`px-3 py-1.5 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded text-sm font-medium ${theme.textPrimary} flex items-center gap-2`}>
                  Board
                </button>
                <button className={`px-3 py-1.5 rounded text-sm font-medium ${theme.textSecondary} hover:${theme.textPrimary} flex items-center gap-2 transition-colors`}>
                  Table
                </button>
              </div>
              <button className="bg-green-800 hover:bg-green-900 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
                + Add Stock
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Items */}
            <div className={`${theme.surface} p-6 rounded-xl border ${theme.border} shadow-sm transition-colors duration-300`}>
              <div className={`w-10 h-10 ${theme.background} rounded-lg flex items-center justify-center mb-4 border ${theme.border}`}>
                📦
              </div>
              <p className={`text-sm font-medium ${theme.textSecondary}`}>Total Items in Stock</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-3xl font-bold ${theme.textPrimary}`}>5,248</span>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>↑ 3.25%</span>
              </div>
            </div>

            {/* Low Stock */}
            <div className={`${theme.surface} p-6 rounded-xl border ${theme.border} shadow-sm transition-colors duration-300`}>
              <div className={`w-10 h-10 ${isDarkMode ? 'bg-orange-900/30 border-orange-800 text-orange-400' : 'bg-orange-50 border-orange-100 text-orange-600'} rounded-lg flex items-center justify-center mb-4 border`}>
                ⚠️
              </div>
              <p className={`text-sm font-medium ${theme.textSecondary}`}>Low Stock Alerts</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-3xl font-bold ${theme.textPrimary}`}>147</span>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>↓ 0.85%</span>
              </div>
            </div>

            {/* Out of Stock */}
            <div className={`${theme.surface} p-6 rounded-xl border ${theme.border} shadow-sm transition-colors duration-300`}>
              <div className={`w-10 h-10 ${isDarkMode ? 'bg-red-900/30 border-red-800 text-red-400' : 'bg-red-50 border-red-100 text-red-600'} rounded-lg flex items-center justify-center mb-4 border`}>
                🚫
              </div>
              <p className={`text-sm font-medium ${theme.textSecondary}`}>Items Out of Stock</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-3xl font-bold ${theme.textPrimary}`}>29</span>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>↑ 4.15%</span>
              </div>
            </div>
          </div>

          {/* Toolbar (Filters & Actions) */}
          <div className={`flex flex-wrap items-center justify-between gap-4 ${theme.surface} p-4 rounded-xl border ${theme.border} shadow-sm mb-8 transition-colors duration-300`}>
            <div className="flex flex-1 items-center gap-4">
              <div className="relative max-w-xs w-full">
                <input 
                  type="text" 
                  placeholder="Filter by name, SKU..." 
                  className={`w-full pl-9 pr-4 py-2 ${theme.background} border ${theme.border} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${theme.textPrimary} placeholder-gray-400`}
                />
                <Search className={`absolute left-3 top-2.5 w-4 h-4 ${theme.textSecondary}`} />
              </div>
              <select className={`${theme.background} border ${theme.border} ${theme.textPrimary} text-sm rounded-lg focus:ring-green-600 p-2 outline-none`}>
                <option>All Suppliers</option>
              </select>
              <select className={`${theme.background} border ${theme.border} ${theme.textPrimary} text-sm rounded-lg focus:ring-green-600 p-2 outline-none`}>
                <option>All Categories</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button className={`px-4 py-2 border ${theme.border} rounded-lg text-sm font-medium ${theme.textPrimary} hover:${theme.surfaceHover} bg-transparent flex items-center gap-2 shadow-sm transition-colors`}>
                📥 Export
              </button>
              <button className={`px-4 py-2 border ${theme.border} rounded-lg text-sm font-medium ${theme.textPrimary} hover:${theme.surfaceHover} bg-transparent flex items-center gap-2 shadow-sm transition-colors`}>
                🗂️ Bulk Actions
              </button>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
            
            {/* Column: In Stock */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  <h2 className={`font-semibold ${theme.textPrimary}`}>In Stock</h2>
                </div>
                <span className={`text-sm font-medium ${theme.textSecondary}`}>1,204</span>
              </div>
              
              <div className={`${theme.surface} p-5 rounded-xl border ${theme.border} shadow-sm hover:shadow-md transition-all duration-300 hover:border-green-700/30`}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-semibold ${theme.textSecondary} uppercase tracking-wider`}>SKU: RAW-HNY-16</span>
                  <button className={`${theme.textSecondary} hover:${theme.textPrimary}`}>⋮</button>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className={`w-12 h-12 ${theme.background} rounded bg-cover bg-center border ${theme.border}`} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1587049352851-8d4e8e100c28?auto=format&fit=crop&q=80&w=100&h=100')" }}></div>
                  <div>
                    <h3 className={`font-semibold ${theme.textPrimary}`}>Raw Wildflower Honey</h3>
                    <p className={`text-sm ${theme.textSecondary}`}>Pantry • 16oz</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className={`text-sm font-bold ${theme.textPrimary}`}>342 units</span>
                  </div>
                  <span className={`text-xs font-medium ${theme.textSecondary} flex items-center gap-1`}>🚛 Local Farms Co.</span>
                </div>
              </div>

              {/* Duplicate Card example to show more items */}
              <div className={`${theme.surface} p-5 rounded-xl border ${theme.border} shadow-sm hover:shadow-md transition-all duration-300 hover:border-green-700/30`}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-semibold ${theme.textSecondary} uppercase tracking-wider`}>SKU: SDO-LOF-01</span>
                  <button className={`${theme.textSecondary} hover:${theme.textPrimary}`}>⋮</button>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className={`w-12 h-12 ${theme.background} rounded bg-cover bg-center border ${theme.border}`} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1589367920969-ab8e050eb0e9?auto=format&fit=crop&q=80&w=100&h=100')" }}></div>
                  <div>
                    <h3 className={`font-semibold ${theme.textPrimary}`}>Rustic Sourdough Loaf</h3>
                    <p className={`text-sm ${theme.textSecondary}`}>Bakery • Fresh</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className={`text-sm font-bold ${theme.textPrimary}`}>85 units</span>
                  </div>
                  <span className={`text-xs font-medium ${theme.textSecondary} flex items-center gap-1`}>🚛 City Bakery</span>
                </div>
              </div>

            </div>

            {/* Column: Low Stock */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <h2 className={`font-semibold ${theme.textPrimary}`}>Low Stock</h2>
                </div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>147</span>
              </div>
              
              <div className={`${theme.surface} p-5 rounded-xl border-l-[3px] border-l-red-500 border-y border-r ${theme.border} shadow-sm hover:shadow-md transition-all duration-300`}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-semibold ${theme.textSecondary} uppercase tracking-wider`}>SKU: DRK-COF-12</span>
                  <button className={`${theme.textSecondary} hover:${theme.textPrimary}`}>⋮</button>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className={`w-12 h-12 ${theme.background} rounded bg-cover bg-center border ${theme.border}`} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=100&h=100')" }}></div>
                  <div>
                    <h3 className={`font-semibold ${theme.textPrimary}`}>Dark Roast Coffee Beans</h3>
                    <p className={`text-sm ${theme.textSecondary}`}>Beverages • 12oz</p>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className={`text-sm font-bold ${theme.textPrimary}`}>12 units</span>
                    </div>
                    <span className={`text-xs font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>Threshold: 20</span>
                  </div>
                  <button className={`text-xs font-semibold ${theme.background} hover:${theme.surfaceHover} ${theme.textPrimary} border ${theme.border} px-3 py-1.5 rounded transition`}>
                    Reorder
                  </button>
                </div>
              </div>
            </div>

            {/* Column: Out of Stock */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <h2 className={`font-semibold ${theme.textPrimary}`}>Out of Stock</h2>
                </div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>29</span>
              </div>

              <div className={`${theme.surface} p-5 rounded-xl border-l-[3px] border-l-red-500 border-y border-r ${theme.border} shadow-sm hover:shadow-md transition-all duration-300 opacity-90`}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-semibold ${theme.textSecondary} uppercase tracking-wider`}>SKU: MCH-TIN-04</span>
                  <button className={`${theme.textSecondary} hover:${theme.textPrimary}`}>⋮</button>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className={`w-12 h-12 ${theme.background} rounded bg-cover bg-center grayscale border ${theme.border}`} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582787032747-0e69314de6b9?auto=format&fit=crop&q=80&w=100&h=100')" }}></div>
                  <div>
                    <h3 className={`font-semibold ${theme.textPrimary}`}>Ceremonial Matcha Tin</h3>
                    <p className={`text-sm ${theme.textSecondary}`}>Beverages • 4oz</p>
                  </div>
                </div>
                
                <div className={`mt-4 border-t ${theme.border} pt-3`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className={`text-sm font-bold ${theme.textPrimary}`}>0 units</span>
                  </div>
                  <div className={`flex justify-between items-center ${theme.background} p-2 rounded text-xs border ${theme.border}`}>
                    <span className={`font-semibold ${theme.textSecondary} uppercase tracking-wide`}>Restock ETA</span>
                    <span className={`font-bold ${theme.textPrimary}`}>Aug 24, 2025</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}