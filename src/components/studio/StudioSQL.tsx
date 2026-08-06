"use client";

import React, { useState, useRef } from "react";
import { Tenant } from "@/db/schema";
import { Play, TerminalSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";

interface StudioSQLProps {
  project: Tenant;
}

export default function StudioSQL({ project }: StudioSQLProps) {
  const [query, setQuery] = useState("SELECT * FROM pg_stat_activity LIMIT 10;");
  const [results, setResults] = useState<any[] | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [rawOutput, setRawOutput] = useState<string | null>(null);

  const handleRunQuery = async () => {
    setIsRunning(true);
    setError(null);
    setResults(null);
    setColumns([]);
    setRawOutput(null);

    try {
      const res = await fetch(`/api/database/${project.slug}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to execute query");
      }

      const resData = data.data;
      if (Array.isArray(resData)) {
        setResults(resData);
        if (resData.length > 0) {
          setColumns(Object.keys(resData[0]));
        }
      } else if (resData?.raw) {
        setRawOutput(resData.raw);
      } else {
        setRawOutput("Query executed successfully (no rows returned).");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1c1c1c] text-[#ededed] overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e2e2e] bg-[#1c1c1c]">
        <div className="flex items-center gap-3">
          <TerminalSquare className="w-5 h-5 text-brand" />
          <h1 className="text-lg font-normal">SQL Editor</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRunQuery}
            disabled={isRunning || !query.trim()}
            variant="emerald"
            className="h-9 px-4 text-sm"
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? "Running..." : "Run"}
          </Button>
        </div>
      </div>

      {/* Main Content: Split View */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Editor Pane (Top Half) */}
        <div className="h-1/2 border-b border-[#2e2e2e] relative">
          <Editor
            height="100%"
            language="pgsql"
            theme="vs-dark"
            value={query}
            onChange={(value) => setQuery(value || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              padding: { top: 16, bottom: 16 },
              lineNumbers: "on",
              renderLineHighlight: "all",
            }}
            loading={<div className="p-4 text-sm text-[#8b8b8b]">Loading Editor...</div>}
          />
        </div>

        {/* Results Pane (Bottom Half) */}
        <div className="h-1/2 bg-[#181818] overflow-auto flex flex-col">
          <div className="px-4 py-2 border-b border-[#2e2e2e] bg-[#1c1c1c] sticky top-0 z-10 flex items-center justify-between">
            <span className="text-xs font-medium text-[#8b8b8b] uppercase tracking-wider">Results</span>
            {results && <span className="text-xs text-[#8b8b8b]">{results.length} rows</span>}
          </div>
          
          <div className="flex-1 p-4 overflow-auto">
            {error ? (
              <div className="flex flex-col gap-2 p-4 border border-rose-500/20 bg-rose-500/10 rounded-md text-rose-400">
                <div className="flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4" />
                  Execution Error
                </div>
                <pre className="text-sm font-mono whitespace-pre-wrap">{error}</pre>
              </div>
            ) : results ? (
              results.length > 0 ? (
                <div className="rounded-md border border-[#2e2e2e] overflow-hidden overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-[#8b8b8b] bg-[#242424] border-b border-[#2e2e2e]">
                      <tr>
                        {columns.map((col) => (
                          <th key={col} className="px-4 py-3 font-medium truncate max-w-[200px]" title={col}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2e2e2e]">
                      {results.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#242424]/50 transition-colors">
                          {columns.map((col) => {
                            const val = row[col];
                            return (
                              <td key={col} className="px-4 py-2 font-mono text-[#ededed] whitespace-nowrap truncate max-w-[300px]">
                                {val === null ? (
                                  <span className="text-[#8b8b8b] italic">null</span>
                                ) : typeof val === "object" ? (
                                  JSON.stringify(val)
                                ) : (
                                  String(val)
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-sm text-[#8b8b8b] p-4 text-center">No rows returned.</div>
              )
            ) : rawOutput ? (
              <pre className="text-sm font-mono text-[#ededed] bg-[#242424] p-4 rounded-md border border-[#2e2e2e] whitespace-pre-wrap">
                {rawOutput}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[#5e5e5e]">
                Write your query and hit Run to see results here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
