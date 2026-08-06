"use client";

import React, { useState } from "react";
import { Tenant } from "@/db/schema";
import {
  Key,
  Copy,
  Check,
  Database,
  Eye,
  EyeOff,
  Download,
  FileCode,
  HardDrive,
  Settings2,
  Globe,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudioSettingsProps {
  project: Tenant;
  activeSubMenu: string;
}

export const StudioSettings: React.FC<StudioSettingsProps> = ({ project, activeSubMenu }) => {
  const [copiedAnon, setCopiedAnon] = useState(false);
  const [copiedService, setCopiedService] = useState(false);
  const [copiedDbPassword, setCopiedDbPassword] = useState(false);
  const [copiedJwtSecret, setCopiedJwtSecret] = useState(false);
  const [copiedConnString, setCopiedConnString] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  const copyText = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const domain = typeof window !== "undefined" ? window.location.host : "db.orfa.dev";
  const postgresConnString = `postgres://postgres:${project.dbPassword}@${domain}:5432/postgres`;
  const apiUrl = `https://${domain}/p/${project.slug}`;

  const fullEnvTemplate = `PORT=3000
NODE_ENV=production

# Supabase / PostgreSQL Connection
DB_HOST=${domain}
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=${project.dbPassword}
DB_NAME=postgres
DB_SSL=false

# JWT Secret & Keys
JWT_SECRET=${project.jwtSecret || project.serviceKey}
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=${project.serviceKey}
JWT_REFRESH_EXPIRES_IN=7d

# Project REST & GraphQL API Endpoints
NEXT_PUBLIC_SUPABASE_URL=${apiUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${project.anonKey}
SUPABASE_SERVICE_ROLE_KEY=${project.serviceKey}
`;

  const handleDownloadBackup = () => {
    window.open(`/api/backup/${project.slug}`, "_blank");
  };

  return (
    <div className="flex h-full bg-[#1c1c1c] text-[#ededed] font-sans select-none overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 bg-[#1c1c1c] overflow-y-auto">
        <div className="p-8 w-full max-w-4xl mx-auto space-y-10">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-medium text-[#ededed] mb-1 tracking-tight capitalize">
                {activeSubMenu === "general" && "General Settings"}
                {activeSubMenu === "database" && "Database Settings"}
                {activeSubMenu === "api" && "API Settings"}
              </h2>
              <p className="text-sm text-[#8b8b8b]">Manage settings for project /{project.slug}</p>
            </div>
            
            {(activeSubMenu === "database" || activeSubMenu === "api") && (
              <button
                onClick={() => setShowSecrets(!showSecrets)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#242424] border border-[#3e3e3e] text-xs text-[#8b8b8b] hover:text-[#ededed] transition"
              >
                {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showSecrets ? "Hide secrets" : "Reveal secrets"}
              </button>
            )}
          </div>

          {activeSubMenu === "general" && (
            <div className="space-y-8">
              <div className="border border-[#2e2e2e] rounded-md bg-[#1c1c1c] overflow-hidden">
                <div className="p-5 border-b border-[#2e2e2e]">
                  <h3 className="text-sm font-medium text-[#ededed]">Project Configuration</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-1.5">
                    <label className="block text-sm text-[#8b8b8b]">Project Name</label>
                    <input type="text" disabled defaultValue={project.name} className="w-full bg-[#242424] border border-[#3e3e3e] rounded-md px-3 py-2 text-sm text-[#ededed] opacity-70" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="block text-sm text-[#8b8b8b]">Reference ID</label>
                    <div className="flex items-center gap-2">
                      <input type="text" disabled defaultValue={project.slug} className="w-full bg-[#242424] border border-[#3e3e3e] rounded-md px-3 py-2 text-sm text-[#ededed] font-mono opacity-70" />
                      <button onClick={() => copyText(project.slug, setCopiedRef)} className="p-2 bg-[#242424] border border-[#3e3e3e] rounded-md hover:text-[#ededed] text-[#8b8b8b]">
                        {copiedRef ? <Check className="w-4 h-4 text-brand" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-rose-500/30 rounded-md bg-rose-500/5 overflow-hidden">
                <div className="p-5 border-b border-rose-500/20">
                  <h3 className="text-sm font-medium text-rose-500">Danger Zone</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[#ededed] font-medium text-sm">Pause Project</h4>
                      <p className="text-xs text-[#8b8b8b] mt-0.5">Pausing will turn off your compute and API endpoints.</p>
                    </div>
                    <Button variant="outline" className="text-[#8b8b8b] border-[#3e3e3e]">Pause Project</Button>
                  </div>
                  <div className="border-t border-rose-500/20 pt-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-[#ededed] font-medium text-sm">Delete Project</h4>
                      <p className="text-xs text-[#8b8b8b] mt-0.5">This action cannot be undone.</p>
                    </div>
                    <Button variant="destructive" className="bg-rose-600 hover:bg-rose-500">Delete Project</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubMenu === "database" && (
            <div className="space-y-8">
              <div className="border border-[#2e2e2e] rounded-md bg-[#1c1c1c] overflow-hidden">
                <div className="p-5 border-b border-[#2e2e2e] flex items-center gap-2">
                  <Database className="w-4 h-4 text-brand" />
                  <h3 className="text-sm font-medium text-[#ededed]">Connection Info</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="block text-xs uppercase tracking-wide text-[#8b8b8b]">Host</label>
                      <input type="text" disabled defaultValue={domain} className="w-full bg-[#242424] border border-[#3e3e3e] rounded-md px-3 py-2 text-sm text-[#ededed] font-mono opacity-70" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs uppercase tracking-wide text-[#8b8b8b]">Database Name</label>
                      <input type="text" disabled defaultValue="postgres" className="w-full bg-[#242424] border border-[#3e3e3e] rounded-md px-3 py-2 text-sm text-[#ededed] font-mono opacity-70" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs uppercase tracking-wide text-[#8b8b8b]">Port</label>
                      <input type="text" disabled defaultValue="5432" className="w-full bg-[#242424] border border-[#3e3e3e] rounded-md px-3 py-2 text-sm text-[#ededed] font-mono opacity-70" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs uppercase tracking-wide text-[#8b8b8b]">User</label>
                      <input type="text" disabled defaultValue="postgres" className="w-full bg-[#242424] border border-[#3e3e3e] rounded-md px-3 py-2 text-sm text-[#ededed] font-mono opacity-70" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wide text-[#8b8b8b]">Password</label>
                    <div className="flex items-center gap-2">
                      <input type="text" disabled value={showSecrets ? project.dbPassword : "••••••••••••••••••••••••"} className="w-full bg-[#242424] border border-[#3e3e3e] rounded-md px-3 py-2 text-sm text-[#ededed] font-mono opacity-70" />
                      <button onClick={() => copyText(project.dbPassword || "", setCopiedDbPassword)} className="p-2 bg-[#242424] border border-[#3e3e3e] rounded-md hover:text-[#ededed] text-[#8b8b8b]">
                        {copiedDbPassword ? <Check className="w-4 h-4 text-brand" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wide text-[#8b8b8b]">Connection String</label>
                    <div className="flex items-center gap-2">
                      <input type="text" disabled value={showSecrets ? postgresConnString : `postgres://postgres:••••••••@${domain}:5432/postgres`} className="w-full bg-[#242424] border border-[#3e3e3e] rounded-md px-3 py-2 text-sm text-[#ededed] font-mono opacity-70" />
                      <button onClick={() => copyText(postgresConnString, setCopiedConnString)} className="p-2 bg-[#242424] border border-[#3e3e3e] rounded-md hover:text-[#ededed] text-[#8b8b8b]">
                        {copiedConnString ? <Check className="w-4 h-4 text-brand" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-[#2e2e2e] rounded-md bg-[#1c1c1c] overflow-hidden">
                <div className="p-5 border-b border-[#2e2e2e] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-brand" />
                    <h3 className="text-sm font-medium text-[#ededed]">Database Backup</h3>
                  </div>
                  <Button variant="emerald" size="sm" onClick={handleDownloadBackup}>
                    <Download className="w-4 h-4 mr-2" /> Download Backup (.sql)
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeSubMenu === "api" && (
            <div className="space-y-8">
              <div className="border border-[#2e2e2e] rounded-md bg-[#1c1c1c] overflow-hidden">
                <div className="p-5 border-b border-[#2e2e2e] flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand" />
                  <h3 className="text-sm font-medium text-[#ededed]">API Settings</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wide text-[#8b8b8b]">Project URL</label>
                    <div className="flex items-center gap-2">
                      <input type="text" disabled value={apiUrl} className="w-full bg-[#242424] border border-[#3e3e3e] rounded-md px-3 py-2 text-sm text-[#ededed] font-mono opacity-70" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wide text-[#8b8b8b]">JWT Secret</label>
                    <div className="flex items-center gap-2">
                      <input type="text" disabled value={showSecrets ? project.jwtSecret : "••••••••••••••••••••••••••••••••"} className="w-full bg-[#242424] border border-[#3e3e3e] rounded-md px-3 py-2 text-sm text-[#ededed] font-mono opacity-70" />
                      <button onClick={() => copyText(project.jwtSecret || "", setCopiedJwtSecret)} className="p-2 bg-[#242424] border border-[#3e3e3e] rounded-md hover:text-[#ededed] text-[#8b8b8b]">
                        {copiedJwtSecret ? <Check className="w-4 h-4 text-brand" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-[#2e2e2e] rounded-md bg-[#1c1c1c] overflow-hidden">
                <div className="p-5 border-b border-[#2e2e2e] flex items-center gap-2">
                  <Key className="w-4 h-4 text-brand" />
                  <h3 className="text-sm font-medium text-[#ededed]">Project API Keys</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium text-[#ededed]">anon</label>
                      <Badge variant="outline" className="text-xs bg-[#242424] text-brand border-[#3e3e3e]">public</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="text" disabled value={showSecrets ? project.anonKey : "••••••••••••••••••••••••••••••••"} className="w-full bg-[#242424] border border-[#3e3e3e] rounded-md px-3 py-2 text-sm text-[#ededed] font-mono opacity-70" />
                      <button onClick={() => copyText(project.anonKey || "", setCopiedAnon)} className="p-2 bg-[#242424] border border-[#3e3e3e] rounded-md hover:text-[#ededed] text-[#8b8b8b]">
                        {copiedAnon ? <Check className="w-4 h-4 text-brand" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-4 border-t border-[#2e2e2e]">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium text-[#ededed]">service_role</label>
                      <Badge variant="outline" className="text-xs bg-rose-500/10 text-rose-400 border-rose-500/20">secret</Badge>
                    </div>
                    <p className="text-xs text-[#8b8b8b]">This key has the ability to bypass Row Level Security. Never share it publicly.</p>
                    <div className="flex items-center gap-2 mt-2">
                      <input type="text" disabled value={showSecrets ? project.serviceKey : "••••••••••••••••••••••••••••••••"} className="w-full bg-[#242424] border border-[#3e3e3e] rounded-md px-3 py-2 text-sm text-[#ededed] font-mono opacity-70" />
                      <button onClick={() => copyText(project.serviceKey || "", setCopiedService)} className="p-2 bg-[#242424] border border-[#3e3e3e] rounded-md hover:text-[#ededed] text-[#8b8b8b]">
                        {copiedService ? <Check className="w-4 h-4 text-brand" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-brand/30 rounded-md bg-[#1c1c1c] overflow-hidden">
                <div className="p-5 border-b border-[#2e2e2e] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-brand" />
                    <div>
                      <h3 className="text-sm font-medium text-[#ededed]">Environment Variables</h3>
                      <p className="text-xs text-[#8b8b8b]">Ready-to-copy .env template.</p>
                    </div>
                  </div>
                  <Button variant="emerald" size="sm" onClick={() => copyText(fullEnvTemplate, setCopiedEnv)}>
                    {copiedEnv ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    Copy .env
                  </Button>
                </div>
                <div className="p-4 bg-[#242424] overflow-x-auto text-brand text-xs font-mono">
                  <pre>{showSecrets ? fullEnvTemplate : fullEnvTemplate.replace(/DB_PASSWORD=.*/, "DB_PASSWORD=••••••••").replace(/JWT_SECRET=.*/, "JWT_SECRET=••••••••")}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
