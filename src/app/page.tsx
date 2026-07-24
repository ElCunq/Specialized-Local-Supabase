"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { TableExplorerModal } from "@/components/projects/TableExplorerModal";
import { Tenant } from "@/db/schema";
import { Database, Plus, RefreshCw, Server, ShieldCheck, Zap } from "lucide-react";

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
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Header
        onOpenCreateModal={() => setIsCreateOpen(true)}
        activeCount={activeProjectsCount}
        totalCount={projects.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Banner Section */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Self-Hosted BaaS Control Plane
              </h2>
              <p className="text-sm text-slate-400 max-w-xl mt-1 leading-relaxed">
                Supabase Studio ağırlığı olmadan her projenize özel izole Pod'lar (~45MB RAM). 
                Tüm trafik <code className="text-blue-300 font-mono">db.orfa.dev</code> üzerinden Traefik proxy ile yönlendirilir.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <Zap className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-slate-400">Scale to Zero</div>
                  <div className="font-semibold text-white">Destekleniyor</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-slate-400">Auth & Isolation</div>
                  <div className="font-semibold text-white">%100 İzole Pod</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Müşteri / Tenant Pod'ları</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-400">
              {projects.length}
            </span>
          </div>

          <button
            onClick={fetchProjects}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Yenile"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-64 rounded-2xl bg-slate-900/40 border border-slate-800/60 animate-pulse"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 border border-slate-800 text-center flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
              <Database className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Henüz Hiç Proje Yok</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                İlk izole BaaS Pod'unuzu (PostgreSQL + PostgREST) oluşturmak için hemen aşağıdaki butona tıklayın.
              </p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              İlk Projeni Oluştur
            </button>
          </div>
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
