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

## Design Overview

### Startup Flow (index.ts)

1. Initialize the Map-based datastore
2. Create repository instance
3. Create service and inject repository
4. Build controller layer using service
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

## cURL references
Health check:
```bash
curl http://localhost:3000/health
```
Example response:
```json
{"ok": true}
```

Create memo:
```bash
curl -X POST http://localhost:3000/memos \
  -H "Content-Type: application/json" \
  -d '{"title":"My first memo","body":"Hello world"}'
```
Example response:
```json
{
  "id": "N5PePgRbThar0eGkMNFio",
  "title": "My first memo",
  "body": "Hello world",
  "createdAt": "2025-11-12T23:20:25.613Z",
  "updatedAt": "2025-11-12T23:20:25.613Z",
  "version": 1
}
```

List memos:
```bash
curl http://localhost:3000/memos
```
Example response:
```json
{
  "data": [
    {
      "id": "N5PePgRbThar0eGkMNFio",
      "title": "My first memo",
      "body": "Hello world",
      "createdAt": "2025-11-12T23:20:25.613Z",
      "updatedAt": "2025-11-12T23:20:25.613Z",
      "version": 1
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

List memos with query and pagination parameters:
```bash
curl "http://localhost:3000/memos?page=1&limit=2&query=hello"
```
Example response:
```json
{
  "data": [
    {
      "id": "Vxn-pe4X36RWeoyeA6Ch1",
      "title": "My first memo",
      "body": "Hello world",
      "createdAt": "2025-11-12T23:37:14.454Z",
      "updatedAt": "2025-11-12T23:37:14.454Z",
      "version": 1
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 2
}
```

Get memo by ID:
```bash
curl http://localhost:3000/memos/{id}
```
Example response:
```json
{
  "id": "N5PePgRbThar0eGkMNFio",
  "title": "My first memo",
  "body": "Hello world",
  "createdAt": "2025-11-12T23:20:25.613Z",
  "updatedAt": "2025-11-12T23:20:25.613Z",
  "version": 1
}
```

Update memo:
```bash
curl -X PUT http://localhost:3000/memos/{id} \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated title"}'
```
Example response:
```json
{
  "id": "N5PePgRbThar0eGkMNFio",
  "title": "Updated title",
  "body": "Hello world",
  "createdAt": "2025-11-12T23:20:25.613Z",
  "updatedAt": "2025-11-12T23:26:00.361Z",
  "version": 2
}
```

Delete memo:
```bash
curl -X DELETE http://localhost:3000/memos/{id}
```
(No expected response)

Invalid JSON payload:
```bash
curl -X POST http://localhost:3000/memos \
 -H "Content-Type: application/json" \
 -d '{"bad": "data"'
```
Example response:
```json
{
  "error": "Invalid JSON"
}
```

Unsupported path:
```bash
curl http://localhost:3000/does-not-exist
```
Example response:
```json
{
  "error": "Not Found"
}
```

Method not allowed (Included -i response to see Allowed headers)
```bash
curl -i -X DELETE http://localhost:3000/memos
```
Example response:
```text
HTTP/1.1 405 Method Not Allowed
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Allow: GET, POST
Content-Type: application/json; charset=utf-8
Content-Length: 30
ETag: W/"1e-IBweH4Vj7lDovJDf9KQOpDMeplg"
Date: Wed, 12 Nov 2025 23:29:03 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

```json
{
  "error": "Method Not Allowed"
}
```

---
