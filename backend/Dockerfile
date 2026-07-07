# Stage 1: Install dependencies and build
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci

# Stage 2: Create runtime runner image
FROM node:20-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY . .

EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "server.js"]
