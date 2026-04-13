import request from 'supertest';
import express from 'express';
import productController from '../controllers/productController';
import productService from '../services/productService';

jest.mock('../services/productService');

const app = express();
app.use(express.json());

app.post('/products', productController.createProduct);
app.get('/products/:id', productController.getProductById);
app.put('/products/:id', productController.updateProduct);
app.delete('/products/:id', productController.deleteProduct);
app.get('/products', productController.getAllProducts);

describe('Product Controller Integration Tests', () => {
    beforeEach(() => jest.clearAllMocks());

    it('creates a product via HTTP POST (happy)', async () => {
        const newProduct = { name: 'P1', description: 'd', price: 10, quantity: 1, category_id: null, sku: 'S1' };
        const created = { id: 1, ...newProduct, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        (productService.createProduct as jest.Mock).mockResolvedValue(created);

        const res = await request(app).post('/products').send(newProduct);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual(created);
    });

    it('retrieves product by id (happy)', async () => {
        const product = { id: 2, name: 'P2', description: 'd', price: 5, quantity: 2, category_id: null, sku: 'S2', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        (productService.getProductById as jest.Mock).mockResolvedValue(product);

        const res = await request(app).get(`/products/${product.id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(product);
    });

    it('updates a product (happy)', async () => {
        const updated = { id: 3, name: 'P3', description: 'd', price: 20, quantity: 5, category_id: null, sku: 'S3', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        (productService.updateProduct as jest.Mock).mockResolvedValue(updated);

        const res = await request(app).put(`/products/${updated.id}`).send({ price: 20, quantity: 5 });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(updated);
    });

    it('returns 400 for missing required fields on create (sad)', async () => {
        const res = await request(app).post('/products').send({ price: 10 });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({ error: 'Name, price, and quantity are required' });
    });

    it('returns 404 when product not found (sad)', async () => {
        (productService.getProductById as jest.Mock).mockRejectedValue(new Error('Product not found'));
        const res = await request(app).get('/products/999');
        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({ error: 'Product not found' });
    });
});
