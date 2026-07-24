import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const STORAGE_ROOT = process.env.STORAGE_DIR || "/app/data/storage";

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(req.url);
    const bucket = searchParams.get("bucket") || "public";
    const subpath = searchParams.get("path") || "";

    const projectStorageDir = path.join(STORAGE_ROOT, slug, bucket, subpath);
    ensureDir(projectStorageDir);

    // List files and directories
    const items = fs.readdirSync(projectStorageDir, { withFileTypes: true });

    const files = items.map((item) => {
      const itemPath = path.join(projectStorageDir, item.name);
      const stat = fs.statSync(itemPath);
      return {
        name: item.name,
        isDir: item.isDirectory(),
        size: item.isFile() ? stat.size : 0,
        updatedAt: stat.mtime,
        publicUrl: `https://db.orfa.dev/p/${slug}/storage/v1/object/public/${bucket}/${subpath ? `${subpath}/` : ""}${item.name}`,
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

    const publicUrl = `https://db.orfa.dev/p/${slug}/storage/v1/object/public/${bucket}/${subpath ? `${subpath}/` : ""}${file.name}`;

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
