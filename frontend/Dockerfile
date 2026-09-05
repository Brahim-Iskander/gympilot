# ── Stage 1: Build Frontend (Vite) ──────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests first for optimal Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --prefer-offline || npm install

# Copy source code
COPY . .

# Pass the relative API endpoint so requests go through Nginx reverse proxy
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# Build production bundle into /app/dist
RUN npm run build

# ── Stage 2: Serve with Nginx ───────────────────────────────────
FROM nginx:alpine

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
