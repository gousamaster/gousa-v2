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

    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    const message = value?.messages?.[0];
    const contact = value?.contacts?.[0];

    const phoneNumberId =
      value?.metadata?.phone_number_id ?? null;

    const displayPhoneNumber =
      value?.metadata?.display_phone_number ?? null;

    if (!message) {
      console.log(
        "NEXUS WhatsApp event without incoming message:",
        JSON.stringify(body)
      );

      return NextResponse.json(
        { received: true },
        { status: 200 }
      );
    }

    const whatsappMessage = {
      messageId: message.id ?? null,
      from: message.from ?? null,
      timestamp: message.timestamp ?? null,
      type: message.type ?? null,

      contactName:
        contact?.profile?.name ?? null,

      text:
        message.type === "text"
          ? message.text?.body ?? null
          : null,

      phoneNumberId,
      displayPhoneNumber,
    };

    console.log(
      "NEXUS WhatsApp incoming message:",
      JSON.stringify(whatsappMessage)
    );

    return NextResponse.json(
      {
        received: true,
        message: whatsappMessage,
      },
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
