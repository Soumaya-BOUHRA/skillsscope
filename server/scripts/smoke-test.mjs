#!/usr/bin/env node
/**
 * SkillScope API smoke test.
 * Starts nothing itself: run it while the server is up (npm run dev).
 * Usage: SMOKE_BASE=http://localhost:5000/api npm run smoke
 */
import { readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';

const BASE = process.env.SMOKE_BASE || 'http://localhost:5000/api';
const email = `smoke-${randomBytes(4).toString('hex')}@test.com`;

const log = (ok, label, detail = '') =>
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);

async function call(path, { method = 'GET', token, body, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, { method, headers, body: payload });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function main() {
  let failed = 0;
  const assert = (cond, label, detail) => {
    log(cond, label, detail);
    if (!cond) failed += 1;
  };

  const health = await call('/health');
  assert(health.status === 200 && health.data.success, 'GET /health');

  const register = await call('/auth/register', {
    method: 'POST',
    body: { name: 'Smoke Tester', email, password: 'password123' },
  });
  assert(register.status === 201 && register.data.data?.token, 'POST /auth/register');
  const token = register.data.data?.token;
  if (!token) return process.exit(1);

  const me = await call('/auth/me', { token });
  assert(me.status === 200 && me.data.data?.user?.email === email, 'GET /auth/me');

  const unauthorized = await call('/resumes');
  assert(unauthorized.status === 401, 'GET /resumes without token -> 401');

  const badLogin = await call('/auth/login', {
    method: 'POST',
    body: { email, password: 'wrong-password' },
  });
  assert(badLogin.status === 401, 'POST /auth/login wrong password -> 401');

  const list0 = await call('/resumes', { token });
  assert(list0.status === 200, 'GET /resumes');

  const stats = await call('/stats/dashboard', { token });
  assert(stats.status === 200 && typeof stats.data.data?.counters?.resumes === 'number', 'GET /stats/dashboard');

  const history = await call('/history', { token });
  assert(history.status === 200 && Array.isArray(history.data.data?.items), 'GET /history');

  const job = await call('/jobs', {
    method: 'POST',
    token,
    body: {
      title: 'Frontend Developer',
      company: 'Acme',
      description: 'We are looking for a Frontend Developer with React, TypeScript and Git experience.',
      skills: 'React, TypeScript, Git',
    },
  });
  assert(job.status === 201 && job.data.data?.job?.id, 'POST /jobs');

  if (process.env.SMOKE_UPLOAD) {
    const bytes = await readFile(process.env.SMOKE_UPLOAD);
    const form = new FormData();
    form.append('resume', new Blob([bytes]), 'smoke.pdf');
    const upload = await call('/resumes/upload', { method: 'POST', token, form });
    assert(upload.status === 201, 'POST /resumes/upload', `status=${upload.status}`);
    const resumeId = upload.data.data?.resume?.id;
    if (resumeId) {
      const analysis = await call(`/analysis/${resumeId}`, { method: 'POST', token });
      const aiReady = health.data.data?.ai?.configured;
      assert(
        aiReady ? analysis.status === 201 : analysis.status === 503,
        aiReady ? 'POST /analysis (AI configured)' : 'POST /analysis -> 503 without XAI_API_KEY',
        `status=${analysis.status}`
      );
    }
  }

  const forbidden = await call('/jobs', { method: 'DELETE', token });
  assert(forbidden.status === 404 || forbidden.status === 400, 'DELETE /jobs/unknown -> 404');

  console.log(failed ? `\n${failed} check(s) failed.` : '\nAll smoke checks passed.');
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error('Smoke test crashed:', err.message);
  process.exit(1);
});
