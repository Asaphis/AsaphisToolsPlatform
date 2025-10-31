// Payments configuration loader
// Usage: set provider keys in environment variables and load them here.

export const PAYMENTS = {
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || ''
  },
  flutterwave: {
    secretKey: process.env.FLUTTERWAVE_SECRET_KEY || '',
    publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || ''
  },
  binance: {
    apiKey: process.env.BINANCE_API_KEY || '',
    secret: process.env.BINANCE_API_SECRET || ''
  },
  bybit: {
    apiKey: process.env.BYBIT_API_KEY || '',
    secret: process.env.BYBIT_API_SECRET || ''
  },
  defaultCurrency: process.env.DEFAULT_CURRENCY || 'USD'
};
