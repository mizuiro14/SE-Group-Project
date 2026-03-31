"use client"; 

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  
  // Added role (buyer/seller) to state
  const [formData, setFormData] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    contact: "", 
    role: "buyer", // default to buyer
    branch: "" 
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // If they switch back to buyer before submitting, clear the branch
    const submissionData = { ...formData };
    if (submissionData.role === 'buyer') {
      submissionData.branch = "";
    }

    try {
      // NOTE: Replace the URL with your actual backend URL
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error("Server returned an invalid response. Is the backend running?");
      } 

      if (!res.ok) throw new Error(data.error || "Failed to sign up");

      alert("Signup successful! Please log in.");
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-900">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border border-gray-100 mt-10 mb-10">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Create Account</h1>
        
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          
          {/* Role Selection (Radio Buttons) */}
          <div className="flex flex-col gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">I want to register as a:</span>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                <input 
                  type="radio" 
                  name="role" 
                  value="buyer"
                  checked={formData.role === "buyer"}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                />
                Buyer
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                <input 
                  type="radio" 
                  name="role" 
                  value="seller"
                  checked={formData.role === "seller"}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                />
                Seller
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input 
              type="text" 
              required
              placeholder="John Doe" 
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-brand-primary outline-none transition-all text-black"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Contact Number</label>
            <input 
              type="tel" 
              required
              placeholder="e.g., +63 912 345 6789" 
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-brand-primary outline-none transition-all text-black"
            />
          </div>

          {/* Conditional Branch Field - Only shows if Role is Seller */}
          {formData.role === "seller" && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Branch <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                required={formData.role === "seller"} 
                placeholder="e.g., Jaro, Iloilo" 
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-brand-primary outline-none transition-all text-black"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              required
              placeholder="name@example.com" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-brand-primary outline-none transition-all text-black"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              required
              placeholder="Create a password" 
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-brand-primary outline-none transition-all text-black"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="bg-brand-primary text-white p-2.5 rounded-md hover:bg-brand-secondary font-medium transition-colors mt-2 shadow-lg disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-primary hover:underline font-medium">Log in here</Link>
        </div>
      </div>
    </div>
  );
}