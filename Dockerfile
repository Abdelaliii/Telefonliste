# Multi-stage Dockerfile for Telefonverzeichnis Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifest
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Build Vite SPA and bundle Express server.ts -> dist/server.cjs
RUN npm run build

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built application output from builder stage
COPY --from=builder /app/dist ./dist

# Create persistent data volume directory
RUN mkdir -p /app/data

# Expose application port
EXPOSE 3000

# Define volume for contacts.json persistence
VOLUME ["/app/data"]

# Launch production server
CMD ["node", "dist/server.cjs"]
