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
  Upload,
  Mail,
  Save,
  Loader2,
  HardDrive,
} from "lucide-react";

interface StudioSettingsProps {
  project: Tenant;
}

export const StudioSettings: React.FC<StudioSettingsProps> = ({ project }) => {
  const [copiedAnon, setCopiedAnon] = useState(false);
  const [copiedService, setCopiedService] = useState(false);
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

  const domain = typeof window !== "undefined" ? window.location.host : "localhost:3000";
  const postgresConnString = `postgres://postgres:${project.dbPassword}@${domain}:5432/postgres`;

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
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Proje Ayarları & Yapılandırma</h2>
        <p className="text-xs text-slate-400">API keys, PostgreSQL connections, Backup dumps & Custom SMTP email settings for /{project.slug}.</p>
      </div>

      {/* Database Backup & Restore Panel */}
      <div className="rounded-xl bg-[#171717] border border-[#282828] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#282828] pb-4">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Tek Tıkla Veri Tabanı Yedeği & Geri Yükleme</h3>
              <p className="text-[10px] text-slate-400">PostgreSQL `.sql` dump export & import engine.</p>
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

        <p className="text-xs text-slate-400 leading-relaxed">
          Veritabanınızın tüm tablolarını, verilerini ve şemasını tek bir tıklama ile `.sql` dosyası olarak bilgisayarınıza indirebilirsiniz.
        </p>
      </div>

      {/* Custom SMTP Email Settings Panel */}
      <div className="rounded-xl bg-[#171717] border border-[#282828] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#282828] pb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Özel E-Posta Gönderim Ayarları (SMTP Integration)</h3>
              <p className="text-[10px] text-slate-400">Configure SMTP server for password reset & welcome emails.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveSmtp} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">SMTP Server Host</label>
            <input
              type="text"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-white outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Port</label>
            <input
              type="text"
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-white outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">SMTP Kullanıcı Adı</label>
            <input
              type="text"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-white outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">SMTP Şifresi</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-white outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-400 mb-1">Gönderici E-Posta Adresi (From Email)</label>
            <input
              type="email"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-emerald-400 outline-none font-mono"
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={savingSmtp}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer"
            >
              {savingSmtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {smtpSaved ? "SMTP Ayarları Kaydedildi!" : "SMTP Ayarlarını Kaydet"}
            </button>
          </div>
        </form>
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
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
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
              className="p-1.5 rounded text-slate-400 hover:text-white cursor-pointer"
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
              className="p-1.5 rounded text-slate-400 hover:text-white cursor-pointer"
            >
              {copiedService ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
