# Multi-stage Dockerfile cho Backend Core

# Stage 1: Build & Dependencies
FROM node:18-alpine AS builder

WORKDIR /app

# Cài đặt python/make để build các native modules (nếu có, ví dụ bcrypt)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY prisma ./prisma/

# Cài đặt tất cả dependencies (bao gồm dev để generate prisma)
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

COPY . .

# Stage 2: Production runtime
FROM node:18-alpine AS production

WORKDIR /app

# Chỉ copy những file cần thiết từ builder để tối ưu dung lượng
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/app.js ./

# Tạo thư mục cho logs, uploads
RUN mkdir -p logs uploads/digital-products

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Khởi chạy Prisma migration & sau đó chạy server
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
