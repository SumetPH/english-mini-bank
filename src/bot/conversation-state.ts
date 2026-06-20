interface AddConversationState {
  step: "awaiting-meaning" | "awaiting-sentence";
  telegramUserId: string;
  chatId: number;
  wordOrChunk: string;
  meaningTh?: string;
}

const state = new Map<string, AddConversationState>();

// TODO: Move this to persistent storage if multi-instance deployment is needed.
export function getConversationState(telegramUserId: string): AddConversationState | undefined {
  return state.get(telegramUserId);
}

export function setConversationState(
  telegramUserId: string,
  value: AddConversationState,
): void {
  state.set(telegramUserId, value);
}

export function clearConversationState(telegramUserId: string): void {
  state.delete(telegramUserId);
}
