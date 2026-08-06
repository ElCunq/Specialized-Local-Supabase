"use client";

import React, { useState, useEffect } from "react";
import { Tenant } from "@/db/schema";
import {
  Database,
  Search,
  Plus,
  RefreshCw,
  Loader2,
  Table as TableIcon,
  Shield,
  Key,
  Puzzle,
  ChevronDown,
  Columns,
  Hash,
  Type,
  Calendar,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StudioDatabaseProps {
  project: Tenant;
  activeSubMenu: string;
}

export const StudioDatabase: React.FC<StudioDatabaseProps> = ({ project, activeSubMenu }) => {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadSchema = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/schema/${project.slug}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.tables)) {
        setTables(data.tables);
      }
    } catch (e) {
      console.error("Error fetching schema", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubMenu === "tables") {
      loadSchema();
    }
  }, [project.slug, activeSubMenu]);

  const filteredTables = tables.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-full bg-[#1c1c1c] text-[#ededed] font-sans select-none overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 bg-[#1c1c1c] overflow-hidden relative">
        
        {activeSubMenu === "tables" && (
          <>
            {/* Top Control Bar */}
            <div className="p-4 border-b border-[#2e2e2e] flex flex-wrap items-center justify-between gap-3 bg-[#1c1c1c]">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-medium text-[#ededed] tracking-tight">Database Tables</h2>
                <span className="text-xs text-slate-500 font-mono">schema: public</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex items-center bg-[#242424] border border-[#3e3e3e] rounded-md overflow-hidden text-sm">
                  <div className="relative flex items-center px-2">
                    <Search className="w-4 h-4 text-slate-500 mr-2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tables..."
                      className="bg-transparent text-[#ededed] placeholder-slate-500 outline-none w-48 py-1.5"
                    />
                  </div>
                </div>

                <Button variant="emerald" size="sm" className="flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  New Table
                </Button>

                <button
                  onClick={loadSchema}
                  className="p-2 rounded-md bg-[#242424] border border-[#3e3e3e] text-slate-400 hover:text-white transition"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tables Grid */}
            <div className="flex-1 overflow-auto bg-[#1c1c1c] p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
                  <Loader2 className="w-5 h-5 animate-spin mr-2 text-brand" />
                  Loading tables...
                </div>
              ) : filteredTables.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="p-8 border border-dashed border-[#3e3e3e] rounded-xl text-center flex flex-col items-center justify-center space-y-3 max-w-sm">
                    <div className="p-3 rounded-full bg-brand/10 text-brand border border-brand/20">
                      <TableIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[#ededed]">No tables found</h4>
                      <p className="text-sm text-slate-400 mt-1">Create a new table to store data in your project.</p>
                    </div>
                    <Button variant="emerald" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      New table
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 max-w-5xl mx-auto">
                  {filteredTables.map((table) => (
                    <div key={table.name} className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg overflow-hidden">
                      <div className="bg-[#242424] px-4 py-3 flex items-center justify-between border-b border-[#2e2e2e]">
                        <div className="flex items-center gap-2">
                          <TableIcon className="w-4 h-4 text-[#8b8b8b]" />
                          <h3 className="font-mono text-sm font-medium text-[#ededed]">{table.name}</h3>
                          <Badge variant="outline" className="text-xs bg-[#1c1c1c] text-[#8b8b8b] border-[#3e3e3e]">
                            {table.columns?.length || 0} columns
                          </Badge>
                        </div>
                        <button className="text-[#8b8b8b] hover:text-[#ededed]">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                      <table className="w-full text-left text-sm font-sans select-text">
                        <thead className="bg-[#1c1c1c] text-[#8b8b8b] border-b border-[#2e2e2e] text-xs">
                          <tr>
                            <th className="p-3 font-normal w-1/4">Name</th>
                            <th className="p-3 font-normal w-1/4">Type</th>
                            <th className="p-3 font-normal w-1/4">Default</th>
                            <th className="p-3 font-normal">Primary Key</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2e2e2e]">
                          {table.columns?.map((col: any) => (
                            <tr key={col.name} className="hover:bg-[#242424] transition">
                              <td className="p-3 font-mono text-xs text-[#ededed] flex items-center gap-2">
                                {col.type === "uuid" || col.type === "integer" ? (
                                  <Hash className="w-3.5 h-3.5 text-brand" />
                                ) : col.type.includes("timestamp") ? (
                                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                                ) : (
                                  <Type className="w-3.5 h-3.5 text-amber-400" />
                                )}
                                {col.name}
                              </td>
                              <td className="p-3 font-mono text-xs text-[#8b8b8b]">{col.type}</td>
                              <td className="p-3 font-mono text-xs text-[#8b8b8b]">
                                {col.default_value ? <span className="bg-[#2a2a2a] px-1.5 py-0.5 rounded text-[#a1a1a1]">{col.default_value}</span> : "-"}
                              </td>
                              <td className="p-3">
                                {col.is_primary_key ? <Key className="w-3.5 h-3.5 text-amber-500" /> : null}
                              </td>
                            </tr>
                          ))}
                          {(!table.columns || table.columns.length === 0) && (
                            <tr>
                              <td colSpan={4} className="p-4 text-center text-xs text-slate-500">
                                No columns found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeSubMenu === "roles" && (
          <div className="p-8 w-full max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-medium text-[#ededed] mb-1">Database Roles</h2>
              <p className="text-sm text-[#8b8b8b]">Manage database roles and permissions.</p>
            </div>
            
            <div className="border border-[#2e2e2e] rounded-md bg-[#1c1c1c] overflow-hidden">
              <table className="w-full text-left text-sm font-sans select-text">
                <thead className="bg-[#1c1c1c] text-[#8b8b8b] border-b border-[#2e2e2e] text-xs">
                  <tr>
                    <th className="p-4 font-normal">Role Name</th>
                    <th className="p-4 font-normal">System</th>
                    <th className="p-4 font-normal">Privileges</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2e2e2e]">
                  {["postgres", "authenticated", "anon", "service_role"].map((role) => (
                    <tr key={role} className="hover:bg-[#242424] transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Shield className="w-4 h-4 text-brand" />
                          <span className="font-mono text-xs text-[#ededed]">{role}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs bg-[#242424] text-[#8b8b8b] border-[#3e3e3e]">Yes</Badge>
                      </td>
                      <td className="p-4 text-xs text-[#8b8b8b]">Superuser, Create Role, Create DB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSubMenu === "policies" && (
          <div className="p-8 w-full max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-[#ededed] mb-1">Row Level Security</h2>
                <p className="text-sm text-[#8b8b8b]">Restrict access to rows in your tables using RLS policies.</p>
              </div>
              <Button variant="emerald" size="sm">New Policy</Button>
            </div>
            
            <div className="border border-[#2e2e2e] rounded-md bg-[#1c1c1c] p-8 text-center space-y-3">
              <Shield className="w-8 h-8 text-[#8b8b8b] mx-auto" />
              <div>
                <h3 className="font-medium text-[#ededed]">No policies found</h3>
                <p className="text-sm text-[#8b8b8b] mt-1">Enable RLS on your tables and create policies to secure your data.</p>
              </div>
            </div>
          </div>
        )}

        {activeSubMenu === "extensions" && (
          <div className="p-8 w-full max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-medium text-[#ededed] mb-1">Database Extensions</h2>
              <p className="text-sm text-[#8b8b8b]">Expand your database capabilities with Postgres extensions.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-[#2e2e2e] rounded-md bg-[#1c1c1c] p-5 hover:border-[#4e4e4e] transition cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-[#242424] flex items-center justify-center">
                      <Puzzle className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#ededed]">pgvector</h3>
                      <p className="text-xs text-[#8b8b8b] mt-0.5">Open-source vector similarity search for Postgres</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs bg-[#242424] text-[#8b8b8b] border-[#3e3e3e]">Off</Badge>
                </div>
              </div>

              <div className="border border-brand/30 rounded-md bg-brand/5 p-5 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-brand/10 flex items-center justify-center">
                      <Puzzle className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#ededed]">uuid-ossp</h3>
                      <p className="text-xs text-[#8b8b8b] mt-0.5">Generate universally unique identifiers (UUIDs)</p>
                    </div>
                  </div>
                  <Badge variant="success" className="bg-brand/10 text-brand border-none text-xs">Active</Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
