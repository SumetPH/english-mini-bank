import { describe, expect, it } from "vitest";

import { telegramCommands } from "./setup-telegram-commands.mjs";

describe("telegram command setup", () => {
  it("registers every command supported by the bot", () => {
    expect(telegramCommands.map(({ command }) => command)).toEqual([
      "start",
      "help",
      "add",
      "list",
      "search",
      "random",
      "delete",
    ]);
  });

  it("uses Telegram-compatible command names and non-empty descriptions", () => {
    for (const { command, description } of telegramCommands) {
      expect(command).toMatch(/^[a-z0-9_]{1,32}$/);
      expect(description.trim()).not.toBe("");
      expect(description.length).toBeLessThanOrEqual(256);
    }
  });
});
