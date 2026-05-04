import request from 'supertest';
import express, { Express } from 'express';
import shippingRoutes from '../routes/shippingRoute';
import shippingService from '../services/shippingService';

jest.mock('../services/shippingService', () => ({
    __esModule: true,
    default: {
        getAllShippings: jest.fn(),
        getShippingById: jest.fn(),
        getShippingByOrderId: jest.fn(),
        createShipping: jest.fn(),
        updateShipping: jest.fn(),
        deleteShipping: jest.fn(),
    },
}));

const createTestApp = (): Express => {
    const app = express();
    app.use(express.json());
    app.use('/api/shipping', shippingRoutes);
    return app;
};

describe('Shipping Integration Tests', () => {
    let app: Express;

    beforeAll(() => {
        app = createTestApp();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/shipping', () => {
        it('returns all shippings', async () => {
            (shippingService.getAllShippings as jest.Mock).mockResolvedValue([{ id: 1, order_id: 10 }]);

            const res = await request(app).get('/api/shipping');

            expect(res.status).toBe(200);
            expect(res.body).toEqual([{ id: 1, order_id: 10 }]);
            expect(shippingService.getAllShippings).toHaveBeenCalledWith({});
        });

        it('passes parsed query filters to service', async () => {
            (shippingService.getAllShippings as jest.Mock).mockResolvedValue([{ id: 2, order_id: 20, status: 'pending' }]);

            const res = await request(app)
                .get('/api/shipping')
                .query({ status: 'pending', order_id: '20', limit: '5', offset: '10' });

            expect(res.status).toBe(200);
            expect(shippingService.getAllShippings).toHaveBeenCalledWith({
                status: 'pending',
                order_id: 20,
                limit: 5,
                offset: 10,
            });
        });

        it('returns 500 when listing shippings fails', async () => {
            (shippingService.getAllShippings as jest.Mock).mockRejectedValue(new Error('list failed'));

            const res = await request(app).get('/api/shipping');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('list failed');
        });
    });

    describe('GET /api/shipping/:id', () => {
        it('returns shipping by id', async () => {
            (shippingService.getShippingById as jest.Mock).mockResolvedValue({ id: 11, order_id: 8, status: 'pending' });

            const res = await request(app).get('/api/shipping/11');

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(11);
            expect(shippingService.getShippingById).toHaveBeenCalledWith(11);
        });

        it('returns 404 when shipping is not found', async () => {
            (shippingService.getShippingById as jest.Mock).mockRejectedValue(new Error('Shipping not found'));

            const res = await request(app).get('/api/shipping/9999');

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Shipping not found');
        });

        it('returns 500 for non-not-found errors', async () => {
            (shippingService.getShippingById as jest.Mock).mockRejectedValue(new Error('db down'));

            const res = await request(app).get('/api/shipping/1');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('db down');
        });
    });

    describe('GET /api/shipping/order/:orderId', () => {
        it('returns shippings for an order', async () => {
            (shippingService.getShippingByOrderId as jest.Mock).mockResolvedValue([
                { id: 21, order_id: 77 },
                { id: 22, order_id: 77 },
            ]);

            const res = await request(app).get('/api/shipping/order/77');

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(shippingService.getShippingByOrderId).toHaveBeenCalledWith(77);
        });

        it('returns 500 when listing by order id fails', async () => {
            (shippingService.getShippingByOrderId as jest.Mock).mockRejectedValue(new Error('order lookup failed'));

            const res = await request(app).get('/api/shipping/order/77');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('order lookup failed');
        });
    });

    describe('POST /api/shipping', () => {
        it('creates shipping successfully', async () => {
            const payload = {
                order_id: 15,
                address: '123 Main St',
                status: 'pending',
            };
            (shippingService.createShipping as jest.Mock).mockResolvedValue({ id: 30, ...payload });

            const res = await request(app).post('/api/shipping').send(payload);

            expect(res.status).toBe(201);
            expect(res.body.id).toBe(30);
            expect(shippingService.createShipping).toHaveBeenCalledWith(payload);
        });

        it('returns 400 when required fields are missing', async () => {
            const res = await request(app)
                .post('/api/shipping')
                .send({ order_id: 15 });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('order_id and address are required');
            expect(shippingService.createShipping).not.toHaveBeenCalled();
        });

        it('returns 500 when create fails', async () => {
            (shippingService.createShipping as jest.Mock).mockRejectedValue(new Error('create failed'));

            const res = await request(app)
                .post('/api/shipping')
                .send({ order_id: 15, address: '123 Main St' });

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('create failed');
        });
    });

    describe('PUT /api/shipping/:id', () => {
        it('updates shipping successfully', async () => {
            (shippingService.updateShipping as jest.Mock).mockResolvedValue({ id: 40, status: 'shipped' });

            const res = await request(app)
                .put('/api/shipping/40')
                .send({ status: 'shipped' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ id: 40, status: 'shipped' });
            expect(shippingService.updateShipping).toHaveBeenCalledWith(40, { status: 'shipped' });
        });

        it('returns 404 when shipping to update is not found', async () => {
            (shippingService.updateShipping as jest.Mock).mockRejectedValue(new Error('Shipping not found'));

            const res = await request(app)
                .put('/api/shipping/4000')
                .send({ status: 'delivered' });

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Shipping not found');
        });
    });

    describe('DELETE /api/shipping/:id', () => {
        it('deletes shipping successfully', async () => {
            (shippingService.deleteShipping as jest.Mock).mockResolvedValue(undefined);

            const res = await request(app).delete('/api/shipping/50');

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Shipping deleted successfully');
            expect(shippingService.deleteShipping).toHaveBeenCalledWith(50);
        });

        it('returns 500 when delete fails', async () => {
            (shippingService.deleteShipping as jest.Mock).mockRejectedValue(new Error('delete failed'));

            const res = await request(app).delete('/api/shipping/50');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('delete failed');
        });
    });
});
