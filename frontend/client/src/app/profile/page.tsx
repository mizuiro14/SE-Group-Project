'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // 1. Fetch user from the backend /me endpoint using the secure cookie
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          credentials: "include", // <-- IMPORTANT: Sends the HTTP-only cookie
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // If the cookie is missing or invalid, boot them back to login
          router.push('/login'); 
        }
      } catch (err) {
        console.error("Error fetching user data", err);
      }
    };

    fetchUser();
  }, [router]);

  // Dummy data to replicate the wireframe grid
  const itemsSelling = Array(6).fill("insert product name");

  // Extract variables for cleaner JSX safely (wait until user loads)
  if (!user) return <div className="text-center pt-20">Loading profile...</div>;

  const username = user?.user_metadata?.username || 'Guest User';
  const userRole = user?.user_metadata?.role || 'buyer'; // default to buyer if missing
  const contact = user?.user_metadata?.contact || 'No contact provided';
  const branch = user?.user_metadata?.branch; // Optional

  return (
    <div className="min-h-screen bg-[#eaf5e0] text-black pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* User Profile Info */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-4xl font-semibold">User profile</h1>
              {/* Role Tag */}
              <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm uppercase tracking-wide border 
                ${userRole === 'seller' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
                {userRole}
              </span>
            </div>

            <div className="flex items-start gap-4">
              {/* Placeholder for Profile Picture */}
              <div className="w-32 h-32 bg-gray-300 flex items-center justify-center text-center text-sm font-medium text-gray-600 rounded-lg shrink-0">
                insert user<br/>IMG
              </div>
              
              <div className="flex flex-col gap-1 text-lg">
                <p><span className="font-semibold">Name:</span> {username}</p>
                <p><span className="font-semibold">Contact:</span> {contact}</p>
                
                {/* Dynamically show branch only if it exists/user is a seller */}
                {userRole === 'seller' && branch && (
                  <p><span className="font-semibold">Branch:</span> {branch}</p>
                )}

                <button className="mt-2 text-white bg-gray-600 hover:bg-gray-700 w-32 py-2 text-lg font-medium transition-colors rounded-sm">
                  Chat
                </button>
              </div>
            </div>
          </div>

          {/* User Overall Rating (Only show for Sellers) */}
          {userRole === 'seller' && (
            <div className="flex flex-col items-center pt-2">
              <h2 className="text-3xl font-medium mb-4">User Overall Rating</h2>
              <div className="flex gap-2 text-5xl">
                {/* Yellow Stars */}
                <span className="text-yellow-400">★</span>
                <span className="text-yellow-400">★</span>
                <span className="text-yellow-400">★</span>
                <span className="text-yellow-400">★</span>
                {/* Gray Star */}
                <span className="text-gray-400">★</span>
              </div>
            </div>
          )}
        </div>

        {/* Items Selling Section (Only show if User is a Seller) */}
        {userRole === 'seller' && (
          <div className="mt-16">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-3xl font-medium">Items Selling</h2>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-all">
                + Add an Item
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
              {itemsSelling.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center w-full">
                  <div className="w-full h-48 bg-gray-300 flex items-center justify-center text-gray-500 mb-3 rounded-sm shadow-sm">
                    {idx >= 3 ? 'insert IMG' : ''}
                  </div>
                  <p className="text-center text-sm font-medium">
                    {val}<br />
                    from {username}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}