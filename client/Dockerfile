# ─────────────────────────────────────────────────────────────────
# PTMS — Client Dockerfile
# Stack : Vite + React 19 → Nginx Alpine
# ─────────────────────────────────────────────────────────────────

# ── Stage 1 : Install dependencies ───────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json* ./

# Install ALL deps (vite, tailwind, eslint… all needed at build time)
RUN npm ci


# ── Stage 2 : Build the Vite app ─────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Reuse node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy full source
COPY . .

# VITE_API_URL is injected at build time via GitHub Actions secret
# It becomes window.__env or import.meta.env.VITE_API_URL in the bundle
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Produces /app/dist  — this is the ONLY folder we need going forward
RUN npm run build


# ── Stage 3 : Serve with Nginx (25 MB total image) ───────────────
FROM nginx:1.27-alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy our compiled React app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom nginx config (handles React Router + API proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Non-root nginx (good practice for Kubernetes PodSecurityPolicy)
RUN chown -R nginx:nginx /usr/share/nginx/html \
 && chown -R nginx:nginx /var/cache/nginx \
 && touch /var/run/nginx.pid \
 && chown -R nginx:nginx /var/run/nginx.pid

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
