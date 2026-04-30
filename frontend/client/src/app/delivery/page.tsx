'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Search, Download, Plus, Bell, ShoppingCart, MapPin, Truck, CheckCircle2, AlertTriangle, MoreVertical } from 'lucide-react';
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
  created_at: string;
  updated_at: string;
};

const API_BASE_URL = 'http://localhost:5000/api';

const STATUS_LABELS: Record<ShippingStatus, string> = {
  pending: 'Queued',
  shipped: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Issues',
};

const STATUS_PROGRESS: Record<ShippingStatus, number> = {
  pending: 20,
  shipped: 75,
  delivered: 100,
  cancelled: 0,
};

const NEXT_STATUS: Record<ShippingStatus, ShippingStatus> = {
  pending: 'shipped',
  shipped: 'delivered',
  delivered: 'delivered',
  cancelled: 'cancelled',
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeShippingId, setActiveShippingId] = useState<number | null>(null);

  const loadShippings = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/shipping`);
      if (!response.ok) {
        throw new Error(`Failed to load deliveries (${response.status})`);
      }
      const data = (await response.json()) as Shipping[];
      setShippings(data);
      if (data.length > 0 && activeShippingId === null) {
        setActiveShippingId(data[0].id);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load deliveries.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadShippings();
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

  const queuedShippings = filteredShippings.filter((shipping) => shipping.status === 'pending');
  const inTransitShippings = filteredShippings.filter((shipping) => shipping.status === 'shipped');
  const deliveredShippings = filteredShippings.filter((shipping) => shipping.status === 'delivered');
  const issueShippings = filteredShippings.filter((shipping) => shipping.status === 'cancelled');

  const activeShipping = useMemo(() => {
    if (activeShippingId !== null) {
      return filteredShippings.find((shipping) => shipping.id === activeShippingId) ?? null;
    }
    return inTransitShippings[0] ?? queuedShippings[0] ?? deliveredShippings[0] ?? issueShippings[0] ?? null;
  }, [activeShippingId, filteredShippings, deliveredShippings, inTransitShippings, issueShippings, queuedShippings]);

  const handleCreateShipping = async (): Promise<void> => {
    const orderInput = window.prompt('Enter order ID');
    if (!orderInput) return;
    const orderId = Number(orderInput);
    if (!Number.isFinite(orderId)) {
      window.alert('Order ID must be a number.');
      return;
    }
    const address = window.prompt('Enter delivery address');
    if (!address) return;

    try {
      setIsCreating(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/shipping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id: orderId, address }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? `Failed to create delivery (${response.status})`);
      }

      await loadShippings();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create delivery.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleAdvanceStatus = async (): Promise<void> => {
    if (!activeShipping) return;
    const nextStatus = NEXT_STATUS[activeShipping.status];
    if (nextStatus === activeShipping.status) return;

    try {
      setIsUpdating(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/shipping/${activeShipping.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? `Failed to update delivery (${response.status})`);
      }

      const updatedShipping = (await response.json()) as Shipping;
      setShippings((prev) => prev.map((shipping) => (shipping.id === updatedShipping.id ? updatedShipping : shipping)));
    } catch (err: any) {
      setError(err?.message ?? 'Failed to update delivery.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`flex h-screen ${theme.background} ${theme.textPrimary} font-sans transition-colors duration-300`}>
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`h-20 ${theme.surface} border-b ${theme.border} flex items-center justify-between px-8 shrink-0 transition-colors duration-300`}>
          <div className="flex items-center gap-4 flex-1">
            <h1 className={`text-2xl font-bold ${theme.textPrimary} mr-8 tracking-tight`}>Logistics Overview</h1>
            <div className="relative w-96">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.textSecondary}`} />
              <input
                type="text"
                placeholder="Search orders, tracking numbers, or members..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className={`w-full pl-10 pr-4 py-2 ${theme.background} border ${theme.border} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700/50 transition-all ${theme.textPrimary} placeholder-gray-400`}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${theme.textPrimary} bg-transparent border ${theme.border} rounded-lg hover:${theme.surfaceHover} transition-colors`}>
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <div className="flex items-center gap-2 bg-green-800 p-1 rounded-lg shadow-sm">
              <button
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 rounded transition-colors disabled:opacity-60"
                onClick={handleCreateShipping}
                disabled={isCreating}
              >
                <Plus className="w-4 h-4" />
                {isCreating ? 'Creating...' : 'New Delivery'}
              </button>
              <div className="w-px h-4 bg-white/20 mx-1"></div>
              <button className="p-1.5 text-white hover:bg-white/10 rounded transition-colors relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-green-800"></span>
              </button>
              <button className="p-1.5 text-white hover:bg-white/10 rounded transition-colors relative">
                <ShoppingCart className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center border border-green-800">3</span>
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
                  <Truck className="w-5 h-5" />
                </div>
                <span className={`text-sm font-medium ${theme.textSecondary}`}>Today</span>
              </div>
              <h3 className={`${theme.textSecondary} text-sm font-medium mb-1`}>Queued Orders</h3>
              <div className="flex items-end gap-3">
                <span className={`text-3xl font-bold ${theme.textPrimary}`}>{queuedShippings.length}</span>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'} mb-1 flex items-center`}>↑ 12%</span>
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
                <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'} mb-1 flex items-center`}>↑ 5%</span>
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
                <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'} mb-1 flex items-center`}>↑ 18%</span>
              </div>
            </div>

            <div className={`${theme.surface} p-6 rounded-xl border ${theme.border} shadow-sm transition-colors duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'} rounded-lg flex items-center justify-center ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className={`text-sm font-medium ${theme.textSecondary}`}>Needs Action</span>
              </div>
              <h3 className={`${theme.textSecondary} text-sm font-medium mb-1`}>Issues / Exceptions</h3>
              <div className="flex items-end gap-3">
                <span className={`text-3xl font-bold ${theme.textPrimary}`}>{issueShippings.length}</span>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-1 flex items-center`}>↑ 2</span>
              </div>
            </div>
          </div>

          <div className="flex gap-6 h-[calc(100%-120px)]">
            {/* Kanban Board */}
            <div className={`flex-1 ${theme.surface} rounded-xl border ${theme.border} shadow-sm p-6 flex flex-col min-w-0 transition-colors duration-300`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className={`text-lg font-bold ${theme.textPrimary}`}>Delivery Board</h2>
                  <span className={`px-2.5 py-1 ${theme.background} ${theme.textSecondary} text-xs font-medium rounded-full border ${theme.border}`}>
                    {filteredShippings.length} Active Orders
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.textSecondary}`} />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className={`pl-9 pr-4 py-1.5 ${theme.background} border ${theme.border} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700/20 w-48 ${theme.textPrimary} placeholder-gray-400`}
                    />
                  </div>
                </div>
              </div>

              {(isLoading || error) && (
                <div className="mb-4 text-xs">
                  {isLoading && <span className={`${theme.textSecondary}`}>Loading deliveries...</span>}
                  {error && <span className="text-red-500">{error}</span>}
                </div>
              )}

              <div className="flex flex-1 gap-6 overflow-x-auto pb-2">
                {/* Column: Queued */}
                <div className={`w-[340px] shrink-0 flex flex-col ${theme.background} rounded-lg p-4 transition-colors duration-300`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <h3 className={`font-semibold ${theme.textPrimary} text-sm`}>Queued</h3>
                    </div>
                    <span className={`text-xs font-medium ${theme.textSecondary} ${theme.surface} px-2 py-1 rounded-md shadow-sm border ${theme.border}`}>
                      {queuedShippings.length}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {queuedShippings.length === 0 && (
                      <div className={`${theme.surface} p-5 rounded-lg shadow-sm border ${theme.border}`}>
                        <span className={`text-xs ${theme.textSecondary} font-medium`}>No queued deliveries</span>
                      </div>
                    )}

                    {queuedShippings.map((shipping) => (
                      <div
                        key={shipping.id}
                        className={`${theme.surface} p-5 rounded-lg shadow-sm border ${theme.border} cursor-pointer hover:border-green-700/30 transition-colors`}
                        onClick={() => setActiveShippingId(shipping.id)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className={`font-medium ${theme.textPrimary} text-sm`}>ORD-{shipping.order_id}</span>
                          <span className={`text-xs ${theme.textSecondary}`}>{formatShortDate(shipping.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-full bg-blue-900/20 overflow-hidden flex-shrink-0"></div>
                          <span className={`text-sm font-medium ${theme.textPrimary}`}>Order #{shipping.order_id}</span>
                        </div>
                        <div className="flex items-start gap-2 mb-5">
                          <MapPin className={`w-4 h-4 ${theme.textSecondary} mt-0.5 flex-shrink-0`} />
                          <span className={`text-sm ${theme.textSecondary}`}>{shipping.address}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-1 ${getStatusBadgeClass(shipping.status, isDarkMode)} text-xs font-medium rounded`}>
                            {STATUS_LABELS[shipping.status]}
                          </span>
                          <span className={`text-xs ${theme.textSecondary}`}>#{shipping.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column: In Transit */}
                <div className={`w-[340px] shrink-0 flex flex-col ${theme.background} rounded-lg p-4 transition-colors duration-300`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <h3 className={`font-semibold ${theme.textPrimary} text-sm`}>In Transit</h3>
                    </div>
                    <span className={`text-xs font-medium ${theme.textSecondary} ${theme.surface} px-2 py-1 rounded-md shadow-sm border ${theme.border}`}>
                      {inTransitShippings.length}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {inTransitShippings.length === 0 && (
                      <div className={`${theme.surface} p-5 rounded-lg shadow-sm border ${theme.border}`}>
                        <span className={`text-xs ${theme.textSecondary} font-medium`}>No deliveries in transit</span>
                      </div>
                    )}

                    {inTransitShippings.map((shipping) => (
                      <div
                        key={shipping.id}
                        className={`${theme.surface} p-5 rounded-lg shadow-sm border-2 border-green-700 relative overflow-hidden cursor-pointer`}
                        onClick={() => setActiveShippingId(shipping.id)}
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-green-700"></div>
                        <div className="flex justify-between items-start mb-4">
                          <span className={`font-bold ${theme.textPrimary} text-sm tracking-wide`}>ORD-{shipping.order_id}</span>
                          <span className={`text-[10px] uppercase font-bold ${isDarkMode ? 'text-green-400 bg-green-900/30' : 'text-green-800 bg-green-100'} tracking-wider px-2 py-1 rounded`}>
                            Active
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mb-5">
                          <div className={`w-10 h-10 rounded-full ${theme.background} overflow-hidden flex-shrink-0 border ${theme.border}`}></div>
                          <span className={`font-medium ${theme.textPrimary}`}>Order #{shipping.order_id}</span>
                        </div>

                        <div className="mb-5">
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className={`${theme.textSecondary} flex items-center gap-1.5`}>
                              <Truck className="w-4 h-4" /> {STATUS_LABELS[shipping.status]}
                            </span>
                          </div>
                          <div className={`h-2 ${theme.background} rounded-full w-full overflow-hidden`}>
                            <div
                              className="h-full bg-green-700 rounded-full"
                              style={{ width: `${STATUS_PROGRESS[shipping.status]}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className={`flex items-center justify-between pt-4 border-t ${theme.border}`}>
                          <span className={`text-sm font-medium ${theme.textSecondary}`}>
                            Shipped: {formatShortDate(shipping.shipped_date ?? shipping.created_at)}
                          </span>
                          <div className={`w-6 h-6 rounded-full ${theme.background} border ${theme.border} overflow-hidden`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column: Delivered */}
                <div className={`w-[340px] shrink-0 flex flex-col ${theme.background} rounded-lg p-4 opacity-70 transition-colors duration-300`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <h3 className={`font-semibold ${theme.textPrimary} text-sm`}>Delivered</h3>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {deliveredShippings.length === 0 && (
                      <div className={`${theme.surface} opacity-60 p-5 rounded-lg border border-dashed ${theme.border}`}>
                        <span className={`text-xs ${theme.textSecondary} font-medium`}>No delivered orders yet</span>
                      </div>
                    )}

                    {deliveredShippings.map((shipping) => (
                      <div
                        key={shipping.id}
                        className={`${theme.surface} opacity-60 p-5 rounded-lg border border-dashed ${theme.border} cursor-pointer`}
                        onClick={() => setActiveShippingId(shipping.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`font-medium ${theme.textPrimary} text-sm`}>ORD-{shipping.order_id}</span>
                          <span className={`text-xs ${theme.textSecondary}`}>{formatShortDate(shipping.delivered_date ?? shipping.updated_at)}</span>
                        </div>
                        <span className={`text-xs ${theme.textSecondary} font-medium`}>
                          Delivered at {formatDate(shipping.delivered_date ?? shipping.updated_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column: Issues */}
                <div className={`w-[340px] shrink-0 flex flex-col ${theme.background} rounded-lg p-4 transition-colors duration-300`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <h3 className={`font-semibold ${theme.textPrimary} text-sm`}>Issues</h3>
                    </div>
                    {/* Empty pill for count */}
                    <span className={`text-xs font-medium ${theme.textSecondary} ${theme.surface} px-2 py-1 rounded-md shadow-sm border ${theme.border}`}>
                      {issueShippings.length}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {issueShippings.length === 0 && (
                      <div className={`${theme.surface} p-5 rounded-lg shadow-sm border ${theme.border}`}>
                        <span className={`text-xs ${theme.textSecondary} font-medium`}>No delivery issues</span>
                      </div>
                    )}

                    {issueShippings.map((shipping) => (
                      <div
                        key={shipping.id}
                        className={`${theme.surface} p-5 rounded-lg shadow-sm border ${theme.border} cursor-pointer hover:border-red-500/40 transition-colors`}
                        onClick={() => setActiveShippingId(shipping.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`font-medium ${theme.textPrimary} text-sm`}>ORD-{shipping.order_id}</span>
                          <span className={`text-xs ${theme.textSecondary}`}>{formatShortDate(shipping.updated_at)}</span>
                        </div>
                        <div className="flex items-start gap-2 mb-4">
                          <MapPin className={`w-4 h-4 ${theme.textSecondary} mt-0.5 flex-shrink-0`} />
                          <span className={`text-sm ${theme.textSecondary}`}>{shipping.address}</span>
                        </div>
                        <span className={`px-2.5 py-1 ${getStatusBadgeClass(shipping.status, isDarkMode)} text-xs font-medium rounded`}>
                          {STATUS_LABELS[shipping.status]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Tracking Sticky Sidebar */}
            <div className={`w-[320px] shrink-0 ${theme.surface} rounded-xl border ${theme.border} shadow-sm flex flex-col overflow-hidden transition-colors duration-300`}>
              <div className={`p-5 border-b ${theme.border} flex items-center gap-2 ${theme.background}`}>
                <MapPin className={`w-5 h-5 ${isDarkMode ? 'text-green-500' : 'text-green-800'}`} />
                <h2 className={`font-semibold ${theme.textPrimary}`}>Live Tracking</h2>
              </div>

              {/* Mock Map Area */}
              <div className={`h-48 ${isDarkMode ? 'bg-gray-800' : 'bg-[#F0F2F5]'} relative w-full overflow-hidden p-6 flex items-center justify-center transition-colors duration-300`}>
                {/* SVG Route Visualization */}
                <svg width="100%" height="100%" viewBox="0 0 200 100" className="opacity-60">
                  <path d="M 20,80 C 60,80 80,40 120,50 C 160,60 170,20 180,20" fill="none" stroke={isDarkMode ? '#4ade80' : '#2C3E2D'} strokeWidth="2" strokeDasharray="4 4" />
                  <circle cx="20" cy="80" r="4" fill="#6B7280" />
                  <circle cx="120" cy="50" r="8" fill={isDarkMode ? '#4ade80' : '#2C3E2D'} />
                  <circle cx="120" cy="50" r="3" fill={isDarkMode ? '#1f2937' : 'white'} />
                  <circle cx="180" cy="20" r="4" fill="#10B981" />
                </svg>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className={`text-sm font-bold ${theme.textPrimary} mb-1`}>
                      {activeShipping ? `Tracking ORD-${activeShipping.order_id}` : 'No active delivery'}
                    </h3>
                  </div>
                  <span className={`px-2 py-1 ${theme.background} ${theme.textSecondary} text-[10px] font-bold uppercase rounded border ${theme.border}`}>
                    {activeShipping ? STATUS_LABELS[activeShipping.status] : 'No data'}
                  </span>
                </div>

                <p className={`text-xs ${theme.textSecondary} mb-1`}>
                  {activeShipping
                    ? `Updated: ${formatDate(activeShipping.updated_at)}`
                    : 'Pick a delivery to view tracking.'}
                </p>
                <p className={`text-xs ${theme.textSecondary} mb-6`}>
                  {activeShipping
                    ? `Address: ${activeShipping.address}`
                    : 'No delivery details available.'}
                </p>

                {/* Tabs */}
                <div className={`flex border-b ${theme.border} mb-4`}>
                  <button className={`flex-1 pb-2 text-xs font-medium ${isDarkMode ? 'text-green-500 border-green-500' : 'text-green-800 border-green-800'} border-b-2`}>Timeline</button>
                  <button className={`flex-1 pb-2 text-xs font-medium ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}>Details</button>
                  <button className={`flex-1 pb-2 text-xs font-medium ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}>Support</button>
                </div>

                {/* Timeline content */}
                <div className="flex-1">
                  <div className="relative pl-6 pb-6 border-l-2 border-green-700/20 ml-2">
                    <div className={`absolute w-3 h-3 ${theme.surface} border-2 ${isDarkMode ? 'border-green-500' : 'border-green-800'} rounded-full -left-[7px] top-1`}></div>
                    <h4 className={`text-sm font-semibold ${theme.textPrimary}`}>
                      {activeShipping ? STATUS_LABELS[activeShipping.status] : 'Waiting for delivery'}
                    </h4>
                    <p className={`text-xs ${theme.textSecondary} mt-0.5`}>
                      {activeShipping ? activeShipping.address : 'No address provided'}
                    </p>
                    <span className={`text-xs ${theme.textSecondary} mt-1 block opacity-70`}>
                      {activeShipping ? formatDate(activeShipping.updated_at) : 'Not started'}
                    </span>
                  </div>

                  <div className="relative pl-6 ml-2">
                    <div className={`absolute w-3 h-3 ${theme.background} border-2 ${theme.border} rounded-full -left-[7px] top-1`}></div>
                    <h4 className={`text-sm font-medium ${theme.textSecondary}`}>
                      {activeShipping ? `Order #${activeShipping.order_id}` : 'Select a delivery'}
                    </h4>
                  </div>
                </div>

                <div className={`mt-auto pt-4 border-t ${theme.border}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${theme.background} border ${theme.border} overflow-hidden flex-shrink-0`}>
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${theme.textPrimary}`}>
                          {activeShipping ? `Delivery #${activeShipping.id}` : 'Delivery Details'}
                        </p>
                        <p className={`text-[10px] ${theme.textSecondary}`}>
                          {activeShipping ? `Status: ${STATUS_LABELS[activeShipping.status]}` : 'No delivery selected'}
                        </p>
                      </div>
                    </div>
                    <button className={`p-2 border ${theme.border} rounded-lg ${theme.textSecondary} hover:${theme.surfaceHover} transition-colors`}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button className={`py-2.5 text-xs font-medium ${theme.textPrimary} bg-transparent border ${theme.border} rounded-lg hover:${theme.surfaceHover} transition-colors`}>
                      View Invoice
                    </button>
                    <button
                      className="py-2.5 text-xs font-medium text-white bg-green-800 rounded-lg hover:bg-green-900 transition-colors shadow-sm disabled:opacity-60"
                      onClick={handleAdvanceStatus}
                      disabled={!activeShipping || isUpdating || NEXT_STATUS[activeShipping.status] === activeShipping.status}
                    >
                      {isUpdating ? 'Updating...' : 'Update Status'}
                    </button>
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