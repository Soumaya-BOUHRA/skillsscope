import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { uploadResumeFile } from '../middleware/uploadMiddleware.js';
import {
  uploadResume,
  listResumes,
  getResume,
  getResumeFile,
  deleteResume,
} from '../controllers/cvController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(protect);

router.post('/upload', uploadResumeFile.single('resume'), asyncHandler(uploadResume));
router.get('/', asyncHandler(listResumes));
router.get('/:id/file', asyncHandler(getResumeFile));
router.get('/:id', asyncHandler(getResume));
router.delete('/:id', asyncHandler(deleteResume));

export default router;
