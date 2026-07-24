"use client";

import React from "react";
import Link from "next/link";
import {
  Home,
  Table,
  Terminal,
  Database,
  Users,
  HardDrive,
  Settings,
  ArrowLeft,
  Webhook,
  BookOpen,
  Activity,
  Layers,
} from "lucide-react";

export type StudioTab =
  | "overview"
  | "editor"
  | "sql"
  | "database"
  | "auth"
  | "storage"
  | "webhooks"
  | "docs"
  | "metrics"
  | "settings";

interface StudioSidebarProps {
  activeTab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
  slug: string;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  activeTab,
  onTabChange,
  slug,
}) => {
  const navItems: { id: StudioTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Project Overview", icon: <Home className="w-4 h-4" /> },
    { id: "editor", label: "Table Editor", icon: <Table className="w-4 h-4" /> },
    { id: "sql", label: "SQL Editor", icon: <Terminal className="w-4 h-4" /> },
    { id: "database", label: "Schema Diagrams", icon: <Layers className="w-4 h-4" /> },
    { id: "auth", label: "Authentication", icon: <Users className="w-4 h-4" /> },
    { id: "storage", label: "Storage", icon: <HardDrive className="w-4 h-4" /> },
    { id: "webhooks", label: "Webhooks & AI Vector", icon: <Webhook className="w-4 h-4" /> },
    { id: "docs", label: "API Docs & SDKs", icon: <BookOpen className="w-4 h-4" /> },
    { id: "metrics", label: "Live Metrics", icon: <Activity className="w-4 h-4" /> },
    { id: "settings", label: "Project Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-14 md:w-56 bg-[#171717] border-r border-[#282828] flex flex-col justify-between select-none">
      {/* Top Logo & Navigation */}
      <div>
        {/* Supabase Emerald Logo */}
        <div className="h-14 border-b border-[#282828] px-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#121212] border border-[#282828] p-1 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <img src="/icon.svg" alt="SupaBase Logo" className="w-full h-full" />
          </div>
          <span className="hidden md:inline font-bold text-sm text-white tracking-tight">
            Supabase Studio
          </span>
        </div>

        {/* Links */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#242424] text-emerald-400 border border-[#333]"
                    : "text-slate-400 hover:text-white hover:bg-[#1f1f1f]"
                }`}
              >
                <span className={isActive ? "text-emerald-400" : "text-slate-400"}>
                  {item.icon}
                </span>
                <span className="hidden md:inline truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Back Button to Control Plane */}
      <div className="p-3 border-t border-[#282828]">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-[#242424] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden md:inline">Tüm Projeler</span>
        </Link>
      </div>
    </aside>
  );
};
