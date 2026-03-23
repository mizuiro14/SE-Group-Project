const BARLEY_ITEMS = [
  { id: 1, name: "Pearl Barley", price: "$4.99/lb", description: "Polished barley with the bran partially removed. Great for soups!" },
  { id: 2, name: "Hulled Barley", price: "$5.49/lb", description: "Whole grain barley with only the tough inedible outer hull removed." },
  { id: 3, name: "Barley Flakes", price: "$6.99/lb", description: "Rolled and flattened barley grain, perfect for hot cereal or baking." },
  { id: 4, name: "Barley Flour", price: "$7.25/lb", description: "Finely milled barley, great for adding a sweet, nutty flavor to baked goods." },
  { id: 5, name: "Barley Grits", price: "$5.99/lb", description: "Toasted and cracked barley kernels for quick cooking." },
  { id: 6, name: "Black Barley", price: "$8.50/lb", description: "An heirloom variety that retains its striking dark color when cooked." },
];

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Barley Marketplace</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BARLEY_ITEMS.map((item) => (
             <div key={item.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
               <h2 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h2>
               <p className="text-gray-600 mb-4 h-16">{item.description}</p>
               <div className="flex items-center justify-between mt-auto">
                 <span className="font-bold text-lg text-gray-900">{item.price}</span>
                 <button className="px-4 py-2 text-sm font-semibold text-white bg-brand-secondary bg-blue-600 rounded hover:bg-blue-700">
                   Add to Cart
                 </button>
               </div>
             </div>
          ))}
        </div>
      </main>
    </div>
  );
}