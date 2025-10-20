import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroBanner } from "@/components/home/hero-banner";
import { SponsoredProducts } from "@/components/home/sponsored-products";
import { ProductGrid } from "@/components/home/product-grid";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Banner */}
        <HeroBanner />

        {/* Sponsored Products */}
        <SponsoredProducts />

        {/* Featured Products */}
        <ProductGrid
          title="Featured Products"
          viewAllLink="/products/featured"
        />

        {/* New Arrivals */}
        <ProductGrid title="New Arrivals" viewAllLink="/products/new" />

        {/* Most Popular */}
        <ProductGrid title="Most Popular" viewAllLink="/products/popular" />

        {/* Recently Viewed - would be based on user history */}
        <ProductGrid title="Recently Viewed" viewAllLink="/products/recent" />
      </main>

      <Footer />
    </div>
  );
}
