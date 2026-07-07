# Stage 1: Build React application
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve application using Nginx
FROM nginx:alpine
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
# Copy custom Nginx configuration if needed, or use default. Nginx defaults to port 80.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
