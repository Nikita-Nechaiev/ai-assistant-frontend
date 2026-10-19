# Frontend unit tests

Run from the client directory:

```sh
npm run lint
npm run typecheck
npm test -- --runInBand
npm run test:cov -- --runInBand
npm run build
```

The coverage command requires **at least 81%** for statements, branches, functions, and lines. It includes application pages, middleware, components, hooks, stores, services, helpers, providers, hydration, and shared utilities, including files with no tests. Type declarations, test files, stories, and type-only files are excluded.

Jest uses jsdom by default; middleware tests use the Node environment. External APIs and sockets are mocked, so no backend, database, or network connection is required. Browser APIs missing from jsdom are supplied in `jest.setup.ts`.

The suite checks validation and error paths as well as successful operations, including document insertion and saving, permissions, sessions, statistics, AI requests, PDF export, CV downloads, notifications, authentication, and FAQ search. Existing component tests follow current accessible names and interactions.

Coverage reports are generated in `coverage/`: open `coverage/lcov-report/index.html` for details, or read `coverage/coverage-summary.json` for machine-readable totals. Reports are generated locally and should not be committed.

Browser end-to-end tests are separate and are not part of these unit coverage totals.

The document integration suite mounts the actual page and hooks with a mocked socket and editor adapter. It checks unavailable and invalid documents, route changes and late responses, AI validation and duplicate submissions, copying and appending results, selection mode, read-only previews, and cancellation of delayed saves. Private-query tests cover disabled requests before authentication, user-scoped keys, cache cancellation and removal on account changes, pagination, and invalidation. Resource tests verify scroll restoration and blob URL cleanup.

CI runs these frontend checks in the independent `quality` job. The existing `e2e` job retains the backend, database and Playwright setup; browser checks are not part of the local unit verification workflow.
