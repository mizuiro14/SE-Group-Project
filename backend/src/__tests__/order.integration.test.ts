import request from 'supertest';
import express, { Express } from 'express';
import orderRoutes from '../routes/orderRoute';
import orderService from '../services/orderService';

jest.mock('../services/orderService', () => ({
    __esModule: true,
    default: {
        getAllOrders: jest.fn(),
        getOrderById: jest.fn(),
        getOrdersByUserId: jest.fn(),
        createOrder: jest.fn(),
        updateOrderStatus: jest.fn(),
        deleteOrder: jest.fn(),
    },
}));

const createTestApp = (): Express => {
    const app = express();
    app.use(express.json());
    app.use('/api/orders', orderRoutes);
    return app;
};

describe('Order Integration Tests', () => {
    let app: Express;

    beforeAll(() => {
        app = createTestApp();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/orders', () => {
        it('returns all orders', async () => {
            (orderService.getAllOrders as jest.Mock).mockResolvedValue([{ id: 1, user_id: 10 }]);

            const res = await request(app).get('/api/orders');

            expect(res.status).toBe(200);
            expect(res.body).toEqual([{ id: 1, user_id: 10 }]);
            expect(orderService.getAllOrders).toHaveBeenCalledTimes(1);
        });

        it('returns 500 when service throws', async () => {
            (orderService.getAllOrders as jest.Mock).mockRejectedValue(new Error('failed'));

            const res = await request(app).get('/api/orders');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('failed');
        });
    });

    describe('GET /api/orders/:id', () => {
        it('returns an order by id', async () => {
            (orderService.getOrderById as jest.Mock).mockResolvedValue({ id: 12, user_id: 9, order_items: [] });

            const res = await request(app).get('/api/orders/12');

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(12);
            expect(orderService.getOrderById).toHaveBeenCalledWith(12);
        });

        it('returns 404 when order is not found', async () => {
            (orderService.getOrderById as jest.Mock).mockRejectedValue(new Error('Order not found'));

            const res = await request(app).get('/api/orders/9999');

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Order not found');
        });

        it('returns 500 for non-not-found errors', async () => {
            (orderService.getOrderById as jest.Mock).mockRejectedValue(new Error('db unavailable'));

            const res = await request(app).get('/api/orders/3');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('db unavailable');
        });
    });

    describe('GET /api/orders/user/:userId', () => {
        it('returns orders for a user', async () => {
            (orderService.getOrdersByUserId as jest.Mock).mockResolvedValue([{ id: 100, user_id: 44 }]);

            const res = await request(app).get('/api/orders/user/44');

            expect(res.status).toBe(200);
            expect(res.body).toEqual([{ id: 100, user_id: 44 }]);
            expect(orderService.getOrdersByUserId).toHaveBeenCalledWith(44);
        });

        it('returns 500 when listing user orders fails', async () => {
            (orderService.getOrdersByUserId as jest.Mock).mockRejectedValue(new Error('cannot list user orders'));

            const res = await request(app).get('/api/orders/user/44');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('cannot list user orders');
        });
    });

    describe('POST /api/orders', () => {
        it('creates order with order_items successfully', async () => {
            const payload = {
                user_id: 7,
                status: 'pending',
                items: [
                    { product_id: 1, quantity: 2, unit_price: 10 },
                    { product_id: 2, quantity: 1, unit_price: 5 },
                ],
            };
            (orderService.createOrder as jest.Mock).mockResolvedValue({
                id: 55,
                user_id: 7,
                status: 'pending',
                total: 25,
                order_items: [
                    { id: 1, order_id: 55, product_id: 1, quantity: 2, unit_price: 10, total_price: 20 },
                    { id: 2, order_id: 55, product_id: 2, quantity: 1, unit_price: 5, total_price: 5 },
                ],
            });

            const res = await request(app).post('/api/orders').send(payload);

            expect(res.status).toBe(201);
            expect(res.body.id).toBe(55);
            expect(orderService.createOrder).toHaveBeenCalledWith(payload);
        });

        it('returns 400 when user_id is missing', async () => {
            const res = await request(app)
                .post('/api/orders')
                .send({ items: [{ product_id: 1, quantity: 1, unit_price: 1 }] });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('A valid user identifier and items are required');
            expect(orderService.createOrder).not.toHaveBeenCalled();
        });

        it('returns 400 when items is empty', async () => {
            const res = await request(app)
                .post('/api/orders')
                .send({ user_id: 1, items: [] });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('A valid user identifier and items are required');
        });

        it('returns 400 when an item misses required fields', async () => {
            const res = await request(app)
                .post('/api/orders')
                .send({ user_id: 1, items: [{ quantity: 1, unit_price: 10 }] });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Each item must have product_id, quantity and unit_price');
            expect(orderService.createOrder).not.toHaveBeenCalled();
        });

        it('returns 400 when an item has invalid quantity', async () => {
            const res = await request(app)
                .post('/api/orders')
                .send({ user_id: 1, items: [{ product_id: 1, quantity: 0, unit_price: 10 }] });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Invalid quantity or unit_price');
            expect(orderService.createOrder).not.toHaveBeenCalled();
        });
    });

    describe('PUT /api/orders/:id/status', () => {
        it('updates order status', async () => {
            (orderService.updateOrderStatus as jest.Mock).mockResolvedValue({ id: 2, status: 'shipped' });

            const res = await request(app)
                .put('/api/orders/2/status')
                .send({ status: 'shipped' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ id: 2, status: 'shipped' });
            expect(orderService.updateOrderStatus).toHaveBeenCalledWith(2, 'shipped');
        });

        it('returns 400 when status is missing', async () => {
            const res = await request(app)
                .put('/api/orders/2/status')
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Status is required');
            expect(orderService.updateOrderStatus).not.toHaveBeenCalled();
        });
    });

    describe('DELETE /api/orders/:id', () => {
        it('deletes order successfully', async () => {
            (orderService.deleteOrder as jest.Mock).mockResolvedValue(undefined);

            const res = await request(app).delete('/api/orders/88');

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Order deleted successfully');
            expect(orderService.deleteOrder).toHaveBeenCalledWith(88);
        });
    });
});
