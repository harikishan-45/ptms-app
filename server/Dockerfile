# ─────────────────────────────────────────────────────────────────
# PTMS — Server Dockerfile
# Stack : Node 20 + Express + Mongoose
# ─────────────────────────────────────────────────────────────────

# ── Stage 1 : Install dependencies ───────────────────────────────
FROM node:20-alpine AS deps

# Install OS-level tools needed by some npm packages (bcryptjs, etc.)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy manifests first — Docker caches this layer until package.json changes
COPY package.json package-lock.json* ./

# Install ONLY production deps — no nodemon, no dev bloat
RUN npm ci --omit=dev


# ── Stage 2 : Final lean image ───────────────────────────────────
FROM node:20-alpine AS runner

# Security best-practice: never run as root inside a container
RUN addgroup -S ptms && adduser -S ptms -G ptms

WORKDIR /app

# Pull in the clean node_modules from stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Give ownership to our non-root user
RUN chown -R ptms:ptms /app
USER ptms

# Document the port (actual binding happens in docker-compose / k8s)
EXPOSE 5000

# Health-check — Kubernetes & ECS use this to know the pod is alive
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "src/server.js"]