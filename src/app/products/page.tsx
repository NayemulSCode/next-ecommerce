"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, Grid, List, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ProductGrid } from "@/components/home/product-grid";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

interface FilterOptions {
  categories: string[];
  priceRange: [number, number];
  rating: number;
  inStock: boolean;
  sortBy: string;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    priceRange: [0, 1000],
    rating: 0,
    inStock: false,
    sortBy: "featured",
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Mock categories
  const mockCategories = [
    { id: "1", name: "Electronics", count: 45 },
    { id: "2", name: "Fashion", count: 32 },
    { id: "3", name: "Home & Garden", count: 28 },
    { id: "4", name: "Sports", count: 19 },
    { id: "5", name: "Kitchen", count: 24 },
  ];

  // Mock products
  const mockProducts = [
    {
      id: "1",
      name: "Wireless Bluetooth Earbuds",
      price: 49.99,
      comparePrice: 79.99,
      image: "/api/placeholder/300/300",
      rating: 4.3,
      reviews: 128,
      badge: "BESTSELLER",
      stock: 25,
      sku: "BE-001",
      category: "Electronics",
    },
    {
      id: "2",
      name: "Organic Cotton T-Shirt",
      price: 24.99,
      image: "/api/placeholder/300/300",
      rating: 4.6,
      reviews: 89,
      stock: 50,
      sku: "TS-001",
      category: "Fashion",
    },
    // Add more products...
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchQuery, filters]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // In real app, fetch from API with filters
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProducts(mockProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // In real app, fetch from API
      setCategories(mockCategories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, category]
        : prev.categories.filter((c) => c !== category),
    }));
  };

  const handlePriceRangeChange = (value: number[]) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: [value[0], value[1]],
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 1000],
      rating: 0,
      inStock: false,
      sortBy: "featured",
    });
  };

  const activeFiltersCount =
    filters.categories.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000 ? 1 : 0) +
    (filters.rating > 0 ? 1 : 0) +
    (filters.inStock ? 1 : 0);

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category: any) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={filters.categories.includes(category.name)}
                onCheckedChange={(checked) =>
                  handleCategoryChange(category.name, checked as boolean)
                }
              />
              <label
                htmlFor={category.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
              >
                {category.name}
              </label>
              <span className="text-xs text-muted-foreground">
                ({category.count})
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-3">
          <Slider
            value={filters.priceRange}
            onValueChange={handlePriceRangeChange}
            max={1000}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div>
        <h3 className="font-semibold mb-3">Minimum Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.rating === rating}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({
                    ...prev,
                    rating: checked ? rating : 0,
                  }))
                }
              />
              <label
                htmlFor={`rating-${rating}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {rating}+ Stars
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Stock Status */}
      <div>
        <h3 className="font-semibold mb-3">Availability</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="inStock"
            checked={filters.inStock}
            onCheckedChange={(checked) =>
              setFilters((prev) => ({ ...prev, inStock: checked as boolean }))
            }
          />
          <label
            htmlFor="inStock"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            In Stock Only
          </label>
        </div>
      </div>

      <Separator />

      {/* Clear Filters */}
      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">All Products</h1>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <Select
                value={filters.sortBy}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, sortBy: value }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Filter */}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild className="sm:hidden">
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                      >
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="mt-6">
                    <FilterSidebar />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {filters.categories.map((category) => (
                <Badge key={category} variant="secondary" className="gap-1">
                  {category}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleCategoryChange(category, false)}
                  />
                </Badge>
              ))}
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
                <Badge variant="secondary" className="gap-1">
                  ${filters.priceRange[0]} - ${filters.priceRange[1]}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, priceRange: [0, 1000] }))
                    }
                  />
                </Badge>
              )}
              {filters.rating > 0 && (
                <Badge variant="secondary" className="gap-1">
                  {filters.rating}+ Stars
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, rating: 0 }))
                    }
                  />
                </Badge>
              )}
              {filters.inStock && (
                <Badge variant="secondary" className="gap-1">
                  In Stock
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, inStock: false }))
                    }
                  />
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar />
          </div>

          {/* Products */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-0">
                      <div className="h-48 bg-muted"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-muted rounded"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-6 bg-muted rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <ProductGrid title="" products={products} viewAllLink={null} />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
