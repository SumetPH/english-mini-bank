import { getPool } from "@/lib/db";
import type {
  CreateWordBankItemInput,
  DeleteItemResult,
  WordBankItem,
  WordBankRepository,
} from "@/features/word-bank/types";

interface WordBankRow {
  id: string;
  telegram_user_id: string;
  word_or_chunk: string;
  meaning_th: string | null;
  my_sentence: string | null;
  source: string | null;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

function mapRow(row: WordBankRow): WordBankItem {
  return {
    id: row.id,
    telegramUserId: row.telegram_user_id,
    wordOrChunk: row.word_or_chunk,
    meaningTh: row.meaning_th,
    mySentence: row.my_sentence,
    source: row.source,
    tags: row.tags,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class PostgresWordBankRepository implements WordBankRepository {
  async create(input: CreateWordBankItemInput): Promise<WordBankItem> {
    const result = await getPool().query<WordBankRow>(
      `
        insert into word_bank (
          telegram_user_id,
          word_or_chunk,
          meaning_th,
          my_sentence,
          source,
          tags
        )
        values ($1, $2, $3, $4, $5, $6)
        returning *
      `,
      [
        input.telegramUserId,
        input.wordOrChunk,
        input.meaningTh ?? null,
        input.mySentence ?? null,
        input.source ?? null,
        input.tags ?? [],
      ],
    );

    return mapRow(result.rows[0]);
  }

  async listRecent(telegramUserId: string, limit: number): Promise<WordBankItem[]> {
    const result = await getPool().query<WordBankRow>(
      `
        select *
        from word_bank
        where telegram_user_id = $1
        order by created_at desc
        limit $2
      `,
      [telegramUserId, limit],
    );

    return result.rows.map(mapRow);
  }

  async search(
    telegramUserId: string,
    keyword: string,
    limit: number,
  ): Promise<WordBankItem[]> {
    const likeKeyword = `%${keyword}%`;
    const result = await getPool().query<WordBankRow>(
      `
        select *
        from word_bank
        where telegram_user_id = $1
          and (
            word_or_chunk ilike $2
            or coalesce(meaning_th, '') ilike $2
            or coalesce(my_sentence, '') ilike $2
          )
        order by created_at desc
        limit $3
      `,
      [telegramUserId, likeKeyword, limit],
    );

    return result.rows.map(mapRow);
  }

  async getRandom(telegramUserId: string): Promise<WordBankItem | null> {
    const result = await getPool().query<WordBankRow>(
      `
        select *
        from word_bank
        where telegram_user_id = $1
        order by random()
        limit 1
      `,
      [telegramUserId],
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async deleteByIdPrefix(
    telegramUserId: string,
    idPrefix: string,
  ): Promise<DeleteItemResult> {
    const matches = await getPool().query<WordBankRow>(
      `
        select *
        from word_bank
        where telegram_user_id = $1
          and id::text ilike $2
        order by created_at desc
        limit 2
      `,
      [telegramUserId, `${idPrefix}%`],
    );

    if (matches.rows.length === 0) {
      return { status: "not_found" };
    }

    if (matches.rows.length > 1) {
      return {
        status: "ambiguous",
        matches: matches.rows.map((row) => row.id.slice(0, 8)),
      };
    }

    const deleted = await getPool().query<WordBankRow>(
      `
        delete from word_bank
        where telegram_user_id = $1
          and id = $2
        returning *
      `,
      [telegramUserId, matches.rows[0].id],
    );

    return {
      status: "deleted",
      item: mapRow(deleted.rows[0]),
    };
  }
}
