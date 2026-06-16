import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
export class AccountsService {
    chart;
    sectionIdx = new Map();
    subsectionIdx = new Map();
    groupIdx = new Map();
    constructor() {
        this.chart = JSON.parse(readFileSync(resolve(__dirname, "./data/chart.json"), "utf-8"));
        this.buildIndex();
    }
    buildIndex() {
        for (const section of this.chart.sections) {
            this.sectionIdx.set(section.code, section);
            for (const sub of section.subsections) {
                this.subsectionIdx.set(sub.code, { section, subsection: sub });
                for (const group of sub.groups) {
                    this.groupIdx.set(group.code, { section, subsection: sub, group });
                }
            }
        }
    }
    getMeta() {
        return this.chart.meta;
    }
    listSections() {
        return this.chart.sections.map((s) => ({
            code: s.code,
            name: s.name,
            description: s.description,
            subsection_count: s.subsections.length,
        }));
    }
    getSection(code) {
        const section = this.sectionIdx.get(code);
        if (!section)
            return null;
        return {
            code: section.code,
            name: section.name,
            description: section.description,
            subsections: section.subsections.map((sub) => ({
                code: sub.code,
                name: sub.name,
                group_count: sub.groups.length,
            })),
        };
    }
    getSubsection(code) {
        const entry = this.subsectionIdx.get(code);
        if (!entry)
            return null;
        const { section, subsection } = entry;
        return {
            breadcrumb: `Section ${section.code}: ${section.name}`,
            ...subsection,
        };
    }
    lookupCode(code) {
        const groupEntry = this.groupIdx.get(code);
        if (groupEntry) {
            const { section, subsection, group } = groupEntry;
            return {
                level: "group",
                breadcrumb: `Section ${section.code}: ${section.name} → ${subsection.code}: ${subsection.name}`,
                data: group,
            };
        }
        const subEntry = this.subsectionIdx.get(code);
        if (subEntry) {
            const { section, subsection } = subEntry;
            return {
                level: "subsection",
                breadcrumb: `Section ${section.code}: ${section.name}`,
                data: subsection,
            };
        }
        const sectionResult = this.getSection(code);
        if (sectionResult) {
            return { level: "section", breadcrumb: "", data: sectionResult };
        }
        return null;
    }
    search(query, limit) {
        const q = query.toLowerCase();
        const results = [];
        for (const section of this.chart.sections) {
            if (results.length >= limit * 3)
                break; // collect generously, then slice
            if (section.name.toLowerCase().includes(q) || section.description.toLowerCase().includes(q)) {
                results.push({ level: "section", code: section.code, name: section.name, description: section.description, breadcrumb: "" });
            }
            for (const sub of section.subsections) {
                if (sub.name.toLowerCase().includes(q) || sub.description.toLowerCase().includes(q)) {
                    results.push({ level: "subsection", code: sub.code, name: sub.name, description: sub.description, breadcrumb: `Section ${section.code}: ${section.name}` });
                }
                for (const group of sub.groups) {
                    if (group.name.toLowerCase().includes(q) || group.description.toLowerCase().includes(q)) {
                        results.push({ level: "group", code: group.code, name: group.name, description: group.description, breadcrumb: `Section ${section.code} → ${sub.code}: ${sub.name}` });
                    }
                }
            }
        }
        return { total_found: results.length, showing: Math.min(results.length, limit), results: results.slice(0, limit) };
    }
    getFullChart() {
        return this.chart;
    }
}
//# sourceMappingURL=AccountsService.js.map