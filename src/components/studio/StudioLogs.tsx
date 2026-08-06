"use client";

import React, { useState, useEffect, useRef } from "react";
import { Tenant } from "@/db/schema";
import { Terminal, RefreshCcw, Database, Shield, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudioLogsProps {
  project: Tenant;
}

type LogService = "db" | "rest" | "meta" | "auth";

export default function StudioLogs({ project }: StudioLogsProps) {
  const [activeService, setActiveService] = useState<LogService>("db");
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/logs/${project.slug}?service=${activeService}`);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch logs");
      }
      setLogs(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, [activeService]);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const services = [
    { id: "db", name: "PostgreSQL", icon: Database },
    { id: "auth", name: "GoTrue (Auth)", icon: Shield },
    { id: "rest", name: "PostgREST (API)", icon: LayoutGrid },
    { id: "meta", name: "Postgres-Meta", icon: Terminal },
  ];

  return (
    <div className="flex flex-col h-full bg-[#1c1c1c] text-[#ededed] overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e2e2e] bg-[#1c1c1c]">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-brand" />
          <h1 className="text-lg font-normal">Log Explorer</h1>
        </div>
        <Button onClick={fetchLogs} variant="outline" size="sm" className="bg-[#242424] border-[#3e3e3e]" disabled={loading}>
          <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Main Content: Split View */}
      <div className="flex flex-1 min-h-0">
        {/* Service Selector (Sidebar) */}
        <div className="w-64 border-r border-[#2e2e2e] bg-[#181818] p-4 space-y-2">
          <h3 className="text-xs font-medium text-[#8b8b8b] uppercase tracking-wider mb-4">Services</h3>
          {services.map((svc) => (
            <button
              key={svc.id}
              onClick={() => setActiveService(svc.id as LogService)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                activeService === svc.id ? "bg-[#242424] text-[#ededed]" : "text-[#8b8b8b] hover:bg-[#242424]/50 hover:text-[#ededed]"
              }`}
            >
              <svc.icon className="w-4 h-4" />
              {svc.name}
            </button>
          ))}
        </div>

        {/* Log Viewer (Main) */}
        <div className="flex-1 flex flex-col bg-[#121212] font-mono text-sm">
          {error ? (
            <div className="p-6 text-rose-400">Error: {error}</div>
          ) : logs.length === 0 && !loading ? (
            <div className="p-6 text-[#5e5e5e]">No logs found for this service.</div>
          ) : (
            <div className="flex-1 overflow-auto p-4 space-y-1">
              {logs.map((line, idx) => (
                <div key={idx} className="break-words">
                  <span className="text-[#8b8b8b] mr-4 select-none">{(idx + 1).toString().padStart(4, "0")}</span>
                  <span className={`${line.toLowerCase().includes("error") ? "text-rose-400" : line.toLowerCase().includes("warn") ? "text-amber-400" : "text-[#d4d4d4]"}`}>
                    {line}
                  </span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
