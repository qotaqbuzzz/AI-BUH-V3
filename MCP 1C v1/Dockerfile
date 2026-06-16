# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /build

COPY package.json package-lock.json ./
# Install all deps including dev (tsx, typescript, etc.)
RUN npm ci --ignore-scripts

# esbuild may not be in package.json devDeps — ensure it is available
RUN ./node_modules/.bin/esbuild --version 2>/dev/null || npm install --no-save esbuild

COPY . .

# Bundle http-index.ts and all local workspace packages into a single ESM file.
# --packages=external is intentionally NOT set so the bundle is fully self-contained
# and the runtime image needs no node_modules.
RUN ./node_modules/.bin/esbuild apps/mcp/src/http-index.ts \
      --bundle \
      --platform=node \
      --format=esm \
      --outfile=dist/http-server.bundle.mjs \
      --tsconfig=tsconfig.json \
      --alias:@aibos/services=./packages/services/src/index.ts \
      --alias:@aibos/onec-client=./packages/onec-client/src/index.ts \
      --alias:@aibos/kz-accounts=./packages/kz-accounts/src/index.ts \
    && mkdir -p dist/data \
    && cp packages/kz-accounts/src/data/chart.json dist/data/chart.json

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

# Single self-contained bundle — no node_modules needed at runtime
COPY --from=builder /build/dist/http-server.bundle.mjs ./

# chart.json is read via __dirname + ./data/chart.json at runtime
COPY --from=builder /build/dist/data ./data

# Offline 1C entity schema (889 .md files, ~3.6 MB)
COPY Entities ./Entities

ENV NODE_ENV=production \
    PORT=3000 \
    # Point EntitySchemaService at the copied Entities folder.
    # Without this, server.ts falls back to resolve(__dirname, "../../../Entities")
    # which would resolve incorrectly relative to the bundle location.
    ENTITIES_DIR=/app/Entities

EXPOSE 3000

# Run as non-root
RUN addgroup -S mcp && adduser -S mcp -G mcp
USER mcp

CMD ["node", "http-server.bundle.mjs"]
