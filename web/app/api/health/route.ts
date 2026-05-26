// Lightweight liveness probe for container orchestration (Docker HEALTHCHECK).
// Intentionally does no DB/network work so it reflects "process is serving",
// not downstream dependency health.
export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json({ status: 'ok' })
}
