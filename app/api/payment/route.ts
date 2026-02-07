import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getOrderByToken, updateOrder } from '@/lib/db';
import { PRICE_PLANS } from '@/lib/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, plan } = body;

    if (!token || !plan) {
      return NextResponse.json({ error: 'Token and plan required' }, { status: 400 });
    }

    const order = getOrderByToken(token);
    if (!order || order.status !== 'preview') {
      return NextResponse.json({ error: 'Invalid order' }, { status: 400 });
    }

    const pricePlan = PRICE_PLANS[plan as keyof typeof PRICE_PLANS];
    if (!pricePlan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Stripe Checkout 세션 생성
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'krw',
            product_data: {
              name: `HeartFrame ${pricePlan.name}`,
            },
            unit_amount: pricePlan.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/complete?token=${token}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/preview?token=${token}`,
      metadata: {
        order_token: token,
        plan,
      },
    });

    updateOrder(token, {
      price_plan: plan,
      stripe_session_id: session.id,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Payment session creation failed' }, { status: 500 });
  }
}

