import type {
  CreateWordBankItemInput,
  DeleteItemResult,
  WordBankItem,
  WordBankRepository,
} from "@/features/word-bank/types";

const DEFAULT_LIMIT = 10;

function normalizeText(value: string | null | undefined): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export class WordBankService {
  constructor(private readonly repository: WordBankRepository) {}

  async createItem(input: CreateWordBankItemInput): Promise<WordBankItem> {
    return this.repository.create({
      ...input,
      wordOrChunk: input.wordOrChunk.trim(),
      meaningTh: normalizeText(input.meaningTh),
      mySentence: normalizeText(input.mySentence),
      source: normalizeText(input.source),
      tags: input.tags ?? [],
    });
  }

  async listRecentItems(telegramUserId: string): Promise<WordBankItem[]> {
    return this.repository.listRecent(telegramUserId, DEFAULT_LIMIT);
  }

  async searchItems(telegramUserId: string, keyword: string): Promise<WordBankItem[]> {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      return [];
    }

    return this.repository.search(telegramUserId, trimmedKeyword, DEFAULT_LIMIT);
  }

  async getRandomItem(telegramUserId: string): Promise<WordBankItem | null> {
    return this.repository.getRandom(telegramUserId);
  }

  async deleteItemByPrefix(
    telegramUserId: string,
    idPrefix: string,
  ): Promise<DeleteItemResult> {
    const trimmedPrefix = idPrefix.trim();

    if (!trimmedPrefix) {
      return { status: "not_found" };
    }

    return this.repository.deleteByIdPrefix(telegramUserId, trimmedPrefix);
  }
}
