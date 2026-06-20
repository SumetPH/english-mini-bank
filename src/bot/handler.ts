import {
  formatDeleteAmbiguous,
  formatDeleteNotFound,
  formatDeleteResult,
  formatGoogleTranslateUrl,
  formatItemsList,
  formatRandomItem,
  formatSavedItemMessage,
} from "@/features/word-bank/formatter";
import { parseAddCommand } from "@/features/word-bank/parser";
import { PostgresWordBankRepository } from "@/features/word-bank/repository";
import { WordBankService } from "@/features/word-bank/service";
import {
  clearConversationState,
  getConversationState,
  setConversationState,
} from "@/bot/conversation-state";
import {
  getHelpMessage,
  getUnauthorizedMessage,
  getUnknownCommandMessage,
  getWelcomeMessage,
} from "@/bot/commands";
import { isAllowedTelegramUser } from "@/lib/security";
import {
  sendMessage,
  type TelegramMessage,
  type TelegramUpdate,
} from "@/lib/telegram";

const service = new WordBankService(new PostgresWordBankRepository());

function extractCommandBody(text: string, command: string): string {
  return text.replace(new RegExp(`^/${command}(?:@\\S+)?`, "i"), "").trim();
}

async function handleConversation(
  message: TelegramMessage,
  text: string,
): Promise<boolean> {
  const userId = String(message.from?.id ?? "");
  const existingState = getConversationState(userId);

  if (!existingState) {
    return false;
  }

  if (existingState.step === "awaiting-meaning") {
    setConversationState(userId, {
      ...existingState,
      step: "awaiting-sentence",
      meaningTh: text.trim(),
    });

    await sendMessage(
      message.chat.id,
      "Nice. Now send your own English sentence.",
    );
    return true;
  }

  const savedItem = await service.createItem({
    telegramUserId: userId,
    wordOrChunk: existingState.wordOrChunk,
    meaningTh: existingState.meaningTh,
    mySentence: text.trim(),
  });

  clearConversationState(userId);
  await sendMessage(message.chat.id, formatSavedItemMessage(savedItem));
  return true;
}

async function handleAddCommand(
  message: TelegramMessage,
  text: string,
): Promise<void> {
  const result = parseAddCommand(text);
  const userId = String(message.from?.id ?? "");

  if (result.mode === "invalid") {
    await sendMessage(message.chat.id, result.error, { parseMode: "Markdown" });
    return;
  }

  if (result.mode === "conversation") {
    setConversationState(userId, {
      step: "awaiting-meaning",
      telegramUserId: userId,
      chatId: message.chat.id,
      wordOrChunk: result.wordOrChunk,
    });

    await sendMessage(
      message.chat.id,
      `Got it: ${result.wordOrChunk}\nNow send the Thai meaning.`,
    );
    return;
  }

  const savedItem = await service.createItem({
    telegramUserId: userId,
    wordOrChunk: result.wordOrChunk,
    meaningTh: result.meaningTh,
    mySentence: result.mySentence,
  });

  await sendMessage(
    message.chat.id,
    formatSavedItemMessage(savedItem, result.warnings),
  );
}

async function handleListCommand(message: TelegramMessage): Promise<void> {
  const items = await service.listRecentItems(String(message.from?.id ?? ""));

  await sendMessage(
    message.chat.id,
    formatItemsList(
      items,
      "No saved items yet. Try /add to save your first one.",
    ),
  );
}

async function handleSearchCommand(
  message: TelegramMessage,
  text: string,
): Promise<void> {
  const keyword = extractCommandBody(text, "search");

  if (!keyword) {
    await sendMessage(message.chat.id, "Send `/search keyword`.", {
      parseMode: "Markdown",
    });
    return;
  }

  const items = await service.searchItems(
    String(message.from?.id ?? ""),
    keyword,
  );
  await sendMessage(
    message.chat.id,
    formatItemsList(items, `No matches found for "${keyword}".`),
  );
}

async function handleRandomCommand(message: TelegramMessage): Promise<void> {
  const item = await service.getRandomItem(String(message.from?.id ?? ""));
  await sendMessage(message.chat.id, formatRandomItem(item), {
    linkButton: item
      ? {
          text: "🔊 ฟังการออกเสียง",
          url: formatGoogleTranslateUrl(item.mySentence || item.wordOrChunk),
        }
      : undefined,
  });
}

async function handleDeleteCommand(
  message: TelegramMessage,
  text: string,
): Promise<void> {
  const idPrefix = extractCommandBody(text, "delete");

  if (!idPrefix) {
    await sendMessage(message.chat.id, "Send `/delete short-id`.", {
      parseMode: "Markdown",
    });
    return;
  }

  const result = await service.deleteItemByPrefix(
    String(message.from?.id ?? ""),
    idPrefix,
  );

  if (result.status === "not_found") {
    await sendMessage(message.chat.id, formatDeleteNotFound(idPrefix), {
      parseMode: "Markdown",
    });
    return;
  }

  if (result.status === "ambiguous") {
    await sendMessage(
      message.chat.id,
      formatDeleteAmbiguous(idPrefix, result.matches ?? []),
      {
        parseMode: "Markdown",
      },
    );
    return;
  }

  await sendMessage(
    message.chat.id,
    formatDeleteResult(result.item?.wordOrChunk ?? idPrefix),
  );
}

async function routeCommand(
  message: TelegramMessage,
  text: string,
): Promise<void> {
  if (/^\/start(?:@\S+)?$/i.test(text)) {
    await sendMessage(message.chat.id, getWelcomeMessage());
    return;
  }

  if (/^\/help(?:@\S+)?$/i.test(text)) {
    await sendMessage(message.chat.id, getHelpMessage());
    return;
  }

  if (/^\/add(?:@\S+)?(?:\s|$)/i.test(text)) {
    await handleAddCommand(message, text);
    return;
  }

  if (/^\/list(?:@\S+)?$/i.test(text)) {
    await handleListCommand(message);
    return;
  }

  if (/^\/search(?:@\S+)?(?:\s|$)/i.test(text)) {
    await handleSearchCommand(message, text);
    return;
  }

  if (/^\/random(?:@\S+)?$/i.test(text)) {
    await handleRandomCommand(message);
    return;
  }

  if (/^\/delete(?:@\S+)?(?:\s|$)/i.test(text)) {
    await handleDeleteCommand(message, text);
    return;
  }

  await sendMessage(message.chat.id, getUnknownCommandMessage());
}

export async function handleTelegramUpdate(
  update: TelegramUpdate,
): Promise<void> {
  const message = update.message;

  if (!message?.text || !message.from) {
    console.info("Ignoring non-text or missing-from Telegram update", {
      updateId: update.update_id,
      hasMessage: Boolean(message),
      hasText: Boolean(message?.text),
      hasFrom: Boolean(message?.from),
    });
    return;
  }

  if (!isAllowedTelegramUser(message.from.id)) {
    console.warn("Rejected Telegram user", {
      updateId: update.update_id,
      telegramUserId: String(message.from.id),
      chatId: message.chat.id,
    });
    await sendMessage(message.chat.id, getUnauthorizedMessage());
    return;
  }

  const text = message.text.trim();

  console.info("Processing Telegram message", {
    updateId: update.update_id,
    telegramUserId: String(message.from.id),
    chatId: message.chat.id,
    textPreview: text.slice(0, 80),
  });

  if (await handleConversation(message, text)) {
    return;
  }

  if (text.startsWith("/")) {
    await routeCommand(message, text);
    return;
  }

  await sendMessage(message.chat.id, getUnknownCommandMessage());
}
