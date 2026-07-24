"use client";

import React, { useState } from "react";
import { Tenant } from "@/db/schema";
import { Play, Code, Check, Terminal, RefreshCw } from "lucide-react";

interface StudioSqlEditorProps {
  project: Tenant;
}

export const StudioSqlEditor: React.FC<StudioSqlEditorProps> = ({ project }) => {
  const [query, setQuery] = useState(
    `-- Sample SQL Query\nCREATE TABLE IF NOT EXISTS public.todos (\n  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,\n  title text NOT NULL,\n  is_completed boolean DEFAULT false,\n  created_at timestamp with time zone DEFAULT now()\n);`
  );
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runQuery = async () => {
    setLoading(true);
    setResult(null);
    try {
      // Executes query against PostgREST or PostgreSQL RPC endpoint
      const res = await fetch(`https://db.orfa.dev/p/${project.slug}/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Project-ID": project.slug,
        },
        body: JSON.stringify({ query }),
      });
      const text = await res.text();
      setResult(text || "Query executed successfully with 0 returned rows.");
    } catch (e: any) {
      setResult(`SQL Execution Error: ${e.message}\nMake sure PostgREST pod is active.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-[#121212] text-slate-200">
      {/* Templates Sidebar */}
      <div className="w-56 bg-[#171717] border-r border-[#282828] p-3 space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
          SQL Templates
        </div>
        <div className="space-y-1 text-xs">
          <button
            onClick={() =>
              setQuery(
                `CREATE TABLE public.todos (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  title text NOT NULL,\n  created_at timestamp DEFAULT now()\n);`
              )
            }
            className="w-full text-left p-2 rounded-lg hover:bg-[#242424] text-slate-300 transition font-mono truncate"
          >
            Create Todos Table
          </button>
          <button
            onClick={() => setQuery(`SELECT * FROM pg_catalog.pg_tables WHERE schemaname = 'public';`)}
            className="w-full text-left p-2 rounded-lg hover:bg-[#242424] text-slate-300 transition font-mono truncate"
          >
            List Public Tables
          </button>
        </div>
      </div>

      {/* Main Editor & Output */}
      <div className="flex-1 flex flex-col p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Terminal className="w-4 h-4" />
            <span>PostgreSQL Query Runner</span>
          </div>

          <button
            onClick={runQuery}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Run SQL
          </button>
        </div>

        {/* Code Input */}
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-56 p-4 rounded-xl bg-[#171717] border border-[#282828] font-mono text-xs text-emerald-300 outline-none focus:border-emerald-500 transition resize-none"
        />

        {/* Output */}
        <div className="flex-1 rounded-xl bg-[#171717] border border-[#282828] p-4 font-mono text-xs text-slate-300 overflow-auto">
          <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Query Output</div>
          <pre className="whitespace-pre-wrap">{result || "Output will appear here after clicking 'Run SQL'."}</pre>
        </div>
      </div>
    </div>
  );
};
