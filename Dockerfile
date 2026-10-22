# =============================================================================
# Dockerfile — register-system (Fastify + TypeScript + PostgreSQL + Redis)
# Multi-stage, production-ready, non-root, optimized for size & security
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base image with pnpm
# -----------------------------------------------------------------------------
FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN corepack enable && corepack prepare pnpm@12.14.0 --activate

WORKDIR /app

# -----------------------------------------------------------------------------
# Stage 2: Install dependencies (cached layer)
# -----------------------------------------------------------------------------
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install all dependencies (including devDependencies for build)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# -----------------------------------------------------------------------------
# Stage 3: Build TypeScript
# -----------------------------------------------------------------------------
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY src ./src

RUN pnpm build \
    && pnpm prune --prod \
    && rm -rf src

# -----------------------------------------------------------------------------
# Stage 4: Production runtime
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runner

LABEL org.opencontainers.image.title="register-system" \
    org.opencontainers.image.description="REST API with session auth, RBAC and audit logging" \
    org.opencontainers.image.authors="Davi Gomes <davigomescarmo9@gmail.com>" \
    org.opencontainers.image.source="https://github.com/YOUR_USERNAME/register-system" \
    org.opencontainers.image.licenses="MIT"

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=5000

# Security: non-root user + wget for healthcheck
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs appuser \
    && apk add --no-cache wget

WORKDIR /app

# Copy only what is needed to run
COPY --from=builder --chown=appuser:nodejs /app/package.json ./
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist

USER appuser

EXPOSE 5000

# Healthcheck using the built-in /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:5000/health || exit 1

CMD ["node", "--env-file-if-exists=.env.production", "dist/main.js"]
