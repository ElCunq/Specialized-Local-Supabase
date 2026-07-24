"use client";

import React, { useState } from "react";
import { X, Database, Terminal, Play, RefreshCw } from "lucide-react";

interface TableExplorerModalProps {
  isOpen: boolean;
  slug: string | null;
  onClose: () => void;
}

export const TableExplorerModal: React.FC<TableExplorerModalProps> = ({
  isOpen,
  slug,
  onClose,
}) => {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState("/");

  if (!isOpen || !slug) return null;

  const fetchOpenApiSchema = async () => {
    setLoading(true);
    setResponse(null);
    try {
      // Calls postgrest endpoint through Traefik Gateway or direct proxy
      const targetUrl = `https://db.orfa.dev/p/${slug}${path}`;
      const res = await fetch(targetUrl, {
        headers: {
          Accept: "application/json",
          "X-Project-ID": slug,
        },
      });
      const text = await res.text();
      try {
        setResponse(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setResponse(text);
      }
    } catch (e: any) {
      setResponse(`Error fetching PostgREST API: ${e.message}\nEnsure Traefik & PostgREST are running on db.orfa.dev.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl glass-modal rounded-2xl border border-slate-800 p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">PostgREST Data & Schema Inspector</h2>
            <p className="text-xs font-mono text-emerald-400">Project: /p/{slug}</p>
          </div>
        </div>

        {/* Quick Query Bar */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 flex items-center px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs text-slate-300">
            <span className="text-blue-400 mr-2">GET</span>
            <span className="text-slate-500 mr-1">https://db.orfa.dev/p/{slug}</span>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/"
              className="flex-1 bg-transparent text-white font-mono outline-none"
            />
          </div>

          <button
            onClick={fetchOpenApiSchema}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shadow-md shadow-blue-600/20"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Test Request
          </button>
        </div>

        {/* Response Viewer */}
        <div className="flex-1 bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs overflow-auto text-emerald-300 max-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-slate-500">
              PostgREST Endpoint sorgulanıyor...
            </div>
          ) : response ? (
            <pre className="whitespace-pre-wrap leading-relaxed">{response}</pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500 gap-2">
              <Database className="w-8 h-8 opacity-40" />
              <span>PostgREST OpenAPI şemasını ve tabloları çekmek için 'Test Request' butonuna basın.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
