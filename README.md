# CareerAI — AI-Powered Employability Intelligence & Career Simulation Platform

A full-stack MERN application that evaluates a student's employability, analyzes their
resume, matches them with jobs, identifies skill gaps, simulates how skill improvements
change their employability score, and prepares them for interviews using AI — all built
on a **hybrid deterministic + AI architecture**: scores and matches are always computed
by plain arithmetic, and AI is only ever used to *explain* or *enrich* what the
deterministic engine already calculated.

---

## 1. What's in this build

### Fully implemented and working end-to-end
- **Auth**: signup/login, JWT sessions, bcrypt password hashing, role-based access
  (`STUDENT` / `ADMIN`), forgot/reset password flow. Public signup can never create an
  admin account.
- **Student profile**: skills, projects, certifications, target role, academic performance.
- **Resume Analyzer**: PDF/DOCX upload → text extraction (`pdf-parse` / `mammoth`) →
  deterministic keyword-based skill extraction and scoring → optional AI enrichment layer
  on top when `AI_API_KEY` is configured.
- **Aptitude & Technical Assessments**: MCQ engine, scored **only** on the backend
  (the frontend never knows the correct answer), topic-wise performance tracking.
- **Deterministic Employability Scoring Engine**: role-specific weighted formula
  (Technical/Aptitude/Resume/Communication/Interview), fully explainable breakdown stored
  and displayed.
- **Job Intelligence**: paste a job description → deterministic keyword extraction
  (+ optional AI extraction) → structured required/preferred skills.
- **Deterministic Job Matching Engine**: weighted required (75%) vs preferred (25%) skill
  overlap, ranks every job in the pool against the student.
- **Skill-Gap Engine**: classifies each required skill as strong / needs-improvement /
  missing with HIGH/MEDIUM/LOW priority.
- **What-If Career Simulator**: the primary unique feature — select improvements, the
  simulator recomputes your score with the *same* scoring engine used everywhere else.
  AI only narrates the result; it never invents the numbers.
- **AI Interview Coach**: AI-generated (or fallback deterministic) questions across
  Introduction/Technical/Resume/Project/HR/Behavioral categories, per-answer evaluation,
  and a final report computed from the stored per-answer scores.
- **Progress Tracking**: every scoring event (resume analysis, assessment, interview)
  logs a snapshot, charted over time.
- **Admin Dashboard**: aggregate stats, top skill gaps, branch-wise readiness, student
  search/list.
- **Notifications**: in-app notification bell + email service abstraction (Nodemailer).
  Email sending is fully wired for welcome, resume analysis, assessment result, interview
  report, and career simulation events — and **never** blocks the underlying operation
  if email isn't configured or fails.
- **Reports**: generates and downloads a JSON snapshot of a student's full profile.

### Scaffolded / intentionally left as an extension point
These were explicitly de-scoped to ship you a working core rather than a half-broken
everything. Each has a clean seam to build on:
- **Google OAuth** — not implemented. `User.provider` / `User.googleId` fields already
  exist in the schema; add a `/api/auth/google` route that verifies Google's ID token
  server-side (`google-auth-library`) and reuses `generateToken()`.
- **Framer Motion page transitions / staged loading animations** — the Resume Analyzer
  page already shows a staged progress UI as a reference pattern; the rest of the app
  uses plain Tailwind transitions. Wrap `<Outlet />` in `AnimatePresence` to add route
  transitions app-wide.
- **Speech-to-text** — the Interview Coach is text-only. Swap the `<textarea>` in
  `InterviewSession` for the browser `SpeechRecognition` API or a Whisper API call.
- **Email preference persistence** — the Settings page UI is built; wire it to a real
  `PUT /api/students/email-preferences` endpoint (the `User.emailPreferences` field
  already exists).

---

## 2. Tech stack

**Frontend:** React 18, Vite, React Router, Tailwind CSS, Axios, Recharts, React Hook
Form, Lucide icons.

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Multer, dotenv,
express-validator, Helmet, CORS, rate limiting, express-mongo-sanitize.

**AI:** Provider-agnostic service layer (`server/src/services/aiService.js`) that calls
an Anthropic-compatible `/v1/messages` endpoint by default — swap `AI_API_URL` to point
at any compatible provider. If no `AI_API_KEY` is set, AI-dependent features fall back to
their deterministic equivalents instead of returning fake data.

---

## 3. Project structure

```
careerai/
├── server/
│   └── src/
│       ├── config/        # DB connection, scoring weights, skills dictionary
│       ├── models/        # 13 Mongoose schemas
│       ├── middleware/    # auth, error handling, file upload
│       ├── controllers/   # request handlers, one per domain
│       ├── routes/        # REST routes, one per domain
│       ├── services/      # aiService, emailService, scoringEngine,
│       │                  # matchingEngine, simulationEngine, resumeParser,
│       │                  # notificationService
│       ├── seed/          # seedAdmin.js, seedQuestions.js
│       ├── app.js
│       └── server.js
└── client/
    └── src/
        ├── components/    # ScoreRing, ProgressBar, StatCard, Toast, NotificationBell
        ├── layouts/        # Public / Student / Admin shells
        ├── pages/          # Landing, Login, Signup, student/*, admin/*
        ├── context/        # AuthContext
        ├── services/       # api.js (axios instance)
        └── routes/         # ProtectedRoute
```

---

## 4. Setup — run it locally

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) — or a MongoDB Atlas URI
- npm

### Step 1 — Backend

```bash
cd server
cp .env.example .env
# edit .env: set MONGO_URI and JWT_SECRET at minimum
npm install
npm run seed:admin       # creates an admin account (see ADMIN_EMAIL/ADMIN_PASSWORD in .env)
npm run seed:questions   # creates sample aptitude/technical questions + 2 sample jobs
npm run dev              # starts on http://localhost:5000
```

### Step 2 — Frontend

```bash
cd client
cp .env.example .env     # VITE_API_URL defaults to http://localhost:5000/api
npm install
npm run dev               # starts on http://localhost:5173
```

Open **http://localhost:5173**, sign up as a student, and go through the flow:
Profile → Resume Analyzer → Assessments → Job Intelligence → Skill Gap → Career
Simulator → Interview Coach → Progress → Reports.

Log in as the seeded admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD` from `server/.env`) to see
the Admin Dashboard.

### Step 3 (optional) — Enable AI features

Without `AI_API_KEY`, the app runs fully on deterministic logic (keyword-based resume/JD
parsing, template-based interview questions, length-based answer scoring). To enable
real AI analysis, explanations, and interview evaluation:

```bash
# in server/.env
AI_API_KEY=sk-ant-...
AI_API_URL=https://api.anthropic.com/v1/messages
AI_MODEL=claude-sonnet-4-6
```

### Step 4 (optional) — Enable email notifications

```bash
# in server/.env
EMAIL_PROVIDER=smtp
EMAIL_HOST=smtp.yourprovider.com
EMAIL_PORT=587
EMAIL_USER=you@example.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=CareerAI <no-reply@yourapp.com>
```

Leave `EMAIL_PROVIDER` blank to disable emails safely — the app logs a skip message
instead of failing.

---

## 5. Scoring methodology (reference)

**Employability Score** = weighted sum of five 0–100 component scores. Default weights
(role-specific overrides live in `server/src/config/scoringWeights.js`):

| Component      | Weight |
|-----------------|--------|
| Technical        | 30%   |
| Aptitude          | 20%   |
| Resume            | 15%   |
| Communication     | 15%   |
| Interview         | 20%   |

**Job Match Score** = `(required-skill match % × 75%) + (preferred-skill match % × 25%)`

**What-If Simulation** = re-runs the *same* employability formula against hypothetical
component scores; the score difference is never estimated by AI.

---

## 6. API surface

See `server/src/routes/*.js` for the full list. Key groups:
`/api/auth`, `/api/students`, `/api/resumes`, `/api/assessments`, `/api/jobs`,
`/api/skills`, `/api/career`, `/api/interviews`, `/api/progress`, `/api/reports`,
`/api/admin`, `/api/notifications`.

---

## 7. Notes on security

- Passwords hashed with bcrypt (10 rounds), never returned in API responses.
- JWT auth via `Authorization: Bearer <token>`; `authenticateUser` + `authorizeRoles`
  middleware enforce access control on every protected route.
- Public signup always creates a `STUDENT`; admin accounts are only created via
  `npm run seed:admin`.
- Helmet, CORS (locked to `CLIENT_URL`), rate limiting, and `express-mongo-sanitize`
  are enabled on the API.
- File uploads restricted to `.pdf`/`.docx`, 5MB max, via Multer.
- Stack traces are hidden from API error responses in production (`NODE_ENV=production`).

---

## 8. What to build next

1. Google OAuth (`/api/auth/google`)
2. Page transitions (Framer Motion around the router `<Outlet />`)
3. Speech-to-text in the Interview Coach
4. Persist email preferences from the Settings page
5. Admin UI for creating/editing assessment questions and job postings (the backend
   endpoints — `POST /api/admin/questions`, `POST /api/admin/assessments`,
   `POST /api/admin/jobs` — already exist)
