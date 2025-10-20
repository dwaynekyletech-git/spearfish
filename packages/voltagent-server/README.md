# VoltAgent Server (Scaffold)

This package scaffolds a minimal VoltAgent server using Hono with built-in observability.

## Dev

1) Install deps (workspace root):

```bash
pnpm install
```

2) Start the local server:

```bash
pnpm voltagent:dev
```

Server will run at http://localhost:3141 and expose Swagger UI at /ui.

## Observability

- Local, real-time debugging works out of the box via WebSocket.
- For production export (optional), add to your `.env`:

```bash
VOLTAGENT_PUBLIC_KEY=pk_...
VOLTAGENT_SECRET_KEY=sk_...
```

Then open the VoltOps console in your browser and connect to your local server:

- https://console.voltagent.dev

The console connects directly to `http://localhost:3141` for local debugging.

## Notes

- This is pre-agent scaffolding. No application agents are registered yet.
- Supabase Edge Functions and UI remain unchanged.
