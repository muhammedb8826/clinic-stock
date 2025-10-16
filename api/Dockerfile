# api/Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# If TypeScript:
# RUN npm run build
# If you generate Prisma client at build time:
# (Ensure prisma/schema.prisma exists)
RUN npx prisma generate || true

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./
EXPOSE 4000
# If you have a compiled build (e.g., NestJS/TS):
# CMD ["node", "dist/main.js"]
# If plain JS/TS start via script:
CMD ["npm", "run", "start"]
