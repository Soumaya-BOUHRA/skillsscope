import Match from '../models/Match.js';
import Analysis from '../models/Analysis.js';
import Resume from '../models/Resume.js';
import Job from '../models/Job.js';
import { matchResumeWithJob } from './aiService.js';
import { MATCH_CATEGORIES, MATCH_TOTAL_WEIGHT } from '../utils/scoringWeights.js';
import { buildProfilePayload } from './careerRecommendationService.js';

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const ratioScore = (part, ratio) => Math.round(clamp(ratio, 0, 1) * part.weight * 10) / 10;

const EXPERIENCE_FACTOR = { exceeds: 1, meets: 0.85, below: 0.35 };
const EDUCATION_FACTOR = { compatible: 1, partial: 0.6, incompatible: 0.1 };

/**
 * Computes the matching score with fixed backend weights — the AI only
 * provides the analysis, never the final score.
 */
export function computeMatchScore(aiResult, job) {
  const parts = Object.fromEntries(MATCH_CATEGORIES.map((c) => [c.key, c]));

  const requiredSkills = aiResult.requiredSkills.length
    ? aiResult.requiredSkills
    : (job.skills || []).filter((s) => typeof s === 'string' && s.trim());

  const skillRatio =
    requiredSkills.length > 0
      ? aiResult.matchingSkills.length / requiredSkills.length
      : aiResult.matchingSkills.length > 0
        ? 1
        : 0;

  const experienceRatio = EXPERIENCE_FACTOR[aiResult.experience.verdict] ?? 0.5;
  const educationRatio = EDUCATION_FACTOR[aiResult.education.verdict] ?? 0.5;
  const projectRatio = aiResult.projects.length > 0 ? Math.min(1, aiResult.projects.length / 2) : 0.25;

  const keywordUniverse = Math.max(requiredSkills.length, 1);
  const keywordRatio = aiResult.matchedKeywords.length / keywordUniverse;

  const certificationRatio = aiResult.missingCertifications.length === 0 ? 1 : 0.4;

  const breakdown = [
    {
      key: 'skills',
      label: parts.skills.label,
      weight: parts.skills.weight,
      max: parts.skills.weight,
      score: ratioScore(parts.skills, skillRatio),
      details: [
        `${aiResult.matchingSkills.length}/${requiredSkills.length || 0} required skills matched.`,
        ...(aiResult.missingSkills.length ? [`Missing: ${aiResult.missingSkills.join(', ')}.`] : []),
      ],
    },
    {
      key: 'experience',
      label: parts.experience.label,
      weight: parts.experience.weight,
      max: parts.experience.weight,
      score: ratioScore(parts.experience, experienceRatio),
      details: [aiResult.experience.explanation || aiResult.experience.verdict],
    },
    {
      key: 'education',
      label: parts.education.label,
      weight: parts.education.weight,
      max: parts.education.weight,
      score: ratioScore(parts.education, educationRatio),
      details: [aiResult.education.explanation || aiResult.education.verdict],
    },
    {
      key: 'projects',
      label: parts.projects.label,
      weight: parts.projects.weight,
      max: parts.projects.weight,
      score: ratioScore(parts.projects, projectRatio),
      details: [
        aiResult.projects.length
          ? `Relevant projects: ${aiResult.projects.join(', ')}.`
          : 'No directly relevant project highlighted.',
      ],
    },
    {
      key: 'keywords',
      label: parts.keywords.label,
      weight: parts.keywords.weight,
      max: parts.keywords.weight,
      score: ratioScore(parts.keywords, Math.min(1, keywordRatio)),
      details: [
        aiResult.matchedKeywords.length
          ? `Matched keywords: ${aiResult.matchedKeywords.slice(0, 8).join(', ')}.`
          : 'Few job keywords present in the CV.',
      ],
    },
    {
      key: 'certifications',
      label: parts.certifications.label,
      weight: parts.certifications.weight,
      max: parts.certifications.weight,
      score: ratioScore(parts.certifications, certificationRatio),
      details: [
        aiResult.missingCertifications.length
          ? `Missing certifications: ${aiResult.missingCertifications.join(', ')}.`
          : 'No required certification missing.',
      ],
    },
  ];

  const total = breakdown.reduce((sum, p) => sum + p.score, 0);

  return {
    overallScore: Math.round(clamp(total, 0, 100)),
    scoreBreakdown: breakdown,
    totalWeight: MATCH_TOTAL_WEIGHT,
  };
}

function notFound(message) {
  return Object.assign(new Error(message), { statusCode: 404 });
}

export async function createMatch({ userId, resumeId, jobId }) {
  const [resume, job] = await Promise.all([
    Resume.findOne({ _id: resumeId, user: userId }),
    Job.findOne({ _id: jobId, user: userId }),
  ]);

  if (!resume) throw notFound('CV not found.');
  if (!job) throw notFound('Job offer not found.');

  const analysis = await Analysis.findOne({ resume: resume._id, user: userId }).sort({ createdAt: -1 });
  if (!analysis) {
    throw Object.assign(new Error('Analyze this CV before matching it with a job.'), { statusCode: 400 });
  }

  const aiResult = await matchResumeWithJob(buildProfilePayload(analysis), {
    title: job.title,
    company: job.company,
    location: job.location,
    description: job.description,
    requiredSkills: job.skills,
    experienceRequired: job.experienceRequired,
    educationRequired: job.educationRequired,
  });

  const { overallScore, scoreBreakdown } = computeMatchScore(aiResult, job);

  const match = await Match.create({
    user: userId,
    resume: resume._id,
    analysis: analysis._id,
    job: job._id,
    overallScore,
    scoreBreakdown,
    matchingSkills: aiResult.matchingSkills,
    missingSkills: aiResult.missingSkills,
    matchingExperience: aiResult.experience.explanation,
    missingExperience: aiResult.experience.verdict === 'below' ? aiResult.experience.explanation : '',
    matchingEducation: aiResult.education.explanation,
    relevantProjects: aiResult.projects,
    matchedKeywords: aiResult.matchedKeywords,
    missingCertifications: aiResult.missingCertifications,
    recommendation: aiResult.recommendation,
    summary: aiResult.summary,
  });

  return match;
}

export async function listMatchesForJob({ userId, jobId }) {
  const job = await Job.findOne({ _id: jobId, user: userId });
  if (!job) throw notFound('Job offer not found.');
  const matches = await Match.find({ user: userId, job: job._id }).sort({ createdAt: -1 });
  return matches;
}

export default { createMatch, computeMatchScore, listMatchesForJob };
