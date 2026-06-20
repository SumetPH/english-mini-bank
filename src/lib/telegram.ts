import { getTelegramBotToken } from "@/lib/env";

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
}

export interface TelegramChat {
  id: number;
  type: string;
}

export interface TelegramMessage {
  message_id: number;
  text?: string;
  chat: TelegramChat;
  from?: TelegramUser;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

interface SendMessageOptions {
  parseMode?: "Markdown";
}

export async function sendMessage(
  chatId: number,
  text: string,
  options?: SendMessageOptions,
): Promise<void> {
  const token = getTelegramBotToken();
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: options?.parseMode,
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();

    console.error("Telegram sendMessage failed", {
      chatId,
      status: response.status,
      body: responseBody,
    });

    throw new Error(`Telegram sendMessage failed with status ${response.status}`);
  }
}
