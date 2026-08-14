import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    const messageId =
      message.id ?? null;

    const from =
      message.from ?? null;

    const type =
      message.type ?? "unknown";

    const contactName =
      contact?.profile?.name ?? null;

    const text =
      message.type === "text"
        ? message.text?.body ?? null
        : null;

    const sentAt =
      message.timestamp
        ? new Date(
            Number(message.timestamp) * 1000
          )
        : new Date();

    if (!from) {
      console.warn(
        "NEXUS WhatsApp message without sender phone"
      );

      return NextResponse.json(
        { received: true },
        { status: 200 }
      );
    }

    // ==========================================
    // 1. EVITAR MENSAJES DUPLICADOS
    // ==========================================

    if (messageId) {
      const existingMessage =
        await db.whatsAppMessage.findUnique({
          where: {
            whatsappMessageId: messageId,
          },
        });

      if (existingMessage) {
        console.log(
          "NEXUS WhatsApp duplicate ignored:",
          messageId
        );

        return NextResponse.json(
          {
            received: true,
            duplicate: true,
          },
          { status: 200 }
        );
      }
    }

    // ==========================================
    // 2. INTENTAR IDENTIFICAR CLIENTE
    // ==========================================

    const normalizedFrom =
      from.replace(/\D/g, "");

    const cliente =
      await db.cliente.findFirst({
        where: {
          OR: [
            {
              telefonoCelular:
                normalizedFrom,
            },
            {
              telefonoCelular:
                `+${normalizedFrom}`,
            },
          ],
          activo: true,
        },
        select: {
          id: true,
        },
      });

    // ==========================================
    // 3. BUSCAR O CREAR CONVERSACIÓN
    // ==========================================

    let conversation =
      await db.whatsAppConversation.findFirst({
        where: {
          phoneNumber: normalizedFrom,
          phoneNumberId,
        },
      });

    if (!conversation) {
      conversation =
        await db.whatsAppConversation.create({
          data: {
            phoneNumber:
              normalizedFrom,

            contactName,

            phoneNumberId,

            displayPhoneNumber,

            clienteId:
              cliente?.id ?? null,

            status: "OPEN",

            lastMessageAt:
              sentAt,
          },
        });
    } else {
      conversation =
        await db.whatsAppConversation.update({
          where: {
            id: conversation.id,
          },
          data: {
            contactName:
              contactName ??
              conversation.contactName,

            displayPhoneNumber:
              displayPhoneNumber ??
              conversation.displayPhoneNumber,

            clienteId:
              conversation.clienteId ??
              cliente?.id ??
              null,

            lastMessageAt:
              sentAt,
          },
        });
    }

    // ==========================================
    // 4. GUARDAR MENSAJE ENTRANTE
    // ==========================================

    const savedMessage =
      await db.whatsAppMessage.create({
        data: {
          conversationId:
            conversation.id,

          whatsappMessageId:
            messageId,

          direction:
            "INBOUND",

          type,

          text,

          senderPhone:
            normalizedFrom,

          sentAt,

          rawPayload:
            body,
        },
      });

    console.log(
      "NEXUS WhatsApp message saved:",
      JSON.stringify({
        conversationId:
          conversation.id,

        messageId:
          savedMessage.id,

        whatsappMessageId:
          messageId,

        from:
          normalizedFrom,

        clienteId:
          conversation.clienteId,

        text,
      })
    );

    return NextResponse.json(
      {
        received: true,
        saved: true,
        conversationId:
          conversation.id,
        messageId:
          savedMessage.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "NEXUS WhatsApp webhook error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "WhatsApp webhook processing failed",
      },
      { status: 500 }
    );
  }
}
