"use client";

import React, { useState, useEffect } from "react";
import { Tenant } from "@/db/schema";
import {
  Users as UsersIcon,
  Mail,
  Shield,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  Loader2,
  X,
  UserCheck,
  Search,
  Copy,
  ChevronDown,
  User,
  Key,
  Ban,
  Lock,
  ExternalLink,
  ShieldAlert,
  Sliders,
  Bell,
  Globe,
  Zap,
  Clock,
  Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StudioAuthProps {
  project: Tenant;
}

export const StudioAuth: React.FC<StudioAuthProps> = ({ project }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [activeSubTab, setActiveSubTab] = useState("users");
  const [drawerTab, setDrawerTab] = useState<"overview" | "logs" | "raw">("overview");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedUuid, setCopiedUuid] = useState(false);

  // Add User Form State
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("authenticated");
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${project.slug}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        // If drawer is open, keep selectedUser updated
        if (selectedUser) {
          const updated = (data.users || []).find((u: any) => u.id === selectedUser.id);
          if (updated) setSelectedUser(updated);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [project.slug]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setCreating(true);
    try {
      const res = await fetch(`/api/auth/${project.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName, role, phone }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setEmail("");
        setFullName("");
        setPhone("");
        await fetchUsers();
      } else {
        const data = await res.json();
        alert(`Kullanıcı oluşturulama hatası: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Sunucu bağlantı hatası oluştu.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Bu kullanıcıyı kalıcı olarak silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/auth/${project.slug}?id=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (selectedUser?.id === userId) setSelectedUser(null);
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUuid(true);
    setTimeout(() => setCopiedUuid(false), 2000);
  };

  // Filter users by email or ID or name
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.email || "").toLowerCase().includes(q) ||
      (u.id || "").toLowerCase().includes(q) ||
      (u.full_name || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-full min-h-screen bg-[#121212] text-slate-200 font-sans select-none overflow-hidden">
      {/* 1. Left Authentication Sub-Sidebar */}
      <aside className="w-56 border-r border-[#242424] bg-[#171717] flex flex-col justify-between p-3 text-xs shrink-0">
        <div className="space-y-6">
          <div className="px-2 pt-1 font-bold text-white text-sm flex items-center justify-between">
            <span>Authentication</span>
          </div>

          {/* MANAGE Section */}
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Manage</div>
            <button
              onClick={() => setActiveSubTab("users")}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition ${
                activeSubTab === "users"
                  ? "bg-[#242424] text-white font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-[#1c1c1c]"
              }`}
            >
              <UsersIcon className="w-4 h-4 text-slate-400" />
              <span>Users</span>
            </button>
            <button
              onClick={() => setActiveSubTab("oauth_apps")}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-[#1c1c1c] transition"
            >
              <Shield className="w-4 h-4 text-slate-400" />
              <span>OAuth Apps</span>
            </button>
          </div>

          {/* NOTIFICATIONS Section */}
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Notifications</div>
            <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-[#1c1c1c] transition">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>Emails</span>
            </button>
          </div>

          {/* CONFIGURATION Section */}
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Configuration</div>
            {[
              { label: "Policies", icon: Shield },
              { label: "Sign In / Providers", icon: Key },
              { label: "Passkeys", icon: Lock, badge: "BETA" },
              { label: "OAuth Server", icon: Globe, badge: "BETA" },
              { label: "Sessions", icon: Clock },
              { label: "Rate Limits", icon: Sliders },
              { label: "Multi-Factor", icon: ShieldAlert },
              { label: "URL Configuration", icon: ExternalLink },
              { label: "Attack Protection", icon: Shield },
              { label: "Auth Hooks", icon: Zap, badge: "BETA" },
              { label: "Audit Logs", icon: Code2 },
              { label: "Performance", icon: Sliders },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-[#1c1c1c] transition"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <item.icon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1 py-0.2 text-[9px] font-bold bg-[#282828] text-amber-400 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#121212] overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-[#242424] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white tracking-tight">Users</h2>
            <span className="text-xs text-slate-500 font-mono">Total: {users.length} users</span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Dropdown & Input */}
            <div className="flex items-center bg-[#171717] border border-[#2e2e2e] rounded-lg overflow-hidden text-xs">
              <button className="px-3 py-1.5 border-r border-[#2e2e2e] text-slate-400 flex items-center gap-1 hover:text-white">
                Email address
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="relative flex items-center px-2">
                <Search className="w-3.5 h-3.5 text-slate-500 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by email..."
                  className="bg-transparent text-white placeholder-slate-500 outline-none w-48 py-1.5"
                />
              </div>
            </div>

            <button className="px-3 py-1.5 rounded-lg bg-[#171717] border border-[#2e2e2e] text-slate-400 hover:text-white text-xs flex items-center gap-1">
              All columns
              <ChevronDown className="w-3 h-3" />
            </button>

            <button className="px-3 py-1.5 rounded-lg bg-[#171717] border border-[#2e2e2e] text-slate-400 hover:text-white text-xs flex items-center gap-1">
              Sorted by user ID
              <ChevronDown className="w-3 h-3" />
            </button>

            <Button
              variant="emerald"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add user
            </Button>

            <button
              onClick={fetchUsers}
              className="p-2 rounded-lg bg-[#171717] border border-[#282828] text-slate-400 hover:text-white transition"
              title="Yenile"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* User Table Grid */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-500 text-xs">
              <Loader2 className="w-5 h-5 animate-spin mr-2 text-emerald-400" />
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 border border-dashed border-[#282828] rounded-xl text-center flex flex-col items-center justify-center space-y-3">
              <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">No users found</h4>
                <p className="text-xs text-slate-400 mt-1">There are no users registered under project /{project.slug}. Click 'Add user' to create one.</p>
              </div>
              <Button variant="emerald" size="sm" onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add user
              </Button>
            </div>
          ) : (
            <div className="border border-[#242424] rounded-lg overflow-hidden bg-[#171717]">
              <table className="w-full text-left text-xs font-mono select-text">
                <thead className="bg-[#1c1c1c] text-slate-400 border-b border-[#242424] text-[11px] uppercase">
                  <tr>
                    <th className="p-3 w-10 text-center">
                      <input type="checkbox" className="rounded accent-emerald-500 cursor-pointer" />
                    </th>
                    <th className="p-3 w-10"></th>
                    <th className="p-3">UID</th>
                    <th className="p-3">Display name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Providers</th>
                    <th className="p-3">Provider type</th>
                    <th className="p-3 text-right">Created at</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242424]">
                  {filteredUsers.map((u) => {
                    const isSelected = selectedUser?.id === u.id;
                    return (
                      <tr
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className={`cursor-pointer transition ${
                          isSelected ? "bg-[#242424] text-white" : "hover:bg-[#1f1f1f] text-slate-300"
                        }`}
                      >
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded accent-emerald-500 cursor-pointer" />
                        </td>
                        <td className="p-3 text-slate-500">
                          <div className="w-6 h-6 rounded-full bg-[#242424] flex items-center justify-center text-slate-400">
                            <User className="w-3.5 h-3.5" />
                          </div>
                        </td>
                        <td className="p-3 text-slate-400 font-mono text-[11px]">{u.id}</td>
                        <td className="p-3 text-white font-medium">{u.full_name || "-"}</td>
                        <td className="p-3 text-emerald-400 font-medium">{u.email}</td>
                        <td className="p-3 text-slate-500">{u.phone || "-"}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#242424] border border-[#333] text-[10px] text-slate-300">
                            <Mail className="w-3 h-3 text-emerald-400" />
                            Email
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">-</td>
                        <td className="p-3 text-right text-slate-500 text-[11px]">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 3. Right Slide-Over Drawer (User Details Panel - Matching Screenshot Birebir) */}
      {selectedUser && (
        <aside className="w-96 border-l border-[#242424] bg-[#171717] flex flex-col justify-between overflow-y-auto shrink-0 animate-slide-in select-text">
          <div>
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#242424] flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <span className="font-bold text-white text-sm truncate">{selectedUser.email}</span>
                <button
                  onClick={() => copyToClipboard(selectedUser.id)}
                  className="p-1 rounded text-slate-400 hover:text-white transition"
                  title="Copy UUID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-md hover:bg-[#282828] text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Tabs (Overview, Logs, Raw JSON) */}
            <div className="flex items-center border-b border-[#242424] px-4 text-xs font-medium">
              {(["overview", "logs", "raw"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDrawerTab(tab)}
                  className={`py-2.5 px-3 border-b-2 capitalize transition ${
                    drawerTab === tab
                      ? "border-emerald-400 text-white font-bold"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  {tab === "raw" ? "Raw JSON" : tab}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview */}
            {drawerTab === "overview" && (
              <div className="p-4 space-y-6 text-xs">
                {/* User Metadata Grid */}
                <div className="space-y-2.5 font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>User UID</span>
                    <span className="text-white text-[11px] select-all">{selectedUser.id}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Created at</span>
                    <span className="text-white text-[11px]">
                      {new Date(selectedUser.created_at || Date.now()).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Updated at</span>
                    <span className="text-white text-[11px]">
                      {new Date(selectedUser.updated_at || Date.now()).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Invited at</span>
                    <span className="text-slate-600">-</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Confirmation sent at</span>
                    <span className="text-slate-600">-</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Confirmed at</span>
                    <span className="text-white text-[11px]">
                      {new Date(selectedUser.created_at || Date.now()).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Last signed in</span>
                    <span className="text-slate-600">-</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>SSO</span>
                    <span className="text-rose-500 font-bold">✖</span>
                  </div>
                </div>

                {/* Provider Information Section */}
                <div className="space-y-2 pt-2 border-t border-[#242424]">
                  <h4 className="font-bold text-white text-xs">Provider Information</h4>
                  <p className="text-[11px] text-slate-400 leading-tight">The user has the following providers</p>

                  <div className="p-3 rounded-lg bg-[#121212] border border-[#282828] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="font-bold text-white text-xs">Email</div>
                        <div className="text-[10px] text-slate-400">Signed in with a email account via OAuth</div>
                      </div>
                    </div>
                    <Badge variant="success">Enabled</Badge>
                  </div>
                </div>

                {/* User Actions Section */}
                <div className="space-y-3 pt-2 border-t border-[#242424]">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#121212] border border-[#282828]">
                    <div>
                      <div className="font-semibold text-white">Reset password</div>
                      <div className="text-[10px] text-slate-400">Send a password recovery email to the user</div>
                    </div>
                    <button className="px-2.5 py-1 rounded bg-[#242424] border border-[#333] text-[11px] text-slate-300 hover:text-white transition">
                      Send password recovery
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#121212] border border-[#282828]">
                    <div>
                      <div className="font-semibold text-white">Send magic link</div>
                      <div className="text-[10px] text-slate-400">Send a passwordless magic link to the user</div>
                    </div>
                    <button className="px-2.5 py-1 rounded bg-[#242424] border border-[#333] text-[11px] text-slate-300 hover:text-white transition">
                      Send magic link
                    </button>
                  </div>
                </div>

                {/* Danger Zone Section */}
                <div className="space-y-2.5 pt-2 border-t border-[#242424]">
                  <h4 className="font-bold text-rose-400 text-xs">Danger zone</h4>
                  <p className="text-[11px] text-slate-400 leading-tight">Be wary of the following features as they cannot be undone.</p>

                  <div className="p-3 rounded-lg bg-[#121212] border border-rose-500/20 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">Remove MFA factors</div>
                        <div className="text-[10px] text-slate-400">Removes all MFA factors associated with the user</div>
                      </div>
                      <button className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px]">
                        Remove MFA
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#242424]">
                      <div>
                        <div className="font-semibold text-white">Ban user</div>
                        <div className="text-[10px] text-slate-400">Revoke access to the project for a set duration</div>
                      </div>
                      <button className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                        Ban user
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#242424]">
                      <div>
                        <div className="font-semibold text-white">Delete user</div>
                        <div className="text-[10px] text-slate-400">User will no longer have access to the project</div>
                      </div>
                      <button
                        onClick={() => handleDeleteUser(selectedUser.id)}
                        className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition shadow"
                      >
                        Delete user
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Logs */}
            {drawerTab === "logs" && (
              <div className="p-4 text-xs text-slate-400 space-y-2 font-mono">
                <div className="p-3 rounded-lg bg-[#121212] border border-[#282828]">
                  <div className="text-emerald-400 font-bold">AUTH_USER_CREATED</div>
                  <div className="text-[10px] text-slate-500 mt-1">{new Date(selectedUser.created_at).toISOString()}</div>
                </div>
              </div>
            )}

            {/* Tab 3: Raw JSON */}
            {drawerTab === "raw" && (
              <div className="p-4 text-xs">
                <pre className="p-3 rounded-lg bg-[#121212] border border-[#282828] font-mono text-emerald-400 overflow-x-auto text-[11px]">
                  {JSON.stringify(selectedUser, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* 4. Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-text">
          <div className="w-full max-w-md bg-[#171717] rounded-xl border border-[#282828] p-6 text-slate-200 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-[#282828] text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Create new user</h3>
            <p className="text-xs text-slate-400 mb-4">Add a new user credential to /{project.slug}.</p>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">User Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Display Name (Full Name)</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ahmet Yılmaz"
                  className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+90 555 000 0000"
                  className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">User Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-emerald-400 font-mono outline-none cursor-pointer"
                >
                  <option value="authenticated">authenticated (Standard Registered Member)</option>
                  <option value="anon">anon (Anonymous / Public Visitor)</option>
                  <option value="admin">admin (Project Super Admin)</option>
                  <option value="service_role">service_role (Backend System Service)</option>
                </select>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="emerald" disabled={creating} className="w-full py-2.5">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Create user
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
