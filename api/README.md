# Memo API

## Environment setup

Project developed using **Node v24.11.0 (LTS, 2025-11-09)**.  
Please use **nvm** for Node version management to ensure consistent runtime behaviour.

### Node

Install Node 24 (if not already available)

```bash
nvm install 24
nvm use 24
node -v   # Expect v24.11.0
```

## Running the api
Run the API, or alteratively run it in dev mode which watches for file changes and skips full type-checking for speed
```bash
npm run start
npm run dev
```

## Running tests

Vitest and Supertest used for testing

```bash
npm run test
```

## Design
### Data flow
Startup flow: (index.ts)
- Initialize the in-memory repository implementation
- Create service layer and inject the repository
- Build the router using the service
- Register the global middleware (error handling)

Request/Response flow:
- Request enters Express router
- Router passes the request through to the controller
- Controller validates input against Zod schema definitions
    - On failure, throw error for middleware to format
    - On success, passes typed input data to service layer
- Service layer contains business logic and calls repository to do CRUD operations
    - Currently straight passthrough, but allows easy expansion and external integrations in the future
- Repo layer interacts with the datastore, being an in-memory Map in this case, and returns response
- Response surfaces up through service layer
- Response hits Controller, which constructs the res.status(...).json(...)
- Middleware processes any thrown errors
- Express returns the final response to the caller

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
```json
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
{
  "error": "Method Not Allowed"
}
```