import express from 'express';
import { authenticateAdmin, optionalAuth } from '../middleware/auth.js';
import * as paymentsController from '../controllers/payments.controller.js';

const router = express.Router();

// Public donation creation (creates a pending donation record and returns payment intent info)
router.post('/donations', paymentsController.createDonation);

// Admin: list donations
router.get('/donations', authenticateAdmin, paymentsController.getDonations);
router.get('/donations/:id', authenticateAdmin, paymentsController.getDonationById);

// Webhook endpoints for payment providers (Stripe needs raw body for signature)
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), paymentsController.webhookStripe);
router.post('/webhooks/crypto', express.json({ type: 'application/json' }), paymentsController.webhookCrypto);

// Withdrawals (users create requests anonymously or with identifier; admins manage)
router.post('/withdrawals', optionalAuth, paymentsController.requestWithdrawal);
router.get('/withdrawals', authenticateAdmin, paymentsController.getWithdrawals);
router.put('/withdrawals/:id', authenticateAdmin, paymentsController.updateWithdrawal);

export default router;

