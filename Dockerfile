# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Cài deps trước (layer cache theo lockfile)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source + build
COPY . .

# VITE_* được inline vào bundle LÚC BUILD (public client config — TUYỆT ĐỐI KHÔNG đặt secret).
# Truyền qua --build-arg (hoặc CI secrets). Thiếu → bundle baked rỗng (app sẽ fail-fast lúc runtime).
ARG VITE_SHOPIFY_API_KEY
ARG VITE_API_BASE_URL
ENV VITE_SHOPIFY_API_KEY=${VITE_SHOPIFY_API_KEY}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Chạy lint+typecheck+test+build? Không — CI lo việc đó. Image chỉ cần build production.
RUN npm run build

# ---- Runtime stage (nginx phục vụ static) ----
FROM nginx:1.27-alpine AS runtime

# Cấu hình nginx: SPA fallback + CSP frame-ancestors cho Shopify Admin iframe.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 7000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:7000/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
