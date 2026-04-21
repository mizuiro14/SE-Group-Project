"use client";

import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import { Search, Bell, ShoppingCart, Image as ImageIcon, X, Check, Loader2 } from "lucide-react";
import { useTheme } from "@/theme/ThemeContext";
import { useAuth } from '@/context/AuthContext';

// Define a Product type that includes enough data for our cards
interface Product {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  image_url?: string;
}

export default function StockPage() {
  const { theme, isDarkMode } = useTheme();
  const { user } = useAuth();
  
  // State to hold fetched products
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // States for Reordering Modal (Card specific)
  const [productToReorder, setProductToReorder] = useState<Product | null>(null);
  const [reorderAmount, setReorderAmount] = useState<number>(10);
  const [isReordering, setIsReordering] = useState(false);

  // States for Global Add Stock Modal
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [addStockSearch, setAddStockSearch] = useState("");
  const [selectedAddStockProductId, setSelectedAddStockProductId] = useState<string>("");
  const [addStockAmount, setAddStockAmount] = useState<number>(10);
  const [isAddingStock, setIsAddingStock] = useState(false);

  // Fetch products continuously or on mount
  useEffect(() => {
    const fetchStock = async () => {
      // 1. Check if the user is loaded. If not, don't execute yet.
      if (!user?.id) return;

      try {
        setLoading(true);
        // 2. Fetch using the specific seller's ID
        const response = await fetch(`http://localhost:5000/api/products?seller_id=${user.id}`); 
        if (!response.ok) throw new Error("Failed to fetch");
        
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch stock items', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, [user?.id]); // 3. Ensure this runs again when the user context loads/changes

  // ===============================
  // CALCULATE MACRO KPIs
  // ===============================
  const totalStockCount = useMemo(() => {
    return products.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter(item => item.quantity > 0 && item.quantity <= 30).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter(item => item.quantity === 0).length;
  }, [products]);

  // ===============================
  // KANBAN COLUMN DATA ARRAYS
  // ===============================
  // 1. Top 5 In Stock (sorted highest to lowest)
  const topInStock = useMemo(() => {
     return products
        .filter(item => item.quantity > 30)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
  }, [products]);

  // 2. All Low in Stock
  const allLowStock = useMemo(() => {
      return products.filter(item => item.quantity > 0 && item.quantity <= 30);
  }, [products]);

  // 3. All Out of Stock
  const allOutOfStock = useMemo(() => {
      return products.filter(item => item.quantity === 0);
  }, [products]);

  // ===============================
  // FILTER FOR GLOBAL ADD STOCK
  // ===============================
  const filteredAddStockProducts = useMemo(() => {
    if (!addStockSearch) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(addStockSearch.toLowerCase()) || 
      p.category?.toLowerCase().includes(addStockSearch.toLowerCase())
    );
  }, [products, addStockSearch]);

  // ===============================
  // ACTIONS
  // ===============================
  // Action: Individual Reorder
  const handleConfirmReorder = async () => {
    if (!productToReorder || reorderAmount <= 0) return;

    if (!productToReorder.id || productToReorder.id === "undefined" || isNaN(Number(productToReorder.id))) {
       alert("Cannot update this item: Invalid Product ID. Try refreshing the page to load official database products.");
       setProductToReorder(null);
       return;
    }

    setIsReordering(true);
    try {
      const newQuantity = Number(productToReorder.quantity) + Number(reorderAmount);

      const response = await fetch(`http://localhost:5000/api/products/${productToReorder.id}/quantity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (!response.ok) {
        let errorMessage = 'Unknown Server Error';
        try {
          const errData = await response.json();
          errorMessage = errData.error || errData.message || JSON.stringify(errData);
        } catch {
          const errText = await response.text();
          errorMessage = `HTTP ${response.status} - ${errText.substring(0, 100)}`;
        }
        throw new Error(errorMessage);
      }

      setProducts(prev => prev.map(p => 
        p.id === productToReorder.id ? { ...p, quantity: newQuantity } : p
      ));

      setProductToReorder(null);
      setReorderAmount(10);
    } catch (error: any) {
      console.error("Restock error:", error);
      alert(`Backend rejected: ${error.message}`);
    } finally {
      setIsReordering(false);
    }
  };

  // Action: Global Add Stock
  const handleConfirmAddStock = async () => {
    if (!selectedAddStockProductId || addStockAmount <= 0) return;
    
    const targetProduct = products.find(p => String(p.id) === String(selectedAddStockProductId));
    if (!targetProduct) return;

    if (!targetProduct.id || targetProduct.id === "undefined" || isNaN(Number(targetProduct.id))) {
       alert("Invalid Product ID.");
       return;
    }

    setIsAddingStock(true);
    try {
      const newQuantity = Number(targetProduct.quantity) + Number(addStockAmount);

      const response = await fetch(`http://localhost:5000/api/products/${targetProduct.id}/quantity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (!response.ok) {
        let errorMessage = 'Unknown Server Error';
        try {
          const errData = await response.json();
          errorMessage = errData.error || errData.message || JSON.stringify(errData);
        } catch {
          const errText = await response.text();
          errorMessage = `HTTP ${response.status} - ${errText.substring(0, 100)}`;
        }
        throw new Error(errorMessage);
      }

      setProducts(prev => prev.map(p => 
        p.id === targetProduct.id ? { ...p, quantity: newQuantity } : p
      ));

      setIsAddStockModalOpen(false);
      setAddStockSearch("");
      setSelectedAddStockProductId("");
      setAddStockAmount(10);
    } catch (error: any) {
      console.error("Add stock error:", error);
      alert(`Backend rejected: ${error.message}`);
    } finally {
      setIsAddingStock(false);
    }
  };

  // --- Helper to render product image block
  const renderProductImage = (product: Product, isGrayscale = false) => (
    <div className={`w-12 h-12 ${theme.background} rounded bg-cover bg-center border ${theme.border} flex items-center justify-center overflow-hidden shrink-0 ${isGrayscale ? 'grayscale opacity-80' : ''}`}>
      {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
      ) : (
          <ImageIcon className={`w-5 h-5 ${theme.textSecondary} opacity-40`} />
      )}
    </div>
  );

  return (
    <div className={`flex h-screen ${theme.background} ${theme.textPrimary} font-sans transition-colors duration-300`}>
      
      {/* ---------------- REORDER MODAL (INDIVIDUAL) ---------------- */}
      {productToReorder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`${theme.surface} rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border ${theme.border}`}>
            <div className={`p-5 border-b ${theme.border} flex justify-between items-center`}>
              <h3 className={`font-bold ${theme.textPrimary}`}>Restock Inventory</h3>
              <button onClick={() => setProductToReorder(null)} className={`p-1 rounded-md ${theme.textSecondary} hover:${theme.surfaceHover}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className={`text-sm ${theme.textSecondary} mb-4`}>
                How many units of <b>{productToReorder.name}</b> are arriving?
              </p>

              <div className="flex flex-col gap-2 mb-2">
                <label className={`text-sm font-bold ${theme.textSecondary}`}>Quantity to Add</label>
                <input 
                  type="number" 
                  min="1" 
                  value={reorderAmount}
                  onChange={(e) => setReorderAmount(Number(e.target.value))}
                  className={`w-full ${theme.background} border ${theme.border} rounded-lg p-3 ${theme.textPrimary} outline-none focus:ring-2 focus:ring-green-600 font-medium text-lg`}
                />
              </div>
              
              <p className={`text-xs ${theme.textSecondary}`}>
                Current stock: {productToReorder.quantity} → New stock: {Number(productToReorder.quantity) + Number(reorderAmount)}
              </p>
            </div>

            <div className={`p-4 border-t ${theme.border} bg-opacity-50 flex justify-end gap-3`}>
              <button 
                onClick={() => setProductToReorder(null)}
                disabled={isReordering}
                className={`px-4 py-2 rounded-lg font-bold text-sm ${theme.textSecondary} hover:${theme.surfaceHover} transition-colors`}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmReorder}
                disabled={isReordering || reorderAmount <= 0}
                className={`px-5 py-2 rounded-lg font-bold text-sm text-white flex items-center gap-2 transition-all ${
                  isReordering || reorderAmount <= 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-700 hover:bg-green-800 shadow-md'
                }`}
              >
                {isReordering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- ADD STOCK MODAL (GLOBAL) ---------------- */}
      {isAddStockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`${theme.surface} rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border ${theme.border}`}>
            <div className={`p-5 border-b ${theme.border} flex justify-between items-center`}>
              <h3 className={`font-bold ${theme.textPrimary}`}>Add Stock</h3>
              <button onClick={() => setIsAddStockModalOpen(false)} className={`p-1 rounded-md ${theme.textSecondary} hover:${theme.surfaceHover}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              
              {/* Filter Input & Dropdown */}
              <div className="flex flex-col gap-2 mb-6">
                <label className={`text-sm font-bold ${theme.textSecondary}`}>Search & Select Product</label>
                <input 
                  type="text" 
                  placeholder="Type to filter products..." 
                  value={addStockSearch}
                  onChange={(e) => setAddStockSearch(e.target.value)}
                  className={`w-full ${theme.background} border ${theme.border} rounded-lg p-2.5 text-sm ${theme.textPrimary} outline-none focus:ring-2 focus:ring-green-600 mb-1`}
                />
                <select 
                  size={5}
                  value={selectedAddStockProductId}
                  onChange={(e) => setSelectedAddStockProductId(e.target.value)}
                  className={`w-full ${theme.background} border ${theme.border} rounded-lg p-2 text-sm ${theme.textPrimary} outline-none focus:ring-2 focus:ring-green-600 scrollbar-thin`}
                >
                  {filteredAddStockProducts.length === 0 && (
                    <option disabled className="p-2 text-gray-500">No products found.</option>
                  )}
                  {filteredAddStockProducts.map(p => (
                    <option key={p.id} value={p.id} className="p-2 cursor-pointer hover:bg-green-700/10 rounded">
                      {p.name} — Current Stock: {p.quantity}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div className="flex flex-col gap-2">
                <label className={`text-sm font-bold ${theme.textSecondary}`}>Quantity to Add</label>
                <input 
                  type="number" 
                  min="1" 
                  value={addStockAmount}
                  onChange={(e) => setAddStockAmount(Number(e.target.value))}
                  className={`w-full ${theme.background} border ${theme.border} rounded-lg p-3 ${theme.textPrimary} outline-none focus:ring-2 focus:ring-green-600 font-medium text-lg`}
                />
              </div>

              {selectedAddStockProductId && (
                <p className={`text-xs ${theme.textSecondary} mt-3`}>
                  New calculated internal stock: {
                    Number(products.find(p => String(p.id) === String(selectedAddStockProductId))?.quantity || 0) + Number(addStockAmount)
                  } units
                </p>
              )}
            </div>

            <div className={`p-4 border-t ${theme.border} bg-opacity-50 flex justify-end gap-3`}>
              <button 
                onClick={() => setIsAddStockModalOpen(false)}
                disabled={isAddingStock}
                className={`px-4 py-2 rounded-lg font-bold text-sm ${theme.textSecondary} hover:${theme.surfaceHover} transition-colors`}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmAddStock}
                disabled={isAddingStock || addStockAmount <= 0 || !selectedAddStockProductId}
                className={`px-5 py-2 rounded-lg font-bold text-sm text-white flex items-center gap-2 transition-all ${
                  isAddingStock || addStockAmount <= 0 || !selectedAddStockProductId
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-700 hover:bg-green-800 shadow-md'
                }`}
              >
                {isAddingStock ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Publish Stock
              </button>
            </div>
          </div>
        </div>
      )}

      <Sidebar />

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
              <button 
                onClick={() => setIsAddStockModalOpen(true)}
                className="bg-green-800 hover:bg-green-900 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                + Add Stock
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`${theme.surface} p-6 rounded-xl border ${theme.border} shadow-sm transition-colors duration-300`}>
              <div className={`w-10 h-10 ${theme.background} rounded-lg flex items-center justify-center mb-4 border ${theme.border}`}>
                📦
              </div>
              <p className={`text-sm font-medium ${theme.textSecondary}`}>Total Items in Stock</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-3xl font-bold ${theme.textPrimary}`}>
                    {loading ? "..." : totalStockCount.toLocaleString()}
                </span>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Across {products.length} products</span>
              </div>
            </div>

            <div className={`${theme.surface} p-6 rounded-xl border ${theme.border} shadow-sm transition-colors duration-300`}>
              <div className={`w-10 h-10 ${isDarkMode ? 'bg-orange-900/30 border-orange-800 text-orange-400' : 'bg-orange-50 border-orange-100 text-orange-600'} rounded-lg flex items-center justify-center mb-4 border`}>
                ⚠️
              </div>
              <p className={`text-sm font-medium ${theme.textSecondary}`}>Low Stock Alerts</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-3xl font-bold ${theme.textPrimary}`}>
                    {loading ? "..." : lowStockCount.toLocaleString()}
                </span>
                <span className={`text-sm font-medium ${theme.textSecondary}`}>Items &le; 30 left</span>
              </div>
            </div>

            <div className={`${theme.surface} p-6 rounded-xl border ${theme.border} shadow-sm transition-colors duration-300`}>
              <div className={`w-10 h-10 ${isDarkMode ? 'bg-red-900/30 border-red-800 text-red-400' : 'bg-red-50 border-red-100 text-red-600'} rounded-lg flex items-center justify-center mb-4 border`}>
                🚫
              </div>
              <p className={`text-sm font-medium ${theme.textSecondary}`}>Items Out of Stock</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-3xl font-bold ${theme.textPrimary}`}>
                    {loading ? "..." : outOfStockCount.toLocaleString()}
                </span>
                <span className={`text-sm font-medium ${theme.textSecondary}`}>Items at 0</span>
              </div>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
            
            {/* Column 1: Top 5 In Stock */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  <h2 className={`font-semibold ${theme.textPrimary}`}>Top In Stock (Top 5)</h2>
                </div>
                <span className={`text-sm font-medium ${theme.textSecondary}`}>{topInStock.length}</span>
              </div>
              
              {loading && <p className={`text-sm ${theme.textSecondary} px-1`}>Loading...</p>}
              {!loading && topInStock.length === 0 && <p className={`text-sm ${theme.textSecondary} px-1`}>No high stock items.</p>}
              
              {topInStock.map(product => (
                 <div key={product.id} className={`${theme.surface} p-5 rounded-xl border ${theme.border} shadow-sm hover:shadow-md transition-all duration-300 hover:border-green-700/30 flex flex-col gap-3`}>
                    <div className="flex gap-4">
                      {renderProductImage(product)}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                           <h3 className={`font-bold ${theme.textPrimary} truncate pr-2`} title={product.name}>{product.name}</h3>
                           <button className={`${theme.textSecondary} hover:${theme.textPrimary}`}>⋮</button>
                        </div>
                        <p className={`text-sm ${theme.textSecondary}`}>{product.category || 'Product'}</p>
                      </div>
                    </div>
                    <div className={`mt-1 pt-3 border-t ${theme.border} flex justify-between items-center`}>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className={`text-sm font-bold ${theme.textPrimary}`}>{product.quantity} units</span>
                      </div>
                    </div>
                 </div>
              ))}
            </div>

            {/* Column 2: All Low Stock */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                  <h2 className={`font-semibold ${theme.textPrimary}`}>Low Stock</h2>
                </div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-yellow-500' : 'text-yellow-600'}`}>{allLowStock.length}</span>
              </div>
              
              {loading && <p className={`text-sm ${theme.textSecondary} px-1`}>Loading...</p>}
              {!loading && allLowStock.length === 0 && <p className={`text-sm ${theme.textSecondary} px-1`}>No items running low!</p>}

              {allLowStock.map(product => (
                 <div key={product.id} className={`${theme.surface} p-5 rounded-xl border-l-[3px] border-l-yellow-500 border-y border-r ${theme.border} shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-3`}>
                    <div className="flex gap-4">
                      {renderProductImage(product)}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                           <h3 className={`font-bold ${theme.textPrimary} truncate pr-2`} title={product.name}>{product.name}</h3>
                           <button className={`${theme.textSecondary} hover:${theme.textPrimary}`}>⋮</button>
                        </div>
                        <p className={`text-sm ${theme.textSecondary}`}>{product.category || 'Product'}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-end mt-1">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          <span className={`text-sm font-bold ${theme.textPrimary}`}>{product.quantity} units</span>
                        </div>
                        <span className={`text-xs font-semibold ${isDarkMode ? 'text-yellow-500' : 'text-yellow-600'}`}>Threshold: 30</span>
                      </div>
                      <button 
                        onClick={() => {
                          setProductToReorder(product);
                          setReorderAmount(10);
                        }}
                        className={`text-xs font-bold ${theme.background} hover:${theme.surfaceHover} ${theme.textPrimary} border ${theme.border} px-3 py-1.5 rounded transition`}
                      >
                        Reorder
                      </button>
                    </div>
                 </div>
              ))}
            </div>

            {/* Column 3: All Out of Stock */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <h2 className={`font-semibold ${theme.textPrimary}`}>Out of Stock</h2>
                </div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>{allOutOfStock.length}</span>
              </div>

              {loading && <p className={`text-sm ${theme.textSecondary} px-1`}>Loading...</p>}
              {!loading && allOutOfStock.length === 0 && <p className={`text-sm ${theme.textSecondary} px-1`}>All items are stocked up!</p>}

              {allOutOfStock.map(product => (
                 <div key={product.id} className={`${theme.surface} p-5 rounded-xl border-l-[3px] border-l-red-500 border-y border-r ${theme.border} shadow-sm hover:shadow-md transition-all duration-300 opacity-90 flex flex-col gap-3`}>
                    <div className="flex gap-4">
                      {renderProductImage(product, true)}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                           <h3 className={`font-bold ${theme.textPrimary} truncate pr-2`} title={product.name}>{product.name}</h3>
                           <button className={`${theme.textSecondary} hover:${theme.textPrimary}`}>⋮</button>
                        </div>
                        <p className={`text-sm ${theme.textSecondary}`}>{product.category || 'Product'}</p>
                      </div>
                    </div>
                    <div className={`mt-1 pt-3 border-t ${theme.border}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className={`text-sm font-bold ${theme.textPrimary}`}>0 units</span>
                        </div>
                        <button 
                          onClick={() => {
                            setProductToReorder(product);
                            setReorderAmount(10);
                          }}
                          className={`text-xs font-bold ${theme.background} hover:${theme.surfaceHover} ${theme.textPrimary} border ${theme.border} px-3 py-1.5 rounded transition`}
                        >
                          Reorder
                        </button>
                      </div>
                      <div className={`flex justify-between items-center ${theme.background} p-2 rounded text-xs border ${theme.border}`}>
                        <span className={`font-semibold ${theme.textSecondary} uppercase tracking-wide`}>Restock ETA</span>
                        <span className={`font-bold ${theme.textPrimary}`}>TBD</span>
                      </div>
                    </div>
                 </div>
              ))}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}