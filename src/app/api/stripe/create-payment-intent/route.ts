// api/stripe/create-payment-intent/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

export async function POST(request: NextRequest) {
  try {
    const { items, shippingAddress } = await request.json();

    // Calculate amount
    const subtotal = items.reduce(
      (total: number, item: any) => total + item.price * item.quantity,
      0
    );
    const shipping = subtotal > 50 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    // Convert to cents for Stripe
    const amountInCents = Math.round(total * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        orderNumber: `ORD-${Date.now()}`,
        customerEmail: shippingAddress.email,
        items: JSON.stringify(
          items.map((item: any) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          }))
        ),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: total,
    });
  } catch (error) {
    console.error("Stripe payment intent error:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
