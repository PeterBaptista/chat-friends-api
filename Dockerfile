# Base image
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the entire project
COPY . .

# Build TypeScript project
RUN npm run build

# ---- Production image ----
FROM node:20-alpine AS prod

WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built files from build stage
COPY --from=base /app/dist ./dist

# If you have any runtime config (like .env), copy it here
# COPY .env .env

EXPOSE 3000

CMD ["node", "dist/index.js"]
