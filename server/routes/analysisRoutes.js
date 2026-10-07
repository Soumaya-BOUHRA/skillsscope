import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import {
  analyzeResumeController,
  getAnalysisController,
  getCareersController,
} from '../controllers/analysisController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(protect);

router.post('/:resumeId', asyncHandler(analyzeResumeController));
router.get('/:resumeId', asyncHandler(getAnalysisController));
router.get('/:id/careers', asyncHandler(getCareersController));

export default router;
