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
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  // Drag and Drop state
  const [isDragging, setIsDragging] = useState(false);

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

  const uploadFile = async (fileObj: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", fileObj);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) uploadFile(selectedFile);
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) uploadFile(droppedFile);
  };

  const handleDeleteFile = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete '${filename}'?`)) return;

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

  const isImageFile = (filename: string) => {
    return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(filename);
  };

  return (
    <div className="flex h-full min-h-screen bg-[#121212] text-slate-200 font-sans select-none overflow-hidden">
      {/* 1. Left Storage Sub-Sidebar */}
      <aside className="w-56 bg-[#171717] border-r border-[#242424] p-3 space-y-3 flex flex-col shrink-0">
        <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Buckets ({buckets.length})</span>
          <button
            onClick={() => setShowBucketModal(true)}
            className="p-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition cursor-pointer"
            title="Create Bucket"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
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
      </aside>

      {/* 2. Main Files Area with Drag-and-Drop Dropzone */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#121212] overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-3 border-b border-[#242424] bg-[#171717] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-emerald-400 font-bold text-sm">
              Bucket: /{bucket}
            </span>
            <Badge variant="secondary">{files.length} files</Badge>
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-sm">
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>Upload file</span>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={fetchFiles}
              className="p-2 rounded-lg bg-[#121212] border border-[#282828] text-slate-400 hover:text-white transition cursor-pointer"
              title="Refresh Files"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dropzone & File Grid Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 p-4 overflow-auto transition relative ${
            isDragging ? "bg-emerald-500/10 border-2 border-dashed border-emerald-500" : ""
          }`}
        >
          {isDragging && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="text-emerald-400 font-bold text-base flex items-center gap-2">
                <Upload className="w-6 h-6 animate-bounce" />
                Drop file to upload to /{bucket}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-500 text-xs font-mono">
              <Loader2 className="w-5 h-5 animate-spin mr-2 text-emerald-400" />
              Loading bucket files...
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-[#282828] rounded-xl text-slate-500 text-xs space-y-3 p-8">
              <HardDrive className="w-10 h-10 opacity-30 text-emerald-400" />
              <div className="text-center">
                <h4 className="text-sm font-bold text-white">Bucket /{bucket} is empty</h4>
                <p className="text-xs text-slate-400 mt-1">Drag and drop files here or click 'Upload file' to upload.</p>
              </div>
              <label className="cursor-pointer flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-sm">
                <Upload className="w-4 h-4" />
                <span>Upload file</span>
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-[#171717] border border-[#242424] hover:border-slate-700 transition overflow-hidden flex flex-col justify-between group"
                >
                  {/* File Preview Thumbnail */}
                  <div className="h-32 bg-[#09090b] flex items-center justify-center overflow-hidden border-b border-[#242424] relative">
                    {isImageFile(file.name) ? (
                      <img
                        src={file.publicUrl}
                        alt={file.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <File className="w-10 h-10 text-blue-400 opacity-60" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="p-3 text-xs font-mono space-y-2 select-text">
                    <div className="font-semibold text-white truncate" title={file.name}>
                      {file.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB • {new Date(file.updatedAt).toLocaleDateString()}
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 text-[11px] h-7"
                        onClick={() => copyUrl(file.publicUrl, idx)}
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3 h-3 text-emerald-400 mr-1" />
                        ) : (
                          <Copy className="w-3 h-3 mr-1" />
                        )}
                        {copiedIndex === idx ? "Copied" : "Copy URL"}
                      </Button>

                      <button
                        onClick={() => handleDeleteFile(file.name)}
                        className="p-1.5 rounded bg-[#242424] text-slate-400 hover:text-rose-400 hover:bg-[#2e2e2e] transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. New Bucket Modal */}
      {showBucketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-text">
          <div className="w-full max-w-md bg-[#171717] rounded-xl border border-[#282828] p-6 text-slate-200 shadow-2xl relative">
            <button onClick={() => setShowBucketModal(false)} className="absolute top-4 right-4 p-1 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Create new bucket</h3>
            <p className="text-xs text-slate-400 mb-4">Define a new S3-compatible media storage bucket.</p>

            <form onSubmit={handleCreateBucket} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Bucket Name *</label>
                <input
                  type="text"
                  required
                  value={newBucketName}
                  onChange={(e) => setNewBucketName(e.target.value)}
                  placeholder="e.g. avatars, invoices, logos"
                  className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-[#282828] text-emerald-400 font-mono outline-none"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#121212] border border-[#282828] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">Public Bucket</div>
                  <div className="text-[10px] text-slate-400">Files can be accessed directly via public URL.</div>
                </div>

                <input
                  type="checkbox"
                  checked={isPublicBucket}
                  onChange={(e) => setIsPublicBucket(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500"
                />
              </div>

              <Button type="submit" variant="emerald" disabled={creatingBucket} className="w-full py-2.5">
                {creatingBucket ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FolderPlus className="w-4 h-4 mr-2" />}
                Create bucket
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
