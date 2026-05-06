# Multi-stage build for optimal image size and performance

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
COPY frontend/pnpm-workspace.yaml ./

# Install dependencies (using npm)
RUN npm install

# Copy frontend source
COPY frontend/src ./src
COPY frontend/public ./public 2>/dev/null || true
COPY frontend/vite.config.ts ./
COPY frontend/tsconfig.json ./
COPY frontend/postcss.config.mjs ./
COPY frontend/index.html ./

# Build frontend
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy only package files first for better layer caching
COPY backend/package*.json ./

# Install all dependencies (including dev)
RUN npm install

# Copy config files
COPY backend/tsconfig*.json ./

# Copy source code
COPY backend/src ./src
COPY backend/prisma ./prisma

# Generate Prisma client
RUN npm run db:generate

# Build TypeScript
RUN npm run build

# Stage 3: Runtime - Minimal production image
FROM node:20-alpine

WORKDIR /app

# Install only required system dependencies
# dumb-init: handle signals properly for Node.js
# openssl: required by Prisma for database connections
RUN apk add --no-cache \
    dumb-init \
    openssl

# Copy package files
COPY backend/package*.json ./

# Install production dependencies only
RUN npm install --omit=dev && npm cache clean --force

# Copy built backend application from builder stage
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=backend-builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy Prisma schema for runtime
COPY backend/prisma ./prisma

# Copy built frontend from frontend-builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose application port
EXPOSE 4000

# Health check - verify server is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Use dumb-init to properly handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]
