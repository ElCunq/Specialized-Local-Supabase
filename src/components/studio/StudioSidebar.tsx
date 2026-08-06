"use client";

import React, { useState } from "react";
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
  ChevronRight,
  Puzzle,
} from "lucide-react";

export type StudioModule =
  | "overview"
  | "editor"
  | "sql"
  | "database"
  | "auth"
  | "storage"
  | "docs"
  | "logs"
  | "addons"
  | "settings";

export type StudioSubMenu = string;

interface StudioSidebarProps {
  activeModule: StudioModule;
  activeSubMenu: StudioSubMenu;
  onModuleChange: (mod: StudioModule) => void;
  onSubMenuChange: (sub: StudioSubMenu) => void;
  slug: string;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  activeModule,
  activeSubMenu,
  onModuleChange,
  onSubMenuChange,
  slug,
}) => {
  const primaryNavItems: { id: StudioModule; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Home", icon: <Home className="w-5 h-5" /> },
    { id: "editor", label: "Table Editor", icon: <Table className="w-5 h-5" /> },
    { id: "sql", label: "SQL Editor", icon: <Terminal className="w-5 h-5" /> },
    { id: "database", label: "Database", icon: <Database className="w-5 h-5" /> },
    { id: "auth", label: "Authentication", icon: <Users className="w-5 h-5" /> },
    { id: "storage", label: "Storage", icon: <HardDrive className="w-5 h-5" /> },
    { id: "docs", label: "API Docs", icon: <BookOpen className="w-5 h-5" /> },
    { id: "logs", label: "Logs", icon: <Activity className="w-5 h-5" /> },
    { id: "addons", label: "Add-ons", icon: <Puzzle className="w-5 h-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const getSubMenuTitle = (mod: StudioModule) => {
    switch (mod) {
      case "database":
        return "Database";
      case "auth":
        return "Authentication";
      case "settings":
        return "Settings";
      default:
        return null;
    }
  };

  const getSubMenus = (mod: StudioModule): { id: string; label: string }[] => {
    switch (mod) {
      case "database":
        return [
          { id: "tables", label: "Tables" },
          { id: "roles", label: "Roles" },
          { id: "policies", label: "Policies" },
          { id: "extensions", label: "Extensions" },
        ];
      case "auth":
        return [
          { id: "users", label: "Users" },
          { id: "policies", label: "Policies" },
          { id: "providers", label: "Providers" },
        ];
      case "settings":
        return [
          { id: "general", label: "General" },
          { id: "database", label: "Database" },
          { id: "api", label: "API" },
        ];
      default:
        return [];
    }
  };

  const subMenus = getSubMenus(activeModule);
  const subMenuTitle = getSubMenuTitle(activeModule);

  return (
    <div className="flex h-full bg-[#1c1c1c] border-r border-[#2e2e2e]">
      {/* Primary Sidebar (Narrow) */}
      <aside className="w-14 bg-[#1c1c1c] border-r border-[#2e2e2e] flex flex-col items-center py-4 justify-between z-10">
        <div className="flex flex-col gap-4 items-center w-full">
          {/* Logo */}
          <Link href={`/project/${slug}`} className="mb-2">
            <div className="w-8 h-8 rounded-full bg-[#242424] border border-[#3e3e3e] flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <img src="/icon.svg" alt="Logo" className="w-5 h-5 opacity-80 hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          {/* Icons */}
          <nav className="flex flex-col gap-2 w-full px-2">
            {primaryNavItems.map((item) => {
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onModuleChange(item.id)}
                  title={item.label}
                  className={`w-10 h-10 rounded-md flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "text-[#8b8b8b] hover:text-white hover:bg-[#2e2e2e]"
                  }`}
                >
                  {item.icon}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Back Button */}
        <div className="pb-2 w-full flex justify-center">
          <Link
            href="/"
            title="All Projects"
            className="w-10 h-10 rounded-md flex items-center justify-center text-[#8b8b8b] hover:text-white hover:bg-[#2e2e2e] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </aside>

      {/* Secondary Sidebar */}
      {subMenus.length > 0 && (
        <aside className="w-56 bg-[#1c1c1c] flex flex-col">
          <div className="h-14 flex items-center px-5 font-semibold text-sm text-[#ededed]">
            {subMenuTitle}
          </div>
          <div className="px-3 py-2 flex-1">
            <nav className="flex flex-col gap-1">
              {subMenus.map((item) => {
                const isActive = activeSubMenu === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSubMenuChange(item.id)}
                    className={`flex items-center text-sm px-3 py-1.5 rounded-md transition-all text-left ${
                      isActive
                        ? "bg-[#2e2e2e] text-white font-medium"
                        : "text-[#a1a1aa] hover:bg-[#242424] hover:text-[#ededed]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>
      )}
    </div>
  );
};
