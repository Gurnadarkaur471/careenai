# CareerAI

CareerAI is a full-stack career intelligence platform for students and placement admins. It combines profile management, resume analysis, assessments, job matching, skill-gap tracking, career simulation, interview coaching, and admin reporting in a single app.

## Verified project status

The core app was checked in the current workspace and these parts are working:

- Backend health endpoint returns HTTP 200 at http://localhost:5000/api/health
- Admin login succeeds with the seeded admin account
- Frontend project builds successfully with Vite
- Server and client dependencies install cleanly

## Tech stack

- Frontend: React, Vite, React Router, Tailwind CSS, Axios, Recharts
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs
- File handling: Multer, pdf-parse, mammoth
- Optional AI: Groq/Anthropic-compatible API via environment variables

## Project structure

```text
careerai/
├── client/                  # React frontend
│   ├── src/
│   ├── .env
│   ├── .env.example
│   └── package.json
├── server/                  # Express backend
│   ├── src/
│   ├── .env
│   ├── .env.example
│   └── package.json
├── README.md                # project overview and setup
├── QUICK_START_ACTION_PLAN.md
├── COMPLETION_REPORT.md
└── ...
```

## Requirements

- Node.js 18+
- npm
- MongoDB connection (local MongoDB or MongoDB Atlas)

## Quick start

### 1) Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2) Configure environment variables

The server already includes a working .env file in this workspace, but if you need to recreate it:

```bash
cd server
cp .env.example .env
```

And ensure these values are set:

- MONGO_URI
- JWT_SECRET
- CLIENT_URL=http://localhost:5173
- ADMIN_EMAIL / ADMIN_PASSWORD for seeded admin user

For the frontend:

```bash
cd client
cp .env.example .env
```

Typical frontend value:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3) Seed the database

```bash
cd server
npm run seed:admin
npm run seed:questions
```

### 4) Start the backend

```bash
cd server
npm start
```

The API runs on:

```text
http://localhost:5000
```

### 5) Start the frontend

```bash
cd client
npm run dev -- --port 4173
```

This avoids common localhost port conflicts. If port 5173 is already occupied, either stop the conflicting app or use another port such as 4173.

## Default admin login

The seeded admin user is configured in the server .env file:

- Email: admin@careerai.local
- Password: ChangeMe123!

## Features included

- Student authentication and protected routes
- Resume upload and parsing
- Skills and resume analysis
- Assessments and score tracking
- Job intelligence and matching
- Skill-gap insights
- Career simulation
- Interview coaching
- Progress dashboards and reports
- Admin dashboard and student management

## Optional integrations

These features are optional and require env configuration:

- AI model API key for enhanced explanations and suggestions
- SMTP mail configuration for email notifications
- Groq or other Anthropic-compatible provider endpoints

If AI keys are not present, the app falls back to deterministic logic instead of failing outright.

## Troubleshooting

### Port 5000 already in use

Stop the process using that port and rerun the server.

### Port 5173 already in use

Use an alternate frontend port:

```bash
cd client
npm run dev -- --port 4173
```

### MongoDB connection issues

Check that your MongoDB URI is valid and that the database is reachable from your environment.

## Build and verification

The project was verified with:

- Server health check: HTTP 200
- Admin login: HTTP 200
- Frontend production build: successful with Vite

## License

This project is for local development and learning use unless explicit licensing instructions are added by the repository owner.

1. Google OAuth (`/api/auth/google`)
2. Page transitions (Framer Motion around the router `<Outlet />`)
3. Speech-to-text in the Interview Coach
4. Persist email preferences from the Settings page
5. Admin UI for creating/editing assessment questions and job postings (the backend
   endpoints — `POST /api/admin/questions`, `POST /api/admin/assessments`,
   `POST /api/admin/jobs` — already exist)
