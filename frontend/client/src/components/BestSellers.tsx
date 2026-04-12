import React from "react";
import { Package, Zap, Truck } from "lucide-react";

export default function BestSellers() {
  return (
    <section className="relative w-full bg-foreground py-24 px-6 md:px-12 lg:px-24 overflow-hidden text-white font-sans">
      
      {/* Faint Background Grid Lines */}
      <div className="absolute inset-0 grid grid-cols-4 pointer-events-none z-0">
        <div className="border-r border-black/5 h-full"></div>
        <div className="border-r border-black/5 h-full"></div>
        <div className="border-r border-black/5 h-full"></div>
        <div className="border-r border-transparent h-full"></div>
      </div>

      <div className="relative max-w-6xl mx-auto z-10">
        {/* Header Section */}
        <div className="max-w-2xl mb-16">
          <h2 
            className="text-4xl md:text-5xl lg:text-[56px] font-medium mb-6 leading-[1.1] tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Simple Steps to a Better Experience
          </h2>
          <p className="text-lg md:text-xl text-white/90 font-light max-w-xl">
            Our platform streamlines your daily commerce needs. Just sign up, customize
            your tracking, and let us handle the rest.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Card 1 */}
          <div className="bg-background border border-[#A6C068]/50 rounded-2xl p-8 flex flex-col gap-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-[#8EAD45]" />
            </div>
            <div>
              <h3 
                className="text-black text-xl md:text-2xl mb-3 font-medium" 
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Smart Stock Tracking
              </h3>
              <p className="text-black text-sm md:text-base leading-relaxed font-light">
                Real-time alerts and inventory management right
                from your dashboard. Never run out of essentials.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-background border border-[#A6C068]/50 rounded-2xl p-8 flex flex-col gap-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-[#8EAD45]" fill="currentColor" />
            </div>
            <div>
              <h3 
                className="text-black text-xl md:text-2xl mb-3 font-medium" 
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Priority Processing
              </h3>
              <p className="text-black text-sm md:text-base leading-relaxed font-light">
                Members jump the queue. Your orders are picked,
                packed, and processed before standard users.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-background border border-[#A6C068]/50 rounded-2xl p-8 flex flex-col gap-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#8EAD45]" fill="currentColor" />
            </div>
            <div>
              <h3 
                className="text-black text-xl md:text-2xl mb-3 font-medium" 
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                White-Glove Delivery
              </h3>
              <p className="text-black text-sm md:text-base leading-relaxed font-light">
                Scheduled, precise delivery windows with real-time
                driver tracking and secure drop-offs.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}