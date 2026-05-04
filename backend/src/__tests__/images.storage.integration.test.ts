import request from 'supertest';
import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import imageRoutes from '../routes/imageRoute';
import { supabaseAdmin } from '../SupabaseClient';

const BUCKET_NAME = 'images';
const PUBLIC_URL_SEGMENT = `/storage/v1/object/public/${BUCKET_NAME}/`;

const createTestApp = (): Express => {
    const app = express();

    app.use(express.json());
    app.use(cookieParser());
    app.use('/images', imageRoutes);

    return app;
};

const getStoragePathFromPublicUrl = (url: string): string => {
    const index = url.indexOf(PUBLIC_URL_SEGMENT);
    if (index === -1) {
        throw new Error('Unable to extract storage path from public URL');
    }

    return url.slice(index + PUBLIC_URL_SEGMENT.length);
};

describe('Images Storage Integration Tests', () => {
    let app: Express;
    let testUserId: number;
    let uploadedImageId: number | null = null;
    let uploadedStoragePath: string | null = null;

    const suffix = Date.now();
    const testUser = {
        username: `image_storage_user_${suffix}`,
        user_email: `image_storage_user_${suffix}@example.com`,
        cellphone_number: '+14155550001',
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
        if (uploadedImageId) {
            await supabaseAdmin
                .from('images')
                .delete()
                .eq('id', uploadedImageId);
        }

        if (uploadedStoragePath) {
            await supabaseAdmin.storage
                .from(BUCKET_NAME)
                .remove([uploadedStoragePath]);
        }

        await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', testUserId);
    });

    it('POST /images/users/:userId uploads to Supabase Storage bucket and records DB row', async () => {
        const uploadRes = await request(app)
            .post(`/images/users/${testUserId}`)
            .attach('image', tinyPng, 'avatar-storage-check.png');

        expect(uploadRes.status).toBe(201);
        expect(uploadRes.body).toHaveProperty('id');
        expect(uploadRes.body).toHaveProperty('image_url');

        uploadedImageId = uploadRes.body.id;
        uploadedStoragePath = getStoragePathFromPublicUrl(uploadRes.body.image_url);

        const { data: downloadData, error: downloadError } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .download(uploadedStoragePath);

        expect(downloadError).toBeNull();
        expect(downloadData).toBeTruthy();

        const { data: dbImage, error: dbError } = await supabaseAdmin
            .from('images')
            .select('*')
            .eq('id', uploadedImageId)
            .single();

        expect(dbError).toBeNull();
        expect(dbImage).toBeTruthy();
        expect(dbImage?.user_id).toBe(testUserId);
        expect(dbImage?.image_url).toBe(uploadRes.body.image_url);
    });
});