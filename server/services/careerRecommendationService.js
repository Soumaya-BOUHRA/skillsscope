import Analysis from '../models/Analysis.js';
import { getCareerRecommendations, AiError } from './aiService.js';

function buildProfilePayload(analysis) {
  return {
    profile: analysis.profile,
    skills: analysis.skills.map((s) => ({ name: s.name, category: s.category, level: s.level })),
    technicalSkills: analysis.technicalSkills,
    softSkills: analysis.softSkills,
    tools: analysis.tools,
    technologies: analysis.technologies,
    experience: analysis.experience.map((e) => ({
      title: e.title,
      company: e.company,
      startDate: e.startDate,
      endDate: e.endDate,
      current: e.current,
      description: e.description,
    })),
    education: analysis.education,
    certifications: analysis.certifications,
    languages: analysis.languages,
    projects: analysis.projects,
    cvScore: analysis.score,
  };
}

/**
 * Generates career recommendations for an analysis and persists them.
 * Recommendations are grounded in the extracted profile only.
 */
export async function generateCareerRecommendations(analysisId, { user, force = false } = {}) {
  const analysis = await Analysis.findOne({ _id: analysisId, ...(user ? { user } : {}) });
  if (!analysis) {
    throw Object.assign(new Error('Analysis not found.'), { statusCode: 404 });
  }

  if (!force && analysis.careerRecommendations?.length > 0) {
    return analysis.careerRecommendations;
  }

  const recommendations = await getCareerRecommendations(buildProfilePayload(analysis));

  analysis.careerRecommendations = recommendations;
  await analysis.save();

  return analysis.careerRecommendations;
}

export async function getRecommendationsForAnalysis(analysisId, { user } = {}) {
  const analysis = await Analysis.findOne({ _id: analysisId, ...(user ? { user } : {}) });
  if (!analysis) {
    throw Object.assign(new Error('Analysis not found.'), { statusCode: 404 });
  }

  if (analysis.careerRecommendations?.length > 0) {
    return { recommendations: analysis.careerRecommendations, analysisId: analysis._id };
  }

  const recommendations = await generateCareerRecommendations(analysisId, { user });
  return { recommendations, analysisId: analysis._id };
}

export { buildProfilePayload, AiError };
export default { generateCareerRecommendations, getRecommendationsForAnalysis };
