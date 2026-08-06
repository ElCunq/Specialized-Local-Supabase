"use client";

import React, { useState } from "react";
import { Tenant } from "@/db/schema";
import { Play, Terminal, Plus, Trash2, Code2, Clock, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StudioSqlEditorProps {
  project: Tenant;
}

interface SavedQuery {
  id: string;
  name: string;
  sql: string;
}

export const StudioSqlEditor: React.FC<StudioSqlEditorProps> = ({ project }) => {
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([
    {
      id: "q1",
      name: "Create Todos Table",
      sql: `CREATE TABLE IF NOT EXISTS public.todos (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  title text NOT NULL,\n  is_completed boolean DEFAULT false,\n  created_at timestamp with time zone DEFAULT now()\n);`,
    },
    {
      id: "q2",
      name: "Enable RLS & Add Policy",
      sql: `ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;\n\nCREATE POLICY "Allow public read access" ON public.todos\nFOR SELECT USING (true);`,
    },
    {
      id: "q3",
      name: "Enable pgvector Extension",
      sql: `CREATE EXTENSION IF NOT EXISTS vector;`,
    },
    {
      id: "q4",
      name: "List All Tables",
      sql: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`,
    },
  ]);

  const [activeQueryId, setActiveQueryId] = useState<string>("q1");
  const [queryText, setQueryText] = useState(savedQueries[0].sql);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const handleSelectQuery = (q: SavedQuery) => {
    setActiveQueryId(q.id);
    setQueryText(q.sql);
  };

  const handleNewQuery = () => {
    const newId = `q_${Date.now()}`;
    const newQ: SavedQuery = {
      id: newId,
      name: `Untitled query ${savedQueries.length + 1}`,
      sql: `-- Write your SQL query here\nSELECT * FROM public.profiles;`,
    };
    setSavedQueries([...savedQueries, newQ]);
    setActiveQueryId(newId);
    setQueryText(newQ.sql);
  };

  const handleDeleteQuery = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedQueries.length <= 1) return;
    const filtered = savedQueries.filter((q) => q.id !== id);
    setSavedQueries(filtered);
    if (activeQueryId === id) {
      setActiveQueryId(filtered[0].id);
      setQueryText(filtered[0].sql);
    }
  };

  const runQuery = async () => {
    setLoading(true);
    setResult(null);
    setExecutionTime(null);
    const startTime = performance.now();

    try {
      const res = await fetch(`/api/schema/${project.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "exec_sql", sql: queryText }),
      });
      const data = await res.json();
      const duration = Math.round(performance.now() - startTime);
      setExecutionTime(duration);

      if (data.success) {
        setResult(data.result || `Success. Query executed in ${duration}ms with 0 returned rows.`);
      } else {
        setResult(`SQL Error: ${data.error}`);
      }
    } catch (e: any) {
      setResult(`SQL Execution Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Line numbers calculation for Monaco-like feel
  const lineNumbers = queryText.split("\n").map((_, i) => i + 1);

  return (
    <div className="flex h-full min-h-screen bg-[#121212] text-slate-200 font-sans select-none overflow-hidden">
      {/* 1. Left Saved Queries Sidebar */}
      <aside className="w-64 bg-[#171717] border-r border-[#242424] p-3 space-y-3 flex flex-col shrink-0">
        <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>SQL Snippets ({savedQueries.length})</span>
          <button
            onClick={handleNewQuery}
            className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer"
            title="New Query Tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {savedQueries.map((q) => (
            <div
              key={q.id}
              onClick={() => handleSelectQuery(q)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition cursor-pointer group ${
                activeQueryId === q.id
                  ? "bg-[#242424] text-white font-bold border border-[#333]"
                  : "text-slate-400 hover:text-white hover:bg-[#1f1f1f]"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{q.name}</span>
              </div>
              {savedQueries.length > 1 && (
                <button
                  onClick={(e) => handleDeleteQuery(q.id, e)}
                  className="p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* 2. Main Monaco-Style Code Editor & Output */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#121212] overflow-hidden">
        {/* Editor Toolbar */}
        <div className="p-3 border-b border-[#242424] bg-[#171717] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
            <Terminal className="w-4 h-4" />
            <span>PostgreSQL Direct Query Editor</span>
            {executionTime !== null && (
              <Badge variant="success" className="ml-2">
                <Clock className="w-3 h-3 mr-1" />
                {executionTime} ms
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="emerald" size="sm" onClick={runQuery} disabled={loading}>
              <Play className="w-3.5 h-3.5 mr-1.5" />
              {loading ? "Running..." : "Run SQL"}
            </Button>
          </div>
        </div>

        {/* Monaco-Style Code Editor Area */}
        <div className="flex-1 flex bg-[#09090b] border-b border-[#242424] overflow-hidden relative">
          {/* Gutter Line Numbers */}
          <div className="w-12 bg-[#121212] border-r border-[#242424] py-3 text-right pr-3 select-none text-slate-600 font-mono text-xs space-y-1">
            {lineNumbers.map((num) => (
              <div key={num}>{num}</div>
            ))}
          </div>

          {/* Code Textarea */}
          <textarea
            value={queryText}
            onChange={(e) => {
              setQueryText(e.target.value);
              // Update saved query
              setSavedQueries(
                savedQueries.map((q) => (q.id === activeQueryId ? { ...q, sql: e.target.value } : q))
              );
            }}
            className="flex-1 p-3 bg-transparent text-emerald-300 font-mono text-xs outline-none resize-none leading-relaxed select-text"
            placeholder="-- Type your SQL here"
            spellCheck={false}
          />
        </div>

        {/* Output Results Panel */}
        <div className="h-48 bg-[#171717] p-4 font-mono text-xs text-slate-300 overflow-auto select-text">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500 mb-2">
            <span>Query Results / Execution Output</span>
          </div>
          <pre className="whitespace-pre-wrap select-text text-slate-300">
            {result || "Click 'Run SQL' to execute the query."}
          </pre>
        </div>
      </div>
    </div>
  );
};
