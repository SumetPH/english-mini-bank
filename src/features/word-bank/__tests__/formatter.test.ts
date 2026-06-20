import { describe, expect, it } from "vitest";

import {
  formatGoogleTranslateUrl,
  formatRandomItem,
} from "@/features/word-bank/formatter";
import type { WordBankItem } from "@/features/word-bank/types";

describe("formatRandomItem", () => {
  it("does not expose the Google Translate URL in the message", () => {
    const item: WordBankItem = {
      id: "12345678-abcd-efgh-ijkl-123456789012",
      telegramUserId: "42",
      wordOrChunk: "keep track of",
      meaningTh: "คอยติดตาม",
      mySentence: "I keep track of my tasks.",
      source: null,
      tags: [],
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    };

    expect(formatRandomItem(item)).not.toContain("https://");
  });

  it("URL-encodes special characters for the listen button", () => {
    expect(formatGoogleTranslateUrl("rock & roll")).toContain(
      "text=rock%20%26%20roll",
    );
  });
});
