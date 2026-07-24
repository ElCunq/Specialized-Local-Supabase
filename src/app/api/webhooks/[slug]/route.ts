import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    // Mock/DB stored webhooks list
    const webhooks = [
      {
        id: "wh_01",
        name: "Stripe Payment Listener",
        table: "orders",
        events: ["INSERT", "UPDATE"],
        targetUrl: "https://api.myapp.com/webhooks/stripe",
        status: "active",
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({ success: true, tenant: slug, webhooks });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await req.json();
    const { name, table, events, targetUrl } = body;

    if (!name || !table || !targetUrl) {
      return NextResponse.json({ success: false, error: "Missing required webhook fields" }, { status: 400 });
    }

    const newWebhook = {
      id: `wh_${Date.now()}`,
      name,
      table,
      events: events || ["INSERT"],
      targetUrl,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, webhook: newWebhook }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
