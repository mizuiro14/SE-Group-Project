'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Search, Bell, ShoppingCart, ChevronDown, Filter, 
  Bookmark, RotateCcw, Plus, MoreHorizontal, Truck, Check
} from 'lucide-react';

// ==========================================
// 1. TYPES & MOCK DATA
// ==========================================
export interface Product {
  id: string;
  name: string;
  category: string;
  stockText: string;
  price: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  imageLetter: string;
}

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Daily Essential Vitamins', category: 'Vitamins', stockText: '120 in stock', price: 24.50, status: 'In Stock', imageLetter: 'V' },
  { id: '2', name: 'Green Superfood Juice', category: 'Juice', stockText: '45 in stock', price: 12.00, status: 'In Stock', imageLetter: 'J' },
  { id: '3', name: 'Organic Barley Powder', category: 'Powder', stockText: '5 Low Stock', price: 34.00, status: 'Low Stock', imageLetter: 'P' },
  { id: '4', name: 'Barley Grass Capsules', category: 'Pills', stockText: '82 in stock', price: 18.00, status: 'In Stock', imageLetter: 'P' },
  { id: '5', name: 'Kids Barley Gummies', category: 'Gummy', stockText: '0 in stock', price: 15.50, status: 'Out of Stock', imageLetter: 'G' },
];

const CATEGORIES = ['Vitamins', 'Juice', 'Powder', 'Pills', 'Gummy'];

// ==========================================
// 2. FILTERING LOGIC (DECORATOR PATTERN)
// ==========================================
interface ProductFilter {
  filter(products: Product[]): Product[];
}

// Base Component: Returns all products
class BaseFilter implements ProductFilter {
  filter(products: Product[]): Product[] {
    return products;
  }
}

// Abstract Decorator
abstract class FilterDecorator implements ProductFilter {
  protected filterComponent: ProductFilter;
  
  constructor(filterComponent: ProductFilter) {
    this.filterComponent = filterComponent;
  }
  
  abstract filter(products: Product[]): Product[];
}

// Concrete Decorator: Filters by matching ANY of the selected categories
class CategoryFilter extends FilterDecorator {
  private selectedCategories: string[];
  
  constructor(filterComponent: ProductFilter, selectedCategories: string[]) {
    super(filterComponent);
    this.selectedCategories = selectedCategories;
  }
  
  filter(products: Product[]): Product[] {
    const previousFiltered = this.filterComponent.filter(products);
    // If no categories are selected, return all
    if (this.selectedCategories.length === 0) return previousFiltered;
    // Otherwise, check if the product's category is in the selected list
    return previousFiltered.filter(p => this.selectedCategories.includes(p.category));
  }
}

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
export default function MarketplacePage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Apply the decorator pattern filtering
  const filteredProducts = useMemo(() => {
    let productFilter: ProductFilter = new BaseFilter();
    
    // Dynamically wrap with CategoryFilter if there are active selections
    if (selectedCategories.length > 0) {
      productFilter = new CategoryFilter(productFilter, selectedCategories);
    }
    
    return productFilter.filter(MOCK_PRODUCTS);
  }, [selectedCategories]);

  return (
    <div className="flex h-screen bg-[#F5F3EF] text-stone-800 font-sans">
      
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-[#EAE7E0] flex items-center justify-between px-6 shrink-0 shadow-sm">
          <div className="flex-1 max-w-2xl relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search marketplace products..." 
              className="w-full bg-[#F5F3EF] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#2C3E2D] outline-none text-stone-800 placeholder-stone-400"
            />
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button className="relative p-2 text-stone-400 hover:text-stone-800 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-2 w-2 h-2 bg-[#C85D4E] border border-white rounded-full"></span>
            </button>
            <button className="relative p-2 bg-[#F5F3EF] rounded-full text-stone-600 hover:bg-[#EAE7E0] transition-colors">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-[#2C3E2D] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                3
              </span>
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto p-8">
          
          {/* Top Banner Card */}
          <div className="bg-white rounded-2xl p-4 mb-8 flex items-center justify-between shadow-sm border border-[#EAE7E0]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#E5F0E6] rounded-full flex items-center justify-center">
                <Truck className="w-5 h-5 text-[#2C3E2D]" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">Next Delivery Arriving</h3>
                <p className="text-sm text-stone-500">Today between 2:00 PM - 4:00 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 border border-[#EAE7E0] rounded-lg text-sm font-medium text-stone-700 bg-white hover:bg-[#F5F3EF] shadow-sm flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                Saved
              </button>
              <button className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#2C3E2D] hover:bg-[#1E2D20] shadow-sm flex items-center gap-2 transition-colors">
                <RotateCcw className="w-4 h-4" />
                Reorder
              </button>
            </div>
          </div>

          {/* Marketplace Header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-stone-900 mb-2">Member Marketplace</h1>
              <p className="text-sm text-stone-600 font-medium">Exclusive deals and fresh arrivals for you.</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-1.5 bg-[#2C3E2D] text-white rounded-full text-sm font-medium shadow-sm">All</button>
              <button className="px-4 py-1.5 bg-white text-stone-700 rounded-full text-sm font-medium hover:bg-[#F5F3EF] shadow-sm border border-[#EAE7E0]">Organic</button>
              <button className="px-4 py-1.5 bg-white text-stone-700 rounded-full text-sm font-medium hover:bg-[#F5F3EF] shadow-sm border border-[#EAE7E0]">Pantry</button>
              <button className="px-4 py-1.5 bg-white text-stone-700 rounded-full text-sm font-medium hover:bg-[#F5F3EF] shadow-sm border border-[#EAE7E0]">Snacks</button>
              
              {/* Custom Multi-Select Dropdown Component */}
              <div className="relative ml-2" ref={filterRef}>
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm border transition-colors ${
                    selectedCategories.length > 0 
                    ? 'bg-[#E5F0E6] border-[#2C3E2D] text-[#2C3E2D]' 
                    : 'bg-white text-stone-900 border-[#EAE7E0] hover:bg-[#F5F3EF]'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filter {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#EAE7E0] rounded-xl shadow-lg z-10 py-2">
                    {CATEGORIES.map(category => {
                      const isSelected = selectedCategories.includes(category);
                      return (
                        <div 
                          key={category}
                          onClick={() => toggleCategory(category)}
                          className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#F5F3EF] transition-colors"
                        >
                          <div className={`w-4 h-4 mr-3 border rounded flex items-center justify-center ${isSelected ? 'bg-[#2C3E2D] border-[#2C3E2D]' : 'bg-white border-stone-300'}`}>
                            {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                          </div>
                          <span className="text-sm font-medium text-stone-700">{category}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recommended Cards */}
          <h2 className="text-lg font-bold text-stone-900 mb-4">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm relative group cursor-pointer border border-[#EAE7E0] hover:border-[#2C3E2D]/30 transition-all hover:shadow-md">
              <span className="absolute top-4 left-4 bg-[#C85D4E] text-white text-[10px] font-bold px-2 py-1 rounded">SALE</span>
              <div className="h-40 flex items-center justify-center mb-4 bg-[#F5F3EF] rounded-xl">
                <img src="https://via.placeholder.com/80x200?text=Oil" alt="Olive Oil" className="h-full object-contain mix-blend-multiply" />
              </div>
              <p className="text-xs text-[#2C3E2D] font-bold mb-1 uppercase tracking-wide">Pantry Essentials</p>
              <h3 className="font-bold text-stone-900 text-sm mb-3">Artisan Organic Olive Oil</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-stone-900">$24.00</span>
                  <span className="text-xs text-stone-400 line-through">$30.00</span>
                </div>
                <button className="w-8 h-8 rounded-full bg-[#F5F3EF] flex items-center justify-center text-stone-600 hover:bg-[#2C3E2D] hover:text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm relative group cursor-pointer border border-[#EAE7E0] hover:border-[#2C3E2D]/30 transition-all hover:shadow-md">
              <div className="h-40 flex items-center justify-center mb-4 bg-[#F5F3EF] rounded-xl">
                <img src="https://via.placeholder.com/150x100?text=Bread" alt="Sourdough Loaf" className="h-full object-contain mix-blend-multiply" />
              </div>
              <p className="text-xs text-[#2C3E2D] font-bold mb-1 uppercase tracking-wide">Fresh Bakery</p>
              <h3 className="font-bold text-stone-900 text-sm mb-3">Rustic Sourdough Loaf</h3>
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">$8.50</span>
                <button className="w-8 h-8 rounded-full bg-[#F5F3EF] flex items-center justify-center text-stone-600 hover:bg-[#2C3E2D] hover:text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* All Products List */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-6 border border-[#EAE7E0]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-stone-900">All Products</h2>
              <button className="text-sm text-stone-500 font-medium flex items-center gap-1">
                Sort by: <span className="font-bold text-stone-900">Relevance</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-stone-400 uppercase tracking-wider border-b border-[#EAE7E0]">
                  <th className="pb-3 w-8"><input type="checkbox" className="rounded text-[#2C3E2D] focus:ring-[#2C3E2D] border-stone-300" /></th>
                  <th className="pb-3 font-semibold text-stone-600">Product Name</th>
                  <th className="pb-3 font-semibold text-stone-600">Category</th>
                  <th className="pb-3 font-semibold text-stone-600">Stock Status</th>
                  <th className="pb-3 font-semibold text-stone-600">Member Price</th>
                  <th className="pb-3 font-semibold text-stone-600">Availability</th>
                  <th className="pb-3 font-semibold text-right text-stone-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE7E0]">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-500">
                      No products match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="group hover:bg-[#F5F3EF] transition-colors">
                      <td className="py-4"><input type="checkbox" className="rounded text-[#2C3E2D] border-stone-300" /></td>
                      <td className="py-4 flex items-center gap-3">
                        <div className="w-10 h-10 border border-[#EAE7E0] rounded bg-white flex items-center justify-center font-bold text-stone-400">
                           {product.imageLetter}
                        </div>
                        <span className="font-bold text-stone-900">{product.name}</span>
                      </td>
                      <td className="py-4 text-stone-500 font-medium">{product.category}</td>
                      <td className={`py-4 font-bold ${product.status === 'Low Stock' ? 'text-[#C85D4E]' : 'text-stone-500 font-medium'}`}>
                        {product.stockText}
                      </td>
                      <td className="py-4 font-bold text-stone-900">${product.price.toFixed(2)}</td>
                      <td className="py-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          product.status === 'In Stock' ? 'bg-[#E5F0E6] text-[#2C3E2D]' : 
                          product.status === 'Low Stock' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-end gap-2 text-stone-400">
                          <button className="p-1 hover:text-stone-900 transition-colors"><ShoppingCart className="w-4 h-4" /></button>
                          <button className="p-1 hover:text-stone-900 transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}