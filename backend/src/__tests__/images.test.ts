import {
    uploadImage,
    getProductImages,
    getUserImages,
    deleteImageById,
} from '../services/imageService';

jest.mock('../SupabaseClient', () => {
    let queryResult: any = { data: null, error: null };
    let singleQueue: any[] = [];
    let uploadResult: any = { error: null };
    let removeResult: any = { data: null, error: null };
    let publicUrl = 'https://example.supabase.co/storage/v1/object/public/images/misc/mock.png';

    const chain: any = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn(async () => {
            if (singleQueue.length > 0) {
                return singleQueue.shift();
            }

            return queryResult;
        }),
    };

    chain.then = (onFulfilled: any) => Promise.resolve(onFulfilled(queryResult));

    const storageBucket: any = {
        upload: jest.fn(async () => uploadResult),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl } })),
        remove: jest.fn(async () => removeResult),
    };

    const supabaseAdmin: any = {
        from: jest.fn(() => chain),
        storage: {
            from: jest.fn(() => storageBucket),
        },
        __chain: chain,
        __storageBucket: storageBucket,
        __setQueryResult: (r: any) => {
            queryResult = r;
        },
        __setSingleQueue: (q: any[]) => {
            singleQueue = [...q];
        },
        __setUploadResult: (r: any) => {
            uploadResult = r;
        },
        __setRemoveResult: (r: any) => {
            removeResult = r;
        },
        __setPublicUrl: (u: string) => {
            publicUrl = u;
        },
    };

    return { supabaseAdmin };
});

describe('Image Service Unit Tests', () => {
    const { supabaseAdmin } = require('../SupabaseClient');

    const makeFile = (name: string = 'photo.png', type: string = 'image/png'): Express.Multer.File => ({
        fieldname: 'image',
        originalname: name,
        encoding: '7bit',
        mimetype: type,
        size: 32,
        buffer: Buffer.from('image-bytes'),
        destination: '',
        filename: '',
        path: '',
        stream: null as any,
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();

        supabaseAdmin.__setQueryResult({ data: null, error: null });
        supabaseAdmin.__setSingleQueue([]);
        supabaseAdmin.__setUploadResult({ error: null });
        supabaseAdmin.__setRemoveResult({ data: null, error: null });
        supabaseAdmin.__setPublicUrl('https://example.supabase.co/storage/v1/object/public/images/misc/mock.png');
    });

    it('uploads a product image and persists DB record (happy)', async () => {
        const created = {
            id: 1,
            created_at: new Date().toISOString(),
            image_url: 'https://example.supabase.co/storage/v1/object/public/images/products/10/pic.png',
            user_id: null,
            product_id: 10,
        };

        supabaseAdmin.__setPublicUrl(created.image_url);
        supabaseAdmin.__setSingleQueue([{ data: created, error: null }]);

        const res = await uploadImage(makeFile('pic.png'), { productId: 10 });

        expect(res).toEqual(created);
        expect(supabaseAdmin.__storageBucket.upload).toHaveBeenCalledTimes(1);
        expect(supabaseAdmin.__chain.insert).toHaveBeenCalledWith([
            { image_url: created.image_url, user_id: null, product_id: 10 },
        ]);
    });

    it('uploads a user image and persists DB record (happy)', async () => {
        const created = {
            id: 2,
            created_at: new Date().toISOString(),
            image_url: 'https://example.supabase.co/storage/v1/object/public/images/users/7/avatar.jpg',
            user_id: 7,
            product_id: null,
        };

        supabaseAdmin.__setPublicUrl(created.image_url);
        supabaseAdmin.__setSingleQueue([{ data: created, error: null }]);

        const res = await uploadImage(makeFile('avatar.jpg', 'image/jpeg'), { userId: 7 });

        expect(res).toEqual(created);
        expect(supabaseAdmin.__chain.insert).toHaveBeenCalledWith([
            { image_url: created.image_url, user_id: 7, product_id: null },
        ]);
    });

    it('throws when storage upload fails', async () => {
        supabaseAdmin.__setUploadResult({ error: { message: 'storage failed' } });

        await expect(uploadImage(makeFile(), { productId: 3 })).rejects.toThrow('Failed to upload image: storage failed');
        expect(supabaseAdmin.__chain.insert).not.toHaveBeenCalled();
    });

    it('cleans up storage and throws when DB insert fails', async () => {
        supabaseAdmin.__setPublicUrl('https://example.supabase.co/storage/v1/object/public/images/products/8/cleanup.png');
        supabaseAdmin.__setSingleQueue([{ data: null, error: { message: 'insert failed' } }]);

        await expect(uploadImage(makeFile('cleanup.png'), { productId: 8 })).rejects.toThrow('Failed to persist image record: insert failed');
        expect(supabaseAdmin.__storageBucket.remove).toHaveBeenCalledTimes(1);
    });

    it('cleans up storage and throws when insert returns empty row', async () => {
        supabaseAdmin.__setPublicUrl('https://example.supabase.co/storage/v1/object/public/images/users/9/empty.png');
        supabaseAdmin.__setSingleQueue([{ data: null, error: null }]);

        await expect(uploadImage(makeFile('empty.png'), { userId: 9 })).rejects.toThrow('Failed to create image record');
        expect(supabaseAdmin.__storageBucket.remove).toHaveBeenCalledTimes(1);
    });

    it('retrieves product images (happy)', async () => {
        const rows = [{ id: 11, image_url: 'u', user_id: null, product_id: 5, created_at: 't' }];
        supabaseAdmin.__setQueryResult({ data: rows, error: null });

        const res = await getProductImages(5);

        expect(res).toEqual(rows);
        expect(supabaseAdmin.__chain.eq).toHaveBeenCalledWith('product_id', 5);
    });

    it('throws when retrieving product images fails', async () => {
        supabaseAdmin.__setQueryResult({ data: null, error: { message: 'product list failed' } });

        await expect(getProductImages(1)).rejects.toThrow('product list failed');
    });

    it('retrieves user images (happy)', async () => {
        const rows = [{ id: 12, image_url: 'u2', user_id: 6, product_id: null, created_at: 't2' }];
        supabaseAdmin.__setQueryResult({ data: rows, error: null });

        const res = await getUserImages(6);

        expect(res).toEqual(rows);
        expect(supabaseAdmin.__chain.eq).toHaveBeenCalledWith('user_id', 6);
    });

    it('deletes image from storage and DB (happy)', async () => {
        const found = {
            id: 20,
            created_at: new Date().toISOString(),
            image_url: 'https://example.supabase.co/storage/v1/object/public/images/products/20/deleteme.png',
            user_id: null,
            product_id: 20,
        };

        supabaseAdmin.__setSingleQueue([{ data: found, error: null }]);
        supabaseAdmin.__setQueryResult({ data: null, error: null });

        await expect(deleteImageById(20)).resolves.toBeUndefined();
        expect(supabaseAdmin.__storageBucket.remove).toHaveBeenCalledWith(['products/20/deleteme.png']);
        expect(supabaseAdmin.__chain.delete).toHaveBeenCalled();
    });

    it('throws when image to delete is not found', async () => {
        supabaseAdmin.__setSingleQueue([{ data: null, error: null }]);

        await expect(deleteImageById(999)).rejects.toThrow('Image not found');
    });
});
