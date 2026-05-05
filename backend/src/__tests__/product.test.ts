import productService, { getAllProducts, getProductById, createProduct, updateProduct } from '../services/productService';

jest.mock('../SupabaseClient', () => {
    let result: any = { data: null, error: null };
    let adminResult: any = { data: [], error: null };

    const makeChain = (getResult: () => any) => {
        const chain: any = {
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(async () => getResult()),
            order: jest.fn(async () => getResult()),
            in: jest.fn().mockReturnThis(),
            gt: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            or: jest.fn().mockReturnThis(),
            range: jest.fn().mockReturnThis(),
            ilike: jest.fn().mockReturnThis(),
            gte: jest.fn().mockReturnThis(),
            lte: jest.fn().mockReturnThis(),
        };
        chain.then = (onFulfilled: any) => Promise.resolve(onFulfilled(getResult()));
        return chain;
    };

    const supabaseChain = makeChain(() => result);
    const supabaseAdminChain = makeChain(() => adminResult);

    return {
        supabase: {
            from: jest.fn(() => supabaseChain),
            __setResult: (r: any) => { result = r; }
        },
        supabaseAdmin: {
            from: jest.fn(() => supabaseAdminChain),
            __setResult: (r: any) => { adminResult = r; }
        }
    };
});

describe('Product Service Unit Tests', () => {
    const { supabase } = require('../SupabaseClient');

    beforeEach(() => { jest.clearAllMocks(); jest.restoreAllMocks(); });

    it('creates a product successfully (happy)', async () => {
        const payload = { name: 'A', description: null, price: 10, quantity: 1, category_id: null, sku: 'A1' };
        const created = { id: 1, ...payload, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        supabase.__setResult({ data: created, error: null });

        const res = await createProduct(payload as any);
        expect(res).toEqual(created);
    });

    it('retrieves a product by id successfully (happy)', async () => {
        const product = { id: 2, name: 'B', description: null, price: 5, quantity: 2, category_id: null, sku: 'B1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        supabase.__setResult({ data: product, error: null });

        const res = await getProductById(2);
        expect(res).toEqual({ ...product, image_url: null });
    });

    it('gets all products with filters (happy)', async () => {
        const list = [{ id: 3, name: 'C', description: null, price: 1, quantity: 3, category_id: 1, sku: 'C1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
        supabase.__setResult({ data: list, error: null });

        const res = await getAllProducts({ category_id: 1 });
        expect(res).toHaveLength(1);
        expect(res[0]).toMatchObject(list[0]);
        expect(res[0]).toHaveProperty('category', null);
    });

    it('gets all products with no filters (happy)', async () => {
        const list = [{ id: 4, name: 'D', description: null, price: 2, quantity: 4, category_id: 2, sku: 'D1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
        supabase.__setResult({ data: list, error: null });

        const res = await getAllProducts({});
        expect(res).toHaveLength(1);
        expect(res[0]).toMatchObject(list[0]);
        expect(res[0]).toHaveProperty('category', null);
    });

    it('handles error when retrieving all products', async () => {
        const error = { message: 'Error retrieving products' };
        supabase.__setResult({ data: null, error });
        await expect(getAllProducts({})).rejects.toThrow(error.message);
    });

    it('throws when creation fails (sad)', async () => {
        supabase.__setResult({ data: null, error: { message: 'insert failed' } });
        await expect(createProduct({ name: 'X', description: null, price: 1, quantity: 1, category_id: null, sku: null } as any)).rejects.toThrow('insert failed');
    });

    it('throws when product not found (sad)', async () => {
        supabase.__setResult({ data: null, error: null });
        await expect(getProductById(999)).rejects.toThrow('Product not found');
    });

    it('updates a product successfully (happy)', async () => {
        const payload = { name: 'Updated Product', price: 15 };
        const updated = { id: 5, name: 'Updated Product', description: null, price: 15, quantity: 1, category_id: null, sku: 'E1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        supabase.__setResult({ data: updated, error: null });

        const res = await updateProduct(5, payload as any);
        expect(res).toEqual(updated);
    });

    it('returns null when product to update is not found', async () => {
        supabase.__setResult({ data: null, error: null });
        await expect(updateProduct(999, { name: 'Nonexistent' } as any)).rejects.toThrow('Product not found');
    });

    it('handles error when updating a product', async () => {
        const error = { message: 'Error updating product' };
        supabase.__setResult({ data: null, error });
        await expect(updateProduct(1, { name: 'Error' } as any)).rejects.toThrow(error.message);
    });

    it('handles error when retrieving product by id', async () => {
        const error = { message: 'Error retrieving product by id' };
        supabase.__setResult({ data: null, error });
        await expect(getProductById(1)).rejects.toThrow(error.message);
    });
});
