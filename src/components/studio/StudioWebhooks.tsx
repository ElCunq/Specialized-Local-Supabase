"use client";

import React, { useState, useEffect } from "react";
import { Tenant } from "@/db/schema";
import {
  Webhook,
  Plus,
  Zap,
  Globe,
  CheckCircle,
  Database,
  Code2,
  Cpu,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface StudioWebhooksProps {
  project: Tenant;
}

export const StudioWebhooks: React.FC<StudioWebhooksProps> = ({ project }) => {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [table, setTable] = useState("users");
  const [targetUrl, setTargetUrl] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/webhooks/${project.slug}`);
      const data = await res.json();
      if (data.success) {
        setWebhooks(data.webhooks || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, [project.slug]);

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !table || !targetUrl) return;

    setCreating(true);
    try {
      const res = await fetch(`/api/webhooks/${project.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, table, targetUrl, events: ["INSERT", "UPDATE"] }),
      });
      if (res.ok) {
        setName("");
        setTargetUrl("");
        fetchWebhooks();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#121212] min-h-full text-slate-200">
      {/* Top Banner: Extensions Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* pg_graphql */}
        <div className="p-4 rounded-xl bg-[#171717] border border-[#282828] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">pg_graphql Engine</div>
              <div className="text-[10px] text-slate-400">GraphQL API Endpoint Active</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            0 MB RAM
          </span>
        </div>

        {/* pgvector */}
        <div className="p-4 rounded-xl bg-[#171717] border border-[#282828] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">pgvector AI Support</div>
              <div className="text-[10px] text-slate-400">LLM Vector Search Enabled</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            AI Ready
          </span>
        </div>

        {/* pg_net */}
        <div className="p-4 rounded-xl bg-[#171717] border border-[#282828] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">pg_net Webhooks</div>
              <div className="text-[10px] text-slate-400">Async HTTP Trigger Engine</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Active
          </span>
        </div>
      </div>

      {/* Database Webhooks Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Webhook Form */}
        <div className="p-6 rounded-xl bg-[#171717] border border-[#282828] space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Webhook className="w-4 h-4 text-emerald-400" />
            <span>Yeni Database Webhook Ekle</span>
          </div>

          <form onSubmit={handleCreateWebhook} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Webhook Adı</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Stripe Payment Trigger"
                className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Hedef Tablo</label>
              <input
                type="text"
                required
                value={table}
                onChange={(e) => setTable(e.target.value)}
                placeholder="orders"
                className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Target HTTP URL</label>
              <input
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://api.myapp.com/webhooks"
                className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition mt-2"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Webhook Oluştur
            </button>
          </form>
        </div>

        {/* Existing Webhooks List */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-[#171717] border border-[#282828] space-y-4">
          <div className="flex items-center justify-between border-b border-[#282828] pb-3 text-xs">
            <span className="font-bold text-white">Aktif Webhook Tetikleyicileri</span>
            <span className="font-mono text-slate-500">{webhooks.length} Webhook</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32 text-slate-500 text-xs">
              Webhook'lar yükleniyor...
            </div>
          ) : (
            <div className="space-y-3">
              {webhooks.map((wh) => (
                <div
                  key={wh.id}
                  className="p-4 rounded-xl bg-[#121212] border border-[#282828] flex items-center justify-between text-xs font-mono"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span>{wh.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-normal">
                        public.{wh.table}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-md">{wh.targetUrl}</div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {wh.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
