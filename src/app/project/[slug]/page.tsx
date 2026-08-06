"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Tenant } from "@/db/schema";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { StudioSidebar, StudioTab } from "@/components/studio/StudioSidebar";
import { StudioOverview } from "@/components/studio/StudioOverview";
import { StudioTableEditor } from "@/components/studio/StudioTableEditor";
import { StudioSqlEditor } from "@/components/studio/StudioSqlEditor";
import { StudioAuth } from "@/components/studio/StudioAuth";
import { StudioSettings } from "@/components/studio/StudioSettings";
import { StudioStorage } from "@/components/studio/StudioStorage";
import { StudioWebhooks } from "@/components/studio/StudioWebhooks";
import { StudioApiDocs } from "@/components/studio/StudioApiDocs";
import { StudioSchemaDiagram } from "@/components/studio/StudioSchemaDiagram";
import { StudioMetrics } from "@/components/studio/StudioMetrics";
import { Loader2, AlertCircle } from "lucide-react";

export default function ProjectStudioPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [project, setProject] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StudioTab>("overview");

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success && Array.isArray(data.projects)) {
        const found = data.projects.find((p: Tenant) => p.slug === slug);
        if (found) {
          setProject(found);
        } else {
          setError(`Project '${slug}' not found.`);
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProject();
    if (typeof window !== "undefined" && slug) {
      document.cookie = `active_project_slug=${slug}; path=/; max-age=86400`;
    }
  }, [fetchProject, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-slate-400 gap-3 font-mono text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
        <span>Loading Official Supabase Studio for /{slug}...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-6">
        <div className="p-6 rounded-2xl bg-[#171717] border border-[#282828] text-center max-w-md space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Project Not Found</h3>
          <p className="text-xs text-slate-400">{error || "Requested project instance does not exist."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#121212] flex flex-col overflow-hidden select-text">
      {/* Control Plane Top Header */}
      <StudioHeader project={project} />

      {/* Real Official Supabase Studio Embedded Frame */}
      <div className="flex-1 w-full h-full relative bg-[#171717]">
        <iframe
          src={`http://localhost:8083/project/default`}
          className="w-full h-full border-none"
          title={`Supabase Studio - ${project.name}`}
        />
      </div>
    </div>
  );
};
