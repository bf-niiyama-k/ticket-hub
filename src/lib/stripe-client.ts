import { loadStripe } from "@stripe/stripe-js";

// クライアントサイド用のStripe設定
let stripePromise: Promise<import('@stripe/stripe-js').Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY']!);
  }
  return stripePromise;
};
