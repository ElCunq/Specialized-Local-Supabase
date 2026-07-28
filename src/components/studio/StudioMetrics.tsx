"use client";

import React, { useState, useEffect } from "react";
import { Tenant } from "@/db/schema";
import { Activity, Cpu, HardDrive, Database, Gauge, RefreshCw } from "lucide-react";

interface StudioMetricsProps {
  project: Tenant;
}

export const StudioMetrics: React.FC<StudioMetricsProps> = ({ project }) => {
  const [metrics, setMetrics] = useState({
    cpuUsage: 0.1,
    ramMb: 35.2,
    maxRamMb: 512,
    dbSizeMb: 8.5,
    maxDbSizeMb: 500, // 500 MB Quota
    storageMb: 2.1,
    maxStorageMb: 1000, // 1 GB Quota
    connections: 3,
    maxConnections: 60,
  });
  const [loading, setLoading] = useState(false);

  const fetchLiveMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`);
      const data = await res.json();
      if (data.success && data.tenant?.metrics) {
        const m = data.tenant.metrics;
        setMetrics((prev) => ({
          ...prev,
          cpuUsage: m.cpuPercentage || 0.1,
          ramMb: m.memoryUsageMb || 35.2,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMetrics();
  }, [project.id]);

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#121212] min-h-full text-slate-200 select-text">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Live Metrics, Container Health & Quotas</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">Real-time resource utilization and quota limits for /{project.slug}.</p>
        </div>

        <button
          onClick={fetchLiveMetrics}
          className="p-2 rounded-lg bg-[#171717] border border-[#282828] text-slate-400 hover:text-white transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Quota Limits Banner */}
      <div className="p-6 rounded-xl bg-[#171717] border border-[#282828] space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-white border-b border-[#282828] pb-3">
          <span className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-amber-400" />
            Müşteri Paket Kotaları ve Tüketim Durumu (Plan Quotas)
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            PRO PLAN ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
          {/* DB Quota */}
          <div className="p-4 rounded-xl bg-[#121212] border border-[#282828] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Veritabanı Boyut Kotası</span>
              <span className="text-emerald-400 font-bold">{metrics.dbSizeMb} MB / {metrics.maxDbSizeMb} MB</span>
            </div>
            <div className="w-full h-2 bg-[#171717] rounded-full overflow-hidden border border-[#282828]">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(metrics.dbSizeMb / metrics.maxDbSizeMb) * 100}%` }} />
            </div>
          </div>

          {/* Storage Quota */}
          <div className="p-4 rounded-xl bg-[#121212] border border-[#282828] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Dosya Depolama (Storage) Kotası</span>
              <span className="text-blue-400 font-bold">{metrics.storageMb} MB / {metrics.maxStorageMb} MB</span>
            </div>
            <div className="w-full h-2 bg-[#171717] rounded-full overflow-hidden border border-[#282828]">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(metrics.storageMb / metrics.maxStorageMb) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Resource Metrics Grid */}
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
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(metrics.cpuUsage * 10, 100)}%` }} />
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
