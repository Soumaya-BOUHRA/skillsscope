import Resume from '../models/Resume.js';
import Analysis from '../models/Analysis.js';
import { extractResumeText } from '../services/documentService.js';
import { analyzeResume, calculateResumeInsights, AiError } from '../services/aiService.js';
import { calculateScore, buildFeedback } from '../services/scoringService.js';
import { generateCareerRecommendations } from '../services/careerRecommendationService.js';

function fail(statusCode, message, code) {
  return Object.assign(new Error(message), { statusCode, code });
}

async function extractText(resume) {
  if (resume.extractedText?.trim()) {
    return { text: resume.extractedText, method: resume.extractionMethod || 'direct' };
  }

  const { text, method } = await extractResumeText(resume.filePath, resume.fileType);

  if (!text || !text.trim()) {
    throw fail(422, 'No readable text could be extracted from this file.', 'EMPTY_DOCUMENT');
  }

  resume.extractedText = text;
  resume.extractionMethod = method;
  resume.status = 'processing';
  resume.error = null;
  await resume.save();

  return { text, method };
}

export async function analyzeResumeController(req, res) {
  const resume = await Resume.findOne({ _id: req.params.resumeId, user: req.user._id });
  if (!resume) throw fail(404, 'CV not found.');

  resume.status = 'processing';
  await resume.save();

  try {
    const { text } = await extractText(resume);

    const analysis = await analyzeResume(text);
    const insights = calculateResumeInsights(analysis, text);
    const { score, scoreBreakdown } = calculateScore(analysis, insights);
    const feedback = buildFeedback(analysis, scoreBreakdown);

    const document = await Analysis.create({
      resume: resume._id,
      user: req.user._id,
      score,
      scoreBreakdown,
      profile: analysis.profile,
      skills: analysis.skills,
      technicalSkills: analysis.technicalSkills,
      softSkills: analysis.softSkills,
      tools: analysis.tools,
      technologies: analysis.technologies,
      experience: analysis.experience,
      education: analysis.education,
      certifications: analysis.certifications,
      languages: analysis.languages,
      projects: analysis.projects,
      strengths: feedback.strengths,
      weaknesses: feedback.weaknesses,
      recommendations: feedback.recommendations,
      careerRecommendations: [],
    });

    resume.status = 'analyzed';
    resume.error = null;
    await resume.save();

    try {
      await generateCareerRecommendations(document._id, { user: req.user._id });
    } catch (err) {
      console.warn('[analysis] career recommendations failed:', err.message);
    }

    const saved = await Analysis.findById(document._id);

    return res.status(201).json({
      success: true,
      data: { analysis: saved.toPublicJSON(), resume: resume.toPublicJSON() },
    });
  } catch (err) {
    resume.status = 'failed';
    resume.error = err.message || 'Analysis failed.';
    await resume.save();
    throw err;
  }
}

export async function getAnalysisController(req, res) {
  const resume = await Resume.findOne({ _id: req.params.resumeId, user: req.user._id });
  if (!resume) throw fail(404, 'CV not found.');

  const analysis = await Analysis.findOne({ resume: resume._id, user: req.user._id }).sort({ createdAt: -1 });

  return res.json({
    success: true,
    data: { analysis: analysis ? analysis.toPublicJSON() : null, resume: resume.toPublicJSON() },
  });
}

export async function getCareersController(req, res) {
  const analysis = await Analysis.findOne({ _id: req.params.id, user: req.user._id });
  if (!analysis) throw fail(404, 'Analysis not found.');

  const force = req.query.force === 'true';

  try {
    const recommendations = await generateCareerRecommendations(analysis._id, {
      user: req.user._id,
      force,
    });
    return res.json({ success: true, data: { recommendations } });
  } catch (err) {
    if (err instanceof AiError) throw err;
    throw fail(502, 'Could not generate career recommendations. Please retry.');
  }
}

export default { analyzeResumeController, getAnalysisController, getCareersController };
