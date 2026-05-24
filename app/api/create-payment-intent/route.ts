// app/api/create-payment-intent/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { days, jobId } = await request.json();
    
    // Qiymətlər (sentyabrlarla)
    const prices: Record<number, number> = {
      7: 999,   // 7 gün = $9.99
      14: 1499, // 14 gün = $14.99
      30: 2499, // 30 gün = $24.99
    };
    
    const amount = prices[days];
    if (!amount) {
      return NextResponse.json({ error: "Invalid days" }, { status: 400 });
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: { jobId: jobId.toString(), days: days.toString() },
    });
    
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Payment intent error:", error);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}