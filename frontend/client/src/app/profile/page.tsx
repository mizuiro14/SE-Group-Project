'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { 
  Search, Bell, ShoppingCart, MapPin, Phone, 
  Package, Key, Shield, LogOut, Plus, Edit2, Trash2, ChevronDown
} from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  
  // Track form edits in state
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

          // Populate the form with the fetched user details
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

  // Handle logging out
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Error during logout", err);
    } finally {
      // Redirect to the hero/home page regardless
      router.push('/');
    }
  };

  // Method to handle saving adjustments to the backend
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // NOTE: This will fail until you create a PUT /api/user/update route in your Express backend
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
        // Re-sync local user state after saving instantly so the UI updates
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
         console.error("Failed to update profile. Make sure the backend route exists.");
         alert("Could not update profile. Please verify your backend route is set up.");
      }
    } catch (err) {
      console.error("Custom Update Error:", err);
      alert("A network error occurred. Is your server running?");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return (
    <div className="flex h-screen bg-[#F5F3EF] items-center justify-center text-stone-900 font-bold text-xl">
      Loading profile...
    </div>
  );

  const displayUsername = user?.user_metadata?.username || user?.username || 'Guest Profile';
  const displayEmail = user?.email || 'guest@example.com';
  const displayPhone = user?.user_metadata?.contact || user?.phone || '+1 (555) 123-4567';
  
  // Mapping location to display what the user's "branch" is
  const displayLocation = user?.user_metadata?.branch || user?.branch || 'No branch listed';
  const displayRole = user?.user_metadata?.role === 'seller' ? 'Premium Seller' : 'Premium Member';

  return (
    <div className="flex h-screen bg-[#F5F3EF] text-stone-800 font-sans">
      
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-[#EAE7E0] flex items-center justify-between px-6 shrink-0 shadow-sm">
          <div className="flex-1 max-w-2xl relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search orders, tracking numbers, or members..." 
              className="w-full bg-[#F5F3EF] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#2C3E2D] outline-none text-stone-900 placeholder-stone-400"
            />
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button className="relative p-2 text-stone-400 hover:text-stone-800 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-2 w-2 h-2 bg-[#C85D4E] border border-white rounded-full"></span>
            </button>
            <button className="relative p-2 bg-[#F5F3EF] rounded-full text-stone-600 hover:bg-[#EAE7E0] transition-colors">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-[#2C3E2D] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                3
              </span>
            </button>
          </div>
        </header>

        {/* PROFILE CONTENT */}
        <div className="flex-1 overflow-auto p-8">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-stone-900 mb-2">Member Profile</h1>
            <p className="text-sm text-stone-600 font-medium">Manage your account details and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Profile Info Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EAE7E0] flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-[#F5F3EF] overflow-hidden border-4 border-white shadow-sm">
                    <img src="/assets/avif-test-image.avif" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-[#EAE7E0] rounded-full flex items-center justify-center text-stone-600 hover:bg-[#F5F3EF] transition-colors shadow-sm">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <h2 className="text-xl font-bold text-stone-900 mb-1">{displayUsername}</h2>
                <p className="text-sm text-stone-500 mb-4">{displayEmail}</p>
                
                <div className="flex items-center gap-2 mb-6">
                  <span className="bg-[#E5F0E6] text-[#2C3E2D] text-xs font-bold px-3 py-1 rounded-full border border-[#2C3E2D]/20 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {displayRole}
                  </span>
                  <span className="text-xs text-stone-400 font-medium">Since 2021</span>
                </div>

                <div className="w-full space-y-4 pt-4 border-t border-[#EAE7E0] text-sm">
                  <div className="flex items-center justify-between text-stone-600">
                    <div className="flex items-center gap-2">
                       <Phone className="w-4 h-4 text-stone-400" />
                       <span className="font-medium">Phone</span>
                    </div>
                    <span className="text-stone-900 font-bold">{displayPhone}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-stone-600">
                    <div className="flex items-center gap-2">
                       <MapPin className="w-4 h-4 text-stone-400" />
                       <span className="font-medium">Location</span>
                    </div>
                    <span className="text-stone-900 font-bold">{displayLocation}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-stone-600">
                    <div className="flex items-center gap-2">
                       <Package className="w-4 h-4 text-stone-400" />
                       <span className="font-medium">Orders</span>
                    </div>
                    <span className="text-stone-900 font-bold">42</span>
                  </div>
                </div>
              </div>

              {/* Account Actions Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EAE7E0]">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Account Actions</h3>
                
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 bg-[#F5F3EF] rounded-xl hover:bg-[#EAE7E0] transition-colors border border-transparent text-stone-700 font-medium text-sm">
                    <div className="flex items-center gap-3">
                       <Key className="w-4 h-4 text-stone-500" />
                       Change Password
                    </div>
                    <ChevronDown className="w-4 h-4 text-stone-400 -rotate-90" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-3 bg-[#F5F3EF] rounded-xl hover:bg-[#EAE7E0] transition-colors border border-transparent text-stone-700 font-medium text-sm">
                    <div className="flex items-center gap-3">
                       <Shield className="w-4 h-4 text-stone-500" />
                       Two-Factor Auth
                    </div>
                    <span className="bg-[#E5F0E6] text-[#2C3E2D] border border-[#2C3E2D]/20 text-[10px] font-bold px-2 py-0.5 rounded-md">Enabled</span>
                  </button>

                  <button 
                    onClick={handleLogout}
                    className="w-full mt-4 flex items-center justify-center gap-2 p-3 bg-[#C85D4E]/10 hover:bg-[#C85D4E]/20 border border-[#C85D4E]/20 text-[#C85D4E] rounded-xl transition-colors font-bold text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Navigation Tabs */}
              <div className="bg-white rounded-full p-1.5 shadow-sm border border-[#EAE7E0] flex overflow-x-auto hide-scrollbar text-sm font-bold">
                <button className="px-6 py-2 rounded-full whitespace-nowrap bg-[#2C3E2D] text-white shadow-sm tracking-wide">Personal Info</button>
                <button className="px-6 py-2 rounded-full whitespace-nowrap text-stone-600 hover:text-stone-900 hover:bg-[#F5F3EF] tracking-wide transition-colors">Addresses</button>
                <button className="px-6 py-2 rounded-full whitespace-nowrap text-stone-600 hover:text-stone-900 hover:bg-[#F5F3EF] tracking-wide transition-colors">Payment Methods</button>
                <button className="px-6 py-2 rounded-full whitespace-nowrap text-stone-600 hover:text-stone-900 hover:bg-[#F5F3EF] tracking-wide transition-colors">Order History</button>
                <button className="px-6 py-2 rounded-full whitespace-nowrap text-stone-600 hover:text-stone-900 hover:bg-[#F5F3EF] tracking-wide transition-colors">Preferences</button>
              </div>

              {/* Personal Information Form */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EAE7E0] mt-2">
                <div className="flex items-start justify-between mb-6 border-b border-[#EAE7E0] pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900 mb-1">Personal Information</h2>
                    <p className="text-sm text-stone-500 font-medium">Update your personal details and contact information.</p>
                  </div>
                  <button 
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-[#2C3E2D] hover:bg-[#1E2D20] shadow-sm transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">First Name</label>
                    <input 
                      type="text" 
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="w-full bg-[#F5F3EF] border border-[#EAE7E0] rounded-xl px-4 py-3 text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#2C3E2D]" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Last Name</label>
                    <input 
                      type="text" 
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="w-full bg-[#F5F3EF] border border-[#EAE7E0] rounded-xl px-4 py-3 text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#2C3E2D]" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Email Address</label>
                    <input 
                      type="email" 
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-[#F5F3EF] border border-[#EAE7E0] rounded-xl px-4 py-3 text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#2C3E2D]" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-[#F5F3EF] border border-[#EAE7E0] rounded-xl px-4 py-3 text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#2C3E2D]" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Bio (Optional)</label>
                    <textarea 
                      rows={3} 
                      defaultValue="Avid marketplace buyer and seller based in the PNW. Interested in sustainable goods and local crafts."
                      className="w-full bg-[#F5F3EF] border border-[#EAE7E0] rounded-xl px-4 py-3 text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#2C3E2D] resize-none" 
                    />
                  </div>
                </div>
              </div>

              {/* Saved Addresses Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EAE7E0] mt-2">
                 <div className="flex items-start justify-between mb-6 border-b border-[#EAE7E0] pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900 mb-1">Saved Addresses</h2>
                    <p className="text-sm text-stone-500 font-medium">Manage your shipping and billing addresses.</p>
                  </div>
                  <button className="px-5 py-2 rounded-lg text-sm font-bold text-stone-700 bg-white hover:bg-[#F5F3EF] shadow-sm flex items-center gap-2 transition-colors border border-[#EAE7E0]">
                    <Plus className="w-4 h-4 text-stone-500" />
                    Add New
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Address Card 1 */}
                  <div className="border-2 border-[#2C3E2D] bg-[#E5F0E6] rounded-xl p-4 relative group">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-[#2C3E2D] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">Default Shipping</span>
                      <span className="font-bold text-sm text-stone-900">Home</span>
                    </div>
                    <p className="text-sm font-bold text-stone-900 mb-1">{displayUsername}</p>
                    <p className="text-sm text-stone-600 mb-1 leading-relaxed">
                      123 Pine Street, Apt 4B<br/>
                      Seattle, WA 98101<br/>
                      United States
                    </p>
                    
                    <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                       <button className="p-1.5 text-stone-400 hover:text-[#2C3E2D] hover:bg-white rounded-lg transition-colors shadow-sm"><Edit2 className="w-4 h-4" /></button>
                       <button className="p-1.5 text-stone-400 hover:text-[#C85D4E] hover:bg-white rounded-lg transition-colors shadow-sm"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {/* Address Card 2 */}
                  <div className="border border-[#EAE7E0] bg-white hover:border-[#2C3E2D]/30 hover:bg-[#F5F3EF] transition-colors rounded-xl p-4 relative group shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-sm text-stone-900">Office</span>
                    </div>
                    <p className="text-sm font-bold text-stone-900 mb-1">{displayUsername}</p>
                    <p className="text-sm text-stone-600 mb-1 leading-relaxed">
                      450 Tech Blvd, Floor 12<br/>
                      Bellevue, WA 98004<br/>
                      United States
                    </p>

                    <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                       <button className="p-1.5 text-stone-400 hover:text-[#2C3E2D] hover:bg-white rounded-lg transition-colors shadow-sm"><Edit2 className="w-4 h-4" /></button>
                       <button className="p-1.5 text-stone-400 hover:text-[#C85D4E] hover:bg-white rounded-lg transition-colors shadow-sm"><Trash2 className="w-4 h-4" /></button>
                    </div>
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