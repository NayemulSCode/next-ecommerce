import { loadStripe } from "@stripe/stripe-js";

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export const getStripe = async () => {
  const stripe = await stripePromise;
  if (!stripe) throw new Error("Stripe failed to initialize.");
  return stripe;
};
