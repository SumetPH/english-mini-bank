import { describe, expect, it, vi } from "vitest";

import { WordBankService } from "@/features/word-bank/service";
import type {
  CreateWordBankItemInput,
  DeleteItemResult,
  WordBankItem,
  WordBankRepository,
} from "@/features/word-bank/types";

const sampleItem: WordBankItem = {
  id: "12345678-aaaa-bbbb-cccc-123456789000",
  telegramUserId: "42",
  wordOrChunk: "keep track of",
  meaningTh: "คอยติดตาม",
  mySentence: "I keep track of my budget.",
  source: null,
  tags: [],
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
};

function createRepositoryMock(): WordBankRepository {
  return {
    create: vi.fn(async (input: CreateWordBankItemInput) => ({
      ...sampleItem,
      ...input,
      meaningTh: input.meaningTh ?? null,
      mySentence: input.mySentence ?? null,
      source: input.source ?? null,
      tags: input.tags ?? [],
    })),
    listRecent: vi.fn(async () => [sampleItem]),
    search: vi.fn(async () => [sampleItem]),
    getRandom: vi.fn(async () => sampleItem),
    deleteByIdPrefix: vi.fn(
      async (): Promise<DeleteItemResult> => ({
        status: "deleted",
        item: sampleItem,
      }),
    ),
  };
}

describe("WordBankService", () => {
  it("normalizes optional text fields before saving", async () => {
    const repository = createRepositoryMock();
    const service = new WordBankService(repository);

    const item = await service.createItem({
      telegramUserId: "42",
      wordOrChunk: "  keep track of  ",
      meaningTh: " ",
      mySentence: "  I keep track of my budget.  ",
    });

    expect(repository.create).toHaveBeenCalledWith({
      telegramUserId: "42",
      wordOrChunk: "keep track of",
      meaningTh: null,
      mySentence: "I keep track of my budget.",
      source: null,
      tags: [],
    });
    expect(item.wordOrChunk).toBe("keep track of");
  });

  it("returns empty search results when the keyword is blank", async () => {
    const repository = createRepositoryMock();
    const service = new WordBankService(repository);

    const items = await service.searchItems("42", "   ");

    expect(items).toEqual([]);
    expect(repository.search).not.toHaveBeenCalled();
  });

  it("treats a blank delete prefix as not found without calling the repository", async () => {
    const repository = createRepositoryMock();
    const service = new WordBankService(repository);

    const result = await service.deleteItemByPrefix("42", " ");

    expect(result).toEqual({ status: "not_found" });
    expect(repository.deleteByIdPrefix).not.toHaveBeenCalled();
  });
});
