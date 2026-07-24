"use client";

import React, { useState, useEffect } from "react";
import { Tenant } from "@/db/schema";
import { Activity, Cpu, HardDrive, Database, RefreshCw, Terminal } from "lucide-react";

interface StudioMetricsProps {
  project: Tenant;
}

export const StudioMetrics: React.FC<StudioMetricsProps> = ({ project }) => {
  const [metrics, setMetrics] = useState({
    cpuUsage: 0.2,
    ramMb: 24.5,
    maxRamMb: 512,
    connections: 5,
    maxConnections: 60,
  });

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#121212] min-h-full text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Live Metrics & Container Health</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">Real-time resource utilization and query logs for /{project.slug}.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CPU */}
        <div className="p-6 rounded-xl bg-[#171717] border border-[#282828] space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Pod CPU Usage
            </span>
            <span className="font-mono text-emerald-400 font-bold">{metrics.cpuUsage}%</span>
          </div>
          <div className="w-full h-2 bg-[#121212] rounded-full overflow-hidden border border-[#282828]">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${metrics.cpuUsage * 10}%` }} />
          </div>
        </div>

        {/* RAM */}
        <div className="p-6 rounded-xl bg-[#171717] border border-[#282828] space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-400" />
              Memory (RAM)
            </span>
            <span className="font-mono text-blue-400 font-bold">{metrics.ramMb} MB / {metrics.maxRamMb} MB</span>
          </div>
          <div className="w-full h-2 bg-[#121212] rounded-full overflow-hidden border border-[#282828]">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(metrics.ramMb / metrics.maxRamMb) * 100}%` }} />
          </div>
        </div>

        {/* PostgreSQL Connections */}
        <div className="p-6 rounded-xl bg-[#171717] border border-[#282828] space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              Active DB Connections
            </span>
            <span className="font-mono text-amber-400 font-bold">{metrics.connections} / {metrics.maxConnections}</span>
          </div>
          <div className="w-full h-2 bg-[#121212] rounded-full overflow-hidden border border-[#282828]">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(metrics.connections / metrics.maxConnections) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
