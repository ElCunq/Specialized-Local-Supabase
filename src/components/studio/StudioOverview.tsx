"use client";

import React, { useState } from "react";
import { Tenant } from "@/db/schema";
import {
  Copy,
  Check,
  Activity,
  Cpu,
  GitBranch,
  Database,
  Code,
  Key,
  Layers,
  ArrowRight,
  ShieldCheck,
  Server,
  Zap,
} from "lucide-react";

interface StudioOverviewProps {
  project: Tenant;
  onTabChange: (tab: any) => void;
}

export const StudioOverview: React.FC<StudioOverviewProps> = ({
  project,
  onTabChange,
}) => {
  const [copied, setCopied] = useState(false);
  const domain = typeof window !== "undefined" ? window.location.host : "localhost:3000";
  const protocol = typeof window !== "undefined" ? window.location.protocol : "http:";
  const apiUrl = `${protocol}//${domain}/p/${project.slug}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(apiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#121212] min-h-full text-slate-200">
      {/* Top Hero Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono text-slate-400">{apiUrl}</span>
            <button
              onClick={copyUrl}
              className="p-1 rounded text-slate-500 hover:text-white transition"
              title="Kopyala"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 6 Status Cards & Topology Node */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 6 Micro Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {/* Status */}
          <div className="p-4 rounded-xl bg-[#171717] border border-[#282828] flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">STATUS</div>
              <div className="text-xs font-bold text-white">Healthy</div>
            </div>
          </div>

          {/* Compute */}
          <div className="p-4 rounded-xl bg-[#171717] border border-[#282828] flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">COMPUTE</div>
              <div className="text-xs font-bold text-white">NANO (POD)</div>
            </div>
          </div>

          {/* GitHub */}
          <div className="p-4 rounded-xl bg-[#171717] border border-[#282828] flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">GITHUB</div>
              <div className="text-xs font-medium text-slate-400">No repository connected</div>
            </div>
          </div>

          {/* Recent Branch */}
          <div className="p-4 rounded-xl bg-[#171717] border border-[#282828] flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-800 text-slate-300">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">RECENT BRANCH</div>
              <div className="text-xs font-medium text-slate-400">main</div>
            </div>
          </div>

          {/* Last Migration */}
          <div className="p-4 rounded-xl bg-[#171717] border border-[#282828] flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-800 text-slate-300">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">LAST MIGRATION</div>
              <div className="text-xs font-medium text-slate-400">Drizzle AutoMigrate</div>
            </div>
          </div>

          {/* Last Backup */}
          <div className="p-4 rounded-xl bg-[#171717] border border-[#282828] flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-800 text-slate-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">LAST BACKUP</div>
              <div className="text-xs font-medium text-slate-400">Automated Daily</div>
            </div>
          </div>
        </div>

        {/* Right Topology Node Card */}
        <div className="p-6 rounded-xl bg-[#171717] border border-[#282828] flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Primary Database Node</h4>
                <p className="text-xs text-slate-400">West EU (Local Pod) • PostgreSQL 15</p>
              </div>
            </div>
            <span className="text-lg">🇮🇪</span>
          </div>

          <div className="mt-6 pt-4 border-t border-[#282828] flex items-center justify-between text-xs font-mono text-slate-400">
            <div>CPU: <span className="text-emerald-400">0.2%</span></div>
            <div>RAM: <span className="text-blue-400">24.5 MB</span></div>
            <div>CONNS: <span className="text-amber-400">5/60</span></div>
          </div>
        </div>
      </div>

      {/* Get Connected Section */}
      <div>
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          Get connected
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div
            onClick={() => onTabChange("settings")}
            className="p-4 rounded-xl bg-[#171717] border border-[#282828] hover:border-emerald-500/40 cursor-pointer transition flex flex-col items-center text-center group"
          >
            <Code className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Framework</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Use a client library</div>
          </div>

          <div
            onClick={() => onTabChange("editor")}
            className="p-4 rounded-xl bg-[#171717] border border-[#282828] hover:border-emerald-500/40 cursor-pointer transition flex flex-col items-center text-center group"
          >
            <Server className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Server</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Build APIs</div>
          </div>

          <div
            onClick={() => onTabChange("settings")}
            className="p-4 rounded-xl bg-[#171717] border border-[#282828] hover:border-emerald-500/40 cursor-pointer transition flex flex-col items-center text-center group"
          >
            <Database className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Direct</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Connection string</div>
          </div>

          <div
            onClick={() => onTabChange("sql")}
            className="p-4 rounded-xl bg-[#171717] border border-[#282828] hover:border-emerald-500/40 cursor-pointer transition flex flex-col items-center text-center group"
          >
            <Layers className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">ORM</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Third-party library</div>
          </div>

          <div
            onClick={() => onTabChange("sql")}
            className="p-4 rounded-xl bg-[#171717] border border-[#282828] hover:border-emerald-500/40 cursor-pointer transition flex flex-col items-center text-center group"
          >
            <Activity className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">MCP</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Connect your agent</div>
          </div>

          <div
            onClick={() => onTabChange("settings")}
            className="p-4 rounded-xl bg-[#171717] border border-[#282828] hover:border-emerald-500/40 cursor-pointer transition flex flex-col items-center text-center group"
          >
            <Key className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">API Keys</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Manage project keys</div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-slate-400 font-mono">
            <span className="text-white font-bold text-sm mr-2">4 Total Requests</span>
            <span className="text-emerald-400 font-bold">100.0% Success Rate</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-[#171717] border border-[#282828] space-y-2">
            <div className="text-[11px] font-bold uppercase text-slate-400">POSTGRES</div>
            <div className="text-lg font-mono font-bold text-white">4</div>
            <div className="h-1 bg-emerald-500 rounded-full" />
          </div>

          <div className="p-4 rounded-xl bg-[#171717] border border-[#282828] space-y-2">
            <div className="text-[11px] font-bold uppercase text-slate-400">EDGE FUNCTIONS</div>
            <div className="text-lg font-mono font-bold text-slate-500">0</div>
            <div className="h-1 bg-slate-800 rounded-full" />
          </div>

          <div className="p-4 rounded-xl bg-[#171717] border border-[#282828] space-y-2">
            <div className="text-[11px] font-bold uppercase text-slate-400">AUTH</div>
            <div className="text-lg font-mono font-bold text-slate-500">0</div>
            <div className="h-1 bg-slate-800 rounded-full" />
          </div>

          <div className="p-4 rounded-xl bg-[#171717] border border-[#282828] space-y-2">
            <div className="text-[11px] font-bold uppercase text-slate-400">STORAGE</div>
            <div className="text-lg font-mono font-bold text-slate-500">0</div>
            <div className="h-1 bg-slate-800 rounded-full" />
          </div>

          <div className="p-4 rounded-xl bg-[#171717] border border-[#282828] space-y-2">
            <div className="text-[11px] font-bold uppercase text-slate-400">REALTIME</div>
            <div className="text-lg font-mono font-bold text-slate-500">0</div>
            <div className="h-1 bg-slate-800 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
