export function getWelcomeMessage(): string {
  return [
    "Hi! I'm your English Mini Bank Bot 📚",
    "",
    "Commands:",
    "/add word | meaning | sentence",
    "/add word",
    "/list",
    "/search keyword",
    "/random",
    "/delete id",
    "/help",
  ].join("\n");
}

export function getHelpMessage(): string {
  return [
    "Quick commands ✨",
    "/add keep track of | คอยติดตาม | I keep track of my spending.",
    "/add keep track of",
    "/list",
    "/search track",
    "/random",
    "/delete 1234abcd",
  ].join("\n");
}

export function getUnauthorizedMessage(): string {
  return "Sorry, this bot is private for one user only 🙏";
}

export function getUnknownCommandMessage(): string {
  return "I didn't catch that. Try /help for examples.";
}
