# ⚡ Supabase Local Orchestrator (Control Plane)

> **[English Documentation (README_EN.md)](README_EN.md)** | **[Türkçe Dokümantasyon](README.md)**

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Engine-blue?style=flat-square&logo=docker)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Traefik](https://img.shields.io/badge/Traefik-v3.0-24A1DE?style=flat-square&logo=traefik)](https://traefik.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Supabase Local Orchestrator**, her bir proje/müşteri için izole ve minimalist BaaS (Backend-as-a-Service) Docker Pod'ları oluşturan, **%95 RAM tasarrufu** sağlayan ultra hızlı ve hafif bir **Self-Hosted Supabase Yönetim Platformudur**.

 Standart Supabase kurulumları proje başına **1.5 GB - 2 GB RAM** harcarken; bu platform bağımsız PostgreSQL + PostgREST + GoTrue çekirdeğini **~35 MB RAM** ile çalıştırır ve tek bir merkezi **Supabase Studio** arayüzü sunar.

---

## 🔥 Öne Çıkan Özellikler

- **⚡ Per-Tenant Pod Mimarisi**: Tek tıkla izole PostgreSQL + PostgREST Docker Pod'ları oluşturma.
- **⚡ Dahili Supabase Studio Klon Arayüzü**:
  - 📊 **Table Editor**: Canlı veri süzme, sıralama ve **Görsel Tablo Oluşturucu (Visual Schema Builder)**.
  - ⚡ **SQL Editor**: Şablon destekli canlı SQL sorgu çalıştırıcı.
  - 🎨 **Schema Diagrams**: Otomatik ER-Diagram görselleştirici ve tek tıkla **E-Ticaret / SaaS / AI Vector** şablonları yükleme.
  - 📦 **Multi-Tenant Storage Manager**: S3 uyumlu dosya ve kova (bucket) yöneticisi (0 MB ek RAM).
  - 🚀 **Multi-Tenant Realtime SSE**: Canlı veri ve heartbeat akışı.
  - 🤖 **pgvector & pg_graphql**: Yapay zeka vektör araması ve otomatik GraphQL API desteği.
  - 🔔 **Database Webhooks**: `pg_net` ile veritabanı olaylarını dış API'lere aktarma.
  - 📚 **Kapsamlı API Docs Hub**: Projeye özel dinamik REST, GraphQL, cURL, Python, JS ve Flutter SDK rehberi.
- **🚀 Jet Hızında Deployment**: Docker BuildKit ve Next.js `standalone` optimizasyonu ile **<20 saniyede canlıya alma**.

---

## 🏗️ Mimari Yapı

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

## 🛠️ Hızlı Kurulum & Çalıştırma

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/ElCunq/Specialized-Local-Supabase.git
cd Specialized-Local-Supabase
```

### 2. Bağımlılıkları Yükleyin ve Lokal Geliştirici Sunucusunu Başlatın
```bash
npm install
npm run dev
```
Uygulama `http://localhost:3000` adresinde çalışacaktır.

### 3. Docker Compose ile Üretim Modunda Çalıştırma
```bash
docker compose up -d --build
```

---

## ⚙️ Çevre Değişkenleri (Environment Variables)

| Değişken Adı | Varsayılan Değer | Açıklama |
| :--- | :--- | :--- |
| `DATABASE_URL` | `file:master_control_plane.db` | Control Plane SQLite veritabanı adresi |
| `DOCKER_SOCKET` | `/var/run/docker.sock` | Docker Engine Unix soket adresi |
| `TRAEFIK_NETWORK` | `coolify` | Ters proxy ortak Docker ağı |
| `STORAGE_DIR` | `/app/data/storage` | Multi-Tenant dosya depolama kök dizini |
| `PORT` | `3000` | Uygulama çalışma portu |

---

## 📖 Lisans

Bu proje **MIT Lisansı** ile lisanslanmıştır. Özgürce çatallayabilir (fork), değiştirebilir ve ticari/bireysel projelerinizde kullanabilirsiniz.
