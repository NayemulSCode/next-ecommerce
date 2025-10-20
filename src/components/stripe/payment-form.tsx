"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

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

  useEffect(() => {
    if (!stripe) return;

    const clientSecretParam = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (clientSecretParam) {
      stripe
        .retrievePaymentIntent(clientSecretParam)
        .then(({ paymentIntent }) => {
          switch (paymentIntent?.status) {
            case "succeeded":
              setMessage("Payment succeeded!");
              break;
            case "processing":
              setMessage("Your payment is processing.");
              break;
            case "requires_payment_method":
              setMessage("Your payment was not successful, please try again.");
              break;
            default:
              setMessage("Something went wrong.");
              break;
          }
        });
    }
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
      },
      redirect: "if_required",
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An unexpected error occurred.");
      } else {
        setMessage("An unexpected error occurred.");
      }
      onPaymentError(error.message || "Payment failed");
    } else {
      // Payment successful, create order
      try {
        const response = await fetch("/api/stripe/confirm-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentIntentId:
              elements.getElement(PaymentElement)?.__private
                ?.lastPaymentIntentId,
            orderData,
          }),
        });

        const result = await response.json();

        if (result.success) {
          onPaymentSuccess(result.order);
        } else {
          setMessage(result.error || "Failed to create order");
          onPaymentError(result.error || "Failed to create order");
        }
      } catch (error) {
        setMessage("Failed to process order");
        onPaymentError("Failed to process order");
      }
    }

    setIsLoading(false);
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
                message.includes("succeeded") ? "default" : "destructive"
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
                Processing...
              </>
            ) : (
              `Pay $${orderData.total}`
            )}
          </Button>
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
        colorPrimary: "#0570de",
        colorBackground: "#ffffff",
        colorText: "#30313d",
        colorDanger: "#df1b41",
        fontFamily: "system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "6px",
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
