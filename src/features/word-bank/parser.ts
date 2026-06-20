export interface AddCommandSingleLineResult {
  mode: "single-line";
  wordOrChunk: string;
  meaningTh: string;
  mySentence: string;
  warnings: string[];
}

export interface AddCommandConversationResult {
  mode: "conversation";
  wordOrChunk: string;
}

export interface AddCommandInvalidResult {
  mode: "invalid";
  error: string;
}

export type ParseAddCommandResult =
  | AddCommandSingleLineResult
  | AddCommandConversationResult
  | AddCommandInvalidResult;

function normalizeCommandBody(text: string): string {
  return text.replace(/^\/add(?:@\S+)?\s*/i, "").trim();
}

function splitSingleLine(body: string): [string, string, string] | null {
  const firstSeparator = body.indexOf("|");

  if (firstSeparator === -1) {
    return null;
  }

  const secondSeparator = body.indexOf("|", firstSeparator + 1);

  if (secondSeparator === -1) {
    return null;
  }

  return [
    body.slice(0, firstSeparator),
    body.slice(firstSeparator + 1, secondSeparator),
    body.slice(secondSeparator + 1),
  ];
}

export function parseAddCommand(text: string): ParseAddCommandResult {
  const body = normalizeCommandBody(text);

  if (!body) {
    return {
      mode: "invalid",
      error: "Send `/add word | meaning | sentence` or `/add word` to start step by step.",
    };
  }

  const singleLineParts = splitSingleLine(body);

  if (!singleLineParts) {
    return {
      mode: "conversation",
      wordOrChunk: body,
    };
  }

  const [rawWordOrChunk, rawMeaningTh, rawSentence] = singleLineParts;
  const wordOrChunk = rawWordOrChunk.trim();
  const meaningTh = rawMeaningTh.trim();
  const mySentence = rawSentence.trim();

  if (!wordOrChunk) {
    return {
      mode: "invalid",
      error: "Word or chunk cannot be empty.",
    };
  }

  const warnings: string[] = [];

  if (!meaningTh) {
    warnings.push("Tip: adding Thai meaning will help later.");
  }

  if (!mySentence) {
    warnings.push("Tip: adding your own sentence will make it stick better.");
  }

  return {
    mode: "single-line",
    wordOrChunk,
    meaningTh,
    mySentence,
    warnings,
  };
}
