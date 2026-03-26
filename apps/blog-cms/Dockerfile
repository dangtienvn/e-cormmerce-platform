# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate

COPY . .

# Pass environment variables for build time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Stage 2: Run
FROM node:18-alpine AS production

WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Push schema to db (since migrations might not exist) and start
CMD ["sh", "-c", "npx prisma db push --skip-generate --accept-data-loss && npm start"]
