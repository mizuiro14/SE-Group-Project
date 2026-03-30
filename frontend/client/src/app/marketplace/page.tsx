// 1. Define the Item type to make the strategies strongly typed
type BarleyItem = {
  id: number;
  name: string;
  price: string;
  user: string;
};

const BARLEY_ITEMS: BarleyItem[] = [
  { id: 1, name: "Pearl Barley", price: "$4.99/lb", user: "From: user5323535" },
  { id: 2, name: "Hulled Barley", price: "$5.49/lb", user: "From: user6434646" },
  { id: 3, name: "Barley Flakes", price: "$6.99/lb", user: "From: user7545757" },
  { id: 4, name: "Barley Flour", price: "$7.25/lb", user: "From: user8656868" },
  { id: 5, name: "Barley Grits", price: "$5.99/lb", user: "From: user9767976" },
  { id: 6, name: "Black Barley", price: "$8.50/lb", user: "From: user10871087" },
];

// 2. Define the Strategy Type
type FilterStrategy = (items: BarleyItem[], query: string) => BarleyItem[];

// 3. Create a registry of specific strategies
const filterStrategies: Record<string, FilterStrategy> = {
  // Strategy for text search (your original logic)
  textSearch: (items, query) => 
    items.filter(
      (item) => 
        item.name.toLowerCase().includes(query) || 
        item.user.toLowerCase().includes(query)
    ),
  // Example of another strategy you could easily add later
  exactNameMatch: (items, query) => 
    items.filter((item) => item.name.toLowerCase() === query),
  // Strategy for when there is no search query
  noFilter: (items) => items,
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q?.toLowerCase() || '';
  
  // 4. Determine which strategy to use
  // We use the 'textSearch' strategy if the user typed something, otherwise 'noFilter'
  const activeStrategy = query ? filterStrategies.textSearch : filterStrategies.noFilter;
  
  // 5. Execute the selected strategy
  const filteredItems = activeStrategy(BARLEY_ITEMS, query);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Barley Marketplace</h1>
        
        {query && (
          <p className="mb-6 text-gray-600">
            Showing results for <span className="font-semibold">"{query}"</span>
          </p>
        )}

        {filteredItems.length === 0 ? (
          <p className="text-gray-500">No items found matching your search.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
               <div key={item.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                 <h2 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h2>
                 <p className="text-gray-600 mb-4 h-16 line-clamp-2">{item.user}</p>
                 <div className="flex items-center justify-between mt-auto">
                   <span className="font-bold text-lg text-gray-900">{item.price}</span>
                   <button className="px-4 py-2 text-sm font-semibold text-white bg-brand-secondary rounded hover:bg-brand-tertiary transition-colors">
                     Add to Cart
                   </button>
                 </div>
               </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}