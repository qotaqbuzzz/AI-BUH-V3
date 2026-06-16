import type { OneCClient } from "@aibos/onec-client";

interface MetadataEntity {
  name: string;
  type: string;
}

interface MetadataCache {
  entities: MetadataEntity[];
  fetchedAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

const PREFIXES = [
  "Catalog_",
  "Document_",
  "AccumulationRegister_",
  "InformationRegister_",
  "AccountingRegister_",
  "ChartOfAccounts_",
  "ChartOfCharacteristicTypes_",
  "ChartOfCalculationTypes_",
  "DocumentJournal_",
  "BusinessProcess_",
  "Task_",
  "Constant_",
] as const;

type EntityTypeFilter = "Catalog" | "Document" | "Register" | "all";

export class MetadataService {
  private cache: MetadataCache | null = null;

  constructor(private readonly client: OneCClient) {}

  private async loadEntities(): Promise<MetadataEntity[]> {
    if (this.cache && Date.now() - this.cache.fetchedAt < CACHE_TTL_MS) {
      return this.cache.entities;
    }

    const xml = await this.client.getMetadata();

    const entityTypeRegex = /EntityType Name="([^"]+)"/g;
    const entities: MetadataEntity[] = [];
    let match: RegExpExecArray | null;

    while ((match = entityTypeRegex.exec(xml)) !== null) {
      const name = match[1];
      const prefix = PREFIXES.find(p => name.startsWith(p));
      if (prefix) {
        const isVariant = /_(?:RecordType|BalanceType|TurnoverType|SliceLastType|SliceFirstType|RowType|BalanceAndTurnoverType|ActualActionPeriodType|DrCrTurnoverType|RecordsWithExtDimensionsType)$/.test(name);
        if (!isVariant) {
          entities.push({ name, type: prefix.replace("_", "") });
        }
      }
    }

    this.cache = { entities, fetchedAt: Date.now() };
    return entities;
  }

  async getEntities(filter: EntityTypeFilter = "all"): Promise<MetadataEntity[]> {
    const all = await this.loadEntities();
    if (filter === "all") return all;
    if (filter === "Catalog") return all.filter(e => e.name.startsWith("Catalog_"));
    if (filter === "Document") return all.filter(e => e.name.startsWith("Document_"));
    if (filter === "Register") return all.filter(e =>
      e.name.startsWith("AccumulationRegister_") ||
      e.name.startsWith("InformationRegister_") ||
      e.name.startsWith("AccountingRegister_")
    );
    return all;
  }
}
