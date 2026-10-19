# Browser end-to-end tests

The suite contains 12 Chromium scenarios and uses real HTTP and Socket.IO requests.
Run it against a backend connected to a disposable test database, never a production
or showcase database. Tests register unique accounts and create their own sessions,
documents and invitations; they do not delete existing data.

Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` to that backend when starting
Next.js. Set `PW_BASE_URL` to the frontend URL. Playwright reads `.env.test.local`
without overriding environment variables and reuses a running frontend server.

```sh
npm run test:e2e -- --workers=2
```

Accounts are created per test, so no pre-seeded users, shared storage-state file or
`E2E_*` credentials are needed. Requests used for setup have a separate cookie jar
from the browser. Registration and sign-in scenarios exercise the actual forms;
only unrelated setup (accounts and empty sessions) uses the API.

Selectors use accessible roles, labels and dialog names. Assertions cover both
success and error responses, cookie refresh, modal behavior and persistence after
reloading the page. No scenarios are skipped or retried locally to hide failures.
