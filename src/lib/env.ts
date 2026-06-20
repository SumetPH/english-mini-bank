function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    throw new Error(`Environment variable is empty after trimming: ${name}`);
  }

  return trimmedValue;
}

export function getDatabaseUrl(): string {
  return getRequiredEnv("DATABASE_URL");
}

export function getTelegramBotToken(): string {
  return getRequiredEnv("TELEGRAM_BOT_TOKEN");
}

export function getTelegramSecretToken(): string {
  return getRequiredEnv("TELEGRAM_SECRET_TOKEN");
}

export function getAllowedTelegramUserId(): string {
  return getRequiredEnv("ALLOWED_TELEGRAM_USER_ID");
}
