'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import { Search, Bell, Plus, MoreHorizontal, Clock, Edit2, Mail, Ban } from 'lucide-react';
import { useTheme } from '@/theme/ThemeContext';

export default function MemberManagementPage() {
  const { theme, isDarkMode } = useTheme();

  return (
    <div className={`flex h-screen ${theme.background} ${theme.textPrimary} font-sans transition-colors duration-300`}>
      {/* 1. Sidebar Navigation */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className={`h-16 px-8 flex items-center justify-between ${theme.surface} border-b ${theme.border} transition-colors duration-300`}>
          <div className={`flex items-center w-full max-w-2xl ${theme.background} rounded-full px-4 py-2 border ${theme.border} relative transition-colors duration-300`}>
            <Search className={`w-4 h-4 ${theme.textSecondary} absolute left-4`} />
            <input 
              type="text" 
              placeholder="Search members, roles, or email..." 
              className={`w-full pl-8 bg-transparent border-none outline-none text-sm ${theme.textPrimary} placeholder-gray-400`} 
            />
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button className={`relative p-2 rounded-full hover:${theme.surfaceHover} transition-colors`}>
              <Bell className={`w-5 h-5 ${theme.textSecondary}`} />
            </button>
            <button className="flex items-center gap-2 bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-900 transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Invite Member
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-auto p-8">
          {/* Page Title & Tabs */}
          <div className={`mb-8 border-b ${theme.border}`}>
            <h1 className={`text-3xl font-bold mb-2 font-serif ${theme.textPrimary}`}>Member Management</h1>
            <p className={`${theme.textSecondary} mb-8`}>Manage onboarding, roles, and account statuses.</p>
            
            <div className="flex items-center gap-8 text-sm font-semibold">
              <button className={`pb-4 border-b-2 ${isDarkMode ? 'border-green-500 text-green-500' : 'border-green-700 text-green-700'}`}>Onboarding Pipeline</button>
              <button className={`pb-4 border-b-2 border-transparent ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}>Directory</button>
              <button className={`pb-4 border-b-2 border-transparent ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}>Audit Log</button>
            </div>
          </div>

          {/* Kanban Board Grid */}
          <div className="flex gap-6 overflow-x-auto pb-4 h-full items-start">
            
            {/* Column 1: Invited */}
            <div className="w-80 shrink-0 bg-transparent rounded-xl flex flex-col">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className={`font-bold ${theme.textPrimary} flex items-center gap-2`}>
                  Invited <span className={`${theme.textSecondary} font-normal`}>3</span>
                </h3>
                <button className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><Plus className="w-4 h-4" /></button>
              </div>
              <div className={`${theme.surface} p-5 rounded-xl shadow-sm border ${theme.border} transition-colors duration-300`}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-semibold ${theme.background} ${theme.textSecondary} px-2 py-1 rounded border ${theme.border}`}>Pending</span>
                  <button className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><MoreHorizontal className="w-4 h-4" /></button>
                </div>
                <h4 className={`font-bold ${theme.textPrimary}`}>Sarah Jenkins</h4>
                <p className={`text-sm ${theme.textSecondary} mb-6`}>sarah.j@example.com</p>
                <div className="flex items-center justify-between">
                  <div className={`w-6 h-6 ${isDarkMode ? 'bg-pink-900/30 text-pink-400' : 'bg-pink-100 text-pink-700'} rounded-full flex items-center justify-center text-xs font-bold border ${isDarkMode ? 'border-pink-800' : 'border-white'}`}>SJ</div>
                  <div className={`text-xs ${theme.textSecondary} flex items-center gap-1`}><Clock className="w-3 h-3" /> 2d ago</div>
                </div>
              </div>
            </div>

            {/* Column 2: Registered */}
            <div className="w-80 shrink-0 bg-transparent rounded-xl flex flex-col">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className={`font-bold ${theme.textPrimary} flex items-center gap-2`}>
                  Registered <span className={`${theme.textSecondary} font-normal`}>2</span>
                </h3>
                <button className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><Plus className="w-4 h-4" /></button>
              </div>
              <div className={`${theme.surface} p-5 rounded-xl shadow-sm border-2 border-green-800 relative transition-colors duration-300`}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-semibold ${isDarkMode ? 'bg-teal-900/30 text-teal-400 border-teal-800' : 'bg-teal-50 text-teal-700 border-teal-100'} px-2 py-1 rounded border`}>Action Needed</span>
                  <button className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><MoreHorizontal className="w-4 h-4" /></button>
                </div>
                <h4 className={`font-bold ${theme.textPrimary}`}>Michael Chen</h4>
                <p className={`text-sm ${theme.textSecondary} mb-4`}>Complete profile setup</p>
                <div className="mb-4">
                  <span className={`text-xs font-medium ${theme.background} ${theme.textSecondary} px-2 py-1 rounded border ${theme.border}`}>Bronze</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className={`w-6 h-6 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'} rounded-full flex items-center justify-center text-xs font-bold border ${isDarkMode ? 'border-blue-800' : 'border-white'}`}>MC</div>
                  <div className={theme.textSecondary}><Mail className="w-4 h-4" /></div>
                </div>
              </div>
            </div>

            {/* Column 3: Active */}
            <div className="w-80 shrink-0 bg-transparent rounded-xl flex flex-col">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className={`font-bold ${theme.textPrimary} flex items-center gap-2`}>
                  Active <span className={`${theme.textSecondary} font-normal`}>1</span>
                </h3>
                <button className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><Plus className="w-4 h-4" /></button>
              </div>
              <div className={`${theme.surface} p-5 rounded-xl shadow-sm border ${isDarkMode ? 'border-[#8EAD45]' : 'border-[#8EAD45]'} transition-colors duration-300`}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-semibold ${isDarkMode ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-green-50 text-green-700 border-green-100'} px-2 py-1 rounded border`}>Verified</span>
                  <button className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><MoreHorizontal className="w-4 h-4" /></button>
                </div>
                <h4 className={`font-bold ${theme.textPrimary}`}>Elena Rodriguez</h4>
                <p className={`text-sm ${theme.textSecondary} mb-4`}>Top Seller Region B</p>
                <div className="mb-4">
                   <span className={`text-xs font-medium ${isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'} px-2 py-1 rounded border ${isDarkMode ? 'border-yellow-800' : 'border-yellow-200'}`}>Gold</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className={`w-6 h-6 ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'} rounded-full flex items-center justify-center text-xs font-bold border ${isDarkMode ? 'border-purple-800' : 'border-white'}`}>ER</div>
                  <button className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><Edit2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            {/* Column 4: At Risk */}
            <div className="w-80 shrink-0 bg-transparent rounded-xl flex flex-col">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className={`font-bold ${theme.textPrimary} flex items-center gap-2`}>
                  At Risk <span className={`${theme.textSecondary} font-normal`}>1</span>
                </h3>
                <button className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><Plus className="w-4 h-4" /></button>
              </div>
              <div className={`${theme.surface} p-5 rounded-xl shadow-sm border border-red-500 transition-colors duration-300`}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-semibold ${isDarkMode ? 'bg-red-900/30 text-red-500 border-red-800' : 'bg-red-50 text-red-700 border-red-100'} px-2 py-1 rounded border`}>Suspension Warning</span>
                  <button className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><MoreHorizontal className="w-4 h-4" /></button>
                </div>
                <h4 className={`font-bold ${theme.textPrimary}`}>David Kim</h4>
                <p className={`text-sm ${theme.textSecondary} mb-4`}>Multiple missed deliveries</p>
                <div className="mb-4">
                  <span className={`text-xs font-medium ${theme.background} ${theme.textPrimary} px-2 py-1 rounded border ${theme.border}`}>Silver</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className={`w-6 h-6 ${theme.background} rounded-full flex items-center justify-center text-xs font-bold ${theme.textSecondary} border ${theme.border}`}>DK</div>
                  <button className={`text-red-500 hover:text-red-400 transition-colors`}><Ban className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}