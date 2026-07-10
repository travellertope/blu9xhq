import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/** Upload a file buffer to R2. Returns the object key. */
export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array | Blob,
  contentType: string,
  metadata?: Record<string, string>
): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
    })
  );
  return key;
}

/** Generate a pre-signed GET URL valid for `expiresIn` seconds (default 1 hour). */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  return getSignedUrl(
    r2Client,
    new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }),
    { expiresIn }
  );
}

/** Generate a pre-signed PUT URL for direct client uploads (if needed). */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 900
): Promise<string> {
  return getSignedUrl(
    r2Client,
    new PutObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key, ContentType: contentType }),
    { expiresIn }
  );
}

/** Delete an object from R2. */
export async function deleteFromR2(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key })
  );
}

/** Check if an object exists without downloading it. */
export async function objectExists(key: string): Promise<boolean> {
  try {
    await r2Client.send(
      new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key })
    );
    return true;
  } catch {
    return false;
  }
}

/** Build a consistent R2 key for client files. */
export function buildFileKey(clientId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `clients/${clientId}/files/${timestamp}_${sanitized}`;
}

// ─── Batch 6 additions ────────────────────────────────────────────────────────

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "application/zip",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

/** Upload a file buffer to R2, validating size. Returns the public URL. */
export async function uploadFile(
  key: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (buffer.length > 50 * 1024 * 1024) throw new Error("File exceeds 50MB limit");
  await uploadToR2(key, buffer, mimeType);
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL ?? "";
  return `${publicUrl}/${key}`;
}

/** Delete a file from R2 by key. */
export async function deleteFile(key: string): Promise<void> {
  return deleteFromR2(key);
}

/** Generate a pre-signed download URL with a custom expiry. */
export async function r2SignedUrl(key: string, expiresInSeconds: number): Promise<string> {
  return getPresignedDownloadUrl(key, expiresInSeconds);
}

/** Generate a unique R2 key for a client file: clients/{clientId}/{uuid}-{sanitised-filename} */
export function generateFileKey(clientId: number, filename: string): string {
  const sanitised = filename
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "-")
    .replace(/-+/g, "-");
  const id = crypto.randomUUID();
  return `clients/${clientId}/${id}-${sanitised}`;
}
