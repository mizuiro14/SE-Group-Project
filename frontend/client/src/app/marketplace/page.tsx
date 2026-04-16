'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { useTheme } from '@/theme/ThemeContext';
import { 
  ChevronDown, Filter, Bookmark, RotateCcw, 
  MoreHorizontal, Truck, Check, ShoppingCart
} from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';

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

  // Bring in the global theme
  const { theme, isDarkMode } = useTheme();

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
    
    if (selectedCategories.length > 0) {
      productFilter = new CategoryFilter(productFilter, selectedCategories);
    }
    
    return productFilter.filter(MOCK_PRODUCTS);
  }, [selectedCategories]);

  return (
    <div className={`flex h-screen ${theme.background} ${theme.textPrimary} font-sans transition-colors duration-300`}>
      
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP NAVBAR */}
        <DashboardHeader searchPlaceholder="Search marketplace products..." />

        {/* CONTENT */}
        <div className="flex-1 overflow-auto p-8">
          
          {/* Top Banner Card */}
          <div className={`${theme.surface} rounded-2xl p-4 mb-8 flex items-center justify-between shadow-sm border ${theme.border} transition-colors duration-300`}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 ${isDarkMode ? 'bg-green-900/30' : 'bg-[#E5F0E6]'} rounded-full flex items-center justify-center`}>
                <Truck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className={`font-semibold ${theme.textPrimary}`}>Next Delivery Arriving</h3>
                <p className={`text-sm ${theme.textSecondary}`}>Today between 2:00 PM - 4:00 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className={`px-4 py-2 border ${theme.border} rounded-lg text-sm font-medium ${theme.textPrimary} bg-transparent hover:${theme.surfaceHover} shadow-sm flex items-center gap-2 transition-colors`}>
                <Bookmark className={`w-4 h-4 ${theme.textSecondary}`} />
                Saved
              </button>
              <button className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-800 hover:bg-green-900 shadow-sm flex items-center gap-2 transition-colors">
                <RotateCcw className="w-4 h-4" />
                Reorder
              </button>
            </div>
          </div>

          {/* Marketplace Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-6 gap-4">
            <div>
              <h1 className={`text-3xl font-bold tracking-tight ${theme.textPrimary} mb-2`}>Member Marketplace</h1>
              <p className={`text-sm ${theme.textSecondary} font-medium`}>Exclusive deals and fresh arrivals for you.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="px-4 py-1.5 bg-green-800 text-white rounded-full text-sm font-medium shadow-sm transition-colors">All</button>
              <button className={`px-4 py-1.5 ${theme.surface} ${theme.textPrimary} rounded-full text-sm font-medium hover:${theme.surfaceHover} shadow-sm border ${theme.border} transition-colors`}>Organic</button>
              <button className={`px-4 py-1.5 ${theme.surface} ${theme.textPrimary} rounded-full text-sm font-medium hover:${theme.surfaceHover} shadow-sm border ${theme.border} transition-colors`}>Pantry</button>
              <button className={`px-4 py-1.5 ${theme.surface} ${theme.textPrimary} rounded-full text-sm font-medium hover:${theme.surfaceHover} shadow-sm border ${theme.border} transition-colors`}>Snacks</button>
              
              {/* Custom Multi-Select Dropdown Component */}
              <div className="relative ml-2" ref={filterRef}>
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm border transition-colors ${
                    selectedCategories.length > 0 
                    ? `bg-green-800/10 border-green-700 text-green-600` 
                    : `${theme.surface} ${theme.textPrimary} border-${theme.border} hover:${theme.surfaceHover}`
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filter {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                </button>

                {isFilterOpen && (
                  <div className={`absolute right-0 mt-2 w-48 ${theme.surface} border ${theme.border} rounded-xl shadow-lg z-10 py-2`}>
                    {CATEGORIES.map(category => {
                      const isSelected = selectedCategories.includes(category);
                      return (
                        <div 
                          key={category}
                          onClick={() => toggleCategory(category)}
                          className={`flex items-center px-4 py-2 cursor-pointer hover:${theme.surfaceHover} transition-colors`}
                        >
                          <div className={`w-4 h-4 mr-3 border rounded flex items-center justify-center ${isSelected ? 'bg-green-700 border-green-700' : `${theme.background} border-gray-400`}`}>
                            {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                          </div>
                          <span className={`text-sm font-medium ${theme.textPrimary}`}>{category}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recommended Cards */}
          <h2 className={`text-lg font-bold ${theme.textPrimary} mb-4`}>Recommended for You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <ProductCard 
                  id="1" 
                  name="Organic Fertilizer" 
                  price={24.99} 
                  stockCount={15} 
              />
              <ProductCard 
                  id="2" 
                  name="Premium Seeds" 
                  price={12.50} 
                  stockCount={0} 
              />
          </div>

          {/* All Products List */}
          <div className={`${theme.surface} rounded-2xl shadow-sm overflow-hidden p-6 border ${theme.border} transition-colors duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-sm font-bold ${theme.textPrimary}`}>All Products</h2>
              <button className={`text-sm ${theme.textSecondary} font-medium flex items-center gap-1`}>
                Sort by: <span className={`font-bold ${theme.textPrimary}`}>Relevance</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            <table className="w-full text-sm text-left">
              <thead>
                <tr className={`text-xs ${theme.textSecondary} uppercase tracking-wider border-b ${theme.border}`}>
                  <th className="pb-3 w-8"><input type="checkbox" className={`rounded text-green-700 focus:ring-green-700 ${theme.background} border-gray-400`} /></th>
                  <th className={`pb-3 font-semibold ${theme.textSecondary}`}>Product Name</th>
                  <th className={`pb-3 font-semibold ${theme.textSecondary}`}>Category</th>
                  <th className={`pb-3 font-semibold ${theme.textSecondary}`}>Stock Status</th>
                  <th className={`pb-3 font-semibold ${theme.textSecondary}`}>Member Price</th>
                  <th className={`pb-3 font-semibold ${theme.textSecondary}`}>Availability</th>
                  <th className={`pb-3 font-semibold text-right ${theme.textSecondary}`}>Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme.border}`}>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`py-8 text-center ${theme.textSecondary}`}>
                      No products match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className={`group hover:${theme.surfaceHover} transition-colors`}>
                      <td className="py-4"><input type="checkbox" className={`rounded text-green-700 ${theme.background} border-gray-400`} /></td>
                      <td className="py-4 flex items-center gap-3">
                        <div className={`w-10 h-10 border ${theme.border} rounded ${theme.background} flex items-center justify-center font-bold ${theme.textSecondary}`}>
                           {product.imageLetter}
                        </div>
                        <span className={`font-bold ${theme.textPrimary}`}>{product.name}</span>
                      </td>
                      <td className={`py-4 ${theme.textSecondary} font-medium`}>{product.category}</td>
                      <td className={`py-4 font-bold ${product.status === 'Low Stock' ? 'text-red-500' : `${theme.textSecondary} font-medium`}`}>
                        {product.stockText}
                      </td>
                      <td className={`py-4 font-bold ${theme.textPrimary}`}>${product.price.toFixed(2)}</td>
                      <td className="py-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          product.status === 'In Stock' ? (isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-[#E5F0E6] text-[#2C3E2D]') : 
                          product.status === 'Low Stock' ? (isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700') :
                          (isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700')
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className={`flex items-center justify-end gap-2 ${theme.textSecondary}`}>
                          <button className={`p-1 hover:${theme.textPrimary} transition-colors`}><ShoppingCart className="w-4 h-4" /></button>
                          <button className={`p-1 hover:${theme.textPrimary} transition-colors`}><MoreHorizontal className="w-4 h-4" /></button>
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