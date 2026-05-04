import request from 'supertest';
import express, { Express } from 'express';
import productRoutes from '../routes/productRoute';
import { supabaseAdmin } from '../SupabaseClient';

const createTestApp = (): Express => {
    const app = express();
    app.use(express.json());
    app.use('/api/products', productRoutes);
    return app;
};

const ensureEnv = () => {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        throw new Error('SUPABASE_URL and SUPABASE_KEY must be set for integration tests');
    }
};

describe('Product Integration Tests', () => {
    let app: Express;
    let sellerAuthUserId: string;
    let createdProductIds: number[] = [];

    const createProduct = async (payload: any) => {
        const res = await request(app).post('/api/products').send(payload);
        if (res.status === 201 && res.body?.id) {
            createdProductIds.push(res.body.id);
        }
        return res;
    };

    beforeAll(async () => {
        ensureEnv();
        app = createTestApp();

        const suffix = Date.now();
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: `product_seller_${suffix}@example.com`,
            password: 'TestPassword123!'
        });

        if (authError || !authUser.user) {
            throw new Error(`Failed to create auth seller user: ${authError?.message || 'no data returned'}`);
        }

        sellerAuthUserId = authUser.user.id;
    });

    afterEach(async () => {
        if (createdProductIds.length === 0) {
            return;
        }

        await supabaseAdmin
            .from('products')
            .delete()
            .in('id', createdProductIds);

        createdProductIds = [];
    });

    afterAll(async () => {
        if (sellerAuthUserId) {
            await supabaseAdmin.auth.admin.deleteUser(sellerAuthUserId);
        }
    });

    describe('GET endpoints', () => {
        it('returns products for GET /api/products', async () => {
            const createRes = await createProduct({
                seller_id: sellerAuthUserId,
                name: `Product A ${Date.now()}`,
                description: 'Integration test product',
                price: 12,
                quantity: 5,
                category_id: null,
                sku: `PRODUCT-A-${Date.now()}`
            });

            const res = await request(app).get('/api/products');

            expect(createRes.status).toBe(201);
            expect(res.status).toBe(200);
            expect(res.body.some((item: any) => item.id === createRes.body.id)).toBe(true);
        });

        it('returns 400 when GET /api/products/search has empty query', async () => {
            const res = await request(app).get('/api/products/search').query({ query: '   ' });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Search query is required');
        });

        it('returns a product for GET /api/products/:id', async () => {
            const createRes = await createProduct({
                seller_id: sellerAuthUserId,
                name: `Product B ${Date.now()}`,
                description: 'Integration test product',
                price: 7,
                quantity: 3,
                category_id: null,
                sku: `PRODUCT-B-${Date.now()}`
            });

            const res = await request(app).get(`/api/products/${createRes.body.id}`);

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(createRes.body.id);
        });
    });

    describe('POST endpoints', () => {
        it('creates a product successfully', async () => {
            const res = await createProduct({
                seller_id: sellerAuthUserId,
                name: `Product C ${Date.now()}`,
                description: 'Integration test product',
                price: 15,
                quantity: 2,
                category_id: null,
                sku: `PRODUCT-C-${Date.now()}`
            });

            expect(res.status).toBe(201);
            expect(res.body.seller_id).toBe(sellerAuthUserId);
        });

        it('returns 400 when POST /api/products misses required fields', async () => {
            const res = await request(app)
                .post('/api/products')
                .send({ name: 'Missing seller' });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Name, price, quantity, and seller_id are required');
        });
    });
});
