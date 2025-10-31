import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import * as paymentsService from '../services/payments.service.js';
import crypto from 'crypto';

// Helper: generate simple IDs (can use uuid on production)
const genId = () => crypto.randomBytes(6).toString('hex');

export const createDonation = async (req, res) => {
  try {
    const { amount, currency = 'USD', payment_method = 'card', metadata = {} } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const id = genId();
    const { data, error } = await supabase
      .from('donations')
      .insert([{ id, amount, currency, payment_method, status: 'pending', metadata }])
      .select()
      .single();

    if (error) throw error;

    // Create payment intent via payments service (mock or real depending on config)
    let paymentIntent;
    if (payment_method === 'crypto') {
      paymentIntent = await paymentsService.createCryptoCharge({ amount, currency, metadata: { donation_id: id, ...metadata } });
    } else {
      paymentIntent = await paymentsService.createStripePaymentIntent({ amount: Math.round(amount * 100), currency, metadata: { donation_id: id, ...metadata } });
    }

    res.status(201).json({ donation: data, paymentIntent });
  } catch (error) {
    console.error('createDonation error', error);
    throw new ApiError(500, 'Error creating donation');
  }
};

export const getDonations = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ donations: data });
  } catch (error) {
    console.error('getDonations error', error);
    throw new ApiError(500, 'Error fetching donations');
  }
};

export const getDonationById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json({ donation: data });
  } catch (error) {
    console.error('getDonationById error', error);
    throw new ApiError(500, 'Error fetching donation');
  }
};

// Stripe webhook placeholder
export const webhookStripe = async (req, res) => {
  try {
    // Stripe sends raw body for signature verification
    const signature = req.headers['stripe-signature'];
    const rawBody = req.body; // express.raw was used for this endpoint

    const verification = await paymentsService.verifyWebhookEvent('stripe', rawBody, signature);
    if (!verification.valid) {
      return res.status(400).json({ received: false, message: 'Invalid signature' });
    }

    const event = verification.parsed;
    if (event?.type === 'payment_intent.succeeded') {
      const donationId = event.data?.object?.metadata?.donation_id;
      if (donationId) {
        await supabase
          .from('donations')
          .update({ status: 'completed' })
          .eq('id', donationId);

        // record revenue
        const amount = (event.data?.object?.amount_received || 0) / 100;
        await paymentsService.recordRevenue({ amount, currency: (event.data?.object?.currency || 'USD').toUpperCase(), source: 'stripe', meta: { donationId } });
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('webhookStripe error', error);
    res.status(500).json({ error: 'Webhook processing error' });
  }
};

// Crypto webhook placeholder (Coinbase Commerce or similar)
export const webhookCrypto = async (req, res) => {
  try {
    const event = req.body;
    // Example for Coinbase Commerce: charge:confirmed
    if (event?.type === 'charge:confirmed') {
      const donationId = event.data?.metadata?.donation_id;
      const amount = event.data?.pricing?.local?.amount || event.data?.pricing?.USD?.amount || null;
      const currency = event.data?.pricing?.local?.currency || 'USD';
      if (donationId) {
        await supabase
          .from('donations')
          .update({ status: 'completed' })
          .eq('id', donationId);

        if (amount) {
          await paymentsService.recordRevenue({ amount: parseFloat(amount), currency, source: 'crypto', meta: { donationId } });
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('webhookCrypto error', error);
    res.status(500).json({ error: 'Webhook processing error' });
  }
};

// Withdrawals: users request withdrawals, admins approve
export const requestWithdrawal = async (req, res) => {
  try {
    const { user_id, amount, currency = 'USD', method = 'bank', details = {} } = req.body;
    if (!user_id || !amount || amount <= 0) return res.status(400).json({ error: 'Invalid request' });

    const id = genId();
    const { data, error } = await supabase
      .from('withdrawals')
      .insert([{ id, user_id, amount, currency, method, details, status: 'requested' }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ withdrawal: data });
  } catch (error) {
    console.error('requestWithdrawal error', error);
    throw new ApiError(500, 'Error creating withdrawal request');
  }
};

export const getWithdrawals = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ withdrawals: data });
  } catch (error) {
    console.error('getWithdrawals error', error);
    throw new ApiError(500, 'Error fetching withdrawals');
  }
};

export const updateWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase
      .from('withdrawals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ withdrawal: data });
  } catch (error) {
    console.error('updateWithdrawal error', error);
    throw new ApiError(500, 'Error updating withdrawal');
  }
};