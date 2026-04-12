"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import { Search, Bell, ShoppingCart } from "lucide-react";

export default function StockPage() {
  return (
    <div className="flex h-screen bg-[#F5F3EF] font-sans text-stone-800">
      
      {/* 1. Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP NAVBAR (Matching the Design) */}
        <header className="h-16 bg-white border-b border-[#EAE7E0] flex items-center justify-between px-6 shrink-0 shadow-sm">
          <div className="flex-1 max-w-2xl relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search inventory, SKUs, or suppliers..." 
              className="w-full bg-[#F5F3EF] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#2C3E2D] outline-none text-stone-800 placeholder-stone-400"
            />
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button className="relative p-2 text-stone-400 hover:text-stone-800 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
            </button>
            <button className="relative p-2 text-stone-400 hover:text-stone-800 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-0 right-0 bg-stone-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">3</span>
            </button>
          </div>
        </header>

        {/* DASHBOARD CONTENT (Scrollable) */}
        <div className="flex-1 overflow-auto p-8 bg-[#FDFBF7]">
          
          {/* Header Section */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: "serif" }}>Inventory Visibility</h1>
              <p className="text-gray-500 mt-1">Real-time stock insights across all warehouses</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-white border border-gray-200 rounded-md p-1 shadow-sm">
                <button className="px-3 py-1.5 bg-gray-100 rounded text-sm font-medium text-gray-700 flex items-center gap-2">
                  Board
                </button>
                <button className="px-3 py-1.5 rounded text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-2">
                  Table
                </button>
              </div>
              <button className="bg-[#2C3E2D] hover:bg-[#1a261c] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
                + Add Stock
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Items */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-4 border border-gray-100">
                📦
              </div>
              <p className="text-sm font-medium text-gray-500">Total Items in Stock</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-gray-900">5,248</span>
                <span className="text-sm font-medium text-emerald-600">↑ 3.25%</span>
              </div>
            </div>

            {/* Low Stock */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-4 border border-orange-100 text-orange-600">
                ⚠️
              </div>
              <p className="text-sm font-medium text-gray-500">Low Stock Alerts</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-gray-900">147</span>
                <span className="text-sm font-medium text-red-500">↓ 0.85%</span>
              </div>
            </div>

            {/* Out of Stock */}
            <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mb-4 border border-red-100 text-red-600">
                🚫
              </div>
              <p className="text-sm font-medium text-gray-500">Items Out of Stock</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-gray-900">29</span>
                <span className="text-sm font-medium text-red-500">↑ 4.15%</span>
              </div>
            </div>
          </div>

          {/* Toolbar (Filters & Actions) */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-8">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative max-w-xs w-full">
                <input 
                  type="text" 
                  placeholder="Filter by name, SKU..." 
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
              <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 p-2 outline-none">
                <option>All Suppliers</option>
              </select>
              <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 p-2 outline-none">
                <option>All Categories</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm">
                📥 Export
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm">
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
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <h2 className="font-semibold text-gray-800">In Stock</h2>
                </div>
                <span className="text-sm font-medium text-gray-500">1,204</span>
              </div>
              
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU: RAW-HNY-16</span>
                  <button className="text-gray-400 hover:text-gray-600">⋮</button>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1587049352851-8d4e8e100c28?auto=format&fit=crop&q=80&w=100&h=100')" }}></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Raw Wildflower Honey</h3>
                    <p className="text-sm text-gray-500">Pantry • 16oz</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-bold text-gray-900">342 units</span>
                  </div>
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1">🚛 Local Farms Co.</span>
                </div>
              </div>

              {/* Duplicate Card example to show more items */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU: SDO-LOF-01</span>
                  <button className="text-gray-400 hover:text-gray-600">⋮</button>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1589367920969-ab8e050eb0e9?auto=format&fit=crop&q=80&w=100&h=100')" }}></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Rustic Sourdough Loaf</h3>
                    <p className="text-sm text-gray-500">Bakery • Fresh</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-bold text-gray-900">85 units</span>
                  </div>
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1">🚛 City Bakery</span>
                </div>
              </div>

            </div>

            {/* Column: Low Stock */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <h2 className="font-semibold text-gray-800">Low Stock</h2>
                </div>
                <span className="text-sm font-medium text-red-500">147</span>
              </div>
              
              <div className="bg-white p-5 rounded-xl border-l-[3px] border-l-red-500 border-y border-r border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU: DRK-COF-12</span>
                  <button className="text-gray-400 hover:text-gray-600">⋮</button>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=100&h=100')" }}></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Dark Roast Coffee Beans</h3>
                    <p className="text-sm text-gray-500">Beverages • 12oz</p>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-sm font-bold text-gray-900">12 units</span>
                    </div>
                    <span className="text-xs font-semibold text-red-500">Threshold: 20</span>
                  </div>
                  <button className="text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded transition">
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
                  <h2 className="font-semibold text-gray-800">Out of Stock</h2>
                </div>
                <span className="text-sm font-medium text-red-500">29</span>
              </div>

              <div className="bg-white p-5 rounded-xl border-l-[3px] border-l-red-500 border-y border-r border-gray-100 shadow-sm hover:shadow-md transition-shadow opacity-90">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU: MCH-TIN-04</span>
                  <button className="text-gray-400 hover:text-gray-600">⋮</button>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded bg-cover bg-center grayscale" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582787032747-0e69314de6b9?auto=format&fit=crop&q=80&w=100&h=100')" }}></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Ceremonial Matcha Tin</h3>
                    <p className="text-sm text-gray-500">Beverages • 4oz</p>
                  </div>
                </div>
                
                <div className="mt-4 border-t border-gray-50 pt-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-sm font-bold text-gray-900">0 units</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50/80 p-2 rounded text-xs">
                    <span className="font-semibold text-gray-500 uppercase tracking-wide">Restock ETA</span>
                    <span className="font-bold text-gray-900">Aug 24, 2025</span>
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