# PrayasAI Disha — Frontend

AI-powered internship recommendation platform. This is the ReactJS frontend only
— it consumes recommendation data through a service layer designed to be swapped
onto a FastAPI backend with no component changes. See `PROGRESS.md` for what's
built so far and what's next.

## Getting started

Requires Node 18+.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (defaults to `http://localhost:5173`).

## Mock mode vs. real backend

Controlled entirely by `.env`:

```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCK_DATA=true
```

- `VITE_USE_MOCK_DATA=true` — account/profile auth runs in browser localStorage while internship/recommendation listings are fetched from live public job APIs,
  no backend needed. This is the default, and what the demo credentials below use.
- `VITE_USE_MOCK_DATA=false` — authentication/profile API calls are routed to the FastAPI backend
  at `VITE_API_BASE_URL` via Axios instead. No UI/component changes required to
  switch — see `src/services/authService.js` for the pattern every future service
  file follows.

## Try it now (mock mode)

- Register a new account at `/register`, **or**
- Log in at `/login` with the seeded demo user:
  - Email: `kartiksinghal208@gmail.com`
  - Password: `password123`

Logging in takes you to `/dashboard`, which is currently a placeholder — see
`PROGRESS.md` for the build order.

## Project structure

Folder layout follows the spec exactly (`components/`, `pages/`, `services/`,
`context/`, `data/`, `hooks/`, `utils/`) so components/pages/services stay where
you'd expect them as later phases fill the tree in.

## Notes

- Built and syntax-verified with esbuild in the dev sandbox (no network access
  there), but `npm install` has not been run against the real npm registry —
  run it locally before `npm run dev` to pull the actual dependency tree.


### Live internship sources

The frontend currently fetches internship listings from public online job-board APIs (Arbeitnow and Remotive), normalizes the responses, removes duplicates, and calculates the profile match score locally. No hard-coded internship/recommendation demo dataset is used.

### Resume skill-gap analysis

PDF, DOCX, and TXT resumes can be read in the browser. The frontend extracts resume text and performs a local skills analysis until the backend/AI engine is connected.
