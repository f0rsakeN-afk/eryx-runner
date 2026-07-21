/**
 * eryx-runner - Lean, performant code execution API
 */

import { serve } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { SwaggerUI } from "@hono/swagger-ui";
import { z } from "zod";
import { run, health, stats, shutdown, init } from "./router";
import { LANGUAGES, isSupported } from "./languages";

const app = new OpenAPIHono();

// Better schema with proper descriptions
const ExecuteRequestSchema = z.object({
  code: z.string().describe("Source code to execute"),
  language: z.enum(["python", "javascript", "typescript", "go", "rust", "java", "c", "cpp", "bash", "ruby", "php"]).describe("Language"),
  timeout: z.number().min(1000).max(60000).optional().describe("Timeout in ms (1s-60s, default 30s)"),
});

const ExecuteResponseSchema = z.object({
  stdout: z.string().describe("Standard output"),
  stderr: z.string().describe("Standard error"),
  exitCode: z.number().describe("Exit code (0 = success)"),
  duration: z.number().describe("Execution time in ms"),
});

const ErrorSchema = z.object({
  error: z.string().describe("Error message"),
  supported: z.array(z.string()).optional().describe("List of supported languages"),
});

// Routes
app.get("/health", async (c) => c.json(await health()));
app.get("/stats", async (c) => c.json(await stats()));
app.get("/languages", (c) => c.json({ languages: Object.keys(LANGUAGES) }));

// Regular execute
app.post("/execute", async (c) => {
  const body = await c.req.json();
  const { code, language, timeout } = body;

  if (!isSupported(language)) {
    return c.json({ error: `unsupported language: ${language}`, supported: Object.keys(LANGUAGES) }, 400);
  }

  if (timeout && timeout > 60_000) {
    return c.json({ error: "timeout max 60s" }, 400);
  }

  try {
    const result = await run(code, language, timeout);
    return c.json(result);
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
}).openapi({
  method: "post",
  path: "/execute",
  summary: "Execute code",
  description: "Execute code and get full output after completion",
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            code: { type: "string", description: "Source code", example: 'print("hello world")' },
            language: { type: "string", enum: ["python", "javascript", "go", "rust", "java", "c", "cpp", "bash", "ruby", "php"], example: "python" },
            timeout: { type: "number", minimum: 1000, maximum: 60000, description: "Timeout in ms" },
          },
          required: ["code", "language"],
        },
      },
    },
    required: true,
  },
  responses: {
    200: {
      description: "Execution result",
      content: {
        "application/json": {
          schema: ExecuteResponseSchema,
        },
      },
    },
    400: { description: "Invalid request" },
    500: { description: "Execution error" },
  },
});

// Streaming execute
app.post("/execute/stream", async (c) => {
  const body = await c.req.json();
  const { code, language, timeout } = body;

  if (!isSupported(language)) {
    return c.json({ error: `unsupported language: ${language}` }, 400);
  }

  // Stream response using SSE
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      try {
        send({ type: "start", language });

        const result = await run(code, language, timeout);

        send({ type: "stdout", data: result.stdout });
        send({ type: "stderr", data: result.stderr });
        send({ type: "done", exitCode: result.exitCode, duration: result.duration });
      } catch (err) {
        send({ type: "error", data: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}).openapi({
  method: "post",
  path: "/execute/stream",
  summary: "Execute code (streaming)",
  description: "Execute code and stream output as it's generated via Server-Sent Events",
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            code: { type: "string", description: "Source code" },
            language: { type: "string", enum: ["python", "javascript", "go", "rust", "java", "c", "cpp", "bash", "ruby", "php"] },
            timeout: { type: "number", minimum: 1000, maximum: 60000 },
          },
          required: ["code", "language"],
        },
      },
    },
    required: true,
  },
  responses: {
    200: { description: "SSE stream" },
    400: { description: "Invalid request" },
    500: { description: "Execution error" },
  },
});

// Swagger UI
app.get("/ui", (c) => c.html(SwaggerUI({ url: "/doc" })));

// OpenAPI doc
app.doc("/doc", {
  openapi: "3.0.0",
  info: { title: "eryx-runner", version: "1.0.0", description: "Isolated code execution service" },
  servers: [{ url: "http://localhost:3001" }],
});

// Init
init().catch(console.error);

// Graceful shutdown
["SIGTERM", "SIGINT"].forEach((sig) => {
  process.on(sig, async () => {
    console.log(`${sig} received`);
    await shutdown();
    process.exit(0);
  });
});

const port = parseInt(process.env.PORT || "3001");
console.log(`eryx-runner on port ${port}`);
serve({ fetch: app.fetch, port });
