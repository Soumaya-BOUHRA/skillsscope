import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { createMatch, listMatchesForJob } from '../services/matchingService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(protect);

router.post(
  '/:jobId/match/:resumeId',
  asyncHandler(async (req, res) => {
    const match = await createMatch({
      userId: req.user._id,
      resumeId: req.params.resumeId,
      jobId: req.params.jobId,
    });
    res.status(201).json({ success: true, data: { match: match.toPublicJSON() } });
  })
);

router.get(
  '/:jobId/matches',
  asyncHandler(async (req, res) => {
    const matches = await listMatchesForJob({ userId: req.user._id, jobId: req.params.jobId });
    res.json({ success: true, data: { matches: matches.map((m) => m.toPublicJSON()) } });
  })
);

export default router;
