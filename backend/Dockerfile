# Multi-stage build para produção
FROM node:20-alpine AS base

# Instalar pnpm
RUN npm install -g pnpm

# Stage 1: Dependencies
FROM base AS deps
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Stage 2: Builder
FROM base AS builder
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Gerar cliente Prisma
RUN npx prisma generate

# Build da aplicação
RUN pnpm build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify

# Copiar dependências de produção
COPY --from=deps /app/node_modules ./node_modules

# Copiar código compilado
COPY --from=builder --chown=fastify:nodejs /app/dist ./dist
COPY --from=builder --chown=fastify:nodejs /app/prisma ./prisma
COPY --from=builder --chown=fastify:nodejs /app/package.json ./package.json

# Configurar usuário
USER fastify

# Expor porta
EXPOSE 4000

# Comando de produção
CMD ["node", "dist/index.js"]
