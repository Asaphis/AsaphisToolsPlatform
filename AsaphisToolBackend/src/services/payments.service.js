import { PAYMENTS } from '../config/payments.js';
import { supabase } from '../config/supabase.js';

let StripeClient = null;
try {
  if (PAYMENTS.stripe?.secretKey) {
    const Stripe = (await import('stripe')).default;
    StripeClient = new Stripe(PAYMENTS.stripe.secretKey, { apiVersion: '2022-11-15' });
  }
} catch (e) {
  // stripe not installed or not configured - will fall back to mock
  console.warn('Stripe SDK not initialized:', e?.message || e);
}

// NOTE: These functions are scaffolds. For production integrate the real SDKs:
// - Stripe: npm i stripe, use Stripe(paymentKey).paymentIntents.create(...)
// - Flutterwave: use their SDK or API
// - Binance/Bybit: typically use exchange/payment checkout or third-party checkout (Coinify/CoinPayments/Coinbase Commerce)

export async function createStripePaymentIntent({ amount, currency = PAYMENTS.defaultCurrency, metadata = {} }) {
  // If Stripe client available, create real PaymentIntent
  if (StripeClient) {
    const intent = await StripeClient.paymentIntents.create({
      amount: Math.max(1, Math.round(amount)), // amount in cents expected by caller
      currency: (currency || PAYMENTS.defaultCurrency).toLowerCase(),
      metadata
    });
    return { provider: 'stripe', client_secret: intent.client_secret, intentId: intent.id };
  }

  // Fallback mock
  return {
    provider: 'stripe',
    mode: 'mock',
    client_secret: `pi_mock_${Date.now()}`,
    checkout_url: `/api/${process.env.API_VERSION || 'v1'}/payments/checkout/mock`
  };
}

export async function createCryptoCharge({ amount, currency = PAYMENTS.defaultCurrency, provider = 'binance', metadata = {} }) {
  // For crypto, many platforms use Coinbase Commerce / CoinPayments / third-party checkout.
  // Binance/Bybit do not provide simple one-click hosted checkout like Coinbase Commerce.
  // We'll return a placeholder 'charge' that the frontend can use to redirect to an external checkout if configured.

  const id = `c_${Date.now().toString(36)}`;
  // Store a pending donation/charge in DB (optional, controller handles donations table)

  return {
    provider,
    chargeId: id,
    status: 'pending',
    checkout_url: `/api/${process.env.API_VERSION || 'v1'}/payments/checkout/crypto/${id}`
  };
}

export async function verifyWebhookEvent(provider, payload, signature) {
  if (provider === 'stripe') {
    try {
      const secret = process.env.STRIPE_WEBHOOK_SECRET || PAYMENTS.stripe?.webhookSecret;
      if (!StripeClient || !secret) return { valid: false };
      const event = StripeClient.webhooks.constructEvent(payload, signature, secret);
      return { valid: true, parsed: event };
    } catch (err) {
      console.error('Stripe webhook verification failed', err?.message || err);
      return { valid: false };
    }
  }

  // Coinbase/other: skip verification unless implemented
  return { valid: true, parsed: payload };
}

export async function recordRevenue({ amount, currency = PAYMENTS.defaultCurrency, source = 'donation', meta = {} }) {
  // Record into revenue table using supabase
  const date = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('revenue')
    .insert([{ date, amount, currency, source, meta }])
    .select()
    .single();

  if (error) {
    console.error('recordRevenue error', error);
    throw error;
  }

  return data;
}
