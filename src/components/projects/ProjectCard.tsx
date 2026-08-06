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
  Server,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  const domain = typeof window !== "undefined" ? window.location.host : "db.orfa.dev";
  const protocol = typeof window !== "undefined" ? window.location.protocol : "https:";
  const apiUrl = `${protocol}//${domain}/p/${project.slug}`;

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
    if (
      !confirm(
        `'${project.name}' projesini ve container'larını tamamen silmek istediğinize emin misiniz?`
      )
    ) {
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
    <Card className="flex flex-col justify-between group hover:border-[#3ecf8e]/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all">
      <div>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#09090b] border border-[#27272a] text-[#3ecf8e]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>{project.name}</CardTitle>
                <StatusBadge status={project.status} />
              </div>
              <CardDescription className="font-mono mt-0.5">/{project.slug}</CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleStatus}
              disabled={actionLoading}
              title={
                project.status === "active"
                  ? "Pod'u Duraklat (Scale to Zero)"
                  : "Pod'u Başlat"
              }
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              ) : project.status === "active" ? (
                <PauseCircle className="w-4 h-4 text-amber-400" />
              ) : (
                <PlayCircle className="w-4 h-4 text-[#3ecf8e]" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={actionLoading}
              title="Projeyi Sil"
            >
              <Trash2 className="w-4 h-4 text-slate-400 hover:text-rose-400" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Resource Usage Stats Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-lg bg-[#09090b] border border-[#27272a] flex items-center gap-2.5">
              <HardDrive className="w-3.5 h-3.5 text-blue-400" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">RAM Kullanımı</div>
                <div className="text-xs font-mono text-white font-bold">
                  {project.status === "active" ? "~35.2 MB" : "0 MB (Pasif)"}
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#09090b] border border-[#27272a] flex items-center gap-2.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">CPU Yükü</div>
                <div className="text-xs font-mono text-white font-bold">
                  {project.status === "active" ? "~0.1 %" : "0 %"}
                </div>
              </div>
            </div>
          </div>

          {/* PostgREST Gateway URL */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              PostgREST Gateway URL
            </label>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#09090b] border border-[#27272a] text-xs font-mono">
              <span className="truncate flex-1 text-[#3ecf8e]">{apiUrl}</span>
              <button
                onClick={() => copyToClipboard(apiUrl, setCopiedUrl)}
                className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
              >
                {copiedUrl ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* API Key Reveal & Copy */}
          {project.anonKey && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Key className="w-3 h-3 text-amber-400" />
                  Anon API Key (JWT)
                </label>
                <button
                  onClick={() => setShowKeys(!showKeys)}
                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
                >
                  {showKeys ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showKeys ? "Gizle" : "Göster"}
                </button>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-[#09090b] border border-[#27272a] text-xs font-mono text-slate-400">
                <span className="truncate flex-1 text-slate-300">
                  {showKeys ? project.anonKey : "••••••••••••••••••••••••••••••••••••••••"}
                </span>
                <button
                  onClick={() => copyToClipboard(project.anonKey!, setCopiedAnon)}
                  className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {copiedAnon ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-[#27272a] pt-4">
          <a href={`/project/${project.slug}`}>
            <Button variant="emerald" size="sm">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Open Supabase Studio
            </Button>
          </a>

          <span className="text-[10px] text-slate-500 font-mono">
            {project.id.slice(0, 8)}
          </span>
        </CardFooter>
      </div>
    </Card>
  );
};

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return <Badge variant="success">Active</Badge>;
    case "paused":
      return <Badge variant="secondary">Paused</Badge>;
    case "provisioning":
      return <Badge variant="outline">Starting...</Badge>;
    default:
      return <Badge variant="destructive">Error</Badge>;
  }
}
