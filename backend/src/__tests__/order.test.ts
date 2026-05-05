import {
    getAllOrders,
    getOrderById,
    getOrdersByUserId,
    createOrder,
    updateOrderStatus,
    deleteOrder,
} from '../services/orderService';

jest.mock('../SupabaseClient', () => {
    let queue: any[] = [];

    const chain: any = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn(async () => queue.shift() ?? { data: null, error: null }),
    };

    chain.then = (onFulfilled: any) => Promise.resolve(onFulfilled(queue.shift() ?? { data: null, error: null }));

    return {
        supabase: {
            from: jest.fn(() => chain),
            __setQueue: (results: any[]) => {
                queue = [...results];
            },
        },
    };
});

describe('Order Service Unit Tests', () => {
    const { supabase } = require('../SupabaseClient');

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        supabase.__setQueue([]);
    });

    it('retrieves all orders with order_items (happy)', async () => {
        const rows = [{ id: 1, user_id: 10, status: 'pending', total: 100, order_items: [{ id: 11 }] }];
        supabase.__setQueue([{ data: rows, error: null }]);

        const res = await getAllOrders();
        expect(res).toEqual(rows);
    });

    it('handles error when retrieving all orders', async () => {
        const error = { message: 'Error retrieving orders' };
        supabase.__setQueue([{ data: null, error }]);

        await expect(getAllOrders()).rejects.toThrow(error.message);
    });

    it('retrieves order by id (happy)', async () => {
        const row = { id: 2, user_id: 20, status: 'paid', total: 50, order_items: [{ id: 21 }] };
        supabase.__setQueue([{ data: row, error: null }]);

        const res = await getOrderById(2);
        expect(res).toEqual(row);
    });

    it('throws when order by id is not found', async () => {
        supabase.__setQueue([{ data: null, error: null }]);

        await expect(getOrderById(999)).rejects.toThrow('Order not found');
    });

    it('retrieves orders by user id (happy)', async () => {
        const rows = [{ id: 3, user_id: 30, status: 'pending', total: 35, order_items: [] }];
        supabase.__setQueue([{ data: rows, error: null }]);

        const res = await getOrdersByUserId(30);
        expect(res).toEqual(rows);
    });

    it('creates order and order_items with computed totals (happy)', async () => {
        const input = {
            user_id: 44,
            status: 'pending',
            items: [
                { product_id: 1, quantity: 2, unit_price: 10 },
                { product_id: 2, quantity: 3, unit_price: 5 },
            ],
        } as any;

        const createdOrder = { id: 100, user_id: 44, status: 'pending', total: 35 };
        const fetchedOrder = {
            ...createdOrder,
            order_items: [
                { id: 1, order_id: 100, product_id: 1, quantity: 2, unit_price: 10, total_price: 20 },
                { id: 2, order_id: 100, product_id: 2, quantity: 3, unit_price: 5, total_price: 15 },
            ],
        };

        supabase.__setQueue([
            { data: createdOrder, error: null },
            { data: null, error: null },
            { data: fetchedOrder, error: null },
        ]);

        const res = await createOrder(input);

        expect(res).toEqual(fetchedOrder);
        expect(supabase.from).toHaveBeenCalledWith('orders');
        expect(supabase.from).toHaveBeenCalledWith('order_items');
        expect((supabase.from as jest.Mock).mock.results.length).toBeGreaterThanOrEqual(3);

        const chain = (supabase.from as jest.Mock).mock.results[0].value;
        expect(chain.insert).toHaveBeenCalledWith([{ user_id: 44, status: 'pending', total: 35 }]);
        expect(chain.insert).toHaveBeenCalledWith([
            { order_id: 100, product_id: 1, quantity: 2, price: 10 },
            { order_id: 100, product_id: 2, quantity: 3, price: 5 },
        ]);
    });

    it('throws when creating order fails', async () => {
        supabase.__setQueue([{ data: null, error: { message: 'insert order failed' } }]);

        await expect(createOrder({ user_id: 1, items: [{ product_id: 1, quantity: 1, unit_price: 1 }] } as any)).rejects.toThrow('insert order failed');
    });

    it('throws when creating order_items fails', async () => {
        supabase.__setQueue([
            { data: { id: 200, user_id: 9, status: 'pending', total: 10 }, error: null },
            { data: null, error: { message: 'insert items failed' } },
        ]);

        await expect(createOrder({ user_id: 9, items: [{ product_id: 1, quantity: 1, unit_price: 10 }] } as any)).rejects.toThrow('insert items failed');
    });

    it('updates order status (happy)', async () => {
        const updated = { id: 5, status: 'shipped', user_id: 1, total: 99 };
        supabase.__setQueue([{ data: updated, error: null }]);

        const res = await updateOrderStatus(5, 'shipped');
        expect(res).toEqual(updated);

        const chain = (supabase.from as jest.Mock).mock.results[0].value;
        expect(chain.update).toHaveBeenCalled();
        const updateArg = chain.update.mock.calls[0][0];
        expect(updateArg.status).toBe('shipped');
        expect(typeof updateArg.updated_at).toBe('string');
    });

    it('deletes order_items first and then order (happy)', async () => {
        supabase.__setQueue([
            { data: null, error: null },
            { data: null, error: null },
        ]);

        await expect(deleteOrder(77)).resolves.toBeUndefined();

        expect(supabase.from).toHaveBeenNthCalledWith(1, 'order_items');
        expect(supabase.from).toHaveBeenNthCalledWith(2, 'orders');
    });
});
