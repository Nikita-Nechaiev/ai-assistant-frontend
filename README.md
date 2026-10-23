# AI Editor — Frontend

A full-stack developer portfolio project by **Mykyta Nechaiev**. This Next.js client provides shared document sessions, rich-text editing, chat, invitations, version history, and AI assistance backed by a NestJS API.

## Links

- [Live application](https://www.ai-editor-portfolio.com)
- [Portfolio presentation](https://canva.link/muceodsr6ld2q5q)
- [Backend API](https://api.ai-editor-portfolio.com)
- [Backend repository](https://github.com/Nikita-Nechaiev/ai-assistant-backend)
- [Frontend repository](https://github.com/Nikita-Nechaiev/ai-assistant-frontend)

## Features

- Email/password authentication, Google sign-in, and password reset.
- Shared sessions with Admin, Editor, and Viewer access, participant presence, invitations, and chat.
- Quill rich-text documents with automatic saving, version preview and restore, and browser-side PDF export.
- Nine AI tools: grammar checking, tone analysis, summarization, rephrasing, translation, keyword extraction, text generation, readability analysis, and title generation.
- A standalone AI workflow at `/ai-assistance/stepper`, plus AI assistance inside documents. Generated text can be appended to an editable document.
- Searchable AI request history and AI usage statistics.
- Dashboard statistics: recorded session time, accessible documents, sessions created/joined, and a 30-day document-creation and AI-request chart. Invitations are excluded from the chart.
- Public portfolio page at `/welcome`, FAQ, and CV download from the backend.

## Stack and structure

Next.js 15 (App Router), React 19, TypeScript, TanStack Query, Axios, Zustand, Socket.IO client, `react-quill-new`, Tailwind CSS, and shadcn/ui primitives built on Radix.

| Location                   | Responsibility                                                              |
| -------------------------- | --------------------------------------------------------------------------- |
| `app/`                     | Routes, layouts, metadata, robots, and sitemap                              |
| `components/`              | Feature components, shared components in `common/`, and primitives in `ui/` |
| `hooks/`                   | Feature workflows, HTTP query state, and socket event subscriptions         |
| `services/`                | HTTP API clients and the Axios instance                                     |
| `store/`                   | Zustand user, session, and snackbar state                                   |
| `helpers/`, `lib/`         | AI tool registry, query keys/invalidation, PDF export, and shared utilities |
| `providers/`, `hydration/` | Query provider and initial user hydration                                   |
| `e2e/`                     | Playwright browser scenarios and setup helpers                              |

Next.js server components provide route shells, while middleware checks authentication through the backend and passes user data for hydration. Dashboard data, AI history, and statistics load on the client through TanStack Query. The editor and session interactions use Socket.IO. Private query keys include the user ID; the previous user's queries are cancelled and removed when the account changes. Private application data does not use ISR.

## Local setup

Use **Node.js 20** and npm, matching CI. Start the backend first using its [setup instructions](https://github.com/Nikita-Nechaiev/ai-assistant-backend#local-setup). The examples below use backend port **3002** and frontend port **3000**.

```sh
npm ci
```

Create `.env.local` in this repository:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_SOCKET_URL=http://localhost:3002
```

```sh
npm run dev
```

Open [localhost:3000](http://localhost:3000). The backend's `FRONTEND_URL` must be `http://localhost:3000`. Use `localhost` consistently for both services so cookie authentication works as expected.

`NEXT_PUBLIC_SOCKET_URL` is the **server origin**, without `/ws` or another suffix. The client sets the Socket.IO transport path separately:

```ts
io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  path: '/collaboration-session-socket',
  transports: ['websocket'],
  withCredentials: true,
});
```

`NEXT_PUBLIC_*` values are public and embedded in the client bundle at build time. Keep API keys and other secrets on the backend. Next.js sets `NODE_ENV` for its commands; it does not need to be added to `.env.local`.

## Commands

| Command                           | Purpose                                 |
| --------------------------------- | --------------------------------------- |
| `npm run dev`                     | Development server with Turbopack       |
| `npm run build`                   | Production build with `next build`      |
| `npm start`                       | Serve an existing production build      |
| `npm run lint`                    | ESLint, with zero warnings allowed      |
| `npm run typecheck`               | TypeScript check without emitting files |
| `npm test`                        | Jest unit/component tests               |
| `npm run test:watch`              | Jest watch mode                         |
| `npm run test:cov -- --runInBand` | Tests and coverage report               |
| `npm run test:e2e`                | Playwright browser tests                |
| `npm run test:e2e:ui`             | Playwright UI mode                      |

## Authentication and deployment

The backend sets **HttpOnly access and refresh cookies**. Zustand holds user profile data, not tokens. HTTP requests include credentials. The Axios interceptor attempts cookie refresh once after a 401; a failed refresh or a second 401 clears the user state and redirects to `/login`. Middleware also checks or refreshes authentication for protected navigation. Backend authorization remains responsible for access to data and actions.

For the deployed frontend, configure these variables before building:

```dotenv
NEXT_PUBLIC_API_URL=https://api.ai-editor-portfolio.com
NEXT_PUBLIC_SOCKET_URL=https://api.ai-editor-portfolio.com
```

The current production cookie configuration uses `Secure` cookies scoped to `.ai-editor-portfolio.com`, so authenticated production testing requires HTTPS and matching domains. For ordinary local development and browser tests, run the services in development mode.

`next.config.ts` also rewrites `/api/:path*` to the production API. The API clients above use `NEXT_PUBLIC_API_URL` directly; changing that variable does not change the rewrite destination. There is currently no custom CSP or bundle-analyzer configuration in this file.

## Tests and CI

Unit/component tests use **Jest and React Testing Library**, with external HTTP clients and sockets mocked where appropriate. They cover authentication, query/cache behavior, document loading, AI workflows, profile updates, dialogs, and resource cleanup. `jest.config.js` enforces **81% minimum coverage for statements, branches, functions, and lines**. Generate current measurements with `npm run test:cov`; reports are written to `coverage/`.

The browser suite contains **12 Chromium scenarios** using real HTTP and Socket.IO requests. It registers its own accounts and creates its own sessions, documents, and invitations. Pre-seeded accounts and `E2E_*` credentials are not required.

Start a backend connected to a **disposable test database**, then start Next.js with the API/socket settings pointing to that backend. Create `.env.test.local` for Playwright:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_SOCKET_URL=http://localhost:3002
PW_BASE_URL=http://localhost:3000
```

```sh
npx playwright install chromium
npm run test:e2e -- --workers=2
```

Playwright reads `.env.test.local` without overriding existing environment variables, reuses a running frontend, or starts one if needed. Setting Playwright variables alone does not reconfigure an already-running Next.js server. See [the browser test guide](e2e/README.md) for details.

[Frontend CI](.github/workflows/frontend-ci.yml) runs on pushes and PRs to `main`, and merge-group events:

- **Quality job:** installs dependencies, runs lint, TypeScript, Jest coverage, and a production build; uploads coverage.
- **E2E job:** checks out a pinned backend revision, starts PostgreSQL and MailHog, builds/starts the backend and starts Next.js in development mode, then runs Playwright; uploads the HTML report and server logs.

The jobs run independently. Hosting deployment is configured separately from this workflow.

## Current limitations

- The UI is English-only. PDF export uses the current browser-side font setup and is intended for English text; full Unicode export is not implemented.
- Document updates are saved and broadcast through Socket.IO; there is no dedicated CRDT/operational-transformation conflict resolution layer.

## Contact

- **Mykyta Nechaiev**
- Email: [mykyta.nechaiev.dev@gmail.com](mailto:mykyta.nechaiev.dev@gmail.com)
- [LinkedIn](https://www.linkedin.com/in/mykyta-nechaiev-48b776358/)
