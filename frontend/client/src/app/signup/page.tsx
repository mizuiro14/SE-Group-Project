"use client"; 

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    contact: "", 
    role: "buyer", 
    branch: "" 
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
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

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
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

      // Show success modal instead of native alert
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccess(false);
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-900">
      
      {/* Error Modal Overlay */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-red-50/50">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-500 w-5 h-5" />
                <h3 className="font-bold text-red-900">Signup Failed</h3>
              </div>
              <button 
                onClick={() => setError("")} 
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-gray-600 text-sm">{error}</p>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <Button 
                variant="secondary"
                onClick={() => setError("")}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal Overlay */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-green-50/50">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-green-500 w-5 h-5" />
                <h3 className="font-bold text-green-900">Account Created</h3>
              </div>
              <button 
                onClick={handleSuccessClose} 
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-gray-600 text-sm">Signup successful! You can now log in to your account.</p>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <Button 
                variant="primary"
                onClick={handleSuccessClose}
              >
                Proceed to Login
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border border-gray-100 my-10">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Create Account</h1>
        
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
              className="border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-[#8EAD45] outline-none transition-all text-black"
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
              className="border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-[#8EAD45] outline-none transition-all text-black"
            />
          </div>

          {/* Conditional Branch Field - Only shows if Role is Seller */}
          {formData.role === "seller" && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Location <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                required={formData.role === "seller"} 
                placeholder="e.g., Jaro, Iloilo" 
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-[#8EAD45] outline-none transition-all text-black"
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
              className="border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-[#8EAD45] outline-none transition-all text-black"
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
              className="border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-[#8EAD45] outline-none transition-all text-black"
            />
          </div>

          <Button 
            type="submit" 
            variant="secondary"
            disabled={loading}
            className="mt-2 shadow-lg w-full py-2.5"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-[#8EAD45] hover:underline font-medium">Log in here</Link>
        </div>
      </div>
    </div>
  );
}