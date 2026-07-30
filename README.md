# Value Cascade

AI-powered Circular Resource Intelligence Platform for the textile industry — built with React, TypeScript, Vite, and Tailwind CSS v4.

## Status

This is an MVP prototype. Core loop (login → dashboard → AI analysis → inventory → marketplace → orders) is functional end-to-end on mock data. Everything runs without any backend configuration.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

## Demo accounts

Password for every account: `valuecascade2026`

| Email | Role |
|---|---|
| manufacturer@valuecascade.demo | Manufacturer |
| buyer@valuecascade.demo | Fabric Buyer |
| cooperative@valuecascade.demo | Cooperative |
| recycler@valuecascade.demo | Recycler |
| government@valuecascade.demo | Government Agency |
| admin@valuecascade.demo | Administrator |

## Architecture

```
src/
  app/          route guards
  components/   shared UI primitives, toast system
  layouts/      authenticated app shell (sidebar, topbar)
  pages/        route-level screens (marketing, auth, app, admin)
  services/     mock service layer (auth, AI analysis, firebase adapter)
  store/        AuthContext (session, active org, role)
  data/         mock seed data + role/permission config
  types/        shared TypeScript data model
```

Routes are split cleanly: `/` is the marketing site, `/login` `/register` `/select-workspace`
handle auth, and everything under `/app/*` is the protected, role-aware application shell.
`/admin` is a separate top-level route reserved for the `admin` role.

## Mock mode / Firebase

The app runs entirely on an in-memory + localStorage mock service layer by default — no
Firebase project needed. `src/services/firebase.ts` checks for all six `VITE_FIREBASE_*`
env vars (see `.env.example`); if any are missing, `USE_MOCK_MODE` is `true` and the app
never touches Firebase. To connect a real backend, implement a `FirebaseAuthService` behind
the same `AuthService` interface in `src/services/authService.ts` — no callers need to change.

## AI analysis

`src/services/analysisService.ts` implements a deterministic mock analysis pipeline (realistic
delay, fiber/contamination/recoverability scoring) behind an `AnalysisService` interface. Swap
in a real model endpoint by implementing the same interface.

## What's next (not yet built to spec)

- Full pinned/scroll-scrubbed cinematic landing sequence with video (current landing uses
  scroll-reveal sections instead — same content, simpler motion, ships faster)
- Firestore data layer + Cloud Functions
- Real-time messaging, file uploads to Storage
- Government regional heatmaps, forecasting charts
- Code-splitting (current bundle is a single ~820kB chunk — fine for a demo, not for production)
