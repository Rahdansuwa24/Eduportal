FROM node:20-alpine

WORKDIR /app

# Install curl untuk healthcheck dan tzdata untuk zona waktu WIB (Asia/Jakarta)
RUN apk add --no-cache curl tzdata
ENV TZ=Asia/Jakarta

# Salin manifest dependensi terlebih dahulu untuk optimasi caching layer Docker
COPY package*.json ./

# Install dependensi produksi
RUN npm ci --omit=dev || npm install --production

# Salin seluruh kode backend
COPY . .

# Pastikan folder uploads & public tersedia
RUN mkdir -p uploads public

# Berikan izin eksekusi pada script entrypoint
RUN chmod +x docker-entrypoint.sh

EXPOSE 5000

# Healthcheck endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
