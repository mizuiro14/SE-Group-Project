import { getAllShippings, getShippingById, getShippingByOrderId, createShipping, updateShipping, deleteShipping } from '../services/shippingService';

jest.mock('../SupabaseClient', () => {
    let result: any = { data: null, error: null };
    const chain: any = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(async () => result),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
    };

    chain.then = (onFulfilled: any) => Promise.resolve(onFulfilled(result));

    return {
        supabase: { from: jest.fn(() => chain), __setResult: (r: any) => (result = r) },
    };
});

describe('Shipping Service Unit Tests', () => {
    const { supabase } = require('../SupabaseClient');

    beforeEach(() => { jest.clearAllMocks(); jest.restoreAllMocks(); });

    it('retrieves all shippings (happy)', async () => {
        const rows = [{ id: 1, order_id: 10, address: 'a', status: 'pending', created_at: 't', updated_at: 't', shipped_date: null, delivered_date: null }];
        supabase.__setResult({ data: rows, error: null });
        const res = await getAllShippings();
        expect(res).toEqual(rows);
    });

    it('handles error when retrieving all shippings', async () => {
        const error = { message: 'Error retrieving shippings' };
        supabase.__setResult({ data: null, error });
        await expect(getAllShippings()).rejects.toThrow(error.message);
    });

    it('retrieves shipping by id (happy)', async () => {
        const row = { id: 2, order_id: 11, address: 'b', status: 'shipped', created_at: 't', updated_at: 't', shipped_date: null, delivered_date: null };
        supabase.__setResult({ data: row, error: null });
        const res = await getShippingById(2);
        expect(res).toEqual(row);
    });

    it('returns null when shipping by id is not found', async () => {
        supabase.__setResult({ data: null, error: null });
        await expect(getShippingById(99)).rejects.toThrow('Shipping not found');
    });

    it('creates a shipping entry (happy)', async () => {
        const created = { id: 3, order_id: 12, address: 'c', status: 'pending', created_at: 't', updated_at: 't', shipped_date: null, delivered_date: null };
        supabase.__setResult({ data: created, error: null });
        const res = await createShipping({ order_id: 12, address: 'c' } as any);
        expect(res).toEqual(created);
    });

    it('handles error when creating a shipping entry', async () => {
        const error = { message: 'Error creating shipping' };
        supabase.__setResult({ data: null, error });
        await expect(createShipping({ order_id: 12, address: 'c' } as any)).rejects.toThrow(error.message);
    });

    it('updates a shipping entry (happy)', async () => {
        const updated = { id: 4, order_id: 13, address: 'd', status: 'delivered', created_at: 't', updated_at: 't', shipped_date: 't', delivered_date: 't' };
        supabase.__setResult({ data: updated, error: null });
        const res = await updateShipping(4, { status: 'delivered' } as any);
        expect(res).toEqual(updated);
    });

    it('returns null when shipping to update is not found', async () => {
        supabase.__setResult({ data: null, error: null });
        await expect(updateShipping(99, { status: 'delivered' } as any)).rejects.toThrow('Shipping not found');
    });

    it('deletes a shipping entry (happy)', async () => {
        supabase.__setResult({ data: null, error: null });
        await expect(deleteShipping(5)).resolves.toBeUndefined();
    });

    it('handles error when deleting a shipping entry', async () => {
        const error = { message: 'Error deleting shipping' };
        supabase.__setResult({ data: null, error });
        await expect(deleteShipping(99)).rejects.toThrow(error.message);
    });

    it('retrieves shippings by order id (happy)', async () => {
        const rows = [{ id: 6, order_id: 20, address: 'z', status: 'pending', created_at: 't', updated_at: 't', shipped_date: null, delivered_date: null }];
        supabase.__setResult({ data: rows, error: null });
        const res = await getShippingByOrderId(20);
        expect(res).toEqual(rows);
    });
});
