"use client";

import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

interface SponsoredProduct {
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
}

const mockSponsoredProducts: SponsoredProduct[] = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 79.99,
    comparePrice: 129.99,
    image: "/api/placeholder/300/300",
    rating: 4.5,
    reviews: 234,
    badge: "SPONSORED",
    stock: 15,
    sku: "WH-001",
  },
  {
    id: "2",
    name: "Smart Watch Pro",
    price: 199.99,
    comparePrice: 299.99,
    image: "/api/placeholder/300/300",
    rating: 4.8,
    reviews: 512,
    badge: "SPONSORED",
    stock: 8,
    sku: "SW-002",
  },
];

export function SponsoredProducts() {
  const { addItem } = useCartStore();

  const handleAddToCart = (product: SponsoredProduct) => {
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
          "h-4 w-4",
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "fill-gray-200 text-gray-200"
        )}
      />
    ));
  };

  return (
    <div className="bg-muted/30 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Sponsored Products</h2>
        <Badge variant="secondary" className="text-xs">
          AD
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockSponsoredProducts.map((product) => (
          <Card
            key={product.id}
            className="group hover:shadow-lg transition-shadow duration-300"
          >
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Product Image */}
                <div className="relative w-full sm:w-32 h-32 sm:h-32 flex-shrink-0">
                  <Link href={`/product/${product.id}`}>
                    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">
                          Product Image
                        </span>
                      </div>
                      {product.badge && (
                        <Badge className="absolute top-2 left-2 text-xs bg-blue-500 hover:bg-blue-600">
                          {product.badge}
                        </Badge>
                      )}
                    </div>
                  </Link>
                </div>

                {/* Product Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        {renderStars(product.rating)}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {product.rating} ({product.reviews} reviews)
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl font-bold text-primary">
                        ${product.price}
                      </span>
                      {product.comparePrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.comparePrice}
                        </span>
                      )}
                      {product.comparePrice && (
                        <Badge variant="destructive" className="text-xs">
                          Save ${product.comparePrice - product.price}
                        </Badge>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="mb-3">
                      {product.stock > 0 ? (
                        <span className="text-sm text-green-600">
                          {product.stock} in stock
                        </span>
                      ) : (
                        <span className="text-sm text-red-600 font-medium">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full sm:w-auto"
                  >
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
