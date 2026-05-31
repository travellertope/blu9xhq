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
