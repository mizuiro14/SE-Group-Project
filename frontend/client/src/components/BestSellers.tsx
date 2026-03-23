const products = [
  { id: 1, name: "Premium Widget", price: "$29.99", category: "Electronics" },
  { id: 2, name: "Deluxe Gadget", price: "$49.99", category: "Accessories" },
  { id: 3, name: "Super Tool", price: "$19.99", category: "Tools" },
  { id: 4, name: "Mega Pack", price: "$89.99", category: "Bundles" },
];

export default function BestSellers() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          Best Sellers
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {products.map((product) => (
            <div key={product.id} className="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300">
              {/* Skeleton Image Placeholder */}
              <div className="aspect-[4/5] w-full bg-gray-200 rounded-xl mb-4 animate-pulse group-hover:bg-gray-300 transition-colors"></div>
              
              <div className="space-y-2">
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  {product.category}
                </p>
                <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xl font-bold text-gray-900">{product.price}</span>
                  <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-indigo-600 hover:text-white transition-colors">
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