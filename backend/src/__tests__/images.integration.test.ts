import request from 'supertest';
import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import imageRoutes from '../routes/imageRoute';
import { supabaseAdmin } from '../SupabaseClient';

const createTestApp = (): Express => {
    const app = express();

    app.use(express.json());
    app.use(cookieParser());
    app.use('/images', imageRoutes);

    return app;
};

describe('Images Integration Tests', () => {
    let app: Express;
    let testUserId: number;
    let uploadedImageId: number | null = null;

    const suffix = Date.now();
    const testUser = {
        username: `image_test_user_${suffix}`,
        user_email: `image_test_user_${suffix}@example.com`,
        cellphone_number: '+14155552679',
    };

    const tinyPng = Buffer.from([
        0x89, 0x50, 0x4e, 0x47,
        0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52,
    ]);

    beforeAll(async () => {
        app = createTestApp();

        const { data, error } = await supabaseAdmin
            .from('users')
            .insert([testUser])
            .select()
            .single();

        if (error || !data) {
            throw new Error(`Failed to create integration test user: ${error?.message || 'unknown error'}`);
        }

        testUserId = data.id;
    });

    afterAll(async () => {
        try {
            await supabaseAdmin
                .from('images')
                .delete()
                .eq('user_id', testUserId);
        } catch {
            // Ignore cleanup errors to keep suite teardown resilient.
        }

        try {
            await supabaseAdmin
                .from('users')
                .delete()
                .eq('id', testUserId);
        } catch {
            // Ignore cleanup errors to keep suite teardown resilient.
        }
    });

    it('POST /images/users/:userId uploads image successfully', async () => {
        const res = await request(app)
            .post(`/images/users/${testUserId}`)
            .attach('image', tinyPng, 'avatar.png');

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('image_url');
        expect(res.body.user_id).toBe(testUserId);
        uploadedImageId = res.body.id;
    });

    it('GET /images/users/:userId returns user images', async () => {
        const res = await request(app).get(`/images/users/${testUserId}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some((img: any) => img.id === uploadedImageId)).toBe(true);
    });

    it('POST /images/users/:userId fails when file is missing', async () => {
        const res = await request(app).post(`/images/users/${testUserId}`);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('POST /images/users/:userId fails for invalid userId param', async () => {
        const res = await request(app)
            .post('/images/users/not-a-number')
            .attach('image', tinyPng, 'avatar.png');

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid id parameter');
    });

    it('POST /images/users/:userId rejects non-image files', async () => {
        const res = await request(app)
            .post(`/images/users/${testUserId}`)
            .attach('image', Buffer.from('hello world'), 'notes.txt');

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('POST /images/users/:userId rejects files above 10MB', async () => {
        const hugeBuffer = Buffer.alloc(10 * 1024 * 1024 + 1, 1);

        const res = await request(app)
            .post(`/images/users/${testUserId}`)
            .attach('image', hugeBuffer, 'huge.png');

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('GET /images/users/:userId fails for invalid userId param', async () => {
        const res = await request(app).get('/images/users/invalid');

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid id parameter');
    });

    it('GET /images/users/:userId returns empty array for user with no images', async () => {
        const res = await request(app).get('/images/users/999999999');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('DELETE /images/:id deletes existing image', async () => {
        if (!uploadedImageId) {
            throw new Error('Missing uploaded image id from prior test');
        }

        const res = await request(app).delete(`/images/${uploadedImageId}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Image deleted successfully');
    });

    it('DELETE /images/:id returns an error for image already deleted', async () => {
        if (!uploadedImageId) {
            throw new Error('Missing uploaded image id from prior test');
        }

        const res = await request(app).delete(`/images/${uploadedImageId}`);

        expect([404, 500]).toContain(res.status);
        expect(res.body).toHaveProperty('error');
    });

    it('DELETE /images/:id fails for invalid id param', async () => {
        const res = await request(app).delete('/images/invalid-id');

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid id parameter');
    });

    it('GET /images/products/:productId fails for invalid productId param', async () => {
        const res = await request(app).get('/images/products/not-a-number');

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid id parameter');
    });

    it('GET /images/products/:productId returns an array shape', async () => {
        const res = await request(app).get('/images/products/999999999');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /images/products/:productId fails for invalid productId param', async () => {
        const res = await request(app)
            .post('/images/products/abc')
            .attach('image', tinyPng, 'product.png');

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid id parameter');
    });

    it('POST /images/products/:productId returns an error for non-existing product FK', async () => {
        const res = await request(app)
            .post('/images/products/999999999')
            .attach('image', tinyPng, 'product.png');

        expect([400, 500]).toContain(res.status);
        expect(res.body).toHaveProperty('error');
    });
});
