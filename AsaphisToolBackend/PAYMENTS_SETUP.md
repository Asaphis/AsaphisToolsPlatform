# Payments setup

This document explains how to configure payment providers for AsaphisToolBackend.

Supported (scaffolded) providers:
- Stripe (card payments)
- Coinbase Commerce (crypto hosted checkout)
- Flutterwave (scaffolded config, add implementation if desired)
- Binance/Bybit: exchanges — recommended approach is to use Coinbase Commerce or another hosted crypto checkout and then transfer funds to exchanges manually.

Environment variables
- STRIPE_SECRET_KEY: your Stripe secret key
- STRIPE_PUBLISHABLE_KEY: your Stripe publishable key
- STRIPE_WEBHOOK_SECRET: Stripe webhook signing secret
- COINBASE_COMMERCE_API_KEY: Coinbase Commerce API key (if used)
- FLUTTERWAVE_SECRET_KEY: Flutterwave secret key (if used)
- FLUTTERWAVE_PUBLIC_KEY: Flutterwave public key
- BINANCE_API_KEY, BINANCE_API_SECRET (optional)
- BYBIT_API_KEY, BYBIT_API_SECRET (optional)
- DEFAULT_CURRENCY: e.g. USD
- FRONTEND_URL: URL of frontend for CORS
- API_VERSION: v1 (default)

Notes
- Webhook endpoints are scaffolded at `/api/v1/payments/webhooks/stripe` and `/api/v1/payments/webhooks/crypto`.
- Webhook signature verification must be implemented before enabling production mode. Currently endpoints accept events but do not verify signatures.
- For Stripe, use the official `stripe` library to create real PaymentIntents and to verify webhooks.
- For crypto payments, Coinbase Commerce is recommended for an easy hosted checkout flow. Binance/Bybit are exchange platforms and do not provide a simple one-click hosted checkout.

Next steps to enable live payments
1. Add provider keys to environment variables.
2. Install and configure provider SDKs, e.g. `npm i stripe` and verify signature using `stripe.webhooks.constructEvent`.
3. Update `src/services/payments.service.js` to call provider SDKs instead of returning mocks.
4. Test webhook delivery locally using `stripe listen` or Coinbase Commerce webhooks.

Security considerations
- Always verify webhook signatures.
- Rate-limit webhook endpoints and restrict origins where possible.
- Sanitize any HTML stored as ad content to prevent XSS.

If you want, I can implement the Stripe + Coinbase Commerce integration now — provide API keys and webhook secrets (add them as environment variables) or I can leave the mocks and implement the SDK code for you to add keys later.
