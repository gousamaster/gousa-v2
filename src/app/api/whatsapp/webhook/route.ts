import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken =
    process.env.WHATSAPP_VERIFY_TOKEN;

  if (
    mode === "subscribe" &&
    token &&
    verifyToken &&
    token === verifyToken
  ) {
    return new NextResponse(challenge ?? "", {
      status: 200,
    });
  }

  return NextResponse.json(
    { error: "Webhook verification failed" },
    { status: 403 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log(
      "NEXUS WhatsApp webhook event:",
      JSON.stringify(body)
    );

    return NextResponse.json(
      { received: true },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "NEXUS WhatsApp webhook error:",
      error
    );

    return NextResponse.json(
      { error: "Invalid webhook payload" },
      { status: 400 }
    );
  }
}
