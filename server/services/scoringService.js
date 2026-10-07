import { SCORE_CATEGORIES, TOTAL_WEIGHT } from '../utils/scoringWeights.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round1 = (n) => Math.round(n * 10) / 10;

function contactScore(analysis) {
  const { profile } = analysis;
  const details = [];
  let score = 0;

  if (profile.fullName) {
    score += 1;
    details.push('Name detected.');
  } else {
    details.push('Missing candidate name.');
  }

  if (profile.email) {
    score += 4;
    details.push('Email address present.');
  } else {
    details.push('No email address found.');
  }

  if (profile.phone) {
    score += 3;
    details.push('Phone number present.');
  } else {
    details.push('No phone number found.');
  }

  if (profile.location) {
    score += 2;
    details.push('Location present.');
  } else {
    details.push('No location found.');
  }

  return { score, details };
}

function summaryScore(analysis) {
  const summary = analysis.profile.summary;
  const details = [];
  let score = 0;

  if (!summary) {
    details.push('No professional summary found.');
    return { score, details };
  }

  score += 4;
  details.push('Professional summary present.');

  const length = summary.length;
  if (length >= 80) score += 3;
  if (length >= 200) score += 3;
  if (length < 80) details.push('Summary is very short — aim for 2-4 sentences.');
  else if (length < 200) details.push('Summary could be more detailed.');
  else details.push('Well-developed summary.');

  return { score, details };
}

function skillsScore(analysis) {
  const details = [];
  let score = 0;
  const count = analysis.skills.length;

  const volume = clamp(count * 1.1, 0, 10);
  score += volume;
  details.push(
    count === 0
      ? 'No skills section detected.'
      : `${count} skill${count > 1 ? 's' : ''} detected${count < 6 ? ' — list more relevant skills.' : '.'}`
  );

  const categories = new Set(analysis.skills.map((s) => s.category).filter((c) => c && c !== 'general'));
  if (categories.size >= 4) score += 3;
  else if (categories.size >= 2) score += 1.5;
  if (categories.size >= 2) details.push(`Skills span ${categories.size} categories.`);

  const withLevel = analysis.skills.filter((s) => s.level).length;
  if (withLevel >= 5) score += 2;
  else if (withLevel > 0) score += 1;
  if (withLevel === 0 && count > 0) details.push('Skill levels are not specified.');

  const technical = analysis.technicalSkills.length + analysis.tools.length + analysis.technologies.length;
  const soft = analysis.softSkills.length;
  if (technical > 0 && soft > 0) score += 2;
  else if (technical > 0) score += 1;
  if (technical === 0) details.push('No technical skills listed.');

  const withYears = analysis.skills.filter((s) => s.years).length;
  if (withYears >= 3) score += 3;
  else if (withYears > 0) score += 1.5;

  return { score: clamp(score, 0, 20), details };
}

function experienceScore(analysis, insights) {
  const details = [];
  let score = 0;
  const entries = analysis.experience.length;

  if (entries === 0) {
    details.push('No work experience detected.');
    return { score: 0, details };
  }

  const volume = entries >= 3 ? 14 : entries === 2 ? 11 : 7;
  score += volume;
  details.push(`${entries} position${entries > 1 ? 's' : ''} detected.`);

  const dated = analysis.experience.filter((e) => e.startDate).length;
  if (dated >= entries) score += 5;
  else if (dated > 0) score += 2.5;
  if (dated === 0) details.push('No dates on experience entries.');

  const described = analysis.experience.filter((e) => (e.description || '').length >= 60).length;
  if (described >= 2) score += 3;
  else if (described === 1) score += 1.5;
  if (described === 0) details.push('Experience entries lack description.');

  if (insights?.hasQuantifiedResults) score += 3;
  else details.push('Add quantified achievements (%, users, revenue, team size).');

  return { score: clamp(score, 0, 25), details };
}

function educationScore(analysis) {
  const details = [];
  let score = 0;
  const entries = analysis.education.length;

  if (entries === 0) {
    details.push('No education detected.');
    return { score: 0, details };
  }

  score += 7;
  details.push(`${entries} education entr${entries > 1 ? 'ies' : 'y'} detected.`);

  if (analysis.education.some((e) => e.startDate || e.endDate)) score += 2;
  else details.push('Education dates are missing.');

  if (analysis.education.some((e) => e.institution)) score += 1;

  return { score: clamp(score, 0, 10), details };
}

function projectsScore(analysis) {
  const details = [];
  let score = 0;
  const entries = analysis.projects.length;

  if (entries === 0) {
    details.push('No projects listed — projects strongly improve a CV.');
    return { score: 0, details };
  }

  score += clamp(entries * 2, 0, 6);
  details.push(`${entries} project${entries > 1 ? 's' : ''} listed.`);

  if (analysis.projects.some((p) => p.technologies.length > 0)) score += 2;
  if (analysis.projects.some((p) => (p.description || '').length >= 40)) score += 2;

  return { score: clamp(score, 0, 10), details };
}

function certificationsScore(analysis) {
  const details = [];
  const count = analysis.certifications.length;

  if (count === 0) {
    details.push('No certifications detected.');
    return { score: 0, details };
  }

  details.push(`${count} certification${count > 1 ? 's' : ''} detected.`);
  return { score: clamp(count * 2.5, 0, 5), details };
}

function structureScore(analysis, insights) {
  const details = [];
  let score = 0;

  const sections = insights?.sectionCount ?? 0;
  if (sections >= 6) score += 6;
  else if (sections >= 4) score += 4;
  else if (sections >= 2) score += 2;
  details.push(
    sections >= 6
      ? 'Clear section structure detected.'
      : `Only ${sections} CV section heading${sections === 1 ? '' : 's'} detected.`
  );

  const words = insights?.wordCount ?? 0;
  if (words >= 200 && words <= 900) score += 2;
  else if (words > 900) score += 1;
  else details.push('CV text is short — aim for 400-800 words.');

  if (insights?.hasDates) score += 1;
  else details.push('No dates found anywhere in the CV.');

  const bulletLines = (insights?.bulletLines ?? 0);
  if (bulletLines >= 5) score += 1;
  else details.push('Use bullet points to describe achievements.');

  return { score: clamp(score, 0, 10), details };
}

const COMPUTERS = {
  contact: contactScore,
  summary: summaryScore,
  skills: skillsScore,
  experience: experienceScore,
  education: educationScore,
  projects: projectsScore,
  certifications: certificationsScore,
  structure: structureScore,
};

/**
 * Computes the final CV score entirely in the backend using fixed weights.
 * The AI never decides the score — it only provides validated data.
 */
export function calculateScore(analysis, insights = {}) {
  const breakdown = SCORE_CATEGORIES.map((category) => {
    const { score, details } = COMPUTERS[category.key](analysis, insights);
    return {
      key: category.key,
      label: category.label,
      weight: category.weight,
      max: category.weight,
      score: round1(clamp(score, 0, category.weight)),
      details,
    };
  });

  const total = breakdown.reduce((sum, part) => sum + part.score, 0);

  return {
    score: Math.round(clamp(total, 0, 100)),
    scoreBreakdown: breakdown,
    totalWeight: TOTAL_WEIGHT,
  };
}

/**
 * Merges AI-provided qualitative feedback with score-derived insights.
 */
export function buildFeedback(analysis, breakdown) {
  const strengths = new Set(analysis.strengths || []);
  const weaknesses = new Set(analysis.weaknesses || []);
  const recommendations = new Set(analysis.recommendations || []);

  for (const part of breakdown) {
    const ratio = part.max > 0 ? part.score / part.max : 0;
    if (ratio >= 0.85) {
      strengths.add(`${part.label}: strong (${part.score}/${part.max}).`);
    } else if (ratio <= 0.4) {
      weaknesses.add(`${part.label}: weak (${part.score}/${part.max}).`);
      for (const detail of part.details) {
        if (/missing|no |not |short|lack|add |only/i.test(detail)) recommendations.add(detail);
      }
    }
  }

  if (analysis.projects.length === 0) {
    recommendations.add('Add 2-3 projects with technologies and measurable outcomes.');
  }
  if (!analysis.profile.email || !analysis.profile.phone) {
    recommendations.add('Add complete contact details (email and phone) at the top of the CV.');
  }

  return {
    strengths: [...strengths],
    weaknesses: [...weaknesses],
    recommendations: [...recommendations],
  };
}

export default { calculateScore, buildFeedback };
