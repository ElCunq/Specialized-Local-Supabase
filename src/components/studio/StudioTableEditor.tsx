"use client";

import React, { useState, useEffect } from "react";
import { Tenant } from "@/db/schema";
import {
  Table,
  Plus,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  Database,
  Check,
  AlertCircle,
} from "lucide-react";

interface StudioTableEditorProps {
  project: Tenant;
}

export const StudioTableEditor: React.FC<StudioTableEditorProps> = ({ project }) => {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = `https://db.orfa.dev/p/${project.slug}`;

  // Fetch OpenAPI schema to discover public tables
  useEffect(() => {
    async function loadSchema() {
      try {
        const res = await fetch(baseUrl, {
          headers: {
            Accept: "application/json",
            "X-Project-ID": project.slug,
          },
        });
        if (res.ok) {
          const schemaObj = await res.json();
          if (schemaObj.paths) {
            const tableNames = Object.keys(schemaObj.paths)
              .map((p) => p.replace("/", ""))
              .filter((p) => p && p !== "");
            setTables(tableNames);
            if (tableNames.length > 0) {
              setSelectedTable(tableNames[0]);
            }
          }
        }
      } catch (e) {
        console.error("Error fetching OpenAPI schema", e);
      }
    }
    loadSchema();
  }, [baseUrl, project.slug]);

  // Fetch rows for selected table
  useEffect(() => {
    if (!selectedTable) return;
    async function fetchTableData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/${selectedTable}`, {
          headers: {
            Accept: "application/json",
            "X-Project-ID": project.slug,
          },
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message);
        setRows([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTableData();
  }, [selectedTable, baseUrl, project.slug]);

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="flex h-full bg-[#121212] text-slate-200">
      {/* Tables Sidebar */}
      <div className="w-56 bg-[#171717] border-r border-[#282828] p-3 space-y-3 flex flex-col">
        <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Schema Tables ({tables.length})</span>
          <button className="p-1 rounded hover:bg-[#282828] text-slate-400 hover:text-white">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {tables.length === 0 ? (
            <div className="text-xs text-slate-500 p-2 text-center">
              Tablo bulunamadı veya henüz oluşturulmadı.
            </div>
          ) : (
            tables.map((tbl) => (
              <button
                key={tbl}
                onClick={() => setSelectedTable(tbl)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition ${
                  selectedTable === tbl
                    ? "bg-[#242424] text-emerald-400 font-bold border border-[#333]"
                    : "text-slate-400 hover:text-white hover:bg-[#1f1f1f]"
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span className="truncate">{tbl}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Data Table Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Table Toolbar */}
        <div className="h-12 border-b border-[#282828] px-4 flex items-center justify-between text-xs bg-[#171717]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-emerald-400 font-bold">
              public.{selectedTable || "schema"}
            </span>
            <span className="text-slate-500 font-mono">({rows.length} kayıt)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTable(selectedTable)}
              className="p-1.5 rounded-md hover:bg-[#282828] text-slate-400 hover:text-white"
              title="Yenile"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Data Grid */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-500 text-xs">
              Veriler çekiliyor...
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-xs space-y-2">
              <Database className="w-8 h-8 opacity-30 text-emerald-400" />
              <span>Bu tabloda henüz hiç kayıt yok.</span>
            </div>
          ) : (
            <div className="rounded-xl border border-[#282828] overflow-hidden bg-[#171717]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#1f1f1f] text-slate-400 border-b border-[#282828] uppercase text-[10px]">
                  <tr>
                    {columns.map((col) => (
                      <th key={col} className="px-4 py-3 font-semibold">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282828]">
                  {rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#1f1f1f]/50 transition">
                      {columns.map((col) => (
                        <td key={col} className="px-4 py-2.5 text-slate-300 truncate max-w-xs">
                          {typeof row[col] === "object"
                            ? JSON.stringify(row[col])
                            : String(row[col] ?? "null")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
