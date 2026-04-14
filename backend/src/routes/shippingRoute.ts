import { Router } from 'express';
import shippingController from '../controllers/shippingController';

const router = Router();

router.get('/', shippingController.getAllShippings);
router.get('/order/:orderId', shippingController.getShippingByOrderId);
router.get('/:id', shippingController.getShippingById);
router.post('/', shippingController.createShipping);
router.put('/:id', shippingController.updateShipping);
router.delete('/:id', shippingController.deleteShipping);

export default router;
