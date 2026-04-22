import request from 'supertest';
import express, { Express } from 'express';
import productRoutes from '../routes/productRoute';
import productService from '../services/productService';

jest.mock('../services/productService', () => ({
    __esModule: true,
    default: {
        getAllProducts: jest.fn(),
        getProductById: jest.fn(),
        createProduct: jest.fn(),
        updateProduct: jest.fn(),
        deleteProduct: jest.fn(),
        getProductsByCategoryId: jest.fn(),
        getBestSellers: jest.fn(),
        searchProducts: jest.fn(),
        updateProductQuantity: jest.fn()
    }
}));

const createTestApp = (): Express => {
    const app = express();
    app.use(express.json());
    app.use('/api/products', productRoutes);
    return app;
};

describe('Product Integration Tests', () => {
    let app: Express;

    beforeAll(() => {
        app = createTestApp();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET endpoints', () => {
        it('returns products for GET /api/products', async () => {
            (productService.getAllProducts as jest.Mock).mockResolvedValue([{ id: 1, name: 'Product A' }]);

            const res = await request(app).get('/api/products');

            expect(res.status).toBe(200);
            expect(res.body).toEqual([{ id: 1, name: 'Product A' }]);
            expect(productService.getAllProducts).toHaveBeenCalledWith({
                category_id: undefined,
                search: undefined,
                limit: 20,
                offset: 0,
                seller_id: undefined
            });
        });

        it('returns 400 when GET /api/products/search has empty query', async () => {
            const res = await request(app).get('/api/products/search').query({ query: '   ' });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Search query is required');
            expect(productService.searchProducts).not.toHaveBeenCalled();
        });

        it('returns a product for GET /api/products/:id', async () => {
            (productService.getProductById as jest.Mock).mockResolvedValue({ id: 10, name: 'Found Product' });

            const res = await request(app).get('/api/products/10');

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ id: 10, name: 'Found Product' });
            expect(productService.getProductById).toHaveBeenCalledWith(10);
        });
    });

    describe('POST endpoints', () => {
        it('returns 400 when POST /api/products misses required fields', async () => {
            const res = await request(app)
                .post('/api/products')
                .send({ name: 'Missing seller' });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Name, price, quantity, and seller_id are required');
            expect(productService.createProduct).not.toHaveBeenCalled();
        });
    });
});
