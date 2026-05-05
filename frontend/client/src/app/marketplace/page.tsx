'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { useTheme } from '@/theme/ThemeContext';
import {
  ChevronDown, Filter, Bookmark, RotateCcw,
  MoreHorizontal, Truck, Check, ShoppingCart, Plus, X, Image as ImageIcon, Tag, Loader2
} from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { useAuth } from '@/context/AuthContext';
import { usePayment } from '@/context/PaymentContext';

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
  description?: string;
  imageUrl?: string;
  // keep raw stock available for product card check
  rawStock: number;
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
interface CartItem {
  product: Product;
  quantity: number;
}


// ==========================================
// 3. MAIN COMPONENT
// ==========================================
export default function MarketplacePage() {
  const { theme, isDarkMode } = useTheme();
  const { isSeller, user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // --- STATE ---
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error'; } | null>(null);
  const { payments } = usePayment();

  // --- ADD ITEM MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemForm, setNewItemForm] = useState<{
    name: string;
    category: string;
    stock: number | '';
    price: number | '';
    description: string;
    imageFile: File | null;
  }>({
    name: '',
    category: CATEGORIES[0],
    stock: '',
    price: '',
    description: '',
    imageFile: null
  });
  const productImageInputRef = useRef<HTMLInputElement | null>(null);

  // --- PRODUCT DETAILS MODAL STATE ---
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // --- BUY PRODUCT MODAL STATE ---
  const [productToBuy, setProductToBuy] = useState<Product | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(1);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Fetch Global Products on Mount
  useEffect(() => {
    const fetchGlobalProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`);
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
            imageLetter: p.name.charAt(0).toUpperCase() || 'P',
            description: p.description || 'No description available for this product.',
            imageUrl: p.image_url || undefined, // Placeholder for database column
            rawStock: p.quantity || 0,
          };
        });

        setProducts(mappedProducts);
      } catch (error) {
        console.error('Failed to fetch marketplace items', error);
      }
    };

    fetchGlobalProducts();
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('user_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart");
      }
    }
    setIsCartLoaded(true);
  }, []);

  // Save to localStorage every time the cart updates
  useEffect(() => {
    if (isCartLoaded) {
      localStorage.setItem('user_cart', JSON.stringify(cart));
    }
  }, [cart, isCartLoaded]);

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

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
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
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          seller_id: user?.id,
          name: newItemForm.name,
          price: priceNum,
          quantity: stockNum,
          category_id: categoryId,
          description: newItemForm.description || `Added by Seller from Marketplace Page`
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server returned an error');
      }

      const savedDbProduct = await response.json();

      let uploadedImageUrl: string | undefined;
      if (newItemForm.imageFile) {
        try {
          const formData = new FormData();
          formData.append('image', newItemForm.imageFile);

          const uploadResponse = await fetch(`${API_URL}/api/images/products/${savedDbProduct.id}`, {
            method: 'POST',
            body: formData
          });

          if (!uploadResponse.ok) {
            const errData = await uploadResponse.json().catch(() => ({}));
            throw new Error(errData.error || 'Image upload failed');
          }

          const uploadedImage = await uploadResponse.json();
          uploadedImageUrl = uploadedImage.image_url || undefined;
        } catch (uploadError) {
          console.error('Failed to upload image', uploadError);
          showToast('Product saved but image upload failed', 'error');
        }
      }

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
        imageLetter: savedDbProduct.name.charAt(0).toUpperCase() || 'P',
        description: savedDbProduct.description,
        imageUrl: uploadedImageUrl,
        rawStock: stockNum
      };

      // Put it in our local state instantly for a snappy UI
      setProducts(prev => [newProduct, ...prev]);

      // Cleanup and close
      setNewItemForm({ name: '', category: CATEGORIES[0], stock: '', price: '', description: '', imageFile: null });
      setIsModalOpen(false);

    } catch (err) {
      console.error("Failed to list item globally", err);
      showToast("Failed to list item globally", "error");
    }
  };

  // Open Buy Modal
  const handleOpenBuyModal = (product: Product) => {
    setProductToBuy(product);
    setPurchaseQuantity(1); // Default to buying 1
  };

  // Process the Purchase and Decrement Stock
  // Add item to cart
  const handleAddToCart = () => {
    if (!productToBuy) return;
    if (purchaseQuantity < 1 || purchaseQuantity > productToBuy.rawStock) {
      showToast("Please enter a valid quantity.", "error"); // Replced alert!
      return;
    }

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.product.id === productToBuy.id);
      if (existingItemIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + purchaseQuantity
        };
        return updatedCart;
      }
      return [...prevCart, { product: productToBuy, quantity: purchaseQuantity }];
    });

    showToast(`Added ${purchaseQuantity} of ${productToBuy.name} to your cart!`, "success"); // Replaced alert!

    setProductToBuy(null);
    setSelectedProduct(null);
  };

  const handleCheckoutCart = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);

    try {
      // 1. Format the data EXACTLY how the Express backend expects it
      const orderPayload = {
        // Send the email so the backend can look up the correct numeric ID
        email: user?.email,
        items: cart.map(item => ({
          product_id: Number(item.product.id),
          quantity: item.quantity,
          unit_price: item.product.price
        })),
        status: 'pending'
      };

      // 2. Create the Order (which also creates the Order Items natively)
      const orderResponse = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!orderResponse.ok) {
        // Catch the real error message from the backend so we can see it
        const errData = await orderResponse.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create order");
      }

      // 3. Deduct stock from the products table (this is all we have left to do)
      for (const item of cart) {
        const remainingStock = item.product.rawStock - item.quantity;
        await fetch(`${API_URL}/api/products/${item.product.id}/quantity`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: remainingStock })
        });
      }

      // 4. Update local React state so the numbers change instantly on screen!
      setProducts(currentProducts =>
        currentProducts.map(p => {
          const purchasedItem = cart.find(cartItem => cartItem.product.id === p.id);
          if (purchasedItem) {
            const newStock = p.rawStock - purchasedItem.quantity;
            let computedStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'Out of Stock';
            if (newStock > 30) computedStatus = 'In Stock';
            else if (newStock > 0) computedStatus = 'Low Stock';

            return {
              ...p,
              rawStock: newStock,
              stockText: `${newStock} ${computedStatus === 'Low Stock' ? 'Low Stock' : 'in stock'}`,
              status: computedStatus
            };
          }
          return p; // leave untouched products alone
        })
      );

      showToast("Checkout successful!", "success");
      setCart([]);
      setIsCartModalOpen(false);

    } catch (err: any) {
      console.error(err);
      // This will now show the actual text coming from the Express backend
      showToast(err.message || 'An error occurred during checkout.', "error");
    } finally {
      setIsCheckingOut(false);
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

  // Recommended Products: Grab 4 random products that are strictly "In Stock"
  const recommendedProducts = useMemo(() => {
    const inStockOnly = products.filter(p => p.status === 'In Stock');
    // Shuffle the array to make it feel random
    const shuffled = [...inStockOnly].sort(() => 0.5 - Math.random());
    // Return up to 4
    return shuffled.slice(0, 4);
  }, [products]);

  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(
    payments.find(p => p.isDefault)?.id || (payments.length > 0 ? payments[0].id : '')
  );

  // Add an effect to keep the default synced in case the context list changes
  useEffect(() => {
    if (payments.length > 0 && !payments.find(p => p.id === selectedPaymentId)) {
      setSelectedPaymentId(payments.find(p => p.isDefault)?.id || payments[0].id);
    }
  }, [payments, selectedPaymentId]);

  return (
    <div className={`flex h-screen ${theme.background} ${theme.textPrimary} font-sans transition-colors duration-300`}>

      {/* ----------------- BUY CONFIRMATION MODAL (NEW) ----------------- */}
      {productToBuy && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`${theme.surface} rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200 border ${theme.border}`}>
            <h3 className={`text-xl font-bold ${theme.textPrimary} mb-1`}>Checkout</h3>
            <p className={`text-sm ${theme.textSecondary} mb-4`}>You are purchasing <b>{productToBuy.name}</b></p>

            <div className="flex flex-col gap-2 mb-6">
              <label className={`text-sm font-bold ${theme.textSecondary}`}>Quantity (Max: {productToBuy.rawStock})</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max={productToBuy.rawStock}
                  value={purchaseQuantity}
                  onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
                  className={`flex-1 ${theme.background} border ${theme.border} rounded-lg p-2.5 ${theme.textPrimary} outline-none focus:ring-2 focus:ring-green-600 transition-all font-medium text-lg`}
                />
              </div>
            </div>

            <div className={`pt-4 border-t ${theme.border} flex justify-between items-center`}>
              <div className="flex flex-col">
                <span className={`text-xs font-bold ${theme.textSecondary} uppercase tracking-wider`}>Total Price</span>
                <span className={`text-xl font-black ${theme.textPrimary}`}>
                  ${(productToBuy.price * purchaseQuantity).toFixed(2)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setProductToBuy(null)}
                  disabled={isPurchasing}
                  className={`px-4 py-2.5 rounded-lg font-bold text-sm ${theme.textSecondary} hover:${theme.surfaceHover} transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={isPurchasing || purchaseQuantity < 1 || purchaseQuantity > productToBuy.rawStock}
                  className={`px-6 py-2.5 rounded-lg font-bold text-sm text-white flex items-center gap-2 transition-all ${isPurchasing || purchaseQuantity < 1 || purchaseQuantity > productToBuy.rawStock
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-700 hover:bg-green-800 shadow-md'
                    }`}
                >
                  {isPurchasing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SHOPPING CART MODAL ----------------- */}
      {isCartModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`${theme.surface} rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] border ${theme.border}`}>
            <div className={`p-5 border-b ${theme.border} flex justify-between items-center`}>
              <h3 className={`text-xl font-bold flex items-center gap-2 ${theme.textPrimary}`}>
                <ShoppingCart className="w-5 h-5 text-green-600" /> Your Cart
              </h3>
              <button onClick={() => setIsCartModalOpen(false)} className={`p-1.5 rounded-md ${theme.textSecondary} hover:${theme.surfaceHover} outline-none`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="text-center py-10">
                  <ShoppingCart className={`w-12 h-12 ${theme.textSecondary} opacity-20 mx-auto mb-3`} />
                  <p className={`text-sm ${theme.textSecondary}`}>Your cart is totally empty!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {cart.map((item, idx) => (
                    <div key={idx} className={`flex items-center justify-between border-b ${theme.border} pb-4 last:border-0 last:pb-0`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded bg-gray-100 flex items-center justify-center font-bold ${theme.textPrimary}`}>
                          {item.product.imageLetter}
                        </div>
                        <div>
                          <h4 className={`font-bold ${theme.textPrimary} text-sm`}>{item.product.name}</h4>
                          <span className={`text-xs ${theme.textSecondary}`}>Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className={`font-bold text-sm ${theme.textPrimary}`}>${(item.quantity * item.product.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className={`p-5 border-t ${theme.border} flex flex-col gap-4 bg-opacity-50`}>

                <div className="flex justify-between items-center">
                  <label className={`text-sm font-bold ${theme.textSecondary}`}>Payment Method</label>
                  <select
                    value={selectedPaymentId}
                    onChange={(e) => setSelectedPaymentId(e.target.value)}
                    className={`bg-transparent border ${theme.border} rounded-lg p-2 ${theme.textPrimary} text-sm focus:ring-2 focus:ring-green-600 outline-none`}
                    disabled={payments.length === 0}
                  >
                    {payments.length === 0 && <option value="">No payments saved</option>}
                    {payments.map(method => {
                      // Quick helper to make the label look nice
                      let label = '';
                      if (method.type === 'credit_card') label = `${method.details.brand} •••• ${method.details.last4}`;
                      if (method.type === 'paypal') label = `PayPal (${method.details.email})`;
                      if (method.type === 'bank_transfer') label = `${method.details.bankName} •••• ${method.details.accountLast4}`;

                      return (
                        <option key={method.id} value={method.id} className={`${theme.background} ${theme.textPrimary}`}>
                          {label} {method.isDefault ? '(Default)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className={`text-xs font-bold ${theme.textSecondary} uppercase`}>Subtotal</span>
                    <span className={`text-xl font-black ${theme.textPrimary}`}>
                      ${cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckoutCart}
                    disabled={isCheckingOut || payments.length === 0}
                    className="px-6 py-2.5 rounded-lg font-bold text-sm text-white bg-green-700 hover:bg-green-800 transition-colors shadow-md flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isCheckingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Checkout'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- PRODUCT DETAILS MODAL ----------------- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`${theme.surface} rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200`}>

            {/* Left Side: Product Image Placeholder */}
            <div className={`w-full md:w-1/2 min-h-75 flex flex-col items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} border-b md:border-b-0 md:border-r ${theme.border}`}>
              {selectedProduct.imageUrl ? (
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImageIcon className={`w-20 h-20 ${theme.textSecondary} opacity-20 mb-4`} />
                  <span className={`text-sm font-medium ${theme.textSecondary}`}>No Image Available</span>
                </>
              )}
            </div>

            {/* Right Side: Details */}
            <div className="w-full md:w-1/2 p-6 flex flex-col relative">
              <button
                onClick={() => setSelectedProduct(null)}
                className={`absolute top-4 right-4 p-1.5 rounded-full ${theme.textSecondary} hover:${theme.surfaceHover} transition-colors outline-none`}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Tag className={`w-4 h-4 ${theme.textSecondary}`} />
                  <span className={`text-xs font-bold uppercase tracking-wider text-green-600`}>{selectedProduct.category}</span>
                </div>
                <h2 className={`text-2xl font-bold ${theme.textPrimary} mb-2`}>{selectedProduct.name}</h2>
                <div className={`text-3xl font-black ${theme.textPrimary} mb-6`}>${Number(selectedProduct.price).toFixed(2)}</div>

                <div className="space-y-4">
                  <div>
                    <h4 className={`text-sm font-bold ${theme.textSecondary} mb-1`}>Status</h4>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full inline-block ${selectedProduct.status === 'In Stock' ? (isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-[#E5F0E6] text-[#2C3E2D]') :
                      selectedProduct.status === 'Low Stock' ? (isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700') :
                        (isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700')
                      }`}>
                      {selectedProduct.stockText}
                    </span>
                  </div>

                  <div>
                    <h4 className={`text-sm font-bold ${theme.textSecondary} mb-1`}>Description</h4>
                    <p className={`text-sm ${theme.textPrimary} leading-relaxed`}>
                      {selectedProduct.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleOpenBuyModal(selectedProduct)} /* Trigger buy modal */
                  disabled={selectedProduct.status === 'Out of Stock'}
                  className={`w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${selectedProduct.status === 'Out of Stock'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    : 'bg-green-700 text-white hover:bg-green-800 shadow-md hover:shadow-lg'
                    }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {selectedProduct.status === 'Out of Stock' ? 'Out of Stock' : 'Buy Now'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ----------------- TOAST NOTIFICATION ----------------- */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-lg shadow-xl font-bold text-white animate-in slide-in-from-bottom-5 duration-300 ${toastMessage.type === 'error' ? 'bg-red-600' : 'bg-green-700'
          }`}>
          {toastMessage.text}
        </div>
      )}

      {/* ----------------- ADD NEW ITEM MODAL ----------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`${theme.surface} rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border ${theme.border} max-h-[90vh] flex flex-col`}>
            <div className={`p-5 border-b ${theme.border} flex justify-between items-center bg-opacity-50`}>
              <h3 className={`font-bold flex items-center gap-2 ${theme.textPrimary}`}>
                <Plus className="w-5 h-5 text-green-600" />
                Add New Marketplace Item
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-1.5 rounded-md ${theme.textSecondary} hover:${theme.surfaceHover} transition-colors outline-none`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <form id="add-product-form" onSubmit={handleAddNewItem} className="p-5 flex flex-col gap-4">

                {/* Photo Upload (Optional) */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-sm font-bold ${theme.textSecondary}`}>Product Image (Optional)</label>
                  <div
                    className={`border-2 border-dashed ${theme.border} rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:${theme.surfaceHover} hover:border-green-500 transition-colors group`}
                    role="button"
                    tabIndex={0}
                    onClick={() => productImageInputRef.current?.click()}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        productImageInputRef.current?.click();
                      }
                    }}
                  >
                    <ImageIcon className={`w-8 h-8 ${theme.textSecondary} group-hover:text-green-500 mb-2 transition-colors`} />
                    <span className={`text-sm font-medium ${theme.textPrimary}`}>Click to upload image</span>
                    <span className={`text-xs ${theme.textSecondary} mt-1`}>JPG, PNG or WEBP (Max 5MB)</span>
                    <input
                      ref={productImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNewItemForm({ ...newItemForm, imageFile: e.target.files[0] });
                        }
                      }}
                    />
                  </div>
                  {newItemForm.imageFile && (
                    <div className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                      <Check className="w-3 h-3" /> {newItemForm.imageFile.name}
                    </div>
                  )}
                </div>

                {/* Product Name */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-sm font-bold ${theme.textSecondary}`}>Product Name <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="text"
                    value={newItemForm.name}
                    onChange={e => setNewItemForm({ ...newItemForm, name: e.target.value })}
                    className={`w-full ${theme.background} border ${theme.border} rounded-lg p-2.5 ${theme.textPrimary} outline-none focus:ring-2 focus:ring-green-600 transition-all`}
                    placeholder="e.g. Organic Apple Juice"
                  />
                </div>

                {/* Category Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-sm font-bold ${theme.textSecondary}`}>Category <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={newItemForm.category}
                    onChange={e => setNewItemForm({ ...newItemForm, category: e.target.value })}
                    className={`w-full ${theme.background} border ${theme.border} rounded-lg p-2.5 ${theme.textPrimary} outline-none focus:ring-2 focus:ring-green-600 transition-all`}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Description (Optional) */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-sm font-bold ${theme.textSecondary}`}>Description (Optional)</label>
                  <textarea
                    rows={3}
                    value={newItemForm.description}
                    onChange={e => setNewItemForm({ ...newItemForm, description: e.target.value })}
                    className={`w-full ${theme.background} border ${theme.border} rounded-lg p-2.5 ${theme.textPrimary} outline-none focus:ring-2 focus:ring-green-600 transition-all resize-none`}
                    placeholder="Provide details about the product..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Price */}
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-sm font-bold ${theme.textSecondary}`}>Price ($) <span className="text-red-500">*</span></label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      value={newItemForm.price}
                      onChange={e => setNewItemForm({ ...newItemForm, price: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                      className={`w-full ${theme.background} border ${theme.border} rounded-lg p-2.5 ${theme.textPrimary} outline-none focus:ring-2 focus:ring-green-600 transition-all`}
                    />
                  </div>

                  {/* Stock Amount */}
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-sm font-bold ${theme.textSecondary}`}>Stock <span className="text-red-500">*</span></label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={newItemForm.stock}
                      onChange={e => setNewItemForm({ ...newItemForm, stock: e.target.value === '' ? '' : parseInt(e.target.value) })}
                      className={`w-full ${theme.background} border ${theme.border} rounded-lg p-2.5 ${theme.textPrimary} outline-none focus:ring-2 focus:ring-green-600 transition-all`}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className={`p-4 border-t ${theme.border} bg-opacity-50 flex justify-end gap-3`}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={`px-4 py-2.5 rounded-lg font-bold text-sm ${theme.textSecondary} hover:${theme.textPrimary} hover:${theme.surfaceHover} transition-colors`}
              >
                Cancel
              </button>
              <button
                form="add-product-form"
                type="submit"
                className="px-6 py-2.5 rounded-lg font-bold text-sm text-white bg-green-700 hover:bg-green-800 transition-colors shadow-md flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Publish Product
              </button>
            </div>

          </div>
        </div>
      )}
      {/* ----------------------------------------------- */}

      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* TOP NAVBAR */}
        <DashboardHeader
          searchPlaceholder="Search marketplace products..."
          cartCount={cart.reduce((total, item) => total + item.quantity, 0)}
          onCartClick={() => setIsCartModalOpen(true)}
        />

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
                <Plus className="w-5 h-5 shrink-0" />
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
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm border transition-colors ${selectedCategories.length > 0
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
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <h2 className={`text-lg font-bold ${theme.textPrimary} mb-4`}>Recommended for You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {recommendedProducts.length > 0 ? (
              recommendedProducts.map(product => (
                <div key={product.id} onClick={() => setSelectedProduct(product)} className="cursor-pointer transition-transform hover:scale-105">
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    stockCount={product.rawStock}
                  // Since the current ProductCard might not have image props yet, 
                  // we'll pass standard props, but you can adjust your ProductCard later
                  />
                </div>
              ))
            ) : (
              <p className={`text-sm ${theme.textSecondary}`}>More products arriving soon...</p>
            )}
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
                    <tr
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className={`group hover:${theme.surfaceHover} transition-colors cursor-pointer`}
                    >
                      <td className="py-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" className={`rounded text-green-700 ${theme.background} border-gray-400`} /></td>
                      <td className="py-4 flex items-center gap-3">
                        <div className={`w-10 h-10 border ${theme.border} rounded ${theme.background} flex items-center justify-center font-bold ${theme.textSecondary} shrink-0 relative overflow-hidden bg-gray-100 dark:bg-gray-800`}>
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            // The fallback letter if no image
                            product.imageLetter
                          )}
                        </div>
                        <span className={`font-bold ${theme.textPrimary}`}>{product.name}</span>
                      </td>
                      <td className={`py-4 ${theme.textSecondary} font-medium`}>{product.category}</td>
                      <td className={`py-4 font-bold ${product.status === 'Low Stock' ? 'text-red-500' : `${theme.textSecondary} font-medium`}`}>
                        {product.stockText}
                      </td>
                      <td className={`py-4 font-bold ${theme.textPrimary}`}>${Number(product.price).toFixed(2)}</td>
                      <td className="py-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${product.status === 'In Stock' ? (isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-[#E5F0E6] text-[#2C3E2D]') :
                          product.status === 'Low Stock' ? (isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700') :
                            (isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700')
                          }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className={`flex items-center justify-end gap-2 ${theme.textSecondary}`} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenBuyModal(product)} /* Trigger detail from table */
                            disabled={product.status === "Out of Stock"}
                            className={`p-1.5 rounded-md transition-colors ${product.status === "Out of Stock"
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-green-600 hover:text-white'
                              }`}
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
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