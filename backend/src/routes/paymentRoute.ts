import express, { Router } from 'express';
import {
    createPayment,
    getPaymentById,
    getPaymentsByOrderId,
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
 * POST /payments - Create a new payment
 * Body: { order_id: number, amount: number, method: PaymentMethod, metadata?: object }
 */
paymentRouter.post('/', createPayment);

/**
 * GET /payments - Get all payments with optional filters
 * Query: ?status=pending&method=credit_card&limit=10&offset=0
 */
paymentRouter.get('/', getAllPayments);

/**
 * GET /payments/order/:orderId - Get all payments for a specific order
 */
paymentRouter.get('/order/:orderId', getPaymentsByOrderId);

/**
 * GET /payments/statistics - Get payment statistics
 * Query: ?startDate=2024-01-01&endDate=2024-12-31
 */
paymentRouter.get('/statistics', getPaymentStatistics);

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
 * POST /payments/:id/refund - Refund a payment
 */
paymentRouter.post('/:id/refund', refundPayment);

/**
 * GET /payments/:id - Get payment by ID
 */
paymentRouter.get('/:id', getPaymentById);

export default paymentRouter;