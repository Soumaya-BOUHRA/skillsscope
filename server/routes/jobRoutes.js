import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { createJob, listJobs, getJob, deleteJob } from '../controllers/jobController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(protect);

router.post('/', asyncHandler(createJob));
router.get('/', asyncHandler(listJobs));
router.get('/:id', asyncHandler(getJob));
router.delete('/:id', asyncHandler(deleteJob));

export default router;
