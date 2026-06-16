/**
 * bridge.mjs — Node ↔ Python rendering sidecar.
 *
 * Spawns render_cli.py for each render request, pipes JSON in/out.
 * Perf note: ~0.5–1 s cold-import cost per call due to matplotlib startup.
 * A persistent worker loop is a noted follow-up optimisation.
 *
 * Env:
 *   PYTHON_BIN  — path to python executable (default: "python")
 */
import { spawn }   from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath }    from "url";

const __dirname     = dirname(fileURLToPath(import.meta.url));
const RENDER_SCRIPT = resolve(__dirname, "render_cli.py");
const PYTHON_BIN    = process.env.PYTHON_BIN ?? "python";

/**
 * Run render_cli.py in the given mode, feeding it a JSON payload via stdin.
 * Returns the parsed JSON result.
 * @param {"segments"|"xlsx"|"pdf"} mode
 * @param {object} payload
 * @returns {Promise<object>}
 */
function runRender(mode, payload) {
  return new Promise((res, rej) => {
    const proc = spawn(PYTHON_BIN, [RENDER_SCRIPT, mode], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    const input = JSON.stringify(payload);
    proc.stdin.write(input, "utf8");
    proc.stdin.end();

    const outChunks = [];
    const errChunks = [];

    proc.stdout.on("data", (d) => outChunks.push(d));
    proc.stderr.on("data", (d) => errChunks.push(d));

    proc.on("error", (e) => rej(e));

    proc.on("close", (code) => {
      if (code !== 0) {
        const stderr = Buffer.concat(errChunks).toString("utf8").slice(0, 600);
        rej(new Error(`render_cli exited ${code}: ${stderr}`));
        return;
      }
      try {
        const out = Buffer.concat(outChunks).toString("utf8");
        const parsed = JSON.parse(out);
        if (parsed.error) {
          rej(new Error(`render_cli error: ${parsed.error}`));
        } else {
          res(parsed);
        }
      } catch (e) {
        rej(new Error(`render_cli output parse error: ${e.message}`));
      }
    });
  });
}

/**
 * Split an answer into ordered text/png segments.
 * @param {string} answer
 * @returns {Promise<Array<{type:"text",md:string}|{type:"png",b64:string}>>}
 */
export async function renderSegments(answer) {
  const result = await runRender("segments", { answer });
  return result.segments ?? [];
}

/**
 * Render all wide tables in the answer as a single xlsx workbook.
 * @param {string} answer
 * @returns {Promise<Buffer|null>}  null if no tables
 */
export async function renderXlsx(answer) {
  const result = await runRender("xlsx", { answer });
  if (result.empty || !result.b64) return null;
  return Buffer.from(result.b64, "base64");
}

/**
 * Render the full answer (prose + tables as images) as a PDF.
 * @param {string} answer
 * @returns {Promise<Buffer>}
 */
export async function renderPdf(answer) {
  const result = await runRender("pdf", { answer });
  return Buffer.from(result.b64, "base64");
}
