import { VoltAgent, VoltAgentObservability } from "@voltagent/core";
import { honoServer } from "@voltagent/server-hono";
import { researchAgent } from "./agents/research/index.js";
import { streamResearchCompany } from "./agents/research/index.js";
import { cors } from "hono/cors";

const port = process.env.VOLTAGENT_PORT ? Number(process.env.VOLTAGENT_PORT) : 3141;

new VoltAgent({
  agents: {
    research: researchAgent,
  },
  server: honoServer({
    port,
    enableSwaggerUI: true,
    configureApp: (app) => {
      // Add CORS for browser requests
      app.use('/research/*', cors({
        origin: ['http://localhost:8080', 'http://localhost:5173'],
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: ['Content-Type'],
      }));

      // Custom research streaming endpoint
      app.post('/research/stream', async (c) => {
        try {
          // Accept both shapes: { input: {...} } and direct {...}
          const raw = (await c.req.json()) as any;
          const body = raw && typeof raw === 'object' && 'input' in raw ? raw.input : raw as {
            companyId: string;
            companyName: string;
            githubUrl?: string;
            userId?: string;
            options?: {
              maxSteps?: number;
              temperature?: number;
            };
          };

          if (!body?.companyId || !body?.companyName) {
            return c.json({ error: 'Missing required fields: companyId, companyName' }, 400);
          }

          // Start streaming
          const stream = await streamResearchCompany({
            companyId: body.companyId,
            companyName: body.companyName,
            githubUrl: body.githubUrl,
            options: body.options,
          });

          // Create SSE stream
          const encoder = new TextEncoder();
          const readable = new ReadableStream({
            async start(controller) {
              try {
                // Send progress updates
                controller.enqueue(encoder.encode('data: ' + JSON.stringify({ type: 'progress', message: 'Starting research...' }) + '\n\n'));

                // Stream partial objects
                for await (const partial of stream.partialObjectStream) {
                  controller.enqueue(encoder.encode('data: ' + JSON.stringify({ type: 'chunk', data: partial }) + '\n\n'));
                }

                // Get final result
                const finalResult = await stream.object;
                controller.enqueue(encoder.encode('data: ' + JSON.stringify({ type: 'chunk', data: finalResult }) + '\n\n'));
                controller.enqueue(encoder.encode('data: ' + JSON.stringify({ type: 'done' }) + '\n\n'));
                controller.close();
              } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                controller.enqueue(encoder.encode('data: ' + JSON.stringify({ type: 'error', message: errorMsg }) + '\n\n'));
                controller.close();
              }
            },
          });

          return new Response(readable, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          return c.json({ error: errorMsg }, 500);
        }
      });
    },
  }),
  observability: new VoltAgentObservability(),
});

console.log(`VoltAgent server started on http://localhost:${port}`);
console.log(`Research agent available at:`);
console.log(`  - /agents/research/* (VoltAgent endpoints)`);
console.log(`  - /research/stream (Custom streaming endpoint)`);
