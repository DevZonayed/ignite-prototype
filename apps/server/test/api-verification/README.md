# API verification scripts

One script per mobile app. Each signs in as that role and calls **every
endpoint the app actually uses**, printing a pass/fail table.

These are not unit tests and are not run by `npm test`. They answer a different
question: *does the running server still speak the shape this app expects?* —
which is what catches a renamed route, a query parameter the DTO now rejects,
or a permission that changed. They found `/assessments` (not `/assessment`),
the teacher-only `share` route, and the LQS scale bug.

## Running them

They need a seeded server on `http://127.0.0.1:4000`:

```bash
cd apps/server
IGNITE_DB_PORT=55433 SEED_DEMO_DATA=true docker compose up -d --build

node test/api-verification/verify-teacher-api.mjs
node test/api-verification/verify-learner-api.mjs
node test/api-verification/verify-parent-api.mjs
```

Each exits non-zero if anything fails, so they work in a pipeline.

They sign in with the seeded accounts at the documented default password, and
the teacher and parent scripts **write** — sessions, homework, submissions,
messages, evidence, portfolio projects. Point them at a demo database, never
at anything real.
