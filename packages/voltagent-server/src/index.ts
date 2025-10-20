import { VoltAgent, VoltAgentObservability } from "@voltagent/core";
import { honoServer } from "@voltagent/server-hono";

const port = process.env.VOLTAGENT_PORT ? Number(process.env.VOLTAGENT_PORT) : 3141;

new VoltAgent({
  agents: {}, // no agents yet; this is pre-agent scaffolding
  server: honoServer({
    port,
    enableSwaggerUI: true,
  }),
  observability: new VoltAgentObservability(),
});

console.log(`VoltAgent server started on http://localhost:${port}`);
