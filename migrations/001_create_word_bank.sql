create extension if not exists pgcrypto;

create table if not exists word_bank (
  id uuid primary key default gen_random_uuid(),
  telegram_user_id text not null,
  word_or_chunk text not null,
  meaning_th text,
  my_sentence text,
  source text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_word_bank_telegram_user_id
  on word_bank (telegram_user_id);

create index if not exists idx_word_bank_created_at
  on word_bank (created_at desc);

create index if not exists idx_word_bank_word_or_chunk_lower
  on word_bank (lower(word_or_chunk));
