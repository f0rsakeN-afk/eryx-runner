# eryx-runner

**Isolated code execution service - fast, secure, multi-language**

Execute code safely in Docker containers with sub-second latency.

## Features

- **10 languages**: JavaScript, TypeScript, Python, Go, Rust, Java, C, C++, Bash, Ruby, PHP
- **Fast execution**: Bun native for JS/TS (~50ms), Docker for compiled languages
- **Secure**: No network inside containers, memory limits, read-only filesystem
- **Streaming**: SSE support for real-time output
- **Auto-scaling**: Stateless Docker execution per request
- **Swagger UI**: Interactive API docs at `/ui`

## Quick Start

```bash
# Install dependencies
bun install

# Run locally
PORT=3001 bun run src/index.ts

# Run with auto-reload on code changes
bun --watch src/index.ts

# Or with Docker
docker compose up -d
```

## API

### Execute Code

```bash
POST /execute
Content-Type: application/json

{
  "code": "print('hello')",
  "language": "python"
}
```

**Response:**
```json
{
  "stdout": "hello",
  "stderr": "",
  "exitCode": 0,
  "duration": 234
}
```

### Streaming Execute

```bash
POST /execute/stream
Content-Type: application/json

{
  "code": "import time; [print(i) or time.sleep(0.5) for i in range(5)]",
  "language": "python"
}
```

**Response (SSE):**
```
data: {"type":"start","language":"python"}
data: {"type":"stdout","data":"0\n"}
data: {"type":"stdout","data":"1\n"}
data: {"type":"done","exitCode":0,"duration":2500}
```

### Other Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /stats` | Pool statistics |
| `GET /languages` | Supported languages |
| `GET /ui` | Swagger UI |
| `GET /doc` | OpenAPI spec |

## Architecture

```
Request → [Hono API] → [Router] → [Runner] → [Docker]
                              ↓
                         [Bun Native]
                          (JS/TS)
```

- **Bun native**: JS/TS executed directly via `bun spawn` - no container overhead
- **Docker stateless**: Each execution spins up fresh container, auto-cleaned after

## Configuration

| Env | Default | Description |
|-----|---------|-------------|
| `PORT` | `3001` | Server port |
| `DOCKER_SOCKET` | `/var/run/docker.sock` | Docker socket path |

## Supported Languages

| Language | Image | Memory | Timeout |
|----------|-------|--------|---------|
| javascript | node:22-alpine | 256MB | 30s |
| typescript | node:22-alpine + tsx | 256MB | 30s |
| python | python:3.12-slim | 512MB | 30s |
| go | golang:1.22-alpine | 512MB | 45s |
| rust | rust:1.77-alpine | 512MB | 60s |
| java | eclipse-temurin:21-jdk-alpine | 512MB | 45s |
| c | alpine:3.19 + gcc | 256MB | 30s |
| cpp | alpine:3.19 + gcc | 256MB | 30s |
| bash | alpine:3.19 + bash | 128MB | 15s |
| ruby | ruby:3.3-alpine | 256MB | 30s |
| php | php:8.3-cli-alpine | 256MB | 30s |

## Future Enhancements

### Phase 1 - Multi-file Support
```json
{
  "files": {
    "index.js": "console.log('hello')",
    "utils.js": "module.exports = { foo: 1 }"
  },
  "entry": "index.js",
  "language": "javascript"
}
```

### Phase 2 - Project Mode (Bolt-like)
```
POST /project/create  → create workspace
POST /project/:id/file → write file
POST /project/:id/run → start dev server
GET  /project/:id/logs → stream output
POST /project/:id/stop → kill server
```

### Phase 3 - Enterprise
- Kubernetes orchestration
- S3 for file storage
- Redis for sessions/cache
- Kafka for async builds
- Tunnel service for port forwarding
- Multi-region deployment

## Client SDK

```typescript
import { Runner } from "eryx-runner/client";

const runner = new Runner({ baseUrl: "http://localhost:3001" });

// Simple
const result = await runner.run("print('hello')", "python");

// Streaming
for await (const chunk of runner.runStream("for i in range(10): print(i)", "python")) {
  console.log(chunk);
}
```

## License

MIT
