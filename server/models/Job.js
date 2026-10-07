import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    company: { type: String, trim: true, maxlength: 200, default: '' },
    location: { type: String, trim: true, maxlength: 200, default: '' },
    description: { type: String, required: true, trim: true },
    skills: { type: [String], default: [] },
    experienceRequired: { type: String, default: '' },
    educationRequired: { type: String, default: '' },
    source: { type: String, enum: ['manual', 'import'], default: 'manual' },
    url: { type: String, default: '' },
  },
  { timestamps: true }
);

jobSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    title: this.title,
    company: this.company,
    location: this.location,
    description: this.description,
    skills: this.skills,
    experienceRequired: this.experienceRequired,
    educationRequired: this.educationRequired,
    source: this.source,
    url: this.url,
    createdAt: this.createdAt,
  };
};

export default mongoose.models.Job || mongoose.model('Job', jobSchema);
