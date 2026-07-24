"use client";

import React, { useState, useEffect } from "react";
import { Tenant } from "@/db/schema";
import {
  BookOpen,
  Code2,
  Copy,
  Check,
  Terminal,
  Database,
  Layers,
  Key,
  Globe,
  Zap,
  Cpu,
  FileCode,
  ArrowRight,
  Shield,
  HardDrive,
  Activity,
  Table,
  HelpCircle,
  Server,
  FileText,
} from "lucide-react";

interface StudioApiDocsProps {
  project: Tenant;
}

export const StudioApiDocs: React.FC<StudioApiDocsProps> = ({ project }) => {
  const [docCategory, setDocCategory] = useState<
    "rest" | "graphql" | "storage" | "auth" | "webhooks" | "ui_guide"
  >("rest");
  const [selectedLang, setSelectedLang] = useState<
    "js" | "curl" | "python" | "flutter"
  >("js");
  const [tables, setTables] = useState<string[]>([]);
  const [activeTable, setActiveTable] = useState<string>("users");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const baseUrl = `https://db.orfa.dev/p/${project.slug}`;
  const anonKey = project.anonKey || "YOUR_ANON_KEY";
  const serviceKey = project.serviceKey || "YOUR_SERVICE_ROLE_KEY";

  useEffect(() => {
    async function loadTables() {
      try {
        const res = await fetch(baseUrl, {
          headers: { Accept: "application/json", "X-Project-ID": project.slug },
        });
        if (res.ok) {
          const schemaObj = await res.json();
          if (schemaObj.paths) {
            const tableNames = Object.keys(schemaObj.paths)
              .map((p) => p.replace("/", ""))
              .filter((p) => p && p !== "");
            setTables(tableNames);
            if (tableNames.length > 0) {
              setActiveTable(tableNames[0]);
            }
          }
        }
      } catch (e) {
        console.error("Error loading API schema", e);
      }
    }
    loadTables();
  }, [baseUrl, project.slug]);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#121212] min-h-full text-slate-200">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#282828] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Kapsamlı Geliştirici & Arayüz Dokümantasyonu
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Detailed API Specifications, Payloads, HTTP Status Codes, SDKs & UI Manual for{" "}
                <code className="text-emerald-400 font-mono">/{project.slug}</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Category Tabs */}
      <div className="flex items-center gap-2 border-b border-[#282828] pb-3 text-xs overflow-x-auto">
        {[
          { id: "rest", label: "1. REST API Specs & Endpoints", icon: <Terminal className="w-4 h-4 text-emerald-400" /> },
          { id: "graphql", label: "2. GraphQL API Specs (pg_graphql)", icon: <Layers className="w-4 h-4 text-purple-400" /> },
          { id: "storage", label: "3. Storage API Specs (S3/Files)", icon: <HardDrive className="w-4 h-4 text-blue-400" /> },
          { id: "auth", label: "4. Auth & Security (JWT & RLS)", icon: <Shield className="w-4 h-4 text-amber-400" /> },
          { id: "webhooks", label: "5. Webhooks & Event Engine", icon: <Zap className="w-4 h-4 text-cyan-400" /> },
          { id: "ui_guide", label: "6. Kontrol Paneli Arayüz Rehberi", icon: <HelpCircle className="w-4 h-4 text-rose-400" /> },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setDocCategory(cat.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition text-xs ${
              docCategory === cat.id
                ? "bg-[#242424] text-white border border-[#333] shadow-md"
                : "text-slate-400 hover:text-white hover:bg-[#1f1f1f]"
            }`}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* CATEGORY 1: REST API SPECS */}
      {docCategory === "rest" && (
        <div className="space-y-6">
          {/* Table Selector */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#171717] border border-[#282828]">
            <div className="flex items-center gap-3 text-xs">
              <Table className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">Dokümante Edilen Tablo:</span>
              <select
                value={activeTable}
                onChange={(e) => setActiveTable(e.target.value)}
                className="bg-[#121212] border border-[#282828] rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-mono outline-none focus:border-emerald-500"
              >
                {tables.length === 0 ? (
                  <option value="users">users</option>
                ) : (
                  tables.map((t) => (
                    <option key={t} value={t}>
                      public.{t}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Language SDK Switcher */}
            <div className="flex items-center gap-1.5 text-xs">
              {["js", "curl", "python", "flutter"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLang(lang as any)}
                  className={`px-3 py-1 rounded-md uppercase font-mono font-bold transition ${
                    selectedLang === lang
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-[#121212] text-slate-400 hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* GET /public.table */}
          <div className="rounded-xl bg-[#171717] border border-[#282828] overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-[#282828] pb-3">
              <div className="flex items-center gap-3 font-mono">
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                  GET
                </span>
                <span className="text-sm font-bold text-white">{baseUrl}/{activeTable}</span>
              </div>
              <span className="text-xs text-slate-400">Verileri Listeleme ve Filtreleme</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs font-mono">
              {/* Request Specs */}
              <div className="space-y-3">
                <div className="font-bold text-slate-400 uppercase text-[11px]">İstek Başlıkları (Headers)</div>
                <pre className="p-3 rounded-lg bg-[#121212] border border-[#282828] text-slate-300">
{`apikey: ${anonKey}
Authorization: Bearer ${anonKey}
Accept: application/json`}
                </pre>

                <div className="font-bold text-slate-400 uppercase text-[11px]">Sorgu Parametreleri (Query Params)</div>
                <div className="space-y-1 text-slate-300 bg-[#121212] p-3 rounded-lg border border-[#282828]">
                  <div><code className="text-emerald-400">?select=id,name</code> - Sadece belirli alanları çekme</div>
                  <div><code className="text-emerald-400">?id=eq.123</code> - Eşitlik filtresi (Equal)</div>
                  <div><code className="text-emerald-400">?age=gte.18</code> - Büyük eşittir (Greater than or equal)</div>
                  <div><code className="text-emerald-400">?order=created_at.desc</code> - Sıralama</div>
                  <div><code className="text-emerald-400">?limit=10&offset=0</code> - Sayfalama (Pagination)</div>
                </div>
              </div>

              {/* Expected Response Payload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400 uppercase text-[11px]">HTTP 200 OK Yanıt Yapısı (Response)</span>
                  <span className="text-emerald-400 font-bold text-[10px]">JSON Array</span>
                </div>
                <pre className="p-3 rounded-lg bg-[#121212] border border-[#282828] text-blue-300 overflow-x-auto">
{`[
  {
    "id": "c7a8b9e0-1234-5678-9abc-def012345678",
    "name": "Örnek Kayıt 1",
    "created_at": "2026-07-24T12:00:00Z"
  }
]`}
                </pre>
              </div>
            </div>
          </div>

          {/* POST /public.table */}
          <div className="rounded-xl bg-[#171717] border border-[#282828] overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-[#282828] pb-3">
              <div className="flex items-center gap-3 font-mono">
                <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-400 font-bold text-xs">
                  POST
                </span>
                <span className="text-sm font-bold text-white">{baseUrl}/{activeTable}</span>
              </div>
              <span className="text-xs text-slate-400">Yeni Kayıt Ekleme (Insert)</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs font-mono">
              <div className="space-y-3">
                <div className="font-bold text-slate-400 uppercase text-[11px]">İstek Gövdesi (Request Body)</div>
                <pre className="p-3 rounded-lg bg-[#121212] border border-[#282828] text-amber-300">
{`{
  "name": "Yeni Veri Girdisi",
  "status": "active"
}`}
                </pre>
              </div>

              <div className="space-y-3">
                <div className="font-bold text-slate-400 uppercase text-[11px]">HTTP 201 Created Yanıtı</div>
                <pre className="p-3 rounded-lg bg-[#121212] border border-[#282828] text-emerald-300">
{`{
  "id": "e9f8d7c6-5432-10fe-dcba-9876543210fe",
  "name": "Yeni Veri Girdisi",
  "status": "active",
  "created_at": "2026-07-24T14:10:00Z"
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 2: GRAPHQL SPECS */}
      {docCategory === "graphql" && (
        <div className="p-6 rounded-xl bg-[#171717] border border-[#282828] space-y-6 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-[#282828] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">GraphQL API Specifications (pg_graphql)</h3>
              <p className="text-slate-400 text-[11px]">Native C/Rust PostgreSQL GraphQL extension specs.</p>
            </div>
            <span className="px-3 py-1 rounded bg-purple-500/20 text-purple-300 font-bold">
              Endpoint: {baseUrl}/graphql/v1
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="font-bold text-purple-400">GraphQL Query Örneği</div>
              <pre className="p-4 rounded-xl bg-[#121212] border border-[#282828] text-purple-300">
{`query FetchUsers {
  usersCollection(first: 5, orderBy: [{ created_at: DescNullsLast }]) {
    edges {
      node {
        id
        email
        created_at
      }
    }
  }
}`}
              </pre>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-emerald-400">GraphQL JSON Yanıtı</div>
              <pre className="p-4 rounded-xl bg-[#121212] border border-[#282828] text-emerald-300">
{`{
  "data": {
    "usersCollection": {
      "edges": [
        {
          "node": {
            "id": "123",
            "email": "user@example.com"
          }
        }
      ]
    }
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 6: UI MANUAL & KONTROL PANELİ REHBERİ */}
      {docCategory === "ui_guide" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#171717] border border-[#282828] space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-rose-400" />
              Supabase Studio Kontrol Paneli Sayfaları Kullanım Rehberi
            </h3>
            <p className="text-xs text-slate-400">
              Proje arayüzündeki her bir sayfanın işlevi, yönetimi ve kullanım ipuçları.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Table Editor */}
            <div className="p-5 rounded-xl bg-[#171717] border border-[#282828] space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Table className="w-4 h-4 text-emerald-400" />
                <span>1. Table Editor (Veri ve Şema Yöneticisi)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Veritabanınızdaki canlı verileri görüntüleyebilir, süzebilir ve arayabilirsiniz. **"Görsel Tablo Ekle"** butonuna basarak SQL yazmadan veritabanında yeni tablolar ve tipler (`uuid`, `vector`, `text`) oluşturabilirsiniz.
              </p>
            </div>

            {/* SQL Editor */}
            <div className="p-5 rounded-xl bg-[#171717] border border-[#282828] space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span>2. SQL Editor (Canlı Sorgu Çalıştırıcı)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                İleri düzey SQL komutları, saklı yordamlar (Stored Procedures), trigger'lar ve indeksler oluşturmak için kullanılır. Hazır şablonlardan yararlanarak tek tıkla sorgu çalıştırabilirsiniz.
              </p>
            </div>

            {/* Schema Diagrams */}
            <div className="p-5 rounded-xl bg-[#171717] border border-[#282828] space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>3. Schema Diagrams (ER-Diagram & Şablonlar)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Veritabanı yapınızı görsel şekiller ve ER-Diagram olarak incelersiniz. **E-Ticaret**, **SaaS** veya **AI Vector** hazır şablon butonlarına basarak veritabanınıza anında hazır tablolar yükleyebilirsiniz.
              </p>
            </div>

            {/* Storage */}
            <div className="p-5 rounded-xl bg-[#171717] border border-[#282828] space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <HardDrive className="w-4 h-4 text-amber-400" />
                <span>4. Storage Manager (Multi-Tenant Dosya Depolama)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                `public`, `avatars` gibi depolama kovaları (buckets) oluşturup dosya yükleyebilir ve doğrudan kamuya açık URL'lerini kopyalayabilirsiniz.
              </p>
            </div>

            {/* Webhooks & AI Vector */}
            <div className="p-5 rounded-xl bg-[#171717] border border-[#282828] space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>5. Webhooks & AI Vector (Tetikileyici Yöneticisi)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Veritabanında kayıt oluştuğunda dış API'lere otomatik HTTP isteği atan Webhook'lar tanımlayabilir, `pgvector` ve `pg_graphql` eklenti durumlarını izleyebilirsiniz.
              </p>
            </div>

            {/* Live Metrics */}
            <div className="p-5 rounded-xl bg-[#171717] border border-[#282828] space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Activity className="w-4 h-4 text-rose-400" />
                <span>6. Live Metrics (Konteyner ve Sistem Sağlığı)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Proje konteynerinizin anlık CPU kullanımı, RAM tüketimi ve aktif veritabanı bağlantı sayılarını canlı grafiklerle takip etmenizi sağlar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
