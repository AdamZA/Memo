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

### Prettier, pre-push hooks

Run npm run prepare to give permissions to pre-push hook for prettier and test runs:

```bash
npm run prepare
```

Pre-push hook added to run npm run tests + run npm run prettier commands

```bash
npm run format
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
