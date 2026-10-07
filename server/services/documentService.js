import path from 'node:path';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import runOcr from './ocrService.js';

const DISALLOWED = /[^\p{L}\p{N}\p{P}\p{Zs}\n\t]/gu;
const MIN_TEXT_LENGTH = 120;

export function cleanText(raw) {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/\u0000/g, '')
    .replace(DISALLOWED, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function extractPdfText(filePath) {
  const data = new Uint8Array(await readFile(filePath));
  const parser = new PDFParse({ data });
  try {
    const result = await parser.getText();
    return cleanText(result.text ?? '');
  } finally {
    await parser.destroy().catch(() => {});
  }
}

async function ocrScannedPdf(filePath) {
  const data = new Uint8Array(await readFile(filePath));
  const parser = new PDFParse({ data });
  const tempFiles = [];
  try {
    const screenshots = await parser.getScreenshot({ imageBuffer: true, scale: 2 });
    const chunks = [];
    for (const page of screenshots.pages) {
      if (!page?.data?.length) continue;
      const tempPath = `${filePath}-page${page.number}.png`;
      await writeFile(tempPath, Buffer.from(page.data));
      tempFiles.push(tempPath);
      try {
        chunks.push(await runOcr(tempPath, '.png'));
      } catch {
        // page unreadable: continue with remaining pages
      }
    }
    return cleanText(chunks.join('\n\n'));
  } finally {
    await parser.destroy().catch(() => {});
    await Promise.all(tempFiles.map((f) => unlink(f).catch(() => {})));
  }
}

async function extractDocxText(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return cleanText(result.value ?? '');
}

export async function extractResumeText(filePath, fileType) {
  if (fileType === 'image') {
    const text = await runOcr(filePath, path.basename(filePath));
    return { text, method: 'ocr' };
  }

  if (fileType === 'pdf') {
    const text = await extractPdfText(filePath);
    if (text.replace(/\s/g, '').length >= MIN_TEXT_LENGTH) {
      return { text, method: 'direct' };
    }
    const ocrText = await ocrScannedPdf(filePath);
    if (ocrText.replace(/\s/g, '').length >= MIN_TEXT_LENGTH) {
      return { text: ocrText, method: 'ocr' };
    }
    return { text: text || ocrText, method: 'direct' };
  }

  if (fileType === 'docx') {
    const text = await extractDocxText(filePath);
    return { text, method: 'direct' };
  }

  throw Object.assign(new Error(`Unsupported file type "${fileType}".`), {
    code: 'UNSUPPORTED_FILE_TYPE',
    statusCode: 415,
  });
}
