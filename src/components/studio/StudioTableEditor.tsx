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
  Filter,
  ArrowUpDown,
  Download,
  Edit2,
  FileCode,
  Save,
  Columns
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StudioTableEditorProps {
  project: Tenant;
}

export const StudioTableEditor: React.FC<StudioTableEditorProps> = ({ project }) => {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableSchema, setTableSchema] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  // Modals & Drawers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInsertRowDrawer, setShowInsertRowDrawer] = useState(false);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  
  // Inline Editing
  const [editingCell, setEditingCell] = useState<{ rowIdx: number; colName: string } | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  // New Table State
  const [newTableName, setNewTableName] = useState("");
  const [createColumns, setCreateColumns] = useState<
    { name: string; type: string; isPrimaryKey: boolean; isNullable: boolean }[]
  >([
    { name: "id", type: "uuid", isPrimaryKey: true, isNullable: false },
    { name: "created_at", type: "timestamp with time zone", isPrimaryKey: false, isNullable: true },
  ]);
  const [creating, setCreating] = useState(false);

  // New Column State
  const [newColName, setNewColName] = useState("");
  const [newColType, setNewColType] = useState("text");
  const [newColDefault, setNewColDefault] = useState("");
  const [addingCol, setAddingCol] = useState(false);

  // Insert Row State
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});
  const [insertingRow, setInsertingRow] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin + `/p/${project.slug}` : `/p/${project.slug}`;

  const loadSchema = async () => {
    try {
      const res = await fetch(`/api/schema/${project.slug}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.tables)) {
        setTableSchema(data.tables);
        const tableNames = data.tables.map((t: any) => t.name);
        setTables(tableNames);
        if (tableNames.length > 0 && !selectedTable) {
          setSelectedTable(tableNames[0]);
        }
      }
    } catch (e) {
      console.error("Error fetching schema", e);
    }
  };

  useEffect(() => {
    loadSchema();
  }, [project.slug]);

  const fetchTableData = async () => {
    if (!selectedTable) return;
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
  };

  useEffect(() => {
    fetchTableData();
  }, [selectedTable, baseUrl, project.slug]);

  // Insert Row Handler
  const handleInsertRowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;
    setInsertingRow(true);
    try {
      const res = await fetch(`${baseUrl}/${selectedTable}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=representation",
          "X-Project-ID": project.slug,
        },
        body: JSON.stringify(newRowData),
      });
      if (res.ok) {
        setShowInsertRowDrawer(false);
        setNewRowData({});
        await fetchTableData();
      } else {
        const errText = await res.text();
        alert(`Error inserting row: ${errText}`);
      }
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    } finally {
      setInsertingRow(false);
    }
  };

  // Add Column Handler
  const handleAddColumnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable || !newColName) return;
    setAddingCol(true);
    try {
      let sql = `ALTER TABLE public."${selectedTable}" ADD COLUMN "${newColName}" ${newColType}`;
      if (newColDefault) sql += ` DEFAULT ${newColDefault}`;
      sql += `;`;

      const res = await fetch(`/api/schema/${project.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "exec_sql", sql }),
      });
      if (res.ok) {
        setShowAddColumnModal(false);
        setNewColName("");
        setNewColDefault("");
        await loadSchema();
        await fetchTableData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingCol(false);
    }
  };

  // Inline Cell Save Handler
  const handleCellSave = async (row: any, colName: string, newValue: any) => {
    setEditingCell(null);
    if (!selectedTable) return;

    // Find primary key column (default 'id')
    const pkCol = Object.keys(row).find((k) => k === "id" || k === "uuid") || Object.keys(row)[0];
    const pkVal = row[pkCol];

    try {
      const res = await fetch(`${baseUrl}/${selectedTable}?${pkCol}=eq.${pkVal}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Project-ID": project.slug,
        },
        body: JSON.stringify({ [colName]: newValue }),
      });
      if (res.ok) {
        await fetchTableData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Row Handler
  const handleDeleteRow = async (row: any) => {
    if (!confirm("Are you sure you want to delete this row?")) return;
    const pkCol = Object.keys(row).find((k) => k === "id" || k === "uuid") || Object.keys(row)[0];
    const pkVal = row[pkCol];

    try {
      const res = await fetch(`${baseUrl}/${selectedTable}?${pkCol}=eq.${pkVal}`, {
        method: "DELETE",
        headers: { "X-Project-ID": project.slug },
      });
      if (res.ok) {
        await fetchTableData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Table Handler
  const handleCreateTableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName) return;

    setCreating(true);
    try {
      const res = await fetch(`/api/schema/${project.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_table", tableName: newTableName, columns: createColumns }),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewTableName("");
        await loadSchema();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const currentTableObj = tableSchema.find((t) => t.name === selectedTable);
  const colNames: string[] = currentTableObj?.columns?.map((c: any) => String(c.name)) || (rows.length > 0 ? Object.keys(rows[0]) : []);

  const filteredRows = rows.filter((r) => {
    if (!searchFilter) return true;
    return Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(searchFilter.toLowerCase()));
  });

  return (
    <div className="flex h-full min-h-screen bg-[#121212] text-slate-200 font-sans select-none overflow-hidden">
      {/* 1. Left Tables Sidebar */}
      <aside className="w-56 bg-[#171717] border-r border-[#242424] p-3 space-y-3 flex flex-col shrink-0">
        <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>All Tables ({tables.length})</span>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer"
            title="Create New Table"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {tables.length === 0 ? (
            <div className="text-xs text-slate-500 p-4 text-center">
              No tables found. Click '+' to create your first table.
            </div>
          ) : (
            tables.map((tbl) => (
              <button
                key={tbl}
                onClick={() => setSelectedTable(tbl)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition cursor-pointer ${
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
      </aside>

      {/* 2. Main Data Table View */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#121212] overflow-hidden">
        {/* Top Action Toolbar */}
        <div className="p-3 border-b border-[#242424] bg-[#171717] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-emerald-400 font-bold text-sm">
              public.{selectedTable || "schema"}
            </span>
            <Badge variant="secondary">{filteredRows.length} rows</Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Search Input */}
            <div className="relative flex items-center bg-[#121212] border border-[#2e2e2e] rounded-lg px-2 text-xs">
              <Search className="w-3.5 h-3.5 text-slate-500 mr-2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter table data..."
                className="bg-transparent text-white placeholder-slate-500 outline-none w-44 py-1.5 font-mono"
              />
            </div>

            <Button variant="outline" size="sm" onClick={() => setShowAddColumnModal(true)}>
              <Columns className="w-3.5 h-3.5 mr-1" />
              Add column
            </Button>

            <Button variant="emerald" size="sm" onClick={() => setShowInsertRowDrawer(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Insert row
            </Button>

            {rows.length > 0 && (
              <Button
                variant="outline"
                size="sm"
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
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Export CSV
              </Button>
            )}

            <button
              onClick={fetchTableData}
              className="p-2 rounded-lg bg-[#121212] border border-[#282828] text-slate-400 hover:text-white transition cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Data Grid with Double-Click Inline Editing */}
        <div className="flex-1 overflow-auto p-4 select-text">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-500 text-xs font-mono">
              <Loader2 className="w-5 h-5 animate-spin mr-2 text-emerald-400" />
              Fetching table records...
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-xs space-y-3">
              <Database className="w-8 h-8 opacity-40 text-emerald-400" />
              <span>This table is empty. Click 'Insert row' to add data.</span>
              <Button variant="emerald" size="sm" onClick={() => setShowInsertRowDrawer(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Insert row
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-[#242424] overflow-hidden bg-[#171717]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#1c1c1c] text-slate-400 border-b border-[#242424] uppercase text-[10px]">
                  <tr>
                    <th className="p-3 w-10 text-center">#</th>
                    {colNames.map((col: string) => (
                      <th key={col} className="px-4 py-3 font-bold text-white">
                        {col}
                      </th>
                    ))}
                    <th className="p-3 text-right w-16">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242424]">
                  {filteredRows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-[#1f1f1f] transition group">
                      <td className="p-3 text-center text-slate-500 text-[10px]">{rowIdx + 1}</td>

                      {colNames.map((col: string) => {
                        const isEditing = editingCell?.rowIdx === rowIdx && editingCell?.colName === col;
                        const cellValue = row[col];

                        return (
                          <td
                            key={col}
                            onDoubleClick={() => {
                              setEditingCell({ rowIdx, colName: col });
                              setEditingValue(cellValue !== null && cellValue !== undefined ? String(cellValue) : "");
                            }}
                            className="px-4 py-2.5 text-slate-300 truncate max-w-xs cursor-pointer hover:bg-[#242424]/60"
                            title="Double-click to edit cell"
                          >
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCellSave(row, col, editingValue);
                                    if (e.key === "Escape") setEditingCell(null);
                                  }}
                                  className="px-2 py-1 rounded bg-[#09090b] border border-emerald-500 text-white font-mono text-xs w-full outline-none"
                                />
                                <button
                                  onClick={() => handleCellSave(row, col, editingValue)}
                                  className="p-1 rounded bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                                >
                                  <Save className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <span>
                                {typeof cellValue === "object"
                                  ? JSON.stringify(cellValue)
                                  : cellValue === null || cellValue === undefined
                                  ? <span className="text-slate-600 italic">null</span>
                                  : String(cellValue)}
                              </span>
                            )}
                          </td>
                        );
                      })}

                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteRow(row)}
                          className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-[#242424] transition opacity-0 group-hover:opacity-100"
                          title="Delete row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 3. Insert Row Side-Over Drawer */}
      {showInsertRowDrawer && (
        <aside className="w-96 border-l border-[#242424] bg-[#171717] flex flex-col justify-between overflow-y-auto shrink-0 animate-slide-in select-text p-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#242424] mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Insert new row</h3>
                <p className="text-xs text-slate-400">Add a new record to public.{selectedTable}</p>
              </div>
              <button onClick={() => setShowInsertRowDrawer(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInsertRowSubmit} className="space-y-4 text-xs">
              {colNames.map((col) => (
                <div key={col}>
                  <label className="block text-slate-400 mb-1 font-mono">{col}</label>
                  <input
                    type="text"
                    placeholder={`Value for ${col}`}
                    value={newRowData[col] || ""}
                    onChange={(e) => setNewRowData({ ...newRowData, [col]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              ))}

              <Button type="submit" variant="emerald" disabled={insertingRow} className="w-full mt-4 py-2.5">
                {insertingRow ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save row
              </Button>
            </form>
          </div>
        </aside>
      )}

      {/* 4. Add Column Modal */}
      {showAddColumnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-text">
          <div className="w-full max-w-md bg-[#171717] rounded-xl border border-[#282828] p-6 text-slate-200 shadow-2xl relative">
            <button onClick={() => setShowAddColumnModal(false)} className="absolute top-4 right-4 p-1 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Add new column</h3>
            <p className="text-xs text-slate-400 mb-4">Add a new column to table public.{selectedTable}.</p>

            <form onSubmit={handleAddColumnSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Column Name *</label>
                <input
                  type="text"
                  required
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="e.g. status, bio, total_price"
                  className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-emerald-400 font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Data Type</label>
                <select
                  value={newColType}
                  onChange={(e) => setNewColType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-emerald-400 font-mono outline-none"
                >
                  <option value="text">text</option>
                  <option value="integer">integer</option>
                  <option value="numeric">numeric</option>
                  <option value="boolean">boolean</option>
                  <option value="uuid">uuid</option>
                  <option value="timestamp with time zone">timestamp</option>
                  <option value="jsonb">jsonb</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Default Value (Optional)</label>
                <input
                  type="text"
                  value={newColDefault}
                  onChange={(e) => setNewColDefault(e.target.value)}
                  placeholder="e.g. 'active' or 0 or now()"
                  className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-white font-mono outline-none"
                />
              </div>

              <Button type="submit" variant="emerald" disabled={addingCol} className="w-full mt-2 py-2.5">
                {addingCol ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Add Column
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* 5. Create Table Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-text">
          <div className="w-full max-w-xl bg-[#171717] rounded-xl border border-[#282828] p-6 text-slate-200 shadow-2xl relative">
            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 p-1 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Create a new table</h3>
            <p className="text-xs text-slate-400 mb-4">Define a new PostgreSQL table schema without writing raw DDL.</p>

            <form onSubmit={handleCreateTableSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Table Name *</label>
                <input
                  type="text"
                  required
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="e.g. products, customers, orders"
                  className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-emerald-400 font-mono outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
                  <span>Columns</span>
                  <button
                    type="button"
                    onClick={() => setCreateColumns([...createColumns, { name: "", type: "text", isPrimaryKey: false, isNullable: true }])}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add column
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {createColumns.map((col, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-[#121212] border border-[#282828]">
                      <input
                        type="text"
                        placeholder="Column name"
                        value={col.name}
                        onChange={(e) => {
                          const updated = [...createColumns];
                          updated[idx].name = e.target.value;
                          setCreateColumns(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded bg-[#171717] border border-[#282828] text-white font-mono outline-none"
                      />

                      <select
                        value={col.type}
                        onChange={(e) => {
                          const updated = [...createColumns];
                          updated[idx].type = e.target.value;
                          setCreateColumns(updated);
                        }}
                        className="px-2.5 py-1.5 rounded bg-[#171717] border border-[#282828] text-emerald-400 font-mono outline-none"
                      >
                        <option value="uuid">uuid</option>
                        <option value="text">text</option>
                        <option value="integer">integer</option>
                        <option value="numeric">numeric</option>
                        <option value="boolean">boolean</option>
                        <option value="timestamp with time zone">timestamp</option>
                      </select>

                      <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={col.isPrimaryKey}
                          onChange={(e) => {
                            const updated = [...createColumns];
                            updated[idx].isPrimaryKey = e.target.checked;
                            setCreateColumns(updated);
                          }}
                        />
                        PK
                      </label>

                      <button
                        type="button"
                        onClick={() => setCreateColumns(createColumns.filter((_, i) => i !== idx))}
                        className="p-1 rounded text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" variant="emerald" disabled={creating} className="w-full py-2.5">
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Create table
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
