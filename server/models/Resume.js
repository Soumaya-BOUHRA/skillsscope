import mongoose from 'mongoose';

export const RESUME_STATUSES = ['uploaded', 'processing', 'analyzed', 'failed'];

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalName: { type: String, required: true, trim: true, maxlength: 255 },
    fileType: {
      type: String,
      required: true,
      enum: ['pdf', 'docx', 'image', 'unknown'],
      default: 'unknown',
    },
    fileUrl: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    extractedText: { type: String, default: '' },
    extractionMethod: { type: String, enum: ['direct', 'ocr', 'none'], default: 'none' },
    status: { type: String, enum: RESUME_STATUSES, default: 'uploaded', index: true },
    error: { type: String, default: null },
  },
  { timestamps: true }
);

resumeSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    user: this.user?.toString?.() ?? this.user,
    originalName: this.originalName,
    fileType: this.fileType,
    fileUrl: this.fileUrl,
    fileSize: this.fileSize,
    status: this.status,
    extractionMethod: this.extractionMethod,
    hasText: Boolean(this.extractedText),
    error: this.error,
    createdAt: this.createdAt,
  };
};

export default mongoose.models.Resume || mongoose.model('Resume', resumeSchema);
