"use client"; // Required to use state and event handlers

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // NOTE: Replace the URL with your actual backend URL (e.g., http://localhost:3000/api/auth/signup)
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error("Server returned an invalid response. Is the backend running?");
      } 

      if (!res.ok) throw new Error(data.error || "Failed to sign up");

      // Redirect to login after successful signup
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
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border border-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Create Account</h1>
        
        {error && <p className="text-red-500 text-sm md-4 text-center">{error}</p>}
        
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input 
              type="text" 
              required
              placeholder="John Doe" 
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-brand-primary outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              required
              placeholder="name@example.com" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-brand-primary outline-none transition-all"
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
              className="border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-brand-primary outline-none transition-all"
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