'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Search, Bell, Plus, MoreHorizontal, Clock, Edit2, Mail, Ban } from 'lucide-react';
import { useTheme } from '@/theme/ThemeContext';


// Types for member
type Member = {
  name: string;
  email: string;
  initials: string;
  reason?: string; // for at risk
};

export default function MemberManagementPage() {
  const { theme, isDarkMode } = useTheme();

  // State for members in each section
  const [invited, setInvited] = useState<Member[]>([
    { name: 'Sarah Jenkins', email: 'sarah.j@example.com', initials: 'SJ' },
  ]);
  const [registered, setRegistered] = useState<Member[]>([
    { name: 'Michael Chen', email: '', initials: 'MC' },
  ]);
  const [active, setActive] = useState<Member[]>([
    { name: 'Elena Rodriguez', email: '', initials: 'ER' },
  ]);
  const [atRisk, setAtRisk] = useState<Member[]>([
    { name: 'David Kim', email: '', initials: 'DK', reason: 'Multiple missed deliveries' },
  ]);

  // Modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const [showAtRiskModal, setShowAtRiskModal] = useState(false);
  const [atRiskReason, setAtRiskReason] = useState('');
  const [selectedRegisteredIndex, setSelectedRegisteredIndex] = useState<number | null>(null);

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
            <button
              className="flex items-center gap-2 bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-900 transition-colors shadow-sm"
              onClick={() => setShowInviteModal(true)}
            >
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
                  Invited <span className={`${theme.textSecondary} font-normal`}>{invited.length}</span>
                </h3>
                <button className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`} onClick={() => setShowInviteModal(true)}><Plus className="w-4 h-4" /></button>
              </div>
              {invited.map((member, idx) => (
                <div key={idx} className={`${theme.surface} p-5 rounded-xl shadow-sm border ${theme.border} transition-colors duration-300 mb-4`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-semibold ${theme.background} ${theme.textSecondary} px-2 py-1 rounded border ${theme.border}`}>Pending</span>
                    <button className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><MoreHorizontal className="w-4 h-4" /></button>
                  </div>
                  <h4 className={`font-bold ${theme.textPrimary}`}>{member.name}</h4>
                  {member.email && <p className={`text-sm ${theme.textSecondary} mb-6`}>{member.email}</p>}
                  <div className="flex items-center justify-between">
                    <div className={`w-6 h-6 ${isDarkMode ? 'bg-pink-900/30 text-pink-400' : 'bg-pink-100 text-pink-700'} rounded-full flex items-center justify-center text-xs font-bold border ${isDarkMode ? 'border-pink-800' : 'border-white'}`}>{member.initials}</div>
                    <button
                      className="text-xs bg-green-700 text-white px-2 py-1 rounded hover:bg-green-800 transition-colors"
                      onClick={() => {
                        // Move to registered
                        setRegistered(r => [...r, member]);
                        setInvited(inv => inv.filter((_, i) => i !== idx));
                      }}
                    >Register</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2: Registered */}
            <div className="w-80 shrink-0 bg-transparent rounded-xl flex flex-col">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className={`font-bold ${theme.textPrimary} flex items-center gap-2`}>
                  Registered <span className={`${theme.textSecondary} font-normal`}>{registered.length}</span>
                </h3>
                <button className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><Plus className="w-4 h-4" /></button>
              </div>
              {registered.map((member, idx) => (
                <div key={idx} className={`${theme.surface} p-5 rounded-xl shadow-sm border-2 border-green-800 relative transition-colors duration-300 mb-4`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-semibold ${isDarkMode ? 'bg-teal-900/30 text-teal-400 border-teal-800' : 'bg-teal-50 text-teal-700 border-teal-100'} px-2 py-1 rounded border`}>Action Needed</span>
                    <button className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><MoreHorizontal className="w-4 h-4" /></button>
                  </div>
                  <h4 className={`font-bold ${theme.textPrimary}`}>{member.name}</h4>
                  <p className={`text-sm ${theme.textSecondary} mb-4`}>{member.email || 'Complete profile setup'}</p>
                  <div className="mb-4">
                    <span className={`text-xs font-medium ${theme.background} ${theme.textSecondary} px-2 py-1 rounded border ${theme.border}`}>Bronze</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className={`w-6 h-6 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'} rounded-full flex items-center justify-center text-xs font-bold border ${isDarkMode ? 'border-blue-800' : 'border-white'}`}>{member.initials}</div>
                    <button
                      className="text-xs bg-green-700 text-white px-2 py-1 rounded hover:bg-green-800 transition-colors"
                      onClick={() => {
                        setActive(a => [...a, member]);
                        setRegistered(r => r.filter((_, i) => i !== idx));
                      }}
                    >Activate</button>
                    <button
                      className="text-xs bg-green-700 text-white px-2 py-1 rounded hover:bg-green-800 transition-colors"
                      onClick={() => {
                        setSelectedRegisteredIndex(idx);
                        setShowAtRiskModal(true);
                        setAtRiskReason('');
                      }}
                    >At Risk</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 3: Active */}
            <div className="w-80 shrink-0 bg-transparent rounded-xl flex flex-col">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className={`font-bold ${theme.textPrimary} flex items-center gap-2`}>
                  Active <span className={`${theme.textSecondary} font-normal`}>{active.length}</span>
                </h3>
                <button className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><Plus className="w-4 h-4" /></button>
              </div>
              {active.map((member, idx) => (
                <div key={idx} className={`${theme.surface} p-5 rounded-xl shadow-sm border ${isDarkMode ? 'border-[#8EAD45]' : 'border-[#8EAD45]'} transition-colors duration-300 mb-4`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-semibold ${isDarkMode ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-green-50 text-green-700 border-green-100'} px-2 py-1 rounded border`}>
                      Verified
                    </span>
                    <button className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><MoreHorizontal className="w-4 h-4" /></button>
                  </div>
                  <h4 className={`font-bold ${theme.textPrimary}`}>{member.name}</h4>
                  <p className={`text-sm ${theme.textSecondary} mb-4`}>Top Seller Region B</p>
                  <div className="mb-4">
                    <span className={`text-xs font-medium ${isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'} px-2 py-1 rounded border ${isDarkMode ? 'border-yellow-800' : 'border-yellow-200'}`}>Gold</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className={`w-6 h-6 ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'} rounded-full flex items-center justify-center text-xs font-bold border ${isDarkMode ? 'border-purple-800' : 'border-white'}`}>{member.initials}</div>
                    <button className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><Edit2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 4: At Risk */}
            <div className="w-80 shrink-0 bg-transparent rounded-xl flex flex-col">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className={`font-bold ${theme.textPrimary} flex items-center gap-2`}>
                  At Risk <span className={`${theme.textSecondary} font-normal`}>{atRisk.length}</span>
                </h3>
                <button className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><Plus className="w-4 h-4" /></button>
              </div>
              {atRisk.map((member, idx) => (
                <div key={idx} className={`${theme.surface} p-5 rounded-xl shadow-sm border border-red-500 transition-colors duration-300 mb-4`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-semibold ${isDarkMode ? 'bg-red-900/30 text-red-500 border-red-800' : 'bg-red-50 text-red-700 border-red-100'} px-2 py-1 rounded border`}>
                      Suspension Warning
                    </span>
                    <button className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><MoreHorizontal className="w-4 h-4" /></button>
                  </div>
                  <h4 className={`font-bold ${theme.textPrimary}`}>{member.name}</h4>
                  {member.reason && <p className={`text-sm ${theme.textSecondary} mb-4`}>{member.reason}</p>}
                  <div className="mb-4">
                    <span className={`text-xs font-medium ${theme.background} ${theme.textPrimary} px-2 py-1 rounded border ${theme.border}`}>Silver</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className={`w-6 h-6 ${theme.background} rounded-full flex items-center justify-center text-xs font-bold ${theme.textSecondary} border ${theme.border}`}>{member.initials}</div>
                    <button className={`text-red-500 hover:text-red-400 transition-colors`}><Ban className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>
    {/* Invite Member Modal */}
    {showInviteModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
        <div className={`bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg w-96 flex flex-col gap-4 border ${theme.border}`}>
          <h2 className="text-xl font-bold mb-2">Invite Member</h2>
          <input
            type="text"
            placeholder="Name"
            className="border border-green-700 p-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={inviteName}
            onChange={e => setInviteName(e.target.value)}
            autoFocus
          />
          <input
            type="email"
            placeholder="Email"
            className="border border-green-700 p-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
          />
          <div className="flex gap-2 mt-4">
            <button
              className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
              onClick={() => {
                if (inviteName.trim()) {
                  setInvited(inv => [
                    ...inv,
                    {
                      name: inviteName,
                      email: inviteEmail,
                      initials: inviteName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
                    },
                  ]);
                  setInviteName('');
                  setInviteEmail('');
                  setShowInviteModal(false);
                }
              }}
            >Invite</button>
            <button
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              onClick={() => {
                setShowInviteModal(false);
                setInviteName('');
                setInviteEmail('');
              }}
            >Cancel</button>
          </div>
        </div>
      </div>
    )}

    {/* At Risk Modal */}
    {showAtRiskModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
        <div className={`bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg w-96 flex flex-col gap-4 border ${theme.border}`}>
          <h2 className="text-xl font-bold mb-2">Mark as At Risk</h2>
          <input
            type="text"
            placeholder="Reason for being at risk"
            className="border border-green-700 p-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={atRiskReason}
            onChange={e => setAtRiskReason(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2 mt-4">
            <button
              className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
              onClick={() => {
                if (selectedRegisteredIndex !== null && atRiskReason.trim()) {
                  const member = registered[selectedRegisteredIndex];
                  setAtRisk(a => [
                    ...a,
                    { ...member, reason: atRiskReason },
                  ]);
                  setRegistered(r => r.filter((_, i) => i !== selectedRegisteredIndex));
                  setShowAtRiskModal(false);
                  setAtRiskReason('');
                  setSelectedRegisteredIndex(null);
                }
              }}
            >Confirm</button>
            <button
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              onClick={() => {
                setShowAtRiskModal(false);
                setAtRiskReason('');
                setSelectedRegisteredIndex(null);
              }}
            >Cancel</button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}