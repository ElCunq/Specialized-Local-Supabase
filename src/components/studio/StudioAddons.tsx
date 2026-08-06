import { useState } from "react";
import { Tenant } from "@/db/schema";
import { Layers, Database, Code2, CheckCircle2, CircleDashed, Loader2 } from "lucide-react";

interface StudioAddonsProps {
  project: Tenant;
}

export function StudioAddons({ project }: StudioAddonsProps) {
  const [loadingAddon, setLoadingAddon] = useState<string | null>(null);
  
  // We manage local state optimistically, but ideally we'd fetch this from the server.
  // Since project is passed in, we can use its initial values if they exist,
  // but we might need to cast since we just added them to the schema.
  const [addons, setAddons] = useState({
    redis: (project as any).addonRedis === 1,
    edge_functions: (project as any).addonEdgeFunctions === 1,
  });

  const toggleAddon = async (addonId: 'redis' | 'edge_functions', currentState: boolean) => {
    try {
      setLoadingAddon(addonId);
      const res = await fetch(`/api/projects/${project.id}/addons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addon: addonId, enabled: !currentState })
      });
      
      if (!res.ok) throw new Error("Failed to toggle addon");
      
      setAddons(prev => ({ ...prev, [addonId]: !currentState }));
    } catch (err: any) {
      alert("Error toggling addon: " + err.message);
    } finally {
      setLoadingAddon(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Add-ons</h2>
          <p className="text-slate-400 mt-1">Extend your Supabase project with additional compute and microservices.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Compute (Always On) */}
        <div className="bg-[#171717] border border-[#282828] rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" /> Enabled
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Core Compute</h3>
              <p className="text-sm text-slate-400 mt-2 mb-4 max-w-sm">
                PostgreSQL Database, PostgREST API, Auth (GoTrue), and PgBouncer Connection Pooler.
              </p>
              <button disabled className="px-4 py-2 bg-[#282828] text-slate-400 rounded-lg text-sm font-medium cursor-not-allowed">
                Included in Base Plan
              </button>
            </div>
          </div>
        </div>

        {/* Redis / BullMQ */}
        <div className="bg-[#171717] border border-[#282828] rounded-xl p-6 relative overflow-hidden transition-all hover:border-red-500/30">
          <div className="absolute top-0 right-0 p-6">
            {addons.redis ? (
               <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                 <CheckCircle2 className="w-4 h-4" /> Enabled
               </div>
            ) : (
               <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                 <CircleDashed className="w-4 h-4" /> Disabled
               </div>
            )}
          </div>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl border ${addons.redis ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-slate-800/50 border-slate-700/50 text-slate-400'}`}>
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Message Broker (Redis)</h3>
              <p className="text-sm text-slate-400 mt-2 mb-4 max-w-sm">
                In-memory data structure store, used as a database, cache, and message broker. Essential for running BullMQ background workers.
              </p>
              <button 
                onClick={() => toggleAddon('redis', addons.redis)}
                disabled={loadingAddon === 'redis'}
                className={`flex items-center justify-center min-w-[120px] px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  addons.redis 
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                    : 'bg-emerald-500 text-black hover:bg-emerald-400'
                }`}
              >
                {loadingAddon === 'redis' ? <Loader2 className="w-4 h-4 animate-spin" /> : (addons.redis ? 'Disable Redis' : 'Enable Redis')}
              </button>
            </div>
          </div>
        </div>

        {/* Edge Functions */}
        <div className="bg-[#171717] border border-[#282828] rounded-xl p-6 relative overflow-hidden transition-all hover:border-yellow-500/30">
          <div className="absolute top-0 right-0 p-6">
            {addons.edge_functions ? (
               <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                 <CheckCircle2 className="w-4 h-4" /> Enabled
               </div>
            ) : (
               <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                 <CircleDashed className="w-4 h-4" /> Disabled
               </div>
            )}
          </div>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl border ${addons.edge_functions ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-slate-800/50 border-slate-700/50 text-slate-400'}`}>
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Edge Functions (Deno)</h3>
              <p className="text-sm text-slate-400 mt-2 mb-4 max-w-sm">
                Globally distributed TypeScript functions. Run custom server-side logic instantly without maintaining servers.
              </p>
              <button 
                onClick={() => toggleAddon('edge_functions', addons.edge_functions)}
                disabled={loadingAddon === 'edge_functions'}
                className={`flex items-center justify-center min-w-[120px] px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  addons.edge_functions 
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                    : 'bg-emerald-500 text-black hover:bg-emerald-400'
                }`}
              >
                {loadingAddon === 'edge_functions' ? <Loader2 className="w-4 h-4 animate-spin" /> : (addons.edge_functions ? 'Disable Edge Functions' : 'Enable Edge Functions')}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
