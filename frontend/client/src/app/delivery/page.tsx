'use client';
import React from 'react';
import { Search, Download, Plus, Bell, ShoppingCart, MapPin, Truck, CheckCircle2, AlertTriangle, MoreVertical } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function DeliveryPage() {
  return (
    <div className="flex h-screen bg-[#F9F8F6] font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-[#EAE7E0] flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mr-8 tracking-tight">Logistics Overview</h1>
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, tracking numbers, or members..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3E2D]/20 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <div className="flex items-center gap-2 bg-[#2C3E2D] p-1 rounded-lg">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 rounded transition-colors">
                <Plus className="w-4 h-4" />
                New Delivery
              </button>
              <div className="w-px h-4 bg-white/20 mx-1"></div>
              <button className="p-1.5 text-white hover:bg-white/10 rounded transition-colors relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-[#2C3E2D]"></span>
              </button>
              <button className="p-1.5 text-white hover:bg-white/10 rounded transition-colors relative">
                <ShoppingCart className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center border border-[#2C3E2D]">3</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-[#EAE7E0] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-500">Today</span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Queued Orders</h3>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-gray-900">124</span>
                <span className="text-sm font-medium text-green-600 mb-1 flex items-center">↑ 12%</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#EAE7E0] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center text-yellow-600">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-500">Active</span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">In Transit</h3>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-gray-900">48</span>
                <span className="text-sm font-medium text-green-600 mb-1 flex items-center">↑ 5%</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#EAE7E0] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-500">This Week</span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Delivered</h3>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-gray-900">892</span>
                <span className="text-sm font-medium text-green-600 mb-1 flex items-center">↑ 18%</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#EAE7E0] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-500">Needs Action</span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Issues / Exceptions</h3>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-gray-900">7</span>
                <span className="text-sm font-medium text-red-600 mb-1 flex items-center">↑ 2</span>
              </div>
            </div>
          </div>

          <div className="flex gap-6 h-[calc(100%-120px)]">
            {/* Kanban Board */}
            <div className="flex-1 bg-white rounded-xl border border-[#EAE7E0] shadow-sm p-6 flex flex-col min-w-0">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-900">Delivery Board</h2>
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">179 Active Orders</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3E2D]/20 w-48"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-1 gap-6 overflow-x-auto pb-2">
                {/* Column: Queued */}
                <div className="w-[340px] shrink-0 flex flex-col bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <h3 className="font-semibold text-gray-700 text-sm">Queued</h3>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">124</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {/* Card 1 */}
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:border-[#2C3E2D]/30 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <span className="font-medium text-gray-900 text-sm">ORD-9823</span>
                        <span className="text-xs text-gray-400">2h ago</span>
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                          {/* Placeholder image representation */}
                          <div className="w-full h-full bg-blue-100"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">Sarah Jenkins</span>
                      </div>
                      <div className="flex items-start gap-2 mb-5">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-500">123 Maple St, Seattle WA</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded">Standard</span>
                        <span className="text-xs text-gray-400">+3</span>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:border-[#2C3E2D]/30 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <span className="font-medium text-gray-900 text-sm">ORD-9824</span>
                        <span className="text-xs text-gray-400">3h ago</span>
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                          <div className="w-full h-full bg-pink-100"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">Michael Chang</span>
                      </div>
                      <div className="flex items-start gap-2 mb-5">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-500">450 Oak Ave, Portland OR</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-600 text-xs font-medium rounded">Express</span>
                        <span className="text-xs text-gray-400">1 item</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column: In Transit */}
                <div className="w-[340px] shrink-0 flex flex-col bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <h3 className="font-semibold text-gray-700 text-sm">In Transit</h3>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">48</span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {/* Active In-Transit Card */}
                    <div className="bg-white p-5 rounded-lg shadow-sm border-2 border-[#2C3E2D] relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#2C3E2D]"></div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="font-bold text-gray-900 text-sm tracking-wide">9128736455</span>
                        <span className="text-[10px] uppercase font-bold text-[#2C3E2D] tracking-wider bg-[#2C3E2D]/10 px-2 py-1 rounded">Active</span>
                      </div>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                          <div className="w-full h-full bg-gray-300"></div>
                        </div>
                        <span className="font-medium text-gray-900">Ali Saleh</span>
                      </div>
                      
                      <div className="mb-5">
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-gray-500 flex items-center gap-1.5"><Truck className="w-4 h-4" /> Out for delivery</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full w-full overflow-hidden">
                          <div className="h-full bg-[#2C3E2D] w-[75%] rounded-full"></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-sm font-medium text-gray-600">ETA: 2:30 PM</span>
                        <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                          <div className="w-full h-full bg-stone-300"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column: Delivered */}
                <div className="w-[340px] shrink-0 flex flex-col bg-gray-50 rounded-lg p-4 opacity-70">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <h3 className="font-semibold text-gray-700 text-sm">Delivered</h3>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                     <div className="bg-white/60 p-5 rounded-lg border border-dashed border-gray-200">
                       <span className="text-xs text-gray-400 font-medium">Delivered at 10:15 AM</span>
                     </div>
                  </div>
                </div>

                {/* Column: Issues */}
                <div className="w-[340px] shrink-0 flex flex-col bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <h3 className="font-semibold text-gray-700 text-sm">Issues</h3>
                    </div>
                    {/* Empty pill for count */}
                    <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">0</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                     {/* Leave empty for now as requested */}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Tracking Sticky Sidebar */}
            <div className="w-[320px] shrink-0 bg-white rounded-xl border border-[#EAE7E0] shadow-sm flex flex-col overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-[#F9F8F6]">
                <MapPin className="w-5 h-5 text-[#2C3E2D]" />
                <h2 className="font-semibold text-gray-900">Live Tracking</h2>
              </div>

              {/* Mock Map Area */}
              <div className="h-48 bg-[#F0F2F5] relative w-full overflow-hidden p-6 flex items-center justify-center">
                {/* SVG Route Visualization */}
                <svg width="100%" height="100%" viewBox="0 0 200 100" className="opacity-60">
                  <path d="M 20,80 C 60,80 80,40 120,50 C 160,60 170,20 180,20" fill="none" stroke="#2C3E2D" strokeWidth="2" strokeDasharray="4 4" />
                  <circle cx="20" cy="80" r="4" fill="#6B7280" />
                  <circle cx="120" cy="50" r="8" fill="#2C3E2D" />
                  <circle cx="120" cy="50" r="3" fill="white" />
                  <circle cx="180" cy="20" r="4" fill="#10B981" />
                </svg>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Tracking 9128736455</h3>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded">In Transit</span>
                </div>
                
                <p className="text-xs text-gray-500 mb-1">ETA: Wednesday, April 28 • 2:30 PM</p>
                <p className="text-xs text-gray-500 mb-6">Driver: John D. • Vehicle: DHL Van</p>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-4">
                  <button className="flex-1 pb-2 text-xs font-medium text-[#2C3E2D] border-b-2 border-[#2C3E2D]">Timeline</button>
                  <button className="flex-1 pb-2 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">Details</button>
                  <button className="flex-1 pb-2 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">Support</button>
                </div>

                {/* Timeline content */}
                <div className="flex-1">
                  <div className="relative pl-6 pb-6 border-l-2 border-[#2C3E2D]/20 ml-2">
                    <div className="absolute w-3 h-3 bg-white border-2 border-[#2C3E2D] rounded-full -left-[7px] top-1"></div>
                    <h4 className="text-sm font-semibold text-gray-900">On vehicle for delivery</h4>
                    <p className="text-xs text-gray-500 mt-0.5">East Lansing, MI 48823, US</p>
                    <span className="text-xs text-gray-400 mt-1 block">Today at 10:23 AM</span>
                  </div>
                  
                  <div className="relative pl-6 ml-2">
                    <div className="absolute w-3 h-3 bg-gray-200 border-2 border-white rounded-full -left-[7px] top-1"></div>
                    <h4 className="text-sm font-medium text-gray-500">In Transit</h4>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                         <div className="w-full h-full bg-gray-300"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Ali Saleh</p>
                        <p className="text-[10px] text-gray-500">Premium Member</p>
                      </div>
                    </div>
                    <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-2.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      View Invoice
                    </button>
                    <button className="py-2.5 text-xs font-medium text-white bg-[#2C3E2D] rounded-lg hover:bg-[#2C3E2D]/90 transition-colors shadow-sm">
                      Update Status
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