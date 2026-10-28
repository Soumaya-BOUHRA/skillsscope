import { chatJson, getAiConfig, prepareAiInput, AiError } from './aiClient.js';

const asString = (value, max = 500) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null;

const asArray = (value) => (Array.isArray(value) ? value : []);

const asStringArray = (value, max = 80) =>
  asArray(value)
    .filter((item) => typeof item === 'string' && item.trim())
    .map((item) => item.trim().slice(0, max));

const asNumber = (value, min = 0, max = 100) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, n));
};

function normalizeSkills(value) {
  return asArray(value)
    .map((item) => {
      if (typeof item === 'string') return { name: item.trim(), category: 'general', level: null, years: null };
      if (item && typeof item === 'object') {
        const name = asString(item.name, 80);
        if (!name) return null;
        const level = typeof item.level === 'string' ? item.level.toLowerCase() : null;
        return {
          name,
          category: asString(item.category, 40) || 'general',
          level: ['beginner', 'intermediate', 'advanced', 'expert'].includes(level) ? level : null,
          years: Number.isFinite(Number(item.years)) && Number(item.years) > 0 ? Number(item.years) : null,
        };
      }
      return null;
    })
    .filter(Boolean);
}

function normalizeExperience(value) {
  return asArray(value)
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const title = asString(item.title, 200);
      if (!title) return null;
      return {
        title,
        company: asString(item.company, 200) || '',
        location: asString(item.location, 200),
        startDate: asString(item.startDate, 40),
        endDate: asString(item.endDate, 40),
        current: Boolean(item.current),
        description: asString(item.description, 2000) || '',
      };
    })
    .filter(Boolean);
}

function normalizeEducation(value) {
  return asArray(value)
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const degree = asString(item.degree, 200);
      if (!degree) return null;
      return {
        degree,
        institution: asString(item.institution, 200) || '',
        field: asString(item.field, 200),
        startDate: asString(item.startDate, 40),
        endDate: asString(item.endDate, 40),
      };
    })
    .filter(Boolean);
}

function normalizeCertifications(value) {
  return asArray(value)
    .map((item) => {
      if (typeof item === 'string') return { name: item.trim(), issuer: null, date: null };
      if (!item || typeof item !== 'object') return null;
      const name = asString(item.name, 200);
      if (!name) return null;
      return { name, issuer: asString(item.issuer, 200), date: asString(item.date, 40) };
    })
    .filter(Boolean);
}

function normalizeLanguages(value) {
  return asArray(value)
    .map((item) => {
      if (typeof item === 'string') return { name: item.trim(), level: null };
      if (!item || typeof item !== 'object') return null;
      const name = asString(item.name, 80);
      if (!name) return null;
      return { name, level: asString(item.level, 80) };
    })
    .filter(Boolean);
}

function normalizeProjects(value) {
  return asArray(value)
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const name = asString(item.name, 200);
      if (!name) return null;
      return {
        name,
        description: asString(item.description, 1000) || '',
        technologies: asStringArray(item.technologies, 60),
        url: asString(item.url, 300),
      };
    })
    .filter(Boolean);
}

/**
 * Validates and normalises the raw AI response. Never trusts unvalidated JSON.
 */
export function normalizeAnalysisResult(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new AiError('The AI returned an unexpected payload.', 'AI_INVALID_RESPONSE');
  }

  const profileRaw = raw.profile && typeof raw.profile === 'object' ? raw.profile : {};

  const email = asString(profileRaw.email, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    throw new AiError('The AI returned an invalid email address.', 'AI_INVALID_RESPONSE');
  }

  return {
    profile: {
      fullName: asString(profileRaw.fullName, 120),
      email,
      phone: asString(profileRaw.phone, 40),
      location: asString(profileRaw.location, 160),
      summary: asString(profileRaw.summary, 2000),
    },
    skills: normalizeSkills(raw.skills),
    technicalSkills: asStringArray(raw.technicalSkills),
    softSkills: asStringArray(raw.softSkills),
    tools: asStringArray(raw.tools),
    technologies: asStringArray(raw.technologies),
    experience: normalizeExperience(raw.experience),
    education: normalizeEducation(raw.education),
    certifications: normalizeCertifications(raw.certifications),
    languages: normalizeLanguages(raw.languages),
    projects: normalizeProjects(raw.projects),
    strengths: asStringArray(raw.strengths, 300),
    weaknesses: asStringArray(raw.weaknesses, 300),
    recommendations: asStringArray(raw.recommendations, 300),
  };
}

export function normalizeCareerRecommendations(raw) {
  const list = asArray(raw?.recommendations ?? raw?.careers ?? raw);
  return list
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const jobTitle = asString(item.jobTitle, 120);
      if (!jobTitle) return null;
      return {
        jobTitle,
        compatibilityScore: Math.round(asNumber(item.compatibilityScore, 0, 100) ?? 0),
        matchingSkills: asStringArray(item.matchingSkills),
        missingSkills: asStringArray(item.missingSkills),
        reason: asString(item.reason, 600) || '',
        skillsToDevelop: asStringArray(item.skillsToDevelop),
      };
    })
    .filter(Boolean)
    .slice(0, 8);
}

const RESUME_ANALYSIS_PROMPT = `You are an expert recruiter and career coach analysing a CV.
Analyse ONLY the text provided. Never invent information that is not present.
If a field is not found in the CV, use null (or an empty array for lists).

Return STRICT JSON with this exact structure (no markdown, no commentary):
{
  "profile": { "fullName": string|null, "email": string|null, "phone": string|null, "location": string|null, "summary": string|null },
  "skills": [{ "name": string, "category": string, "level": "beginner"|"intermediate"|"advanced"|"expert"|null, "years": number|null }],
  "technicalSkills": string[],
  "softSkills": string[],
  "tools": string[],
  "technologies": string[],
  "experience": [{ "title": string, "company": string, "location": string|null, "startDate": string|null, "endDate": string|null, "current": boolean, "description": string }],
  "education": [{ "degree": string, "institution": string, "field": string|null, "startDate": string|null, "endDate": string|null }],
  "certifications": [{ "name": string, "issuer": string|null, "date": string|null }],
  "languages": [{ "name": string, "level": string|null }],
  "projects": [{ "name": string, "description": string, "technologies": string[], "url": string|null }],
  "strengths": string[],
  "weaknesses": string[],
  "recommendations": string[]
}

Rules:
- "skills" must contain each distinct skill once; assign a sensible category (e.g. frontend, backend, database, devops, ai, tools, soft).
- "strengths"/"weaknesses"/"recommendations" must be specific to THIS CV, 4 to 8 items each, written in English.
- Detect missing CV elements honestly (e.g. no contact info, no dates, no quantified results).`;

const CAREER_PROMPT = `You are a career advisor. Given a structured candidate profile, propose the jobs that best fit this profile.
Base every recommendation ONLY on the profile data provided. Never assume skills or experience that are absent.

Return STRICT JSON (no markdown):
{ "recommendations": [
  { "jobTitle": string, "compatibilityScore": number (0-100), "matchingSkills": string[], "missingSkills": string[], "reason": string, "skillsToDevelop": string[] }
] }

Rules:
- Return 4 to 6 recommendations, ordered by compatibilityScore (highest first).
- compatibilityScore must reflect how much of the profile matches the job: strong overlap = 85-95, partial = 60-80, stretch = 40-59.
- "matchingSkills" and "missingSkills" must reference real skills from the profile (matching) or standard requirements of that job (missing).
- "reason" must explain in 1-2 sentences why this job fits this specific profile.
- Write all text in English.`;

const MATCH_PROMPT = `You are an ATS-style matching engine comparing a candidate profile with a job posting.
Return STRICT JSON (no markdown):
{
  "requiredSkills": string[],
  "candidateSkills": string[],
  "matchingSkills": string[],
  "missingSkills": string[],
  "matchedKeywords": string[],
  "experience": {
    "requiredText": string,
    "candidateText": string,
    "verdict": "below"|"meets"|"exceeds",
    "explanation": string
  },
  "education": { "requiredText": string, "verdict": "compatible"|"partial"|"incompatible", "explanation": string },
  "projects": string[],
  "missingCertifications": string[],
  "summary": string,
  "recommendation": string
}

Rules:
- requiredSkills = the skills the job demands (extracted from the job description).
- candidateSkills = the skills the candidate actually has from the profile.
- missingSkills = required minus matched (prioritised by importance in the job ad).
- Never credit the candidate with skills absent from their profile.
- Write all text in English.`;

export async function analyzeResume(resumeText) {
  if (!resumeText?.trim()) {
    throw new AiError('The CV contains no readable text.', 'EMPTY_DOCUMENT', 422);
  }

  const { maxInputChars } = getAiConfig();
  const cleanedResume = prepareAiInput(resumeText, maxInputChars);
  if (!cleanedResume) {
    throw new AiError('The CV contains no readable text.', 'EMPTY_DOCUMENT', 422);
  }

  const raw = await chatJson(
    [
      { role: 'system', content: RESUME_ANALYSIS_PROMPT },
      { role: 'user', content: `CV TEXT:\n${cleanedResume}` },
    ],
    { temperature: 0.1 }
  );

  const normalized = normalizeAnalysisResult(raw);

  const { profile, skills, experience, education } = normalized;
  if (!profile.fullName && skills.length === 0 && experience.length === 0 && education.length === 0) {
    throw new AiError(
      'No professional information could be extracted from this CV. Please upload a clearer document.',
      'AI_INVALID_RESPONSE',
      422
    );
  }

  return normalized;
}

export async function extractResumeInformation(resumeText) {
  const analysis = await analyzeResume(resumeText);
  return analysis.profile;
}

/**
 * Deterministic insights computed from the validated AI output and the raw
 * CV text. Used by the scoring service — the AI never decides the score.
 */
export function calculateResumeInsights(analysis, resumeText = '') {
  const text = typeof resumeText === 'string' ? resumeText : '';
  const lower = text.toLowerCase();

  const sectionHeadings = [
    'experience',
    'work experience',
    'professional experience',
    'education',
    'formation',
    'skills',
    'compétences',
    'projects',
    'projets',
    'certifications',
    'languages',
    'langues',
    'summary',
    'profile',
    'about',
  ];

  const detectedSections = sectionHeadings.filter((h) => lower.includes(h));

  const hasQuantifiedResults = /\d+\s*%|\d+\+\s*(users|clients|projects|teams)|\b\d{2,}\b(?=\s*(users|clients|requests|events|students))/i.test(text);
  const hasDates = /\b(19|20)\d{2}\b/.test(text);
  const hasEmail = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/.test(text);
  const hasPhone = /(\+?\d[\d\s().-]{7,}\d)/.test(text);
  const bulletLines = text.split('\n').filter((line) => /^\s*[-•*▪◦]\s+/.test(line)).length;
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return {
    detectedSections,
    sectionCount: detectedSections.length,
    hasQuantifiedResults,
    hasDates,
    hasEmail,
    hasPhone,
    bulletLines,
    wordCount,
    skillCount: analysis.skills.length,
    experienceCount: analysis.experience.length,
    educationCount: analysis.education.length,
    projectCount: analysis.projects.length,
    certificationCount: analysis.certifications.length,
  };
}

export async function getCareerRecommendations(profilePayload) {
  const { maxInputChars } = getAiConfig();
  const raw = await chatJson(
    [
      { role: 'system', content: CAREER_PROMPT },
      { role: 'user', content: JSON.stringify(profilePayload).slice(0, maxInputChars) },
    ],
    { temperature: 0.3 }
  );
  const recommendations = normalizeCareerRecommendations(raw);
  if (recommendations.length === 0) {
    throw new AiError('No career recommendations could be generated.', 'AI_INVALID_RESPONSE');
  }
  return recommendations;
}

export async function matchResumeWithJob(profilePayload, jobPayload) {
  const { maxInputChars } = getAiConfig();
  const halfInput = Math.floor(maxInputChars / 2);
  const raw = await chatJson(
    [
      { role: 'system', content: MATCH_PROMPT },
      {
        role: 'user',
        content: `CANDIDATE PROFILE:\n${JSON.stringify(profilePayload).slice(0, halfInput)}\n\nJOB POSTING:\n${JSON.stringify(jobPayload).slice(0, halfInput)}`,
      },
    ],
    { temperature: 0.1 }
  );

  if (!raw || typeof raw !== 'object') {
    throw new AiError('The AI returned an unexpected matching payload.', 'AI_INVALID_RESPONSE');
  }

  return {
    requiredSkills: asStringArray(raw.requiredSkills),
    candidateSkills: asStringArray(raw.candidateSkills),
    matchingSkills: asStringArray(raw.matchingSkills),
    missingSkills: asStringArray(raw.missingSkills),
    matchedKeywords: asStringArray(raw.matchedKeywords),
    experience: {
      requiredText: asString(raw.experience?.requiredText, 300) || '',
      candidateText: asString(raw.experience?.candidateText, 300) || '',
      verdict: ['below', 'meets', 'exceeds'].includes(raw.experience?.verdict) ? raw.experience.verdict : 'meets',
      explanation: asString(raw.experience?.explanation, 500) || '',
    },
    education: {
      requiredText: asString(raw.education?.requiredText, 300) || '',
      verdict: ['compatible', 'partial', 'incompatible'].includes(raw.education?.verdict)
        ? raw.education.verdict
        : 'compatible',
      explanation: asString(raw.education?.explanation, 500) || '',
    },
    projects: asStringArray(raw.projects),
    missingCertifications: asStringArray(raw.missingCertifications),
    summary: asString(raw.summary, 800) || '',
    recommendation: asString(raw.recommendation, 800) || '',
  };
}

export { AiError };
export default { analyzeResume, extractResumeInformation, calculateResumeInsights, matchResumeWithJob, getCareerRecommendations };
