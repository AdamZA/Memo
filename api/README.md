# Memo API

In-memory REST API implemented using Node.js, Express and TypeScript.  
Zod is used for request validation, and the API is tested with Vitest and Supertest.  
The datastore is an asynchronous wrapper around a Map, using NanoID URL-safe identifiers.

---

## Environment Setup

This project was developed using Node v24.11.0 (LTS, 2025-11-09).  
It is recommended to use nvm to ensure consistent execution across environments.

### Install Node

```bash
nvm install 24
nvm use 24
node -v   # Expect v24.11.0
```

### Install dependencies

```bash
npm install
```

---

## Running the API

Start normally:

```bash
npm run start
```

Start in development mode (auto-reload, faster builds):

```bash
npm run dev
```

---

## Running Tests

Vitest and Supertest are used for testing.

```bash
npm run test
```

---

## Project Structure

```
api/
  src/
    index.ts               Entry point
    server.ts              Express app creation
    router.ts              Route definitions
    controllers/           Request validation and response shaping
    services/              Business logic
    repositories/          Data persistence layer (Map datastore)
    schemas/               Zod input validation
    errors/                Error classes and middleware
  test/
    integration/           Supertest integration tests
    unit/                  Unit tests for controllers/services/repo
```

---

## Design Overview

### Startup Flow (index.ts)

1. Initialize the Map-based datastore
2. Create repository instance
3. Create service and inject repository
4. Build controller layer
5. Build router using controllers
6. Apply global middleware (JSON body parsing, error handling)
7. Start Express server

### Request/Response Lifecycle

1. Request is received by Express router
2. Router forwards request to the appropriate controller
3. Controller validates input using Zod
   - On validation failure: error middleware returns a structured JSON error
   - On success: controller passes sanitized data to the service
4. Service handles business logic and calls the repository
5. Repository performs CRUD operations against the Map datastore
6. Service returns result to controller
7. Controller constructs final JSON response
8. Global middleware handles any thrown errors consistently

### Why this design?

The API follows a layered architecture (controller → service → repository) to:
- Keep responsibilities isolated
- Make business rules testable
- Allow easy swapping of the repository for a real database later
- Ensure strict validation and typed data flow end-to-end

---

## Seeding Data

If the API is running on port 3000:

```bash
chmod +x seed
./seed 50   # creates 50 memos
./seed      # defaults to 30
```

Alternatively, run this snippet manually:

```bash
for i in {1..30}; do
  curl -X POST "http://localhost:3000/memos" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"Seed memo $i\",
      \"body\": \"This is seeded memo number $i.\"
    }"
done
```

---

## Endpoints Overview

### Health Check
```bash
GET /health
```
Example:
```json
{"ok": true}
```

### Create Memo
```bash
POST /memos
```

### List Memos
```bash
GET /memos
```

Supports pagination and search:
```bash
GET /memos?page=1&limit=2&query=hello
```

### Get Memo by ID
```bash
GET /memos/:id
```

### Update Memo
```bash
PUT /memos/:id
```

### Delete Memo
```bash
DELETE /memos/:id
```

### Invalid JSON example
Returns:
```json
{"error":"Invalid JSON"}
```

### Not Found
```json
{"error":"Not Found"}
```

### Method Not Allowed
```json
{"error":"Method Not Allowed"}
```

---