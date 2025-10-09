# AI-Editor Portfolio — Frontend

This is the client-side of my portfolio project: live collaborative editing for documents with built-in AI tools. Users sign in with email/password or Google, work together in sessions, chat, manage access by roles, review version history and use AI assistance.

**Goal:** demonstrate a production-like UI connected to a real backend — with tests, clear structure, and stable behavior — not just a click-through demo.

## 1) Title & one-liner

**AI-Editor Portfolio — Frontend**  
Next.js + React + WebSocket. Live collaboration, roles & permissions, document versions, chat, and AI actions inside the editor.

## 2) Quick links

- **Live App:** https://www.ai-editor-portfolio.com
- **Backend API:** https://ai-assistant-backend-fsdp.onrender.com
- **WebSocket:** `wss://ai-assistant-backend-fsdp.onrender.com/ws`
- **Demo (Loom):** <add URL>
- **Backend repo:** <add URL>
- **This repository:** <add URL>

## 3) For Recruiters & CTO (30 seconds)

- **What it shows.** A ready UI with real-time collaboration, roles, versions, chat, and AI-in-editor.
- **Stack.** Next.js (App Router), React, TypeScript, React Query + fetch/axios, Zustand for client state, Quill for rich text, Socket.io client for WS.
- **Quality.** Unit/component (Jest + RTL) and e2e (Playwright) tests. Coverage 94.7 % statements, 80.1 % branches, 90 % functions, 97.2 % lines (enforced in CI on every PR).
- **Performance/UX.** Lighthouse scores — Performance 95, Accessibility 79, Best Practices 100, SEO 91. Uses SSR where helpful, ISR for cacheable pages, code-splitting and prefetch.

## 4) Why this matters

Beyond CRUD: co-edit in real time, role enforcement, chat, invitations, version restore, AI actions. You can see state management, error handling, optimistic UI, and quality gates.

## 5) Key features

- **AI inside the editor & on a dedicated page.** 9 actions (translate, rephrase, summarize, generate, etc.).
- **Collaboration & roles.** Admin / editor / viewer.
- **Rich-text editor (Quill) + export.** Formatting; export **EN-only** for now.
- **Version history.** View and restore.
- **Invitations & notifications.**
- **Real-time chat.**

## 6) Application walkthrough (user flows)

- Sign in / sign up / password reset.
- **Dashboard** with sessions & documents.
- **AI Assistance** — quick AI actions without joining a session.
- **Sessions:** create/join, roles, time tracking, chat.
- **Document editing:** sync, versions, export.
- **Notifications/Invitations** — accept/decline and jump into sessions.

## 7) Architecture & state

Feature-oriented structure; data fetching/caching via React Query; real-time events handled by WS handlers.

flowchart LR
UI[UI (React)] -- queries/mutations --> API[(HTTP API)]
UI -- WebSocket events --> WS[WS Client]
WS -- sync/updates --> UI
STATE[(State Store\nZustand)] --> UI

- **App structure:** routes (App Router) + feature folders.
- **State:** Zustand for session/auth/editor context; local component state elsewhere.
- **Data layer:** React Query + fetch/axios, request/response mappers, retry/backoff for transient errors.
- **Real-time:** socket handlers for editor sync, presence/status, chat.
- **Errors & notifications:** toasts with actionable messages.

## 8) UI/UX decisions & trade-offs

- **Why Quill + delta.** Mature ecosystem + delta format simplifies operational transforms.
- **SSR vs ISR vs CSR.**
  - **SSR** for auth-gated pages (dashboard, sessions list) via server components / `fetch({ cache: 'no-store' })`.
  - **CSR** for the editor (heavy WS and user input).
  - **ISR** not used — all dynamic and user-specific data are rendered via SSR or CSR for real-time accuracy.
- **Design system / UI kit.** Tailwind CSS + shadcn/ui (radix-based primitives).
- **i18n/a11y.** Base accessibility (labels, roles, focus), color-contrast checks. **i18n:** EN-only UI.

## 9) Security & privacy (client)

- **Token storage & refresh.** Access token in memory (Zustand); refresh via secure httpOnly cookie from backend (auto-refresh on 401 with a guarded fetch). If cookies are not enabled on backend, fallback is an explicit refresh endpoint.
- **Protected routes.** Client guards + server checks; redirect to `/auth` when missing access.
- **CORS/HTTPS.** Calls only to trusted API origin; WS over WSS.
- **Security headers (CSP).** Example (set via `next.config.mjs` headers):

## 10) CI/CD

- **Vercel pipeline:** preview on PR → production on main.
- **Checks:** `lint → unit → e2e → build`.
- **PR/branch policy:** feature branches → PR with review → Vercel preview URL → squash & merge to main.

## 11) Deployment & hosting

- **Platform:** Vercel (Preview / Production).
- **Domain:** `ai-editor-portfolio.com`; API — `ai-assistant-backend-fsdp.onrender.com`.
- **Build:** Next.js (App Router, Turbopack). Optional bundle analyzer with `ANALYZE=true`.

**Environment variables (Frontend):**

```ini
# .env.local
NEXT_PUBLIC_API_URL=https://ai-assistant-backend-fsdp.onrender.com
NEXT_PUBLIC_SOCKET_URL=wss://ai-assistant-backend-fsdp.onrender.com/ws
NODE_ENV=production # development

# .env.test (used by e2e)
E2E_EMAIL=test@example.com
E2E_PASSWORD=Password1!
E2E_REFRESH=<yourTestRefreshToken>
NEXT_PUBLIC_API_URL=http://localhost:10000
E2E_SESSION_ID=1

E2E_INVITE_TRIGGER='[data-testid="open-invite-modal"]'
E2E_INVITE_DRAWER_TRIGGER='[data-testid="open-notifications-drawer"]'

E2E_INVITEE_EMAIL=test@example.com
E2E_INVITER_EMAIL=test1@example.com
E2E_INVITER_PASSWORD=Password1!
```

## 12) Tests

- **Types:** unit/component (Jest + React Testing Library) and e2e (Playwright).
- **Coverage:** 94.7% statements, 80.1% branches, 90.0% functions, 97.2% lines (enforced in CI).
- **Scope (high level):**
  - Auth screens & guards; protected navigation.
  - Editor interactions (selection → AI action UI; optimistic updates).
  - Sessions (create/join, role changes, time tracking, chat).
  - Version history (view/restore); invitations and notifications.
  - WebSocket client handlers (mocked WS server).
  - API/query layer with mocked network (React Query + MSW).
- **Execution:**
  - **Unit & component tests:** 72 suites, 255 total tests — all passing in ~3.6s.
  - **E2E tests (Playwright):** 12 tests — all passing in ~7.4s.
  - Both suites run automatically on every PR and `main`; CI enforces coverage thresholds and stores Playwright HTML reports as build artifacts.

## 13) Screenshots & demo

- 3–6 key screens: **Dashboard**, **Editor**, **Sessions**, **AI panel**.
- Loom with timestamps: `<add URL + mm:ss anchors>`.

## 14) Roadmap & known limitations

**Coming soon:**

- Multi-language export.
- Finer request limits by role.
- AI metrics (per-function latency, token usage) and a small monitoring panel.
- Better conflict resolution for concurrent editing.

**Current limits:**

- Export: EN-only.
- Some editing bugs are caused by the deprecated techniques of the Quill editor
- Public Swagger/OpenAPI docs are intentionally not included here.

## 15) Contacts

- **Name:** Nikita Nechayev
- **Email:** mykyta.nechaiev.dev@gmail.com
- **Telegram:** @nechaiev_mykyta
- **LinkedIn:** https://www.linkedin.com/in/mykyta-nechaiev-48b776358/
