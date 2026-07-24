"use client";

import React, { useState, useEffect } from "react";
import { Tenant } from "@/db/schema";
import {
  Users,
  Mail,
  Shield,
  Plus,
  Trash2,
  CheckCircle,
  RefreshCw,
  Loader2,
  X,
  UserCheck,
} from "lucide-react";

interface StudioAuthProps {
  project: Tenant;
}

export const StudioAuth: React.FC<StudioAuthProps> = ({ project }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("user");
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${project.slug}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
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
        body: JSON.stringify({ email, fullName, role }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setEmail("");
        setFullName("");
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Kullanıcıyı silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/auth/${project.slug}?id=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#121212] min-h-full text-slate-200 select-text">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Kullanıcı & Müşteri Yöneticisi (Auth)</h2>
          <p className="text-xs text-slate-400">Manage registered users, roles, and access credentials for /{project.slug}.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Yeni Kullanıcı Ekle
          </button>

          <button
            onClick={fetchUsers}
            className="p-2 rounded-lg bg-[#171717] border border-[#282828] text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl bg-[#171717] border border-[#282828] overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-[#282828] pb-3 text-xs">
          <span className="flex items-center gap-2 font-bold text-white">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Kayıtlı Kullanıcılar (Profiles & GoTrue)
          </span>
          <span className="text-slate-500 font-mono">{users.length} Kayıtlı Kullanıcı</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-500 text-xs">
            Kullanıcılar yükleniyor...
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 border border-dashed border-[#282828] rounded-xl text-center flex flex-col items-center justify-center text-xs text-slate-500 space-y-2">
            <Mail className="w-8 h-8 opacity-40 text-emerald-400" />
            <span>Bu projede henüz hiç kayıtlı müşteri/kullanıcı yok. 'Yeni Kullanıcı Ekle' butonuna basarak ekleyebilirsiniz.</span>
          </div>
        ) : (
          <div className="rounded-xl border border-[#282828] overflow-hidden bg-[#121212]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#1f1f1f] text-slate-400 border-b border-[#282828] uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">E-Posta Adresi</th>
                  <th className="px-4 py-3">Ad Soyad</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Kayıt Tarihi</th>
                  <th className="px-4 py-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#282828]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#1f1f1f]/50 transition">
                    <td className="px-4 py-3 text-emerald-400 font-semibold">{u.email}</td>
                    <td className="px-4 py-3 text-slate-200">{u.full_name || "-"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase">
                        {u.role || "user"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-[#282828] transition"
                        title="Sil / Engelle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#171717] rounded-xl border border-[#282828] p-6 text-slate-200 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-[#282828] text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Yeni Kullanıcı Ekle</h3>
            <p className="text-xs text-slate-400 mb-4">Projenize yeni bir kullanıcı / müşteri tanımlayın.</p>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">E-Posta Adresi</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="musteri@example.com"
                  className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Ad Soyad (İsteğe Bağlı)</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Caner Yılmaz"
                  className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Kullanıcı Rolü</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-emerald-400 outline-none"
                >
                  <option value="user">user (Müşteri / Son Kullanıcı)</option>
                  <option value="admin">admin (Yönetici)</option>
                  <option value="editor">editor (Editör)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition mt-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Kullanıcıyı Kaydet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
