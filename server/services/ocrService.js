import path from 'node:path';
import { cleanText } from './documentService.js';

const LANGUAGES = 'fra+eng';

let tesseractModule = null;

async function loadTesseract() {
  if (!tesseractModule) {
    tesseractModule = await import('tesseract.js');
  }
  return tesseractModule;
}

export async function runOcr(filePath, originalName = '') {
  const workerLang = LANGUAGES;
  const ext = path.extname(originalName || filePath).toLowerCase();

  if (!['.png', '.jpg', '.jpeg'].includes(ext)) {
    throw Object.assign(new Error('OCR only supports image files (.png, .jpg, .jpeg).'), {
      code: 'OCR_FAILED',
      statusCode: 422,
    });
  }

  const { createWorker } = await loadTesseract();

  try {
    const worker = await createWorker(workerLang);
    try {
      const { data } = await worker.recognize(filePath);
      const text = cleanText(data.text ?? '');
      if (!text || text.replace(/\s/g, '').length < 20) {
        throw Object.assign(
          new Error('The scanned document could not be read. Please upload a clearer image or a text-based PDF.'),
          { code: 'OCR_FAILED', statusCode: 422 }
        );
      }
      return text;
    } finally {
      await worker.terminate().catch(() => {});
    }
  } catch (err) {
    if (err?.code === 'OCR_FAILED') throw err;
    throw Object.assign(new Error(`OCR failed: ${err.message || 'unknown error'}`), {
      code: 'OCR_FAILED',
      statusCode: 422,
    });
  }
};

export default runOcr;
