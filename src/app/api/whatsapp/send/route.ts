import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // ==========================================
    // 1. PROTEGER LA RUTA CON SESIÓN DEL CRM
    // ==========================================

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ==========================================
    // 2. LEER DATOS DEL MENSAJE
    // ==========================================

    const body = await request.json();

    const to =
      typeof body?.to === "string"
        ? body.to.replace(/\D/g, "")
        : "";

    const text =
      typeof body?.text === "string"
        ? body.text.trim()
        : "";

    if (!to || !text) {
      return NextResponse.json(
        {
          error:
            "Los campos 'to' y 'text' son obligatorios",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 3. CREDENCIALES META DESDE VERCEL
    // ==========================================

    const accessToken =
      process.env.WHATSAPP_ACCESS_TOKEN;

    const phoneNumberId =
      process.env.WHATSAPP_PHONE_NUMBER_ID;

    const graphVersion =
      process.env.WHATSAPP_GRAPH_API_VERSION ??
      "v25.0";

    if (!accessToken || !phoneNumberId) {
      console.error(
        "NEXUS WhatsApp send configuration missing"
      );

      return NextResponse.json(
        {
          error:
            "Configuración de WhatsApp incompleta",
        },
        { status: 500 }
      );
    }

    // ==========================================
    // 4. ENVIAR A WHATSAPP CLOUD API
    // ==========================================

    const metaResponse = await fetch(
      `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "text",
          text: {
            preview_url: false,
            body: text,
          },
        }),
      }
    );

    const metaData =
      await metaResponse.json();

    if (!metaResponse.ok) {
      console.error(
        "NEXUS WhatsApp Meta send error:",
        JSON.stringify(metaData)
      );

      return NextResponse.json(
        {
          error:
            "Meta rechazó el envío",
          meta: metaData,
        },
        {
          status: metaResponse.status,
        }
      );
    }

    const whatsappMessageId =
      metaData?.messages?.[0]?.id ?? null;

    const sentAt = new Date();

    // ==========================================
    // 5. BUSCAR CLIENTE
    // ==========================================

    const cliente =
      await db.cliente.findFirst({
        where: {
          OR: [
            {
              telefonoCelular: to,
            },
            {
              telefonoCelular: `+${to}`,
            },
          ],
          activo: true,
        },
        select: {
          id: true,
        },
      });

    // ==========================================
    // 6. BUSCAR O CREAR CONVERSACIÓN
    // ==========================================

    let conversation =
      await db.whatsAppConversation.findFirst({
        where: {
          phoneNumber: to,
          phoneNumberId,
        },
      });

    if (!conversation) {
      conversation =
        await db.whatsAppConversation.create({
          data: {
            phoneNumber: to,
            phoneNumberId,
            clienteId:
              cliente?.id ?? null,
            status: "OPEN",
            lastMessageAt: sentAt,
          },
        });
    } else {
      conversation =
        await db.whatsAppConversation.update({
          where: {
            id: conversation.id,
          },
          data: {
            clienteId:
              conversation.clienteId ??
              cliente?.id ??
              null,
            lastMessageAt: sentAt,
          },
        });
    }

    // ==========================================
    // 7. GUARDAR MENSAJE SALIENTE
    // ==========================================

    const savedMessage =
      await db.whatsAppMessage.create({
        data: {
          conversationId:
            conversation.id,

          whatsappMessageId,

          direction:
            "OUTBOUND",

          type:
            "text",

          text,

          senderPhone:
            null,

          sentAt,

          rawPayload:
            metaData,
        },
      });

    console.log(
      "NEXUS WhatsApp outbound message sent:",
      JSON.stringify({
        to,
        conversationId:
          conversation.id,
        messageId:
          savedMessage.id,
        whatsappMessageId,
        sentBy:
          session.user.id,
      })
    );

    return NextResponse.json(
      {
        sent: true,
        to,
        conversationId:
          conversation.id,
        messageId:
          savedMessage.id,
        whatsappMessageId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "NEXUS WhatsApp send error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo enviar el mensaje de WhatsApp",
      },
      { status: 500 }
    );
  }
}
