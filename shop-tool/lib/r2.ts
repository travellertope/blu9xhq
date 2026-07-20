import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB — phone camera photos, not raw originals

/** Upload a product/shop image to R2. Returns the public URL. */
export async function uploadImage(key: string, buffer: Buffer, mimeType: string): Promise<string> {
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new Error("Image exceeds 8MB limit");
  }
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL ?? "";
  return `${publicUrl}/${key}`;
}

export async function deleteImage(key: string): Promise<void> {
  await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
}

/** shops/{shopId}/products/{uuid}.{ext} — shop-prefixed as defense in depth against key guessing. */
export function generateProductImageKey(shopId: string, filename: string): string {
  const ext = (filename.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const id = crypto.randomUUID();
  return `shops/${shopId}/products/${id}.${ext}`;
}

/** shops/{shopId}/branding/{logo|cover}-{uuid}.{ext} */
export function generateShopBrandingKey(
  shopId: string,
  kind: "logo" | "cover",
  filename: string
): string {
  const ext = (filename.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const id = crypto.randomUUID();
  return `shops/${shopId}/branding/${kind}-${id}.${ext}`;
}

/** Extracts the R2 object key from a public URL, for deletes. */
export function keyFromPublicUrl(url: string): string | null {
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL ?? "";
  if (!publicUrl || !url.startsWith(publicUrl)) return null;
  return url.slice(publicUrl.length + 1);
}
