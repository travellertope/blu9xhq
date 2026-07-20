import { NextResponse } from "next/server";
import { getMyShop } from "@/lib/auth";
import { uploadImage, generateProductImageKey, generateShopBrandingKey, ALLOWED_IMAGE_TYPES } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const shop = await getMyShop();
  if (!shop) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const kind = form?.get("kind");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return NextResponse.json({ error: "Only JPEG, PNG, or WebP images are allowed" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key =
    kind === "logo" || kind === "cover"
      ? generateShopBrandingKey(shop.id, kind, file.name)
      : generateProductImageKey(shop.id, file.name);

  try {
    const url = await uploadImage(key, buffer, file.type);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
