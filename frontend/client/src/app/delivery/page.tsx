'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Search, Download, Plus, Bell, ShoppingCart, MapPin, Truck, CheckCircle2, AlertTriangle, Package, Check, X, Trash2, RefreshCcw } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useTheme } from '@/theme/ThemeContext';

type ShippingStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';

type Shipping = {
  id: number;
  order_id: number;
  address: string;
  status: ShippingStatus;
  shipped_date: string | null;
  delivered_date: string | null;
  issue_reason?: string | null; 
  created_at: string;
  updated_at: string;
};

// Represents an Order fetched from the backend so the seller can pick one
type Order = {
  id: number;
  user_id: number;
  status: string;
  created_at: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api` 
  : 'http://localhost:5000/api';

const STATUS_LABELS: Record<ShippingStatus, string> = {
  pending: 'Queued',
  shipped: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Issues', // 'cancelled' acts as our issue bucket
};

const STATUS_PROGRESS: Record<ShippingStatus, number> = {
  pending: 20,
  shipped: 75,
  delivered: 100,
  cancelled: 0,
};

const formatDate = (value?: string | null): string => {
  if (!value) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString();
};

const formatShortDate = (value?: string | null): string => {
  if (!value) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString();
};

const getStatusBadgeClass = (status: ShippingStatus, isDarkMode: boolean): string => {
  switch (status) {
    case 'pending':
      return isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600';
    case 'shipped':
      return isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-50 text-yellow-600';
    case 'delivered':
      return isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600';
    case 'cancelled':
    default:
      return isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600';
  }
};

export default function DeliveryPage() {
  const { theme, isDarkMode } = useTheme();
  
  const [shippings, setShippings] = useState<Shipping[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [activeShippingId, setActiveShippingId] = useState<number | null>(null);
  
  // New Delivery Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalForm, setModalForm] = useState({ orderId: '', address: '' });
  const [modalError, setModalError] = useState<string | null>(null);

  // Issue Modal State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueReason, setIssueReason] = useState('');

  // Delete Confirm Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [shippingToDelete, setShippingToDelete] = useState<number | null>(null);

  const loadShippingsAndOrders = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch Shippings
      const shipRes = await fetch(`${API_BASE_URL}/shipping`);
      if (!shipRes.ok) throw new Error(`Failed to load deliveries`);
      const shipData = (await shipRes.json()) as Shipping[];
      setShippings(shipData);

      if (shipData.length > 0 && activeShippingId === null) {
        setActiveShippingId(shipData[0].id);
      }

      // Fetch Orders (to show in the select list)
      const orderRes = await fetch(`${API_BASE_URL}/orders`);
      if (orderRes.ok) {
         const orderData = await orderRes.json();
         setOrders(orderData);
      }

    } catch (err: any) {
      setError(err?.message ?? 'Failed to load logistics data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadShippingsAndOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredShippings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return shippings;
    return shippings.filter((shipping) => {
      const orderId = `ord-${shipping.order_id}`;
      return (
        shipping.address.toLowerCase().includes(query) ||
        orderId.toLowerCase().includes(query) ||
        String(shipping.id).includes(query)
      );
    });
  }, [shippings, searchQuery]);

  const queuedShippings = filteredShippings.filter((s) => s.status === 'pending');
  const inTransitShippings = filteredShippings.filter((s) => s.status === 'shipped');
  const deliveredShippings = filteredShippings.filter((s) => s.status === 'delivered');
  const issueShippings = filteredShippings.filter((s) => s.status === 'cancelled');

  const activeShipping = useMemo(() => {
    if (activeShippingId !== null) {
      return filteredShippings.find((s) => s.id === activeShippingId) ?? null;
    }
    return inTransitShippings[0] ?? queuedShippings[0] ?? deliveredShippings[0] ?? issueShippings[0] ?? null;
  }, [activeShippingId, filteredShippings, deliveredShippings, inTransitShippings, issueShippings, queuedShippings]);


  // ============================
  // ACTIONS
  // ============================

  const handleOpenModal = () => {
      setModalForm({ orderId: '', address: '' });
      setModalError(null);
      setIsModalOpen(true);
  };

  const submitShippingModal = async (): Promise<void> => {
      const orderId = Number(modalForm.orderId);
      
      if (!modalForm.orderId || !Number.isFinite(orderId)) {
        setModalError('Please select a valid Order.');
        return;
      }
      if (!modalForm.address.trim()) {
        setModalError('Please enter a delivery address.');
        return;
      }

      try {
        setIsCreating(true);
        setModalError(null);
        const response = await fetch(`${API_BASE_URL}/shipping`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: orderId, address: modalForm.address }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.error ?? `Failed to create delivery`);
        }

        await loadShippingsAndOrders();
        setIsModalOpen(false); 
      } catch (err: any) {
        setModalError(err?.message ?? 'Failed to create delivery.');
      } finally {
        setIsCreating(false);
      }
  };

  const promptDeleteShipping = (e: React.MouseEvent, shippingId: number) => {
      e.stopPropagation();
      setShippingToDelete(shippingId);
      setIsDeleteModalOpen(true);
  };

  const confirmDeleteShipping = async () => {
      if (!shippingToDelete) return;
      try {
          setIsUpdating(true);
          setError(null);
          const response = await fetch(`${API_BASE_URL}/shipping/${shippingToDelete}`, { method: 'DELETE' });
          
          if (!response.ok) throw new Error("Failed to delete shipping record");
          
          // Remove locally without fetching all data again to save time
          setShippings(prev => prev.filter(s => s.id !== shippingToDelete));
          if (activeShippingId === shippingToDelete) setActiveShippingId(null);
          
          setIsDeleteModalOpen(false);
          setShippingToDelete(null);
      } catch(err: any) {
          setError(err?.message ?? "Error deleting shipping record");
      } finally {
          setIsUpdating(false);
      }
  };

  const changeShippingStatus = async (shippingId: number, targetStatus: ShippingStatus, reason?: string) => {
      try {
          setIsUpdating(true);
          setError(null);

          const payload: any = { status: targetStatus };
          if (reason) payload.issue_reason = reason; // Attach the reason to payload

          const response = await fetch(`${API_BASE_URL}/shipping/${shippingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData?.error ?? `Failed to update delivery`);
          }

          const updatedShipping = (await response.json()) as Shipping;
          setShippings((prev) => prev.map((s) => (s.id === updatedShipping.id ? updatedShipping : s)));
          
          if (isIssueModalOpen) setIsIssueModalOpen(false);
          setIssueReason('');

      } catch (err: any) {
        setError(err?.message ?? 'Failed to update delivery.');
      } finally {
          setIsUpdating(false);
      }
  };

  // Helper method specifically for the issue modal
  const submitIssueReason = () => {
       if (!activeShippingId) return;
       changeShippingStatus(activeShippingId, 'cancelled', issueReason);
  };


  return (
    <div className={`flex h-screen ${theme.background} ${theme.textPrimary} font-sans transition-colors duration-300`}>
      <Sidebar />

      {/* -------------------- MAIN CONTENT -------------------- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`h-20 ${theme.surface} border-b ${theme.border} flex items-center justify-between px-8 shrink-0 transition-colors duration-300`}>
          <div className="flex items-center gap-4 flex-1">
            <h1 className={`text-2xl font-bold ${theme.textPrimary} mr-8 tracking-tight`}>Logistics Overview</h1>
            <div className="relative w-96">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.textSecondary}`} />
              <input
                type="text"
                placeholder="Search orders, tracking numbers..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className={`w-full pl-10 pr-4 py-2 ${theme.background} border ${theme.border} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700/50 transition-all ${theme.textPrimary} placeholder-gray-400`}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${theme.textPrimary} bg-transparent border ${theme.border} rounded-lg hover:${theme.surfaceHover} transition-colors`}>
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="flex items-center gap-2 bg-green-800 p-1 rounded-lg shadow-sm">
              <button
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 rounded transition-colors disabled:opacity-60"
                onClick={handleOpenModal}
                disabled={isCreating}
              >
                <Plus className="w-4 h-4" />
                {isCreating ? 'Creating...' : 'New Delivery'}
              </button>
              <div className="w-px h-4 bg-white/20 mx-1"></div>
              <button className="p-1.5 text-white hover:bg-white/10 rounded transition-colors relative">
                <Bell className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className={`${theme.surface} p-6 rounded-xl border ${theme.border} shadow-sm transition-colors duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} rounded-lg flex items-center justify-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  <Package className="w-5 h-5" />
                </div>
                <span className={`text-sm font-medium ${theme.textSecondary}`}>Today</span>
              </div>
              <h3 className={`${theme.textSecondary} text-sm font-medium mb-1`}>Queued</h3>
              <div className="flex items-end gap-3">
                <span className={`text-3xl font-bold ${theme.textPrimary}`}>{queuedShippings.length}</span>
              </div>
            </div>

            <div className={`${theme.surface} p-6 rounded-xl border ${theme.border} shadow-sm transition-colors duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'} rounded-lg flex items-center justify-center ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  <Truck className="w-5 h-5" />
                </div>
                <span className={`text-sm font-medium ${theme.textSecondary}`}>Active</span>
              </div>
              <h3 className={`${theme.textSecondary} text-sm font-medium mb-1`}>In Transit</h3>
              <div className="flex items-end gap-3">
                <span className={`text-3xl font-bold ${theme.textPrimary}`}>{inTransitShippings.length}</span>
              </div>
            </div>

            <div className={`${theme.surface} p-6 rounded-xl border ${theme.border} shadow-sm transition-colors duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'} rounded-lg flex items-center justify-center ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className={`text-sm font-medium ${theme.textSecondary}`}>This Week</span>
              </div>
              <h3 className={`${theme.textSecondary} text-sm font-medium mb-1`}>Delivered</h3>
              <div className="flex items-end gap-3">
                <span className={`text-3xl font-bold ${theme.textPrimary}`}>{deliveredShippings.length}</span>
              </div>
            </div>

            <div className={`${theme.surface} p-6 rounded-xl border ${theme.border} shadow-sm transition-colors duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'} rounded-lg flex items-center justify-center ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className={`text-sm font-medium ${theme.textSecondary}`}>Needs Action</span>
              </div>
              <h3 className={`${theme.textSecondary} text-sm font-medium mb-1`}>Issues</h3>
              <div className="flex items-end gap-3">
                <span className={`text-3xl font-bold ${theme.textPrimary}`}>{issueShippings.length}</span>
              </div>
            </div>
          </div>

          {/* -------------------- KANBAN BOARD -------------------- */}
          <div className="flex gap-6 h-[calc(100%-120px)]">
            <div className={`flex-1 ${theme.surface} rounded-xl border ${theme.border} shadow-sm p-6 flex flex-col min-w-0 transition-colors duration-300`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className={`text-lg font-bold ${theme.textPrimary}`}>Delivery Board</h2>
                </div>
              </div>

              <div className="flex flex-1 gap-6 overflow-x-auto pb-2">
                
                {/* Column: Queued */}
                <div className={`w-[340px] shrink-0 flex flex-col ${theme.background} rounded-lg p-4 transition-colors duration-300`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <h3 className={`font-semibold ${theme.textPrimary} text-sm`}>Queued ({queuedShippings.length})</h3>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {queuedShippings.map((shipping) => (
                      <div key={shipping.id} className={`${theme.surface} p-5 rounded-lg shadow-sm border ${activeShippingId === shipping.id ? 'border-green-500' : theme.border} cursor-pointer hover:border-green-700/30`} onClick={() => setActiveShippingId(shipping.id)}>
                        <span className={`font-bold ${theme.textPrimary}`}>ORD-{shipping.order_id}</span>
                        <div className="flex mt-2 items-start gap-2 mb-4 text-sm">
                          <MapPin className={`w-4 h-4 ${theme.textSecondary}`} />
                          <span className={theme.textSecondary}>{shipping.address}</span>
                        </div>
                        {/* QUEUED ACTION BUTTON - INLINE STYLED */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); changeShippingStatus(shipping.id, 'shipped'); }}
                            disabled={isUpdating}
                            style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                            className="w-full font-bold py-2 rounded-lg text-sm flex justify-center items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
                        >
                            <Truck className="w-4 h-4" /> Move to Transit
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column: In Transit */}
                <div className={`w-[340px] shrink-0 flex flex-col ${theme.background} rounded-lg p-4 transition-colors duration-300`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <h3 className={`font-semibold ${theme.textPrimary} text-sm`}>In Transit ({inTransitShippings.length})</h3>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {inTransitShippings.map((shipping) => (
                      <div key={shipping.id} className={`${theme.surface} p-5 rounded-lg shadow-sm border-2 ${activeShippingId === shipping.id ? 'border-green-500' : 'border-yellow-500/50'} relative cursor-pointer`} onClick={() => setActiveShippingId(shipping.id)}>
                        <h4 className={`font-bold ${theme.textPrimary} mb-2`}>ORD-{shipping.order_id}</h4>
                        <div className="flex items-center justify-between text-sm mb-4">
                           <span className={`${theme.textSecondary} flex items-center gap-1.5`}><Truck className="w-4 h-4" /> Transit</span>
                           <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-bold">Active</span>
                        </div>
                        
                        {/* IN TRANSIT ACTION BUTTONS */}
                        <div className="flex gap-2">
                            <button 
                                onClick={(e) => { e.stopPropagation(); changeShippingStatus(shipping.id, 'delivered'); }}
                                disabled={isUpdating}
                                className="flex-1 bg-green-700 hover:bg-green-800 text-white font-medium py-1.5 rounded-lg text-xs flex justify-center items-center transition-colors disabled:opacity-50"
                            >
                                <Check size={14} className="mr-1"/> Delivered
                            </button>
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setActiveShippingId(shipping.id);
                                    setIsIssueModalOpen(true); 
                                }}
                                disabled={isUpdating}
                                className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-1.5 rounded-lg text-xs flex justify-center items-center transition-colors disabled:opacity-50"
                            >
                                <AlertTriangle size={14} className="mr-1"/> Report Issue
                            </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column: Delivered */}
                <div className={`w-[340px] shrink-0 flex flex-col ${theme.background} rounded-lg p-4 opacity-90`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <h3 className={`font-semibold ${theme.textPrimary} text-sm`}>Delivered ({deliveredShippings.length})</h3>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {deliveredShippings.map((shipping) => (
                      <div key={shipping.id} className={`${theme.surface} p-4 rounded-lg border ${theme.border} cursor-pointer relative hover:border-red-500/50`} onClick={() => setActiveShippingId(shipping.id)}>
                        <span className={`font-bold ${theme.textPrimary} text-sm`}>ORD-{shipping.order_id}</span>
                        <p className={`text-xs ${theme.textSecondary} mt-2 mb-3`}>Done: {formatDate(shipping.updated_at)}</p>
                        
                        {/* DELIVERED ACTION BUTTONS (DELETE) */}
                        <div className="flex justify-end">
                            <button 
                                onClick={(e) => promptDeleteShipping(e, shipping.id)}
                                disabled={isUpdating}
                                className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-100 font-medium rounded-lg text-xs flex justify-center items-center transition-all disabled:opacity-50"
                            >
                                <Trash2 size={14} className="mr-1.5"/> Delete Record
                            </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column: Issues */}
                <div className={`w-[340px] shrink-0 flex flex-col ${theme.background} rounded-lg p-4`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <h3 className={`font-semibold ${theme.textPrimary} text-sm`}>Issues ({issueShippings.length})</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {issueShippings.map((shipping) => (
                      <div key={shipping.id} className={`${theme.surface} p-4 rounded-lg border border-red-500/50 hover:bg-red-500/5 cursor-pointer`} onClick={() => setActiveShippingId(shipping.id)}>
                        <span className={`font-bold ${theme.textPrimary} text-sm`}>ORD-{shipping.order_id}</span>
                        <p className="text-xs text-red-500 font-bold mt-2 flex items-center gap-1">
                            <AlertTriangle size={12}/> Needs Attention
                        </p>
                        {shipping.issue_reason && (
                           <p className="text-xs mt-2 italic text-gray-500 mb-4">"{shipping.issue_reason}"</p>
                        )}
                        
                        {/* ISSUES ACTION BUTTONS (RE-QUEUE) */}
                        <div className="mt-4 pt-4 border-t border-red-100 dark:border-red-900/30 flex justify-end">
                            <button 
                                onClick={(e) => { e.stopPropagation(); changeShippingStatus(shipping.id, 'pending'); }}
                                disabled={isUpdating}
                                className="px-3 py-1.5 bg-white dark:bg-gray-800 text-blue-600 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-medium rounded-lg text-xs flex justify-center items-center transition-all disabled:opacity-50"
                            >
                                <RefreshCcw size={14} className="mr-1.5"/> Back to Queued
                            </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
            
            {/* -------------------- SIDEBAR TRACKING DETAILS -------------------- */}
            <div className={`w-[320px] shrink-0 ${theme.surface} rounded-xl border ${theme.border} shadow-sm flex flex-col overflow-hidden`}>
               <div className={`p-5 border-b ${theme.border} flex items-center gap-2 ${theme.background}`}>
                 <MapPin className="w-5 h-5 text-green-700" />
                 <h2 className={`font-semibold ${theme.textPrimary}`}>Details Tracker</h2>
               </div>
               
               <div className="p-5 flex-1 flex flex-col">
                  {activeShipping ? (
                      <>
                        <h3 className={`text-lg font-bold ${theme.textPrimary}`}>Order #{activeShipping.order_id}</h3>
                        <span className={`inline-block px-2 py-1 mt-2 text-[10px] uppercase font-bold rounded w-max ${getStatusBadgeClass(activeShipping.status, isDarkMode)}`}>
                            {STATUS_LABELS[activeShipping.status]}
                        </span>
                        
                        <div className="mt-6 space-y-4 text-sm">
                            <div>
                               <p className="font-bold text-gray-500 text-xs uppercase mb-1">Delivery Address</p>
                               <p className={theme.textPrimary}>{activeShipping.address}</p>
                            </div>
                            <div>
                               <p className="font-bold text-gray-500 text-xs uppercase mb-1">Last Updated</p>
                               <p className={theme.textPrimary}>{formatDate(activeShipping.updated_at)}</p>
                            </div>
                            {activeShipping.issue_reason && (
                                <div className="p-3 bg-red-100 rounded text-red-800 text-sm border border-red-200">
                                   <p className="font-bold mb-1">Reported Issue:</p>
                                   <p>{activeShipping.issue_reason}</p>
                                </div>
                            )}
                        </div>
                      </>
                  ) : (
                      <p className={`text-sm text-center mt-10 ${theme.textSecondary}`}>Select a delivery card to view its tracking details.</p>
                  )}
               </div>
            </div>

          </div>
        </div>
      </main>

      {/* -------------------- MODALS -------------------- */}

      {/* 1. New Delivery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm shadow-2xl">
          <div className={`${theme.surface} p-6 rounded-xl border ${theme.border} w-[450px] shadow-lg animate-in zoom-in-95`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${theme.textPrimary}`}>Queue New Delivery</h2>
                <button onClick={() => setIsModalOpen(false)} className={theme.textSecondary}><X size={20}/></button>
            </div>
            
            {modalError && (
              <div className="mb-4 p-3 bg-red-900/30 text-red-500 rounded text-sm font-medium">
                {modalError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-bold mb-1 ${theme.textSecondary}`}>Select Order</label>
                <select
                  value={modalForm.orderId}
                  onChange={(e) => setModalForm(prev => ({ ...prev, orderId: e.target.value }))}
                  className={`w-full p-2.5 ${theme.background} border ${theme.border} rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-700/50 ${theme.textPrimary}`}
                >
                  <option value="" disabled>-- Pick an Order --</option>
                  {orders.map(order => {
                      return (
                          <option key={order.id} value={order.id}>
                              Order #{order.id} (Status: {order.status})
                          </option>
                      )
                  })}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-bold mb-1 ${theme.textSecondary}`}>Target Address</label>
                <input
                  type="text"
                  value={modalForm.address}
                  onChange={(e) => setModalForm(prev => ({ ...prev, address: e.target.value }))}
                  className={`w-full p-2.5 ${theme.background} border ${theme.border} rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-700/50 ${theme.textPrimary}`}
                  placeholder="E.g., 123 Main St, New York, NY"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => setIsModalOpen(false)}
                className={`px-4 py-2 font-bold text-sm ${theme.textSecondary} hover:${theme.textPrimary}`}
              >
                Cancel
              </button>
              <button 
                onClick={submitShippingModal}
                disabled={isCreating}
                className="px-6 py-2 text-sm font-bold text-white bg-green-700 rounded-lg hover:bg-green-800 disabled:opacity-60 shadow-md"
              >
                {isCreating ? 'Saving...' : 'Create Shipment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Report Issue Modal */}
      {isIssueModalOpen && activeShippingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm shadow-2xl">
          <div className={`${theme.surface} p-6 rounded-xl border ${theme.border} w-[450px] shadow-lg animate-in zoom-in-95`}>
            <div className="flex items-center gap-2 mb-2 text-red-500">
                <AlertTriangle size={24} />
                <h2 className="text-xl font-black">Report a Delivery Issue</h2>
            </div>
            <p className={`text-sm ${theme.textSecondary} mb-6`}>
               Record the reason below to help tracking.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-bold mb-1 ${theme.textSecondary}`}>Reason for exception</label>
                <textarea
                  rows={3}
                  value={issueReason}
                  onChange={(e) => setIssueReason(e.target.value)}
                  className={`w-full p-2.5 ${theme.background} border ${theme.border} rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-700/50 ${theme.textPrimary} resize-none`}
                  placeholder="e.g., Customer not at home, package damaged, address unverified..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => { setIsIssueModalOpen(false); setIssueReason(''); }}
                className={`px-4 py-2 font-bold text-sm ${theme.textSecondary} hover:${theme.textPrimary}`}
              >
                Cancel
              </button>
              <button 
                onClick={submitIssueReason}
                disabled={isUpdating || !issueReason.trim()}
                className="px-6 py-2 text-sm font-bold text-white bg-green-700 rounded-lg hover:bg-green-800 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Logging...' : 'Confirm Issue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Delete Confirmation Modal */}
      {isDeleteModalOpen && shippingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm shadow-2xl">
          <div className={`${theme.surface} p-6 rounded-xl border ${theme.border} w-[400px] shadow-lg animate-in zoom-in-95`}>
            <div className="flex items-center gap-2 mb-2 text-red-600">
                <Trash2 size={24} />
                <h2 className="text-xl font-black">Delete Record?</h2>
            </div>
            <p className={`text-sm ${theme.textSecondary} mb-6`}>
               Are you sure you want to permanently delete this delivery record? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => { setIsDeleteModalOpen(false); setShippingToDelete(null); }}
                disabled={isUpdating}
                className={`px-4 py-2 font-bold text-sm ${theme.textSecondary} hover:${theme.textPrimary}`}
              >
                Cancel
              </button>
              {/* DELETE CONFIRM BUTTON - INLINE STYLED */}
              <button 
                onClick={confirmDeleteShipping}
                disabled={isUpdating}
                style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                className="px-6 py-2 text-sm font-bold rounded-lg shadow-md transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}