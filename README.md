# Garden Task Planner API

Garden Task Planner is a multi-user API that turns structured garden data into clear, daily work. Tasks belong to ordered garden beds, beds belong to a user-owned garden, and daily views present open work in walking order.

The project is under active development. APIs and data structures may still evolve.

## Current capabilities

- Auth0 JWT authentication with database-level ownership enforcement
- Garden, bed, and task creation, listing, updates, and deletion
- Bed ordering within a garden
- Task filtering by due date and completion status
- Perth-aware date-only scheduling
- Task completion and reopening, including completion timestamps
- Transactional daily and weekly task recurrence
- Due-today and garden-walk views containing open tasks only
- Request validation and normalization
- Swagger/OpenAPI documentation
- Unit, controller, and HTTP e2e tests
- GitHub Actions quality gates for production dependency audit, lint, build, and tests

## Domain model

```text
Garden (owned by an Auth0 user)
  └── Beds (ordered by position)
        └── Tasks (scheduled and optionally recurring)
```

Recurring tasks require a due date. Completing a `DAILY` or `WEEKLY` task creates exactly one next open occurrence, scheduled one or seven days after the completed occurrence's due date. Repeated or concurrent completion requests do not create duplicates.

## Technology

- Node.js 22
- NestJS 11
- Prisma 6
- PostgreSQL
- Auth0
- Jest and Supertest

## Running locally

### Prerequisites

- Node.js 22
- PostgreSQL
- An Auth0 API application

### Setup

```bash
npm ci
cp .env.example .env
npx prisma migrate dev
npm run start:dev
```

On Windows Command Prompt, use `copy .env.example .env`. In PowerShell, use `Copy-Item .env.example .env`.

Configure `.env` with values for your local PostgreSQL database and Auth0 tenant. The Auth0 domain must not include a protocol; the issuer must include `https://` and normally ends with `/`.

Integration tests require a separate, disposable PostgreSQL database configured through `TEST_DATABASE_URL`. Apply the Prisma migrations to that database before running the integration suite. Never point `TEST_DATABASE_URL` at a development or production database because the suite clears its data.

The API starts on `http://localhost:3000` by default. Interactive OpenAPI documentation is available at `http://localhost:3000/docs`.

Do not commit `.env`; it is intentionally ignored by Git.

## API routes

All routes below require an Auth0 bearer token.

### Profile

```text
GET    /profile
```

### Gardens

```text
GET    /gardens
POST   /gardens
GET    /gardens/:gardenId
PATCH  /gardens/:gardenId
DELETE /gardens/:gardenId
```

### Beds

```text
GET    /gardens/:gardenId/beds
POST   /gardens/:gardenId/beds
PATCH  /beds/:bedId
DELETE /beds/:bedId
```

### Tasks

```text
GET    /beds/:bedId/tasks
POST   /beds/:bedId/tasks
PATCH  /tasks/:taskId
DELETE /tasks/:taskId
```

Task lists support optional `dueOn=YYYY-MM-DD` and `status=OPEN|DONE` query parameters.

### Daily product views

```text
GET /gardens/:gardenId/tasks/due-today
GET /gardens/:gardenId/walk
```

`due-today` returns today's open tasks with their beds, ordered by bed position and task creation time. `walk` returns the garden's beds in position order with today's open tasks nested under each bed.

## Quality checks

Run the same checks used by CI before opening a pull request:

```bash
npm run audit:prod
npm run lint
npm run build
npm test
npm run test:e2e
npm run test:integration
```

`npm run lint` is read-only and fails on warnings. Use `npm run lint:fix` when you intentionally want ESLint and Prettier to update files.

GitHub Actions runs these checks for pull requests and pushes to `dev` and `main`. It can also be started manually from the Actions tab.

## Branching workflow

Work is completed in focused branches and merged through:

```text
feature/fix/test/docs/ci branch → dev → main
```

`dev` is the integration branch. `main` is the stable release checkpoint.

## Roadmap

### Next

- Add startup configuration validation and health/readiness endpoints
- Document and exercise a production deployment workflow

### Later

- Build a basic web or mobile client
- Support multi-user garden collaboration
- Add reusable garden and task templates
- Upgrade to Prisma 7 as a dedicated breaking-change migration
- Explore subscription-based product features

## Design principles

- Enforce ownership in database queries
- Keep date-only garden scheduling independent of server timezone
- Prefer small, composable domain operations
- Add features in focused, independently reviewable slices
- Avoid infrastructure complexity until the product requires it
