# English Mini Bank Bot

English Mini Bank Bot is a small Telegram bot for saving English words, phrases, and chunks that you recently learned. V1 is server-side only and focuses on quick note-taking inside Telegram.

## Project Purpose

- Save a word or chunk
- Save Thai meaning
- Save your own English sentence
- Search saved items
- List recent items
- Get a random saved item
- Delete an item by short id

## Tech Stack

- Next.js App Router
- TypeScript
- PostgreSQL
- `pg` package with raw SQL
- Telegram Bot API via webhook

## Required Environment Variables

Create a `.env.local` file:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/english_mini_bank
TELEGRAM_BOT_TOKEN=
TELEGRAM_SECRET_TOKEN=
ALLOWED_TELEGRAM_USER_ID=
```

## Database Setup

Run the migration in [`migrations/001_create_word_bank.sql`](/Users/sumetph/Development/llm/english-mini-bank/migrations/001_create_word_bank.sql):

```bash
psql "$DATABASE_URL" -f migrations/001_create_word_bank.sql
```

This creates the `word_bank` table and indexes for:

- `telegram_user_id`
- `created_at`
- `lower(word_or_chunk)`

## Run Locally

1. Install dependencies:

```bash
pnpm install
```

2. Start the dev server:

```bash
pnpm dev
```

3. The webhook endpoint will be available at:

```text
http://localhost:3000/api/telegram/webhook
```

## Telegram Webhook Setup

Use this example after deploying your app:

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/api/telegram/webhook",
    "secret_token": "<TELEGRAM_SECRET_TOKEN>"
  }'
```

Telegram should send updates to your deployed webhook URL with the matching secret token header.

Register the bot's slash-command suggestions from the commands supported by this project:

```bash
pnpm telegram:setup
```

To inspect the command payload without calling Telegram:

```bash
pnpm telegram:setup -- --dry-run
```

## Example Commands

```text
/start
/help
/add keep track of | คอยติดตาม / คอยเช็ก | I keep track of my stocks every night.
/add keep track of
/list
/search track
/random
/delete 1234abcd
```

## How to Test

- `pnpm test` runs unit tests for parser and service logic.
- `pnpm lint` checks code quality.
- `pnpm build` verifies the Next.js app compiles.

## Notes About V1 Limitations

- No frontend dashboard
- No auth UI
- No AI generation
- No spaced repetition
- Conversation state for step-by-step `/add` is stored in memory only
- Only one Telegram user is allowed, controlled by `ALLOWED_TELEGRAM_USER_ID`
