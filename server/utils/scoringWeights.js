export const SCORE_CATEGORIES = [
  { key: 'contact', label: 'Contact information', weight: 10 },
  { key: 'summary', label: 'Professional summary', weight: 10 },
  { key: 'skills', label: 'Skills', weight: 20 },
  { key: 'experience', label: 'Experience', weight: 25 },
  { key: 'education', label: 'Education', weight: 10 },
  { key: 'projects', label: 'Projects', weight: 10 },
  { key: 'certifications', label: 'Certifications', weight: 5 },
  { key: 'structure', label: 'CV structure', weight: 10 },
];

export const TOTAL_WEIGHT = SCORE_CATEGORIES.reduce((sum, c) => sum + c.weight, 0);

export const MATCH_CATEGORIES = [
  { key: 'skills', label: 'Skills', weight: 40 },
  { key: 'experience', label: 'Experience', weight: 25 },
  { key: 'education', label: 'Education', weight: 10 },
  { key: 'projects', label: 'Projects', weight: 10 },
  { key: 'keywords', label: 'Keywords', weight: 10 },
  { key: 'certifications', label: 'Certifications', weight: 5 },
];

export const MATCH_TOTAL_WEIGHT = MATCH_CATEGORIES.reduce((sum, c) => sum + c.weight, 0);

export default { SCORE_CATEGORIES, TOTAL_WEIGHT, MATCH_CATEGORIES, MATCH_TOTAL_WEIGHT };
