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
} from "lucide-react";

interface StudioApiDocsProps {
  project: Tenant;
}

export const StudioApiDocs: React.FC<StudioApiDocsProps> = ({ project }) => {
  const [selectedLang, setSelectedLang] = useState<
    "js" | "curl" | "python" | "flutter" | "graphql" | "postgres"
  >("js");
  const [tables, setTables] = useState<string[]>([]);
  const [activeTable, setActiveTable] = useState<string>("users");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const baseUrl = `https://db.orfa.dev/p/${project.slug}`;
  const anonKey = project.anonKey || "YOUR_ANON_KEY";
  const serviceKey = project.serviceKey || "YOUR_SERVICE_ROLE_KEY";
  const dbPassword = project.dbPassword || "YOUR_DB_PASSWORD";

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

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Code snippet generators
  const getJsSnippet = (tbl: string) => `import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Client for project: ${project.name}
const supabaseUrl = '${baseUrl}'
const supabaseKey = '${anonKey}'
const supabase = createClient(supabaseUrl, supabaseKey)

// 1. Fetch rows from table '${tbl}'
const { data, error } = await supabase
  .from('${tbl}')
  .select('*')

// 2. Insert row into '${tbl}'
const { data: newRow, error: insertErr } = await supabase
  .from('${tbl}')
  .insert({ title: 'Sample Entry', created_at: new Date() })`;

  const getCurlSnippet = (tbl: string) => `# 1. Read All Rows
curl -X GET '${baseUrl}/${tbl}' \\
  -H "apikey: ${anonKey}" \\
  -H "Authorization: Bearer ${anonKey}"

# 2. Insert New Row
curl -X POST '${baseUrl}/${tbl}' \\
  -H "apikey: ${anonKey}" \\
  -H "Authorization: Bearer ${anonKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "New Entry"}'`;

  const getPythonSnippet = (tbl: string) => `from supabase import create_client, Client

url: str = "${baseUrl}"
key: str = "${anonKey}"
supabase: Client = create_client(url, key)

# Fetch rows
response = supabase.table("${tbl}").select("*").execute()
print(response.data)`;

  const getFlutterSnippet = (tbl: string) => `import 'package:supabase_flutter/supabase_flutter.dart';

void main() async {
  await Supabase.initialize(
    url: '${baseUrl}',
    anonKey: '${anonKey}',
  );
  
  final supabase = Supabase.instance.client;
  
  // Fetch data
  final data = await supabase.from('${tbl}').select();
}`;

  const getGraphQLSnippet = (tbl: string) => `# GraphQL Query Endpoint: ${baseUrl}/graphql/v1
query Get${tbl.toUpperCase()} {
  ${tbl}Collection(first: 10) {
    edges {
      node {
        id
        created_at
      }
    }
  }
}`;

  const getPostgresSnippet = () => `# Direct PostgreSQL Connection String
postgres://postgres:${dbPassword}@db.orfa.dev:5432/postgres

# psql CLI
psql "postgres://postgres:${dbPassword}@db.orfa.dev:5432/postgres"`;

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#121212] min-h-full text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">API Documentation & SDK Guide</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic REST, GraphQL, and Client SDK documentation for <code className="text-emerald-400 font-mono">/{project.slug}</code>.
          </p>
        </div>
      </div>

      {/* Endpoints & Keys Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#171717] border border-[#282828] space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">PostgREST Base URL</div>
          <div className="text-xs font-mono text-emerald-400 truncate">{baseUrl}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#171717] border border-[#282828] space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">GraphQL API Endpoint</div>
          <div className="text-xs font-mono text-purple-400 truncate">{baseUrl}/graphql/v1</div>
        </div>

        <div className="p-4 rounded-xl bg-[#171717] border border-[#282828] space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Storage API Base</div>
          <div className="text-xs font-mono text-blue-400 truncate">{baseUrl}/storage/v1</div>
        </div>
      </div>

      {/* SDK Selector Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#282828] pb-2 text-xs overflow-x-auto">
          {[
            { id: "js", label: "JavaScript / TypeScript", icon: <FileCode className="w-3.5 h-3.5 text-amber-400" /> },
            { id: "curl", label: "cURL / HTTP REST", icon: <Terminal className="w-3.5 h-3.5 text-emerald-400" /> },
            { id: "python", label: "Python", icon: <Code2 className="w-3.5 h-3.5 text-blue-400" /> },
            { id: "flutter", label: "Flutter / Dart", icon: <Globe className="w-3.5 h-3.5 text-cyan-400" /> },
            { id: "graphql", label: "GraphQL", icon: <Layers className="w-3.5 h-3.5 text-purple-400" /> },
            { id: "postgres", label: "PostgreSQL Direct", icon: <Database className="w-3.5 h-3.5 text-emerald-400" /> },
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => setSelectedLang(lang.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition ${
                selectedLang === lang.id
                  ? "bg-[#242424] text-white border border-[#333]"
                  : "text-slate-400 hover:text-white hover:bg-[#1f1f1f]"
              }`}
            >
              {lang.icon}
              <span>{lang.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Code Window */}
        <div className="rounded-xl bg-[#171717] border border-[#282828] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Target Table:</span>
              <select
                value={activeTable}
                onChange={(e) => setActiveTable(e.target.value)}
                className="bg-[#121212] border border-[#282828] rounded px-2.5 py-1 text-xs text-emerald-400 font-mono outline-none"
              >
                {tables.length === 0 ? (
                  <option value="users">users</option>
                ) : (
                  tables.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))
                )}
              </select>
            </div>

            <button
              onClick={() => {
                const codeMap: any = {
                  js: getJsSnippet(activeTable),
                  curl: getCurlSnippet(activeTable),
                  python: getPythonSnippet(activeTable),
                  flutter: getFlutterSnippet(activeTable),
                  graphql: getGraphQLSnippet(activeTable),
                  postgres: getPostgresSnippet(),
                };
                copyCode(codeMap[selectedLang], selectedLang);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242424] border border-[#333] hover:bg-[#282828] text-xs text-slate-200 transition"
            >
              {copiedSection === selectedLang ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>Copy Code</span>
            </button>
          </div>

          {/* Snippet Output */}
          <pre className="p-4 rounded-xl bg-[#121212] border border-[#282828] font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
            {selectedLang === "js" && getJsSnippet(activeTable)}
            {selectedLang === "curl" && getCurlSnippet(activeTable)}
            {selectedLang === "python" && getPythonSnippet(activeTable)}
            {selectedLang === "flutter" && getFlutterSnippet(activeTable)}
            {selectedLang === "graphql" && getGraphQLSnippet(activeTable)}
            {selectedLang === "postgres" && getPostgresSnippet()}
          </pre>
        </div>
      </div>
    </div>
  );
};
