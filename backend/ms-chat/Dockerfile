# ---------- STAGE 1: build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos manifests
COPY package.json yarn.lock ./

# Instalamos dependencias EXACTAS
RUN yarn install --frozen-lockfile

# Copiamos el código
COPY . .

# Compilamos NestJS
RUN yarn build


# ---------- STAGE 2: runtime ----------
FROM node:20-alpine

WORKDIR /app

# Copiamos solo lo necesario
COPY package.json yarn.lock ./

# Instalamos solo dependencias de producción
RUN yarn install --frozen-lockfile --production=true

# Copiamos el build
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
