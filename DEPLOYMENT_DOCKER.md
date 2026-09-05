# 🚀 GymPilot — Docker & Nginx Deployment Guide

This guide explains how to host your entire **GymPilot** application using **Docker Compose** and **Nginx** reverse proxy on any Linux VPS (Ubuntu, Debian, etc.) or local server.

---

## 🏗️ Architecture Overview

```
                  Internet / Users (Port 80 / 443)
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │     gympilot-nginx    │  (Nginx Gateway)
                     └───────────┬───────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
        location /                               location /api/
                 │                               │
                 ▼                               ▼
       ┌───────────────────┐           ┌───────────────────┐
       │ gympilot-frontend │           │  gympilot-backend │
       │  (Vite React SPA) │           │ (Spring Boot Java)│
       │     Port 80       │           │     Port 8080     │
       └───────────────────┘           └─────────┬─────────┘
                                                 │
                                                 ▼
                                        MongoDB (Atlas Cloud)
```

- **Zero CORS Issues**: Frontend and Backend share the same origin through Nginx.
- **Max Upload Size (50MB)**: Configured in Nginx for Cloudinary image uploads and AI photo analysis.
- **Gzip & Caching**: Automatic compression and immutable caching for static assets.
- **Free SSL Ready**: Pre-configured paths for Let's Encrypt / Certbot.

---

## 📋 Prerequisites on Your Server

Ensure your server has **Docker** and **Docker Compose** installed:

```bash
# Ubuntu / Debian install command (if not already installed)
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
```

---

## ⚡ Quick Start (3 Steps)

### 1. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.docker.example .env
```
*(Check and update your keys inside `.env` if needed, such as MongoDB connection, JWT secret, Cloudinary, AI keys, etc.)*

### 2. Build and Start All Containers
```bash
docker compose up -d --build
```

### 3. Check Container Status
```bash
docker compose ps
```
You should see 3 running containers:
- `gympilot-nginx` (Listening on 0.0.0.0:80, 0.0.0.0:443)
- `gympilot-backend` (Port 8080 internally)
- `gympilot-frontend` (Port 80 internally)

Open your browser at `http://your-server-ip` or `http://localhost` — **GymPilot is live!** 🎉

---

## 🔒 Free HTTPS / SSL Setup (Let's Encrypt & Certbot)

Once you point your domain (e.g. `gympilot.tn`) to your server IP:

### Step 1: Obtain SSL Certificate via Certbot
Run this one-liner on your host to generate the certificate:

```bash
sudo docker run -it --rm \
  -v $(pwd)/nginx/certbot/www:/var/www/certbot \
  -v $(pwd)/nginx/certbot/conf:/etc/letsencrypt \
  certbot/certbot certonly --webroot \
  -w /var/www/certbot \
  -d gympilot.tn -d www.gympilot.tn \
  --email your-email@example.com --agree-tos --no-eff-email
```

### Step 2: Enable HTTPS in Nginx
1. Copy the prepared SSL configuration:
```bash
cp nginx/conf.d/ssl.conf.example nginx/conf.d/ssl.conf
```
*(Make sure the domain name in `nginx/conf.d/ssl.conf` matches your domain).*

2. Reload Nginx:
```bash
docker compose exec nginx nginx -s reload
```

Your site is now secured with **A+ grade HTTPS**! 🔐

---

## 🛠️ Useful Management Commands

| Action | Command |
|---|---|
| **View Live Logs** | `docker compose logs -f` |
| **View Backend Logs** | `docker compose logs -f backend` |
| **View Nginx Access Logs** | `docker compose logs -f nginx` |
| **Restart Containers** | `docker compose restart` |
| **Stop All Containers** | `docker compose down` |
| **Rebuild After Code Changes** | `docker compose up -d --build` |
| **Check Resource Usage (RAM/CPU)** | `docker stats` |
