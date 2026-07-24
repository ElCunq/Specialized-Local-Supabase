"use client";

import React from "react";
import { Tenant } from "@/db/schema";
import { Users, Mail, Shield, Key, Plus } from "lucide-react";

interface StudioAuthProps {
  project: Tenant;
}

export const StudioAuth: React.FC<StudioAuthProps> = ({ project }) => {
  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#121212] min-h-full text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Authentication</h2>
          <p className="text-xs text-slate-400">User accounts, OAuth providers, and RLS security policies.</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition">
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Users Table Sample */}
      <div className="rounded-xl bg-[#171717] border border-[#282828] p-6 space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-white">
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Registered Users (GoTrue Auth)
          </span>
          <span className="text-slate-500 font-mono">0 Users</span>
        </div>

        <div className="p-8 border border-dashed border-[#282828] rounded-xl text-center flex flex-col items-center justify-center text-xs text-slate-500 space-y-2">
          <Mail className="w-8 h-8 opacity-40 text-emerald-400" />
          <span>No users registered yet for project '{project.name}'.</span>
        </div>
      </div>
    </div>
  );
};
