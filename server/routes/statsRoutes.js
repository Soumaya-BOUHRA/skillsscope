import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { getDashboardStats } from '../controllers/statsController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/dashboard', protect, asyncHandler(getDashboardStats));

export default router;
