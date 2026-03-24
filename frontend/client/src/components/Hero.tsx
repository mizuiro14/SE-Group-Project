import Link from "next/link";

export default function Hero() {
  return (
    <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden bg-[--background]">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8">
          Build faster with <br />
          <span className="text-brand-secondary">Skeleton UI</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-900 mb-10">
          The perfect starting point for your next big project. 
          Clean, modern, and ready to scale.
        </p>
        <div className="flex justify-center gap-4">
          <button className="px-8 py-4 text-lg font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all">
            Get Started
          </button>
          <button className="px-8 py-4 text-lg font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}