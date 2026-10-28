#!/usr/bin/env node
/**
 * Groq connectivity test.
 * 1) simple chat completion
 * 2) structured CV extraction + validation (never persisted)
 *
 * Usage: npm run ai:test --prefix server
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { chatCompletion, getAiConfig, isAiConfigured } from '../services/aiClient.js';
import { analyzeResume } from '../services/aiService.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const SAMPLE_CV = `Jane Doe
jane.doe@example.com | +33 6 12 34 56 78 | Paris, France

SUMMARY
Frontend developer with 4 years of experience building React applications.

EXPERIENCE
Frontend Developer - Acme (2022 - present)
Built React and TypeScript dashboards used by 2000 clients.
Improved performance by 35%.

SKILLS
React, TypeScript, JavaScript, HTML, CSS, Git, Node.js

EDUCATION
Master in Computer Science - University of Paris (2020)

PROJECTS
SkillScope - React, Node.js, MongoDB`;

async function main() {
  if (!isAiConfigured()) {
    console.error('AI_API_KEY is not set in server/.env.');
    process.exit(1);
  }

  const { model, baseUrl, maxInputChars, maxOutputTokens } = getAiConfig();
  console.log(`[ai:test] ${baseUrl} | model=${model} | input<=${maxInputChars} | output<=${maxOutputTokens}`);

  const answer = await chatCompletion(
    [
      { role: 'system', content: 'Answer with exactly one word.' },
      { role: 'user', content: 'Say OK.' },
    ],
    { temperature: 0, maxTokens: 256 }
  );
  if (!/^ok\b/i.test(answer.trim())) {
    throw new Error(`Unexpected simple response: ${answer.slice(0, 120)}`);
  }
  console.log('✓ Simple completion');

  const analysis = await analyzeResume(SAMPLE_CV);
  if (!analysis.profile?.fullName || !Array.isArray(analysis.skills) || analysis.skills.length === 0) {
    throw new Error('Structured extraction returned an incomplete profile.');
  }
  console.log(
    `✓ Structured JSON extraction validated (name=${analysis.profile.fullName}, skills=${analysis.skills.length}, experience=${analysis.experience.length})`
  );
}

main().catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
