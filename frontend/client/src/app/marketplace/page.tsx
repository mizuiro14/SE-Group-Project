'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { useTheme } from '@/theme/ThemeContext';
import { 
  ChevronDown, Filter, Bookmark, RotateCcw, 
  MoreHorizontal, Truck, Check, ShoppingCart, Plus, X
} from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { useAuth } from '@/context/AuthContext';

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

const CATEGORIES = ['Vitamins', 'Juice', 'Powder', 'Pills', 'Gummy'];

// ==========================================
// 2. FILTERING LOGIC (DECORATOR PATTERN)
// ==========================================
interface ProductFilter {
  filter(products: Product[]): Product[];
}

class BaseFilter implements ProductFilter {
  filter(products: Product[]): Product[] {
    return products;
  }
}

abstract class FilterDecorator implements ProductFilter {
  protected filterComponent: ProductFilter;
  constructor(filterComponent: ProductFilter) {
    this.filterComponent = filterComponent;
  }
  abstract filter(products: Product[]): Product[];
}

class CategoryFilter extends FilterDecorator {
  private selectedCategories: string[];
  constructor(filterComponent: ProductFilter, selectedCategories: string[]) {
    super(filterComponent);
    this.selectedCategories = selectedCategories;
  }
  filter(products: Product[]): Product[] {
    const previousFiltered = this.filterComponent.filter(products);
    if (this.selectedCategories.length === 0) return previousFiltered;
    return previousFiltered.filter(p => this.selectedCategories.includes(p.category));
  }
}

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
export default function MarketplacePage() {
  const { theme, isDarkMode } = useTheme();
  const { isSeller } = useAuth(); 

  // --- STATE ---
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  
  // --- ADD ITEM MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemForm, setNewItemForm] = useState<{
    name: string;
    category: string;
    stock: number | '';
    price: number | '';
  }>({
    name: '',
    category: CATEGORIES[0], 
    stock: '', 
    price: ''  
  });

  // Fetch Global Products on Mount
  useEffect(() => {
    const fetchGlobalProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products'); 
        const dbProducts = await response.json();
        
        const mappedProducts: Product[] = dbProducts.map((p: any) => {
          let computedStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'Out of Stock';
          if (p.quantity > 30) computedStatus = 'In Stock';
          else if (p.quantity > 0) computedStatus = 'Low Stock';

          return {
            id: String(p.id),
            name: p.name,
            category: p.category || 'Uncategorized',
            stockText: `${p.quantity} ${computedStatus === 'Low Stock' ? 'Low Stock' : 'in stock'}`,
            price: p.price,
            status: computedStatus,
            imageLetter: p.name.charAt(0).toUpperCase() || 'P'
          };
        });

        setProducts(mappedProducts);
      } catch (error) {
        console.error('Failed to fetch marketplace items', error);
      }
    };

    fetchGlobalProducts();
  }, []);

  // Close custom drop downs when clicking outside
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

  // Add Item Logic
  const handleAddNewItem = async (e: React.FormEvent) => {
    e.preventDefault();

    const stockNum = Number(newItemForm.stock) || 0;
    const priceNum = Number(newItemForm.price) || 0;

    try {
      // POST the real data to your API to save it for everyone
      const categoryMap: Record<string, number> = {
        'Vitamins': 1,
        'Juice': 2,
        'Powder': 3,
        'Pills': 4,
        'Gummy': 5
      };
      const categoryId = categoryMap[newItemForm.category] || null;
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
           'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newItemForm.name,
          price: priceNum,
          quantity: stockNum,
          category_id: categoryId,
          description: `Added by Seller from Marketplace Page`
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server returned an error');
      }

      const savedDbProduct = await response.json();

      let computedStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'Out of Stock';
      if (stockNum > 30) computedStatus = 'In Stock';
      else if (stockNum > 0) computedStatus = 'Low Stock';

      // Build the product card format 
      const newProduct: Product = {
        id: String(savedDbProduct.id), 
        name: savedDbProduct.name,
        category: newItemForm.category,
        price: savedDbProduct.price,
        stockText: `${stockNum} ${computedStatus === 'Low Stock' ? 'Low Stock' : 'in stock'}`,
        status: computedStatus,
        imageLetter: savedDbProduct.name.charAt(0).toUpperCase() || 'P'
      };

      // Put it in our local state instantly for a snappy UI
      setProducts(prev => [newProduct, ...prev]);

      // Cleanup and close
      setNewItemForm({ name: '', category: CATEGORIES[0], stock: '', price: '' });
      setIsModalOpen(false);

    } catch (err) {
       console.error("Failed to list item globally", err);
    }
  };

  // Apply the decorator pattern filtering using our state variables
  const filteredProducts = useMemo(() => {
    let productFilter: ProductFilter = new BaseFilter();
    
    if (selectedCategories.length > 0) {
      productFilter = new CategoryFilter(productFilter, selectedCategories);
    }
    
    return productFilter.filter(products); 
  }, [selectedCategories, products]);

  return (
    <div className={`flex h-screen ${theme.background} ${theme.textPrimary} font-sans transition-colors duration-300`}>
      
      {/* ----------------- MODAL OVERLAY ----------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`${theme.surface} rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border ${theme.border}`}>
            <div className={`p-5 border-b ${theme.border} flex justify-between items-center`}>
              <h3 className={`font-bold ${theme.textPrimary}`}>Add New Marketplace Item</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className={`p-1 rounded-md ${theme.textSecondary} hover:${theme.surfaceHover} transition-colors outline-none`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddNewItem} className="p-5 flex flex-col gap-4">
              {/* Product Name */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-sm font-bold ${theme.textSecondary}`}>Product Name</label>
                <input 
                  required
                  type="text" 
                  value={newItemForm.name}
                  onChange={e => setNewItemForm({...newItemForm, name: e.target.value})}
                  className={`w-full ${theme.background} border ${theme.border} rounded-lg p-2.5 ${theme.textPrimary} outline-none focus:ring-2 focus:ring-green-700`}
                  placeholder="e.g. Organic Apple Juice"
                />
              </div>

              {/* Category Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-sm font-bold ${theme.textSecondary}`}>Category</label>
                <select 
                  required
                  value={newItemForm.category}
                  onChange={e => setNewItemForm({...newItemForm, category: e.target.value})}
                  className={`w-full ${theme.background} border ${theme.border} rounded-lg p-2.5 ${theme.textPrimary} outline-none focus:ring-2 focus:ring-green-700`}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-sm font-bold ${theme.textSecondary}`}>Price ($)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    min="0"
                    value={newItemForm.price}
                    onChange={e => setNewItemForm({...newItemForm, price: e.target.value === '' ? '' : parseFloat(e.target.value)})}
                    className={`w-full ${theme.background} border ${theme.border} rounded-lg p-2.5 ${theme.textPrimary} outline-none focus:ring-2 focus:ring-green-700`}
                  />
                </div>

                {/* Stock Amount */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-sm font-bold ${theme.textSecondary}`}>Stock Amount</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    value={newItemForm.stock}
                    onChange={e => setNewItemForm({...newItemForm, stock: e.target.value === '' ? '' : parseInt(e.target.value)})}
                    className={`w-full ${theme.background} border ${theme.border} rounded-lg p-2.5 ${theme.textPrimary} outline-none focus:ring-2 focus:ring-green-700`}
                  />
                </div>
              </div>

              <div className={`mt-4 pt-4 border-t ${theme.border} flex justify-end gap-3`}>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${theme.textSecondary} hover:${theme.textPrimary} hover:${theme.surfaceHover} transition-colors`}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 rounded-lg font-medium text-sm text-white bg-green-800 hover:bg-green-900 transition-colors shadow-sm"
                >
                  Done
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ----------------------------------------------- */}

      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP NAVBAR */}
        <DashboardHeader searchPlaceholder="Search marketplace products..." />

        {/* CONTENT */}
        <div className="flex-1 overflow-auto p-8">
          
          {/* Top Banner Card (ONLY SHOWS FOR SELLERS) */}
          {isSeller && (
            <div className={`${theme.surface} rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm border ${theme.border} transition-colors duration-300 gap-4`}>
              <div>
                <h3 className={`font-semibold ${theme.textPrimary} text-lg`}>Manage Your Products</h3>
                <p className={`text-sm ${theme.textSecondary}`}>Add new items to the marketplace from your inventory.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-green-800 hover:bg-green-900 shadow-sm flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5 flex-shrink-0" />
                Add New Items
              </button>
            </div>
          )}

          {/* Marketplace Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-6 gap-4">
            <div>
              <h1 className={`text-3xl font-bold tracking-tight ${theme.textPrimary} mb-2`}>Member Marketplace</h1>
              <p className={`text-sm ${theme.textSecondary} font-medium`}>Exclusive deals and fresh arrivals for you.</p>
            </div>
            {/* Filter Dropdown Area */}
            <div className="flex flex-wrap items-center gap-2">
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

          <h2 className={`text-lg font-bold ${theme.textPrimary} mb-4`}>Recommended for You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <ProductCard id="1" name="Organic Fertilizer" price={24.99} stockCount={15} />
              <ProductCard id="2" name="Premium Seeds" price={12.50} stockCount={0} />
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
                      <td className={`py-4 font-bold ${theme.textPrimary}`}>${Number(product.price).toFixed(2)}</td>
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