import { describe, expect, it } from "vitest";

import { parseAddCommand } from "@/features/word-bank/parser";

describe("parseAddCommand", () => {
  it("parses one-line add command and trims each field", () => {
    const result = parseAddCommand(
      "/add   keep track of | คอยติดตาม / คอยเช็ก  |  I keep track of my spending. ",
    );

    expect(result).toEqual({
      mode: "single-line",
      wordOrChunk: "keep track of",
      meaningTh: "คอยติดตาม / คอยเช็ก",
      mySentence: "I keep track of my spending.",
      warnings: [],
    });
  });

  it("starts conversation mode when separators are missing", () => {
    const result = parseAddCommand("/add keep track of");

    expect(result).toEqual({
      mode: "conversation",
      wordOrChunk: "keep track of",
    });
  });

  it("returns warnings when meaning or sentence is empty", () => {
    const result = parseAddCommand("/add catch up |  | ");

    expect(result).toEqual({
      mode: "single-line",
      wordOrChunk: "catch up",
      meaningTh: "",
      mySentence: "",
      warnings: [
        "Tip: adding Thai meaning will help later.",
        "Tip: adding your own sentence will make it stick better.",
      ],
    });
  });

  it("rejects missing content after the add command", () => {
    const result = parseAddCommand("/add");

    expect(result).toEqual({
      mode: "invalid",
      error: "Send `/add word | meaning | sentence` or `/add word` to start step by step.",
    });
  });
});
