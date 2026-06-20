import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { parseEnv } from "node:util";

export const telegramCommands = [
  { command: "start", description: "เริ่มใช้งาน" },
  { command: "help", description: "ดูวิธีใช้" },
  { command: "add", description: "เพิ่มคำศัพท์หรือวลี" },
  { command: "list", description: "ดูรายการล่าสุด" },
  { command: "search", description: "ค้นหาคำศัพท์" },
  { command: "random", description: "สุ่มคำศัพท์" },
  { command: "delete", description: "ลบรายการ" },
];

function readEnvFile(filePath) {
  return existsSync(filePath) ? parseEnv(readFileSync(filePath, "utf8")) : {};
}

function getTelegramBotToken() {
  const fileEnv = {
    ...readEnvFile(".env"),
    ...readEnvFile(".env.local"),
  };
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim() || fileEnv.TELEGRAM_BOT_TOKEN?.trim();

  if (!token) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN in environment, .env.local, or .env");
  }

  return token;
}

export async function registerTelegramCommands(fetchImpl = fetch) {
  const token = getTelegramBotToken();
  const response = await fetchImpl(`https://api.telegram.org/bot${token}/setMyCommands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commands: telegramCommands }),
  });
  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(`Telegram setMyCommands failed: ${result.description ?? response.status}`);
  }
}

async function main() {
  if (process.argv.includes("--dry-run")) {
    console.log(JSON.stringify({ commands: telegramCommands }, null, 2));
    return;
  }

  await registerTelegramCommands();
  console.log(`Registered ${telegramCommands.length} Telegram commands.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
