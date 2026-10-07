import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { getHistory } from '../controllers/historyController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', protect, asyncHandler(getHistory));

export default router;
