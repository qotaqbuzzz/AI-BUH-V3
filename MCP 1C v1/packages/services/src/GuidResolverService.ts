import { OneCClient } from "@aibos/onec-client";
import { EntitySchemaService } from "./EntitySchemaService.js";

export interface GuidResolution {
  guid: string;
  found: boolean;
  entityType: string;    // "Catalog" | "Document" | "ChartOfAccounts" | ...
  entityName: string;    // "Контрагенты"
  fullEntitySet: string; // "Catalog_Контрагенты"
  presentation: string;  // human-readable display string
  fields: Record<string, unknown>;
}

// Checked first — covers >90% of GUIDs seen in typical 1C documents.
const PRIORITY_SETS: string[] = [
  "Catalog_Контрагенты",
  "Catalog_Номенклатура",
  "Catalog_Организации",
  "Catalog_Склады",
  "Catalog_Валюты",
  "Catalog_СотрудникиОрганизаций",
  "Catalog_ФизическиеЛица",
  "Catalog_ПодразделенияОрганизаций",
  "Catalog_ДоговорыКонтрагентов",
  "Catalog_СтатьиЗатрат",
  "Catalog_НоменклатурныеГруппы",
  "Catalog_ОсновныеСредства",
  "Catalog_Банки",
  "Catalog_БанковскиеСчета",
  "Catalog_ВидыЦен",
  "Catalog_ЕдиницыИзмерения",
  "Catalog_СтатьиДвиженияДенежныхСредств",
  "Catalog_НалогиИВзносы",
  "Catalog_ВидыНоменклатуры",
  "Catalog_Проекты",
  "ChartOfAccounts_Типовой",
  "Document_РеализацияТоваровУслуг",
  "Document_ПоступлениеТоваровУслуг",
  "Document_НачислениеЗарплаты",
  "Document_ПриходныйКассовыйОрдер",
  "Document_РасходныйКассовыйОрдер",
  "Document_ПлатежноеПоручениеВходящее",
  "Document_ПлатежноеПоручениеИсходящее",
  "Document_РучнаяОперация",
  "Document_ВводНачальныхОстатков",
];

// Candidate display fields — first non-empty value wins
const DISPLAY_CANDIDATE_FIELDS = [
  "Наименование",
  "Description",
  "Number",
  "Номер",
  "НомерСчета",
  "Code",
  "Код",
] as const;

const SELECT_FIELDS = ["Ref_Key", ...DISPLAY_CANDIDATE_FIELDS, "Date", "Дата"].join(",");

export class GuidResolverService {
  constructor(
    private readonly client: OneCClient,
    private readonly schema: EntitySchemaService,
  ) {}

  async resolveGuid(guid: string, hint?: string): Promise<GuidResolution> {
    const checked = new Set<string>();

    // 1. Try caller-supplied hint first (fast path when type is known)
    if (hint) {
      checked.add(hint);
      const r = await this.trySet(guid, hint);
      if (r.found) return r;
    }

    // 2. Priority list — parallel batches of 8 to balance speed vs 1C load
    const priorityQueue = PRIORITY_SETS.filter(s => !checked.has(s));
    const fromPriority = await this.batchSearch(guid, priorityQueue, 8, checked);
    if (fromPriority) return fromPriority;

    // 3. Exhaustive fallback — all 889 indexed entities except already tried
    const allEntities = this.schema.listEntities();
    const remaining = allEntities.filter(s => !checked.has(s));
    const fromFull = await this.batchSearch(guid, remaining, 12, checked);

    return fromFull ?? {
      guid,
      found: false,
      entityType: "",
      entityName: "",
      fullEntitySet: "",
      presentation: "",
      fields: {},
    };
  }

  async resolveGuids(guids: string[]): Promise<GuidResolution[]> {
    return Promise.all(guids.map(g => this.resolveGuid(g)));
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private async batchSearch(
    guid: string,
    candidates: string[],
    batchSize: number,
    checked: Set<string>,
  ): Promise<GuidResolution | null> {
    for (let i = 0; i < candidates.length; i += batchSize) {
      const batch = candidates.slice(i, i + batchSize);
      batch.forEach(s => checked.add(s));
      const results = await Promise.all(batch.map(s => this.trySet(guid, s)));
      const found = results.find(r => r.found);
      if (found) return found;
    }
    return null;
  }

  private async trySet(guid: string, entitySet: string): Promise<GuidResolution> {
    const miss: GuidResolution = {
      guid, found: false,
      entityType: "", entityName: "", fullEntitySet: entitySet,
      presentation: "", fields: {},
    };
    try {
      const rows = await this.client.getCollection<Record<string, unknown>>(entitySet, {
        filter: `Ref_Key eq guid'${guid}'`,
        select: SELECT_FIELDS,
        top: 1,
      });
      if (!rows || rows.length === 0) return miss;

      const row = rows[0];
      const presentation = this.pickPresentation(row);
      const sepIdx = entitySet.indexOf("_");

      return {
        guid,
        found: true,
        entityType: sepIdx >= 0 ? entitySet.slice(0, sepIdx) : entitySet,
        entityName: sepIdx >= 0 ? entitySet.slice(sepIdx + 1) : entitySet,
        fullEntitySet: entitySet,
        presentation,
        fields: row,
      };
    } catch {
      return miss;
    }
  }

  private pickPresentation(row: Record<string, unknown>): string {
    for (const field of DISPLAY_CANDIDATE_FIELDS) {
      const v = row[field];
      if (v != null && String(v).trim() !== "") return String(v).trim();
    }
    return "";
  }
}
