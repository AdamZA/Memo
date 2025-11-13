# Memo UI
UI implemented using React + TypeScript + Vite
Tanstack Query used for state management
Unit tests written using Vitest and React's Testing Library

## Environment setup
Project developed using **Node v24.11.0 (LTS, 2025-11-09)**.  
Please use **nvm** for Node version management to ensure consistent runtime behaviour.

### Node
Install Node 24 (if not already available)

```bash
nvm install 24
nvm use 24
node -v   # Expect v24.11.0 or equivalent 
```

### Install dependencies
```bash
npm install
```

## Running the UI
Use vite to start the local UI
```bash
npm run dev
```

## Running tests
Vitest and @testing-library/react used for testing
```bash
npm run test
```

## Design
### Initial scaffolding
Initial scaffolding done by running npm command from the root directory, to install the react-ts template from vite
```bash
npm create vite@latest web -- --template react-ts
```