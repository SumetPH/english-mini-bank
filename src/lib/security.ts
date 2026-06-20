import { getAllowedTelegramUserId, getTelegramSecretToken } from "@/lib/env";

export function isAllowedTelegramUser(userId: string | number): boolean {
  return String(userId) === getAllowedTelegramUserId();
}

export function isValidTelegramSecretToken(headerValue: string | null): boolean {
  if (!headerValue) {
    return false;
  }

  return headerValue === getTelegramSecretToken();
}
