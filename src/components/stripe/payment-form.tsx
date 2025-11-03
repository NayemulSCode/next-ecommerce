"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentFormProps {
  clientSecret: string;
  orderData: any;
  onPaymentSuccess: (order: any) => void;
  onPaymentError: (error: string) => void;
}

function PaymentFormContent({
  clientSecret,
  orderData,
  onPaymentSuccess,
  onPaymentError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      // ✅ Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        // Payment failed
        setMessage(error.message || "An unexpected error occurred.");
        onPaymentError(error.message || "Payment failed");
        setIsLoading(false);
        return;
      }

      // ✅ Payment successful - Now create the order
      if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log("✅ Payment succeeded:", paymentIntent.id);

        const response = await fetch("/api/stripe/confirm-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id, // ✅ Now we have the ID!
            orderData,
          }),
        });

        const result = await response.json();

        if (result.success) {
          setMessage("Payment successful! Redirecting...");
          onPaymentSuccess(result.order);
        } else {
          setMessage(result.error || "Failed to create order");
          onPaymentError(result.error || "Failed to create order");
        }
      }
    } catch (err) {
      console.error("Payment error:", err);
      setMessage("Failed to process payment");
      onPaymentError("Failed to process payment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PaymentElement id="payment-element" />

          {message && (
            <Alert
              variant={
                message.includes("successful") ? "default" : "destructive"
              }
            >
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Button
            disabled={isLoading || !stripe || !elements}
            type="submit"
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              `Pay $${orderData.total.toFixed(2)}`
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Your payment is secured by Stripe
          </p>
        </CardContent>
      </Card>
    </form>
  );
}

export function PaymentForm({
  clientSecret,
  orderData,
  onPaymentSuccess,
  onPaymentError,
}: PaymentFormProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#2563eb",
        colorBackground: "#ffffff",
        colorText: "#1f2937",
        colorDanger: "#dc2626",
        fontFamily: "system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentFormContent
        clientSecret={clientSecret}
        orderData={orderData}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
}
