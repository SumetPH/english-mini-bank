import { handleTelegramUpdate } from "@/bot/handler";
import { isValidTelegramSecretToken } from "@/lib/security";
import type { TelegramUpdate } from "@/lib/telegram";

export async function POST(request: Request): Promise<Response> {
  const secretToken = request.headers.get("x-telegram-bot-api-secret-token");

  if (!isValidTelegramSecretToken(secretToken)) {
    console.warn("Rejected Telegram webhook due to invalid secret token", {
      hasHeader: Boolean(secretToken),
      headerLength: secretToken?.length ?? 0,
    });
    return Response.json({ ok: false }, { status: 401 });
  }

  try {
    const update = (await request.json()) as TelegramUpdate;
    console.info("Received Telegram webhook", {
      updateId: update.update_id,
      hasMessage: Boolean(update.message),
    });
    await handleTelegramUpdate(update);
  } catch (error) {
    console.error("Telegram webhook processing failed", error);
  }

  return Response.json({ ok: true });
}
