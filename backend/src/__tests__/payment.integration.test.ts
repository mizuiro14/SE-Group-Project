import request from 'supertest';
import express, { Express } from 'express';
import paymentRouter from '../routes/paymentRoute';
import { PaymentMethod } from '../types/payment';
import { PaymentService } from '../services/paymentService';

jest.mock('../services/paymentService', () => ({
    PaymentService: {
        processPayment: jest.fn(),
        getPaymentById: jest.fn(),
        getPaymentsByOrderId: jest.fn(),
        getAllPayments: jest.fn(),
        refundPayment: jest.fn(),
        getPaymentStatistics: jest.fn()
    }
}));

const createTestApp = (): Express => {
    const app = express();
    app.use(express.json());
    app.use('/api/payments', paymentRouter);
    return app;
};

describe('Payment Integration Tests', () => {
    let app: Express;

    beforeAll(() => {
        app = createTestApp();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/payments/statistics', () => {
        it('routes to statistics handler (not /:id)', async () => {
            (PaymentService.getPaymentStatistics as jest.Mock).mockResolvedValue({
                totalPayments: 1,
                totalAmount: 50,
                completedAmount: 50,
                pendingAmount: 0,
                failedAmount: 0,
                byMethod: { credit_card: 1 },
                byStatus: { completed: 1 }
            });

            const res = await request(app).get('/api/payments/statistics');

            expect(res.status).toBe(200);
            expect(PaymentService.getPaymentStatistics).toHaveBeenCalledTimes(1);
            expect(PaymentService.getPaymentById).not.toHaveBeenCalled();
            expect(res.body.success).toBe(true);
        });

        it('returns statistics payload with query filters', async () => {
            (PaymentService.getPaymentStatistics as jest.Mock).mockResolvedValue({
                totalPayments: 3,
                totalAmount: 210,
                completedAmount: 200,
                pendingAmount: 10,
                failedAmount: 0,
                byMethod: { credit_card: 2, wallet: 1 },
                byStatus: { completed: 2, pending: 1 }
            });

            const res = await request(app)
                .get('/api/payments/statistics')
                .query({ startDate: '2026-01-01', endDate: '2026-12-31' });

            expect(res.status).toBe(200);
            expect(PaymentService.getPaymentStatistics).toHaveBeenCalledWith({
                startDate: '2026-01-01',
                endDate: '2026-12-31'
            });
            expect(res.body.statistics.totalPayments).toBe(3);
        });

        it('returns 500 when service throws', async () => {
            (PaymentService.getPaymentStatistics as jest.Mock).mockRejectedValue(new Error('stats failed'));

            const res = await request(app).get('/api/payments/statistics');

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/payments/:id', () => {
        it('rejects non-numeric payment ID', async () => {
            const res = await request(app).get('/api/payments/not-a-number');

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Payment ID must be a positive integer');
            expect(PaymentService.getPaymentById).not.toHaveBeenCalled();
        });

        it('rejects zero payment ID', async () => {
            const res = await request(app).get('/api/payments/0');

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Payment ID must be a positive integer');
        });

        it('returns payment for valid ID', async () => {
            (PaymentService.getPaymentById as jest.Mock).mockResolvedValue({ id: 8, amount: 100, status: 'completed' });

            const res = await request(app).get('/api/payments/8');

            expect(res.status).toBe(200);
            expect(PaymentService.getPaymentById).toHaveBeenCalledWith(8);
            expect(res.body.payment.id).toBe(8);
        });

        it('returns 404 when service fails', async () => {
            (PaymentService.getPaymentById as jest.Mock).mockRejectedValue(new Error('Payment not found'));

            const res = await request(app).get('/api/payments/404');

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/payments and /api/payments/order/:orderId', () => {
        it('returns payments list', async () => {
            (PaymentService.getAllPayments as jest.Mock).mockResolvedValue([
                { id: 1, method: 'credit_card', status: 'completed' },
                { id: 2, method: 'wallet', status: 'pending' }
            ]);

            const res = await request(app)
                .get('/api/payments')
                .query({ status: 'completed', method: 'credit_card', limit: '10', offset: '0' });

            expect(res.status).toBe(200);
            expect(PaymentService.getAllPayments).toHaveBeenCalledWith({
                status: 'completed',
                method: 'credit_card',
                limit: 10,
                offset: 0
            });
            expect(res.body.count).toBe(2);
        });

        it('returns payments by order', async () => {
            (PaymentService.getPaymentsByOrderId as jest.Mock).mockResolvedValue([
                { id: 3, order_id: 7 },
                { id: 4, order_id: 7 }
            ]);

            const res = await request(app).get('/api/payments/order/7');

            expect(res.status).toBe(200);
            expect(PaymentService.getPaymentsByOrderId).toHaveBeenCalledWith(7);
            expect(res.body.count).toBe(2);
        });

        it('rejects invalid order ID', async () => {
            const res = await request(app).get('/api/payments/order/abc');

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Order ID must be a positive integer');
        });
    });

    describe('POST /api/payments', () => {
        it('rejects invalid payment method', async () => {
            const res = await request(app)
                .post('/api/payments')
                .send({
                    order_id: 1,
                    amount: 100,
                    method: 'cash'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Invalid payment method');
            expect(PaymentService.processPayment).not.toHaveBeenCalled();
        });

        it('rejects missing required fields', async () => {
            const res = await request(app)
                .post('/api/payments')
                .send({ method: PaymentMethod.CREDIT_CARD });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Missing required fields');
        });

        it('rejects non-positive amount', async () => {
            const res = await request(app)
                .post('/api/payments')
                .send({
                    order_id: 1,
                    amount: 0,
                    method: PaymentMethod.CREDIT_CARD
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('order_id and amount must be positive numbers');
            expect(PaymentService.processPayment).not.toHaveBeenCalled();
        });

        it('returns 400 when service rejects invalid strategy-specific details', async () => {
            (PaymentService.processPayment as jest.Mock).mockRejectedValue(
                new Error('Payment processing failed: Invalid payment details for selected payment method')
            );

            const res = await request(app)
                .post('/api/payments')
                .send({
                    order_id: 1,
                    amount: 100,
                    method: PaymentMethod.CREDIT_CARD,
                    metadata: {}
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Invalid payment details');
        });

        it('creates payment successfully with valid request shape', async () => {
            (PaymentService.processPayment as jest.Mock).mockResolvedValue({
                payment: { id: 11, status: 'completed' },
                response: {
                    success: true,
                    message: 'Credit card payment processed successfully',
                    transaction_id: 'tx_11'
                }
            });

            const res = await request(app)
                .post('/api/payments')
                .send({
                    order_id: 2,
                    amount: 150,
                    method: PaymentMethod.CREDIT_CARD,
                    metadata: {
                        cardNumber: '4111111111111111',
                        expiryDate: '12/30',
                        cvc: '123'
                    }
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.payment_id).toBe(11);
        });
    });
});
