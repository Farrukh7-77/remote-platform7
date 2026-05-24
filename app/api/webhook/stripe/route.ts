// app/api/webhook/stripe/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import pool from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature")!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { jobId, days } = paymentIntent.metadata;
    
    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + parseInt(days));
    
    await pool.query(
      `UPDATE jobs SET is_featured = true, featured_until = $1, stripe_payment_id = $2 WHERE id = $3`,
      [featuredUntil, paymentIntent.id, jobId]
    );
  }
  
  return NextResponse.json({ received: true });
}