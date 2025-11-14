# Memo UI

UI implemented using **React + TypeScript + Vite**  
State management and data fetching implemented with **@tanstack/react-query**  
Unit tests written using **Vitest** and **@testing-library/react**

The UI is a simple memo dashboard that allows you to:

- View a paginated, searchable list of memos  
- View memo details
- Create new memo  
- Edit existing memo  
- Delete memo

> The UI expects the Memo API to be running on `http://localhost:3000`.

---

## Environment setup

Project developed using **Node v24.11.0 (LTS, 2025-11-09)**.  
Please use **nvm** for Node version management to ensure consistent runtime behaviour.

### Node

Install Node 24 (if not already installed):

```bash
nvm install 24
nvm use 24
node -v   # Expect v24.11.0 or equivalent
```

### Install dependencies

From the `web` directory:

```bash
npm install
```

---

## Running the UI

Use Vite to start the local development server:

```bash
npm run dev
```

Vite typically serves at:  
`http://localhost:5173`

Ensure the Memo API is available at `http://localhost:3000`.

---

## Running tests

Vitest + React Testing Library are used for tests:

```bash
npm run test
```

Optional:

```bash
npm run test:watch      # Watch mode
npm run coverage        # Coverage report
```

The tests cover:

- Dashboard rendering (header, search input, memo rows)
- Loading, error, and empty states  
- Create form validation (title/body required)
- Create & Edit form submission behaviour
- Prefilling edit form with memo details
- Error state for memo details load failure

---

## Design

### Initial scaffolding

This project was scaffolded using the Vite React TypeScript template:

```bash
npm create vite@latest web -- --template react-ts
```

### Routing

Routing implemented using **react-router-dom**:

- `/` and `/memos` → memo dashboard  
- `/memos/new` → create memo  
- `/memos/:id` → memo details  
- `/memos/:id/edit` → edit memo  

Navigation uses `<Link>` components styled as buttons.

### State management

**@tanstack/react-query** is used for client-side state & caching:

- `useMemosList` – fetches paginated & searchable memo list  
- `useMemoDetails` – fetches a single memo by id  
- `useCreateMemo`, `useUpdateMemo`, `useDeleteMemo` – mutation hooks for CRUD operations  

React Query handles:

- Background refetching  
- Query invalidation  
- Error + loading state management  
- Ensuring up-to-date UI after mutations  

### Forms & validation

Create / Edit screens:

- Both require **title** and **body**  
- Inline validation message when missing  
- On success:
  - **Create** → returns to dashboard  
  - **Edit** → returns to whichever page the user navigated from  
- Edit form pre-populates fields using memo details query

### Styling

All UI styling is managed in `App.css`, including:

- Centered card layout  
- Soft grey table headers  
- Subtle borders for memo details table  
- Buttons for primary, secondary, and danger actions  
- Pill badges for metadata indicators  
- Simple modal for delete confirmation  

---

## Seeding data for UI development

To quickly populate the UI with test memos, use the seeding script from the **Memo API** project.

From `/api`, run:

```bash
chmod +x seed
./seed 50   # creates 50 memos
./seed      # defaults to 30 memos
```

Once seeded, visit the UI at:  
`http://localhost:5173`

The dashboard will automatically display the seeded memos.

---

## Project structure (quick overview)

```
web/
├── src/
│   ├── api/
│   │   └── memoClient.ts
│   ├── hooks/
│   │   ├── useMemosList.ts
│   │   ├── useMemoDetails.ts
│   │   └── useMemoMutations.ts
│   ├── components/
│   │   └── DeleteConfirmationModal.tsx
│   ├── MemoEditorPage.tsx
│   ├── MemoDetailsPage.tsx
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
└── tests/
    └── (Vitest test files)
```