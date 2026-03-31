import React from 'react'; // Added explicit import just in case, though not strictly needed in new Next.js

const products = [
  { id: 1, name: "Premium Widget", price: "$29.99", category: "Electronics" },
  { id: 2, name: "Deluxe Gadget", price: "$49.99", category: "Accessories" },
  { id: 3, name: "Super Tool", price: "$19.99", category: "Tools" },
  { id: 4, name: "Mega Pack", price: "$89.99", category: "Bundles" },
];

export default function BestSellers() {
  return (
    // Removed bg-gray-50, now using bg-transparent (implied) to show body background
    <section className="py-24 bg-(--foreground)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Changed text color to white or dark brand color for better contrast against green background */}
        <h2 className="text-3xl font-bold text-white mb-12 text-center">
          Best Sellers
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {products.map((product) => (
            <div key={product.id} className="group bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-white/20">
              {/* Skeleton Image Placeholder */}
              <div className="aspect-4/5 w-full bg-gray-100 rounded-xl mb-4 animate-pulse group-hover:bg-gray-200 transition-colors"></div>
              
              <div className="space-y-2">
                {/* Updated text colors to match brand */}
                <p className="text-xs font-semibold text-brand-primary uppercase tracking-wider">
                  {product.category}
                </p>
                <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xl font-bold text-brand-secondary">{product.price}</span>
                  <button className="p-2 rounded-full bg-gray-100 text-brand-secondary hover:bg-brand-primary hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}