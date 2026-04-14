'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useTheme } from '@/theme/ThemeContext';
import { 
  Search, Bell, ShoppingCart, MapPin, Phone, 
  Package, Key, Shield, LogOut, Plus, Edit2, Trash2, ChevronDown, CreditCard, Mail, Building, Sun, Moon
} from 'lucide-react';

// ============================================================================
// --- STRATEGY PATTERN TYPES & INTERFACES (Payment Methods) ---
// ============================================================================
type PaymentType = 'credit_card' | 'paypal' | 'bank_transfer';

interface PaymentMethodData {
  id: string;
  type: PaymentType;
  isDefault: boolean;
  details: any;
}

interface PaymentRenderStrategy {
  render: (method: PaymentMethodData, cardholder: string, theme: any, isDarkMode: boolean) => React.ReactNode;
}

const CreditCardStrategy: PaymentRenderStrategy = {
  render: (method, cardholder, theme, isDarkMode) => {
    const { brand, last4, exp } = method.details;
    const isDefault = method.isDefault;
    
    return (
      <div key={method.id} className={`border rounded-xl p-5 relative group shadow-sm transition-colors ${isDefault ? 'border-green-700 bg-green-700/10 border-2' : `${theme.border} ${theme.surface} hover:border-green-700/30 ${theme.surfaceHover}`}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`${isDefault ? theme.surface : theme.background} p-2 rounded-md shadow-sm border ${theme.border}`}>
              <CreditCard className={`${isDefault ? 'text-green-700' : theme.textSecondary} w-5 h-5`} />
            </div>
            <span className={`font-bold text-sm ${theme.textPrimary}`}>{brand}</span>
          </div>
          {isDefault && <span className="bg-green-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">Default</span>}
        </div>
        
        <p className={`text-sm ${theme.textSecondary} font-medium mb-1 tracking-widest text-lg`}>•••• •••• •••• {last4}</p>
        
        <div className="flex items-center justify-between mt-4">
          <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Cardholder</p>
              <p className={`text-sm ${theme.textPrimary} font-bold`}>{cardholder}</p>
          </div>
          <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Expires</p>
              <p className={`text-sm ${theme.textPrimary} font-bold`}>{exp}</p>
          </div>
        </div>
        
        <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
            <button className={`p-1.5 text-gray-400 hover:text-green-700 ${theme.surfaceHover} rounded-lg transition-colors shadow-sm`}><Edit2 className="w-4 h-4" /></button>
            <button className={`p-1.5 text-gray-400 hover:text-red-500 ${theme.surfaceHover} rounded-lg transition-colors shadow-sm`}><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    );
  }
};

const PayPalStrategy: PaymentRenderStrategy = {
  render: (method, cardholder, theme, isDarkMode) => {
    const { email } = method.details;
    const isDefault = method.isDefault;
    
    return (
      <div key={method.id} className={`border rounded-xl p-5 relative group shadow-sm transition-colors ${isDefault ? 'border-green-700 bg-green-700/10 border-2' : `${theme.border} ${theme.surface} hover:border-green-700/30 ${theme.surfaceHover}`}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className={`${isDefault ? theme.surface : theme.background} p-2 rounded-md shadow-sm border ${theme.border}`}>
              <Mail className={`${isDefault ? 'text-green-700' : theme.textSecondary} w-5 h-5`} />
            </div>
            <span className={`font-bold text-sm ${theme.textPrimary}`}>PayPal</span>
          </div>
          {isDefault && <span className="bg-green-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">Default</span>}
        </div>
        
        <p className={`text-sm ${theme.textSecondary} font-medium mb-1 tracking-wider`}>{email}</p>
        
        <div className={`mt-4 pt-3 border-t ${theme.border}`}>
          <p className="text-xs text-gray-500">Connected account for rapid checkout.</p>
        </div>
        
        <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
            <button className={`p-1.5 text-gray-400 hover:text-red-500 ${theme.surfaceHover} rounded-lg transition-colors shadow-sm`}><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    );
  }
};

const BankTransferStrategy: PaymentRenderStrategy = {
  render: (method, cardholder, theme, isDarkMode) => {
    const { bankName, accountLast4 } = method.details;
    const isDefault = method.isDefault;
    
    return (
      <div key={method.id} className={`border rounded-xl p-5 relative group shadow-sm transition-colors ${isDefault ? 'border-green-700 bg-green-700/10 border-2' : `${theme.border} ${theme.surface} hover:border-green-700/30 ${theme.surfaceHover}`}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className={`${isDefault ? theme.surface : theme.background} p-2 rounded-md shadow-sm border ${theme.border}`}>
              <Building className={`${isDefault ? 'text-green-700' : theme.textSecondary} w-5 h-5`} />
            </div>
            <span className={`font-bold text-sm ${theme.textPrimary}`}>{bankName}</span>
          </div>
          {isDefault && <span className="bg-green-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">Default</span>}
        </div>
        
        <p className={`text-sm ${theme.textSecondary} font-medium mb-1 tracking-widest`}>Account •••• {accountLast4}</p>
        
        <div className="flex items-center justify-between mt-4">
          <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Account Holder</p>
              <p className={`text-sm ${theme.textPrimary} font-bold`}>{cardholder}</p>
          </div>
        </div>
        
        <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
            <button className={`p-1.5 text-gray-400 hover:text-red-500 ${theme.surfaceHover} rounded-lg transition-colors shadow-sm`}><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    );
  }
};

const paymentStrategies: Record<PaymentType, PaymentRenderStrategy> = {
  credit_card: CreditCardStrategy,
  paypal: PayPalStrategy,
  bank_transfer: BankTransferStrategy,
};

const mockPaymentMethods: PaymentMethodData[] = [
  { id: '1', type: 'credit_card', isDefault: true, details: { brand: 'Visa', last4: '4242', exp: '12/24' } },
  { id: '2', type: 'credit_card', isDefault: false, details: { brand: 'Mastercard', last4: '8888', exp: '08/25' } },
  { id: '3', type: 'paypal', isDefault: false, details: { email: 'user@example.com' } },
];

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Personal Info');

  // --- GLOBAL THEME INTEGRATION ---
  const { theme, isDarkMode, toggleTheme } = useTheme();

  // Form State
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);

          const username = data.user?.user_metadata?.username || data.user?.username || '';
          const names = username.split(' ');
          
          setEditFirstName(data.user?.user_metadata?.first_name || names[0] || '');
          setEditLastName(data.user?.user_metadata?.last_name || names.slice(1).join(' ') || '');
          setEditEmail(data.user?.email || '');
          setEditPhone(data.user?.user_metadata?.contact || data.user?.phone || '');
        } else {
          router.push('/login'); 
        }
      } catch (err) {
        console.error("Error fetching user data", err);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Error during logout", err);
    } finally {
      router.push('/');
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          first_name: editFirstName,
          last_name: editLastName,
          email: editEmail,
          contact: editPhone,
        })
      });

      if (res.ok) {
        alert("Profile successfully updated!");
        setUser((prev: any) => ({
          ...prev,
          email: editEmail,
          user_metadata: {
            ...prev?.user_metadata,
            first_name: editFirstName,
            last_name: editLastName,
            contact: editPhone,
            username: `${editFirstName} ${editLastName}`.trim()
          }
        }));
      } else {
         alert("Could not update profile. Please verify your backend route is set up.");
      }
    } catch (err) {
      alert("A network error occurred. Is your server running?");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return (
    <div className={`flex h-screen ${theme.background} items-center justify-center font-bold text-xl transition-colors duration-300`}>
      <span className={theme.textPrimary}>Loading profile...</span>
    </div>
  );

  const displayUsername = user?.user_metadata?.username || user?.username || 'Guest Profile';
  const displayEmail = user?.email || 'guest@example.com';
  const displayPhone = user?.user_metadata?.contact || user?.phone || '+1 (555) 123-4567';
  const displayLocation = user?.user_metadata?.branch || user?.branch || 'No branch listed';
  const displayRole = user?.user_metadata?.role === 'seller' ? 'Premium Seller' : 'Premium Member';

  const tabs = ['Personal Info', 'Addresses', 'Payment Methods', 'Order History', 'Preferences'];

  return (
    <div className={`flex h-screen ${theme.background} font-sans transition-colors duration-300`}>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className={`${theme.surface} h-16 border-b ${theme.border} flex items-center justify-between px-6 shrink-0 shadow-sm transition-colors duration-300`}>
          <div className="flex-1 max-w-2xl relative">
            <Search className={`w-4 h-4 ${theme.textSecondary} absolute left-3 top-1/2 -translate-y-1/2`} />
            <input 
              type="text" 
              placeholder="Search orders, tracking numbers, or members..." 
              className={`w-full ${theme.background} border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-green-700 outline-none ${theme.textPrimary} placeholder-gray-400 transition-colors duration-300`}
            />
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button className={`relative p-2 ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 border border-white rounded-full"></span>
            </button>
            <button className={`relative p-2 ${theme.background} rounded-full ${theme.textSecondary} hover:${theme.surfaceHover} transition-colors`}>
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-green-800 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                3
              </span>
            </button>
          </div>
        </header>

        <div className={`flex-1 overflow-auto p-8 ${theme.textPrimary}`}>
          
          <div className="mb-8">
            <h1 className={`text-3xl font-bold tracking-tight mb-2 ${theme.textPrimary}`}>Member Profile</h1>
            <p className={`text-sm font-medium ${theme.textSecondary}`}>Manage your account details and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              <div className={`${theme.surface} rounded-2xl p-6 shadow-sm border ${theme.border} flex flex-col items-center transition-colors duration-300`}>
                <div className="relative mb-4">
                  <div className={`w-24 h-24 rounded-full ${theme.background} overflow-hidden border-4 ${theme.border} shadow-sm`}>
                    <img src="/assets/avif-test-image.avif" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <button className={`absolute bottom-0 right-0 w-8 h-8 ${theme.surface} border ${theme.border} rounded-full flex items-center justify-center ${theme.textSecondary} hover:${theme.surfaceHover} transition-colors shadow-sm`}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <h2 className={`text-xl font-bold ${theme.textPrimary} mb-1`}>{displayUsername}</h2>
                <p className={`text-sm ${theme.textSecondary} mb-4`}>{displayEmail}</p>
                
                <div className="flex items-center gap-2 mb-6">
                  <span className="bg-green-700/10 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-700/20 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {displayRole}
                  </span>
                  <span className={`text-xs ${theme.textSecondary} font-medium`}>Since 2021</span>
                </div>

                <div className={`w-full space-y-4 pt-4 border-t ${theme.border} text-sm`}>
                  <div className={`flex items-center justify-between ${theme.textSecondary}`}>
                    <div className="flex items-center gap-2">
                       <Phone className="w-4 h-4 opacity-70" />
                       <span className="font-medium">Phone</span>
                    </div>
                    <span className={`${theme.textPrimary} font-bold`}>{displayPhone}</span>
                  </div>
                  
                  <div className={`flex items-center justify-between ${theme.textSecondary}`}>
                    <div className="flex items-center gap-2">
                       <MapPin className="w-4 h-4 opacity-70" />
                       <span className="font-medium">Location</span>
                    </div>
                    <span className={`${theme.textPrimary} font-bold`}>{displayLocation}</span>
                  </div>
                  
                  <div className={`flex items-center justify-between ${theme.textSecondary}`}>
                    <div className="flex items-center gap-2">
                       <Package className="w-4 h-4 opacity-70" />
                       <span className="font-medium">Orders</span>
                    </div>
                    <span className={`${theme.textPrimary} font-bold`}>42</span>
                  </div>
                </div>
              </div>

              <div className={`${theme.surface} rounded-2xl p-6 shadow-sm border ${theme.border} transition-colors duration-300`}>
                <h3 className={`text-xs font-bold ${theme.textSecondary} uppercase tracking-wider mb-4`}>Account Actions</h3>
                <div className="space-y-3">
                  <button className={`w-full flex items-center justify-between p-3 ${theme.background} rounded-xl hover:${theme.surfaceHover} transition-colors border border-transparent ${theme.textPrimary} font-medium text-sm`}>
                    <div className="flex items-center gap-3">
                       <Key className={`w-4 h-4 ${theme.textSecondary}`} />
                       Change Password
                    </div>
                    <ChevronDown className={`w-4 h-4 ${theme.textSecondary} -rotate-90`} />
                  </button>
                  <button className={`w-full flex items-center justify-between p-3 ${theme.background} rounded-xl hover:${theme.surfaceHover} transition-colors border border-transparent ${theme.textPrimary} font-medium text-sm`}>
                    <div className="flex items-center gap-3">
                       <Shield className={`w-4 h-4 ${theme.textSecondary}`} />
                       Two-Factor Auth
                    </div>
                    <span className="bg-green-700/10 text-green-700 border border-green-700/20 text-[10px] font-bold px-2 py-0.5 rounded-md">Enabled</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full mt-4 flex items-center justify-center gap-2 p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-xl transition-colors font-bold text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              <div className={`${theme.surface} rounded-full p-1.5 shadow-sm border ${theme.border} flex overflow-x-auto hide-scrollbar text-sm font-bold transition-colors duration-300`}>
                {tabs.map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-full whitespace-nowrap tracking-wide transition-colors ${
                      activeTab === tab 
                        ? 'bg-green-800 text-white shadow-sm' 
                        : `${theme.textSecondary} hover:${theme.textPrimary} hover:${theme.surfaceHover}`
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Personal Information Tab */}
              {activeTab === 'Personal Info' && (
                <div className={`${theme.surface} rounded-2xl p-6 shadow-sm border ${theme.border} mt-2 animate-in fade-in duration-300 transition-colors duration-300`}>
                  <div className={`flex items-start justify-between mb-6 border-b ${theme.border} pb-4`}>
                    <div>
                      <h2 className={`text-xl font-bold ${theme.textPrimary} mb-1`}>Personal Information</h2>
                      <p className={`text-sm ${theme.textSecondary} font-medium`}>Update your personal details and contact information.</p>
                    </div>
                    <div className="flex flex-col gap-2 relative">
                      <button 
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                        className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-green-800 hover:bg-green-900 shadow-sm transition-colors disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <label className={`block text-xs font-bold ${theme.textSecondary} uppercase tracking-widest mb-2`}>First Name</label>
                      <input 
                        type="text" 
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        className={`w-full ${theme.background} border ${theme.border} rounded-xl px-4 py-3 ${theme.textPrimary} font-bold focus:outline-none focus:ring-2 focus:ring-green-700 transition-colors duration-300`} 
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold ${theme.textSecondary} uppercase tracking-widest mb-2`}>Last Name</label>
                      <input 
                        type="text" 
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        className={`w-full ${theme.background} border ${theme.border} rounded-xl px-4 py-3 ${theme.textPrimary} font-bold focus:outline-none focus:ring-2 focus:ring-green-700 transition-colors duration-300`} 
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold ${theme.textSecondary} uppercase tracking-widest mb-2`}>Email Address</label>
                      <input 
                        type="email" 
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className={`w-full ${theme.background} border ${theme.border} rounded-xl px-4 py-3 ${theme.textPrimary} font-bold focus:outline-none focus:ring-2 focus:ring-green-700 transition-colors duration-300`} 
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold ${theme.textSecondary} uppercase tracking-widest mb-2`}>Phone Number</label>
                      <input 
                        type="tel" 
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className={`w-full ${theme.background} border ${theme.border} rounded-xl px-4 py-3 ${theme.textPrimary} font-bold focus:outline-none focus:ring-2 focus:ring-green-700 transition-colors duration-300`} 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-xs font-bold ${theme.textSecondary} uppercase tracking-widest mb-2`}>Bio (Optional)</label>
                      <textarea 
                        rows={3} 
                        defaultValue="Avid marketplace buyer and seller based in the PNW. Interested in sustainable goods and local crafts."
                        className={`w-full ${theme.background} border ${theme.border} rounded-xl px-4 py-3 ${theme.textPrimary} font-bold focus:outline-none focus:ring-2 focus:ring-green-700 resize-none transition-colors duration-300`} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'Addresses' && (
                <div className={`${theme.surface} rounded-2xl p-6 shadow-sm border ${theme.border} mt-2 animate-in fade-in duration-300 transition-colors duration-300`}>
                   <div className={`flex items-start justify-between mb-6 border-b ${theme.border} pb-4`}>
                    <div>
                      <h2 className={`text-xl font-bold ${theme.textPrimary} mb-1`}>Saved Addresses</h2>
                      <p className={`text-sm ${theme.textSecondary} font-medium`}>Manage your shipping and billing addresses.</p>
                    </div>
                    <button className={`px-5 py-2 rounded-lg text-sm font-bold ${theme.textPrimary} ${theme.background} hover:${theme.surfaceHover} shadow-sm flex items-center gap-2 transition-colors border ${theme.border}`}>
                      <Plus className={`w-4 h-4 ${theme.textSecondary}`} />
                      Add New
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border-2 border-green-700 bg-green-700/10 rounded-xl p-4 relative group">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-green-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">Default Shipping</span>
                        <span className={`font-bold text-sm ${theme.textPrimary}`}>Home</span>
                      </div>
                      <p className={`text-sm font-bold ${theme.textPrimary} mb-1`}>{displayUsername}</p>
                      <p className={`text-sm ${theme.textSecondary} mb-1 leading-relaxed`}>
                        123 Pine Street, Apt 4B<br/>
                        Seattle, WA 98101<br/>
                        United States
                      </p>
                      
                      <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                         <button className={`p-1.5 text-gray-400 hover:text-green-700 ${theme.surfaceHover} rounded-lg transition-colors shadow-sm`}><Edit2 className="w-4 h-4" /></button>
                         <button className={`p-1.5 text-gray-400 hover:text-red-500 ${theme.surfaceHover} rounded-lg transition-colors shadow-sm`}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>

                    <div className={`border ${theme.border} ${theme.surface} hover:border-green-700/30 hover:${theme.surfaceHover} transition-colors rounded-xl p-4 relative group shadow-sm`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`font-bold text-sm ${theme.textPrimary}`}>Office</span>
                      </div>
                      <p className={`text-sm font-bold ${theme.textPrimary} mb-1`}>{displayUsername}</p>
                      <p className={`text-sm ${theme.textSecondary} mb-1 leading-relaxed`}>
                        450 Tech Blvd, Floor 12<br/>
                        Bellevue, WA 98004<br/>
                        United States
                      </p>

                      <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                         <button className={`p-1.5 text-gray-400 hover:text-green-700 ${theme.surfaceHover} rounded-lg transition-colors shadow-sm`}><Edit2 className="w-4 h-4" /></button>
                         <button className={`p-1.5 text-gray-400 hover:text-red-500 ${theme.surfaceHover} rounded-lg transition-colors shadow-sm`}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              {activeTab === 'Payment Methods' && (
                <div className={`${theme.surface} rounded-2xl p-6 shadow-sm border ${theme.border} mt-2 animate-in fade-in duration-300 transition-colors duration-300`}>
                   <div className={`flex items-start justify-between mb-6 border-b ${theme.border} pb-4`}>
                    <div>
                      <h2 className={`text-xl font-bold ${theme.textPrimary} mb-1`}>Payment Methods</h2>
                      <p className={`text-sm ${theme.textSecondary} font-medium`}>Manage your saved credit cards and billing methods.</p>
                    </div>
                    <button className={`px-5 py-2 rounded-lg text-sm font-bold ${theme.textPrimary} ${theme.background} hover:${theme.surfaceHover} shadow-sm flex items-center gap-2 transition-colors border ${theme.border}`}>
                      <Plus className={`w-4 h-4 ${theme.textSecondary}`} />
                      Add New Payment
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockPaymentMethods.map(method => {
                      const strategy = paymentStrategies[method.type];
                      return strategy ? strategy.render(method, displayUsername, theme, isDarkMode) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Preferences using Global Abstract Factory theme object via useTheme() */}
              {activeTab === 'Preferences' && (
                <div className={`${theme.surface} transition-colors duration-300 rounded-2xl p-6 shadow-sm border ${theme.border} mt-2 animate-in fade-in duration-300`}>
                   <div className={`flex items-start justify-between mb-6 border-b ${theme.border} pb-4`}>
                    <div>
                      <h2 className={`text-xl font-bold ${theme.textPrimary} mb-1`}>Preferences</h2>
                      <p className={`text-sm ${theme.textSecondary} font-medium`}>Manage your visual settings and application variables.</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* Dark/Light Mode Toggle */}
                    <div className={`flex items-center justify-between p-4 border rounded-xl ${theme.border}`}>
                      <div className="flex items-center gap-4">
                         <div className={`p-3 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                           {isDarkMode 
                             ? <Moon className="text-blue-400 w-5 h-5 flex-shrink-0" /> 
                             : <Sun className="text-yellow-500 w-5 h-5 flex-shrink-0" />
                           }
                         </div>
                         <div>
                           <h3 className={`font-bold text-sm ${theme.textPrimary}`}>Application Theme</h3>
                           <p className={`text-xs ${theme.textSecondary}`}>
                             Toggle between Dark and Light mode.
                           </p>
                         </div>
                      </div>
                      
                      <button
                        onClick={toggleTheme}
                        className={`px-5 py-2 text-sm font-bold rounded-lg transition-colors shadow-sm ${
                          isDarkMode 
                            ? 'bg-white text-gray-900 hover:bg-gray-200' 
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                      >
                        {isDarkMode ? 'Enable Light Mode' : 'Enable Dark Mode'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Order History' && (
                <div className={`${theme.surface} rounded-2xl p-6 shadow-sm border ${theme.border} mt-2 flex flex-col items-center justify-center min-h-[300px] animate-in fade-in duration-300 transition-colors duration-300`}>
                  <Package className={`w-12 h-12 ${theme.textSecondary} opacity-30 mb-4`} />
                  <h3 className={`text-lg font-bold ${theme.textPrimary} mb-1`}>{activeTab}</h3>
                  <p className={`text-sm ${theme.textSecondary}`}>This section is not yet implemented.</p>
                </div>
              )}

            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}