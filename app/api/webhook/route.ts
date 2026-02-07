import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getOrderByToken, updateOrder } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const token = session.metadata?.order_token;

    if (token) {
      const order = getOrderByToken(token);
      if (order && order.status === 'preview') {
        updateOrder(token, {
          status: 'paid',
          paid_at: new Date().toISOString(),
        });
      }
    }
  }

  if (event.type === 'checkout.session.async_payment_failed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const token = session.metadata?.order_token;

    if (token) {
      updateOrder(token, { status: 'failed' });
    }
  }

  return NextResponse.json({ received: true });
}

