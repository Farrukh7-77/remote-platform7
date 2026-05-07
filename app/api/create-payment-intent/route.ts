// app/api/create-payment-intent/route.ts
import { NextResponse } from "next/server";

const stripeSecretKey = "sk_test_..."; // Siz Stripe-dən alacaqsınız

export async function POST() {
  try {
    // Stripe ilə əlaqə üçün sadə mock cavabı
    // Real Stripe üçün: const stripe = require('stripe')(stripeSecretKey);
    // const paymentIntent = await stripe.paymentIntents.create({ amount: 1999, currency: "usd" });
    
    // Hal-hazırda test məqsədli mock cavab:
    return NextResponse.json({
      clientSecret: "mock_secret_" + Date.now(),
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: "Payment failed" },
      { status: 500 }
    );
  }
}