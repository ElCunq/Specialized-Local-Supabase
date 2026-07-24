# ⚡ Supabase Local Orchestrator (Control Plane)

> **[Turkish Documentation (README.md)](README.md)** | **[English Documentation](README_EN.md)**

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Engine-blue?style=flat-square&logo=docker)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Traefik](https://img.shields.io/badge/Traefik-v3.0-24A1DE?style=flat-square&logo=traefik)](https://traefik.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Supabase Local Orchestrator** is an ultra-fast, lightweight, self-hosted **Backend-as-a-Service (BaaS) Management Platform** that provisions isolated, per-tenant Docker Pods with **~95% RAM savings**.

Standard Supabase deployments consume **1.5 GB - 2 GB RAM per project**; this orchestrator runs the core PostgreSQL + PostgREST + GoTrue engine in **~35 MB RAM** per tenant while providing a unified, rich **Supabase Studio** dashboard.

---

## 🔥 Key Features

- **⚡ Per-Tenant Pod Architecture**: 1-Click provisioning of isolated PostgreSQL + PostgREST Docker Pods.
- **⚡ Built-in Supabase Studio Clone UI**:
  - 📊 **Table Editor**: Live data browser, filtering, sorting, and **Visual Schema Builder**.
  - ⚡ **SQL Editor**: Interactive SQL runner with query templates.
  - 🎨 **Schema Diagrams**: Automatic ER-Diagram visualizer with 1-click **E-Commerce / SaaS / AI Vector** template loaders.
  - 📦 **Multi-Tenant Storage Manager**: S3-compatible file & bucket manager (0 MB added RAM).
  - 🚀 **Multi-Tenant Realtime SSE**: Live event streaming and heartbeat ping.
  - 🤖 **pgvector & pg_graphql**: Native AI vector search and automatic GraphQL API support.
  - 🔔 **Database Webhooks**: Asynchronous event triggers using `pg_net`.
  - 📚 **Comprehensive API Docs Hub**: Dynamic REST, GraphQL, cURL, Python, JS, and Flutter SDK documentation tailored to every project.
- **🚀 Ultra-Fast Deployments**: Docker BuildKit & Next.js `standalone` optimization enabling **<20 second deployments**.

---

## 🏗️ Architecture

```
                  +-----------------------------------+
                  |   Traefik Proxy (Coolify / Host)  |
                  +-----------------+-----------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
+-----------------------+                       +-----------------------+
| Control Plane (App)   |                       | Tenant Pod 1 (App A)  |
| - Studio Dashboard    |                       | - PostgreSQL 15       |
| - Orchestrator Engine |                       | - PostgREST API       |
| - SQLite Master DB    |                       | - GoTrue Auth         |
+-----------------------+                       +-----------------------+
            |                                               |
            v                                               v
+-----------------------+                       +-----------------------+
| Docker Socket API     |                       | Tenant Pod 2 (App B)  |
| /var/run/docker.sock  |                       | - Minimalist Pod      |
+-----------------------+                       +-----------------------+
```

---

## 🛠️ Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/ElCunq/Specialized-Local-Supabase.git
cd Specialized-Local-Supabase
```

### 2. Install Dependencies & Start Dev Server
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Run Production Container with Docker Compose
```bash
docker compose up -d --build
```

---

## ⚙️ Environment Variables

| Variable Name | Default Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `file:master_control_plane.db` | Control Plane SQLite database path |
| `DOCKER_SOCKET` | `/var/run/docker.sock` | Docker Engine Unix socket path |
| `TRAEFIK_NETWORK` | `coolify` | Shared reverse proxy Docker network |
| `STORAGE_DIR` | `/app/data/storage` | Root directory for multi-tenant file storage |
| `PORT` | `3000` | Application port |

---

## 📖 License

This project is licensed under the **MIT License**.
