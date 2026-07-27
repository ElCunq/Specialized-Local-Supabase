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
  Mail,
  Save,
  Loader2,
  HardDrive,
  FileCode,
  Lock,
} from "lucide-react";

interface StudioSettingsProps {
  project: Tenant;
}

export const StudioSettings: React.FC<StudioSettingsProps> = ({ project }) => {
  const [copiedAnon, setCopiedAnon] = useState(false);
  const [copiedService, setCopiedService] = useState(false);
  const [copiedDbPassword, setCopiedDbPassword] = useState(false);
  const [copiedJwtSecret, setCopiedJwtSecret] = useState(false);
  const [copiedConnString, setCopiedConnString] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  // SMTP Settings State
  const [smtpHost, setSmtpHost] = useState("smtp.resend.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("resend");
  const [smtpPass, setSmtpPass] = useState("");
  const [fromEmail, setFromEmail] = useState(`noreply@${project.slug}.com`);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [smtpSaved, setSmtpSaved] = useState(false);

  const copyText = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const domain = typeof window !== "undefined" ? window.location.host : "db.orfa.dev";
  const postgresConnString = `postgres://postgres:${project.dbPassword}@${domain}:5432/postgres`;

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
NEXT_PUBLIC_SUPABASE_URL=https://${domain}/p/${project.slug}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${project.anonKey}
SUPABASE_SERVICE_ROLE_KEY=${project.serviceKey}

# Domain Configuration
SYSTEM_DOMAIN=${domain}
`;

  const handleDownloadBackup = () => {
    window.open(`/api/backup/${project.slug}`, "_blank");
  };

  const handleSaveSmtp = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSmtp(true);
    setTimeout(() => {
      setSavingSmtp(false);
      setSmtpSaved(true);
      setTimeout(() => setSmtpSaved(false), 3000);
    }, 800);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#121212] min-h-full text-slate-200 select-text">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Proje Ayarları & Yapılandırma</h2>
          <p className="text-xs text-slate-400">Database passwords, JWT secrets, connection strings, .env generator & backup tools for /{project.slug}.</p>
        </div>

        <button
          onClick={() => setShowSecrets(!showSecrets)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#171717] border border-[#282828] text-xs text-slate-300 hover:text-white transition cursor-pointer"
        >
          {showSecrets ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
          {showSecrets ? "Gizli Anahtarları Gizle" : "Gizli Anahtarları Göster (Reveal Secrets)"}
        </button>
      </div>

      {/* Ready-to-copy .env Generator */}
      <div className="rounded-xl bg-[#171717] border border-emerald-500/30 p-6 space-y-4 shadow-lg shadow-emerald-500/5">
        <div className="flex items-center justify-between border-b border-[#282828] pb-4">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Tek Tıkla Hazır `.env` Dosyası Oluşturucu</h3>
              <p className="text-[10px] text-slate-400">Projeniz için doldurulmuş tüm bağlantı değişkenlerini tek tıkla kopyalayın.</p>
            </div>
          </div>

          <button
            onClick={() => copyText(fullEnvTemplate, setCopiedEnv)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            {copiedEnv ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedEnv ? "Tüm .env Kopyalandı!" : ".env Kopyala"}
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#121212] border border-[#282828] font-mono text-xs text-emerald-300 overflow-x-auto">
          <pre>{showSecrets ? fullEnvTemplate : fullEnvTemplate.replace(/DB_PASSWORD=.*/, "DB_PASSWORD=••••••••••••").replace(/JWT_SECRET=.*/, "JWT_SECRET=••••••••••••")}</pre>
        </div>
      </div>

      {/* Database Credentials & Password */}
      <div className="rounded-xl bg-[#171717] border border-[#282828] p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-[#282828] pb-4">
          <Database className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-sm font-bold text-white">PostgreSQL Veritabanı Bilgileri (Database Credentials)</h3>
            <p className="text-[10px] text-slate-400">PostgreSQL host, port, user and container database password.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#121212] border border-[#282828]">
            <span className="text-slate-500 block text-[10px] uppercase">DB Host</span>
            <span className="text-white font-semibold">{domain}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#121212] border border-[#282828]">
            <span className="text-slate-500 block text-[10px] uppercase">DB Port</span>
            <span className="text-white font-semibold">5432</span>
          </div>

          <div className="p-3 rounded-xl bg-[#121212] border border-[#282828]">
            <span className="text-slate-500 block text-[10px] uppercase">DB User</span>
            <span className="text-white font-semibold">postgres</span>
          </div>

          <div className="p-3 rounded-xl bg-[#121212] border border-[#282828]">
            <span className="text-slate-500 block text-[10px] uppercase">DB Name</span>
            <span className="text-white font-semibold">postgres</span>
          </div>
        </div>

        {/* DB Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-emerald-400">Veritabanı Şifresi (DB Password)</span>
            <span className="text-slate-500 text-[10px]">PostgreSQL Admin Pass</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#121212] border border-[#282828] text-xs font-mono">
            <span className="flex-1 truncate text-slate-300">
              {showSecrets ? project.dbPassword : "••••••••••••••••••••••••••••••••"}
            </span>
            <button
              onClick={() => copyText(project.dbPassword || "", setCopiedDbPassword)}
              className="p-1.5 rounded text-slate-400 hover:text-white cursor-pointer"
            >
              {copiedDbPassword ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* PostgreSQL Connection String */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-purple-400">PostgreSQL Connection String</span>
            <span className="text-slate-500 text-[10px]">URI Format</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#121212] border border-[#282828] text-xs font-mono">
            <span className="flex-1 truncate text-slate-300">
              {showSecrets ? postgresConnString : `postgres://postgres:••••••••@${domain}:5432/postgres`}
            </span>
            <button
              onClick={() => copyText(postgresConnString, setCopiedConnString)}
              className="p-1.5 rounded text-slate-400 hover:text-white cursor-pointer"
            >
              {copiedConnString ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* JWT & API Keys Panel */}
      <div className="rounded-xl bg-[#171717] border border-[#282828] p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-[#282828] pb-4">
          <Key className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">JWT Secrets & Project API Keys</h3>
        </div>

        {/* JWT Secret */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-amber-400">JWT Secret (JWT_SECRET)</span>
            <span className="text-slate-500 text-[10px]">GoTrue & PostgREST HMAC Secret</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#121212] border border-[#282828] text-xs font-mono">
            <span className="flex-1 truncate text-slate-300">
              {showSecrets ? project.jwtSecret : "••••••••••••••••••••••••••••••••••••••••"}
            </span>
            <button
              onClick={() => copyText(project.jwtSecret || "", setCopiedJwtSecret)}
              className="p-1.5 rounded text-slate-400 hover:text-white cursor-pointer"
            >
              {copiedJwtSecret ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Anon Key */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-white">anon (public key)</span>
            <span className="text-slate-500 text-[10px]">Client-side Safe</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#121212] border border-[#282828] text-xs font-mono">
            <span className="flex-1 truncate text-slate-300">
              {showSecrets ? project.anonKey : "••••••••••••••••••••••••••••••••••••••••"}
            </span>
            <button
              onClick={() => copyText(project.anonKey || "", setCopiedAnon)}
              className="p-1.5 rounded text-slate-400 hover:text-white cursor-pointer"
            >
              {copiedAnon ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Service Role Key */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-rose-400">service_role (secret key)</span>
            <span className="text-rose-500/80 text-[10px]">Bypasses RLS - Keep Private!</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#121212] border border-[#282828] text-xs font-mono">
            <span className="flex-1 truncate text-slate-300">
              {showSecrets ? project.serviceKey : "••••••••••••••••••••••••••••••••••••••••"}
            </span>
            <button
              onClick={() => copyText(project.serviceKey || "", setCopiedService)}
              className="p-1.5 rounded text-slate-400 hover:text-white cursor-pointer"
            >
              {copiedService ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Database Backup Panel */}
      <div className="rounded-xl bg-[#171717] border border-[#282828] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#282828] pb-4">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Tek Tıkla Veri Tabanı Yedeği & Geri Yükleme</h3>
              <p className="text-[10px] text-slate-400">PostgreSQL `.sql` dump export engine.</p>
            </div>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Yedek İndir (.sql)
          </button>
        </div>
      </div>
    </div>
  );
};
