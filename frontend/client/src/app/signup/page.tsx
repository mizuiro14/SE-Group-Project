import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-900">
      
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border border-gray-100">
        
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Create Account</h1>
        
        <form className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input 
              type="text" 
              placeholder="John Doe" 
              className="border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              className="border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              placeholder="Create a password" 
              className="border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
            />
          </div>

          <button className="bg-brand-primary text-white p-2.5 rounded-md hover:bg-brand-secondary font-medium transition-colors mt-2 shadow-lg shadow-brand-primary/20">
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-primary hover:underline font-medium">
            Log in here
          </Link>
        </div>
        
      </div>
    </div>
  );
}