import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PayrollService } from "@aibos/services";
import { wrapError, ok, resolveOrg } from "./utils.js";

export function registerPayrollTools(server: McpServer, svc: PayrollService): void {
  server.tool(
    "onec_get_payroll_summary",
    "Returns aggregate payroll accruals for a period from Document_НачислениеЗарплатыРаботникамОрганизаций: total accrual, document count, and GL balance on account 3350. Use to answer 'what was our payroll this month?' Drill: call onec_drill_payroll_by_employee for per-person detail or onec_drill_payroll_by_department for org-chart view.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getPayrollSummary(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_drill_payroll_by_employee",
    "Breaks down payroll accruals by employee for the period, showing each employee's total accrual, deductions, and net pay. Drill from onec_get_payroll_summary. Returns employeeGuid that can be used to look up HR records. Drill: call onec_get_hr_transactions for an employee's hire/dismiss history.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.drillPayrollByEmployee(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined, rowCount: result.length });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_drill_payroll_by_department",
    "Aggregates payroll accruals by department (Подразделение) for the period. Use to compare labor costs across business units. Drill: for any department with high variance, call onec_drill_payroll_by_employee filtered to that department.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.drillPayrollByDepartment(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined, rowCount: result.length });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_hr_transactions",
    "Returns HR lifecycle documents (hires from Document_ПриемНаРаботуВОрганизацию, dismissals from Document_УвольнениеИзОрганизаций) for the period. Use to track headcount changes. Drill: for each HR event, call onec_get_headcount_analysis to see the resulting headcount as of any date.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getHrTransactions(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined, rowCount: result.length });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_benefit_accruals",
    "Returns benefit accruals for the period from GL account 3380 turnovers. Covers vacation reserves, sick pay, and other employee benefits. Cross-validates against the 3380 credit turnover. Drill: call onec_get_account_card('3380', ...) to see individual benefit posting entries.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getBenefitAccruals(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_analyze_payroll_variance",
    "Computes month-over-month payroll variance by comparing current period accruals against a prior period. Flags anomalous variance (>20% change) for investigation. Use for payroll audit and unusual-item detection. Drill: for anomalous months, call onec_drill_payroll_by_employee to identify which employees drove the change.",
    {
      currentFrom: z.string().describe("Current period start YYYY-MM-DD"),
      currentTo: z.string().describe("Current period end YYYY-MM-DD"),
      priorFrom: z.string().describe("Prior period start YYYY-MM-DD"),
      priorTo: z.string().describe("Prior period end YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ currentFrom, currentTo, priorFrom, priorTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.analyzePayrollVariance(currentFrom, currentTo, priorFrom, priorTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_headcount_analysis",
    "Returns active headcount as of a given date from InformationRegister_РаботникиОрганизаций (slice last), broken down by department. Excludes employees with status 'Уволен'. Use for staffing reports and FTE analysis. Drill: call onec_get_hr_transactions for the period to see what changed since last headcount.",
    {
      asOfDate: z.string().describe("Headcount date YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ asOfDate, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getHeadcountAnalysis(asOfDate, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_validate_salary_completeness",
    "Checks that every active employee (from onec_get_headcount_analysis) has a payroll accrual document for the period. Returns passed flag, headcount, employees with payroll, and a list of missing employees. Run before payroll submission to catch missed staff. Drill: call onec_drill_payroll_by_employee to confirm which GUIDs are missing.",
    {
      periodFrom: z.string().describe("Payroll period start YYYY-MM-DD"),
      periodTo: z.string().describe("Payroll period end YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.validateSalaryCompleteness(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );
}
