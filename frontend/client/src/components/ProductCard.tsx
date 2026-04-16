import React from 'react';
import { Package } from 'lucide-react';
import { Button } from './ui/Button';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  stockCount: number;
  onAddToCart?: () => void;
}

export function ProductCard({ id, name, price, stockCount, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Product Image Placeholder */}
      <div className="w-full h-48 bg-slate-100 rounded-xl flex items-center justify-center">
        <Package className="w-12 h-12 text-slate-400" />
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-grow">
        <h3 className="text-xl font-medium text-slate-900 mb-1">{name}</h3>
        <p className="text-2xl font-bold text-secondary mb-2">${price.toFixed(2)}</p>
        
        <p className="text-sm text-slate-500 mb-4 font-light">
          {stockCount > 0 ? `${stockCount} in stock` : 'Out of stock'}
        </p>

        {/* Using our new Button component! */}
        <div className="mt-auto pt-2 border-t border-slate-100">
          <Button 
            variant="primary" 
            className="w-full" 
            onClick={onAddToCart}
            disabled={stockCount === 0}
          >
            {stockCount > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </div>
    </div>
  );
}