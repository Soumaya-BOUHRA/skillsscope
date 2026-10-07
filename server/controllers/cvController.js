import fs from 'node:fs/promises';
import Resume from '../models/Resume.js';
import Analysis from '../models/Analysis.js';
import { detectFileType } from '../middleware/uploadMiddleware.js';

export async function uploadResume(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded. Please attach a CV file.' });
  }

  const resume = await Resume.create({
    user: req.user._id,
    originalName: req.file.originalname,
    fileType: detectFileType(req.file.originalname),
    fileUrl: `/uploads/${req.file.filename}`,
    filePath: req.file.path,
    fileSize: req.file.size,
    status: 'uploaded',
  });

  return res.status(201).json({ success: true, data: { resume: resume.toPublicJSON() } });
}

export async function listResumes(req, res) {
  const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.json({ success: true, data: { resumes: resumes.map((r) => r.toPublicJSON()) } });
}

export async function getResume(req, res) {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) {
    return res.status(404).json({ success: false, message: 'CV not found.' });
  }

  const analysis = await Analysis.findOne({ resume: resume._id }).sort({ createdAt: -1 });

  return res.json({
    success: true,
    data: { resume: resume.toPublicJSON(), analysis: analysis ? analysis.toPublicJSON() : null },
  });
}

export async function getResumeFile(req, res) {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) {
    return res.status(404).json({ success: false, message: 'CV not found.' });
  }

  try {
    await fs.access(resume.filePath);
  } catch {
    return res.status(404).json({ success: false, message: 'The file is no longer available on the server.' });
  }

  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(resume.originalName)}"`);
  return res.sendFile(resume.filePath);
}

export async function deleteResume(req, res) {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) {
    return res.status(404).json({ success: false, message: 'CV not found.' });
  }

  await Analysis.deleteMany({ resume: resume._id });
  await resume.deleteOne();

  await fs.rm(resume.filePath, { force: true }).catch(() => {});

  return res.json({ success: true, message: 'CV deleted.' });
}
