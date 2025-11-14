# Memo

Full-stack Memo application built with React, React Query, Express.js, TypeScript and REST, created as part of the Paystack Full-stack Practical Assignment.

---

## Environment Setup

### Install dependencies

From the repository root:

```bash
npm install
```

This installs dependencies for both the `api` and `web` workspaces.

---

## Running the API and Web

Run the API only:

```bash
npm run dev:api
```

Run the Web UI only:

```bash
npm run dev:web
```

Run both API and Web together:

```bash
npm run dev
```

> The UI expects the Memo API to be running on `http://localhost:3000`.
> The UI will typically be hosted at `http://localhost:5173`

---

## Building

Build the API:

```bash
npm run build:api
```

Build the Web UI:

```bash
npm run build:web
```

Build everything:

```bash
npm run build
```

---

## Prettier, Pre-commit and Pre-push Hooks

Two Git hooks are configured via Husky:

- pre-commit: runs lint-staged for formatting checks
- pre-push: runs the full verify step (type checks + tests)

Enable Husky hook permissions:

```bash
npm run prepare
```

Format the entire repository:

```bash
npm run format
```

Check formatting only:

```bash
npm run format:check
```

Bypass hooks for WIP commits:

```bash
git commit --no-verify -m "WIP commit"
git push --no-verify
```

---

## Running Tests

API tests:

```bash
npm run test:api
```

Web UI tests:

```bash
npm run test:web
```

Run both:

```bash
npm run test:all
```

Shortcut:

```bash
npm test
```

---

## Type Checking

API only:

```bash
npm run typecheck:api
```

Web only:

```bash
npm run typecheck:web
```

Run both:

```bash
npm run typecheck:all
```

Shortcut:

```bash
npm run typecheck
```

---

## Full Verification (Used by the Pre-push Hook)

The verify script runs formatting checks, type checks and both test suites:

```bash
npm run verify
```

This is the same validation process executed on every push.

---

## Design and Architecture

### Frontend
- Built using React + Vite + TypeScript
- React Query handles data fetching, caching and refetch intervals
- React Router routes:
  - /
  - /memos
  - /memos/:id
  - /memos/:id/edit
  - /memos/new
- Features implemented:
  - Debounced search
  - Pagination
  - Create and Edit flows
  - Delete confirmation modal
  - Loading and error states
  - Basic required validation checks

### Backend
- Layered architecture:
  Controller → Service → Repository → Datastore
- Zod for validation of incoming JSON
- Async repository implemented on top of a Map datastore (easier swapout with cloud async repos)
- NanoID used for ID generation
- Global error middleware for consistent JSON responses

### Tooling
- Workspaces to separate API and Web
- Prettier
- Husky
- Vite
- TypeScript for both server and client

---

## Future Improvements

- Add internationalization and localization (i18n)
- Replace Map datastore with a real database
- Aim for 100% path coverage across API and UI
- Add structured logging
- Migrate UI styling to a more scalable system (styled-components)
- Dockerize API + Web for easier deployment/scaling
- Change ordering for memos listing, for newest -> latest factoring in pagination
- Allow for re-ordering on each column on front end

---

## Demo

![Memo Demo](https://private-user-images.githubusercontent.com/8327850/514494310-1808371a-5ff2-4a45-b104-cfeecaecb50a.gif?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjMxMzU0MDYsIm5iZiI6MTc2MzEzNTEwNiwicGF0aCI6Ii84MzI3ODUwLzUxNDQ5NDMxMC0xODA4MzcxYS01ZmYyLTRhNDUtYjEwNC1jZmVlY2FlY2I1MGEuZ2lmP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQVZDT0RZTFNBNTNQUUs0WkElMkYyMDI1MTExNCUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyNTExMTRUMTU0NTA2WiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9YTI3MGIyOWU1NTRmODQ1MDRhZjI2M2QxMWNlYjFlZDZhYWJiODJmODY0ZDdhODY2NzdlZDRiNmE2OWI0M2U0OSZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QifQ.4ZZVWU4qbPbaRJFNLLpoAYe-Js-J6OnEDIysBdCF2ew)

> _Short demo of core UI functionality_

---
