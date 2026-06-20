export interface WordBankItem {
  id: string;
  telegramUserId: string;
  wordOrChunk: string;
  meaningTh: string | null;
  mySentence: string | null;
  source: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWordBankItemInput {
  telegramUserId: string;
  wordOrChunk: string;
  meaningTh?: string | null;
  mySentence?: string | null;
  source?: string | null;
  tags?: string[];
}

export interface DeleteItemResult {
  status: "deleted" | "not_found" | "ambiguous";
  item?: WordBankItem;
  matches?: string[];
}

export interface WordBankRepository {
  create(input: CreateWordBankItemInput): Promise<WordBankItem>;
  listRecent(telegramUserId: string, limit: number): Promise<WordBankItem[]>;
  search(telegramUserId: string, keyword: string, limit: number): Promise<WordBankItem[]>;
  getRandom(telegramUserId: string): Promise<WordBankItem | null>;
  deleteByIdPrefix(
    telegramUserId: string,
    idPrefix: string,
  ): Promise<DeleteItemResult>;
}
