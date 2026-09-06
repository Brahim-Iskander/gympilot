# ── Pre-built Frontend: just serve with Nginx ───────────────────
# Build locally with: VITE_API_URL=/api npm run build
# Then deploy the dist/ folder directly (saves RAM on low-memory VPS)
FROM nginx:alpine

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy pre-built dist folder
COPY dist/ /usr/share/nginx/html/

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
