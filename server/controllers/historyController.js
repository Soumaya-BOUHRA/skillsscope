import Analysis from '../models/Analysis.js';
import Match from '../models/Match.js';
import Resume from '../models/Resume.js';

export async function getHistory(req, res) {
  const userId = req.user._id;
  const type = String(req.query.type || 'all');
  const search = String(req.query.q || '').trim().toLowerCase();
  const sort = String(req.query.sort || 'newest');
  const limit = Math.min(Number(req.query.limit) || 50, 100);

  const items = [];

  if (type === 'all' || type === 'analyses') {
    const analyses = await Analysis.find({ user: userId })
      .populate('resume', 'originalName fileType createdAt')
      .sort({ createdAt: -1 })
      .limit(limit);

    for (const a of analyses) {
      items.push({
        id: a._id.toString(),
        kind: 'analysis',
        title: a.resume?.originalName || 'CV analysis',
        subtitle: a.profile?.fullName || a.profile?.email || '',
        score: a.score,
        scoreLabel: 'CV score',
        createdAt: a.createdAt,
        resume: a.resume?._id?.toString(),
        careers: a.careerRecommendations?.length ?? 0,
        searchable: [a.resume?.originalName, a.profile?.fullName, a.profile?.email].filter(Boolean).join(' ').toLowerCase(),
      });
    }
  }

  if (type === 'all' || type === 'matches') {
    const matches = await Match.find({ user: userId })
      .populate('job', 'title company createdAt')
      .populate('resume', 'originalName')
      .sort({ createdAt: -1 })
      .limit(limit);

    for (const m of matches) {
      items.push({
        id: m._id.toString(),
        kind: 'match',
        title: m.job?.title || 'Job match',
        subtitle: m.job?.company || m.resume?.originalName || '',
        score: m.overallScore,
        scoreLabel: 'Match score',
        createdAt: m.createdAt,
        job: m.job?._id?.toString(),
        resume: m.resume?._id?.toString(),
        searchable: [m.job?.title, m.job?.company, m.resume?.originalName].filter(Boolean).join(' ').toLowerCase(),
      });
    }
  }

  let filtered = items;
  if (search) filtered = filtered.filter((item) => item.searchable.includes(search));

  filtered.sort((a, b) => {
    if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sort === 'score-desc') return b.score - a.score;
    if (sort === 'score-asc') return a.score - b.score;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return res.json({ success: true, data: { items: filtered.slice(0, limit) } });
}

export default { getHistory };
