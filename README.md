# db.orfa.dev - Multi-Tenant BaaS Control Plane & Orchestrator

A lightweight, self-hosted, multi-tenant Backend-as-a-Service (BaaS) Orchestration Platform and Control Plane built with **Next.js 14**, **TypeScript**, **Drizzle ORM**, **Docker Engine API (`dockerode`)**, and **Traefik Proxy**.

---

## 🎯 Features

- **Isolated Tenant Pods**: Automatically provisions dedicated PostgreSQL (~30MB RAM) + PostgREST (~15MB RAM) containers per project. No heavy Supabase Studio/Analytics overhead.
- **API Gateway Dynamic Routing**: Transparent routing via Traefik Proxy on `db.orfa.dev` using Path Prefixes (`/p/{slug}`) or HTTP Headers (`X-Project-ID: {slug}`).
- **Scale-to-Zero Support**: Instant Pause & Resume controls per pod to save server RAM and CPU resources.
- **JWT & Credential Security**: High-entropy JWT secret generation and PostgREST-compatible `anon` / `service_role` key management.
- **Data & Schema Inspector**: Built-in PostgREST API tester and OpenAPI schema viewer.

---

## 🏗 System Architecture

```
                          [ Client Request ]
                                  │
                       (Host: db.orfa.dev)
                        Header: X-Project-ID / Path: /p/{slug}
                                  │
                                  ▼
                        ┌──────────────────┐
                        │   Traefik v3     │ (API Gateway)
                        └────────┬─────────┘
                                 │ Dynamic Routing (Docker Labels)
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Tenant Pod A    │   │  Tenant Pod B    │   │  Control Plane   │
│ ┌──────────────┐ │   │ ┌──────────────┐ │   │ (Next.js 14+)    │
│ │ PostgREST    │ │   │ │ PostgREST    │ │   │ ├─ Drizzle ORM   │
│ ├──────────────┤ │   │ ├──────────────┤ │   │ ├─ Dockerode     │
│ │ PostgreSQL   │ │   │ │ PostgreSQL   │ │   │ └─ Tailwind/UI   │
│ └──────────────┘ │   │ └──────────────┘ │   └──────────────────┘
└──────────────────┘   └──────────────────┘
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Locally (Development Mode)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the Control Plane Dashboard.

### 3. Production Deployment with Traefik

```bash
docker-compose up -d
```

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (%100 Strict)
- **Styling**: Tailwind CSS
- **Database ORM**: Drizzle ORM + `@libsql/client` (SQLite Master DB)
- **Container Orchestration**: Dockerode (Docker Engine API)
- **Reverse Proxy**: Traefik v3
