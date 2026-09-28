/**
 * Fetches a tenant's logo_url and returns it as a base64 data URI suitable
 * for embedding in react-pdf documents. Returns undefined if no logo is set
 * or the fetch fails — callers should render nothing in that case.
 */
export async function loadTenantLogoBase64(
  logoUrl: string | null | undefined
): Promise<string | undefined> {
  if (!logoUrl) return undefined;
  try {
    const res = await fetch(logoUrl);
    if (!res.ok) return undefined;
    const buf = Buffer.from(await res.arrayBuffer());
    const mime = res.headers.get("content-type") ?? "image/png";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return undefined;
  }
}
