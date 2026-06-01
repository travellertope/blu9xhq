import { createHmac, timingSafeEqual } from "crypto";

function secret(): string {
  return process.env.NEXTAUTH_SECRET ?? "bluuhq-sequence-pause-secret";
}

export function generatePauseToken(enrollmentId: number): string {
  const payload = `pause:${enrollmentId}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return Buffer.from(`${enrollmentId}.${sig}`).toString("base64url");
}

export function verifyPauseToken(token: string): number | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const dotIndex = decoded.indexOf(".");
    if (dotIndex === -1) return null;

    const idStr = decoded.slice(0, dotIndex);
    const sig   = decoded.slice(dotIndex + 1);
    const id    = parseInt(idStr, 10);
    if (isNaN(id) || id <= 0) return null;

    const expected = createHmac("sha256", secret()).update(`pause:${id}`).digest("hex");
    const sigBuf  = Buffer.from(sig);
    const expBuf  = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;

    return id;
  } catch {
    return null;
  }
}
