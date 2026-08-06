"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Tenant } from "@/db/schema";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { StudioSidebar, StudioModule, StudioSubMenu } from "@/components/studio/StudioSidebar";
import { StudioOverview } from "@/components/studio/StudioOverview";
import { StudioTableEditor } from "@/components/studio/StudioTableEditor";
import StudioSQL from "@/components/studio/StudioSQL";
import { StudioDatabase } from "@/components/studio/StudioDatabase";
import { StudioAuth } from "@/components/studio/StudioAuth";
import { StudioSettings } from "@/components/studio/StudioSettings";
import { StudioStorage } from "@/components/studio/StudioStorage";
import { StudioWebhooks } from "@/components/studio/StudioWebhooks";
import { StudioApiDocs } from "@/components/studio/StudioApiDocs";
import { StudioSchemaDiagram } from "@/components/studio/StudioSchemaDiagram";
import { StudioMetrics } from "@/components/studio/StudioMetrics";
import StudioLogs from "@/components/studio/StudioLogs";
import { StudioAddons } from "@/components/studio/StudioAddons";
import { Loader2, AlertCircle } from "lucide-react";

export default function ProjectStudioPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [project, setProject] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<StudioModule>("overview");
  const [activeSubMenu, setActiveSubMenu] = useState<StudioSubMenu>("");

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
  }, [fetchProject]);

  // Set default submenu when module changes
  useEffect(() => {
    if (activeModule === "database") setActiveSubMenu("tables");
    else if (activeModule === "auth") setActiveSubMenu("users");
    else if (activeModule === "settings") setActiveSubMenu("general");
    else setActiveSubMenu("");
  }, [activeModule]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1c1c1c] flex items-center justify-center text-[#8b8b8b] gap-3 font-sans text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-brand" />
        <span>Loading Studio for /{slug}...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#1c1c1c] flex items-center justify-center p-6">
        <div className="p-6 rounded-2xl bg-[#242424] border border-[#2e2e2e] text-center max-w-md space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="text-base font-medium text-[#ededed]">Project Not Found</h3>
          <p className="text-sm text-[#8b8b8b]">{error || "Requested project instance does not exist."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#1c1c1c] flex flex-col overflow-hidden select-text font-sans">
      {/* Top Header */}
      <StudioHeader project={project} />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Dual Sidebar */}
        <StudioSidebar
          activeModule={activeModule}
          activeSubMenu={activeSubMenu}
          onModuleChange={(m) => setActiveModule(m)}
          onSubMenuChange={(s) => setActiveSubMenu(s)}
          slug={slug}
        />

        {/* Dynamic Studio View Content */}
        <main className="flex-1 overflow-y-auto bg-[#1c1c1c]">
          {activeModule === "overview" && (
            <StudioOverview project={project} onTabChange={(t) => setActiveModule(t as StudioModule)} />
          )}

          {activeModule === "editor" && <StudioTableEditor project={project} />}

          {activeModule === "sql" && <StudioSQL project={project} />}

          {activeModule === "database" && <StudioDatabase project={project} activeSubMenu={activeSubMenu} />}

          {activeModule === "auth" && <StudioAuth project={project} activeSubMenu={activeSubMenu} />}

          {activeModule === "storage" && <StudioStorage project={project} />}

          {activeModule === "docs" && <StudioApiDocs project={project} />}
          
          {activeModule === "logs" && <StudioLogs project={project} />}

          {activeModule === "addons" && <StudioAddons project={project} />}

          {activeModule === "settings" && <StudioSettings project={project} activeSubMenu={activeSubMenu} />}
        </main>
      </div>
    </div>
  );
}
