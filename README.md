# SkillScope

**AI CV Analyzer & Smart Career Matcher**

SkillScope is a SaaS web application that analyzes a CV with AI, extracts a structured professional profile, scores the CV out of 100 with transparent weighted criteria, recommends the most suitable jobs, and compares the profile with a job offer to compute a compatibility score and highlight missing skills.

> SkillScope provides AI-assisted analysis. Scores are indicative and never a guarantee of hiring.

---

## Features

- **Authentication** — register / login with bcrypt password hashing and JWT sessions.
- **CV upload** — drag & drop PDF, DOCX, PNG, JPG, JPEG (5 MB max) with progress feedback.
- **Text extraction** — direct extraction for PDF/DOCX, OCR (French + English) for images and scanned PDFs.
- **AI profile extraction** — structured JSON (profile, skills, experience, education, certifications, languages, projects), validated before being stored.
- **CV score /100** — calculated **in the backend** with fixed weights, never by the AI:

  | Criterion | Weight |
  | --- | ---: |
  | Contact information | 10% |
  | Professional summary | 10% |
  | Skills | 20% |
  | Experience | 25% |
  | Education | 10% |
  | Projects | 10% |
  | Certifications | 5% |
  | Structure | 10% |
  | **Total** | **100%** |

- **Score breakdown** — per-criterion sub-scores, strengths, weaknesses, improvement suggestions.
- **Visualisations** — circular score, progress bars, radar & bar charts (Recharts).
- **Career recommendations** — ranked jobs with compatibility, matching/missing skills and skills to develop, grounded in the extracted profile.
- **Job matcher** — paste a job offer, get a compatibility score with fixed backend weights:

  | Criterion | Weight |
  | --- | ---: |
  | Skills | 40% |
  | Experience | 25% |
  | Education | 10% |
  | Projects | 10% |
  | Keywords | 10% |
  | Certifications | 5% |
  | **Total** | **100%** |

- **Dashboard** — CV score, jobs analyzed, best match, skills detected, score trend, recent activity.
- **History** — search, filter and sort all analyses and matches.
- **i18n** — English, Français, العربية with automatic RTL layout.
- **Dark / light mode** — persisted, with system option.
- **Security** — JWT protection, ownership scoping on every query, file validation, size limits, AI response validation.

---

## Architecture

```text
React (Vite)
   ↓
Express API
   ↓
AI Service (server-side only)
   ↓
xAI API → Grok
   ↓
Structured JSON (validated)
   ↓
MongoDB Atlas
   ↓
React Dashboard
```

```text
skillscope/
├── client/                 # React + Vite + Tailwind + shadcn-style UI
│   └── src/
│       ├── components/     # ui/, charts, uploader, score cards, Magic UI
│       ├── pages/          # Landing, auth, Dashboard, Upload, Analysis…
│       ├── layouts/        # DashboardLayout (sidebar + navbar)
│       ├── context/        # Auth, Language (i18n), Theme
│       ├── locales/        # en.js, fr.js, ar.js
│       ├── services/       # api.js (axios)
│       └── lib/
├── server/                 # Express API
│   ├── config/             # db.js
│   ├── controllers/        # auth, cv, analysis, job, stats, history
│   ├── middleware/         # auth, upload (multer), errors
│   ├── models/             # User, Resume, Analysis, Job, Match
│   ├── routes/             # auth, resumes, analysis, jobs, match, stats, history
│   ├── services/           # aiClient, aiService, document, ocr,
│   │                       # scoring, matching, careerRecommendation
│   ├── utils/              # jwt, validators, scoringWeights, asyncHandler
│   ├── scripts/            # smoke-test.mjs
│   └── uploads/
├── package.json            # workspace scripts
└── README.md
```

---

## Technologies

**Frontend** — React 19, Vite, React Router, Tailwind CSS 4, shadcn-style components (Radix UI), Lucide React, Axios, Recharts, react-dropzone, react-hot-toast, date-fns, Framer Motion.

**Backend** — Node.js, Express, MongoDB Atlas, Mongoose, JWT, bcryptjs, multer, pdf-parse, mammoth, tesseract.js.

**AI** — xAI Grok API (server-side only; the key is never exposed to the browser).

---

## Installation

```bash
git clone <your-repo-url> skillscope
cd skillscope
npm install --prefix client
npm install --prefix server
npm install            # root: concurrently for `npm run dev`
```

### Environment variables

**`server/.env`** (copy `server/.env.example`)

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=a_long_random_secret_at_least_16_chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
XAI_API_KEY=your_xai_api_key
XAI_MODEL=grok-4.7
AI_TIMEOUT_MS=120000
```

**`client/.env`** (copy `client/.env.example`)

```env
VITE_API_URL=http://localhost:5000/api
```

> Never prefix secrets with `VITE_` — anything prefixed with `VITE_` is embedded in the browser bundle. Never commit `.env` files.

### MongoDB Atlas

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Add a database user and allow your IP (or `0.0.0.0/0` for development).
3. Copy the connection string into `MONGODB_URI`.
4. If `MONGODB_URI` is empty, the server falls back to an **in-memory MongoDB** for local development (data is lost on restart).

### xAI configuration

1. Create an API key at [console.x.ai](https://console.x.ai).
2. Set `XAI_API_KEY` in `server/.env`.
3. Without a valid key, analysis endpoints return a clear `503` message instead of failing silently.

---

## Running

```bash
# both (server on :5000, client on :5173)
npm run dev

# separately
npm run dev:server
npm run dev:client

# production
npm run build          # builds client/dist
npm start              # starts the API server
```

Open http://localhost:5173.

---

## API documentation

All responses use `{ success: boolean, data?, message?, errors? }`. Protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Route | Body | Returns |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | `name, email, password` | `{ user, token }` |
| POST | `/api/auth/login` | `email, password` | `{ user, token }` |
| GET | `/api/auth/me` | — | `{ user }` |

### Resumes

| Method | Route | Notes |
| --- | --- | --- |
| POST | `/api/resumes/upload` | multipart field `resume`, PDF/DOCX/PNG/JPG ≤ 5 MB |
| GET | `/api/resumes` | list |
| GET | `/api/resumes/:id` | resume + latest analysis |
| GET | `/api/resumes/:id/file` | owner-only file download |
| DELETE | `/api/resumes/:id` | deletes resume + analyses + file |

### Analysis

| Method | Route | Notes |
| --- | --- | --- |
| POST | `/api/analysis/:resumeId` | extract → AI → score → recommendations |
| GET | `/api/analysis/:resumeId` | latest analysis |
| GET | `/api/analysis/:id/careers?force=true` | career recommendations |

### Jobs & matching

| Method | Route | Notes |
| --- | --- | --- |
| POST | `/api/jobs` | `title, description` required (≥ 40 chars) |
| GET | `/api/jobs` | list |
| GET | `/api/jobs/:id` | detail |
| DELETE | `/api/jobs/:id` | delete |
| POST | `/api/jobs/:jobId/match/:resumeId` | compute compatibility |
| GET | `/api/jobs/:jobId/matches` | match history |

### Dashboard & history

| Method | Route |
| --- | --- |
| GET | `/api/stats/dashboard` |
| GET | `/api/history?type=all|analyses|matches&q=...&sort=newest|oldest|score-desc|score-asc` |
| GET | `/api/health` |

### Smoke test

```bash
# with the server running
npm run smoke --prefix server

# including a real upload + AI analysis
SMOKE_UPLOAD=/path/to/cv.pdf npm run smoke --prefix server
```

---

## Security

- JWT authentication on every private route; ownership scoping (`user` filter) on every query.
- Passwords hashed with bcrypt (cost 12), never stored or logged in clear text.
- CORS restricted to `CLIENT_URL`.
- Multer file filter (extension + MIME), 5 MB limit, randomized filenames, uploads served only through an authenticated route.
- AI responses parsed and validated (`normalizeAnalysisResult`) before hitting MongoDB; the AI never writes to the database directly.
- Scores always computed in the backend from fixed weights in `server/utils/scoringWeights.js`.
- `MONGODB_URI`, `JWT_SECRET` and `XAI_API_KEY` exist only in `server/.env` (git-ignored).

---

## Deployment

**Client** — build with `npm run build` and host `client/dist` on Vercel, Netlify or any static host. Set `VITE_API_URL` to your API URL at build time.

**Server** — host `server/` on Render, Railway or a VPS:

```bash
npm ci --omit=dev
npm start
```

Set all `server` environment variables in the platform's dashboard. Add your production client origin to `CLIENT_URL` (comma-separated for several origins).

**Database** — MongoDB Atlas (shared free tier is enough to start).

---

## Roadmap / future improvements

- Multiple CV versions and CV-to-CV comparison
- AI CV rewriting suggestions
- PDF export of an analysis
- Shareable read-only analysis link
- Job board API import (no LinkedIn scraping)

---

## License

Private project — all rights reserved.
