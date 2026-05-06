import express, { Router } from 'express';
import {
    createPayment,
    getPaymentById,
    getAllPayments,
    refundPayment,
    getPaymentStatistics,
    createPaymentMethod,
    getUserPaymentMethods,
    updatePaymentMethod,
    deletePaymentMethod
} from '../controllers/paymentController';

const paymentRouter: Router = express.Router();

/**
 * POST /payments - Create a new payment method
 * Body: { user_id: number, type: PaymentType, is_default?: boolean, details: object }
 */
paymentRouter.post('/', createPayment);

/**
 * GET /payments - Get all payment methods with optional filters
 * Query: ?user_id=1&type=credit_card&is_default=true&limit=10&offset=0
 */
paymentRouter.get('/', getAllPayments);

/**
 * GET /payments/user/:userId - Get all payment methods for a user
 */
paymentRouter.get('/user/:userId', getPaymentsByUserId);

/**
 * PATCH /payments/:id - Update a payment method
 */
paymentRouter.patch('/:id', updatePaymentMethod);

// ==========================================
// EXACT MATCH ROUTES (MUST GO BEFORE /:id)
// ==========================================

// Save a new method
paymentRouter.post('/methods', createPaymentMethod);

// Get all saved methods for a user
paymentRouter.get('/methods/:userId', getUserPaymentMethods);

// Update a saved method
paymentRouter.put('/methods/:id', updatePaymentMethod);

// Delete a saved method
paymentRouter.delete('/methods/:id', deletePaymentMethod);

// ==========================================
// DYNAMIC / PARAMETER ROUTES (MUST GO LAST)
// ==========================================

/**
 * DELETE /payments/:id - Delete a payment method
 */
paymentRouter.delete('/:id', deletePaymentMethod);

/**
 * GET /payments/:id - Get payment method by ID
 */
paymentRouter.get('/:id', getPaymentById);

export default paymentRouter;