"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  Search,
  Zap,
  HelpCircle,
  Bell,
  Copy,
  Check,
  X,
  Code2,
} from "lucide-react";
import { Tenant } from "@/db/schema";

interface StudioHeaderProps {
  project: Tenant;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({ project }) => {
  const [copied, setCopied] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  const domain = typeof window !== "undefined" ? window.location.host : "localhost:3000";
  const protocol = typeof window !== "undefined" ? window.location.protocol : "http:";
  const apiUrl = `${protocol}//${domain}/p/${project.slug}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(apiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <header className="h-14 bg-[#121212] border-b border-[#282828] px-4 flex items-center justify-between text-xs text-slate-300">
        {/* Left Breadcrumb Navigation */}
        <div className="flex items-center gap-2 font-medium">
          <div className="flex items-center gap-1.5 hover:text-white cursor-pointer">
            <span className="p-1 rounded bg-[#1f1f1f] text-emerald-400 font-bold">⚡</span>
            <span>Local Org</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#1f1f1f] border border-[#2e2e2e] text-slate-400 font-mono">
              FREE
            </span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          <div className="flex items-center gap-2 hover:text-white cursor-pointer">
            <span className="font-semibold text-white">{project.name}</span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          <div className="flex items-center gap-1.5">
            <span className="font-mono text-slate-400">main</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold uppercase">
              PRODUCTION
            </span>
          </div>

          <button
            onClick={() => setShowConnectModal(true)}
            className="ml-3 flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] font-medium hover:bg-[#10b981]/20 transition"
          >
            <Zap className="w-3.5 h-3.5" />
            Connect
          </button>
        </div>

        {/* Right Action Icons & Search */}
        <div className="flex items-center gap-3">
          <div className="relative hidden md:flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search... Ctrl+K"
              className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-md pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 outline-none focus:border-[#10b981] w-48"
            />
          </div>

          <button className="p-1.5 rounded-md hover:bg-[#1c1c1c] text-slate-400 hover:text-white transition">
            <HelpCircle className="w-4 h-4" />
          </button>

          <button className="p-1.5 rounded-md hover:bg-[#1c1c1c] text-slate-400 hover:text-white transition">
            <Bell className="w-4 h-4" />
          </button>

          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 text-white font-bold flex items-center justify-center text-xs shadow-md">
            E
          </div>
        </div>
      </header>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#171717] rounded-xl border border-[#2e2e2e] p-6 text-slate-200 shadow-2xl relative">
            <button
              onClick={() => setShowConnectModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-[#282828] text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Connect to {project.name}</h3>
                <p className="text-xs text-slate-400">PostgREST API Gateway & Client SDK Credentials</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">API Base URL</label>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#121212] border border-[#282828] font-mono text-emerald-400">
                  <span className="flex-1 truncate">{apiUrl}</span>
                  <button onClick={copyUrl} className="p-1 text-slate-400 hover:text-white">
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">@supabase/supabase-js Setup</label>
                <pre className="p-3 rounded-lg bg-[#121212] border border-[#282828] font-mono text-blue-300 overflow-x-auto">
{`import { createClient } from '@supabase/supabase-js'

const supabaseUrl = '${apiUrl}'
const supabaseAnonKey = '${project.anonKey || "YOUR_ANON_KEY"}'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
