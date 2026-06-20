import type { WordBankItem } from "@/features/word-bank/types";

function formatShortId(id: string): string {
  return id.slice(0, 8);
}

function formatMeaning(item: WordBankItem): string {
  return item.meaningTh?.trim() || "-";
}

function formatSentence(item: WordBankItem): string {
  return item.mySentence?.trim() || "-";
}

export function formatSavedItemMessage(item: WordBankItem, warnings: string[] = []): string {
  const lines = [
    "Saved ✅",
    "",
    item.wordOrChunk,
    `Meaning: ${formatMeaning(item)}`,
    `Sentence: ${formatSentence(item)}`,
  ];

  if (warnings.length > 0) {
    lines.push("", warnings.join("\n"));
  }

  return lines.join("\n");
}

export function formatItemsList(items: WordBankItem[], emptyMessage: string): string {
  if (items.length === 0) {
    return emptyMessage;
  }

  return items
    .map((item, index) =>
      [
        `#${index + 1} ${item.wordOrChunk} [${formatShortId(item.id)}]`,
        `Meaning: ${formatMeaning(item)}`,
        `Sentence: ${formatSentence(item)}`,
      ].join("\n"),
    )
    .join("\n\n");
}

export function formatRandomItem(item: WordBankItem | null): string {
  if (!item) {
    return "No saved items yet.";
  }

  return [
    "Try this one 🎯",
    `${item.wordOrChunk} [${formatShortId(item.id)}]`,
    `Meaning: ${formatMeaning(item)}`,
    `Sentence: ${formatSentence(item)}`,
  ].join("\n");
}

export function formatDeleteResult(wordOrChunk: string): string {
  return `Deleted 🗑️\n${wordOrChunk}`;
}

export function formatDeleteNotFound(idPrefix: string): string {
  return `I couldn't find an item with id \`${idPrefix}\`.`;
}

export function formatDeleteAmbiguous(idPrefix: string, matches: string[]): string {
  return `More than one item matches \`${idPrefix}\`: ${matches.join(", ")}`;
}
