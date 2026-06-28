import path from "path";
import fs from "fs/promises";
import { db } from "@/lib/db";
import type { FileType, UploadFileInput, UploadFileResult } from "@/types";

// ─── Storage Adapter Interface ────────────────────────────────────────────────

export interface StorageAdapter {
  upload(
    buffer: Buffer,
    storagePath: string,
    mimeType: string
  ): Promise<{ publicUrl: string | null }>;
  getSignedUrl(storagePath: string, expiresInSeconds?: number): Promise<string>;
  delete(storagePath: string): Promise<void>;
}

// ─── Local Storage Adapter ────────────────────────────────────────────────────

export class LocalStorageAdapter implements StorageAdapter {
  private baseDir: string;
  private baseUrl: string;

  constructor() {
    this.baseDir = process.env.LOCAL_STORAGE_PATH ?? "./uploads";
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  }

  async upload(
    buffer: Buffer,
    storagePath: string,
    _mimeType: string
  ): Promise<{ publicUrl: string | null }> {
    const absolutePath = path.join(this.baseDir, storagePath);
    const dir = path.dirname(absolutePath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(absolutePath, buffer);

    const publicUrl = `${this.baseUrl}/api/files/${storagePath}`;
    return { publicUrl };
  }

  async getSignedUrl(
    storagePath: string,
    _expiresInSeconds?: number
  ): Promise<string> {
    // For local storage, just return the direct URL
    // In production you'd sign this with a secret
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return `${baseUrl}/api/files/${storagePath}`;
  }

  async delete(storagePath: string): Promise<void> {
    const absolutePath = path.join(this.baseDir, storagePath);
    await fs.unlink(absolutePath).catch(() => {});
  }
}

// ─── Supabase Storage Adapter ─────────────────────────────────────────────────

export class SupabaseStorageAdapter implements StorageAdapter {
  private url: string;
  private key: string;
  private bucket: string;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "uploads";

    if (!url || !key) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for Supabase storage"
      );
    }

    this.url = url;
    this.key = key;
    this.bucket = bucket;
  }

  private get storageUrl(): string {
    return `${this.url}/storage/v1`;
  }

  private get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.key}`,
      apikey: this.key,
    };
  }

  async upload(
    buffer: Buffer,
    storagePath: string,
    mimeType: string
  ): Promise<{ publicUrl: string | null }> {
    const response = await fetch(
      `${this.storageUrl}/object/${this.bucket}/${storagePath}`,
      {
        method: "POST",
        headers: {
          ...this.headers,
          "Content-Type": mimeType,
          "Cache-Control": "3600",
        },
        body: buffer as unknown as BodyInit,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Supabase upload failed: ${(error as { message?: string }).message ?? response.statusText}`
      );
    }

    // Get public URL
    const publicUrlResponse = await fetch(
      `${this.storageUrl}/object/public/${this.bucket}/${storagePath}`,
      { method: "HEAD", headers: this.headers }
    );

    const publicUrl = publicUrlResponse.ok
      ? `${this.storageUrl}/object/public/${this.bucket}/${storagePath}`
      : null;

    return { publicUrl };
  }

  async getSignedUrl(
    storagePath: string,
    expiresInSeconds: number = 3600
  ): Promise<string> {
    const response = await fetch(
      `${this.storageUrl}/object/sign/${this.bucket}/${storagePath}`,
      {
        method: "POST",
        headers: {
          ...this.headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expiresIn: expiresInSeconds }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to generate signed URL: ${response.statusText}`);
    }

    const data = (await response.json()) as { signedURL: string };
    return `${this.url}${data.signedURL}`;
  }

  async delete(storagePath: string): Promise<void> {
    await fetch(
      `${this.storageUrl}/object/${this.bucket}/${storagePath}`,
      {
        method: "DELETE",
        headers: this.headers,
      }
    );
  }
}

// ─── Storage Factory ──────────────────────────────────────────────────────────

function createStorageAdapter(): StorageAdapter {
  const provider = process.env.STORAGE_PROVIDER ?? "local";

  switch (provider) {
    case "supabase":
      return new SupabaseStorageAdapter();
    case "local":
    default:
      return new LocalStorageAdapter();
  }
}

export const storage: StorageAdapter = createStorageAdapter();

// ─── High-level File Upload ───────────────────────────────────────────────────

export async function uploadFile(
  input: UploadFileInput
): Promise<UploadFileResult> {
  const { establishmentId, fileType, file, fileName, mimeType } = input;

  // Convert File to Buffer if needed
  let buffer: Buffer;
  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else {
    buffer = file;
  }

  const fileSize = buffer.byteLength;
  const ext = path.extname(fileName);
  const sanitizedName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const storagePath = `establishments/${establishmentId}/${fileType}/${sanitizedName}`;

  const { publicUrl } = await storage.upload(buffer, storagePath, mimeType);

  const uploadedFile = await db.uploadedFile.create({
    data: {
      establishmentId,
      fileType,
      fileName,
      fileSize,
      mimeType,
      storagePath,
      publicUrl,
    },
  });

  return {
    fileId: uploadedFile.id,
    storagePath,
    publicUrl,
  };
}

export async function getSignedUrl(
  storagePath: string,
  expiresInSeconds?: number
): Promise<string> {
  return storage.getSignedUrl(storagePath, expiresInSeconds);
}

export async function deleteFile(fileId: string): Promise<void> {
  const file = await db.uploadedFile.findUnique({ where: { id: fileId } });
  if (!file) return;

  await storage.delete(file.storagePath);
  await db.uploadedFile.delete({ where: { id: fileId } });
}

export const ALLOWED_MIME_TYPES: Record<FileType, string[]> = {
  commercial_register: ["application/pdf", "image/jpeg", "image/png"],
  trademark_certificate: ["application/pdf", "image/jpeg", "image/png"],
  financial_statements: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ],
  menu_pricelist: ["application/pdf", "image/jpeg", "image/png"],
  brand_assets: ["image/jpeg", "image/png", "image/svg+xml", "application/zip"],
  other: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function validateFile(
  fileType: FileType,
  mimeType: string,
  fileSize: number
): { valid: boolean; error?: string } {
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `حجم الملف يتجاوز الحد الأقصى (${MAX_FILE_SIZE_BYTES / 1024 / 1024} ميجابايت)`,
    };
  }

  const allowed = ALLOWED_MIME_TYPES[fileType];
  if (!allowed.includes(mimeType)) {
    return {
      valid: false,
      error: `نوع الملف غير مسموح به. الأنواع المقبولة: ${allowed.join(", ")}`,
    };
  }

  return { valid: true };
}
