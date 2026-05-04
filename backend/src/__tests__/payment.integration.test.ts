import request from 'supertest';
import express, { Express } from 'express';
import paymentRouter from '../routes/paymentRoute';
import { PaymentType } from '../types/payment';
import { supabaseAdmin } from '../SupabaseClient';

const createTestApp = (): Express => {
    const app = express();
    app.use(express.json());
    app.use('/api/payments', paymentRouter);
    return app;
};

describe('Payment Integration Tests', () => {
    let app: Express;
    let testUserId: number;
    let testUserEmail: string;
    let createdPaymentIds: number[] = [];

    const createPaymentMethod = async (payload: any) => {
        const res = await request(app).post('/api/payments').send(payload);
        if (res.status === 200 && res.body?.payment?.id) {
            createdPaymentIds.push(res.body.payment.id);
        }
        return res;
    };

    beforeAll(async () => {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
            throw new Error('SUPABASE_URL and SUPABASE_KEY must be set for integration tests');
        }

        app = createTestApp();

        const suffix = Date.now();
        testUserEmail = `payment_testuser_${suffix}@example.com`;

        const { data, error } = await supabaseAdmin
            .from('users')
            .insert({
                username: `payment_testuser_${suffix}`,
                user_email: testUserEmail,
                role: 'buyer'
            })
            .select()
            .single();

        if (error || !data) {
            throw new Error(`Failed to create test user: ${error?.message || 'no data returned'}`);
        }

        testUserId = data.id;
    });

    afterEach(async () => {
        if (createdPaymentIds.length === 0) {
            return;
        }

        await supabaseAdmin
            .from('payments')
            .delete()
            .in('id', createdPaymentIds);

        createdPaymentIds = [];
    });

    afterAll(async () => {
        await supabaseAdmin
            .from('payments')
            .delete()
            .eq('user_id', testUserId);

        await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', testUserId);
    });

    describe('POST /api/payments', () => {
        it('creates payment method successfully with valid request shape', async () => {
            const res = await createPaymentMethod({
                user_id: testUserId,
                type: PaymentType.CREDIT_CARD,
                is_default: true,
                details: {
                    cardNumber: '4111111111111111',
                    expiryDate: '12/30',
                    cvc: '123'
                }
            });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.payment.user_id).toBe(testUserId);
            expect(res.body.payment.type).toBe(PaymentType.CREDIT_CARD);
        });

        it('rejects invalid payment type', async () => {
            const res = await createPaymentMethod({
                user_id: testUserId,
                type: 'cash',
                details: { note: 'x' }
            });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Invalid payment type');
        });

        it('returns 400 when details are invalid for the strategy', async () => {
            const res = await createPaymentMethod({
                user_id: testUserId,
                type: PaymentType.CREDIT_CARD,
                details: {}
            });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Invalid payment details');
        });
    });

    describe('GET /api/payments/:id', () => {
        it('returns payment for valid ID', async () => {
            const createRes = await createPaymentMethod({
                user_id: testUserId,
                type: PaymentType.PAYPAL,
                details: { email: 'payuser@example.com' }
            });

            const paymentId = createRes.body.payment.id;
            const res = await request(app).get(`/api/payments/${paymentId}`);

            expect(res.status).toBe(200);
            expect(res.body.payment.id).toBe(paymentId);
        });

        it('rejects non-numeric payment ID', async () => {
            const res = await request(app).get('/api/payments/not-a-number');

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Payment ID must be a positive integer');
        });
    });

    describe('GET /api/payments and /api/payments/user/:userId', () => {
        it('returns payments list with filters', async () => {
            await createPaymentMethod({
                user_id: testUserId,
                type: PaymentType.CREDIT_CARD,
                is_default: true,
                details: {
                    cardNumber: '4111111111111111',
                    expiryDate: '12/30',
                    cvc: '123'
                }
            });

            await createPaymentMethod({
                user_id: testUserId,
                type: PaymentType.WALLET,
                details: { walletId: 'wallet_1', balance: 100 }
            });

            const res = await request(app)
                .get('/api/payments')
                .query({ user_id: String(testUserId), type: 'credit_card', is_default: 'true' });

            expect(res.status).toBe(200);
            expect(res.body.count).toBeGreaterThan(0);
        });

        it('returns payments by user', async () => {
            await createPaymentMethod({
                user_id: testUserId,
                type: PaymentType.PAYPAL,
                details: { email: 'payuser2@example.com' }
            });

            const res = await request(app).get(`/api/payments/user/${testUserId}`);

            expect(res.status).toBe(200);
            expect(res.body.count).toBeGreaterThan(0);
        });

        it('rejects invalid user ID', async () => {
            const res = await request(app).get('/api/payments/user/abc');

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('User ID must be a positive integer');
        });
    });

    describe('PATCH /api/payments/:id', () => {
        it('updates payment method successfully', async () => {
            const createRes = await createPaymentMethod({
                user_id: testUserId,
                type: PaymentType.PAYPAL,
                details: { email: 'old@example.com' }
            });

            const paymentId = createRes.body.payment.id;
            const res = await request(app)
                .patch(`/api/payments/${paymentId}`)
                .send({ type: PaymentType.PAYPAL, details: { email: 'new@example.com' }, is_default: false });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.payment.id).toBe(paymentId);
        });

        it('rejects invalid payment type', async () => {
            const res = await request(app)
                .patch('/api/payments/1')
                .send({ type: 'cash' });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Invalid payment type');
        });
    });

    describe('DELETE /api/payments/:id', () => {
        it('deletes payment method successfully', async () => {
            const createRes = await createPaymentMethod({
                user_id: testUserId,
                type: PaymentType.WALLET,
                details: { walletId: 'wallet_2', balance: 200 }
            });

            const paymentId = createRes.body.payment.id;
            const res = await request(app).delete(`/api/payments/${paymentId}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            const { data } = await supabaseAdmin
                .from('payments')
                .select('id')
                .eq('id', paymentId)
                .maybeSingle();

            expect(data).toBeNull();
        });

        it('rejects invalid payment ID', async () => {
            const res = await request(app).delete('/api/payments/abc');

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Payment ID must be a positive integer');
        });
    });
});
