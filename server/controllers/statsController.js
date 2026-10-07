import Analysis from '../models/Analysis.js';
import Match from '../models/Match.js';
import Resume from '../models/Resume.js';
import Job from '../models/Job.js';

export async function getDashboardStats(req, res) {
  const userId = req.user._id;

  const [resumeCount, jobCount, matchCount, latestAnalysis, bestMatch, skillAggregation] = await Promise.all([
    Resume.countDocuments({ user: userId }),
    Job.countDocuments({ user: userId }),
    Match.countDocuments({ user: userId }),
    Analysis.findOne({ user: userId }).sort({ createdAt: -1 }),
    Match.findOne({ user: userId }).sort({ overallScore: -1, createdAt: -1 }),
    Analysis.aggregate([
      { $match: { user: userId } },
      { $sort: { createdAt: -1 } },
      { $limit: 1 },
      { $unwind: '$skills' },
      { $group: { _id: { $toLower: '$skills.name' }, name: { $first: '$skills.name' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
  ]);

  const analyses = await Analysis.find({ user: userId }).sort({ createdAt: -1 }).select('score createdAt profile skills');

  const scoreSeries = analyses
    .slice(0, 12)
    .reverse()
    .map((a, index) => ({
      index: index + 1,
      score: a.score,
      date: a.createdAt,
      name: a.profile?.fullName || a.profile?.email || `CV ${index + 1}`,
    }));

  const skillBreakdown = skillAggregation.map((s) => ({ skill: s.name, count: s.count }));

  return res.json({
    success: true,
    data: {
      counters: {
        resumes: resumeCount,
        jobs: jobCount,
        matches: matchCount,
        analyses: analyses.length,
        bestCvScore: analyses.length ? Math.max(...analyses.map((a) => a.score)) : null,
        latestScore: latestAnalysis?.score ?? null,
        bestMatch: bestMatch?.overallScore ?? null,
        skillsDetected: skillAggregation.length,
      },
      scoreSeries,
      skillBreakdown,
      latestAnalysis: latestAnalysis ? latestAnalysis.toPublicJSON() : null,
    },
  });
}

export default { getDashboardStats };
