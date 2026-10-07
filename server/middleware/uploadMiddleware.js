import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs';

export const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.png', '.jpg', '.jpeg'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];
export const DOCUMENT_EXTENSIONS = ['.pdf', '.docx'];

export const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    const err = new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'resume');
    err.code = 'UNSUPPORTED_FILE_TYPE';
    err.message = `Unsupported file type "${ext || 'unknown'}". Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`;
    return cb(err);
  }
  return cb(null, true);
}

export const uploadResumeFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
});

export const detectFileType = (originalName = '') => {
  const ext = path.extname(originalName).toLowerCase();
  if (IMAGE_EXTENSIONS.includes(ext)) return 'image';
  if (DOCUMENT_EXTENSIONS.includes(ext)) return ext.slice(1);
  return 'unknown';
};

export default uploadResumeFile;
