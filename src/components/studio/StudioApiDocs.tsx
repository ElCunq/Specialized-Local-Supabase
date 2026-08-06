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
  Shield,
  HardDrive,
  Zap,
  HelpCircle,
  Table,
  FileCode,
  Globe,
  Key,
  Server,
  Activity,
  CheckCircle,
  Bot,
  Download,
  Sparkles,
} from "lucide-react";

interface StudioApiDocsProps {
  project: Tenant;
}

export const StudioApiDocs: React.FC<StudioApiDocsProps> = ({ project }) => {
  const [docCategory, setDocCategory] = useState<
    "rest" | "graphql" | "storage" | "auth" | "webhooks" | "ui_guide"
  >("rest");
  const [selectedLang, setSelectedLang] = useState<"js" | "curl" | "python" | "flutter">("js");
  const [tables, setTables] = useState<any[]>([]);
  const [tableNames, setTableNames] = useState<string[]>([]);
  const [activeTable, setActiveTable] = useState<string>("users");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAiDoc, setCopiedAiDoc] = useState(false);

  const domain = typeof window !== "undefined" ? window.location.host : "db.orfa.dev";
  const baseUrl = `https://${domain}/p/${project.slug}`;
  const anonKey = project.anonKey || "YOUR_ANON_KEY";
  const serviceKey = project.serviceKey || "YOUR_SERVICE_ROLE_KEY";
  const dbPassword = project.dbPassword || "YOUR_DB_PASSWORD";

  useEffect(() => {
    async function loadSchema() {
      try {
        const res = await fetch(`/api/schema/${project.slug}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.tables)) {
          setTables(data.tables);
          const names = data.tables.map((t: any) => t.name);
          setTableNames(names);
          if (names.length > 0) {
            setActiveTable(names[0]);
          }
        }
      } catch (e) {
        console.error("Error loading API schema", e);
      }
    }
    loadSchema();
  }, [project.slug]);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Generates AI-optimized Markdown prompt context
  const generateAiPromptDoc = () => {
    const tableSchemasFormatted = tables.map((t: any) => {
      const cols = Array.isArray(t.columns)
        ? t.columns.map((c: any) => `    - ${c.name}: ${c.type}${c.is_nullable ? "" : " (NOT NULL)"}`).join("\n")
        : "    - (No columns defined)";
      return `### Table: public.${t.name}\n${cols}`;
    }).join("\n\n");

    return `# 🤖 SUPABASE PROJECT AI & LLM CONTEXT DOCK SPECIFICATION

> **Note for AI (ChatGPT, Claude, Cursor, v0, Bolt, Windsurf):**
> Use the following backend specifications, API keys, database schemas, and SDK snippets to generate accurate full-stack code for the project \`/${project.slug}\`.

---

## 1. PROJECT IDENTIFICATION & BASE URLS
- **Project Name:** ${project.name}
- **Project Slug:** ${project.slug}
- **REST API Base URL:** ${baseUrl}
- **GraphQL Base URL:** ${baseUrl}/graphql/v1
- **Storage Base URL:** https://${domain}/api/storage/${project.slug}
- **PostgreSQL Host:** ${domain}:5432
- **Database Name:** postgres
- **Database User:** postgres

---

## 2. API KEYS & SECURITY HEADERS
All REST API requests must include both \`apikey\` and \`Authorization\` headers:
- **Anon Key (Public Client):** \`${anonKey}\`
- **Service Role Key (Admin Secret):** \`${serviceKey}\`

Header Format:
\`\`\`http
apikey: ${anonKey}
Authorization: Bearer ${anonKey}
Content-Type: application/json
\`\`\`

---

## 3. LIVE DATABASE TABLES & SCHEMAS
${tables.length === 0 ? "No custom tables found yet. Default public schema." : tableSchemasFormatted}

---

## 4. REST API CRUD SPECIFICATIONS
Replace \`{table}\` with any target table name (e.g. \`${activeTable || "users"}\`):

### READ (Select Rows)
- **Method:** \`GET\`
- **Endpoint:** \`${baseUrl}/{table}\`
- **Query Params:** \`?select=*\` (All columns), \`?id=eq.123\` (Filter by ID), \`?order=created_at.desc\` (Order)

### INSERT (Create Row)
- **Method:** \`POST\`
- **Endpoint:** \`${baseUrl}/{table}\`
- **Headers:** \`Prefer: return=representation\`
- **Body:** \`{ "column_name": "value" }\`

### UPDATE (Modify Row)
- **Method:** \`PATCH\`
- **Endpoint:** \`${baseUrl}/{table}?id=eq.123\`
- **Body:** \`{ "column_name": "new_value" }\`

### DELETE (Remove Row)
- **Method:** \`DELETE\`
- **Endpoint:** \`${baseUrl}/{table}?id=eq.123\`

---

## 5. CLIENT SDK CODE SNIPPETS

### JavaScript / TypeScript (@supabase/supabase-js)
\`\`\`typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = '${baseUrl}'
const supabaseAnonKey = '${anonKey}'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Example: Fetch data
const { data, error } = await supabase.from('${activeTable || "users"}').select('*')
\`\`\`

### Python (supabase-py)
\`\`\`python
from supabase import create_client, Client

url: str = "${baseUrl}"
key: str = "${anonKey}"
supabase: Client = create_client(url, key)

response = supabase.table("${activeTable || "users"}").select("*").execute()
\`\`\`

### Flutter / Dart (supabase_flutter)
\`\`\`dart
import 'package:supabase_flutter/supabase_flutter.dart';

await Supabase.initialize(
  url: '${baseUrl}',
  anonKey: '${anonKey}',
);
final supabase = Supabase.instance.client;
final data = await supabase.from('${activeTable || "users"}').select();
\`\`\`
`;
  };

  const handleCopyAiDoc = () => {
    const aiText = generateAiPromptDoc();
    navigator.clipboard.writeText(aiText);
    setCopiedAiDoc(true);
    setTimeout(() => setCopiedAiDoc(false), 2500);
  };

  const handleDownloadAiDoc = () => {
    const aiText = generateAiPromptDoc();
    const blob = new Blob([aiText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.slug}_ai_context.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Code Generators for REST
  const getCodeSnippet = (lang: string, tbl: string) => {
    if (lang === "js") {
      return `// 1. Initialize Supabase Client
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = '${baseUrl}'
const supabaseAnonKey = '${anonKey}'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 2. READ (Select all rows from '${tbl}')
const { data, error } = await supabase
  .from('${tbl}')
  .select('*')

// 3. INSERT (Add new row to '${tbl}')
const { data: inserted, error: insertErr } = await supabase
  .from('${tbl}')
  .insert({ name: 'Yeni Öge', created_at: new Date().toISOString() })

// 4. UPDATE (Modify row in '${tbl}')
const { data: updated, error: updateErr } = await supabase
  .from('${tbl}')
  .update({ name: 'Güncellendi' })
  .eq('id', '123')

// 5. DELETE (Remove row from '${tbl}')
const { error: deleteErr } = await supabase
  .from('${tbl}')
  .delete()
  .eq('id', '123')`;
    }

    if (lang === "curl") {
      return `# 1. READ (GET all rows from '${tbl}')
curl -X GET '${baseUrl}/${tbl}' \\
  -H "apikey: ${anonKey}" \\
  -H "Authorization: Bearer ${anonKey}"

# 2. INSERT (POST new row to '${tbl}')
curl -X POST '${baseUrl}/${tbl}' \\
  -H "apikey: ${anonKey}" \\
  -H "Authorization: Bearer ${anonKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Yeni Öge"}'

# 3. UPDATE (PATCH row in '${tbl}')
curl -X PATCH '${baseUrl}/${tbl}?id=eq.123' \\
  -H "apikey: ${anonKey}" \\
  -H "Authorization: Bearer ${anonKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Güncellendi"}'

# 4. DELETE (DELETE row from '${tbl}')
curl -X DELETE '${baseUrl}/${tbl}?id=eq.123' \\
  -H "apikey: ${anonKey}" \\
  -H "Authorization: Bearer ${anonKey}"`;
    }

    if (lang === "python") {
      return `# Python Supabase Client
from supabase import create_client, Client

url: str = "${baseUrl}"
key: str = "${anonKey}"
supabase: Client = create_client(url, key)

# READ
response = supabase.table("${tbl}").select("*").execute()
print(response.data)

# INSERT
new_row = supabase.table("${tbl}").insert({"name": "Yeni Öge"}).execute()

# UPDATE
updated_row = supabase.table("${tbl}").update({"name": "Güncellendi"}).eq("id", "123").execute()

# DELETE
deleted_row = supabase.table("${tbl}").delete().eq("id", "123").execute()`;
    }

    if (lang === "flutter") {
      return `// Flutter / Dart Supabase Client
import 'package:supabase_flutter/supabase_flutter.dart';

void main() async {
  await Supabase.initialize(
    url: '${baseUrl}',
    anonKey: '${anonKey}',
  );
  final supabase = Supabase.instance.client;

  // READ
  final List<dynamic> data = await supabase.from('${tbl}').select();

  // INSERT
  await supabase.from('${tbl}').insert({'name': 'Yeni Öge'});

  // UPDATE
  await supabase.from('${tbl}').update({'name': 'Güncellendi'}).eq('id', '123');

  // DELETE
  await supabase.from('${tbl}').delete().eq('id', '123');
}`;
    }

    return "";
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#121212] min-h-full text-slate-200 select-text cursor-auto">
      {/* AI Context Exporter Top Banner */}
      <div className="p-6 rounded-2xl bg-[#171717] border border-purple-500/30 space-y-4 shadow-xl shadow-purple-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282828] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">AI & LLM İçin Tek Tıkla Dokümantasyon İhracı</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                  ChatGPT / Claude / Cursor / v0 Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ChatGPT, Claude, Cursor, v0 veya Bolt gibi yapay zeka araçlarına projenizin tüm API adreslerini, veritabanı tablolarını ve anahtarlarını eksiksiz aktarın.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyAiDoc}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-500/20 cursor-pointer"
            >
              {copiedAiDoc ? <Check className="w-4 h-4 text-emerald-400" /> : <Sparkles className="w-4 h-4 text-purple-200" />}
              {copiedAiDoc ? "AI Dokümanı Kopyalandı!" : "AI Dokümanını Kopyala"}
            </button>

            <button
              onClick={handleDownloadAiDoc}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#242424] border border-[#333] hover:bg-[#282828] text-slate-200 font-bold text-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Dosya İndir (.md)
            </button>
          </div>
        </div>
      </div>

      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#282828] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Detaylı Geliştirici & Arayüz Dokümantasyonu
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete API Specifications, Payloads, HTTP Status Codes, SDKs & UI Manual for{" "}
                <code className="text-emerald-400 font-mono select-all">/{project.slug}</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Category Tabs */}
      <div className="flex items-center gap-2 border-b border-[#282828] pb-3 text-xs overflow-x-auto">
        {[
          { id: "rest", label: "1. REST API Specs & SDKs", icon: <Terminal className="w-4 h-4 text-emerald-400" /> },
          { id: "graphql", label: "2. GraphQL API Specs", icon: <Layers className="w-4 h-4 text-purple-400" /> },
          { id: "storage", label: "3. Storage API Specs", icon: <HardDrive className="w-4 h-4 text-blue-400" /> },
          { id: "auth", label: "4. Auth & Keys", icon: <Shield className="w-4 h-4 text-amber-400" /> },
          { id: "webhooks", label: "5. Webhooks & Events", icon: <Zap className="w-4 h-4 text-cyan-400" /> },
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

      {/* CATEGORY 1: REST API SPECS & SDKs */}
      {docCategory === "rest" && (
        <div className="space-y-6">
          {/* Controls Bar: Table & Language Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#171717] border border-[#282828]">
            <div className="flex items-center gap-3 text-xs">
              <Table className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">Dokümante Edilen Tablo:</span>
              <select
                value={activeTable}
                onChange={(e) => setActiveTable(e.target.value)}
                className="bg-[#121212] border border-[#282828] rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-mono outline-none focus:border-emerald-500 cursor-pointer"
              >
                {tableNames.length === 0 ? (
                  <option value="users">users</option>
                ) : (
                  tableNames.map((t) => (
                    <option key={t} value={t}>
                      public.{t}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Working Language Switcher */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-bold mr-1">Dil Seçin:</span>
              {[
                { id: "js", label: "JavaScript / TS" },
                { id: "curl", label: "cURL / HTTP" },
                { id: "python", label: "Python" },
                { id: "flutter", label: "Flutter / Dart" },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLang(lang.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-mono font-bold transition text-xs cursor-pointer ${
                    selectedLang === lang.id
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                      : "bg-[#121212] text-slate-400 hover:text-white hover:bg-[#242424]"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Code Window */}
          <div className="rounded-xl bg-[#171717] border border-[#282828] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#282828] pb-3">
              <div className="flex items-center gap-2 font-mono text-xs text-white">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>
                  {selectedLang.toUpperCase()} SDK Code Snippet for <code className="text-emerald-400 font-bold">public.{activeTable}</code>
                </span>
              </div>

              <button
                onClick={() => copyText(getCodeSnippet(selectedLang, activeTable), "main_snippet")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242424] border border-[#333] hover:bg-[#282828] text-xs text-slate-200 transition cursor-pointer"
              >
                {copiedId === "main_snippet" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Kodu Kopyala</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-[#121212] border border-[#282828] font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed select-text">
              {getCodeSnippet(selectedLang, activeTable)}
            </pre>
          </div>

          {/* Detailed HTTP REST Endpoints Specifications */}
          <div className="rounded-xl bg-[#171717] border border-[#282828] p-6 space-y-6">
            <h3 className="text-sm font-bold text-white border-b border-[#282828] pb-3">
              HTTP REST Specifications & Payloads for /{activeTable}
            </h3>

            {/* GET */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold">GET</span>
                <span className="text-white font-bold">{baseUrl}/{activeTable}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 rounded-lg bg-[#121212] border border-[#282828] space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Headers</div>
                  <div className="text-slate-300">apikey: {anonKey}</div>
                  <div className="text-slate-300">Authorization: Bearer {anonKey}</div>
                </div>

                <div className="p-3 rounded-lg bg-[#121212] border border-[#282828] space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500">HTTP 200 Response Payload</div>
                  <pre className="text-blue-300 select-text">{`[ { "id": "123", "name": "Sample" } ]`}</pre>
                </div>
              </div>
            </div>

            {/* POST */}
            <div className="space-y-3 pt-4 border-t border-[#282828]">
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-400 font-bold">POST</span>
                <span className="text-white font-bold">{baseUrl}/{activeTable}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 rounded-lg bg-[#121212] border border-[#282828] space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Request Body JSON</div>
                  <pre className="text-amber-300 select-text">{`{ "name": "Yeni Veri" }`}</pre>
                </div>

                <div className="p-3 rounded-lg bg-[#121212] border border-[#282828] space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500">HTTP 201 Created Response</div>
                  <pre className="text-emerald-300 select-text">{`{ "id": "456", "name": "Yeni Veri" }`}</pre>
                </div>
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
            <span className="px-3 py-1 rounded bg-purple-500/20 text-purple-300 font-bold select-all">
              Endpoint: {baseUrl}/graphql/v1
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="font-bold text-purple-400">GraphQL Query Örneği</div>
              <pre className="p-4 rounded-xl bg-[#121212] border border-[#282828] text-purple-300 select-text">
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
              <pre className="p-4 rounded-xl bg-[#121212] border border-[#282828] text-emerald-300 select-text">
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

      {/* CATEGORY 3: STORAGE API SPECS */}
      {docCategory === "storage" && (
        <div className="p-6 rounded-xl bg-[#171717] border border-[#282828] space-y-6 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-[#282828] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Multi-Tenant Storage API Specs</h3>
              <p className="text-slate-400 text-[11px]">S3-compatible file storage specifications.</p>
            </div>
            <span className="px-3 py-1 rounded bg-blue-500/20 text-blue-300 font-bold select-all">
              Base URL: https://${domain}/api/storage/${project.slug}
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#121212] border border-[#282828] space-y-2">
              <div className="font-bold text-emerald-400">1. Dosya Yükleme (Upload File)</div>
              <div className="text-slate-300">POST /api/storage/${project.slug} (multipart/form-data)</div>
              <pre className="p-3 rounded bg-[#171717] text-slate-300 select-text">{`curl -X POST https://${domain}/api/storage/${project.slug} \\
  -F "bucket=public" \\
  -F "file=@avatar.png"`}</pre>
            </div>

            <div className="p-4 rounded-xl bg-[#121212] border border-[#282828] space-y-2">
              <div className="font-bold text-blue-400">2. Dosyaları Listeleme (List Files)</div>
              <div className="text-slate-300">GET /api/storage/${project.slug}?bucket=public</div>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 4: AUTH & KEYS */}
      {docCategory === "auth" && (
        <div className="p-6 rounded-xl bg-[#171717] border border-[#282828] space-y-6 text-xs font-mono">
          <h3 className="text-sm font-bold text-white border-b border-[#282828] pb-3">API Keys & Security Architecture</h3>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#121212] border border-[#282828] space-y-2">
              <div className="font-bold text-amber-400">1. anon (public) Key</div>
              <div className="text-slate-300 select-all">{anonKey}</div>
              <p className="text-[10px] text-slate-500 font-sans">Frontend uygulamalarınızda güvenle paylaşılabilir public anahtar.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#121212] border border-[#282828] space-y-2">
              <div className="font-bold text-rose-400">2. service_role (secret) Key</div>
              <div className="text-slate-300 select-all">{serviceKey}</div>
              <p className="text-[10px] text-slate-500 font-sans">Row Level Security (RLS) kurallarını baypas eden admin anahtar. Gizli tutulmalıdır!</p>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 5: WEBHOOKS & AI AGENT API */}
      {docCategory === "webhooks" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#171717] border border-[#282828] space-y-6 text-xs font-mono">
            <h3 className="text-sm font-bold text-white border-b border-[#282828] pb-3">Database Webhooks Specs</h3>
            <p className="text-slate-400 font-sans">Veritabanında kayıt oluştuğunda dış API'lere gönderilen JSON bildirim yapısı:</p>
            <pre className="p-4 rounded-xl bg-[#121212] border border-[#282828] text-cyan-300 select-text">{`{
    "event": "INSERT",
    "table": "orders",
    "schema": "public",
    "record": {
      "id": "ord_999",
      "total": 199.99,
      "status": "paid"
    },
    "timestamp": "2026-07-24T14:33:00Z"
  }`}</pre>
          </div>

          <div className="p-6 rounded-xl bg-[#171717] border border-[#282828] space-y-6 text-xs font-mono">
            <div className="flex items-center gap-2 border-b border-[#282828] pb-3">
              <Bot className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white">AI Agent SQL Execution API</h3>
            </div>
            <p className="text-slate-400 font-sans">Harici yapay zeka ajanlarının doğrudan veritabanında SQL sorguları çalıştırabilmesi için güvenli (service_role) API noktası.</p>
            
            <div className="space-y-2">
              <div className="font-bold text-emerald-400">POST /api/agents/sql</div>
              <div className="p-3 rounded-lg bg-[#121212] border border-[#282828] space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">Headers</div>
                <div className="text-slate-300">Authorization: Bearer {serviceKey}</div>
                <div className="text-slate-300">Content-Type: application/json</div>
              </div>
              <div className="p-3 rounded-lg bg-[#121212] border border-[#282828] space-y-1 mt-2">
                <div className="text-[10px] uppercase font-bold text-slate-500">Request Body JSON</div>
                <pre className="text-amber-300 select-text">{`{
    "slug": "${project.slug}",
    "query": "SELECT * FROM users LIMIT 5;"
  }`}</pre>
              </div>
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
                <span>5. Webhooks & AI Vector (Tetikleyici Yöneticisi)</span>
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
