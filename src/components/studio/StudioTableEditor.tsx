"use client";

import React, { useState, useEffect } from "react";
import { Tenant } from "@/db/schema";
import {
  Table,
  Plus,
  RefreshCw,
  Search,
  Database,
  Check,
  AlertCircle,
  X,
  Trash2,
  Loader2,
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

  // Visual Table Creator Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [columns, setColumns] = useState<
    { name: string; type: string; isPrimaryKey: boolean; isNullable: boolean }[]
  >([
    { name: "id", type: "uuid", isPrimaryKey: true, isNullable: false },
    { name: "created_at", type: "timestamp with time zone", isPrimaryKey: false, isNullable: true },
  ]);
  const [creating, setCreating] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin + `/p/${project.slug}` : `/p/${project.slug}`;

  const loadSchema = async () => {
    try {
      // First try direct control-plane schema discovery API
      const res = await fetch(`/api/schema/${project.slug}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.tables) && data.tables.length > 0) {
        const tableNames = data.tables.map((t: any) => t.name);
        setTables(tableNames);
        if (tableNames.length > 0 && !selectedTable) {
          setSelectedTable(tableNames[0]);
        }
        return;
      }

      // Fallback to PostgREST OpenAPI schema
      const openApiRes = await fetch(baseUrl, {
        headers: { Accept: "application/json", "X-Project-ID": project.slug },
      });
      if (openApiRes.ok) {
        const schemaObj = await openApiRes.json();
        if (schemaObj.paths) {
          const tableNames = Object.keys(schemaObj.paths)
            .map((p) => p.replace("/", ""))
            .filter((p) => p && p !== "");
          setTables(tableNames);
          if (tableNames.length > 0 && !selectedTable) {
            setSelectedTable(tableNames[0]);
          }
        }
      }
    } catch (e) {
      console.error("Error fetching schema", e);
    }
  };

  useEffect(() => {
    loadSchema();
  }, [baseUrl, project.slug]);

  useEffect(() => {
    if (!selectedTable) return;
    async function fetchTableData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/${selectedTable}`, {
          headers: { Accept: "application/json", "X-Project-ID": project.slug },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
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

  const handleAddColumnDef = () => {
    setColumns([...columns, { name: "", type: "text", isPrimaryKey: false, isNullable: true }]);
  };

  const handleRemoveColumnDef = (idx: number) => {
    setColumns(columns.filter((_, i) => i !== idx));
  };

  const handleCreateTableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName) return;

    setCreating(true);
    try {
      const res = await fetch(`/api/schema/${project.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_table", tableName: newTableName, columns }),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewTableName("");
        loadSchema();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const colNames = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="flex h-full bg-[#121212] text-slate-200">
      {/* Tables Sidebar */}
      <div className="w-56 bg-[#171717] border-r border-[#282828] p-3 space-y-3 flex flex-col">
        <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Tables ({tables.length})</span>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition"
            title="Görsel Tablo Oluştur"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {tables.length === 0 ? (
            <div className="text-xs text-slate-500 p-2 text-center">
              Tablo bulunamadı. '+' butonuna basarak yeni tablo oluşturun.
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
              className="p-1.5 rounded-md hover:bg-[#282828] text-slate-400 hover:text-white cursor-pointer"
              title="Yenile"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {rows.length > 0 && (
              <button
                onClick={() => {
                  const headers = Object.keys(rows[0]).join(",");
                  const csvRows = rows.map((r) =>
                    Object.values(r)
                      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
                      .join(",")
                  );
                  const csvContent = "data:text/csv;charset=utf-8," + [headers, ...csvRows].join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", `${selectedTable}_export.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-2.5 py-1 rounded-md bg-[#242424] border border-[#333] hover:bg-[#2e2e2e] text-slate-300 font-mono text-[11px] cursor-pointer"
              >
                CSV İndir
              </button>
            )}

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1 px-3 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Görsel Tablo Ekle
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
              <span>Bu tabloda henüz kayıt yok.</span>
            </div>
          ) : (
            <div className="rounded-xl border border-[#282828] overflow-hidden bg-[#171717]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#1f1f1f] text-slate-400 border-b border-[#282828] uppercase text-[10px]">
                  <tr>
                    {colNames.map((col) => (
                      <th key={col} className="px-4 py-3 font-semibold">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282828]">
                  {rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#1f1f1f]/50 transition">
                      {colNames.map((col) => (
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

      {/* Visual Table Creator Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-[#171717] rounded-xl border border-[#282828] p-6 text-slate-200 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-[#282828] text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Görsel Tablo Oluşturucu</h3>
            <p className="text-xs text-slate-400 mb-4">SQL yazmadan veritabanında yeni tablo ve sütun ekleyin.</p>

            <form onSubmit={handleCreateTableSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Tablo Adı</label>
                <input
                  type="text"
                  required
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="Örn: products, posts, orders"
                  className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-emerald-400 font-mono outline-none focus:border-emerald-500"
                />
              </div>

              {/* Column Definitions List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
                  <span>Sütun Tanımları</span>
                  <button
                    type="button"
                    onClick={handleAddColumnDef}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                  >
                    <Plus className="w-3 h-3" /> Sütun Ekle
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {columns.map((col, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-[#121212] border border-[#282828]">
                      <input
                        type="text"
                        placeholder="Sütun adı"
                        value={col.name}
                        onChange={(e) => {
                          const updated = [...columns];
                          updated[idx].name = e.target.value;
                          setColumns(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded bg-[#171717] border border-[#282828] text-white font-mono outline-none"
                      />

                      <select
                        value={col.type}
                        onChange={(e) => {
                          const updated = [...columns];
                          updated[idx].type = e.target.value;
                          setColumns(updated);
                        }}
                        className="px-2.5 py-1.5 rounded bg-[#171717] border border-[#282828] text-emerald-400 font-mono outline-none"
                      >
                        <option value="uuid">uuid</option>
                        <option value="text">text</option>
                        <option value="integer">integer</option>
                        <option value="numeric">numeric</option>
                        <option value="boolean">boolean</option>
                        <option value="timestamp with time zone">timestamp</option>
                        <option value="vector(3)">vector (AI)</option>
                      </select>

                      <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={col.isPrimaryKey}
                          onChange={(e) => {
                            const updated = [...columns];
                            updated[idx].isPrimaryKey = e.target.checked;
                            setColumns(updated);
                          }}
                        />
                        PK
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveColumnDef(idx)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Tabloyu Veritabanına Oluştur
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
