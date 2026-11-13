# Cardtalogue test suite

Playwright browser tests for the Cardtalogue frontend and backend.

## Scope

Covered:

- login (valid, invalid, persisted session, logout)
- card search by name and code
- card creation through the UI
- card editing through the UI, including reload persistence

Not covered:

- **Card deletion.** The product does not currently implement a card delete
  endpoint or UI, so it is intentionally out of scope.
- **Scanner.** `cardtalogue-yugioh-scanner`, `/scan`, and `/media/scan` are not
  started or exercised. The tests only touch the frontend and backend.

## How it runs

Playwright starts both services automatically:

1. `scripts/start-backend.mjs` deletes the previous test state, builds the Go
   API, and starts it against a fresh disposable SQLite database.
2. Vite starts the frontend dev server on `http://localhost:3000`.

The database lives under `E2E_TMP_DIR` (default: a `cardtalogue-e2e` directory in
the system temp directory). It is recreated on every run and removed by the
Playwright global teardown.

`reuseExistingServer` is disabled, so stop any manually running backend on port
`8080` and frontend on port `3000` before running the suite.

## Prerequisites

- Go 1.26+
- Node.js 20+
- Contract TypeScript types generated from the contract repo:

```bash
cd ../cardtalogue-api-contract
make generate-ts
```

- Frontend dependencies installed:

```bash
cd ../cardtalogue-frontend
npm install
```

## Install

```bash
cd cardtalogue-test
npm install
npx playwright install chromium
```

## Run

```bash
npm test
```

Other commands:

```bash
npm run test:headed
npm run test:ui
npm run test:debug
npm run typecheck
npm run report
```

## Environment

Copy `.env.example` to `.env` if you need to override defaults. Playwright does
not load `.env` automatically; export the variables or use the defaults below.

| Variable | Default |
| --- | --- |
| `E2E_BASE_URL` | `http://localhost:3000` |
| `E2E_API_URL` | `http://localhost:8080/api/v1` |
| `E2E_ADMIN_EMAIL` | `admin@example.com` |
| `E2E_ADMIN_PASSWORD` | `admin123` |
| `E2E_TMP_DIR` | `<system tmp>/cardtalogue-e2e` |

The backend is started with a test-only JWT secret and an isolated database, so
these credentials do not affect a developer's normal `cardtalogue-backend`
database.

## Test layout

```text
tests/
├── auth.setup.ts              # UI login, saves .auth/admin.json
├── support/
│   ├── api.ts                 # API login + fixture/assertion helpers
│   ├── env.ts                 # URLs, credentials, paths
│   ├── global-teardown.ts     # removes the disposable test directory
│   └── test-data.ts           # unique card codes/names
└── e2e/
    ├── login.spec.ts
    ├── search.spec.ts
    ├── create-card.spec.ts
    └── edit-card.spec.ts
```

The authenticated specs use the storage state produced by the setup project.
The login spec runs in a separate project without stored credentials.

## Notes on test isolation

- Each run gets a fresh SQLite database with the default admin and seed data.
- Cards are created with unique codes and names, so tests can run serially
  against the same database without colliding.
- Tests run with one worker because they share the backend.
