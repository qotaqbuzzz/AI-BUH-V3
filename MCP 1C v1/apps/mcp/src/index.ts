import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { createServer } from "./server.js";
import { setOrgContext } from "./tools/utils.js";

const config = loadConfig();
const { server, orgCtx } = await createServer(config);
setOrgContext(orgCtx);
const transport = new StdioServerTransport();
await server.connect(transport);
