"use client";

import React, { useState, useEffect } from "react";
import { Tenant } from "@/db/schema";
import {
  HardDrive,
  Upload,
  Plus,
  Folder,
  File,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  RefreshCw,
  FolderPlus,
  Globe,
  Lock,
  X,
} from "lucide-react";

interface StudioStorageProps {
  project: Tenant;
}

export const StudioStorage: React.FC<StudioStorageProps> = ({ project }) => {
  const [buckets, setBuckets] = useState<any[]>([{ name: "public", isPublic: true }]);
  const [bucket, setBucket] = useState("public");
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // New Bucket Modal State
  const [showBucketModal, setShowBucketModal] = useState(false);
  const [newBucketName, setNewBucketName] = useState("");
  const [isPublicBucket, setIsPublicBucket] = useState(true);
  const [creatingBucket, setCreatingBucket] = useState(false);

  const fetchBuckets = async () => {
    try {
      const res = await fetch(`/api/storage/${project.slug}?mode=buckets`);
      const data = await res.json();
      if (data.success && Array.isArray(data.buckets)) {
        setBuckets(data.buckets);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/storage/${project.slug}?bucket=${bucket}`);
      const data = await res.json();
      if (data.success) {
        setFiles(data.files || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuckets();
  }, [project.slug]);

  useEffect(() => {
    fetchFiles();
  }, [bucket, project.slug]);

  const handleCreateBucket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucketName) return;

    setCreatingBucket(true);
    try {
      const res = await fetch(`/api/storage/${project.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_bucket",
          bucketName: newBucketName,
          isPublic: isPublicBucket,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowBucketModal(false);
        setNewBucketName("");
        await fetchBuckets();
        setBucket(data.bucket.name);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingBucket(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("bucket", bucket);

    try {
      const res = await fetch(`/api/storage/${project.slug}`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        fetchFiles();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (filename: string) => {
    if (!confirm(`'${filename}' dosyasını silmek istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch(`/api/storage/${project.slug}?bucket=${bucket}&file=${filename}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchFiles();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyUrl = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#121212] min-h-full text-slate-200 select-text">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Storage Buckets Manager</h2>
          <p className="text-xs text-slate-400">Multi-tenant S3 & Public Media Storage Manager for /{project.slug}.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBucketModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#242424] border border-[#333] hover:bg-[#282828] text-xs font-bold text-slate-200 transition cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-amber-400" />
            <span>Yeni Bucket Oluştur</span>
          </button>

          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20">
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>Dosya Yükle ({bucket})</span>
            <input type="file" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={fetchFiles}
            className="p-2 rounded-lg bg-[#171717] border border-[#282828] hover:text-white text-slate-400 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Storage Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Buckets List */}
        <div className="p-4 rounded-xl bg-[#171717] border border-[#282828] space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            <span>Buckets ({buckets.length})</span>
            <button
              onClick={() => setShowBucketModal(true)}
              className="p-1 rounded hover:bg-[#282828] text-amber-400"
              title="Yeni Bucket Ekle"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {buckets.map((b) => (
              <button
                key={b.name}
                onClick={() => setBucket(b.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition cursor-pointer ${
                  bucket === b.name
                    ? "bg-[#242424] text-emerald-400 border border-[#333] font-bold"
                    : "text-slate-400 hover:text-white hover:bg-[#1f1f1f]"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Folder className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="truncate">{b.name}</span>
                </div>
                {b.isPublic ? (
                  <Globe className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                ) : (
                  <Lock className="w-3 h-3 text-slate-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Files Grid */}
        <div className="md:col-span-3 p-6 rounded-xl bg-[#171717] border border-[#282828] space-y-4">
          <div className="flex items-center justify-between border-b border-[#282828] pb-3 text-xs">
            <span className="font-mono text-emerald-400 font-bold">Bucket: /{bucket}</span>
            <span className="text-slate-500 font-mono">{files.length} Files</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-500 text-xs">
              Dosyalar yükleniyor...
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-xs space-y-2">
              <HardDrive className="w-8 h-8 opacity-30 text-emerald-400" />
              <span>Bu bucket ('/{bucket}') içerisinde henüz hiç dosya yok. 'Dosya Yükle' butonuna basarak dosya yükleyebilirsiniz.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#121212] border border-[#282828] hover:border-slate-700 transition text-xs font-mono"
                >
                  <div className="flex items-center gap-3 truncate">
                    <File className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <div className="truncate">
                      <div className="text-white font-medium truncate">{file.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {(file.size / 1024).toFixed(1)} KB • {new Date(file.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyUrl(file.publicUrl, idx)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#242424] hover:bg-[#282828] text-slate-300 transition text-[11px] cursor-pointer"
                      title="Public URL Kopyala"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedIndex === idx ? "Kopyalandı!" : "URL Kopyala"}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteFile(file.name)}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-[#282828] transition cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Bucket Modal */}
      {showBucketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#171717] rounded-xl border border-[#282828] p-6 text-slate-200 shadow-2xl relative">
            <button
              onClick={() => setShowBucketModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-[#282828] text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Yeni Storage Bucket Oluştur</h3>
            <p className="text-xs text-slate-400 mb-4">Medya, afiş ve logolarınız için yeni bir depolama alanı tanımlayın.</p>

            <form onSubmit={handleCreateBucket} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Bucket Adı</label>
                <input
                  type="text"
                  required
                  value={newBucketName}
                  onChange={(e) => setNewBucketName(e.target.value)}
                  placeholder="Örn: saas-emlak-media, avatars, logos"
                  className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-emerald-400 font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#121212] border border-[#282828] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">Public Bucket</div>
                  <div className="text-[10px] text-slate-400">Herkes dosyalara doğrudan URL ile erişebilir.</div>
                </div>

                <input
                  type="checkbox"
                  checked={isPublicBucket}
                  onChange={(e) => setIsPublicBucket(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={creatingBucket}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition cursor-pointer"
              >
                {creatingBucket ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
                Bucket Oluştur
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
