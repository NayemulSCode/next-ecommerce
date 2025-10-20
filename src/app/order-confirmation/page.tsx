"use client";

import Link from "next/link";
import { CheckCircle, Package, Truck, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

// Mock order data - in real app, this would come from the database
const mockOrder = {
  orderNumber: "ORD-2024-001234",
  status: "confirmed",
  estimatedDelivery: "2024-01-25",
  items: [
    {
      name: "Premium Wireless Headphones",
      quantity: 1,
      price: 79.99,
    },
    {
      name: "Smart Watch Pro",
      quantity: 2,
      price: 199.99,
    },
  ],
  subtotal: 479.97,
  shipping: 0,
  tax: 38.4,
  total: 518.37,
  shippingAddress: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, Apt 4B",
    city: "New York",
    province: "NY",
    postalCode: "10001",
    country: "United States",
  },
};

export default function OrderConfirmationPage() {
  const order = mockOrder;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your order has been successfully
              placed.
            </p>
            <Badge className="mt-4 bg-green-100 text-green-800 hover:bg-green-100">
              Order #{order.orderNumber}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Order Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Confirmed
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Estimated Delivery
                      </span>
                      <span className="font-medium">
                        {order.estimatedDelivery}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Payment Method
                      </span>
                      <span className="font-medium">Credit Card</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-3 border-b last:border-b-0"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <span className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{order.shippingAddress.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress.address}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.province}{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress.country}
                    </p>
                    <div className="pt-2 space-y-1">
                      <p className="text-sm text-muted-foreground">
                        <strong>Email:</strong> {order.shippingAddress.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Phone:</strong> {order.shippingAddress.phone}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Shipping</span>
                      {order.shipping === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        <span>${order.shipping.toFixed(2)}</span>
                      )}
                    </div>

                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${order.tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Email Confirmation */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        Email Confirmation
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      We've sent a confirmation email to{" "}
                      {order.shippingAddress.email} with your order details.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4">
                    <Button asChild className="w-full">
                      <Link href="/account/orders">
                        View Order Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/">Continue Shopping</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Next Steps */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium">Email Confirmation</h4>
                  <p className="text-sm text-muted-foreground">
                    Check your email for order confirmation and tracking
                    details.
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-medium">Order Processing</h4>
                  <p className="text-sm text-muted-foreground">
                    We'll prepare your items for shipping within 1-2 business
                    days.
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Truck className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium">Delivery</h4>
                  <p className="text-sm text-muted-foreground">
                    Your order will be delivered by {order.estimatedDelivery}.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
