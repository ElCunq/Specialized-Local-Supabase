"use client";

import React, { useState, useEffect } from "react";
import { Tenant } from "@/db/schema";
import {
  Database,
  Layers,
  Key,
  Sparkles,
  Plus,
  RefreshCw,
  Zap,
  Cpu,
  ShoppingBag,
  Building2,
  BrainCircuit,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface StudioSchemaDiagramProps {
  project: Tenant;
}

export const StudioSchemaDiagram: React.FC<StudioSchemaDiagramProps> = ({ project }) => {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null);

  const baseUrl = `https://db.orfa.dev/p/${project.slug}`;

  const fetchSchema = async () => {
    setLoading(true);
    try {
      const res = await fetch(baseUrl, {
        headers: { Accept: "application/json", "X-Project-ID": project.slug },
      });
      if (res.ok) {
        const schemaObj = await res.json();
        if (schemaObj.paths) {
          const parsedTables = Object.keys(schemaObj.paths)
            .map((p) => p.replace("/", ""))
            .filter((p) => p && p !== "")
            .map((tableName) => {
              const tableSchema = schemaObj.definitions?.[tableName];
              const properties = tableSchema?.properties || {};
              const cols = Object.keys(properties).map((colName) => ({
                name: colName,
                type: properties[colName]?.type || properties[colName]?.format || "text",
                isPk: colName === "id",
              }));
              return { name: tableName, columns: cols };
            });

          setTables(parsedTables);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchema();
  }, [project.slug]);

  const loadTemplate = async (templateName: string) => {
    setLoadingTemplate(templateName);
    try {
      const res = await fetch(`/api/schema/${project.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "load_template", template: templateName }),
      });
      if (res.ok) {
        fetchSchema();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTemplate(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#121212] min-h-full text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Veri Tabanı Şemaları ve ER-Diagram Görselleştirici
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual ER-Diagram schemas and 1-click ready database shape templates for /{project.slug}.
          </p>
        </div>

        <button
          onClick={fetchSchema}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171717] border border-[#282828] text-xs text-slate-400 hover:text-white transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Yenile
        </button>
      </div>

      {/* Hazır Veri Tabanı Şablonları Bar */}
      <div className="p-6 rounded-xl bg-[#171717] border border-[#282828] space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-white">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Hazır Veri Tabanı Şablonları & Veri Setleri
          </span>
          <span className="text-[10px] text-slate-400 font-mono">1-Click Auto Setup</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* E-Commerce Template */}
          <div className="p-4 rounded-xl bg-[#121212] border border-[#282828] space-y-3 hover:border-emerald-500/40 transition">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">E-Ticaret Şablonu</h4>
                <p className="text-[10px] text-slate-400">products, orders, customers</p>
              </div>
            </div>
            <button
              onClick={() => loadTemplate("ecommerce")}
              disabled={loadingTemplate === "ecommerce"}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs hover:bg-emerald-500/20 transition"
            >
              {loadingTemplate === "ecommerce" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              Şablonu Yükle
            </button>
          </div>

          {/* SaaS Template */}
          <div className="p-4 rounded-xl bg-[#121212] border border-[#282828] space-y-3 hover:border-blue-500/40 transition">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">SaaS Organization Şablonu</h4>
                <p className="text-[10px] text-slate-400">organizations, profiles, roles</p>
              </div>
            </div>
            <button
              onClick={() => loadTemplate("saas")}
              disabled={loadingTemplate === "saas"}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xs hover:bg-blue-500/20 transition"
            >
              {loadingTemplate === "saas" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              Şablonu Yükle
            </button>
          </div>

          {/* AI Vector Template */}
          <div className="p-4 rounded-xl bg-[#121212] border border-[#282828] space-y-3 hover:border-purple-500/40 transition">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">AI Vector Search Şablonu</h4>
                <p className="text-[10px] text-slate-400">documents, pgvector embeddings</p>
              </div>
            </div>
            <button
              onClick={() => loadTemplate("ai_vector")}
              disabled={loadingTemplate === "ai_vector"}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold text-xs hover:bg-purple-500/20 transition"
            >
              {loadingTemplate === "ai_vector" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              Şablonu Yükle
            </button>
          </div>
        </div>
      </div>

      {/* Visual ER-Diagram Shapes Canvas */}
      <div className="p-6 rounded-xl bg-[#171717] border border-[#282828] space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-white border-b border-[#282828] pb-3">
          <span className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Database Schema Diagram ({tables.length} Tables)
          </span>
          <span className="text-slate-500 font-mono">schema: public</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-500 text-xs">
            Veri tabanı şemaları çiziliyor...
          </div>
        ) : tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-xs space-y-2">
            <Layers className="w-8 h-8 opacity-30 text-emerald-400" />
            <span>Henüz veri tabanı tablosu oluşturulmadı. Yukarıdaki şablonlardan birini yükleyebilirsiniz.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {tables.map((tbl) => (
              <div
                key={tbl.name}
                className="rounded-xl border border-[#282828] bg-[#121212] overflow-hidden hover:border-emerald-500/40 transition shadow-lg"
              >
                {/* Table Header Shape */}
                <div className="px-4 py-3 bg-[#1f1f1f] border-b border-[#282828] flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono font-bold text-xs text-emerald-400">
                    <Database className="w-3.5 h-3.5" />
                    <span>public.{tbl.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {tbl.columns.length} cols
                  </span>
                </div>

                {/* Columns List Shape */}
                <div className="p-3 space-y-1.5 font-mono text-xs">
                  {tbl.columns.map((col: any) => (
                    <div
                      key={col.name}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#171717] text-slate-300 text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        {col.isPk ? (
                          <span className="px-1 py-0.2 text-[9px] font-bold bg-amber-500/20 text-amber-400 rounded">
                            PK
                          </span>
                        ) : (
                          <span className="w-3 text-slate-600">•</span>
                        )}
                        <span className="font-semibold text-slate-200">{col.name}</span>
                      </div>
                      <span className="text-slate-500 text-[10px]">{col.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
