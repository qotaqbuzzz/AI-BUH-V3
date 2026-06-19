import type { OneCClient } from "@aibos/onec-client";
import type { RegisterService } from "./RegisterService.js";

export interface ProvisionEntry {
  provisionGuid: string;
  provisionType: string;
  description: string;
  amount: number;
  exposureAmount: number;
  coverage: number;
  accountCode: string;
  createdDate: string;
}

export class ProvisionService {
  constructor(
    private readonly client: OneCClient,
    private readonly register: RegisterService,
  ) {}

  async getProvisionRegister(asOfDate: string, organizationGuid?: string): Promise<{
    provisions: ProvisionEntry[];
    totalProvisions: number;
    glBalance3520: number;
    glBalance3530: number;
    glTotal: number;
    mismatch: boolean;
  }> {
    const [bal3520, bal3530] = await Promise.all([
      this.register.getAccountBalance("3520", organizationGuid, asOfDate),
      this.register.getAccountBalance("3530", organizationGuid, asOfDate),
    ]);
    const glBalance3520 = bal3520.creditBalance;
    const glBalance3530 = bal3530.creditBalance;
    const glTotal = glBalance3520 + glBalance3530;
    const customProvisions = await this.client.getCollection<{
      Ref_Key: string; Description: string; ВидРезерва?: string; Сумма?: number; Экспозиция?: number; Дата?: string;
    }>("Catalog_РезервыПредстоящихРасходов", {
      filter: "DeletionMark eq false",
      select: "Ref_Key,Description,ВидРезерва,Сумма,Экспозиция,Дата",
      top: 200,
    }).catch(() => [] as { Ref_Key: string; Description: string; ВидРезерва?: string; Сумма?: number; Экспозиция?: number; Дата?: string }[]);
    const provisions: ProvisionEntry[] = customProvisions.map(p => ({
      provisionGuid: p.Ref_Key, provisionType: p.ВидРезерва ?? "general", description: p.Description,
      amount: p.Сумма ?? 0, exposureAmount: p.Экспозиция ?? 0,
      coverage: p.Экспозиция && p.Экспозиция > 0 ? ((p.Сумма ?? 0) / p.Экспозиция) * 100 : 100,
      accountCode: "3520", createdDate: p.Дата?.slice(0, 10) ?? "",
    }));
    const totalProvisions = provisions.reduce((s, p) => s + p.amount, 0) || glTotal;
    return { provisions, totalProvisions, glBalance3520, glBalance3530, glTotal, mismatch: Math.abs(totalProvisions - glTotal) > 0.01 && provisions.length > 0 };
  }

  async validateProvisionAdequacy(asOfDate: string, organizationGuid?: string): Promise<{
    passed: boolean; underfunded: ProvisionEntry[]; totalShortfall: number; recommendations: string[];
  }> {
    const { provisions } = await this.getProvisionRegister(asOfDate, organizationGuid);
    const underfunded = provisions.filter(p => p.coverage < 100 && p.exposureAmount > 0);
    const totalShortfall = underfunded.reduce((s, p) => s + (p.exposureAmount - p.amount), 0);
    const recommendations: string[] = [];
    if (underfunded.length > 0) recommendations.push(`${underfunded.length} резервов не покрывают экспозицию на сумму ${totalShortfall.toFixed(2)} тг`);
    if (provisions.length === 0) recommendations.push("Резервы не зарегистрированы. Проверьте счета 3520/3530 или создайте Catalog_РезервыПредстоящихРасходов.");
    return { passed: underfunded.length === 0, underfunded, totalShortfall, recommendations };
  }
}
