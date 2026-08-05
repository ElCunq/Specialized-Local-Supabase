import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { docker } from "@/lib/docker/client";

const STORAGE_ROOT = process.env.STORAGE_DIR || "/app/data/storage";

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function executeSqlInTenantDb(slug: string, sql: string): Promise<string> {
  const containerName = `project_${slug}_db`;
  const container = docker.getContainer(containerName);

  const exec = await container.exec({
    Cmd: ["psql", "-U", "postgres", "-d", "postgres", "-t", "-A", "-c", sql],
    AttachStdout: true,
    AttachStderr: true,
  });

  return new Promise((resolve, reject) => {
    exec.start({}, (err, stream) => {
      if (err) return reject(err);
      let output = "";
      stream?.on("data", (chunk) => (output += chunk.toString("utf8")));
      stream?.on("end", () => resolve(output));
    });
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode");
    const bucket = searchParams.get("bucket") || "public";
    const subpath = searchParams.get("path") || "";
    const host = req.headers.get("host") || "db.orfa.dev";
    const protocol = req.headers.get("x-forwarded-proto") || "https";

    const projectRootDir = path.join(STORAGE_ROOT, slug);
    ensureDir(projectRootDir);

    // If requesting list of buckets
    if (mode === "buckets") {
      // Always ensure default 'public' bucket exists
      ensureDir(path.join(projectRootDir, "public"));
      const items = fs.readdirSync(projectRootDir, { withFileTypes: true });
      const buckets = items
        .filter((item) => item.isDirectory())
        .map((item) => ({
          name: item.name,
          isPublic: true,
          createdAt: fs.statSync(path.join(projectRootDir, item.name)).birthtime,
        }));

      return NextResponse.json({ success: true, buckets });
    }

    const projectStorageDir = path.join(projectRootDir, bucket, subpath);
    ensureDir(projectStorageDir);

    // List files and directories inside bucket
    const items = fs.readdirSync(projectStorageDir, { withFileTypes: true });

    const files = items.map((item) => {
      const itemPath = path.join(projectStorageDir, item.name);
      const stat = fs.statSync(itemPath);
      return {
        name: item.name,
        isDir: item.isDirectory(),
        size: item.isFile() ? stat.size : 0,
        updatedAt: stat.mtime,
        publicUrl: `${protocol}://${host}/api/storage/${slug}?bucket=${bucket}&file=${encodeURIComponent(item.name)}&download=true`,
      };
    });

    return NextResponse.json({ success: true, bucket, files });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const host = req.headers.get("host") || "db.orfa.dev";
    const protocol = req.headers.get("x-forwarded-proto") || "https";

    const contentType = req.headers.get("content-type") || "";

    // Check if JSON request (Create Bucket action)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { action, bucketName, isPublic } = body;

      if (action === "create_bucket" && bucketName) {
        const sanitizedBucket = bucketName.toLowerCase().replace(/[^a-z0-9_-]/g, "");
        const bucketDir = path.join(STORAGE_ROOT, slug, sanitizedBucket);
        ensureDir(bucketDir);

        // Optionally record in Postgres storage.buckets schema
        const initBucketSql = `
          CREATE SCHEMA IF NOT EXISTS storage;
          CREATE TABLE IF NOT EXISTS storage.buckets (
            id text PRIMARY KEY,
            name text NOT NULL,
            public boolean DEFAULT true,
            created_at timestamp with time zone DEFAULT now()
          );
          INSERT INTO storage.buckets (id, name, public)
          VALUES ('${sanitizedBucket}', '${sanitizedBucket}', ${isPublic !== false})
          ON CONFLICT (id) DO NOTHING;
        `;
        await executeSqlInTenantDb(slug, initBucketSql).catch(() => {});

        return NextResponse.json({
          success: true,
          message: `Bucket '${sanitizedBucket}' created successfully.`,
          bucket: { name: sanitizedBucket, isPublic: isPublic !== false },
        }, { status: 201 });
      }
    }

    // Multipart Form Data (File Upload)
    const formData = await req.formData();
    const bucket = (formData.get("bucket") as string) || "public";
    const file = formData.get("file") as File | null;
    const subpath = (formData.get("path") as string) || "";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided." }, { status: 400 });
    }

    const projectStorageDir = path.join(STORAGE_ROOT, slug, bucket, subpath);
    ensureDir(projectStorageDir);

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(projectStorageDir, file.name);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `${protocol}://${host}/api/storage/${slug}?bucket=${bucket}&file=${encodeURIComponent(file.name)}&download=true`;

    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        publicUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(req.url);
    const bucket = searchParams.get("bucket") || "public";
    const filename = searchParams.get("file");

    if (!filename) {
      return NextResponse.json({ success: false, error: "File name required" }, { status: 400 });
    }

    const filePath = path.join(STORAGE_ROOT, slug, bucket, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json({ success: true, message: `File ${filename} deleted.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
