import { Router } from 'express';
import userController from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.put('/update', authenticate, userController.updateUserProfile);
router.delete('/:email', userController.deleteTestUser);

export default router