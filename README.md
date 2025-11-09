# Memo

Full-stack Memo Application using React/React Query/Express.js/Rest, as a part of the Paystack interview process.

## Environment Setup

Project developed using **Node v24.11.0 (LTS, 2025-11-09)**.  
Please use **nvm** for Node version management to ensure consistent runtime behaviour.

### Install Node 24 (if not already available)

```bash
nvm install 24
nvm use 24
node -v   # Expect v24.11.0
```

### Prettier, pre-commit and pre-push hooks

There are 2 git hooks set up for this repo:
pre-commit hook: runs prettier check against your code
pre-push hook: runs typechecks and unit tests for the repo

Run npm run prepare to give permissions to pre-commit and pre-push hooks

```bash
npm run prepare
```

To run prettier:

```bash
npm run format
```

If you want to commit WIP work without triggering the pre-commit and pre-push hooks

```bash
git commit --no-verify -m "commit message"
git push --no-verify
```

## Running tests

Vitest and Supertest used for testing

```bash
npm run test:api ## api server tests
npm run test:web ## ui tests
npm run test:all ## both api server and ui tests
```

## Design

CommonJS used for ease of implementation
Husky used for pre-push hook
