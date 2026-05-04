import request from 'supertest';
import express, { Express } from 'express';
import shippingRoutes from '../routes/shippingRoute';
import { supabaseAdmin } from '../SupabaseClient';

const createTestApp = (): Express => {
    const app = express();
    app.use(express.json());
    app.use('/api/shipping', shippingRoutes);
    return app;
};

const ensureEnv = () => {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        throw new Error('SUPABASE_URL and SUPABASE_KEY must be set for integration tests');
    }
};

describe('Shipping Integration Tests', () => {
    let app: Express;
    let testUserId: number;
    let orderId: number;
    let createdShippingIds: number[] = [];

    const createShipping = async (payload: any) => {
        const res = await request(app).post('/api/shipping').send(payload);
        if (res.status === 201 && res.body?.id) {
            createdShippingIds.push(res.body.id);
        }
        return res;
    };

    beforeAll(async () => {
        ensureEnv();
        app = createTestApp();

        const suffix = Date.now();
        const userEmail = `shipping_testuser_${suffix}@example.com`;

        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .insert({
                username: `shipping_testuser_${suffix}`,
                user_email: userEmail,
                role: 'buyer'
            })
            .select()
            .single();

        if (userError || !userData) {
            throw new Error(`Failed to create test user: ${userError?.message || 'no data returned'}`);
        }

        testUserId = userData.id;

        const { data: orderData, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
                user_id: testUserId,
                status: 'pending',
                total: 10
            })
            .select()
            .single();

        if (orderError || !orderData) {
            throw new Error(`Failed to create test order: ${orderError?.message || 'no data returned'}`);
        }

        orderId = orderData.id;
    });

    afterEach(async () => {
        if (createdShippingIds.length === 0) {
            return;
        }

        await supabaseAdmin
            .from('shipping')
            .delete()
            .in('id', createdShippingIds);

        createdShippingIds = [];
    });

    afterAll(async () => {
        await supabaseAdmin
            .from('shipping')
            .delete()
            .eq('order_id', orderId);

        await supabaseAdmin
            .from('orders')
            .delete()
            .eq('id', orderId);

        await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', testUserId);
    });

    describe('POST /api/shipping', () => {
        it('creates shipping successfully', async () => {
            const res = await createShipping({
                order_id: orderId,
                address: '123 Main St'
            });

            expect(res.status).toBe(201);
            expect(res.body.order_id).toBe(orderId);
            expect(res.body.status).toBe('pending');
        });

        it('returns 400 when required fields are missing', async () => {
            const res = await request(app)
                .post('/api/shipping')
                .send({ order_id: orderId });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('order_id and address are required');
        });
    });

    describe('GET /api/shipping', () => {
        it('returns all shippings', async () => {
            await createShipping({ order_id: orderId, address: '123 Main St' });

            const res = await request(app).get('/api/shipping');

            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('returns filtered shippings by order_id', async () => {
            await createShipping({ order_id: orderId, address: '456 Center St' });

            const res = await request(app)
                .get('/api/shipping')
                .query({ order_id: String(orderId) });

            expect(res.status).toBe(200);
            expect(res.body.every((row: any) => row.order_id === orderId)).toBe(true);
        });
    });

    describe('GET /api/shipping/:id', () => {
        it('returns shipping by id', async () => {
            const createRes = await createShipping({ order_id: orderId, address: '789 Oak St' });

            const res = await request(app).get(`/api/shipping/${createRes.body.id}`);

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(createRes.body.id);
        });
    });

    describe('GET /api/shipping/order/:orderId', () => {
        it('returns shippings for an order', async () => {
            await createShipping({ order_id: orderId, address: '101 Pine St' });

            const res = await request(app).get(`/api/shipping/order/${orderId}`);

            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    describe('PUT /api/shipping/:id', () => {
        it('updates shipping successfully', async () => {
            const createRes = await createShipping({ order_id: orderId, address: '202 Maple St' });

            const res = await request(app)
                .put(`/api/shipping/${createRes.body.id}`)
                .send({ status: 'shipped' });

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('shipped');
        });
    });

    describe('DELETE /api/shipping/:id', () => {
        it('deletes shipping successfully', async () => {
            const createRes = await createShipping({ order_id: orderId, address: '303 Birch St' });

            const res = await request(app).delete(`/api/shipping/${createRes.body.id}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Shipping deleted successfully');

            const { data } = await supabaseAdmin
                .from('shipping')
                .select('id')
                .eq('id', createRes.body.id)
                .maybeSingle();

            expect(data).toBeNull();
        });
    });
});
