import { Pool } from "pg";

import { getDatabaseUrl } from "@/lib/env";

declare global {
  // eslint-disable-next-line no-var
  var __wordBankPool: Pool | undefined;
}

export function getPool(): Pool {
  if (!globalThis.__wordBankPool) {
    globalThis.__wordBankPool = new Pool({
      connectionString: getDatabaseUrl(),
    });
  }

  return globalThis.__wordBankPool;
}
