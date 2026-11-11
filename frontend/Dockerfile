# Stage 1: Build React 19 + Vite Application
FROM node:20-alpine AS builder

WORKDIR /app

# Argumen konfigurasi base URL API (default relative /api)
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Salin package.json & install dependencies
COPY package*.json ./
RUN npm ci || npm install

# Salin source code frontend dan build production bundle
COPY . .
RUN npm run build

# Stage 2: Sajikan via Nginx Alpine Web Server
FROM nginx:alpine

# Salin konfigurasi Nginx kustom (mendukung SPA dan reverse proxy ke backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin output dist hasil build dari Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
