import Job from '../models/Job.js';
import { clean, isPlainString } from '../utils/validators.js';

export async function createJob(req, res) {
  const { title, company, location, description, skills, experienceRequired, educationRequired, url } =
    req.body ?? {};

  const errors = {};
  if (!isPlainString(title)) errors.title = 'Job title is required.';
  if (!isPlainString(description) || description.trim().length < 40) {
    errors.description = 'Job description is required (at least 40 characters).';
  }
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Please fix the highlighted fields.', errors });
  }

  const skillList = Array.isArray(skills)
    ? skills.filter((s) => typeof s === 'string' && s.trim()).map((s) => s.trim().slice(0, 60))
    : typeof skills === 'string'
      ? skills.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean).slice(0, 60)
      : [];

  const job = await Job.create({
    user: req.user._id,
    title: clean(title, 200),
    company: clean(company, 200),
    location: clean(location, 200),
    description: clean(description, 20000),
    skills: skillList,
    experienceRequired: clean(experienceRequired, 200),
    educationRequired: clean(educationRequired, 200),
    source: 'manual',
    url: clean(url, 500),
  });

  return res.status(201).json({ success: true, data: { job: job.toPublicJSON() } });
}

export async function listJobs(req, res) {
  const jobs = await Job.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.json({ success: true, data: { jobs: jobs.map((j) => j.toPublicJSON()) } });
}

export async function getJob(req, res) {
  const job = await Job.findOne({ _id: req.params.id, user: req.user._id });
  if (!job) return res.status(404).json({ success: false, message: 'Job offer not found.' });
  return res.json({ success: true, data: { job: job.toPublicJSON() } });
}

export async function deleteJob(req, res) {
  const job = await Job.findOne({ _id: req.params.id, user: req.user._id });
  if (!job) return res.status(404).json({ success: false, message: 'Job offer not found.' });
  await job.deleteOne();
  return res.json({ success: true, message: 'Job offer deleted.' });
}

export default { createJob, listJobs, getJob, deleteJob };
