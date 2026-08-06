"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { TableExplorerModal } from "@/components/projects/TableExplorerModal";
import { Tenant } from "@/db/schema";
import { Database, Plus, RefreshCw, Server, ShieldCheck, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [explorerSlug, setExplorerSlug] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (e) {
      console.error("Error loading projects", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(fetchProjects, 10000); // Auto refresh stats every 10s
    return () => clearInterval(interval);
  }, [fetchProjects]);

  const activeProjectsCount = projects.filter((p) => p.status === "active").length;

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 flex flex-col font-sans">
      <Header
        onOpenCreateModal={() => setIsCreateOpen(true)}
        activeCount={activeProjectsCount}
        totalCount={projects.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Banner Section in shadcn/ui Card style */}
        <Card className="bg-gradient-to-r from-[#18181b] via-[#121215] to-[#09090b] border-[#27272a] shadow-xl relative overflow-hidden">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="success">BaaS Control Plane</Badge>
                  <span className="text-xs text-slate-400 font-mono">Docker + Traefik Engine</span>
                </div>
                <CardTitle className="text-2xl font-extrabold tracking-tight">
                  Self-Hosted Multi-Tenant Supabase Pods
                </CardTitle>
                <CardDescription className="max-w-xl mt-1.5 leading-relaxed text-xs">
                  Orijinal Supabase Studio ağırlığı olmadan her projenize özel izole Pod'lar (~35MB RAM). 
                  Tüm HTTP & REST trafiği <code className="text-[#3ecf8e] font-mono">db.orfa.dev</code> üzerinden akmaktadır.
                </CardDescription>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#09090b] border border-[#27272a]">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Scale to Zero</div>
                    <div className="font-bold text-white text-xs">Aktif / Destekleniyor</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#09090b] border border-[#27272a]">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Auth & Isolation</div>
                    <div className="font-bold text-white text-xs">%100 İzole Pod</div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Project Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-[#3ecf8e]" />
            <h3 className="text-base font-bold text-white tracking-tight">Müşteri / Tenant Pod'ları</h3>
            <Badge variant="secondary">{projects.length}</Badge>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={fetchProjects}
            title="Yenile"
          >
            <RefreshCw className="w-4 h-4 text-slate-400 hover:text-white" />
          </Button>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-64 rounded-xl bg-[#18181b]/50 border border-[#27272a] animate-pulse"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#3ecf8e]">
              <Database className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Henüz Hiç Proje Yok</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                İlk izole BaaS Pod'unuzu (PostgreSQL + PostgREST) oluşturmak için hemen aşağıdaki butona tıklayın.
              </p>
            </div>
            <Button
              variant="emerald"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              İlk Projeni Oluştur
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onRefresh={fetchProjects}
                onOpenExplorer={(slug) => setExplorerSlug(slug)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchProjects}
      />

      <TableExplorerModal
        isOpen={!!explorerSlug}
        slug={explorerSlug}
        onClose={() => setExplorerSlug(null)}
      />
    </div>
  );
}
