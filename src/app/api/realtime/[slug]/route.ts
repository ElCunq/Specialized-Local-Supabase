import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Send initial SSE connection event
  writer.write(
    encoder.encode(`event: connected\ndata: ${JSON.stringify({ tenant: slug, status: "online", timestamp: Date.now() })}\n\n`)
  );

  // Interval ping event
  const interval = setInterval(() => {
    try {
      writer.write(
        encoder.encode(`event: heartbeat\ndata: ${JSON.stringify({ tenant: slug, ping: "pong", timestamp: Date.now() })}\n\n`)
      );
    } catch {
      clearInterval(interval);
    }
  }, 5000);

  req.signal.addEventListener("abort", () => {
    clearInterval(interval);
    writer.close();
  });

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
