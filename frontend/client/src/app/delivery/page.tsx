'use client';
import React from 'react';
import { Search, Download, Plus, Bell, ShoppingCart, MapPin, Truck, CheckCircle2, AlertTriangle, MoreVertical } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useTheme } from '@/theme/ThemeContext';

export default function DeliveryPage() {
  const { theme, isDarkMode } = useTheme();

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
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 rounded transition-colors">
                <Plus className="w-4 h-4" />
                New Delivery
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
                <span className={`text-3xl font-bold ${theme.textPrimary}`}>124</span>
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
                <span className={`text-3xl font-bold ${theme.textPrimary}`}>48</span>
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
                <span className={`text-3xl font-bold ${theme.textPrimary}`}>892</span>
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
                <span className={`text-3xl font-bold ${theme.textPrimary}`}>7</span>
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
                  <span className={`px-2.5 py-1 ${theme.background} ${theme.textSecondary} text-xs font-medium rounded-full border ${theme.border}`}>179 Active Orders</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.textSecondary}`} />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      className={`pl-9 pr-4 py-1.5 ${theme.background} border ${theme.border} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700/20 w-48 ${theme.textPrimary} placeholder-gray-400`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-1 gap-6 overflow-x-auto pb-2">
                {/* Column: Queued */}
                <div className={`w-[340px] shrink-0 flex flex-col ${theme.background} rounded-lg p-4 transition-colors duration-300`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <h3 className={`font-semibold ${theme.textPrimary} text-sm`}>Queued</h3>
                    </div>
                    <span className={`text-xs font-medium ${theme.textSecondary} ${theme.surface} px-2 py-1 rounded-md shadow-sm border ${theme.border}`}>124</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {/* Card 1 */}
                    <div className={`${theme.surface} p-5 rounded-lg shadow-sm border ${theme.border} cursor-pointer hover:border-green-700/30 transition-colors`}>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`font-medium ${theme.textPrimary} text-sm`}>ORD-9823</span>
                        <span className={`text-xs ${theme.textSecondary}`}>2h ago</span>
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-900/20 overflow-hidden flex-shrink-0">
                        </div>
                        <span className={`text-sm font-medium ${theme.textPrimary}`}>Sarah Jenkins</span>
                      </div>
                      <div className="flex items-start gap-2 mb-5">
                        <MapPin className={`w-4 h-4 ${theme.textSecondary} mt-0.5 flex-shrink-0`} />
                        <span className={`text-sm ${theme.textSecondary}`}>123 Maple St, Seattle WA</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-1 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'} text-xs font-medium rounded`}>Standard</span>
                        <span className={`text-xs ${theme.textSecondary}`}>+3</span>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className={`${theme.surface} p-5 rounded-lg shadow-sm border ${theme.border} cursor-pointer hover:border-green-700/30 transition-colors`}>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`font-medium ${theme.textPrimary} text-sm`}>ORD-9824</span>
                        <span className={`text-xs ${theme.textSecondary}`}>3h ago</span>
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-pink-900/20 overflow-hidden flex-shrink-0">
                        </div>
                        <span className={`text-sm font-medium ${theme.textPrimary}`}>Michael Chang</span>
                      </div>
                      <div className="flex items-start gap-2 mb-5">
                        <MapPin className={`w-4 h-4 ${theme.textSecondary} mt-0.5 flex-shrink-0`} />
                        <span className={`text-sm ${theme.textSecondary}`}>450 Oak Ave, Portland OR</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-1 ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600'} text-xs font-medium rounded`}>Express</span>
                        <span className={`text-xs ${theme.textSecondary}`}>1 item</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column: In Transit */}
                <div className={`w-[340px] shrink-0 flex flex-col ${theme.background} rounded-lg p-4 transition-colors duration-300`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <h3 className={`font-semibold ${theme.textPrimary} text-sm`}>In Transit</h3>
                    </div>
                    <span className={`text-xs font-medium ${theme.textSecondary} ${theme.surface} px-2 py-1 rounded-md shadow-sm border ${theme.border}`}>48</span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {/* Active In-Transit Card */}
                    <div className={`${theme.surface} p-5 rounded-lg shadow-sm border-2 border-green-700 relative overflow-hidden`}>
                      <div className="absolute top-0 left-0 w-1 h-full bg-green-700"></div>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`font-bold ${theme.textPrimary} text-sm tracking-wide`}>9128736455</span>
                        <span className={`text-[10px] uppercase font-bold ${isDarkMode ? 'text-green-400 bg-green-900/30' : 'text-green-800 bg-green-100'} tracking-wider px-2 py-1 rounded`}>Active</span>
                      </div>
                      <div className="flex items-center gap-3 mb-5">
                        <div className={`w-10 h-10 rounded-full ${theme.background} overflow-hidden flex-shrink-0 border ${theme.border}`}>
                        </div>
                        <span className={`font-medium ${theme.textPrimary}`}>Ali Saleh</span>
                      </div>
                      
                      <div className="mb-5">
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className={`${theme.textSecondary} flex items-center gap-1.5`}><Truck className="w-4 h-4" /> Out for delivery</span>
                        </div>
                        <div className={`h-2 ${theme.background} rounded-full w-full overflow-hidden`}>
                          <div className="h-full bg-green-700 w-[75%] rounded-full"></div>
                        </div>
                      </div>

                      <div className={`flex items-center justify-between pt-4 border-t ${theme.border}`}>
                        <span className={`text-sm font-medium ${theme.textSecondary}`}>ETA: 2:30 PM</span>
                        <div className={`w-6 h-6 rounded-full ${theme.background} border ${theme.border} overflow-hidden`}>
                        </div>
                      </div>
                    </div>
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
                     <div className={`${theme.surface} opacity-60 p-5 rounded-lg border border-dashed ${theme.border}`}>
                       <span className={`text-xs ${theme.textSecondary} font-medium`}>Delivered at 10:15 AM</span>
                     </div>
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
                    <span className={`text-xs font-medium ${theme.textSecondary} ${theme.surface} px-2 py-1 rounded-md shadow-sm border ${theme.border}`}>0</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                     {/* Leave empty for now as requested */}
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
                    <h3 className={`text-sm font-bold ${theme.textPrimary} mb-1`}>Tracking 9128736455</h3>
                  </div>
                  <span className={`px-2 py-1 ${theme.background} ${theme.textSecondary} text-[10px] font-bold uppercase rounded border ${theme.border}`}>In Transit</span>
                </div>
                
                <p className={`text-xs ${theme.textSecondary} mb-1`}>ETA: Wednesday, April 28 • 2:30 PM</p>
                <p className={`text-xs ${theme.textSecondary} mb-6`}>Driver: John D. • Vehicle: DHL Van</p>

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
                    <h4 className={`text-sm font-semibold ${theme.textPrimary}`}>On vehicle for delivery</h4>
                    <p className={`text-xs ${theme.textSecondary} mt-0.5`}>East Lansing, MI 48823, US</p>
                    <span className={`text-xs ${theme.textSecondary} mt-1 block opacity-70`}>Today at 10:23 AM</span>
                  </div>
                  
                  <div className="relative pl-6 ml-2">
                    <div className={`absolute w-3 h-3 ${theme.background} border-2 ${theme.border} rounded-full -left-[7px] top-1`}></div>
                    <h4 className={`text-sm font-medium ${theme.textSecondary}`}>In Transit</h4>
                  </div>
                </div>

                <div className={`mt-auto pt-4 border-t ${theme.border}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${theme.background} border ${theme.border} overflow-hidden flex-shrink-0`}>
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${theme.textPrimary}`}>Ali Saleh</p>
                        <p className={`text-[10px] ${theme.textSecondary}`}>Premium Member</p>
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
                    <button className="py-2.5 text-xs font-medium text-white bg-green-800 rounded-lg hover:bg-green-900 transition-colors shadow-sm">
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