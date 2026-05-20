FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm install tsx
COPY --from=builder /app/dist ./dist
COPY server ./server
COPY data ./data
COPY .env* ./
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "--import", "tsx", "server/index.ts"]
