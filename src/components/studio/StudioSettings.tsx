"use client";

import React, { useState } from "react";
import { Tenant } from "@/db/schema";
import { Key, Copy, Check, Shield, Database, Lock, Eye, EyeOff } from "lucide-react";

interface StudioSettingsProps {
  project: Tenant;
}

export const StudioSettings: React.FC<StudioSettingsProps> = ({ project }) => {
  const [copiedAnon, setCopiedAnon] = useState(false);
  const [copiedService, setCopiedService] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  const copyText = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const postgresConnString = `postgres://postgres:${project.dbPassword}@db.orfa.dev:5432/postgres`;

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#121212] min-h-full text-slate-200">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Project Settings</h2>
        <p className="text-xs text-slate-400">API keys, JWT secrets, and PostgreSQL connection strings.</p>
      </div>

      {/* API Keys Panel */}
      <div className="rounded-xl bg-[#171717] border border-[#282828] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#282828] pb-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Project API Keys</h3>
          </div>

          <button
            onClick={() => setShowSecrets(!showSecrets)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
          >
            {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showSecrets ? "Hide Secrets" : "Reveal Secrets"}
          </button>
        </div>

        {/* Anon Key */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-white">anon (public)</span>
            <span className="text-slate-500 text-[10px]">Client-side Safe</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#121212] border border-[#282828] text-xs font-mono">
            <span className="flex-1 truncate text-slate-300">
              {showSecrets ? project.anonKey : "••••••••••••••••••••••••••••••••••••••••"}
            </span>
            <button
              onClick={() => copyText(project.anonKey || "", setCopiedAnon)}
              className="p-1.5 rounded text-slate-400 hover:text-white"
            >
              {copiedAnon ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Service Role Key */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-rose-400">service_role (secret)</span>
            <span className="text-rose-500/80 text-[10px]">Bypasses RLS - Keep Private!</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#121212] border border-[#282828] text-xs font-mono">
            <span className="flex-1 truncate text-slate-300">
              {showSecrets ? project.serviceKey : "••••••••••••••••••••••••••••••••••••••••"}
            </span>
            <button
              onClick={() => copyText(project.serviceKey || "", setCopiedService)}
              className="p-1.5 rounded text-slate-400 hover:text-white"
            >
              {copiedService ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Database Connection Panel */}
      <div className="rounded-xl bg-[#171717] border border-[#282828] p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#282828] pb-4">
          <Database className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Database Connection Strings</h3>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">PostgreSQL URI (Direct)</label>
          <div className="p-3 rounded-xl bg-[#121212] border border-[#282828] font-mono text-xs text-blue-300 overflow-x-auto">
            {showSecrets ? postgresConnString : postgresConnString.replace(project.dbPassword, "••••••••")}
          </div>
        </div>
      </div>
    </div>
  );
};
