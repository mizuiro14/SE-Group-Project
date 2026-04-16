import { Router } from 'express';
import {
  createBuyer,
  getBuyerById,
  getBuyerByUserId,
  updateBuyer,
  deleteBuyer,
  getAllBuyers,
} from '../controllers/buyerController';
// import { authenticate } from '../middleware/authMiddleware'; // Assuming you have an auth middleware

const router = Router();

// Routes for Buyer management
// router.use(authenticate); // Apply authentication middleware to all buyer routes if needed

router.post('/', createBuyer); // Create a new buyer (might be used internally or by admin)
router.get('/', getAllBuyers); // Get all buyers
router.get('/:id', getBuyerById); // Get buyer by buyer ID
router.get('/user/:userId', getBuyerByUserId); // Get buyer by associated user ID
router.put('/:id', updateBuyer); // Update buyer by buyer ID
router.delete('/:id', deleteBuyer); // Delete buyer by buyer ID

export default router;
