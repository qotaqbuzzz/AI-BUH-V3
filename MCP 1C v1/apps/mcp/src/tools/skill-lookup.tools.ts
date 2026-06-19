import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { wrapError, ok } from "./utils.js";

export function registerSkillLookupTools(server: McpServer, skillsDir: string): void {
  // Build slug → filepath index at registration time
  const index = new Map<string, string>();
  if (existsSync(skillsDir)) {
    for (const f of readdirSync(skillsDir)) {
      if (!f.endsWith(".md")) continue;
      const slug = basename(f, ".md");
      index.set(slug, join(skillsDir, f));
    }
  }

  server.tool(
    "onec_skill_lookup",
    [
      "Fetch the full text of a domain skill document (accounting rules, costing flows, validation rulebook).",
      "Use when a tool description references a rule like 'kz-agro-validation-rules.md#A.1' — call this to read the actual rule text.",
      `Available slugs: ${[...index.keys()].join(", ") || "(none loaded)"}`,
    ].join(" "),
    {
      slug: z.string().min(2).describe(
        "Skill document slug, e.g. 'kz-agro-validation-rules', 'kz-agro-accounting', 'kz-agro-costing-flow'",
      ),
    },
    async ({ slug }) => {
      try {
        const path = index.get(slug);
        if (!path) {
          return ok({ error: `Unknown skill slug "${slug}"`, available: [...index.keys()] });
        }
        const content = readFileSync(path, "utf8");
        return ok({ slug, content });
      } catch (e) {
        return wrapError(e);
      }
    },
  );
}
