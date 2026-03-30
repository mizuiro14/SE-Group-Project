import request from 'supertest';
import express from 'express';
import productController from '../controllers/productController';
import productService from '../services/productService';

jest.mock('../SupabaseClient', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            gt: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            or: jest.fn().mockReturnThis(),
            range: jest.fn().mockReturnThis(),
        })),
    },
}));

// Mock the entire productService module
jest.mock('../services/productService');

const app = express();
app.use(express.json());

// Product routes
app.post('/products', productController.createProduct);
app.get('/products/:id', productController.getProductById);
app.put('/products/:id', productController.updateProduct);
app.delete('/products/:id', productController.deleteProduct);
app.get('/products', productController.getAllProducts); // For testing getAllProducts

describe('Product API Integration Tests', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    // Happy Path 1: Create Product
    it('should create a new product successfully', async () => {
        const newProduct = {
            name: 'Test Product',
            description: 'A product for testing',
            price: 99.99,
            quantity: 10,
            category_id: 1,
            sku: 'TP-001',
        };
        const createdProduct = { id: 1, ...newProduct, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };

        (productService.createProduct as jest.Mock).mockResolvedValue(createdProduct);

        const res = await request(app)
            .post('/products')
            .send(newProduct);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual(createdProduct);
        expect(productService.createProduct).toHaveBeenCalledWith({
            name: 'Test Product',
            description: 'A product for testing',
            price: 99.99,
            quantity: 10,
            category_id: 1,
            sku: 'TP-001',
        });
    });

    // Happy Path 2: Get Product by ID
    it('should retrieve a product by ID successfully', async () => {
        const product = {
            id: 1,
            name: 'Test Product',
            description: 'A product for testing',
            price: 99.99,
            quantity: 10,
            category_id: 1,
            sku: 'TP-001',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        (productService.getProductById as jest.Mock).mockResolvedValue(product);

        const res = await request(app)
            .get(`/products/${product.id}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(product);
        expect(productService.getProductById).toHaveBeenCalledWith(product.id);
    });

    // Happy Path 3: Update Product
    it('should update an existing product successfully', async () => {
        const productId = 1;
        const updates = { price: 109.99, quantity: 5 };
        const updatedProduct = {
            id: productId,
            name: 'Test Product',
            description: 'A product for testing',
            price: 109.99,
            quantity: 5,
            category_id: 1,
            sku: 'TP-001',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        (productService.updateProduct as jest.Mock).mockResolvedValue(updatedProduct);

        const res = await request(app)
            .put(`/products/${productId}`)
            .send(updates);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(updatedProduct);
        expect(productService.updateProduct).toHaveBeenCalledWith(productId, updates);
    });

    // Sad Path 1: Create Product with Invalid Data (missing name)
    it('should return 400 if required fields are missing when creating a product', async () => {
        const invalidProduct = {
            description: 'A product for testing',
            price: 99.99,
            quantity: 10,
            category_id: 1,
            sku: 'TP-002',
        };

        const res = await request(app)
            .post('/products')
            .send(invalidProduct);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({ error: 'Name, price, and quantity are required' });
        expect(productService.createProduct).not.toHaveBeenCalled();
    });

    // Sad Path 2: Get Non-Existent Product
    it('should return 404 if product is not found', async () => {
        const nonExistentId = 999;
        (productService.getProductById as jest.Mock).mockRejectedValue(new Error('Product not found'));

        const res = await request(app)
            .get(`/products/${nonExistentId}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({ error: 'Product not found' });
        expect(productService.getProductById).toHaveBeenCalledWith(nonExistentId);
    });
});
