import express, { Router } from 'express';
import {
    createPayment,
    getPaymentById,
    getPaymentsByOrderId,
    getAllPayments,
    refundPayment,
    getPaymentStatistics
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
 * GET /payments/:id - Get payment by ID
 */
paymentRouter.get('/:id', getPaymentById);

/**
 * POST /payments/:id/refund - Refund a payment
 */
paymentRouter.post('/:id/refund', refundPayment);

/**
 * GET /payments/statistics - Get payment statistics
 * Query: ?startDate=2024-01-01&endDate=2024-12-31
 */
paymentRouter.get('/statistics', getPaymentStatistics);

export default paymentRouter;
