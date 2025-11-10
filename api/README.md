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

## cURL references

```bash
### Health
curl -i http://localhost:3000/health

### List memos
curl -i http://localhost:3000/memos

### Get by id
curl -i http://localhost:3000/memos/123

### Create memo (placeholder)
curl -i -X POST http://localhost:3000/memos \
 -H "Content-Type: application/json" \
 -d '{"title":"test","body":"test"}'

### Update memo
curl -i -X PUT http://localhost:3000/memos/123 \
 -H "Content-Type: application/json" \
 -d '{"title":"new","body":"new"}'

### Delete memo
curl -i -X DELETE http://localhost:3000/memos/123

### Invalid JSON -> 400
curl -i -X POST http://localhost:3000/memos \
 -H "Content-Type: application/json" \
 -d '{"bad": "data"'

### Unknown path -> 404
curl -i http://localhost:3000/does-not-exist

### Method not allowed -> 405
curl -i -X DELETE http://localhost:3000/memos
```
