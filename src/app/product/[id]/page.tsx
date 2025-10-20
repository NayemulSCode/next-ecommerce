"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Star,
  Heart,
  Share2,
  Truck,
  Shield,
  RefreshCw,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore } from "@/store/cart";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

// Mock product data - in real app, fetch from API based on id
const mockProduct = {
  id: "1",
  name: "Premium Wireless Headphones",
  slug: "premium-wireless-headphones",
  description:
    "Experience premium sound quality with our latest wireless headphones. Featuring advanced noise cancellation, 30-hour battery life, and superior comfort for all-day wear.",
  shortDesc: "Premium wireless headphones with noise cancellation",
  price: 79.99,
  comparePrice: 129.99,
  sku: "WH-001",
  stock: 15,
  category: "Electronics",
  rating: 4.5,
  reviews: 234,
  images: ["/api/placeholder/600/600", "/api/placeholder/600/600"],
  features: [
    "Active Noise Cancellation",
    "30-hour battery life",
    "Bluetooth 5.0",
    "Premium comfort padding",
    "Built-in microphone",
    "Foldable design",
  ],
  specifications: {
    Brand: "AudioTech",
    Model: "WH-001",
    Color: "Black",
    Weight: "250g",
    "Battery Life": "30 hours",
    "Charging Time": "2 hours",
    Connectivity: "Bluetooth 5.0, 3.5mm jack",
    Warranty: "2 years",
  },
};

const mockReviews = [
  {
    id: "1",
    author: "John D.",
    rating: 5,
    date: "2024-01-15",
    title: "Excellent sound quality",
    content:
      "These headphones exceeded my expectations. The noise cancellation is incredible and the battery life is amazing.",
  },
  {
    id: "2",
    author: "Sarah M.",
    rating: 4,
    date: "2024-01-10",
    title: "Great value for money",
    content:
      "Really good headphones for the price. Comfortable to wear for long periods and the sound quality is clear.",
  },
];

export default function ProductPage() {
  const params = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem, isInCart } = useCartStore();

  const product = mockProduct; // In real app: fetch product based on params.id
  const inCart = isInCart(product.id);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity,
      sku: product.sku,
      stock: product.stock,
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "fill-gray-200 text-gray-200"
        }`}
      />
    ));
  };

  const discount = product.comparePrice
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100
      )
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link
            href={`/category/${product.category.toLowerCase()}`}
            className="hover:text-foreground"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Product Image</span>
                </div>
                {discount > 0 && (
                  <Badge className="absolute top-4 left-4 bg-green-500 hover:bg-green-600">
                    -{discount}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="flex space-x-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">
                      Img {index + 1}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-muted-foreground">{product.shortDesc}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {renderStars(product.rating)}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviews} reviews)
              </span>
              <Link
                href="#reviews"
                className="text-sm text-primary hover:underline"
              >
                See all reviews
              </Link>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-primary">
                ${product.price}
              </span>
              {product.comparePrice && (
                <span className="text-xl text-muted-foreground line-through">
                  ${product.comparePrice}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {product.stock > 0 ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600">
                    {product.stock} in stock - Ready to ship
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1"
                  size="lg"
                >
                  {inCart ? "✓ Added to Cart" : "Add to Cart"}
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-sm">Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm">2 Year Warranty</span>
              </div>
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                <span className="text-sm">30-Day Returns</span>
              </div>
            </div>

            <Separator />

            {/* Key Features */}
            <div>
              <h3 className="font-semibold mb-3">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="max-w-4xl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-2 border-b"
                      >
                        <span className="font-medium">{key}</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6" id="reviews">
            <div className="space-y-6">
              {/* Review Summary */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-3xl font-bold">
                          {product.rating}
                        </span>
                        <div className="flex">
                          {renderStars(product.rating)}
                        </div>
                      </div>
                      <p className="text-muted-foreground">
                        Based on {product.reviews} reviews
                      </p>
                    </div>
                    <Button>Write a Review</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Reviews */}
              {mockReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-semibold">{review.author}</div>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {review.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <h4 className="font-medium mb-2">{review.title}</h4>
                    <p className="text-muted-foreground">{review.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
