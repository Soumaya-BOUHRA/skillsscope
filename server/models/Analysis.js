import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: 'general' },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert', null], default: null },
    years: { type: Number, default: null },
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    company: { type: String, default: '' },
    location: { type: String, default: null },
    startDate: { type: String, default: null },
    endDate: { type: String, default: null },
    current: { type: Boolean, default: false },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, default: '' },
    institution: { type: String, default: '' },
    field: { type: String, default: null },
    startDate: { type: String, default: null },
    endDate: { type: String, default: null },
  },
  { _id: false }
);

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    issuer: { type: String, default: null },
    date: { type: String, default: null },
  },
  { _id: false }
);

const languageSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    level: { type: String, default: null },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    technologies: { type: [String], default: [] },
    url: { type: String, default: null },
  },
  { _id: false }
);

const scorePartSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    score: { type: Number, required: true },
    max: { type: Number, required: true },
    weight: { type: Number, required: true },
    details: { type: [String], default: [] },
  },
  { _id: false }
);

const careerRecommendationSchema = new mongoose.Schema(
  {
    jobTitle: { type: String, required: true },
    compatibilityScore: { type: Number, required: true, min: 0, max: 100 },
    matchingSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    reason: { type: String, default: '' },
    skillsToDevelop: { type: [String], default: [] },
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
  {
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    score: { type: Number, required: true, min: 0, max: 100 },
    scoreBreakdown: { type: [scorePartSchema], default: [] },
    profile: {
      fullName: { type: String, default: null },
      email: { type: String, default: null },
      phone: { type: String, default: null },
      location: { type: String, default: null },
      summary: { type: String, default: null },
    },
    skills: { type: [skillSchema], default: [] },
    technicalSkills: { type: [String], default: [] },
    softSkills: { type: [String], default: [] },
    tools: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
    experience: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
    languages: { type: [languageSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    careerRecommendations: { type: [careerRecommendationSchema], default: [] },
  },
  { timestamps: true }
);

analysisSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    resume: this.resume?.toString?.() ?? this.resume,
    score: this.score,
    scoreBreakdown: this.scoreBreakdown,
    profile: this.profile,
    skills: this.skills,
    technicalSkills: this.technicalSkills,
    softSkills: this.softSkills,
    tools: this.tools,
    technologies: this.technologies,
    experience: this.experience,
    education: this.education,
    certifications: this.certifications,
    languages: this.languages,
    projects: this.projects,
    strengths: this.strengths,
    weaknesses: this.weaknesses,
    recommendations: this.recommendations,
    careerRecommendations: this.careerRecommendations,
    createdAt: this.createdAt,
  };
};

export default mongoose.models.Analysis || mongoose.model('Analysis', analysisSchema);
