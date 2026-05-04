import request from 'supertest';
import express, { Express } from 'express';
import orderRoutes from '../routes/orderRoute';
import { supabaseAdmin } from '../SupabaseClient';

const createTestApp = (): Express => {
    const app = express();
    app.use(express.json());
    app.use('/api/orders', orderRoutes);
    return app;
};

const ensureEnv = () => {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        throw new Error('SUPABASE_URL and SUPABASE_KEY must be set for integration tests');
    }
};

describe('Order Integration Tests', () => {
    let app: Express;
    let testUserId: number;
    let sellerAuthUserId: string;
    let productId: number;
    let createdOrderIds: number[] = [];

    const createOrder = async (payload: any) => {
        const res = await request(app).post('/api/orders').send(payload);
        if (res.status === 201 && res.body?.id) {
            createdOrderIds.push(res.body.id);
        }
        return res;
    };

    beforeAll(async () => {
        ensureEnv();
        app = createTestApp();

        const suffix = Date.now();
        const userEmail = `order_testuser_${suffix}@example.com`;

        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .insert({
                username: `order_testuser_${suffix}`,
                user_email: userEmail,
                role: 'buyer'
            })
            .select()
            .single();

        if (userError || !userData) {
            throw new Error(`Failed to create test user: ${userError?.message || 'no data returned'}`);
        }

        testUserId = userData.id;

        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: `order_seller_${suffix}@example.com`,
            password: 'TestPassword123!'
        });

        if (authError || !authUser.user) {
            throw new Error(`Failed to create auth seller user: ${authError?.message || 'no data returned'}`);
        }

        sellerAuthUserId = authUser.user.id;

        const { data: productData, error: productError } = await supabaseAdmin
            .from('products')
            .insert({
                seller_id: sellerAuthUserId,
                name: `Order Test Product ${suffix}`,
                description: 'Integration test product',
                price: 10,
                quantity: 50,
                category_id: null,
                sku: `ORDER-TEST-${suffix}`
            })
            .select()
            .single();

        if (productError || !productData) {
            throw new Error(`Failed to create test product: ${productError?.message || 'no data returned'}`);
        }

        productId = productData.id;
    });

    afterEach(async () => {
        if (createdOrderIds.length === 0) {
            return;
        }

        await supabaseAdmin
            .from('order_items')
            .delete()
            .in('order_id', createdOrderIds);

        await supabaseAdmin
            .from('orders')
            .delete()
            .in('id', createdOrderIds);

        createdOrderIds = [];
    });

    afterAll(async () => {
        await supabaseAdmin
            .from('products')
            .delete()
            .eq('id', productId);

        await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', testUserId);

        if (sellerAuthUserId) {
            await supabaseAdmin.auth.admin.deleteUser(sellerAuthUserId);
        }
    });

    describe('POST /api/orders', () => {
        it('creates order with order_items successfully', async () => {
            const payload = {
                user_id: testUserId,
                status: 'pending',
                items: [
                    { product_id: productId, quantity: 2, unit_price: 10 }
                ]
            };

            const res = await createOrder(payload);

            expect(res.status).toBe(201);
            expect(res.body.user_id).toBe(testUserId);
            expect(res.body.order_items.length).toBe(1);
        });

        it('returns 400 when user_id is missing', async () => {
            const res = await request(app)
                .post('/api/orders')
                .send({ items: [{ product_id: productId, quantity: 1, unit_price: 1 }] });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('A valid user identifier and items are required');
        });
    });

    describe('GET /api/orders', () => {
        it('returns all orders', async () => {
            await createOrder({
                user_id: testUserId,
                items: [{ product_id: productId, quantity: 1, unit_price: 10 }]
            });

            const res = await request(app).get('/api/orders');

            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/orders/:id', () => {
        it('returns an order by id', async () => {
            const createRes = await createOrder({
                user_id: testUserId,
                items: [{ product_id: productId, quantity: 1, unit_price: 10 }]
            });

            const res = await request(app).get(`/api/orders/${createRes.body.id}`);

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(createRes.body.id);
        });
    });

    describe('GET /api/orders/user/:userId', () => {
        it('returns orders for a user', async () => {
            await createOrder({
                user_id: testUserId,
                items: [{ product_id: productId, quantity: 1, unit_price: 10 }]
            });

            const res = await request(app).get(`/api/orders/user/${testUserId}`);

            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    describe('PUT /api/orders/:id/status', () => {
        it('updates order status', async () => {
            const createRes = await createOrder({
                user_id: testUserId,
                items: [{ product_id: productId, quantity: 1, unit_price: 10 }]
            });

            const res = await request(app)
                .put(`/api/orders/${createRes.body.id}/status`)
                .send({ status: 'shipped' });

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('shipped');
        });

        it('returns 400 when status is missing', async () => {
            const createRes = await createOrder({
                user_id: testUserId,
                items: [{ product_id: productId, quantity: 1, unit_price: 10 }]
            });

            const res = await request(app)
                .put(`/api/orders/${createRes.body.id}/status`)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Status is required');
        });
    });

    describe('DELETE /api/orders/:id', () => {
        it('deletes order successfully', async () => {
            const createRes = await createOrder({
                user_id: testUserId,
                items: [{ product_id: productId, quantity: 1, unit_price: 10 }]
            });

            const res = await request(app).delete(`/api/orders/${createRes.body.id}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Order deleted successfully');

            const { data } = await supabaseAdmin
                .from('orders')
                .select('id')
                .eq('id', createRes.body.id)
                .maybeSingle();

            expect(data).toBeNull();
        });
    });
});
