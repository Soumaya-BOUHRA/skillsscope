import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE } from './middleware/uploadMiddleware.js';
import { isAiConfigured } from './services/aiClient.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : true,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) =>
  res.json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      ai: { configured: isAiConfigured(), model: process.env.XAI_MODEL || 'grok-4.7' },
      uploads: { maxBytes: MAX_FILE_SIZE, allowed: ALLOWED_EXTENSIONS },
    },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/jobs', matchRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/history', historyRoutes);

app.use(notFound);
app.use(errorHandler);

if (!fs.existsSync(path.resolve(process.cwd(), '.env'))) {
  console.warn('[env] No .env file found. Copy .env.example to .env and fill in your values.');
}

if (!isAiConfigured()) {
  console.warn('[ai] XAI_API_KEY is not set — CV analysis endpoints will return 503 until it is configured.');
}

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`[server] SkillScope API listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('[server] Failed to start: database connection error.', err.message);
    process.exit(1);
  });

export default app;
