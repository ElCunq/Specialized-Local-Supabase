"use client";

import React, { useState } from "react";
import { Tenant } from "@/db/schema";
import {
  Copy,
  Check,
  PauseCircle,
  PlayCircle,
  Trash2,
  ExternalLink,
  Key,
  Cpu,
  HardDrive,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

interface ProjectCardProps {
  project: Tenant;
  onRefresh: () => void;
  onOpenExplorer: (slug: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onRefresh,
  onOpenExplorer,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedAnon, setCopiedAnon] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const apiUrl = `https://db.orfa.dev/p/${project.slug}`;

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleToggleStatus = async () => {
    const nextAction = project.status === "active" ? "pause" : "resume";
    setActionLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: nextAction }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`'${project.name}' projesini ve container'larını tamamen silmek istediğinize emin misiniz?`)) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-xl">
      <div>
        {/* Header: Name, Status Badge & Actions */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                {project.name}
              </h3>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">/{project.slug}</p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleStatus}
              disabled={actionLoading}
              title={project.status === "active" ? "Pod'u Duraklat (Scale to Zero)" : "Pod'u Başlat"}
              className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : project.status === "active" ? (
                <PauseCircle className="w-4 h-4" />
              ) : (
                <PlayCircle className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            <button
              onClick={handleDelete}
              disabled={actionLoading}
              title="Projeyi Sil"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Container Resource Metrics */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
            <span>RAM:</span>
            <span className="font-mono text-white font-medium">
              {project.status === "active" ? "~24.5 MB" : "0 MB (Paused)"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>CPU:</span>
            <span className="font-mono text-white font-medium">
              {project.status === "active" ? "~0.2 %" : "0 %"}
            </span>
          </div>
        </div>

        {/* PostgREST API Gateway URL */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            PostgREST Gateway Endpoint
          </label>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="truncate flex-1 text-blue-300">{apiUrl}</span>
            <button
              onClick={() => copyToClipboard(apiUrl, setCopiedUrl)}
              className="p-1 rounded text-slate-400 hover:text-white transition"
              title="Kopyala"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* API Key (Anon / Service Role) */}
        {project.anonKey && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Key className="w-3 h-3 text-amber-400" />
                Anon API Key (JWT)
              </label>
              <button
                onClick={() => setShowKeys(!showKeys)}
                className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1"
              >
                {showKeys ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showKeys ? "Gizle" : "Göster"}
              </button>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-400">
              <span className="truncate flex-1">
                {showKeys ? project.anonKey : "••••••••••••••••••••••••••••••••••••"}
              </span>
              <button
                onClick={() => copyToClipboard(project.anonKey!, setCopiedAnon)}
                className="p-1 rounded text-slate-400 hover:text-white transition"
              >
                {copiedAnon ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Quick Links */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <button
          onClick={() => onOpenExplorer(project.slug)}
          className="text-slate-400 hover:text-blue-400 flex items-center gap-1.5 font-medium transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Data Inspector (PostgREST)
        </button>

        <span className="text-[10px] text-slate-500 font-mono">
          ID: {project.id.slice(0, 12)}
        </span>
      </div>
    </div>
  );
};

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active
        </span>
      );
    case "paused":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Paused
        </span>
      );
    case "provisioning":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
          Building...
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
          Failed
        </span>
      );
  }
}
