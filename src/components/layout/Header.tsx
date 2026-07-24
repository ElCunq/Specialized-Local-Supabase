"use client";

import React from "react";
import { Server, Plus, Database, Activity } from "lucide-react";

interface HeaderProps {
  onOpenCreateModal: () => void;
  activeCount: number;
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateModal,
  activeCount,
  totalCount,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#121212] border border-[#282828] p-1 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <img src="/icon.svg" alt="SupaBase Logo" className="w-full h-full" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">db.orfa.dev</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono">
              Control Plane v1.0
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Lightweight Per-Tenant BaaS Orchestrator (Docker + Traefik)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Activity className="w-3.5 h-3.5" />
            <span>{activeCount} Aktif Pod</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Server className="w-3.5 h-3.5" />
            <span>Toplam {totalCount} Tenant</span>
          </div>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Yeni Proje Ekle
        </button>
      </div>
    </header>
  );
};
