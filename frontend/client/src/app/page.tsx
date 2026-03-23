import Hero from "@/components/Hero";
import BestSellers from "@/components/BestSellers";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <BestSellers />
    </main>
  );
}