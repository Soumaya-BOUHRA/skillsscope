import mongoose from 'mongoose';

const scorePartSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    score: { type: Number, required: true, min: 0 },
    max: { type: Number, required: true, min: 0 },
    weight: { type: Number, required: true, min: 0, max: 100 },
    details: { type: [String], default: [] },
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      index: true,
    },
    analysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Analysis',
      default: null,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    scoreBreakdown: { type: [scorePartSchema], default: [] },
    matchingSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    matchingExperience: { type: String, default: '' },
    missingExperience: { type: String, default: '' },
    matchingEducation: { type: String, default: '' },
    relevantProjects: { type: [String], default: [] },
    matchedKeywords: { type: [String], default: [] },
    missingCertifications: { type: [String], default: [] },
    recommendation: { type: String, default: '' },
    summary: { type: String, default: '' },
  },
  { timestamps: true }
);

matchSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    resume: this.resume?.toString?.() ?? this.resume,
    analysis: this.analysis?.toString?.() ?? this.analysis,
    job: this.job?.toString?.() ?? this.job,
    overallScore: this.overallScore,
    scoreBreakdown: this.scoreBreakdown,
    matchingSkills: this.matchingSkills,
    missingSkills: this.missingSkills,
    matchingExperience: this.matchingExperience,
    missingExperience: this.missingExperience,
    matchingEducation: this.matchingEducation,
    relevantProjects: this.relevantProjects,
    matchedKeywords: this.matchedKeywords,
    missingCertifications: this.missingCertifications,
    recommendation: this.recommendation,
    summary: this.summary,
    createdAt: this.createdAt,
  };
};

export default mongoose.models.Match || mongoose.model('Match', matchSchema);
