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
  activeSubMenu: string;
}

export const StudioAuth: React.FC<StudioAuthProps> = ({ project, activeSubMenu }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
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
    if (activeSubMenu === "users") {
      fetchUsers();
    }
  }, [project.slug, activeSubMenu]);

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
  return (
    <div className="flex h-full bg-[#1c1c1c] text-[#ededed] font-sans select-none overflow-hidden">
      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1c1c1c] overflow-hidden relative">
        {activeSubMenu === "users" && (
          <>
            {/* Top Control Bar */}
            <div className="p-4 border-b border-[#2e2e2e] flex flex-wrap items-center justify-between gap-3 bg-[#1c1c1c]">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-medium text-[#ededed] tracking-tight">Users</h2>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Search Dropdown & Input */}
                <div className="flex items-center bg-[#242424] border border-[#3e3e3e] rounded-md overflow-hidden text-sm">
                  <div className="relative flex items-center px-2">
                    <Search className="w-4 h-4 text-slate-500 mr-2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by email..."
                      className="bg-transparent text-[#ededed] placeholder-slate-500 outline-none w-48 py-1.5"
                    />
                  </div>
                </div>

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
                  className="p-2 rounded-md bg-[#242424] border border-[#3e3e3e] text-slate-400 hover:text-white transition"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* User Table Grid */}
            <div className="flex-1 overflow-auto bg-[#1c1c1c]">
              {loading ? (
                <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
                  <Loader2 className="w-5 h-5 animate-spin mr-2 text-brand" />
                  Loading users...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="p-8 border border-dashed border-[#3e3e3e] rounded-xl text-center flex flex-col items-center justify-center space-y-3 max-w-sm">
                    <div className="p-3 rounded-full bg-brand/10 text-brand border border-brand/20">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[#ededed]">No users found</h4>
                      <p className="text-sm text-slate-400 mt-1">There are no users registered under project /{project.slug}.</p>
                    </div>
                    <Button variant="emerald" size="sm" onClick={() => setShowAddModal(true)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add user
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-b border-[#2e2e2e] bg-[#1c1c1c]">
                  <table className="w-full text-left text-sm font-sans select-text">
                    <thead className="bg-[#1c1c1c] text-[#8b8b8b] border-b border-[#2e2e2e] text-xs">
                      <tr>
                        <th className="p-3 w-10 text-center font-normal">
                          <input type="checkbox" className="rounded border-[#3e3e3e] bg-[#242424] cursor-pointer" />
                        </th>
                        <th className="p-3 w-10 font-normal"></th>
                        <th className="p-3 font-normal">Email</th>
                        <th className="p-3 font-normal">Phone</th>
                        <th className="p-3 font-normal">Providers</th>
                        <th className="p-3 font-normal">Created</th>
                        <th className="p-3 font-normal">Last Sign In</th>
                        <th className="p-3 font-normal">UID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2e2e2e]">
                      {filteredUsers.map((u) => {
                        const isSelected = selectedUser?.id === u.id;
                        return (
                          <tr
                            key={u.id}
                            onClick={() => setSelectedUser(u)}
                            className={`cursor-pointer transition ${
                              isSelected ? "bg-[#2e2e2e]" : "hover:bg-[#242424]"
                            }`}
                          >
                            <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <input type="checkbox" className="rounded border-[#3e3e3e] bg-[#242424] cursor-pointer" />
                            </td>
                            <td className="p-3 text-[#8b8b8b]">
                              <div className="w-6 h-6 rounded-full bg-[#2e2e2e] flex items-center justify-center text-[#8b8b8b]">
                                <User className="w-3.5 h-3.5" />
                              </div>
                            </td>
                            <td className="p-3 text-[#ededed] font-medium">{u.email}</td>
                            <td className="p-3 text-[#8b8b8b]">{u.phone || "-"}</td>
                            <td className="p-3">
                              <span className="inline-flex items-center gap-1.5 text-xs text-[#8b8b8b]">
                                <Mail className="w-3.5 h-3.5" />
                                email
                              </span>
                            </td>
                            <td className="p-3 text-[#8b8b8b] text-xs">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}
                            </td>
                            <td className="p-3 text-[#8b8b8b] text-xs">Waiting for login</td>
                            <td className="p-3 text-[#8b8b8b] font-mono text-xs">{u.id}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeSubMenu === "providers" && (
          <div className="p-8 w-full max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-medium text-[#ededed] mb-1">Auth Providers</h2>
              <p className="text-sm text-[#8b8b8b]">Configure how your users log in to your application.</p>
            </div>
            
            <div className="border border-[#2e2e2e] rounded-md bg-[#1c1c1c] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-[#2e2e2e] hover:bg-[#242424] cursor-pointer transition">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-md bg-[#242424] border border-[#3e3e3e] flex items-center justify-center">
                    <Mail className="w-4 h-4 text-[#ededed]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#ededed]">Email</h3>
                    <p className="text-xs text-[#8b8b8b]">Authenticate users with email and password</p>
                  </div>
                </div>
                <Badge variant="success" className="bg-brand/10 text-brand border-none text-xs px-2 py-0.5">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border-b border-[#2e2e2e] hover:bg-[#242424] cursor-pointer transition">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-md bg-[#242424] border border-[#3e3e3e] flex items-center justify-center">
                    <Globe className="w-4 h-4 text-[#ededed]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#ededed]">Google</h3>
                    <p className="text-xs text-[#8b8b8b]">Authenticate users with Google</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[#8b8b8b] border-[#3e3e3e] text-xs px-2 py-0.5">Disabled</Badge>
              </div>
            </div>
          </div>
        )}

        {activeSubMenu === "policies" && (
          <div className="p-8 w-full max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-medium text-[#ededed] mb-1">Auth Policies</h2>
              <p className="text-sm text-[#8b8b8b]">Configure password requirements and security settings.</p>
            </div>
            <div className="border border-[#2e2e2e] rounded-md bg-[#1c1c1c] p-6 space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-[#ededed]">Minimum Password Length</h3>
                <input type="number" defaultValue={6} className="w-32 bg-[#242424] border border-[#3e3e3e] rounded-md px-3 py-1.5 text-sm text-[#ededed]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Right Slide-Over Drawer (User Details Panel) */}
      {selectedUser && activeSubMenu === "users" && (
        <aside className="w-[400px] border-l border-[#2e2e2e] bg-[#1c1c1c] flex flex-col justify-between overflow-y-auto shrink-0 animate-slide-in select-text absolute right-0 top-0 bottom-0 z-20 shadow-2xl">
          <div>
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#2e2e2e] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-8 h-8 rounded-full bg-[#242424] flex items-center justify-center">
                    <User className="w-4 h-4 text-[#8b8b8b]" />
                  </div>
                  <span className="font-medium text-[#ededed] text-base truncate">{selectedUser.email}</span>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 rounded-md hover:bg-[#2e2e2e] text-[#8b8b8b] transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawer Tabs (Overview, Logs, Raw JSON) */}
            <div className="flex items-center border-b border-[#2e2e2e] px-5 text-sm font-medium">
              {(["overview", "logs", "raw"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDrawerTab(tab)}
                  className={`py-3 mr-6 capitalize transition border-b-2 ${
                    drawerTab === tab
                      ? "border-white text-white"
                      : "border-transparent text-[#8b8b8b] hover:text-[#ededed]"
                  }`}
                >
                  {tab === "raw" ? "Raw JSON" : tab}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview */}
            {drawerTab === "overview" && (
              <div className="p-5 space-y-8 text-sm">
                {/* User Metadata Grid */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-1 text-[#8b8b8b]">
                    <span>User UID</span>
                    <span className="text-[#ededed] font-mono select-all flex items-center gap-2">
                      {selectedUser.id}
                      <button onClick={() => copyToClipboard(selectedUser.id)} className="hover:text-white"><Copy className="w-3.5 h-3.5"/></button>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-[#8b8b8b]">
                      <span>Created at</span>
                      <span className="text-[#ededed]">
                        {new Date(selectedUser.created_at || Date.now()).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-[#8b8b8b]">
                      <span>Updated at</span>
                      <span className="text-[#ededed]">
                        {new Date(selectedUser.updated_at || Date.now()).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Provider Information Section */}
                <div className="space-y-3 pt-4 border-t border-[#2e2e2e]">
                  <h4 className="font-medium text-[#ededed]">Provider Information</h4>
                  <div className="p-3 rounded-md bg-[#242424] border border-[#3e3e3e] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-[#8b8b8b]" />
                      <div>
                        <div className="font-medium text-[#ededed] text-sm">Email</div>
                      </div>
                    </div>
                    <Badge variant="success" className="bg-brand/10 text-brand border-none">Enabled</Badge>
                  </div>
                </div>

                {/* Danger Zone Section */}
                <div className="space-y-3 pt-4 border-t border-[#2e2e2e]">
                  <h4 className="font-medium text-rose-500">Danger zone</h4>
                  <div className="p-4 rounded-md border border-rose-500/20 space-y-4 bg-rose-500/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-[#ededed]">Delete user</div>
                        <div className="text-xs text-[#8b8b8b] mt-0.5">User will no longer have access to the project</div>
                      </div>
                      <button
                        onClick={() => handleDeleteUser(selectedUser.id)}
                        className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition shadow"
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
              <div className="p-5 text-sm text-[#8b8b8b] space-y-3 font-mono">
                <div className="p-4 rounded-md bg-[#242424] border border-[#3e3e3e]">
                  <div className="text-brand font-medium">AUTH_USER_CREATED</div>
                  <div className="text-xs text-[#8b8b8b] mt-1">{new Date(selectedUser.created_at).toISOString()}</div>
                </div>
              </div>
            )}

            {/* Tab 3: Raw JSON */}
            {drawerTab === "raw" && (
              <div className="p-5 text-sm">
                <pre className="p-4 rounded-md bg-[#242424] border border-[#3e3e3e] font-mono text-brand overflow-x-auto text-xs">
                  {JSON.stringify(selectedUser, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* 4. Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-text">
          <div className="w-full max-w-md bg-[#1c1c1c] rounded-xl border border-[#2e2e2e] p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-[#2e2e2e] text-[#8b8b8b] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-medium text-[#ededed] mb-1">Add user</h3>
            <p className="text-sm text-[#8b8b8b] mb-6">Create a new user for your project.</p>

            <form onSubmit={handleCreateUser} className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="block text-[#ededed] font-medium">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 rounded-md bg-[#242424] border border-[#3e3e3e] text-[#ededed] outline-none focus:border-brand transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[#ededed] font-medium">Password (Auto-generated)</label>
                <input
                  type="text"
                  disabled
                  placeholder="A secure password will be generated"
                  className="w-full px-3 py-2 rounded-md bg-[#1c1c1c] border border-[#2e2e2e] text-[#8b8b8b] outline-none opacity-70"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-md border border-[#3e3e3e] text-[#ededed] hover:bg-[#242424] font-medium transition"
                >
                  Cancel
                </button>
                <Button type="submit" variant="emerald" disabled={creating} className="px-4 py-2">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
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
