# Build Progress

Tracking against the phase order and acceptance criteria in the master prompt.
Update this file as each phase lands so work can resume across sessions
(the dev sandbox's filesystem does not persist between separate conversations
— re-upload/re-share this project folder to pick up where it left off).

## Phase status

- [x] **Phase 1 — Foundation**: Vite project, dependencies, full folder
      structure, routing skeleton, Bootstrap setup, global CSS/design system,
      Context providers, environment configuration.
- [x] **Phase 2 — Public Pages**: Landing (Hero, How It Works, Features,
      About, CTA), Login, Register.
- [~] **Phase 3 — Authentication**: Mock login/register/logout and
      AuthContext are done and wired to Login/Register. Still open: forgot
      password flow (UI-only stub), and the auth pieces that depend on
      pages not built yet.
- [ ] **Phase 4 — Student Core**: Dashboard, Profile, Resume.
- [ ] **Phase 5 — Internship System**: Search, cards, filters, sorting,
      internship details, saved internships, apply flow. Mock data set
      (20 internships, 10 companies, 30 skills) needed first.
- [ ] **Phase 6 — AI Features**: Recommendations, MatchScore, Recommendation
      Explanation/Factors, Skill Gap, Skill Recommendations.
- [ ] **Phase 7 — Applications**: Application tracking/timeline, status
      badges, notifications.
- [ ] **Phase 8 — Admin**: Admin dashboard, management pages, analytics.
- [ ] **Phase 9 — API Layer**: Already scaffolded in principle (see
      `services/api.js` + the mock/real branching pattern in
      `services/authService.js`); each new service file from Phases 4-8
      should follow that same pattern from the start.
- [ ] **Phase 10 — Final Polish**: Full responsive/a11y/empty-state pass
      once every screen exists.

## Routing status

Public: `/`, `/login`, `/register` — live.
Public (browsable without login): `/internships`, `/internships/:id` —
placeholder, real screens land in Phase 5.
Protected (student): `/dashboard`, `/profile`, `/resume`, `/recommendations`,
`/saved`, `/applications`, `/skill-gap`, `/notifications` — routes exist and
are guarded by `ProtectedRoute`, screens are placeholders pending their phase.
Protected (admin, role-gated): `/admin`, `/admin/students`,
`/admin/internships`, `/admin/analytics` — same as above.

**Assumption made:** the spec's protected-route list (section 14) didn't
explicitly classify `/internships` and `/internships/:id`, so they're treated
as publicly browsable (common for internship/job platforms), with save/apply
actions requiring login once those screens are built. Flag if that should be
protected instead.

## What's demoable right now

- Landing page (all sections, responsive, scroll-linked nav).
- Register a new mock account → redirects to `/dashboard`.
- Log in with the seeded demo user (`aarav.sharma@example.com` /
  `password123`) → redirects to `/dashboard`.
- Log out from the navbar.
- Visiting any protected route while logged out redirects to `/login` and
  returns you to that route after signing in.
- Visiting an admin route as a non-admin student redirects to `/dashboard`.

## Not yet built (by design, per phased approach)

Every screen still showing "Coming Soon" — Dashboard, Profile, Resume,
Recommendations, Internship Search/Details, Saved, Applications, Skill Gap,
Notifications, Admin — plus their supporting mock data sets and the
components listed under those folders in the spec's architecture (section 4).
