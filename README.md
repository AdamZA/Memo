# Memo

Full-stack Memo Application using React/React Query/Express.js/Rest, as a part of the Paystack interview process.

## Environment Setup

### Install dependencies

```bash
npm install
```

### Prettier, pre-commit and pre-push hooks

There are 2 git hooks set up for this repo:
pre-commit hook: runs prettier check against your code
pre-push hook: runs typechecks and unit tests for the repo

Use `npm run prepare` to give permissions to pre-commit and pre-push hooks

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

### Tooling

- CommonJS used for ease of implementation
- Husky used for pre-push hook to prevent PR noise

### Future additions

- Add translation (i18n) and basic localization
