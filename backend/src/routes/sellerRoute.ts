import { Router } from 'express';
import {
  createSeller,
  getSellerById,
  getSellerByUserId,
  updateSeller,
  deleteSeller,
  getAllSellers,
} from '../controllers/sellerController';
// import { authenticate } from '../middleware/authMiddleware'; // Assuming you have an auth middleware

const router = Router();

// Routes for Seller management
// router.use(authenticate); // Apply authentication middleware to all seller routes if needed

router.post('/', createSeller); // Create a new seller (might be used internally or by admin)
router.get('/', getAllSellers); // Get all sellers
router.get('/:id', getSellerById); // Get seller by seller ID
router.get('/user/:userId', getSellerByUserId); // Get seller by associated user ID
router.put('/:id', updateSeller); // Update seller by seller ID
router.delete('/:id', deleteSeller); // Delete seller by seller ID

export default router;
