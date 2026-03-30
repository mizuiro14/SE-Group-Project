import { Router } from 'express';
import productController from '../controllers/productController';

const router = Router();

// Product CRUD operations
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/best-sellers', productController.getBestSellers);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.patch('/:id/quantity', productController.updateProductQuantity);

export default router;
