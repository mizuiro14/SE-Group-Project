import request from 'supertest';
import express from 'express';
import * as paymentController from '../controllers/paymentController';
import { PaymentService } from '../services/paymentService';

jest.mock('../services/paymentService');

const app = express();
app.use(express.json());

app.post('/payments', paymentController.createPayment);
app.get('/payments/:id', paymentController.getPaymentById);
app.post('/payments/:id/refund', paymentController.refundPayment);

describe('Payment Controller Integration Tests', () => {
    beforeEach(() => jest.clearAllMocks());

    it('creates a payment via HTTP POST (happy)', async () => {
        const body = { order_id: 1, amount: 10, method: 'credit_card' };
        (PaymentService.processPayment as jest.Mock).mockResolvedValue({ payment: { id: 1 }, response: { success: true, transaction_id: 't1' } });

        const res = await request(app).post('/payments').send(body);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.payment_id).toBeDefined();
    });

    it('retrieves payment by id (happy)', async () => {
        const payment = { id: 2, amount: 5 };
        (PaymentService.getPaymentById as jest.Mock).mockResolvedValue(payment);

        const res = await request(app).get('/payments/2');
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.payment).toEqual(payment);
    });

    it('refunds a payment (happy)', async () => {
        (PaymentService.refundPayment as jest.Mock).mockResolvedValue({ payment: { id: 3, status: 'refunded' }, response: { success: true } });

        const res = await request(app).post('/payments/3/refund').send();
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });

    it('returns 400 for missing required fields on create (sad)', async () => {
        const res = await request(app).post('/payments').send({ amount: 10 });
        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
    });

    it('returns 400 when refunding with invalid id (sad)', async () => {
        (PaymentService.refundPayment as jest.Mock).mockRejectedValue(new Error('Invalid payment'));
        const res = await request(app).post('/payments/999/refund').send();
        expect(res.statusCode).toBeGreaterThanOrEqual(400);
        expect(res.body.success).toBe(false);
    });
});
