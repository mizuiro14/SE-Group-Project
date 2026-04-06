import { Router } from 'express';
import orderController from '../controllers/orderController';

const router = Router();

router.get('/', orderController.getAllOrders);
router.get('/user/:userId', orderController.getOrdersByUser);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:id/status', orderController.updateOrderStatus);
router.delete('/:id', orderController.deleteOrder);

export default router;
