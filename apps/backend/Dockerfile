FROM node:lts-alpine AS builder

WORKDIR /usr/src/app

# Copy workspace files and backend package.json
COPY package.json yarn.lock ./
COPY apps/backend/package.json ./apps/backend/

# Install dependencies
RUN corepack enable && yarn install --frozen-lockfile

# Copy backend source files
COPY apps/backend/tsconfig*.json apps/backend/nest-cli.json ./apps/backend/
COPY apps/backend/src ./apps/backend/src

# Build backend
WORKDIR /usr/src/app/apps/backend
RUN yarn build


FROM node:lts-alpine AS runner

WORKDIR /usr/src/app

RUN apk add --no-cache curl

# Copy workspace files and backend package.json
COPY package.json yarn.lock ./
COPY apps/backend/package.json ./apps/backend/

# Install production dependencies only
RUN corepack enable && yarn install --frozen-lockfile

# Copy built dist
COPY --from=builder /usr/src/app/apps/backend/dist ./apps/backend/dist

# Copy source files needed for seeding scripts (ts-node requires source files)
COPY apps/backend/tsconfig*.json apps/backend/nest-cli.json ./apps/backend/
COPY apps/backend/src ./apps/backend/src

WORKDIR /usr/src/app/apps/backend

EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD curl -f http://localhost:4000/health || exit 1

CMD ["node", "dist/main.js"]
