"use client";

import React from "react";
import { Server, Plus, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    <header className="sticky top-0 z-30 w-full bg-[#18181b]/80 backdrop-blur-md border-b border-[#27272a] px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#09090b] border border-[#27272a] p-1 flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <img src="/icon.svg" alt="SupaBase Logo" className="w-full h-full" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight">SupaBase Local</h1>
            <Badge variant="success">Orchestrator v1.0</Badge>
          </div>
          <p className="text-[11px] text-slate-400">
            Lightweight Per-Tenant BaaS Orchestrator (Docker + Traefik)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#09090b] border border-[#27272a] text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>{activeCount} Aktif Pod</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Server className="w-3.5 h-3.5" />
            <span>Toplam {totalCount} Tenant</span>
          </div>
        </div>

        <Button onClick={onOpenCreateModal} variant="emerald" size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Yeni Proje Ekle
        </Button>
      </div>
    </header>
  );
};
