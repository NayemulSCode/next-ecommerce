"use client";

import Link from "next/link";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
  stock: number;
  sku: string;
  category: string;
}

interface ProductGridProps {
  title: string;
  products?: Product[];
  viewAllLink?: string;
}

const mockProducts: Product[] = [
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
  {
    id: "3",
    name: "Smart Home Security Camera",
    price: 89.99,
    comparePrice: 129.99,
    image: "/api/placeholder/300/300",
    rating: 4.7,
    reviews: 203,
    badge: "NEW",
    stock: 12,
    sku: "SC-001",
    category: "Electronics",
  },
  {
    id: "4",
    name: "Stainless Steel Water Bottle",
    price: 19.99,
    image: "/api/placeholder/300/300",
    rating: 4.4,
    reviews: 156,
    stock: 100,
    sku: "WB-001",
    category: "Home & Garden",
  },
  {
    id: "5",
    name: "Yoga Mat Premium",
    price: 34.99,
    comparePrice: 49.99,
    image: "/api/placeholder/300/300",
    rating: 4.8,
    reviews: 92,
    stock: 30,
    sku: "YM-001",
    category: "Sports",
  },
  {
    id: "6",
    name: "LED Desk Lamp",
    price: 39.99,
    image: "/api/placeholder/300/300",
    rating: 4.2,
    reviews: 67,
    stock: 0,
    sku: "DL-001",
    category: "Home & Garden",
  },
  {
    id: "7",
    name: "Running Shoes Sport",
    price: 79.99,
    comparePrice: 119.99,
    image: "/api/placeholder/300/300",
    rating: 4.5,
    reviews: 234,
    badge: "SALE",
    stock: 18,
    sku: "RS-001",
    category: "Fashion",
  },
  {
    id: "8",
    name: "Coffee Maker Deluxe",
    price: 129.99,
    image: "/api/placeholder/300/300",
    rating: 4.6,
    reviews: 178,
    stock: 8,
    sku: "CM-001",
    category: "Kitchen",
  },
];

export function ProductGrid({
  title,
  products = mockProducts,
  viewAllLink,
}: ProductGridProps) {
  const { addItem, isInCart } = useCartStore();

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      sku: product.sku,
      stock: product.stock,
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-3 w-3",
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "fill-gray-200 text-gray-200"
        )}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="text-primary hover:text-primary/80 font-medium text-sm"
          >
            View All →
          </Link>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const inCart = isInCart(product.id);
          const discount = product.comparePrice
            ? Math.round(
                ((product.comparePrice - product.price) /
                  product.comparePrice) *
                  100
              )
            : 0;

          return (
            <Card
              key={product.id}
              className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="relative">
                  <Link href={`/product/${product.id}`}>
                    <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">
                          Product Image
                        </span>
                      </div>

                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.badge && (
                          <Badge
                            variant={
                              product.badge === "NEW"
                                ? "default"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {product.badge}
                          </Badge>
                        )}
                        {discount > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-500 hover:bg-green-600"
                          >
                            -{discount}%
                          </Badge>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-white/90 hover:bg-white"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-3">
                  {/* Category */}
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    {product.category}
                  </div>

                  {/* Product Name */}
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors min-h-[2.5rem]">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({product.reviews})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-primary">
                      ${product.price}
                    </span>
                    {product.comparePrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.comparePrice}
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="text-xs">
                    {product.stock > 0 ? (
                      <span className="text-green-600">
                        {product.stock} in stock
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0 || inCart}
                    className={cn(
                      "w-full",
                      inCart && "bg-green-600 hover:bg-green-700"
                    )}
                  >
                    {inCart ? (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        In Cart
                      </>
                    ) : product.stock === 0 ? (
                      "Out of Stock"
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
