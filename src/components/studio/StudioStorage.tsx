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
} from "lucide-react";

interface StudioStorageProps {
  project: Tenant;
}

export const StudioStorage: React.FC<StudioStorageProps> = ({ project }) => {
  const [bucket, setBucket] = useState("public");
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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
    fetchFiles();
  }, [bucket, project.slug]);

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
    <div className="p-6 md:p-8 space-y-8 bg-[#121212] min-h-full text-slate-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Storage Buckets</h2>
          <p className="text-xs text-slate-400">Multi-tenant S3 & Local Storage Manager for /{project.slug}.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20">
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>Upload File</span>
            <input type="file" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={fetchFiles}
            className="p-2 rounded-lg bg-[#171717] border border-[#282828] hover:text-white text-slate-400"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Storage Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Buckets List */}
        <div className="p-4 rounded-xl bg-[#171717] border border-[#282828] space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Buckets
          </div>

          <div className="space-y-1">
            {["public", "avatars", "documents"].map((b) => (
              <button
                key={b}
                onClick={() => setBucket(b)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  bucket === b
                    ? "bg-[#242424] text-emerald-400 border border-[#333]"
                    : "text-slate-400 hover:text-white hover:bg-[#1f1f1f]"
                }`}
              >
                <Folder className="w-4 h-4 text-amber-400" />
                <span>{b}</span>
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
              <span>Bu bucket içerisinde henüz hiç dosya yok. 'Upload File' butonuna basarak dosya yükleyebilirsiniz.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#121212] border border-[#282828] hover:border-slate-700 transition text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <File className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-white font-medium">{file.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {(file.size / 1024).toFixed(1)} KB • {new Date(file.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyUrl(file.publicUrl, idx)}
                      className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#282828] transition"
                      title="Public URL Kopyala"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteFile(file.name)}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-[#282828] transition"
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
    </div>
  );
};
