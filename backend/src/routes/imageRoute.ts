import { Router } from 'express';
import imageController from '../controllers/imageController';
import { singleImageUpload } from '../middleware/uploadMiddleware';

const router = Router();

router.post('/products/:productId', singleImageUpload, imageController.uploadProductImage);
router.get('/products/:productId', imageController.getImagesByProduct);

router.post('/users/:userId', singleImageUpload, imageController.uploadUserImage);
router.get('/users/:userId', imageController.getImagesByUser);

router.delete('/:id', imageController.deleteImage);

export default router;
